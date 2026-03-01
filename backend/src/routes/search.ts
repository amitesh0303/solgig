import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { asyncHandler } from '../middleware/errorHandler';
import type { Job, PaginatedResponse } from '../types';

const router = Router();

const searchBodySchema = z.object({
  q: z.string().min(1).max(200),
  status: z
    .enum(['open', 'in_progress', 'completed', 'cancelled', 'disputed'])
    .optional(),
  budget_min: z.number().int().nonnegative().optional(),
  budget_max: z.number().int().nonnegative().optional(),
  skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  client: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ─── POST /search ─────────────────────────────────────────────────────────────

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const body = searchBodySchema.parse(req.body);

    const conditions: string[] = [
      // Full-text search across title and description
      `(to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $1)
        OR title ILIKE '%' || $1 || '%')`,
    ];
    const values: unknown[] = [body.q];
    let paramIndex = 2;

    if (body.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(body.status);
    }
    if (body.budget_min !== undefined) {
      conditions.push(`budget >= $${paramIndex++}`);
      values.push(body.budget_min);
    }
    if (body.budget_max !== undefined) {
      conditions.push(`budget <= $${paramIndex++}`);
      values.push(body.budget_max);
    }
    if (body.skills && body.skills.length > 0) {
      conditions.push(`skills && $${paramIndex++}`);
      values.push(body.skills);
    }
    if (body.client) {
      conditions.push(`client = $${paramIndex++}`);
      values.push(body.client);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (body.page - 1) * body.limit;

    const limitParam = paramIndex++;
    const offsetParam = paramIndex++;

    const [jobsResult, countResult] = await Promise.all([
      pool.query<Job>(
        `SELECT *,
                ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')),
                        plainto_tsquery('english', $1)) AS rank
         FROM jobs ${where}
         ORDER BY rank DESC, created_at DESC
         LIMIT $${limitParam} OFFSET $${offsetParam}`,
        [...values, body.limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM jobs ${where}`,
        values,
      ),
    ]);

    const response: PaginatedResponse<Job> = {
      data: jobsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: body.page,
      limit: body.limit,
    };

    res.json(response);
  }),
);

export default router;
