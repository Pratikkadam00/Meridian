import React from 'react';

/* Meridian TabBar — bottom navigation (blurred bar). 3–5 items.
   Active item = jade pill behind icon + jade label. RTL mirrors order. */

let _merTabCss = false;
function ensureCss() {
  if (_merTabCss || typeof document === 'undefined') return;
  _merTabCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-tabbar{display:flex;align-items:stretch;gap:2px;
    padding:8px var(--sp-3) calc(8px + var(--safe-bottom));
    background:color-mix(in srgb,var(--surface-card) 82%,transparent);
    -webkit-backdrop-filter:var(--blur-bar);backdrop-filter:var(--blur-bar);
    border-top:1px solid var(--border-hair);}
  .mer-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;border:none;background:transparent;
    cursor:pointer;padding:6px 0;color:var(--text-tertiary);min-height:var(--tap-min);
    font-family:var(--font-ui);transition:color var(--dur-2) var(--ease-mid);}
  .mer-tab:focus-visible{outline:none;box-shadow:var(--ring);border-radius:var(--r-sm);}
  .mer-tab__ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:28px;border-radius:var(--r-pill);
    transition:background var(--dur-2) var(--ease-mid);position:relative;}
  .mer-tab__label{font-size:var(--fs-micro);font-weight:var(--fw-medium);}
  .mer-tab[aria-selected="true"]{color:var(--action);}
  .mer-tab[aria-selected="true"] .mer-tab__ico{background:var(--jade-50);}
  .mer-tab[aria-selected="true"] .mer-tab__label{font-weight:var(--fw-semibold);}
  .mer-tab__badge{position:absolute;top:0;inset-inline-end:8px;min-width:16px;height:16px;border-radius:var(--r-pill);
    background:var(--overdue);color:#fff;font-size:9px;font-weight:var(--fw-bold);display:flex;align-items:center;
    justify-content:center;padding:0 4px;border:2px solid var(--surface-card);}
  `;
  document.head.appendChild(s);
}

export function TabBar({ items = [], value, onChange, ...rest }) {
  ensureCss();
  return (
    <nav className="mer-tabbar" role="tablist" {...rest}>
      {items.map((it) => (
        <button key={it.value} role="tab" className="mer-tab" aria-selected={value === it.value}
          onClick={() => onChange && onChange(it.value)}>
          <span className="mer-tab__ico">
            {it.icon}
            {it.badge ? <span className="mer-tab__badge">{it.badge}</span> : null}
          </span>
          <span className="mer-tab__label">{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
