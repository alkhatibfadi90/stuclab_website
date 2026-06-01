'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// BEAM REINFORCEMENT RATE — Estimates & Quantities
// Flanged/tapered beam (slab over beam). Main-bar schedule +
// ties → total reo mass and kg/m³. Verified against the sheet
// (D500/t300/b1=b2=1000/L1000, N12@200 ties, 10-N20 → 78.13 kg/m³).
// ============================================================

const n = (v) => parseFloat(v) || 0;

const BAR_MASS = { 10: 0.632, 12: 0.91, 16: 1.619, 20: 2.528, 24: 3.64, 28: 4.955, 32: 6.471, 36: 8.91, 40: 10.112 };
const BARS = [10, 12, 16, 20, 24, 28, 32, 36, 40];

function compute(I, bars) {
  const D = n(I.D), t = n(I.t), b1 = n(I.b1), b2 = n(I.b2), L = n(I.L), cover = n(I.cover), hook = n(I.hook);
  const tieDia = n(I.tieDia), tieSpac = n(I.tieSpac);

  // concrete volume: slab part + tapered beam part
  const vol = (t * b2 + (D - t) * (b1 + b2) / 2) * L / 1e9;

  // ties
  const tieLen = (D + D + b1 + b2) - 4 * cover + 2 * hook;            // mm per set
  const nSets = tieSpac > 0 ? L / tieSpac : 0;
  const tieTotal = nSets * (BAR_MASS[tieDia] || 0) * tieLen / 1000;   // kg

  // main bars (schedule)
  const rows = bars.map((b) => {
    const w = n(b.count) * (BAR_MASS[n(b.dia)] || 0) * n(b.len) / 1000;
    return { ...b, w };
  });
  const mainTotal = rows.reduce((s, r) => s + r.w, 0);

  const total = mainTotal + tieTotal;
  return { vol, tieLen, nSets, tieTotal, rows, mainTotal, total, byVol: vol > 0 ? total / vol : 0 };
}

const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  D: '500', t: '300', b1: '1000', b2: '1000', L: '1000', cover: '30', hook: '75',
  tieDia: '12', tieSpac: '200',
};
const DEFAULT_BARS = [{ count: '10', dia: '20', len: '1000' }];

// --- T-beam cross-section sketch: flange (b2 x t) over narrow web (b1), ties + bars, triangle poché ---
function BeamSketch({ I }) {
  const D = n(I.D), t = n(I.t), b1 = n(I.b1), b2 = n(I.b2), cover = n(I.cover);
  const VBW = 460, VBH = 250;
  const maxW = 270, maxH = 150;
  const sc = Math.min(maxW / Math.max(b2, b1, 1), maxH / Math.max(D, 1), 0.3);
  const fw = b2 * sc, ww = b1 * sc, h = D * sc, fh = Math.min(t * sc, h - 6);
  const cx = VBW / 2, topY = 48;
  const covPx = Math.max(Math.min(cover * sc, 7), 2.5);

  const fL = cx - fw / 2, fR = cx + fw / 2;     // flange edges
  const wL = cx - ww / 2, wR = cx + ww / 2;     // web edges
  const flBot = topY + fh;                       // flange bottom y
  const botY = topY + h;                         // overall bottom y

  // T outline
  const outline = `M ${fL} ${topY} L ${fR} ${topY} L ${fR} ${flBot} L ${wR} ${flBot} L ${wR} ${botY} L ${wL} ${botY} L ${wL} ${flBot} L ${fL} ${flBot} Z`;

  // triangle poché (web + flange)
  const tris = [];
  [[0.5, 0.18], [0.32, 0.12], [0.68, 0.12], [0.5, 0.55], [0.42, 0.78], [0.58, 0.72]].forEach(([fx, fy], i) => {
    const inWeb = fy > (fh / h);
    const x = inWeb ? (wL + fx * ww) : (fL + fx * fw);
    const y = topY + fy * h, s = 2.8;
    tris.push(<path key={i} d={`M ${x} ${y - s} L ${x - s} ${y + s} L ${x + s} ${y + s} Z`} fill="var(--line-strong)" opacity="0.55" />);
  });

  // stirrup around the web
  const stL = wL + covPx, stR = wR - covPx, stT = topY + covPx, stB = botY - covPx;
  // bottom main bars (in web)
  const nBot = 3;
  const botBars = Array.from({ length: nBot }).map((_, i) => (stL + 4) + ((stR - stL - 8) / (nBot - 1)) * i);
  // top bars in flange corners
  const topBars = [stL + 4, stR - 4];

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker id="dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 2 L6 5 L0 8" fill="none" stroke="var(--text-muted)" strokeWidth="1" />
        </marker>
      </defs>

      <text x={cx} y={24} fill="var(--brand-gold-bright)" fontSize="11" textAnchor="middle" fontFamily="var(--brand-font-sans)">SECTION</text>

      <path d={outline} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinejoin="round" />
      {tris}

      {/* stirrup */}
      <rect x={stL} y={stT} width={stR - stL} height={stB - stT} rx="3" fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1" />
      {/* main bars */}
      {botBars.map((x, i) => <circle key={`b${i}`} cx={x} cy={botY - covPx - 3} r="2.6" fill="var(--brand-gold)" />)}
      {topBars.map((x, i) => <circle key={`t${i}`} cx={x} cy={topY + covPx + 3} r="2.4" fill="var(--brand-gold-deep)" />)}

      {/* dimensions */}
      <line x1={fL} y1={topY - 12} x2={fR} y2={topY - 12} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={topY - 16} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)">b₂ = {fmt(b2, 0)}</text>
      <line x1={wL} y1={botY + 12} x2={wR} y2={botY + 12} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={botY + 24} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)">b₁ = {fmt(b1, 0)}</text>
      <line x1={fR + 16} y1={topY} x2={fR + 16} y2={botY} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={fR + 30} y={topY + h / 2} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${fR + 30} ${topY + h / 2})`}>D = {fmt(D, 0)}</text>
      <line x1={fL - 12} y1={topY} x2={fL - 12} y2={flBot} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={fL - 22} y={topY + fh / 2} fill="var(--text-faint)" fontSize="8" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${fL - 22} ${topY + fh / 2})`}>t {fmt(t, 0)}</text>

      <text x={cx} y={VBH - 10} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">cover {fmt(cover, 0)} mm  ·  N{I.tieDia} ties @ {fmt(n(I.tieSpac), 0)}  ·  main bars per schedule</text>
    </svg>
  );
}

function BeamReo() {
  const [I, setI] = useState(DEFAULTS);
  const [bars, setBars] = useState(DEFAULT_BARS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);
  const r = useMemo(() => compute(I, bars), [I, bars]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });

  const updateBar = (i, key, val) => setBars((p) => p.map((b, j) => (j === i ? { ...b, [key]: val } : b)));
  const addBar = () => setBars((p) => [...p, { count: '2', dia: '16', len: '1000' }]);
  const delBar = (i) => setBars((p) => p.filter((_, j) => j !== i));

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Estimates &amp; Quantities</span><span className="sep">›</span>
            <span className="current">Beam Reo Rate</span>
          </div>
        </div>
        <button className="btn-pdf" onClick={() => window.print()} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></svg>
          Download PDF
        </button>
      </div>

      <div className="workspace">
        <div className="print-letterhead">
          <div className="lh-row"><div className="lh-brand">Struc<span className="lab">Lab</span></div><div className="lh-meta">Engineering Calculation<br />struclab.com.au</div></div>
        </div>

        <div className="print-project-block">
          <table><tbody>
            <tr><td className="ppb-label">Project</td><td>{I.project || '—'}</td><td className="ppb-label">Job No.</td><td style={{ width: '18%' }}>{I.jobno || '—'}</td></tr>
            <tr><td className="ppb-label">Calculation</td><td>Beam Reinforcement Rate</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>Estimating rate (indicative)</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Beam Reinforcement Rate</h1>
          <div className="subtitle">Estimates &amp; Quantities · Reinforcement mass and kg/m³ for a beam (with slab flange)</div>
        </div>

        <div className="body">
          <aside className="inputs-col no-print">
            <div className="col-heading"><h2 className="label">Inputs</h2><p className="hint">Units: mm</p></div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field"><label>Project name</label><input type="text" value={I.project} onChange={set('project')} placeholder="e.g. 123 Smith St Tower" /></div>
              <div className="input-row">
                <div className="input-field"><label>Job No.</label><input type="text" value={I.jobno} onChange={set('jobno')} /></div>
                <div className="input-field"><label>By</label><input type="text" value={I.byname} onChange={set('byname')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Beam geometry</h3>
              <div className="input-row">
                <div className="input-field"><label>Beam depth D (mm)</label><input type="number" value={I.D} onChange={set('D')} step="50" /></div>
                <div className="input-field"><label>Slab thickness t (mm)</label><input type="number" value={I.t} onChange={set('t')} step="25" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Width at soffit b₁ (mm)</label><input type="number" value={I.b1} onChange={set('b1')} step="50" /></div>
                <div className="input-field"><label>Width at slab b₂ (mm)</label><input type="number" value={I.b2} onChange={set('b2')} step="50" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Length (mm)</label><input type="number" value={I.L} onChange={set('L')} step="100" /></div>
                <div className="input-field"><label>Cover (mm)</label><input type="number" value={I.cover} onChange={set('cover')} step="5" /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Ties</h3>
              <div className="input-row">
                <div className="input-field"><label>Tie Ø</label><select value={I.tieDia} onChange={set('tieDia')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
                <div className="input-field"><label>Spacing (mm)</label><input type="number" value={I.tieSpac} onChange={set('tieSpac')} step="25" /></div>
              </div>
              <div className="input-field"><label>Tie hook allowance (mm)</label><input type="number" value={I.hook} onChange={set('hook')} step="5" /></div>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byVol, 1)}</span><span className="bulk-sum-l">Rate by volume (kg/m³)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.total, 1)}</span><span className="bulk-sum-l">Total reo mass (kg)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.vol, 2)}</span><span className="bulk-sum-l">Concrete volume (m³)</span></div>
            </div>

            <div className="bulk-theory" style={{ marginTop: 0, marginBottom: 16 }}>
              <BeamSketch I={I} />
            </div>

            <div className="col-heading"><h2 className="label">Main bar schedule</h2><p className="hint">Add rows for each bar group. Live calc.</p></div>
            <div className="bulk-grid-wrap no-print">
              <table className="bulk-grid">
                <thead><tr><th className="bulk-th-idx" /><th>No.</th><th>Bar</th><th>Length (mm)</th><th className="bulk-th-res">Mass (kg)</th><th className="bulk-th-idx" /></tr></thead>
                <tbody>
                  {bars.map((b, i) => (
                    <tr key={i}>
                      <td className="bulk-idx">{i + 1}</td>
                      <td><input type="number" value={b.count} onChange={(e) => updateBar(i, 'count', e.target.value)} /></td>
                      <td><select value={b.dia} onChange={(e) => updateBar(i, 'dia', e.target.value)}>{BARS.map((x) => <option key={x} value={x}>N{x}</option>)}</select></td>
                      <td><input type="number" value={b.len} onChange={(e) => updateBar(i, 'len', e.target.value)} /></td>
                      <td className="bulk-res mono">{fmt(r.rows[i].w, 1)}</td>
                      <td className="bulk-del"><button type="button" onClick={() => delBar(i)} aria-label="Delete bar">×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bulk-toolbar no-print"><button className="btn-calc" type="button" onClick={addBar}>+ Add bar group</button></div>

            <div className="col-heading" style={{ marginTop: 16 }}><h2 className="label">Breakdown</h2></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Main bars (schedule)</td><td className="value mono">{fmt(r.mainTotal, 1)} kg</td><td className="ref">{bars.length} group(s)</td></tr>
                <tr><td className="label">Ties</td><td className="value mono">{fmt(r.tieTotal, 1)} kg</td><td className="ref">N{I.tieDia} @ {I.tieSpac}, {fmt(r.nSets, 1)} sets, {fmt(r.tieLen, 0)} mm/set</td></tr>
                <tr className="summary-row"><td className="label"><strong>Total reo</strong></td><td className="value mono"><strong>{fmt(r.total, 1)} kg</strong></td><td className="ref">/ {fmt(r.vol, 2)} m³ = {fmt(r.byVol, 1)} kg/m³</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>Concrete volume</strong> = [t·b₂ + (D − t)·(b₁ + b₂)/2] · Length — a slab flange (thickness t, width b₂) over a tapered beam web (depth D − t, widths b₁ to b₂).</p>
                  <p><strong>Ties</strong>: length per set = 2D + b₁ + b₂ − 4·cover + 2·hook; total = (Length / spacing) × mass/m × length. <strong>Main bars</strong>: Σ(count × mass/m × length) from the schedule. <strong>Rate</strong> = total mass / concrete volume (kg/m³). Bar masses are AS/NZS 4671 standard values.</p>
                  <p className="hint">Indicative estimating tool — not a bar schedule for detailing. Confirm laps, hooks and cranks against the design. Verify independently.</p>
                </div>
              ) : null}
            </section>
          </main>
        </div>

        <div className="print-footer">StrucLab · LabKit · struclab.com.au · Generated {today}</div>
        <div className="workspace-footer"><span>StrucLab · LabKit · struclab.com.au</span><span className="mono">Generated {today}</span></div>
      </div>
    </div>
  );
}

export default BeamReo;
