import Link from "next/link";
import { Clock, Users, Tag, Wallet } from "lucide-react";
import type { Job } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS, TRUNCATE_WALLET } from "@/lib/constants";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const statusColor = STATUS_COLORS[job.status] ?? STATUS_COLORS["open"];

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group relative rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5 hover:border-purple-600/50 hover:bg-[#1e1240] transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/20 cursor-pointer">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
            {job.title}
          </h3>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
          >
            {STATUS_LABELS[job.status]}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-purple-900/30 px-2 py-0.5 text-xs text-purple-300 border border-purple-800/40"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 4 && (
            <span className="rounded-md bg-gray-800/50 px-2 py-0.5 text-xs text-gray-500">
              +{job.tags.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-semibold text-purple-300 text-sm">
              ${job.budget.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span>{job.category}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{job.proposals} proposals</span>
          </div>

          {job.deadline && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Client */}
        {job.clientName && (
          <div className="mt-3 pt-3 border-t border-purple-900/20 flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
              {job.clientName[0]}
            </div>
            <span className="text-xs text-gray-500">
              {job.clientName} · {TRUNCATE_WALLET(job.clientWallet)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
