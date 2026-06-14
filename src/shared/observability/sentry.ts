import * as Sentry from "@sentry/react-native";

import { installConsoleRedaction, redactSentryEvent, redactUnknown } from "@/shared/security/redaction";

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

installConsoleRedaction();

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),
  tracesSampleRate: sentryDsn ? 0.2 : 0,
  beforeSend: (event) => redactSentryEvent(event),
});

export type PerformanceJourneyName = "open_to_home" | "new_deal_to_saved";

type JourneySpan = ReturnType<typeof Sentry.startInactiveSpan>;

const activeJourneySpans = new Map<PerformanceJourneyName, JourneySpan>();

export function startPerformanceJourney(name: PerformanceJourneyName, attributes: Record<string, string | number | boolean> = {}) {
  activeJourneySpans.get(name)?.end();
  activeJourneySpans.set(
    name,
    Sentry.startInactiveSpan({
      name,
      op: "app.journey",
      attributes: {
        "journey.name": name,
        ...attributes,
      },
    }),
  );
}

export function finishPerformanceJourney(name: PerformanceJourneyName, attributes: Record<string, string | number | boolean> = {}) {
  const span = activeJourneySpans.get(name);

  if (!span) {
    return;
  }

  span.setAttributes(attributes);
  span.end();
  activeJourneySpans.delete(name);
}

export function captureNonFatalError(name: string, error: unknown, context: Record<string, string | number | boolean | null> = {}) {
  Sentry.captureException(redactUnknown(error), {
    level: "warning",
    tags: {
      non_fatal: "true",
      non_fatal_name: name,
    },
    extra: redactUnknown(context) as Record<string, unknown>,
  });
}

export { Sentry };
