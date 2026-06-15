import Link from "next/link";

// Fixed footer design (per spec §3 — do not redesign): the giant Meridian
// wordmark bleeding full-width, a bone card overlapping it with the tagline,
// Product/Legal columns, and the rotating "BUILT FOR DUBAI OFF-PLAN" stamp.
export default function Footer() {
  return (
    <footer>
      <div className="wordmark rv" aria-hidden="true">
        Mer<span className="i">i</span>dian
      </div>
      <div className="wrap">
        <div className="fcard rv">
          <div className="top">
            <div className="tag">Off-plan deals, handled.</div>
            <div className="col">
              <h4>Product</h4>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/early-access">Early access</Link>
              <Link href="/join">Join the waitlist</Link>
            </div>
            <div className="col">
              <h4>Legal</h4>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
            <svg className="badge" viewBox="0 0 100 100" aria-hidden="true">
              <g className="rot">
                <path
                  id="badge-path"
                  d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text
                  fontFamily="var(--mono)"
                  fontSize="9.2"
                  letterSpacing="1.5"
                  fill="#15150f"
                >
                  <textPath href="#badge-path" startOffset="0">
                    BUILT FOR DUBAI OFF-PLAN · EST. 2026 ·{" "}
                  </textPath>
                </text>
              </g>
              <circle cx="50" cy="50" r="15" fill="#0f2a1f" />
              <text
                x="50"
                y="54"
                textAnchor="middle"
                fontFamily="var(--disp)"
                fontWeight="700"
                fontSize="15"
                fill="#c8e85c"
              >
                M
              </text>
            </svg>
          </div>
          <div className="bottom">
            <span>© 2026 Meridian</span>
            <span>Built in Dubai for the off-plan market.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
