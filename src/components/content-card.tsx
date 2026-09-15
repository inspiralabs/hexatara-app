import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "cn";
import { StarRating } from "@/components/star-rating";

export function ContentCard({
  image,
  badges,
  title,
  meta,
  rating,
  price,
  cta,
  className,
}: {
  image?: { src: string; alt: string } | null;
  badges?: ReactNode;
  title: ReactNode;
  meta?: ReactNode[];
  rating?: number | null;
  price?: ReactNode;
  cta?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-background",
        "shadow-float hover:-translate-y-0.5 hover:shadow-float-hover [transition:var(--transition-hover)]",
        className
      )}
    >
      {image && (
        <div className="relative aspect-video w-full">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {meta?.map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
        {rating !== undefined && <StarRating rating={rating} />}
        {price && <p className="text-3xl font-bold text-foreground">{price}</p>}
        {cta && <div className="mt-auto pt-2">{cta}</div>}
      </div>
    </article>
  );
}
