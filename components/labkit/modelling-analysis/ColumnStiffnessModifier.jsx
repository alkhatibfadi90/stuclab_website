'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

// ============================================================
// CALCULATION ENGINE — verified against Python (3 sig figs)
// AS 3600:2018 Cl 6.2.4.2 + Table 6.2.4 (columns)
// + Cl 3.1.1.3 (f'ct.f) + Cl 3.1.2 (Ec) + Gilbert shrinkage
// ============================================================
function Ec_AS3600(fc) {
  // Cl 3.1.2: Ec = rho_c^1.5 * 0.043 * sqrt(fcmi), rho_c = 2400, fcmi = fc + 3
  return Math.pow(2400, 1.5) * 0.043 * Math.sqrt(fc + 3);
}

function grossProps(shape, b, D) {
  if (shape === 'rect') {
    return {
      Ag: b * D,
      Z: (b * D * D) / 6.0,
      Ig: (b * D * D * D) / 12.0,
    };
  }
  // Circular, D is diameter
  return {
    Ag: (Math.PI * D * D) / 4.0,
    Z: (Math.PI * D * D * D) / 32.0,
    Ig: (Math.PI * D * D * D * D) / 64.0,
  };
}

function Ieff_columns(r_raw) {
  const r = Math.max(0.0, r_raw);
  if (r >= 0.5) return 0.80;
  if (r >= 0.2) return 0.50 + ((r - 0.2) * (0.80 - 0.50)) / 0.3;
  return 0.30 + (r * (0.50 - 0.30)) / 0.2;
}

function computeResults(raw) {
  const num = (v) => parseFloat(v) || 0;

  const shape = raw.shape;
  const b = num(raw.bw);
  const D_rect = num(raw.Dd);
  const D_circ = num(raw.Ddia);
  const D = shape === 'rect' ? D_rect : D_circ;
  const fc = num(raw.fc);
  const eps_cs = num(raw.eps_cs) * 1e-6;
  const rho_w_pct = num(raw.rho_w);
  const rho_w = rho_w_pct / 100.0;
  const Nstar = num(raw.axial_n);
  const Mstar = num(raw.moment_m);

  const Ec = Ec_AS3600(fc);
  const fctf = 0.6 * Math.sqrt(fc);
  const { Ag, Z, Ig } = grossProps(shape, shape === 'rect' ? b : D_circ, D);

  // Shrinkage stress (Gilbert, face-reinforcement convention: ρ = ρ' = ρ_w)
  const sigma_cs = ((2.5 * rho_w - 0.8 * rho_w) / (1.0 + 50.0 * rho_w)) * Ec * eps_cs;

  const Mcrt_Nmm = Z * (fctf - sigma_cs);
  const Mcrt = Mcrt_Nmm / 1e6;

  const cracked = Mstar > Mcrt;

  const ratio_raw = (Nstar * 1000.0) / (Ag * fc);
  const ratio = Math.max(0.0, ratio_raw);

  let modifier;
  let modeNote;
  let mode_ref;
  if (!cracked) {
    modifier = 1.0;
    modeNote = 'M* ≤ M_cr.t — full gross section';
    mode_ref = 'Cl 6.2.4.2(a)';
  } else {
    modifier = Ieff_columns(ratio_raw);
    if (ratio_raw < 0) {
      modeNote = 'Net tension — ratio clamped at 0';
    } else if (ratio >= 0.5) {
      modeNote = 'Ratio ≥ 0.5 — ceiling of table';
    } else {
      modeNote = 'Linear interpolation per Table 6.2.4';
    }
    mode_ref = 'Cl 6.2.4.2(b)';
  }
  const Ieff = modifier * Ig;
  const modCardClass = cracked ? 'warn' : 'pass';
  const modStatusText = cracked ? 'Cracked · Reduced' : 'Uncracked · Full Ig';

  return {
    shape, b, D_rect, D_circ, fc, eps_cs, rho_w_pct, rho_w, Nstar, Mstar,
    Ec, fctf, Ag, Z, Ig,
    sigma_cs, Mcrt,
    cracked, ratio_raw, ratio,
    modifier, modeNote, mode_ref,
    Ieff, modCardClass, modStatusText,
  };
}

const fmt = (v, d = 1) => v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (v) => Math.round(v).toLocaleString('en-AU');
const fmtExp = (v, d = 3) => {
  if (v === 0) return '0';
  return v.toExponential(d).replace('e+', '×10^').replace('e-', '×10^-');
};

const DEFAULTS = {
  project: '',
  jobno: '',
  byname: '',
  shape: 'rect',
  bw: '600',
  Dd: '600',
  Ddia: '600',
  fc: '40',
  eps_cs: '600',
  rho_w: '1.0',
  axial_n: '2500',
  moment_m: '150',
};

// Per-tool CSS — `.capacity-grid.solo` is now used by both Wall and Column
// Stiffness Modifier tools. Kept inline in both; promote to labkit.css when a
// 3rd tool needs it.
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

function ColumnStiffnessModifier() {
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
    shape, b, D_rect, D_circ, fc, eps_cs, rho_w_pct, Nstar, Mstar,
    Ec, fctf, Ag, Z,
    sigma_cs, Mcrt,
    cracked, ratio_raw, ratio,
    modifier, modeNote, mode_ref,
    Ieff, modCardClass, modStatusText,
  } = r;

  const dimStr = shape === 'rect'
    ? `Rectangular ${fmtInt(b)} × ${fmtInt(D_rect)} mm`
    : `Circular Ø${fmtInt(D_circ)} mm`;

  const printRows = [
    { label: 'Shape', value: shape === 'rect' ? 'Rectangular' : 'Circular' },
    {
      label: 'Section dimensions',
      value: shape === 'rect' ? `${inputs.bw} × ${inputs.Dd} mm` : `Ø${inputs.Ddia} mm`,
    },
    { label: <>f'<sub>c</sub></>, value: `${inputs.fc} MPa` },
    { label: <>Shrinkage strain, ε<sub>cs</sub></>, value: `${fmtInt(eps_cs * 1e6)} × 10⁻⁶` },
    { label: <>Face reinforcement, ρ<sub>w</sub></>, value: `${inputs.rho_w} %` },
    { label: 'Axial load, N* (compression +ve)', value: `${inputs.axial_n} kN` },
    { label: 'Moment, M*', value: `${inputs.moment_m} kNm` },
  ];

  const crackRows = [
    { label: 'Section', value: dimStr, ref: '—' },
    { label: <>Gross area, A<sub>g</sub></>, value: `${fmtInt(Ag)} mm²`, ref: '—' },
    { label: 'Section modulus, Z', value: `${fmtExp(Z, 3)} mm³`, ref: '—' },
    { label: <>Characteristic strength, f'<sub>c</sub></>, value: `${fmt(fc, 0)} MPa`, ref: '—' },
    { label: <>Modulus of elasticity, E<sub>c</sub></>, value: `${fmtInt(Ec)} MPa`, ref: 'Cl 3.1.2' },
    { label: <>Flexural tensile strength, f'<sub>ct.f</sub> = 0.6·√f'<sub>c</sub></>, value: `${fmt(fctf, 3)} MPa`, ref: 'Cl 3.1.1.3' },
    { label: <>Design shrinkage strain, ε<sub>cs</sub></>, value: `${fmtInt(eps_cs * 1e6)} × 10⁻⁶`, ref: 'Cl 3.1.7' },
    { label: <>Face reinforcement, ρ<sub>w</sub></>, value: `${fmt(rho_w_pct, 2)} %`, ref: '—' },
    { label: <>Shrinkage stress, σ<sub>cs</sub></>, value: `${fmt(sigma_cs, 3)} MPa`, ref: 'Gilbert (Cl 8.5.3.1)' },
    { label: <>Cracking moment, M<sub>cr.t</sub> = Z·(f'<sub>ct.f</sub> − σ<sub>cs</sub>)</>, value: `${fmt(Mcrt, 2)} kNm`, ref: '—' },
    { label: 'Applied moment, M*', value: `${fmt(Mstar, 2)} kNm`, ref: 'Input' },
  ];

  let interpDescription = null;
  if (cracked) {
    if (ratio_raw < 0) {
      interpDescription = <>Net tension — N* &lt; 0 → ratio clamped to 0</>;
    } else if (ratio >= 0.5) {
      interpDescription = <>Ratio ≥ 0.5 → adopt ceiling value 0.80·I<sub>g</sub></>;
    } else if (ratio < 0.2) {
      interpDescription = (
        <>
          Interpolate between (0.0, 0.30) and (0.2, 0.50): I<sub>eff</sub>/I<sub>g</sub> = 0.30 + ({fmt(ratio, 4)} − 0)/0.2 · (0.50 − 0.30) = <strong>{fmt(modifier, 4)}</strong>
        </>
      );
    } else {
      interpDescription = (
        <>
          Interpolate between (0.2, 0.50) and (0.5, 0.80): I<sub>eff</sub>/I<sub>g</sub> = 0.50 + ({fmt(ratio, 4)} − 0.2)/0.3 · (0.80 − 0.50) = <strong>{fmt(modifier, 4)}</strong>
        </>
      );
    }
  }

  const axialRatioMeta = ratio_raw < 0
    ? 'Net tension — clamped to 0'
    : ratio >= 0.5
      ? 'Above 0.5 — ceiling'
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
            <span className="current">Column Stiffness Modifier</span>
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
                <td>Column Stiffness Modifier</td>
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
          <h1 className="title">Column Stiffness Modifier</h1>
          <div className="subtitle">AS 3600:2018 Cl 6.2.4.2 · Cracked-section I<sub>eff</sub> for column elements · ULS elastic analysis</div>
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

            <h3 className="input-group-title">Section</h3>
            <div className="input-field">
              <label>Shape</label>
              <select value={inputs.shape} onChange={update('shape')}>
                <option value="rect">Rectangular</option>
                <option value="circ">Circular</option>
              </select>
            </div>
            {inputs.shape === 'rect' && (
              <div className="input-row">
                <div className="input-field">
                  <label>Width b (mm)</label>
                  <input type="number" value={inputs.bw} onChange={update('bw')} step="50" />
                </div>
                <div className="input-field">
                  <label>Depth D (mm)</label>
                  <input type="number" value={inputs.Dd} onChange={update('Dd')} step="50" />
                </div>
              </div>
            )}
            {inputs.shape === 'circ' && (
              <div className="input-field">
                <label>Diameter D (mm)</label>
                <input type="number" value={inputs.Ddia} onChange={update('Ddia')} step="50" />
              </div>
            )}

            <h3 className="input-group-title">Material</h3>
            <div className="input-row">
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
              <div className="input-field">
                <label>ε<sub>cs</sub> (×10⁻⁶)</label>
                <input type="number" value={inputs.eps_cs} onChange={update('eps_cs')} step="50" />
              </div>
            </div>
            <p className="input-helper">Design shrinkage strain per Cl 3.1.7. Typical interior: 600. Coastal/external: 700–900.</p>

            <h3 className="input-group-title">Reinforcement</h3>
            <div className="input-field">
              <label>ρ<sub>w</sub> face reinforcement (%)</label>
              <input type="number" value={inputs.rho_w} onChange={update('rho_w')} step="0.1" />
            </div>
            <p className="input-helper">Reinforcement on each face for shrinkage formula (ρ = ρ' = ρ<sub>w</sub>). Column min per Cl 10.7.1 is 1.0%.</p>

            <h3 className="input-group-title">Analysis Actions</h3>
            <div className="input-field">
              <label>Axial load N* (kN)</label>
              <input type="number" value={inputs.axial_n} onChange={update('axial_n')} step="100" />
            </div>
            <p className="input-helper">Compression positive. Net tension clamps axial ratio at zero.</p>
            <div className="input-field">
              <label>Moment M* (kNm)</label>
              <input type="number" value={inputs.moment_m} onChange={update('moment_m')} step="10" />
            </div>
            <p className="input-helper">Governing moment from elastic analysis (use the larger of M*<sub>x</sub>, M*<sub>y</sub> if biaxial).</p>

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
              <p>AS 3600:2018 Cl 6.2.4.2 specifies the moment of inertia to use for columns in elastic analysis of lateral force-resisting systems at the ultimate limit state. The clause distinguishes between uncracked and cracked sections:</p>
              <ul>
                <li><strong>Cl 6.2.4.2(a) — Uncracked sections:</strong> use the full gross uncracked section (I<sub>eff</sub> = I<sub>g</sub>, modifier = 1.0).</li>
                <li><strong>Cl 6.2.4.2(b) — Cracked sections:</strong> apply the modifier from Table 6.2.4, which varies with the axial load ratio N*/(A<sub>g</sub>·f'<sub>c</sub>).</li>
              </ul>

              <h5>Modulus of elasticity — Cl 3.1.2</h5>
              <p>Mean modulus of elasticity from the Cl 3.1.2 equation (normal-class concrete):</p>
              <div className="eq-block">{"$$E_c = \\rho_c^{1.5} \\cdot 0.043 \\sqrt{f_{cmi}}, \\quad f_{cmi} = f'_c + 3 \\,\\text{MPa}, \\quad \\rho_c = 2400 \\,\\text{kg/m}^3$$"}</div>

              <h5>Cracking moment with shrinkage — Cl 8.5.3.1 / Cl 3.1.1.3</h5>
              <p>The section is taken as cracked when the applied moment exceeds the reduced cracking moment, accounting for tensile stress already present from restrained shrinkage:</p>
              <div className="eq-block">{"$$f'_{ct.f} = 0.6 \\sqrt{f'_c} \\qquad (\\text{flexural tensile strength, Cl 3.1.1.3})$$"}</div>
              <div className="eq-block">{"$$\\sigma_{cs} = \\frac{(2.5 \\rho - 0.8 \\rho')}{1 + 50 \\rho} \\cdot E_c \\cdot \\varepsilon_{cs} \\qquad (\\text{Gilbert, face reinforcement})$$"}</div>
              <p>With face-reinforcement convention (ρ = ρ' = ρ<sub>w</sub> on each face), this simplifies to:</p>
              <div className="eq-block">{"$$\\sigma_{cs} = \\frac{1.7 \\rho_w}{1 + 50 \\rho_w} \\cdot E_c \\cdot \\varepsilon_{cs}$$"}</div>
              <div className="eq-block">{"$$M_{cr.t} = Z \\cdot (f'_{ct.f} - \\sigma_{cs})$$"}</div>
              <p>If M* &gt; M<sub>cr.t</sub> the section is cracked and Table 6.2.4 applies; otherwise the gross section is used.</p>

              <h5>Table 6.2.4 — column modifiers (cracked)</h5>
              <div className="eq-block">
                {"$$\\begin{array}{ll} N^*/(A_g f'_c) \\geq 0.5 : & I_{\\text{eff}} = 0.80\\, I_g \\\\ N^*/(A_g f'_c) = 0.2 : & I_{\\text{eff}} = 0.50\\, I_g \\\\ N^*/(A_g f'_c) = 0.0 : & I_{\\text{eff}} = 0.30\\, I_g \\end{array}$$"}
              </div>
              <p>For intermediate values, linear interpolation is permitted (Table 6.2.4 footnote). Net tension (N* &lt; 0) is outside the table's range and is clamped to ratio = 0 (I<sub>eff</sub> = 0.30·I<sub>g</sub>); engineers expecting significant net tension in a column should consider a separate detailed assessment.</p>

              <div className="sketch">
                <svg viewBox="0 0 360 220" width="100%" style={{ maxWidth: '360px' }}>
                  <line x1="50" y1="180" x2="320" y2="180" stroke="#8E887D" strokeWidth="1" />
                  <line x1="50" y1="180" x2="50" y2="30" stroke="#8E887D" strokeWidth="1" />
                  <line x1="50" y1="180" x2="50" y2="184" stroke="#8E887D" />
                  <line x1="158" y1="180" x2="158" y2="184" stroke="#8E887D" />
                  <line x1="320" y1="180" x2="320" y2="184" stroke="#8E887D" />
                  <text x="50" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">0.0</text>
                  <text x="158" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">0.2</text>
                  <text x="320" y="198" fill="#8E887D" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">≥0.5</text>
                  <text x="185" y="213" fill="#C8C2B5" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Sans">N* / (Ag · f'c)</text>
                  <line x1="46" y1="150" x2="50" y2="150" stroke="#8E887D" />
                  <line x1="46" y1="120" x2="50" y2="120" stroke="#8E887D" />
                  <line x1="46" y1="75" x2="50" y2="75" stroke="#8E887D" />
                  <line x1="46" y1="30" x2="50" y2="30" stroke="#8E887D" />
                  <text x="42" y="153" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">0.30</text>
                  <text x="42" y="123" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">0.50</text>
                  <text x="42" y="78" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">0.80</text>
                  <text x="42" y="33" fill="#8E887D" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">1.00</text>
                  <text x="20" y="105" fill="#C8C2B5" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Sans" transform="rotate(-90 20 105)">Ieff / Ig</text>
                  <line x1="50" y1="30" x2="320" y2="30" stroke="#C49A2E" strokeWidth="2" strokeDasharray="4 3" />
                  <text x="180" y="22" fill="#C49A2E" fontSize="10" textAnchor="middle" fontFamily="IBM Plex Sans">Uncracked: Ieff = 1.0·Ig — Cl 6.2.4.2(a)</text>
                  <polyline points="50,150 158,120 320,75" stroke="#E0B548" strokeWidth="2.2" fill="none" />
                  <circle cx="50" cy="150" r="3" fill="#E0B548" />
                  <circle cx="158" cy="120" r="3" fill="#E0B548" />
                  <circle cx="320" cy="75" r="3" fill="#E0B548" />
                  <text x="220" y="68" fill="#E0B548" fontSize="10" fontFamily="IBM Plex Sans">Cracked — Table 6.2.4</text>
                </svg>
              </div>

              <h5>Limitations &amp; Assumptions</h5>
              <ul>
                <li>For <strong>ULS elastic analysis only</strong> (lateral force distribution, period, inter-storey drift). Serviceability deflection uses Cl 8.5/9.5 Branson-based I<sub>ef</sub> — a different method.</li>
                <li>Cracking criterion uses flexural tensile strength f'<sub>ct.f</sub> (Cl 3.1.1.3) because the column section experiences a strain gradient under combined bending and axial load.</li>
                <li>Shrinkage stress σ<sub>cs</sub> is computed using the Gilbert formula commonly applied to flexural members (Cl 8.5.3.1 context). Strict application to columns is an extrapolation — the effect is typically small (~5–15% reduction in M<sub>cr.t</sub>) but rises with high reinforcement and high shrinkage strain.</li>
                <li>Face reinforcement convention: ρ<sub>w</sub> input is the ratio on each face (ρ = ρ' = ρ<sub>w</sub>). Total column reinforcement is approximately 2·ρ<sub>w</sub>.</li>
                <li>Single direction only — biaxial bending is handled by entering the governing M* (larger of M*<sub>x</sub>, M*<sub>y</sub>). Tool does not run independent checks per axis.</li>
                <li>Net tension (N* &lt; 0) is clamped to ratio = 0; outside the explicit range of Table 6.2.4.</li>
                <li>Single column element only. Does not address P-delta amplification, slenderness effects, or non-linear cracked behaviour — refer to AS 3600 Section 10.</li>
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
                  <div className="dc-meta">{shape === 'rect' ? 'b × D' : 'π·D²/4'}</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">Z (gross)</div>
                  <div className="dc-value">{fmtExp(Z, 3)} mm³</div>
                  <div className="dc-meta">{shape === 'rect' ? 'b·D²/6' : 'π·D³/32'}</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">σ<sub>cs</sub> (shrinkage)</div>
                  <div className="dc-value">{fmt(sigma_cs, 3)} MPa</div>
                  <div className="dc-meta">Gilbert · Cl 8.5.3.1</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">M<sub>cr.t</sub></div>
                  <div className="dc-value">{fmt(Mcrt, 1)} kNm</div>
                  <div className="dc-meta">Z·(f'<sub>ct.f</sub> − σ<sub>cs</sub>)</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">Axial ratio N*/(A<sub>g</sub>·f'<sub>c</sub>)</div>
                  <div className="dc-value">{fmt(ratio_raw, 4)}</div>
                  <div className="dc-meta">{axialRatioMeta}</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">I<sub>eff</sub> (absolute)</div>
                  <div className="dc-value">{fmtExp(Ieff, 3)} mm⁴</div>
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
                    <td className="label"><strong>Cracking state (M* &gt; M<sub>cr.t</sub>)</strong></td>
                    <td className="value"><strong>{cracked ? 'Cracked' : 'Uncracked'}</strong></td>
                    <td className="ref">Cl 6.2.4.2</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <div className="section-heading">
                <h3>Table 6.2.4 Lookup &amp; Interpolation</h3>
                <span className="ref">AS 3600 Table 6.2.4 (columns)</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
                <tbody>
                  {!cracked ? (
                    <>
                      <tr>
                        <td className="label">Cracked? (M* &gt; M<sub>cr.t</sub>)</td>
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
                        <td className="label">Cracked? (M* &gt; M<sub>cr.t</sub>)</td>
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

                      <tr className="subhead"><td colSpan={3}>Table 6.2.4 — columns</td></tr>
                      <tr>
                        <td className="label indent">N*/(A<sub>g</sub>·f'<sub>c</sub>) ≥ 0.5</td>
                        <td className="value">0.80·I<sub>g</sub></td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>
                      <tr>
                        <td className="label indent">N*/(A<sub>g</sub>·f'<sub>c</sub>) = 0.2</td>
                        <td className="value">0.50·I<sub>g</sub></td>
                        <td className="ref">Table 6.2.4</td>
                      </tr>
                      <tr>
                        <td className="label indent">N*/(A<sub>g</sub>·f'<sub>c</sub>) = 0.0</td>
                        <td className="value">0.30·I<sub>g</sub></td>
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

export default ColumnStiffnessModifier;
