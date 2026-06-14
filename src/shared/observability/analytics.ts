export type AnalyticsEventName =
  | "onboarding_step_viewed"
  | "onboarding_personalization_saved"
  | "onboarding_permissions_selected"
  | "onboarding_completed";

type AnalyticsProperties = Record<string, string | number | boolean | null>;

export function trackAnalyticsEvent(_name: AnalyticsEventName, _properties: AnalyticsProperties = {}) {
  return undefined;
}
