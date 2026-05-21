// shared.jsx — sample data, icons, document preview, common UI primitives.
// All components attached to window for cross-file use.

// ─── Sample data ────────────────────────────────────────────────────────
const SAMPLE_ROWS = [
  { name: 'Ahmad Saputra',   nik: '3201234567890123' },
  { name: 'Siti Rahmawati',  nik: '3201234567890124' },
  { name: 'Budi Hartono',    nik: '3275019876543210' },
  { name: 'Dewi Lestari',    nik: '3273011122334455' },
  { name: 'Andi Wijaya',     nik: '3174051122334477' },
];

const RECENT_JOBS = [
  { id: 'JOB-0142', file: 'pendaftaran_jan_2026.xlsx', rows: 24, status: 'completed',  at: '2 hours ago' },
  { id: 'JOB-0141', file: 'anggota_baru_q4.xlsx',      rows: 87, status: 'completed',  at: 'Yesterday'   },
  { id: 'JOB-0140', file: 'data_peserta_seminar.xlsx', rows: 12, status: 'completed',  at: '2 days ago'  },
  { id: 'JOB-0139', file: 'registration_form.xlsx',    rows: 56, status: 'completed',  at: '3 days ago'  },
  { id: 'JOB-0138', file: 'undangan_rapat.xlsx',       rows:  9, status: 'failed',     at: '4 days ago'  },
];

// ─── Icons (24×24, inherit currentColor) ────────────────────────────────
const I = {};
const _icon = (path) => ({ size = 18, style = {} } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
    {path}
  </svg>
);
I.Dashboard = _icon(<>
  <rect x="3" y="3" width="7" height="9" rx="1.5" />
  <rect x="14" y="3" width="7" height="5" rx="1.5" />
  <rect x="14" y="12" width="7" height="9" rx="1.5" />
  <rect x="3" y="16" width="7" height="5" rx="1.5" />
</>);
I.FilePlus = _icon(<>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
  <path d="M12 12v6M9 15h6" />
</>);
I.History = _icon(<>
  <path d="M3 12a9 9 0 1 0 3-6.7" />
  <path d="M3 4v5h5" />
  <path d="M12 7v5l3 2" />
</>);
I.Settings = _icon(<>
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9 1.7 1.7 0 0 0 4.3 7.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
</>);
I.Upload = _icon(<>
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="M17 8l-5-5-5 5" />
  <path d="M12 3v12" />
</>);
I.Download = _icon(<>
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="M7 10l5 5 5-5" />
  <path d="M12 15V3" />
</>);
I.File = _icon(<>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
</>);
I.FileText = _icon(<>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
  <path d="M9 13h6M9 17h6M9 9h2" />
</>);
I.Excel = _icon(<>
  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  <path d="M14 3v5h5" />
  <path d="M9 13l2 3 2-3M9 19l2-3 2 3" />
</>);
I.Check = _icon(<polyline points="4 12 10 18 20 6" />);
I.CheckCircle = _icon(<>
  <circle cx="12" cy="12" r="9" />
  <polyline points="8 12 11 15 16 9" />
</>);
I.X = _icon(<>
  <line x1="6" y1="6" x2="18" y2="18" />
  <line x1="18" y1="6" x2="6" y2="18" />
</>);
I.ArrowRight = _icon(<>
  <line x1="4" y1="12" x2="20" y2="12" />
  <polyline points="14 6 20 12 14 18" />
</>);
I.ArrowLeft = _icon(<>
  <line x1="20" y1="12" x2="4" y2="12" />
  <polyline points="10 18 4 12 10 6" />
</>);
I.ChevronRight = _icon(<polyline points="9 6 15 12 9 18" />);
I.ChevronLeft = _icon(<polyline points="15 6 9 12 15 18" />);
I.ChevronDown = _icon(<polyline points="6 9 12 15 18 9" />);
I.Search = _icon(<>
  <circle cx="11" cy="11" r="7" />
  <line x1="20" y1="20" x2="16.5" y2="16.5" />
</>);
I.Bell = _icon(<>
  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</>);
I.Plus = _icon(<>
  <line x1="12" y1="5" x2="12" y2="19" />
  <line x1="5" y1="12" x2="19" y2="12" />
</>);
I.Eye = _icon(<>
  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
  <circle cx="12" cy="12" r="3" />
</>);
I.Sparkle = _icon(<>
  <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
</>);
I.Trash = _icon(<>
  <polyline points="3 6 5 6 21 6" />
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  <path d="M10 11v6M14 11v6" />
  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
</>);
I.Refresh = _icon(<>
  <polyline points="23 4 23 10 17 10" />
  <polyline points="1 20 1 14 7 14" />
  <path d="M3.5 9a9 9 0 0 1 15-3.4L23 10" />
  <path d="M20.5 15a9 9 0 0 1-15 3.4L1 14" />
</>);
I.Pen = _icon(<>
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
</>);
I.Logo = ({ size = 28, color = '#1E40AF' } = {}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="2" y="2" width="28" height="28" rx="7" fill={color} />
    <path d="M9 22V10l4 6 4-6v12" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
    <circle cx="22.5" cy="20" r="2.5" fill="#fff" />
  </svg>
);

// ─── Document Preview ──────────────────────────────────────────────────
// A credible-looking "registration form" page. Used in both variations
// for thumbnails and main preview. Scales by `width` prop.
function DocPage({ row, index, total, width = 240, accent = '#1E40AF' }) {
  const ratio = 297 / 210; // A4 portrait
  const height = width * ratio;
  const pad = width * 0.08;
  return (
    <div style={{
      width, height, background: '#fff',
      boxShadow: '0 1px 0 rgba(15,23,42,0.04), 0 10px 30px -10px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.06)',
      position: 'relative', overflow: 'hidden', fontFamily: 'Geist, system-ui, sans-serif',
      color: '#0f172a', flexShrink: 0,
    }}>
      {/* Header band */}
      <div style={{ height: width * 0.14, background: accent, display: 'flex', alignItems: 'center',
                    paddingLeft: pad, paddingRight: pad, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: width * 0.025 }}>
          <div style={{ width: width * 0.05, height: width * 0.05, background: '#fff', borderRadius: 2 }} />
          <div style={{ color: '#fff', fontSize: width * 0.035, fontWeight: 600, letterSpacing: 0.5 }}>
            REGISTRATION FORM
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: width * 0.022, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>
          NO. {String(index + 1).padStart(4, '0')}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: pad, paddingTop: pad * 0.8 }}>
        <div style={{ fontSize: width * 0.028, color: '#64748b', marginBottom: pad * 0.4, lineHeight: 1.5 }}>
          Please verify the following information and sign at the bottom of the page.
        </div>

        {/* Fields */}
        <div style={{ marginTop: pad * 0.6 }}>
          <DocField label="Full Name" value={row.name} width={width} pad={pad} highlight />
          <DocField label="NIK (Card ID)" value={row.nik} width={width} pad={pad} highlight mono />
          <DocField label="Date of Issue" value="—" width={width} pad={pad} placeholder />
          <DocField label="Place" value="—" width={width} pad={pad} placeholder />
        </div>

        {/* Mid blurb */}
        <div style={{
          marginTop: pad * 0.8, padding: pad * 0.5,
          background: '#f8fafc', borderLeft: `2px solid ${accent}`,
          fontSize: width * 0.024, color: '#475569', lineHeight: 1.55,
        }}>
          By signing this form, I confirm that the information above is accurate
          and consent to its use for the stated purposes.
        </div>

        {/* Signature line */}
        <div style={{ marginTop: pad * 1.2, display: 'flex', justifyContent: 'space-between', gap: pad }}>
          <div style={{ flex: 1 }}>
            <div style={{ borderBottom: '1px solid #cbd5e1', height: pad * 1.4 }} />
            <div style={{ fontSize: width * 0.022, color: '#64748b', marginTop: pad * 0.15 }}>Applicant signature</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ borderBottom: '1px solid #cbd5e1', height: pad * 1.4 }} />
            <div style={{ fontSize: width * 0.022, color: '#64748b', marginTop: pad * 0.15 }}>Authorized officer</div>
          </div>
        </div>
      </div>

      {/* Footer pagination */}
      <div style={{
        position: 'absolute', bottom: pad * 0.5, left: pad, right: pad,
        display: 'flex', justifyContent: 'space-between',
        fontSize: width * 0.02, color: '#94a3b8',
        fontFamily: 'Geist Mono, ui-monospace, monospace',
      }}>
        <span>MerchanTFile · auto-generated</span>
        <span>Page {index + 1} of {total}</span>
      </div>
    </div>
  );
}

function DocField({ label, value, width, pad, highlight, placeholder, mono }) {
  return (
    <div style={{ marginBottom: pad * 0.45 }}>
      <div style={{ fontSize: width * 0.022, color: '#64748b', marginBottom: pad * 0.1, textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </div>
      <div style={{
        fontSize: width * 0.034,
        fontWeight: highlight ? 600 : 400,
        fontFamily: mono ? 'Geist Mono, ui-monospace, monospace' : 'inherit',
        color: placeholder ? '#cbd5e1' : '#0f172a',
        borderBottom: `1px ${highlight ? 'solid' : 'dashed'} ${highlight ? '#94a3b8' : '#e2e8f0'}`,
        paddingBottom: pad * 0.15,
        letterSpacing: mono ? 1 : 0,
      }}>
        {value}
      </div>
    </div>
  );
}

// ─── Common UI Primitives ──────────────────────────────────────────────
function Btn({ children, variant = 'primary', icon, onClick, disabled, style = {}, size = 'md', accent = '#1E40AF' }) {
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12, height: 28 },
    md: { padding: '8px 16px', fontSize: 13, height: 36 },
    lg: { padding: '12px 22px', fontSize: 14, height: 44 },
  };
  const variants = {
    primary: { background: accent, color: '#fff', border: `1px solid ${accent}` },
    secondary: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' },
    ghost: { background: 'transparent', color: '#475569', border: '1px solid transparent' },
    danger: { background: '#fff', color: '#dc2626', border: '1px solid #fecaca' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...sizes[size], ...variants[variant],
      display: 'inline-flex', alignItems: 'center', gap: 8,
      borderRadius: 6, fontWeight: 500, fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'all .15s', whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    success: { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
    failed:  { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' },
    pending: { bg: '#fef3c7', fg: '#a16207', dot: '#eab308' },
    neutral: { bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8' },
    info:    { bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px', borderRadius: 999,
      background: t.bg, color: t.fg, fontSize: 11, fontWeight: 500,
      fontFamily: 'inherit',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot }} />
      {children}
    </span>
  );
}

Object.assign(window, {
  SAMPLE_ROWS, RECENT_JOBS, I, DocPage, DocField, Btn, Badge,
});
