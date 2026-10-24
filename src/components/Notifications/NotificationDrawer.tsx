import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import type { AppNotification } from '../../types';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIncidentById?: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ 
  isOpen, 
  onClose,
  onSelectIncidentById 
}) => {
  const { t } = useTranslation();
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    triggerEmergencyAlertBroadcast,
    incidents,
    setSelectedIncident,
    setFocusedCoordinates
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (activeFilter === 'critical') return n.severity === 'Critical';
    if (activeFilter === 'unread') return !n.read;
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.incidentId) {
      const match = incidents.find(i => i.id === notif.incidentId);
      if (match) {
        setFocusedCoordinates([match.lat, match.lng]);
        if (onSelectIncidentById) {
          onSelectIncidentById(notif.incidentId);
        } else {
          setSelectedIncident(match);
        }
        onClose();
      }
    }
  };

  const getSeverityBadge = (sev: AppNotification['severity']) => {
    switch (sev) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">{t('severity.Critical')}</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-white">{t('severity.High')}</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500 text-white">{t('severity.Medium')}</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600 text-white">{t('severity.Low')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-600 text-white">{t('severity.Info', 'Info')}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end bg-slate-950/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 rounded-xl text-cyan-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{t('notifications.title')}</h3>
              <p className="text-xs text-slate-400">{t('notifications.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Quick Actions */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('notifications.all', { count: notifications.length })}
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'critical' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('notifications.critical')}
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'unread' ? 'bg-cyan-600 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('notifications.unread')}
            </button>
          </div>

          <button
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{t('notifications.markRead')}</span>
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-xs font-medium text-slate-600">{t('notifications.noNotifs')}</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                  !notif.read ? 'bg-cyan-50/40' : ''
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {!notif.read ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 block"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    {getSeverityBadge(notif.severity)}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                    {notif.message}
                  </p>

                  {notif.incidentId && (
                    <div className="mt-2 text-[11px] text-cyan-700 font-semibold flex items-center gap-1 hover:underline">
                      <span>{t('notifications.inspectIncident', { id: notif.incidentId })}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Broadcast Simulated Alert Action (Judge Feature) */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {t('notifications.simulateAlert')}
            </span>
            <span className="text-[10px] text-slate-400">{t('notifications.broadcastDemo')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => triggerEmergencyAlertBroadcast(
                'Adyar Embankment Breach Warning',
                'Water level exceeds safe flood crest at Saidapet point. All ground floor residents evacuated.'
              )}
              className="py-1.5 px-2 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/50 rounded-lg text-[11px] font-bold transition"
            >
              {t('notifications.embankmentBreach')}
            </button>
            <button
              onClick={() => triggerEmergencyAlertBroadcast(
                'Heavy Monsoon Surge Advisory',
                'IMD reports additional 60mm downpour expected in South Zone within 90 minutes. Ambulances on standby.'
              )}
              className="py-1.5 px-2 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/50 rounded-lg text-[11px] font-bold transition"
            >
              {t('notifications.cycloneSurge')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
