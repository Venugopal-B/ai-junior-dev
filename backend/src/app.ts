import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';

import authRoutes    from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import aiRoutes      from './routes/ai.routes';
import runsRoutes    from './routes/runs.routes';

const app = express();

// ─── Security & Perf Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// AI routes get a tighter limit (expensive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'AI rate limit reached. Please wait a minute.' },
});
app.use('/api/ai', aiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/runs',     runsRoutes);

// ─── 404 & Error Handling ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
