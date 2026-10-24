import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { DEMO_SCENARIOS } from '../../data/mockData';
import { 
  Camera, 
  Battery, 
  Wifi, 
  Compass, 
  Droplets, 
  Radio, 
  Play, 
  Pause, 
  Sparkles, 
  ExternalLink,
  Cpu,
  Activity
} from 'lucide-react';

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

  // Trigger manual or selected scan
  const handleTriggerScan = (idx?: number) => {
    setIsScanning(true);
    setTimeout(() => {
      const created = simulateRoverObservation(idx !== undefined ? idx : selectedScenarioIdx);
      setIsScanning(false);
      const translatedSev = t(`severity.${created.severity}`, created.severity);
      setLastScanResult(t('rover.observationLogged', { 
        title: created.title, 
        severity: translatedSev,
        defaultValue: `Observation Logged: ${created.title} (${translatedSev})` 
      }));
      setTimeout(() => setLastScanResult(null), 5000);
    }, 700);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-white">
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
                {rover.operatingMode === 'Autonomous' 
                  ? t('rover.autonomous', 'Autonomous') 
                  : t('rover.teleOp', 'Manual Tele-Op')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {t('rover.sector', { sector: rover.assignedSector, defaultValue: `Sector: ${rover.assignedSector}` })}
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
            <span className="font-mono font-bold">{rover.signalStrength}% Wi-Fi (Sim)</span>
          </div>

          {/* Autonomous Patrol Toggle */}
          <button
            onClick={toggleSimulatePatrol}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs transition ${
              isSimulatingPatrol
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-md'
            }`}
          >
            {isSimulatingPatrol ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t('rover.pausePatrol', 'Pause Patrol')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('rover.simulatePatrol', 'Simulate Patrol')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Live HUD Stream + Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Live Rover Video / HUD Feed (7 cols) */}
        <div className="lg:col-span-7 relative bg-black flex flex-col justify-between min-h-[320px] overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Feed Background Image / Viewport */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/drainpulse/drain_inspection_waste.jpg" 
              alt="DrainPulse Live Feed" 
              className={`w-full h-full object-cover transition duration-500 ${
                feedMode === 'thermal' ? 'filter hue-rotate-180 saturate-200 contrast-125' :
                feedMode === 'sonar' ? 'filter invert brightness-90 contrast-200' : ''
              }`}
            />
            {/* Grid overlay lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            {/* Scanning Laser Line when triggered */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-bounce z-20"></div>
            )}
          </div>

          {/* Top HUD Overlay Info */}
          <div className="relative z-10 p-3 flex items-center justify-between text-xs font-mono bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-bold text-red-400 tracking-wider">● REC [ESP32-CAM 640x480]</span>
              <span className="text-slate-300">LED: ON</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">
                {t('rover.gps', { 
                  lat: rover.lat.toFixed(5), 
                  lng: rover.lng.toFixed(5), 
                  defaultValue: `GPS: ${rover.lat.toFixed(5)}°N, ${rover.lng.toFixed(5)}°E` 
                })}
              </span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${rover.lat},${rover.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white"
                title="Open Rover Location in Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Center Tactical Crosshair */}
          <div className="relative z-10 self-center flex items-center justify-center pointer-events-none my-auto">
            <div className="relative w-28 h-28 border border-cyan-400/30 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-t-2 border-l-2 border-cyan-400 absolute top-0 left-0"></div>
              <div className="w-3 h-3 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0"></div>
              <div className="w-3 h-3 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0"></div>
              <div className="w-3 h-3 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0"></div>
              <div className="w-2 h-2 bg-cyan-400/60 rounded-full"></div>
              
              {/* Debris Detection Box Overlay */}
              <div className="absolute -top-12 -right-16 bg-amber-950/90 border border-amber-500 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono shadow-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>DRAIN_BLOCKAGE_DETECT (94.2%)</span>
              </div>
            </div>
          </div>

          {/* Bottom HUD Controls & Feed Switcher */}
          <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap items-center justify-between gap-2">
            {/* Sensor Quick Stats */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-300">
              <div className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {t('rover.depth', { 
                    depth: rover.waterDepthSensor.toFixed(2), 
                    defaultValue: `DEPTH: ${rover.waterDepthSensor.toFixed(2)}m` 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {t('rover.heading', { 
                    heading: rover.heading, 
                    defaultValue: `HDG: ${rover.heading}°` 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {t('rover.temp', { 
                    temp: rover.waterTempCelsius, 
                    defaultValue: `TEMP: ${rover.waterTempCelsius}°C` 
                  })}
                </span>
              </div>
            </div>

            {/* Mode switch pills */}
            <div className="flex bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setFeedMode('optical')}
                className={`px-2 py-0.5 rounded ${
                  feedMode === 'optical' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('rover.optical4k', 'Optical 4K')}
              </button>
              <button
                onClick={() => setFeedMode('thermal')}
                className={`px-2 py-0.5 rounded ${
                  feedMode === 'thermal' ? 'bg-red-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('rover.flirThermal', 'FLIR Thermal')}
              </button>
              <button
                onClick={() => setFeedMode('sonar')}
                className={`px-2 py-0.5 rounded ${
                  feedMode === 'sonar' ? 'bg-sky-500 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('rover.sonarGrid', 'Sonar Grid')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Rover Telemetry & Simulated Observation Trigger (5 cols) */}
        <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-slate-900/80 space-y-4">
          {/* Telemetry Sensor Dashboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                {t('rover.sensorTelemetry', 'Onboard Sensor Telemetry')}
              </h4>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                {t('rover.telemetrySynced', 'Telemetry Synced')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t('rover.ultrasoundDepth', 'Ultrasound Water Depth')}</span>
                <div className="text-lg font-black text-sky-400 font-mono mt-0.5">
                  {rover.waterDepthSensor.toFixed(2)} <span className="text-xs font-normal text-slate-400">{t('rover.meters', 'meters')}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (rover.waterDepthSensor / 2.5) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t('rover.flowVelocity', 'Flow Velocity')}</span>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {rover.waterFlowVelocity.toFixed(1)} <span className="text-xs font-normal text-slate-400">{t('rover.mSec', 'm/sec')}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (rover.waterFlowVelocity / 3.0) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t('rover.chassisSpeed', 'Chassis Speed')}</span>
                <div className="text-lg font-black text-cyan-300 font-mono mt-0.5">
                  {rover.speedKmh.toFixed(1)} <span className="text-xs font-normal text-slate-400">{t('rover.kmh', 'km/h')}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Geared TT 4WD</span>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t('rover.batteryRange', 'Battery & Range')}</span>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {rover.battery}% <span className="text-xs font-normal text-slate-400">~90 mins</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Dual 18650 Li-ion (7.4V)</span>
              </div>
            </div>
          </div>

          {/* SIMULATED NEW OBSERVATION FEATURE */}
          <div className="p-3 bg-gradient-to-br from-slate-950 to-cyan-950/30 rounded-xl border border-cyan-800/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {t('rover.simulateObservation', 'Simulate Rover Observation')}
              </span>
              <span className="text-[10px] bg-cyan-900/60 text-cyan-200 px-1.5 py-0.5 rounded font-mono">
                {t('rover.judgeDemoTool', 'Judge Demo Tool')}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-2">
              {t('rover.simulateDesc', 'Select or randomize a flood disaster observation. The rover immediately takes a snapshot, logs GPS coordinates, runs priority classification, and syncs the tactical map.')}
            </p>

            {/* Scenario Picker */}
            <div className="mb-2">
              <select
                value={selectedScenarioIdx}
                onChange={(e) => setSelectedScenarioIdx(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
              >
                {DEMO_SCENARIOS.map((sc, idx) => {
                  const translatedCat = t(`category.${sc.category}`, sc.category);
                  return (
                    <option key={idx} value={idx}>
                      {t('rover.scenarioLabel', { 
                        num: idx + 1, 
                        title: sc.title.slice(0, 38), 
                        category: translatedCat,
                        defaultValue: `Scenario #${idx + 1}: ${sc.title.slice(0, 38)}... (${translatedCat})` 
                      })}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isScanning}
                onClick={() => handleTriggerScan()}
                className="w-full py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
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
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('rover.randomizeHazard', 'Randomize Hazard')}</span>
              </button>
            </div>

            {/* Scan Success Toast */}
            {lastScanResult && (
              <div className="mt-2 p-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="truncate">{lastScanResult}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
