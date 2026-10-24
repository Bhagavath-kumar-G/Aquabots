import type { ComplaintRecord, DuplicateFlag } from '../types/index.js';

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s\u0B80-\u0BFF]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
  );
}

function jaccardSimilarity(text1: string, text2: string): number {
  const set1 = tokenize(text1);
  const set2 = tokenize(text2);
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }
  const union = new Set([...set1, ...set2]).size;
  return union > 0 ? intersection / union : 0;
}

export function detectDuplicateComplaint(
  newComplaint: {
    lat: number;
    lng: number;
    title: string;
    description: string;
    category: string;
    createdAt?: string;
  },
  existingComplaints: ComplaintRecord[]
): DuplicateFlag {
  const DISTANCE_THRESHOLD_METERS = 250; // within 250 meters
  const TIME_WINDOW_HOURS = 48; // within last 48 hours
  const now = new Date(newComplaint.createdAt || Date.now()).getTime();

  for (const existing of existingComplaints) {
    if (existing.status === 'Resolved') continue;

    const existingTime = new Date(existing.createdAt).getTime();
    const hoursDiff = Math.abs(now - existingTime) / (1000 * 60 * 60);

    if (hoursDiff <= TIME_WINDOW_HOURS) {
      const distance = haversineDistanceMeters(newComplaint.lat, newComplaint.lng, existing.lat, existing.lng);
      
      if (distance <= DISTANCE_THRESHOLD_METERS) {
        const textSim = jaccardSimilarity(
          `${newComplaint.title} ${newComplaint.description}`,
          `${existing.title} ${existing.description}`
        );
        const categoryMatch = newComplaint.category === existing.category;

        // Composite duplicate probability
        const similarityScore = Math.min(1.0, (categoryMatch ? 0.4 : 0.1) + textSim * 0.4 + (1 - distance / DISTANCE_THRESHOLD_METERS) * 0.2);

        if (similarityScore >= 0.55 || (distance < 80 && categoryMatch)) {
          return {
            isDuplicate: true,
            duplicateOfId: existing.id,
            similarityScore: Math.round(similarityScore * 100) / 100,
            reason: `Potential duplicate of #${existing.id} (${Math.round(distance)}m away, reported ${Math.round(hoursDiff)}h ago in ${existing.locationName}). Requires human review before merging.`,
            status: 'Unmerged'
          };
        }
      }
    }
  }

  return {
    isDuplicate: false,
    status: 'Unmerged'
  };
}
