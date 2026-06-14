export const resources = {
  en: {
    translation: {
      welcome: {
        eyebrow: "For Dubai off-plan brokers",
        title: "Track every milestone, booking to handover.",
        lede: "Drop the SPA, we read the payment plan. Reminders fire before every DLD deadline. Your whole portfolio, in one glance.",
        primaryCta: "Get started",
        secondaryCta: "I already have an account",
      },
      home: {
        eyebrow: "Portfolio - Q2 2026",
        title: "Your deals",
        inEscrow: "in escrow",
        due: "due",
        next: "Next",
        paid: "paid",
        dueInFive: "Due in 5 days",
      },
      error: {
        eyebrow: "Error boundary",
        title: "Something needs attention",
        body: "This screen failed safely. Meridian can recover without a white screen.",
        retry: "Try again",
      },
    },
  },
  ar: {
    translation: {
      welcome: {
        eyebrow: "لوسطاء العقارات قيد الإنشاء في دبي",
        title: "تابع كل مرحلة من الحجز حتى التسليم.",
        lede: "ارفع اتفاقية البيع، نقرأ خطة السداد. تصلك التنبيهات قبل كل موعد، ومحفظتك واضحة في لمحة واحدة.",
        primaryCta: "ابدأ الآن",
        secondaryCta: "لدي حساب بالفعل",
      },
      home: {
        eyebrow: "المحفظة - الربع الثاني 2026",
        title: "صفقاتك",
        inEscrow: "في الضمان",
        due: "مستحق",
        next: "التالي",
        paid: "مدفوع",
        dueInFive: "مستحق خلال 5 أيام",
      },
      error: {
        eyebrow: "حاجز الخطأ",
        title: "هناك أمر يحتاج الانتباه",
        body: "تعطل هذا المسار بأمان. يمكن لميريديان التعافي دون شاشة بيضاء.",
        retry: "حاول مرة أخرى",
      },
    },
  },
} as const;

export type SupportedLanguage = keyof typeof resources;
