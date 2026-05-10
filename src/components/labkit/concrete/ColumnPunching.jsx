import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// CALCULATION ENGINE — verified against BG&E example
// Copied byte-for-byte from labkit_template_v1.html.
// ============================================================
function computeResults(raw) {
  const num = (v) => parseFloat(v) || 0;

  const fc = num(raw.fc);
  const scp = num(raw.scp);
  const Ds = num(raw.Ds);
  const dom = num(raw.dom);
  const shape = raw.shape;
  const L = num(raw.L);
  const W = num(raw.W);
  const D = num(raw.D);
  const position = raw.position;
  const Vstar = num(raw.Vstar);
  const Mvx = num(raw.Mvx);
  const Mvy = num(raw.Mvy);
  const u_ineff = num(raw.u_ineff);
  const shear_head = raw.shear_head;

  const phi = 0.70;

  // ---- Geometry ----
  let aL, aW, u_gross, betaH, configText;
  if (shape === 'rect') {
    aL = L + dom;
    aW = W + dom;
    if (position === 'I') {
      u_gross = 2 * aL + 2 * aW;
      configText = 'Interior';
    } else if (position === 'E') {
      u_gross = 2 * aL + aW; // simplified, assumes one face on edge
      configText = 'Edge';
    } else {
      u_gross = aL + aW;
      configText = 'Corner';
    }
    betaH = Math.max(L, W) / Math.min(L, W);
  } else {
    aL = D + dom;
    aW = D + dom;
    u_gross = Math.PI * (D + dom);
    if (position === 'E') u_gross = 0.5 * Math.PI * (D + dom);
    if (position === 'C') u_gross = 0.25 * Math.PI * (D + dom);
    betaH = 1.0;
    configText = position === 'I' ? 'Interior (circular)' : position === 'E' ? 'Edge (circular)' : 'Corner (circular)';
  }
  const u = Math.max(u_gross - u_ineff, 0.001);

  // ---- fcv ----
  const fcv_max = 0.34 * Math.sqrt(fc);
  const fcv1 = 0.17 * (1 + 2 / betaH) * Math.sqrt(fc);
  const fcv = Math.min(fcv_max, fcv1);

  // ---- φVuo (no shear head) ----
  const phiVuo_noSH = phi * u * dom * (fcv + 0.3 * scp) / 1000; // kN

  // ---- φVuo (with shear head) — Cl 9.3.3(b) ----
  const phiVuo_max_SH = phi * 0.2 * u * dom * fc / 1000;
  const phiVuo1_SH = phi * u * dom * (0.5 * Math.sqrt(fc) + 0.3 * scp) / 1000;
  const phiVuo_SH = Math.min(phiVuo_max_SH, phiVuo1_SH);

  const phiVuo = (shear_head === 'Y') ? phiVuo_SH : phiVuo_noSH;

  // ---- Biaxial φVu — Cl 9.3.4(a) — no ties ----
  function calcVu_noTies(Mvstar_kNm, a) {
    if (Mvstar_kNm <= 0) return { phiVu: phiVuo, ecc: 0, denom: 1 };
    const Mvstar_Nmm = Mvstar_kNm * 1e6;
    const Vstar_N = Vstar * 1e3;
    const ecc = (u * Mvstar_Nmm) / (8 * Vstar_N * a * dom);
    const denom = 1 + ecc;
    return { phiVu: phiVuo / denom, ecc, denom };
  }
  const vuX = calcVu_noTies(Mvx, aL);
  const vuY = calcVu_noTies(Mvy, aW);

  // ---- Biaxial φVu,min — Cl 9.3.4(b) — min ties ----
  function calcVuMin(Mvstar_kNm, a) {
    if (Mvstar_kNm <= 0) return { phiVu: 1.2 * phiVuo, denom: 1 };
    const Mvstar_Nmm = Mvstar_kNm * 1e6;
    const Vstar_N = Vstar * 1e3;
    const denom = 1 + (u * Mvstar_Nmm) / (2 * Vstar_N * a * a);
    return { phiVu: 1.2 * phiVuo / denom, denom };
  }
  const vuMinX = calcVuMin(Mvx, aL);
  const vuMinY = calcVuMin(Mvy, aW);

  // ---- Governing ----
  const govNoTies = vuX.phiVu <= vuY.phiVu
    ? { dir: 'X', phiVu: vuX.phiVu, ecc: vuX.ecc, a: aL, M: Mvx }
    : { dir: 'Y', phiVu: vuY.phiVu, ecc: vuY.ecc, a: aW, M: Mvy };
  const govMin = vuMinX.phiVu <= vuMinY.phiVu
    ? { dir: 'X', phiVu: vuMinX.phiVu }
    : { dir: 'Y', phiVu: vuMinY.phiVu };

  const utilNoTies = Vstar / govNoTies.phiVu;
  const utilMin = Vstar / govMin.phiVu;

  return {
    fc, scp, Ds, dom, shape, L, W, D, position, Vstar, Mvx, Mvy, u_ineff, shear_head,
    phi,
    aL, aW, u_gross, u, betaH, configText,
    fcv_max, fcv1, fcv,
    phiVuo_noSH, phiVuo_max_SH, phiVuo1_SH, phiVuo_SH, phiVuo,
    vuX, vuY, vuMinX, vuMinY,
    govNoTies, govMin,
    utilNoTies, utilMin,
  };
}

const fmt = (v, d = 1) => v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtInt = (v) => Math.round(v).toLocaleString('en-AU');
const statusClass = (util) => (util > 1.0 ? 'fail' : util > 0.85 ? 'warn' : 'pass');
const statusText = (util) => (util > 1.0 ? 'Fail' : util > 0.85 ? 'Pass · High util' : 'Pass');

const DEFAULTS = {
  project: '',
  jobno: '',
  byname: '',
  fc: '50',
  scp: '0',
  Ds: '200',
  dom: '167',
  shape: 'rect',
  L: '600',
  W: '400',
  D: '500',
  position: 'I',
  edge_face: 'L',
  Vstar: '500',
  Mvx: '25',
  Mvy: '15',
  ties_provided: 'N',
  lig_size: '12',
  lig_s: '150',
  fsyf: '500',
  cover: '25',
  shear_head: 'N',
  u_ineff: '0',
};

function ColumnPunching() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const flashTimeout = useRef(null);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const r = useMemo(() => computeResults(inputs), [inputs]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Load MathJax once (idempotent across remounts)
  useEffect(() => {
    if (!document.getElementById('MathJax-script')) {
      const script = document.createElement('script');
      script.id = 'MathJax-script';
      script.async = true;
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      document.head.appendChild(script);
    }
  }, []);

  // Re-typeset MathJax whenever the theory panel opens
  useEffect(() => {
    if (theoryOpen && window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise();
    }
  }, [theoryOpen]);

  // Cleanup any pending flash timer on unmount
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
    fc, scp, Ds, dom, shape, L, W, D, position, Vstar, Mvx, Mvy, u_ineff, shear_head,
    phi, aL, aW, u_gross, u, betaH, configText,
    fcv_max, fcv1, fcv,
    phiVuo_noSH, phiVuo_max_SH, phiVuo1_SH, phiVuo_SH, phiVuo,
    vuX, vuY, vuMinX, vuMinY,
    govNoTies, govMin, utilNoTies, utilMin,
  } = r;

  const printRows = [
    { label: <>f'<sub>c</sub></>, value: `${fc} MPa` },
    { label: <>σ<sub>cp</sub></>, value: `${scp} MPa` },
    { label: <>Slab depth, D<sub>s</sub></>, value: `${Ds} mm` },
    { label: <>Effective d<sub>om</sub></>, value: `${dom} mm` },
    { label: 'Column shape', value: shape === 'rect' ? 'Rectangular' : 'Circular' },
    { label: 'Column dimensions', value: shape === 'rect' ? `${L} × ${W} mm` : `D = ${D} mm` },
    { label: 'Position', value: configText },
    { label: 'Applied shear V*', value: `${Vstar} kN` },
    { label: 'Mv*x (about X)', value: `${Mvx} kNm` },
    { label: 'Mv*y (about Y)', value: `${Mvy} kNm` },
    { label: 'Closed ties provided', value: inputs.ties_provided === 'Y' ? 'Yes' : 'No' },
    { label: 'Shear head provided', value: shear_head === 'Y' ? 'Yes' : 'No' },
    { label: 'Ineffective perimeter', value: `${u_ineff} mm` },
  ];

  const perimRows = [
    { label: 'Configuration', value: configText, ref: position === 'I' ? 'Fig 9.3(A)' : '—' },
    { label: <>Critical perimeter, u<sub>gross</sub></>, value: `${fmtInt(u_gross)} mm`, ref: 'Cl 9.3.1.3' },
    { label: 'Ineffective length', value: `${fmtInt(u_ineff)} mm`, ref: 'Cl 9.3.1.4' },
    { label: 'Effective u', value: `${fmtInt(u)} mm`, ref: '—' },
    { label: <>Mean d<sub>om</sub></>, value: `${fmt(dom, 1)} mm`, ref: '—' },
  ];
  if (shape === 'rect') {
    perimRows.push({ label: <>a<sub>L</sub> = L + d<sub>om</sub></>, value: `${fmt(aL, 1)} mm`, ref: 'Fig 9.3(B)' });
    perimRows.push({ label: <>a<sub>W</sub> = W + d<sub>om</sub></>, value: `${fmt(aW, 1)} mm`, ref: 'Fig 9.3(B)' });
  } else {
    perimRows.push({ label: <>a = D + d<sub>om</sub></>, value: `${fmt(aL, 1)} mm`, ref: '—' });
  }
  perimRows.push({ label: <>β<sub>h</sub></>, value: fmt(betaH, 2), ref: 'Cl 9.3.1.4' });

  const noTiesEffective = (Mvx > 0 || Mvy > 0); // preserved from template (visual flag, unused in render path)

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link to="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span>
            <span className="sep">›</span>
            <span>Concrete</span>
            <span className="sep">›</span>
            <span className="current">Column Punching</span>
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
                <td>Concrete Column Punching</td>
                <td className="ppb-label">By</td>
                <td>{inputs.byname || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Reference</td>
                <td>AS 3600:2018 Clause 9.3</td>
                <td className="ppb-label">Date</td>
                <td>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Concrete Column Punching</h1>
          <div className="subtitle">AS 3600:2018 Cl 9.3 · Interior, edge &amp; corner columns · Biaxial moment</div>
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

            <h3 className="input-group-title">Materials</h3>
            <div className="input-row">
              <div className="input-field">
                <label>f'c (MPa)</label>
                <input type="number" value={inputs.fc} onChange={update('fc')} step="1" />
              </div>
              <div className="input-field">
                <label>σcp (MPa)</label>
                <input type="number" value={inputs.scp} onChange={update('scp')} step="0.1" />
              </div>
            </div>

            <h3 className="input-group-title">Slab Geometry</h3>
            <div className="input-row">
              <div className="input-field">
                <label>Slab depth Ds</label>
                <input type="number" value={inputs.Ds} onChange={update('Ds')} step="10" />
              </div>
              <div className="input-field">
                <label>Effective dom</label>
                <input type="number" value={inputs.dom} onChange={update('dom')} step="1" />
              </div>
            </div>

            <h3 className="input-group-title">Column</h3>
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
                  <label>L — along X (mm)</label>
                  <input type="number" value={inputs.L} onChange={update('L')} step="10" />
                </div>
                <div className="input-field">
                  <label>W — along Y (mm)</label>
                  <input type="number" value={inputs.W} onChange={update('W')} step="10" />
                </div>
              </div>
            )}
            {inputs.shape === 'circ' && (
              <div className="input-field">
                <label>Diameter D (mm)</label>
                <input type="number" value={inputs.D} onChange={update('D')} step="10" />
              </div>
            )}
            <div className="input-field">
              <label>Position</label>
              <select value={inputs.position} onChange={update('position')}>
                <option value="I">Interior</option>
                <option value="E">Edge</option>
                <option value="C">Corner</option>
              </select>
            </div>
            {inputs.position === 'E' && (
              <div className="input-field">
                <label>Edge face</label>
                <select value={inputs.edge_face} onChange={update('edge_face')}>
                  <option value="L">L (length face on edge)</option>
                  <option value="W">W (width face on edge)</option>
                </select>
              </div>
            )}

            <h3 className="input-group-title">Design Actions</h3>
            <div className="input-field">
              <label>V* (kN)</label>
              <input type="number" value={inputs.Vstar} onChange={update('Vstar')} step="10" />
            </div>
            <div className="input-row">
              <div className="input-field">
                <label>Mv*x (kNm)</label>
                <input type="number" value={inputs.Mvx} onChange={update('Mvx')} step="1" />
              </div>
              <div className="input-field">
                <label>Mv*y (kNm)</label>
                <input type="number" value={inputs.Mvy} onChange={update('Mvy')} step="1" />
              </div>
            </div>
            <p className="input-helper">Mv*x = moment about X-axis (uses a = L + dom). Mv*y = moment about Y-axis (uses a = W + dom).</p>

            <h3 className="input-group-title">Closed Ties</h3>
            <div className="input-field">
              <label>Closed ties provided?</label>
              <select value={inputs.ties_provided} onChange={update('ties_provided')}>
                <option value="N">No ties</option>
                <option value="Y">Yes</option>
              </select>
            </div>
            {inputs.ties_provided === 'Y' && (
              <div>
                <div className="input-row">
                  <div className="input-field">
                    <label>Lig bar size (mm)</label>
                    <input type="number" value={inputs.lig_size} onChange={update('lig_size')} step="2" />
                  </div>
                  <div className="input-field">
                    <label>Lig spacing s (mm)</label>
                    <input type="number" value={inputs.lig_s} onChange={update('lig_s')} step="10" />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-field">
                    <label>fsy.f (MPa)</label>
                    <input type="number" value={inputs.fsyf} onChange={update('fsyf')} step="10" />
                  </div>
                  <div className="input-field">
                    <label>Tie cover c (mm)</label>
                    <input type="number" value={inputs.cover} onChange={update('cover')} step="5" />
                  </div>
                </div>
              </div>
            )}

            <h3 className="input-group-title">Shear Head</h3>
            <div className="input-field">
              <label>Shear head provided?</label>
              <select value={inputs.shear_head} onChange={update('shear_head')}>
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>

            <h3 className="input-group-title">Critical Openings</h3>
            <div className="input-field">
              <label>Ineffective perimeter length (mm)</label>
              <input type="number" value={inputs.u_ineff} onChange={update('u_ineff')} step="10" />
              <p className="input-helper">Total length of perimeter ineffective due to nearby openings (Cl 9.3.1.4).</p>
            </div>

            <button
              className="btn-calc"
              type="button"
              onClick={handleCalcClick}
              style={flash ? { background: 'var(--pass)' } : undefined}
            >
              {flash ? '✓ Calculation refreshed' : 'Run Punching Shear Check'}
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
              <p>Punching shear capacity at slab–column connections is checked at the critical perimeter located <strong>d<sub>om</sub>/2</strong> from the column face. The capacity is governed by concrete shear strength, with reductions for unbalanced moment and enhancements for closed fitments in the torsion strip.</p>

              <h5>Without unbalanced moment (M<sub>v</sub>* = 0) — Cl 9.3.3</h5>
              <div className="eq-block">{'$$\\phi V_{uo} = \\phi \\cdot u \\cdot d_{om} \\cdot (f_{cv} + 0.3 \\sigma_{cp})$$'}</div>
              <p>where <em>f<sub>cv</sub></em> = min(0.17(1 + 2/β<sub>h</sub>)√f'<sub>c</sub>, 0.34√f'<sub>c</sub>)</p>

              <h5>With unbalanced moment, no ties — Cl 9.3.4(a)</h5>
              <div className="eq-block">{'$$\\phi V_u = \\frac{\\phi V_{uo}}{1 + \\dfrac{u \\cdot M_v^*}{8 V^* \\cdot a \\cdot d_{om}}}$$'}</div>

              <h5>With minimum closed fitments — Cl 9.3.4(b)</h5>
              <div className="eq-block">{'$$\\phi V_{u,\\min} = \\frac{1.2 \\, \\phi V_{uo}}{1 + \\dfrac{u \\cdot M_v^*}{2 V^* \\cdot a^2}}$$'}</div>

              <h5>Biaxial moment — independent uniaxial checks</h5>
              <p>AS 3600 does not provide a closed-form biaxial interaction equation for punching. The conventional approach is to perform two independent uniaxial checks — one in each direction — and adopt the lower capacity (worse case) as governing:</p>
              <ul>
                <li><strong>Direction X:</strong> uses M<sub>v</sub>*<sub>x</sub> and a = a<sub>L</sub> = L + d<sub>om</sub></li>
                <li><strong>Direction Y:</strong> uses M<sub>v</sub>*<sub>y</sub> and a = a<sub>W</sub> = W + d<sub>om</sub></li>
              </ul>
              <p>This is consistent with industry practice and tools such as Structural Toolkit. Engineers performing detailed assessments of biaxial behaviour may apply a more conservative SRSS or sum-of-utilisations envelope at their discretion.</p>

              <div className="sketch">
                <svg width="100%" height="200" viewBox="0 0 360 200" fill="none" style={{ maxWidth: '360px' }}>
                  <rect x="135" y="70" width="90" height="60" stroke="#EDE8DD" strokeWidth="1.5" fill="#322F2C" />
                  <text x="158" y="105" fill="#EDE8DD" fontSize="11" fontFamily="IBM Plex Sans">Column</text>
                  <rect x="92" y="27" width="176" height="146" stroke="#C49A2E" strokeWidth="1.5" strokeDasharray="5 3" fill="none" />
                  <text x="265" y="22" fill="#C49A2E" fontSize="10" fontFamily="IBM Plex Sans">Critical perimeter u</text>
                  <line x1="92" y1="185" x2="135" y2="185" stroke="#8E887D" strokeWidth="0.8" />
                  <text x="98" y="182" fill="#8E887D" fontSize="9" fontFamily="IBM Plex Mono">dom/2</text>
                  <line x1="92" y1="155" x2="268" y2="155" stroke="#8E887D" strokeWidth="0.8" strokeDasharray="2 2" />
                  <text x="155" y="167" fill="#8E887D" fontSize="9" fontFamily="IBM Plex Mono">a = L + dom</text>
                </svg>
              </div>

              <h5>Limitations &amp; Assumptions</h5>
              <ul>
                <li>Single column check only — does not analyse adjacent column groups or transfer effects</li>
                <li>Constant slab thickness assumed at the slab–column interface</li>
                <li>Excludes prestressed slabs (refer AS 3600 Cl 9.3 with PT-specific coefficients)</li>
                <li>β<sub>h</sub> = 1.0 assumed for circular columns</li>
                <li>Biaxial moment treated as two independent uniaxial cases — governing case adopted</li>
                <li>Ineffective perimeter due to openings is input manually — tool does not auto-detect openings</li>
              </ul>
            </div>

            {/* Print-only applied actions */}
            <section className="print-only" style={{ display: 'none' }}>
              <div className="section-heading">
                <h3>Applied Design Actions</h3>
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
                <h3>Design Actions</h3>
                <span className="ref">Derived demand quantities</span>
              </div>
              <div className="demand-grid">
                <div className="demand-card">
                  <div className="dc-label">a<sub>L</sub> (= L + d<sub>om</sub>)</div>
                  <div className="dc-value">{fmt(aL, 0)} mm</div>
                  <div className="dc-meta">Used for direction X</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">a<sub>W</sub> (= W + d<sub>om</sub>)</div>
                  <div className="dc-value">{fmt(aW, 0)} mm</div>
                  <div className="dc-meta">Used for direction Y</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">β<sub>h</sub></div>
                  <div className="dc-value">{fmt(betaH, 2)}</div>
                  <div className="dc-meta">max(L,W) / min(L,W)</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">u (critical perimeter)</div>
                  <div className="dc-value">{fmtInt(u)} mm</div>
                  <div className="dc-meta">{configText}, ineff {fmtInt(u_ineff)} mm</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">Eccentricity X</div>
                  <div className="dc-value">{fmt(vuX.ecc, 4)}</div>
                  <div className="dc-meta">u·M<sub>v</sub>*<sub>x</sub>/(8V*·a<sub>L</sub>·d<sub>om</sub>)</div>
                </div>
                <div className="demand-card">
                  <div className="dc-label">Eccentricity Y</div>
                  <div className="dc-value">{fmt(vuY.ecc, 4)}</div>
                  <div className="dc-meta">u·M<sub>v</sub>*<sub>y</sub>/(8V*·a<sub>W</sub>·d<sub>om</sub>)</div>
                </div>
              </div>
            </section>

            <section>
              <div className="section-heading">
                <h3>Capacity Summary</h3>
                <span className="ref">Governing direction reported</span>
              </div>
              <div className="capacity-grid">
                <div className="result-card pass">
                  <div className="rc-label">φV<sub>uo</sub> — no moment</div>
                  <div className="rc-value">{fmt(phiVuo, 1)} kN</div>
                  <div className="rc-status pass"><span className="dot"></span>Reference</div>
                  <div className="rc-note">{shear_head === 'Y' ? 'With shear head' : 'No shear head'}</div>
                </div>
                <div className={`result-card ${statusClass(utilNoTies)}`}>
                  <div className="rc-label">φV<sub>u</sub> — no ties (governing)</div>
                  <div className="rc-value">{fmt(govNoTies.phiVu, 1)} kN</div>
                  <div className={`rc-status ${statusClass(utilNoTies)}`}>
                    <span className="dot"></span>{statusText(utilNoTies)} · Util {fmt(utilNoTies, 2)}
                  </div>
                  <div className="rc-note">
                    Direction {govNoTies.dir} governs (M = {govNoTies.M} kNm, a = {fmt(govNoTies.a, 0)} mm)
                  </div>
                </div>
                <div className={`result-card ${statusClass(utilMin)}`}>
                  <div className="rc-label">φV<sub>u,min</sub> — min ties (governing)</div>
                  <div className="rc-value">{fmt(govMin.phiVu, 1)} kN</div>
                  <div className={`rc-status ${statusClass(utilMin)}`}>
                    <span className="dot"></span>{statusText(utilMin)} · Util {fmt(utilMin, 2)}
                  </div>
                  <div className="rc-note">Direction {govMin.dir} governs</div>
                </div>
              </div>
            </section>

            <section>
              <div className="section-heading">
                <h3>Critical Shear Perimeter</h3>
                <span className="ref">AS 3600 Cl 9.3.1.3</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
                <tbody>
                  {perimRows.map((row, i) => (
                    <tr key={i}>
                      <td className="label">{row.label}</td>
                      <td className="value">{row.value}</td>
                      <td className="ref">{row.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <div className="section-heading">
                <h3>Ultimate Shear Strength, M<sub>v</sub>* = 0</h3>
                <span className="ref">AS 3600 Cl 9.3.3</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
                <tbody>
                  <tr>
                    <td className="label">Capacity reduction factor, φ</td>
                    <td className="value">{fmt(phi, 2)}</td>
                    <td className="ref">Table 2.2.2(e)</td>
                  </tr>
                  <tr className="subhead"><td colSpan={3}>No shear head — Cl 9.3.3(a)</td></tr>
                  <tr>
                    <td className="label indent">f<sub>cv,max</sub> = 0.34·√f'<sub>c</sub></td>
                    <td className="value">{fmt(fcv_max, 3)} MPa</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr>
                    <td className="label indent">f<sub>cv1</sub> = 0.17(1+2/β<sub>h</sub>)·√f'<sub>c</sub></td>
                    <td className="value">{fmt(fcv1, 3)} MPa</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr>
                    <td className="label indent">f<sub>cv</sub> = min(f<sub>cv,max</sub>, f<sub>cv1</sub>)</td>
                    <td className="value">{fmt(fcv, 3)} MPa</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>uo</sub> = φ·u·d<sub>om</sub>·(f<sub>cv</sub> + 0.3σ<sub>cp</sub>)</strong></td>
                    <td className="value">{fmt(phiVuo_noSH, 1)} kN</td>
                    <td className="ref">Eq 9.3.3(1)</td>
                  </tr>
                  {shear_head === 'Y' && (
                    <>
                      <tr className="subhead"><td colSpan={3}>With shear head — Cl 9.3.3(b)</td></tr>
                      <tr>
                        <td className="label indent">φV<sub>uo,max</sub> = φ·0.2·u·d<sub>om</sub>·f'<sub>c</sub></td>
                        <td className="value">{fmt(phiVuo_max_SH, 1)} kN</td>
                        <td className="ref">Eq 9.3.3(2)</td>
                      </tr>
                      <tr>
                        <td className="label indent">φV<sub>uo1</sub> = φ·u·d<sub>om</sub>·(0.5·√f'<sub>c</sub> + 0.3σ<sub>cp</sub>)</td>
                        <td className="value">{fmt(phiVuo1_SH, 1)} kN</td>
                        <td className="ref">Eq 9.3.3(2)</td>
                      </tr>
                      <tr className="summary-row">
                        <td className="label"><strong>φV<sub>uo</sub> (with shear head)</strong></td>
                        <td className="value">{fmt(phiVuo_SH, 1)} kN</td>
                        <td className="ref">—</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </section>

            <section>
              <div className="section-heading">
                <h3>Ultimate Shear Capacity, M<sub>v</sub>* &gt; 0 — Biaxial</h3>
                <span className="ref">AS 3600 Cl 9.3.4</span>
              </div>
              <table className="calc-table">
                <thead><tr><th>Quantity</th><th>Value</th><th>Reference</th></tr></thead>
                <tbody>
                  <tr className="subhead">
                    <td colSpan={3}>
                      Direction X — uses M<sub>v</sub>*<sub>x</sub> = {Mvx} kNm, a = a<sub>L</sub> = {fmt(aL, 0)} mm
                    </td>
                  </tr>
                  <tr>
                    <td className="label indent">
                      Eccentricity ratio (no ties): u·M<sub>v</sub>*<sub>x</sub>/(8·V*·a<sub>L</sub>·d<sub>om</sub>)
                    </td>
                    <td className="value">{fmt(vuX.ecc, 4)}</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr>
                    <td className="label indent">Denominator</td>
                    <td className="value">{fmt(vuX.denom, 4)}</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>u,X</sub> (no ties)</strong></td>
                    <td className="value">{fmt(vuX.phiVu, 1)} kN</td>
                    <td className="ref">Eq 9.3.4(1)</td>
                  </tr>
                  <tr>
                    <td className="label indent">
                      Min-ties denominator: 1 + u·M<sub>v</sub>*<sub>x</sub>/(2·V*·a<sub>L</sub>²)
                    </td>
                    <td className="value">{fmt(vuMinX.denom, 4)}</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>u,min,X</sub> (min ties)</strong></td>
                    <td className="value">{fmt(vuMinX.phiVu, 1)} kN</td>
                    <td className="ref">Eq 9.3.4(2)</td>
                  </tr>

                  <tr className="subhead">
                    <td colSpan={3}>
                      Direction Y — uses M<sub>v</sub>*<sub>y</sub> = {Mvy} kNm, a = a<sub>W</sub> = {fmt(aW, 0)} mm
                    </td>
                  </tr>
                  <tr>
                    <td className="label indent">
                      Eccentricity ratio (no ties): u·M<sub>v</sub>*<sub>y</sub>/(8·V*·a<sub>W</sub>·d<sub>om</sub>)
                    </td>
                    <td className="value">{fmt(vuY.ecc, 4)}</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr>
                    <td className="label indent">Denominator</td>
                    <td className="value">{fmt(vuY.denom, 4)}</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>u,Y</sub> (no ties)</strong></td>
                    <td className="value">{fmt(vuY.phiVu, 1)} kN</td>
                    <td className="ref">Eq 9.3.4(1)</td>
                  </tr>
                  <tr>
                    <td className="label indent">
                      Min-ties denominator: 1 + u·M<sub>v</sub>*<sub>y</sub>/(2·V*·a<sub>W</sub>²)
                    </td>
                    <td className="value">{fmt(vuMinY.denom, 4)}</td>
                    <td className="ref">—</td>
                  </tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>u,min,Y</sub> (min ties)</strong></td>
                    <td className="value">{fmt(vuMinY.phiVu, 1)} kN</td>
                    <td className="ref">Eq 9.3.4(2)</td>
                  </tr>

                  <tr className="subhead"><td colSpan={3}>Governing — adopted for design</td></tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>u</sub> governing — Direction {govNoTies.dir}</strong></td>
                    <td className="value">{fmt(govNoTies.phiVu, 1)} kN</td>
                    <td className="ref">Util {fmt(utilNoTies, 2)}</td>
                  </tr>
                  <tr className="summary-row">
                    <td className="label"><strong>φV<sub>u,min</sub> governing — Direction {govMin.dir}</strong></td>
                    <td className="value">{fmt(govMin.phiVu, 1)} kN</td>
                    <td className="ref">Util {fmt(utilMin, 2)}</td>
                  </tr>
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

export default ColumnPunching;
