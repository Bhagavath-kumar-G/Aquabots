import type { Severity, IncidentCategory } from '../types';

export interface PrioritizationResult {
  severity: Severity;
  score: number;
  explanation: string;
  rulesTriggered: string[];
  safetyGuidelines: string[];
}

export function calculateIncidentPriority(params: {
  category: IncidentCategory;
  waterDepthMeters: number;
  trappedCount: number;
  hazards: string[];
  locationName?: string;
  waterFlowVelocity?: number;
}): PrioritizationResult {
  const { category, waterDepthMeters, trappedCount, hazards, waterFlowVelocity = 0 } = params;
  
  let score = 20; // baseline score
  const rulesTriggered: string[] = [];
  const guidelines: string[] = [];

  // Rule 1: Trapped Human Lives (Highest Weight)
  if (trappedCount > 0) {
    const trappedScore = Math.min(50, trappedCount * 15);
    score += trappedScore;
    rulesTriggered.push(`Human life risk: ${trappedCount} citizen(s) stranded (+${trappedScore} pts)`);
    guidelines.push('Deploy inflatable boat / high-clearance amphibious rescue unit immediately.');
    guidelines.push('Provide life jackets, emergency hypothermia wraps, and drinking water.');
  }

  // Rule 2: Water Depth Thresholds
  if (waterDepthMeters >= 1.5) {
    score += 35;
    rulesTriggered.push(`Extreme water depth (${waterDepthMeters.toFixed(1)}m >= 1.5m) creates severe drowning & vehicle washout risk (+35 pts)`);
    guidelines.push('Prohibit all standard vehicular entry; cordon off 100m perimeter.');
  } else if (waterDepthMeters >= 0.9) {
    score += 25;
    rulesTriggered.push(`High water depth (${waterDepthMeters.toFixed(1)}m >= 0.9m) submerges car engines and sidewalks (+25 pts)`);
    guidelines.push('Dispatch high-capacity municipal de-watering pump unit.');
  } else if (waterDepthMeters >= 0.4) {
    score += 15;
    rulesTriggered.push(`Moderate water depth (${waterDepthMeters.toFixed(1)}m) causes urban traffic paralysis (+15 pts)`);
  }

  // Rule 3: Electrical & Infrastructure Hazards
  const hasLiveWire = hazards.some(h => /electric|wire|transformer|spark/i.test(h));
  if (hasLiveWire) {
    score += 30;
    rulesTriggered.push('Active electrical risk: submerged transformer or fallen power cable detected (+30 pts)');
    guidelines.push('URGENT: Coordinate immediate grid section de-energization with Electricity Board.');
    guidelines.push('Do NOT step into standing water without insulated rubber safety gear.');
  }

  // Rule 4: Structural, Submerged Vehicle, or Flow Velocity
  if (waterFlowVelocity > 1.5) {
    score += 20;
    rulesTriggered.push(`Rapid flash-flood flow velocity (${waterFlowVelocity.toFixed(1)} m/s > 1.5 m/s) sweeps pedestrians (+20 pts)`);
    guidelines.push('Anchor safety guide ropes across roadway for pedestrian security.');
  }

  if (category === 'Submerged Vehicle') {
    score += 20;
    rulesTriggered.push('Submerged vehicle obstructing emergency corridor and potentially holding occupants (+20 pts)');
    guidelines.push('Verify if vehicle cabin is occupied using thermal camera probe before towing.');
  }

  if (category === 'Structural Risk') {
    score += 25;
    rulesTriggered.push('Foundation wall or culvert erosion risk (+25 pts)');
    guidelines.push('Notify Municipal Structural Engineer to inspect foundation stability.');
  }

  // Cap score to 100
  score = Math.min(100, Math.max(10, score));

  // Determine Severity Category based on transparent thresholds
  let severity: Severity = 'Low';
  let explanation = '';

  if (score >= 75 || trappedCount >= 3 || (waterDepthMeters >= 1.2 && hasLiveWire)) {
    severity = 'Critical';
    explanation = `CRITICAL PRIORITY (Score: ${score}/100): Immediate danger to human life or high-voltage hazard requiring emergency dispatch within 10 minutes.`;
  } else if (score >= 50 || trappedCount > 0 || waterDepthMeters >= 0.9) {
    severity = 'High';
    explanation = `HIGH PRIORITY (Score: ${score}/100): Significant flood obstruction, deep water, or submerged vehicles impacting primary transit lines.`;
  } else if (score >= 30 || waterDepthMeters >= 0.4) {
    severity = 'Medium';
    explanation = `MEDIUM PRIORITY (Score: ${score}/100): Urban waterlogging causing transit disruption and localized property ingress.`;
  } else {
    severity = 'Low';
    explanation = `LOW PRIORITY (Score: ${score}/100): Minor water accumulation, non-obstructive runoff, advisory monitoring in place.`;
  }

  if (guidelines.length === 0) {
    guidelines.push('Monitor water depth trends via rover periodic ping.');
    guidelines.push('Clear storm drain gratings of accumulated plastic waste.');
  }

  return {
    severity,
    score,
    explanation,
    rulesTriggered,
    safetyGuidelines: guidelines
  };
}
