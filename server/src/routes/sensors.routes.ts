import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dataStore } from '../services/store.js';
import type { SensorReadingRecord } from '../types/index.js';

const router = Router();

// Validation schema for incoming IoT sensor readings
const sensorReadingSchema = z.object({
  deviceId: z.string().min(3, 'Device ID must be at least 3 characters'),
  sensorType: z.enum(['ultrasonic_depth', 'flow_velocity', 'water_turbidity', 'rainfall_gauge']),
  reading: z.number().refine(val => !isNaN(val) && isFinite(val), {
    message: 'Reading must be a valid finite number'
  }),
  unit: z.enum(['m', 'm/s', 'NTU', 'mm/hr']),
  timestamp: z.string().datetime({ message: 'Timestamp must be an ISO-8601 string' }),
  sensorHealth: z.enum(['Optimal', 'Degraded', 'Offline', 'Calibrating']),
  location: z.object({
    name: z.string().min(2),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    drainSector: z.string().min(1)
  }),
  isSimulated: z.boolean().optional().default(false)
});

// 1. Ingest Sensor Reading (API for real/simulated telemetry)
router.post('/readings', async (req: Request, res: Response) => {
  try {
    const parseResult = sensorReadingSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Malformed sensor payload rejected',
        details: parseResult.error.format()
      });
    }

    const payload = parseResult.data;

    // Physical sanity check validation
    let isValid = true;
    let validationError: string | undefined;

    if (payload.sensorType === 'ultrasonic_depth' && (payload.reading < 0 || payload.reading > 15)) {
      isValid = false;
      validationError = `Depth reading (${payload.reading}m) is out of physical sensor range [0, 15m]`;
    } else if (payload.sensorType === 'flow_velocity' && (payload.reading < 0 || payload.reading > 25)) {
      isValid = false;
      validationError = `Flow velocity (${payload.reading}m/s) exceeds hydrodynamic threshold [0, 25m/s]`;
    } else if (payload.sensorType === 'rainfall_gauge' && (payload.reading < 0 || payload.reading > 300)) {
      isValid = false;
      validationError = `Rainfall gauge reading (${payload.reading}mm/hr) exceeds limit [0, 300mm/hr]`;
    }

    if (!isValid) {
      return res.status(422).json({
        success: false,
        error: 'Sensor reading failed physical sanity verification',
        validationError
      });
    }

    const newReading: SensorReadingRecord = {
      id: `READ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
      isValid: true
    };

    const saved = await dataStore.addSensorReading(newReading);

    return res.status(201).json({
      success: true,
      message: payload.isSimulated 
        ? '[SIMULATION] Reading ingested and visibly labelled as simulated data'
        : 'Telemetry reading successfully recorded',
      data: saved
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get Sensor Readings (Filterable by device ID)
router.get('/readings', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;
    const readings = await dataStore.getSensorReadings(deviceId as string);
    return res.json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Device Health Statuses
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const readings = await dataStore.getSensorReadings();
    
    // Group by deviceId
    const deviceMap = new Map<string, SensorReadingRecord>();
    for (const r of readings) {
      if (!deviceMap.has(r.deviceId)) {
        deviceMap.set(r.deviceId, r);
      }
    }

    const devices = Array.from(deviceMap.values()).map(r => ({
      deviceId: r.deviceId,
      sensorType: r.sensorType,
      latestReading: r.reading,
      unit: r.unit,
      health: r.sensorHealth,
      location: r.location,
      lastPing: r.timestamp,
      isSimulated: r.isSimulated
    }));

    return res.json({
      success: true,
      activeDevicesCount: devices.length,
      data: devices
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Development IoT Sensor Simulator (Trigger simulated water rise or high flow)
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { scenario } = req.body; // 'flash_flood' | 'receding' | 'sensor_glitch'
    const timestamp = new Date().toISOString();

    let readingValue = 0.85;
    let health: 'Optimal' | 'Degraded' | 'Offline' = 'Optimal';

    if (scenario === 'flash_flood') {
      readingValue = 1.65; // Critical depth
    } else if (scenario === 'receding') {
      readingValue = 0.30; // Normal low runoff
    } else if (scenario === 'sensor_glitch') {
      health = 'Degraded';
      readingValue = 0.95;
    }

    const simReading: SensorReadingRecord = {
      id: `SIM-${Date.now()}`,
      deviceId: 'IOT-SIMULATOR-01',
      sensorType: 'ultrasonic_depth',
      reading: readingValue,
      unit: 'm',
      timestamp,
      sensorHealth: health,
      location: {
        name: 'Simulated Culvert Point — Sector 3',
        lat: 12.9860,
        lng: 80.2220,
        drainSector: 'Sector 3'
      },
      isSimulated: true, // Visibly labelled as simulated!
      isValid: true
    };

    const saved = await dataStore.addSensorReading(simReading);

    return res.status(201).json({
      success: true,
      notice: 'SIMULATED DATA: Visible label applied. Never presented as unvalidated live data.',
      data: saved
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
