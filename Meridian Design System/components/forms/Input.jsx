import React from 'react';

/* Meridian Input — labelled text/number field.
   Supports leading/trailing adornments, mono mode (amounts/IBANs),
   help + error text, and a "confirm needed" highlight for money/date. */

let _merInCss = false;
function ensureCss() {
  if (_merInCss || typeof document === 'undefined') return;
  _merInCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-field{display:flex;flex-direction:column;gap:6px;width:100%;}
  .mer-field__label{font-family:var(--font-ui);font-size:var(--fs-label);font-weight:var(--fw-medium);color:var(--text-secondary);}
  .mer-field__req{color:var(--overdue);margin-inline-start:2px;}
  .mer-field__box{display:flex;align-items:center;gap:var(--sp-2);background:var(--surface-card);
    border:1.5px solid var(--border-strong);border-radius:var(--r-sm);padding:0 14px;height:var(--ctrl-md);
    transition:border-color var(--dur-2) var(--ease-mid),box-shadow var(--dur-2) var(--ease-mid);}
  .mer-field__box:focus-within{border-color:var(--action);box-shadow:var(--ring);}
  .mer-field__box[data-tone="error"]{border-color:var(--overdue);}
  .mer-field__box[data-tone="confirm"]{border-color:var(--accent);background:var(--due-bg);}
  .mer-field__box[data-disabled="true"]{opacity:.6;background:var(--surface-sunk);}
  .mer-field input{flex:1;min-width:0;border:none;background:transparent;outline:none;
    font-family:var(--font-ui);font-size:var(--fs-body);color:var(--text-primary);height:100%;}
  .mer-field input::placeholder{color:var(--text-tertiary);}
  .mer-field[data-mono="true"] input{font-family:var(--font-mono);font-variant-numeric:tabular-nums;letter-spacing:-.01em;}
  .mer-field__adorn{color:var(--text-secondary);font-family:var(--font-mono);font-size:var(--fs-sub);display:inline-flex;align-items:center;}
  .mer-field__msg{font-size:var(--fs-caption);color:var(--text-tertiary);}
  .mer-field__msg[data-tone="error"]{color:var(--overdue-text);}
  `;
  document.head.appendChild(s);
}

export function Input({
  label, required, prefix, suffix, leadingIcon,
  mono = false, tone = 'default', help, error, id, ...rest
}) {
  ensureCss();
  const fid = id || (label ? 'in-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const effTone = error ? 'error' : tone;
  return (
    <label className="mer-field" data-mono={mono ? 'true' : undefined} htmlFor={fid}>
      {label && (
        <span className="mer-field__label">{label}{required && <span className="mer-field__req">*</span>}</span>
      )}
      <span className="mer-field__box" data-tone={effTone} data-disabled={rest.disabled ? 'true' : undefined}>
        {leadingIcon}
        {prefix && <span className="mer-field__adorn">{prefix}</span>}
        <input id={fid} aria-invalid={!!error} {...rest} />
        {suffix && <span className="mer-field__adorn">{suffix}</span>}
      </span>
      {(error || help) && (
        <span className="mer-field__msg" data-tone={error ? 'error' : undefined}>{error || help}</span>
      )}
    </label>
  );
}
