import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
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
  Check,
  Mic,
  MicOff,
  Sparkles,
  Image as ImageIcon,
  X
} from 'lucide-react';

export const PublicPortal: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  // Photo upload state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice speech-to-text state (Tamil & English support)
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showVoiceTranscriptReview, setShowVoiceTranscriptReview] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [publicFilter, setPublicFilter] = useState<'all' | 'critical' | 'waterlogged'>('all');

  // Derived live AI classification suggestion based on description & title text
  const aiSuggestion = useMemo(() => {
    const text = `${reportTitle} ${reportDescription}`.toLowerCase();
    if (text.length < 5) return null;

    if (/அடைப்பு|block|clog|silt|culvert|sediment|choked/i.test(text)) {
      return {
        category: 'Blockage' as IncidentCategory,
        confidence: 0.88,
        reasoning: 'Detected drainage flow restriction and culvert blockage keywords.'
      };
    } else if (/குப்பை|plastic|trash|garbage|waste|bottle/i.test(text)) {
      return {
        category: 'Solid Waste' as IncidentCategory,
        confidence: 0.85,
        reasoning: 'Detected plastic refuse and uncollected solid waste accumulating in drain.'
      };
    } else if (/உடைந்த|slab|grating|broken|collapse|damage/i.test(text)) {
      return {
        category: 'Infrastructure Damage' as IncidentCategory,
        confidence: 0.90,
        reasoning: 'Detected fractured concrete slab or missing storm-drain grating hazard.'
      };
    } else if (/மின்சாரம்|wire|electric|cable|shock|transformer/i.test(text)) {
      return {
        category: 'Electrical Hazard' as IncidentCategory,
        confidence: 0.93,
        reasoning: 'Detected electrical wire or transformer hazard submerged in floodwater.'
      };
    } else if (/வெள்ளம்|waterlog|flood|ponding|submerge|stagnat/i.test(text)) {
      return {
        category: 'Severe Waterlogging' as IncidentCategory,
        confidence: 0.84,
        reasoning: 'Detected street waterlogging and arterial roadway inundation.'
      };
    }
    return null;
  }, [reportTitle, reportDescription]);

  // Derived duplicate warning
  const duplicateWarning = useMemo(() => {
    if (!reportLocation.trim()) return null;
    const locLower = reportLocation.toLowerCase().trim();
    const match = incidents.find(
      i => i.status !== 'Resolved' && i.locationName.toLowerCase().includes(locLower)
    );
    if (match) {
      return {
        id: match.id,
        location: match.locationName,
        category: match.category
      };
    }
    return null;
  }, [reportLocation, incidents]);

  // Speech Recognition Toggle (Tamil / Voice Input)
  const toggleListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechError(t('public.speechNotSupported', 'Voice input is not supported in this browser. Please use the quick Tamil phrases below.'));
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      // Set to Tamil (India) or current language
      recognition.lang = i18n.language === 'ta' ? 'ta-IN' : 'ta-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setReportDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
        setShowVoiceTranscriptReview(true);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setSpeechError(t('public.speechError', 'Voice capture paused. You can edit the text box manually.'));
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setSpeechError(e.message || 'Could not start speech recognition');
      setIsListening(false);
    }
  };

  // Quick Tamil Phrase Presets (accessible fallback)
  const applyTamilPhrase = (phrase: string, cat: IncidentCategory) => {
    setReportDescription(prev => (prev ? `${prev} • ${phrase}` : phrase));
    setReportCategory(cat);
  };

  // Handle Photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('public.photoTooLarge', 'Photo size must be less than 5 MB.'));
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleClearPhoto = () => {
    setSelectedPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const publicIncidents = incidents.filter(i => {
    if (publicFilter === 'critical') return i.severity === 'Critical' || i.severity === 'High';
    if (publicFilter === 'waterlogged') return i.waterDepthMeters >= 0.5;
    return true;
  });

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportLocation.trim()) return;

    setIsSubmitting(true);

    const lat = Number((12.985 + (Math.random() - 0.5) * 0.02).toFixed(5));
    const lng = Number((80.220 + (Math.random() - 0.5) * 0.02).toFixed(5));

    // Try backend submission first with FormData (supporting photo upload)
    const formData = new FormData();
    formData.append('title', reportTitle);
    formData.append('description', reportDescription || `Citizen report from ${reportLocation}. Water depth approx ${reportDepth}m.`);
    formData.append('locationName', reportLocation);
    formData.append('category', reportCategory);
    formData.append('waterDepthMeters', reportDepth);
    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());
    formData.append('reporterContact', reportContact || 'Anonymous Citizen');
    if (selectedPhoto) {
      formData.append('photo', selectedPhoto);
    }

    const res = await apiService.submitComplaint(formData);

    if (res.success && res.data) {
      setSubmittedRef(res.data.id);
    } else {
      // Offline fallback: save to AppContext
      const newInc = submitCitizenReport({
        title: reportTitle,
        description: reportDescription || `Citizen report from ${reportLocation}. Water depth approximately ${reportDepth}m.`,
        locationName: reportLocation,
        lat,
        lng,
        waterDepthMeters: parseFloat(reportDepth) || 0.5,
        category: reportCategory,
        reporterContact: reportContact || 'Anonymous Citizen',
        photoUrl: photoPreview || '/images/drainpulse/drain_inspection_waste.jpg'
      });
      setSubmittedRef(newInc.id);
    }

    setIsSubmitting(false);
    setReportTitle('');
    setReportLocation('');
    setReportDescription('');
    setReportContact('');
    handleClearPhoto();
    setShowVoiceTranscriptReview(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner for Citizens */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 border border-blue-800/50 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            {t('public.badge', 'Panchayat Citizen Public Portal')}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {t('public.heroTitle', 'Smart Drainage & Flood Emergency Response')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {t('public.heroDesc', 'Report clogged culverts, upload hazard evidence, view real-time road closures, and find verified emergency relief shelters across your Panchayat ward.')}
          </p>
        </div>

        {/* Emergency Helpline Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-cyan-300 font-bold uppercase block">{t('public.disasterHelpline', 'Disaster Helpline')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">1070</div>
            <span className="text-[10px] text-slate-300">{t('public.disasterHelplineDesc', 'State Disaster Mgmt')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-red-300 font-bold uppercase block">{t('public.emergencySos', 'Emergency SOS')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">112</div>
            <span className="text-[10px] text-slate-300">{t('public.emergencySosDesc', 'Police & Flood Rescue')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">{t('public.medicalAmbulance', 'Medical Ambulance')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">108</div>
            <span className="text-[10px] text-slate-300">{t('public.medicalAmbulanceDesc', 'Emergency Ambulance')}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">{t('public.electricitySos', 'Electricity Hazard')}</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">1912</div>
            <span className="text-[10px] text-slate-300">{t('public.electricitySosDesc', 'Power Grid Disconnect')}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Enhanced Citizen Complaint Form + Verified Relief Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Citizen Flood Hazard & Drainage Reporting Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-600" />
                {t('public.reportTitle', 'Report Drain Blockage or Flood Hazard')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('public.reportSubtitle', 'Submit photo evidence, voice complaint (தமிழ்), and track field resolution status.')}
              </p>
            </div>
          </div>

          {submittedRef ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">{t('public.reportSuccess', 'Complaint Logged in Panchayat Queue')}</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Reference ID: <strong className="font-mono text-emerald-950 font-bold">{submittedRef}</strong>. Our Panchayat field crew will inspect the reported site. Verified evidence will be recorded prior to resolution.
              </p>
              <button
                onClick={() => setSubmittedRef(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                {t('public.submitAnother', 'Submit Another Complaint')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* Duplicate Warning Notice */}
              {duplicateWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Nearby Problem Already Active</span>
                    <p className="text-[11px] text-amber-700 leading-snug">
                      An active report (<strong className="font-mono">#{duplicateWarning.id}</strong> — {duplicateWarning.category}) exists near {duplicateWarning.location}. You can still submit additional photos or details; Panchayat staff will review before merging.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldTitle', 'Complaint Title')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('public.fieldTitlePlaceholder', 'e.g. Culvert blocked with plastic waste')}
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldCategory', 'Category')}
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as IncidentCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Blockage">Blockage (கால்வாய் அடைப்பு)</option>
                    <option value="Solid Waste">Solid Waste (குப்பைக் கழிவுகள்)</option>
                    <option value="Severe Waterlogging">Severe Waterlogging (வெள்ள நீர் தேக்கம்)</option>
                    <option value="Infrastructure Damage">Infrastructure Damage (உடைந்த கால்வாய்/மூடி)</option>
                    <option value="Electrical Hazard">Electrical Hazard (மின்சார அபாயம்)</option>
                    <option value="Trapped Citizens">Trapped Citizens (மீட்பு உதவி)</option>
                  </select>
                </div>
              </div>

              {/* AI Category Suggestion Pill (Confidence Indicator, Not Verified Fact) */}
              {aiSuggestion && aiSuggestion.category !== reportCategory && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      AI Suggestion: <strong>{aiSuggestion.category}</strong> ({Math.round(aiSuggestion.confidence * 100)}% confidence)
                    </span>
                    <span className="text-[10px] text-indigo-500 hidden sm:inline">• Suggestion only</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportCategory(aiSuggestion.category)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition shrink-0"
                  >
                    Use Suggestion
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldLocation', 'Location / Landmark')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('public.fieldLocationPlaceholder', 'e.g. Sluice Gate, Near Panchayat School')}
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldDepth', 'Observed Water Depth')}
                  </label>
                  <select
                    value={reportDepth}
                    onChange={(e) => setReportDepth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="0.25">Ankle Depth (~0.25m / கணுக்கால்)</option>
                    <option value="0.60">Knee Depth (~0.60m / முழங்கால்)</option>
                    <option value="1.10">Waist Depth (~1.10m / இடுப்பளவு)</option>
                    <option value="1.60">Chest Deep / Submerged (~1.60m+)</option>
                  </select>
                </div>
              </div>

              {/* Description & Tamil Voice-based Speech-to-Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {t('public.fieldDetails', 'Description & Details')}
                  </label>

                  {/* Speech-to-Text Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                      isListening 
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
                    }`}
                    title="Speak complaint in Tamil (தமிழ்) or English"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Listening... (பேசுங்கள்)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Tamil Voice (குரல் பதிவு)</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={2}
                  placeholder={t('public.fieldDetailsPlaceholder', 'Describe the blockage, debris type, water stagnation, or speak in Tamil...')}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-500 resize-none"
                />

                {/* Voice Review & Edit Notice */}
                {showVoiceTranscriptReview && (
                  <div className="mt-1 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center justify-between">
                    <span>✓ Transcribed speech added. You can review and correct any words above before submitting.</span>
                    <button
                      type="button"
                      onClick={() => setShowVoiceTranscriptReview(false)}
                      className="text-emerald-900 font-bold hover:underline"
                    >
                      OK
                    </button>
                  </div>
                )}

                {/* Speech Error Notice */}
                {speechError && (
                  <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
                    <span>{speechError}</span>
                    <button
                      type="button"
                      onClick={() => setSpeechError(null)}
                      className="text-amber-900 font-bold hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Accessible Voice Fallbacks (Quick Tamil Phrases) */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Quick Tamil Reporting Phrases (விரைவுத் தேர்வு):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyTamilPhrase('சாக்கடை அடைப்பு — கழிவு நீர் பெருக்கெடுத்து ஓடுகிறது', 'Blockage')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] transition border border-slate-200"
                    >
                      + சாக்கடை அடைப்பு
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTamilPhrase('குப்பைக் கழிவுகள் தேங்கி கால்வாய் அடைபட்டுள்ளது', 'Solid Waste')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] transition border border-slate-200"
                    >
                      + குப்பை அடைப்பு
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTamilPhrase('தெருவில் முழங்கால் அளவு வெள்ள நீர் தேங்கியுள்ளது', 'Severe Waterlogging')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] transition border border-slate-200"
                    >
                      + முழங்கால் வெள்ளம்
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTamilPhrase('உடைந்த கால்வாய் மூடி — விபத்து அபாயம்', 'Infrastructure Damage')}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] transition border border-slate-200"
                    >
                      + உடைந்த மூடி
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Evidence Upload Strip */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-3 bg-slate-50/50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Upload Photo Evidence (Optional)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Supports JPG, PNG, WEBP (Max 5MB). Stored securely.
                      </span>
                    </div>
                  </div>

                  {photoPreview ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={photoPreview} 
                        alt="Evidence preview" 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleClearPhoto}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Choose Photo
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Contact & Submit Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('public.fieldContact', 'Phone Number (For verification updates)')}
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
                        <span>{t('public.transmitting', 'Logging to Panchayat Database...')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t('public.submitReport', 'Submit Complaint')}</span>
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
                {t('public.reliefShelters', 'Verified Relief Shelters')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('public.reliefSheltersDesc', 'Panchayat approved storm refuge centers with power & rations.')}
              </p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
              {t('public.openNow', 'Active')}
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
                      <span>{t('public.directions', 'Directions')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Occupancy bar */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium mb-1">
                      <span>{t('public.occupancy', { occupancy: shelter.occupancy, capacity: shelter.capacity, defaultValue: `${shelter.occupancy} / ${shelter.capacity} capacity` })}</span>
                      <span className="font-bold text-slate-800">{occupancyPct}% Full</span>
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
              {t('public.roadAdvisories', 'Panchayat Road Hazards & Flood Advisories')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('public.roadAdvisoriesDesc', 'Monitored storm-drain overflow points and waterlogged thoroughfares.')}
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
              {t('public.allAdvisories', 'All Advisories')}
            </button>
            <button
              onClick={() => setPublicFilter('critical')}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                publicFilter === 'critical' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('public.extremeHazards', 'Critical & High')}
            </button>
            <button
              onClick={() => setPublicFilter('waterlogged')}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                publicFilter === 'waterlogged' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('public.deepWater', 'Waterlogged (>0.5m)')}
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
                        {incident.severity === 'Critical' ? 'Avoid Roadway' : 'Drive with Caution'}
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
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">{t('public.waterLevel', 'Water Depth')}</span>
                        <span className="font-bold text-sky-700 font-mono">🌊 {incident.waterDepthMeters.toFixed(2)} m</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">{t('public.status', 'Status')}</span>
                        <span className="font-semibold text-slate-800">{incident.status}</span>
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
          {t('public.safetyRules', 'Storm-Drain & Monsoon Safety Guidelines')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {t('public.dos', "Essential DO's")}
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>{t('public.do1', 'Report open culvert gratings and rising floodwater immediately.')}</li>
              <li>{t('public.do2', 'Boil all drinking water during waterlogging periods.')}</li>
              <li>{t('public.do3', 'Keep emergency contacts (1070/112) handy on mobile phones.')}</li>
              <li>{t('public.do4', 'Follow verified Panchayat advisories before driving on inundated bridges.')}</li>
            </ul>
          </div>

          <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <h4 className="font-bold text-red-400 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {t('public.donts', "Critical DON'Ts")}
            </h4>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>{t('public.dont1', 'DO NOT dump plastic bags or solid waste into roadside storm drains.')}</li>
              <li>{t('public.dont2', 'DO NOT step into water near submerged transformers or electrical poles.')}</li>
              <li>{t('public.dont3', 'DO NOT attempt to drive vehicles through water deeper than knee level.')}</li>
              <li>{t('public.dont4', 'DO NOT spread unverified social media flood rumors.')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
