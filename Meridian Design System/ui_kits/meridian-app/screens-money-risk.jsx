/* Meridian UI kit — money & risk roadmap: commission ledger, Article-11 risk
   monitor, team/agency dashboard. */
const { Button, IconButton, Card, StatusPill, Badge, Amount, ProgressMeter, Avatar, AppHeader } = window.MeridianDesignSystem_f018d0;

/* ---------- Commission ledger ---------- */
function CommissionLedger({ onBack }) {
  const payouts = [
    { t: 'On booking (25%)', when: 'Paid · 20 Mar 2026', amt: 7500, status: 'paid' },
    { t: 'On DLD (25%)', when: 'Due · Q3 2026', amt: 7500, status: 'due', label: 'Owed' },
    { t: 'On 50% build (25%)', when: 'est. Q2 2027', amt: 7500, status: 'upcoming' },
    { t: 'On handover (25%)', when: 'est. Q3 2028 · deferred', amt: 7500, status: 'upcoming' },
  ];
  return (
    <div className="screen">
      <AppHeader eyebrow="Marina Vista · 1204" title="Commission" onBack={onBack} bordered
        actions={<IconButton icon={<Icon name="download" size={22} />} label="Export" />} />
      <div className="scroll">
        <Card tone="ink">
          <div className="eyebrow" style={{ color: 'var(--jade-200)' }}>Expected gross · 2.4% of price</div>
          <div style={{ marginTop: 6 }}><Amount value={30000} size="xl" /></div>
          <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
            <div><div style={{ font: '400 11px var(--font-ui)', color: 'var(--jade-200)' }}>Paid</div><Amount value={7500} size="sm" /></div>
            <div><div style={{ font: '400 11px var(--font-ui)', color: 'var(--jade-200)' }}>Owed</div><Amount value={7500} size="sm" /></div>
            <div><div style={{ font: '400 11px var(--font-ui)', color: 'var(--jade-200)' }}>Upcoming</div><Amount value={15000} size="sm" /></div>
          </div>
        </Card>

        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: '400 14px var(--font-ui)', color: 'var(--text-secondary)' }}>Your split</span>
          <b style={{ font: '600 15px var(--font-ui)' }}>50% agent · 50% brokerage</b>
        </Card>

        <div className="sec-head"><span className="eyebrow">Developer payout schedule</span></div>
        <Card style={{ padding: '6px 14px' }}>
          {payouts.map((p, i) => (
            <div key={i} className="ledger-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ font: '500 14px var(--font-ui)', display: 'block' }}>{p.t}</b>
                <span style={{ font: '400 12px var(--font-ui)', color: 'var(--text-secondary)' }}>{p.when}</span>
              </div>
              {p.status === 'paid' ? <StatusPill status="paid" dense>Paid</StatusPill> : p.status === 'due' ? <StatusPill status="due" dense>{p.label}</StatusPill> : null}
              <Amount value={p.amt} size="sm" tone={p.status === 'paid' ? 'paid' : p.status === 'upcoming' ? 'muted' : 'default'} />
            </div>
          ))}
        </Card>

        <div className="risk-banner" style={{ marginTop: 12, background: 'var(--due-bg)', borderColor: 'var(--accent)', color: 'var(--amber-700)', backgroundImage: 'none' }}>
          <span className="risk-ico" style={{ background: 'var(--amber-500)' }}><Icon name="clock" size={18} /></span>
          <span style={{ flex: 1 }}><b style={{ font: '600 14px var(--font-ui)', display: 'block' }}>1 payout aging</b><span style={{ font: '400 12.5px var(--font-ui)' }}>DLD tranche 40 days past developer SLA — chase Emaar.</span></span>
        </div>
        <Button variant="secondary" fullWidth style={{ marginTop: 12 }} leftIcon={<Icon name="file-down" size={18} />}>Export RERA dispute pack</Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Risk / Article-11 monitor ---------- */
function RiskPanel({ onBack }) {
  const tiers = [
    { range: '< 25% built', forfeit: 'up to 30% retained', active: false },
    { range: '25–50% built', forfeit: 'up to 40% retained', active: true },
    { range: '> 50% built', forfeit: 'developer may sell + 40%', active: false },
  ];
  return (
    <div className="screen">
      <AppHeader eyebrow="Creek Gate · 808" title="Risk monitor" onBack={onBack} bordered />
      <div className="scroll">
        <Card style={{ borderColor: 'var(--critical)', background: 'var(--critical-bg)', backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(163,35,27,.05) 8px,rgba(163,35,27,.05) 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span className="risk-ico" style={{ background: 'var(--critical)' }}><Icon name="shield-alert" size={20} /></span>
            <div><b style={{ font: '600 16px var(--font-display)', color: 'var(--critical-text)' }}>Buyer default — Article 11</b><div style={{ font: '400 13px var(--font-ui)', color: 'var(--critical-text)' }}>3rd installment overdue 6 days</div></div>
          </div>
          <div className="cure-clock">
            <div><div style={{ font: '700 30px var(--font-display)', color: 'var(--critical-text)' }}>24</div><div className="eyebrow" style={{ color: 'var(--critical-text)' }}>days left in cure</div></div>
            <div style={{ flex: 1 }}><ProgressMeter variant="neutral" value={20} showValue={false} label="30-day cure clock" /></div>
          </div>
        </Card>

        <div className="risk-banner" style={{ marginTop: 12 }}>
          <span className="risk-ico"><Icon name="zap" size={18} /></span>
          <span style={{ flex: 1 }}><b style={{ font: '600 14px var(--font-ui)', display: 'block' }}>Act now</b><span style={{ font: '400 12.5px var(--font-ui)' }}>Assignment is still possible before a default notice is filed.</span></span>
        </div>

        <div className="sec-head"><span className="eyebrow">Forfeiture tiers · by completion %</span></div>
        <Card style={{ padding: '6px 0' }}>
          {tiers.map((t, i) => (
            <div key={i} className="ladder-row" style={{ background: t.active ? 'var(--overdue-bg)' : 'transparent' }}>
              <span className={'ladder-dot' + (t.active ? ' crit' : '')}><Icon name="layers" size={15} /></span>
              <span style={{ flex: 1 }}><b style={{ font: '500 14px var(--font-ui)', display: 'block', color: t.active ? 'var(--overdue-text)' : 'var(--text-primary)' }}>{t.range}</b><span style={{ font: '400 12px var(--font-ui)', color: 'var(--text-secondary)' }}>{t.forfeit}</span></span>
              {t.active && <Badge tone="neutral" soft>You're here · 55%</Badge>}
            </div>
          ))}
        </Card>

        <div className="sec-head"><span className="eyebrow">Compliance checks</span></div>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="set-link" style={{ cursor: 'default' }}><span><Icon name="calendar-clock" size={18} color="var(--amber-600)" /> Oqood window</span><Badge tone="amber" soft>41 days left</Badge></div>
          <div className="set-link" style={{ cursor: 'default' }}><span><Icon name="landmark" size={18} color="var(--action)" /> Escrow verified</span><Badge tone="jade" soft>OK</Badge></div>
          <div className="set-link" style={{ cursor: 'default' }}><span><Icon name="badge-check" size={18} color="var(--action)" /> RERA card</span><Badge tone="jade" soft>Valid</Badge></div>
        </Card>
        <div style={{ font: '400 11px var(--font-ui)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 12 }}>Guardrails, not legal advice. Confirm with your legal team.</div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Team / agency dashboard ---------- */
function TeamDashboard({ onBack }) {
  const agents = [
    { n: 'Yousef Farouk', i: 'YF', deals: 12, aed: '18.4M', risk: 1 },
    { n: 'Layla Hassan', i: 'LH', deals: 9, aed: '12.1M', risk: 0 },
    { n: 'Omar Said', i: 'OS', deals: 7, aed: '21.7M', risk: 2 },
  ];
  return (
    <div className="screen">
      <AppHeader eyebrow="Horizon Realty" title="Team" onBack={onBack} bordered
        actions={<IconButton icon={<Icon name="sliders-horizontal" size={22} />} label="Filter" />} />
      <div className="scroll">
        <div className="stat-grid">
          <Card style={{ textAlign: 'center', padding: 14 }}><div style={{ font: '700 20px var(--font-display)', color: 'var(--action)' }}>28</div><div className="eyebrow" style={{ marginTop: 4 }}>Active deals</div></Card>
          <Card style={{ textAlign: 'center', padding: 14 }}><div style={{ font: '700 20px var(--font-display)' }}>52M</div><div className="eyebrow" style={{ marginTop: 4 }}>AED pipeline</div></Card>
          <Card style={{ textAlign: 'center', padding: 14 }}><div style={{ font: '700 20px var(--font-display)', color: 'var(--overdue)' }}>3</div><div className="eyebrow" style={{ marginTop: 4 }}>At risk</div></Card>
        </div>

        <div className="sec-head"><span className="eyebrow">Commission pipeline</span></div>
        <Card><ProgressMeter variant="payment" label="Collected this quarter · AED 124,000 of 310,000" value={40} /></Card>

        <div className="sec-head"><span className="eyebrow">Agents</span></div>
        <Card style={{ padding: '6px 14px' }}>
          {agents.map((a, i) => (
            <div key={i} className="ledger-row">
              <Avatar name={a.n} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ font: '500 14px var(--font-ui)', display: 'block' }}>{a.n}</b>
                <span style={{ font: '400 12px var(--font-ui)', color: 'var(--text-secondary)' }}>{a.deals} deals · AED {a.aed}</span>
              </div>
              {a.risk > 0 ? <StatusPill status="atrisk" dense>{a.risk} at risk</StatusPill> : <Badge tone="jade" soft>On track</Badge>}
            </div>
          ))}
        </Card>
        <Button variant="secondary" fullWidth style={{ marginTop: 14 }} leftIcon={<Icon name="inbox" size={18} />}>Lead pool · 6 unassigned</Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

Object.assign(window, { CommissionLedger, RiskPanel, TeamDashboard });
