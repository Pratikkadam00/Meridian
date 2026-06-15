import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Join the Meridian waitlist — early access for the first group of Dubai off-plan brokers.",
  alternates: { canonical: "/join" },
};

export default function Join() {
  return (
    <main>
      <section className="page-hero" style={{ paddingBottom: "104px" }}>
        <div className="grid-bg" />
        <div className="grain" />
        <Nav />
        <div className="wrap join-card">
          <div className="eyebrow lime mono center">Join the waitlist</div>
          <h1 style={{ margin: "0 auto", maxWidth: "none" }}>
            Master <span className="it">the timeline.</span>
          </h1>
          <p className="lede" style={{ margin: "20px auto 0" }}>
            Leave your email and we&apos;ll reach out with early access. No spam — your
            address stays on a private list and never leaves it.
          </p>
          <WaitlistForm source="join-page" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
