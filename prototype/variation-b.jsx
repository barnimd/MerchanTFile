// variation-b.jsx — Guided wizard
// Single full-width column. Top stepper. Bigger, friendlier, more spacious.
// One job at a time — minimal chrome.

function VariationB({ accent = '#1E40AF', density = 'comfy' }) {
  const [screen, setScreen] = React.useState('home');
  const [step, setStep] = React.useState(0); // 0=template, 1=excel, 2=preview, 3=done
  const [selectedPage, setSelectedPage] = React.useState(0);

  const start = () => { setStep(0); setSelectedPage(0); setScreen('wizard'); };

  return (
    <div data-screen-label="B · MerchanTFile Wizard" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fff', color: '#0f172a',
      fontFamily: 'Geist, system-ui, sans-serif', fontSize: 14,
      overflow: 'hidden',
    }}>
      <TopNavB accent={accent} screen={screen} setScreen={setScreen} onStart={start} />
      <div style={{ flex: 1, overflow: 'auto', background: '#fbfcfd' }}>
        {screen === 'home'   && <HomeB accent={accent} onStart={start} />}
        {screen === 'wizard' && <WizardB
          accent={accent} step={step} setStep={setStep}
          selectedPage={selectedPage} setSelectedPage={setSelectedPage}
          onExit={() => setScreen('home')}
        />}
      </div>
    </div>
  );
}

// ─── Top nav ────────────────────────────────────────────────────────────
function TopNavB({ accent, screen, setScreen, onStart }) {
  return (
    <header style={{
      height: 60, borderBottom: '1px solid #e2e8f0', background: '#fff',
      display: 'flex', alignItems: 'center', padding: '0 36px', gap: 24,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <I.Logo size={28} color={accent} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>MerchanTFile</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>Document generator</span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 16 }}>
        {[
          { id: 'home',   label: 'Home' },
          { id: 'wizard', label: 'New job' },
        ].map((it) => {
          const active = screen === it.id;
          return (
            <button key={it.id} onClick={() => it.id === 'wizard' ? onStart() : setScreen(it.id)} style={{
              padding: '7px 14px', border: 'none', background: 'transparent',
              fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? '#0f172a' : '#64748b', cursor: 'pointer',
              borderRadius: 6, fontFamily: 'inherit',
              boxShadow: active ? `inset 0 -2px 0 ${accent}` : 'none',
            }}>
              {it.label}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <Btn variant="ghost" size="sm" icon={<I.History size={14} />}>History</Btn>
      <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: accent,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600,
        }}>RH</div>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Rina</span>
      </div>
    </header>
  );
}

// ─── Home (dashboard) ───────────────────────────────────────────────────
function HomeB({ accent, onStart }) {
  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 36px 56px' }}>
      {/* Hero */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: 36, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 280,
          background: `radial-gradient(circle at 70% 50%, ${accent}15, transparent 60%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 999, background: `${accent}10`, color: accent, fontSize: 11, fontWeight: 500, marginBottom: 14 }}>
            <I.Sparkle size={12} /> Excel → PDF in three steps
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.15, maxWidth: 540 }}>
            Fill your template with spreadsheet data, page by page.
          </h1>
          <p style={{ margin: '10px 0 22px', color: '#475569', fontSize: 15, maxWidth: 480, lineHeight: 1.5 }}>
            Upload a template, drop in an Excel file, preview the result, then download
            a print-ready PDF — one page per row.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn accent={accent} size="lg" icon={<I.ArrowRight size={16} />} onClick={onStart}>
              Start a new job
            </Btn>
            <Btn variant="secondary" size="lg" icon={<I.FileText size={16} />}>
              How it works
            </Btn>
          </div>
        </div>
      </div>

      {/* Steps overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 24 }}>
        {[
          { n: 1, t: 'Upload template', d: 'A PDF or Word file with placeholders for Name and NIK.', i: <I.FileText /> },
          { n: 2, t: 'Drop your Excel', d: 'Two columns: Full Name and NIK. Each row becomes one page.', i: <I.Excel /> },
          { n: 3, t: 'Preview & download', d: 'Check the result, then save the full PDF in one click.', i: <I.Download /> },
        ].map((s) => (
          <div key={s.n} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}12`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.i}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', fontFamily: 'Geist Mono, ui-monospace, monospace' }}>0{s.n}</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity strip */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Recent activity</h2>
          <button style={{ background: 'transparent', border: 'none', color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>View all</button>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
          {RECENT_JOBS.slice(0, 4).map((j, i) => (
            <div key={j.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 18px',
              borderTop: i === 0 ? 'none' : '1px solid #f1f5f9',
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, background: j.status === 'failed' ? '#fef2f2' : '#dcfce7', color: j.status === 'failed' ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {j.status === 'failed' ? <I.X size={16} /> : <I.Check size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{j.file}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{j.rows} rows · {j.id}</div>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{j.at}</div>
              <Btn variant="ghost" size="sm" icon={<I.Download size={13} />}>Re-download</Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Wizard shell ───────────────────────────────────────────────────────
const WIZARD_STEPS = [
  { label: 'Template',    desc: 'PDF or Word' },
  { label: 'Data',        desc: 'Excel file' },
  { label: 'Preview',     desc: 'Check pages' },
  { label: 'Download',    desc: 'Save PDF' },
];

function WizardB({ accent, step, setStep, selectedPage, setSelectedPage, onExit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Stepper */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
            {WIZARD_STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={i}>
                  <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 92 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 999,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 13,
                      background: done ? accent : active ? '#fff' : '#fff',
                      color: done ? '#fff' : active ? accent : '#94a3b8',
                      border: active ? `2px solid ${accent}` : done ? 'none' : '2px solid #e2e8f0',
                      transition: 'all .2s',
                    }}>
                      {done ? <I.Check size={14} /> : i + 1}
                    </div>
                    <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
                      <div style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active || done ? '#0f172a' : '#94a3b8' }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.desc}</div>
                    </div>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, background: i < step ? accent : '#e2e8f0',
                      marginTop: 15, transition: 'background .2s',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: '32px 36px 56px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {step === 0 && <StepTemplate accent={accent} onNext={() => setStep(1)} onExit={onExit} />}
          {step === 1 && <StepData accent={accent} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepPreview accent={accent} selectedPage={selectedPage} setSelectedPage={setSelectedPage} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepDone accent={accent} onExit={onExit} onNew={() => setStep(0)} />}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Template ───────────────────────────────────────────────────
function StepTemplate({ accent, onNext, onExit }) {
  const [uploaded, setUploaded] = React.useState(false);
  return (
    <div>
      <StepHeader title="Upload your template" subtitle="The document we'll fill in for each row. Add placeholders like {{name}} and {{nik}} where the data should go." />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 28 }}>
        {!uploaded ? (
          <DropZone
            accent={accent}
            icon={<I.FileText size={32} />}
            title="Drop your template here"
            subtitle="Or click to browse — PDF or Word, up to 10 MB"
            onUpload={() => setUploaded(true)}
          />
        ) : (
          <FilePill accent={accent} icon={<I.FileText />} name="registration_form.pdf" meta="184 KB · 1 page · 2 placeholders found" onRemove={() => setUploaded(false)} />
        )}

        {uploaded && (
          <div style={{
            marginTop: 18, padding: 14, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <div style={{ color: '#0369a1', flexShrink: 0, marginTop: 1 }}><I.CheckCircle size={18} /></div>
            <div style={{ flex: 1, fontSize: 13, color: '#075985', lineHeight: 1.5 }}>
              We detected <b>2 placeholders</b> in your template: <code style={pillCode}>&#123;&#123;name&#125;&#125;</code> and <code style={pillCode}>&#123;&#123;nik&#125;&#125;</code>.
              Make sure your Excel has matching column names.
            </div>
          </div>
        )}
      </div>

      <WizardFooter
        accent={accent}
        primary={<Btn accent={accent} size="lg" icon={<I.ArrowRight size={15} />} disabled={!uploaded} onClick={onNext}>Continue</Btn>}
        secondary={<Btn variant="ghost" size="lg" onClick={onExit}>Cancel</Btn>}
      />
    </div>
  );
}

// ─── Step 2: Data ───────────────────────────────────────────────────────
function StepData({ accent, onNext, onBack }) {
  const [uploaded, setUploaded] = React.useState(false);
  return (
    <div>
      <StepHeader title="Upload your Excel data" subtitle="Each row generates one PDF page. We'll match column names to template placeholders." />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 28 }}>
        {!uploaded ? (
          <DropZone
            accent={accent}
            icon={<I.Excel size={32} />}
            title="Drop your spreadsheet here"
            subtitle=".xlsx, .xls, or .csv — up to 10 MB"
            onUpload={() => setUploaded(true)}
          />
        ) : (
          <>
            <FilePill accent={accent} icon={<I.Excel />} name="pendaftaran_jan_2026.xlsx" meta="32 KB · Sheet1 · 5 rows" onRemove={() => setUploaded(false)} />
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 500 }}>
                  Data preview
                </div>
                <Badge tone="success">All 5 rows valid</Badge>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ width: 36, padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>#</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        Full Name
                        <span style={{ marginLeft: 8, padding: '1px 6px', background: `${accent}14`, color: accent, borderRadius: 4, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>→ &#123;&#123;name&#125;&#125;</span>
                      </th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                        NIK
                        <span style={{ marginLeft: 8, padding: '1px 6px', background: `${accent}14`, color: accent, borderRadius: 4, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>→ &#123;&#123;nik&#125;&#125;</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 14px', color: '#94a3b8', fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 12 }}>{i + 1}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 500 }}>{r.name}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'Geist Mono, ui-monospace, monospace', letterSpacing: 1 }}>{r.nik}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <WizardFooter
        accent={accent}
        primary={<Btn accent={accent} size="lg" icon={<I.ArrowRight size={15} />} disabled={!uploaded} onClick={onNext}>Generate preview</Btn>}
        secondary={<Btn variant="secondary" size="lg" icon={<I.ArrowLeft size={15} />} onClick={onBack}>Back</Btn>}
      />
    </div>
  );
}

// ─── Step 3: Preview ────────────────────────────────────────────────────
function StepPreview({ accent, selectedPage, setSelectedPage, onNext, onBack }) {
  const total = SAMPLE_ROWS.length;
  return (
    <div>
      <StepHeader title="Preview your output" subtitle={`${total} pages ready. Click any thumbnail to inspect.`} />
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14 }}>
        {/* Thumbs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SAMPLE_ROWS.map((row, i) => (
            <button key={i} onClick={() => setSelectedPage(i)} style={{
              padding: 6, border: i === selectedPage ? `2px solid ${accent}` : '2px solid #e2e8f0',
              background: '#fff', borderRadius: 8, cursor: 'pointer',
              display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'inherit',
            }}>
              <DocPage row={row} index={i} total={total} width={56} accent={accent} />
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left', lineHeight: 1.25 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Geist Mono, ui-monospace, monospace' }}>P.{i + 1}</div>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Main */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => setSelectedPage(Math.max(0, selectedPage - 1))} style={pillBtnB(selectedPage === 0)}><I.ChevronLeft size={14} /></button>
              <span style={{ fontSize: 12, fontFamily: 'Geist Mono, ui-monospace, monospace', color: '#475569', padding: '0 8px' }}>
                {selectedPage + 1} of {total}
              </span>
              <button onClick={() => setSelectedPage(Math.min(total - 1, selectedPage + 1))} style={pillBtnB(selectedPage === total - 1)}><I.ChevronRight size={14} /></button>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              <b style={{ color: '#0f172a' }}>{SAMPLE_ROWS[selectedPage].name}</b> · <span style={{ fontFamily: 'Geist Mono, ui-monospace, monospace' }}>{SAMPLE_ROWS[selectedPage].nik}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 12, background: '#f8fafc', borderRadius: 8 }}>
            <DocPage row={SAMPLE_ROWS[selectedPage]} index={selectedPage} total={total} width={340} accent={accent} />
          </div>
        </div>
      </div>

      <WizardFooter
        accent={accent}
        primary={<Btn accent={accent} size="lg" icon={<I.Download size={15} />} onClick={onNext}>Download {total}-page PDF</Btn>}
        secondary={<Btn variant="secondary" size="lg" icon={<I.ArrowLeft size={15} />} onClick={onBack}>Back</Btn>}
      />
    </div>
  );
}

// ─── Step 4: Done ───────────────────────────────────────────────────────
function StepDone({ accent, onExit, onNew }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 0' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999, background: '#dcfce7',
        color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
      }}>
        <I.Check size={32} />
      </div>
      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: -0.4 }}>All done!</h2>
      <p style={{ margin: '8px 0 24px', color: '#64748b', fontSize: 14 }}>
        Your PDF is ready — 5 pages, 1.2 MB.
      </p>
      <div style={{
        maxWidth: 460, margin: '0 auto', textAlign: 'left',
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: 18, display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I.FileText />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>pendaftaran_jan_2026.pdf</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>5 pages · saved to Downloads</div>
        </div>
        <Btn accent={accent} icon={<I.Download size={14} />}>Open</Btn>
      </div>
      <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Btn variant="secondary" size="lg" onClick={onExit}>Back to home</Btn>
        <Btn accent={accent} variant="ghost" size="lg" icon={<I.Plus size={15} />} onClick={onNew}>Start another</Btn>
      </div>
    </div>
  );
}

// ─── Wizard helpers ─────────────────────────────────────────────────────
function StepHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>{title}</h2>
      <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function WizardFooter({ accent, primary, secondary }) {
  return (
    <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {secondary}
      <div>{primary}</div>
    </div>
  );
}

function DropZone({ icon, title, subtitle, onUpload, accent }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onUpload}
      style={{
        border: `2px dashed ${hover ? accent : '#cbd5e1'}`,
        background: hover ? `${accent}06` : '#fafbfc',
        borderRadius: 10, padding: '44px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
      }}>
      <div style={{ width: 64, height: 64, borderRadius: 999, background: hover ? `${accent}14` : '#f1f5f9', color: hover ? accent : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{subtitle}</div>
      </div>
      <Btn accent={accent} variant="secondary" icon={<I.Upload size={14} />}>Browse files</Btn>
    </div>
  );
}

function FilePill({ icon, name, meta, onRemove, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fff', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{meta}</div>
      </div>
      <Badge tone="success">Uploaded</Badge>
      <button onClick={onRemove} style={{
        width: 32, height: 32, borderRadius: 6, border: '1px solid transparent',
        background: 'transparent', color: '#94a3b8', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <I.Trash size={15} />
      </button>
    </div>
  );
}

const pillCode = {
  background: '#fff', padding: '1px 6px', borderRadius: 4,
  border: '1px solid #bae6fd',
  fontFamily: 'Geist Mono, ui-monospace, monospace', fontSize: 12,
};

function pillBtnB(disabled) {
  return {
    width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', color: disabled ? '#cbd5e1' : '#475569',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
  };
}

Object.assign(window, { VariationB });
