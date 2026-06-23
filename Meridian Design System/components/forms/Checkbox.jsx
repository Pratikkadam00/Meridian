import React from 'react';

/* Meridian Checkbox — consent gates, snagging checklist, multi-select. */

let _merCbCss = false;
function ensureCss() {
  if (_merCbCss || typeof document === 'undefined') return;
  _merCbCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-cb{display:flex;align-items:flex-start;gap:var(--sp-3);cursor:pointer;
    font-family:var(--font-ui);font-size:var(--fs-sub);color:var(--text-primary);line-height:1.4;}
  .mer-cb__box{flex:none;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--border-strong);
    background:var(--surface-card);display:inline-flex;align-items:center;justify-content:center;color:#fff;
    transition:background var(--dur-2) var(--ease-mid),border-color var(--dur-2) var(--ease-mid);margin-top:1px;}
  .mer-cb input{position:absolute;opacity:0;width:0;height:0;}
  .mer-cb input:checked + .mer-cb__box{background:var(--action);border-color:var(--action);}
  .mer-cb input:focus-visible + .mer-cb__box{box-shadow:var(--ring);}
  .mer-cb__check{opacity:0;transition:opacity var(--dur-1) var(--ease-out);}
  .mer-cb input:checked + .mer-cb__box .mer-cb__check{opacity:1;}
  .mer-cb[data-disabled="true"]{opacity:.55;cursor:not-allowed;}
  `;
  document.head.appendChild(s);
}

export function Checkbox({ checked = false, onChange, disabled, children, ...rest }) {
  ensureCss();
  return (
    <label className="mer-cb" data-disabled={disabled ? 'true' : undefined}>
      <input type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.checked)} {...rest} />
      <span className="mer-cb__box">
        <svg className="mer-cb__check" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      {children && <span>{children}</span>}
    </label>
  );
}
