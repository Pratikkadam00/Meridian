import React from 'react';

/* Meridian Sheet — bottom sheet surface (mark-paid, add-deal chooser,
   nudge composer, notification primer). Grab handle + optional title.
   Presentational: render conditionally; pass onClose for the scrim. */

let _merSheetCss = false;
function ensureCss() {
  if (_merSheetCss || typeof document === 'undefined') return;
  _merSheetCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-sheet__scrim{position:absolute;inset:0;background:var(--overlay);
    -webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);animation:mer-fade var(--dur-2) var(--ease-out);z-index:40;}
  .mer-sheet{position:absolute;inset-inline:0;bottom:0;background:var(--surface-card);
    border-radius:var(--r-2xl) var(--r-2xl) 0 0;box-shadow:var(--shadow-sheet);z-index:41;
    padding:10px var(--screen-pad) calc(var(--screen-pad) + var(--safe-bottom));
    max-height:88%;overflow:auto;animation:mer-sheet-up var(--dur-3) var(--ease-out);}
  .mer-sheet__handle{width:40px;height:4px;border-radius:var(--r-pill);background:var(--line-200);margin:4px auto 14px;}
  .mer-sheet__head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);margin-bottom:var(--sp-4);}
  .mer-sheet__title{font-family:var(--font-display);font-weight:var(--fw-semibold);font-size:var(--fs-h1);
    letter-spacing:var(--tracking-tight);color:var(--text-primary);margin:0;}
  .mer-sheet__sub{font-family:var(--font-ui);font-size:var(--fs-label);color:var(--text-secondary);margin-top:3px;}
  `;
  document.head.appendChild(s);
}

export function Sheet({ open = true, title, subtitle, onClose, children, headerRight, ...rest }) {
  ensureCss();
  if (!open) return null;
  return (
    <>
      <div className="mer-sheet__scrim" onClick={onClose} />
      <div className="mer-sheet" role="dialog" aria-modal="true" aria-label={title} {...rest}>
        <div className="mer-sheet__handle" />
        {(title || headerRight) && (
          <div className="mer-sheet__head">
            <div>
              {title && <h2 className="mer-sheet__title">{title}</h2>}
              {subtitle && <div className="mer-sheet__sub">{subtitle}</div>}
            </div>
            {headerRight}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
