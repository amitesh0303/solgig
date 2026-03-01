import { Lock, Unlock, AlertTriangle, TrendingUp } from "lucide-react";
import type { EscrowInfo } from "@/lib/types";

interface EscrowStatusProps {
  escrow: EscrowInfo;
}

export function EscrowStatus({ escrow }: EscrowStatusProps) {
  const lockedPct = escrow.totalAmount > 0 ? (escrow.lockedAmount / escrow.totalAmount) * 100 : 0;
  const releasedPct =
    escrow.totalAmount > 0 ? (escrow.releasedAmount / escrow.totalAmount) * 100 : 0;
  const disputedPct =
    escrow.totalAmount > 0 ? (escrow.disputedAmount / escrow.totalAmount) * 100 : 0;

  const STATUS_CONFIG = {
    active: { label: "Active", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    released: {
      label: "Released",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
    disputed: {
      label: "Disputed",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30",
    },
    refunded: {
      label: "Refunded",
      color: "text-gray-400",
      bg: "bg-gray-500/10 border-gray-500/30",
    },
  };

  const statusCfg = STATUS_CONFIG[escrow.status];

  return (
    <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">Escrow Status</h3>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Total */}
      <div className="text-center mb-5">
        <p className="text-3xl font-bold text-white">
          ${escrow.totalAmount.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Total Escrowed</p>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-gray-800 overflow-hidden flex mb-4">
        {releasedPct > 0 && (
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${releasedPct}%` }}
          />
        )}
        {lockedPct > 0 && (
          <div
            className="h-full bg-purple-600 transition-all duration-500"
            style={{ width: `${lockedPct}%` }}
          />
        )}
        {disputedPct > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${disputedPct}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-lg bg-purple-900/20 p-2.5">
          <Lock className="h-4 w-4 text-purple-400 mx-auto mb-1" />
          <p className="font-semibold text-white">${escrow.lockedAmount.toLocaleString()}</p>
          <p className="text-gray-500">Locked</p>
        </div>
        <div className="rounded-lg bg-emerald-900/20 p-2.5">
          <Unlock className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
          <p className="font-semibold text-white">${escrow.releasedAmount.toLocaleString()}</p>
          <p className="text-gray-500">Released</p>
        </div>
        <div className="rounded-lg bg-red-900/20 p-2.5">
          <AlertTriangle className="h-4 w-4 text-red-400 mx-auto mb-1" />
          <p className="font-semibold text-white">${escrow.disputedAmount.toLocaleString()}</p>
          <p className="text-gray-500">Disputed</p>
        </div>
      </div>

      {/* Address */}
      {escrow.address && (
        <div className="mt-4 pt-3 border-t border-purple-900/20">
          <p className="text-xs text-gray-600 mb-1">Escrow Account</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-gray-600 shrink-0" />
            <code className="text-xs text-gray-400 font-mono truncate">{escrow.address}</code>
          </div>
        </div>
      )}
    </div>
  );
}
