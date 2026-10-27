import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import type { Incident, RoadClosureItem, PanchayatRiskZone } from '../../types';
import { 
  Compass, 
  Layers, 
  Droplets,
  AlertTriangle,
  X,
  Navigation
} from 'lucide-react';

interface IncidentMapProps {
  onSelectIncident?: (incident: Incident) => void;
}

// Configurable Panchayat Risk Zones (Scored by transparent environmental & incident rules)
const PANCHAYAT_RISK_ZONES: PanchayatRiskZone[] = [
  {
    id: 'PRZ-01',
    name: 'Velachery South Inundation Basin',
    ward: 'Ward 12 (South Basin)',
    riskLevel: 'Severe',
    rainfallMmHr: 48.0,
    waterLevelMeters: 0.85,
    activeIncidentsCount: 3,
    drainageCapacityPct: 35,
    dataSource: 'TN SDMA Inflow Gauge & AquaBots IoT Node #2',
    lastUpdated: '10 mins ago',
    scoringReasons: [
      'Monsoon rainfall exceeds 40 mm/hr threshold (+35 pts)',
      'Culvert water level is at 0.85m (>0.7m critical limit) (+30 pts)',
      'Multiple unverified and active blockage complaints in queue (+20 pts)'
    ],
    disclaimer: 'Transparent rule-based scoring calculated from active sensor readings and incident reports. Never presented as an unvalidated blackbox prediction model.',
    coordinates: [
      [12.9850, 80.2130],
      [12.9730, 80.2150],
      [12.9720, 80.2280],
      [12.9830, 80.2250]
    ]
  },
  {
    id: 'PRZ-02',
    name: 'Adyar River Outflow Corridor',
    ward: 'Ward 14 (Canal Division)',
    riskLevel: 'High',
    rainfallMmHr: 42.0,
    waterLevelMeters: 0.72,
    activeIncidentsCount: 2,
    drainageCapacityPct: 45,
    dataSource: 'Public Works Dept Sluice Sensor + AquaRover Mark-IV',
    lastUpdated: '5 mins ago',
    scoringReasons: [
      'High rainfall rate (42 mm/hr) approaching canal crest (+25 pts)',
      'Water level elevated to 0.72m (+25 pts)',
      'Arterial causeway road adjacent to riverbank (+24 pts)'
    ],
    disclaimer: 'Transparent rule-based scoring calculated from active sensor readings and incident reports. Never presented as an unvalidated blackbox prediction model.',
    coordinates: [
      [12.9940, 80.2310],
      [12.9890, 80.2390],
      [12.9820, 80.2450],
      [12.9800, 80.2380],
      [12.9880, 80.2280]
    ]
  },
  {
    id: 'PRZ-03',
    name: 'Madipakkam Lake Peripheral Drains',
    ward: 'Ward 10 (East Ward)',
    riskLevel: 'Moderate',
    rainfallMmHr: 26.0,
    waterLevelMeters: 0.40,
    activeIncidentsCount: 1,
    drainageCapacityPct: 65,
    dataSource: 'Panchayat Rural Weather Station A',
    lastUpdated: '15 mins ago',
    scoringReasons: [
      'Moderate rainfall (26 mm/hr) with steady culvert outflow (+15 pts)',
      'Water level at 0.40m below danger mark (+15 pts)',
      'One broken culvert grating reported near PHC (+18 pts)'
    ],
    disclaimer: 'Transparent rule-based scoring calculated from active sensor readings and incident reports. Never presented as an unvalidated blackbox prediction model.',
    coordinates: [
      [12.9650, 80.1980],
      [12.9580, 80.2030],
      [12.9550, 80.2150],
      [12.9680, 80.2110]
    ]
  }
];

export const IncidentMap: React.FC<IncidentMapProps> = ({ onSelectIncident }) => {
  const { t } = useTranslation();
  const { 
    incidents, 
    rover, 
    filterSeverity, 
    focusedCoordinates, 
    setFocusedCoordinates,
    setSelectedIncident,
    setViewMode
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const roverMarkerRef = useRef<L.Marker | null>(null);
  const roverTrailLayerRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const floodZonesLayerRef = useRef<L.LayerGroup | null>(null);
  const roadClosuresLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<'streets' | 'dark' | 'satellite'>('streets');
  const [showFloodHazardZones, setShowFloodHazardZones] = useState<boolean>(true);
  const [showRoadClosures, setShowRoadClosures] = useState<boolean>(true);
  const [selectedRiskZone, setSelectedRiskZone] = useState<PanchayatRiskZone | null>(null);
  const [selectedRoadClosure, setSelectedRoadClosure] = useState<RoadClosureItem | null>(null);
  const [roadClosures, setRoadClosures] = useState<RoadClosureItem[]>([]);

  // Filter incidents for map display
  const displayedIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (filterSeverity !== 'All' && inc.severity !== filterSeverity) return false;
      return true;
    });
  }, [incidents, filterSeverity]);

  // Load road closures from backend API with offline fallback
  useEffect(() => {
    async function loadClosures() {
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
    }
    loadClosures();
  }, []);

  // Tile layers config
  const TILE_URLS = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const TILE_ATTRIBUTIONS = {
    streets: '&copy; OpenStreetMap contributors',
    dark: '&copy; CARTO &copy; OpenStreetMap contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [12.988, 80.222]; // Velachery - Adyar hub
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const tile = L.tileLayer(TILE_URLS.streets, {
        attribution: TILE_ATTRIBUTIONS.streets,
        maxZoom: 19
      }).addTo(map);
      tileLayerRef.current = tile;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      const floodZones = L.layerGroup().addTo(map);
      floodZonesLayerRef.current = floodZones;

      const roadClosuresLayer = L.layerGroup().addTo(map);
      roadClosuresLayerRef.current = roadClosuresLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const newTile = L.tileLayer(TILE_URLS[mapStyle], {
      attribution: TILE_ATTRIBUTIONS[mapStyle],
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapStyle]);

  // Render Panchayat Risk Rating Zones Layer
  useEffect(() => {
    if (!floodZonesLayerRef.current) return;
    floodZonesLayerRef.current.clearLayers();

    if (!showFloodHazardZones) return;

    PANCHAYAT_RISK_ZONES.forEach(zone => {
      const color = zone.riskLevel === 'Severe' 
        ? '#ef4444' 
        : zone.riskLevel === 'High' 
        ? '#f59e0b' 
        : '#0284c7';

      const poly = L.polygon(zone.coordinates, {
        color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: zone.riskLevel === 'Severe' ? '3, 3' : '4, 4'
      });

      poly.bindTooltip(`
        <div class="font-sans text-xs">
          <strong>${zone.name}</strong><br/>
          Risk Level: <span class="font-bold uppercase" style="color: ${color}">${zone.riskLevel}</span><br/>
          Rainfall: ${zone.rainfallMmHr} mm/hr • Depth: ${zone.waterLevelMeters}m
        </div>
      `, { sticky: true });

      poly.on('click', () => {
        setSelectedRiskZone(zone);
      });

      floodZonesLayerRef.current?.addLayer(poly);
    });
  }, [showFloodHazardZones]);

  // Render Road Closures & Safe Route Hazards Layer
  useEffect(() => {
    if (!roadClosuresLayerRef.current) return;
    roadClosuresLayerRef.current.clearLayers();

    if (!showRoadClosures) return;

    roadClosures.forEach(closure => {
      const isOfficial = closure.verificationStatus === 'Official';
      const isUnverified = closure.verificationStatus === 'Unverified';

      const markerColor = isOfficial ? 'bg-red-600' : isUnverified ? 'bg-amber-500' : 'bg-slate-500';
      const statusLabel = isOfficial ? 'OFFICIAL ROAD CLOSURE' : isUnverified ? 'UNVERIFIED HAZARD REPORT' : 'EXPIRED REPORT';

      const closureIcon = L.divIcon({
        className: 'custom-closure-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer" title="${statusLabel}">
            <div class="w-7 h-7 rounded-full ${markerColor} text-white flex items-center justify-center border-2 border-white shadow-lg">
              ${isOfficial 
                ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>'
                : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
              }
            </div>
            <div class="absolute -top-5 whitespace-nowrap px-1.5 py-0.2 bg-slate-900/90 text-[9px] font-bold text-white rounded border border-slate-700">
              ${isOfficial ? '⛔ Closed' : '⚠️ Unverified'}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(closure.coordinates, { icon: closureIcon });
      marker.on('click', () => setSelectedRoadClosure(closure));
      roadClosuresLayerRef.current?.addLayer(marker);
    });
  }, [showRoadClosures, roadClosures]);

  // Helper to build marker HTML
  const getMarkerIcon = (incident: Incident) => {
    let colorClass = 'bg-emerald-500 border-white text-white shadow-emerald-500/50';
    let pulseHtml = '';
    let iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;

    if (incident.severity === 'Critical') {
      colorClass = 'bg-red-600 border-white text-white shadow-red-600/60';
      pulseHtml = `<div class="pulse-critical"></div>`;
    } else if (incident.severity === 'High') {
      colorClass = 'bg-amber-500 border-white text-white shadow-amber-500/50';
      pulseHtml = `<div class="pulse-high"></div>`;
    } else if (incident.severity === 'Medium') {
      colorClass = 'bg-sky-500 border-white text-white shadow-sky-500/40';
    } else {
      colorClass = 'bg-emerald-500 border-white text-white shadow-emerald-500/30';
    }

    if (incident.category === 'Trapped Citizens') {
      iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`;
    } else if (incident.category === 'Electrical Hazard') {
      iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
    }

    return L.divIcon({
      className: 'custom-incident-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          ${pulseHtml}
          <div class="w-8 h-8 rounded-full border-2 ${colorClass} flex items-center justify-center shadow-lg transform transition hover:scale-125 z-20">
            ${iconSvg}
          </div>
          <div class="absolute -bottom-1 -right-1 px-1 py-0.2 text-[9px] font-black rounded ${
            incident.status === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-cyan-300'
          } border border-slate-700 shadow z-30">
            ${incident.severity[0]}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });
  };

  // Render Incident Markers and Popups
  useEffect(() => {
    if (!markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    displayedIncidents.forEach((incident) => {
      const marker = L.marker([incident.lat, incident.lng], {
        icon: getMarkerIcon(incident)
      });

      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`;
      const severityColor = incident.severity === 'Critical' ? 'bg-red-600 text-white' : incident.severity === 'High' ? 'bg-amber-500 text-white' : 'bg-sky-600 text-white';

      const popupHtml = `
        <div class="w-72 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 font-sans">
          <div class="relative h-28 bg-slate-900 overflow-hidden">
            <img src="${incident.imageUrl}" alt="${incident.title}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
            <div class="absolute top-2 left-2 flex gap-1.5 items-center">
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${severityColor} shadow">
                ${incident.severity}
              </span>
              <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md border bg-slate-800 text-white">
                ${incident.status}
              </span>
            </div>
            <div class="absolute bottom-2 left-2 right-2 text-white">
              <h4 class="text-xs font-bold leading-tight truncate text-slate-100">${incident.title}</h4>
              <span class="text-[10px] text-cyan-300 font-mono">${incident.locationName}</span>
            </div>
          </div>

          <div class="p-3 text-slate-700 text-xs space-y-2">
            <p class="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">${incident.description}</p>
            
            <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
              <div>
                <span class="text-slate-400 block text-[9px] uppercase tracking-wider">Water Depth</span>
                <span class="font-bold text-sky-700">🌊 ${incident.waterDepthMeters.toFixed(2)} m</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase tracking-wider">Priority</span>
                <span class="font-bold text-slate-800 font-mono">${incident.dispatchPriorityScore}/100</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <a 
                href="${googleMapsUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-[11px] transition"
              >
                Google Maps
              </a>
              <button 
                id="popup-inspect-btn-${incident.id}"
                class="flex items-center justify-center gap-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg text-[11px] transition shadow-sm"
              >
                Inspect SOP
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-inspect-btn-${incident.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectIncident) {
              onSelectIncident(incident);
            } else {
              setSelectedIncident(incident);
            }
          };
        }
      });

      layer.addLayer(marker);
    });
  }, [displayedIncidents, onSelectIncident, setSelectedIncident]);

  // Render Rover Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const roverIcon = L.divIcon({
      className: 'custom-rover-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute w-12 h-12 rounded-full border-2 border-cyan-400/60 bg-cyan-500/10 animate-ping"></div>
          <div class="w-10 h-10 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-2xl z-30">
            <svg class="w-5 h-5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
          <div class="absolute -top-6 whitespace-nowrap bg-slate-900/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/40 shadow-lg backdrop-blur-sm z-30">
            🤖 ${rover.name.split(' ')[0]} (${rover.battery}%)
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22]
    });

    if (!roverMarkerRef.current) {
      const marker = L.marker([rover.lat, rover.lng], {
        icon: roverIcon,
        zIndexOffset: 1000
      }).bindPopup(`
        <div class="p-2 bg-slate-900 text-white rounded text-xs font-sans">
          <strong>${rover.name}</strong><br/>
          Depth Sensor: ${rover.waterDepthSensor.toFixed(2)}m • Battery: ${rover.battery}%
        </div>
      `);
      marker.addTo(map);
      roverMarkerRef.current = marker;
    } else {
      roverMarkerRef.current.setLatLng([rover.lat, rover.lng]);
    }

    if (rover.trail && rover.trail.length > 1) {
      if (!roverTrailLayerRef.current) {
        roverTrailLayerRef.current = L.polyline(rover.trail, {
          color: '#06b6d4',
          weight: 3.5,
          opacity: 0.7,
          dashArray: '6, 6'
        }).addTo(map);
      } else {
        roverTrailLayerRef.current.setLatLngs(rover.trail);
      }
    }
  }, [rover]);

  // Handle Pan / Focus requests
  useEffect(() => {
    if (!focusedCoordinates || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(focusedCoordinates, 15, { duration: 1.2 });
    setFocusedCoordinates(null);
  }, [focusedCoordinates, setFocusedCoordinates]);

  const handleFocusRover = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([rover.lat, rover.lng], 16, { duration: 1 });
    }
  };

  const handleFitAllIncidents = () => {
    if (!mapInstanceRef.current || incidents.length === 0) return;
    const bounds = L.latLngBounds(incidents.map(i => [i.lat, i.lng]));
    bounds.extend([rover.lat, rover.lng]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg bg-slate-900 group">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Map Header & Quick Controls */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-xl text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xs font-bold tracking-tight">{t('dashboard.tacticalMap', 'Drain Plus Tactical Culvert Map')}</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
            {displayedIncidents.length} {t('map.markersActive', 'Hazards Active')}
          </span>
        </div>

        {/* Layer Controls & Ambulance Shortcut */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-xl">
          {/* Ambulance Routing Shortcut Button */}
          <button
            onClick={() => setViewMode('ambulance')}
            title={t('map.planAmbulanceRoute', 'Plan Ambulance Route')}
            className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.ambulanceRoute', 'Ambulance Route')}</span>
          </button>

          {/* Tile layer switcher */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                mapStyle === 'streets' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'hover:text-white'
              }`}
            >
              {t('map.street', 'Street')}
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                mapStyle === 'dark' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'hover:text-white'
              }`}
            >
              {t('map.tactical', 'Tactical')}
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                mapStyle === 'satellite' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'hover:text-white'
              }`}
            >
              {t('map.satellite', 'Satellite')}
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>

          {/* Toggle Panchayat Risk Zones */}
          <button
            onClick={() => setShowFloodHazardZones(!showFloodHazardZones)}
            title="Toggle Panchayat Flood Risk Zones"
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              showFloodHazardZones 
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{t('map.floodIngress', 'Risk Zones')}</span>
          </button>

          {/* Toggle Road Closures & Safe Routes */}
          <button
            onClick={() => setShowRoadClosures(!showRoadClosures)}
            title="Toggle Road Closures & Safe Route Hazards"
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              showRoadClosures 
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{t('map.officialClosure', 'Closures')}</span>
          </button>

          {/* Focus Rover */}
          <button
            onClick={handleFocusRover}
            title="Pan to Rover Position"
            className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('map.roverMarkIV', 'Rover RP-1')}</span>
          </button>

          {/* Fit Bounds */}
          <button
            onClick={handleFitAllIncidents}
            title={t('map.fitAll', 'Fit All Hazards in View')}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Panchayat Risk Zone Details Card */}
      {selectedRiskZone && (
        <div className="absolute top-16 left-3 z-[500] max-w-sm bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl text-white text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                selectedRiskZone.riskLevel === 'Severe' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {selectedRiskZone.riskLevel} Risk Zone
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedRiskZone.ward}</span>
            </div>
            <button 
              onClick={() => setSelectedRiskZone(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-bold text-sm text-white">{selectedRiskZone.name}</h4>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/60 p-2 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[9px]">Rainfall Intensity</span>
              <span className="font-bold text-sky-400">🌧️ {selectedRiskZone.rainfallMmHr} mm/hr</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Culvert Water Level</span>
              <span className="font-bold text-cyan-400">🌊 {selectedRiskZone.waterLevelMeters} m</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Drainage Runoff Capacity</span>
              <span className="font-bold text-amber-400">{selectedRiskZone.drainageCapacityPct}% capacity</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">Active Inundation Reports</span>
              <span className="font-bold text-red-400">{selectedRiskZone.activeIncidentsCount} queued</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Configurable Scoring Rules Provenance:
            </span>
            <ul className="space-y-0.5 text-[10px] text-slate-300 list-disc list-inside">
              {selectedRiskZone.scoringReasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-400 space-y-1">
            <p><strong>Data Source:</strong> {selectedRiskZone.dataSource} (Updated: {selectedRiskZone.lastUpdated})</p>
            <p className="italic text-slate-400 leading-tight">
              ⚠️ {selectedRiskZone.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Selected Road Closure Details Card */}
      {selectedRoadClosure && (
        <div className="absolute top-16 right-3 z-[500] max-w-sm bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl text-white text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              selectedRoadClosure.verificationStatus === 'Official' 
                ? 'bg-red-600 text-white' 
                : 'bg-amber-500 text-white'
            }`}>
              {selectedRoadClosure.verificationStatus} Closure Alert
            </span>
            <button 
              onClick={() => setSelectedRoadClosure(null)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-bold text-sm text-white">{selectedRoadClosure.roadName}</h4>
          <p className="text-[11px] text-slate-300">{selectedRoadClosure.reason}</p>

          <div className="p-2.5 bg-slate-800/70 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
              Recommended Alternative Detour:
            </span>
            <p className="text-[11px] text-emerald-300 font-medium">
              ↪️ {selectedRoadClosure.recommendedDetour || 'Use main highway arterial corridor'}
            </p>
          </div>

          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-300 leading-tight">
            <strong>{t('map.routingNotice', 'Routing Safety Notice: Never claim a route is safe based only on an unverified complaint. Confirmed bypass routes require field officer validation.')}</strong>
          </div>
        </div>
      )}

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700/60 shadow-xl text-white text-[11px] flex flex-wrap items-center gap-3">
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">{t('map.severity', 'Hazards:')}</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="font-medium text-red-300">{t('severity.Critical', 'Critical')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-medium text-amber-300">{t('severity.High', 'High')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
          <span className="font-medium text-sky-300">{t('severity.Medium', 'Medium')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-emerald-300">{t('status.Resolved', 'Resolved')}</span>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-700 text-[10px]">
          <span className="text-rose-400 font-bold">⛔ {t('map.officialClosure', 'Official Closure')}</span>
          <span className="text-amber-400 font-bold">⚠️ {t('map.unverifiedHazard', 'Unverified Hazard')}</span>
          <span className="text-cyan-300 font-mono">🤖 {t('map.roverActive', 'Rover Active')}</span>
        </div>
      </div>
    </div>
  );
};
