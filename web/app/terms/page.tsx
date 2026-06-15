import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for using the Meridian pre-launch website and joining the waitlist.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Terms" updated="June 2026">
      <p>
        These terms cover your use of the Meridian pre-launch website and waitlist. By
        using the site or joining the waitlist, you agree to them.
      </p>

      <h2>The waitlist</h2>
      <p>
        Joining the waitlist registers your interest. It does <strong>not</strong>{" "}
        guarantee access to Meridian, any particular price, any feature, or any launch
        date. Founder pricing is offered to an initial cohort and may change for later
        groups.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t misuse the site — no attempts to break, overload, scrape, or probe
        it, and no submitting other people&apos;s details without their consent.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Meridian name, wordmark, copy, and design are ours. Please don&apos;t copy
        or reuse them without permission.
      </p>

      <h2>&quot;As is&quot;</h2>
      <p>
        This is a pre-launch site provided on an &quot;as is&quot; basis, without
        warranties. To the extent permitted by law, we aren&apos;t liable for losses
        arising from its use.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the product develops. Material changes will be
        reflected here with a new &quot;last updated&quot; date.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the United Arab Emirates.</p>
    </LegalPage>
  );
}
