import React from 'react';

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
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
}

export function Avatar({ name = '', src, size = 'md', ...rest }) {
  ensureCss();
  return (
    <span className="mer-av" data-size={size} aria-label={name} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}
