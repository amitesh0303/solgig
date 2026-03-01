import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './db/pool';
import jobsRouter from './routes/jobs';
import profilesRouter from './routes/profiles';
import reviewsRouter from './routes/reviews';
import searchRouter from './routes/search';
import applicationsRouter from './routes/applications';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '1mb' }));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/jobs', jobsRouter);
app.use('/profiles', profilesRouter);
app.use('/reviews', reviewsRouter);
app.use('/search', searchRouter);
app.use('/applications', applicationsRouter);

// ─── 404 / error handlers ─────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10);

async function start(): Promise<void> {
  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
  }
  app.listen(PORT, () => {
    console.log(`[server] SolGig backend running on port ${PORT}`);
  });
}

// Only auto-start when executed directly (not when imported by tests)
if (require.main === module) {
  start().catch((err) => {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  });
}

export { app };
