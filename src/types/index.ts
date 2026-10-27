export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'Assigned' 
  | 'In Progress' 
  | 'Resolved' 
  | 'Reopened'
  // Backward compatibility aliases
  | 'Reported' 
  | 'Acknowledged' 
  | 'Response in Progress';

export type IncidentCategory = 
  | 'Blockage'
  | 'Solid Waste'
  | 'Severe Waterlogging'
  | 'Infrastructure Damage'
  | 'Trapped Citizens' 
  | 'Submerged Vehicle' 
  | 'Electrical Hazard' 
  | 'Structural Risk' 
  | 'Medical Emergency';

export interface IncidentHistoryItem {
  timestamp: string;
  fromStatus?: IncidentStatus;
  status: IncidentStatus;
  note: string;
  author: string;
  evidenceUrl?: string;
}

export interface AiSuggestionData {
  suggestedCategory: IncidentCategory;
  confidence: number; // 0.0 - 1.0
  reasoning: string;
  detectedKeywords: string[];
}

export interface DuplicateFlagData {
  isDuplicate: boolean;
  duplicateOfId?: string;
  similarityScore?: number;
  reason?: string;
  status: 'Unmerged' | 'Merged' | 'Dismissed';
}

export interface ResolutionEvidenceData {
  verifiedBy: string;
  verifiedAt: string;
  note: string;
  photoUrl?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  confirmedCategory?: IncidentCategory;
  severity: Severity;
  status: IncidentStatus;
  lat: number;
  lng: number;
  locationName: string;
  ward: string;
  waterDepthMeters: number;
  trappedCount: number;
  hazards: string[];
  imageUrl: string;
  thumbnailUrl?: string;
  reportedAt: string;
  updatedAt: string;
  source: 'Drain Plus RP-1' | 'DrainPulse RP-1' | 'DrainPulse ESP32 Rover' | 'AquaRover Mark-IV' | 'AquaRover Mark-II' | 'Citizen Report' | 'Aerial Drone';
  priorityReason: string;
  safetyGuidelines: string[];
  assignedTeam?: string;
  dispatchPriorityScore: number; // 0 - 100
  history: IncidentHistoryItem[];
  verifiedByAi: boolean;
  reporterContact?: string;
  reporterName?: string;
  aiSuggestion?: AiSuggestionData;
  duplicateFlag?: DuplicateFlagData;
  resolutionEvidence?: ResolutionEvidenceData;
}

export interface RoverTelemetry {
  id: string;
  name: string;
  status: 'Patrolling' | 'Stationary' | 'Responding' | 'Low Battery' | 'Standby';
  battery: number; // 0 - 100 %
  signalStrength: number; // 0 - 100 %
  lat: number;
  lng: number;
  heading: number; // degrees 0-360
  speedKmh: number;
  waterDepthSensor: number; // in meters
  waterFlowVelocity: number; // in m/s
  waterTempCelsius: number;
  lastPing: string;
  cameraActive: boolean;
  assignedSector: string;
  operatingMode: 'Autonomous' | 'Manual Tele-Op';
  opticalZoom: string;
  infraredActive: boolean;
  trail: [number, number][];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  read: boolean;
  incidentId?: string;
}

export interface ReliefShelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
  contactNumber: string;
  suppliesAvailable: string[];
  isOpen: boolean;
}

export interface RoadClosureItem {
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
}

export interface PanchayatRiskZone {
  id: string;
  name: string;
  ward: string;
  coordinates: [number, number][];
  riskLevel: 'Severe' | 'High' | 'Moderate' | 'Low';
  rainfallMmHr: number;
  waterLevelMeters: number;
  activeIncidentsCount: number;
  drainageCapacityPct: number;
  dataSource: string;
  lastUpdated: string;
  scoringReasons: string[];
  disclaimer: string;
}

export interface PanchayatAnalyticsData {
  meta: {
    dataSource: string;
    lastUpdated: string;
    datasetType: string;
    disclaimer: string;
  };
  metrics: {
    complaintVolume: number;
    backlogCount: number;
    resolvedCount: number;
    avgResponseTimeHours: number;
    avgResolutionTimeHours: number;
    inspectionCoveragePct: number;
    sensorAvailabilityPct: number;
    activeHotspotsCount: number;
    recurringHotspots: Array<{
      location: string;
      ward: string;
      reportCount: number;
      avgDepthMeters: number;
      isRecurring: boolean;
    }>;
  };
}

export type AppViewMode = 'command' | 'overview' | 'public' | 'analytics' | 'ambulance';

export type RoadConditionStatus = 
  | 'Reported Clear' 
  | 'Flooded / Blocked' 
  | 'Caution' 
  | 'Unknown / Unverified';

export interface RouteHazardSegment {
  id: string;
  name: string;
  condition: RoadConditionStatus;
  waterDepthMeters?: number;
  reportedAt?: string;
  verificationStatus: 'Official' | 'Unverified' | 'Expired';
  reason?: string;
  coordinates: [number, number];
}

export interface AmbulanceRouteResult {
  isDemo: boolean;
  provider: 'OSRM' | 'Demo-Engine';
  primaryRoute: {
    coordinates: [number, number][];
    distanceKm: number;
    durationMinutes: number;
    hazardsAvoidedCount: number;
    overallCondition: RoadConditionStatus;
    advisory: string;
  };
  alternativeRoute?: {
    coordinates: [number, number][];
    distanceKm: number;
    durationMinutes: number;
    name: string;
    description: string;
  };
  segments: RouteHazardSegment[];
  lastUpdated: string;
}
