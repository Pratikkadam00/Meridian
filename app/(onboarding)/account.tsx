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
import { tokens } from "@/shared/theme/tokens";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { PressableScale } from "@/shared/ui/PressableScale";
import { Input } from "@/shared/ui/Input";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

type Translate = (key: string, options?: Record<string, unknown>) => string;

const createSignInSchema = (t: Translate) =>
  z.object({
    email: z.string().email(t("account.errorEmail")),
    password: z.string().min(6, t("account.errorPassword")),
    fullName: z.string().optional(),
    orgName: z.string().optional(),
  });

const createSignUpSchema = (t: Translate) =>
  createSignInSchema(t).extend({
    fullName: z.string().min(2, t("account.errorFullName")),
    orgName: z.string().min(2, t("account.errorOrgName")),
  });

type AccountFormValues = z.infer<ReturnType<typeof createSignInSchema>>;

export default function AccountScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSignIn = params.mode === "sign-in";
  const { isConfigured, isLoading, signIn, signUp } = useAuth();
  const { isRTL } = useI18nControls();
  const { t } = useTranslation();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  useOnboardingStepTracking("account", 2);

  const schema = useMemo(
    () => (isSignIn ? createSignInSchema(t) : createSignUpSchema(t)),
    [isSignIn, t],
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

      const result = await signUp({
        email: values.email,
        password: values.password,
        fullName: values.fullName ?? "",
        orgName: values.orgName ?? "",
        persona: {
          role: "solo_broker",
          market: "dubai",
          volume: "1-5",
        },
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
            accessibilityState={{ checked: accepted }}
            selected={accepted}
            focusRadius={tokens.radius.field}
            pressScale={tokens.control.optionChip.pressScale}
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
            focusRadius={tokens.radius.field}
            pressScale={tokens.control.button.pressScale}
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

const styles = StyleSheet.create({
  screen: {
    gap: tokens.spacing[8],
  },
  rtl: {
    direction: "rtl",
  },
  title: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[22],
  },
  notice: {
    borderWidth: 1,
    borderColor: tokens.colors.goldHairline,
    borderRadius: tokens.radius.field,
    backgroundColor: tokens.colors.goldTint,
    padding: tokens.spacing[12],
    marginBottom: tokens.spacing[8],
  },
  formMessage: {
    color: tokens.colors.due,
    marginBottom: tokens.spacing[8],
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
    color: tokens.colors.accent,
  },
  ageRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    paddingVertical: tokens.spacing[4],
  },
  ageBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: 6,
    backgroundColor: tokens.colors.panel,
  },
  ageBoxChecked: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.accent,
  },
  ageText: {
    flex: 1,
  },
});
