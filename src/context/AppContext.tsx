import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Incident, RoverTelemetry, AppNotification, IncidentStatus, AppViewMode, ReliefShelter } from '../types';
import { INITIAL_INCIDENTS, INITIAL_ROVER, INITIAL_NOTIFICATIONS, RELIEF_SHELTERS, DEMO_SCENARIOS } from '../data/mockData';
import { calculateIncidentPriority } from '../utils/prioritization';
import { playEmergencyAlertSound, playNotificationChime } from '../utils/audio';
import { apiService } from '../services/api';

interface AppContextType {
  incidents: Incident[];
  rover: RoverTelemetry;
  notifications: AppNotification[];
  shelters: ReliefShelter[];
  viewMode: AppViewMode;
  selectedIncident: Incident | null;
  filterSeverity: string;
  filterStatus: string;
  filterCategory: string;
  searchQuery: string;
  isSimulatingPatrol: boolean;
  audioAlertsEnabled: boolean;
  unreadNotificationsCount: number;
  focusedCoordinates: [number, number] | null;
  
  // Actions
  setViewMode: (mode: AppViewMode) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setFilterSeverity: (sev: string) => void;
  setFilterStatus: (st: string) => void;
  setFilterCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  setFocusedCoordinates: (coords: [number, number] | null) => void;
  toggleAudioAlerts: () => void;
  toggleSimulatePatrol: () => void;
  
  // Incident updates
  updateIncidentStatus: (
    incidentId: string, 
    newStatus: IncidentStatus, 
    note?: string, 
    assignedTeam?: string
  ) => void;
  updateIncidentDetails: (
    incidentId: string,
    updates: Partial<Incident>
  ) => void;
  
  // Simulation actions
  simulateRoverObservation: (scenarioIndex?: number) => Incident;
  triggerEmergencyAlertBroadcast: (title: string, message: string) => void;
  submitCitizenReport: (report: {
    title: string;
    description: string;
    locationName: string;
    lat: number;
    lng: number;
    waterDepthMeters: number;
    category: Incident['category'];
    reporterContact?: string;
    photoUrl?: string;
  }) => Incident;
  
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToDefaultData: () => void;
}

const STORAGE_KEY_INCIDENTS = 'drainpulse_incidents_v2';
const STORAGE_KEY_ROVER = 'drainpulse_rover_v2';
const STORAGE_KEY_NOTIFS = 'drainpulse_notifs_v2';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with local storage fallback
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved incidents:', e);
    }
    return INITIAL_INCIDENTS;
  });

  const [rover, setRover] = useState<RoverTelemetry>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROVER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved rover state:', e);
    }
    return INITIAL_ROVER;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved notifications:', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [shelters] = useState<ReliefShelter[]>(RELIEF_SHELTERS);
  const [viewMode, setViewMode] = useState<AppViewMode>('command');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatingPatrol, setIsSimulatingPatrol] = useState<boolean>(false);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [focusedCoordinates, setFocusedCoordinates] = useState<[number, number] | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.warn('Failed to persist incidents:', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROVER, JSON.stringify(rover));
    } catch (e) {
      console.warn('Failed to persist rover:', e);
    }
  }, [rover]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to persist notifications:', e);
    }
  }, [notifications]);

  // Sync from backend API on mount with graceful offline fallback
  useEffect(() => {
    let isMounted = true;
    async function loadBackendComplaints() {
      const backendComplaints = await apiService.getComplaints();
      if (isMounted && backendComplaints && backendComplaints.length > 0) {
        setIncidents(prev => {
          const map = new Map(prev.map(i => [i.id, i]));
          for (const b of backendComplaints) {
            map.set(b.id, b);
          }
          return Array.from(map.values());
        });
      }
    }
    loadBackendComplaints();
    return () => { isMounted = false; };
  }, []);

  // Keep selected incident reference in sync if incidents update
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find(i => i.id === selectedIncident.id);
      if (updated && updated !== selectedIncident) setSelectedIncident(updated);
    }
  }, [incidents, selectedIncident]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const toggleAudioAlerts = useCallback(() => {
    setAudioAlertsEnabled(prev => !prev);
  }, []);

  const toggleSimulatePatrol = useCallback(() => {
    setIsSimulatingPatrol(prev => !prev);
  }, []);

  // Update incident status with audit trail
  const updateIncidentStatus = useCallback((
    incidentId: string, 
    newStatus: IncidentStatus, 
    note?: string, 
    assignedTeam?: string
  ) => {
    setIncidents(prevIncidents => {
      return prevIncidents.map(inc => {
        if (inc.id !== incidentId) return inc;

        const defaultNote = `Status changed to ${newStatus}${assignedTeam ? ` with team ${assignedTeam}` : ''}`;
        const newHistoryItem = {
          timestamp: 'Just now',
          status: newStatus,
          note: note || defaultNote,
          author: 'Command Operations'
        };

        return {
          ...inc,
          status: newStatus,
          updatedAt: 'Just now',
          assignedTeam: assignedTeam !== undefined ? assignedTeam : inc.assignedTeam,
          history: [newHistoryItem, ...inc.history]
        };
      });
    });

    // Notify of status transition
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `Incident ${incidentId} Status Updated`,
      message: `Incident is now "${newStatus}"${assignedTeam ? ` (Assigned: ${assignedTeam})` : ''}`,
      timestamp: 'Just now',
      severity: newStatus === 'Resolved' ? 'Info' : 'Medium',
      read: false,
      incidentId
    };

    setNotifications(prev => [notif, ...prev]);
    if (audioAlertsEnabled) {
      playNotificationChime();
    }
  }, [audioAlertsEnabled]);

  const updateIncidentDetails = useCallback((
    incidentId: string,
    updates: Partial<Incident>
  ) => {
    setIncidents(prevIncidents => {
      return prevIncidents.map(inc => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          ...updates,
          updatedAt: 'Just now'
        };
      });
    });
  }, []);

  // Simulate new Rover Observation with automated rule prioritization
  const simulateRoverObservation = useCallback((scenarioIndex?: number) => {
    const idx = scenarioIndex !== undefined 
      ? scenarioIndex % DEMO_SCENARIOS.length 
      : Math.floor(Math.random() * DEMO_SCENARIOS.length);
    const scenario = DEMO_SCENARIOS[idx];

    // Slight coordinate jitter so new observations have unique GPS fixes
    const jitterLat = (Math.random() - 0.5) * 0.004;
    const jitterLng = (Math.random() - 0.5) * 0.004;
    const observationLat = Number((scenario.lat + jitterLat).toFixed(5));
    const observationLng = Number((scenario.lng + jitterLng).toFixed(5));

    // Calculate priority using the transparent rule engine
    const priorityResult = calculateIncidentPriority({
      category: scenario.category,
      waterDepthMeters: scenario.waterDepth,
      trappedCount: scenario.trappedCount,
      hazards: scenario.hazards,
      locationName: scenario.locationName
    });

    const newId = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: Incident = {
      id: newId,
      title: scenario.title,
      description: `Autonomous Rover telemetry stream captured high-resolution observation. Optical sensors identified ${scenario.category.toLowerCase()} at ${scenario.locationName}. Ultrasound depth reads ${scenario.waterDepth.toFixed(2)}m.`,
      category: scenario.category,
      severity: priorityResult.severity,
      status: 'Reported',
      lat: observationLat,
      lng: observationLng,
      locationName: scenario.locationName,
      ward: scenario.ward,
      waterDepthMeters: scenario.waterDepth,
      trappedCount: scenario.trappedCount,
      hazards: scenario.hazards,
      imageUrl: scenario.imageUrl,
      reportedAt: 'Just now',
      updatedAt: 'Just now',
      source: scenario.source,
      priorityReason: priorityResult.explanation,
      safetyGuidelines: priorityResult.safetyGuidelines,
      dispatchPriorityScore: priorityResult.score,
      verifiedByAi: true,
      reporterContact: 'AquaRover Mark-IV Real-Time Telemetry',
      history: [
        {
          timestamp: 'Just now',
          status: 'Reported',
          note: `New observation captured by AquaRover Mark-IV. Automated Priority Score: ${priorityResult.score}/100 (${priorityResult.severity}).`,
          author: 'AquaRover Edge AI'
        }
      ]
    };

    // Update incidents list
    setIncidents(prev => [newIncident, ...prev]);

    // Move Rover to this spot and record telemetry
    setRover(prev => ({
      ...prev,
      lat: observationLat,
      lng: observationLng,
      waterDepthSensor: scenario.waterDepth,
      lastPing: 'Just now',
      trail: [...prev.trail.slice(-8), [observationLat, observationLng]]
    }));

    // Generate urgent alert notification
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `[NEW ROVER ALERT] ${priorityResult.severity.toUpperCase()}: ${scenario.category}`,
      message: `${scenario.locationName} — Depth: ${scenario.waterDepth.toFixed(2)}m | ${scenario.trappedCount > 0 ? `${scenario.trappedCount} Trapped Citizens!` : 'Submerged hazard detected.'}`,
      timestamp: 'Just now',
      severity: priorityResult.severity,
      read: false,
      incidentId: newId
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Focus map on coordinates
    setFocusedCoordinates([observationLat, observationLng]);

    // Trigger audible alert sound
    if (audioAlertsEnabled) {
      if (priorityResult.severity === 'Critical' || priorityResult.severity === 'High') {
        playEmergencyAlertSound();
      } else {
        playNotificationChime();
      }
    }

    return newIncident;
  }, [audioAlertsEnabled]);

  // Public portal citizen submission
  const submitCitizenReport = useCallback((report: {
    title: string;
    description: string;
    locationName: string;
    lat: number;
    lng: number;
    waterDepthMeters: number;
    category: Incident['category'];
    reporterContact?: string;
    photoUrl?: string;
  }) => {
    const priorityResult = calculateIncidentPriority({
      category: report.category,
      waterDepthMeters: report.waterDepthMeters,
      trappedCount: 0,
      hazards: ['Citizen Verified Report', 'Localized Ponding'],
      locationName: report.locationName
    });

    const newId = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newIncident: Incident = {
      id: newId,
      title: report.title,
      description: report.description,
      category: report.category,
      severity: priorityResult.severity,
      status: 'Reported',
      lat: report.lat,
      lng: report.lng,
      locationName: report.locationName,
      ward: 'Ward Unassigned (Public SOS)',
      waterDepthMeters: report.waterDepthMeters,
      trappedCount: 0,
      hazards: ['Public SOS Incident'],
      imageUrl: report.photoUrl || '/images/drainpulse/drain_inspection_waste.jpg',
      reportedAt: 'Just now',
      updatedAt: 'Just now',
      source: 'Citizen Report',
      priorityReason: priorityResult.explanation,
      safetyGuidelines: priorityResult.safetyGuidelines,
      dispatchPriorityScore: priorityResult.score,
      verifiedByAi: false,
      reporterContact: report.reporterContact || 'Citizen Submission',
      history: [
        {
          timestamp: 'Just now',
          status: 'Reported',
          note: 'Public blockage alert received via Drain Plus Panchayat Portal.',
          author: report.reporterContact || 'Village Citizen'
        }
      ]
    };

    setIncidents(prev => [newIncident, ...prev]);

    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `New Citizen Report: ${report.locationName}`,
      message: `${report.title} (Water depth approx ${report.waterDepthMeters}m). Requires verification.`,
      timestamp: 'Just now',
      severity: 'Medium',
      read: false,
      incidentId: newId
    };

    setNotifications(prev => [notif, ...prev]);
    if (audioAlertsEnabled) playNotificationChime();

    return newIncident;
  }, [audioAlertsEnabled]);

  // Broadcast simulated emergency alert
  const triggerEmergencyAlertBroadcast = useCallback((title: string, message: string) => {
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: `DISASTER ALERT BROADCAST: ${title}`,
      message,
      timestamp: 'Just now',
      severity: 'Critical',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
    if (audioAlertsEnabled) playEmergencyAlertSound();
  }, [audioAlertsEnabled]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const resetToDefaultData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_INCIDENTS);
    localStorage.removeItem(STORAGE_KEY_ROVER);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    setIncidents(INITIAL_INCIDENTS);
    setRover(INITIAL_ROVER);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedIncident(null);
    setFocusedCoordinates([INITIAL_ROVER.lat, INITIAL_ROVER.lng]);
  }, []);

  // Periodic autonomous rover patrol movement simulation
  useEffect(() => {
    if (!isSimulatingPatrol) return;

    const interval = setInterval(() => {
      setRover(prev => {
        // Move along a realistic path in the flood corridor
        const deltaLat = (Math.random() - 0.45) * 0.0015;
        const deltaLng = (Math.random() - 0.45) * 0.0015;
        const newLat = Number((prev.lat + deltaLat).toFixed(5));
        const newLng = Number((prev.lng + deltaLng).toFixed(5));
        const newBattery = Math.max(15, prev.battery - 0.1);
        const newDepth = Number((0.6 + Math.random() * 0.9).toFixed(2));
        const newSpeed = Number((3.8 + Math.random() * 1.8).toFixed(1));

        return {
          ...prev,
          lat: newLat,
          lng: newLng,
          battery: Number(newBattery.toFixed(1)),
          waterDepthSensor: newDepth,
          speedKmh: newSpeed,
          heading: (prev.heading + Math.floor(Math.random() * 15 - 7) + 360) % 360,
          lastPing: 'Just now',
          trail: [...prev.trail.slice(-12), [newLat, newLng]]
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingPatrol]);

  const value = {
    incidents,
    rover,
    notifications,
    shelters,
    viewMode,
    selectedIncident,
    filterSeverity,
    filterStatus,
    filterCategory,
    searchQuery,
    isSimulatingPatrol,
    audioAlertsEnabled,
    unreadNotificationsCount,
    focusedCoordinates,
    setViewMode,
    setSelectedIncident,
    setFilterSeverity,
    setFilterStatus,
    setFilterCategory,
    setSearchQuery,
    setFocusedCoordinates,
    toggleAudioAlerts,
    toggleSimulatePatrol,
    updateIncidentStatus,
    updateIncidentDetails,
    simulateRoverObservation,
    triggerEmergencyAlertBroadcast,
    submitCitizenReport,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToDefaultData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
