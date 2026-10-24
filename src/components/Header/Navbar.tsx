import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from './LanguageSelector';
import { 
  Radio, 
  Bell, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Users, 
  Activity,
  Cpu,
  Droplets
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenJudgeGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNotifications, 
  onOpenJudgeGuide 
}) => {
  const { t } = useTranslation();
  const { 
    viewMode, 
    setViewMode, 
    audioAlertsEnabled, 
    toggleAudioAlerts, 
    unreadNotificationsCount,
    resetToDefaultData,
    rover
  } = useApp();

  return (
    <header className="sticky top-0 z-[800] bg-slate-900 border-b border-slate-800 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Operational Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setViewMode('overview')}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white font-black text-lg hover:scale-105 transition"
              title="DrainPulse - Project Overview"
            >
              <Droplets className="w-5 h-5 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse"></div>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setViewMode('overview')}
                  className="font-extrabold text-base sm:text-lg tracking-tight text-white font-sans text-left hover:text-cyan-400 transition"
                >
                  Drain<span className="text-cyan-400">Pulse</span>
                </button>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider font-mono">
                  AquaBots
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Smart Storm-Drain Monitoring & Inspection Rover</span>
              </p>
            </div>
          </div>

          {/* Center: View Switcher (Overview vs Live Monitor vs Panchayat Portal) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'overview'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Project Concept, Hardware & Engineering Design"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Project Concept</span>
            </button>

            <button
              onClick={() => setViewMode('command')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'command'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Live Tactical Map, Rover Telemetry & Blockage Triage"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Monitor</span>
            </button>

            <button
              onClick={() => setViewMode('public')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'public'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rural Panchayat Community Safety & Citizen Reporting"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panchayat Portal</span>
              <span className="sm:hidden">Portal</span>
            </button>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* MULTILINGUAL LANGUAGE SELECTOR */}
            <LanguageSelector />

            {/* Quick Tour Modal Trigger */}
            <button
              onClick={onOpenJudgeGuide}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
              title={t('nav.judgeTour', 'Interactive Demo Tour')}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Tour</span>
            </button>

            {/* Audio Alert Toggle */}
            <button
              onClick={toggleAudioAlerts}
              className={`p-2 rounded-xl border text-xs transition ${
                audioAlertsEnabled 
                  ? 'bg-slate-800/80 border-slate-700 text-cyan-300 hover:bg-slate-800' 
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={audioAlertsEnabled ? t('nav.soundEnabled', 'Sound Alerts Enabled') : t('nav.soundMuted', 'Sound Alerts Muted')}
            >
              {audioAlertsEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition"
              title="Notification Center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-slate-900 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm(t('nav.resetConfirm', 'Reset all demo data and rover telemetry back to initial state?'))) {
                  resetToDefaultData();
                }
              }}
              className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
              title={t('nav.resetBaseline', 'Reset Demo Baseline')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Simulation Mode & Live Telemetry Ping indicator */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs text-slate-400">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                Simulation Mode
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                {rover.name.split(' ')[0]} ⚡{rover.battery}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

