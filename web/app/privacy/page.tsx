import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Meridian handles the limited information collected through the waitlist, in line with the UAE PDPL.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy" updated="June 2026">
      <p>
        This notice explains what Meridian collects through this pre-launch website
        and how it is used. It is written with the UAE Personal Data Protection Law
        (Federal Decree-Law No. 45 of 2021) in mind.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Waitlist details</strong> you choose to give us: your email address,
          and optionally your name and brokerage.
        </li>
        <li>
          <strong>Cookieless analytics</strong>: aggregate, non-identifying usage
          statistics. We do not set advertising or tracking cookies.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Solely to contact you about Meridian early access and founder pricing, and to
        understand interest in the product. We do not sell your data, and we do not
        share it with third parties for their own marketing.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Waitlist entries are stored in our Supabase project. Access is restricted; the
        public website can add you to the list but cannot read the list.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us to access, correct, or delete your information, or to remove you
        from the waitlist, at any time. Email{" "}
        <a href="mailto:privacy@meridian.ae">privacy@meridian.ae</a> and we&apos;ll
        action it.
      </p>

      <h2>Retention</h2>
      <p>
        We keep waitlist details only as long as needed to run early access, then delete
        them.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this notice: <a href="mailto:privacy@meridian.ae">privacy@meridian.ae</a>.
      </p>
    </LegalPage>
  );
}
