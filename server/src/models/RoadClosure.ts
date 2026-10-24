import mongoose, { Schema, Document } from 'mongoose';
import type { RoadClosureRecord } from '../types/index.js';

export interface RoadClosureDocument extends Omit<RoadClosureRecord, 'id'>, Document {
  id: string;
}

const RoadClosureSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  roadName: { type: String, required: true },
  sector: { type: String, required: true },
  coordinates: { type: [Number], required: true },
  verificationStatus: { 
    type: String, 
    required: true, 
    enum: ['Official', 'Unverified', 'Expired'],
    default: 'Unverified' 
  },
  reportedAt: { type: String, required: true },
  verifiedAt: { type: String },
  verifiedBy: { type: String },
  expiresAt: { type: String, required: true },
  reason: { type: String, required: true },
  waterDepthMeters: { type: Number, required: true },
  recommendedDetour: { type: String },
  detourCoordinates: { type: [[Number]] }
}, {
  timestamps: false
});

export const RoadClosureModel = mongoose.model<RoadClosureDocument>('RoadClosure', RoadClosureSchema);
