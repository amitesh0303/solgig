"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Star, Briefcase, DollarSign, ArrowLeft, ExternalLink } from "lucide-react";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewStars } from "@/components/ReviewStars";
import { JobCard } from "@/components/JobCard";
import { MOCK_PROFILES } from "@/lib/mockData";
import { TRUNCATE_WALLET } from "@/lib/constants";

export default function ProfilePage() {
  const params = useParams();
  const wallet = Array.isArray(params.wallet) ? params.wallet[0] : params.wallet;
  const profile = MOCK_PROFILES.find((p) => p.wallet === wallet) ?? MOCK_PROFILES[0];

  const displayWallet = typeof wallet === "string" ? wallet : profile.wallet;

  return (
    <div className="min-h-screen bg-[#0d0a1a] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile sidebar */}
          <div className="space-y-5">
            {/* Avatar & name */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                {profile.name ? profile.name[0] : "?"}
              </div>
              <h1 className="text-lg font-bold text-white mb-1">
                {profile.name ?? TRUNCATE_WALLET(displayWallet)}
              </h1>
              <p className="text-xs text-gray-500 font-mono mb-3">
                {TRUNCATE_WALLET(displayWallet)}
              </p>
              <div className="flex items-center justify-center gap-1 mb-3">
                <ReviewStars rating={profile.avgRating} size="sm" showValue />
                <span className="text-xs text-gray-500">({profile.reviewCount} reviews)</span>
              </div>
              {profile.hourlyRate && (
                <div className="text-sm font-semibold text-purple-300">
                  ${profile.hourlyRate}/hr
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Link
                  href="/messages"
                  className="flex-1 rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors text-center"
                >
                  Message
                </Link>
                <a
                  href={`https://explorer.solana.com/address/${displayWallet}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-purple-900/40 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Stats</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: DollarSign,
                    label: "Total Earned",
                    value: `$${profile.totalEarned.toLocaleString()}`,
                    color: "text-emerald-400",
                  },
                  {
                    icon: Briefcase,
                    label: "Jobs Completed",
                    value: String(profile.jobsCompleted),
                    color: "text-blue-400",
                  },
                  {
                    icon: Star,
                    label: "Avg Rating",
                    value: profile.avgRating.toFixed(1),
                    color: "text-yellow-400",
                  },
                  {
                    icon: Calendar,
                    label: "Member Since",
                    value: new Date(profile.memberSince).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    }),
                    color: "text-purple-400",
                  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Icon className={`h-4 w-4 ${color}`} />
                      {label}
                    </div>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-purple-900/30 px-2.5 py-1 text-xs text-purple-300 border border-purple-800/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Location placeholder */}
            <div className="flex items-center gap-2 text-sm text-gray-500 px-1">
              <MapPin className="h-4 w-4" />
              <span>Global · Remote</span>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-6">
                <h2 className="text-base font-semibold text-white mb-3">About</h2>
                <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Active jobs */}
            {profile.activeJobs.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-white mb-3">
                  Active Jobs ({profile.activeJobs.length})
                </h2>
                <div className="space-y-3">
                  {profile.activeJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">
                  Reviews ({profile.reviews.length})
                </h2>
                <div className="flex items-center gap-2">
                  <ReviewStars rating={profile.avgRating} showValue />
                </div>
              </div>
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
                {profile.reviews.length === 0 && (
                  <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-8 text-center">
                    <Star className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
