import React from 'react';

/* Meridian Button — primary action primitive.
   Variants: primary | secondary | ghost | danger | quiet
   Sizes:    sm | md | lg   ·   fullWidth, loading, disabled, icons */

let _merBtnCss = false;
function ensureCss() {
  if (_merBtnCss || typeof document === 'undefined') return;
  _merBtnCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--sp-2);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);letter-spacing:var(--tracking-tight);
    border:1px solid transparent;border-radius:var(--r-md);cursor:pointer;white-space:nowrap;
    transition:transform var(--dur-1) var(--ease-snap),background var(--dur-2) var(--ease-mid),
      box-shadow var(--dur-2) var(--ease-mid),color var(--dur-2) var(--ease-mid);
    -webkit-tap-highlight-color:transparent;user-select:none;text-decoration:none;}
  .mer-btn:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-btn:active{transform:scale(.975);}
  .mer-btn[data-size="sm"]{height:var(--ctrl-sm);padding:0 14px;font-size:var(--fs-label);}
  .mer-btn[data-size="md"]{height:var(--ctrl-md);padding:0 18px;font-size:var(--fs-sub);}
  .mer-btn[data-size="lg"]{height:var(--ctrl-lg);padding:0 22px;font-size:var(--fs-body);}
  .mer-btn[data-full="true"]{width:100%;}
  .mer-btn[data-v="primary"]{background:var(--action);color:var(--text-on-brand);box-shadow:var(--shadow-sm);}
  .mer-btn[data-v="primary"]:hover{background:var(--action-hover);box-shadow:var(--shadow-md);}
  .mer-btn[data-v="primary"]:active{background:var(--action-press);}
  .mer-btn[data-v="secondary"]{background:var(--surface-card);color:var(--text-primary);border-color:var(--border-strong);box-shadow:var(--shadow-xs);}
  .mer-btn[data-v="secondary"]:hover{background:var(--surface-sunk);}
  .mer-btn[data-v="ghost"]{background:transparent;color:var(--action);}
  .mer-btn[data-v="ghost"]:hover{background:var(--jade-50);}
  .mer-btn[data-v="quiet"]{background:var(--surface-sunk);color:var(--text-primary);}
  .mer-btn[data-v="quiet"]:hover{background:var(--line-100);}
  .mer-btn[data-v="danger"]{background:var(--overdue);color:#fff;box-shadow:var(--shadow-sm);}
  .mer-btn[data-v="danger"]:hover{filter:brightness(.94);}
  .mer-btn[disabled],.mer-btn[data-loading="true"]{cursor:not-allowed;opacity:.55;box-shadow:none;transform:none;}
  .mer-btn__spin{width:1em;height:1em;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:mer-spin .6s linear infinite;}
  @keyframes mer-spin{to{transform:rotate(360deg);}}
  `;
  document.head.appendChild(s);
}

export function Button({
  children, variant = 'primary', size = 'md', fullWidth = false,
  leftIcon, rightIcon, loading = false, disabled = false,
  as = 'button', ...rest
}) {
  ensureCss();
  const Tag = as;
  return (
    <Tag
      className="mer-btn"
      data-v={variant}
      data-size={size}
      data-full={fullWidth ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
      disabled={Tag === 'button' ? (disabled || loading) : undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="mer-btn__spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </Tag>
  );
}
