import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import { captureNonFatalError } from "@/shared/observability/sentry";

// Show reminders as a banner + sound even when the app is foregrounded;
// without a handler the OS suppresses foreground notifications entirely.
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function routeFromNotificationData(data: unknown) {
  const dealId = (data as { dealId?: unknown } | null | undefined)?.dealId;

  if (typeof dealId === "string" && dealId.length > 0) {
    router.push({ pathname: "/deal/[dealId]", params: { dealId } });
  }
}

/**
 * Routes a tapped reminder to its deal. Handles both a tap while running
 * (listener) and a cold start from a tapped notification (getLast…).
 */
export function useNotificationObservers() {
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let active = true;

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (active && response) {
          routeFromNotificationData(response.notification.request.content.data);
        }
      })
      .catch((error) => captureNonFatalError("notification_cold_start_route_failed", error, { surface: "reminders" }));

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      routeFromNotificationData(response.notification.request.content.data);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
}
