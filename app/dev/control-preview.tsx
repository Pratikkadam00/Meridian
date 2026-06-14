import { Redirect } from "expo-router";

import { ControlPreview } from "@/shared/ui/ControlPreview";

// Dev-only component gallery; not shipped to end users in production builds.
export default function ControlPreviewRoute() {
  if (!__DEV__) {
    return <Redirect href="/" />;
  }

  return <ControlPreview />;
}
