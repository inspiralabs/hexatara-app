import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Dekorasi mist hero Beranda — dipakai ulang di hero publik lain (satu sistem). */
export function PublicHeroMist({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-background bg-gradient-to-br from-primary/5 via-background to-secondary/5",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-secondary/15 blur-3xl"
      />
      <div className="relative">{children}</div>
    </section>
  );
}
