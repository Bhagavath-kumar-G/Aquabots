import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import type { Incident } from '../../types';
import { 
  Compass, 
  Layers, 
  Droplets
} from 'lucide-react';

interface IncidentMapProps {
  onSelectIncident?: (incident: Incident) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({ onSelectIncident }) => {
  const { t } = useTranslation();
  const { 
    incidents, 
    rover, 
    filterSeverity, 
    focusedCoordinates, 
    setFocusedCoordinates,
    setSelectedIncident 
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const roverMarkerRef = useRef<L.Marker | null>(null);
  const roverTrailLayerRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'streets' | 'dark' | 'satellite'>('streets');
  const [showFloodHazardZones, setShowFloodHazardZones] = useState<boolean>(true);
  const floodZonesLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter incidents for map display
  const displayedIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (filterSeverity !== 'All' && inc.severity !== filterSeverity) return false;
      return true;
    });
  }, [incidents, filterSeverity]);

  // Tile layers config
  const TILE_URLS = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const TILE_ATTRIBUTIONS = {
    streets: '&copy; OpenStreetMap contributors',
    dark: '&copy; CARTO &copy; OpenStreetMap contributors',
    satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = [12.998, 80.222]; // Central hub for Velachery - Adyar
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false
      });

      // Add Zoom Control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Default Tile Layer
      const tile = L.tileLayer(TILE_URLS.streets, {
        attribution: TILE_ATTRIBUTIONS.streets,
        maxZoom: 19
      }).addTo(map);
      tileLayerRef.current = tile;

      // Layer groups
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      const floodZones = L.layerGroup().addTo(map);
      floodZonesLayerRef.current = floodZones;

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

  // Render Flood Hazard Inundation Zones (Low-lying river basin polygons)
  useEffect(() => {
    if (!floodZonesLayerRef.current) return;
    floodZonesLayerRef.current.clearLayers();

    if (!showFloodHazardZones) return;

    // Simulated Adyar River basin & Velachery low depression inundation warning polygons
    const adyarBasin = L.polygon([
      [12.9940, 80.2310],
      [12.9890, 80.2390],
      [12.9820, 80.2450],
      [12.9800, 80.2380],
      [12.9880, 80.2280]
    ], {
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.18,
      weight: 1.5,
      dashArray: '4, 4'
    }).bindTooltip('⚠️ Inundation Risk Zone: Adyar River Basin (Flash Runoff Zone)', { sticky: true });

    const velacheryDepression = L.polygon([
      [12.9850, 80.2130],
      [12.9730, 80.2150],
      [12.9720, 80.2280],
      [12.9830, 80.2250]
    ], {
      color: '#ef4444',
      fillColor: '#f87171',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '3, 3'
    }).bindTooltip('🚨 Severe Waterlogging Basin: Velachery Lowlands (Depth Risk > 1.2m)', { sticky: true });

    floodZonesLayerRef.current.addLayer(adyarBasin);
    floodZonesLayerRef.current.addLayer(velacheryDepression);
  }, [showFloodHazardZones]);


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
    } else if (incident.category === 'Submerged Vehicle') {
      iconSvg = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>`;
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
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    displayedIncidents.forEach(incident => {
      const marker = L.marker([incident.lat, incident.lng], {
        icon: getMarkerIcon(incident),
        title: incident.title
      });

      // Construct rich disaster response popup
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`;
      const severityColor = 
        incident.severity === 'Critical' ? 'bg-red-500 text-white' :
        incident.severity === 'High' ? 'bg-amber-500 text-white' :
        incident.severity === 'Medium' ? 'bg-sky-500 text-white' : 'bg-emerald-600 text-white';

      const statusColor = 
        incident.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
        incident.status === 'Response in Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
        incident.status === 'Acknowledged' ? 'bg-amber-100 text-amber-800 border-amber-300' :
        'bg-rose-100 text-rose-800 border-rose-300';

      const transSeverity = t(`severity.${incident.severity}`, incident.severity);
      const transStatus = t(`status.${incident.status}`, incident.status);

      const popupHtml = `
        <div class="w-72 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 font-sans">
          <div class="relative h-28 bg-slate-900 overflow-hidden">
            <img src="${incident.imageUrl}" alt="${incident.title}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
            <div class="absolute top-2 left-2 flex gap-1.5 items-center">
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${severityColor} shadow">
                ${transSeverity}
              </span>
              <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md border ${statusColor}">
                ${transStatus}
              </span>
            </div>
            <div class="absolute bottom-2 left-2 right-2 text-white">
              <div class="text-[11px] font-medium text-cyan-300 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                ${incident.source}
              </div>
              <h4 class="text-xs font-bold leading-tight truncate text-slate-100">${incident.title}</h4>
            </div>
          </div>

          <div class="p-3 text-slate-700 text-xs space-y-2">
            <p class="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">${incident.description}</p>
            
            <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
              <div>
                <span class="text-slate-400 block text-[9px] uppercase tracking-wider">${t('map.waterDepth', 'Water Depth')}</span>
                <span class="font-bold text-sky-700 flex items-center gap-1">
                  🌊 ${incident.waterDepthMeters.toFixed(2)} m
                </span>
              </div>
              <div>
                <span class="text-slate-400 block text-[9px] uppercase tracking-wider">${t('map.stranded', 'Stranded')}</span>
                <span class="font-bold ${incident.trappedCount > 0 ? 'text-red-600' : 'text-slate-700'} flex items-center gap-1">
                  👥 ${incident.trappedCount > 0 ? `${incident.trappedCount} ${t('incidents.persons', { count: incident.trappedCount, defaultValue: 'Persons' })}` : t('map.noneReported', 'None reported')}
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
              <span class="truncate font-mono">${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)}</span>
              <span class="text-slate-400 font-medium">${incident.reportedAt}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <a 
                href="${googleMapsUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-[11px] transition"
              >
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                ${t('map.googleMaps', 'Google Maps')}
              </a>
              <button 
                id="popup-inspect-btn-${incident.id}"
                class="flex items-center justify-center gap-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg text-[11px] transition shadow-sm"
              >
                ${t('map.inspectSop', 'Inspect SOP')}
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

  // Render Rover Marker with radar beacon & breadcrumb trail
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Custom Rover Icon
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

    const roverPopup = `
      <div class="w-64 p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-cyan-500/40 font-sans text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-bold text-cyan-300 text-xs">${rover.name}</span>
          </div>
          <span class="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono border border-cyan-800">
            ${rover.status}
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-[11px] mb-2">
          <div class="bg-slate-800/70 p-1.5 rounded">
            <span class="text-slate-400 block text-[9px]">Battery</span>
            <span class="font-bold text-emerald-400">⚡ ${rover.battery}%</span>
          </div>
          <div class="bg-slate-800/70 p-1.5 rounded">
            <span class="text-slate-400 block text-[9px]">Sensor Depth</span>
            <span class="font-bold text-sky-400">🌊 ${rover.waterDepthSensor.toFixed(2)} m</span>
          </div>
          <div class="bg-slate-800/70 p-1.5 rounded">
            <span class="text-slate-400 block text-[9px]">Speed</span>
            <span class="font-bold text-slate-200">🚀 ${rover.speedKmh} km/h</span>
          </div>
          <div class="bg-slate-800/70 p-1.5 rounded">
            <span class="text-slate-400 block text-[9px]">Signal / RTK</span>
            <span class="font-bold text-cyan-400">📡 ${rover.signalStrength}% Fix</span>
          </div>
        </div>
        <div class="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800 pt-1.5">
          <span>${rover.lat.toFixed(5)}°N, ${rover.lng.toFixed(5)}°E</span>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${rover.lat},${rover.lng}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-cyan-400 hover:underline flex items-center gap-0.5 font-sans"
          >
            Google Maps <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        </div>
      </div>
    `;

    if (!roverMarkerRef.current) {
      const marker = L.marker([rover.lat, rover.lng], {
        icon: roverIcon,
        zIndexOffset: 1000
      }).bindPopup(roverPopup);
      marker.addTo(map);
      roverMarkerRef.current = marker;
    } else {
      roverMarkerRef.current.setLatLng([rover.lat, rover.lng]);
      roverMarkerRef.current.setIcon(roverIcon);
      roverMarkerRef.current.setPopupContent(roverPopup);
    }

    // Update Rover Trail polyline
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
    mapInstanceRef.current.flyTo(focusedCoordinates, 15, {
      duration: 1.2
    });
    // Reset focusedCoordinates after panning
    setFocusedCoordinates(null);
  }, [focusedCoordinates, setFocusedCoordinates]);

  // Action helpers
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
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg bg-slate-900 group">
      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Map Header & Quick Controls */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Badge: Live Operational GIS */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-xl text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-xs font-bold tracking-tight">{t('map.tacticalMap', 'DrainPulse Tactical Culvert Map')}</span>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
            {t('map.markersActive', { count: displayedIncidents.length, defaultValue: `${displayedIncidents.length} Markers Active` })}
          </span>
        </div>

        {/* Right Controls: Map Layer + Center Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-xl">
          {/* Layer switcher */}
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

          {/* Toggle Flood Hazard Zones */}
          <button
            onClick={() => setShowFloodHazardZones(!showFloodHazardZones)}
            title="Toggle Low-Lying River Inundation Overlay"
            className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              showFloodHazardZones 
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{t('map.floodIngress', 'Flood Ingress')}</span>
          </button>

          {/* Focus Rover */}
          <button
            onClick={handleFocusRover}
            title="Pan to AquaRover Position"
            className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('map.roverMarkIV', 'Rover Mark-IV')}</span>
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

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/60 shadow-xl text-white text-[11px] flex items-center gap-3">
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">{t('map.severity', 'Severity')}:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm shadow-red-500"></span>
          <span className="font-medium text-red-300">{t('map.critical', 'Critical')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-400"></span>
          <span className="font-medium text-amber-300">{t('map.high', 'High')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-400"></span>
          <span className="font-medium text-sky-300">{t('map.medium', 'Medium')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400"></span>
          <span className="font-medium text-emerald-300">{t('map.lowClear', 'Low / Clear')}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-700">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
          <span className="text-cyan-300 font-mono text-[10px]">🤖 {t('map.autonomousRover', 'Autonomous Rover')}</span>
        </div>
      </div>

    </div>
  );
};
