import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Check, Eye, FileText, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, StyleSheet, View } from "react-native";

import type { DealDocument, DocumentKind } from "@/shared/data/repositories/dealsRepository";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { captureNonFatalError } from "@/shared/observability/sentry";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GhostButton } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

// The RERA-relevant kinds tracked as a checklist. There is no public
// DLD/Trakheesi API to sync these automatically, so this is a broker-
// maintained checklist + upload vault, not a live registry sync.
const CHECKLIST_KINDS: DocumentKind[] = ["spa", "form_a", "form_b", "form_f", "oqood"];

function kindLabelKey(kind: DocumentKind) {
  switch (kind) {
    case "spa":
      return "documents.kindSpa";
    case "form_a":
      return "documents.kindFormA";
    case "form_b":
      return "documents.kindFormB";
    case "form_f":
      return "documents.kindFormF";
    case "oqood":
      return "documents.kindOqood";
    case "noc":
      return "documents.kindNoc";
    default:
      return "documents.kindOther";
  }
}

export function DocumentVaultScreen({ dealId }: { dealId: string }) {
  const { t } = useTranslation();
  const { isRTL } = useI18nControls();
  const { theme } = useTheme();
  const { deals: dealsRepository } = useRepositories();
  const queryClient = useQueryClient();
  const styles = useThemedStyles(makeStyles);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingKind, setUploadingKind] = useState<DocumentKind | null>(null);

  const documentsQueryKey = ["deal-documents", dealId] as const;
  const documentsQuery = useQuery({
    queryKey: documentsQueryKey,
    queryFn: () => dealsRepository.listDealDocuments(dealId),
  });

  const uploadMutation = useMutation({
    mutationFn: (input: { kind: DocumentKind; fileUri: string; fileName: string; mimeType: string }) => dealsRepository.uploadDealDocument(dealId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
      setMessage(null);
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : t("documents.uploadError"));
    },
    onSettled: () => setUploadingKind(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => dealsRepository.deleteDealDocument(dealId, documentId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: documentsQueryKey }),
    onError: (error) => setMessage(error instanceof Error ? error.message : t("documents.deleteError")),
  });

  async function pickAndUpload(kind: DocumentKind) {
    setMessage(null);
    setUploadingKind(kind);

    try {
      const DocumentPicker = await import("expo-document-picker");
      // The deal-documents storage bucket is locked to application/pdf server-side
      // (phase_15_security_hardening.sql, M7) — restrict the picker to match, so a
      // broker never gets past file selection only to hit a raw storage error.
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });

      if (result.canceled) {
        setUploadingKind(null);
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri) {
        setUploadingKind(null);
        setMessage(t("documents.couldNotReadFile"));
        return;
      }

      // Defense in depth: some platforms/pickers don't perfectly honor the
      // `type` filter above (e.g. a file with no extension or a mismatched
      // mimeType), so re-check before ever hitting the network.
      if (asset.mimeType && asset.mimeType !== "application/pdf") {
        setUploadingKind(null);
        setMessage(t("documents.pdfOnly"));
        return;
      }

      const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
      if (typeof asset.size === "number" && asset.size > MAX_DOCUMENT_BYTES) {
        setUploadingKind(null);
        setMessage(t("documents.fileTooLarge"));
        return;
      }

      uploadMutation.mutate({ kind, fileUri: asset.uri, fileName: asset.name || "document.pdf", mimeType: asset.mimeType || "application/octet-stream" });
    } catch (error) {
      captureNonFatalError("document_picker_failed", error, { surface: "document_vault" });
      setUploadingKind(null);
      setMessage(t("documents.couldNotOpenPicker"));
    }
  }

  async function viewDocument(document: DealDocument) {
    setMessage(null);

    try {
      const url = await dealsRepository.getDocumentSignedUrl(document.storagePath);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      await Linking.openURL(url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("documents.viewError"));
    }
  }

  const documents = documentsQuery.data ?? [];
  const uploadedKinds = new Set(documents.map((document) => document.kind));

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="eyebrow">{t("documents.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("documents.title")}
        </Text>
        <Text variant="body" muted style={styles.lede}>
          {t("documents.lede")}
        </Text>

        {message ? (
          <Text variant="caption" style={styles.error}>
            {message}
          </Text>
        ) : null}

        <Text variant="cardTitle" style={styles.sectionTitle}>
          {t("documents.checklistTitle")}
        </Text>
        <View style={styles.checklist}>
          {CHECKLIST_KINDS.map((kind) => {
            const uploaded = uploadedKinds.has(kind);
            return (
              <View key={kind} style={styles.checklistRow}>
                <View style={[styles.checklistIcon, uploaded && styles.checklistIconDone]}>{uploaded ? <Check size={14} color={theme.color.textOnBrand} strokeWidth={2.6} /> : null}</View>
                <Text variant="body" style={styles.checklistLabel}>
                  {t(kindLabelKey(kind))}
                </Text>
                <GhostButton
                  label={uploadingKind === kind ? t("documents.uploading") : t("documents.upload")}
                  disabled={uploadingKind !== null}
                  onPress={() => pickAndUpload(kind)}
                  style={styles.checklistUpload}
                />
              </View>
            );
          })}
        </View>

        <Text variant="cardTitle" style={styles.sectionTitle}>
          {t("documents.uploadedTitle")}
        </Text>
        {documentsQuery.isLoading ? (
          <Text variant="mono" muted>
            {t("documents.loading")}
          </Text>
        ) : documents.length ? (
          documents.map((document) => (
            <View key={document.id} style={styles.docRow}>
              <FileText size={18} color={theme.color.textSecondary} strokeWidth={2} />
              <View style={styles.docCopy}>
                <Text variant="caption" numberOfLines={1}>
                  {document.name}
                </Text>
                <Text variant="mono" muted>
                  {t(kindLabelKey(document.kind))} · {document.uploadedAtLabel}
                </Text>
              </View>
              <IconButton icon={Eye} label={t("documents.view")} onPress={() => viewDocument(document)} />
              <IconButton icon={Trash2} label={t("documents.deleteDocument")} onPress={() => deleteMutation.mutate(document.id)} />
            </View>
          ))
        ) : (
          <Text variant="body" muted style={styles.emptyText}>
            {t("documents.empty")}
          </Text>
        )}

        <View style={styles.otherRow}>
          <GhostButton label={uploadingKind === "other" ? t("documents.uploading") : t("documents.uploadOther")} disabled={uploadingKind !== null} onPress={() => pickAndUpload("other")} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    rtl: {
      direction: "rtl",
    },
    screen: {
      paddingBottom: 0,
    },
    scroll: {
      paddingBottom: t.sizing.tabBarClearance,
    },
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[2],
    },
    lede: {
      marginBottom: t.space[5],
    },
    error: {
      color: t.status.overdue.text,
      marginBottom: t.space[3],
    },
    sectionTitle: {
      fontSize: 15,
      lineHeight: 20,
      marginBottom: t.space[3],
      marginTop: t.space[2],
    },
    checklist: {
      gap: t.space[2],
      marginBottom: t.space[6],
    },
    checklistRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[3],
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.md,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[3],
    },
    checklistIcon: {
      width: 22,
      height: 22,
      borderRadius: t.radius.pill,
      borderWidth: 1.5,
      borderColor: t.color.borderStrong,
      alignItems: "center",
      justifyContent: "center",
    },
    checklistIconDone: {
      borderColor: t.status.paid.solid,
      backgroundColor: t.status.paid.solid,
    },
    checklistLabel: {
      flex: 1,
    },
    checklistUpload: {
      minHeight: 36,
    },
    docRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[3],
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.md,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[3],
      marginBottom: t.space[2],
    },
    docCopy: {
      flex: 1,
      gap: 2,
    },
    emptyText: {
      marginBottom: t.space[4],
    },
    otherRow: {
      alignItems: "flex-start",
      marginTop: t.space[2],
      marginBottom: t.space[6],
    },
  });
