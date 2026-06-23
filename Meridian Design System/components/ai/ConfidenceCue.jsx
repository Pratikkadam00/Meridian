import React from 'react';

/* Meridian ConfidenceCue — AI extraction confidence.
   NEVER a bare percentage. Word + distinct icon SHAPE + color:
   high  = solid filled check  (jade)
   med   = half/partial dot     (amber)
   low   = hollow ring + alert  (terracotta)
   Distinct shapes make it color-blind safe. */

let _merCcCss = false;
function ensureCss() {
  if (_merCcCss || typeof document === 'undefined') return;
  _merCcCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-cc{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-ui);
    font-weight:var(--fw-semibold);font-size:var(--fs-caption);line-height:1;white-space:nowrap;}
  .mer-cc__icon{flex:none;display:inline-flex;}
  .mer-cc[data-l="high"]{color:var(--conf-high);}
  .mer-cc[data-l="med"]{color:var(--amber-600);}
  .mer-cc[data-l="low"]{color:var(--overdue-text);}
  .mer-cc[data-chip="true"]{padding:5px 9px;border-radius:var(--r-pill);}
  .mer-cc[data-chip="true"][data-l="high"]{background:var(--paid-bg);}
  .mer-cc[data-chip="true"][data-l="med"]{background:var(--due-bg);}
  .mer-cc[data-chip="true"][data-l="low"]{background:var(--overdue-bg);}
  `;
  document.head.appendChild(s);
}

const SHAPE = {
  high: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M17 9l-6 6-3-3" stroke="var(--white,#fff)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  med: (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
    </svg>
  ),
  low: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
};
const WORD = { high: 'High', med: 'Med', low: 'Low' };

export function ConfidenceCue({ level = 'high', chip = false, showWord = true, ...rest }) {
  ensureCss();
  return (
    <span className="mer-cc" data-l={level} data-chip={chip ? 'true' : undefined}
      role="img" aria-label={'Confidence: ' + WORD[level]} {...rest}>
      <span className="mer-cc__icon">{SHAPE[level]}</span>
      {showWord && <span>{WORD[level]}</span>}
    </span>
  );
}
