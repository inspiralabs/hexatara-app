import * as Sentry from "@sentry/nextjs";
import { sentrySharedOptions } from "@/lib/sentry/shared";

const options = sentrySharedOptions();
if (options) {
  Sentry.init({
    ...options,
    // Jangan pasang replayIntegration — Session Replay dimatikan penuh.
  });
  Sentry.setUser({ ip_address: null });
}
