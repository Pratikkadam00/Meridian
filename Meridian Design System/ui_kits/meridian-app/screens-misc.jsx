/* Meridian UI kit — onboarding (auth → terms → context), add-deal chooser,
   nudge composer, notification primer, settings. */
const { Button, IconButton, Input, Checkbox, Switch, SegmentedControl, Card, Badge, AppHeader, Sheet, Avatar } = window.MeridianDesignSystem_f018d0;

const Logo = ({ size = 40, dark }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ color: dark ? '#9CD0C1' : 'var(--jade-500)' }}>
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
    <line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="24" y1="4" x2="24" y2="11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="33" cy="24" r="5" fill="#E0922F" />
  </svg>
);

/* ---------- Passwordless auth ---------- */
function AuthScreen({ onContinue }) {
  return (
    <div className="screen auth">
      <div className="auth-top">
        <Logo size={44} dark />
        <span style={{ font: '700 26px var(--font-display)', color: '#ECF3F0', letterSpacing: '-.02em' }}>Meridian</span>
        <p style={{ font: '400 15px var(--font-ui)', color: 'var(--jade-200)', margin: '6px 0 0', maxWidth: 260 }}>
          The off-plan deal OS. From SPA to handover, never miss a milestone.
        </p>
      </div>
      <div className="auth-card">
        <Input label="Work email" placeholder="you@brokerage.ae" leadingIcon={<Icon name="mail" size={18} color="var(--text-tertiary)" />} />
        <Button variant="primary" size="lg" fullWidth rightIcon={<Icon name="arrow-right" size={20} />} onClick={onContinue}>Send magic link</Button>
        <div className="auth-or"><span>or</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" fullWidth leftIcon={<Icon name="scan-face" size={19} />} onClick={onContinue}>Face ID</Button>
          <Button variant="secondary" fullWidth leftIcon={<Icon name="building-2" size={19} />} onClick={onContinue}>SSO</Button>
        </div>
        <p className="auth-fine">No passwords. We email a one-tap link; Face ID for return visits.</p>
      </div>
    </div>
  );
}

/* ---------- Age + terms gate ---------- */
function TermsGate({ onContinue }) {
  const [age, setAge] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  return (
    <div className="screen pad">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <Logo size={36} />
        <h1 style={{ font: '700 24px var(--font-display)', letterSpacing: '-.02em', margin: 0 }}>Before we start</h1>
        <Card tone="sunk" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Checkbox checked={age} onChange={setAge}>I confirm I'm 18 or older.</Checkbox>
          <Checkbox checked={terms} onChange={setTerms}>I accept the <b>Terms of Service</b> and <b>Privacy Policy</b> (PDPL compliant).</Checkbox>
        </Card>
      </div>
      <Button variant="primary" size="lg" fullWidth disabled={!(age && terms)} onClick={onContinue}>Continue</Button>
    </div>
  );
}

/* ---------- One context question ---------- */
function Onboarding({ onContinue }) {
  const [role, setRole] = React.useState('independent');
  const opts = [
    { v: 'independent', t: 'Independent broker', d: 'Just me and my book of deals', i: 'user' },
    { v: 'agency', t: 'At an agency', d: 'Part of a brokerage team', i: 'users' },
    { v: 'manager', t: 'Team manager', d: 'I oversee other agents', i: 'briefcase' },
  ];
  return (
    <div className="screen pad">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
        <span className="eyebrow">One quick thing</span>
        <h1 style={{ font: '700 24px var(--font-display)', letterSpacing: '-.02em', margin: '4px 0 18px' }}>How do you work?</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opts.map((o) => (
            <button key={o.v} className={'pick' + (role === o.v ? ' on' : '')} onClick={() => setRole(o.v)}>
              <span className="pick-ico"><Icon name={o.i} size={20} /></span>
              <span style={{ flex: 1, textAlign: 'start' }}>
                <b style={{ font: '600 15px var(--font-ui)', display: 'block' }}>{o.t}</b>
                <span style={{ font: '400 13px var(--font-ui)', color: 'var(--text-secondary)' }}>{o.d}</span>
              </span>
              <span className="radio">{role === o.v && <Icon name="check" size={14} color="#fff" />}</span>
            </button>
          ))}
        </div>
      </div>
      <Button variant="primary" size="lg" fullWidth onClick={onContinue}>Take me in</Button>
    </div>
  );
}

/* ---------- Add deal chooser ---------- */
function AddDealSheet({ onClose, onUpload, onManual }) {
  return (
    <Sheet open title="Add a deal" subtitle="Build the payment plan in under a minute" onClose={onClose}
      headerRight={<IconButton icon={<Icon name="x" size={20} />} label="Close" onClick={onClose} />}>
      <button className="chooser primary" onClick={onUpload}>
        <span className="chooser-ico"><Icon name="file-up" size={24} /></span>
        <span style={{ flex: 1, textAlign: 'start' }}>
          <b>Upload the SPA</b>
          <span>AI reads the price, plan, escrow &amp; milestones — you confirm each.</span>
        </span>
        <Badge tone="jade" soft>Fastest</Badge>
      </button>
      <button className="chooser" onClick={onManual}>
        <span className="chooser-ico alt"><Icon name="pencil-line" size={24} /></span>
        <span style={{ flex: 1, textAlign: 'start' }}>
          <b>Enter manually</b>
          <span>Type the plan yourself. Good for a deal with no PDF yet.</span>
        </span>
      </button>
      <div className="upload-note" style={{ marginTop: 14 }}><Icon name="download" size={16} /> Or import existing deals — runs in the background, never blocks you.</div>
    </Sheet>
  );
}

/* ---------- Notification primer (soft-ask at first value moment) ---------- */
function NotificationPrimer({ onClose, onEnable }) {
  return (
    <Sheet open onClose={onClose}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingBottom: 6 }}>
        <span className="primer-ico"><Icon name="bell-ring" size={28} /></span>
        <h2 style={{ font: '700 21px var(--font-display)', margin: 0, letterSpacing: '-.01em' }}>Want a heads-up before each milestone?</h2>
        <p style={{ font: '400 14.5px var(--font-ui)', color: 'var(--text-secondary)', margin: 0, maxWidth: 300 }}>
          We'll only ping you when <b>money or dates move</b> — a milestone due, an overdue installment, the grace window closing. Quiet hours on by default.
        </p>
        <div className="primer-cadence">
          <span><Icon name="calendar-clock" size={15} /> 7 / 3 / 1-day reminders</span>
          <span><Icon name="moon" size={15} /> Quiet 9pm–8am</span>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={onEnable}>Turn on reminders</Button>
        <Button variant="ghost" fullWidth onClick={onClose}>Not now</Button>
      </div>
    </Sheet>
  );
}

/* ---------- Nudge composer ---------- */
function NudgeComposer({ deal, onClose, onSend, lang = 'en' }) {
  const d = deal || DEALS[0];
  const [tlang, setTlang] = React.useState(lang);
  const [channel, setChannel] = React.useState('whatsapp');
  const body = {
    en: `Hi ${d.buyer.split(' ')[0]} — a reminder that your DLD registration fee (${AED(d.next.amount)}) for ${d.project} ${d.unit} is due on 28 Jun. Happy to help with the escrow transfer. — Yousef`,
    ar: `مرحباً ${d.buyer.split(' ')[0]} — تذكير بأن رسوم تسجيل دائرة الأراضي (${AED(d.next.amount)}) لـ ${d.project} ${d.unit} مستحقة في ٢٨ يونيو. يسعدني مساعدتك في التحويل لحساب الضمان. — يوسف`,
  };
  return (
    <Sheet open title="Nudge the buyer" subtitle={`${d.buyer} · ${d.project}`} onClose={onClose}
      headerRight={<IconButton icon={<Icon name="x" size={20} />} label="Close" onClick={onClose} />}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <SegmentedControl value={channel} onChange={setChannel} options={[
          { value: 'whatsapp', label: 'WhatsApp' }, { value: 'push', label: 'In-app' }, { value: 'email', label: 'Email' },
        ]} />
        <SegmentedControl value={tlang} onChange={setTlang} options={[{ value: 'en', label: 'EN' }, { value: 'ar', label: 'AR' }]} />
      </div>
      <div className={'nudge-preview' + (tlang === 'ar' ? ' rtl' : '')} dir={tlang === 'ar' ? 'rtl' : 'ltr'}>{body[tlang]}</div>
      {channel === 'whatsapp' && <div className="upload-note" style={{ marginTop: 10 }}><Icon name="shield-check" size={15} /> Consent-first WhatsApp Utility template. Buyer opted in 12 Mar.</div>}
      <Button variant="primary" size="lg" fullWidth style={{ marginTop: 14 }} leftIcon={<Icon name="send" size={18} />} onClick={onSend}>Send nudge</Button>
    </Sheet>
  );
}

/* ---------- Settings ---------- */
function Settings({ onBack, lang, onLang, theme, onTheme }) {
  const [push, setPush] = React.useState(true);
  const [quiet, setQuiet] = React.useState(true);
  const [lock, setLock] = React.useState(true);
  const [wa, setWa] = React.useState(true);
  return (
    <div className="screen">
      <AppHeader title="Settings" onBack={onBack} bordered />
      <div className="scroll">
        <SettingsGroup label="Language & display">
          <div className="set-row"><span><Icon name="languages" size={19} /> Language</span>
            <SegmentedControl value={lang} onChange={onLang} options={[{ value: 'en', label: 'EN' }, { value: 'ar', label: 'العربية' }]} /></div>
          <div className="set-row"><span><Icon name="moon" size={19} /> Theme</span>
            <SegmentedControl value={theme} onChange={onTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div>
        </SettingsGroup>
        <SettingsGroup label="Notifications">
          <SetToggle icon="bell" title="Push reminders" sub="7 / 3 / 1-day before each milestone" on={push} set={setPush} />
          <SetToggle icon="moon" title="Quiet hours" sub="9:00pm – 8:00am" on={quiet} set={setQuiet} />
          <SetToggle icon="message-circle" title="WhatsApp escalation" sub="Grace window → WhatsApp Utility" on={wa} set={setWa} />
        </SettingsGroup>
        <SettingsGroup label="Security">
          <SetToggle icon="lock" title="App lock" sub="Require Face ID to open" on={lock} set={setLock} />
        </SettingsGroup>
        <SettingsGroup label="Account">
          <div className="set-link"><span><Icon name="badge-check" size={19} /> RERA broker card</span><Badge tone="jade" soft>Valid · exp. Nov 2026</Badge></div>
          <button className="set-link danger"><span><Icon name="trash-2" size={19} /> Delete account &amp; data</span><Icon name="chevron-right" size={18} /></button>
        </SettingsGroup>
        <p style={{ font: '400 12px var(--font-ui)', color: 'var(--text-tertiary)', textAlign: 'center', padding: '4px 0 16px' }}>Meridian · data stored per UAE PDPL</p>
      </div>
    </div>
  );
}
function SettingsGroup({ label, children }) {
  return (<div style={{ marginTop: 'var(--sp-4)' }}>
    <div className="eyebrow" style={{ padding: '0 4px 8px' }}>{label}</div>
    <Card style={{ padding: '4px 14px' }}>{children}</Card>
  </div>);
}
function SetToggle({ icon, title, sub, on, set }) {
  return (<div className="set-row tall">
    <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Icon name={icon} size={19} color="var(--text-secondary)" />
      <span><b style={{ font: '500 15px var(--font-ui)', display: 'block' }}>{title}</b>
        <span style={{ font: '400 12.5px var(--font-ui)', color: 'var(--text-secondary)' }}>{sub}</span></span>
    </span>
    <Switch checked={on} onChange={set} label={title} />
  </div>);
}

Object.assign(window, { AuthScreen, TermsGate, Onboarding, AddDealSheet, NotificationPrimer, NudgeComposer, Settings });
