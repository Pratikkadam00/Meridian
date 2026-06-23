/* Meridian UI kit — core screens: Portfolio "What's due" home, Deal detail,
   Mark-paid sheet. The home is the daily-open heart of the app. */
const { Card, StatusPill, Amount, Badge, Button, IconButton, Input, ProgressMeter, MilestoneRow, AppHeader, Sheet } = window.MeridianDesignSystem_f018d0;

/* ---------- A "needs you" row on the home screen ---------- */
function DueCard({ deal, onOpen, onMarkPaid, onNudge, t }) {
  const m = deal.next;
  return (
    <Card as="div" interactive role="button" tabIndex={0} onClick={() => onOpen(deal.id)} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ font: '600 16px var(--font-display)', letterSpacing: '-.01em' }}>{deal.project}</span>
              {deal.sample && <Badge tone="sample" soft>Sample</Badge>}
            </div>
            <div style={{ font: '400 13px var(--font-ui)', color: 'var(--text-secondary)', marginTop: 2 }}>
              {deal.unit} · {deal.buyer}
            </div>
          </div>
          <Amount value={m.amount} size="md" tone={m.status === 'overdue' ? 'risk' : 'default'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusPill status={m.status}>{m.statusLabel || mLabel(m)}</StatusPill>
          <span style={{ font: '400 13px var(--font-ui)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 1, background: 'var(--border-hair)', borderTop: '1px solid var(--border-hair)' }}>
        <button className="due-act" onClick={(e) => { e.stopPropagation(); onMarkPaid(deal); }}>
          <Icon name="check-check" size={17} /> {t.markPaid}
        </button>
        <button className="due-act" onClick={(e) => { e.stopPropagation(); onNudge(deal); }}>
          <Icon name="message-circle" size={17} /> {t.nudge}
        </button>
      </div>
    </Card>
  );
}
function mLabel(m) {
  return { paid: 'Paid', due: 'Due', upcoming: 'Upcoming', overdue: 'Overdue', grace: 'In grace', atrisk: 'At risk' }[m.status];
}

/* ---------- Portfolio "What's due" home ---------- */
function PortfolioHome({ onOpen, onMarkPaid, onNudge, onAddDeal, lang = 'en' }) {
  const t = STRINGS[lang];
  const [seg, setSeg] = React.useState('week');
  const atRisk = DEALS.find((d) => d.atRisk);
  return (
    <div className="screen">
      <div className="home-top">
        <div>
          <div className="eyebrow">{t.today}</div>
          <div style={{ font: '700 24px var(--font-display)', letterSpacing: '-.02em', marginTop: 2 }}>{t.greeting}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <IconButton icon={<Icon name="bell" size={22} />} label="Reminders" />
          <span className="avatar">YF</span>
        </div>
      </div>

      <div className="scroll">
        {/* Hero */}
        <Card tone="ink" style={{ padding: 'var(--sp-5)' }}>
          <div className="eyebrow" style={{ color: 'var(--jade-200)' }}>{t.dueThisWeek}</div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <Amount value={148000} size="xl" />
          </div>
          <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
            <span className="hero-chip"><i style={{ background: 'var(--overdue)' }} />1 overdue</span>
            <span className="hero-chip"><i style={{ background: 'var(--due)' }} />1 due soon</span>
            <span className="hero-chip"><i style={{ background: 'var(--amber-300)' }} />1 in grace</span>
          </div>
          <div className="mini-line">
            <div className="mini-done" />
            <div className="mini-now" />
          </div>
        </Card>

        {/* At-risk early warning */}
        {atRisk && (
          <button className="risk-banner" onClick={() => onOpen(atRisk.id)}>
            <span className="risk-ico"><Icon name="shield-alert" size={20} /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ font: '600 14px var(--font-ui)', display: 'block' }}>{atRisk.project} is at risk</span>
              <span style={{ font: '400 12.5px var(--font-ui)', color: 'var(--critical-text)', opacity: .9 }}>Act now — assignment still possible before a default notice.</span>
            </span>
            <Icon name="chevron-right" size={18} />
          </button>
        )}

        <div className="sec-head">
          <span className="eyebrow">Needs you</span>
          <span style={{ font: '600 12px var(--font-ui)', color: 'var(--action)' }}>3 items</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <DueCard deal={DEALS[1]} onOpen={onOpen} onMarkPaid={onMarkPaid} onNudge={onNudge} t={t} />
          <DueCard deal={DEALS[0]} onOpen={onOpen} onMarkPaid={onMarkPaid} onNudge={onNudge} t={t} />
          <DueCard deal={DEALS[2]} onOpen={onOpen} onMarkPaid={onMarkPaid} onNudge={onNudge} t={t} />
        </div>

        {/* Compliance guardrail */}
        <div className="guardrail">
          <Icon name="info" size={16} />
          <span>Oqood registration for Palm Beach Towers is due within 90 days of the SPA — <b>41 days left</b>. <span style={{ color: 'var(--text-tertiary)' }}>Not legal advice.</span></span>
        </div>
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

/* ---------- Deal detail ---------- */
function DealDetail({ dealId, onBack, onMarkPaid, onNudge, lang = 'en' }) {
  const deal = DEALS.find((d) => d.id === dealId) || DEALS[0];
  const ms = deal.milestones.length ? deal.milestones : DEALS[0].milestones;
  return (
    <div className="screen">
      <AppHeader eyebrow={deal.project} title={deal.unit} onBack={onBack} bordered
        actions={<IconButton icon={<Icon name="ellipsis" size={22} />} label="More" />} />
      <div className="scroll">
        {/* Next action */}
        <Card style={{ borderColor: 'var(--accent)', background: 'var(--due-bg)' }}>
          <div className="eyebrow" style={{ color: 'var(--amber-700)' }}>Next action</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12 }}>
            <div>
              <div style={{ font: '600 16px var(--font-display)' }}>{deal.next.title}</div>
              <div style={{ font: '400 13px var(--font-ui)', color: 'var(--amber-700)', marginTop: 3 }}>{deal.next.due}</div>
            </div>
            <Amount value={deal.next.amount} size="md" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Button variant="primary" fullWidth leftIcon={<Icon name="check-check" size={18} />} onClick={() => onMarkPaid(deal)}>Mark paid</Button>
            <Button variant="secondary" leftIcon={<Icon name="message-circle" size={18} />} onClick={() => onNudge(deal)}>Nudge</Button>
          </div>
        </Card>

        {/* Identity */}
        <Card style={{ marginTop: 'var(--sp-3)' }}>
          <div className="eyebrow">Unit &amp; project</div>
          <div className="id-grid">
            <div><span>Developer</span><b>{deal.developer}</b></div>
            <div><span>DLD project no.</span><b className="mono">{deal.dldNo}</b></div>
            <div><span>Oqood cert</span><b className="mono">{deal.oqood}</b></div>
            <div><span>Buyer</span><b>{deal.buyer}</b></div>
            <div style={{ gridColumn: '1 / -1' }}><span>Escrow IBAN</span><b className="mono">{deal.escrow}</b></div>
          </div>
        </Card>

        {/* Construction + paid progress */}
        <Card style={{ marginTop: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProgressMeter variant="construction" label="Construction" value={deal.constructionPct} marker={60} />
          <ProgressMeter variant="payment" label="Paid to date" value={deal.paidPct} />
        </Card>

        {/* Payment plan */}
        <div className="sec-head"><span className="eyebrow">Payment plan</span><span style={{ font: '600 12px var(--font-ui)', color: 'var(--text-tertiary)' }}>{ms.length} milestones</span></div>
        <Card style={{ padding: '6px 10px' }}>
          {ms.map((m, i) => (
            <MilestoneRow key={i} {...m} statusLabel={m.statusLabel} onClick={() => m.status !== 'paid' && onMarkPaid(deal)} />
          ))}
        </Card>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Mark-paid sheet (with proof + audit — money you can defend) ---------- */
function MarkPaidSheet({ deal, onClose, onConfirm }) {
  const [attached, setAttached] = React.useState(false);
  if (!deal) return null;
  const m = deal.next;
  return (
    <Sheet open title="Mark as paid" subtitle={`${m.title} · ${deal.project}`} onClose={onClose}
      headerRight={<IconButton icon={<Icon name="x" size={20} />} label="Close" onClick={onClose} />}>
      <Card tone="sunk" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="eyebrow">Amount</div>
          <Amount value={m.amount} size="lg" />
        </div>
        <StatusPill status={m.status}>{m.statusLabel || mLabel(m)}</StatusPill>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0' }}>
        <label className="paid-row"><span>Paid on</span><b>Today · 23 Jun 2026</b></label>
        <Input label="Transfer reference" mono placeholder="e.g. FT26178XKD2 / cheque no."
          leadingIcon={<Icon name="hash" size={16} color="var(--text-tertiary)" />} />
        <div className="paid-row" style={{ background: 'var(--paid-bg)' }}>
          <span style={{ color: 'var(--paid-text)', display: 'inline-flex', gap: 7, alignItems: 'center' }}><Icon name="landmark" size={15} /> Goes to escrow</span>
          <b className="mono" style={{ color: 'var(--paid-text)', fontSize: 12 }}>AE07 0331 …456 ✓</b>
        </div>
      </div>

      {/* Proof of payment */}
      <button className={'proof' + (attached ? ' on' : '')} onClick={() => setAttached(!attached)}>
        <span className="proof-ico"><Icon name={attached ? 'file-check-2' : 'paperclip'} size={20} /></span>
        <span style={{ flex: 1, textAlign: 'start' }}>
          <b>{attached ? 'receipt-26jun.pdf attached' : 'Attach proof of payment'}</b>
          <span>{attached ? 'Stored with the deal · exportable' : 'Receipt or bank confirmation (recommended)'}</span>
        </span>
        {attached ? <Icon name="check" size={18} color="var(--paid)" /> : <Icon name="plus" size={18} color="var(--text-tertiary)" />}
      </button>

      <Button variant="primary" size="lg" fullWidth style={{ marginTop: 14 }} leftIcon={<Icon name="check-check" size={20} />} onClick={() => onConfirm(deal)}>Confirm payment</Button>
      <div style={{ font: '400 12px/1.5 var(--font-ui)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10, display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="shield-check" size={13} /> Logged to your audit trail · Yousef, today 9:41 — exportable for RERA.
      </div>
    </Sheet>
  );
}

Object.assign(window, { PortfolioHome, DealDetail, MarkPaidSheet });
