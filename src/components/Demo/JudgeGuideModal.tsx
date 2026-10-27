import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Sparkles, 
  Camera, 
  ShieldAlert, 
  Users, 
  RotateCcw,
  Radio,
  Cpu
} from 'lucide-react';

interface JudgeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPriorityMatrix: () => void;
}

export const JudgeGuideModal: React.FC<JudgeGuideModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenPriorityMatrix
}) => {
  const { t } = useTranslation();
  const { 
    simulateRoverObservation, 
    setViewMode, 
    setSelectedIncident, 
    incidents, 
    triggerEmergencyAlertBroadcast,
    resetToDefaultData,
    setFocusedCoordinates
  } = useApp();

  if (!isOpen) return null;

  const handleSwitchToOverview = () => {
    setViewMode('overview');
    onClose();
  };

  const handleSimulateCritical = () => {
    const inc = simulateRoverObservation(0); // Stranded citizens scenario
    setSelectedIncident(inc);
    onClose();
  };

  const handleInspectTopCritical = () => {
    const topCritical = incidents.find(i => i.severity === 'Critical') || incidents[0];
    if (topCritical) {
      setFocusedCoordinates([topCritical.lat, topCritical.lng]);
      setSelectedIncident(topCritical);
      onClose();
    }
  };

  const handleSwitchToPublic = () => {
    setViewMode('public');
    onClose();
  };

  const handleBroadcastAlert = () => {
    triggerEmergencyAlertBroadcast(
      'Monsoon Red Alert: South River Embankment',
      'Water discharge elevated to 14,000 cusecs. Immediate dispatch of NDRF inflatable boats.'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>{t('judgeTour.title')}</span>
              </h3>
              <p className="text-xs text-slate-300">
                {t('judgeTour.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tour Steps */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed">
            {t('judgeTour.welcome')}
          </p>

          <div className="space-y-3">
            {/* Step 0: Project Concept & Hardware Showcase */}
            <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl flex items-center justify-between gap-3 hover:border-cyan-400 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
                  Project Presentation & Engineering Design
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  Drain Plus Architecture & Engineering Overview
                </h4>
                <p className="text-slate-600 text-[11px]">
                  Explore the ESP32 hardware close-up, pipeline workflow, engineering challenges, and rural panchayat impact.
                </p>
              </div>
              <button
                onClick={handleSwitchToOverview}
                className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-sm flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>View Concept</span>
              </button>
            </div>

            {/* Step 1 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-cyan-400 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">
                  {t('judgeTour.step1Title')}
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {t('judgeTour.step1Heading')}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  {t('judgeTour.step1Desc')}
                </p>
              </div>
              <button
                onClick={handleSimulateCritical}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-sm flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t('judgeTour.step1Btn')}</span>
              </button>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-red-400 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                  {t('judgeTour.step2Title')}
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {t('judgeTour.step2Heading')}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  {t('judgeTour.step2Desc')}
                </p>
              </div>
              <button
                onClick={handleInspectTopCritical}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-sm flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('judgeTour.step2Btn')}</span>
              </button>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-indigo-400 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  {t('judgeTour.step3Title')}
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {t('judgeTour.step3Heading')}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  {t('judgeTour.step3Desc')}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPriorityMatrix();
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('judgeTour.step3Btn')}</span>
              </button>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-emerald-400 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {t('judgeTour.step4Title')}
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {t('judgeTour.step4Heading')}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  {t('judgeTour.step4Desc')}
                </p>
              </div>
              <button
                onClick={handleSwitchToPublic}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-sm flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t('judgeTour.step4Btn')}</span>
              </button>
            </div>

            {/* Step 5 */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-400 transition">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  {t('judgeTour.step5Title')}
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {t('judgeTour.step5Heading')}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  {t('judgeTour.step5Desc')}
                </p>
              </div>
              <button
                onClick={handleBroadcastAlert}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 transition shadow-sm flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{t('judgeTour.step5Btn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to clean baseline?')) {
                resetToDefaultData();
                onClose();
              }
            }}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('judgeTour.resetBaseline')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            {t('judgeTour.closeGuide')}
          </button>
        </div>
      </div>
    </div>
  );
};
