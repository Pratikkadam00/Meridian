import React from 'react';

/* Meridian Amount — AED money display. Mono, tabular, instrument-grade.
   Formats with thousands separators; never invents/guesses values. */

let _merAmtCss = false;
function ensureCss() {
  if (_merAmtCss || typeof document === 'undefined') return;
  _merAmtCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-amt{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-weight:var(--fw-semibold);
    letter-spacing:-.01em;color:var(--text-primary);white-space:nowrap;display:inline-flex;align-items:baseline;gap:5px;}
  .mer-amt__cur{font-size:.66em;font-weight:var(--fw-medium);color:var(--text-secondary);letter-spacing:var(--tracking-caps);}
  .mer-amt[data-tone="paid"]{color:var(--paid-text);}
  .mer-amt[data-tone="muted"]{color:var(--text-secondary);font-weight:var(--fw-medium);}
  .mer-amt[data-tone="risk"]{color:var(--overdue-text);}
  .mer-amt[data-size="sm"]{font-size:var(--fs-sub);}
  .mer-amt[data-size="md"]{font-size:var(--fs-h2);}
  .mer-amt[data-size="lg"]{font-size:var(--fs-h1);}
  .mer-amt[data-size="xl"]{font-size:var(--fs-display);font-family:var(--font-display);font-weight:var(--fw-bold);}
  .mer-amt[data-size="xl"] .mer-amt__cur{font-size:.42em;}
  `;
  document.head.appendChild(s);
}

function fmt(n) {
  if (n === null || n === undefined || n === '') return '—';
  const num = typeof n === 'number' ? n : Number(String(n).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString('en-AE', { maximumFractionDigits: 0 });
}

export function Amount({ value, currency = 'AED', size = 'md', tone = 'default', currencyAfter = false, ...rest }) {
  ensureCss();
  const cur = <span className="mer-amt__cur">{currency}</span>;
  return (
    <span className="mer-amt" data-size={size} data-tone={tone} {...rest}>
      {!currencyAfter && cur}
      <span>{fmt(value)}</span>
      {currencyAfter && cur}
    </span>
  );
}
