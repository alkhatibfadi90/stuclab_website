'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

// ============================================================
// CALCULATION ENGINE — verified against Python (3 sig figs)
// AS 3600:2018 Cl 6.2.4.2 + Table 6.2.4 + Cl 3.1.1.3
// ============================================================
function interp(x, xs, ys) {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i += 1) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      return ys[i] + ((ys[i + 1] - ys[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]);
    }
  }
  return ys[0];
}

function computeResults(raw) {
  const num = (v) => parseFloat(v) || 0;

  const Lw = num(raw.width);          // mm
  const tw = num(raw.thickness);      // mm
  const fc = num(raw.fc);             // MPa
  const Nstar = num(raw.axial_n);     // kN (compression positive)
  const S22 = num(raw.stress_s22);    // MPa

  const Ag = Lw * tw;                 // mm^2
  const Ig = (tw * Math.pow(Lw, 3)) / 12.0; // mm^4
  const fct = 0.36 * Math.sqrt(fc);   // MPa — Cl 3.1.1.3

  const cracked = Math.abs(S22) >= fct;

  const ratio_raw = (Nstar * 1000.0) / (Ag * fc);
  const ratio = Math.max(0.0, ratio_raw);

  let modifier;
  let mode;
  let modeNote;
  let mode_ref;
  if (!cracked) {
    modifier = 1.0;
    mode = 'Uncracked';
    modeNote = "S22 < f'ct — full gross section";
    mode_ref = 'Cl 6.2.4.2(a)';
  } else {
    modifier = interp(ratio, [0.0, 0.1, 0.2], [0.25, 0.30, 0.40]);
    mode = 'Cracked';
    if (ratio_raw < 0) {
      modeNote = 'Net tension — ratio clamped at 0';
    } else if (ratio >= 0.2) {
      modeNote = 'Ratio ≥ 0.2 — ceiling of table';
    } else {
      modeNote = 'Linear interpolation per Table 6.2.4';
    }
    mode_ref = 'Cl 6.2.4.2(b)';
  }
  const Ieff = modifier * Ig;

  const modCardClass = cracked ? 'warn' : 'pass';
  const modStatusText = cracked ? 'Cracked · Reduced' : 'Uncracked · Full Ig';

  return {
    Lw, tw, fc, Nstar, S22,
    Ag, Ig, fct,
    cracked, ratio_raw, ratio,
    modifier, mode, modeNote, mode_ref,
    Ieff, modCardClass, modStatusText,
  };
}

const fmt = (v, d = 1) => v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (v) => Math.round(v).toLocaleString('en-AU');
const fmtSci = (v) => v.toExponential(3).replace('e+', '×10^').replace('e-', '×10^-');

const DEFAULTS = {
  project: '',
  jobno: '',
  byname: '',
  width: '3000',
  thickness: '300',
  fc: '40',
  axial_n: '2000',
  stress_s22: '4.5',
};

// Per-tool CSS additions — promotion candidate when 2+ tools need it.
// Currently used only by this tool. Keep inline; do not move to labkit.css.
const SOLO_CARD_CSS = `
.labkit-page .capacity-grid.solo {
  grid-template-columns: 1fr;
  max-width: 520px;
  margin: 0 auto;
}
.labkit-page .capacity-grid.solo .result-card {
  text-align: center;
  padding: 22px 24px;
}
.labkit-page .capacity-grid.solo .result-card .rc-label { margin-bottom: 12px; }
.labkit-page .capacity-grid.solo .result-card .rc-value {
  font-size: 36px;
  margin-bottom: 12px;
}
.labkit-page .capacity-grid.solo .result-card .rc-status {
  justify-content: center;
}
.labkit-page .capacity-grid.solo .result-card .rc-note {
  text-align: center;
  margin-top: 6px;
}
`;

function WallStiffnessModifier() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimeout = useRef(null);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const r = useMemo(() => computeResults(inputs), [inputs]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (!document.getElementById('MathJax-script')) {
      const script = document.createElement('script');
      script.id = 'MathJax-script';
      script.async = true;
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (theoryOpen && window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise();
    }
  }, [theoryOpen]);

  useEffect(() => {
    const handleBeforePrint = () => {
      if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        window.MathJax.typesetPromise();
      }
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  useEffect(() => () => {
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
  }, []);

  const update = (field) => (e) => setInputs((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCalcClick = () => {
    setFlash(true);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setFlash(false), 1200);
  };

  const toggleTheory = () => setTheoryOpen((prev) => !prev);

  const {
    Lw, tw, fc, Nstar, S22,
    Ag, fct,
    cracked, ratio_raw, ratio,
    modifier, mode, modeNote, mode_ref,
    Ieff, modCardClass, modStatusText,
  } = r;

  const printRows = [
    { label: <>Wall width, L<sub>w</sub></>, value: `${Lw} mm` },
    { label: <>Wall thickness, t<sub>w</sub></>, value: `${tw} mm` },
    { label: <>f'<sub>c</sub></>, value: `${fc} MPa` },
    { label: 'Axial load N* (compression +ve)', value: `${Nstar} kN` },
    { label: 'In-plane membrane stress S22', value: `${S22} MPa` },
  ];

  const crackRows = [
    { label: <>Wall length, L<sub>w</sub></>, value: `${fmtInt(Lw)} mm`, ref: '—' },
    { label: <>Wall thickness, t<sub>w</sub></>, value: `${fmtInt(tw)} mm`, ref: '—' },
    { label: <>Gross area, A<sub>g</sub> = L<sub>w</sub>·t<sub>w</sub></>, value: `${fmtInt(Ag)} mm²`, ref: '—' },
    { label: <>Characteristic strength, f'<sub>c</sub></>, value: `${fmt(fc, 0)} MPa`, ref: '—' },
    { label: <>Direct tensile strength, f'<sub>ct</sub> = 0.36·√f'<sub>c</sub></>, value: `${fmt(fct, 3)} MPa`, ref: 'Cl 3.1.1.3' },
    { label: <>Applied stress, |S22|</>, value: `${fmt(Math.abs(S22), 3)} MPa`, ref: 'Input (shell)' },
  ];

  let interpDescription = null;
  if (cracked) {
    if (ratio_raw < 0) {
      interpDescription = <>Net tension — N* &lt; 0 → ratio clamped to 0</>;
    } else if (ratio >= 0.2) {
      interpDescription = <>Ratio ≥ 0.2 → adopt ceiling value 0.40·I<sub>g</sub></>;
    } else if (ratio <= 0.1) {
      interpDescription = (
        <>
          Interpolate between (0.0, 0.25) and (0.1, 0.30): I<sub>eff</sub>/I<sub>g</sub> = 0.25 + ({fmt(ratio, 4)} − 0)/0.1 · (0.30 − 0.25) = <strong>{fmt(modifier, 4)}</strong>
        </>
      );
    } else {
      interpDescription = (
        <>
          Interpolate between (0.1, 0.30) and (0.2, 0.40): I<sub>eff</sub>/I<sub>g</sub> = 0.30 + ({fmt(ratio, 4)} − 0.1)/0.1 · (0.40 − 0.30) = <strong>{fmt(modifier, 4)}</strong>
        </>
      );
    }
  }

  const axialRatioMeta = ratio_raw < 0
    ? 'Net tension — clamped to 0'
    : ratio >= 0.2
      ? 'Above 0.2 — ceiling'
      : 'Within table range';

  return (
    <div className="labkit-page">
      <style>{SOLO_CARD_CSS}</style>
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span>
            <span className="sep">›</span>
            <span>Modelling &amp; Analysis</span>
            <span className="sep">›</span>
            <span className="current">Wall Stiffness Modifier</span>
          </div>
        </div>
        <button className="btn-pdf" onClick={() => window.print()} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
          </svg>
          Download PDF
        </button>
      </div>

      <div className="workspace">

        <div className="print-letterhead">
          <div className="lh-row">
            <div className="lh-brand">Struc<span className="lab">Lab</span></div>
            <div className="lh-meta">
              Engineering Calculation<br />
              struclab.com.au
            </div>
          </div>
        </div>

        <div className="print-project-block">
          <table>
            <tbody>
              <tr>
                <td className="ppb-label">Project</td>
                <td>{inputs.project || '—'}</td>
                <td className="ppb-label">Job No.</td>
                <td style={{ width: '18%' }}>{inputs.jobno || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Calculation</td>
                <td>Wall Stiffness Modifier</td>
                <td className="ppb-label">By</td>
                <td>{inputs.byname || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Reference</td>
                <td>AS 3600:2018 Clause 6.2.4.2 &amp; Table 6.2.4</td>
                <td className="ppb-label">Date</td>
                <td>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Wall Stiffness Modifier</h1>
          <div className="subtitle">AS 3600:2018 Cl 6.2.4.2 · Cracked-section I<sub>eff</sub> for wall elements · ULS elastic analysis</div>
        </div>

        <div className="body">

          <aside className="inputs-col">

            <div className="col-heading">
              <h2 className="label">Inputs</h2>
              <p className="hint">Units: mm, kN, MPa unless stated</p>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field">
                <label>Project name</label>
                <input type="text" value={inputs.project} onChange={update('project')} placeholder="e.g. 123 Smith St Tower" />
              </div>
              <div className="input-row" style={{ marginBottom: 0 }}>
                <div className="input-field" style={{ marginBottom: 0 }}>
                  <label>Job no.</label>
                  <input type="text" value={inputs.jobno} onChange={update('jobno')} placeholder="J-1024" />
                </div>
                <div className="input-field" style={{ marginBottom: 0 }}>
                  <label>Designed by</label>
                  <input type="text" value={inputs.byname} onChange={update('byname')} placeholder="Initials" />
                </div>
              </div>
            </div>

            <h3 className="input-group-title">Wall Geometry</h3>
            <div className="input-row">
              <div className="input-field">
                <label>Width L<sub>w</sub> (mm)</label>
                <input type="number" value={inputs.width} onChange={update('width')} step="100" />
              </div>
              <div className="input-field">
                <label>Thickness t<sub>w</sub> (mm)</label>
                <input type="number" value={inputs.thickness} onChange={update('thickness')} step="50" />
              </div>
            </div>

            <h3 className="input-group-title">Material</h3>
            <div className="input-field">
              <label>f'<sub>c</sub> (MPa)</label>
              <select value={inputs.fc} onChange={update('fc')}>
                <option value="25">25</option>
                <option value="32">32</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="65">65</option>
                <option value="80">80</option>
                <option value="100">100</option>
              </select>
            </div>

            <h3 className="input-group-title">Analysis Actions</h3>
            <div className="input-field">
              <label>Axial load N* (kN)</label>
              <input type="number" value={inputs.axial_n} onChange={update('axial_n')} step="100" />
            </div>
            <p className="input-helper">Compression positive. Net tension (N* &lt; 0) clamps axial ratio at zero.</p>
            <div className="input-field">
              <label>In-plane tensile stress S22 (MPa)</label>
              <input type="number" value={inputs.stress_s22} onChange={update('stress_s22')} step="0.1" />
            </div>
            <p className="input-helper">Peak membrane stress from shell element output (ETABS / SAP / SAFE). Used to determine cracked/uncracked state.</p>

            <button
              className="btn-calc"
              type="button"
              onClick={handleCalcClick}
              style={flash ? { background: 'var(--pass)' } : undefined}
            >
              {flash ? '✓ Calculation refreshed' : <>Compute I<sub>eff</sub></>}
            </button>
          </aside>

          <main className="results-col">

            <div className="results-toolbar">
              <button
                type="button"
                className={`toggle-link ${theoryOpen ? 'open' : ''}`}
                onClick={toggleTheory}
              >
                <span className="arrow">›</span> {theoryOpen ? 'Hide theory' : 'Theory & equations'}
              </button>
            </div>

            <div className={`theory-panel ${theoryOpen ? 'open' : ''}`}>
              <h4>Method &amp; Equations</h4>
              <p>AS 3600:2018 Cl 6.2.4.2 specifies the moment of inertia to use for walls in elastic analysis of lateral force-resisting systems at the ultimate limit state. The clause distinguishes between uncracked and cracked behaviour:</p>
              <ul>
                <li><strong>Cl 6.2.4.2(a) — Uncracked sections:</strong> use the full gross uncracked section (I<sub>eff</sub> = I<sub>g</sub>, i.e. modifier = 1.0).</li>
                <li><strong>Cl 6.2.4.2(b) — Cracked sections:</strong> apply the modifier from Table 6.2.4, which varies with the axial load ratio N*/(A<sub>g</sub>·f'<sub>c</sub>).</li>
              </ul>

              <h5>Cracking criterion — Cl 3.1.1.3</h5>
              <p>A wall is taken as cracked when the peak in-plane tensile membrane stress S22 (from elastic shell analysis) reaches the characteristic uniaxial tensile strength of concrete:</p>
              <div className="eq-block">{"$$f'_{ct} = 0.36 \\sqrt{f'_c}$$"}</div>
              <p>Direct (uniaxial) tensile strength is used rather than flexural f'<sub>ct.f</sub> = 0.6·√f'<sub>c</sub> because S22 from a shell element represents a membrane stress with no strain gradient through the wall thickness. The flexural value would non-conservatively delay the cracked classification.</p>

              <h5>Table 6.2.4 — wall modifiers (cracked)</h5>
              <div className="eq-block">
                {"$$\\begin{array}{ll} N^*/(A_g f'_c) \\geq 0.2 : & I_{\\text{eff}} = 0.40\\, I_g \\\\ N^*/(A_g f'_c) = 0.1 : & I_{\\text{eff}} = 0.30\\, I_g \\\\ N^*/(A_g f'_c) = 0.0 : & I_{\\text{eff}} = 0.25\\, I_g \\end{array}$$"}
              </div>
              <p>For intermediate values of the axial ratio, linear interpolation is permitted (Table 6.2.4 footnote). Net tension (N* &lt; 0) is outside the table's range and is conservatively clamped at the ratio = 0 row (I<sub>eff</sub> = 0.25·I<sub>g</sub>); engineers expecting significant net tension in a wall should consider a separate detailed assessment.</p>

              <div className="sketch">
                <svg viewBox="0 0 360 220" width="100%" style={{ maxWidth: '360px' }}>
                  <line x1="50" y1="180" x2="320" y2="180" stroke="#8E887D" strokeWidth="1" />
                  <line x1="50" y1="180" x2="50" y2="30" stroke="#8E887D" strokeWidth="1" />
                  <line x1="50" y1="180" x2="50" y2="184" stroke="#8E887D" />
                  <line x1="140" y1="180" x2="140" y2="184" stroke="#8E887D" />
                  <line x1="230" y1="180" x2="230" y2="184" stroke="#8E887D" />
                  <line x1="320" y1="180" x2="320" y2="184" stroke="#8E887D" />
                  <text x="50" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">0.0</text>
                  <text x="140" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">0.1</text>
                  <text x="230" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">0.2</text>
                  <text x="320" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">≥0.2</text>
                  <text x="185" y="213" fill="#C8C2B5" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Sans">N* / (Ag · f'c)</text>
                  <line x1="46" y1="155" x2="50" y2="155" stroke="#8E887D" />
                  <line x1="46" y1="140" x2="50" y2="140" stroke="#8E887D" />
                  <line x1="46" y1="110" x2="50" y2="110" stroke="#8E887D" />
                  <line x1="46" y1="30" x2="50" y2="30" stroke="#8E887D" />
                  <text x="42" y="158" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">0.25</text>
                  <text x="42" y="143" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">0.30</text>
                  <text x="42" y="113" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">0.40</text>
                  <text x="42" y="33" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">1.00</text>
                  <text x="20" y="105" fill="#C8C2B5" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Sans" transform="rotate(-90 20 105)">Ieff / Ig</text>
                  <line x1="50" y1="30" x2="320" y2="30" stroke="#C49A2E" strokeWidth="2" strokeDasharray="4 3" />
                  <text x="180" y="22" fill="#C49A2E" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Sans">Uncracked: Ieff = 1.0·Ig — Cl 6.2.4.2(a)</text>
                  <polyline points="50,155 140,140 230,110 320,110" stroke="#E0B548" strokeWidth="2.2" fill="none" />
                  <circle cx="50" cy="155" r="3" fill="#E0B548" />
                  <circle cx="140" cy="140" r="3" fill="#E0B548" />
                  <circle cx="230" cy="110" r="3" fill="#E0B548" />
                  <text x="245" y="103" fill="#E0B548" fontSize="10" fontFamily="IBM Plex Sans">Cracked — Table 6.2.4</text>
                </svg>
              </div>

              <h5>Limitations &amp; Assumptions</h5>
              <ul>
                <li>For <strong>ULS elastic analysis only</strong> (lateral force distribution, period, inter-storey drift). Serviceability deflection of slabs/beams uses Cl 8.5/9.5 Branson-based I<sub>ef</sub> — a different method not implemented here.</li>
                <li>S22 is taken as the peak in-plane membrane stress from shell-element output. The engineer must judge where to extract S22 (panel average vs. edge peak vs. specific load combo) — the tool does not extract this automatically.</li>
                <li>Cracking criterion uses direct tensile strength f'<sub>ct</sub> per Cl 3.1.1.3, on the basis that S22 from a shell is a membrane stress.</li>
                <li>Net tension (N* &lt; 0) is clamped to ratio = 0; this is outside the explicit range of Table 6.2.4 and engineers should consider whether a more detailed assessment is warranted.</li>
                <li>Does not address shear-stiffness modifiers, P-delta amplification, or non-linear cracked behaviour — refer to AS 3600 Section 6 and seismic guidance (e.g. AS 1170.4) for those effects.</li>
                <li>Single wall element only. Coupled walls, walls with openings, and walls connected to slabs above/below may require separate consideration of effective stiffness at the connection.</li>
              </ul>
            </div>

            {/* Print-only applied actions */}
            <section className="print-only" style={{ display: 'none' }}>
              <div className="section-heading">
                <h3>Applied Analysis Inputs</h3>
                <span className="ref">As input</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Source</th></tr></thead>
                <tbody>
                  {printRows.map((row, i) => (
                    <tr key={i}>
                      <td className="label">{row.label}</td>
                      <td className="value">{row.value}</td>
                      <td className="ref">Input</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <div className="section-heading">
                <h3>Analysis Parameters</h3>
                <span className="ref">Derived quantities</span>
              </div>
              <div className="demand-grid">
                <div className="demand-card">
                  <div className="dc-label">A<sub>g</sub></div>
                  <div className="dc-value">{fmtInt(Ag)} mm²</div>
                  <div className="dc-meta">L<sub>w</sub> × t<sub>w</sub></div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">f'<sub>ct</sub> (direct tension)</div>
                  <div className="dc-value">{fmt(fct, 3)} MPa</div>
                  <div className="dc-meta">0.36·√f'<sub>c</sub> · Cl 3.1.1.3</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">Axial ratio N*/(A<sub>g</sub>·f'<sub>c</sub>)</div>
                  <div className="dc-value">{fmt(ratio_raw, 4)}</div>
                  <div className="dc-meta">{axialRatioMeta}</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">I<sub>eff</sub> (absolute)</div>
                  <div className="dc-value">{fmtSci(Ieff)} mm⁴</div>
                  <div className="dc-meta">modifier × I<sub>g</sub></div>
                </div>
              </div>
            </section>

            <section>
              <div className="section-heading">
                <h3>Stiffness Modifier</h3>
                <span className="ref">AS 3600 Cl 6.2.4.2</span>
              </div>
              <div className="capacity-grid solo">
                <div className={`result-card ${modCardClass}`}>
                  <div className="rc-label">I<sub>eff</sub> / I<sub>g</sub> — stiffness modifier</div>
                  <div className="rc-value">{fmt(modifier, 3)}</div>
                  <div className={`rc-status ${modCardClass}`}>
                    <span className="dot"></span>{modStatusText}
                  </div>
                  <div className="rc-note">{modeNote} — {mode_ref}</div>
                </div>
              </div>
            </section>

            <section>
              <div className="section-heading">
                <h3>Cracking Assessment</h3>
                <span className="ref">AS 3600 Cl 3.1.1.3 &amp; Cl 6.2.4.2</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
                <tbody>
                  {crackRows.map((row, i) => (
                    <tr key={i}>
                      <td className="label">{row.label}</td>
                      <td className="value">{row.value}</td>
                      <td className="ref">{row.ref}</td>
                    </tr>
                  ))}
                  <tr className="summary-row">
                    <td className="label"><strong>Cracking state</strong></td>
                    <td className="value"><strong>{mode}</strong></td>
                    <td className="ref">Cl 6.2.4.2</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <div className="section-heading">
                <h3>Table 6.2.4 Lookup &amp; Interpolation</h3>
                <span className="ref">AS 3600 Table 6.2.4 (walls)</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
                <tbody>
                  {!cracked ? (
                    <>
                      <tr>
                        <td className="label">Cracked? (Cl 6.2.4.2)</td>
                        <td className="value">No</td>
                        <td className="ref">Cl 6.2.4.2(a)</td>
                      </tr>
                      <tr>
                        <td className="label">Table 6.2.4 not applied — use gross section</td>
                        <td className="value">I<sub>eff</sub> = I<sub>g</sub></td>
                        <td className="ref">Cl 6.2.4.2(a)</td>
                      </tr>
                      <tr className="summary-row">
                        <td className="label"><strong>Stiffness modifier, I<sub>eff</sub>/I<sub>g</sub></strong></td>
                        <td className="value"><strong>1.000</strong></td>
                        <td className="ref">Cl 6.2.4.2(a)</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className="label">Cracked? (Cl 6.2.4.2)</td>
                        <td className="value">Yes</td>
                        <td className="ref">Cl 6.2.4.2(b)</td>
                      </tr>
                      <tr>
                        <td className="label">N* (input)</td>
                        <td className="value">{fmt(Nstar, 0)} kN</td>
                        <td className="ref">—</td>
                      </tr>
                      <tr>
                        <td className="label">Axial ratio, N*/(A<sub>g</sub>·f'<sub>c</sub>) raw</td>
                        <td className="value">{fmt(ratio_raw, 4)}</td>
                        <td className="ref">—</td>
                      </tr>
                      <tr>
                        <td className="label">Axial ratio adopted (clamped ≥ 0)</td>
                        <td className="value">{fmt(ratio, 4)}</td>
                        <td className="ref">—</td>
                      </tr>

                      <tr className="subhead"><td colSpan={3}>Table 6.2.4 — walls</td></tr>
                      <tr>
                        <td className="label indent">N*/(A<sub>g</sub>·f'<sub>c</sub>) ≥ 0.2</td>
                        <td className="value">0.40·I<sub>g</sub></td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>
                      <tr>
                        <td className="label indent">N*/(A<sub>g</sub>·f'<sub>c</sub>) = 0.1</td>
                        <td className="value">0.30·I<sub>g</sub></td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>
                      <tr>
                        <td className="label indent">N*/(A<sub>g</sub>·f'<sub>c</sub>) = 0.0</td>
                        <td className="value">0.25·I<sub>g</sub></td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>

                      <tr className="subhead"><td colSpan={3}>Interpolation</td></tr>
                      <tr>
                        <td className="label" colSpan={2}>{interpDescription}</td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>

                      <tr className="summary-row">
                        <td className="label"><strong>Stiffness modifier, I<sub>eff</sub>/I<sub>g</sub></strong></td>
                        <td className="value"><strong>{fmt(modifier, 3)}</strong></td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </section>

            <div className="print-footer">
              StrucLab · LabKit · struclab.com.au · Generated {today}
            </div>

          </main>
        </div>

        <div className="workspace-footer">
          <span>StrucLab · LabKit · struclab.com.au</span>
          <span className="mono">Generated {today}</span>
        </div>

      </div>
    </div>
  );
}

export default WallStiffnessModifier;
