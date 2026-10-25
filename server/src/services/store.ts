import mongoose from 'mongoose';
import { ComplaintModel } from '../models/Complaint.js';
import type { ComplaintDocument } from '../models/Complaint.js';
import { SensorReadingModel } from '../models/SensorReading.js';
import { RoadClosureModel } from '../models/RoadClosure.js';
import type { ComplaintRecord, SensorReadingRecord, RoadClosureRecord } from '../types/index.js';

// Seed initial complaints for Panchayat command center
let memoryComplaints: ComplaintRecord[] = [
  {
    id: 'CMP-2026-001',
    title: 'Adyar Canal Secondary Sluice Blockage',
    description: 'Excessive plastic debris and silt accumulated at culvert inlet under Main Road bridge.',
    category: 'Blockage',
    confirmedCategory: 'Blockage',
    status: 'In Progress',
    lat: 12.9985,
    lng: 80.2240,
    locationName: 'Adyar Sluice Bridge, Ward 14',
    panchayatWard: 'Ward 14 (Canal Division)',
    waterDepthMeters: 0.85,
    photoUrl: '/images/drainpulse/drain_inspection_waste.jpg',
    reporterContact: '+91 94441 23456',
    reporterName: 'K. Rajasekaran (Panchayat Ward Member)',
    assignedTeam: 'Panchayat Sanitation Crew A-1',
    priorityScore: 78,
    priorityReason: 'Priority Score: 78/100 [Culvert blockage slowing arterial runoff (+15) • High depth (0.9m >= 0.7m) (+20) • Near vulnerable civic institution/transit hub (+15)]',
    aiSuggestion: {
      suggestedCategory: 'Blockage',
      confidence: 0.86,
      reasoning: 'Heuristic pattern matched [block, plastic, culvert, silt] in report text. Image evidence attached.',
      detectedKeywords: ['block', 'plastic', 'culvert', 'silt']
    },
    duplicateFlag: { isDuplicate: false, status: 'Unmerged' },
    auditTrail: [
      {
        timestamp: '2026-10-24T08:30:00.000Z',
        fromStatus: 'Submitted',
        toStatus: 'Under Review',
        author: 'Panchayat Control Room',
        note: 'Citizen report received via Panchayat Portal and queued for review.'
      },
      {
        timestamp: '2026-10-24T09:15:00.000Z',
        fromStatus: 'Under Review',
        toStatus: 'Assigned',
        author: 'Eng. S. Murugan',
        note: 'Assigned to Panchayat Sanitation Crew A-1 with submersible trash pump.'
      },
      {
        timestamp: '2026-10-24T10:00:00.000Z',
        fromStatus: 'Assigned',
        toStatus: 'In Progress',
        author: 'Crew Supervisor A-1',
        note: 'Team on site; manual desiltation and trash raking commenced.'
      }
    ],
    createdAt: '2026-10-24T08:30:00.000Z',
    updatedAt: '2026-10-24T10:00:00.000Z'
  },
  {
    id: 'CMP-2026-002',
    title: 'Velachery 100ft Road Knee-Deep Stagnation',
    description: 'Stormwater backflow from blocked road side ditch causing 0.6m ponding across bus route.',
    category: 'Severe Waterlogging',
    confirmedCategory: 'Severe Waterlogging',
    status: 'Assigned',
    lat: 12.9810,
    lng: 80.2180,
    locationName: 'Velachery Main Road, Ward 12',
    panchayatWard: 'Ward 12 (South Basin)',
    waterDepthMeters: 0.60,
    photoUrl: '/images/drainpulse/underground_pipe_water.jpg',
    reporterContact: '+91 98840 98765',
    reporterName: 'M. Selvi (Local Resident)',
    assignedTeam: 'Municipal Dewatering Pump Squad 3',
    priorityScore: 72,
    priorityReason: 'Priority Score: 72/100 [Severe stormwater inundation (+20) • Moderate ponding (0.6m) (+10) • Near vulnerable civic institution/transit hub (+15)]',
    aiSuggestion: {
      suggestedCategory: 'Severe Waterlogging',
      confidence: 0.82,
      reasoning: 'Heuristic pattern matched [waterlog, stagnation, road, bus] in text.',
      detectedKeywords: ['waterlog', 'stagnation', 'road', 'bus']
    },
    duplicateFlag: { isDuplicate: false, status: 'Unmerged' },
    auditTrail: [
      {
        timestamp: '2026-10-24T09:00:00.000Z',
        fromStatus: 'Submitted',
        toStatus: 'Under Review',
        author: 'Panchayat Control Room',
        note: 'Report reviewed; verified transit impact on bus corridor.'
      },
      {
        timestamp: '2026-10-24T09:45:00.000Z',
        fromStatus: 'Under Review',
        toStatus: 'Assigned',
        author: 'Dispatcher R. Kumar',
        note: 'High-capacity dewatering pump unit dispatched.'
      }
    ],
    createdAt: '2026-10-24T09:00:00.000Z',
    updatedAt: '2026-10-24T09:45:00.000Z'
  },
  {
    id: 'CMP-2026-003',
    title: 'Broken Culvert Grating & Sump Hazard',
    description: 'Concrete slab fractured near primary health centre entrance; exposed storm drain trench.',
    category: 'Infrastructure Damage',
    confirmedCategory: 'Infrastructure Damage',
    status: 'Submitted',
    lat: 12.9920,
    lng: 80.2315,
    locationName: 'Near PHC Clinic, Ward 10',
    panchayatWard: 'Ward 10 (East Ward)',
    waterDepthMeters: 0.35,
    photoUrl: '/images/drainpulse/storm_drain_debris.jpg',
    reporterContact: '+91 97711 55443',
    reporterName: 'Dr. V. Anand (Medical Officer)',
    priorityScore: 65,
    priorityReason: 'Priority Score: 65/100 [Infrastructure collapse / broken culvert (+25) • Near vulnerable civic institution/transit hub (+15)]',
    aiSuggestion: {
      suggestedCategory: 'Infrastructure Damage',
      confidence: 0.88,
      reasoning: 'Heuristic pattern matched [broken, culvert, slab, hazard] in report.',
      detectedKeywords: ['broken', 'culvert', 'slab', 'hazard']
    },
    duplicateFlag: { isDuplicate: false, status: 'Unmerged' },
    auditTrail: [
      {
        timestamp: '2026-10-24T10:15:00.000Z',
        fromStatus: 'Submitted',
        toStatus: 'Submitted',
        author: 'Citizen Portal',
        note: 'Complaint submitted by PHC Medical Officer; requires inspection.'
      }
    ],
    createdAt: '2026-10-24T10:15:00.000Z',
    updatedAt: '2026-10-24T10:15:00.000Z'
  }
];

let memorySensors: SensorReadingRecord[] = [
  {
    id: 'SENS-READ-101',
    deviceId: 'IOT-PANCH-01',
    sensorType: 'ultrasonic_depth',
    reading: 0.78,
    unit: 'm',
    timestamp: new Date().toISOString(),
    sensorHealth: 'Optimal',
    location: {
      name: 'Adyar River Outflow Culvert #3',
      lat: 12.9960,
      lng: 80.2290,
      drainSector: 'Sector 4B'
    },
    isSimulated: true,
    isValid: true
  },
  {
    id: 'SENS-READ-102',
    deviceId: 'IOT-PANCH-02',
    sensorType: 'flow_velocity',
    reading: 1.42,
    unit: 'm/s',
    timestamp: new Date().toISOString(),
    sensorHealth: 'Optimal',
    location: {
      name: 'Velachery Flood Canal Trunk',
      lat: 12.9830,
      lng: 80.2210,
      drainSector: 'Sector 2A'
    },
    isSimulated: true,
    isValid: true
  },
  {
    id: 'SENS-READ-103',
    deviceId: 'IOT-PANCH-03',
    sensorType: 'rainfall_gauge',
    reading: 42.5,
    unit: 'mm/hr',
    timestamp: new Date().toISOString(),
    sensorHealth: 'Optimal',
    location: {
      name: 'Panchayat Administrative Complex',
      lat: 12.9940,
      lng: 80.2150,
      drainSector: 'Central Zone'
    },
    isSimulated: true,
    isValid: true
  }
];

let memoryRoadClosures: RoadClosureRecord[] = [
  {
    id: 'RC-2026-01',
    roadName: 'Adyar River Bank Low Causeway',
    sector: 'Sector 4B',
    coordinates: [12.9925, 80.2350],
    verificationStatus: 'Official',
    reportedAt: '2026-10-24T06:00:00.000Z',
    verifiedAt: '2026-10-24T06:30:00.000Z',
    verifiedBy: 'Traffic Police & Panchayat Safety Ward',
    expiresAt: '2026-10-25T18:00:00.000Z',
    reason: 'Water overtopping causeway by 0.9m; severe vehicle stall risk.',
    waterDepthMeters: 0.9,
    recommendedDetour: 'Divert via Saidapet Flyover & Anna Salai Elevated Corridor',
    detourCoordinates: [
      [12.9925, 80.2350],
      [12.9990, 80.2280],
      [13.0080, 80.2220]
    ]
  },
  {
    id: 'RC-2026-02',
    roadName: 'Velachery Underpass South Ramp',
    sector: 'Sector 2A',
    coordinates: [12.9770, 80.2170],
    verificationStatus: 'Unverified',
    reportedAt: '2026-10-24T11:00:00.000Z',
    expiresAt: '2026-10-24T23:00:00.000Z',
    reason: 'Citizen report: 0.5m ponding at dip point. Field patrol verification pending.',
    waterDepthMeters: 0.5,
    recommendedDetour: 'Use surface bypass road (caution advised)'
  }
];

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export const dataStore = {
  // Complaints
  async getComplaints(filter?: { status?: string; category?: string; ward?: string }): Promise<ComplaintRecord[]> {
    if (isMongoConnected()) {
      const query: mongoose.FilterQuery<ComplaintDocument> = {};
      if (filter?.status && filter.status !== 'All') query.status = filter.status;
      if (filter?.category && filter.category !== 'All') query.category = filter.category;
      if (filter?.ward && filter.ward !== 'All') query.panchayatWard = filter.ward;
      const docs = await ComplaintModel.find(query).sort({ createdAt: -1 }).lean();
      return docs as unknown as ComplaintRecord[];
    }
    return memoryComplaints.filter(c => {
      if (filter?.status && filter.status !== 'All' && c.status !== filter.status) return false;
      if (filter?.category && filter.category !== 'All' && c.category !== filter.category) return false;
      if (filter?.ward && filter.ward !== 'All' && c.panchayatWard !== filter.ward) return false;
      return true;
    });
  },

  async getComplaintById(id: string): Promise<ComplaintRecord | null> {
    if (isMongoConnected()) {
      const doc = await ComplaintModel.findOne({ id }).lean();
      return doc ? (doc as unknown as ComplaintRecord) : null;
    }
    return memoryComplaints.find(c => c.id === id) || null;
  },

  async createComplaint(complaint: ComplaintRecord): Promise<ComplaintRecord> {
    if (isMongoConnected()) {
      await ComplaintModel.create(complaint);
      return complaint;
    }
    memoryComplaints.unshift(complaint);
    return complaint;
  },

  async updateComplaint(id: string, updates: Partial<ComplaintRecord>): Promise<ComplaintRecord | null> {
    if (isMongoConnected()) {
      const updated = await ComplaintModel.findOneAndUpdate(
        { id },
        { $set: { ...updates, updatedAt: new Date().toISOString() } },
        { new: true }
      ).lean();
      return updated ? (updated as unknown as ComplaintRecord) : null;
    }
    const idx = memoryComplaints.findIndex(c => c.id === id);
    if (idx === -1) return null;
    memoryComplaints[idx] = {
      ...memoryComplaints[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return memoryComplaints[idx];
  },

  // Sensors
  async getSensorReadings(deviceId?: string): Promise<SensorReadingRecord[]> {
    if (isMongoConnected()) {
      const query = deviceId ? { deviceId } : {};
      const docs = await SensorReadingModel.find(query).sort({ timestamp: -1 }).limit(100).lean();
      return docs as unknown as SensorReadingRecord[];
    }
    if (deviceId) {
      return memorySensors.filter(s => s.deviceId === deviceId);
    }
    return memorySensors;
  },

  async addSensorReading(reading: SensorReadingRecord): Promise<SensorReadingRecord> {
    if (isMongoConnected()) {
      await SensorReadingModel.create(reading);
      return reading;
    }
    memorySensors.unshift(reading);
    if (memorySensors.length > 200) memorySensors.pop();
    return reading;
  },

  // Road Closures
  async getRoadClosures(): Promise<RoadClosureRecord[]> {
    if (isMongoConnected()) {
      const docs = await RoadClosureModel.find().lean();
      return docs as unknown as RoadClosureRecord[];
    }
    return memoryRoadClosures;
  },

  async addRoadClosure(closure: RoadClosureRecord): Promise<RoadClosureRecord> {
    if (isMongoConnected()) {
      await RoadClosureModel.create(closure);
      return closure;
    }
    memoryRoadClosures.unshift(closure);
    return closure;
  }
};
