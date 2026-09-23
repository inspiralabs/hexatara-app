import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Shared social preview — public/og-hexatara.png (1200×630). */
export const OG_IMAGE = {
  url: "/og-hexatara.png",
  width: 1200,
  height: 630,
  alt: "Hexatara",
} as const;

type PathnameHref = Parameters<typeof getPathname>[0]["href"];

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function absoluteUrl(pathname: string): string {
  return `${siteOrigin()}${pathname}`;
}

/** Strip HTML for meta description (Tiptap bodies). */
export function plainDescription(
  html: string | null | undefined,
  max = 160,
): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/** Locale-aware path via next-intl (honors localePrefix: as-needed). */
export function localizedPath(locale: string, path: PathnameHref): string {
  return getPathname({ locale, href: path });
}

/**
 * Page-level Metadata: title, description, Open Graph, Twitter, hreflang.
 * x-default → defaultLocale (id) URL without /id/ prefix.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  locale: string;
  path: PathnameHref;
  title: string;
  description: string;
  /** Skip `%s | Hexatara` template (e.g. home already includes brand). */
  absoluteTitle?: boolean;
}): Metadata {
  const defaultUrl = absoluteUrl(localizedPath(routing.defaultLocale, path));
  const languages: Record<string, string> = {
    "x-default": defaultUrl,
  };
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(localizedPath(loc, path));
  }

  const canonical = languages[locale] ?? defaultUrl;
  const ogLocale = locale === "en" ? "en_US" : "id_ID";

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Hexatara",
      locale: ogLocale,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
