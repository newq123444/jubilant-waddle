// ============================================================
// src/index.ts — Express app entry point
// ============================================================
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { testConnection } from './models/db';
import { testRedis } from './models/redis';
import { logger } from './utils/logger';

const app = express();
app.set('trust proxy', 1);

// ── Static file serving (before helmet so images load cross-origin) ────────
// Serve uploaded files — try multiple path strategies
// uploads served via dedicated route handler (see below)

// Handle preflight OPTIONS for all routes
app.options('*', cors());

// ── CORS middleware (must come before helmet) ──────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins for demo - reflects requesting origin back
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ── Rate limiting ──────────────────────────────────────────────────────────
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  skip: (req) => req.method === 'OPTIONS',
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
}));
app.use('/api', rateLimit({
  windowMs: 60 * 1000, max: 500,
  message: { error: 'Rate limit exceeded' },
}));

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Health checks ──────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/health/db', async (_, res) => {
  try { await testConnection(); res.json({ db: 'ok' }); }
  catch (e: any) { res.status(503).json({ db: 'error', error: e.message }); }
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Serve uploaded files ──────────────────────────────────────────────────
app.get('/uploads/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const allowed = ['residents', 'belongings', 'staff'];
  if (!allowed.includes(type)) return res.status(400).json({ error: 'Invalid type' });

  // Try multiple possible locations
  const locations = [
    path.join(process.cwd(), 'uploads', type, filename),
    path.join(__dirname, '..', 'uploads', type, filename),
    path.join(__dirname, '..', '..', 'uploads', type, filename),
  ];

  const found = locations.find(p => fs.existsSync(p));
  if (!found) {
    logger.warn(`Upload not found: ${type}/${filename}, tried: ${locations.join(', ')}`);
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.sendFile(found);
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Boot ───────────────────────────────────────────────────────────────────
async function start() {
  await testConnection();
  await testRedis();
  const port = parseInt(process.env.PORT || '3001');
  app.listen(port, () => logger.info(`🚀 CareVista API running on port ${port}`));
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
