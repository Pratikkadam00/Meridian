/* Meridian 2026 — dark-first BENTO home with swipe-to-action rows.
   The daily-open heart of the app, rebuilt to the 2026 direction:
   bento overview grid, tactile depth, swipe gestures, glass chrome. */
const { Amount, StatusPill, Badge, Button, IconButton } = window.MeridianDesignSystem_f018d0;

/* swipe-to-reveal row (swipe ← to expose Mark paid / Nudge) */
function NeedRow({ deal, onOpen, onMarkPaid, onNudge, hint }) {
  const REVEAL = 132;
  const [dx, setDx] = React.useState(0);
  const start = React.useRef(null);
  const rtl = typeof document !== 'undefined' && document.dir === 'rtl';
  const clamp = (n) => rtl ? Math.min(REVEAL, Math.max(0, n)) : Math.max(-REVEAL, Math.min(0, n));
  const down = (e) => { start.current = e.clientX - dx; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (start.current == null) return; setDx(clamp(e.clientX - start.current)); };
  const up = () => { if (start.current == null) return; const open = Math.abs(dx) > REVEAL / 2; setDx(open ? (rtl ? REVEAL : -REVEAL) : 0); start.current = null; };
  const m = deal.next;
  return (
    <div className="swipe">
      <div className="swipe-actions" style={{ [rtl ? 'left' : 'right']: 0 }}>
        <button className="swa paid" onClick={() => { setDx(0); onMarkPaid(deal); }} aria-label="Mark paid"><Icon name="check-check" size={20} /></button>
        <button className="swa nudge" onClick={() => { setDx(0); onNudge(deal); }} aria-label="Nudge"><Icon name="message-circle" size={20} /></button>
      </div>
      <div className={'swipe-fg' + (hint && dx === 0 ? ' peek' : '')} style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onClick={() => dx === 0 && onOpen(deal.id)}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ font: '600 15px var(--font-display)' }}>{deal.project}</span>
            {deal.sample && <Badge tone="sample" soft>Sample</Badge>}
          </div>
          <div style={{ font: '400 12.5px var(--font-ui)', color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
          <div style={{ marginTop: 8 }}><StatusPill status={m.status} dense>{m.statusLabel || m.due}</StatusPill></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <Amount value={m.amount} size="sm" tone={m.status === 'overdue' ? 'risk' : 'default'} />
          <Icon name="chevron-right" size={16} color="var(--text-tertiary)" />
        </div>
      </div>
    </div>
  );
}

function HomeBento({ onOpen, onMarkPaid, onNudge, onAddDeal, onRoute, lang = 'en' }) {
  const t = STRINGS[lang];
  return (
    <div className="screen">
      <div className="home2-head glass">
        <div>
          <div className="eyebrow">{t.today}</div>
          <div style={{ font: '700 22px var(--font-display)', letterSpacing: '-.02em', marginTop: 1 }}>{t.greeting}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <IconButton icon={<Icon name="search" size={21} />} label="Search" onClick={() => onRoute('deals')} />
          <span className="avatar" onClick={() => onRoute('profile')} style={{ cursor: 'pointer' }}>YF</span>
        </div>
      </div>

      <div className="scroll">
        {/* Do this first — calm single-focus anchor (reduces overload; the rest stays below) */}
        <div className="focus-card">
          <div className="focus-top">
            <span className="eyebrow" style={{ color: 'var(--amber-600)' }}>Do this first</span>
            <StatusPill status="overdue" dense>Overdue 6 days</StatusPill>
          </div>
          <div className="focus-title">Creek Gate · 3rd installment</div>
          <div style={{ marginTop: 4 }}><Amount value={98000} size="lg" tone="risk" /></div>
          <div className="focus-actions">
            <Button variant="primary" fullWidth leftIcon={<Icon name="check-check" size={18} />} onClick={() => onMarkPaid(DEALS[1])}>Mark paid</Button>
            <Button variant="secondary" leftIcon={<Icon name="message-circle" size={18} />} onClick={() => onNudge(DEALS[1])}>Nudge</Button>
          </div>
        </div>

        <div className="bento">
          {/* hero */}
          <button className="tile hero span2" onClick={() => onRoute('spaReview')}>
            <div className="eyebrow" style={{ color: 'var(--jade-200)' }}>{t.dueThisWeek}</div>
            <div style={{ marginTop: 7 }}><Amount value={148000} size="xl" /></div>
            <div style={{ display: 'flex', gap: 6, marginTop: 13, flexWrap: 'wrap' }}>
              <span className="hero-chip"><i style={{ background: 'var(--overdue)' }} />1 overdue</span>
              <span className="hero-chip"><i style={{ background: 'var(--due)' }} />1 due soon</span>
              <span className="hero-chip"><i style={{ background: 'var(--amber-300)' }} />1 in grace</span>
            </div>
            <div className="mini-line"><div className="mini-done" /><div className="mini-now" /></div>
          </button>

          {/* stat tiles */}
          <button className="tile stat" onClick={() => onOpen('creek')}>
            <span className="tile-ico over"><Icon name="alert-circle" size={18} /></span>
            <div className="tile-num" style={{ color: 'var(--overdue)' }}>AED 98k</div>
            <div className="tile-lbl">1 overdue payment</div>
          </button>
          <button className="tile stat" onClick={() => onOpen('palm')}>
            <span className="tile-ico grace"><Icon name="hourglass" size={18} /></span>
            <div className="tile-num">12 days</div>
            <div className="tile-lbl">1 in grace · Oqood</div>
          </button>

          {/* at-risk wide */}
          <button className="tile wide span2 risk" onClick={() => onRoute('risk')}>
            <span className="risk-ico"><Icon name="shield-alert" size={20} /></span>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
              <b style={{ font: '600 14px var(--font-ui)', display: 'block' }}>Creek Gate is at risk</b>
              <span style={{ font: '400 12.5px var(--font-ui)', opacity: .92 }}>Act now — assignment still possible before a default notice.</span>
            </span>
            <Icon name="chevron-right" size={18} />
          </button>

          {/* roadmap teasers */}
          <button className="tile stat" onClick={() => onRoute('commission')}>
            <span className="tile-ico jade"><Icon name="banknote" size={18} /></span>
            <div className="tile-num" style={{ color: 'var(--action)' }}>AED 30k</div>
            <div className="tile-lbl">Commission pipeline</div>
          </button>
          <button className="tile stat" onClick={() => onOpen('marina')}>
            <span className="tile-ico amber"><Icon name="hard-hat" size={18} /></span>
            <div className="tile-num">38%</div>
            <div className="tile-lbl">Avg construction</div>
          </button>
        </div>

        <div className="sec-head"><span className="eyebrow">Needs you</span><span style={{ font: '600 12px var(--font-ui)', color: 'var(--action)' }}>swipe a row →</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <NeedRow deal={DEALS[1]} onOpen={onOpen} onMarkPaid={onMarkPaid} onNudge={onNudge} hint />
          <NeedRow deal={DEALS[0]} onOpen={onOpen} onMarkPaid={onMarkPaid} onNudge={onNudge} />
          <NeedRow deal={DEALS[2]} onOpen={onOpen} onMarkPaid={onMarkPaid} onNudge={onNudge} />
        </div>

        <div className="guardrail" style={{ marginTop: 14 }}>
          <Icon name="info" size={16} />
          <span>Oqood for Palm Beach Towers is due within 90 days of the SPA — <b>41 days left</b>. <span style={{ color: 'var(--text-tertiary)' }}>Not legal advice.</span></span>
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

Object.assign(window, { HomeBento });
