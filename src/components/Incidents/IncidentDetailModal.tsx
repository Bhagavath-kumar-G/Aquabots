import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import type { Incident, IncidentStatus, Severity, IncidentCategory } from '../../types';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Send, 
  Copy, 
  Check,
  Sparkles,
  AlertTriangle,
  Camera,
  UserCheck
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ 
  incident, 
  onClose 
}) => {
  const { updateIncidentStatus, updateIncidentDetails } = useApp();

  const [assignedTeam, setAssignedTeam] = useState<string>(
    incident?.assignedTeam || 'Panchayat Sanitation Crew A-1'
  );
  const [dispatchNote, setDispatchNote] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Resolution verification state
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [resolutionPhotoPreview, setResolutionPhotoPreview] = useState<string | null>(null);

  // Human category review state
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedConfirmedCat, setSelectedConfirmedCat] = useState<IncidentCategory>(
    incident?.confirmedCategory || incident?.category || 'Blockage'
  );
  const [categoryReviewer, setCategoryReviewer] = useState('');

  if (!incident) return null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`;

  const STATUS_FLOW: IncidentStatus[] = [
    'Submitted',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Reopened'
  ];

  const TEAMS_LIST = [
    'Panchayat Sanitation Crew A-1 (Desilting Squad)',
    'Municipal High-Capacity Dewatering Pump Crew 3',
    'TNEB Electrical Safety & Grid Squad',
    'SDRF Flood Unit Delta-2 (Inflatable Boat)',
    'NDRF Battalion 4 Water Rescue Team',
    'Panchayat Rural Road Engineering Unit'
  ];

  const handleUpdate = async (newStatus: IncidentStatus) => {
    if (newStatus === 'Resolved') {
      // Open resolution verification form (Mandatory authorized personnel check)
      setShowResolutionForm(true);
      return;
    }

    // Try backend API update
    await apiService.updateComplaintStatus({
      id: incident.id,
      newStatus,
      author: 'Panchayat Operator',
      note: dispatchNote || undefined
    });

    // Sync in AppContext
    updateIncidentStatus(incident.id, newStatus, dispatchNote || undefined, assignedTeam);
    setDispatchNote('');
  };

  const handleConfirmResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedBy.trim() || !resolutionNote.trim()) {
      alert('Verification requires officer name/badge and resolution notes.');
      return;
    }

    await apiService.updateComplaintStatus({
      id: incident.id,
      newStatus: 'Resolved',
      author: verifiedBy,
      note: resolutionNote,
      verifiedBy,
      resolutionNote,
      resolutionPhoto: resolutionPhoto || undefined
    });

    updateIncidentStatus(
      incident.id, 
      'Resolved', 
      `[VERIFIED RESOLUTION by ${verifiedBy}]: ${resolutionNote}`, 
      assignedTeam
    );

    setShowResolutionForm(false);
    setVerifiedBy('');
    setResolutionNote('');
    setResolutionPhoto(null);
  };

  const handleConfirmCategoryReview = async () => {
    if (!categoryReviewer.trim()) {
      alert('Reviewer name is required to confirm category.');
      return;
    }

    await apiService.confirmCategory(
      incident.id,
      selectedConfirmedCat,
      categoryReviewer,
      'Confirmed after human field inspection.'
    );

    updateIncidentDetails(incident.id, {
      confirmedCategory: selectedConfirmedCat,
      category: selectedConfirmedCat
    });
    setIsEditingCategory(false);
    setCategoryReviewer('');
  };

  const handleDuplicateAction = async (action: 'Merge' | 'Dismiss') => {
    await apiService.handleDuplicateAction(
      incident.id,
      action,
      'Panchayat Dispatch Lead'
    );
    if (incident.duplicateFlag) {
      const updatedFlag = {
        ...incident.duplicateFlag,
        status: (action === 'Merge' ? 'Merged' : 'Dismissed') as 'Merged' | 'Dismissed',
        isDuplicate: action === 'Merge'
      };
      updateIncidentDetails(incident.id, {
        duplicateFlag: updatedFlag
      });
    }
  };

  const handleCopySITREP = () => {
    const sitrep = `
=== AQUABOTS PANCHAYAT DRAINAGE SITREP ===
Incident ID: ${incident.id}
Classification: ${incident.severity.toUpperCase()} (${incident.category})
Confirmed Category: ${incident.confirmedCategory || incident.category}
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
==========================================
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getSeverityBadgeClass(incident.severity)}`}>
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {incident.id}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {incident.category}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-200 border border-cyan-700">
                  {incident.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5 leading-snug">
                {incident.title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          
          {/* Duplicate Notice & Human Review Banner */}
          {incident.duplicateFlag?.isDuplicate && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start justify-between gap-3 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-xs">Potential Duplicate Incident Flagged</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">{incident.duplicateFlag.reason}</p>
                </div>
              </div>
              {incident.duplicateFlag.status === 'Unmerged' ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDuplicateAction('Merge')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] transition"
                  >
                    Merge
                  </button>
                  <button
                    onClick={() => handleDuplicateAction('Dismiss')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold text-[10px] transition"
                  >
                    Keep Separate
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  {incident.duplicateFlag.status}
                </span>
              )}
            </div>
          )}

          {/* AI Category Suggestion & Human Correction Strip */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">
                  Classification: <strong>{incident.confirmedCategory || incident.category}</strong>
                </span>
                {incident.aiSuggestion && (
                  <span className="text-[10px] text-slate-500">
                    AI Suggestion: {incident.aiSuggestion.suggestedCategory} ({Math.round(incident.aiSuggestion.confidence * 100)}% confidence) • Suggestion only
                  </span>
                )}
              </div>
            </div>

            {isEditingCategory ? (
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={selectedConfirmedCat}
                  onChange={(e) => setSelectedConfirmedCat(e.target.value as IncidentCategory)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Blockage">Blockage</option>
                  <option value="Solid Waste">Solid Waste</option>
                  <option value="Severe Waterlogging">Severe Waterlogging</option>
                  <option value="Infrastructure Damage">Infrastructure Damage</option>
                  <option value="Electrical Hazard">Electrical Hazard</option>
                  <option value="Trapped Citizens">Trapped Citizens</option>
                </select>
                <input
                  type="text"
                  placeholder="Reviewer Name"
                  value={categoryReviewer}
                  onChange={(e) => setCategoryReviewer(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs w-28"
                />
                <button
                  onClick={handleConfirmCategoryReview}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingCategory(false)}
                  className="px-2 py-1 text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingCategory(true)}
                className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] font-bold transition"
              >
                Review / Correct Category
              </button>
            )}
          </div>

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="font-bold text-slate-900">{incident.locationName}</span>
                <span className="text-[10px] text-slate-400 font-mono">({incident.ward})</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                {incident.description}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-700 hover:text-cyan-800 font-bold inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={handleCopySITREP}
                  className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 text-[11px] font-medium"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'SITREP Copied!' : 'Copy SITREP'}</span>
                </button>
              </div>
            </div>

            {/* Photo / Telemetry Evidence */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-40 border border-slate-200">
              <img 
                src={incident.imageUrl} 
                alt={incident.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-[11px]">
                <span className="font-mono">Water Depth: <strong>{incident.waterDepthMeters.toFixed(2)}m</strong></span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] font-mono">
                  Score: {incident.dispatchPriorityScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Section: Priority Reasoning */}
          <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block mb-0.5">
              Transparent Priority Reasoning
            </span>
            <p className="text-cyan-950 text-xs leading-relaxed font-medium">
              {incident.priorityReason}
            </p>
          </div>

          {/* Section: Status Progression Workflow (Lifecycle State Machine) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-cyan-700" />
                Verified Complaint Lifecycle
              </h4>
              
              {/* Stepper buttons for the 6 states */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {STATUS_FLOW.map((st, i) => {
                  const isCurrent = incident.status === st;

                  return (
                    <button
                      key={st}
                      onClick={() => handleUpdate(st)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 transition border ${
                        isCurrent
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-md ring-2 ring-cyan-500/30'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-[9px] opacity-75">{i + 1}</span>
                      <span className="truncate">{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Verification Form Modal View (Required before Resolved) */}
            {showResolutionForm && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mandatory Authorized Personnel Resolution Verification</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Panchayat operating policy requires authorized staff to verify resolution evidence before closing this complaint.
                </p>

                <form onSubmit={handleConfirmResolution} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Authorized Officer Name / Badge ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. S. Murugan (Ward Officer 14)"
                        value={verifiedBy}
                        onChange={(e) => setVerifiedBy(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Resolution Evidence Photo (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setResolutionPhoto(f);
                            setResolutionPhotoPreview(URL.createObjectURL(f));
                          }
                        }}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800"
                      />
                      {resolutionPhotoPreview && (
                        <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-300 shadow-sm">
                          <img 
                            src={resolutionPhotoPreview} 
                            alt="Resolution Evidence Preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Field Resolution & Desilting Notes *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe clearing work performed, pumps used, water level drop, and drainage restoration..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResolutionForm(false)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Verify & Close Complaint
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Verified Resolution Badge if already resolved */}
            {incident.resolutionEvidence && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-emerald-900 font-bold">
                  <span>✓ Verified Resolution on Record</span>
                  <span className="font-mono text-[10px] text-emerald-700">{incident.resolutionEvidence.verifiedAt}</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  <strong>Verified by:</strong> {incident.resolutionEvidence.verifiedBy} — {incident.resolutionEvidence.note}
                </p>
              </div>
            )}

            {/* Crew assignment and dispatcher log note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Assigned Emergency Response Crew
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
                  Add Dispatcher Audit Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter dispatch notes, boat status, pump deployment..."
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

          {/* Section: Complete Audit Trail */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Audit Trail & History Log
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
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
                    {hist.evidenceUrl && (
                      <a
                        href={hist.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-cyan-600 hover:underline mt-1"
                      >
                        <Camera className="w-3 h-3" />
                        <span>View Resolution Evidence Photo</span>
                      </a>
                    )}
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
            AquaBots Ops Engine • Verified Audit Trail Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
