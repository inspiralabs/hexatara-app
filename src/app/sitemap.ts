import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedPath, siteOrigin } from "@/lib/seo/page-metadata";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PUBLIC_PATHS) {
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
