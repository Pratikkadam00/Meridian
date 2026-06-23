import React from 'react';

/* Meridian Card — hairline border + soft warm shadow surface.
   tone: default | ink (dark hero) | sunk ; raised; interactive (press). */

let _merCardCss = false;
function ensureCss() {
  if (_merCardCss || typeof document === 'undefined') return;
  _merCardCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-card{background:var(--surface-card);border:1px solid var(--border-hair);border-radius:var(--r-lg);
    box-shadow:var(--shadow-sm);padding:var(--sp-5);color:var(--text-primary);
    transition:box-shadow var(--dur-2) var(--ease-mid),transform var(--dur-1) var(--ease-snap);}
  .mer-card[data-raised="true"]{box-shadow:var(--shadow-md);}
  .mer-card[data-tone="sunk"]{background:var(--surface-sunk);box-shadow:none;}
  .mer-card[data-tone="ink"]{background:var(--surface-ink);color:var(--text-on-ink);border-color:transparent;}
  .mer-card[data-interactive="true"]{cursor:pointer;}
  .mer-card[data-interactive="true"]:hover{box-shadow:var(--shadow-md);transform:translateY(-1px);}
  .mer-card[data-interactive="true"]:active{transform:scale(.99);}
  .mer-card[data-interactive="true"]:focus-visible{outline:none;box-shadow:var(--ring);}
  `;
  document.head.appendChild(s);
}

export function Card({ children, tone = 'default', raised = false, interactive = false, as, style, ...rest }) {
  ensureCss();
  const Tag = as || (interactive ? 'button' : 'div');
  return (
    <Tag className="mer-card" data-tone={tone} data-raised={raised ? 'true' : undefined}
      data-interactive={interactive ? 'true' : undefined}
      style={{ textAlign: 'inherit', font: 'inherit', width: interactive ? '100%' : undefined, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
