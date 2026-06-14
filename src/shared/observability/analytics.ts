import { redactUnknown } from "@/shared/security/redaction";
import { Sentry } from "./sentry";

export type AnalyticsEventName =
  | "onboarding_step_viewed"
  | "onboarding_personalization_saved"
  | "onboarding_permissions_selected"
  | "onboarding_completed";

type AnalyticsProperties = Record<string, string | number | boolean | null>;

type PostHogClient = { capture: (event: string, properties?: Record<string, unknown>) => void };

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

let posthogClient: PostHogClient | null = null;
let posthogInitStarted = false;

async function getPostHog(): Promise<PostHogClient | null> {
  if (!posthogKey || posthogClient || posthogInitStarted) {
    return posthogClient;
  }

  posthogInitStarted = true;

  try {
    const module = await import("posthog-react-native");
    const PostHog = module.default;
    posthogClient = new PostHog(posthogKey, { host: posthogHost }) as unknown as PostHogClient;
  } catch (error) {
    Sentry.captureException(redactUnknown(error));
  }

  return posthogClient;
}

/**
 * Emits a product-analytics event. Properties are PII-redacted. A Sentry
 * breadcrumb is always recorded so the onboarding funnel is observable even
 * when PostHog isn't configured (dev / preview); when EXPO_PUBLIC_POSTHOG_KEY
 * is set the event is also captured to PostHog for funnel/drop-off analysis.
 */
export function trackAnalyticsEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  const safeProperties = redactUnknown(properties) as Record<string, unknown>;

  Sentry.addBreadcrumb({
    category: "analytics",
    type: "user",
    level: "info",
    message: name,
    data: safeProperties,
  });

  if (!posthogKey) {
    return;
  }

  void getPostHog()
    .then((client) => client?.capture(name, safeProperties))
    .catch(() => undefined);
}
