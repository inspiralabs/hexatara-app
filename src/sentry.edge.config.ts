import * as Sentry from "@sentry/nextjs";
import { sentrySharedOptions } from "@/lib/sentry/shared";

const options = sentrySharedOptions();
if (options) {
  Sentry.init({
    ...options,
  });
  Sentry.setUser({ ip_address: null });
}
