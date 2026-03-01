"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Users,
  Tag,
  Wallet,
  ExternalLink,
  Share2,
  Bookmark,
} from "lucide-react";
import { MilestoneTracker } from "@/components/MilestoneTracker";
import { EscrowStatus } from "@/components/EscrowStatus";
import { ProposalForm } from "@/components/ProposalForm";
import { useWallet } from "@solana/wallet-adapter-react";
import { MOCK_JOBS } from "@/lib/mockData";
import { STATUS_LABELS, STATUS_COLORS, TRUNCATE_WALLET } from "@/lib/constants";
import type { EscrowInfo } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams();
  const { publicKey } = useWallet();
  const [showProposal, setShowProposal] = useState(false);

  const job = MOCK_JOBS.find((j) => j.id === params.id) ?? MOCK_JOBS[0];

  const escrow: EscrowInfo = {
    address: job.escrowAddress ?? "ESCRoW1111111111111111111111111111111111111111",
    totalAmount: job.escrowAmount ?? job.budget,
    lockedAmount: job.escrowAmount
      ? job.escrowAmount - (job.escrowReleased ?? 0)
      : 0,
    releasedAmount: job.escrowReleased ?? 0,
    disputedAmount: 0,
    status:
      job.status === "completed"
        ? "released"
        : job.status === "disputed"
        ? "disputed"
        : job.status === "in_progress"
        ? "active"
        : "active",
  };

  const statusColor = STATUS_COLORS[job.status] ?? STATUS_COLORS["open"];
  const isOwner = publicKey?.toBase58() === job.clientWallet;

  return (
    <div className="min-h-screen bg-[#0d0a1a] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {job.title}
                </h1>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor}`}
                >
                  {STATUS_LABELS[job.status]}
                </span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-5">
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold text-purple-300 text-base">
                    ${job.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  {job.category}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {job.proposals} proposals
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-purple-900/30 px-2.5 py-1 text-xs text-purple-300 border border-purple-800/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                {job.status === "open" && !isOwner && (
                  <button
                    onClick={() => {
                      if (!publicKey) {
                        alert("Please connect your wallet to apply.");
                        return;
                      }
                      setShowProposal(true);
                    }}
                    className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
                <button className="rounded-lg border border-purple-900/40 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2">
                  <Bookmark className="h-4 w-4" /> Save
                </button>
                <button className="rounded-lg border border-purple-900/40 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-6">
              <h2 className="text-base font-semibold text-white mb-4">Job Description</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                {job.description.split("\n").map((paragraph, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Milestone Tracker */}
            <MilestoneTracker milestones={job.milestones} totalBudget={job.budget} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Escrow */}
            {(job.status === "in_progress" || job.status === "completed") && (
              <EscrowStatus escrow={escrow} />
            )}

            {/* Client info */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
              <h3 className="text-base font-semibold text-white mb-4">Client</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                  {(job.clientName ?? "C")[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {job.clientName ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {TRUNCATE_WALLET(job.clientWallet)}
                  </p>
                </div>
              </div>
              <a
                href={`https://explorer.solana.com/address/${job.clientWallet}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View on Explorer
              </a>
            </div>

            {/* Job details */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5 space-y-3">
              <h3 className="text-base font-semibold text-white mb-1">Details</h3>
              {[
                { label: "Budget", value: `$${job.budget.toLocaleString()}` },
                { label: "Category", value: job.category },
                {
                  label: "Posted",
                  value: new Date(job.createdAt).toLocaleDateString(),
                },
                {
                  label: "Deadline",
                  value: job.deadline
                    ? new Date(job.deadline).toLocaleDateString()
                    : "Flexible",
                },
                {
                  label: "Milestones",
                  value: `${job.milestones.length} milestones`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showProposal && (
        <ProposalForm
          job={job}
          onClose={() => setShowProposal(false)}
          onSubmit={(data) => {
            console.log("Proposal submitted:", data);
            setShowProposal(false);
          }}
        />
      )}
    </div>
  );
}
