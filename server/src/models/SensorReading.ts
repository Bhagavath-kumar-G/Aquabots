import mongoose, { Schema, Document } from 'mongoose';
import type { SensorReadingRecord } from '../types/index.js';

export interface SensorReadingDocument extends Omit<SensorReadingRecord, 'id'>, Document {
  id: string;
}

const SensorReadingSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  deviceId: { type: String, required: true, index: true },
  sensorType: { 
    type: String, 
    required: true, 
    enum: ['ultrasonic_depth', 'flow_velocity', 'water_turbidity', 'rainfall_gauge'] 
  },
  reading: { type: Number, required: true },
  unit: { type: String, required: true },
  timestamp: { type: String, required: true },
  sensorHealth: { 
    type: String, 
    required: true, 
    enum: ['Optimal', 'Degraded', 'Offline', 'Calibrating'] 
  },
  location: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    drainSector: { type: String, required: true }
  },
  isSimulated: { type: Boolean, default: false },
  isValid: { type: Boolean, default: true },
  validationError: { type: String }
}, {
  timestamps: false
});

export const SensorReadingModel = mongoose.model<SensorReadingDocument>('SensorReading', SensorReadingSchema);
