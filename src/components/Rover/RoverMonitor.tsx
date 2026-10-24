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
  Cpu
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

export const RoverMonitor: React.FC = () => {
  const { t } = useTranslation();
  const { 
    rover, 
    isSimulatingPatrol, 
    toggleSimulatePatrol, 
    simulateRoverObservation
  } = useApp();

  const [feedMode, setFeedMode] = useState<'optical' | 'thermal' | 'sonar'>('optical');
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);

  // IoT Sensor Telemetry & Simulator State
  const [sensorsList, setSensorsList] = useState<SensorItem[]>([
    {
      deviceId: 'IOT-PANCH-01',
      sensorType: 'ultrasonic_depth',
      latestReading: 0.78,
      unit: 'm',
      health: 'Optimal',
      location: { name: 'Adyar Outflow Sluice', drainSector: 'Sector 4B' },
      isSimulated: true
    },
    {
      deviceId: 'IOT-PANCH-02',
      sensorType: 'flow_velocity',
      latestReading: 1.42,
      unit: 'm/s',
      health: 'Optimal',
      location: { name: 'Velachery Trunk Canal', drainSector: 'Sector 2A' },
      isSimulated: true
    },
    {
      deviceId: 'IOT-PANCH-03',
      sensorType: 'rainfall_gauge',
      latestReading: 42.5,
      unit: 'mm/hr',
      health: 'Optimal',
      location: { name: 'Panchayat Complex', drainSector: 'Central' },
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
      setLastScanResult(`Observation Logged: ${created.title} (${translatedSev})`);
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
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute inset-0"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-500 relative"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                {rover.name}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                {rover.operatingMode}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Sector: {rover.assignedSector}
            </p>
          </div>
        </div>

        {/* Telemetry quick pills */}
        <div className="flex items-center gap-2 text-xs">
          {/* Battery */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Battery className={`w-3.5 h-3.5 ${rover.battery > 30 ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="font-mono font-bold">{rover.battery}%</span>
          </div>

          {/* Signal */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-bold">{rover.signalStrength}% Wi-Fi</span>
          </div>

          {/* Autonomous Patrol Toggle */}
          <button
            onClick={toggleSimulatePatrol}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium text-xs transition ${
              isSimulatingPatrol
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-md'
            }`}
          >
            {isSimulatingPatrol ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Patrolling</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Patrol Crawl</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: HUD Feed (Left) + Telemetry / IoT Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* Left Column: Live Rover Video / Sonar HUD (7 cols) */}
        <div className="lg:col-span-7 p-4 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800/80 flex items-center justify-center">
            {/* Camera Frame */}
            <img 
              src="/images/drainpulse/underground_pipe_water.jpg"
              alt="Live Rover Feed"
              className="w-full h-full object-cover filter brightness-95"
            />

            {/* Tactical HUD Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between font-mono text-[10px] text-cyan-400">
              <div className="flex items-center justify-between">
                <div className="bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-white font-bold">REC • LIVE HUD</span>
                </div>
                <div className="bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30 backdrop-blur-sm text-cyan-300">
                  IP68 • DRAINPULSE ESP32
                </div>
              </div>

              {/* Crosshair Target Box */}
              <div className="self-center flex flex-col items-center justify-center opacity-80">
                <div className="w-16 h-16 border border-cyan-400/50 rounded-lg flex items-center justify-center relative">
                  <div className="w-1 h-3 bg-cyan-400"></div>
                  <div className="w-3 h-1 bg-cyan-400 absolute"></div>
                </div>
                <span className="mt-1 text-[9px] bg-slate-900/80 px-1.5 py-0.2 rounded text-cyan-200">
                  OPTICAL SCAN: CLEAR
                </span>
              </div>

              {/* Bottom HUD stats */}
              <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1 rounded border border-cyan-500/30 backdrop-blur-sm text-slate-300">
                <span>GPS: {rover.lat.toFixed(4)}°N, {rover.lng.toFixed(4)}°E</span>
                <span>SPEED: {rover.speedKmh} km/h</span>
                <span>FLOW: {rover.waterFlowVelocity} m/s</span>
              </div>
            </div>
          </div>

          {/* Mode Switch Pills */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-slate-300 text-[11px] font-mono">
              <span>DEPTH: <strong>{rover.waterDepthSensor.toFixed(2)}m</strong></span>
              <span>HDG: <strong>{rover.heading}°</strong></span>
              <span>TEMP: <strong>{rover.waterTempCelsius}°C</strong></span>
            </div>

            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setFeedMode('optical')}
                className={`px-2 py-0.5 rounded ${
                  feedMode === 'optical' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Optical
              </button>
              <button
                onClick={() => setFeedMode('thermal')}
                className={`px-2 py-0.5 rounded ${
                  feedMode === 'thermal' ? 'bg-red-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Thermal
              </button>
              <button
                onClick={() => setFeedMode('sonar')}
                className={`px-2 py-0.5 rounded ${
                  feedMode === 'sonar' ? 'bg-sky-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Sonar Grid
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: IoT Sensor Integration & Simulation (5 cols) */}
        <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-slate-900/80 space-y-4">
          
          {/* IoT Telemetry Nodes Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                IoT Sensor Telemetry Nodes
              </h4>
              <span className="text-[9px] text-cyan-300 font-mono bg-cyan-950 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                API Ingestion Active
              </span>
            </div>

            <div className="space-y-1.5">
              {sensorsList.map((sensor, idx) => (
                <div 
                  key={idx} 
                  className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-200 text-[11px] font-mono">{sensor.deviceId}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        sensor.health === 'Optimal' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {sensor.health}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{sensor.location.name}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold font-mono text-cyan-300 text-sm">
                      {sensor.latestReading} {sensor.unit}
                    </span>
                    <span className="block text-[9px] text-amber-400 font-mono">
                      {sensor.isSimulated ? '⚠️ SIMULATED' : 'LIVE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IoT Development Simulator Controls */}
          <div className="p-3 bg-gradient-to-br from-slate-950 to-indigo-950/30 rounded-2xl border border-indigo-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                IoT Telemetry Simulator
              </span>
              <span className="text-[9px] bg-indigo-900/60 text-indigo-200 px-1.5 py-0.5 rounded font-mono">
                Dev Tool
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-tight">
              Test edge water-level spikes and sensor-health state transitions. Visibly labelled as simulated telemetry.
            </p>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleTriggerSensorSimulation('flash_flood')}
                className="py-1 px-2 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 rounded-lg text-[10px] font-bold transition"
              >
                Flood Spike (1.65m)
              </button>
              <button
                onClick={() => handleTriggerSensorSimulation('receding')}
                className="py-1 px-2 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/40 rounded-lg text-[10px] font-bold transition"
              >
                Normal (0.30m)
              </button>
              <button
                onClick={() => handleTriggerSensorSimulation('sensor_glitch')}
                className="py-1 px-2 bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/40 rounded-lg text-[10px] font-bold transition"
              >
                Degraded Ping
              </button>
            </div>

            {simNotice && (
              <div className="p-1.5 bg-indigo-950 border border-indigo-700 text-indigo-300 rounded-lg text-[10px] animate-fade-in">
                {simNotice}
              </div>
            )}
          </div>

          {/* SIMULATED NEW OBSERVATION TRIGGER */}
          <div className="p-3 bg-gradient-to-br from-slate-950 to-cyan-950/30 rounded-2xl border border-cyan-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Rover Optical Hazard Scan
              </span>
              <span className="text-[9px] bg-cyan-900/60 text-cyan-200 px-1.5 py-0.5 rounded font-mono">
                Interactive Scan
              </span>
            </div>

            <select
              value={selectedScenarioIdx}
              onChange={(e) => setSelectedScenarioIdx(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
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
                    <span>Classifying...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Deploy Scan</span>
                  </>
                )}
              </button>

              <button
                disabled={isScanning}
                onClick={() => handleTriggerScan(Math.floor(Math.random() * DEMO_SCENARIOS.length))}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Randomize</span>
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
