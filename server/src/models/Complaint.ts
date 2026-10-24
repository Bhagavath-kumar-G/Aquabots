import mongoose, { Schema, Document } from 'mongoose';
import type { ComplaintRecord } from '../types/index.js';

export interface ComplaintDocument extends Omit<ComplaintRecord, 'id'>, Document {
  id: string;
}

const AuditLogSchema = new Schema({
  timestamp: { type: String, required: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  author: { type: String, required: true },
  note: { type: String, required: true },
  evidenceUrl: { type: String }
}, { _id: false });

const ComplaintSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Blockage', 'Solid Waste', 'Severe Waterlogging', 'Infrastructure Damage', 'Trapped Citizens', 'Electrical Hazard']
  },
  confirmedCategory: { type: String },
  status: { 
    type: String, 
    required: true,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Reopened'],
    default: 'Submitted',
    index: true
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  locationName: { type: String, required: true },
  panchayatWard: { type: String, default: 'Ward General' },
  waterDepthMeters: { type: Number, default: 0 },
  photoUrl: { type: String },
  photoStorageKey: { type: String },
  reporterContact: { type: String },
  reporterName: { type: String },
  assignedTeam: { type: String },
  priorityScore: { type: Number, default: 20 },
  priorityReason: { type: String },
  aiSuggestion: {
    suggestedCategory: { type: String },
    confidence: { type: Number },
    reasoning: { type: String },
    detectedKeywords: [{ type: String }]
  },
  duplicateFlag: {
    isDuplicate: { type: Boolean, default: false },
    duplicateOfId: { type: String },
    similarityScore: { type: Number },
    reason: { type: String },
    status: { type: String, enum: ['Unmerged', 'Merged', 'Dismissed'], default: 'Unmerged' }
  },
  resolutionEvidence: {
    verifiedBy: { type: String },
    verifiedAt: { type: String },
    note: { type: String },
    photoUrl: { type: String }
  },
  auditTrail: [AuditLogSchema],
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, {
  timestamps: false
});

export const ComplaintModel = mongoose.model<ComplaintDocument>('Complaint', ComplaintSchema);
