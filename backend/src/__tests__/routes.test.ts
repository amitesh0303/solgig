/**
 * Route integration tests using a mocked pg pool.
 * No live database required.
 */
import request from 'supertest';
import { app } from '../index';

// ─── Mock pg pool ─────────────────────────────────────────────────────────────

const mockQuery = jest.fn();

jest.mock('../db/pool', () => ({
  pool: { query: (...args: unknown[]) => mockQuery(...args) },
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

// Reset mock state between every test to prevent call accumulation.
beforeEach(() => mockQuery.mockReset());

// ─── Valid base58 wallet addresses (no lowercase 'l', no 'O', no 'I', no '0') ─

// 44 chars each (valid Solana base58: no 0, O, I, or lowercase l)
const WALLET_CLIENT     = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa'; // 43×A + a
const WALLET_FREELANCER = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBb'; // 43×B + b
const WALLET_TARGET     = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc'; // 43×C + c
const WALLET_AUTHOR     = 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDd'; // 43×D + d

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleJob = {
  id: '00000000-0000-0000-0000-000000000001',
  on_chain_id: 'chain_abc123',
  client: WALLET_CLIENT,
  freelancer: null,
  title: 'Build a Solana dApp',
  description: 'Need a full-stack dev',
  description_uri: null,
  budget: '5000000',
  status: 'open',
  skills: ['rust', 'solana'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const sampleReview = {
  id: '00000000-0000-0000-0000-000000000002',
  author: WALLET_AUTHOR,
  target: WALLET_TARGET,
  job_id: 'chain_abc123',
  rating: 5,
  comment: 'Great work!',
  created_at: new Date().toISOString(),
};

const sampleApplication = {
  id: '00000000-0000-0000-0000-000000000003',
  job_id: 'chain_abc123',
  freelancer: WALLET_FREELANCER,
  proposal: 'I can do this',
  proposed_budget: '4500000',
  status: 'pending',
  created_at: new Date().toISOString(),
  job_title: 'Build a Solana dApp',
  job_status: 'open',
};

// ─── Health ───────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────

describe('GET /jobs', () => {
  it('returns a paginated list of jobs', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [sampleJob] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app).get('/jobs');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Build a Solana dApp');
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it('filters by status query param', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [sampleJob] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app).get('/jobs?status=open');
    expect(res.status).toBe(200);
    const firstCall = mockQuery.mock.calls[0][0] as string;
    expect(firstCall).toContain('status = $1');
  });

  it('filters by budget range', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [sampleJob] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app).get('/jobs?budget_min=1000&budget_max=9000');
    expect(res.status).toBe(200);
    const firstCall = mockQuery.mock.calls[0][0] as string;
    expect(firstCall).toContain('budget >=');
    expect(firstCall).toContain('budget <=');
  });

  it('rejects invalid status', async () => {
    const res = await request(app).get('/jobs?status=invalid');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });
});

describe('GET /jobs/:id', () => {
  it('returns job details', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...sampleJob, milestones: [] }] });
    const res = await request(app).get(`/jobs/${sampleJob.id}`);
    expect(res.status).toBe(200);
    expect(res.body.on_chain_id).toBe('chain_abc123');
  });

  it('returns 404 for unknown job', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/jobs/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Job not found');
  });
});

// ─── Profiles ────────────────────────────────────────────────────────────────

describe('GET /profiles/:wallet', () => {
  it('returns profile stats', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ jobs_as_client: '3', jobs_as_freelancer: '7', completed_jobs: '5' }],
      })
      .mockResolvedValueOnce({
        rows: [{ average_rating: '4.50', total_reviews: '6' }],
      });

    const res = await request(app).get(`/profiles/${WALLET_CLIENT}`);
    expect(res.status).toBe(200);
    expect(res.body.wallet).toBe(WALLET_CLIENT);
    expect(res.body.jobs_as_client).toBe(3);
    expect(res.body.average_rating).toBe(4.5);
  });

  it('returns 404 when wallet has no activity', async () => {
    mockQuery
      .mockResolvedValueOnce({
        rows: [{ jobs_as_client: '0', jobs_as_freelancer: '0', completed_jobs: '0' }],
      })
      .mockResolvedValueOnce({
        rows: [{ average_rating: null, total_reviews: '0' }],
      });

    const res = await request(app).get(`/profiles/${WALLET_CLIENT}`);
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid wallet address', async () => {
    const res = await request(app).get('/profiles/not-a-valid-wallet!!');
    expect(res.status).toBe(400);
  });
});

// ─── Reviews ─────────────────────────────────────────────────────────────────

describe('GET /reviews/:wallet', () => {
  it('returns paginated reviews for a wallet', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [sampleReview] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app).get(`/reviews/${WALLET_TARGET}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rating).toBe(5);
  });

  it('accepts as=author query param', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const res = await request(app).get(`/reviews/${WALLET_TARGET}?as=author`);
    expect(res.status).toBe(200);
    const firstCall = mockQuery.mock.calls[0][0] as string;
    expect(firstCall).toContain('author = $1');
  });

  it('returns 400 for an invalid wallet address', async () => {
    const res = await request(app).get('/reviews/bad wallet!');
    expect(res.status).toBe(400);
  });
});

// ─── Search ───────────────────────────────────────────────────────────────────

describe('POST /search', () => {
  it('returns matching jobs', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [sampleJob] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app)
      .post('/search')
      .send({ q: 'Solana', skills: ['rust'] });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('applies budget and status filters', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const res = await request(app)
      .post('/search')
      .send({ q: 'dApp', status: 'open', budget_min: 100, budget_max: 9999 });

    expect(res.status).toBe(200);
    const firstCall = mockQuery.mock.calls[0][0] as string;
    expect(firstCall).toContain('status = $');
    expect(firstCall).toContain('budget >=');
    expect(firstCall).toContain('budget <=');
  });

  it('rejects empty query string', async () => {
    const res = await request(app).post('/search').send({ q: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  it('rejects missing q field', async () => {
    const res = await request(app).post('/search').send({});
    expect(res.status).toBe(400);
  });
});

// ─── Applications ─────────────────────────────────────────────────────────────

describe('GET /applications/:wallet', () => {
  it('returns paginated applications for a freelancer', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [sampleApplication] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(app).get(`/applications/${WALLET_FREELANCER}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].job_title).toBe('Build a Solana dApp');
  });

  it('filters by status', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ count: '0' }] });

    const res = await request(app).get(`/applications/${WALLET_FREELANCER}?status=accepted`);
    expect(res.status).toBe(200);
    const firstCall = mockQuery.mock.calls[0][0] as string;
    expect(firstCall).toContain('a.status = $2');
  });

  it('returns 400 for invalid wallet', async () => {
    const res = await request(app).get('/applications/bad wallet!');
    expect(res.status).toBe(400);
  });
});

// ─── 404 fallthrough ──────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  it('returns 404 for unknown paths', async () => {
    const res = await request(app).get('/not-a-real-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});

