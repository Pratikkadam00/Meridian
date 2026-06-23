/* Meridian UI kit — shared data, Icon helper, formatters, i18n.
   Exposes everything on window for the other text/babel screen files. */

// Robust Lucide icon: span owned by React, <i> swapped imperatively inside it
// so re-renders never collide with Lucide's DOM replacement.
function Icon({ name, size = 22, color, strokeWidth = 2, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    el.appendChild(i);
    try {
      window.lucide.createIcons({ attrs: { width: size, height: size, 'stroke-width': strokeWidth } });
    } catch (e) {}
  });
  return <span ref={ref} aria-hidden="true"
    style={{ display: 'inline-flex', width: size, height: size, color, flex: 'none', ...style }} />;
}

const AED = (n) => (n == null ? 'AED —' : 'AED ' + Number(n).toLocaleString('en-AE', { maximumFractionDigits: 0 }));

// ---- Sample portfolio (the seeded sample deal + a realistic book) ----
const DEALS = [
  {
    id: 'marina', sample: true,
    project: 'Marina Vista', unit: 'Unit 1204', tower: 'Tower 2',
    developer: 'Emaar', buyer: 'Khalid Al Marri', buyerInit: 'KA',
    totalPrice: 1250000, paidPct: 24, constructionPct: 42,
    dldNo: '1234 · DXB-OFF', oqood: 'OQ-2026-008842', escrow: 'AE07 0331 2345 6789 0123 456',
    next: { title: 'DLD registration fee (4%)', due: 'Due in 3 days · 28 Jun', amount: 50000, status: 'due', type: 'time' },
    milestones: [
      { title: 'Booking deposit (20%)', due: 'Paid 14 Mar 2026', amount: 250000, status: 'paid', type: 'time' },
      { title: 'DLD registration fee (4%)', due: 'Due in 3 days · 28 Jun 2026', amount: 50000, status: 'due', statusLabel: 'Due in 3 days', type: 'time' },
      { title: '1st construction milestone (10%)', due: 'on 20% build · est. Q4 2026', amount: 125000, status: 'upcoming', type: 'construction' },
      { title: '2nd construction milestone (10%)', due: 'on 40% build · est. Q1 2027', amount: 125000, status: 'upcoming', type: 'construction' },
      { title: 'Handover payment (40%)', due: 'on completion · est. Q3 2028', amount: 500000, status: 'upcoming', type: 'construction' },
    ],
  },
  {
    id: 'creek', project: 'Creek Gate', unit: 'Unit 808', tower: 'South',
    developer: 'Emaar', buyer: 'Aisha Noor', buyerInit: 'AN',
    totalPrice: 980000, paidPct: 30, constructionPct: 55, atRisk: true,
    dldNo: '5521 · DXB-OFF', oqood: 'OQ-2025-114200', escrow: 'AE61 0090 0000 1234 5678 901',
    next: { title: '3rd installment (10%)', due: 'Overdue by 6 days', amount: 98000, status: 'overdue', type: 'time' },
    milestones: [],
  },
  {
    id: 'palm', project: 'Palm Beach Towers', unit: 'Unit 2310', tower: 'T3',
    developer: 'Nakheel', buyer: 'Omar Said', buyerInit: 'OS',
    totalPrice: 3200000, paidPct: 15, constructionPct: 18,
    dldNo: '7790 · DXB-OFF', oqood: 'OQ-2026-220015', escrow: 'AE21 0500 0000 9988 7766 554',
    next: { title: 'Oqood registration', due: 'In grace · 12 days left', amount: 128000, status: 'grace', type: 'time' },
    milestones: [],
  },
];

// ---- SPA review extracted fields (the signature screen) ----
const SPA_FIELDS = [
  { key: 'project', label: 'Project', value: 'Marina Vista — Tower 2', confidence: 'high', money: false, region: { top: 14, left: 8, w: 60, h: 5 } },
  { key: 'unit', label: 'Unit', value: 'Unit 1204', confidence: 'high', money: false, region: { top: 20, left: 8, w: 30, h: 5 } },
  { key: 'price', label: 'Total price', value: 'AED 1,250,000', confidence: 'high', money: true, region: { top: 33, left: 8, w: 55, h: 6 } },
  { key: 'deposit', label: 'Booking deposit (20%)', value: 'AED 250,000', confidence: 'med', money: true, region: { top: 46, left: 8, w: 50, h: 5 } },
  { key: 'dld', label: 'DLD registration (4%)', value: 'AED 50,000', confidence: 'high', money: true, region: { top: 53, left: 8, w: 50, h: 5 } },
  { key: 'escrow', label: 'Escrow IBAN', value: 'AE07 0331 2345 6789 0123 456', confidence: 'low', money: false, region: { top: 66, left: 8, w: 78, h: 5 } },
  { key: 'oqood', label: 'Oqood certificate no.', value: null, confidence: 'low', money: false, region: { top: 73, left: 8, w: 40, h: 5 } },
  { key: 'handover', label: 'Handover', value: 'Q3 2028 (est.)', confidence: 'med', money: false, region: { top: 84, left: 8, w: 45, h: 5 } },
];

const STRINGS = {
  en: { dueThisWeek: "What's due this week", today: 'Tue · 23 Jun', greeting: 'Morning, Yousef',
        markPaid: 'Mark paid', nudge: 'Nudge buyer', addDeal: 'Add deal', deals: 'Deals', comms: 'Comms', you: 'You', due: 'Due' },
  ar: { dueThisWeek: 'المستحق هذا الأسبوع', today: 'الثلاثاء · ٢٣ يونيو', greeting: 'صباح الخير، يوسف',
        markPaid: 'تحديد كمدفوع', nudge: 'تذكير المشتري', addDeal: 'إضافة صفقة', deals: 'الصفقات', comms: 'المراسلات', you: 'حسابك', due: 'مستحق' },
};

Object.assign(window, { Icon, AED, DEALS, SPA_FIELDS, STRINGS });
