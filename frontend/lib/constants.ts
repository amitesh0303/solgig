export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID ?? "";
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const JOB_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Smart Contracts",
  "UI/UX Design",
  "Data Science",
  "DevOps",
  "Technical Writing",
  "Marketing",
  "Video & Animation",
  "Other",
];

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  paid: "Paid",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  submitted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paid: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export const TRUNCATE_WALLET = (wallet: string) =>
  wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : "";
