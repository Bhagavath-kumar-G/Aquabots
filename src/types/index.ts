export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 'Reported' | 'Acknowledged' | 'Response in Progress' | 'Resolved';

export type IncidentCategory = 
  | 'Trapped Citizens' 
  | 'Submerged Vehicle' 
  | 'Severe Waterlogging' 
  | 'Electrical Hazard' 
  | 'Structural Risk' 
  | 'Medical Emergency';

export interface IncidentHistoryItem {
  timestamp: string;
  status: IncidentStatus;
  note: string;
  author: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
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
  source: 'DrainPulse RP-1' | 'DrainPulse ESP32 Rover' | 'AquaRover Mark-IV' | 'AquaRover Mark-II' | 'Citizen Report' | 'Aerial Drone';
  priorityReason: string;
  safetyGuidelines: string[];
  assignedTeam?: string;
  dispatchPriorityScore: number; // 0 - 100
  history: IncidentHistoryItem[];
  verifiedByAi: boolean;
  reporterContact?: string;
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

export type AppViewMode = 'command' | 'overview' | 'public';
