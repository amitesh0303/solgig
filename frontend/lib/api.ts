import type { Job, UserProfile, Proposal, Review } from "./types";
import { MOCK_JOBS, MOCK_PROFILES, MOCK_PROPOSALS } from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

// Jobs
export async function getJobs(params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Job[]> {
  try {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    return await fetchApi<Job[]>(`/api/jobs${query ? `?${query}` : ""}`);
  } catch {
    // Fall back to mock data when backend is unavailable
    let jobs = [...MOCK_JOBS];
    if (params?.status) jobs = jobs.filter((j) => j.status === params.status);
    if (params?.category) jobs = jobs.filter((j) => j.category === params.category);
    if (params?.search) {
      const q = params.search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return jobs;
  }
}

export async function getJob(id: string): Promise<Job | null> {
  try {
    return await fetchApi<Job>(`/api/jobs/${id}`);
  } catch {
    return MOCK_JOBS.find((j) => j.id === id) ?? null;
  }
}

export async function getProfile(wallet: string): Promise<UserProfile | null> {
  try {
    return await fetchApi<UserProfile>(`/api/profiles/${wallet}`);
  } catch {
    return MOCK_PROFILES.find((p) => p.wallet === wallet) ?? MOCK_PROFILES[0];
  }
}

export async function getProposalsByWallet(wallet: string): Promise<Proposal[]> {
  try {
    return await fetchApi<Proposal[]>(`/api/proposals?wallet=${wallet}`);
  } catch {
    return MOCK_PROPOSALS.filter((p) => p.freelancerWallet === wallet);
  }
}

export async function submitProposal(
  proposal: Omit<Proposal, "id" | "status" | "createdAt">
): Promise<Proposal> {
  return fetchApi<Proposal>("/api/proposals", {
    method: "POST",
    body: JSON.stringify(proposal),
  });
}

export async function submitReview(
  review: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  return fetchApi<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
}
