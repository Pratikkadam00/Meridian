import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
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

const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Use at least 6 characters."),
  fullName: z.string().optional(),
  orgName: z.string().optional(),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, "Enter your full name."),
  orgName: z.string().min(2, "Enter your workspace name."),
});

type AccountFormValues = z.infer<typeof signInSchema>;

export default function AccountScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSignIn = params.mode === "sign-in";
  const { isConfigured, isLoading, signIn, signUp } = useAuth();
  const { isRTL } = useI18nControls();
  const [formMessage, setFormMessage] = useState<string | null>(null);
  useOnboardingStepTracking("account", 2);

  const schema = useMemo(() => (isSignIn ? signInSchema : signUpSchema), [isSignIn]);
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
        setFormMessage("Check your email to confirm the account, then sign in.");
        return;
      }

      await persistOnboardingStep("personalization");
      router.replace("/personalization");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "Authentication failed.");
    }
  });

  return (
    <Screen contentStyle={[styles.screen, isRTL && styles.rtl]}>
      <OnboardingStepView>
        <ProgressDots count={5} activeIndex={1} />
        <Text variant="eyebrow">Step 2</Text>
        <Text variant="h1" style={styles.title}>
          {isSignIn ? "Sign in" : "Create your workspace"}
        </Text>

        {!isConfigured ? (
          <View style={styles.notice}>
            <Text variant="caption" muted>
              Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable auth.
            </Text>
          </View>
        ) : null}

        {!isSignIn ? (
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onBlur, onChange, value } }) => (
              <Input
                label="Full name"
                placeholder="Your name"
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
                label="Workspace"
                placeholder="Brokerage or personal workspace"
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
              label="Work email"
              placeholder="you@brokerage.ae"
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
              label="Password"
              placeholder="Minimum 6 characters"
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

        <GoldButton
          label={isSignIn ? "Sign in" : "Continue"}
          disabled={!isConfigured || isSubmitting || isLoading}
          onPress={submit}
          style={(!isConfigured || isSubmitting || isLoading) && styles.disabled}
        />

        <Link href={{ pathname: "/account", params: { mode: isSignIn ? "sign-up" : "sign-in" } }} asChild>
          <PressableScale
            accessibilityLabel={isSignIn ? "Create a workspace" : "Sign in"}
            focusRadius={tokens.radius.field}
            pressScale={tokens.control.button.pressScale}
            pressableStyle={styles.switchMode}
          >
            <Text variant="caption" muted>
              {isSignIn ? "Need a workspace? " : "Already have an account? "}
              <Text variant="caption" style={styles.switchModeAccent}>
                {isSignIn ? "Create one" : "Sign in"}
              </Text>
            </Text>
          </PressableScale>
        </Link>

        <Link href="/welcome" asChild>
          <GhostButton label="Back" />
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
});
