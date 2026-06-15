import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fraunces, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import RevealObserver from "@/components/RevealObserver";
import "./globals.css";

const disp = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-disp",
  display: "swap",
});
const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic", "normal"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
const hand = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hand",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meridian.ae";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Meridian — Off-plan deals, handled.",
    template: "%s — Meridian",
  },
  description:
    "A deal manager for Dubai off-plan brokers. Meridian tracks every construction-linked payment — booking to handover — reads the plan from your SPA, and reminds you before each one is due.",
  applicationName: "Meridian",
  keywords: [
    "Dubai off-plan",
    "off-plan payment plan",
    "real estate broker software",
    "SPA payment schedule",
    "DLD Oqood",
    "handover reminders",
  ],
  authors: [{ name: "Meridian" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Meridian",
    title: "Meridian — Off-plan deals, handled.",
    description:
      "Track every construction-linked payment on every Dubai off-plan deal — booking to handover. Read from the SPA. Reminders before every milestone.",
    url: siteUrl,
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian — Off-plan deals, handled.",
    description:
      "The off-plan deal OS for Dubai brokers. Payment plans tracked against the construction schedule.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a2016",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Meridian",
    url: siteUrl,
    description:
      "A deal manager for Dubai off-plan brokers — construction-linked payment plans tracked from booking to handover.",
    areaServed: "Dubai, United Arab Emirates",
  };

  return (
    <html
      lang="en"
      className={`${disp.variable} ${serif.variable} ${sans.variable} ${mono.variable} ${hand.variable}`}
    >
      <body>
        {children}
        <RevealObserver />
        <script
          type="application/ld+json"
          // Static, developer-authored JSON-LD — no user input is interpolated.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
