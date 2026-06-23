import React from 'react';

/* Meridian Switch — binary toggle (notifications, app-lock, channels). */

let _merSwCss = false;
function ensureCss() {
  if (_merSwCss || typeof document === 'undefined') return;
  _merSwCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-sw{position:relative;display:inline-flex;align-items:center;width:48px;height:28px;flex:none;
    border-radius:var(--r-pill);background:var(--line-200);cursor:pointer;border:none;padding:0;
    transition:background var(--dur-2) var(--ease-mid);}
  .mer-sw:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-sw__knob{position:absolute;top:3px;inset-inline-start:3px;width:22px;height:22px;border-radius:50%;
    background:#fff;box-shadow:var(--shadow-sm);transition:transform var(--dur-2) var(--ease-out);}
  .mer-sw[aria-checked="true"]{background:var(--action);}
  .mer-sw[aria-checked="true"] .mer-sw__knob{transform:translateX(20px);}
  [dir="rtl"] .mer-sw[aria-checked="true"] .mer-sw__knob{transform:translateX(-20px);}
  .mer-sw[disabled]{opacity:.5;cursor:not-allowed;}
  `;
  document.head.appendChild(s);
}

export function Switch({ checked = false, onChange, disabled, label, ...rest }) {
  ensureCss();
  return (
    <button type="button" role="switch" className="mer-sw" aria-checked={checked}
      aria-label={label} disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)} {...rest}>
      <span className="mer-sw__knob" />
    </button>
  );
}
