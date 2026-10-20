// Dipisah dari page-metadata.ts supaya proxy.ts tidak menarik next-intl/navigation.
// Origin untuk SEO saja (canonical, hreflang, OG, sitemap, JSON-LD). URL fungsional
// (email, redirect auth, QR sertifikat) tetap memakai NEXT_PUBLIC_SITE_URL.

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function canonicalOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_CANONICAL_URL;
  return raw ? raw.replace(/\/$/, "") : siteOrigin();
}

/** `host` boleh membawa port. Host selain canonical (dan www.-nya) = staging → noindex. */
export function isIndexableHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0] ?? "";
  if (h === "localhost") return true;
  const canonical = new URL(canonicalOrigin()).hostname.toLowerCase();
  return h === canonical || h === `www.${canonical}`;
}
