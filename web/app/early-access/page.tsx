import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Early access",
  description:
    "Join the first group of Dubai off-plan brokers on Meridian. There's no checkout yet — join the waitlist and we'll set you up.",
  alternates: { canonical: "/early-access" },
};

const included = [
  "Unlimited deals and payment plans",
  "SPA reading + plan confirmation",
  "Reminders by push and email",
  "Portfolio view of everything due",
  "A direct line to the team",
];

export default function EarlyAccess() {
  return (
    <main>
      <section className="page-hero">
        <div className="grid-bg" />
        <div className="grain" />
        <Nav />
        <div className="wrap">
          <div className="eyebrow lime mono">Early access</div>
          <h1>
            First cohort, <span className="it">first to know.</span>
          </h1>
          <p className="lede">
            We&apos;re onboarding a first group of Dubai brokers. There&apos;s no
            checkout yet — join the waitlist and we&apos;ll set you up.
          </p>
        </div>
      </section>

      <section className="section deep">
        <div className="wrap">
          <div className="tiers" style={{ gridTemplateColumns: "1fr", maxWidth: "560px", margin: "0 auto" }}>
            <div className="tier feat">
              <div className="tname">What you get</div>
              <ul style={{ marginTop: "20px" }}>
                {included.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div style={{ marginTop: "26px" }}>
                <WaitlistForm source="early-access" />
              </div>
            </div>
          </div>
          <p
            className="mono"
            style={{
              color: "var(--sage)",
              maxWidth: "560px",
              margin: "22px auto 0",
              textAlign: "center",
              textTransform: "none",
              letterSpacing: "0.03em",
              lineHeight: 1.6,
            }}
          >
            Joining the waitlist doesn&apos;t guarantee access or a launch date. We&apos;ll
            share pricing with the first cohort directly.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
