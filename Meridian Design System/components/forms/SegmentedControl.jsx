import React from 'react';

/* Meridian SegmentedControl — 2–4 mutually exclusive options.
   Used for EN/AR, time-vs-construction milestone type, filters. */

let _merSegCss = false;
function ensureCss() {
  if (_merSegCss || typeof document === 'undefined') return;
  _merSegCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-seg{display:inline-flex;background:var(--surface-sunk);border-radius:var(--r-pill);
    padding:4px;gap:2px;border:1px solid var(--border-hair);}
  .mer-seg[data-full="true"]{display:flex;width:100%;}
  .mer-seg__opt{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;
    border:none;background:transparent;cursor:pointer;border-radius:var(--r-pill);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-label);
    color:var(--text-secondary);padding:0 16px;height:36px;white-space:nowrap;
    transition:color var(--dur-2) var(--ease-mid),background var(--dur-2) var(--ease-mid),box-shadow var(--dur-2) var(--ease-mid);}
  .mer-seg__opt:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-seg__opt[aria-selected="true"]{background:var(--surface-card);color:var(--text-primary);box-shadow:var(--shadow-sm);}
  `;
  document.head.appendChild(s);
}

export function SegmentedControl({ options = [], value, onChange, fullWidth = false, ...rest }) {
  ensureCss();
  return (
    <div className="mer-seg" role="tablist" data-full={fullWidth ? 'true' : undefined} {...rest}>
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const lbl = typeof o === 'string' ? o : o.label;
        const ic = typeof o === 'string' ? null : o.icon;
        return (
          <button key={val} role="tab" className="mer-seg__opt"
            aria-selected={value === val} onClick={() => onChange && onChange(val)}>
            {ic}{lbl}
          </button>
        );
      })}
    </div>
  );
}
