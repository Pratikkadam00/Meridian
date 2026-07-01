import { useLocalSearchParams } from "expo-router";

import { CommissionEditorScreen } from "@/features/commission";
import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";

export default function CommissionRoute() {
  const { dealId } = useLocalSearchParams<{ dealId?: string | string[] }>();
  const resolvedDealId = Array.isArray(dealId) ? dealId[0] : dealId;

  if (!resolvedDealId) {
    return <AppErrorFallback error={new Error("Deal id is required.")} />;
  }

  return <CommissionEditorScreen dealId={resolvedDealId} />;
}
