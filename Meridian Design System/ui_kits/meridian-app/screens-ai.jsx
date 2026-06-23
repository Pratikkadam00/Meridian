/* Meridian UI kit — the signature AI moment: SPA upload + review/confirm.
   Trust-but-verify: source PDF beside extracted fields, per-field confidence,
   tap a field to highlight its source, explicit confirm on money/date. */
const { Button, IconButton, AppHeader, FieldReviewRow, ConfidenceCue, Card, Badge } = window.MeridianDesignSystem_f018d0;

/* ---------- Faux SPA PDF page (so highlights land on real-looking content) ---------- */
function SpaPdf({ region }) {
  return (
    <div className="pdf">
      <div className="pdf-bar">
        <span><Icon name="file-text" size={14} /> Marina-Vista-SPA.pdf</span>
        <span style={{ color: 'var(--text-tertiary)' }}>p.1 / 6</span>
      </div>
      <div className="pdf-page">
        <div className="pdf-h">SALE &amp; PURCHASE AGREEMENT</div>
        <p className="pdf-l"><b>1. The Property.</b> Marina Vista — Tower 2, a residential</p>
        <p className="pdf-l">apartment known as <b>Unit 1204</b> on the 12th floor.</p>
        <p className="pdf-l">&nbsp;</p>
        <p className="pdf-l"><b>2. Purchase Price.</b> The total price is</p>
        <p className="pdf-l"><b>AED 1,250,000</b> (one million two hundred fifty).</p>
        <p className="pdf-l">&nbsp;</p>
        <p className="pdf-l"><b>3. Payment Plan.</b> Booking deposit of 20% =</p>
        <p className="pdf-l">AED 250,000 due on signing. DLD fee 4% = AED 50,000.</p>
        <p className="pdf-l">&nbsp;</p>
        <p className="pdf-l"><b>4. Escrow.</b> Payments to escrow account</p>
        <p className="pdf-l">IBAN AE07 0331 2345 6789 0123 456 (Emaar).</p>
        <p className="pdf-l">Oqood registration ………………………… (illegible)</p>
        <p className="pdf-l">&nbsp;</p>
        <p className="pdf-l"><b>5. Handover.</b> Anticipated Q3 2028, subject to</p>
        <p className="pdf-l">construction progress per Article 9.</p>
        {region && <div className="pdf-hl" style={{ top: region.top + '%', insetInlineStart: region.left + '%', width: region.w + '%', height: region.h + '%' }} />}
      </div>
    </div>
  );
}

/* ---------- SPA review / confirm (signature) ---------- */
function SpaReview({ onBack, onBuild }) {
  const fields = SPA_FIELDS;
  const needConfirm = fields.filter((f) => f.money || f.confidence === 'low');
  const [sel, setSel] = React.useState('price');
  const [confirmed, setConfirmed] = React.useState({ project: true, unit: true, handover: true });
  const cur = fields.find((f) => f.key === sel);
  const doneCount = needConfirm.filter((f) => confirmed[f.key]).length;
  const allDone = doneCount === needConfirm.length;

  const confirm = (k) => setConfirmed((c) => ({ ...c, [k]: true }));

  return (
    <div className="screen">
      <AppHeader eyebrow="New deal · SPA" title="Review the plan" onBack={onBack} bordered
        actions={<Badge tone="jade" soft>AI · 8 fields</Badge>} />

      {/* Sticky PDF pane */}
      <div className="pdf-pane">
        <SpaPdf region={cur ? cur.region : null} />
        {/* Contextual confirm for the selected field */}
        {cur && (
          <div className={'pdf-action' + (cur.confidence === 'low' ? ' is-low' : '')}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow" style={{ color: 'inherit', opacity: .7 }}>{cur.label}</div>
              <div className="pdf-action-val">{cur.value || 'Not found — enter manually'}</div>
            </div>
            {confirmed[cur.key]
              ? <span className="confirmed-chip"><Icon name="check" size={14} /> Confirmed</span>
              : (cur.money || cur.confidence === 'low')
                ? <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="sm" variant="secondary" leftIcon={<Icon name="pencil" size={15} />}>Edit</Button>
                    <Button size="sm" variant="primary" onClick={() => confirm(cur.key)}>{cur.value ? 'Confirm' : 'Add'}</Button>
                  </div>
                : <ConfidenceCue level={cur.confidence} chip />}
          </div>
        )}
      </div>

      <div className="scroll" style={{ paddingTop: 14 }}>
        {/* Validation */}
        <div className="validate ok">
          <Icon name="circle-check" size={17} />
          <span>Installments sum to <b>100%</b> · milestones reconcile to <b>AED 1,250,000</b></span>
        </div>
        <p className="review-hint">Check what we read. Tap any field to see its source in the SPA. Money &amp; dates need your confirm.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fields.map((f) => (
            <FieldReviewRow key={f.key} label={f.label} value={f.value} confidence={f.confidence}
              money={f.money} active={sel === f.key} confirmed={!!confirmed[f.key]}
              onClick={() => setSel(f.key)} />
          ))}
        </div>
        <div style={{ height: 90 }} />
      </div>

      {/* Bottom CTA */}
      <div className="cta-bar">
        <Button variant="primary" size="lg" fullWidth disabled={!allDone}
          rightIcon={<Icon name="arrow-right" size={20} />} onClick={onBuild}>
          {allDone ? 'Build the payment plan' : `Confirm ${doneCount} of ${needConfirm.length} to continue`}
        </Button>
      </div>
    </div>
  );
}

/* ---------- SPA upload + scan (loading state, manual fallback) ---------- */
function SpaUpload({ onBack, onScanned, onManual }) {
  const [phase, setPhase] = React.useState('idle'); // idle | scanning
  React.useEffect(() => {
    if (phase !== 'scanning') return;
    const id = setTimeout(() => onScanned(), 2200);
    return () => clearTimeout(id);
  }, [phase]);
  return (
    <div className="screen">
      <AppHeader eyebrow="New deal" title="Upload the SPA" onBack={onBack} bordered />
      <div className="scroll" style={{ justifyContent: 'center', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {phase === 'idle' ? (
          <React.Fragment>
            <button className="dropzone" onClick={() => setPhase('scanning')}>
              <span className="dz-ico"><Icon name="file-up" size={30} /></span>
              <span style={{ font: '600 16px var(--font-display)' }}>Drop the SPA PDF here</span>
              <span style={{ font: '400 13px var(--font-ui)', color: 'var(--text-secondary)' }}>or tap to choose · scan a paper copy</span>
            </button>
            <div className="upload-note"><Icon name="shield-check" size={16} /> We read it on-device first. Nothing is auto-filled without your confirm.</div>
            <Button variant="ghost" fullWidth onClick={onManual}>Enter the plan manually instead</Button>
          </React.Fragment>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="scan-doc"><Icon name="file-text" size={40} /><div className="scan-beam" /></div>
            <div style={{ font: '600 18px var(--font-display)' }}>Reading the SPA…</div>
            <div style={{ font: '400 14px var(--font-ui)', color: 'var(--text-secondary)', maxWidth: 240 }}>Finding the price, payment plan, escrow and milestones. You'll confirm every figure.</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SpaReview, SpaUpload });
