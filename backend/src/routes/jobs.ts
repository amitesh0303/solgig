import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { asyncHandler, httpError } from '../middleware/errorHandler';
import type { Job, PaginatedResponse } from '../types';

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const listJobsSchema = z.object({
  status: z
    .enum(['open', 'in_progress', 'completed', 'cancelled', 'disputed'])
    .optional(),
  budget_min: z.coerce.number().int().nonnegative().optional(),
  budget_max: z.coerce.number().int().nonnegative().optional(),
  skills: z.string().optional(), // comma-separated
  client: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── GET /jobs ────────────────────────────────────────────────────────────────

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query = listJobsSchema.parse(req.query);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status);
    }
    if (query.budget_min !== undefined) {
      conditions.push(`budget >= $${paramIndex++}`);
      values.push(query.budget_min);
    }
    if (query.budget_max !== undefined) {
      conditions.push(`budget <= $${paramIndex++}`);
      values.push(query.budget_max);
    }
    if (query.skills) {
      const skillList = query.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillList.length > 0) {
        conditions.push(`skills && $${paramIndex++}`);
        values.push(skillList);
      }
    }
    if (query.client) {
      conditions.push(`client = $${paramIndex++}`);
      values.push(query.client);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (query.page - 1) * query.limit;

    const [jobsResult, countResult] = await Promise.all([
      pool.query<Job>(
        `SELECT * FROM jobs ${where}
         ORDER BY created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...values, query.limit, offset],
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM jobs ${where}`,
        values,
      ),
    ]);

    const response: PaginatedResponse<Job> = {
      data: jobsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page: query.page,
      limit: query.limit,
    };

    res.json(response);
  }),
);

// ─── GET /jobs/:id ────────────────────────────────────────────────────────────

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Support lookup by UUID primary key or on_chain_id
    const result = await pool.query<Job>(
      `SELECT j.*,
              COALESCE(json_agg(m ORDER BY m.milestone_index) FILTER (WHERE m.id IS NOT NULL), '[]') AS milestones
       FROM jobs j
       LEFT JOIN milestones m ON m.job_id = j.on_chain_id
       WHERE j.id = $1 OR j.on_chain_id = $1
       GROUP BY j.id`,
      [id],
    );

    if (result.rows.length === 0) {
      throw httpError('Job not found', 404);
    }

    res.json(result.rows[0]);
  }),
);

export default router;
