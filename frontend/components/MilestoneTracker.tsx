import { CheckCircle2, Circle, Clock, Loader2, DollarSign } from "lucide-react";
import type { Milestone } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  totalBudget: number;
}

const MILESTONE_ICONS = {
  pending: Circle,
  in_progress: Loader2,
  submitted: Clock,
  approved: CheckCircle2,
  paid: CheckCircle2,
};

export function MilestoneTracker({ milestones, totalBudget }: MilestoneTrackerProps) {
  const completedCount = milestones.filter(
    (m) => m.status === "approved" || m.status === "paid"
  ).length;
  const progressPct = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Milestone Tracker</h3>
        <span className="text-sm text-gray-400">
          {completedCount}/{milestones.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-0">
        {milestones.map((milestone, idx) => {
          const Icon = MILESTONE_ICONS[milestone.status] ?? Circle;
          const isCompleted = milestone.status === "approved" || milestone.status === "paid";
          const isActive = milestone.status === "in_progress" || milestone.status === "submitted";
          const statusColor = STATUS_COLORS[milestone.status] ?? STATUS_COLORS["pending"];

          return (
            <div key={milestone.id} className="relative">
              {/* Connector line */}
              {idx < milestones.length - 1 && (
                <div
                  className={`absolute left-[15px] top-8 h-full w-0.5 ${
                    isCompleted ? "bg-purple-600" : "bg-gray-700"
                  }`}
                />
              )}

              <div className="flex gap-4 py-3">
                {/* Icon */}
                <div
                  className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                    isCompleted
                      ? "bg-purple-600/30 border-2 border-purple-500"
                      : isActive
                      ? "bg-blue-600/20 border-2 border-blue-400"
                      : "bg-gray-800 border-2 border-gray-600"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isCompleted
                        ? "text-purple-400"
                        : isActive
                        ? "text-blue-400 animate-spin"
                        : "text-gray-500"
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4
                      className={`text-sm font-medium ${
                        isCompleted ? "text-gray-300 line-through" : "text-white"
                      }`}
                    >
                      {milestone.title}
                    </h4>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}
                    >
                      {STATUS_LABELS[milestone.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 mb-1">{milestone.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-medium text-purple-300">
                        ${milestone.amount.toLocaleString()}
                      </span>
                    </span>
                    {milestone.dueDate && (
                      <span>Due {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    )}
                    {milestone.completedAt && (
                      <span className="text-purple-400">
                        ✓ Completed {new Date(milestone.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-purple-900/20 flex justify-between text-sm">
        <span className="text-gray-500">Total Budget</span>
        <span className="font-semibold text-white">${totalBudget.toLocaleString()}</span>
      </div>
    </div>
  );
}
