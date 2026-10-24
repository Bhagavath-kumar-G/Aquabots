import type { Incident, RoverTelemetry, AppNotification, ReliefShelter } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-801',
    title: 'Stranded Family on Elevated Porch with Rising Floodwater',
    description: 'AquaRover Mark-IV optical feed detected 4 civilians (including 2 young children) stranded on elevated residential stairs with floodwater at 1.42m. Inflow from nearby breached drainage canal is steady.',
    category: 'Trapped Citizens',
    severity: 'Critical',
    status: 'Reported',
    lat: 12.9784,
    lng: 80.2212,
    locationName: 'Velachery Bypass Road, near AGS Colony',
    ward: 'Ward 178 (South Zone)',
    waterDepthMeters: 1.42,
    trappedCount: 4,
    hazards: ['Rising Flood Water', 'Children Present', 'Hypothermia Risk', 'Floating Debris'],
    imageUrl: '/images/stranded_citizens.jpg',
    reportedAt: '12 mins ago',
    updatedAt: '3 mins ago',
    source: 'AquaRover Mark-IV',
    priorityReason: 'CRITICAL PRIORITY (Score: 94/100): 4 trapped civilians with flood depth 1.42m exceeding safe wading limit; swift boat evacuation required.',
    safetyGuidelines: [
      'Deploy SDRF inflatable rescue dinghy with trained flood rescue swimmers.',
      'Equip all rescued victims with life vests and thermal emergency foil blankets.',
      'Maintain visual optical tracking via Rover Mark-IV floodlights.'
    ],
    assignedTeam: 'SDRF Flood Unit Delta-2',
    dispatchPriorityScore: 94,
    verifiedByAi: true,
    reporterContact: 'AquaRover Mark-IV Automated RTK Sensor',
    history: [
      {
        timestamp: '12 mins ago',
        status: 'Reported',
        note: 'AI Optical classifier identified 4 persons stranded with 96.8% confidence. Automated incident logged.',
        author: 'AquaRover Optical AI'
      },
      {
        timestamp: '3 mins ago',
        status: 'Reported',
        note: 'Tele-operator confirmed live camera stream. Alert escalated to SDRF Delta-2 Command.',
        author: 'Disaster Operations Officer'
      }
    ]
  },
  {
    id: 'INC-2026-802',
    title: 'Submerged Passenger Vehicle in Railway Subway Underpass',
    description: 'Black sedan stalled and submerged up to window sill in subway depression. Depth sensor confirms 1.15m water depth. Vehicle cabin verified unoccupied by thermal scan. Arterial road blocked.',
    category: 'Submerged Vehicle',
    severity: 'High',
    status: 'Response in Progress',
    lat: 13.0035,
    lng: 80.2268,
    locationName: 'Kodambakkam Railway Subway Underpass',
    ward: 'Ward 134 (Central Zone)',
    waterDepthMeters: 1.15,
    trappedCount: 0,
    hazards: ['Subway Depression Water Trap', 'Arterial Lifeline Blocked', 'Fuel Ingress Risk'],
    imageUrl: '/images/underpass_flood.jpg',
    reportedAt: '38 mins ago',
    updatedAt: '8 mins ago',
    source: 'AquaRover Mark-IV',
    priorityReason: 'HIGH PRIORITY (Score: 78/100): Underpass water level > 1.0m, submerged car obstructing emergency vehicle transit corridor.',
    safetyGuidelines: [
      'Barricade both subway entry ramps with emergency LED warning pylons.',
      'Deploy mobile diesel-powered dewatering pump (5,000 LPM capacity).',
      'Winch out vehicle once water level drops below wheel hubs.'
    ],
    assignedTeam: 'Municipal Dewatering Squad 7',
    dispatchPriorityScore: 78,
    verifiedByAi: true,
    reporterContact: 'AquaRover Mark-IV Automated RTK Sensor',
    history: [
      {
        timestamp: '38 mins ago',
        status: 'Reported',
        note: 'Rover sensor tagged water level 1.15m in underpass. Vehicle detected.',
        author: 'AquaRover Mark-IV'
      },
      {
        timestamp: '25 mins ago',
        status: 'Acknowledged',
        note: 'High-priority road blockage acknowledged by Traffic Control & Civic Body.',
        author: 'Control Room Officer'
      },
      {
        timestamp: '8 mins ago',
        status: 'Response in Progress',
        note: 'Mobile Dewatering Unit 7 arrived on scene with high-volume pump.',
        author: 'Field Ops Lead'
      }
    ]
  },
  {
    id: 'INC-2026-803',
    title: 'Submerged Electrical Transformer & Canal Sluice Embankment',
    description: 'Adyar canal sluice gate backflow has breached local bund. Distribution transformer base is immersed in 1.25m swirling water. High risk of electrical grounding flashover.',
    category: 'Electrical Hazard',
    severity: 'Critical',
    status: 'Acknowledged',
    lat: 12.9912,
    lng: 80.2395,
    locationName: 'Adyar River Sluice Point 4, Saidapet Bank',
    ward: 'Ward 142 (South-Central)',
    waterDepthMeters: 1.25,
    trappedCount: 0,
    hazards: ['High Voltage Sparking Risk', 'Fast Flow Velocity 1.8 m/s', 'Submerged 11kV Distribution Board'],
    imageUrl: '/images/rover_main.jpg',
    reportedAt: '52 mins ago',
    updatedAt: '14 mins ago',
    source: 'AquaRover Mark-IV',
    priorityReason: 'CRITICAL PRIORITY (Score: 91/100): High-voltage electrical substation equipment submerged; imminent electrocution hazard for surrounding settlement.',
    safetyGuidelines: [
      'IMMEDIATELY isolate and de-energize 11kV Saidapet feeder line at Substation 3.',
      'Maintain strict 50m exclusion perimeter for all boat and foot rescue squads.',
      'Deploy non-conductive fiberglass depth probes only.'
    ],
    assignedTeam: 'Electricity Board Rapid Response Crew',
    dispatchPriorityScore: 91,
    verifiedByAi: true,
    reporterContact: 'AquaRover Acoustic Sonar & Camera',
    history: [
      {
        timestamp: '52 mins ago',
        status: 'Reported',
        note: 'Rover sonar & optical sensors recorded transformer contact with flood surface.',
        author: 'AquaRover Mark-IV'
      },
      {
        timestamp: '14 mins ago',
        status: 'Acknowledged',
        note: 'TNEB Grid Supervisor notified. Line de-energization scheduled immediately.',
        author: 'Power Utility Liaison'
      }
    ]
  },
  {
    id: 'INC-2026-804',
    title: 'Severe Commercial Street Waterlogging with Clogged Inlets',
    description: 'Shopping street inundated up to 0.55m. Storm drain gratings clogged with urban plastic debris, preventing gravity outflow into canal.',
    category: 'Severe Waterlogging',
    severity: 'Medium',
    status: 'Reported',
    lat: 13.0418,
    lng: 80.2335,
    locationName: 'North Usman Road Commercial Corridor',
    ward: 'Ward 117 (Central Zone)',
    waterDepthMeters: 0.55,
    trappedCount: 0,
    hazards: ['Catch Pit Clogging', 'Commercial Ingress', 'Slow Traffic'],
    imageUrl: '/images/underpass_flood.jpg',
    reportedAt: '1 hr ago',
    updatedAt: '25 mins ago',
    source: 'Citizen Report',
    priorityReason: 'MEDIUM PRIORITY (Score: 48/100): 0.55m standing water causing transit disruption; no immediate threat to life.',
    safetyGuidelines: [
      'Manual drain de-silting crew to clear storm drain gratings.',
      'Divert two-wheelers and sedans toward flyover ramp.'
    ],
    assignedTeam: 'Civic Sanitation Ward Unit 117',
    dispatchPriorityScore: 48,
    verifiedByAi: false,
    reporterContact: '+91 98401 23456 (Citizen Portal)',
    history: [
      {
        timestamp: '1 hr ago',
        status: 'Reported',
        note: 'Citizen submitted photo and geolocation via AquaRescue Public Portal.',
        author: 'Citizen: Rajesh K.'
      }
    ]
  },
  {
    id: 'INC-2026-805',
    title: 'Guindy - Kathipara Transit Underpass Successfully De-watered',
    description: 'Water depth reduced from 0.9m to 0.08m after 2 hours of heavy de-watering pumping. Silt clearing complete, road cleared for emergency vehicles.',
    category: 'Severe Waterlogging',
    severity: 'Low',
    status: 'Resolved',
    lat: 13.0125,
    lng: 80.2155,
    locationName: 'Guindy - Kathipara Link Subway',
    ward: 'Ward 160 (South Zone)',
    waterDepthMeters: 0.08,
    trappedCount: 0,
    hazards: ['Minor Silt Residue'],
    imageUrl: '/images/underpass_flood.jpg',
    reportedAt: '3 hrs ago',
    updatedAt: '20 mins ago',
    source: 'AquaRover Mark-II',
    priorityReason: 'LOW PRIORITY (Score: 15/100): Inundation resolved; normal transit restored and confirmed by municipal engineers.',
    safetyGuidelines: [
      'Transit open to all vehicles.',
      'Sump automatic pump station set to high-water auto-trigger.'
    ],
    assignedTeam: 'Disaster Relief Unit Beta',
    dispatchPriorityScore: 15,
    verifiedByAi: true,
    history: [
      {
        timestamp: '3 hrs ago',
        status: 'Reported',
        note: 'Rover Mark-II tagged 0.9m water level in subway.',
        author: 'AquaRover Mark-II'
      },
      {
        timestamp: '1.5 hrs ago',
        status: 'Response in Progress',
        note: 'Twin 80HP pumps deployed by Municipal Corporation.',
        author: 'Civic Engineer'
      },
      {
        timestamp: '20 mins ago',
        status: 'Resolved',
        note: 'Water cleared to 0.08m. Subway declared safe and re-opened for transit.',
        author: 'Command Operations'
      }
    ]
  }
];

export const INITIAL_ROVER: RoverTelemetry = {
  id: 'ROV-MARK-IV',
  name: 'AquaRover Mark-IV (DeepWave)',
  status: 'Patrolling',
  battery: 86,
  signalStrength: 98,
  lat: 12.9860,
  lng: 80.2250,
  heading: 48,
  speedKmh: 4.6,
  waterDepthSensor: 1.18,
  waterFlowVelocity: 1.3,
  waterTempCelsius: 24.8,
  lastPing: 'Just now',
  cameraActive: true,
  assignedSector: 'Sector 7 (Adyar Basin / Velachery Corridor)',
  operatingMode: 'Autonomous',
  opticalZoom: '2.4x Optical',
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
    title: 'CRITICAL: Stranded Civilians Detected',
    message: 'AquaRover Mark-IV confirmed 4 stranded civilians on Velachery Bypass Rd. Immediate SDRF boat rescue dispatched.',
    timestamp: '12m ago',
    severity: 'Critical',
    read: false,
    incidentId: 'INC-2026-801'
  },
  {
    id: 'NOTIF-2',
    title: 'High Hazard: Submerged Transformer',
    message: 'Adyar Canal Sluice point 4 reports submerged electrical transformer. TNEB grid de-energization requested.',
    timestamp: '52m ago',
    severity: 'Critical',
    read: false,
    incidentId: 'INC-2026-803'
  },
  {
    id: 'NOTIF-3',
    title: 'Rover Telemetry: Sensor Calibrated',
    message: 'AquaRover Mark-IV ultrasound depth sensor and RTK GPS fix locked at 12.9860° N, 80.2250° E.',
    timestamp: '1h ago',
    severity: 'Info',
    read: true
  },
  {
    id: 'NOTIF-4',
    title: 'Subway Reopened',
    message: 'Guindy - Kathipara Link subway floodwater pumped down to 0.08m. Transit restored.',
    timestamp: '2h ago',
    severity: 'Medium',
    read: true,
    incidentId: 'INC-2026-805'
  }
];

export const RELIEF_SHELTERS: ReliefShelter[] = [
  {
    id: 'SHL-01',
    name: 'Government Higher Secondary School Relief Camp',
    address: '14, Gandhi Road, Velachery, Chennai',
    lat: 12.9750,
    lng: 80.2180,
    capacity: 450,
    occupancy: 280,
    contactNumber: '+91 44 2243 0012',
    suppliesAvailable: ['Food Packets', 'Drinking Water', 'Medical First Aid', 'Dry Blankets', 'Power Charging Station'],
    isOpen: true
  },
  {
    id: 'SHL-02',
    name: 'Community Hall Disaster Relief Center',
    address: 'Station Road, Kodambakkam, Chennai',
    lat: 13.0070,
    lng: 80.2290,
    capacity: 350,
    occupancy: 120,
    contactNumber: '+91 44 2480 5543',
    suppliesAvailable: ['Hot Meals', 'Sanitation Kits', 'Doctor on Duty', 'Infant Formula'],
    isOpen: true
  },
  {
    id: 'SHL-03',
    name: 'Saidapet Municipal Sports Complex Evacuation Center',
    address: 'Anna Salai, Saidapet, Chennai',
    lat: 13.0180,
    lng: 80.2220,
    capacity: 600,
    occupancy: 390,
    contactNumber: '+91 44 2435 9988',
    suppliesAvailable: ['High-Capacity Dormitory', 'Mobile Water Purification Unit', 'Ambulance Standby'],
    isOpen: true
  }
];

export const DEMO_SCENARIOS = [
  {
    title: 'Elderly Resident Stranded on Balcony with Rising Waters',
    category: 'Trapped Citizens' as const,
    waterDepth: 1.65,
    trappedCount: 2,
    hazards: ['Waist-Deep Water', 'Elderly Medical Care Required', 'Power Outage'],
    locationName: 'Ram Nagar 3rd Main Road, Madipakkam',
    ward: 'Ward 188 (South Zone)',
    lat: 12.9695,
    lng: 80.2085,
    imageUrl: '/images/stranded_citizens.jpg',
    source: 'AquaRover Mark-IV' as const
  },
  {
    title: 'Flash Flood Canal Overflow at Bridge Construction Span',
    category: 'Structural Risk' as const,
    waterDepth: 1.35,
    trappedCount: 0,
    hazards: ['Structural Scour', 'Water Flow 2.2 m/s', 'Bridge Scaffolding Ingress'],
    locationName: 'Mambalam Canal Crossing, West Jones Road',
    ward: 'Ward 131 (Central Zone)',
    lat: 13.0290,
    lng: 80.2245,
    imageUrl: '/images/underpass_flood.jpg',
    source: 'AquaRover Mark-IV' as const
  },
  {
    title: 'Submerged Minibus in Flooded Low-Lying Underpass',
    category: 'Submerged Vehicle' as const,
    waterDepth: 1.28,
    trappedCount: 3,
    hazards: ['Vehicle Passenger Trap', 'Rising Flood Rate 5cm/hr', 'Poor Visibility'],
    locationName: 'Pazhavanthangal Railway Subway',
    ward: 'Ward 165 (South Zone)',
    lat: 12.9890,
    lng: 80.1890,
    imageUrl: '/images/underpass_flood.jpg',
    source: 'AquaRover Mark-IV' as const
  },
  {
    title: 'Fallen High-Tension Electric Wire in Waterlogged Alley',
    category: 'Electrical Hazard' as const,
    waterDepth: 0.85,
    trappedCount: 0,
    hazards: ['Live 440V Cable in Water', 'Acoustic Arcing Sounds', 'Pedestrian Pathway Blocked'],
    locationName: '100 Feet Bypass Road, Taramani Link',
    ward: 'Ward 179 (South Zone)',
    lat: 12.9735,
    lng: 80.2350,
    imageUrl: '/images/rover_main.jpg',
    source: 'AquaRover Mark-IV' as const
  }
];
