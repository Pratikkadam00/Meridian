import { useLocalSearchParams } from "expo-router";

import { DocumentVaultScreen } from "@/features/documents";
import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";

export default function DocumentsRoute() {
  const { dealId } = useLocalSearchParams<{ dealId?: string | string[] }>();
  const resolvedDealId = Array.isArray(dealId) ? dealId[0] : dealId;

  if (!resolvedDealId) {
    return <AppErrorFallback error={new Error("Deal id is required.")} />;
  }

  return <DocumentVaultScreen dealId={resolvedDealId} />;
}
