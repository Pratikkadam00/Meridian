import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { z } from "zod";

import { useAuth } from "@/features/auth";
import { OnboardingStepView, persistOnboardingStep, useOnboardingStepTracking } from "@/features/onboarding";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Input } from "@/shared/ui/Input";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { SegmentedControl } from "@/shared/ui/SelectableControls";
import { Text } from "@/shared/ui/Text";

type Translate = (key: string, options?: Record<string, unknown>) => string;
type SignUpMode = "create" | "join";

const createSignInSchema = (t: Translate) =>
  z.object({
    email: z.string().email(t("account.errorEmail")),
    // Sign-in only needs a non-empty password — the server verifies it. Strength
    // is enforced at sign-up (below) so an existing account is never locked out.
    password: z.string().min(1, t("account.errorPasswordRequired")),
    fullName: z.string().optional(),
    orgName: z.string().optional(),
    inviteCode: z.string().optional(),
  });

const signUpPasswordSchema = (t: Translate) =>
  // New passwords: >=8 chars with letters and numbers (mirrors the raised
  // Supabase Auth minimum_password_length / password_requirements).
  z
    .string()
    .min(8, t("account.errorPassword"))
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, t("account.errorPassword"));

const createSignUpSchema = (t: Translate) =>
  createSignInSchema(t).extend({
    password: signUpPasswordSchema(t),
    fullName: z.string().min(2, t("account.errorFullName")),
    orgName: z.string().min(2, t("account.errorOrgName")),
  });

// A separate signup path (not a post-hoc org switch) — joining an org is
// decided once, before any deals accumulate under the wrong org.
const createJoinTeamSchema = (t: Translate) =>
  createSignInSchema(t).extend({
    password: signUpPasswordSchema(t),
    fullName: z.string().min(2, t("account.errorFullName")),
    inviteCode: z.string().trim().min(4, t("account.errorInviteCode")),
  });

// Recovery form for a session stranded without a profile (the signup RPC
// failed after auth.signUp() already created the session) — no email/
// password fields, since the account is already authenticated.
const createRecoverySchema = (t: Translate, mode: SignUpMode) =>
  z.object({
    fullName: z.string().min(2, t("account.errorFullName")),
    orgName: mode === "create" ? z.string().min(2, t("account.errorOrgName")) : z.string().optional(),
    inviteCode: mode === "join" ? z.string().trim().min(4, t("account.errorInviteCode")) : z.string().optional(),
  });

type AccountFormValues = z.infer<ReturnType<typeof createSignInSchema>>;
type RecoveryFormValues = z.infer<ReturnType<typeof createRecoverySchema>>;

export default function AccountScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSignIn = params.mode === "sign-in";
  const { session, profile } = useAuth();

  // RootRouter sends an authenticated-but-profileless session here — that
  // means a prior signup's profile RPC failed after auth.signUp() already
  // created the session. Retrying the normal form would call auth.signUp()
  // again for an already-registered email, which is a dead end (Supabase
  // returns needsEmailConfirmation with no session). Recovery skips straight
  // to retrying the profile RPC on the session that already exists.
  if (session && !profile) {
    return <AccountRecoveryView />;
  }

  return <AccountAuthForm isSignIn={isSignIn} />;
}

function AccountAuthForm({ isSignIn }: { isSignIn: boolean }) {
  const { isConfigured, isLoading, signIn, signUp, joinTeam } = useAuth();
  const { isRTL } = useI18nControls();
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [signUpMode, setSignUpMode] = useState<SignUpMode>("create");
  useOnboardingStepTracking("account", 2);

  const schema = useMemo(
    () => (isSignIn ? createSignInSchema(t) : signUpMode === "join" ? createJoinTeamSchema(t) : createSignUpSchema(t)),
    [isSignIn, signUpMode, t],
  );
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      orgName: "",
      inviteCode: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormMessage(null);

    try {
      if (isSignIn) {
        await signIn({
          email: values.email,
          password: values.password,
        });
        router.replace("/");
        return;
      }

      const persona = {
        role: "solo_broker",
        market: "dubai",
        volume: "1-5",
      };

      const result =
        signUpMode === "join"
          ? await joinTeam({
              email: values.email,
              password: values.password,
              fullName: values.fullName ?? "",
              inviteCode: values.inviteCode ?? "",
              persona,
            })
          : await signUp({
              email: values.email,
              password: values.password,
              fullName: values.fullName ?? "",
              orgName: values.orgName ?? "",
              persona,
              developerNames: [],
            });

      if (result.needsEmailConfirmation) {
        setFormMessage(t("account.checkEmailConfirm"));
        return;
      }

      await persistOnboardingStep("personalization");
      router.replace("/personalization");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : t("account.authFailed"));
    }
  });

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <OnboardingStepView>
        <ProgressDots count={5} activeIndex={1} />
        <Text variant="eyebrow">{t("account.step")}</Text>
        <Text variant="h1" style={styles.title}>
          {isSignIn ? t("account.titleSignIn") : t("account.titleSignUp")}
        </Text>

        {!isConfigured ? (
          <View style={styles.notice}>
            <Text variant="caption" muted>
              {t("account.supabaseNotice")}
            </Text>
          </View>
        ) : null}

        {!isSignIn ? (
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onBlur, onChange, value } }) => (
              <Input
                label={t("account.fullNameLabel")}
                placeholder={t("account.fullNamePlaceholder")}
                autoCapitalize="words"
                autoComplete="name"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.fullName?.message}
              />
            )}
          />
        ) : null}

        {!isSignIn ? (
          <>
            <SegmentedControl
              options={["create", "join"] as const}
              labels={{ create: t("account.modeCreate"), join: t("account.modeJoin") }}
              value={signUpMode}
              onChange={setSignUpMode}
              accessibilityLabel={t("account.modeA11y")}
              style={styles.modeToggle}
            />
            {signUpMode === "create" ? (
              <Controller
                control={control}
                name="orgName"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    label={t("account.workspaceLabel")}
                    placeholder={t("account.workspacePlaceholder")}
                    autoCapitalize="words"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.orgName?.message}
                  />
                )}
              />
            ) : (
              <Controller
                control={control}
                name="inviteCode"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Input
                    label={t("account.inviteCodeLabel")}
                    placeholder={t("account.inviteCodePlaceholder")}
                    autoCapitalize="characters"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.inviteCode?.message}
                  />
                )}
              />
            )}
          </>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              label={t("account.emailLabel")}
              placeholder={t("account.emailPlaceholder")}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              label={t("account.passwordLabel")}
              placeholder={t("account.passwordPlaceholder")}
              autoCapitalize="none"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.password?.message}
            />
          )}
        />

        {formMessage ? (
          <Text variant="caption" style={styles.formMessage}>
            {formMessage}
          </Text>
        ) : null}

        {!isSignIn ? (
          <PressableScale
            accessibilityLabel={t("account.ageTerms")}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            selected={accepted}
            focusRadius={10}
            pressScale={0.98}
            pressableStyle={styles.ageRow}
            onPress={() => setAccepted((value) => !value)}
          >
            <View style={[styles.ageBox, accepted && styles.ageBoxChecked]} />
            <Text variant="caption" muted style={styles.ageText}>
              {t("account.ageTerms")}
            </Text>
          </PressableScale>
        ) : null}

        <GoldButton
          label={isSignIn ? t("account.submitSignIn") : t("account.submitSignUp")}
          disabled={!isConfigured || isSubmitting || isLoading || (!isSignIn && !accepted)}
          onPress={submit}
          style={(!isConfigured || isSubmitting || isLoading || (!isSignIn && !accepted)) && styles.disabled}
        />

        <Link href={{ pathname: "/account", params: { mode: isSignIn ? "sign-up" : "sign-in" } }} asChild>
          <PressableScale
            accessibilityLabel={isSignIn ? t("account.switchToSignUpA11y") : t("account.switchToSignInA11y")}
            focusRadius={10}
            pressScale={0.96}
            pressableStyle={styles.switchMode}
          >
            <Text variant="caption" muted>
              {isSignIn ? t("account.switchPromptSignUp") : t("account.switchPromptSignIn")}
              <Text variant="caption" style={styles.switchModeAccent}>
                {isSignIn ? t("account.switchActionSignUp") : t("account.switchActionSignIn")}
              </Text>
            </Text>
          </PressableScale>
        </Link>

        <Link href="/welcome" asChild>
          <GhostButton label={t("account.back")} />
        </Link>
      </OnboardingStepView>
    </Screen>
  );
}

function AccountRecoveryView() {
  const { isLoading, completeWorkspaceProfile, completeTeamJoin, signOut } = useAuth();
  const { isRTL } = useI18nControls();
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<SignUpMode>("create");
  useOnboardingStepTracking("account", 2);

  const schema = useMemo(() => createRecoverySchema(t, mode), [t, mode]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoveryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      orgName: "",
      inviteCode: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setFormMessage(null);

    try {
      const persona = {
        role: "solo_broker",
        market: "dubai",
        volume: "1-5",
      };

      if (mode === "join") {
        await completeTeamJoin({
          fullName: values.fullName,
          inviteCode: values.inviteCode ?? "",
          persona,
        });
      } else {
        await completeWorkspaceProfile({
          fullName: values.fullName,
          orgName: values.orgName ?? "",
          persona,
          developerNames: [],
        });
      }

      await persistOnboardingStep("personalization");
      router.replace("/personalization");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : t("account.authFailed"));
    }
  });

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <OnboardingStepView>
        <ProgressDots count={5} activeIndex={1} />
        <Text variant="eyebrow">{t("account.step")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("account.recoveryTitle")}
        </Text>
        <Text variant="body" muted style={styles.recoveryLede}>
          {t("account.recoveryLede")}
        </Text>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input
              label={t("account.fullNameLabel")}
              placeholder={t("account.fullNamePlaceholder")}
              autoCapitalize="words"
              autoComplete="name"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <SegmentedControl
          options={["create", "join"] as const}
          labels={{ create: t("account.modeCreate"), join: t("account.modeJoin") }}
          value={mode}
          onChange={setMode}
          accessibilityLabel={t("account.modeA11y")}
          style={styles.modeToggle}
        />

        {mode === "create" ? (
          <Controller
            control={control}
            name="orgName"
            render={({ field: { onBlur, onChange, value } }) => (
              <Input
                label={t("account.workspaceLabel")}
                placeholder={t("account.workspacePlaceholder")}
                autoCapitalize="words"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.orgName?.message}
              />
            )}
          />
        ) : (
          <Controller
            control={control}
            name="inviteCode"
            render={({ field: { onBlur, onChange, value } }) => (
              <Input
                label={t("account.inviteCodeLabel")}
                placeholder={t("account.inviteCodePlaceholder")}
                autoCapitalize="characters"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.inviteCode?.message}
              />
            )}
          />
        )}

        {formMessage ? (
          <Text variant="caption" style={styles.formMessage}>
            {formMessage}
          </Text>
        ) : null}

        <GoldButton
          label={isSubmitting || isLoading ? t("account.saving") : t("account.recoverySubmit")}
          disabled={isSubmitting || isLoading}
          onPress={submit}
          style={(isSubmitting || isLoading) && styles.disabled}
        />

        <GhostButton label={t("account.recoverySignOut")} onPress={() => signOut()} style={styles.cancelButton} />
      </OnboardingStepView>
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    screen: {
      gap: t.space[2],
    },
    rtl: {
      direction: "rtl",
    },
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[5],
    },
    notice: {
      borderWidth: 1,
      borderColor: t.color.action,
      borderRadius: t.radius.sm,
      backgroundColor: t.color.selectedTint,
      padding: t.space[3],
      marginBottom: t.space[2],
    },
    modeToggle: {
      marginBottom: t.space[2],
    },
    formMessage: {
      color: t.color.accentText,
      marginBottom: t.space[2],
    },
    disabled: {
      opacity: 0.52,
    },
    switchMode: {
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    switchModeAccent: {
      color: t.color.actionText,
    },
    ageRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[3],
      paddingVertical: t.space[1],
    },
    ageBox: {
      width: 22,
      height: 22,
      borderWidth: 1,
      borderColor: t.color.borderStrong,
      borderRadius: 6,
      backgroundColor: t.color.surfaceCard,
    },
    ageBoxChecked: {
      borderColor: t.color.action,
      backgroundColor: t.color.action,
    },
    ageText: {
      flex: 1,
    },
    recoveryLede: {
      marginBottom: t.space[5],
    },
    cancelButton: {
      marginTop: t.space[3],
    },
  });
