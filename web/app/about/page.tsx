import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meridian is built for the way Dubai off-plan actually works — deals that close over years, paid in instalments tied to construction.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <main>
      <section className="page-hero">
        <div className="grid-bg" />
        <div className="grain" />
        <Nav />
        <div className="wrap" style={{ paddingTop: "40px" }}>
          <div className="eyebrow lime mono">About</div>
          <h1>
            Built for the deal that <span className="it">takes years.</span>
          </h1>
          <p className="lede">
            A Dubai off-plan sale isn&apos;t one transaction — it&apos;s a schedule
            of payments tied to how high the building has climbed. Meridian is the
            tool for that reality.
          </p>
        </div>
      </section>

      <section className="section deep">
        <div className="wrap prose">
          <p>
            Most broker tools were built for resale: list, sell, close, move on.
            Off-plan is different. The commission is earned at booking, but the deal
            lives for years — booking, DLD/Oqood registration, construction
            instalment after construction instalment, then handover. Miss a date and
            it&apos;s the broker who hears about it.
          </p>
          <h2>What Meridian does</h2>
          <p>
            It reads the payment plan from the SPA, tracks every instalment against
            the construction schedule, and reminds the broker before each one is due
            — on the phone and by email. Bilingual, English and Arabic. Nothing more
            than that, and nothing less.
          </p>
          <h2>What it doesn&apos;t do</h2>
          <p>
            It doesn&apos;t hold client money, it doesn&apos;t replace your CRM, and
            it doesn&apos;t pretend off-plan is something it isn&apos;t. It does one
            job — the payment timeline — and does it cleanly.
          </p>
        </div>
      </section>

      <section className="closing">
        <div className="bp" />
        <div className="wrap rv">
          <h2 className="h-big">
            Master <span className="it">the timeline.</span>
          </h2>
          <p className="sub">Join the first group of brokers getting early access.</p>
          <div style={{ maxWidth: "380px", margin: "30px auto 0" }}>
            <WaitlistForm source="about" />
          </div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
