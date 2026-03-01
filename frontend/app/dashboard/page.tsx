"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Briefcase,
  FileText,
  DollarSign,
  Lock,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { STATUS_LABELS, STATUS_COLORS, TRUNCATE_WALLET } from "@/lib/constants";
import { MOCK_JOBS, MOCK_PROPOSALS } from "@/lib/mockData";

const ACTIVE_JOBS = MOCK_JOBS.filter((j) => j.status === "in_progress");
const OPEN_JOBS = MOCK_JOBS.filter((j) => j.status === "open").slice(0, 3);

const DASHBOARD_STATS = [
  {
    icon: Briefcase,
    label: "Active Jobs",
    value: "2",
    sub: "in progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileText,
    label: "Proposals Sent",
    value: "5",
    sub: "2 pending reply",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: DollarSign,
    label: "Total Earned",
    value: "$12,400",
    sub: "all time",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Lock,
    label: "In Escrow",
    value: "$3,200",
    sub: "locked",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export default function DashboardPage() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-[#0d0a1a] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
            {publicKey ? (
              <p className="text-sm text-gray-400 mt-1 font-mono">
                {TRUNCATE_WALLET(publicKey.toBase58())}
              </p>
            ) : (
              <p className="text-sm text-yellow-400 mt-1">
                Connect your wallet to see your data
              </p>
            )}
          </div>
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {DASHBOARD_STATS.map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5"
            >
              <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm font-medium text-gray-300">{label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Jobs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Active Jobs</h2>
              <Link
                href="/jobs"
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {ACTIVE_JOBS.length > 0 ? (
              ACTIVE_JOBS.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-8 text-center">
                <Briefcase className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">No active jobs yet</p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            )}

            {/* Recent proposals */}
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-base font-semibold text-white">My Proposals</h2>
            </div>
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-900/20">
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Job</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Bid</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3 hidden sm:table-cell">Days</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PROPOSALS.map((p) => {
                    const statusColor = STATUS_COLORS[p.status] ?? STATUS_COLORS["pending"];
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-purple-900/10 last:border-0 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/jobs/${p.jobId}`}
                            className="text-white hover:text-purple-300 transition-colors font-medium line-clamp-1"
                          >
                            {p.jobTitle ?? p.jobId}
                          </Link>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-purple-300 font-medium hidden sm:table-cell">
                          ${p.bidAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                          {p.deliveryDays}d
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Earnings chart placeholder */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Earnings</h3>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              {/* Fake bar chart */}
              <div className="flex items-end gap-1.5 h-20 mb-2">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-purple-600/60 hover:bg-purple-500/80 transition-colors cursor-default"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Last 7 days (mock data)</p>
            </div>

            {/* Recommended jobs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Recommended</h3>
                <Link
                  href="/jobs"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  More <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {OPEN_JOBS.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-start gap-3 rounded-lg border border-purple-900/20 bg-[#1a0f2e] p-3 hover:border-purple-600/40 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-purple-900/40 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-1">{job.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-purple-300">${job.budget.toLocaleString()}</span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.proposals} proposals
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
