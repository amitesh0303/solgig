import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { asyncHandler, httpError } from '../middleware/errorHandler';
import type { ProfileStats } from '../types';

const router = Router();

// ─── GET /profiles/:wallet ────────────────────────────────────────────────────

router.get(
  '/:wallet',
  asyncHandler(async (req: Request, res: Response) => {
    const { wallet } = req.params;

    // Validate wallet address looks reasonable (base58, 32–44 chars)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      throw httpError('Invalid wallet address', 400);
    }

    const [statsResult, reviewResult] = await Promise.all([
      pool.query<{
        jobs_as_client: string;
        jobs_as_freelancer: string;
        completed_jobs: string;
      }>(
        `SELECT
           (SELECT COUNT(*) FROM jobs WHERE client = $1)                              AS jobs_as_client,
           (SELECT COUNT(*) FROM jobs WHERE freelancer = $1)                          AS jobs_as_freelancer,
           (SELECT COUNT(*) FROM jobs WHERE freelancer = $1 AND status = 'completed') AS completed_jobs`,
        [wallet],
      ),
      pool.query<{ average_rating: string | null; total_reviews: string }>(
        `SELECT
           ROUND(AVG(rating)::numeric, 2) AS average_rating,
           COUNT(*)                       AS total_reviews
         FROM reviews
         WHERE target = $1`,
        [wallet],
      ),
    ]);

    const s = statsResult.rows[0];
    const r = reviewResult.rows[0];

    const profile: ProfileStats = {
      wallet,
      jobs_as_client: parseInt(s.jobs_as_client, 10),
      jobs_as_freelancer: parseInt(s.jobs_as_freelancer, 10),
      completed_jobs: parseInt(s.completed_jobs, 10),
      average_rating: r.average_rating ? parseFloat(r.average_rating) : null,
      total_reviews: parseInt(r.total_reviews, 10),
    };

    // Return 404 only when the wallet has no on-chain activity at all
    const hasActivity =
      profile.jobs_as_client > 0 ||
      profile.jobs_as_freelancer > 0 ||
      profile.total_reviews > 0;

    if (!hasActivity) {
      throw httpError('Profile not found', 404);
    }

    res.json(profile);
  }),
);

export default router;
