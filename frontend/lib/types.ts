export type JobStatus = "open" | "in_progress" | "completed" | "disputed" | "cancelled";
export type MilestoneStatus = "pending" | "in_progress" | "submitted" | "approved" | "paid";
export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  clientWallet: string;
  clientName?: string;
  clientAvatar?: string;
  budget: number;
  budgetMin?: number;
  budgetMax?: number;
  status: JobStatus;
  category: string;
  tags: string[];
  milestones: Milestone[];
  proposals: number;
  createdAt: string;
  deadline?: string;
  escrowAddress?: string;
  escrowAmount?: number;
  escrowReleased?: number;
}

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle?: string;
  freelancerWallet: string;
  freelancerName?: string;
  coverLetter: string;
  bidAmount: number;
  deliveryDays: number;
  status: ProposalStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  jobId: string;
  jobTitle?: string;
  reviewerWallet: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  targetWallet: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserProfile {
  wallet: string;
  name?: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  totalEarned: number;
  jobsCompleted: number;
  avgRating: number;
  reviewCount: number;
  memberSince: string;
  activeJobs: Job[];
  reviews: Review[];
}

export interface EscrowInfo {
  address: string;
  totalAmount: number;
  lockedAmount: number;
  releasedAmount: number;
  disputedAmount: number;
  status: "active" | "released" | "disputed" | "refunded";
}

export interface Message {
  id: string;
  conversationId: string;
  senderWallet: string;
  senderName?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames?: string[];
  participantAvatars?: string[];
  lastMessage?: Message;
  jobId?: string;
  jobTitle?: string;
  unreadCount: number;
}

export interface DashboardStats {
  activeJobs: number;
  pendingProposals: number;
  totalEarned: number;
  escrowLocked: number;
}
