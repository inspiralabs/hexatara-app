import type { MetadataRoute } from "next";
import { canonicalOrigin } from "@/lib/seo/page-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/en/dashboard"],
    },
    sitemap: `${canonicalOrigin()}/sitemap.xml`,
  };
}
