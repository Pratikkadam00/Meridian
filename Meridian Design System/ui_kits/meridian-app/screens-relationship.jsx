/* Meridian UI kit — relationship & growth: client record, broker profile,
   shareable client portal, handover/snagging, assignment desk. */
const { Button, IconButton, Card, StatusPill, Badge, Amount, Avatar, ProgressMeter, Checkbox, AppHeader } = window.MeridianDesignSystem_f018d0;

/* ---------- Client / buyer record ---------- */
function ClientRecord({ onBack, onNudge }) {
  const d = DEALS[0];
  return (
    <div className="screen">
      <AppHeader title="Client" onBack={onBack} bordered
        actions={<IconButton icon={<Icon name="ellipsis" size={22} />} label="More" />} />
      <div className="scroll">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0 4px' }}>
          <Avatar name={d.buyer} size="lg" />
          <div style={{ font: '700 22px var(--font-display)', letterSpacing: '-.01em' }}>{d.buyer}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge tone="jade" dot>WhatsApp opted-in</Badge>
            <Badge tone="neutral" soft>Prefers Arabic</Badge>
          </div>
        </div>
        <div className="quick-actions">
          <button className="qa"><Icon name="phone" size={20} /><span>Call</span></button>
          <button className="qa"><Icon name="message-circle" size={20} /><span>WhatsApp</span></button>
          <button className="qa" onClick={() => onNudge(d)}><Icon name="bell" size={20} /><span>Nudge</span></button>
          <button className="qa"><Icon name="share-2" size={20} /><span>Portal</span></button>
        </div>

        <div className="sec-head"><span className="eyebrow">Relationship</span></div>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="set-row" style={{ padding: '4px 0' }}><span style={{ font: '400 14px var(--font-ui)', color: 'var(--text-secondary)' }}>Reliability</span><Badge tone="jade" soft>Pays on time · 4/4</Badge></div>
          <div className="set-row" style={{ padding: '4px 0' }}><span style={{ font: '400 14px var(--font-ui)', color: 'var(--text-secondary)' }}>Next touchpoint</span><b style={{ font: '600 14px var(--font-ui)' }}>Handover · Q3 2028</b></div>
          <div style={{ font: '400 13px/1.5 var(--font-ui)', color: 'var(--text-secondary)', background: 'var(--surface-sunk)', padding: 12, borderRadius: 'var(--r-sm)' }}>
            "Considering a second unit in Creek for his brother. Follow up after DLD payment clears." — note, 14 May
          </div>
        </Card>

        <div className="sec-head"><span className="eyebrow">Deals · 1</span></div>
        <Card as="div" interactive role="button" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b style={{ font: '600 15px var(--font-display)' }}>{d.project}</b><div style={{ font: '400 13px var(--font-ui)', color: 'var(--text-secondary)' }}>{d.unit}</div></div>
          <StatusPill status="due" dense>Due in 3 days</StatusPill>
        </Card>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Broker profile ---------- */
function Profile({ onBack, onSettings }) {
  const stats = [['Deals', '12'], ['AED tracked', '18.4M'], ['On-time', '94%']];
  return (
    <div className="screen">
      <AppHeader title="Profile" onBack={onBack} bordered
        actions={<IconButton icon={<Icon name="settings" size={22} />} label="Settings" onClick={onSettings} />} />
      <div className="scroll">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 0' }}>
          <span className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>YF</span>
          <div style={{ font: '700 22px var(--font-display)' }}>Yousef Farouk</div>
          <div style={{ font: '400 14px var(--font-ui)', color: 'var(--text-secondary)' }}>Independent broker · Dubai</div>
        </div>
        <div className="stat-grid">
          {stats.map(([l, v]) => (
            <Card key={l} style={{ textAlign: 'center', padding: 14 }}>
              <div style={{ font: '700 22px var(--font-display)', color: 'var(--action)' }}>{v}</div>
              <div className="eyebrow" style={{ marginTop: 4 }}>{l}</div>
            </Card>
          ))}
        </div>
        <div className="sec-head"><span className="eyebrow">Compliance</span></div>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="set-link" style={{ cursor: 'default' }}><span><Icon name="badge-check" size={19} color="var(--action)" /> RERA broker card</span><Badge tone="jade" soft>Valid · Nov 2026</Badge></div>
          <div className="set-link" style={{ cursor: 'default' }}><span><Icon name="building-2" size={19} /> Brokerage</span><b style={{ font: '500 14px var(--font-ui)' }}>Independent</b></div>
        </Card>
        <Button variant="secondary" fullWidth style={{ marginTop: 16 }} leftIcon={<Icon name="log-out" size={18} />}>Sign out</Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Shareable client portal (read-only, client-facing) ---------- */
function ClientPortal({ onBack }) {
  const d = DEALS[0];
  return (
    <div className="screen">
      <div className="portal-head">
        <div className="portal-bar">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" style={{ color: '#9CD0C1' }}><circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" /><line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><line x1="24" y1="4" x2="24" y2="11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><circle cx="33" cy="24" r="5" fill="#E0922F" /></svg>
            <b style={{ font: '700 15px var(--font-display)', color: '#ECF3F0' }}>Meridian</b>
          </span>
          <IconButton icon={<Icon name="x" size={20} color="#9CD0C1" />} label="Close" onClick={onBack} />
        </div>
        <div className="eyebrow" style={{ color: 'var(--jade-200)' }}>Your unit · shared by Yousef</div>
        <div style={{ font: '700 24px var(--font-display)', color: '#fff', marginTop: 4 }}>{d.project}</div>
        <div style={{ font: '400 14px var(--font-ui)', color: 'var(--jade-200)' }}>{d.unit} · {d.developer}</div>
      </div>
      <div className="scroll" style={{ marginTop: -22 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProgressMeter variant="construction" label="Construction progress" value={d.constructionPct} />
          <ProgressMeter variant="payment" label="You've paid" value={d.paidPct} />
        </Card>
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'var(--accent)', background: 'var(--due-bg)' }}>
          <div><div className="eyebrow" style={{ color: 'var(--amber-700)' }}>Next payment</div><div style={{ font: '600 15px var(--font-display)', marginTop: 3 }}>DLD registration · 28 Jun</div></div>
          <Amount value={50000} size="md" />
        </Card>
        <div className="sec-head"><span className="eyebrow">Payments</span></div>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="portal-row"><span><Icon name="check" size={15} color="var(--paid)" /> Booking deposit</span><Amount value={250000} size="sm" tone="paid" /></div>
          <div className="portal-row"><span style={{ color: 'var(--amber-700)' }}><Icon name="clock" size={15} /> DLD registration</span><Amount value={50000} size="sm" /></div>
          <div className="portal-row muted"><span><Icon name="circle" size={15} /> Construction (3 milestones)</span><Amount value={750000} size="sm" tone="muted" /></div>
          <div className="portal-row muted"><span><Icon name="circle" size={15} /> Handover</span><Amount value={500000} size="sm" tone="muted" /></div>
        </Card>
        <Button variant="primary" fullWidth style={{ marginTop: 14 }} leftIcon={<Icon name="message-circle" size={18} />}>Message Yousef</Button>
        <div style={{ font: '400 11px var(--font-ui)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>Read-only view · figures provided by your broker</div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Handover & snagging ---------- */
function HandoverSnagging({ onBack }) {
  const [snags, setSnags] = React.useState({ a: true, b: false, c: false });
  const steps = [
    { t: 'Final payment cleared', done: true },
    { t: 'Snagging inspection', done: true },
    { t: 'Developer fixes', done: false, active: true },
    { t: 'DLD title transfer', done: false },
    { t: 'Keys handed over', done: false },
  ];
  return (
    <div className="screen">
      <AppHeader eyebrow="Marina Vista · 1204" title="Handover" onBack={onBack} bordered />
      <div className="scroll">
        <Card tone="ink">
          <div className="eyebrow" style={{ color: 'var(--jade-200)' }}>Estimated handover</div>
          <div style={{ font: '700 24px var(--font-display)', marginTop: 4 }}>Q3 2028</div>
          <div style={{ font: '400 13px var(--font-ui)', color: 'var(--jade-200)', marginTop: 2 }}>3 of 5 handover steps complete</div>
        </Card>
        <div className="sec-head"><span className="eyebrow">Handover steps</span></div>
        <Card style={{ padding: '6px 0' }}>
          {steps.map((s, i) => (
            <div key={i} className="ladder-row">
              <span className={'ladder-dot' + (s.done ? ' done' : s.active ? ' next' : '')}>{s.done ? <Icon name="check" size={13} color="#fff" /> : <span style={{ font: '600 12px var(--font-ui)' }}>{i + 1}</span>}</span>
              <span style={{ flex: 1, font: '500 14px var(--font-ui)', color: s.done ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{s.t}</span>
              {s.active && <Badge tone="amber" soft>In progress</Badge>}
            </div>
          ))}
        </Card>
        <div className="sec-head"><span className="eyebrow">Snag list · 3</span><span style={{ font: '600 12px var(--font-ui)', color: 'var(--action)' }}>Add snag</span></div>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Checkbox checked={snags.a} onChange={(v) => setSnags({ ...snags, a: v })}>Master bath — silicone sealant gap</Checkbox>
          <Checkbox checked={snags.b} onChange={(v) => setSnags({ ...snags, b: v })}>Living room — scratched glazing panel</Checkbox>
          <Checkbox checked={snags.c} onChange={(v) => setSnags({ ...snags, c: v })}>Kitchen — cabinet door misaligned</Checkbox>
        </Card>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

/* ---------- Assignment / resale desk ---------- */
function AssignmentDesk({ onBack }) {
  const d = DEALS[0];
  return (
    <div className="screen">
      <AppHeader eyebrow="Marina Vista · 1204" title="Assignment" onBack={onBack} bordered />
      <div className="scroll">
        <Card style={{ borderColor: 'var(--paid)', background: 'var(--paid-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="pick-ico" style={{ background: 'var(--paid)', color: '#fff' }}><Icon name="check-check" size={20} /></span>
            <div><b style={{ font: '600 15px var(--font-ui)', color: 'var(--paid-text)' }}>NOC eligible</b><div style={{ font: '400 13px var(--font-ui)', color: 'var(--paid-text)' }}>{d.paidPct}% paid — above the developer's 30% threshold</div></div>
          </div>
        </Card>

        <div className="sec-head"><span className="eyebrow">Estimated assignment value</span></div>
        <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div><div className="eyebrow">Original price</div><Amount value={d.totalPrice} size="sm" tone="muted" /></div>
          <Icon name="arrow-right" size={18} color="var(--text-tertiary)" />
          <div style={{ textAlign: 'right' }}><div className="eyebrow" style={{ color: 'var(--action)' }}>Market est.</div><Amount value={1410000} size="md" tone="paid" /></div>
        </Card>

        <div className="sec-head"><span className="eyebrow">Assignment steps</span></div>
        <Card style={{ padding: '6px 0' }}>
          {[['Confirm NOC eligibility', true], ['Request developer NOC', false], ['Find assignee buyer', false], ['DLD transfer & new SPA', false]].map(([t, done], i) => (
            <div key={i} className="ladder-row">
              <span className={'ladder-dot' + (done ? ' done' : '')}>{done ? <Icon name="check" size={13} color="#fff" /> : <span style={{ font: '600 12px var(--font-ui)' }}>{i + 1}</span>}</span>
              <span style={{ flex: 1, font: '500 14px var(--font-ui)' }}>{t}</span>
            </div>
          ))}
        </Card>
        <Button variant="primary" fullWidth style={{ marginTop: 14 }} leftIcon={<Icon name="file-text" size={18} />}>Request developer NOC</Button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

Object.assign(window, { ClientRecord, Profile, ClientPortal, HandoverSnagging, AssignmentDesk });
