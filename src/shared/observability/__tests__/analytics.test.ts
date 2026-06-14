import { Sentry } from "@/shared/observability/sentry";
import { trackAnalyticsEvent } from "@/shared/observability/analytics";

describe("trackAnalyticsEvent", () => {
  it("records a redacted analytics breadcrumb so the funnel is observable without PostHog", () => {
    const addBreadcrumb = Sentry.addBreadcrumb as jest.Mock;
    addBreadcrumb.mockClear();

    trackAnalyticsEvent("onboarding_personalization_saved", { role: "solo", email: "broker@brokerage.ae" });

    expect(addBreadcrumb).toHaveBeenCalledTimes(1);
    const payload = addBreadcrumb.mock.calls[0][0];
    expect(payload.category).toBe("analytics");
    expect(payload.message).toBe("onboarding_personalization_saved");
    expect(payload.data.role).toBe("solo");
    // PII keys are redacted before leaving the process.
    expect(payload.data.email).toBe("[redacted]");
  });
});
