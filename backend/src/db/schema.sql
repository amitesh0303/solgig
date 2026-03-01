-- SolGig PostgreSQL schema
-- Run: psql $DATABASE_URL -f src/db/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────
-- Jobs
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  on_chain_id     TEXT        UNIQUE NOT NULL,
  client          TEXT        NOT NULL,
  freelancer      TEXT,
  title           TEXT        NOT NULL,
  description     TEXT,
  description_uri TEXT,
  budget          BIGINT      NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open','in_progress','completed','cancelled','disputed')),
  skills          TEXT[]      NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status     ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_client     ON jobs (client);
CREATE INDEX IF NOT EXISTS idx_jobs_freelancer ON jobs (freelancer);
CREATE INDEX IF NOT EXISTS idx_jobs_budget     ON jobs (budget);
CREATE INDEX IF NOT EXISTS idx_jobs_skills     ON jobs USING GIN (skills);

-- ──────────────────────────────────────────
-- Applications
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          TEXT        NOT NULL,
  freelancer      TEXT        NOT NULL,
  proposal        TEXT,
  proposed_budget BIGINT,
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_freelancer ON applications (freelancer);
CREATE INDEX IF NOT EXISTS idx_applications_job_id     ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications (status);

-- ──────────────────────────────────────────
-- Reviews
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author     TEXT        NOT NULL,
  target     TEXT        NOT NULL,
  job_id     TEXT,
  rating     INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews (target);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON reviews (author);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON reviews (job_id);

-- ──────────────────────────────────────────
-- Milestones
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestones (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           TEXT    NOT NULL,
  title            TEXT    NOT NULL,
  amount           BIGINT  NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','in_progress','completed','disputed')),
  milestone_index  INTEGER NOT NULL,
  UNIQUE (job_id, milestone_index)
);

CREATE INDEX IF NOT EXISTS idx_milestones_job_id ON milestones (job_id);

-- ──────────────────────────────────────────
-- Auto-update updated_at on jobs
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON jobs;
CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
