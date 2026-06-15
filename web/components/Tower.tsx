// The signature hero visual: an architectural elevation of a tower with the
// payment milestones marked up its height — booking at the base, DLD, the
// construction stages, handover at the crown, with the due milestone lit in
// lime. Gold line-art on the green canvas. Hidden on mobile (CSS).
export default function Tower() {
  return (
    <div className="tower-col" aria-hidden="true">
      <svg
        className="tower"
        viewBox="0 0 320 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <clipPath id="twr">
            <path d="M150 40 L156 40 L160 96 L196 96 L196 250 L214 250 L214 430 L228 430 L228 690 L92 690 L92 470 L106 470 L106 300 L120 300 L120 120 L150 120 Z" />
          </clipPath>
          <pattern id="floors" width="10" height="13" patternUnits="userSpaceOnUse">
            <line x1="0" y1="12.5" x2="10" y2="12.5" stroke="#c8a96a" strokeWidth="0.6" opacity="0.5" />
          </pattern>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16382a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0f2a1f" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <ellipse cx="170" cy="380" rx="150" ry="320" fill="#c8a96a" opacity="0.05" />
        <g clipPath="url(#twr)">
          <rect x="80" y="40" width="160" height="660" fill="url(#fill)" />
          <rect x="80" y="40" width="160" height="660" fill="url(#floors)" />
          <rect x="80" y="350" width="160" height="34" fill="#c8e85c" opacity="0.14" />
          <line x1="80" y1="350" x2="240" y2="350" stroke="#c8e85c" strokeWidth="1.4" opacity="0.6" />
        </g>
        <path
          d="M150 40 L156 40 L160 96 L196 96 L196 250 L214 250 L214 430 L228 430 L228 690 L92 690 L92 470 L106 470 L106 300 L120 300 L120 120 L150 120 Z"
          stroke="#c8a96a"
          strokeWidth="1.4"
          opacity="0.85"
        />
        <line x1="153" y1="40" x2="153" y2="14" stroke="#c8a96a" strokeWidth="1.2" opacity="0.7" />
        <line x1="240" y1="690" x2="80" y2="690" stroke="#c8a96a" strokeWidth="1.4" opacity="0.85" />
      </svg>

      <div className="mile m1">
        <div className="lab">
          <b>Handover</b>40% · AED 1.28M
        </div>
        <span className="tick" />
      </div>
      <div className="mile m2">
        <div className="lab">
          <b>60% built</b>10% · AED 320K
        </div>
        <span className="tick" />
      </div>
      <div className="mile due">
        <div className="lab">
          <b>40% built — due</b>10% · AED 320K · in 5 days
        </div>
        <span className="tick" />
      </div>
      <div className="mile m4">
        <div className="lab">
          <b>DLD / Oqood</b>4% · AED 128K
        </div>
        <span className="tick" />
      </div>
      <div className="mile m5">
        <div className="lab">
          <b>Booking</b>20% · AED 640K
        </div>
        <span className="tick" />
      </div>
    </div>
  );
}
