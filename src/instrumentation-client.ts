import * as Sentry from "@sentry/nextjs";
import { sentrySharedOptions } from "@/lib/sentry/shared";

const options = sentrySharedOptions();
if (options) {
  Sentry.init({
    ...options,
  });
  // Opsi C: cegah {{auto}} menempelkan IP ke user scope.
  Sentry.setUser({ ip_address: null });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
