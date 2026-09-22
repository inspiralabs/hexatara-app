/** Kelas CTA & section — hanya dipakai di halaman `(public)`, bukan ui/button global. */

export const publicSectionHeading =
  "font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl";

export const publicCtaPrimary =
  "inline-flex h-11 min-h-11 shrink-0 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground [transition:var(--transition-hover)] hover:bg-primary/90 hover:shadow-float-hover";

export const publicCtaSecondary =
  "inline-flex h-11 min-h-11 shrink-0 items-center justify-center rounded-md border border-border bg-background px-6 text-base font-semibold text-foreground [transition:var(--transition-hover)] hover:bg-accent hover:text-accent-foreground";

export const publicBadgeKategori =
  "inline-flex w-fit rounded-full bg-accent px-2.5 py-0.5 text-sm font-medium text-accent-foreground";

/** Badge status batch di permukaan publik — token Cobalt (bukan STATUS_BATCH_LABEL admin). */
export const publicStatusBatchClass = {
  upcoming:
    "inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary",
  open: "inline-flex w-fit rounded-full bg-secondary/25 px-2.5 py-0.5 text-sm font-medium text-secondary-foreground",
  closed:
    "inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium text-muted-foreground",
} as const;
