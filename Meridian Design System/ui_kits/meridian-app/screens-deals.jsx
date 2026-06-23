/* Meridian UI kit — deals list, manual entry, milestone detail. */
const { Button, IconButton, Input, SegmentedControl, Card, StatusPill, Badge, Amount, ProgressMeter, MilestoneRow, AppHeader } = window.MeridianDesignSystem_f018d0;

/* ---------- Deals list (portfolio) ---------- */
function DealsList({ onOpen, onAddDeal }) {
  const [filter, setFilter] = React.useState('all');
  const chips = [['all', 'All'], ['active', 'Active'], ['risk', 'At risk'], ['handover', 'Near handover']];
  const shown = DEALS.filter((d) => filter === 'all' ? true : filter === 'risk' ? d.atRisk : true);
  return (
    <div className="screen">
      <AppHeader title="Deals" bordered
        actions={<IconButton icon={<Icon name="search" size={22} />} label="Search" />} />
      <div className="scroll">
        <div className="search-bar"><Icon name="search" size={18} color="var(--text-tertiary)" /><span>Search project, unit or buyer</span></div>
        <div className="filter-chips">
          {chips.map(([v, l]) => (
            <button key={v} className={'fchip' + (filter === v ? ' on' : '')} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map((d) => (
            <Card as="div" interactive role="button" key={d.id} onClick={() => onOpen(d.id)} style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ font: '600 16px var(--font-display)' }}>{d.project}</span>
                    {d.sample && <Badge tone="sample" soft>Sample</Badge>}
                  </div>
                  <div style={{ font: '400 13px var(--font-ui)', color: 'var(--text-secondary)', marginTop: 2 }}>{d.unit} · {d.buyer}</div>
                </div>
                <Amount value={d.totalPrice} size="sm" tone="muted" />
              </div>
              <div style={{ margin: '12px 0 10px' }}><ProgressMeter variant="payment" label="Paid to date" value={d.paidPct} /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatusPill status={d.next.status} dense>{d.next.statusLabel || d.next.due}</StatusPill>
                <span style={{ font: '400 12px var(--font-ui)', color: 'var(--text-tertiary)' }}>{d.next.title}</span>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ height: 90 }} />
      </div>
      <button className="fab" onClick={onAddDeal}><Icon name="plus" size={22} /> Add deal</button>
    </div>
  );
}

/* ---------- Manual entry (PDF-less plan builder) ---------- */
function ManualEntry({ onBack, onSave }) {
  const rows = [
    { t: 'Booking deposit', pct: 20, amt: 250000, type: 'time' },
    { t: 'DLD registration (4%)', pct: 4, amt: 50000, type: 'time' },
    { t: '1st construction', pct: 10, amt: 125000, type: 'construction' },
    { t: 'Handover', pct: 66, amt: 825000, type: 'construction' },
  ];
  const sumPct = rows.reduce((a, r) => a + r.pct, 0);
  return (
    <div className="screen">
      <AppHeader eyebrow="New deal · manual" title="Build the plan" onBack={onBack} bordered />
      <div className="scroll">
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Project" defaultValue="Marina Vista — Tower 2" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Input label="Unit" defaultValue="1204" />
            <Input label="Total price" prefix="AED" mono defaultValue="1,250,000" />
          </div>
        </Card>

        <div className="sec-head"><span className="eyebrow">Payment plan</span><span style={{ font: '600 12px var(--font-ui)', color: 'var(--text-tertiary)' }}>{rows.length} milestones</span></div>
        <Card style={{ padding: '6px 10px' }}>
          {rows.map((r, i) => (
            <MilestoneRow key={i} type={r.type} title={`${r.t} (${r.pct}%)`}
              due={r.type === 'construction' ? 'on build trigger' : 'set a date'} amount={r.amt} status="upcoming" statusLabel={r.type === 'construction' ? 'Construction' : 'Time'} />
          ))}
        </Card>
        <Button variant="ghost" fullWidth leftIcon={<Icon name="plus" size={18} />} style={{ marginTop: 8 }}>Add milestone</Button>

        <div className={'validate ' + (sumPct === 100 ? 'ok' : 'warn')} style={{ marginTop: 12 }}>
          <Icon name={sumPct === 100 ? 'circle-check' : 'alert-triangle'} size={17} />
          <span>Installments sum to <b>{sumPct}%</b>{sumPct === 100 ? ' · reconciles to AED 1,250,000' : ` — add ${100 - sumPct}%`}</span>
        </div>
        <div style={{ height: 90 }} />
      </div>
      <div className="cta-bar">
        <Button variant="primary" size="lg" fullWidth disabled={sumPct !== 100} onClick={onSave}>Save deal</Button>
      </div>
    </div>
  );
}

/* ---------- Milestone detail / reminder ladder ---------- */
function MilestoneDetail({ onBack, onMarkPaid, onNudge }) {
  const deal = DEALS[0];
  const m = deal.milestones[1]; // DLD fee, due
  const ladder = [
    { ch: 'In-app + push', when: '7 days before', icon: 'bell', done: true },
    { ch: 'Push', when: '3 days before', icon: 'smartphone', done: true },
    { ch: 'Push', when: '1 day before', icon: 'smartphone', done: false, next: true },
    { ch: 'Email', when: 'On due date', icon: 'mail', done: false },
    { ch: 'WhatsApp (grace)', when: 'Due + 3 days', icon: 'message-circle', done: false, critical: true },
  ];
  return (
    <div className="screen">
      <AppHeader eyebrow={`${deal.project} · ${deal.unit}`} title="Milestone" onBack={onBack} bordered />
      <div className="scroll">
        <Card style={{ borderColor: 'var(--accent)', background: 'var(--due-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ font: '600 18px var(--font-display)' }}>{m.title}</div>
              <div style={{ marginTop: 6 }}><StatusPill status="due">Due in 3 days · 28 Jun</StatusPill></div>
            </div>
            <Amount value={m.amount} size="lg" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Button variant="primary" fullWidth leftIcon={<Icon name="check-check" size={18} />} onClick={() => onMarkPaid(deal)}>Mark paid</Button>
            <Button variant="secondary" leftIcon={<Icon name="message-circle" size={18} />} onClick={() => onNudge(deal)}>Nudge</Button>
          </div>
        </Card>

        <div className="sec-head"><span className="eyebrow">Reminder ladder</span></div>
        <Card style={{ padding: '6px 0' }}>
          {ladder.map((l, i) => (
            <div key={i} className="ladder-row">
              <span className={'ladder-dot' + (l.done ? ' done' : l.next ? ' next' : l.critical ? ' crit' : '')}>
                {l.done ? <Icon name="check" size={13} color="#fff" /> : <Icon name={l.icon} size={15} />}
              </span>
              <span style={{ flex: 1 }}>
                <b style={{ font: '500 14px var(--font-ui)', display: 'block' }}>{l.ch}</b>
                <span style={{ font: '400 12px var(--font-ui)', color: 'var(--text-secondary)' }}>{l.when}</span>
              </span>
              {l.next && <Badge tone="amber" soft>Next</Badge>}
              {l.critical && <Badge tone="neutral" soft>Critical tier</Badge>}
            </div>
          ))}
        </Card>

        <div className="sec-head"><span className="eyebrow">Source</span></div>
        <Card as="div" interactive role="button" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="pick-ico"><Icon name="file-text" size={20} /></span>
          <span style={{ flex: 1 }}><b style={{ font: '500 14px var(--font-ui)' }}>SPA · clause 3, payment plan</b><br /><span style={{ font: '400 12px var(--font-ui)', color: 'var(--text-secondary)' }}>DLD fee 4% = AED 50,000</span></span>
          <Icon name="chevron-right" size={18} color="var(--text-tertiary)" />
        </Card>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

Object.assign(window, { DealsList, ManualEntry, MilestoneDetail });
