'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// COLUMN REINFORCEMENT RATE — Estimates & Quantities
// Rectangular/square/circular column. Vertical bar schedule
// (incl. lap) + tie sets up the height → kg/m³ (with & without
// ties). Verified against the sheet (1500×250×3000, 12-N24,
// N10 ties → 155.31 / 215.71 kg/m³).
// ============================================================

const n = (v) => parseFloat(v) || 0;

const BAR_MASS = { 10: 0.632, 12: 0.91, 16: 1.619, 20: 2.528, 24: 3.64, 28: 4.955, 32: 6.471, 36: 8.91, 40: 10.112 };
const LAP = { 12: 500, 16: 650, 20: 800, 24: 1000, 28: 1150, 32: 1300, 36: 1450, 40: 1600 };
const BARS = [10, 12, 16, 20, 24, 28, 32, 36, 40];

function compute(I, bars) {
  const D = n(I.D), B = n(I.B), H = n(I.H), cover = n(I.cover), hook = n(I.hook);
  const tieDia = n(I.tieDia), tieSpac = n(I.tieSpac);
  const nPerim = n(I.nPerim), nCrossD = n(I.nCrossD), nCrossB = n(I.nCrossB);
  const circular = B === 0;

  const area = circular ? Math.PI * D * D / 4 : D * B;        // mm²
  const vol = area * H / 1e9;                                  // m³

  // tie leg lengths (m)
  const legPerim = (circular ? Math.PI * (D - 2 * (cover + tieDia / 2)) + 2 * hook : ((B + D) * 2 - 8 * cover + 2 * hook)) / 1000;
  const legD = (D - 2 * cover + 2 * hook) / 1000;
  const legB = circular ? 0 : (B - 2 * cover + 2 * hook) / 1000;
  const mt = BAR_MASS[tieDia] || 0;
  const setMass = mt * legPerim * nPerim + mt * legD * nCrossD + mt * legB * nCrossB;
  const nSets = tieSpac > 0 ? H / tieSpac + 2 : 0;
  const tieTotal = setMass * nSets;

  // vertical bars (schedule): count × mass/m × (H + lap)
  const rows = bars.map((b) => {
    const dia = n(b.dia);
    const w = n(b.count) * (BAR_MASS[dia] || 0) * (H + (LAP[dia] || 0)) / 1000;
    return { ...b, lap: LAP[dia] || 0, w };
  });
  const vertTotal = rows.reduce((s, r) => s + r.w, 0);

  const total = vertTotal + tieTotal;
  return {
    circular, area, vol, legPerim, legD, legB, setMass, nSets, tieTotal, rows, vertTotal, total,
    rateNoTies: vol > 0 ? vertTotal / vol : 0, rateWithTies: vol > 0 ? total / vol : 0,
    pct: area > 0 ? (rows.reduce((s, r) => s + n(r.count) * Math.PI * Math.pow(n(r.dia), 2) / 4, 0) / area) * 100 : 0,
  };
}

const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  D: '1500', B: '250', H: '3000', cover: '30', hook: '145',
  tieDia: '10', tieSpac: '250', nPerim: '1', nCrossD: '1', nCrossB: '5',
};
const DEFAULT_BARS = [{ count: '12', dia: '24' }];

// --- Tied column cross-section: perimeter tie + vertical bars + triangle poché ---
function ColumnSketch({ I }) {
  const D = n(I.D), B = n(I.B), cover = n(I.cover);
  const circular = B === 0;
  const VBW = 460, VBH = 270;
  const cx = VBW / 2, cy = 132;
  const maxDim = 150;
  const longSide = Math.max(D, B || D, 1);
  const sc = maxDim / longSide;
  const w = (circular ? D : B) * sc, h = D * sc;     // width across (B), height (D)
  const covPx = Math.max(Math.min(cover * sc, 8), 3);

  // perimeter bars (rough representation)
  const perimDots = [];
  if (circular) {
    const R = (w / 2) - covPx - 5, N = 8;
    for (let i = 0; i < N; i++) {
      const a = (2 * Math.PI / N) * i;
      perimDots.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
  } else {
    const bi = covPx + 5; // bar inset: inside the tie line
    const L = cx - w / 2 + bi, R = cx + w / 2 - bi, T = cy - h / 2 + bi, Bt = cy + h / 2 - bi;
    const nx = 3, ny = 4;
    for (let i = 0; i < nx; i++) { perimDots.push([L + (R - L) / (nx - 1) * i, T]); perimDots.push([L + (R - L) / (nx - 1) * i, Bt]); }
    for (let j = 1; j < ny - 1; j++) { perimDots.push([L, T + (Bt - T) / (ny - 1) * j]); perimDots.push([R, T + (Bt - T) / (ny - 1) * j]); }
  }

  const tris = [];
  [[0.35, 0.4], [0.6, 0.35], [0.5, 0.6], [0.4, 0.7], [0.62, 0.65]].forEach(([fx, fy], i) => {
    const x = cx - w / 2 + fx * w, y = cy - h / 2 + fy * h, s = 2.6;
    tris.push(<path key={i} d={`M ${x} ${y - s} L ${x - s} ${y + s} L ${x + s} ${y + s} Z`} fill="var(--line-strong)" opacity="0.5" />);
  });

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker id="dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 2 L6 5 L0 8" fill="none" stroke="var(--text-muted)" strokeWidth="1" />
        </marker>
      </defs>
      <text x={cx} y={24} fill="var(--brand-gold-bright)" fontSize="11" textAnchor="middle" fontFamily="var(--brand-font-sans)">SECTION</text>

      {circular ? (
        <>
          <circle cx={cx} cy={cy} r={w / 2} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={w / 2 - covPx} fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1" />
        </>
      ) : (
        <>
          <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" />
          <rect x={cx - w / 2 + covPx} y={cy - h / 2 + covPx} width={w - 2 * covPx} height={h - 2 * covPx} rx="3" fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1" />
        </>
      )}
      {tris}
      {perimDots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="var(--brand-gold)" />)}

      {/* dimensions */}
      <line x1={cx - w / 2} y1={cy + h / 2 + 12} x2={cx + w / 2} y2={cy + h / 2 + 12} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={cy + h / 2 + 24} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)">{circular ? `Ø = ${fmt(D, 0)}` : `B = ${fmt(B, 0)}`}</text>
      <line x1={cx + w / 2 + 14} y1={cy - h / 2} x2={cx + w / 2 + 14} y2={cy + h / 2} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx + w / 2 + 28} y={cy} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${cx + w / 2 + 28} ${cy})`}>D = {fmt(D, 0)}</text>

      <text x={cx} y={VBH - 8} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">cover {fmt(cover, 0)} mm  ·  N{I.tieDia} ties @ {fmt(n(I.tieSpac), 0)}  ·  verticals per schedule</text>
    </svg>
  );
}

function ColumnReo() {
  const [I, setI] = useState(DEFAULTS);
  const [bars, setBars] = useState(DEFAULT_BARS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);
  const r = useMemo(() => compute(I, bars), [I, bars]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });

  const updateBar = (i, key, val) => setBars((p) => p.map((b, j) => (j === i ? { ...b, [key]: val } : b)));
  const addBar = () => setBars((p) => [...p, { count: '4', dia: '20' }]);
  const delBar = (i) => setBars((p) => p.filter((_, j) => j !== i));

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Estimates &amp; Quantities</span><span className="sep">›</span>
            <span className="current">Column Reo Rate</span>
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
            <tr><td className="ppb-label">Calculation</td><td>Column Reinforcement Rate</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>Estimating rate (indicative)</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Column Reinforcement Rate</h1>
          <div className="subtitle">Estimates &amp; Quantities · Reinforcement mass and kg/m³ for a column (with &amp; without ties)</div>
        </div>

        <div className="body">
          <aside className="inputs-col no-print">
            <div className="col-heading"><h2 className="label">Inputs</h2><p className="hint">Units: mm · B = 0 for circular</p></div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field"><label>Project name</label><input type="text" value={I.project} onChange={set('project')} placeholder="e.g. 123 Smith St Tower" /></div>
              <div className="input-row">
                <div className="input-field"><label>Job No.</label><input type="text" value={I.jobno} onChange={set('jobno')} /></div>
                <div className="input-field"><label>By</label><input type="text" value={I.byname} onChange={set('byname')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Column geometry</h3>
              <div className="input-row">
                <div className="input-field"><label>Depth / Ø D (mm)</label><input type="number" value={I.D} onChange={set('D')} step="50" /></div>
                <div className="input-field"><label>Width B (mm, 0=circ)</label><input type="number" value={I.B} onChange={set('B')} step="50" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Floor height H (mm)</label><input type="number" value={I.H} onChange={set('H')} step="100" /></div>
                <div className="input-field"><label>Cover (mm)</label><input type="number" value={I.cover} onChange={set('cover')} step="5" /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Ties</h3>
              <div className="input-row">
                <div className="input-field"><label>Tie Ø</label><select value={I.tieDia} onChange={set('tieDia')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
                <div className="input-field"><label>Spacing (mm)</label><input type="number" value={I.tieSpac} onChange={set('tieSpac')} step="25" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Perimeter ties</label><input type="number" value={I.nPerim} onChange={set('nPerim')} /></div>
                <div className="input-field"><label>Hook allow. (mm)</label><input type="number" value={I.hook} onChange={set('hook')} step="5" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Cross-ties (D dir)</label><input type="number" value={I.nCrossD} onChange={set('nCrossD')} /></div>
                <div className="input-field"><label>Cross-ties (B dir)</label><input type="number" value={I.nCrossB} onChange={set('nCrossB')} /></div>
              </div>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.rateWithTies, 1)}</span><span className="bulk-sum-l">Rate incl. ties (kg/m³)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.rateNoTies, 1)}</span><span className="bulk-sum-l">Rate excl. ties (kg/m³)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.pct, 2)}</span><span className="bulk-sum-l">Vertical reo (%)</span></div>
            </div>

            <div className="bulk-theory" style={{ marginTop: 0, marginBottom: 16 }}>
              <ColumnSketch I={I} />
            </div>

            <div className="col-heading"><h2 className="label">Vertical bar schedule</h2><p className="hint">Each row = a bar group. Length per bar = floor height + lap (by Ø). Live calc.</p></div>
            <div className="bulk-grid-wrap no-print">
              <table className="bulk-grid">
                <thead><tr><th className="bulk-th-idx" /><th>No.</th><th>Bar</th><th>Lap (mm)</th><th className="bulk-th-res">Mass (kg)</th><th className="bulk-th-idx" /></tr></thead>
                <tbody>
                  {bars.map((b, i) => (
                    <tr key={i}>
                      <td className="bulk-idx">{i + 1}</td>
                      <td><input type="number" value={b.count} onChange={(e) => updateBar(i, 'count', e.target.value)} /></td>
                      <td><select value={b.dia} onChange={(e) => updateBar(i, 'dia', e.target.value)}>{BARS.map((x) => <option key={x} value={x}>N{x}</option>)}</select></td>
                      <td className="bulk-res mono">{fmt(r.rows[i].lap, 0)}</td>
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
                <tr><td className="label">Vertical bars</td><td className="value mono">{fmt(r.vertTotal, 1)} kg</td><td className="ref">{bars.length} group(s), incl. lap</td></tr>
                <tr><td className="label">Ties</td><td className="value mono">{fmt(r.tieTotal, 1)} kg</td><td className="ref">{fmt(r.setMass, 2)} kg/set × {fmt(r.nSets, 0)} sets</td></tr>
                <tr className="summary-row"><td className="label"><strong>Total reo</strong></td><td className="value mono"><strong>{fmt(r.total, 1)} kg</strong></td><td className="ref">/ {fmt(r.vol, 3)} m³</td></tr>
              </tbody>
            </table>

            <div className="col-heading" style={{ marginTop: 16 }}><h2 className="label">Quantities</h2></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Section</td><td className="value mono">{r.circular ? `Ø${I.D}` : `${I.D} × ${I.B}`} mm</td><td className="ref">{r.circular ? 'circular' : (n(I.D) === n(I.B) ? 'square' : 'rectangular')}</td></tr>
                <tr><td className="label">Concrete volume</td><td className="value mono">{fmt(r.vol, 3)} m³</td><td className="ref">area × H</td></tr>
                <tr><td className="label">Tie set length</td><td className="value mono">{fmt((r.legPerim * n(I.nPerim) + r.legD * n(I.nCrossD) + r.legB * n(I.nCrossB)), 2)} m</td><td className="ref">all legs / set</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>Concrete volume</strong> = section area × floor height (area = D×B, or πD²/4 if circular). <strong>Vertical bars</strong>: Σ(count × mass/m × (H + lap)), lap by bar Ø. <strong>Ties</strong>: each set = perimeter tie + cross-ties; set mass = Σ(leg length × mass/m × number), with sets = H/spacing + 2. Perimeter leg = 2(B+D) − 8·cover + 2·hook (rectangular). <strong>Rate</strong> = mass / volume (kg/m³), reported with and without ties. Bar masses per AS/NZS 4671.</p>
                  <p className="hint">Indicative estimating tool — not a bar schedule. Confirm tie configuration, laps and hooks against the design. Verify independently.</p>
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

export default ColumnReo;
