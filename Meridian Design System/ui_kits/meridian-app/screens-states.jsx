/* Meridian UI kit — states: empty (all caught up), offline, error,
   scanned-PDF failure (manual fallback with the PDF still visible). */
const { Button, IconButton, Card, Badge, AppHeader } = window.MeridianDesignSystem_f018d0;

/* ---------- Empty — all caught up (never a blank screen) ---------- */
function EmptyDue({ onAddDeal }) {
  return (
    <div className="screen">
      <div className="home-top">
        <div><div className="eyebrow">Tue · 23 Jun</div><div style={{ font: '700 24px var(--font-display)', letterSpacing: '-.02em', marginTop: 2 }}>Morning, Yousef</div></div>
        <span className="avatar">YF</span>
      </div>
      <div className="state-wrap">
        <div className="empty-art">
          <div className="empty-line"><span className="empty-dot" /></div>
        </div>
        <div style={{ font: '700 20px var(--font-display)' }}>Nothing due today</div>
        <p>You're ahead. Next milestone is the DLD fee on <b>28 Jun</b> — we'll remind you 3 days before.</p>
        <Button variant="secondary" leftIcon={<Icon name="plus" size={18} />} onClick={onAddDeal}>Add a deal</Button>
      </div>
    </div>
  );
}

/* ---------- Offline ---------- */
function OfflineState({ onRetry }) {
  return (
    <div className="screen">
      <div className="offline-strip"><Icon name="cloud-off" size={16} /> You're offline — showing your last sync (9:12am)</div>
      <div className="home-top">
        <div><div className="eyebrow">Tue · 23 Jun</div><div style={{ font: '700 24px var(--font-display)', marginTop: 2 }}>What's due</div></div>
        <span className="avatar">YF</span>
      </div>
      <div className="scroll">
        <Card style={{ opacity: .6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><b style={{ font: '600 15px var(--font-display)' }}>Marina Vista</b><span style={{ font: '500 13px var(--font-mono)' }}>AED 50,000</span></div>
          <div style={{ font: '400 12px var(--font-ui)', color: 'var(--text-secondary)', marginTop: 4 }}>DLD fee · cached</div>
        </Card>
        <div className="queued"><Icon name="clock" size={16} /><span><b>1 action queued.</b> Your "Mark paid" will sync when you're back online.</span></div>
        <Button variant="secondary" fullWidth leftIcon={<Icon name="refresh-cw" size={18} />} onClick={onRetry}>Try to reconnect</Button>
      </div>
    </div>
  );
}

/* ---------- Generic error ---------- */
function ErrorState({ onRetry }) {
  return (
    <div className="screen">
      <AppHeader title="" onBack={onRetry} bordered />
      <div className="state-wrap">
        <span className="state-ico err"><Icon name="unplug" size={30} /></span>
        <div style={{ font: '700 20px var(--font-display)' }}>That didn't load</div>
        <p>We couldn't reach your deals just now. Your data is safe — nothing was lost.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="primary" leftIcon={<Icon name="refresh-cw" size={18} />} onClick={onRetry}>Try again</Button>
          <Button variant="ghost">Get help</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scanned-PDF failure — manual fallback, PDF stays visible ---------- */
function ScanFailed({ onBack, onManual }) {
  return (
    <div className="screen">
      <AppHeader eyebrow="New deal · SPA" title="Couldn't read it" onBack={onBack} bordered />
      <div className="pdf-pane">
        <div className="pdf">
          <div className="pdf-bar"><span><Icon name="file-text" size={14} /> scanned-spa-p3.pdf</span><span style={{ color: 'var(--overdue-text)' }}>low quality</span></div>
          <div className="pdf-page" style={{ filter: 'blur(1.5px)', opacity: .65 }}>
            <div className="pdf-h">SALE &amp; PURCHASE AGREEMENT</div>
            <p className="pdf-l">▓▓▓▓▓ ▓▓▓ ▓▓▓▓▓▓▓ ▓▓ ▓▓▓▓▓▓▓▓▓</p>
            <p className="pdf-l">▓▓▓▓▓▓▓▓ ▓▓▓▓ ▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓</p>
            <p className="pdf-l">▓▓▓ ▓▓▓▓▓▓▓▓▓ ▓▓ ▓▓▓ ▓▓▓▓▓▓</p>
            <p className="pdf-l">▓▓▓▓ ▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓ ▓▓▓</p>
          </div>
        </div>
      </div>
      <div className="scroll" style={{ paddingTop: 14 }}>
        <div className="validate" style={{ background: 'var(--overdue-bg)', color: 'var(--overdue-text)' }}>
          <Icon name="scan-line" size={17} />
          <span>This page scanned at low quality — we won't guess amounts. <b>Enter them manually</b>; the PDF stays beside you.</span>
        </div>
        <Card style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="pick-ico"><Icon name="pencil-line" size={20} /></span>
          <span style={{ flex: 1 }}><b style={{ font: '600 14px var(--font-ui)' }}>Enter the plan manually</b><div style={{ font: '400 12.5px var(--font-ui)', color: 'var(--text-secondary)' }}>Type each figure while you read the PDF above.</div></span>
        </Card>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <Button variant="secondary" fullWidth leftIcon={<Icon name="rotate-cw" size={18} />}>Rescan page</Button>
          <Button variant="primary" fullWidth onClick={onManual}>Enter manually</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EmptyDue, OfflineState, ErrorState, ScanFailed });
