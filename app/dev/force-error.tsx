import { Redirect } from "expo-router";

// Dev-only crash route for verifying error boundaries. Never reachable in a
// production build (would otherwise be a deep-link to a guaranteed crash).
export default function ForceErrorRoute() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  throw new Error("Forced Meridian route error");
}
