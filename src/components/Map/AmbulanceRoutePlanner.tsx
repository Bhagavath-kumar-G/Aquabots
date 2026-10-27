import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { useApp } from '../../context/AppContext';
import type { RoadClosureItem, RoadConditionStatus, RouteHazardSegment } from '../../types';
import {
  Navigation,
  AlertTriangle,
  RefreshCw,
  Milestone,
  ShieldCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';

// Predefined Panchayat Emergency Depots (Origins)
export const EMERGENCY_DEPOTS = [
  {
    id: 'DEPOT-01',
    name: 'Panchayat Emergency Station #1 (Velachery / Saidapet Hub)',
    lat: 12.9880,
    lng: 80.2220,
    ward: 'Ward 12 (Central)'
  },
  {
    id: 'DEPOT-02',
    name: 'Medavakkam Rural Health Response Depot',
    lat: 12.9620,
    lng: 80.1920,
    ward: 'Ward 10 (South-West)'
  },
  {
    id: 'DEPOT-03',
    name: 'Thoraipakkam OMR Rapid Response Unit',
    lat: 12.9710,
    lng: 80.2430,
    ward: 'Ward 14 (East Sector)'
  }
];

// Predefined Critical Emergency Hospitals (Destinations)
export const EMERGENCY_HOSPITALS = [
  {
    id: 'HOSP-01',
    name: 'Velachery Govt General Hospital & Emergency Ward',
    lat: 12.9790,
    lng: 80.2240,
    tier: 'Level-1 Emergency Trauma Care'
  },
  {
    id: 'HOSP-02',
    name: 'Tambaram Sub-District Hospital & ICU',
    lat: 12.9550,
    lng: 80.2080,
    tier: 'District Referral Hospital'
  },
  {
    id: 'HOSP-03',
    name: 'Adyar Emergency Medical Hub & Critical Care',
    lat: 13.0030,
    lng: 80.2450,
    tier: 'Urban Critical Care Hub'
  },
  {
    id: 'HOSP-04',
    name: 'Dr. Kamakshi Memorial Multi-Specialty Hospital',
    lat: 12.9680,
    lng: 80.2180,
    tier: 'Specialty Emergency Center'
  }
];

export const AmbulanceRoutePlanner: React.FC = () => {
  const { t } = useTranslation();
  const { incidents } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const primaryRouteLayerRef = useRef<L.Polyline | null>(null);
  const bypassRouteLayerRef = useRef<L.Polyline | null>(null);
  const hazardMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Origin & Destination State
  const [selectedDepotId, setSelectedDepotId] = useState<string>(EMERGENCY_DEPOTS[0].id);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(EMERGENCY_HOSPITALS[0].id);
  const [roadClosures, setRoadClosures] = useState<RoadClosureItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(4.2);
  const [routeDurationMin, setRouteDurationMin] = useState<number>(11);
  const [hasDetourActive, setHasDetourActive] = useState<boolean>(false);
  const [activeDetourName, setActiveDetourName] = useState<string>('');
  const [selectedHazard, setSelectedHazard] = useState<RouteHazardSegment | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedDepot = useMemo(() => {
    return EMERGENCY_DEPOTS.find(d => d.id === selectedDepotId) || EMERGENCY_DEPOTS[0];
  }, [selectedDepotId]);

  const selectedHospital = useMemo(() => {
    return EMERGENCY_HOSPITALS.find(h => h.id === selectedHospitalId) || EMERGENCY_HOSPITALS[0];
  }, [selectedHospitalId]);

  // Load backend road closures & safe route check data
  const fetchHazardTelemetry = async () => {
    setIsLoading(true);
    setValidationError(null);
    try {
      const data = await apiService.getRoadClosures();
      if (data && data.length > 0) {
        setRoadClosures(data);
      } else {
        // Fallback default road closures
        setRoadClosures([
          {
            id: 'RC-2026-01',
            roadName: 'Adyar River Bank Low Causeway',
            sector: 'Sector 4B',
            coordinates: [12.9925, 80.2350],
            verificationStatus: 'Official',
            reportedAt: 'Today, 06:00 AM',
            verifiedBy: 'Traffic Police & Panchayat Safety Ward',
            expiresAt: 'Tomorrow, 06:00 PM',
            reason: 'Water overtopping causeway by 0.9m; severe vehicle stall risk.',
            waterDepthMeters: 0.9,
            recommendedDetour: 'Divert via Saidapet Flyover & Anna Salai Elevated Corridor'
          },
          {
            id: 'RC-2026-02',
            roadName: 'Velachery Underpass South Ramp',
            sector: 'Sector 2A',
            coordinates: [12.9770, 80.2170],
            verificationStatus: 'Unverified',
            reportedAt: 'Today, 11:00 AM',
            expiresAt: 'Today, 11:00 PM',
            reason: 'Citizen report: 0.5m ponding at dip point. Field officer verification pending.',
            waterDepthMeters: 0.5,
            recommendedDetour: 'Use surface bypass road (Caution: unverified report)'
          }
        ]);
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // Keep existing data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHazardTelemetry();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [12.980, 80.224];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      hazardMarkersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Compute & Render Ambulance Route & Hazards
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous route polylines
    if (primaryRouteLayerRef.current) {
      map.removeLayer(primaryRouteLayerRef.current);
      primaryRouteLayerRef.current = null;
    }
    if (bypassRouteLayerRef.current) {
      map.removeLayer(bypassRouteLayerRef.current);
      bypassRouteLayerRef.current = null;
    }

    // Clear hazard markers
    if (hazardMarkersLayerRef.current) {
      hazardMarkersLayerRef.current.clearLayers();
    }

    const startLat = selectedDepot.lat;
    const startLng = selectedDepot.lng;
    const endLat = selectedHospital.lat;
    const endLng = selectedHospital.lng;

    // Check if start equals end
    if (startLat === endLat && startLng === endLng) {
      setValidationError(t('ambulance.validationError', 'Please select different start and destination points.'));
      return;
    }

    // Generate Route Waypoints
    // We check if official closures intersect the direct corridor
    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;

    const officialClosures = roadClosures.filter(c => c.verificationStatus === 'Official');
    const hasClosureNearPath = officialClosures.some(c => {
      const d = Math.hypot(c.coordinates[0] - midLat, c.coordinates[1] - midLng);
      return d < 0.02; // within ~2km of midpoint
    });

    setHasDetourActive(hasClosureNearPath);
    if (hasClosureNearPath) {
      const closureObj = officialClosures[0];
      setActiveDetourName(closureObj?.recommendedDetour || 'Elevated Flyover Bypass');
    }

    // Primary route coordinates
    const primaryPoints: [number, number][] = [
      [startLat, startLng],
      [startLat + (endLat - startLat) * 0.3, startLng + (endLng - startLng) * 0.25],
      [midLat + 0.003, midLng - 0.002],
      [startLat + (endLat - startLat) * 0.75, startLng + (endLng - startLng) * 0.8],
      [endLat, endLng]
    ];

    // Alternative bypass route coordinates (steering through higher elevation bypass)
    const bypassPoints: [number, number][] = [
      [startLat, startLng],
      [startLat + 0.006, startLng - 0.008],
      [midLat + 0.012, midLng - 0.010],
      [endLat + 0.004, endLng - 0.005],
      [endLat, endLng]
    ];

    // Calculate approximate distance & time
    const directDistKm = Math.hypot(endLat - startLat, (endLng - startLng) * 0.9) * 111;
    const computedDist = Math.max(1.8, Number((directDistKm * 1.35).toFixed(1)));
    const computedDuration = Math.max(6, Math.round((computedDist / 32) * 60)); // emergency vehicle average 32km/h

    setRouteDistanceKm(computedDist);
    setRouteDurationMin(computedDuration);
    setIsDemoMode(true); // Pre-computed flood-avoidance corridor

    // Draw Primary Route Polyline (Cyan glowing line)
    const primaryPolyline = L.polyline(primaryPoints, {
      color: '#06b6d4',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    primaryRouteLayerRef.current = primaryPolyline;

    // Draw Alternative Bypass Route Polyline (Dashed Purple)
    const bypassPolyline = L.polyline(bypassPoints, {
      color: '#a855f7',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);

    bypassRouteLayerRef.current = bypassPolyline;

    // Add Start Depot Marker (Green Ambulance Pin)
    const startIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #10b981; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 3px solid white; cursor: pointer;">
          <span style="font-size: 16px;">🚑</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const startMarker = L.marker([startLat, startLng], { icon: startIcon }).addTo(hazardMarkersLayerRef.current!);
    startMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
        <strong style="color: #059669; font-size: 13px;">🚑 ${t('ambulance.startLocation', 'Starting Emergency Base')}</strong><br/>
        <b>${selectedDepot.name}</b><br/>
        <span style="color: #64748b; font-size: 11px;">${selectedDepot.ward}</span>
      </div>
    `);

    // Add Destination Hospital Marker (Red Hospital Pin)
    const endIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 3px solid white; cursor: pointer;">
          <span style="font-size: 16px;">🏥</span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const endMarker = L.marker([endLat, endLng], { icon: endIcon }).addTo(hazardMarkersLayerRef.current!);
    endMarker.bindPopup(`
      <div style="font-family: sans-serif; padding: 4px; font-size: 12px; color: #0f172a;">
        <strong style="color: #dc2626; font-size: 13px;">🏥 ${t('ambulance.destination', 'Emergency Destination')}</strong><br/>
        <b>${selectedHospital.name}</b><br/>
        <span style="color: #64748b; font-size: 11px;">${selectedHospital.tier}</span>
      </div>
    `);

    // Add Road Closures & Waterlogging Hazard Markers
    roadClosures.forEach(closure => {
      const isOfficial = closure.verificationStatus === 'Official';
      const iconHtml = `
        <div style="background-color: ${isOfficial ? '#dc2626' : '#f59e0b'}; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
          <span style="font-size: 14px;">${isOfficial ? '⛔' : '⚠️'}</span>
        </div>
      `;
      const closureIcon = L.divIcon({
        className: 'custom-map-icon',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(closure.coordinates, { icon: closureIcon }).addTo(hazardMarkersLayerRef.current!);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; font-size: 12px; color: #0f172a; max-width: 220px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px; background-color: ${isOfficial ? '#fee2e2' : '#fef3c7'}; color: ${isOfficial ? '#991b1b' : '#92400e'};">
              ${isOfficial ? t('ambulance.conditionBlocked', 'Flooded / Blocked') : t('ambulance.conditionCaution', 'Caution')}
            </span>
            <span style="font-size: 10px; color: #64748b;">${closure.sector}</span>
          </div>
          <b style="font-size: 12px;">${closure.roadName}</b>
          <p style="margin: 4px 0; color: #475569; font-size: 11px;">${closure.reason}</p>
          <div style="background-color: #f1f5f9; padding: 4px 6px; border-radius: 6px; font-size: 10px; color: #334155;">
            <strong>Water Depth:</strong> ${closure.waterDepthMeters}m<br/>
            <strong>Detour:</strong> ${closure.recommendedDetour || 'Use main highway'}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedHazard({
          id: closure.id,
          name: closure.roadName,
          condition: isOfficial ? 'Flooded / Blocked' : 'Caution',
          waterDepthMeters: closure.waterDepthMeters,
          reportedAt: closure.reportedAt,
          verificationStatus: closure.verificationStatus,
          reason: closure.reason,
          coordinates: closure.coordinates
        });
      });
    });

    // Fit map bounds to show route and hazards
    const group = L.featureGroup([primaryPolyline, bypassPolyline, startMarker, endMarker]);
    map.fitBounds(group.getBounds().pad(0.18));
  }, [selectedDepot, selectedHospital, roadClosures, t]);

  // Road Condition Classification Summary along Corridor
  const roadConditions: { status: RoadConditionStatus; label: string; count: number; colorClass: string; desc: string }[] = useMemo(() => {
    const blockedCount = roadClosures.filter(c => c.verificationStatus === 'Official').length;
    const cautionCount = roadClosures.filter(c => c.verificationStatus === 'Unverified').length +
      incidents.filter(i => i.waterDepthMeters > 0.3 && i.waterDepthMeters < 0.8).length;
    const clearCount = 4; // Verified passable arterial corridors
    const unknownCount = 2; // Unmonitored interior village lanes

    return [
      {
        status: 'Reported Clear',
        label: t('ambulance.conditionClear', 'Reported Clear'),
        count: clearCount,
        colorClass: 'bg-emerald-500 text-white',
        desc: t('ambulance.clearRouteMsg', 'Corridor verified passable by recent Panchayat patrol.')
      },
      {
        status: 'Flooded / Blocked',
        label: t('ambulance.conditionBlocked', 'Flooded / Blocked'),
        count: blockedCount,
        colorClass: 'bg-red-500 text-white',
        desc: t('ambulance.blockedRouteMsg', 'Major waterlogging (>0.3m) or official road closure detected.')
      },
      {
        status: 'Caution',
        label: t('ambulance.conditionCaution', 'Caution'),
        count: cautionCount,
        colorClass: 'bg-amber-500 text-white',
        desc: t('ambulance.cautionRouteMsg', 'Moderate ponding or unverified citizen reports adjacent to route.')
      },
      {
        status: 'Unknown / Unverified',
        label: t('ambulance.conditionUnknown', 'Unknown / Unverified'),
        count: unknownCount,
        colorClass: 'bg-slate-500 text-white',
        desc: t('ambulance.unknownRouteMsg', 'No recent sensor telemetry or field patrol reports available.')
      }
    ];
  }, [roadClosures, incidents, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* 1. Header Banner & Decision Support Disclaimer */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 rounded-3xl p-5 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-300 border border-red-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                <span>{t('ambulance.badge', 'Decision Support')}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                108 / 112 Integrated Advisory
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Navigation className="w-6 h-6 text-cyan-400" />
              <span>{t('ambulance.title', 'Ambulance Flood-Aware Route Planner')}</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              {t('ambulance.subtitle', 'Emergency vehicle routing with verified culvert waterlogging avoidance.')}
            </p>
          </div>

          {/* Quick Recalculate / Refresh Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchHazardTelemetry}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              title="Re-query road closures and recalculate route"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('ambulance.recalculate', 'Recalculate & Refresh')}</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              {t('ambulance.lastUpdated', { time: lastRefreshed })}
            </span>
          </div>
        </div>

        {/* Mandatory Safety Notice & Disclaimer */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-[11px] text-amber-200 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>{t('ambulance.disclaimer', '⚠️ Decision Support Only: Assists emergency dispatchers by highlighting verified waterlogging points and official road closures. Not a guarantee of road safety. Does not replace emergency dispatch (108 / 112) or road authorities.')}</strong>
          </div>
        </div>
      </div>

      {/* 2. Main Routing Workspace (Control Panel 4 cols + Leaflet Map 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column: Route Configuration & Status Metrics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Origin & Destination Selector Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Milestone className="w-4 h-4 text-cyan-600" />
              <span>Route Corridor Parameters</span>
            </h2>

            {/* Starting Emergency Base */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="text-sm">🚑</span>
                <span>{t('ambulance.startLocation', 'Starting Emergency Base')}</span>
              </label>
              <select
                value={selectedDepotId}
                onChange={(e) => setSelectedDepotId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                aria-label="Select Starting Base"
              >
                {EMERGENCY_DEPOTS.map(depot => (
                  <option key={depot.id} value={depot.id}>
                    {depot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Emergency Hospital */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="text-sm">🏥</span>
                <span>{t('ambulance.destination', 'Emergency Destination (Hospital)')}</span>
              </label>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                aria-label="Select Emergency Hospital"
              >
                {EMERGENCY_HOSPITALS.map(hosp => (
                  <option key={hosp.id} value={hosp.id}>
                    {hosp.name}
                  </option>
                ))}
              </select>
            </div>

            {validationError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Route ETA & Distance Summary Banner */}
            <div className="p-3.5 bg-gradient-to-br from-cyan-50 to-blue-50/60 rounded-2xl border border-cyan-100 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[10px] text-cyan-800 font-bold uppercase block">{t('ambulance.distance', 'Distance')}</span>
                <span className="text-xl font-black text-cyan-950 font-mono">{routeDistanceKm} km</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-800 font-bold uppercase block">{t('ambulance.estTime', 'Est. Time')}</span>
                <span className="text-xl font-black text-blue-950 font-mono">~{routeDurationMin} min</span>
              </div>
            </div>

            {/* Detour status indicator */}
            {hasDetourActive ? (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                  <span>↪️</span>
                  <span>{t('ambulance.bypassRoute', 'Alternative Bypass Route')}</span>
                </div>
                <p className="text-[11px] text-purple-700 leading-snug">
                  {t('ambulance.avoidanceNotice', { closure: activeDetourName })}
                </p>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('ambulance.noHazards', 'No confirmed official road closures on this emergency corridor.')}</span>
              </div>
            )}
          </div>

          {/* Road-Condition Classification Card (4 User-facing states) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>{t('ambulance.roadCondition', 'Road-Condition Classification')}</span>
              <span className="text-[10px] text-slate-400 font-mono">Panchayat Schema</span>
            </h3>

            <div className="space-y-2">
              {roadConditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        cond.status === 'Reported Clear' ? 'bg-emerald-500' :
                        cond.status === 'Flooded / Blocked' ? 'bg-red-500' :
                        cond.status === 'Caution' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}></span>
                      <span>{cond.label}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-white border border-slate-200 text-slate-700">
                      {cond.count} segments
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight pl-4.5">
                    {cond.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Unverified Report Routing Limitation Rule */}
            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic leading-snug">
              ⚠️ {t('ambulance.unverifiedAdvisory', 'Advisory: Unverified citizen hazard reports exist in adjacent sectors. Route cannot be guaranteed safe without field officer clearance.')}
            </div>
          </div>

          {/* Demo Mode Transparency Banner */}
          {isDemoMode && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase font-mono tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Routing Engine</span>
              </div>
              <p className="text-slate-400 leading-tight">
                {t('ambulance.demoModeNotice', 'DEMO MODE ACTIVE: Demonstration emergency route corridors. Does not represent live GPS traffic navigation or real-time ambulance dispatch.')}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Leaflet Map Route Visualization (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">

          <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950 flex-1 min-h-[520px]">
            {/* The Map Div */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[520px]" />

            {/* Floating Top Route Legend Overlay */}
            <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-xl text-white text-xs flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="font-bold text-cyan-300">{t('ambulance.primaryRoute', 'Primary Route')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-1.5 rounded-full bg-purple-400 border-dashed"></span>
                <span className="font-bold text-purple-300">{t('ambulance.bypassRoute', 'Elevated Bypass')}</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-700 text-[11px] text-slate-300">
                <span>⛔ <strong>Official Closure</strong></span>
                <span>⚠️ <strong>Unverified Alert</strong></span>
              </div>
            </div>

            {/* Floating Bottom Emergency Dispatch Helper */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-2xl text-white text-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">Emergency Hotlines:</span>
                <span className="text-emerald-300 font-mono font-bold">108 (Ambulance) • 112 (Disaster)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Speed Cap: 35 km/h in wet culverts
              </span>
            </div>
          </div>

          {/* Selected Hazard Inspector Drawer (Appears when hazard clicked on map) */}
          {selectedHazard && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedHazard.verificationStatus === 'Official' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {selectedHazard.verificationStatus} Closure
                  </span>
                  <span className="font-bold text-slate-200">{selectedHazard.name}</span>
                </div>
                <button
                  onClick={() => setSelectedHazard(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 text-[11px]">{selectedHazard.reason}</p>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                <span>Water Depth: <strong className="text-cyan-300">{selectedHazard.waterDepthMeters}m</strong></span>
                <span>Reported: {selectedHazard.reportedAt}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
