import { Star } from "lucide-react";

interface ReviewStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const SIZE_MAP = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function ReviewStars({
  rating,
  max = 5,
  size = "md",
  showValue = false,
}: ReviewStarsProps) {
  const starSize = SIZE_MAP[size];

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${starSize} text-gray-700`} />
            {(filled || partial) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating % 1) * 100}%` : "100%" }}
              >
                <Star className={`${starSize} text-yellow-400 fill-yellow-400`} />
              </span>
            )}
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-300">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
