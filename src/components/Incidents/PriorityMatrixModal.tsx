import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Droplets, Users, Zap, Compass } from 'lucide-react';

interface PriorityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityMatrixModal: React.FC<PriorityMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AquaRescue Prioritization Matrix & Rules</h3>
              <p className="text-xs text-slate-400">Explainable AI & Algorithmic Triage Framework</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          <p className="leading-relaxed text-slate-600">
            AquaRescue employs transparent, multi-factor rule scoring to calculate immediate dispatch priorities for incoming rover telemetry and citizen hazard alerts.
          </p>

          {/* Scoring Factors Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Triage Scoring Factors & Weights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-red-600" />
                    Stranded Human Lives
                  </span>
                  <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    +15 to 50 pts
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  15 pts per stranded citizen (capped at 50 pts). Immediate priority override if children or elderly identified.
                </p>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    Flood Water Depth
                  </span>
                  <span className="font-mono font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                    +15 to 35 pts
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  ≥1.5m (+35 pts, extreme drowning & vehicle washout); ≥0.9m (+25 pts); ≥0.4m (+15 pts).
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Electrical Infrastructure
                  </span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    +30 pts
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  Submerged transformers, live sparking lines, or grid junction breach. Mandatory power isolation protocol.
                </p>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-purple-600" />
                    Flow Rate & Lifelines
                  </span>
                  <span className="font-mono font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                    +20 to 25 pts
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-1.5">
                  Flow speed &gt;1.5 m/s sweeps pedestrians; submerged vehicles obstructing critical hospital or evacuation corridors.
                </p>
              </div>
            </div>
          </div>

          {/* Severity Thresholds Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Severity Classification Matrix
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="p-3 flex items-center justify-between bg-red-50/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase">
                    Critical
                  </span>
                  <span className="font-semibold text-slate-900">Score ≥ 75 or Trapped Civilians ≥ 3</span>
                </div>
                <span className="text-[11px] text-red-700 font-medium">Dispatch target: &lt; 10 mins</span>
              </div>

              <div className="p-3 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] uppercase">
                    High
                  </span>
                  <span className="font-semibold text-slate-900">Score ≥ 50 or Water Depth ≥ 0.9m</span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium">Dispatch target: &lt; 30 mins</span>
              </div>

              <div className="p-3 flex items-center justify-between bg-sky-50/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-bold text-[10px] uppercase">
                    Medium
                  </span>
                  <span className="font-semibold text-slate-900">Score ≥ 30 or Water Depth ≥ 0.4m</span>
                </div>
                <span className="text-[11px] text-sky-700 font-medium">Dispatch target: &lt; 2 hrs</span>
              </div>

              <div className="p-3 flex items-center justify-between bg-emerald-50/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                    Low
                  </span>
                  <span className="font-semibold text-slate-900">Score &lt; 30 (Minor ponding / cleared)</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Advisory / Routine Patrol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
