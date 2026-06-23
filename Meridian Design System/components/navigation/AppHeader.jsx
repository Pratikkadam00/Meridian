import React from 'react';

/* Meridian AppHeader — sticky top chrome. Optional back, title/eyebrow,
   trailing actions. Blurred translucent bar. RTL mirrors back chevron. */

let _merHdrCss = false;
function ensureCss() {
  if (_merHdrCss || typeof document === 'undefined') return;
  _merHdrCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-hdr{display:flex;align-items:center;gap:var(--sp-2);min-height:56px;
    padding:8px var(--sp-3);
    background:color-mix(in srgb,var(--bg-app) 80%,transparent);
    -webkit-backdrop-filter:var(--blur-bar);backdrop-filter:var(--blur-bar);
    border-bottom:1px solid transparent;transition:border-color var(--dur-2) var(--ease-mid);}
  .mer-hdr[data-bordered="true"]{border-color:var(--border-hair);}
  .mer-hdr__back{flex:none;width:var(--tap-min);height:var(--tap-min);border:none;background:transparent;
    cursor:pointer;color:var(--text-primary);display:inline-flex;align-items:center;justify-content:center;border-radius:var(--r-md);}
  .mer-hdr__back:hover{background:var(--surface-sunk);}
  [dir="rtl"] .mer-hdr__back svg{transform:scaleX(-1);}
  .mer-hdr__mid{flex:1;min-width:0;display:flex;flex-direction:column;}
  .mer-hdr[data-center="true"] .mer-hdr__mid{align-items:center;}
  .mer-hdr__eyebrow{font-family:var(--font-ui);font-size:var(--fs-micro);font-weight:var(--fw-semibold);
    letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--text-tertiary);}
  .mer-hdr__title{font-family:var(--font-display);font-weight:var(--fw-semibold);font-size:var(--fs-h1);
    letter-spacing:var(--tracking-tight);color:var(--text-primary);margin:0;line-height:1.15;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .mer-hdr__actions{flex:none;display:flex;align-items:center;gap:2px;}
  `;
  document.head.appendChild(s);
}

export function AppHeader({ title, eyebrow, onBack, actions, bordered = false, center = false, ...rest }) {
  ensureCss();
  return (
    <header className="mer-hdr" data-bordered={bordered ? 'true' : undefined}
      data-center={center ? 'true' : undefined} {...rest}>
      {onBack && (
        <button className="mer-hdr__back" aria-label="Back" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      )}
      <div className="mer-hdr__mid">
        {eyebrow && <span className="mer-hdr__eyebrow">{eyebrow}</span>}
        {title && <h1 className="mer-hdr__title">{title}</h1>}
      </div>
      {actions && <div className="mer-hdr__actions">{actions}</div>}
    </header>
  );
}
