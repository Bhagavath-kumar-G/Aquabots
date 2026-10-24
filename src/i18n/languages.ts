export type CoverageLevel = 'full' | 'core' | 'partial';
export type LanguageCategory = 'indian' | 'international';

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  category: LanguageCategory;
  isRtl?: boolean;
  coverage: CoverageLevel;
  coveragePercent: number;
  region: string;
}

export const LANGUAGES: LanguageMeta[] = [
  // Indian Languages (Schedule 8 & Major Indian Disaster Response Languages)
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 100,
    region: 'National / Official'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 100,
    region: 'Tamil Nadu & Puducherry'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 100,
    region: 'National Official / North & Central'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'Andhra Pradesh & Telangana'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'Karnataka'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'Kerala & Lakshadweep'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'West Bengal & Tripura'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'Maharashtra'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'Gujarat'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    category: 'indian',
    coverage: 'full',
    coveragePercent: 95,
    region: 'Punjab'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    category: 'indian',
    isRtl: true,
    coverage: 'full',
    coveragePercent: 95,
    region: 'National / J&K / Telangana'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    category: 'indian',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Odisha'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    category: 'indian',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Assam'
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 70,
    region: 'Classical / National'
  },
  {
    code: 'kok',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 70,
    region: 'Goa & Coastal Karnataka'
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'کٲشُر',
    category: 'indian',
    isRtl: true,
    coverage: 'partial',
    coveragePercent: 70,
    region: 'Jammu & Kashmir'
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    category: 'indian',
    isRtl: true,
    coverage: 'partial',
    coveragePercent: 70,
    region: 'National'
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    category: 'indian',
    coverage: 'core',
    coveragePercent: 85,
    region: 'Sikkim & West Bengal'
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बर’',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 65,
    region: 'Assam'
  },
  {
    code: 'doi',
    name: 'Dogri',
    nativeName: 'डोगरी',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 65,
    region: 'Jammu'
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 65,
    region: 'Bihar & Jharkhand'
  },
  {
    code: 'mni',
    name: 'Manipuri (Meitei)',
    nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 65,
    region: 'Manipur'
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    category: 'indian',
    coverage: 'partial',
    coveragePercent: 65,
    region: 'Jharkhand & Odisha'
  },

  // International Languages
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'Spain & Latin America'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'France & Francophone'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'Germany, Austria, Switzerland'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    category: 'international',
    isRtl: true,
    coverage: 'full',
    coveragePercent: 100,
    region: 'Middle East & North Africa'
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'China & Global'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'Japan'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'Brazil & Portugal'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    category: 'international',
    coverage: 'full',
    coveragePercent: 100,
    region: 'Eastern Europe & Central Asia'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Italy'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Netherlands & Belgium'
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Ukraine'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    category: 'international',
    coverage: 'core',
    coveragePercent: 90,
    region: 'South Korea'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Indonesia'
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Malaysia & Singapore'
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Thailand'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Vietnam'
  },
  {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino / Tagalog',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Philippines'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'Turkey'
  },
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    category: 'international',
    isRtl: true,
    coverage: 'core',
    coveragePercent: 88,
    region: 'Iran & Afghanistan'
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    category: 'international',
    isRtl: true,
    coverage: 'core',
    coveragePercent: 88,
    region: 'Israel'
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    category: 'international',
    coverage: 'core',
    coveragePercent: 88,
    region: 'East Africa'
  }
];

export const getLanguageMeta = (code: string): LanguageMeta => {
  const normalized = code.toLowerCase().split('-')[0];
  const exact = LANGUAGES.find(l => l.code === code.toLowerCase());
  if (exact) return exact;
  const match = LANGUAGES.find(l => l.code === normalized);
  return match || LANGUAGES[0]; // fallback English
};
