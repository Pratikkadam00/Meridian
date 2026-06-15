import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Upload the SPA, confirm the payment plan Meridian reads from it, and get reminded before every milestone — booking, DLD/Oqood, construction stages, handover.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    n: "01",
    h: "Upload the SPA",
    p: "Drop the signed sale & purchase agreement. Meridian reads the payment schedule straight from it — no re-typing the plan.",
  },
  {
    n: "02",
    h: "Confirm the plan",
    p: "Booking, DLD/Oqood registration, each construction stage and handover are laid out against the schedule. You check the figures and confirm.",
  },
  {
    n: "03",
    h: "Stay ahead",
    p: "A reminder lands before every milestone — on your phone and by email. Mark each instalment paid and the record stays clean and dated.",
  },
];

export default function HowItWorks() {
  return (
    <main>
      <section className="page-hero">
        <div className="grid-bg" />
        <div className="grain" />
        <Nav />
        <div className="wrap" style={{ paddingTop: "40px" }}>
          <div className="eyebrow lime mono">How it works</div>
          <h1>
            From the SPA to <span className="it">the next payment.</span>
          </h1>
          <p className="lede">
            Off-plan money moves with the build. Meridian turns the contract into a
            tracked plan and keeps you a step ahead of every deadline.
          </p>
        </div>
      </section>

      <section className="section deep">
        <div className="wrap">
          <div className="steps">
            {steps.map((s) => (
              <div className="step rv" key={s.n}>
                <div className="n">{s.n}</div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="feature cream">
        <div className="wrap">
          <div className="grid">
            <div className="rv">
              <div className="eyebrow dark mono">Built around the schedule</div>
              <h2>The plan, against the DLD schedule.</h2>
              <p>
                Every instalment is tied to a construction trigger — not a guess.
                Paid, due, overdue and what&apos;s next, in one view per deal and
                across your whole portfolio.
              </p>
            </div>
            <div className="media rv d1">
              <div className="uicard">
                <div className="uh">Marina Vista — 2BR</div>
                <div className="uh2">Payment plan</div>
                <div className="mrow">
                  <div>
                    <div className="ml">✓ 20% Booking</div>
                    <div className="ms">paid 12 Jan</div>
                  </div>
                  <span className="mp">640,000</span>
                </div>
                <div className="mrow">
                  <div>
                    <div className="ml" style={{ color: "#e0a458" }}>
                      ● 40% construction
                    </div>
                    <div className="ms">due 19 Jun</div>
                  </div>
                  <span className="mp" style={{ color: "#e0a458" }}>
                    320,000
                  </span>
                </div>
                <div className="mrow">
                  <div>
                    <div className="ml" style={{ color: "#8b919c" }}>
                      ○ Handover
                    </div>
                    <div className="ms">Q4 2026</div>
                  </div>
                  <span className="mp">1,280,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="bp" />
        <div className="wrap rv">
          <h2 className="h-big">
            Ready when <span className="it">you are.</span>
          </h2>
          <p className="sub">
            We&apos;re onboarding a first group of Dubai brokers with early access.
          </p>
          <div style={{ maxWidth: "380px", margin: "30px auto 0" }}>
            <WaitlistForm source="how-it-works" />
          </div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
