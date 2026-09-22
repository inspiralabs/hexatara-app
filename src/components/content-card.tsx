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
  variant = "default",
  imageFit = "cover",
  imageBg,
  className,
}: {
  image?: { src: string; alt: string } | null;
  badges?: ReactNode;
  title: ReactNode;
  meta?: ReactNode[];
  rating?: number | null;
  price?: ReactNode;
  cta?: ReactNode;
  /** `public` = border saja, shadow hanya hover (§12.6.9). Default tetap untuk dashboard. */
  variant?: "default" | "public";
  /** Cover (default) untuk thumbnail terkunci rasio; contain untuk foto produk utuh. */
  imageFit?: "cover" | "contain";
  /** Kelas latar area gambar, mis. bg-white untuk foto produk. */
  imageBg?: string;
  className?: string;
}) {
  const isPublic = variant === "public";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden border border-border bg-background [transition:var(--transition-hover)]",
        isPublic
          ? "rounded-xl bg-card shadow-none hover:-translate-y-0.5 hover:shadow-float-hover"
          : "rounded-lg shadow-float hover:-translate-y-0.5 hover:shadow-float-hover",
        className
      )}
    >
      {image && (
        <div className={cn("relative aspect-video w-full", imageBg)}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className={imageFit === "contain" ? "object-contain" : "object-cover"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading="lazy"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
        <h3
          className={cn(
            "font-semibold text-foreground",
            isPublic ? "text-base leading-snug" : "text-lg font-bold"
          )}
        >
          {title}
        </h3>
        {meta?.map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground">
            {line}
          </p>
        ))}
        {rating !== undefined && <StarRating rating={rating} />}
        {price && (
          <p
            className={cn(
              "font-bold",
              isPublic ? "text-2xl text-primary sm:text-3xl" : "text-3xl text-foreground"
            )}
          >
            {price}
          </p>
        )}
        {cta && <div className="mt-auto pt-2">{cta}</div>}
      </div>
    </article>
  );
}
