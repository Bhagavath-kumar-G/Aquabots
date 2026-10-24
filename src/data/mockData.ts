import type { Incident, RoverTelemetry, AppNotification, ReliefShelter } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'DP-2026-101',
    title: 'Ward 3 Sluice Culvert: Silt & Polythene Debris Damming Drain Flow',
    description: 'DrainPulse RP-1 forward camera & ultrasonic sensor detected a dense blockage of discarded plastic polythene bags, wet leaves, and 24cm silt bed choking the underground culvert. Water pooling upstream at 0.72m.',
    category: 'Severe Waterlogging',
    severity: 'Critical',
    status: 'Reported',
    lat: 12.9784,
    lng: 80.2212,
    locationName: 'Ward 3 Agriculture Inflow Culvert, Village North',
    ward: 'Ward 3 (Panchayat North Canal)',
    waterDepthMeters: 0.72,
    trappedCount: 0,
    hazards: ['Severe Plastic & Silt Choke', 'Culvert Inundation', 'Upstream Paddy Field Flooding Risk'],
    imageUrl: '/images/drainpulse/drain_inspection_waste.jpg',
    reportedAt: '12 mins ago',
    updatedAt: '3 mins ago',
    source: 'DrainPulse RP-1' as any,
    priorityReason: 'CRITICAL PRIORITY (Score: 88/100): 80% culvert cross-section blocked by polythene dam; urgent sanitation team dispatch required before monsoon inundates upstream farmland.',
    safetyGuidelines: [
      'Dispatch Panchayat Sanitation Desilting Squad with mechanical rakes & safety waders.',
      'Clear plastic accumulation and dispose of in dry waste sorting facility.',
      'Reroute drain water through bypass weir during cleaning.'
    ],
    assignedTeam: 'Panchayat Sanitation Crew A-1',
    dispatchPriorityScore: 88,
    verifiedByAi: true,
    reporterContact: 'DrainPulse RP-1 ESP32 Telemetry Node',
    history: [
      {
        timestamp: '12 mins ago',
        status: 'Reported',
        note: 'Ultrasonic sensor registered 0.72m standing water; camera captured polythene dam. Alert logged.',
        author: 'DrainPulse ESP32-CAM'
      },
      {
        timestamp: '3 mins ago',
        status: 'Reported',
        note: 'Panchayat control desk verified image stream. Desilting work order drafted.',
        author: 'Panchayat Operations Lead'
      }
    ]
  },
  {
    id: 'DP-2026-102',
    title: 'Main Road Subway Storm Drain: Submerged Silt & Construction Runoff',
    description: 'Subway drainage conduit water depth measured at 0.58m by HC-SR04 ultrasonic sensor. Accumulation of loose construction gravel and mud obstructing gravity discharge to main canal.',
    category: 'Severe Waterlogging',
    severity: 'High',
    status: 'Response in Progress',
    lat: 13.0035,
    lng: 80.2268,
    locationName: 'Village Bus Terminus Link Drain',
    ward: 'Ward 2 (Panchayat Market Road)',
    waterDepthMeters: 0.58,
    trappedCount: 0,
    hazards: ['Road Inundation Risk', 'Silt Accumulation', 'Bus Transit Pathway Narrowed'],
    imageUrl: '/images/drainpulse/water_level_monitoring.jpg',
    reportedAt: '38 mins ago',
    updatedAt: '8 mins ago',
    source: 'DrainPulse RP-1' as any,
    priorityReason: 'HIGH PRIORITY (Score: 74/100): Rising water level in primary drainage artery near public bus shelter.',
    safetyGuidelines: [
      'Deploy mechanical suction tanker to evacuate silt deposit.',
      'Place reflective warning cones around open inspection manhole.',
      'Flush drain conduit with high-pressure water jet.'
    ],
    assignedTeam: 'Panchayat Drainage Taskforce',
    dispatchPriorityScore: 74,
    verifiedByAi: true,
    reporterContact: 'DrainPulse RP-1 ESP32 Telemetry Node',
    history: [
      {
        timestamp: '38 mins ago',
        status: 'Reported',
        note: 'Rover ultrasound sensor tagged water level 0.58m in drain.',
        author: 'DrainPulse RP-1'
      },
      {
        timestamp: '25 mins ago',
        status: 'Acknowledged',
        note: 'Dispatched Panchayat Drainage Taskforce with de-silting tools.',
        author: 'Panchayat Secretary'
      },
      {
        timestamp: '8 mins ago',
        status: 'Response in Progress',
        note: 'Taskforce on site with suction pump; manual rake cleaning underway.',
        author: 'Field Ops Lead'
      }
    ]
  },
  {
    id: 'DP-2026-103',
    title: 'Primary Health Centre Approach: Flooded Drain Inundation',
    description: 'DrainPulse camera identified fallen tree branches and municipal trash clogging the open roadside drain. Standing water 0.45m encroaching on clinic access path.',
    category: 'Structural Risk',
    severity: 'Medium',
    status: 'Reported',
    lat: 13.0418,
    lng: 80.2335,
    locationName: 'Primary Health Centre Approach Road Drain',
    ward: 'Ward 5 (Health Centre Sector)',
    waterDepthMeters: 0.45,
    trappedCount: 0,
    hazards: ['Ambulance Access Narrowing', 'Fallen Foliage Block', 'Stagnant Water Mosquito Risk'],
    imageUrl: '/images/drainpulse/hero_drain_rover.jpg',
    reportedAt: '1 hr ago',
    updatedAt: '25 mins ago',
    source: 'Citizen Report',
    priorityReason: 'MEDIUM PRIORITY (Score: 52/100): Health center access drain clogged; early clearing prevents overflow onto clinic entrance.',
    safetyGuidelines: [
      'Remove tree branches and solid waste from drain grates.',
      'Clear roadside gully pit to enable gravity drainage.'
    ],
    assignedTeam: 'Civic Sanitation Ward Unit 5',
    dispatchPriorityScore: 52,
    verifiedByAi: false,
    reporterContact: '+91 98401 23456 (Panchayat Citizen Portal)',
    history: [
      {
        timestamp: '1 hr ago',
        status: 'Reported',
        note: 'Local nurse submitted photo via DrainPulse Citizen Portal.',
        author: 'Citizen: Anitha M.'
      }
    ]
  },
  {
    id: 'DP-2026-104',
    title: 'Electrical Substation Boundary Drain: Exposed Cable Hazard',
    description: 'Rising water in boundary ditch has submerged an electrical earth wire near the village transformer yard. Urgent power isolation and drain clearing needed.',
    category: 'Electrical Hazard',
    severity: 'Critical',
    status: 'Acknowledged',
    lat: 12.9912,
    lng: 80.2395,
    locationName: 'Village 11kV Substation Boundary Trench',
    ward: 'Ward 1 (Panchayat Power Substation)',
    waterDepthMeters: 0.68,
    trappedCount: 0,
    hazards: ['High Voltage Grounding Risk', 'Submerged Transformer Base', 'Substation Encroachment'],
    imageUrl: '/images/drainpulse/hardware_esp32_closeup.jpg',
    reportedAt: '52 mins ago',
    updatedAt: '14 mins ago',
    source: 'DrainPulse RP-1' as any,
    priorityReason: 'CRITICAL PRIORITY (Score: 92/100): High-voltage electrical substation perimeter drain flooded; immediate utility coordination required.',
    safetyGuidelines: [
      'Notify State Electricity Board to verify earth wire insulation before crew enters.',
      'Operate non-conductive fiberglass tools for vegetation removal.',
      'Deploy portable sump pump to lower water below trench footing.'
    ],
    assignedTeam: 'Electricity Board & Panchayat Joint Team',
    dispatchPriorityScore: 92,
    verifiedByAi: true,
    reporterContact: 'DrainPulse RP-1 Acoustic Sonar & Camera',
    history: [
      {
        timestamp: '52 mins ago',
        status: 'Reported',
        note: 'DrainPulse optical scan flagged submerged electrical conduit.',
        author: 'DrainPulse RP-1'
      },
      {
        timestamp: '14 mins ago',
        status: 'Acknowledged',
        note: 'TNEB substation engineer notified. Power isolation scheduled.',
        author: 'Utility Liaison'
      }
    ]
  },
  {
    id: 'DP-2026-105',
    title: 'Canal Sluice Outfall Gate 2 Successfully Cleared & De-silted',
    description: 'Sanitation squad removed 350kg of plastic bottles and silt. Water level restored to free-flowing baseline 0.08m. DrainPulse re-scan verified clear passage.',
    category: 'Severe Waterlogging',
    severity: 'Low',
    status: 'Resolved',
    lat: 13.0125,
    lng: 80.2155,
    locationName: 'Agricultural Canal Outfall Sluice Gate 2',
    ward: 'Ward 4 (Irrigation Channel)',
    waterDepthMeters: 0.08,
    trappedCount: 0,
    hazards: ['Minor Silt Residue (Cleaned)'],
    imageUrl: '/images/drainpulse/panchayat_control_room.jpg',
    reportedAt: '3 hrs ago',
    updatedAt: '20 mins ago',
    source: 'DrainPulse RP-1' as any,
    priorityReason: 'LOW PRIORITY (Score: 12/100): Canal outflow completely cleared; free gravity drainage verified by rover post-inspection.',
    safetyGuidelines: [
      'Normal agricultural water flow operational.',
      'Schedule next periodic DrainPulse inspection in 14 days.'
    ],
    assignedTeam: 'Panchayat Sanitation Crew A-1',
    dispatchPriorityScore: 12,
    verifiedByAi: true,
    history: [
      {
        timestamp: '3 hrs ago',
        status: 'Reported',
        note: 'Rover tagged 0.65m clog at canal outfall sluice.',
        author: 'DrainPulse RP-1'
      },
      {
        timestamp: '1.5 hrs ago',
        status: 'Response in Progress',
        note: 'Panchayat crew deployed rake barriers and cleared debris.',
        author: 'Sanitation Supervisor'
      },
      {
        timestamp: '20 mins ago',
        status: 'Resolved',
        note: 'Water level lowered to 0.08m. DrainPulse re-run confirmed clear passage.',
        author: 'Panchayat Operations'
      }
    ]
  }
];

export const INITIAL_ROVER: RoverTelemetry = {
  id: 'DP-RP-01',
  name: 'DrainPulse RP-1 (ESP32-CAM)',
  status: 'Patrolling',
  battery: 88,
  signalStrength: 85,
  lat: 12.9860,
  lng: 80.2250,
  heading: 48,
  speedKmh: 1.8,
  waterDepthSensor: 0.28,
  waterFlowVelocity: 0.4,
  waterTempCelsius: 24.2,
  lastPing: 'Just now (Wi-Fi 802.11b/g/n)',
  cameraActive: true,
  assignedSector: 'Panchayat Sector 4 (Agricultural Canal & Ward Drains)',
  operatingMode: 'Autonomous',
  opticalZoom: '1.0x ESP32-CAM',
  infraredActive: false,
  trail: [
    [12.9810, 80.2205],
    [12.9825, 80.2220],
    [12.9840, 80.2235],
    [12.9860, 80.2250]
  ]
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    title: 'CRITICAL: Ward 3 Sluice Culvert Clogged',
    message: 'DrainPulse RP-1 detected 24cm silt bed and heavy plastic bags blocking underground culvert. Water pooling at 0.72m.',
    timestamp: '12m ago',
    severity: 'Critical',
    read: false,
    incidentId: 'DP-2026-101'
  },
  {
    id: 'NOTIF-2',
    title: 'High Hazard: Substation Perimeter Drain',
    message: 'Rising stormwater in electrical substation boundary trench. Electricity Board joint team notified.',
    timestamp: '52m ago',
    severity: 'Critical',
    read: false,
    incidentId: 'DP-2026-104'
  },
  {
    id: 'NOTIF-3',
    title: 'ESP32 Wi-Fi Telemetry Synchronized',
    message: 'DrainPulse RP-1 connected to Panchayat Wi-Fi AP. Ultrasonic distance sensor calibrated at 0.28m water baseline.',
    timestamp: '1h ago',
    severity: 'Info',
    read: true
  },
  {
    id: 'NOTIF-4',
    title: 'Canal Outfall Sluice Cleared',
    message: 'Gate 2 cleared by sanitation crew. Gravity water flow restored to 0.08m normal depth.',
    timestamp: '2h ago',
    severity: 'Low',
    read: true,
    incidentId: 'DP-2026-105'
  }
];

export const RELIEF_SHELTERS: ReliefShelter[] = [
  {
    id: 'SHL-01',
    name: 'Panchayat Union Primary School Relief Camp',
    address: 'Main Road, Village Ward 3, Panchayat Centre',
    lat: 12.9750,
    lng: 80.2180,
    capacity: 250,
    occupancy: 95,
    contactNumber: '+91 44 2243 0012',
    suppliesAvailable: ['Drinking Water', 'Dry Food Packets', 'First Aid Medical Kit', 'Emergency Power Inverter'],
    isOpen: true
  },
  {
    id: 'SHL-02',
    name: 'Community Hall & Disaster Coordination Hub',
    address: 'Post Office Street, Ward 1, Panchayat HQ',
    lat: 13.0070,
    lng: 80.2290,
    capacity: 300,
    occupancy: 60,
    contactNumber: '+91 44 2480 5543',
    suppliesAvailable: ['Hot Meals', 'Sanitation Kits', 'Village Doctor on Duty', 'Mobile Water Pump Station'],
    isOpen: true
  },
  {
    id: 'SHL-03',
    name: 'Agricultural Cooperative Society Safe Shelter',
    address: 'Farmers Market Road, Ward 4, South Canal',
    lat: 13.0180,
    lng: 80.2220,
    capacity: 400,
    occupancy: 140,
    contactNumber: '+91 44 2435 9988',
    suppliesAvailable: ['High-Capacity Generator', 'Grain Protection Tarpaulins', 'Tractor Transport Standby'],
    isOpen: true
  }
];

export const DEMO_SCENARIOS = [
  {
    title: 'Severe Polythene & Silt Choke in Narrow Culvert',
    category: 'Severe Waterlogging' as const,
    waterDepth: 0.85,
    trappedCount: 0,
    hazards: ['80% Cross-Section Clogged', 'Floating Garbage Accumulation', 'Upstream Paddy Inundation'],
    locationName: 'North Canal Inflow Culvert, Ward 3',
    ward: 'Ward 3 (Panchayat North Canal)',
    lat: 12.9695,
    lng: 80.2085,
    imageUrl: '/images/drainpulse/drain_inspection_waste.jpg',
    source: 'DrainPulse RP-1' as const
  },
  {
    title: 'Rising Stormwater Level Near Village Bus Depot Underpass',
    category: 'Severe Waterlogging' as const,
    waterDepth: 0.65,
    trappedCount: 0,
    hazards: ['Road Inundation Threat', 'Slow Drainage', 'Bus Route Affected'],
    locationName: 'Bus Terminus Link Road Conduit',
    ward: 'Ward 2 (Market Road)',
    lat: 13.0290,
    lng: 80.2245,
    imageUrl: '/images/drainpulse/water_level_monitoring.jpg',
    source: 'DrainPulse RP-1' as const
  },
  {
    title: 'Fallen Branches & Plastic Waste at Clinic Drain Inlet',
    category: 'Structural Risk' as const,
    waterDepth: 0.48,
    trappedCount: 0,
    hazards: ['Foliage Dam', 'Gully Pit Blockage', 'Clinic Access Threat'],
    locationName: 'Primary Health Centre Approach',
    ward: 'Ward 5 (Health Centre)',
    lat: 12.9890,
    lng: 80.1890,
    imageUrl: '/images/drainpulse/hero_drain_rover.jpg',
    source: 'DrainPulse RP-1' as const
  },
  {
    title: 'Submerged Earth Wire Near Substation Boundary Ditch',
    category: 'Electrical Hazard' as const,
    waterDepth: 0.72,
    trappedCount: 0,
    hazards: ['Submerged 440V Earth Cable', 'Transformer Yard Flooding', 'Isolation Protocol Required'],
    locationName: 'Village 11kV Substation Trench',
    ward: 'Ward 1 (Power Sector)',
    lat: 12.9735,
    lng: 80.2350,
    imageUrl: '/images/drainpulse/hardware_esp32_closeup.jpg',
    source: 'DrainPulse RP-1' as const
  }
];

