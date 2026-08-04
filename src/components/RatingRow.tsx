import { Star } from "lucide-react";

type RatingRowProps = {
  label: string;
  rating: number;
  maxRating: number;
};

export function RatingRow({ label, rating, maxRating }: RatingRowProps) {
  const safeRating = Math.min(Math.max(rating, 0), maxRating);

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-base text-slate-600 sm:text-[1.05rem]">{label}</span>
      <div className="flex items-center gap-0.5" aria-label={`${rating} de ${maxRating} estrelas`}>
        {Array.from({ length: maxRating }, (_, index) => {
          const filled = index < safeRating;

          return (
            <Star
              key={`${label}-${index}`}
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                filled ? "fill-[#f5b81e] text-[#f5b81e]" : "text-[#f5b81e]"
              }`}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}
