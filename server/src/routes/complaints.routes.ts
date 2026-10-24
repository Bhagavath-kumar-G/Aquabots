import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { dataStore } from '../services/store.js';
import { detectDuplicateComplaint } from '../utils/duplicateDetector.js';
import { classifyComplaintText } from '../utils/aiClassifier.js';
import { calculatePriorityScore } from '../utils/priorityCalculator.js';
import type { ComplaintCategory, ComplaintRecord, ComplaintStatus } from '../types/index.js';

const router = Router();

// Ensure upload directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage config with MIME-type filtering and secure sanitized filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `evidence-${uniqueSuffix}${cleanExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Allowed: JPG, PNG, WEBP.'));
    }
  }
});

// Zod validation schema for complaint submission
const createComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum([
    'Blockage',
    'Solid Waste',
    'Severe Waterlogging',
    'Infrastructure Damage',
    'Trapped Citizens',
    'Electrical Hazard'
  ]),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  locationName: z.string().min(2, 'Location name is required'),
  panchayatWard: z.string().optional().default('Ward Unassigned'),
  waterDepthMeters: z.coerce.number().min(0).max(10).optional().default(0),
  reporterContact: z.string().optional(),
  reporterName: z.string().optional()
});

// 1. Submit New Complaint (with optional photo evidence, AI heuristic, and duplicate check)
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const parseResult = createComplaintSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format()
      });
    }

    const data = parseResult.data;
    const existingComplaints = await dataStore.getComplaints();

    // Check potential duplicates
    const duplicateFlag = detectDuplicateComplaint(
      {
        lat: data.lat,
        lng: data.lng,
        title: data.title,
        description: data.description,
        category: data.category
      },
      existingComplaints
    );

    // AI heuristic category suggestion (confidence indicator, not fact)
    const hasPhoto = Boolean(req.file);
    const aiSuggestion = classifyComplaintText(data.title, data.description, hasPhoto);

    // Historical count at location for recurrence calculation
    const historicalCount = existingComplaints.filter(
      c => c.locationName.toLowerCase() === data.locationName.toLowerCase()
    ).length;

    // Calculate transparent priority score
    const priorityCalc = calculatePriorityScore({
      category: data.category,
      waterDepthMeters: data.waterDepthMeters,
      locationName: data.locationName,
      historicalCountAtLocation: historicalCount
    });

    const complaintId = `CMP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const newRecord: ComplaintRecord = {
      id: complaintId,
      title: data.title,
      description: data.description,
      category: data.category,
      confirmedCategory: data.category,
      status: 'Submitted',
      lat: data.lat,
      lng: data.lng,
      locationName: data.locationName,
      panchayatWard: data.panchayatWard,
      waterDepthMeters: data.waterDepthMeters,
      photoUrl,
      photoStorageKey: req.file?.filename,
      reporterContact: data.reporterContact || 'Citizen Submission',
      reporterName: data.reporterName || 'Resident',
      priorityScore: priorityCalc.score,
      priorityReason: priorityCalc.reason,
      aiSuggestion,
      duplicateFlag,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          fromStatus: 'Submitted',
          toStatus: 'Submitted',
          author: data.reporterName || 'Citizen Portal',
          note: `Complaint filed via Panchayat Portal with ${data.category} classification.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await dataStore.createComplaint(newRecord);

    return res.status(201).json({
      success: true,
      data: saved,
      duplicateAlert: duplicateFlag.isDuplicate ? duplicateFlag : undefined
    });
  } catch (err: any) {
    console.error('Error in complaint submission:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// 2. List Complaints with Filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category, ward } = req.query;
    const complaints = await dataStore.getComplaints({
      status: status as string,
      category: category as string,
      ward: ward as string
    });
    return res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Single Complaint by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const complaint = await dataStore.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    return res.json({ success: true, data: complaint });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Verified Status Transition & Resolution Verification
router.patch('/:id/status', upload.single('resolutionPhoto'), async (req: Request, res: Response) => {
  try {
    const complaint = await dataStore.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const { newStatus, author, note } = req.body;
    const VALID_STATUSES: ComplaintStatus[] = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Reopened'
    ];

    if (!VALID_STATUSES.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    // MANDATORY REQUIREMENT: Require authorized personnel to verify resolution evidence before closing
    if (newStatus === 'Resolved') {
      const verifiedBy = req.body.verifiedBy || author;
      const resolutionNote = req.body.resolutionNote || note;

      if (!verifiedBy || verifiedBy.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Resolution verification failed: Authorized personnel name/badge is required before closing a complaint.'
        });
      }

      if (!resolutionNote || resolutionNote.trim().length < 5) {
        return res.status(400).json({
          success: false,
          error: 'Resolution verification failed: Descriptive field resolution notes are mandatory before closure.'
        });
      }

      const resolutionPhotoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const updatedAudit = [
        ...complaint.auditTrail,
        {
          timestamp: new Date().toISOString(),
          fromStatus: complaint.status,
          toStatus: 'Resolved' as ComplaintStatus,
          author: verifiedBy,
          note: `[VERIFIED RESOLUTION] ${resolutionNote}`,
          evidenceUrl: resolutionPhotoUrl
        }
      ];

      const updated = await dataStore.updateComplaint(complaint.id, {
        status: 'Resolved',
        resolutionEvidence: {
          verifiedBy,
          verifiedAt: new Date().toISOString(),
          note: resolutionNote,
          photoUrl: resolutionPhotoUrl
        },
        auditTrail: updatedAudit
      });

      return res.json({ success: true, message: 'Complaint verified and resolved', data: updated });
    }

    // Standard Status Progression (Submitted -> Under Review -> Assigned -> In Progress -> Reopened)
    const logAuthor = author || 'Panchayat Operator';
    const logNote = note || `Status transitioned from ${complaint.status} to ${newStatus}`;

    const updatedAudit = [
      ...complaint.auditTrail,
      {
        timestamp: new Date().toISOString(),
        fromStatus: complaint.status,
        toStatus: newStatus as ComplaintStatus,
        author: logAuthor,
        note: logNote
      }
    ];

    const updated = await dataStore.updateComplaint(complaint.id, {
      status: newStatus as ComplaintStatus,
      auditTrail: updatedAudit
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Assign Crew & Update Priority
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { assignedTeam, dispatcherName, dispatchNote } = req.body;
    if (!assignedTeam) {
      return res.status(400).json({ success: false, error: 'Assigned crew team name is required' });
    }

    const complaint = await dataStore.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const updatedAudit = [
      ...complaint.auditTrail,
      {
        timestamp: new Date().toISOString(),
        fromStatus: complaint.status,
        toStatus: 'Assigned' as ComplaintStatus,
        author: dispatcherName || 'Panchayat Dispatcher',
        note: `Assigned unit: ${assignedTeam}. ${dispatchNote ? `Note: ${dispatchNote}` : ''}`
      }
    ];

    const updated = await dataStore.updateComplaint(complaint.id, {
      assignedTeam,
      status: 'Assigned',
      auditTrail: updatedAudit
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Human Correction of AI Classification
router.post('/:id/confirm-category', async (req: Request, res: Response) => {
  try {
    const { confirmedCategory, reviewerName, note } = req.body;
    const VALID_CATEGORIES: ComplaintCategory[] = [
      'Blockage',
      'Solid Waste',
      'Severe Waterlogging',
      'Infrastructure Damage',
      'Trapped Citizens',
      'Electrical Hazard'
    ];

    if (!VALID_CATEGORIES.includes(confirmedCategory)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    const complaint = await dataStore.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const updatedAudit = [
      ...complaint.auditTrail,
      {
        timestamp: new Date().toISOString(),
        fromStatus: complaint.status,
        toStatus: complaint.status,
        author: reviewerName || 'Panchayat Reviewer',
        note: `Category reviewed & confirmed as "${confirmedCategory}" (Original AI suggestion: "${complaint.aiSuggestion?.suggestedCategory || 'None'}"). ${note || ''}`
      }
    ];

    const updated = await dataStore.updateComplaint(complaint.id, {
      confirmedCategory,
      category: confirmedCategory,
      auditTrail: updatedAudit
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Human Review: Merge or Dismiss Duplicate Flag
router.post('/:id/duplicate-action', async (req: Request, res: Response) => {
  try {
    const { action, reviewerName, note } = req.body; // action: 'Merge' | 'Dismiss'
    const complaint = await dataStore.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    if (action === 'Merge') {
      const parentId = complaint.duplicateFlag?.duplicateOfId;
      const updatedAudit = [
        ...complaint.auditTrail,
        {
          timestamp: new Date().toISOString(),
          fromStatus: complaint.status,
          toStatus: complaint.status,
          author: reviewerName || 'Panchayat Lead',
          note: `Merged with parent incident #${parentId}. ${note || ''}`
        }
      ];

      const updated = await dataStore.updateComplaint(complaint.id, {
        duplicateFlag: {
          ...complaint.duplicateFlag!,
          status: 'Merged'
        },
        auditTrail: updatedAudit
      });

      return res.json({ success: true, message: `Report merged into #${parentId}`, data: updated });
    } else {
      const updatedAudit = [
        ...complaint.auditTrail,
        {
          timestamp: new Date().toISOString(),
          fromStatus: complaint.status,
          toStatus: complaint.status,
          author: reviewerName || 'Panchayat Lead',
          note: `Duplicate flag reviewed and dismissed as a separate distinct incident. ${note || ''}`
        }
      ];

      const updated = await dataStore.updateComplaint(complaint.id, {
        duplicateFlag: {
          ...complaint.duplicateFlag!,
          isDuplicate: false,
          status: 'Dismissed'
        },
        auditTrail: updatedAudit
      });

      return res.json({ success: true, message: 'Duplicate flag dismissed', data: updated });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
