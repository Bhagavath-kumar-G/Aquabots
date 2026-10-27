import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { DEMO_SCENARIOS } from '../../data/mockData';
import {
  Camera,
  Battery,
  Wifi,
  Radio,
  Play,
  Pause,
  Sparkles,
  Cpu,
  Flame,
  Radar,
  Ruler,
  AlertCircle
} from 'lucide-react';

interface SensorItem {
  deviceId: string;
  sensorType: string;
  latestReading: number;
  unit: string;
  health: 'Optimal' | 'Degraded' | 'Offline' | 'Calibrating';
  location: { name: string; drainSector: string };
  isSimulated: boolean;
}

export type RoverFeedMode = 'optical' | 'thermal' | 'echo' | 'gauge';

export const RoverMonitor: React.FC = () => {
  const { t } = useTranslation();
  const {
    rover,
    isSimulatingPatrol,
    toggleSimulatePatrol,
    simulateRoverObservation
  } = useApp();

  const [feedMode, setFeedMode] = useState<RoverFeedMode>('optical');
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);

  // IoT Sensor Telemetry & Simulator State
  const [sensorsList, setSensorsList] = useState<SensorItem[]>([
    {
      deviceId: 'IOT-ROVER-01',
      sensorType: 'ultrasonic_obstacle',
      latestReading: 0.56,
      unit: 'm clearance',
      health: 'Optimal',
      location: {
        name: t('rover.obstacleSensorTitle', 'Forward Obstacle Sensor') + ' (₹80–₹200)',
        drainSector: 'Front Bumper'
      },
      isSimulated: true
    },
    {
      deviceId: 'IOT-TEST-02',
      sensorType: 'water_level_probe',
      latestReading: 0.28,
      unit: 'm depth',
      health: 'Optimal',
      location: {
        name: t('rover.waterLevelTitle', 'Water-Level Sensing') + ' (₹250–₹800)',
        drainSector: 'Controlled Flume Rig'
      },
      isSimulated: true
    },
    {
      deviceId: 'IOT-POWER-03',
      sensorType: 'battery_rail',
      latestReading: 7.4,
      unit: 'V (18650 Pack)',
      health: 'Optimal',
      location: { name: 'LM2596 Regulated 5V Rail', drainSector: 'Power Bus' },
      isSimulated: true
    }
  ]);
  const [simNotice, setSimNotice] = useState<string | null>(null);

  // Trigger manual or selected scan
  const handleTriggerScan = (idx?: number) => {
    setIsScanning(true);
    setTimeout(() => {
      const created = simulateRoverObservation(idx !== undefined ? idx : selectedScenarioIdx);
      setIsScanning(false);
      const translatedSev = t(`severity.${created.severity}`, created.severity);
      setLastScanResult(t('rover.observationLogged', { title: created.title, severity: translatedSev }) || `Observation Logged: ${created.title} (${translatedSev})`);
      setTimeout(() => setLastScanResult(null), 5000);
    }, 700);
  };

  // IoT Simulator Trigger
  const handleTriggerSensorSimulation = async (scenario: 'flash_flood' | 'receding' | 'sensor_glitch') => {
    const res = await apiService.simulateSensorReading(scenario);
    if (res && res.data) {
      setSensorsList(prev => [
        {
          deviceId: res.data.deviceId,
          sensorType: res.data.sensorType,
          latestReading: res.data.reading,
          unit: res.data.unit,
          health: res.data.sensorHealth,
          location: res.data.location,
          isSimulated: true
        },
        ...prev.slice(0, 2)
      ]);
      setSimNotice(res.notice || 'SIMULATED DATA: Telemetry event logged with visible simulation label.');
    } else {
      // Local fallback simulation
      const reading = scenario === 'flash_flood' ? 1.65 : scenario === 'receding' ? 0.32 : 0.88;
      const health = scenario === 'sensor_glitch' ? 'Degraded' : 'Optimal';
      setSensorsList(prev => [
        {
          deviceId: 'IOT-SIMULATOR-01',
          sensorType: 'ultrasonic_depth',
          latestReading: reading,
          unit: 'm',
          health,
          location: { name: 'Simulated Culvert Point — Sector 3', drainSector: 'Sector 3' },
          isSimulated: true
        },
        ...prev.slice(0, 2)
      ]);
      setSimNotice('SIMULATED DATA: Telemetry reading recorded. Never presented as unvalidated live hardware.');
    }
    setTimeout(() => setSimNotice(null), 5000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden text-white">
      {/* 1. Rover Monitoring Header Bar (Cleanly aligned across Mobile, Tablet, Desktop) */}
      <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Rover Name & Operational Status */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute inset-0"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-500 relative"></div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 truncate">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Drain Plus RP-1 (ESP32-CAM)</span>
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wider">
                {t('rover.autonomous', 'Autonomous')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {t('rover.sector', { sector: 'Panchayat Sector 4 — Agricultural Canal & Ward Drains' })}
            </p>
          </div>
        </div>

        {/* Right: Telemetry Quick Pills (Battery, Wi-Fi, Patrolling Status) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Battery Percentage */}
          <div
            className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/70"
            title={t('rover.battery', 'Battery')}
          >
            <Battery className={`w-3.5 h-3.5 ${rover.battery > 30 ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="font-mono font-bold text-slate-200">{rover.battery}%</span>
          </div>

          {/* Wi-Fi Signal Strength */}
          <div
            className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/70"
            title={t('rover.signalRtk', 'Wi-Fi Signal')}
          >
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-bold text-slate-200">{rover.signalStrength}% Wi-Fi</span>
          </div>

          {/* Autonomous Patrol Crawl Toggle */}
          <button
            onClick={toggleSimulatePatrol}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium text-xs transition ${
              isSimulatingPatrol
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-md'
            }`}
            title={isSimulatingPatrol ? t('rover.pausePatrol', 'Pause Patrol') : t('rover.simulatePatrol', 'Simulate Patrol')}
          >
            {isSimulatingPatrol ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t('rover.patrolling', 'Patrolling')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t('rover.patrolCrawl', 'Patrol Crawl')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Grid: HUD Feed & Telemetry (Left 7 cols) + IoT Sensors & Simulator (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">

        {/* Left Column: Primary Camera Feed & Multi-Mode HUD (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 space-y-3">

          {/* Main Visual Display Frame (Responsive aspect-video) */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800/80 flex items-center justify-center select-none shadow-inner">

            {/* View Mode 1: ESP32-CAM Optical Stream */}
            {feedMode === 'optical' && (
              <div className="w-full h-full relative">
                <img
                  src="/images/drainpulse/underground_pipe_water.jpg"
                  alt="Drain Plus ESP32-CAM Live Feed"
                  className="w-full h-full object-cover filter brightness-95"
                />
                {/* Viewfinder crosshairs */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-20 h-20 border border-cyan-400/50 rounded-lg flex items-center justify-center relative">
                    <div className="w-1.5 h-4 bg-cyan-400"></div>
                    <div className="w-4 h-1.5 bg-cyan-400 absolute"></div>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 2: Thermal Heatmap Visualization (Restored & Distinct False-Color Ironbow) */}
            {feedMode === 'thermal' && (
              <div className="w-full h-full relative overflow-hidden bg-slate-950">
                <img
                  src="/images/drainpulse/underground_pipe_water.jpg"
                  alt="Drain Plus Thermal Heatmap Visualization"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'contrast(190%) saturate(260%) hue-rotate(185deg) invert(18%)'
                  }}
                />
                {/* Ironbow Temperature Color Scale Legend */}
                <div className="absolute right-3 top-10 bottom-12 w-4 rounded-full bg-gradient-to-t from-indigo-900 via-pink-600 to-amber-300 border border-slate-700 flex flex-col justify-between py-1 text-[8px] font-mono font-bold text-white shadow-lg pointer-events-none items-center">
                  <span className="text-amber-200">38°</span>
                  <span className="text-pink-200">28°</span>
                  <span className="text-indigo-200">18°</span>
                </div>
                {/* Hotspot & Cold Target Reticle */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-24 h-24 border-2 border-dashed border-amber-400/80 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div className="mt-2 bg-slate-950/85 px-2 py-0.5 rounded border border-amber-500/40 text-[9px] font-mono text-amber-200">
                    SPOT: 19.4°C [Cold Stagnant Water / Silt Bed]
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 3: Obstacle Echo Sweep Visualization */}
            {feedMode === 'echo' && (
              <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center p-4">
                {/* Sonar / Radar Sweep Grid Canvas */}
                <div className="relative w-64 h-48 border-b-2 border-indigo-500/80 flex items-end justify-center overflow-hidden">
                  {/* Concentric distance arcs */}
                  <div className="absolute w-60 h-60 rounded-full border border-indigo-500/20 bottom-0 pointer-events-none"></div>
                  <div className="absolute w-44 h-44 rounded-full border border-indigo-500/30 bottom-0 pointer-events-none"></div>
                  <div className="absolute w-28 h-28 rounded-full border border-indigo-500/40 bottom-0 pointer-events-none"></div>

                  {/* Radar sweep beam */}
                  <div className="absolute bottom-0 w-36 h-36 bg-gradient-to-tr from-transparent via-indigo-500/10 to-indigo-400/40 origin-bottom-left animate-spin" style={{ animationDuration: '3s' }}></div>

                  {/* Obstacle return bounce arc at 0.56m */}
                  <div className="absolute bottom-16 w-32 h-6 border-t-4 border-cyan-400 rounded-t-full shadow-lg shadow-cyan-500/50 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-900/90 px-1 rounded -translate-y-4 border border-cyan-500/40">
                      0.56m OBSTACLE
                    </span>
                  </div>

                  {/* Forward bumper emitter point */}
                  <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 z-10 -mb-2"></div>
                </div>

                {/* Ultrasonic ToF Telemetry metrics */}
                <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-slate-300 bg-slate-900/90 px-3 py-1 rounded-xl border border-indigo-800/40">
                  <span>ToF: <strong className="text-cyan-300">3.26 ms</strong></span>
                  <span>Freq: <strong className="text-slate-200">40 kHz Dual Transducer</strong></span>
                  <span>Spread: <strong className="text-slate-200">15° Cone</strong></span>
                </div>
              </div>
            )}

            {/* View Mode 4: Level Gauge Flume Visualization */}
            {feedMode === 'gauge' && (
              <div className="w-full h-full relative bg-slate-950 flex items-center justify-center p-4">
                <div className="flex items-center gap-6 w-full max-w-md bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  {/* Flume Cross-Section Ruler */}
                  <div className="relative w-20 h-40 bg-slate-950 rounded-xl border border-slate-700 flex flex-col justify-end p-1 overflow-hidden">
                    {/* Tick marks */}
                    <div className="absolute inset-y-1 left-1 w-2 flex flex-col justify-between text-[7px] font-mono text-slate-400">
                      <span>1.0m</span>
                      <span>0.8m</span>
                      <span>0.6m</span>
                      <span>0.4m</span>
                      <span>0.2m</span>
                      <span>0.0m</span>
                    </div>

                    {/* Danger line at 0.70m */}
                    <div className="absolute bottom-28 left-0 right-0 border-t border-dashed border-red-500/80"></div>
                    {/* Caution line at 0.40m */}
                    <div className="absolute bottom-16 left-0 right-0 border-t border-dashed border-amber-500/80"></div>

                    {/* Water Level Fill (0.28m) */}
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 rounded-b-lg relative overflow-hidden transition-all duration-500"
                      style={{ height: '28%' }}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-white/40 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Level Metrics & Technical Readout */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Flume Reading</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        NORMAL
                      </span>
                    </div>
                    <div className="text-2xl font-black font-mono text-cyan-300">
                      {rover.waterDepthSensor.toFixed(2)} m
                      <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">(28 cm)</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      {t('rover.gaugeSimNotice', 'Controlled flume model depth setup (₹250–₹800 water-level sensor configuration).')}
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[9px] font-mono text-slate-400">
                      <span>Warning: &gt;0.40m</span>
                      <span>•</span>
                      <span>Critical: &gt;0.70m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical HUD Overlay Elements (Always overlayed cleanly) */}
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between font-mono text-[10px] text-cyan-400">
              {/* Top HUD Badges */}
              <div className="flex items-center justify-between">
                <div className="bg-slate-900/85 px-2.5 py-0.5 rounded-lg border border-cyan-500/30 backdrop-blur-sm flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-white font-bold">{t('rover.recLiveHud', 'REC • LIVE HUD')}</span>
                </div>
                <div className="bg-slate-900/85 px-2.5 py-0.5 rounded-lg border border-cyan-500/30 backdrop-blur-sm text-cyan-300 shadow">
                  {t('rover.splashResistantEsp32', 'SPLASH-RESISTANT • ESP32-CAM')}
                </div>
              </div>

              {/* Mode-specific Top-Center Notice */}
              <div className="self-center">
                {feedMode === 'thermal' && (
                  <span className="bg-slate-950/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[9px]">
                    {t('rover.thermalSimNotice', 'SIMULATED THERMAL HEATMAP • 8–14µm')}
                  </span>
                )}
                {feedMode === 'echo' && (
                  <span className="bg-slate-950/90 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[9px]">
                    {t('rover.echoSimNotice', 'ULTRASONIC ECHO MAPPING')}
                  </span>
                )}
                {feedMode === 'gauge' && (
                  <span className="bg-slate-950/90 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded text-[9px]">
                    {t('rover.gaugeSimNotice', 'CONTROLLED DRAIN MODEL FLUME GAUGE')}
                  </span>
                )}
              </div>

              {/* Bottom HUD Telemetry Strip */}
              <div className="flex flex-wrap items-center justify-between bg-slate-950/90 px-3 py-1.5 rounded-xl border border-cyan-500/30 backdrop-blur-sm text-slate-300 text-[10px] gap-2 shadow">
                <span>{t('rover.gpsLabel', 'GPS:')} {rover.lat.toFixed(4)}°N, {rover.lng.toFixed(4)}°E</span>
                <span>{t('rover.speedLabel', 'SPEED:')} {rover.speedKmh} km/h</span>
                <span>{t('rover.flowLabel', 'FLOW:')} {rover.waterFlowVelocity} m/s</span>
              </div>
            </div>
          </div>

          {/* Mode Switch Pills & Secondary Telemetry Readings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            {/* Quick Numeric Telemetry Callouts */}
            <div className="flex items-center gap-3 text-slate-300 text-[11px] font-mono">
              <span>{t('rover.obstacleLabel', 'OBSTACLE:')} <strong className="text-cyan-300">0.56m</strong></span>
              <span>{t('rover.testDepthLabel', 'TEST DEPTH:')} <strong className="text-cyan-300">{rover.waterDepthSensor.toFixed(2)}m</strong></span>
              <span>{t('rover.headingLabel', 'HDG:')} <strong className="text-slate-200">{rover.heading}°</strong></span>
            </div>

            {/* 4 Restored Camera View Mode Selector Buttons */}
            <div
              className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-medium shrink-0 shadow-inner"
              role="tablist"
              aria-label="Rover Camera View Modes"
            >
              {/* Mode 1: Optical */}
              <button
                role="tab"
                aria-selected={feedMode === 'optical'}
                onClick={() => setFeedMode('optical')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  feedMode === 'optical'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={t('rover.esp32CamFeed', 'ESP32-CAM Feed')}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('rover.esp32CamFeed', 'ESP32-CAM Feed')}</span>
                <span className="sm:hidden">Optical</span>
              </button>

              {/* Mode 2: Thermal (Restored!) */}
              <button
                role="tab"
                aria-selected={feedMode === 'thermal'}
                onClick={() => setFeedMode('thermal')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  feedMode === 'thermal'
                    ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={t('rover.thermal', 'Thermal View Mode')}
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('rover.thermal', 'Thermal')}</span>
              </button>

              {/* Mode 3: Obstacle Echo */}
              <button
                role="tab"
                aria-selected={feedMode === 'echo'}
                onClick={() => setFeedMode('echo')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  feedMode === 'echo'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={t('rover.obstacleEcho', 'Obstacle Echo')}
              >
                <Radar className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">{t('rover.obstacleEcho', 'Obstacle Echo')}</span>
                <span className="sm:hidden">Echo</span>
              </button>

              {/* Mode 4: Level Gauge */}
              <button
                role="tab"
                aria-selected={feedMode === 'gauge'}
                onClick={() => setFeedMode('gauge')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
                  feedMode === 'gauge'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
                title={t('rover.levelGauge', 'Level Gauge')}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('rover.levelGauge', 'Level Gauge')}</span>
                <span className="sm:hidden">Gauge</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: IoT Telemetry Nodes, Simulator & Optical Hazard Scan (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-slate-900/80 space-y-4">

          {/* Card D: IoT Sensor Telemetry Nodes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                {t('rover.iotNodesTitle', 'IoT Sensor Telemetry Nodes')}
              </h4>
              <span className="text-[9px] text-cyan-300 font-mono bg-cyan-950 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                {t('rover.apiIngestionActive', 'API Ingestion Active')}
              </span>
            </div>

            <div className="space-y-2">
              {sensorsList.map((sensor, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-200 text-[11px] font-mono">{sensor.deviceId}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        sensor.health === 'Optimal'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {sensor.health}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{sensor.location.name}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-cyan-300 text-sm block">
                      {sensor.latestReading} {sensor.unit}
                    </span>
                    <span className="block text-[9px] text-amber-400 font-mono">
                      {sensor.isSimulated ? t('rover.simulatedWarning', '⚠️ SIMULATED') : t('rover.liveStatus', 'LIVE')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card E: IoT Telemetry Simulator (Dev Tool) */}
          <div className="p-3 bg-gradient-to-br from-slate-950 to-indigo-950/40 rounded-2xl border border-indigo-800/40 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {t('rover.iotSimulatorTitle', 'IoT Telemetry Simulator')}
              </span>
              <span className="text-[9px] bg-indigo-900/60 text-indigo-200 px-1.5 py-0.5 rounded font-mono font-bold">
                {t('rover.devTool', 'Dev Tool')}
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-tight">
              {t('rover.simulatorDesc', 'Test edge water-level spikes and sensor-health state transitions. Visibly labelled as simulated telemetry.')}
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleTriggerSensorSimulation('flash_flood')}
                className="py-1 px-2 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 rounded-lg text-[10px] font-bold transition text-center"
              >
                {t('rover.floodSpike', 'Flood Spike (1.65m)')}
              </button>
              <button
                onClick={() => handleTriggerSensorSimulation('receding')}
                className="py-1 px-2 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 rounded-lg text-[10px] font-bold transition text-center"
              >
                {t('rover.normalLevel', 'Normal (0.30m)')}
              </button>
              <button
                onClick={() => handleTriggerSensorSimulation('sensor_glitch')}
                className="py-1 px-2 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 rounded-lg text-[10px] font-bold transition text-center"
              >
                {t('rover.degradedPing', 'Degraded Ping')}
              </button>
            </div>

            {simNotice && (
              <div className="p-1.5 bg-indigo-950/90 border border-indigo-700 text-indigo-300 rounded-lg text-[10px] flex items-center gap-1.5 animate-fade-in">
                <AlertCircle className="w-3 h-3 text-indigo-400 shrink-0" />
                <span>{simNotice}</span>
              </div>
            )}
          </div>

          {/* Card F: Rover Optical Hazard Scan (Cleanly aligned controls) */}
          <div className="p-3 bg-gradient-to-br from-slate-950 to-cyan-950/40 rounded-2xl border border-cyan-800/40 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                {t('rover.roverOpticalScan', 'Rover Optical Hazard Scan')}
              </span>
              <span className="text-[9px] bg-cyan-900/60 text-cyan-200 px-1.5 py-0.5 rounded font-mono font-bold">
                {t('rover.interactiveScan', 'Interactive Scan')}
              </span>
            </div>

            <select
              value={selectedScenarioIdx}
              onChange={(e) => setSelectedScenarioIdx(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
              aria-label="Select Disaster Scenario"
            >
              {DEMO_SCENARIOS.map((sc, idx) => (
                <option key={idx} value={idx}>
                  #{idx + 1}: {sc.title.slice(0, 36)}... ({sc.category})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isScanning}
                onClick={() => handleTriggerScan()}
                className="py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('rover.classifying', 'Classifying...')}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t('rover.deployScan', 'Deploy Scan')}</span>
                  </>
                )}
              </button>

              <button
                disabled={isScanning}
                onClick={() => handleTriggerScan(Math.floor(Math.random() * DEMO_SCENARIOS.length))}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('rover.randomize', 'Randomize')}</span>
              </button>
            </div>

            {lastScanResult && (
              <div className="p-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-[10px] font-medium flex items-center gap-1.5 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="truncate">{lastScanResult}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
