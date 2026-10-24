import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Incident, Severity, IncidentStatus } from '../../types';
import { 
  AlertTriangle, 
  MapPin, 
  ExternalLink, 
  Search, 
  ShieldAlert, 
  ChevronRight,
  Users
} from 'lucide-react';

interface IncidentListProps {
  onSelectIncident: (incident: Incident) => void;
  onOpenPriorityMatrix: () => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({ 
  onSelectIncident,
  onOpenPriorityMatrix 
}) => {
  const { 
    incidents, 
    filterSeverity, 
    setFilterSeverity, 
    filterStatus, 
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    setFocusedCoordinates
  } = useApp();

  const [viewFormat, setViewFormat] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'score' | 'depth' | 'recent' | 'waiting'>('score');

  // Filtered & sorted incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter(inc => {
        // Severity filter
        if (filterSeverity !== 'All' && inc.severity !== filterSeverity) return false;
        // Status filter
        if (filterStatus !== 'All' && inc.status !== filterStatus) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = inc.title.toLowerCase().includes(q);
          const matchLoc = inc.locationName.toLowerCase().includes(q);
          const matchWard = inc.ward.toLowerCase().includes(q);
          const matchCat = inc.category.toLowerCase().includes(q);
          const matchHaz = inc.hazards.some(h => h.toLowerCase().includes(q));
          if (!matchTitle && !matchLoc && !matchWard && !matchCat && !matchHaz) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.dispatchPriorityScore - a.dispatchPriorityScore;
        if (sortBy === 'depth') return b.waterDepthMeters - a.waterDepthMeters;
        if (sortBy === 'waiting') {
          // Unresolved items with lowest status first
          const order = { 'Submitted': 5, 'Under Review': 4, 'Assigned': 3, 'In Progress': 2, 'Reopened': 5, 'Resolved': 1 };
          return ((order as any)[b.status] || 0) - ((order as any)[a.status] || 0);
        }
        return 0; // default
      });
  }, [incidents, filterSeverity, filterStatus, searchQuery, sortBy]);

  const getSeverityBadgeClass = (sev: Severity) => {
    switch (sev) {
      case 'Critical': return 'bg-red-500/15 text-red-600 border-red-500/30';
      case 'High': return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
      case 'Medium': return 'bg-sky-500/15 text-sky-700 border-sky-500/30';
      case 'Low': return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
    }
  };

  const getStatusBadgeClass = (status: IncidentStatus) => {
    switch (status) {
      case 'Submitted':
      case 'Reported': 
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Under Review':
      case 'Acknowledged': 
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Assigned': 
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'In Progress':
      case 'Response in Progress': 
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Resolved': 
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Reopened': 
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default: 
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Panchayat Complaint Triage & Crew Priority Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {filteredIncidents.length} of {incidents.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by transparent factors: depth, trapped lives, electrical hazards, school/health center proximity, and wait time.
            </p>
          </div>

          {/* Quick Actions: Priority Matrix Modal + View Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPriorityMatrix}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold flex items-center gap-1.5 border border-cyan-200 transition"
              title="Transparent Scoring Formula & Factor Breakdown"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
              <span>Prioritization Rules</span>
            </button>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewFormat('cards')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  viewFormat === 'cards' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewFormat('table')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  viewFormat === 'table' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Search bar (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by location, hazard, ward, blockage keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity filter (3 cols) */}
          <div className="md:col-span-3 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  filterSeverity === sev
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'depth' | 'recent' | 'waiting')}
              className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-cyan-500"
            >
              <option value="score">Sort: Priority Score (High)</option>
              <option value="depth">Sort: Water Depth (Deepest)</option>
              <option value="waiting">Sort: Waiting Backlog</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List Body */}
      {filteredIncidents.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
          <p className="text-sm font-medium text-slate-600">No matching complaints found</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms</p>
        </div>
      ) : viewFormat === 'cards' ? (
        /* CARDS VIEW */
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((incident) => {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`;

            return (
              <div
                key={incident.id}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image & Header */}
                  <div className="relative h-40 bg-slate-900 overflow-hidden">
                    <img
                      src={incident.imageUrl}
                      alt={incident.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
                    
                    {/* Top badging */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getSeverityBadgeClass(incident.severity)} bg-white`}>
                        {incident.severity} • {incident.dispatchPriorityScore}/100
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusBadgeClass(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                        <span>{incident.id}</span>
                        <span>•</span>
                        <span>{incident.source}</span>
                      </div>
                      <h4 className="font-bold text-xs leading-snug line-clamp-1 text-slate-50">
                        {incident.title}
                      </h4>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-3.5 space-y-2.5">
                    {/* Location */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold block text-slate-900 truncate">
                          {incident.locationName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {incident.ward}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Crew Pill */}
                    {incident.assignedTeam && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 font-medium">
                        <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">Unit: {incident.assignedTeam}</span>
                      </div>
                    )}

                    {/* Duplicate Flag Alert */}
                    {incident.duplicateFlag?.isDuplicate && (
                      <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Potential duplicate of #{incident.duplicateFlag.duplicateOfId}</span>
                      </div>
                    )}

                    {/* Metric Pills */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Water Depth</span>
                        <span className="font-bold text-sky-700 flex items-center gap-1 font-mono">
                          🌊 {incident.waterDepthMeters.toFixed(2)} m
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Classification</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {incident.confirmedCategory || incident.category}
                        </span>
                      </div>
                    </div>

                    {/* Priority Reason Snip */}
                    <p className="text-[10px] text-slate-500 line-clamp-1 italic bg-cyan-50/50 p-1 rounded border border-cyan-100">
                      {incident.priorityReason}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Maps</span>
                  </a>

                  <button
                    onClick={() => {
                      setFocusedCoordinates([incident.lat, incident.lng]);
                      onSelectIncident(incident);
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                  >
                    <span>Manage Dispatch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Priority / Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location / Ward</th>
                <th className="py-3 px-4">Assigned Crew</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.map((incident) => {
                const transSeverity = incident.severity;

                return (
                  <tr key={incident.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSeverityBadgeClass(incident.severity)}`}>
                          {transSeverity[0]} • {incident.dispatchPriorityScore}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-xs">
                            {incident.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {incident.id} • {incident.reportedAt}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {incident.confirmedCategory || incident.category}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block truncate max-w-[200px]">
                        {incident.locationName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {incident.ward}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-indigo-900 font-medium bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                        {incident.assignedTeam || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStatusBadgeClass(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setFocusedCoordinates([incident.lat, incident.lng]);
                          onSelectIncident(incident);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-600 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Dispatch
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
