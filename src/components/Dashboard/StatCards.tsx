import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  Droplets, 
  CheckCircle2, 
  Activity, 
  Waves, 
  CloudRain, 
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { PanchayatAnalyticsModal } from './PanchayatAnalyticsModal';

export const StatCards: React.FC = () => {
  const { t } = useTranslation();
  const { incidents, setFilterSeverity, setFilterStatus } = useApp();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const stats = useMemo(() => {
    const active = incidents.filter(i => i.status !== 'Resolved');
    const critical = incidents.filter(i => (i.severity === 'Critical' || i.severity === 'High') && i.status !== 'Resolved');
    const waterlogging = incidents.filter(i => i.category === 'Severe Waterlogging' || i.waterDepthMeters > 0.5);
    const resolved = incidents.filter(i => i.status === 'Resolved');
    const trappedTotal = active.reduce((sum, i) => sum + i.trappedCount, 0);

    const maxDepth = incidents.reduce((max, i) => Math.max(max, i.waterDepthMeters), 0);

    return {
      activeCount: active.length,
      criticalCount: critical.length,
      waterloggingCount: waterlogging.length,
      resolvedCount: resolved.length,
      trappedTotal,
      maxDepth
    };
  }, [incidents]);

  return (
    <div className="space-y-4">
      {/* Real-time Environmental Hazard & River Warning Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-3.5 shadow-sm text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Drain & Culvert Flow Warning System:
            </span>
            <span className="text-cyan-300 font-medium">
              Pre-Monsoon Inspection Active • Ultrasonic Depth Sensing (Simulation Mode)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>Downpour: <strong>Heavy</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drain Outflow: <strong>2,400 LPM</strong></span>
            </div>
            
            {/* Panchayat Analytics Button */}
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 hover:text-white border border-cyan-500/50 rounded-xl font-bold transition shadow-sm"
              title="Open Panchayat Intelligence & Backlog Analytics"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Panchayat Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents */}
        <div 
          onClick={() => { setFilterSeverity('All'); setFilterStatus('All'); }}
          className="group cursor-pointer bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-cyan-400 hover:shadow-md transition duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dashboard.activeIncidents', 'Active Complaints')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {stats.activeCount}
            </span>
            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
              {t('dashboard.liveTriage', 'Live Triage')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Involved Wards: 4</span>
            <span className="text-cyan-600 group-hover:translate-x-0.5 transition flex items-center text-[11px] font-bold">
              {t('dashboard.viewAll', 'View all')} <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Card 2: Critical Emergencies (SOS) */}
        <div 
          onClick={() => { setFilterSeverity('Critical'); setFilterStatus('All'); }}
          className="group cursor-pointer bg-red-50/50 rounded-2xl p-4 border border-red-200/80 hover:border-red-400 hover:shadow-md transition duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              {t('dashboard.criticalEmergencies', 'Critical & High SOS')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-700 tracking-tight font-sans">
              {stats.criticalCount}
            </span>
            {stats.trappedTotal > 0 && (
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                {stats.trappedTotal} Stranded Lives
              </span>
            )}
          </div>
          <p className="text-xs text-red-700 mt-2 flex items-center justify-between font-medium">
            <span>{t('dashboard.responseTarget', 'Requires <10m Response')}</span>
            <span className="group-hover:translate-x-0.5 transition flex items-center text-[11px] font-bold">
              {t('dashboard.filterCritical', 'Filter Critical')} <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Card 3: Waterlogging Reports */}
        <div 
          onClick={() => { setFilterSeverity('All'); setFilterStatus('All'); }}
          className="group cursor-pointer bg-sky-50/50 rounded-2xl p-4 border border-sky-200/80 hover:border-sky-400 hover:shadow-md transition duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              {t('dashboard.waterloggingPoints', 'Culvert Ponding Points')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-900 tracking-tight font-sans">
              {stats.waterloggingCount}
            </span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full font-mono">
              Max: {stats.maxDepth.toFixed(2)}m
            </span>
          </div>
          <p className="text-xs text-sky-700 mt-2 flex items-center justify-between">
            <span>Dewatering Pumps Active</span>
            <span className="text-sky-600 group-hover:translate-x-0.5 transition flex items-center text-[11px] font-bold">
              {t('dashboard.inspectDepth', 'Inspect Depth')} <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* Card 4: Resolved Incidents */}
        <div 
          onClick={() => { setFilterSeverity('All'); setFilterStatus('Resolved'); }}
          className="group cursor-pointer bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 hover:border-emerald-400 hover:shadow-md transition duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t('dashboard.resolvedCleared', 'Verified Resolved')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-800 tracking-tight font-sans">
              {stats.resolvedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Safe & De-watered
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-2 flex items-center justify-between">
            <span>Flow Restored</span>
            <span className="text-emerald-700 group-hover:translate-x-0.5 transition flex items-center text-[11px] font-bold">
              {t('dashboard.resolvedLog', 'Resolved Log')} <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>
      </div>

      {/* Panchayat Analytics Modal */}
      <PanchayatAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
};
