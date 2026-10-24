import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, getLanguageMeta } from './languages';

import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import te from './locales/te.json';
import bn from './locales/bn.json';

const STORAGE_KEY = 'aquarescue_language';

// Detect initial language: localStorage -> browser language -> English
export const getInitialLanguage = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserCode = navigator.language.toLowerCase().split('-')[0];
      const match = LANGUAGES.find(l => l.code === browserCode);
      if (match) return match.code;
    }
  } catch (e) {
    console.warn('Language detection fallback to en:', e);
  }
  return 'en';
};

const initialLang = getInitialLanguage();

// Scalable resources map
const resources: Record<string, { translation: typeof en }> = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
  es: { translation: es },
  ar: { translation: ar },
  te: { translation: te },
  bn: { translation: bn }
};

// For remaining languages in registry, seed fallback copy so every language is safely selectable
LANGUAGES.forEach(lang => {
  if (!resources[lang.code]) {
    resources[lang.code] = {
      translation: {
        ...en,
        nav: {
          ...en.nav,
          currentLanguage: `${lang.nativeName} (${lang.name})`
        }
      }
    };
  }
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes
    },
    react: {
      useSuspense: false
    }
  });

// Apply document attributes (dir and lang)
export const applyLanguageDom = (langCode: string) => {
  if (typeof document === 'undefined') return;
  const meta = getLanguageMeta(langCode);
  document.documentElement.lang = meta.code;
  document.documentElement.dir = meta.isRtl ? 'rtl' : 'ltr';
  if (meta.isRtl) {
    document.documentElement.classList.add('rtl-mode');
  } else {
    document.documentElement.classList.remove('rtl-mode');
  }
};

// Initial DOM setup
applyLanguageDom(initialLang);

// Language changer helper
export const setApplicationLanguage = async (code: string) => {
  try {
    await i18n.changeLanguage(code);
    applyLanguageDom(code);
    localStorage.setItem(STORAGE_KEY, code);
  } catch (err) {
    console.error('Failed to switch language to', code, err);
  }
};

export default i18n;
