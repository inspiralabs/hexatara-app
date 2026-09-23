import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

/**
 * Opsi privasi bersama client/server/edge (F05.5 Opsi C).
 * - sendDefaultPii: false; Replay off
 * - beforeSend: scrub request PII + hapus user/geo dari payload
 * - setUser({ ip_address: null }) dipanggil di tiap file init setelah Sentry.init
 *
 * Batas: peer IP koneksi HTTPS ke ingest tetap terlihat Sentry — lihat plan.md.
 */
export function sentrySharedOptions() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;

  return {
    dsn,
    sendDefaultPii: false,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    beforeSend(event: ErrorEvent) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        if (event.request.headers) {
          const headers = { ...event.request.headers };
          for (const key of Object.keys(headers)) {
            const lower = key.toLowerCase();
            if (
              lower === "cookie" ||
              lower === "authorization" ||
              lower === "x-supabase-auth" ||
              lower.includes("token") ||
              lower.includes("password")
            ) {
              delete headers[key];
            }
          }
          event.request.headers = headers;
        }
      }

      // Opsi C: buang seluruh user context (termasuk geo/ip).
      delete event.user;

      if (event.contexts) {
        const contexts = { ...event.contexts } as Record<string, unknown>;
        delete contexts.geo;
        delete contexts.user;
        event.contexts = contexts as typeof event.contexts;
      }

      return event;
    },
    beforeBreadcrumb(breadcrumb: Breadcrumb) {
      if (breadcrumb.category === "ui.input" || breadcrumb.category === "ui.form") {
        return null;
      }
      if (breadcrumb.data && typeof breadcrumb.data === "object") {
        const data = { ...breadcrumb.data } as Record<string, unknown>;
        delete data.body;
        delete data.request_body;
        delete data.response_body;
        breadcrumb.data = data;
      }
      return breadcrumb;
    },
  };
}
