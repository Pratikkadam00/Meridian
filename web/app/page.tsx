import Nav from "@/components/Nav";
import Tower from "@/components/Tower";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="grid-bg" />
        <div className="grain" />
        <Nav />
        <div className="stage">
          <div className="wrap copy">
            <div className="eyebrow lime mono">For Dubai off-plan brokers</div>
            <h1>
              <span className="ln">
                <span>Every floor</span>
              </span>
              <span className="ln">
                <span>is a payment.</span>
              </span>
              <span className="ln">
                <span className="it">Track every one.</span>
              </span>
            </h1>
            <p className="sub">
              Off-plan money moves with the build — booking, registration, each
              construction stage, handover. Meridian tracks the whole climb, and
              reminds you before any of it is due.
            </p>
            <div className="cta">
              <WaitlistForm source="hero" />
            </div>
          </div>
          <Tower />
        </div>
        <div className="foot">
          <div className="mono">01 — The off-plan deal OS</div>
          <div className="scrollcue">Scroll ↓</div>
        </div>
      </section>

      {/* ===== STATEMENT ===== */}
      <section className="outgrown">
        <div className="bp" />
        <div className="wrap rv">
          <h2 className="h-big">
            You&apos;ve outgrown
            <br />
            <span className="it">the spreadsheet.</span>
          </h2>
          <p>
            A deal that takes three years to close needs more than a row in Excel
            and a date in your head.
          </p>
        </div>
      </section>

      <svg className="torn" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,40 L0,17 C120,7 200,24 340,15 C480,6 560,26 700,17 C840,9 960,27 1120,17 C1260,9 1360,24 1440,15 L1440,40 Z"
          fill="#0a2016"
        />
      </svg>

      {/* ===== STATS ===== */}
      <section className="stats" aria-label="Why off-plan needs Meridian">
        <div className="row">
          <div className="stat rv">
            <div className="ph" />
            <div className="big lime">60%</div>
            <div className="lbl">
              of Dubai sales are off-plan — the deals built on a payment schedule.
            </div>
          </div>
          <div className="stat rv d1">
            <div className="ph" />
            <div className="big">Every dirham</div>
            <div className="lbl">
              tracked against the DLD construction schedule, booking to handover.
            </div>
          </div>
          <div className="stat rv d2">
            <div className="ph" />
            <div className="big lime">0</div>
            <div className="lbl">
              missed deadlines — a reminder before every milestone is due.
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE 1 — SPA reads itself ===== */}
      <section className="feature cream">
        <div className="wrap">
          <div className="grid">
            <div className="rv">
              <div className="eyebrow dark mono">From SPA to tracked deal</div>
              <h2>A plan that reads itself.</h2>
              <p>
                Drop the SPA and Meridian fills the payment plan — booking, DLD
                registration, every construction stage, handover. You just confirm.
              </p>
              <a className="lk" href="/how-it-works">
                How it works
              </a>
            </div>
            <div className="media rv d1">
              <div className="uicard">
                <div className="uh">Marina Vista — extracted plan</div>
                <div className="uh2">Payment plan</div>
                <div className="mrow">
                  <div>
                    <div className="ml">Down payment</div>
                    <div className="ms">20% · booking</div>
                  </div>
                  <span className="mp">640,000</span>
                </div>
                <div className="mrow">
                  <div>
                    <div className="ml">DLD / Oqood</div>
                    <div className="ms">4% · registration</div>
                  </div>
                  <span className="mp">128,000</span>
                </div>
                <div className="mrow">
                  <div>
                    <div className="ml">40% construction</div>
                    <div className="ms">10% · due 19 Jun</div>
                  </div>
                  <span className="mp">320,000</span>
                </div>
                <div className="mrow">
                  <div>
                    <div className="ml">Handover</div>
                    <div className="ms">40% · Q4 2026</div>
                  </div>
                  <span className="mp">1,280,000</span>
                </div>
              </div>
              <div
                className="note lime"
                style={{ top: "-26px", right: "24px", transform: "rotate(-5deg)" }}
              >
                read from your SPA ✓
              </div>
              <svg
                className="ann draw"
                style={{ top: "-6px", right: "6px", width: "130px", height: "64px" }}
                viewBox="0 0 130 64"
                fill="none"
                aria-hidden="true"
              >
                <path
                  pathLength={1}
                  d="M14,34 C14,14 64,10 104,18 C122,22 120,48 100,54 C66,62 18,56 10,36"
                  stroke="#9bbf3e"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE 2 — reminders ===== */}
      <section className="feature bone">
        <div className="wrap">
          <div className="grid rev">
            <div className="media rv">
              <div className="uicard">
                <div className="uh">This week</div>
                <div className="uh2">Due across your deals</div>
                <div
                  style={{
                    fontFamily: "var(--disp)",
                    fontWeight: 700,
                    fontSize: "34px",
                    letterSpacing: "-.02em",
                  }}
                >
                  AED 412,000
                </div>
                <div className="mrow" style={{ marginTop: "8px" }}>
                  <div>
                    <div className="ml">Marina Vista · 40% built</div>
                    <div className="ms">Emaar · Wed 19 Jun</div>
                  </div>
                  <span className="mp" style={{ color: "#e0a458" }}>
                    in 5 days
                  </span>
                </div>
                <div className="mrow">
                  <div>
                    <div className="ml">Studio 412 · Oqood</div>
                    <div className="ms">Binghatti · Fri 21 Jun</div>
                  </div>
                  <span className="mp">in 7 days</span>
                </div>
              </div>
              <svg
                className="ann draw"
                style={{ bottom: "-26px", left: "-14px", width: "200px", height: "90px" }}
                viewBox="0 0 200 90"
                fill="none"
                aria-hidden="true"
              >
                <path
                  pathLength={1}
                  d="M6,82 C40,70 64,58 92,52 C120,46 150,30 192,8"
                  stroke="#9bbf3e"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <path
                  pathLength={1}
                  className="s2"
                  d="M180,8 L193,7 L189,20"
                  stroke="#9bbf3e"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="rv d1">
              <div className="eyebrow dark mono">Reminders</div>
              <h2>A step ahead of every deadline.</h2>
              <p>
                A nudge before each milestone — on your phone and by email — and a
                portfolio view of exactly what&apos;s due this week. Nothing slips.
              </p>
              <a className="lk" href="/how-it-works">
                See reminders
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE 3 — payment tower (fly-in) ===== */}
      <section className="feature cream">
        <div className="wrap">
          <div className="grid">
            <div className="rv">
              <div className="eyebrow dark mono">The payment tower</div>
              <h2>Every milestone you can see coming.</h2>
              <p>
                The full plan against the DLD schedule — paid, due, overdue, and
                what&apos;s next. Mark a payment and it updates the moment you do.
              </p>
              <a className="lk" href="/how-it-works">
                Explore a deal
              </a>
            </div>
            <div className="media fly">
              <div className="uicard">
                <div className="uh">Marina Vista — 2BR</div>
                <div className="uh2">
                  AED 1.09M{" "}
                  <span style={{ fontSize: "12px", color: "#8b919c" }}>/ 3.20M paid</span>
                </div>
                <div
                  style={{
                    height: "7px",
                    borderRadius: "9px",
                    background: "#23262d",
                    overflow: "hidden",
                    marginBottom: "16px",
                  }}
                >
                  <i
                    style={{
                      display: "block",
                      height: "100%",
                      width: "34%",
                      background: "linear-gradient(90deg,var(--gold),var(--gold-deep))",
                    }}
                  />
                </div>
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

      {/* ===== FEATURE 4 — confirmed payments (checkmarks) ===== */}
      <section className="feature bone">
        <div className="wrap">
          <div className="grid rev">
            <div className="media rv">
              <div className="uicard">
                <div className="uh">Confirmed payments</div>
                <div className="uh2">Marina Vista</div>
                {[
                  { ml: "Down payment", ms: "20% · 12 Jan", mp: "640,000", s: "" },
                  { ml: "DLD / Oqood", ms: "4% · 18 Jan", mp: "128,000", s: "s2" },
                  { ml: "20% construction", ms: "10% · 04 Apr", mp: "320,000", s: "s3" },
                ].map((r) => (
                  <div className="mrow" key={r.ml}>
                    <svg className="ck draw" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                      <path
                        pathLength={1}
                        className={r.s}
                        d="M3 11 L9 17 L19 4"
                        stroke="#c8e85c"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div style={{ flex: 1, marginLeft: "11px" }}>
                      <div className="ml">{r.ml}</div>
                      <div className="ms">{r.ms}</div>
                    </div>
                    <span className="mp">{r.mp}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rv d1">
              <div className="eyebrow dark mono">A clean record</div>
              <h2>Payments that never slip.</h2>
              <p>
                Mark each instalment as it clears and Meridian keeps a clean, dated
                record of the whole deal — ready when the buyer, the developer, or
                the DLD asks.
              </p>
              <a className="lk" href="/how-it-works">
                See a deal
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CLOSING + FOOTER ===== */}
      <section className="closing">
        <div className="bp" />
        <div className="collage" aria-hidden="true">
          <span className="blk" style={{ width: "150px", height: "110px", top: "50px", right: "60px" }} />
          <span className="blk" style={{ width: "120px", height: "90px", bottom: "42%", left: "40px" }} />
          <span className="pinky" style={{ top: "46%", right: "30%" }} />
          <span className="seal" style={{ bottom: "38%", left: "32%" }} />
        </div>
        <div className="wrap rv">
          <h2 className="h-big">
            You&apos;ve mastered the deal.
            <br />
            <span className="lime">Now master</span> <span className="it">the timeline.</span>
          </h2>
          <p className="sub">
            We&apos;re onboarding a first group of Dubai brokers with early access and
            founder pricing.
          </p>
          <div className="em-wrap" style={{ maxWidth: "380px", margin: "30px auto 0" }}>
            <WaitlistForm source="closing" />
          </div>
        </div>
        <Footer />
      </section>
    </main>
  );
}
