import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Incident, IncidentStatus, Severity } from '../../types';
import { 
  X, 
  MapPin, 
  Droplets, 
  Users, 
  ShieldAlert, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Send, 
  AlertTriangle,
  UserCheck,
  Download,
  Share2,
  Copy,
  Check
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ 
  incident, 
  onClose 
}) => {
  const { updateIncidentStatus } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(
    incident ? incident.status : 'Reported'
  );
  const [assignedTeam, setAssignedTeam] = useState<string>(
    incident?.assignedTeam || 'SDRF Flood Unit Delta-2'
  );
  const [dispatchNote, setDispatchNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!incident) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`;

  const STATUS_FLOW: IncidentStatus[] = [
    'Reported',
    'Acknowledged',
    'Response in Progress',
    'Resolved'
  ];

  const TEAMS_LIST = [
    'SDRF Flood Unit Delta-2 (Inflatable Boat)',
    'NDRF Battalion 4 Water Rescue Team',
    'Municipal Corporation High-Capacity Dewatering Crew',
    'TNEB Electrical Isolation & Safety Squad',
    'Civil Defence First Aid & Medical Evacuation Boat',
    'Voluntary Fishermen Motorboat Corps'
  ];

  const handleUpdate = (newStatus: IncidentStatus) => {
    setSelectedStatus(newStatus);
    updateIncidentStatus(incident.id, newStatus, dispatchNote || undefined, assignedTeam);
    setDispatchNote('');
  };

  const handleCopySITREP = () => {
    const sitrep = `
=== AQUARESCUE DISASTER SITUATION REPORT (SITREP) ===
Incident ID: ${incident.id}
Classification: ${incident.severity.toUpperCase()} (${incident.category})
Priority Score: ${incident.dispatchPriorityScore}/100
Location: ${incident.locationName} (${incident.ward})
GPS Coordinates: ${incident.lat.toFixed(5)}°N, ${incident.lng.toFixed(5)}°E
Google Maps: ${googleMapsUrl}
Water Depth: ${incident.waterDepthMeters.toFixed(2)} meters
Trapped Civilians: ${incident.trappedCount}
Status: ${incident.status}
Assigned Unit: ${incident.assignedTeam || 'Unassigned'}
Reported Via: ${incident.source} at ${incident.reportedAt}

SUMMARY:
${incident.description}

PRIORITY REASONING:
${incident.priorityReason}

STANDARD OPERATING PROCEDURES (SOP):
${incident.safetyGuidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

LATEST AUDIT LOG:
${incident.history.map(h => `[${h.timestamp}] [${h.status}] ${h.author}: ${h.note}`).join('\n')}
====================================================
    `.trim();

    navigator.clipboard.writeText(sitrep);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Medium': return 'bg-sky-600 text-white';
      case 'Low': return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${getSeverityBadgeClass(incident.severity)}`}>
              {incident.severity}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-400 font-mono font-bold">{incident.id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-300 font-medium">{incident.category}</span>
              </div>
              <h3 className="font-bold text-base leading-tight text-white line-clamp-1">
                {incident.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySITREP}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              title="Copy Military/Disaster SITREP text"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">SITREP Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SITREP</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-800">
          {/* Top Section: Photo + Quick Telemetry Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Incident Photo (5 cols) */}
            <div className="md:col-span-5 relative h-56 md:h-full min-h-[220px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-xs">
                <div className="font-mono text-cyan-300 text-[10px] flex items-center justify-between">
                  <span>SOURCE: {incident.source}</span>
                  <span>{incident.reportedAt}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Location (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              {/* Location Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{incident.locationName}</h4>
                      <p className="text-xs text-slate-500">{incident.ward}</p>
                      <p className="text-xs font-mono text-cyan-800 font-semibold mt-1">
                        GPS: {incident.lat.toFixed(5)}° N, {incident.lng.toFixed(5)}° E
                      </p>
                    </div>
                  </div>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm shrink-0"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Numerical Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-sky-50 border border-sky-200/60 p-2.5 rounded-xl">
                  <span className="text-[10px] text-sky-800 uppercase tracking-wider block font-semibold">Flood Depth</span>
                  <div className="text-xl font-black text-sky-900 font-mono mt-0.5">
                    {incident.waterDepthMeters.toFixed(2)} <span className="text-xs font-normal">m</span>
                  </div>
                  <span className="text-[10px] text-sky-700">Ultrasound Sensor</span>
                </div>

                <div className="bg-red-50 border border-red-200/60 p-2.5 rounded-xl">
                  <span className="text-[10px] text-red-800 uppercase tracking-wider block font-semibold">Trapped Civilians</span>
                  <div className={`text-xl font-black font-mono mt-0.5 ${incident.trappedCount > 0 ? 'text-red-700' : 'text-slate-700'}`}>
                    {incident.trappedCount} <span className="text-xs font-normal">people</span>
                  </div>
                  <span className="text-[10px] text-red-700">AI Optical Count</span>
                </div>

                <div className="bg-purple-50 border border-purple-200/60 p-2.5 rounded-xl">
                  <span className="text-[10px] text-purple-800 uppercase tracking-wider block font-semibold">Priority Score</span>
                  <div className="text-xl font-black text-purple-900 font-mono mt-0.5">
                    {incident.dispatchPriorityScore} <span className="text-xs font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-purple-700">Triage Engine</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                {incident.description}
              </p>
            </div>
          </div>

          {/* Section: Prioritization Rule Transparency */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-1.5">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Automated Prioritization Rationale
            </h4>
            <p className="text-xs text-amber-950 font-medium leading-relaxed">
              {incident.priorityReason}
            </p>
          </div>

          {/* Section: Standard Operating Procedure (SOP) Safety Guidance */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              Recommended Safety Guidance & Field SOPs
            </h4>
            <ul className="space-y-1.5">
              {incident.safetyGuidelines.map((sop, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{sop}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Status Progression Workflow & Team Assignment */}
          <div className="bg-cyan-50/50 border border-cyan-200/60 rounded-xl p-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-cyan-700" />
                Incident Lifecycle & Dispatch State Machine
              </h4>
              
              {/* Stepper buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUS_FLOW.map((st, i) => {
                  const isCurrent = incident.status === st;
                  const stepNum = i + 1;

                  return (
                    <button
                      key={st}
                      onClick={() => handleUpdate(st)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                        isCurrent
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md ring-2 ring-cyan-500/30'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{stepNum}.</span>
                      <span className="truncate">{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team assignment dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-cyan-200/40">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Assigned Emergency Response Unit
                </label>
                <select
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-cyan-600"
                >
                  {TEAMS_LIST.map((team, idx) => (
                    <option key={idx} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Add Dispatcher Log Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter dispatch notes, boat status, water pumps..."
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
                  />
                  <button
                    onClick={() => handleUpdate(incident.status)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Audit Trail & Historical Log */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Incident Audit Trail & History
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {incident.history.map((hist, idx) => (
                <div key={idx} className="p-3 text-xs flex items-start justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{hist.author}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {hist.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{hist.note}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {hist.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            AquaRescue Ops • RTK GPS Synchronized
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
