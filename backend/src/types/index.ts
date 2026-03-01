// ─── Domain types ────────────────────────────────────────────────────────────

export type JobStatus =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'disputed';

export interface Job {
  id: string;
  on_chain_id: string;
  client: string;
  freelancer: string | null;
  title: string;
  description: string | null;
  description_uri: string | null;
  budget: string; // pg returns BIGINT as string
  status: JobStatus;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer: string;
  proposal: string | null;
  proposed_budget: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface Review {
  id: string;
  author: string;
  target: string;
  job_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  job_id: string;
  title: string;
  amount: string;
  status: MilestoneStatus;
  milestone_index: number;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ProfileStats {
  wallet: string;
  jobs_as_client: number;
  jobs_as_freelancer: number;
  completed_jobs: number;
  average_rating: number | null;
  total_reviews: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Utility types ────────────────────────────────────────────────────────────

export type WithOptionalId<T> = Omit<T, 'id'> & { id?: string };
