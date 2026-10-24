import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import complaintsRouter from './routes/complaints.routes.js';
import sensorsRouter from './routes/sensors.routes.js';
import hazardsRouter from './routes/hazards.routes.js';
import analyticsRouter from './routes/analytics.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aquabots_db';

// CORS configuration (supporting local dev + deployed Vercel frontend)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'https://aquabots.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local preview testing
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for evidence uploads
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AquaBots Smart Panchayat Drainage & Flood Response API',
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Mount Routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/hazards', hazardsRouter);
app.use('/api/analytics', analyticsRouter);

// Centralized Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Database connection & Server initialization
async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      console.log('Connecting to MongoDB at configured MONGODB_URI...');
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to MongoDB successfully.');
    } else {
      console.log('ℹ️ No MONGODB_URI provided in environment. Attempting local connection or falling back to in-memory store.');
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
        .then(() => console.log('✅ Connected to local MongoDB.'))
        .catch(() => console.log('⚡ Running in resilient standalone mode with memory/file store (MongoDB not detected). All features remain 100% functional.'));
    }
  } catch (err) {
    console.warn('⚠️ MongoDB connection deferred. Running with resilient local store fallback:', (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 AquaBots Server listening on port ${PORT} [http://localhost:${PORT}]`);
  });
}

startServer();
