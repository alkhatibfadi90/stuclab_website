'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

// ============================================================
// SHEAR WALL REINFORCEMENT RATE — Estimates & Quantities
// Vertical mat + horizontal mat + end U-bars. Lap lengths from
// f'c-dependent tables. Solid wall (no openings). Verified
// against the sheet terms (t350/W5000/H3000/fc50: vertical
// 382.2, horizontal 121.4, U-bars 91.8 kg).
// ============================================================

const n = (v) => parseFloat(v) || 0;

const BAR_MASS = { 10: 0.632, 12: 0.91, 16: 1.619, 20: 2.528, 24: 3.64, 28: 4.955, 32: 6.471, 36: 8.91, 40: 10.112 };
const BARS = [10, 12, 16, 20, 24, 28, 32, 36, 40];
const FC_COLS = [32, 40, 50, 65, 75, 85, 100];
// vertical lap (mm) by bar Ø and f'c column
const VLAP = {
  12: [500, 450, 450, 450, 450, 450, 450], 16: [750, 700, 600, 600, 600, 600, 600],
  20: [1000, 900, 800, 800, 800, 800, 800], 24: [1250, 1150, 1000, 900, 900, 900, 900],
  28: [1500, 1350, 1200, 1100, 1100, 1100, 1100], 32: [1800, 1700, 1500, 1300, 1200, 1200, 1200],
  36: [2100, 1900, 1700, 1500, 1400, 1350, 1350], 40: [2100, 1900, 1700, 1500, 1400, 1350, 1350],
};
// U-bar lap (mm) by bar Ø and f'c column
const ULAP = {
  12: [650, 600, 600, 600, 600, 600, 600], 16: [1000, 900, 800, 800, 800, 800, 800],
  20: [1300, 1200, 1100, 1000, 1000, 1000, 1000], 24: [1600, 1500, 1300, 1200, 1200, 1200, 1200],
  28: [2000, 1800, 1600, 1500, 1400, 1400, 1400], 32: [2300, 2100, 1900, 1700, 1600, 1600, 1600],
  36: [2700, 2500, 2200, 1900, 1800, 1700, 1700], 40: [2700, 2500, 2200, 1900, 1800, 1700, 1700],
};
const fcIdx = (fc) => { const i = FC_COLS.indexOf(n(fc)); return i < 0 ? 2 : i; };

function compute(I, vbars, hbars) {
  const t = n(I.t), W = n(I.W), H = n(I.H), fc = n(I.fc), slab = n(I.slab);
  const fi = fcIdx(fc);
  const vol = t * W * H / 1e9;

  // vertical mat: count = W/spacing, length = H + slab + lap
  const vRows = vbars.map((b) => {
    const dia = n(b.dia), spac = n(b.spac);
    const count = spac > 0 ? W / spac : 0;
    const lap = (VLAP[dia] || VLAP[24])[fi];
    const len = H + slab + lap;
    const w = count * (BAR_MASS[dia] || 0) * len / 1000;
    return { ...b, count, lap, len, w };
  });
  const vTotal = vRows.reduce((s, r) => s + r.w, 0);

  // horizontal mat: count = H/spacing, length = W
  const hRows = hbars.map((b) => {
    const dia = n(b.dia), spac = n(b.spac);
    const count = spac > 0 ? H / spac : 0;
    const w = count * (BAR_MASS[dia] || 0) * W / 1000;
    return { ...b, count, w };
  });
  const hTotal = hRows.reduce((s, r) => s + r.w, 0);

  // end U-bars: size = avg horizontal bar size (ceil to even), len = 2*Ulap + t - 60, sets = roundup(H / avg horiz spacing)
  const uQty = n(I.uQty);
  const avgHdia = hbars.length ? Math.ceil((hbars.reduce((s, b) => s + n(b.dia), 0) / hbars.length) / 2) * 2 : 16;
  const uDia = Math.min(40, Math.max(12, avgHdia));
  const avgHspac = hbars.length ? hbars.reduce((s, b) => s + n(b.spac), 0) / hbars.length : 200;
  const uLap = (ULAP[uDia] || ULAP[16])[fi];
  const uLen = 2 * uLap + t - 60;
  const uSets = avgHspac > 0 ? Math.ceil(H / avgHspac) : 0;
  const uTotal = uQty > 0 ? uQty * uLen / 1000 * uSets * (BAR_MASS[uDia] || 0) : 0;

  const total = vTotal + hTotal + uTotal;
  return { vol, vRows, vTotal, hRows, hTotal, uDia, uLap, uLen, uSets, uTotal, total, byVol: vol > 0 ? total / vol : 0 };
}

const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  t: '350', W: '5000', H: '3000', fc: '50', slab: '200', uQty: '2',
};
const DEFAULT_V = [{ dia: '24', spac: '200' }];
const DEFAULT_H = [{ dia: '16', spac: '200' }];

// --- Wall cross-section sketch: elongated rect (t x W), two bar faces, end U-bars, triangle poche ---
function WallSketch({ I }) {
  const t = n(I.t), W = n(I.W);
  const VBW = 460, VBH = 200;
  const maxW = 360, maxT = 64;
  // scale width to fit, thickness shown to a readable (not true) proportion so bars are visible
  const sc = maxW / Math.max(W, 1);
  const w = W * sc;
  const th = Math.min(Math.max(t * sc, 48), maxT);   // clamped thickness for legibility
  const cx = VBW / 2, cy = 96;
  const L = cx - w / 2, R = cx + w / 2, T = cy - th / 2, B = cy + th / 2;
  const cov = 7;

  // two faces of vertical bars (top row + bottom row in section), spaced across width

  // triangle poche along the wall body
  const tris = [];
  Array.from({ length: Math.min(10, Math.max(4, Math.round(W / 600))) }).forEach((_, i, a) => {
    const x = L + 20 + ((w - 40) / (a.length - 1)) * i, y = cy, s = 2.6;
    tris.push(<path key={i} d={`M ${x} ${y - s} L ${x - s} ${y + s} L ${x + s} ${y + s} Z`} fill="var(--line-strong)" opacity="0.5" />);
  });

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker id="dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 2 L6 5 L0 8" fill="none" stroke="var(--text-muted)" strokeWidth="1" />
        </marker>
      </defs>
      <text x={cx} y={26} fill="var(--brand-gold-bright)" fontSize="11" textAnchor="middle" fontFamily="var(--brand-font-sans)">SECTION</text>

      {/* wall body */}
      <rect x={L} y={T} width={w} height={th} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" />
      {tris}
      {/* layering (top->centre): U-bar leg (outer) | gap | horizontal mat | vertical-bar dots (inner) */}
      {(() => {
        const matTop = T + cov + 3;        // horizontal mat line
        const matBot = B - cov - 3;
        const dotTop = matTop + 5;         // vertical-bar dots, inboard of the mat
        const dotBot = matBot - 5;
        const ubTop = matTop - 3;          // U-bar leg sits just outboard of mat (thin gap)
        const ubBot = matBot + 3;
        const rr = 5;                       // U corner radius
        const lapLen = Math.min((R - L) * 0.16, 70);
        const lEnd = L + cov + 2;           // U vertical return near the end (outside the dots)
        const lLeg = lEnd + lapLen;
        const rEnd = R - cov - 2;
        const rLeg = rEnd - lapLen;
        // dots span inboard of the U returns
        const dx0 = lEnd + 8, dx1 = rEnd - 8;
        const ndots = Math.min(24, Math.max(8, Math.round((dx1 - dx0) / 28)));
        const dxs = Array.from({ length: ndots }).map((_, i) => dx0 + ((dx1 - dx0) / (ndots - 1)) * i);
        const leftU = `M ${lLeg} ${ubTop} L ${lEnd + rr} ${ubTop} A ${rr} ${rr} 0 0 0 ${lEnd} ${ubTop + rr} L ${lEnd} ${ubBot - rr} A ${rr} ${rr} 0 0 0 ${lEnd + rr} ${ubBot} L ${lLeg} ${ubBot}`;
        const rightU = `M ${rLeg} ${ubTop} L ${rEnd - rr} ${ubTop} A ${rr} ${rr} 0 0 1 ${rEnd} ${ubTop + rr} L ${rEnd} ${ubBot - rr} A ${rr} ${rr} 0 0 1 ${rEnd - rr} ${ubBot} L ${rLeg} ${ubBot}`;
        return (
          <>
            {/* horizontal mat (full length, both faces) */}
            <line x1={L + cov} y1={matTop} x2={R - cov} y2={matTop} stroke="var(--brand-gold-deep)" strokeWidth="0.9" />
            <line x1={L + cov} y1={matBot} x2={R - cov} y2={matBot} stroke="var(--brand-gold-deep)" strokeWidth="0.9" />
            {/* end U-bars, just outboard of the mat */}
            <path d={leftU} fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1.3" strokeLinecap="round" />
            <path d={rightU} fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1.3" strokeLinecap="round" />
            {/* vertical bar dots, all inside the U-bar envelope */}
            {dxs.map((x, i) => <circle key={`tb${i}`} cx={x} cy={dotTop} r="2.3" fill="var(--brand-gold)" />)}
            {dxs.map((x, i) => <circle key={`bb${i}`} cx={x} cy={dotBot} r="2.3" fill="var(--brand-gold)" />)}
          </>
        );
      })()}

      {/* dimensions */}
      <line x1={L} y1={B + 14} x2={R} y2={B + 14} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={B + 26} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">W = {fmt(W, 0)} mm</text>
      <line x1={L - 14} y1={T} x2={L - 14} y2={B} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={L - 26} y={cy} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${L - 26} ${cy})`}>t = {fmt(t, 0)}</text>

      <text x={cx} y={VBH - 8} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">two reo faces  ·  end U-bars  ·  thickness shown enlarged for clarity</text>
    </svg>
  );
}

function WallReo() {
  const [I, setI] = useState(DEFAULTS);
  const [vbars, setVbars] = useState(DEFAULT_V);
  const [hbars, setHbars] = useState(DEFAULT_H);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);
  const r = useMemo(() => compute(I, vbars, hbars), [I, vbars, hbars]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });

  const updV = (i, k, v) => setVbars((p) => p.map((b, j) => (j === i ? { ...b, [k]: v } : b)));
  const updH = (i, k, v) => setHbars((p) => p.map((b, j) => (j === i ? { ...b, [k]: v } : b)));
  const addV = () => setVbars((p) => [...p, { dia: '16', spac: '200' }]);
  const addH = () => setHbars((p) => [...p, { dia: '12', spac: '200' }]);
  const delV = (i) => setVbars((p) => p.filter((_, j) => j !== i));
  const delH = (i) => setHbars((p) => p.filter((_, j) => j !== i));

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Estimates &amp; Quantities</span><span className="sep">›</span>
            <span className="current">Shear Wall Reo Rate</span>
          </div>
        </div>
        <ThemeToggle />
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
            <tr><td className="ppb-label">Calculation</td><td>Shear Wall Reinforcement Rate</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>Estimating rate (indicative)</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Shear Wall Reinforcement Rate</h1>
          <div className="subtitle">Estimates &amp; Quantities · Reinforcement mass and kg/m³ for a solid shear wall (vertical + horizontal mats, end U-bars)</div>
        </div>

        <div className="body">
          <aside className="inputs-col no-print">
            <div className="col-heading"><h2 className="label">Inputs</h2><p className="hint">Units: mm. Solid wall — excludes openings &amp; trimmers.</p></div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field"><label>Project name</label><input type="text" value={I.project} onChange={set('project')} placeholder="e.g. 123 Smith St Tower" /></div>
              <div className="input-row">
                <div className="input-field"><label>Job No.</label><input type="text" value={I.jobno} onChange={set('jobno')} /></div>
                <div className="input-field"><label>By</label><input type="text" value={I.byname} onChange={set('byname')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Wall geometry</h3>
              <div className="input-row">
                <div className="input-field"><label>Thickness t (mm)</label><input type="number" value={I.t} onChange={set('t')} step="25" /></div>
                <div className="input-field"><label>Width W (mm)</label><input type="number" value={I.W} onChange={set('W')} step="100" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Height H (mm)</label><input type="number" value={I.H} onChange={set('H')} step="100" /></div>
                <div className="input-field"><label>f&apos;c (MPa)</label><select value={I.fc} onChange={set('fc')}>{FC_COLS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Slab thk (lap, mm)</label><input type="number" value={I.slab} onChange={set('slab')} step="25" /></div>
                <div className="input-field"><label>End U-bars (qty)</label><input type="number" value={I.uQty} onChange={set('uQty')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Vertical reo</h3>
              {vbars.map((b, i) => (
                <div className="input-row" key={i}>
                  <div className="input-field"><label>Ø</label><select value={b.dia} onChange={(e) => updV(i, 'dia', e.target.value)}>{BARS.map((x) => <option key={x} value={x}>N{x}</option>)}</select></div>
                  <div className="input-field"><label>Spacing (mm)</label><input type="number" value={b.spac} onChange={(e) => updV(i, 'spac', e.target.value)} step="25" /></div>
                  <button className="bulk-del" type="button" onClick={() => delV(i)} style={{ alignSelf: 'flex-end' }}>×</button>
                </div>
              ))}
              <button className="bulk-btn" type="button" onClick={addV}>+ Add vertical layer</button>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Horizontal reo</h3>
              {hbars.map((b, i) => (
                <div className="input-row" key={i}>
                  <div className="input-field"><label>Ø</label><select value={b.dia} onChange={(e) => updH(i, 'dia', e.target.value)}>{BARS.map((x) => <option key={x} value={x}>N{x}</option>)}</select></div>
                  <div className="input-field"><label>Spacing (mm)</label><input type="number" value={b.spac} onChange={(e) => updH(i, 'spac', e.target.value)} step="25" /></div>
                  <button className="bulk-del" type="button" onClick={() => delH(i)} style={{ alignSelf: 'flex-end' }}>×</button>
                </div>
              ))}
              <button className="bulk-btn" type="button" onClick={addH}>+ Add horizontal layer</button>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byVol, 1)}</span><span className="bulk-sum-l">Rate by volume (kg/m³)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.total, 0)}</span><span className="bulk-sum-l">Total reo mass (kg)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.vol, 2)}</span><span className="bulk-sum-l">Concrete volume (m³)</span></div>
            </div>

            <div className="bulk-theory" style={{ marginTop: 0, marginBottom: 16 }}>
              <WallSketch I={I} />
            </div>

            <div className="col-heading"><h2 className="label">Breakdown</h2><p className="hint">Lap lengths from f&apos;c-dependent tables. Bar mass per AS/NZS 4671.</p></div>
            <table className="calc-table">
              <thead><tr><th>Item</th><th>Bars</th><th>Length (mm)</th><th>Mass (kg)</th></tr></thead>
              <tbody>
                {r.vRows.map((row, i) => (
                  <tr key={`v${i}`}><td className="label">Vertical N{vbars[i].dia} @ {vbars[i].spac}</td><td className="mono">{fmt(row.count, 0)}</td><td className="mono">{fmt(row.len, 0)}</td><td className="mono">{fmt(row.w, 1)}</td></tr>
                ))}
                {r.hRows.map((row, i) => (
                  <tr key={`h${i}`}><td className="label">Horizontal N{hbars[i].dia} @ {hbars[i].spac}</td><td className="mono">{fmt(row.count, 0)}</td><td className="mono">{fmt(n(I.W), 0)}</td><td className="mono">{fmt(row.w, 1)}</td></tr>
                ))}
                <tr><td className="label">End U-bars (N{r.uDia})</td><td className="mono">{fmt(n(I.uQty) * r.uSets, 0)}</td><td className="mono">{fmt(r.uLen, 0)}</td><td className="mono">{fmt(r.uTotal, 1)}</td></tr>
                <tr className="summary-row"><td className="label"><strong>Total reo</strong></td><td /><td /><td className="mono"><strong>{fmt(r.total, 1)}</strong></td></tr>
              </tbody>
            </table>

            <div className="col-heading" style={{ marginTop: 16 }}><h2 className="label">Quantities</h2></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Concrete volume</td><td className="value mono">{fmt(r.vol, 2)} m³</td><td className="ref">t × W × H</td></tr>
                <tr><td className="label">Wall face area</td><td className="value mono">{fmt(n(I.W) * n(I.H) / 1e6, 2)} m²</td><td className="ref">W × H</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>Concrete volume</strong> = t × W × H (solid wall). <strong>Vertical reo</strong>: count = W / spacing, length = H + slab lap + vertical lap (by Ø &amp; f&apos;c). <strong>Horizontal reo</strong>: count = H / spacing, length = W. <strong>End U-bars</strong>: length = 2 × U-lap + t − 60, sets = ⌈H / horizontal spacing⌉, U-bar Ø taken from the horizontal bar size. Lap lengths from f&apos;c-dependent tables; bar mass per AS/NZS 4671.</p>
                  <p className="hint"><strong>Solid wall only</strong> — excludes openings and opening trimmer bars. Bar counts are as entered (add a layer to model each face separately). Indicative estimating tool — verify independently.</p>
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

export default WallReo;
