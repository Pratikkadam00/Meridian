import React from 'react';

/* Meridian Badge — small count / label chip (neutral, jade, amber, etc). */

let _merBadgeCss = false;
function ensureCss() {
  if (_merBadgeCss || typeof document === 'undefined') return;
  _merBadgeCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-badge{display:inline-flex;align-items:center;gap:5px;border-radius:var(--r-xs);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-micro);
    letter-spacing:var(--tracking-caps);text-transform:uppercase;padding:4px 8px;line-height:1;}
  .mer-badge[data-soft="true"]{text-transform:none;letter-spacing:0;font-size:var(--fs-caption);}
  .mer-badge[data-t="neutral"]{background:var(--surface-sunk);color:var(--text-secondary);}
  .mer-badge[data-t="jade"]{background:var(--jade-50);color:var(--jade-600);}
  .mer-badge[data-t="amber"]{background:var(--amber-50);color:var(--amber-700);}
  .mer-badge[data-t="slate"]{background:var(--upcoming-bg);color:var(--upcoming-text);}
  .mer-badge[data-t="sample"]{background:var(--amber-50);color:var(--amber-700);border:1px dashed var(--amber-500);}
  .mer-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
  `;
  document.head.appendChild(s);
}

export function Badge({ children, tone = 'neutral', dot = false, soft = false, ...rest }) {
  ensureCss();
  return (
    <span className="mer-badge" data-t={tone} data-soft={soft ? 'true' : undefined} {...rest}>
      {dot && <span className="mer-badge__dot" />}
      {children}
    </span>
  );
}
