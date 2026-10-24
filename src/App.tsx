import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Header/Navbar';
import { StatCards } from './components/Dashboard/StatCards';
import { IncidentMap } from './components/Map/IncidentMap';
import { RoverMonitor } from './components/Rover/RoverMonitor';
import { IncidentList } from './components/Incidents/IncidentList';
import { IncidentDetailModal } from './components/Incidents/IncidentDetailModal';
import { PriorityMatrixModal } from './components/Incidents/PriorityMatrixModal';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { PublicPortal } from './components/Public/PublicPortal';
import { JudgeGuideModal } from './components/Demo/JudgeGuideModal';
import { ProjectOverview } from './components/ProjectOverview/ProjectOverview';
import type { Incident } from './types';
import { ShieldCheck } from 'lucide-react';
import './App.css';

const MainAppContent: React.FC = () => {
  const { 
    viewMode, 
    setViewMode,
    selectedIncident, 
    setSelectedIncident, 
    incidents, 
    setFocusedCoordinates 
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isJudgeGuideOpen, setIsJudgeGuideOpen] = useState(false);
  const [isPriorityMatrixOpen, setIsPriorityMatrixOpen] = useState(false);

  React.useEffect(() => {
    document.title = 'DrainPulse — Smart Storm-Drain Monitoring & Inspection Rover | Seva First 2026';
  }, []);

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleSelectIncidentById = (id: string) => {
    const found = incidents.find(i => i.id === id);
    if (found) {
      setFocusedCoordinates([found.lat, found.lng]);
      setSelectedIncident(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenJudgeGuide={() => setIsJudgeGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'overview' ? (
          /* Project Overview & Engineering Concept Showcase */
          <ProjectOverview 
            onNavigateToDashboard={() => setViewMode('command')}
            onNavigateToPublic={() => setViewMode('public')}
          />
        ) : viewMode === 'command' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Top Dashboard Metrics & Monsoon Warning Ticker */}
            <StatCards />

            {/* Tactical Grid: Interactive Map + Live Rover HUD & Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tactical Leaflet Map (7 cols) */}
              <div className="lg:col-span-7">
                <IncidentMap onSelectIncident={handleSelectIncident} />
              </div>

              {/* Rover Telemetry & Observation Scanner (5 cols) */}
              <div className="lg:col-span-5">
                <RoverMonitor />
              </div>
            </div>

            {/* Full Incident Triage & Dispatch Table / Cards */}
            <IncidentList 
              onSelectIncident={handleSelectIncident}
              onOpenPriorityMatrix={() => setIsPriorityMatrixOpen(true)}
            />
          </div>
        ) : (
          /* Rural Panchayat Public Safety Portal Mode */
          <PublicPortal />
        )}
      </main>

      {/* Modals & Overlays */}
      <IncidentDetailModal 
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      <PriorityMatrixModal 
        isOpen={isPriorityMatrixOpen}
        onClose={() => setIsPriorityMatrixOpen(false)}
      />

      <NotificationDrawer 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectIncidentById={handleSelectIncidentById}
      />

      <JudgeGuideModal 
        isOpen={isJudgeGuideOpen}
        onClose={() => setIsJudgeGuideOpen(false)}
        onOpenPriorityMatrix={() => setIsPriorityMatrixOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">DrainPulse</span>
            <span>— Smart Storm-Drain Monitoring & Inspection Rover</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Team Innovators</span>
            <span className="text-cyan-300 font-semibold">• Seva First Innovation Challenge 2026</span>
            <span className="hidden md:inline">• Village & Panchayat Development</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
