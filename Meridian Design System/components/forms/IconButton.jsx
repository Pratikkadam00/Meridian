import React from 'react';

/* Meridian IconButton — square, icon-only tappable target (>=44px).
   Variants: plain | filled | tonal | danger ; sizes sm|md|lg */

let _merIbCss = false;
function ensureCss() {
  if (_merIbCss || typeof document === 'undefined') return;
  _merIbCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-ib{display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;
    border-radius:var(--r-md);cursor:pointer;color:var(--text-primary);background:transparent;
    -webkit-tap-highlight-color:transparent;
    transition:transform var(--dur-1) var(--ease-snap),background var(--dur-2) var(--ease-mid),color var(--dur-2) var(--ease-mid);}
  .mer-ib:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-ib:active{transform:scale(.94);}
  .mer-ib[data-size="sm"]{width:var(--ctrl-sm);height:var(--ctrl-sm);}
  .mer-ib[data-size="md"]{width:var(--tap-min);height:var(--tap-min);}
  .mer-ib[data-size="lg"]{width:var(--ctrl-md);height:var(--ctrl-md);}
  .mer-ib[data-v="plain"]:hover{background:var(--surface-sunk);}
  .mer-ib[data-v="tonal"]{background:var(--jade-50);color:var(--action);}
  .mer-ib[data-v="tonal"]:hover{background:var(--jade-100);}
  .mer-ib[data-v="filled"]{background:var(--action);color:var(--text-on-brand);box-shadow:var(--shadow-sm);}
  .mer-ib[data-v="filled"]:hover{background:var(--action-hover);}
  .mer-ib[data-v="danger"]{color:var(--overdue);}
  .mer-ib[data-v="danger"]:hover{background:var(--overdue-bg);}
  .mer-ib[disabled]{opacity:.45;cursor:not-allowed;}
  `;
  document.head.appendChild(s);
}

export function IconButton({ icon, label, variant = 'plain', size = 'md', ...rest }) {
  ensureCss();
  return (
    <button className="mer-ib" data-v={variant} data-size={size}
      aria-label={label} title={label} {...rest}>
      {icon}
    </button>
  );
}
