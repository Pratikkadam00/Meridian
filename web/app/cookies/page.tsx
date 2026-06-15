import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Meridian uses only essential cookies and cookieless analytics — no advertising or cross-site tracking.",
  alternates: { canonical: "/cookies" },
};

export default function Cookies() {
  return (
    <LegalPage title="Cookies" updated="June 2026">
      <p>
        We keep this simple: Meridian&apos;s website uses only what it needs to work,
        plus privacy-friendly, cookieless analytics.
      </p>

      <h2>Essential</h2>
      <p>
        Strictly necessary cookies that keep the site functioning and secure. These
        can&apos;t be switched off and don&apos;t track you across sites.
      </p>

      <h2>Analytics (cookieless)</h2>
      <p>
        We measure aggregate traffic with a privacy-friendly, cookieless tool. It does
        not set tracking cookies, does not build a profile of you, and does not follow
        you across other sites.
      </p>

      <h2>What we don&apos;t use</h2>
      <ul>
        <li>No advertising cookies.</li>
        <li>No cross-site tracking or fingerprinting.</li>
        <li>No selling of any data.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:privacy@meridian.ae">privacy@meridian.ae</a>.
      </p>
    </LegalPage>
  );
}
