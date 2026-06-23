import React from 'react';

/* Meridian ProgressMeter — construction % or payment-plan progress.
   Conveys value with a LABEL + fill (never color/length alone).
   variant: construction (amber) | payment (jade) | neutral */

let _merPmCss = false;
function ensureCss() {
  if (_merPmCss || typeof document === 'undefined') return;
  _merPmCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-pm{display:flex;flex-direction:column;gap:6px;width:100%;}
  .mer-pm__top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
  .mer-pm__label{font-family:var(--font-ui);font-size:var(--fs-label);font-weight:var(--fw-medium);color:var(--text-secondary);}
  .mer-pm__val{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:var(--fs-sub);
    font-variant-numeric:tabular-nums;color:var(--text-primary);}
  .mer-pm__track{position:relative;height:8px;border-radius:var(--r-pill);background:var(--surface-sunk);overflow:hidden;}
  .mer-pm__fill{position:absolute;inset-block:0;inset-inline-start:0;border-radius:var(--r-pill);
    transition:width var(--dur-4) var(--ease-out);}
  .mer-pm[data-v="construction"] .mer-pm__fill{background:var(--accent);}
  .mer-pm[data-v="payment"] .mer-pm__fill{background:var(--action);}
  .mer-pm[data-v="neutral"] .mer-pm__fill{background:var(--ink-500);}
  .mer-pm__marker{position:absolute;top:-3px;width:2px;height:14px;background:var(--ink-700);border-radius:2px;}
  `;
  document.head.appendChild(s);
}

export function ProgressMeter({ value = 0, label, variant = 'payment', showValue = true, marker, ...rest }) {
  ensureCss();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="mer-pm" data-v={variant} role="progressbar" aria-valuenow={pct}
      aria-valuemin={0} aria-valuemax={100} aria-label={label} {...rest}>
      {(label || showValue) && (
        <div className="mer-pm__top">
          {label && <span className="mer-pm__label">{label}</span>}
          {showValue && <span className="mer-pm__val">{pct}%</span>}
        </div>
      )}
      <div className="mer-pm__track">
        <div className="mer-pm__fill" style={{ width: pct + '%' }} />
        {typeof marker === 'number' && (
          <div className="mer-pm__marker" style={{ insetInlineStart: marker + '%' }} title={'target ' + marker + '%'} />
        )}
      </div>
    </div>
  );
}
