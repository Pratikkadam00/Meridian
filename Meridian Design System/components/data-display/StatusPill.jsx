import React from 'react';

/* Meridian StatusPill — milestone & deal status. ALWAYS icon + word + color
   (never color alone). status: paid|due|upcoming|overdue|grace|atrisk
   Optional `dense` for inline-in-row use. */

let _merSpCss = false;
function ensureCss() {
  if (_merSpCss || typeof document === 'undefined') return;
  _merSpCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-pill{display:inline-flex;align-items:center;gap:6px;border-radius:var(--r-pill);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-caption);
    line-height:1;padding:6px 11px 6px 9px;white-space:nowrap;border:1px solid transparent;}
  .mer-pill[data-dense="true"]{padding:4px 9px 4px 7px;font-size:var(--fs-micro);}
  .mer-pill svg{flex:none;}
  .mer-pill[data-s="paid"]{background:var(--paid-bg);color:var(--paid-text);}
  .mer-pill[data-s="due"]{background:var(--due-bg);color:var(--due-text);}
  .mer-pill[data-s="upcoming"]{background:var(--upcoming-bg);color:var(--upcoming-text);}
  .mer-pill[data-s="overdue"]{background:var(--overdue-bg);color:var(--overdue-text);}
  .mer-pill[data-s="grace"]{background:var(--due-bg);color:var(--overdue-text);border-color:var(--overdue);}
  .mer-pill[data-s="atrisk"]{background:var(--critical-bg);color:var(--critical-text);
    border-color:var(--critical);
    background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,
      color-mix(in srgb,var(--critical) 14%,transparent) 5px,color-mix(in srgb,var(--critical) 14%,transparent) 10px);}
  `;
  document.head.appendChild(s);
}

const ICONS = {
  paid:     <path d="M20 6 9 17l-5-5" />,
  due:      <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  upcoming: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  overdue:  <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>,
  grace:    <><path d="M12 2 2 20h20L12 2z" /><path d="M12 9v4M12 17h.01" /></>,
  atrisk:   <><path d="M12 2 2 20h20L12 2z" /><path d="M12 9v4M12 17h.01" /></>,
};
const DEFAULT_LABEL = {
  paid: 'Paid', due: 'Due', upcoming: 'Upcoming',
  overdue: 'Overdue', grace: 'In grace', atrisk: 'At risk',
};

export function StatusPill({ status = 'upcoming', children, dense = false, ...rest }) {
  ensureCss();
  return (
    <span className="mer-pill" data-s={status} data-dense={dense ? 'true' : undefined} {...rest}>
      <svg width={dense ? 12 : 14} height={dense ? 12 : 14} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[status]}
      </svg>
      {children || DEFAULT_LABEL[status]}
    </span>
  );
}
