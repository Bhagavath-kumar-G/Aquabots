import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dataStore } from '../services/store.js';
import type { RoadClosureRecord } from '../types/index.js';

const router = Router();

const roadClosureSchema = z.object({
  roadName: z.string().min(3),
  sector: z.string().min(1),
  coordinates: z.tuple([z.number(), z.number()]),
  verificationStatus: z.enum(['Official', 'Unverified', 'Expired']).default('Unverified'),
  reason: z.string().min(5),
  waterDepthMeters: z.number().min(0),
  recommendedDetour: z.string().optional(),
  verifiedBy: z.string().optional(),
  expiresInHours: z.number().default(24)
});

// 1. Get all road closures & hazards
router.get('/road-closures', async (_req: Request, res: Response) => {
  try {
    const closures = await dataStore.getRoadClosures();
    const now = new Date().getTime();

    // Dynamically mark expired closures
    const evaluated = closures.map(c => {
      const isExpired = new Date(c.expiresAt).getTime() < now;
      return {
        ...c,
        verificationStatus: isExpired ? ('Expired' as const) : c.verificationStatus
      };
    });

    return res.json({
      success: true,
      count: evaluated.length,
      data: evaluated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Report a new road closure / hazard
router.post('/road-closures', async (req: Request, res: Response) => {
  try {
    const parseResult = roadClosureSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parseResult.error.format()
      });
    }

    const d = parseResult.data;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + d.expiresInHours * 60 * 60 * 1000).toISOString();

    const newClosure: RoadClosureRecord = {
      id: `RC-2026-${Math.floor(100 + Math.random() * 900)}`,
      roadName: d.roadName,
      sector: d.sector,
      coordinates: d.coordinates,
      verificationStatus: d.verificationStatus,
      reportedAt: now.toISOString(),
      verifiedAt: d.verificationStatus === 'Official' ? now.toISOString() : undefined,
      verifiedBy: d.verifiedBy,
      expiresAt,
      reason: d.reason,
      waterDepthMeters: d.waterDepthMeters,
      recommendedDetour: d.recommendedDetour
    };

    const saved = await dataStore.addRoadClosure(newClosure);
    return res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Safe-route check endpoint
router.post('/safe-route-check', async (req: Request, res: Response) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.body;
    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ success: false, error: 'Origin and destination coordinates are required' });
    }

    const closures = await dataStore.getRoadClosures();
    const activeOfficial = closures.filter(c => c.verificationStatus === 'Official');
    const unverifiedAlerts = closures.filter(c => c.verificationStatus === 'Unverified');

    // Rule: "Never claim a route is safe based only on an unverified complaint."
    const advisory = unverifiedAlerts.length > 0
      ? 'Advisory: Unverified citizen hazard reports exist in adjacent sectors. Route cannot be guaranteed safe without field officer clearance.'
      : 'Official routing corridors monitored by Panchayat patrol.';

    return res.json({
      success: true,
      activeClosuresCount: activeOfficial.length,
      unverifiedAlertsCount: unverifiedAlerts.length,
      safetyAdvisory: advisory,
      recommendedBypass: activeOfficial.map(c => ({
        closedPoint: c.roadName,
        detour: c.recommendedDetour || 'Use main arterial highway'
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
