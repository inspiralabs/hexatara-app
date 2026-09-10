import { StarIcon } from "lucide-react";
import { cn } from "cn";

export function StarRating({
  rating,
  className,
}: {
  rating: number | null;
  className?: string;
}) {
  if (rating == null) return null;

  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < rounded ? "fill-warna-aksen text-warna-aksen" : "fill-none text-warna-teks-2/30"
          )}
        />
      ))}
    </div>
  );
}
