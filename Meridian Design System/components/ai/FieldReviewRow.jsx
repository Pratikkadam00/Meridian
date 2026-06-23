import React from 'react';
import { ConfidenceCue } from './ConfidenceCue.jsx';

/* Meridian FieldReviewRow — one extracted SPA field in the AI review screen.
   Tap to highlight its source in the PDF. Money/date fields require an
   explicit confirm. Low confidence is visually escalated. */

let _merFrCss = false;
function ensureCss() {
  if (_merFrCss || typeof document === 'undefined') return;
  _merFrCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-fr{display:flex;align-items:center;gap:var(--sp-3);width:100%;padding:var(--sp-3);text-align:start;
    background:var(--surface-card);border:1.5px solid var(--border-hair);border-radius:var(--r-md);
    cursor:pointer;font:inherit;color:inherit;
    transition:border-color var(--dur-2) var(--ease-mid),background var(--dur-2) var(--ease-mid),box-shadow var(--dur-2) var(--ease-mid);}
  .mer-fr:hover{border-color:var(--border-strong);}
  .mer-fr:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-fr[data-active="true"]{border-color:var(--action);box-shadow:var(--ring);}
  .mer-fr[data-conf="low"]{border-color:var(--overdue);background:var(--overdue-bg);}
  .mer-fr[data-confirmed="true"]{border-color:var(--paid);background:var(--paid-bg);}
  .mer-fr__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
  .mer-fr__label{font-family:var(--font-ui);font-size:var(--fs-caption);font-weight:var(--fw-semibold);
    letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--text-secondary);}
  .mer-fr__value{font-family:var(--font-mono);font-weight:var(--fw-semibold);font-size:var(--fs-body);
    font-variant-numeric:tabular-nums;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .mer-fr__value[data-empty="true"]{color:var(--text-tertiary);font-style:italic;font-family:var(--font-ui);font-weight:var(--fw-regular);}
  .mer-fr__right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex:none;}
  .mer-fr__tap{display:inline-flex;align-items:center;gap:4px;color:var(--action);font-size:var(--fs-micro);font-weight:var(--fw-semibold);}
  .mer-fr__confirmed{display:inline-flex;align-items:center;gap:4px;color:var(--paid-text);font-size:var(--fs-micro);font-weight:var(--fw-semibold);}
  `;
  document.head.appendChild(s);
}

export function FieldReviewRow({
  label, value, confidence = 'high', active = false, confirmed = false,
  money = false, ...rest
}) {
  ensureCss();
  const empty = value === null || value === undefined || value === '';
  return (
    <button className="mer-fr" data-conf={confidence} data-active={active ? 'true' : undefined}
      data-confirmed={confirmed ? 'true' : undefined} {...rest}>
      <span className="mer-fr__body">
        <span className="mer-fr__label">{label}</span>
        <span className="mer-fr__value" data-empty={empty ? 'true' : undefined}>
          {empty ? 'Tap to enter' : value}
        </span>
      </span>
      <span className="mer-fr__right">
        {confirmed ? (
          <span className="mer-fr__confirmed">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            {money ? 'Confirmed' : 'OK'}
          </span>
        ) : (
          <ConfidenceCue level={confidence} />
        )}
        <span className="mer-fr__tap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
          </svg>
          See in PDF
        </span>
      </span>
    </button>
  );
}
