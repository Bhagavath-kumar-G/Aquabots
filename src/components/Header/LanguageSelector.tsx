import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, getLanguageMeta, type LanguageMeta } from '../../i18n/languages';
import { setApplicationLanguage } from '../../i18n';
import { 
  Globe, 
  Search, 
  Check, 
  ChevronDown, 
  ShieldCheck
} from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'indian' | 'international'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLang = i18n.language || 'en';
  const currentMeta = useMemo(() => getLanguageMeta(currentLang), [currentLang]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Auto-focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Filtered languages list
  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter(lang => {
      // Category filter
      if (categoryFilter !== 'all' && lang.category !== categoryFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = lang.name.toLowerCase().includes(q);
        const matchNative = lang.nativeName.toLowerCase().includes(q);
        const matchCode = lang.code.toLowerCase().includes(q);
        const matchRegion = lang.region.toLowerCase().includes(q);
        if (!matchName && !matchNative && !matchCode && !matchRegion) return false;
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  const handleSelect = (lang: LanguageMeta) => {
    setApplicationLanguage(lang.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getCoverageBadge = (lang: LanguageMeta) => {
    switch (lang.coverage) {
      case 'full':
        return (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            100% {t('nav.coverageFull', 'Full Support')}
          </span>
        );
      case 'core':
        return (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            {lang.coveragePercent}% {t('nav.coverageCore', 'Core Support')}
          </span>
        );
      case 'partial':
        return (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-950/80 text-amber-400 border border-amber-800">
            {t('nav.coveragePartial', 'Partial')} ({lang.coveragePercent}%)
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700 text-xs font-semibold transition shadow-sm"
        title={t('nav.selectLanguage', 'Select Language')}
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="font-bold tracking-wide truncate max-w-[90px] sm:max-w-[120px]">
          {currentMeta.nativeName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[950] overflow-hidden flex flex-col max-h-[85vh] animate-fade-in text-slate-200">
          {/* Header */}
          <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-cyan-400" />
                {t('nav.selectLanguage', 'Select Language')}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-full">
                {LANGUAGES.length} Languages
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('nav.searchLanguage', 'Search language or country...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px] font-medium">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`flex-1 py-1 rounded-md transition ${
                  categoryFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('nav.allLanguages', 'All')} ({LANGUAGES.length})
              </button>
              <button
                onClick={() => setCategoryFilter('indian')}
                className={`flex-1 py-1 rounded-md transition ${
                  categoryFilter === 'indian' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('nav.indianLanguages', 'Indian')} (23)
              </button>
              <button
                onClick={() => setCategoryFilter('international')}
                className={`flex-1 py-1 rounded-md transition ${
                  categoryFilter === 'international' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('nav.intlLanguages', 'International')} (18)
              </button>
            </div>
          </div>

          {/* Languages Scrollable List */}
          <div className="overflow-y-auto divide-y divide-slate-800/60 flex-1 max-h-72">
            {filteredLanguages.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <p>No matching languages found</p>
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang.toLowerCase() === lang.code.toLowerCase();

                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang)}
                    className={`w-full p-2.5 px-3.5 text-left flex items-center justify-between gap-2 hover:bg-slate-800/80 transition ${
                      isSelected ? 'bg-cyan-950/40 border-l-4 border-cyan-400' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {lang.nativeName}
                        </span>
                        {lang.nativeName !== lang.name && (
                          <span className="text-[11px] text-slate-400">
                            ({lang.name})
                          </span>
                        )}
                        {lang.isRtl && (
                          <span className="text-[9px] font-mono text-purple-300 bg-purple-950 px-1 rounded border border-purple-800">
                            RTL
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {lang.region}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getCoverageBadge(lang)}
                      {isSelected && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Transparency Notice */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Offline Dictionaries
            </span>
            <span className="text-cyan-400 font-mono">Instant Switching</span>
          </div>
        </div>
      )}
    </div>
  );
};
