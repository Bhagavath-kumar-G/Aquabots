export type ComplaintStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Reopened';

export type ComplaintCategory = 
  | 'Blockage'
  | 'Solid Waste'
  | 'Severe Waterlogging' 
  | 'Infrastructure Damage'
  | 'Trapped Citizens' 
  | 'Electrical Hazard';

export interface AuditLogEntry {
  timestamp: string;
  fromStatus: ComplaintStatus;
  toStatus: ComplaintStatus;
  author: string;
  note: string;
  evidenceUrl?: string;
}

export interface AiSuggestion {
  suggestedCategory: ComplaintCategory;
  confidence: number; // 0.0 - 1.0
  reasoning: string;
  detectedKeywords: string[];
}

export interface DuplicateFlag {
  isDuplicate: boolean;
  duplicateOfId?: string;
  similarityScore?: number; // 0.0 - 1.0
  reason?: string;
  status: 'Unmerged' | 'Merged' | 'Dismissed';
}

export interface ComplaintRecord {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  confirmedCategory?: ComplaintCategory;
  status: ComplaintStatus;
  lat: number;
  lng: number;
  locationName: string;
  panchayatWard: string;
  waterDepthMeters: number;
  photoUrl?: string;
  photoStorageKey?: string;
  reporterContact?: string;
  reporterName?: string;
  assignedTeam?: string;
  priorityScore: number;
  priorityReason: string;
  aiSuggestion?: AiSuggestion;
  duplicateFlag?: DuplicateFlag;
  resolutionEvidence?: {
    verifiedBy: string;
    verifiedAt: string;
    note: string;
    photoUrl?: string;
  };
  auditTrail: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface SensorReadingRecord {
  id: string;
  deviceId: string;
  sensorType: 'ultrasonic_depth' | 'flow_velocity' | 'water_turbidity' | 'rainfall_gauge';
  reading: number;
  unit: 'm' | 'm/s' | 'NTU' | 'mm/hr';
  timestamp: string;
  sensorHealth: 'Optimal' | 'Degraded' | 'Offline' | 'Calibrating';
  location: {
    name: string;
    lat: number;
    lng: number;
    drainSector: string;
  };
  isSimulated: boolean;
  isValid: boolean;
  validationError?: string;
}

export interface RoadClosureRecord {
  id: string;
  roadName: string;
  sector: string;
  coordinates: [number, number];
  verificationStatus: 'Official' | 'Unverified' | 'Expired';
  reportedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  expiresAt: string;
  reason: string;
  waterDepthMeters: number;
  recommendedDetour?: string;
  detourCoordinates?: [number, number][];
}
