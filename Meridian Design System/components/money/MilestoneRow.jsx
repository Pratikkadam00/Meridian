import React from 'react';
import { StatusPill } from '../data-display/StatusPill.jsx';
import { Amount } from './Amount.jsx';

/* Meridian MilestoneRow — one installment in a payment plan.
   First-class: time-linked (calendar) vs construction-linked (hard-hat,
   floating due date). Shows status pill + amount; one-tap mark-paid. */

let _merMrCss = false;
function ensureCss() {
  if (_merMrCss || typeof document === 'undefined') return;
  _merMrCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-mr{display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-3) var(--sp-1);width:100%;
    background:transparent;border:none;text-align:start;cursor:pointer;font:inherit;color:inherit;
    transition:background var(--dur-2) var(--ease-mid);border-radius:var(--r-md);}
  .mer-mr:hover{background:var(--surface-sunk);}
  .mer-mr:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-mr__icon{flex:none;width:38px;height:38px;border-radius:var(--r-sm);display:inline-flex;
    align-items:center;justify-content:center;background:var(--surface-sunk);color:var(--text-secondary);}
  .mer-mr__icon[data-type="construction"]{background:var(--amber-50);color:var(--amber-700);}
  .mer-mr__icon[data-type="time"]{background:var(--upcoming-bg);color:var(--upcoming-text);}
  .mer-mr__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;}
  .mer-mr__title{font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-sub);
    color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .mer-mr__meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
  .mer-mr__due{font-family:var(--font-ui);font-size:var(--fs-caption);color:var(--text-secondary);}
  .mer-mr__right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:none;}
  `;
  document.head.appendChild(s);
}

const TYPE_ICON = {
  time:  <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></>,
  construction: <><path d="M2 18h20M4 18v-5a8 8 0 0 1 16 0v5" /><path d="M12 5V2M9 9l6 0" /></>,
};

export function MilestoneRow({
  title, due, amount, status = 'upcoming', type = 'time',
  statusLabel, currencyAfter, ...rest
}) {
  ensureCss();
  return (
    <button className="mer-mr" {...rest}>
      <span className="mer-mr__icon" data-type={type} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{TYPE_ICON[type]}</svg>
      </span>
      <span className="mer-mr__body">
        <span className="mer-mr__title">{title}</span>
        <span className="mer-mr__meta">
          <StatusPill status={status} dense>{statusLabel}</StatusPill>
          <span className="mer-mr__due">{due}</span>
        </span>
      </span>
      <span className="mer-mr__right">
        <Amount value={amount} size="sm" tone={status === 'paid' ? 'paid' : 'default'} currencyAfter={currencyAfter} />
      </span>
    </button>
  );
}
