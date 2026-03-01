import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { asyncHandler, httpError } from '../middleware/errorHandler';
import type { Review, PaginatedResponse } from '../types';

const router = Router();

const listReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  as: z.enum(['target', 'author']).default('target'),
});

// ─── GET /reviews/:wallet ─────────────────────────────────────────────────────

router.get(
  '/:wallet',
  asyncHandler(async (req: Request, res: Response) => {
    const { wallet } = req.params;

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      throw httpError('Invalid wallet address', 400);
    }

    const query = listReviewsSchema.parse(req.query);
    const column = query.as === 'author' ? 'author' : 'target';
    const offset = (query.page - 1) * query.limit;

    const [reviewsResult, countResult] = await Promise.all([
      pool.query<Review>(
        `SELECT * FROM reviews
         WHERE ${column} = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [wallet, query.limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM reviews WHERE ${column} = $1`,
        [wallet],
      ),
    ]);

    const response: PaginatedResponse<Review> = {
      data: reviewsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: query.page,
      limit: query.limit,
    };

    res.json(response);
  }),
);

export default router;
