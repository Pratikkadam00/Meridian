/* @ds-bundle: {"format":3,"namespace":"MeridianDesignSystem_f018d0","components":[{"name":"ConfidenceCue","sourcePath":"components/ai/ConfidenceCue.jsx"},{"name":"FieldReviewRow","sourcePath":"components/ai/FieldReviewRow.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"ProgressMeter","sourcePath":"components/data-display/ProgressMeter.jsx"},{"name":"StatusPill","sourcePath":"components/data-display/StatusPill.jsx"},{"name":"Sheet","sourcePath":"components/feedback/Sheet.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Amount","sourcePath":"components/money/Amount.jsx"},{"name":"MilestoneRow","sourcePath":"components/money/MilestoneRow.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/ai/ConfidenceCue.jsx":"84645cafdeb0","components/ai/FieldReviewRow.jsx":"e71df3fd8fc2","components/data-display/Avatar.jsx":"4fccc028defd","components/data-display/Badge.jsx":"290ba48be4bb","components/data-display/Card.jsx":"3aabaa196ddc","components/data-display/ProgressMeter.jsx":"7be8223b33d7","components/data-display/StatusPill.jsx":"b52b80d8f8c4","components/feedback/Sheet.jsx":"dbcc03a2decf","components/feedback/Toast.jsx":"b8a7f29c7c03","components/forms/Button.jsx":"79b939c09ff5","components/forms/Checkbox.jsx":"1a606dbfb0cd","components/forms/IconButton.jsx":"b3b2f631eba5","components/forms/Input.jsx":"b69319862f06","components/forms/SegmentedControl.jsx":"cb705f7c6488","components/forms/Switch.jsx":"a6f5b783fd1d","components/money/Amount.jsx":"2434ef221f01","components/money/MilestoneRow.jsx":"ea49da643021","components/navigation/AppHeader.jsx":"a321c2320034","components/navigation/TabBar.jsx":"b9f6f3ebae2f","ui_kits/meridian-app/app-data.jsx":"a3d9a634f569","ui_kits/meridian-app/screens-ai.jsx":"19e600f0e469","ui_kits/meridian-app/screens-core.jsx":"9d73ca7e448c","ui_kits/meridian-app/screens-deals.jsx":"df6f14b3203a","ui_kits/meridian-app/screens-home2.jsx":"d107dabba5f9","ui_kits/meridian-app/screens-misc.jsx":"693e01786078","ui_kits/meridian-app/screens-money-risk.jsx":"5312b5cca36b","ui_kits/meridian-app/screens-relationship.jsx":"501e84219442","ui_kits/meridian-app/screens-states.jsx":"eaf6a1d9ccbf"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MeridianDesignSystem_f018d0 = window.MeridianDesignSystem_f018d0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/ai/ConfidenceCue.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian ConfidenceCue — AI extraction confidence.
   NEVER a bare percentage. Word + distinct icon SHAPE + color:
   high  = solid filled check  (jade)
   med   = half/partial dot     (amber)
   low   = hollow ring + alert  (terracotta)
   Distinct shapes make it color-blind safe. */

let _merCcCss = false;
function ensureCss() {
  if (_merCcCss || typeof document === 'undefined') return;
  _merCcCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-cc{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-ui);
    font-weight:var(--fw-semibold);font-size:var(--fs-caption);line-height:1;white-space:nowrap;}
  .mer-cc__icon{flex:none;display:inline-flex;}
  .mer-cc[data-l="high"]{color:var(--conf-high);}
  .mer-cc[data-l="med"]{color:var(--amber-600);}
  .mer-cc[data-l="low"]{color:var(--overdue-text);}
  .mer-cc[data-chip="true"]{padding:5px 9px;border-radius:var(--r-pill);}
  .mer-cc[data-chip="true"][data-l="high"]{background:var(--paid-bg);}
  .mer-cc[data-chip="true"][data-l="med"]{background:var(--due-bg);}
  .mer-cc[data-chip="true"][data-l="low"]{background:var(--overdue-bg);}
  `;
  document.head.appendChild(s);
}
const SHAPE = {
  high: /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17 9l-6 6-3-3",
    stroke: "var(--white,#fff)",
    strokeWidth: "2.4",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })),
  med: /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 2a10 10 0 0 1 0 20z",
    fill: "currentColor"
  })),
  low: /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v4M12 16h.01"
  }))
};
const WORD = {
  high: 'High',
  med: 'Med',
  low: 'Low'
};
function ConfidenceCue({
  level = 'high',
  chip = false,
  showWord = true,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "mer-cc",
    "data-l": level,
    "data-chip": chip ? 'true' : undefined,
    role: "img",
    "aria-label": 'Confidence: ' + WORD[level]
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mer-cc__icon"
  }, SHAPE[level]), showWord && /*#__PURE__*/React.createElement("span", null, WORD[level]));
}
Object.assign(__ds_scope, { ConfidenceCue });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ai/ConfidenceCue.jsx", error: String((e && e.message) || e) }); }

// components/ai/FieldReviewRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function FieldReviewRow({
  label,
  value,
  confidence = 'high',
  active = false,
  confirmed = false,
  money = false,
  ...rest
}) {
  ensureCss();
  const empty = value === null || value === undefined || value === '';
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "mer-fr",
    "data-conf": confidence,
    "data-active": active ? 'true' : undefined,
    "data-confirmed": confirmed ? 'true' : undefined
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mer-fr__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mer-fr__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "mer-fr__value",
    "data-empty": empty ? 'true' : undefined
  }, empty ? 'Tap to enter' : value)), /*#__PURE__*/React.createElement("span", {
    className: "mer-fr__right"
  }, confirmed ? /*#__PURE__*/React.createElement("span", {
    className: "mer-fr__confirmed"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })), money ? 'Confirmed' : 'OK') : /*#__PURE__*/React.createElement(__ds_scope.ConfidenceCue, {
    level: confidence
  }), /*#__PURE__*/React.createElement("span", {
    className: "mer-fr__tap"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"
  })), "See in PDF")));
}
Object.assign(__ds_scope, { FieldReviewRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/ai/FieldReviewRow.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian Avatar — buyer/client initials or image. */

let _merAvCss = false;
function ensureCss() {
  if (_merAvCss || typeof document === 'undefined') return;
  _merAvCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-av{display:inline-flex;align-items:center;justify-content:center;flex:none;border-radius:50%;
    background:var(--jade-100);color:var(--jade-700);font-family:var(--font-ui);font-weight:var(--fw-semibold);
    overflow:hidden;text-transform:uppercase;}
  .mer-av[data-size="sm"]{width:32px;height:32px;font-size:12px;}
  .mer-av[data-size="md"]{width:40px;height:40px;font-size:14px;}
  .mer-av[data-size="lg"]{width:56px;height:56px;font-size:19px;}
  .mer-av img{width:100%;height:100%;object-fit:cover;}
  `;
  document.head.appendChild(s);
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('');
}
function Avatar({
  name = '',
  src,
  size = 'md',
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "mer-av",
    "data-size": size,
    "aria-label": name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian Badge — small count / label chip (neutral, jade, amber, etc). */

let _merBadgeCss = false;
function ensureCss() {
  if (_merBadgeCss || typeof document === 'undefined') return;
  _merBadgeCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-badge{display:inline-flex;align-items:center;gap:5px;border-radius:var(--r-xs);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-micro);
    letter-spacing:var(--tracking-caps);text-transform:uppercase;padding:4px 8px;line-height:1;}
  .mer-badge[data-soft="true"]{text-transform:none;letter-spacing:0;font-size:var(--fs-caption);}
  .mer-badge[data-t="neutral"]{background:var(--surface-sunk);color:var(--text-secondary);}
  .mer-badge[data-t="jade"]{background:var(--jade-50);color:var(--jade-600);}
  .mer-badge[data-t="amber"]{background:var(--amber-50);color:var(--amber-700);}
  .mer-badge[data-t="slate"]{background:var(--upcoming-bg);color:var(--upcoming-text);}
  .mer-badge[data-t="sample"]{background:var(--amber-50);color:var(--amber-700);border:1px dashed var(--amber-500);}
  .mer-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;}
  `;
  document.head.appendChild(s);
}
function Badge({
  children,
  tone = 'neutral',
  dot = false,
  soft = false,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "mer-badge",
    "data-t": tone,
    "data-soft": soft ? 'true' : undefined
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "mer-badge__dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Card({
  children,
  tone = 'default',
  raised = false,
  interactive = false,
  as,
  style,
  ...rest
}) {
  ensureCss();
  const Tag = as || (interactive ? 'button' : 'div');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: "mer-card",
    "data-tone": tone,
    "data-raised": raised ? 'true' : undefined,
    "data-interactive": interactive ? 'true' : undefined,
    style: {
      textAlign: 'inherit',
      font: 'inherit',
      width: interactive ? '100%' : undefined,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/ProgressMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function ProgressMeter({
  value = 0,
  label,
  variant = 'payment',
  showValue = true,
  marker,
  ...rest
}) {
  ensureCss();
  const pct = Math.max(0, Math.min(100, value));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "mer-pm",
    "data-v": variant,
    role: "progressbar",
    "aria-valuenow": pct,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-label": label
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "mer-pm__top"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "mer-pm__label"
  }, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "mer-pm__val"
  }, pct, "%")), /*#__PURE__*/React.createElement("div", {
    className: "mer-pm__track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mer-pm__fill",
    style: {
      width: pct + '%'
    }
  }), typeof marker === 'number' && /*#__PURE__*/React.createElement("div", {
    className: "mer-pm__marker",
    style: {
      insetInlineStart: marker + '%'
    },
    title: 'target ' + marker + '%'
  })));
}
Object.assign(__ds_scope, { ProgressMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/ProgressMeter.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian StatusPill — milestone & deal status. ALWAYS icon + word + color
   (never color alone). status: paid|due|upcoming|overdue|grace|atrisk
   Optional `dense` for inline-in-row use. */

let _merSpCss = false;
function ensureCss() {
  if (_merSpCss || typeof document === 'undefined') return;
  _merSpCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-pill{display:inline-flex;align-items:center;gap:6px;border-radius:var(--r-pill);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-caption);
    line-height:1;padding:6px 11px 6px 9px;white-space:nowrap;border:1px solid transparent;}
  .mer-pill[data-dense="true"]{padding:4px 9px 4px 7px;font-size:var(--fs-micro);}
  .mer-pill svg{flex:none;}
  .mer-pill[data-s="paid"]{background:var(--paid-bg);color:var(--paid-text);}
  .mer-pill[data-s="due"]{background:var(--due-bg);color:var(--due-text);}
  .mer-pill[data-s="upcoming"]{background:var(--upcoming-bg);color:var(--upcoming-text);}
  .mer-pill[data-s="overdue"]{background:var(--overdue-bg);color:var(--overdue-text);}
  .mer-pill[data-s="grace"]{background:var(--due-bg);color:var(--overdue-text);border-color:var(--overdue);}
  .mer-pill[data-s="atrisk"]{background:var(--critical-bg);color:var(--critical-text);
    border-color:var(--critical);
    background-image:repeating-linear-gradient(45deg,transparent,transparent 5px,
      color-mix(in srgb,var(--critical) 14%,transparent) 5px,color-mix(in srgb,var(--critical) 14%,transparent) 10px);}
  `;
  document.head.appendChild(s);
}
const ICONS = {
  paid: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  due: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  upcoming: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  overdue: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v4M12 16h.01"
  })),
  grace: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 2 2 20h20L12 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4M12 17h.01"
  })),
  atrisk: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 2 2 20h20L12 2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4M12 17h.01"
  }))
};
const DEFAULT_LABEL = {
  paid: 'Paid',
  due: 'Due',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  grace: 'In grace',
  atrisk: 'At risk'
};
function StatusPill({
  status = 'upcoming',
  children,
  dense = false,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "mer-pill",
    "data-s": status,
    "data-dense": dense ? 'true' : undefined
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: dense ? 12 : 14,
    height: dense ? 12 : 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, ICONS[status]), children || DEFAULT_LABEL[status]);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Sheet.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Sheet({
  open = true,
  title,
  subtitle,
  onClose,
  children,
  headerRight,
  ...rest
}) {
  ensureCss();
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "mer-sheet__scrim",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", _extends({
    className: "mer-sheet",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "mer-sheet__handle"
  }), (title || headerRight) && /*#__PURE__*/React.createElement("div", {
    className: "mer-sheet__head"
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    className: "mer-sheet__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "mer-sheet__sub"
  }, subtitle)), headerRight), children));
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  success: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  info: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 16v-5M12 8h.01"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  })),
  warn: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4M12 17h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3 2 20h20L12 3z"
  })),
  error: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M15 9l-6 6M9 9l6 6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }))
};
function Toast({
  tone = 'success',
  children,
  actionLabel,
  onAction,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "mer-toast",
    "data-t": tone,
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mer-toast__icon"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, ICONS[tone])), /*#__PURE__*/React.createElement("span", {
    className: "mer-toast__msg"
  }, children), actionLabel && /*#__PURE__*/React.createElement("button", {
    className: "mer-toast__action",
    onClick: onAction
  }, actionLabel));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  as = 'button',
  ...rest
}) {
  ensureCss();
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: "mer-btn",
    "data-v": variant,
    "data-size": size,
    "data-full": fullWidth ? 'true' : undefined,
    "data-loading": loading ? 'true' : undefined,
    disabled: Tag === 'button' ? disabled || loading : undefined,
    "aria-busy": loading || undefined
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    className: "mer-btn__spin",
    "aria-hidden": "true"
  }) : leftIcon, children, !loading && rightIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian Checkbox — consent gates, snagging checklist, multi-select. */

let _merCbCss = false;
function ensureCss() {
  if (_merCbCss || typeof document === 'undefined') return;
  _merCbCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-cb{display:flex;align-items:flex-start;gap:var(--sp-3);cursor:pointer;
    font-family:var(--font-ui);font-size:var(--fs-sub);color:var(--text-primary);line-height:1.4;}
  .mer-cb__box{flex:none;width:24px;height:24px;border-radius:7px;border:1.5px solid var(--border-strong);
    background:var(--surface-card);display:inline-flex;align-items:center;justify-content:center;color:#fff;
    transition:background var(--dur-2) var(--ease-mid),border-color var(--dur-2) var(--ease-mid);margin-top:1px;}
  .mer-cb input{position:absolute;opacity:0;width:0;height:0;}
  .mer-cb input:checked + .mer-cb__box{background:var(--action);border-color:var(--action);}
  .mer-cb input:focus-visible + .mer-cb__box{box-shadow:var(--ring);}
  .mer-cb__check{opacity:0;transition:opacity var(--dur-1) var(--ease-out);}
  .mer-cb input:checked + .mer-cb__box .mer-cb__check{opacity:1;}
  .mer-cb[data-disabled="true"]{opacity:.55;cursor:not-allowed;}
  `;
  document.head.appendChild(s);
}
function Checkbox({
  checked = false,
  onChange,
  disabled,
  children,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("label", {
    className: "mer-cb",
    "data-disabled": disabled ? 'true' : undefined
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked)
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "mer-cb__box"
  }, /*#__PURE__*/React.createElement("svg", {
    className: "mer-cb__check",
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), children && /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function IconButton({
  icon,
  label,
  variant = 'plain',
  size = 'md',
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "mer-ib",
    "data-v": variant,
    "data-size": size,
    "aria-label": label,
    title: label
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Input({
  label,
  required,
  prefix,
  suffix,
  leadingIcon,
  mono = false,
  tone = 'default',
  help,
  error,
  id,
  ...rest
}) {
  ensureCss();
  const fid = id || (label ? 'in-' + label.replace(/\s+/g, '-').toLowerCase() : undefined);
  const effTone = error ? 'error' : tone;
  return /*#__PURE__*/React.createElement("label", {
    className: "mer-field",
    "data-mono": mono ? 'true' : undefined,
    htmlFor: fid
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "mer-field__label"
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "mer-field__req"
  }, "*")), /*#__PURE__*/React.createElement("span", {
    className: "mer-field__box",
    "data-tone": effTone,
    "data-disabled": rest.disabled ? 'true' : undefined
  }, leadingIcon, prefix && /*#__PURE__*/React.createElement("span", {
    className: "mer-field__adorn"
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    "aria-invalid": !!error
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    className: "mer-field__adorn"
  }, suffix)), (error || help) && /*#__PURE__*/React.createElement("span", {
    className: "mer-field__msg",
    "data-tone": error ? 'error' : undefined
  }, error || help));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian SegmentedControl — 2–4 mutually exclusive options.
   Used for EN/AR, time-vs-construction milestone type, filters. */

let _merSegCss = false;
function ensureCss() {
  if (_merSegCss || typeof document === 'undefined') return;
  _merSegCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-seg{display:inline-flex;background:var(--surface-sunk);border-radius:var(--r-pill);
    padding:4px;gap:2px;border:1px solid var(--border-hair);}
  .mer-seg[data-full="true"]{display:flex;width:100%;}
  .mer-seg__opt{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;
    border:none;background:transparent;cursor:pointer;border-radius:var(--r-pill);
    font-family:var(--font-ui);font-weight:var(--fw-semibold);font-size:var(--fs-label);
    color:var(--text-secondary);padding:0 16px;height:36px;white-space:nowrap;
    transition:color var(--dur-2) var(--ease-mid),background var(--dur-2) var(--ease-mid),box-shadow var(--dur-2) var(--ease-mid);}
  .mer-seg__opt:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-seg__opt[aria-selected="true"]{background:var(--surface-card);color:var(--text-primary);box-shadow:var(--shadow-sm);}
  `;
  document.head.appendChild(s);
}
function SegmentedControl({
  options = [],
  value,
  onChange,
  fullWidth = false,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "mer-seg",
    role: "tablist",
    "data-full": fullWidth ? 'true' : undefined
  }, rest), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const lbl = typeof o === 'string' ? o : o.label;
    const ic = typeof o === 'string' ? null : o.icon;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      role: "tab",
      className: "mer-seg__opt",
      "aria-selected": value === val,
      onClick: () => onChange && onChange(val)
    }, ic, lbl);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian Switch — binary toggle (notifications, app-lock, channels). */

let _merSwCss = false;
function ensureCss() {
  if (_merSwCss || typeof document === 'undefined') return;
  _merSwCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-sw{position:relative;display:inline-flex;align-items:center;width:48px;height:28px;flex:none;
    border-radius:var(--r-pill);background:var(--line-200);cursor:pointer;border:none;padding:0;
    transition:background var(--dur-2) var(--ease-mid);}
  .mer-sw:focus-visible{outline:none;box-shadow:var(--ring);}
  .mer-sw__knob{position:absolute;top:3px;inset-inline-start:3px;width:22px;height:22px;border-radius:50%;
    background:#fff;box-shadow:var(--shadow-sm);transition:transform var(--dur-2) var(--ease-out);}
  .mer-sw[aria-checked="true"]{background:var(--action);}
  .mer-sw[aria-checked="true"] .mer-sw__knob{transform:translateX(20px);}
  [dir="rtl"] .mer-sw[aria-checked="true"] .mer-sw__knob{transform:translateX(-20px);}
  .mer-sw[disabled]{opacity:.5;cursor:not-allowed;}
  `;
  document.head.appendChild(s);
}
function Switch({
  checked = false,
  onChange,
  disabled,
  label,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    className: "mer-sw",
    "aria-checked": checked,
    "aria-label": label,
    disabled: disabled,
    onClick: () => !disabled && onChange && onChange(!checked)
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mer-sw__knob"
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/money/Amount.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian Amount — AED money display. Mono, tabular, instrument-grade.
   Formats with thousands separators; never invents/guesses values. */

let _merAmtCss = false;
function ensureCss() {
  if (_merAmtCss || typeof document === 'undefined') return;
  _merAmtCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-amt{font-family:var(--font-mono);font-variant-numeric:tabular-nums;font-weight:var(--fw-semibold);
    letter-spacing:-.01em;color:var(--text-primary);white-space:nowrap;display:inline-flex;align-items:baseline;gap:5px;}
  .mer-amt__cur{font-size:.66em;font-weight:var(--fw-medium);color:var(--text-secondary);letter-spacing:var(--tracking-caps);}
  .mer-amt[data-tone="paid"]{color:var(--paid-text);}
  .mer-amt[data-tone="muted"]{color:var(--text-secondary);font-weight:var(--fw-medium);}
  .mer-amt[data-tone="risk"]{color:var(--overdue-text);}
  .mer-amt[data-size="sm"]{font-size:var(--fs-sub);}
  .mer-amt[data-size="md"]{font-size:var(--fs-h2);}
  .mer-amt[data-size="lg"]{font-size:var(--fs-h1);}
  .mer-amt[data-size="xl"]{font-size:var(--fs-display);font-family:var(--font-display);font-weight:var(--fw-bold);}
  .mer-amt[data-size="xl"] .mer-amt__cur{font-size:.42em;}
  `;
  document.head.appendChild(s);
}
function fmt(n) {
  if (n === null || n === undefined || n === '') return '—';
  const num = typeof n === 'number' ? n : Number(String(n).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return String(n);
  return num.toLocaleString('en-AE', {
    maximumFractionDigits: 0
  });
}
function Amount({
  value,
  currency = 'AED',
  size = 'md',
  tone = 'default',
  currencyAfter = false,
  ...rest
}) {
  ensureCss();
  const cur = /*#__PURE__*/React.createElement("span", {
    className: "mer-amt__cur"
  }, currency);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "mer-amt",
    "data-size": size,
    "data-tone": tone
  }, rest), !currencyAfter && cur, /*#__PURE__*/React.createElement("span", null, fmt(value)), currencyAfter && cur);
}
Object.assign(__ds_scope, { Amount });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/Amount.jsx", error: String((e && e.message) || e) }); }

// components/money/MilestoneRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  time: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "17",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 2v4M16 2v4M3 10h18"
  })),
  construction: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M2 18h20M4 18v-5a8 8 0 0 1 16 0v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 5V2M9 9l6 0"
  }))
};
function MilestoneRow({
  title,
  due,
  amount,
  status = 'upcoming',
  type = 'time',
  statusLabel,
  currencyAfter,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "mer-mr"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "mer-mr__icon",
    "data-type": type,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, TYPE_ICON[type])), /*#__PURE__*/React.createElement("span", {
    className: "mer-mr__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "mer-mr__title"
  }, title), /*#__PURE__*/React.createElement("span", {
    className: "mer-mr__meta"
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusPill, {
    status: status,
    dense: true
  }, statusLabel), /*#__PURE__*/React.createElement("span", {
    className: "mer-mr__due"
  }, due))), /*#__PURE__*/React.createElement("span", {
    className: "mer-mr__right"
  }, /*#__PURE__*/React.createElement(__ds_scope.Amount, {
    value: amount,
    size: "sm",
    tone: status === 'paid' ? 'paid' : 'default',
    currencyAfter: currencyAfter
  })));
}
Object.assign(__ds_scope, { MilestoneRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/MilestoneRow.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function AppHeader({
  title,
  eyebrow,
  onBack,
  actions,
  bordered = false,
  center = false,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("header", _extends({
    className: "mer-hdr",
    "data-bordered": bordered ? 'true' : undefined,
    "data-center": center ? 'true' : undefined
  }, rest), onBack && /*#__PURE__*/React.createElement("button", {
    className: "mer-hdr__back",
    "aria-label": "Back",
    onClick: onBack
  }, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m15 18-6-6 6-6"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mer-hdr__mid"
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    className: "mer-hdr__eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("h1", {
    className: "mer-hdr__title"
  }, title)), actions && /*#__PURE__*/React.createElement("div", {
    className: "mer-hdr__actions"
  }, actions));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian TabBar — bottom navigation (blurred bar). 3–5 items.
   Active item = jade pill behind icon + jade label. RTL mirrors order. */

let _merTabCss = false;
function ensureCss() {
  if (_merTabCss || typeof document === 'undefined') return;
  _merTabCss = true;
  const s = document.createElement('style');
  s.textContent = `
  .mer-tabbar{display:flex;align-items:stretch;gap:2px;
    padding:8px var(--sp-3) calc(8px + var(--safe-bottom));
    background:color-mix(in srgb,var(--surface-card) 82%,transparent);
    -webkit-backdrop-filter:var(--blur-bar);backdrop-filter:var(--blur-bar);
    border-top:1px solid var(--border-hair);}
  .mer-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;border:none;background:transparent;
    cursor:pointer;padding:6px 0;color:var(--text-tertiary);min-height:var(--tap-min);
    font-family:var(--font-ui);transition:color var(--dur-2) var(--ease-mid);}
  .mer-tab:focus-visible{outline:none;box-shadow:var(--ring);border-radius:var(--r-sm);}
  .mer-tab__ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:28px;border-radius:var(--r-pill);
    transition:background var(--dur-2) var(--ease-mid);position:relative;}
  .mer-tab__label{font-size:var(--fs-micro);font-weight:var(--fw-medium);}
  .mer-tab[aria-selected="true"]{color:var(--action);}
  .mer-tab[aria-selected="true"] .mer-tab__ico{background:var(--jade-50);}
  .mer-tab[aria-selected="true"] .mer-tab__label{font-weight:var(--fw-semibold);}
  .mer-tab__badge{position:absolute;top:0;inset-inline-end:8px;min-width:16px;height:16px;border-radius:var(--r-pill);
    background:var(--overdue);color:#fff;font-size:9px;font-weight:var(--fw-bold);display:flex;align-items:center;
    justify-content:center;padding:0 4px;border:2px solid var(--surface-card);}
  `;
  document.head.appendChild(s);
}
function TabBar({
  items = [],
  value,
  onChange,
  ...rest
}) {
  ensureCss();
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: "mer-tabbar",
    role: "tablist"
  }, rest), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    role: "tab",
    className: "mer-tab",
    "aria-selected": value === it.value,
    onClick: () => onChange && onChange(it.value)
  }, /*#__PURE__*/React.createElement("span", {
    className: "mer-tab__ico"
  }, it.icon, it.badge ? /*#__PURE__*/React.createElement("span", {
    className: "mer-tab__badge"
  }, it.badge) : null), /*#__PURE__*/React.createElement("span", {
    className: "mer-tab__label"
  }, it.label))));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/app-data.jsx
try { (() => {
/* Meridian UI kit — shared data, Icon helper, formatters, i18n.
   Exposes everything on window for the other text/babel screen files. */

// Robust Lucide icon: span owned by React, <i> swapped imperatively inside it
// so re-renders never collide with Lucide's DOM replacement.
function Icon({
  name,
  size = 22,
  color,
  strokeWidth = 2,
  style
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    el.appendChild(i);
    try {
      window.lucide.createIcons({
        attrs: {
          width: size,
          height: size,
          'stroke-width': strokeWidth
        }
      });
    } catch (e) {}
  });
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      color,
      flex: 'none',
      ...style
    }
  });
}
const AED = n => n == null ? 'AED —' : 'AED ' + Number(n).toLocaleString('en-AE', {
  maximumFractionDigits: 0
});

// ---- Sample portfolio (the seeded sample deal + a realistic book) ----
const DEALS = [{
  id: 'marina',
  sample: true,
  project: 'Marina Vista',
  unit: 'Unit 1204',
  tower: 'Tower 2',
  developer: 'Emaar',
  buyer: 'Khalid Al Marri',
  buyerInit: 'KA',
  totalPrice: 1250000,
  paidPct: 24,
  constructionPct: 42,
  dldNo: '1234 · DXB-OFF',
  oqood: 'OQ-2026-008842',
  escrow: 'AE07 0331 2345 6789 0123 456',
  next: {
    title: 'DLD registration fee (4%)',
    due: 'Due in 3 days · 28 Jun',
    amount: 50000,
    status: 'due',
    type: 'time'
  },
  milestones: [{
    title: 'Booking deposit (20%)',
    due: 'Paid 14 Mar 2026',
    amount: 250000,
    status: 'paid',
    type: 'time'
  }, {
    title: 'DLD registration fee (4%)',
    due: 'Due in 3 days · 28 Jun 2026',
    amount: 50000,
    status: 'due',
    statusLabel: 'Due in 3 days',
    type: 'time'
  }, {
    title: '1st construction milestone (10%)',
    due: 'on 20% build · est. Q4 2026',
    amount: 125000,
    status: 'upcoming',
    type: 'construction'
  }, {
    title: '2nd construction milestone (10%)',
    due: 'on 40% build · est. Q1 2027',
    amount: 125000,
    status: 'upcoming',
    type: 'construction'
  }, {
    title: 'Handover payment (40%)',
    due: 'on completion · est. Q3 2028',
    amount: 500000,
    status: 'upcoming',
    type: 'construction'
  }]
}, {
  id: 'creek',
  project: 'Creek Gate',
  unit: 'Unit 808',
  tower: 'South',
  developer: 'Emaar',
  buyer: 'Aisha Noor',
  buyerInit: 'AN',
  totalPrice: 980000,
  paidPct: 30,
  constructionPct: 55,
  atRisk: true,
  dldNo: '5521 · DXB-OFF',
  oqood: 'OQ-2025-114200',
  escrow: 'AE61 0090 0000 1234 5678 901',
  next: {
    title: '3rd installment (10%)',
    due: 'Overdue by 6 days',
    amount: 98000,
    status: 'overdue',
    type: 'time'
  },
  milestones: []
}, {
  id: 'palm',
  project: 'Palm Beach Towers',
  unit: 'Unit 2310',
  tower: 'T3',
  developer: 'Nakheel',
  buyer: 'Omar Said',
  buyerInit: 'OS',
  totalPrice: 3200000,
  paidPct: 15,
  constructionPct: 18,
  dldNo: '7790 · DXB-OFF',
  oqood: 'OQ-2026-220015',
  escrow: 'AE21 0500 0000 9988 7766 554',
  next: {
    title: 'Oqood registration',
    due: 'In grace · 12 days left',
    amount: 128000,
    status: 'grace',
    type: 'time'
  },
  milestones: []
}];

// ---- SPA review extracted fields (the signature screen) ----
const SPA_FIELDS = [{
  key: 'project',
  label: 'Project',
  value: 'Marina Vista — Tower 2',
  confidence: 'high',
  money: false,
  region: {
    top: 14,
    left: 8,
    w: 60,
    h: 5
  }
}, {
  key: 'unit',
  label: 'Unit',
  value: 'Unit 1204',
  confidence: 'high',
  money: false,
  region: {
    top: 20,
    left: 8,
    w: 30,
    h: 5
  }
}, {
  key: 'price',
  label: 'Total price',
  value: 'AED 1,250,000',
  confidence: 'high',
  money: true,
  region: {
    top: 33,
    left: 8,
    w: 55,
    h: 6
  }
}, {
  key: 'deposit',
  label: 'Booking deposit (20%)',
  value: 'AED 250,000',
  confidence: 'med',
  money: true,
  region: {
    top: 46,
    left: 8,
    w: 50,
    h: 5
  }
}, {
  key: 'dld',
  label: 'DLD registration (4%)',
  value: 'AED 50,000',
  confidence: 'high',
  money: true,
  region: {
    top: 53,
    left: 8,
    w: 50,
    h: 5
  }
}, {
  key: 'escrow',
  label: 'Escrow IBAN',
  value: 'AE07 0331 2345 6789 0123 456',
  confidence: 'low',
  money: false,
  region: {
    top: 66,
    left: 8,
    w: 78,
    h: 5
  }
}, {
  key: 'oqood',
  label: 'Oqood certificate no.',
  value: null,
  confidence: 'low',
  money: false,
  region: {
    top: 73,
    left: 8,
    w: 40,
    h: 5
  }
}, {
  key: 'handover',
  label: 'Handover',
  value: 'Q3 2028 (est.)',
  confidence: 'med',
  money: false,
  region: {
    top: 84,
    left: 8,
    w: 45,
    h: 5
  }
}];
const STRINGS = {
  en: {
    dueThisWeek: "What's due this week",
    today: 'Tue · 23 Jun',
    greeting: 'Morning, Yousef',
    markPaid: 'Mark paid',
    nudge: 'Nudge buyer',
    addDeal: 'Add deal',
    deals: 'Deals',
    comms: 'Comms',
    you: 'You',
    due: 'Due'
  },
  ar: {
    dueThisWeek: 'المستحق هذا الأسبوع',
    today: 'الثلاثاء · ٢٣ يونيو',
    greeting: 'صباح الخير، يوسف',
    markPaid: 'تحديد كمدفوع',
    nudge: 'تذكير المشتري',
    addDeal: 'إضافة صفقة',
    deals: 'الصفقات',
    comms: 'المراسلات',
    you: 'حسابك',
    due: 'مستحق'
  }
};
Object.assign(window, {
  Icon,
  AED,
  DEALS,
  SPA_FIELDS,
  STRINGS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/app-data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-ai.jsx
try { (() => {
/* Meridian UI kit — the signature AI moment: SPA upload + review/confirm.
   Trust-but-verify: source PDF beside extracted fields, per-field confidence,
   tap a field to highlight its source, explicit confirm on money/date. */
const {
  Button,
  IconButton,
  AppHeader,
  FieldReviewRow,
  ConfidenceCue,
  Card,
  Badge
} = window.MeridianDesignSystem_f018d0;

/* ---------- Faux SPA PDF page (so highlights land on real-looking content) ---------- */
function SpaPdf({
  region
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "pdf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pdf-bar"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 14
  }), " Marina-Vista-SPA.pdf"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, "p.1 / 6")), /*#__PURE__*/React.createElement("div", {
    className: "pdf-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pdf-h"
  }, "SALE & PURCHASE AGREEMENT"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, /*#__PURE__*/React.createElement("b", null, "1. The Property."), " Marina Vista \u2014 Tower 2, a residential"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "apartment known as ", /*#__PURE__*/React.createElement("b", null, "Unit 1204"), " on the 12th floor."), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\xA0"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, /*#__PURE__*/React.createElement("b", null, "2. Purchase Price."), " The total price is"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, /*#__PURE__*/React.createElement("b", null, "AED 1,250,000"), " (one million two hundred fifty)."), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\xA0"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, /*#__PURE__*/React.createElement("b", null, "3. Payment Plan."), " Booking deposit of 20% ="), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "AED 250,000 due on signing. DLD fee 4% = AED 50,000."), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\xA0"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, /*#__PURE__*/React.createElement("b", null, "4. Escrow."), " Payments to escrow account"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "IBAN AE07 0331 2345 6789 0123 456 (Emaar)."), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "Oqood registration \u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026 (illegible)"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\xA0"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, /*#__PURE__*/React.createElement("b", null, "5. Handover."), " Anticipated Q3 2028, subject to"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "construction progress per Article 9."), region && /*#__PURE__*/React.createElement("div", {
    className: "pdf-hl",
    style: {
      top: region.top + '%',
      insetInlineStart: region.left + '%',
      width: region.w + '%',
      height: region.h + '%'
    }
  })));
}

/* ---------- SPA review / confirm (signature) ---------- */
function SpaReview({
  onBack,
  onBuild
}) {
  const fields = SPA_FIELDS;
  const needConfirm = fields.filter(f => f.money || f.confidence === 'low');
  const [sel, setSel] = React.useState('price');
  const [confirmed, setConfirmed] = React.useState({
    project: true,
    unit: true,
    handover: true
  });
  const cur = fields.find(f => f.key === sel);
  const doneCount = needConfirm.filter(f => confirmed[f.key]).length;
  const allDone = doneCount === needConfirm.length;
  const confirm = k => setConfirmed(c => ({
    ...c,
    [k]: true
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "New deal \xB7 SPA",
    title: "Review the plan",
    onBack: onBack,
    bordered: true,
    actions: /*#__PURE__*/React.createElement(Badge, {
      tone: "jade",
      soft: true
    }, "AI \xB7 8 fields")
  }), /*#__PURE__*/React.createElement("div", {
    className: "pdf-pane"
  }, /*#__PURE__*/React.createElement(SpaPdf, {
    region: cur ? cur.region : null
  }), cur && /*#__PURE__*/React.createElement("div", {
    className: 'pdf-action' + (cur.confidence === 'low' ? ' is-low' : '')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'inherit',
      opacity: .7
    }
  }, cur.label), /*#__PURE__*/React.createElement("div", {
    className: "pdf-action-val"
  }, cur.value || 'Not found — enter manually')), confirmed[cur.key] ? /*#__PURE__*/React.createElement("span", {
    className: "confirmed-chip"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), " Confirmed") : cur.money || cur.confidence === 'low' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "pencil",
      size: 15
    })
  }, "Edit"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    onClick: () => confirm(cur.key)
  }, cur.value ? 'Confirm' : 'Add')) : /*#__PURE__*/React.createElement(ConfidenceCue, {
    level: cur.confidence,
    chip: true
  }))), /*#__PURE__*/React.createElement("div", {
    className: "scroll",
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "validate ok"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 17
  }), /*#__PURE__*/React.createElement("span", null, "Installments sum to ", /*#__PURE__*/React.createElement("b", null, "100%"), " \xB7 milestones reconcile to ", /*#__PURE__*/React.createElement("b", null, "AED 1,250,000"))), /*#__PURE__*/React.createElement("p", {
    className: "review-hint"
  }, "Check what we read. Tap any field to see its source in the SPA. Money & dates need your confirm."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, fields.map(f => /*#__PURE__*/React.createElement(FieldReviewRow, {
    key: f.key,
    label: f.label,
    value: f.value,
    confidence: f.confidence,
    money: f.money,
    active: sel === f.key,
    confirmed: !!confirmed[f.key],
    onClick: () => setSel(f.key)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 90
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "cta-bar"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: !allDone,
    rightIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 20
    }),
    onClick: onBuild
  }, allDone ? 'Build the payment plan' : `Confirm ${doneCount} of ${needConfirm.length} to continue`)));
}

/* ---------- SPA upload + scan (loading state, manual fallback) ---------- */
function SpaUpload({
  onBack,
  onScanned,
  onManual
}) {
  const [phase, setPhase] = React.useState('idle'); // idle | scanning
  React.useEffect(() => {
    if (phase !== 'scanning') return;
    const id = setTimeout(() => onScanned(), 2200);
    return () => clearTimeout(id);
  }, [phase]);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "New deal",
    title: "Upload the SPA",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll",
    style: {
      justifyContent: 'center',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, phase === 'idle' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "dropzone",
    onClick: () => setPhase('scanning')
  }, /*#__PURE__*/React.createElement("span", {
    className: "dz-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-up",
    size: 30
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 16px var(--font-display)'
    }
  }, "Drop the SPA PDF here"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "or tap to choose \xB7 scan a paper copy")), /*#__PURE__*/React.createElement("div", {
    className: "upload-note"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 16
  }), " We read it on-device first. Nothing is auto-filled without your confirm."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    onClick: onManual
  }, "Enter the plan manually instead")) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "scan-doc"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    className: "scan-beam"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 18px var(--font-display)'
    }
  }, "Reading the SPA\u2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px var(--font-ui)',
      color: 'var(--text-secondary)',
      maxWidth: 240
    }
  }, "Finding the price, payment plan, escrow and milestones. You'll confirm every figure."))));
}
Object.assign(window, {
  SpaReview,
  SpaUpload
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-ai.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-core.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Meridian UI kit — core screens: Portfolio "What's due" home, Deal detail,
   Mark-paid sheet. The home is the daily-open heart of the app. */
const {
  Card,
  StatusPill,
  Amount,
  Badge,
  Button,
  IconButton,
  Input,
  ProgressMeter,
  MilestoneRow,
  AppHeader,
  Sheet
} = window.MeridianDesignSystem_f018d0;

/* ---------- A "needs you" row on the home screen ---------- */
function DueCard({
  deal,
  onOpen,
  onMarkPaid,
  onNudge,
  t
}) {
  const m = deal.next;
  return /*#__PURE__*/React.createElement(Card, {
    as: "div",
    interactive: true,
    role: "button",
    tabIndex: 0,
    onClick: () => onOpen(deal.id),
    style: {
      padding: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--sp-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 16px var(--font-display)',
      letterSpacing: '-.01em'
    }
  }, deal.project), deal.sample && /*#__PURE__*/React.createElement(Badge, {
    tone: "sample",
    soft: true
  }, "Sample")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--text-secondary)',
      marginTop: 2
    }
  }, deal.unit, " \xB7 ", deal.buyer)), /*#__PURE__*/React.createElement(Amount, {
    value: m.amount,
    size: "md",
    tone: m.status === 'overdue' ? 'risk' : 'default'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    status: m.status
  }, m.statusLabel || mLabel(m)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--text-secondary)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, m.title))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 1,
      background: 'var(--border-hair)',
      borderTop: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "due-act",
    onClick: e => {
      e.stopPropagation();
      onMarkPaid(deal);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-check",
    size: 17
  }), " ", t.markPaid), /*#__PURE__*/React.createElement("button", {
    className: "due-act",
    onClick: e => {
      e.stopPropagation();
      onNudge(deal);
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "message-circle",
    size: 17
  }), " ", t.nudge)));
}
function mLabel(m) {
  return {
    paid: 'Paid',
    due: 'Due',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    grace: 'In grace',
    atrisk: 'At risk'
  }[m.status];
}

/* ---------- Portfolio "What's due" home ---------- */
function PortfolioHome({
  onOpen,
  onMarkPaid,
  onNudge,
  onAddDeal,
  lang = 'en'
}) {
  const t = STRINGS[lang];
  const [seg, setSeg] = React.useState('week');
  const atRisk = DEALS.find(d => d.atRisk);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, t.today), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 24px var(--font-display)',
      letterSpacing: '-.02em',
      marginTop: 2
    }
  }, t.greeting)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 22
    }),
    label: "Reminders"
  }), /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }, "YF"))), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "ink",
    style: {
      padding: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--jade-200)'
    }
  }, t.dueThisWeek), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'flex',
      alignItems: 'baseline',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Amount, {
    value: 148000,
    size: "xl"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      marginTop: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-chip"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--overdue)'
    }
  }), "1 overdue"), /*#__PURE__*/React.createElement("span", {
    className: "hero-chip"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--due)'
    }
  }), "1 due soon"), /*#__PURE__*/React.createElement("span", {
    className: "hero-chip"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--amber-300)'
    }
  }), "1 in grace")), /*#__PURE__*/React.createElement("div", {
    className: "mini-line"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mini-done"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mini-now"
  }))), atRisk && /*#__PURE__*/React.createElement("button", {
    className: "risk-banner",
    onClick: () => onOpen(atRisk.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "risk-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-alert",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px var(--font-ui)',
      display: 'block'
    }
  }, atRisk.project, " is at risk"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12.5px var(--font-ui)',
      color: 'var(--critical-text)',
      opacity: .9
    }
  }, "Act now \u2014 assignment still possible before a default notice.")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Needs you"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--action)'
    }
  }, "3 items")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement(DueCard, {
    deal: DEALS[1],
    onOpen: onOpen,
    onMarkPaid: onMarkPaid,
    onNudge: onNudge,
    t: t
  }), /*#__PURE__*/React.createElement(DueCard, {
    deal: DEALS[0],
    onOpen: onOpen,
    onMarkPaid: onMarkPaid,
    onNudge: onNudge,
    t: t
  }), /*#__PURE__*/React.createElement(DueCard, {
    deal: DEALS[2],
    onOpen: onOpen,
    onMarkPaid: onMarkPaid,
    onNudge: onNudge,
    t: t
  })), /*#__PURE__*/React.createElement("div", {
    className: "guardrail"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Oqood registration for Palm Beach Towers is due within 90 days of the SPA \u2014 ", /*#__PURE__*/React.createElement("b", null, "41 days left"), ". ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, "Not legal advice."))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  })));
}

/* ---------- Deal detail ---------- */
function DealDetail({
  dealId,
  onBack,
  onMarkPaid,
  onNudge,
  lang = 'en'
}) {
  const deal = DEALS.find(d => d.id === dealId) || DEALS[0];
  const ms = deal.milestones.length ? deal.milestones : DEALS[0].milestones;
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: deal.project,
    title: deal.unit,
    onBack: onBack,
    bordered: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ellipsis",
        size: 22
      }),
      label: "More"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      borderColor: 'var(--accent)',
      background: 'var(--due-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--amber-700)'
    }
  }, "Next action"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 16px var(--font-display)'
    }
  }, deal.next.title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--amber-700)',
      marginTop: 3
    }
  }, deal.next.due)), /*#__PURE__*/React.createElement(Amount, {
    value: deal.next.amount,
    size: "md"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-check",
      size: 18
    }),
    onClick: () => onMarkPaid(deal)
  }, "Mark paid"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "message-circle",
      size: 18
    }),
    onClick: () => onNudge(deal)
  }, "Nudge"))), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginTop: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Unit & project"), /*#__PURE__*/React.createElement("div", {
    className: "id-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Developer"), /*#__PURE__*/React.createElement("b", null, deal.developer)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "DLD project no."), /*#__PURE__*/React.createElement("b", {
    className: "mono"
  }, deal.dldNo)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Oqood cert"), /*#__PURE__*/React.createElement("b", {
    className: "mono"
  }, deal.oqood)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", null, "Buyer"), /*#__PURE__*/React.createElement("b", null, deal.buyer)), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Escrow IBAN"), /*#__PURE__*/React.createElement("b", {
    className: "mono"
  }, deal.escrow)))), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginTop: 'var(--sp-3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "construction",
    label: "Construction",
    value: deal.constructionPct,
    marker: 60
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "payment",
    label: "Paid to date",
    value: deal.paidPct
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Payment plan"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--text-tertiary)'
    }
  }, ms.length, " milestones")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 10px'
    }
  }, ms.map((m, i) => /*#__PURE__*/React.createElement(MilestoneRow, _extends({
    key: i
  }, m, {
    statusLabel: m.statusLabel,
    onClick: () => m.status !== 'paid' && onMarkPaid(deal)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Mark-paid sheet (with proof + audit — money you can defend) ---------- */
function MarkPaidSheet({
  deal,
  onClose,
  onConfirm
}) {
  const [attached, setAttached] = React.useState(false);
  if (!deal) return null;
  const m = deal.next;
  return /*#__PURE__*/React.createElement(Sheet, {
    open: true,
    title: "Mark as paid",
    subtitle: `${m.title} · ${deal.project}`,
    onClose: onClose,
    headerRight: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "x",
        size: 20
      }),
      label: "Close",
      onClick: onClose
    })
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "sunk",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Amount"), /*#__PURE__*/React.createElement(Amount, {
    value: m.amount,
    size: "lg"
  })), /*#__PURE__*/React.createElement(StatusPill, {
    status: m.status
  }, m.statusLabel || mLabel(m))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      margin: '14px 0'
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "paid-row"
  }, /*#__PURE__*/React.createElement("span", null, "Paid on"), /*#__PURE__*/React.createElement("b", null, "Today \xB7 23 Jun 2026")), /*#__PURE__*/React.createElement(Input, {
    label: "Transfer reference",
    mono: true,
    placeholder: "e.g. FT26178XKD2 / cheque no.",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "hash",
      size: 16,
      color: "var(--text-tertiary)"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "paid-row",
    style: {
      background: 'var(--paid-bg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--paid-text)',
      display: 'inline-flex',
      gap: 7,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "landmark",
    size: 15
  }), " Goes to escrow"), /*#__PURE__*/React.createElement("b", {
    className: "mono",
    style: {
      color: 'var(--paid-text)',
      fontSize: 12
    }
  }, "AE07 0331 \u2026456 \u2713"))), /*#__PURE__*/React.createElement("button", {
    className: 'proof' + (attached ? ' on' : ''),
    onClick: () => setAttached(!attached)
  }, /*#__PURE__*/React.createElement("span", {
    className: "proof-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: attached ? 'file-check-2' : 'paperclip',
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'start'
    }
  }, /*#__PURE__*/React.createElement("b", null, attached ? 'receipt-26jun.pdf attached' : 'Attach proof of payment'), /*#__PURE__*/React.createElement("span", null, attached ? 'Stored with the deal · exportable' : 'Receipt or bank confirmation (recommended)')), attached ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18,
    color: "var(--paid)"
  }) : /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 18,
    color: "var(--text-tertiary)"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    style: {
      marginTop: 14
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-check",
      size: 20
    }),
    onClick: () => onConfirm(deal)
  }, "Confirm payment"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 12px/1.5 var(--font-ui)',
      color: 'var(--text-tertiary)',
      textAlign: 'center',
      marginTop: 10,
      display: 'flex',
      gap: 6,
      justifyContent: 'center',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 13
  }), " Logged to your audit trail \xB7 Yousef, today 9:41 \u2014 exportable for RERA."));
}
Object.assign(window, {
  PortfolioHome,
  DealDetail,
  MarkPaidSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-core.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-deals.jsx
try { (() => {
/* Meridian UI kit — deals list, manual entry, milestone detail. */
const {
  Button,
  IconButton,
  Input,
  SegmentedControl,
  Card,
  StatusPill,
  Badge,
  Amount,
  ProgressMeter,
  MilestoneRow,
  AppHeader
} = window.MeridianDesignSystem_f018d0;

/* ---------- Deals list (portfolio) ---------- */
function DealsList({
  onOpen,
  onAddDeal
}) {
  const [filter, setFilter] = React.useState('all');
  const chips = [['all', 'All'], ['active', 'Active'], ['risk', 'At risk'], ['handover', 'Near handover']];
  const shown = DEALS.filter(d => filter === 'all' ? true : filter === 'risk' ? d.atRisk : true);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    title: "Deals",
    bordered: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "search",
        size: 22
      }),
      label: "Search"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "search-bar"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18,
    color: "var(--text-tertiary)"
  }), /*#__PURE__*/React.createElement("span", null, "Search project, unit or buyer")), /*#__PURE__*/React.createElement("div", {
    className: "filter-chips"
  }, chips.map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    className: 'fchip' + (filter === v ? ' on' : ''),
    onClick: () => setFilter(v)
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, shown.map(d => /*#__PURE__*/React.createElement(Card, {
    as: "div",
    interactive: true,
    role: "button",
    key: d.id,
    onClick: () => onOpen(d.id),
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 16px var(--font-display)'
    }
  }, d.project), d.sample && /*#__PURE__*/React.createElement(Badge, {
    tone: "sample",
    soft: true
  }, "Sample")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--text-secondary)',
      marginTop: 2
    }
  }, d.unit, " \xB7 ", d.buyer)), /*#__PURE__*/React.createElement(Amount, {
    value: d.totalPrice,
    size: "sm",
    tone: "muted"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 0 10px'
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "payment",
    label: "Paid to date",
    value: d.paidPct
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    status: d.next.status,
    dense: true
  }, d.next.statusLabel || d.next.due), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-tertiary)'
    }
  }, d.next.title))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 90
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "fab",
    onClick: onAddDeal
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 22
  }), " Add deal"));
}

/* ---------- Manual entry (PDF-less plan builder) ---------- */
function ManualEntry({
  onBack,
  onSave
}) {
  const rows = [{
    t: 'Booking deposit',
    pct: 20,
    amt: 250000,
    type: 'time'
  }, {
    t: 'DLD registration (4%)',
    pct: 4,
    amt: 50000,
    type: 'time'
  }, {
    t: '1st construction',
    pct: 10,
    amt: 125000,
    type: 'construction'
  }, {
    t: 'Handover',
    pct: 66,
    amt: 825000,
    type: 'construction'
  }];
  const sumPct = rows.reduce((a, r) => a + r.pct, 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "New deal \xB7 manual",
    title: "Build the plan",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Project",
    defaultValue: "Marina Vista \u2014 Tower 2"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Unit",
    defaultValue: "1204"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Total price",
    prefix: "AED",
    mono: true,
    defaultValue: "1,250,000"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Payment plan"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--text-tertiary)'
    }
  }, rows.length, " milestones")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 10px'
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement(MilestoneRow, {
    key: i,
    type: r.type,
    title: `${r.t} (${r.pct}%)`,
    due: r.type === 'construction' ? 'on build trigger' : 'set a date',
    amount: r.amt,
    status: "upcoming",
    statusLabel: r.type === 'construction' ? 'Construction' : 'Time'
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 18
    }),
    style: {
      marginTop: 8
    }
  }, "Add milestone"), /*#__PURE__*/React.createElement("div", {
    className: 'validate ' + (sumPct === 100 ? 'ok' : 'warn'),
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: sumPct === 100 ? 'circle-check' : 'alert-triangle',
    size: 17
  }), /*#__PURE__*/React.createElement("span", null, "Installments sum to ", /*#__PURE__*/React.createElement("b", null, sumPct, "%"), sumPct === 100 ? ' · reconciles to AED 1,250,000' : ` — add ${100 - sumPct}%`)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 90
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "cta-bar"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: sumPct !== 100,
    onClick: onSave
  }, "Save deal")));
}

/* ---------- Milestone detail / reminder ladder ---------- */
function MilestoneDetail({
  onBack,
  onMarkPaid,
  onNudge
}) {
  const deal = DEALS[0];
  const m = deal.milestones[1]; // DLD fee, due
  const ladder = [{
    ch: 'In-app + push',
    when: '7 days before',
    icon: 'bell',
    done: true
  }, {
    ch: 'Push',
    when: '3 days before',
    icon: 'smartphone',
    done: true
  }, {
    ch: 'Push',
    when: '1 day before',
    icon: 'smartphone',
    done: false,
    next: true
  }, {
    ch: 'Email',
    when: 'On due date',
    icon: 'mail',
    done: false
  }, {
    ch: 'WhatsApp (grace)',
    when: 'Due + 3 days',
    icon: 'message-circle',
    done: false,
    critical: true
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: `${deal.project} · ${deal.unit}`,
    title: "Milestone",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      borderColor: 'var(--accent)',
      background: 'var(--due-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 18px var(--font-display)'
    }
  }, m.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    status: "due"
  }, "Due in 3 days \xB7 28 Jun"))), /*#__PURE__*/React.createElement(Amount, {
    value: m.amount,
    size: "lg"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-check",
      size: 18
    }),
    onClick: () => onMarkPaid(deal)
  }, "Mark paid"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "message-circle",
      size: 18
    }),
    onClick: () => onNudge(deal)
  }, "Nudge"))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Reminder ladder")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 0'
    }
  }, ladder.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ladder-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'ladder-dot' + (l.done ? ' done' : l.next ? ' next' : l.critical ? ' crit' : '')
  }, l.done ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    color: "#fff"
  }) : /*#__PURE__*/React.createElement(Icon, {
    name: l.icon,
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 14px var(--font-ui)',
      display: 'block'
    }
  }, l.ch), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, l.when)), l.next && /*#__PURE__*/React.createElement(Badge, {
    tone: "amber",
    soft: true
  }, "Next"), l.critical && /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    soft: true
  }, "Critical tier")))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Source")), /*#__PURE__*/React.createElement(Card, {
    as: "div",
    interactive: true,
    role: "button",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pick-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 14px var(--font-ui)'
    }
  }, "SPA \xB7 clause 3, payment plan"), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "DLD fee 4% = AED 50,000")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--text-tertiary)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}
Object.assign(window, {
  DealsList,
  ManualEntry,
  MilestoneDetail
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-deals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-home2.jsx
try { (() => {
/* Meridian 2026 — dark-first BENTO home with swipe-to-action rows.
   The daily-open heart of the app, rebuilt to the 2026 direction:
   bento overview grid, tactile depth, swipe gestures, glass chrome. */
const {
  Amount,
  StatusPill,
  Badge,
  Button,
  IconButton
} = window.MeridianDesignSystem_f018d0;

/* swipe-to-reveal row (swipe ← to expose Mark paid / Nudge) */
function NeedRow({
  deal,
  onOpen,
  onMarkPaid,
  onNudge,
  hint
}) {
  const REVEAL = 132;
  const [dx, setDx] = React.useState(0);
  const start = React.useRef(null);
  const rtl = typeof document !== 'undefined' && document.dir === 'rtl';
  const clamp = n => rtl ? Math.min(REVEAL, Math.max(0, n)) : Math.max(-REVEAL, Math.min(0, n));
  const down = e => {
    start.current = e.clientX - dx;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = e => {
    if (start.current == null) return;
    setDx(clamp(e.clientX - start.current));
  };
  const up = () => {
    if (start.current == null) return;
    const open = Math.abs(dx) > REVEAL / 2;
    setDx(open ? rtl ? REVEAL : -REVEAL : 0);
    start.current = null;
  };
  const m = deal.next;
  return /*#__PURE__*/React.createElement("div", {
    className: "swipe"
  }, /*#__PURE__*/React.createElement("div", {
    className: "swipe-actions",
    style: {
      [rtl ? 'left' : 'right']: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "swa paid",
    onClick: () => {
      setDx(0);
      onMarkPaid(deal);
    },
    "aria-label": "Mark paid"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-check",
    size: 20
  })), /*#__PURE__*/React.createElement("button", {
    className: "swa nudge",
    onClick: () => {
      setDx(0);
      onNudge(deal);
    },
    "aria-label": "Nudge"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "message-circle",
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    className: 'swipe-fg' + (hint && dx === 0 ? ' peek' : ''),
    style: {
      transform: dx ? `translateX(${dx}px)` : undefined
    },
    onPointerDown: down,
    onPointerMove: move,
    onPointerUp: up,
    onPointerCancel: up,
    onClick: () => dx === 0 && onOpen(deal.id)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 15px var(--font-display)'
    }
  }, deal.project), deal.sample && /*#__PURE__*/React.createElement(Badge, {
    tone: "sample",
    soft: true
  }, "Sample")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 12.5px var(--font-ui)',
      color: 'var(--text-secondary)',
      marginTop: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, m.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    status: m.status,
    dense: true
  }, m.statusLabel || m.due))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Amount, {
    value: m.amount,
    size: "sm",
    tone: m.status === 'overdue' ? 'risk' : 'default'
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: "var(--text-tertiary)"
  }))));
}
function HomeBento({
  onOpen,
  onMarkPaid,
  onNudge,
  onAddDeal,
  onRoute,
  lang = 'en'
}) {
  const t = STRINGS[lang];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home2-head glass"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, t.today), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 22px var(--font-display)',
      letterSpacing: '-.02em',
      marginTop: 1
    }
  }, t.greeting)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 21
    }),
    label: "Search",
    onClick: () => onRoute('deals')
  }), /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    onClick: () => onRoute('profile'),
    style: {
      cursor: 'pointer'
    }
  }, "YF"))), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "focus-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "focus-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow",
    style: {
      color: 'var(--amber-600)'
    }
  }, "Do this first"), /*#__PURE__*/React.createElement(StatusPill, {
    status: "overdue",
    dense: true
  }, "Overdue 6 days")), /*#__PURE__*/React.createElement("div", {
    className: "focus-title"
  }, "Creek Gate \xB7 3rd installment"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Amount, {
    value: 98000,
    size: "lg",
    tone: "risk"
  })), /*#__PURE__*/React.createElement("div", {
    className: "focus-actions"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "check-check",
      size: 18
    }),
    onClick: () => onMarkPaid(DEALS[1])
  }, "Mark paid"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "message-circle",
      size: 18
    }),
    onClick: () => onNudge(DEALS[1])
  }, "Nudge"))), /*#__PURE__*/React.createElement("div", {
    className: "bento"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tile hero span2",
    onClick: () => onRoute('spaReview')
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--jade-200)'
    }
  }, t.dueThisWeek), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7
    }
  }, /*#__PURE__*/React.createElement(Amount, {
    value: 148000,
    size: "xl"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 13,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "hero-chip"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--overdue)'
    }
  }), "1 overdue"), /*#__PURE__*/React.createElement("span", {
    className: "hero-chip"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--due)'
    }
  }), "1 due soon"), /*#__PURE__*/React.createElement("span", {
    className: "hero-chip"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--amber-300)'
    }
  }), "1 in grace")), /*#__PURE__*/React.createElement("div", {
    className: "mini-line"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mini-done"
  }), /*#__PURE__*/React.createElement("div", {
    className: "mini-now"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "tile stat",
    onClick: () => onOpen('creek')
  }, /*#__PURE__*/React.createElement("span", {
    className: "tile-ico over"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "alert-circle",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "tile-num",
    style: {
      color: 'var(--overdue)'
    }
  }, "AED 98k"), /*#__PURE__*/React.createElement("div", {
    className: "tile-lbl"
  }, "1 overdue payment")), /*#__PURE__*/React.createElement("button", {
    className: "tile stat",
    onClick: () => onOpen('palm')
  }, /*#__PURE__*/React.createElement("span", {
    className: "tile-ico grace"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "hourglass",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "tile-num"
  }, "12 days"), /*#__PURE__*/React.createElement("div", {
    className: "tile-lbl"
  }, "1 in grace \xB7 Oqood")), /*#__PURE__*/React.createElement("button", {
    className: "tile wide span2 risk",
    onClick: () => onRoute('risk')
  }, /*#__PURE__*/React.createElement("span", {
    className: "risk-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-alert",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      textAlign: 'start'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 14px var(--font-ui)',
      display: 'block'
    }
  }, "Creek Gate is at risk"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12.5px var(--font-ui)',
      opacity: .92
    }
  }, "Act now \u2014 assignment still possible before a default notice.")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "tile stat",
    onClick: () => onRoute('commission')
  }, /*#__PURE__*/React.createElement("span", {
    className: "tile-ico jade"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "banknote",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "tile-num",
    style: {
      color: 'var(--action)'
    }
  }, "AED 30k"), /*#__PURE__*/React.createElement("div", {
    className: "tile-lbl"
  }, "Commission pipeline")), /*#__PURE__*/React.createElement("button", {
    className: "tile stat",
    onClick: () => onOpen('marina')
  }, /*#__PURE__*/React.createElement("span", {
    className: "tile-ico amber"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "hard-hat",
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "tile-num"
  }, "38%"), /*#__PURE__*/React.createElement("div", {
    className: "tile-lbl"
  }, "Avg construction"))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Needs you"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--action)'
    }
  }, "swipe a row \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(NeedRow, {
    deal: DEALS[1],
    onOpen: onOpen,
    onMarkPaid: onMarkPaid,
    onNudge: onNudge,
    hint: true
  }), /*#__PURE__*/React.createElement(NeedRow, {
    deal: DEALS[0],
    onOpen: onOpen,
    onMarkPaid: onMarkPaid,
    onNudge: onNudge
  }), /*#__PURE__*/React.createElement(NeedRow, {
    deal: DEALS[2],
    onOpen: onOpen,
    onMarkPaid: onMarkPaid,
    onNudge: onNudge
  })), /*#__PURE__*/React.createElement("div", {
    className: "guardrail",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Oqood for Palm Beach Towers is due within 90 days of the SPA \u2014 ", /*#__PURE__*/React.createElement("b", null, "41 days left"), ". ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, "Not legal advice."))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}
Object.assign(window, {
  HomeBento
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-home2.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-misc.jsx
try { (() => {
/* Meridian UI kit — onboarding (auth → terms → context), add-deal chooser,
   nudge composer, notification primer, settings. */
const {
  Button,
  IconButton,
  Input,
  Checkbox,
  Switch,
  SegmentedControl,
  Card,
  Badge,
  AppHeader,
  Sheet,
  Avatar
} = window.MeridianDesignSystem_f018d0;
const Logo = ({
  size = 40,
  dark
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none",
  style: {
    color: dark ? '#9CD0C1' : 'var(--jade-500)'
  }
}, /*#__PURE__*/React.createElement("circle", {
  cx: "24",
  cy: "24",
  r: "18",
  stroke: "currentColor",
  strokeWidth: "3"
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "24",
  x2: "42",
  y2: "24",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "24",
  y1: "4",
  x2: "24",
  y2: "11",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "33",
  cy: "24",
  r: "5",
  fill: "#E0922F"
}));

/* ---------- Passwordless auth ---------- */
function AuthScreen({
  onContinue
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen auth"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auth-top"
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 44,
    dark: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 26px var(--font-display)',
      color: '#ECF3F0',
      letterSpacing: '-.02em'
    }
  }, "Meridian"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 15px var(--font-ui)',
      color: 'var(--jade-200)',
      margin: '6px 0 0',
      maxWidth: 260
    }
  }, "The off-plan deal OS. From SPA to handover, never miss a milestone.")), /*#__PURE__*/React.createElement("div", {
    className: "auth-card"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    placeholder: "you@brokerage.ae",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 18,
      color: "var(--text-tertiary)"
    })
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    rightIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 20
    }),
    onClick: onContinue
  }, "Send magic link"), /*#__PURE__*/React.createElement("div", {
    className: "auth-or"
  }, /*#__PURE__*/React.createElement("span", null, "or")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "scan-face",
      size: 19
    }),
    onClick: onContinue
  }, "Face ID"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "building-2",
      size: 19
    }),
    onClick: onContinue
  }, "SSO")), /*#__PURE__*/React.createElement("p", {
    className: "auth-fine"
  }, "No passwords. We email a one-tap link; Face ID for return visits.")));
}

/* ---------- Age + terms gate ---------- */
function TermsGate({
  onContinue
}) {
  const [age, setAge] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen pad"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 36
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '700 24px var(--font-display)',
      letterSpacing: '-.02em',
      margin: 0
    }
  }, "Before we start"), /*#__PURE__*/React.createElement(Card, {
    tone: "sunk",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: age,
    onChange: setAge
  }, "I confirm I'm 18 or older."), /*#__PURE__*/React.createElement(Checkbox, {
    checked: terms,
    onChange: setTerms
  }, "I accept the ", /*#__PURE__*/React.createElement("b", null, "Terms of Service"), " and ", /*#__PURE__*/React.createElement("b", null, "Privacy Policy"), " (PDPL compliant)."))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    disabled: !(age && terms),
    onClick: onContinue
  }, "Continue"));
}

/* ---------- One context question ---------- */
function Onboarding({
  onContinue
}) {
  const [role, setRole] = React.useState('independent');
  const opts = [{
    v: 'independent',
    t: 'Independent broker',
    d: 'Just me and my book of deals',
    i: 'user'
  }, {
    v: 'agency',
    t: 'At an agency',
    d: 'Part of a brokerage team',
    i: 'users'
  }, {
    v: 'manager',
    t: 'Team manager',
    d: 'I oversee other agents',
    i: 'briefcase'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen pad"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "One quick thing"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: '700 24px var(--font-display)',
      letterSpacing: '-.02em',
      margin: '4px 0 18px'
    }
  }, "How do you work?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.v,
    className: 'pick' + (role === o.v ? ' on' : ''),
    onClick: () => setRole(o.v)
  }, /*#__PURE__*/React.createElement("span", {
    className: "pick-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: o.i,
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'start'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 15px var(--font-ui)',
      display: 'block'
    }
  }, o.t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, o.d)), /*#__PURE__*/React.createElement("span", {
    className: "radio"
  }, role === o.v && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    color: "#fff"
  })))))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onContinue
  }, "Take me in"));
}

/* ---------- Add deal chooser ---------- */
function AddDealSheet({
  onClose,
  onUpload,
  onManual
}) {
  return /*#__PURE__*/React.createElement(Sheet, {
    open: true,
    title: "Add a deal",
    subtitle: "Build the payment plan in under a minute",
    onClose: onClose,
    headerRight: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "x",
        size: 20
      }),
      label: "Close",
      onClick: onClose
    })
  }, /*#__PURE__*/React.createElement("button", {
    className: "chooser primary",
    onClick: onUpload
  }, /*#__PURE__*/React.createElement("span", {
    className: "chooser-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-up",
    size: 24
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'start'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Upload the SPA"), /*#__PURE__*/React.createElement("span", null, "AI reads the price, plan, escrow & milestones \u2014 you confirm each.")), /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "Fastest")), /*#__PURE__*/React.createElement("button", {
    className: "chooser",
    onClick: onManual
  }, /*#__PURE__*/React.createElement("span", {
    className: "chooser-ico alt"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil-line",
    size: 24
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'start'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Enter manually"), /*#__PURE__*/React.createElement("span", null, "Type the plan yourself. Good for a deal with no PDF yet."))), /*#__PURE__*/React.createElement("div", {
    className: "upload-note",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 16
  }), " Or import existing deals \u2014 runs in the background, never blocks you."));
}

/* ---------- Notification primer (soft-ask at first value moment) ---------- */
function NotificationPrimer({
  onClose,
  onEnable
}) {
  return /*#__PURE__*/React.createElement(Sheet, {
    open: true,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "primer-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell-ring",
    size: 28
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: '700 21px var(--font-display)',
      margin: 0,
      letterSpacing: '-.01em'
    }
  }, "Want a heads-up before each milestone?"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 14.5px var(--font-ui)',
      color: 'var(--text-secondary)',
      margin: 0,
      maxWidth: 300
    }
  }, "We'll only ping you when ", /*#__PURE__*/React.createElement("b", null, "money or dates move"), " \u2014 a milestone due, an overdue installment, the grace window closing. Quiet hours on by default."), /*#__PURE__*/React.createElement("div", {
    className: "primer-cadence"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar-clock",
    size: 15
  }), " 7 / 3 / 1-day reminders"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 15
  }), " Quiet 9pm\u20138am")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    onClick: onEnable
  }, "Turn on reminders"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    onClick: onClose
  }, "Not now")));
}

/* ---------- Nudge composer ---------- */
function NudgeComposer({
  deal,
  onClose,
  onSend,
  lang = 'en'
}) {
  const d = deal || DEALS[0];
  const [tlang, setTlang] = React.useState(lang);
  const [channel, setChannel] = React.useState('whatsapp');
  const body = {
    en: `Hi ${d.buyer.split(' ')[0]} — a reminder that your DLD registration fee (${AED(d.next.amount)}) for ${d.project} ${d.unit} is due on 28 Jun. Happy to help with the escrow transfer. — Yousef`,
    ar: `مرحباً ${d.buyer.split(' ')[0]} — تذكير بأن رسوم تسجيل دائرة الأراضي (${AED(d.next.amount)}) لـ ${d.project} ${d.unit} مستحقة في ٢٨ يونيو. يسعدني مساعدتك في التحويل لحساب الضمان. — يوسف`
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    open: true,
    title: "Nudge the buyer",
    subtitle: `${d.buyer} · ${d.project}`,
    onClose: onClose,
    headerRight: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "x",
        size: 20
      }),
      label: "Close",
      onClick: onClose
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    value: channel,
    onChange: setChannel,
    options: [{
      value: 'whatsapp',
      label: 'WhatsApp'
    }, {
      value: 'push',
      label: 'In-app'
    }, {
      value: 'email',
      label: 'Email'
    }]
  }), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: tlang,
    onChange: setTlang,
    options: [{
      value: 'en',
      label: 'EN'
    }, {
      value: 'ar',
      label: 'AR'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: 'nudge-preview' + (tlang === 'ar' ? ' rtl' : ''),
    dir: tlang === 'ar' ? 'rtl' : 'ltr'
  }, body[tlang]), channel === 'whatsapp' && /*#__PURE__*/React.createElement("div", {
    className: "upload-note",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 15
  }), " Consent-first WhatsApp Utility template. Buyer opted in 12 Mar."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    style: {
      marginTop: 14
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 18
    }),
    onClick: onSend
  }, "Send nudge"));
}

/* ---------- Settings ---------- */
function Settings({
  onBack,
  lang,
  onLang,
  theme,
  onTheme
}) {
  const [push, setPush] = React.useState(true);
  const [quiet, setQuiet] = React.useState(true);
  const [lock, setLock] = React.useState(true);
  const [wa, setWa] = React.useState(true);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    title: "Settings",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(SettingsGroup, {
    label: "Language & display"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "languages",
    size: 19
  }), " Language"), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: lang,
    onChange: onLang,
    options: [{
      value: 'en',
      label: 'EN'
    }, {
      value: 'ar',
      label: 'العربية'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    className: "set-row"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 19
  }), " Theme"), /*#__PURE__*/React.createElement(SegmentedControl, {
    value: theme,
    onChange: onTheme,
    options: [{
      value: 'light',
      label: 'Light'
    }, {
      value: 'dark',
      label: 'Dark'
    }]
  }))), /*#__PURE__*/React.createElement(SettingsGroup, {
    label: "Notifications"
  }, /*#__PURE__*/React.createElement(SetToggle, {
    icon: "bell",
    title: "Push reminders",
    sub: "7 / 3 / 1-day before each milestone",
    on: push,
    set: setPush
  }), /*#__PURE__*/React.createElement(SetToggle, {
    icon: "moon",
    title: "Quiet hours",
    sub: "9:00pm \u2013 8:00am",
    on: quiet,
    set: setQuiet
  }), /*#__PURE__*/React.createElement(SetToggle, {
    icon: "message-circle",
    title: "WhatsApp escalation",
    sub: "Grace window \u2192 WhatsApp Utility",
    on: wa,
    set: setWa
  })), /*#__PURE__*/React.createElement(SettingsGroup, {
    label: "Security"
  }, /*#__PURE__*/React.createElement(SetToggle, {
    icon: "lock",
    title: "App lock",
    sub: "Require Face ID to open",
    on: lock,
    set: setLock
  })), /*#__PURE__*/React.createElement(SettingsGroup, {
    label: "Account"
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-link"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 19
  }), " RERA broker card"), /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "Valid \xB7 exp. Nov 2026")), /*#__PURE__*/React.createElement("button", {
    className: "set-link danger"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "trash-2",
    size: 19
  }), " Delete account & data"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-tertiary)',
      textAlign: 'center',
      padding: '4px 0 16px'
    }
  }, "Meridian \xB7 data stored per UAE PDPL")));
}
function SettingsGroup({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--sp-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      padding: '0 4px 8px'
    }
  }, label), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '4px 14px'
    }
  }, children));
}
function SetToggle({
  icon,
  title,
  sub,
  on,
  set
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "set-row tall"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: "var(--text-secondary)"
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 15px var(--font-ui)',
      display: 'block'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12.5px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, sub))), /*#__PURE__*/React.createElement(Switch, {
    checked: on,
    onChange: set,
    label: title
  }));
}
Object.assign(window, {
  AuthScreen,
  TermsGate,
  Onboarding,
  AddDealSheet,
  NotificationPrimer,
  NudgeComposer,
  Settings
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-misc.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-money-risk.jsx
try { (() => {
/* Meridian UI kit — money & risk roadmap: commission ledger, Article-11 risk
   monitor, team/agency dashboard. */
const {
  Button,
  IconButton,
  Card,
  StatusPill,
  Badge,
  Amount,
  ProgressMeter,
  Avatar,
  AppHeader
} = window.MeridianDesignSystem_f018d0;

/* ---------- Commission ledger ---------- */
function CommissionLedger({
  onBack
}) {
  const payouts = [{
    t: 'On booking (25%)',
    when: 'Paid · 20 Mar 2026',
    amt: 7500,
    status: 'paid'
  }, {
    t: 'On DLD (25%)',
    when: 'Due · Q3 2026',
    amt: 7500,
    status: 'due',
    label: 'Owed'
  }, {
    t: 'On 50% build (25%)',
    when: 'est. Q2 2027',
    amt: 7500,
    status: 'upcoming'
  }, {
    t: 'On handover (25%)',
    when: 'est. Q3 2028 · deferred',
    amt: 7500,
    status: 'upcoming'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "Marina Vista \xB7 1204",
    title: "Commission",
    onBack: onBack,
    bordered: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "download",
        size: 22
      }),
      label: "Export"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--jade-200)'
    }
  }, "Expected gross \xB7 2.4% of price"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Amount, {
    value: 30000,
    size: "xl"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px var(--font-ui)',
      color: 'var(--jade-200)'
    }
  }, "Paid"), /*#__PURE__*/React.createElement(Amount, {
    value: 7500,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px var(--font-ui)',
      color: 'var(--jade-200)'
    }
  }, "Owed"), /*#__PURE__*/React.createElement(Amount, {
    value: 7500,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px var(--font-ui)',
      color: 'var(--jade-200)'
    }
  }, "Upcoming"), /*#__PURE__*/React.createElement(Amount, {
    value: 15000,
    size: "sm"
  })))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 14px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "Your split"), /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 15px var(--font-ui)'
    }
  }, "50% agent \xB7 50% brokerage")), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Developer payout schedule")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 14px'
    }
  }, payouts.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ledger-row"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 14px var(--font-ui)',
      display: 'block'
    }
  }, p.t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, p.when)), p.status === 'paid' ? /*#__PURE__*/React.createElement(StatusPill, {
    status: "paid",
    dense: true
  }, "Paid") : p.status === 'due' ? /*#__PURE__*/React.createElement(StatusPill, {
    status: "due",
    dense: true
  }, p.label) : null, /*#__PURE__*/React.createElement(Amount, {
    value: p.amt,
    size: "sm",
    tone: p.status === 'paid' ? 'paid' : p.status === 'upcoming' ? 'muted' : 'default'
  })))), /*#__PURE__*/React.createElement("div", {
    className: "risk-banner",
    style: {
      marginTop: 12,
      background: 'var(--due-bg)',
      borderColor: 'var(--accent)',
      color: 'var(--amber-700)',
      backgroundImage: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "risk-ico",
    style: {
      background: 'var(--amber-500)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 14px var(--font-ui)',
      display: 'block'
    }
  }, "1 payout aging"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12.5px var(--font-ui)'
    }
  }, "DLD tranche 40 days past developer SLA \u2014 chase Emaar."))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    style: {
      marginTop: 12
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "file-down",
      size: 18
    })
  }, "Export RERA dispute pack"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Risk / Article-11 monitor ---------- */
function RiskPanel({
  onBack
}) {
  const tiers = [{
    range: '< 25% built',
    forfeit: 'up to 30% retained',
    active: false
  }, {
    range: '25–50% built',
    forfeit: 'up to 40% retained',
    active: true
  }, {
    range: '> 50% built',
    forfeit: 'developer may sell + 40%',
    active: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "Creek Gate \xB7 808",
    title: "Risk monitor",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      borderColor: 'var(--critical)',
      background: 'var(--critical-bg)',
      backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(163,35,27,.05) 8px,rgba(163,35,27,.05) 16px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "risk-ico",
    style: {
      background: 'var(--critical)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-alert",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 16px var(--font-display)',
      color: 'var(--critical-text)'
    }
  }, "Buyer default \u2014 Article 11"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--critical-text)'
    }
  }, "3rd installment overdue 6 days"))), /*#__PURE__*/React.createElement("div", {
    className: "cure-clock"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 30px var(--font-display)',
      color: 'var(--critical-text)'
    }
  }, "24"), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--critical-text)'
    }
  }, "days left in cure")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "neutral",
    value: 20,
    showValue: false,
    label: "30-day cure clock"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "risk-banner",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "risk-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 14px var(--font-ui)',
      display: 'block'
    }
  }, "Act now"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12.5px var(--font-ui)'
    }
  }, "Assignment is still possible before a default notice is filed."))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Forfeiture tiers \xB7 by completion %")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 0'
    }
  }, tiers.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ladder-row",
    style: {
      background: t.active ? 'var(--overdue-bg)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: 'ladder-dot' + (t.active ? ' crit' : '')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layers",
    size: 15
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 14px var(--font-ui)',
      display: 'block',
      color: t.active ? 'var(--overdue-text)' : 'var(--text-primary)'
    }
  }, t.range), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, t.forfeit)), t.active && /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    soft: true
  }, "You're here \xB7 55%")))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Compliance checks")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-link",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar-clock",
    size: 18,
    color: "var(--amber-600)"
  }), " Oqood window"), /*#__PURE__*/React.createElement(Badge, {
    tone: "amber",
    soft: true
  }, "41 days left")), /*#__PURE__*/React.createElement("div", {
    className: "set-link",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "landmark",
    size: 18,
    color: "var(--action)"
  }), " Escrow verified"), /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "OK")), /*#__PURE__*/React.createElement("div", {
    className: "set-link",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 18,
    color: "var(--action)"
  }), " RERA card"), /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "Valid"))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px var(--font-ui)',
      color: 'var(--text-tertiary)',
      textAlign: 'center',
      marginTop: 12
    }
  }, "Guardrails, not legal advice. Confirm with your legal team."), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Team / agency dashboard ---------- */
function TeamDashboard({
  onBack
}) {
  const agents = [{
    n: 'Yousef Farouk',
    i: 'YF',
    deals: 12,
    aed: '18.4M',
    risk: 1
  }, {
    n: 'Layla Hassan',
    i: 'LH',
    deals: 9,
    aed: '12.1M',
    risk: 0
  }, {
    n: 'Omar Said',
    i: 'OS',
    deals: 7,
    aed: '21.7M',
    risk: 2
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "Horizon Realty",
    title: "Team",
    onBack: onBack,
    bordered: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "sliders-horizontal",
        size: 22
      }),
      label: "Filter"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat-grid"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: 'center',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 20px var(--font-display)',
      color: 'var(--action)'
    }
  }, "28"), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginTop: 4
    }
  }, "Active deals")), /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: 'center',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 20px var(--font-display)'
    }
  }, "52M"), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginTop: 4
    }
  }, "AED pipeline")), /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: 'center',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 20px var(--font-display)',
      color: 'var(--overdue)'
    }
  }, "3"), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginTop: 4
    }
  }, "At risk"))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Commission pipeline")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "payment",
    label: "Collected this quarter \xB7 AED 124,000 of 310,000",
    value: 40
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Agents")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 14px'
    }
  }, agents.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ledger-row"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: a.n,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 14px var(--font-ui)',
      display: 'block'
    }
  }, a.n), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, a.deals, " deals \xB7 AED ", a.aed)), a.risk > 0 ? /*#__PURE__*/React.createElement(StatusPill, {
    status: "atrisk",
    dense: true
  }, a.risk, " at risk") : /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "On track")))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    style: {
      marginTop: 14
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "inbox",
      size: 18
    })
  }, "Lead pool \xB7 6 unassigned"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}
Object.assign(window, {
  CommissionLedger,
  RiskPanel,
  TeamDashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-money-risk.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-relationship.jsx
try { (() => {
/* Meridian UI kit — relationship & growth: client record, broker profile,
   shareable client portal, handover/snagging, assignment desk. */
const {
  Button,
  IconButton,
  Card,
  StatusPill,
  Badge,
  Amount,
  Avatar,
  ProgressMeter,
  Checkbox,
  AppHeader
} = window.MeridianDesignSystem_f018d0;

/* ---------- Client / buyer record ---------- */
function ClientRecord({
  onBack,
  onNudge
}) {
  const d = DEALS[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    title: "Client",
    onBack: onBack,
    bordered: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ellipsis",
        size: 22
      }),
      label: "More"
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '8px 0 4px'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: d.buyer,
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 22px var(--font-display)',
      letterSpacing: '-.01em'
    }
  }, d.buyer), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    dot: true
  }, "WhatsApp opted-in"), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    soft: true
  }, "Prefers Arabic"))), /*#__PURE__*/React.createElement("div", {
    className: "quick-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "qa"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "phone",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Call")), /*#__PURE__*/React.createElement("button", {
    className: "qa"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "message-circle",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "WhatsApp")), /*#__PURE__*/React.createElement("button", {
    className: "qa",
    onClick: () => onNudge(d)
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Nudge")), /*#__PURE__*/React.createElement("button", {
    className: "qa"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "share-2",
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, "Portal"))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Relationship")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-row",
    style: {
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 14px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "Reliability"), /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "Pays on time \xB7 4/4")), /*#__PURE__*/React.createElement("div", {
    className: "set-row",
    style: {
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 14px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "Next touchpoint"), /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 14px var(--font-ui)'
    }
  }, "Handover \xB7 Q3 2028")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px/1.5 var(--font-ui)',
      color: 'var(--text-secondary)',
      background: 'var(--surface-sunk)',
      padding: 12,
      borderRadius: 'var(--r-sm)'
    }
  }, "\"Considering a second unit in Creek for his brother. Follow up after DLD payment clears.\" \u2014 note, 14 May")), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Deals \xB7 1")), /*#__PURE__*/React.createElement(Card, {
    as: "div",
    interactive: true,
    role: "button",
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 15px var(--font-display)'
    }
  }, d.project), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, d.unit)), /*#__PURE__*/React.createElement(StatusPill, {
    status: "due",
    dense: true
  }, "Due in 3 days")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Broker profile ---------- */
function Profile({
  onBack,
  onSettings
}) {
  const stats = [['Deals', '12'], ['AED tracked', '18.4M'], ['On-time', '94%']];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    title: "Profile",
    onBack: onBack,
    bordered: true,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "settings",
        size: 22
      }),
      label: "Settings",
      onClick: onSettings
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      padding: '8px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "avatar",
    style: {
      width: 72,
      height: 72,
      fontSize: 24
    }
  }, "YF"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 22px var(--font-display)'
    }
  }, "Yousef Farouk"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "Independent broker \xB7 Dubai")), /*#__PURE__*/React.createElement("div", {
    className: "stat-grid"
  }, stats.map(([l, v]) => /*#__PURE__*/React.createElement(Card, {
    key: l,
    style: {
      textAlign: 'center',
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 22px var(--font-display)',
      color: 'var(--action)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginTop: 4
    }
  }, l)))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Compliance")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "set-link",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "badge-check",
    size: 19,
    color: "var(--action)"
  }), " RERA broker card"), /*#__PURE__*/React.createElement(Badge, {
    tone: "jade",
    soft: true
  }, "Valid \xB7 Nov 2026")), /*#__PURE__*/React.createElement("div", {
    className: "set-link",
    style: {
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "building-2",
    size: 19
  }), " Brokerage"), /*#__PURE__*/React.createElement("b", {
    style: {
      font: '500 14px var(--font-ui)'
    }
  }, "Independent"))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    style: {
      marginTop: 16
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "log-out",
      size: 18
    })
  }, "Sign out"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Shareable client portal (read-only, client-facing) ---------- */
function ClientPortal({
  onBack
}) {
  const d = DEALS[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "portal-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "portal-bar"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 48 48",
    fill: "none",
    style: {
      color: '#9CD0C1'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "24",
    cy: "24",
    r: "18",
    stroke: "currentColor",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "24",
    x2: "42",
    y2: "24",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "24",
    y1: "4",
    x2: "24",
    y2: "11",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "33",
    cy: "24",
    r: "5",
    fill: "#E0922F"
  })), /*#__PURE__*/React.createElement("b", {
    style: {
      font: '700 15px var(--font-display)',
      color: '#ECF3F0'
    }
  }, "Meridian")), /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 20,
      color: "#9CD0C1"
    }),
    label: "Close",
    onClick: onBack
  })), /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--jade-200)'
    }
  }, "Your unit \xB7 shared by Yousef"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 24px var(--font-display)',
      color: '#fff',
      marginTop: 4
    }
  }, d.project), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 14px var(--font-ui)',
      color: 'var(--jade-200)'
    }
  }, d.unit, " \xB7 ", d.developer)), /*#__PURE__*/React.createElement("div", {
    className: "scroll",
    style: {
      marginTop: -22
    }
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "construction",
    label: "Construction progress",
    value: d.constructionPct
  }), /*#__PURE__*/React.createElement(ProgressMeter, {
    variant: "payment",
    label: "You've paid",
    value: d.paidPct
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderColor: 'var(--accent)',
      background: 'var(--due-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--amber-700)'
    }
  }, "Next payment"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 15px var(--font-display)',
      marginTop: 3
    }
  }, "DLD registration \xB7 28 Jun")), /*#__PURE__*/React.createElement(Amount, {
    value: 50000,
    size: "md"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Payments")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "portal-row"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 15,
    color: "var(--paid)"
  }), " Booking deposit"), /*#__PURE__*/React.createElement(Amount, {
    value: 250000,
    size: "sm",
    tone: "paid"
  })), /*#__PURE__*/React.createElement("div", {
    className: "portal-row"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber-700)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 15
  }), " DLD registration"), /*#__PURE__*/React.createElement(Amount, {
    value: 50000,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    className: "portal-row muted"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "circle",
    size: 15
  }), " Construction (3 milestones)"), /*#__PURE__*/React.createElement(Amount, {
    value: 750000,
    size: "sm",
    tone: "muted"
  })), /*#__PURE__*/React.createElement("div", {
    className: "portal-row muted"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "circle",
    size: 15
  }), " Handover"), /*#__PURE__*/React.createElement(Amount, {
    value: 500000,
    size: "sm",
    tone: "muted"
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    style: {
      marginTop: 14
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "message-circle",
      size: 18
    })
  }, "Message Yousef"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 11px var(--font-ui)',
      color: 'var(--text-tertiary)',
      textAlign: 'center',
      marginTop: 10
    }
  }, "Read-only view \xB7 figures provided by your broker"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Handover & snagging ---------- */
function HandoverSnagging({
  onBack
}) {
  const [snags, setSnags] = React.useState({
    a: true,
    b: false,
    c: false
  });
  const steps = [{
    t: 'Final payment cleared',
    done: true
  }, {
    t: 'Snagging inspection',
    done: true
  }, {
    t: 'Developer fixes',
    done: false,
    active: true
  }, {
    t: 'DLD title transfer',
    done: false
  }, {
    t: 'Keys handed over',
    done: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "Marina Vista \xB7 1204",
    title: "Handover",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "ink"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--jade-200)'
    }
  }, "Estimated handover"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 24px var(--font-display)',
      marginTop: 4
    }
  }, "Q3 2028"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--jade-200)',
      marginTop: 2
    }
  }, "3 of 5 handover steps complete")), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Handover steps")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 0'
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ladder-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'ladder-dot' + (s.done ? ' done' : s.active ? ' next' : '')
  }, s.done ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    color: "#fff"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)'
    }
  }, i + 1)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '500 14px var(--font-ui)',
      color: s.done ? 'var(--text-secondary)' : 'var(--text-primary)'
    }
  }, s.t), s.active && /*#__PURE__*/React.createElement(Badge, {
    tone: "amber",
    soft: true
  }, "In progress")))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Snag list \xB7 3"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--action)'
    }
  }, "Add snag")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: snags.a,
    onChange: v => setSnags({
      ...snags,
      a: v
    })
  }, "Master bath \u2014 silicone sealant gap"), /*#__PURE__*/React.createElement(Checkbox, {
    checked: snags.b,
    onChange: v => setSnags({
      ...snags,
      b: v
    })
  }, "Living room \u2014 scratched glazing panel"), /*#__PURE__*/React.createElement(Checkbox, {
    checked: snags.c,
    onChange: v => setSnags({
      ...snags,
      c: v
    })
  }, "Kitchen \u2014 cabinet door misaligned")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}

/* ---------- Assignment / resale desk ---------- */
function AssignmentDesk({
  onBack
}) {
  const d = DEALS[0];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "Marina Vista \xB7 1204",
    title: "Assignment",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      borderColor: 'var(--paid)',
      background: 'var(--paid-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pick-ico",
    style: {
      background: 'var(--paid)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-check",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 15px var(--font-ui)',
      color: 'var(--paid-text)'
    }
  }, "NOC eligible"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--paid-text)'
    }
  }, d.paidPct, "% paid \u2014 above the developer's 30% threshold")))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Estimated assignment value")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Original price"), /*#__PURE__*/React.createElement(Amount, {
    value: d.totalPrice,
    size: "sm",
    tone: "muted"
  })), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 18,
    color: "var(--text-tertiary)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--action)'
    }
  }, "Market est."), /*#__PURE__*/React.createElement(Amount, {
    value: 1410000,
    size: "md",
    tone: "paid"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "eyebrow"
  }, "Assignment steps")), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: '6px 0'
    }
  }, [['Confirm NOC eligibility', true], ['Request developer NOC', false], ['Find assignee buyer', false], ['DLD transfer & new SPA', false]].map(([t, done], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "ladder-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: 'ladder-dot' + (done ? ' done' : '')
  }, done ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    color: "#fff"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)'
    }
  }, i + 1)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '500 14px var(--font-ui)'
    }
  }, t)))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    style: {
      marginTop: 14
    },
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "file-text",
      size: 18
    })
  }, "Request developer NOC"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })));
}
Object.assign(window, {
  ClientRecord,
  Profile,
  ClientPortal,
  HandoverSnagging,
  AssignmentDesk
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-relationship.jsx", error: String((e && e.message) || e) }); }

// ui_kits/meridian-app/screens-states.jsx
try { (() => {
/* Meridian UI kit — states: empty (all caught up), offline, error,
   scanned-PDF failure (manual fallback with the PDF still visible). */
const {
  Button,
  IconButton,
  Card,
  Badge,
  AppHeader
} = window.MeridianDesignSystem_f018d0;

/* ---------- Empty — all caught up (never a blank screen) ---------- */
function EmptyDue({
  onAddDeal
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Tue \xB7 23 Jun"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 24px var(--font-display)',
      letterSpacing: '-.02em',
      marginTop: 2
    }
  }, "Morning, Yousef")), /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }, "YF")), /*#__PURE__*/React.createElement("div", {
    className: "state-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-art"
  }, /*#__PURE__*/React.createElement("div", {
    className: "empty-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "empty-dot"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 20px var(--font-display)'
    }
  }, "Nothing due today"), /*#__PURE__*/React.createElement("p", null, "You're ahead. Next milestone is the DLD fee on ", /*#__PURE__*/React.createElement("b", null, "28 Jun"), " \u2014 we'll remind you 3 days before."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 18
    }),
    onClick: onAddDeal
  }, "Add a deal")));
}

/* ---------- Offline ---------- */
function OfflineState({
  onRetry
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "offline-strip"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "cloud-off",
    size: 16
  }), " You're offline \u2014 showing your last sync (9:12am)"), /*#__PURE__*/React.createElement("div", {
    className: "home-top"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Tue \xB7 23 Jun"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 24px var(--font-display)',
      marginTop: 2
    }
  }, "What's due")), /*#__PURE__*/React.createElement("span", {
    className: "avatar"
  }, "YF")), /*#__PURE__*/React.createElement("div", {
    className: "scroll"
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      opacity: .6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 15px var(--font-display)'
    }
  }, "Marina Vista"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '500 13px var(--font-mono)'
    }
  }, "AED 50,000")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "DLD fee \xB7 cached")), /*#__PURE__*/React.createElement("div", {
    className: "queued"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", null, "1 action queued."), " Your \"Mark paid\" will sync when you're back online.")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw",
      size: 18
    }),
    onClick: onRetry
  }, "Try to reconnect")));
}

/* ---------- Generic error ---------- */
function ErrorState({
  onRetry
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    title: "",
    onBack: onRetry,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "state-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "state-ico err"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "unplug",
    size: 30
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 20px var(--font-display)'
    }
  }, "That didn't load"), /*#__PURE__*/React.createElement("p", null, "We couldn't reach your deals just now. Your data is safe \u2014 nothing was lost."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw",
      size: 18
    }),
    onClick: onRetry
  }, "Try again"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Get help"))));
}

/* ---------- Scanned-PDF failure — manual fallback, PDF stays visible ---------- */
function ScanFailed({
  onBack,
  onManual
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement(AppHeader, {
    eyebrow: "New deal \xB7 SPA",
    title: "Couldn't read it",
    onBack: onBack,
    bordered: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "pdf-pane"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pdf"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pdf-bar"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Icon, {
    name: "file-text",
    size: 14
  }), " scanned-spa-p3.pdf"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--overdue-text)'
    }
  }, "low quality")), /*#__PURE__*/React.createElement("div", {
    className: "pdf-page",
    style: {
      filter: 'blur(1.5px)',
      opacity: .65
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pdf-h"
  }, "SALE & PURCHASE AGREEMENT"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\u2593\u2593\u2593\u2593\u2593 \u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593\u2593\u2593 \u2593\u2593 \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593 \u2593\u2593\u2593\u2593 \u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593\u2593"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593 \u2593\u2593 \u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593\u2593"), /*#__PURE__*/React.createElement("p", {
    className: "pdf-l"
  }, "\u2593\u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593 \u2593\u2593\u2593\u2593\u2593\u2593\u2593\u2593 \u2593\u2593\u2593 \u2593\u2593\u2593")))), /*#__PURE__*/React.createElement("div", {
    className: "scroll",
    style: {
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "validate",
    style: {
      background: 'var(--overdue-bg)',
      color: 'var(--overdue-text)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "scan-line",
    size: 17
  }), /*#__PURE__*/React.createElement("span", null, "This page scanned at low quality \u2014 we won't guess amounts. ", /*#__PURE__*/React.createElement("b", null, "Enter them manually"), "; the PDF stays beside you.")), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginTop: 12,
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "pick-ico"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil-line",
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 14px var(--font-ui)'
    }
  }, "Enter the plan manually"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 12.5px var(--font-ui)',
      color: 'var(--text-secondary)'
    }
  }, "Type each figure while you read the PDF above."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    leftIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "rotate-cw",
      size: 18
    })
  }, "Rescan page"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    onClick: onManual
  }, "Enter manually"))));
}
Object.assign(window, {
  EmptyDue,
  OfflineState,
  ErrorState,
  ScanFailed
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/meridian-app/screens-states.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ConfidenceCue = __ds_scope.ConfidenceCue;

__ds_ns.FieldReviewRow = __ds_scope.FieldReviewRow;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ProgressMeter = __ds_scope.ProgressMeter;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Sheet = __ds_scope.Sheet;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Amount = __ds_scope.Amount;

__ds_ns.MilestoneRow = __ds_scope.MilestoneRow;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
