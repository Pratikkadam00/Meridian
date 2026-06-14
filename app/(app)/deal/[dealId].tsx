import { useLocalSearchParams } from "expo-router";

import { DealDetailScreen } from "@/features/deal";
import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";

export default function DealRoute() {
  const { dealId } = useLocalSearchParams<{ dealId?: string | string[] }>();
  const resolvedDealId = Array.isArray(dealId) ? dealId[0] : dealId;

  if (!resolvedDealId) {
    return <AppErrorFallback error={new Error("Deal id is required.")} />;
  }

  return <DealDetailScreen dealId={resolvedDealId} />;
}
