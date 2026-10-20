import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { canonicalOrigin, localizedPath } from "@/lib/seo/page-metadata";
import { isFreemiumLmsOpen } from "@/lib/site-settings";

// Bergantung pada saklar LMS (cookies) — selalu dinamis, bukan prerender saat build.
export const dynamic = "force-dynamic";

/** Path publik statis saja — slug dinamis batch/produk ditunda (plan F05.4). */
const STATIC_PUBLIC_PATHS = [
  "/",
  "/pelatihan",
  "/katalog",
  "/verify",
  "/faq",
  "/kuis",
  "/tentang-kami",
  "/syarat-ketentuan",
  "/kebijakan-privasi",
  "/ketentuan-layanan",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = canonicalOrigin();
  const lmsOpen = await isFreemiumLmsOpen();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PUBLIC_PATHS) {
    if (path === "/kuis" && !lmsOpen) continue;
    for (const locale of routing.locales) {
      entries.push({
        url: `${origin}${localizedPath(locale, path)}`,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  return entries;
}
