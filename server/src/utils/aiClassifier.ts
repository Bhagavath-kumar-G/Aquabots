import type { ComplaintCategory, AiSuggestion } from '../types/index.js';

interface CategoryKeywords {
  category: ComplaintCategory;
  english: string[];
  tamil: string[];
  baseWeight: number;
}

const CATEGORY_MAP: CategoryKeywords[] = [
  {
    category: 'Blockage',
    english: ['block', 'clog', 'silt', 'sediment', 'debris', 'culvert', 'choked', 'sludge', 'mud', 'slow flow'],
    tamil: ['அடைப்பு', 'கழிவு', 'மண்', 'தூர்வார', 'தடை', 'கால்வாய்'],
    baseWeight: 1.0
  },
  {
    category: 'Solid Waste',
    english: ['plastic', 'trash', 'garbage', 'waste', 'bottle', 'polythene', 'dump', 'refuse', 'bag', 'wrapper'],
    tamil: ['குப்பை', 'பிளாஸ்டிக்', 'கழிவுப்பொருள்', 'பாட்டில்', 'பைகள்'],
    baseWeight: 1.0
  },
  {
    category: 'Severe Waterlogging',
    english: ['waterlog', 'flood', 'ponding', 'submerge', 'inundat', 'stagnant', 'pool', 'overflow', 'knee', 'waist'],
    tamil: ['வெள்ளம்', 'தேக்கம்', 'நீர்', 'மூழ்கியது', 'பெருக்கெடுத்து'],
    baseWeight: 1.0
  },
  {
    category: 'Infrastructure Damage',
    english: ['broken', 'collapse', 'slab', 'grating', 'crack', 'cave-in', 'damage', 'sinkhole', 'cover missing', 'wall eroded'],
    tamil: ['உடைந்த', 'இடிந்தது', 'விரிசல்', 'மூடி இல்லை', 'சேதம்'],
    baseWeight: 1.1
  },
  {
    category: 'Electrical Hazard',
    english: ['wire', 'electric', 'cable', 'transformer', 'spark', 'shock', 'pole', 'current', 'live line'],
    tamil: ['மின்சாரம்', 'கம்பி', 'மின்மாற்றி', 'மின்கசிவு', 'தீப்பொறி'],
    baseWeight: 1.2
  },
  {
    category: 'Trapped Citizens',
    english: ['trap', 'rescue', 'stranded', 'citizen', 'child', 'senior', 'family', 'stuck', 'evacuate'],
    tamil: ['சிக்கிய', 'மீட்பு', 'தவிப்பு', 'முதியவர்', 'குழந்தை'],
    baseWeight: 1.3
  }
];

export function classifyComplaintText(
  title: string,
  description: string,
  hasPhoto: boolean = false
): AiSuggestion {
  const combined = `${title} ${description}`.toLowerCase();
  
  let bestCategory: ComplaintCategory = 'Blockage';
  let highestScore = 0;
  let matchedKeywords: string[] = [];

  for (const item of CATEGORY_MAP) {
    let score = 0;
    const currentMatches: string[] = [];

    for (const kw of item.english) {
      if (combined.includes(kw)) {
        score += 1.5 * item.baseWeight;
        currentMatches.push(kw);
      }
    }

    for (const kw of item.tamil) {
      if (combined.includes(kw)) {
        score += 2.0 * item.baseWeight; // higher weight for specific vernacular terminology
        currentMatches.push(kw);
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = item.category;
      matchedKeywords = currentMatches;
    }
  }

  // Calculate confidence score normalized between 0.35 and 0.94
  // Never claims 100% certainty (strictly follows guideline: suggestion with confidence, not verified fact)
  let confidence = 0.40;
  if (highestScore > 0) {
    confidence = Math.min(0.92, 0.45 + (highestScore * 0.1) + (hasPhoto ? 0.08 : 0));
  }
  confidence = Math.round(confidence * 100) / 100;

  const reasoning = matchedKeywords.length > 0
    ? `Heuristic pattern matched [${matchedKeywords.slice(0, 4).join(', ')}] in report text.${hasPhoto ? ' Image evidence attached for visual verification.' : ''}`
    : 'Default baseline suggestion based on standard monsoon stormwater report.';

  return {
    suggestedCategory: bestCategory,
    confidence,
    reasoning,
    detectedKeywords: matchedKeywords
  };
}
