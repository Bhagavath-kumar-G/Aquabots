import type { ComplaintCategory } from '../types/index.js';

export interface PriorityCalculation {
  score: number;
  reason: string;
  factors: {
    categoryWeight: number;
    depthWeight: number;
    vulnerabilityBonus: number;
    waitTimeBonus: number;
    recurrenceBonus: number;
  };
}

export function calculatePriorityScore(params: {
  category: ComplaintCategory;
  waterDepthMeters: number;
  locationName: string;
  createdAt?: string;
  historicalCountAtLocation?: number;
}): PriorityCalculation {
  const { category, waterDepthMeters, locationName, createdAt, historicalCountAtLocation = 1 } = params;

  let baseScore = 20;
  const reasons: string[] = [];

  // Factor 1: Category Severity
  let catWeight = 10;
  if (category === 'Trapped Citizens') {
    catWeight = 45;
    reasons.push('Trapped lives: immediate human danger (+45)');
  } else if (category === 'Electrical Hazard') {
    catWeight = 35;
    reasons.push('Electrical hazard: electrocution risk (+35)');
  } else if (category === 'Infrastructure Damage') {
    catWeight = 25;
    reasons.push('Infrastructure collapse / broken culvert (+25)');
  } else if (category === 'Severe Waterlogging') {
    catWeight = 20;
    reasons.push('Severe stormwater inundation (+20)');
  } else if (category === 'Blockage') {
    catWeight = 15;
    reasons.push('Culvert blockage slowing arterial runoff (+15)');
  } else {
    catWeight = 10;
    reasons.push('Solid waste accumulation (+10)');
  }

  // Factor 2: Water Depth
  let depthWeight = 0;
  if (waterDepthMeters >= 1.2) {
    depthWeight = 30;
    reasons.push(`Extreme depth (${waterDepthMeters.toFixed(1)}m >= 1.2m) (+30)`);
  } else if (waterDepthMeters >= 0.7) {
    depthWeight = 20;
    reasons.push(`High depth (${waterDepthMeters.toFixed(1)}m >= 0.7m) (+20)`);
  } else if (waterDepthMeters >= 0.3) {
    depthWeight = 10;
    reasons.push(`Moderate ponding (${waterDepthMeters.toFixed(1)}m) (+10)`);
  }

  // Factor 3: Proximity to Vulnerable Infrastructure
  let vulnerabilityBonus = 0;
  const locLower = locationName.toLowerCase();
  if (/school|hospital|phc|clinic|market|temple|railway|bus|embankment/i.test(locLower)) {
    vulnerabilityBonus = 15;
    reasons.push('Near vulnerable civic institution/transit hub (+15)');
  }

  // Factor 4: Recurrence (Hotspots)
  let recurrenceBonus = 0;
  if (historicalCountAtLocation > 3) {
    recurrenceBonus = 15;
    reasons.push(`Recurring chronic hotspot (${historicalCountAtLocation} prior reports) (+15)`);
  } else if (historicalCountAtLocation > 1) {
    recurrenceBonus = 8;
    reasons.push(`Repeat problem location (${historicalCountAtLocation} reports) (+8)`);
  }

  // Factor 5: Waiting Time Escalation
  let waitTimeBonus = 0;
  if (createdAt) {
    const hoursWaiting = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursWaiting > 24) {
      waitTimeBonus = 15;
      reasons.push(`Backlog escalation (>24 hours waiting: ${Math.round(hoursWaiting)}h) (+15)`);
    } else if (hoursWaiting > 6) {
      waitTimeBonus = 8;
      reasons.push(`Response delay (>6 hours waiting: ${Math.round(hoursWaiting)}h) (+8)`);
    }
  }

  const rawScore = baseScore + catWeight + depthWeight + vulnerabilityBonus + recurrenceBonus + waitTimeBonus;
  const finalScore = Math.min(100, Math.max(10, rawScore));

  return {
    score: finalScore,
    reason: `Priority Score: ${finalScore}/100 [${reasons.join(' • ')}]`,
    factors: {
      categoryWeight: catWeight,
      depthWeight,
      vulnerabilityBonus,
      waitTimeBonus,
      recurrenceBonus
    }
  };
}
