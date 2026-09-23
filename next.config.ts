import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Poster preset boleh ~1.5 MB; multipart + overhead > default body Server Action (1 MB) → 500.
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // Next 16 default hanya [75] — quality={90} di popup/poster harus di-allowlist.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ojltfmvmbolalhtzrhva.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "hexatara",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  // Source map upload butuh SENTRY_AUTH_TOKEN — ditunda sampai token ada di CI/Vercel.
  sourcemaps: {
    disable: true,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
