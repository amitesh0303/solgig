"use client";

import { useState } from "react";
import { X, Send, DollarSign, Calendar } from "lucide-react";
import type { Job } from "@/lib/types";

interface ProposalFormProps {
  job: Job;
  onClose: () => void;
  onSubmit?: (data: { coverLetter: string; bidAmount: number; deliveryDays: number }) => void;
}

export function ProposalForm({ job, onClose, onSubmit }: ProposalFormProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState<string>(String(job.budget));
  const [deliveryDays, setDeliveryDays] = useState<string>("30");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    onSubmit?.({
      coverLetter,
      bidAmount: Number(bidAmount),
      deliveryDays: Number(deliveryDays),
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-purple-900/40 bg-[#12091f] shadow-2xl shadow-purple-900/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-purple-900/30">
          <div>
            <h2 className="text-lg font-semibold text-white">Submit Proposal</h2>
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Proposal Submitted!</h3>
            <p className="text-gray-400 mb-6">
              Your proposal has been sent to the client. You&apos;ll be notified when they respond.
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Bid amount + delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Your Bid (SOL / USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                    className="w-full rounded-lg border border-purple-900/40 bg-[#1a0f2e] pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Client budget: ${job.budget.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Delivery (days)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    required
                    className="w-full rounded-lg border border-purple-900/40 bg-[#1a0f2e] pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            {/* Cover letter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Cover Letter
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                required
                minLength={50}
                rows={6}
                placeholder="Describe your relevant experience, why you're the best fit, and how you'll approach this project..."
                className="w-full rounded-lg border border-purple-900/40 bg-[#1a0f2e] px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-600 mt-1">{coverLetter.length} / 2000 characters (min 50)</p>
            </div>

            {/* Escrow notice */}
            <div className="rounded-lg bg-purple-900/20 border border-purple-800/30 px-4 py-3">
              <p className="text-xs text-purple-300">
                <span className="font-semibold">🔒 Escrow Protection:</span> If accepted, the full
                project amount will be locked in a Solana escrow smart contract before work begins.
                Funds are released milestone-by-milestone upon your approval.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-purple-900/40 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || coverLetter.length < 50}
                className="flex-1 rounded-lg bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Proposal
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
