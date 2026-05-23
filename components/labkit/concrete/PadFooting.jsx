'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// PAD FOOTING — AS 3600:2018 (preliminary sizing check)
// Bearing · one-way shear (Cl 8.2.4, corrected kv) · punching
// (Cl 9.3.3) · flexure (Cl 8.1). Engine verified against the
// Standard; one-way-shear kv = 200/(1000+1.3·dv) ≤ 0.15.
// ============================================================

const n = (v) => parseFloat(v) || 0;

function computeFooting(I) {
  const phi_s = 0.7, phi_b = 0.85;
  const isCirc = n(I.col_d) === 0;

  // 1. Bearing
  const A = (n(I.B) * n(I.W)) / 1e6;
  const sw = A * (n(I.D) / 1000) * n(I.gamma_c);
  const W_load = n(I.DL) + n(I.LL) + sw;
  const U_load = 1.2 * (n(I.DL) + sw) + 1.5 * n(I.LL);
  const sigma_w = A > 0 ? W_load / A : 0;
  const sigma_u = A > 0 ? U_load / A : 0;
  const util_bear = n(I.qa) > 0 ? sigma_w / n(I.qa) : 0;

  // effective depths
  const d_L = n(I.D) - n(I.cover) - n(I.bar_L) / 2;
  let d_W, d_L_eff;
  if (I.layer_W === 'Primary') {
    d_W = n(I.D) - n(I.cover) - n(I.bar_W) / 2;
    d_L_eff = n(I.D) - n(I.cover) - n(I.bar_W) - n(I.bar_L) / 2;
  } else {
    d_W = n(I.D) - n(I.cover) - n(I.bar_L) - n(I.bar_W) / 2;
    d_L_eff = d_L;
  }

  // 2. One-way shear (Cl 8.2.4.1 Vuc = kv·bv·dv·√f'c; kv per Cl 8.2.4.3 simplified)
  const cant_L = (n(I.B) - (isCirc ? n(I.col_b) : n(I.col_d))) / 2 / 1000;
  const cant_W = (n(I.W) - n(I.col_b)) / 2 / 1000;
  const Vstar_L = sigma_u * (n(I.W) / 1000) * Math.max(0, cant_L - d_L_eff / 1000);
  const Vstar_W = sigma_u * (n(I.B) / 1000) * Math.max(0, cant_W - d_W / 1000);
  const dv_L = Math.max(0.72 * n(I.D), 0.9 * d_L_eff);
  const dv_W = Math.max(0.72 * n(I.D), 0.9 * d_W);
  const kv_L = Math.min(200 / (1000 + 1.3 * dv_L), 0.15);
  const kv_W = Math.min(200 / (1000 + 1.3 * dv_W), 0.15);
  const sqfc = Math.min(8, Math.sqrt(n(I.fc)));
  const phiVuc_L = (phi_s * kv_L * n(I.W) * dv_L * sqfc) / 1000;
  const phiVuc_W = (phi_s * kv_W * n(I.B) * dv_W * sqfc) / 1000;
  const uVL = phiVuc_L > 0 ? Vstar_L / phiVuc_L : 0;
  const uVW = phiVuc_W > 0 ? Vstar_W / phiVuc_W : 0;

  // 3. Punching (Cl 9.3.3)
  const dom = n(I.D) - n(I.cover) - (n(I.bar_L) + n(I.bar_W)) / 2;
  let u_perim, betaH, A_inside;
  if (isCirc) {
    u_perim = Math.PI * (n(I.col_b) + dom);
    betaH = 1.0;
    A_inside = (Math.PI * Math.pow((n(I.col_b) + dom) / 2, 2)) / 1e6;
  } else {
    u_perim = 2 * (n(I.col_b) + n(I.col_d)) + 4 * dom;
    betaH = Math.max(n(I.col_b), n(I.col_d)) / Math.min(n(I.col_b), n(I.col_d));
    A_inside = ((n(I.col_b) + dom) * (n(I.col_d) + dom)) / 1e6;
  }
  const fcv = Math.min(0.17 * (1 + 2 / betaH) * Math.sqrt(n(I.fc)), 0.34 * Math.sqrt(n(I.fc)));
  const phiVuo = (phi_s * u_perim * dom * fcv) / 1000;
  const Vstar_punch = U_load - sigma_u * A_inside;
  const uPunch = phiVuo > 0 ? Vstar_punch / phiVuo : 0;

  // 4. Flexure (Cl 8.1)
  const M_L = sigma_u * (n(I.W) / 1000) * Math.pow(cant_L, 2) / 2;
  const M_W = sigma_u * (n(I.B) / 1000) * Math.pow(cant_W, 2) / 2;
  const Ast_L = (n(I.W) / n(I.sp_L)) * Math.PI * Math.pow(n(I.bar_L), 2) / 4;
  const Ast_W = (n(I.B) / n(I.sp_W)) * Math.PI * Math.pow(n(I.bar_W), 2) / 4;
  const alpha2 = Math.max(0.67, 0.85 - 0.0015 * n(I.fc));
  const gamma = Math.max(0.67, 0.97 - 0.0025 * n(I.fc));
  const ku_L = (Ast_L * n(I.fsy)) / (alpha2 * n(I.fc)) / n(I.W) / gamma / d_L_eff;
  const ku_W = (Ast_W * n(I.fsy)) / (alpha2 * n(I.fc)) / n(I.B) / gamma / d_W;
  const ku_bal = 0.003 / (0.003 + n(I.fsy) / 200000);
  const over_L = ku_L > ku_bal;
  const over_W = ku_W > ku_bal;
  const Mu_L = over_L ? 0 : (Ast_L * n(I.fsy) * d_L_eff * (1 - (ku_L * gamma) / 2)) / 1e6;
  const Mu_W = over_W ? 0 : (Ast_W * n(I.fsy) * d_W * (1 - (ku_W * gamma) / 2)) / 1e6;
  const phiM_L = phi_b * Mu_L;
  const phiM_W = phi_b * Mu_W;
  const uML = over_L ? Infinity : M_L / phiM_L;
  const uMW = over_W ? Infinity : M_W / phiM_W;

  return {
    sigma_w, sigma_u, sw, util_bear,
    cant_L, cant_W, d_L_eff, d_W, dom,
    Vstar_L, Vstar_W, phiVuc_L, phiVuc_W, kv_L, kv_W, dv_L, dv_W, uVL, uVW,
    phiVuo, Vstar_punch, uPunch, u_perim, fcv, betaH,
    M_L, M_W, phiM_L, phiM_W, uML, uMW, Ast_L, Ast_W, over_L, over_W,
  };
}

const fmt = (v, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
const sClass = (u) => (!Number.isFinite(u) ? 'fail' : u > 1.0 ? 'fail' : u > 0.85 ? 'warn' : 'pass');
const sLabel = (u) => (!Number.isFinite(u) ? 'OVER-REINF' : u > 1.0 ? 'FAIL' : u > 0.85 ? 'PASS — TIGHT' : 'PASS');

const BARS = [12, 16, 20, 24, 28, 32, 36, 40];

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  qa: '250', col_b: '600', col_d: '0',
  B: '5000', W: '5000', D: '1300', cover: '50',
  DL: '3300', LL: '1500', fc: '40', fsy: '500', gamma_c: '25',
  bar_L: '24', sp_L: '200', bar_W: '24', sp_W: '200', layer_W: 'Secondary',
};

function PadFooting() {
  const [I, setI] = useState(DEFAULTS);
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );
  const r = useMemo(() => computeFooting(I), [I]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });

  const checks = [
    { name: 'Bearing pressure', cap: `σ allow ${fmt(n(I.qa), 0)} kPa`, dem: `σ ${fmt(r.sigma_w, 1)} kPa`, util: r.util_bear },
    { name: 'One-way shear (B-dir)', cap: `φVuc ${fmt(r.phiVuc_L, 0)} kN`, dem: `V* ${fmt(r.Vstar_L, 0)} kN`, util: r.uVL },
    { name: 'One-way shear (W-dir)', cap: `φVuc ${fmt(r.phiVuc_W, 0)} kN`, dem: `V* ${fmt(r.Vstar_W, 0)} kN`, util: r.uVW },
    { name: 'Punching shear', cap: `φVuo ${fmt(r.phiVuo, 0)} kN`, dem: `V* ${fmt(r.Vstar_punch, 0)} kN`, util: r.uPunch },
    { name: 'Flexure (B-dir)', cap: `φMu ${fmt(r.phiM_L, 0)} kNm`, dem: `M* ${fmt(r.M_L, 0)} kNm`, util: r.uML },
    { name: 'Flexure (W-dir)', cap: `φMu ${fmt(r.phiM_W, 0)} kNm`, dem: `M* ${fmt(r.M_W, 0)} kNm`, util: r.uMW },
  ];
  const govUtil = Math.max(...checks.map((c) => (Number.isFinite(c.util) ? c.util : 99)));

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Concrete</span><span className="sep">›</span>
            <span className="current">Pad Footing</span>
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
            <div className="lh-meta">Engineering Calculation<br />struclab.com.au</div>
          </div>
        </div>

        <div className="print-project-block">
          <table>
            <tbody>
              <tr><td className="ppb-label">Project</td><td>{I.project || '—'}</td><td className="ppb-label">Job No.</td><td style={{ width: '18%' }}>{I.jobno || '—'}</td></tr>
              <tr><td className="ppb-label">Calculation</td><td>Isolated Pad Footing</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
              <tr><td className="ppb-label">Reference</td><td>AS 3600:2018 Cl 8.1, 8.2.4, 9.3.3</td><td className="ppb-label">Date</td><td>{today}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Isolated Pad Footing</h1>
          <div className="subtitle">AS 3600:2018 · Preliminary sizing — bearing, one-way shear, punching &amp; flexure</div>
        </div>

        <div className="body">
          <aside className="inputs-col no-print">
            <div className="col-heading"><h2 className="label">Inputs</h2><p className="hint">Units: mm, kN, kPa, MPa</p></div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field"><label>Project name</label><input type="text" value={I.project} onChange={set('project')} placeholder="e.g. 123 Smith St Tower" /></div>
              <div className="input-row">
                <div className="input-field"><label>Job No.</label><input type="text" value={I.jobno} onChange={set('jobno')} /></div>
                <div className="input-field"><label>By</label><input type="text" value={I.byname} onChange={set('byname')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Column &amp; bearing</h3>
              <div className="input-field"><label>Allowable bearing q_a (kPa)</label><input type="number" value={I.qa} onChange={set('qa')} step="10" /></div>
              <div className="input-row">
                <div className="input-field"><label>Column width/dia (mm)</label><input type="number" value={I.col_b} onChange={set('col_b')} step="10" /></div>
                <div className="input-field"><label>Column length (mm) [0=circ]</label><input type="number" value={I.col_d} onChange={set('col_d')} step="10" /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Footing geometry</h3>
              <div className="input-row">
                <div className="input-field"><label>Length B (mm)</label><input type="number" value={I.B} onChange={set('B')} step="100" /></div>
                <div className="input-field"><label>Width W (mm)</label><input type="number" value={I.W} onChange={set('W')} step="100" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Depth D (mm)</label><input type="number" value={I.D} onChange={set('D')} step="50" /></div>
                <div className="input-field"><label>Cover (mm)</label><input type="number" value={I.cover} onChange={set('cover')} step="5" /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Loads &amp; materials</h3>
              <div className="input-row">
                <div className="input-field"><label>Dead load DL (kN)</label><input type="number" value={I.DL} onChange={set('DL')} step="100" /></div>
                <div className="input-field"><label>Live load LL (kN)</label><input type="number" value={I.LL} onChange={set('LL')} step="100" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>f&apos;c (MPa)</label><input type="number" value={I.fc} onChange={set('fc')} step="5" /></div>
                <div className="input-field"><label>fsy (MPa)</label><input type="number" value={I.fsy} onChange={set('fsy')} step="10" /></div>
              </div>
              <div className="input-field"><label>γ concrete (kN/m³)</label><input type="number" value={I.gamma_c} onChange={set('gamma_c')} step="1" /></div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Reinforcement</h3>
              <div className="input-row">
                <div className="input-field"><label>Length bar Ø</label><select value={I.bar_L} onChange={set('bar_L')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
                <div className="input-field"><label>Length spacing (mm)</label><input type="number" value={I.sp_L} onChange={set('sp_L')} step="25" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Width bar Ø</label><select value={I.bar_W} onChange={set('bar_W')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
                <div className="input-field"><label>Width spacing (mm)</label><input type="number" value={I.sp_W} onChange={set('sp_W')} step="25" /></div>
              </div>
              <div className="input-field"><label>Width bars layer</label><select value={I.layer_W} onChange={set('layer_W')}><option value="Primary">Primary (above length bars)</option><option value="Secondary">Secondary (below length bars)</option></select></div>
            </div>
          </aside>

          <main className="results-col">
            <div className={`footing-verdict ${sClass(govUtil)}`}>
              <div className="footing-verdict-main">
                <span className="footing-verdict-label">Governing utilisation</span>
                <span className="footing-verdict-value">{fmt(govUtil, 2)}</span>
              </div>
              <span className={`footing-verdict-status ${sClass(govUtil)}`}>{sLabel(govUtil)}</span>
            </div>

            <table className="calc-table">
              <thead>
                <tr><th>Check</th><th>Capacity</th><th>Demand</th><th>Utilisation</th><th>Status</th></tr>
              </thead>
              <tbody>
                {checks.map((c, i) => (
                  <tr key={i}>
                    <td className="label">{c.name}</td>
                    <td className="mono">{c.cap}</td>
                    <td className="mono">{c.dem}</td>
                    <td className="mono">{Number.isFinite(c.util) ? fmt(c.util, 2) : '—'}</td>
                    <td className={`bulk-status ${sClass(c.util)}`}>{sLabel(c.util)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="col-heading" style={{ marginTop: 16 }}>
              <h2 className="label">Key derived values</h2>
            </div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">ULS bearing pressure σu</td><td className="value mono">{fmt(r.sigma_u, 1)} kPa</td><td className="ref">incl. self-wt {fmt(r.sw, 0)} kN</td></tr>
                <tr><td className="label">d_om (punching effective depth)</td><td className="value mono">{fmt(r.dom, 0)} mm</td><td className="ref">D − cover − (Ø_L+Ø_W)/2</td></tr>
                <tr><td className="label">Critical perimeter u</td><td className="value mono">{fmt(r.u_perim, 0)} mm</td><td className="ref">βH = {fmt(r.betaH, 2)}, fcv = {fmt(r.fcv, 3)}</td></tr>
                <tr><td className="label">One-way kv / dv (B-dir)</td><td className="value mono">{fmt(r.kv_L, 3)} / {fmt(r.dv_L, 0)} mm</td><td className="ref">Cl 8.2.4.3</td></tr>
                <tr><td className="label">Ast provided (B / W)</td><td className="value mono">{fmt(r.Ast_L, 0)} / {fmt(r.Ast_W, 0)} mm²</td><td className="ref">N{I.bar_L}-{I.sp_L} / N{I.bar_W}-{I.sp_W}</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>Bearing</strong>: σ = (DL + LL + self-weight)/A vs q_a (serviceability). ULS pressure σu = [1.2(DL+SW) + 1.5LL]/A drives shear and flexure.</p>
                  <p><strong>One-way shear</strong> (Cl 8.2.4.1): φVuc = φ·kv·b·dv·√f&apos;c, √f&apos;c ≤ 8.0; kv = 200/(1000 + 1.3·dv) ≤ 0.15 (simplified method, Cl 8.2.4.3, no shear reinforcement); dv = max(0.72D, 0.9d). V* at d from the column face. <strong>Punching</strong> (Cl 9.3.3): φVuo = φ·u·d_om·fcv, fcv = min[0.17(1+2/βH)√f&apos;c, 0.34√f&apos;c]. <strong>Flexure</strong> (Cl 8.1): rectangular stress block, α2 and γ per Cl 8.1.3, cantilever moment about the column face.</p>
                  <p className="hint"><strong>Preliminary sizing only.</strong> This tool does not check development length, crack control, bearing at the column interface, eccentric/biaxial loading, sliding/overturning, or soil settlement, and assumes concentric axial load with uniform bearing. It is indicative and must not be used as a substitute for a designed and documented footing. Verify independently.</p>
                </div>
              ) : null}
            </section>
          </main>
        </div>

        <div className="print-footer">StrucLab · LabKit · struclab.com.au · Generated {today}</div>
        <div className="workspace-footer">
          <span>StrucLab · LabKit · struclab.com.au</span>
          <span className="mono">Generated {today}</span>
        </div>
      </div>
    </div>
  );
}

export default PadFooting;
