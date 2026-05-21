// variation-a.jsx — Classic admin dashboard
// Sidebar nav + dense screens. State for nav (dashboard/generate/preview)
// and upload step lives in VariationA.

function VariationA({ accent = '#1E40AF', density = 'comfy' }) {
  const [screen, setScreen] = React.useState('dashboard');
  const [uploadStep, setUploadStep] = React.useState(0); // 0=empty, 1=template ok, 2=excel ok, 3=ready
  const [selectedPage, setSelectedPage] = React.useState(0);

  const reset = () => {
    setUploadStep(0);
    setSelectedPage(0);
  };

  const go = (s) => {
    if (s === 'generate') reset();
    setScreen(s);
  };

  const padY = density === 'compact' ? 18 : 28;

  return (
    <div data-screen-label="A · MerchanTFile Admin" style={{
      width: '100%', height: '100%', display: 'flex',
      background: '#f8fafc', color: '#0f172a',
      fontFamily: 'Geist, system-ui, sans-serif', fontSize: 14,
      overflow: 'hidden',
    }}>
      <Sidebar screen={screen} setScreen={go} accent={accent} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar screen={screen} accent={accent} />
        <div style={{ flex: 1, overflow: 'auto', padding: `${padY}px 36px ${padY + 12}px` }}>
          {screen === 'dashboard' && <DashboardScreen accent={accent} go={go} />}
          {screen === 'generate'  && <GenerateScreen accent={accent} uploadStep={uploadStep} setUploadStep={setUploadStep} onGenerate={() => go('preview')} />}
          {screen === 'preview'   && <PreviewScreen accent={accent} selectedPage={selectedPage} setSelectedPage={setSelectedPage} onBack={() => go('generate')} onDownload={() => go('success')} />}
          {screen === 'success'   && <SuccessScreen accent={accent} onNew={() => go('generate')} onDashboard={() => go('dashboard')} />}
          {screen === 'history'   && <HistoryScreen accent={accent} />}
          {screen === 'settings'  && <SettingsScreen accent={accent} />}
        </div>
      </main>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────
function Sidebar({ screen, setScreen, accent }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard',    icon: <I.Dashboard /> },
    { id: 'generate',  label: 'Generate PDF', icon: <I.FilePlus /> },
    { id: 'history',   label: 'History',      icon: <I.History /> },
    { id: 'settings',  label: 'Settings',     icon: <I.Settings /> },
  ];
  return (
    <aside style={{
      width: 224, background: '#fff', borderRight: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <I.Logo size={28} color={accent} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>MerchanTFile</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>Admin Console</span>
        </div>
      </div>

      <nav style={{ padding: '10px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => {
          const active = screen === it.id || (screen === 'preview' && it.id === 'generate') || (screen === 'success' && it.id === 'generate');
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6, border: 'none',
              background: active ? `${accent}14` : 'transparent',
              color: active ? accent : '#475569',
              fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}>
              {it.icon}
              <span>{it.label}</span>
              {it.id === 'generate' && (
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                  background: active ? '#fff' : '#f1f5f9', color: active ? accent : '#64748b',
                  padding: '1px 6px', borderRadius: 4,
                }}>
                  NEW
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 12, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: accent,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600,
        }}>RH</div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Rina Hadi</div>
          <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            admin@merchantfile.id
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Top bar ────────────────────────────────────────────────────────────
function TopBar({ screen, accent }) {
  const titles = {
    dashboard: ['Dashboard'],
    generate:  ['Generate PDF', 'New job'],
    preview:   ['Generate PDF', 'Preview'],
    success:   ['Generate PDF', 'Complete'],
    history:   ['History'],
    settings:  ['Settings'],
  };
  const crumbs = titles[screen] || ['Dashboard'];
  return (
    <header style={{
      height: 56, borderBottom: '1px solid #e2e8f0', background: '#fff',
      display: 'flex', alignItems: 'center', padding: '0 36px', gap: 16, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <I.ChevronRight size={14} style={{ color: '#cbd5e1' }} />}
            <span style={{
              fontSize: 14,
              fontWeight: i === crumbs.length - 1 ? 600 : 500,
              color: i === crumbs.length - 1 ? '#0f172a' : '#64748b',
            }}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f1f5f9', padding: '6px 12px', borderRadius: 6,
        width: 280, color: '#94a3b8',
      }}>
        <I.Search size={14} />
        <span style={{ fontSize: 13 }}>Search jobs, files…</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8', border: '1px solid #cbd5e1', padding: '1px 5px', borderRadius: 3 }}>⌘ K</span>
      </div>
      <button style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', position: 'relative' }}>
        <I.Bell size={16} />
        <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, background: accent, borderRadius: 999, border: '2px solid #fff' }} />
      </button>
    </header>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────
function DashboardScreen({ accent, go }) {
  const stats = [
    { label: 'Total generated', value: '1,284', delta: '+128 this week', tone: 'up' },
    { label: 'This month',      value: '342',   delta: '+24 vs. last',   tone: 'up' },
    { label: 'Templates',       value: '6',     delta: '2 in draft',     tone: 'neutral' },
    { label: 'Failed jobs',     value: '3',     delta: '-2 vs. last week', tone: 'down' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>
            Welcome back, Rina
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            Here's what happened with your document jobs today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" icon={<I.Refresh size={14} />}>Refresh</Btn>
          <Btn accent={accent} icon={<I.Plus size={14} />} onClick={() => go('generate')}>New job</Btn>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: 16,
          }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1, fontFamily: 'Geist, system-ui, sans-serif' }}>
              {s.value}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: s.tone === 'up' ? '#15803d' : s.tone === 'down' ? '#b91c1c' : '#64748b' }}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: quick action + recent jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 12 }}>
        {/* Quick generate card */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 18,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: `${accent}14`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I.Sparkle />
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Generate from Excel</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Upload a template + spreadsheet</div>
            </div>
          </div>

          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Pick a PDF/Word template with placeholders', 'Upload your Excel data file', 'Preview, then download all pages'].map((t, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12.5, color: '#475569' }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ol>

          <Btn accent={accent} icon={<I.ArrowRight size={14} />} onClick={() => go('generate')} style={{ marginTop: 4, justifyContent: 'space-between', width: '100%' }}>
            Start new job
          </Btn>
        </div>

        {/* Recent jobs table */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Recent jobs</div>
            <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => go('history')}>
              View all →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Job', 'File', 'Rows', 'Status', 'When'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 18px', fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_JOBS.map((j) => (
                <tr key={j.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 18px', fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 12, color: '#475569' }}>{j.id}</td>
                  <td style={{ padding: '10px 18px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <I.Excel size={14} style={{ color: '#16a34a' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180, whiteSpace: 'nowrap' }}>{j.file}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 18px', color: '#475569' }}>{j.rows}</td>
                  <td style={{ padding: '10px 18px' }}>
                    <Badge tone={j.status === 'completed' ? 'success' : 'failed'}>{j.status}</Badge>
                  </td>
                  <td style={{ padding: '10px 18px', color: '#64748b' }}>{j.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Generate (upload) ──────────────────────────────────────────────────
function GenerateScreen({ accent, uploadStep, setUploadStep, onGenerate }) {
  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>New PDF generation job</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            Upload a template and an Excel file. Each row becomes one filled page.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <UploadCard
          accent={accent}
          step={1}
          title="Template"
          subtitle="Document with placeholders {{name}}, {{nik}}"
          accepted=".pdf, .docx"
          filename={uploadStep >= 1 ? 'registration_form.pdf' : null}
          fileSize="184 KB"
          done={uploadStep >= 1}
          onUpload={() => setUploadStep(Math.max(1, uploadStep))}
        />
        <UploadCard
          accent={accent}
          step={2}
          title="Data file"
          subtitle="Excel sheet with columns: Full Name, NIK"
          accepted=".xlsx, .xls, .csv"
          filename={uploadStep >= 2 ? 'pendaftaran_jan_2026.xlsx' : null}
          fileSize="32 KB · 5 rows"
          done={uploadStep >= 2}
          disabled={uploadStep < 1}
          onUpload={() => setUploadStep(Math.max(2, uploadStep))}
        />
      </div>

      {/* Data preview, only when excel uploaded */}
      {uploadStep >= 2 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Data preview</span>
              <Badge tone="success">5 rows · all valid</Badge>
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Sheet: <span style={{ fontFamily: 'Geist Mono, ui-monospace, monospace', color: '#0f172a' }}>Sheet1</span>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: 36, padding: '8px 14px', textAlign: 'left', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>#</th>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>Full Name</th>
                <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>NIK</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ROWS.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '9px 14px', color: '#94a3b8', fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '9px 14px', fontFamily: 'Geist Mono, ui-monospace, monospace', letterSpacing: 1 }}>{r.nik}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', fontSize: 13 }}>
          <I.CheckCircle size={18} style={{ color: uploadStep >= 2 ? '#22c55e' : '#cbd5e1' }} />
          {uploadStep >= 2
            ? <span><b>Ready.</b> 5 pages will be generated from <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>registration_form.pdf</code>.</span>
            : <span>Upload both files to continue.</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary">Cancel</Btn>
          <Btn accent={accent} icon={<I.ArrowRight size={14} />} disabled={uploadStep < 2} onClick={onGenerate}>
            Generate &amp; preview
          </Btn>
        </div>
      </div>
    </div>
  );
}

function UploadCard({ step, title, subtitle, accepted, filename, fileSize, done, disabled, onUpload, accent }) {
  const [drag, setDrag] = React.useState(false);
  if (done) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
          <span style={{ width: 20, height: 20, borderRadius: 999, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I.Check size={12} />
          </span>
          Step {step} · {title}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 14, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, border: '1px solid #e2e8f0' }}>
            {filename.endsWith('.xlsx') ? <I.Excel /> : <I.FileText />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{fileSize}</div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}>
            <I.Trash size={14} />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 10, opacity: disabled ? 0.5 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
        <span style={{ width: 20, height: 20, borderRadius: 999, background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
          {step}
        </span>
        Step {step} · {title}
      </div>
      <div
        onMouseEnter={() => !disabled && setDrag(true)}
        onMouseLeave={() => setDrag(false)}
        onClick={() => !disabled && onUpload()}
        style={{
          border: `1.5px dashed ${drag ? accent : '#cbd5e1'}`,
          background: drag ? `${accent}08` : '#fafbfc',
          borderRadius: 6, padding: '22px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .15s',
        }}>
        <div style={{ color: accent }}><I.Upload size={22} /></div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>
          Drag &amp; drop or <span style={{ color: accent }}>browse</span>
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>{subtitle}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'Geist Mono, ui-monospace, monospace', marginTop: 4 }}>
          {accepted} · max 10 MB
        </div>
      </div>
    </div>
  );
}

// ─── Preview ────────────────────────────────────────────────────────────
function PreviewScreen({ accent, selectedPage, setSelectedPage, onBack, onDownload }) {
  const total = SAMPLE_ROWS.length;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>Preview output · 5 pages</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
            Review the merged document. Download all pages as a single PDF.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" icon={<I.ArrowLeft size={14} />} onClick={onBack}>Back</Btn>
          <Btn accent={accent} icon={<I.Download size={14} />} onClick={onDownload}>Download PDF</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12, height: 600 }}>
        {/* Thumbnail rail */}
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: 12, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, padding: '0 4px' }}>
            Pages
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SAMPLE_ROWS.map((row, i) => (
              <button key={i} onClick={() => setSelectedPage(i)} style={{
                display: 'flex', flexDirection: 'column', gap: 6, padding: 6,
                border: i === selectedPage ? `2px solid ${accent}` : '2px solid transparent',
                background: i === selectedPage ? `${accent}08` : 'transparent',
                borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <DocPage row={row} index={i} total={total} width={176} accent={accent} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600 }}>Page {i + 1}</span>
                  <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                    {row.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main preview */}
        <div style={{
          background: '#eef2f7', border: '1px solid #e2e8f0', borderRadius: 8,
          padding: 24, overflow: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
          position: 'relative',
        }}>
          {/* Toolbar */}
          <div style={{
            position: 'sticky', top: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', marginBottom: 16,
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
            padding: '6px 10px', fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => setSelectedPage(Math.max(0, selectedPage - 1))} disabled={selectedPage === 0} style={pillBtn(selectedPage === 0)}>
                <I.ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 12, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>
                {selectedPage + 1} / {total}
              </span>
              <button onClick={() => setSelectedPage(Math.min(total - 1, selectedPage + 1))} disabled={selectedPage === total - 1} style={pillBtn(selectedPage === total - 1)}>
                <I.ChevronRight size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
              <span style={{ fontWeight: 500 }}>{SAMPLE_ROWS[selectedPage].name}</span>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span style={{ fontFamily: 'Geist Mono, ui-monospace, monospace', color: '#64748b' }}>{SAMPLE_ROWS[selectedPage].nik}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button style={pillBtn()}><I.Eye size={14} /></button>
              <button style={pillBtn()}><I.Download size={14} /></button>
            </div>
          </div>

          <DocPage row={SAMPLE_ROWS[selectedPage]} index={selectedPage} total={total} width={360} accent={accent} />
        </div>
      </div>
    </div>
  );
}

function pillBtn(disabled) {
  return {
    width: 26, height: 26, borderRadius: 4, border: 'none',
    background: 'transparent', color: disabled ? '#cbd5e1' : '#475569',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
  };
}

// ─── Success ────────────────────────────────────────────────────────────
function SuccessScreen({ accent, onNew, onDashboard }) {
  return (
    <div style={{ maxWidth: 560, margin: '60px auto 0', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 999, background: '#dcfce7',
        color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <I.Check size={28} />
      </div>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>Job complete</h1>
      <p style={{ margin: '6px 0 20px', color: '#64748b', fontSize: 13 }}>
        5 pages generated · job <span style={{ fontFamily: 'Geist Mono, ui-monospace, monospace', color: '#0f172a' }}>JOB-0143</span> · 1.2 MB
      </p>
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: 16, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 6, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I.FileText />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>pendaftaran_jan_2026.pdf</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>5 pages · saved to <span style={{ fontFamily: 'Geist Mono, ui-monospace, monospace' }}>~/Downloads</span></div>
        </div>
        <Btn accent={accent} icon={<I.Download size={14} />}>Download again</Btn>
      </div>
      <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <Btn variant="secondary" onClick={onDashboard}>Back to dashboard</Btn>
        <Btn accent={accent} variant="ghost" icon={<I.Plus size={14} />} onClick={onNew}>Start new job</Btn>
      </div>
    </div>
  );
}

function HistoryScreen({ accent }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600 }}>History</h1>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 40, textAlign: 'center', color: '#64748b' }}>
        Full job history table goes here.
      </div>
    </div>
  );
}
function SettingsScreen({ accent }) {
  return (
    <div>
      <h1 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600 }}>Settings</h1>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 40, textAlign: 'center', color: '#64748b' }}>
        Template defaults, account, and integrations.
      </div>
    </div>
  );
}

Object.assign(window, { VariationA });
