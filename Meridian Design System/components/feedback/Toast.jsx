import React from 'react';

/* Meridian Toast — transient confirmation / info. tone: success|info|warn|error.
   Calm; pairs icon + message; optional single action. */

let _merToastCss = false;
function ensureCss() {
  if (_merToastCss || typeof document === 'undefined') return;
  _merToastCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-toast{display:flex;align-items:center;gap:var(--sp-3);padding:13px 14px;border-radius:var(--r-md);
    background:var(--jade-800);color:var(--text-on-ink);box-shadow:var(--shadow-lg);
    font-family:var(--font-ui);font-size:var(--fs-sub);max-width:380px;animation:mer-fade-up var(--dur-3) var(--ease-out);}
  .mer-toast__icon{flex:none;width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;}
  .mer-toast[data-t="success"] .mer-toast__icon{background:var(--jade-500);color:#fff;}
  .mer-toast[data-t="info"] .mer-toast__icon{background:var(--upcoming);color:#fff;}
  .mer-toast[data-t="warn"] .mer-toast__icon{background:var(--amber-500);color:#fff;}
  .mer-toast[data-t="error"] .mer-toast__icon{background:var(--overdue);color:#fff;}
  .mer-toast__msg{flex:1;min-width:0;line-height:1.35;}
  .mer-toast__action{flex:none;background:transparent;border:none;color:var(--jade-200);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-label);cursor:pointer;padding:6px 4px;}
  .mer-toast__action:hover{color:#fff;}
  `;
  document.head.appendChild(s);
}

const ICONS = {
  success: <path d="M20 6 9 17l-5-5" />,
  info:    <><path d="M12 16v-5M12 8h.01" /><circle cx="12" cy="12" r="9" /></>,
  warn:    <><path d="M12 9v4M12 17h.01" /><path d="M12 3 2 20h20L12 3z" /></>,
  error:   <><path d="M15 9l-6 6M9 9l6 6" /><circle cx="12" cy="12" r="9" /></>,
};

export function Toast({ tone = 'success', children, actionLabel, onAction, ...rest }) {
  ensureCss();
  return (
    <div className="mer-toast" data-t={tone} role="status" {...rest}>
      <span className="mer-toast__icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[tone]}</svg>
      </span>
      <span className="mer-toast__msg">{children}</span>
      {actionLabel && <button className="mer-toast__action" onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}
