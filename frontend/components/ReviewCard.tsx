import { ReviewStars } from "./ReviewStars";
import type { Review } from "@/lib/types";
import { TRUNCATE_WALLET } from "@/lib/constants";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] p-5">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {review.reviewerName ? review.reviewerName[0] : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-medium text-white">
                {review.reviewerName ?? TRUNCATE_WALLET(review.reviewerWallet)}
              </p>
              {review.jobTitle && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">{review.jobTitle}</p>
              )}
            </div>
            <ReviewStars rating={review.rating} size="sm" showValue />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">{review.comment}</p>

      <p className="text-xs text-gray-600 mt-3">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
