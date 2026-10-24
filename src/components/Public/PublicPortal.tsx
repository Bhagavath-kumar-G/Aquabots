import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import type { IncidentCategory } from '../../types';
import { 
  ShieldCheck, 
  MapPin, 
  Send, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  LifeBuoy, 
  Home, 
  Check
} from 'lucide-react';

export const PublicPortal: React.FC = () => {
  const { t } = useTranslation();
  const { incidents, shelters, submitCitizenReport } = useApp();

  // Citizen Report Form State
  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDepth, setReportDepth] = useState('0.75');
  const [reportCategory, setReportCategory] = useState<IncidentCategory>('Severe Waterlogging');
  const [reportDescription, setReportDescription] = useState('');
  const [reportContact, setReportContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Filter for public road view
  const [publicFilter, setPublicFilter] = useState<'all' | 'critical' | 'waterlogged'>('all');

  const publicIncidents = incidents.filter(i => {
    if (publicFilter === 'critical') return i.severity === 'Critical' || i.severity === 'High';
    if (publicFilter === 'waterlogged') return i.waterDepthMeters >= 0.5;
    return true;
  });

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportLocation.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Default coordinates near central flood corridor with slight random offset
      const lat = Number((12.985 + (Math.random() - 0.5) * 0.02).toFixed(5));
      const lng = Number((80.220 + (Math.random() - 0.5) * 0.02).toFixed(5));

      const newInc = submitCitizenReport({
        title: reportTitle,
        description: reportDescription || `Citizen report from ${reportLocation}. Water depth approximately ${reportDepth}m.`,
        locationName: reportLocation,
        lat,
        lng,
        waterDepthMeters: parseFloat(reportDepth) || 0.5,
        category: reportCategory,
        reporterContact: reportContact || 'Anonymous Citizen',
        photoUrl: '/images/underpass_flood.jpg'
      });

      setIsSubmitting(false);
      setSubmittedRef(newInc.id);
      setReportTitle('');
      setReportLocation('');
      setReportDescription('');
      setReportContact('');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner for Citizens */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 border border-blue-800/50 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            {t('public.badge')}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t('public.heroTitle')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {t('public.heroDesc')}
          </p>
        </div>

        {/* Emergency Helpline Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-cyan-300 font-bold uppercase block">{t('public.disasterHelpline')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">1070</div>
            <span className="text-[10px] text-slate-300">{t('public.disasterHelplineDesc')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-red-300 font-bold uppercase block">{t('public.emergencySos')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">112</div>
            <span className="text-[10px] text-slate-300">{t('public.emergencySosDesc')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">{t('public.medicalAmbulance')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">108</div>
            <span className="text-[10px] text-slate-300">{t('public.medicalAmbulanceDesc')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">{t('public.electricitySos')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">1912</div>
            <span className="text-[10px] text-slate-300">{t('public.electricitySosDesc')}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Citizen Report Form + Verified Relief Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Citizen Flood Hazard Reporting Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-600" />
              {t('public.reportTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('public.reportSubtitle')}
            </p>
          </div>

          {submittedRef ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">{t('public.reportSuccess')}</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                {t('public.reportSuccessDesc', { ref: submittedRef })}
              </p>
              <button
                onClick={() => setSubmittedRef(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
              >
                {t('public.submitAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldTitle')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('public.fieldTitlePlaceholder')}
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldCategory')}
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as IncidentCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Severe Waterlogging">{t('category.Severe Waterlogging')}</option>
                    <option value="Trapped Citizens">{t('category.Trapped Citizens')}</option>
                    <option value="Submerged Vehicle">{t('category.Submerged Vehicle')}</option>
                    <option value="Electrical Hazard">{t('category.Electrical Hazard')}</option>
                    <option value="Structural Risk">{t('category.Structural Risk')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldLocation')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('public.fieldLocationPlaceholder')}
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldDepth')}
                  </label>
                  <select
                    value={reportDepth}
                    onChange={(e) => setReportDepth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="0.25">{t('public.depthAnkle')}</option>
                    <option value="0.60">{t('public.depthKnee')}</option>
                    <option value="1.10">{t('public.depthWaist')}</option>
                    <option value="1.60">{t('public.depthChest')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('public.fieldDetails')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('public.fieldDetailsPlaceholder')}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldContact')}
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={reportContact}
                    onChange={(e) => setReportContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-600/20 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>{t('public.transmitting')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t('public.submitReport')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Verified Relief Shelters & Camps (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                {t('public.reliefShelters')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('public.reliefSheltersDesc')}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {t('public.openNow')}
            </span>
          </div>

          <div className="space-y-3">
            {shelters.map((shelter) => {
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`;
              const occupancyPct = Math.round((shelter.occupancy / shelter.capacity) * 100);

              return (
                <div 
                  key={shelter.id}
                  className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-indigo-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{shelter.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{shelter.address}</span>
                      </p>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <span>{t('public.directions')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium mb-1">
                      <span>{t('public.occupancy', { occupancy: shelter.occupancy, capacity: shelter.capacity })}</span>
                      <span className="font-bold text-slate-800">{t('public.pctFull', { pct: occupancyPct })}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${occupancyPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${occupancyPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Supplies */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {shelter.suppliesAvailable.slice(0, 3).map((sup, idx) => (
                      <span key={idx} className="text-[9px] bg-white text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                        ✓ {sup}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Public Flooded Roads & Incident Warnings Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t('public.roadAdvisories')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('public.roadAdvisoriesDesc')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setPublicFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                publicFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('public.allAdvisories')}
            </button>
            <button
              onClick={() => setPublicFilter('critical')}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                publicFilter === 'critical' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('public.extremeHazards')}
            </button>
            <button
              onClick={() => setPublicFilter('waterlogged')}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                publicFilter === 'waterlogged' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('public.deepWater')}
            </button>
          </div>
        </div>

        {/* Public Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicIncidents.map((incident) => {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${incident.lat},${incident.lng}`;
            const isSevere = incident.severity === 'Critical' || incident.severity === 'High';

            return (
              <div 
                key={incident.id}
                className="bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="relative h-36 bg-slate-900 overflow-hidden">
                    <img 
                      src={incident.imageUrl} 
                      alt={incident.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isSevere ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {incident.severity === 'Critical' ? t('public.avoidRoad') : t('public.driveCaution')}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                      <h4 className="font-bold text-xs leading-tight truncate">{incident.locationName}</h4>
                      <span className="text-[10px] text-cyan-300 font-mono font-medium">{incident.ward}</span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 text-xs">
                    <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2">
                      {incident.description}
                    </p>

                    <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">{t('public.waterLevel')}</span>
                        <span className="font-bold text-sky-700 font-mono">🌊 {incident.waterDepthMeters.toFixed(2)} meters</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">{t('public.status')}</span>
                        <span className="font-semibold text-slate-800">{t(`status.${incident.status}`)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{incident.reportedAt}</span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Citizen Safety Guidelines & Flood Do's and Don'ts */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800">
        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-cyan-300">
          <LifeBuoy className="w-5 h-5 text-cyan-400" />
          {t('public.safetyRules')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('public.dos')}
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>{t('public.do1')}</li>
              <li>{t('public.do2')}</li>
              <li>{t('public.do3')}</li>
              <li>{t('public.do4')}</li>
            </ul>
          </div>

          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <h4 className="font-bold text-red-400 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {t('public.donts')}
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>{t('public.dont1')}</li>
              <li>{t('public.dont2')}</li>
              <li>{t('public.dont3')}</li>
              <li>{t('public.dont4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
