import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { asyncHandler, httpError } from '../middleware/errorHandler';
import type { Application, PaginatedResponse } from '../types';

const router = Router();

const listApplicationsSchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'rejected', 'withdrawn'])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── GET /applications/:wallet ────────────────────────────────────────────────

router.get(
  '/:wallet',
  asyncHandler(async (req: Request, res: Response) => {
    const { wallet } = req.params;

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
      throw httpError('Invalid wallet address', 400);
    }

    const query = listApplicationsSchema.parse(req.query);
    const conditions: string[] = ['a.freelancer = $1'];
    const values: unknown[] = [wallet];
    let paramIndex = 2;

    if (query.status) {
      conditions.push(`a.status = $${paramIndex++}`);
      values.push(query.status);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (query.page - 1) * query.limit;

    const [appsResult, countResult] = await Promise.all([
      pool.query<Application & { job_title: string; job_status: string }>(
        `SELECT a.*, j.title AS job_title, j.status AS job_status
         FROM applications a
         LEFT JOIN jobs j ON j.on_chain_id = a.job_id
         ${where}
         ORDER BY a.created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, query.limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM applications a ${where}`,
        values,
      ),
    ]);

    const response: PaginatedResponse<
      Application & { job_title: string; job_status: string }
    > = {
      data: appsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: query.page,
      limit: query.limit,
    };

    res.json(response);
  }),
);

export default router;
