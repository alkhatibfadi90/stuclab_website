'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// SLAB REINFORCEMENT RATE — Estimates & Quantities
// Flat slab, up to 4 reo layers (A/B/C/D) each Ø + spacing.
// Rate = Σ(1000/spacing × mass/m) per m²; /(t/1000) for kg/m³.
// Crack-control advisory by As/m vs 1.75t / 3.5t / 6t thresholds.
// Verified against the sheet (t300, N16@200 ×2, N12@200 ×2 →
// 25.29 kg/m², 84.30 kg/m³, Moderate crack control).
// ============================================================

const n = (v) => parseFloat(v) || 0;

const BAR_MASS = { 10: 0.632, 12: 0.91, 16: 1.619, 20: 2.528, 24: 3.64, 28: 4.955, 32: 6.471, 36: 8.91, 40: 10.112 };
const BARS = [10, 12, 16, 20, 24, 28, 32, 36, 40];

function crackLabel(As, t) {
  // ascending thresholds; approximate match (largest threshold <= As)
  if (As >= 6 * t) return 'Strong crack control';
  if (As >= 3.5 * t) return 'Strong crack control';
  if (As >= 1.75 * t) return 'Moderate crack control';
  if (As > 0) return 'Minor crack control';
  return '—';
}
// Match the sheet's banding exactly: >=1.75t Minor boundary, the VLOOKUP table is
// 525->Minor, 1050->Moderate, 1800->Strong (largest threshold <= As wins).
function crackLabelSheet(As, t) {
  const tbl = [[1.75 * t, 'Minor crack control'], [3.5 * t, 'Moderate crack control'], [6 * t, 'Strong crack control']];
  let label = As < tbl[0][0] ? 'Below minimum' : '—';
  for (const [thr, lab] of tbl) if (As >= thr) label = lab;
  return label;
}

function compute(I, layers) {
  const t = n(I.t);
  const rows = layers.map((L) => {
    const dia = n(L.dia), spac = n(L.spac);
    const barsPerM = spac > 0 ? 1000 / spac : 0;
    const w = barsPerM * (BAR_MASS[dia] || 0);   // kg/m² for this layer
    return { ...L, barsPerM, w };
  });
  const byArea = rows.reduce((s, r) => s + r.w, 0);
  const vol = t / 1000;                            // m³ per m²
  const byVol = vol > 0 ? byArea / vol : 0;

  // crack control: As/m per direction. Dir1 = Layer A + C, Dir2 = Layer B + D.
  const asOf = (L) => n(L.dia) ** 2 * Math.PI / 4 * (n(L.spac) > 0 ? 1000 / n(L.spac) : 0);
  const as1 = asOf(layers[0]) + asOf(layers[2]); // A + C
  const as2 = asOf(layers[1]) + asOf(layers[3]); // B + D
  return { rows, byArea, byVol, vol, as1, as2, cc1: crackLabelSheet(as1, t), cc2: crackLabelSheet(as2, t) };
}

const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

const DEFAULTS = { project: '', jobno: '', byname: '', t: '300' };
const DEFAULT_LAYERS = [
  { name: 'A', dia: '16', spac: '200' },
  { name: 'B', dia: '16', spac: '200' },
  { name: 'C', dia: '12', spac: '200' },
  { name: 'D', dia: '12', spac: '200' },
];

// --- Slab section sketch: band (t x 1m), top + bottom reo mats, dots inside, triangle poche (no U-bars) ---
function SlabSketch({ I, layers }) {
  const t = n(I.t);
  const VBW = 460, VBH = 200;
  const w = 360, cx = VBW / 2, cy = 96;
  const th = Math.min(Math.max(t * 0.16, 38), 52);
  const L = cx - w / 2, R = cx + w / 2, T = cy - th / 2, B = cy + th / 2;
  const cov = 9;
  const matTop = T + cov, matBot = B - cov;
  const dotTop = matTop + 5, dotBot = matBot - 5;
  const gap = matBot - matTop;
  const cogTop = gap * 0.62;
  const cogBot = gap * 0.62; // same cog height as top
  const botInset = 3; // bottom mat pulled in at each end so its cogs sit inboard of the top mat cogs
  const hasTop = n(layers[0].spac) > 0 || n(layers[1].spac) > 0;
  const hasBot = n(layers[2].spac) > 0 || n(layers[3].spac) > 0;
  const ndots = 16;
  const dxs = Array.from({ length: ndots }).map((_, i) => L + 16 + ((w - 32) / (ndots - 1)) * i);

  const tris = [];
  Array.from({ length: 9 }).forEach((_, i, a) => {
    const x = L + 26 + ((w - 52) / (a.length - 1)) * i, y = cy, s = 2.6;
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

      <rect x={L} y={T} width={w} height={th} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" />
      {tris}
      {/* top mat with end cogs turning down */}
      {hasTop ? <path d={`M ${L + cov} ${matTop + cogTop} L ${L + cov} ${matTop} L ${R - cov} ${matTop} L ${R - cov} ${matTop + cogTop}`} fill="none" stroke="var(--brand-gold-deep)" strokeWidth="0.9" strokeLinejoin="round" /> : null}
      {hasTop ? dxs.map((x, i) => <circle key={`t${i}`} cx={x} cy={dotTop} r="2.2" fill="var(--brand-gold)" />) : null}
      {/* bottom mat with end cogs turning up */}
      {hasBot ? <path d={`M ${L + cov + botInset} ${matBot - cogBot} L ${L + cov + botInset} ${matBot} L ${R - cov - botInset} ${matBot} L ${R - cov - botInset} ${matBot - cogBot}`} fill="none" stroke="var(--brand-gold-deep)" strokeWidth="0.9" strokeLinejoin="round" /> : null}
      {hasBot ? dxs.map((x, i) => <circle key={`b${i}`} cx={x} cy={dotBot} r="2.2" fill="var(--brand-gold)" />) : null}

      {/* dimensions */}
      <line x1={L} y1={B + 14} x2={R} y2={B + 14} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={B + 26} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">1 m width (rate basis)</text>
      <line x1={L - 14} y1={T} x2={L - 14} y2={B} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={L - 26} y={cy} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${L - 26} ${cy})`}>t = {fmt(t, 0)}</text>

      <text x={cx} y={VBH - 8} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">top mat (A/B)  ·  bottom mat (C/D)  ·  thickness shown enlarged for clarity</text>
    </svg>
  );
}

function SlabReo() {
  const [I, setI] = useState(DEFAULTS);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);
  const r = useMemo(() => compute(I, layers), [I, layers]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });
  const updL = (i, k, v) => setLayers((p) => p.map((L, j) => (j === i ? { ...L, [k]: v } : L)));

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Estimates &amp; Quantities</span><span className="sep">›</span>
            <span className="current">Slab Reo Rate</span>
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
            <tr><td className="ppb-label">Calculation</td><td>Slab Reinforcement Rate</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>Estimating rate (indicative)</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Slab Reinforcement Rate</h1>
          <div className="subtitle">Estimates &amp; Quantities · Reinforcement rate (kg/m² and kg/m³) for a flat slab, up to four layers</div>
        </div>

        <div className="body">
          <aside className="inputs-col no-print">
            <div className="col-heading"><h2 className="label">Inputs</h2><p className="hint">Units: mm. Spacing 0 = layer not used.</p></div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field"><label>Project name</label><input type="text" value={I.project} onChange={set('project')} placeholder="e.g. 123 Smith St Tower" /></div>
              <div className="input-row">
                <div className="input-field"><label>Job No.</label><input type="text" value={I.jobno} onChange={set('jobno')} /></div>
                <div className="input-field"><label>By</label><input type="text" value={I.byname} onChange={set('byname')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Slab</h3>
              <div className="input-field"><label>Thickness t (mm)</label><input type="number" value={I.t} onChange={set('t')} step="25" /></div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Reinforcement layers</h3>
              {layers.map((L, i) => (
                <div className="input-row" key={i}>
                  <div className="input-field" style={{ flex: '0 0 54px' }}><label>Layer</label><input type="text" value={L.name} disabled style={{ textAlign: 'center', opacity: 0.8 }} /></div>
                  <div className="input-field"><label>Ø</label><select value={L.dia} onChange={(e) => updL(i, 'dia', e.target.value)}>{BARS.map((x) => <option key={x} value={x}>N{x}</option>)}</select></div>
                  <div className="input-field"><label>Spacing</label><input type="number" value={L.spac} onChange={(e) => updL(i, 'spac', e.target.value)} step="25" /></div>
                </div>
              ))}
              <p className="hint">Top mat: A &amp; B · Bottom mat: C &amp; D.</p>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(2, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byArea, 1)}</span><span className="bulk-sum-l">Rate by area (kg/m²)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byVol, 1)}</span><span className="bulk-sum-l">Rate by volume (kg/m³)</span></div>
            </div>

            <div className="bulk-theory" style={{ marginTop: 0, marginBottom: 16 }}>
              <SlabSketch I={I} layers={layers} />
            </div>

            <div className="col-heading"><h2 className="label">Layer breakdown</h2><p className="hint">Per metre width. Bar mass per AS/NZS 4671.</p></div>
            <table className="calc-table">
              <thead><tr><th>Layer</th><th>Bar</th><th>Spacing</th><th>Bars/m</th><th>kg/m²</th></tr></thead>
              <tbody>
                {r.rows.map((row, i) => (
                  <tr key={i}><td className="label">Layer {row.name}</td><td className="mono">N{row.dia}</td><td className="mono">{row.spac}</td><td className="mono">{fmt(row.barsPerM, 2)}</td><td className="mono">{fmt(row.w, 2)}</td></tr>
                ))}
                <tr className="summary-row"><td className="label"><strong>Total</strong></td><td /><td /><td /><td className="mono"><strong>{fmt(r.byArea, 2)}</strong></td></tr>
              </tbody>
            </table>

            <div className="col-heading" style={{ marginTop: 16 }}><h2 className="label">Crack control (advisory)</h2><p className="hint">As per metre vs thresholds 1.75t / 3.5t / 6t.</p></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Direction 1 (Layers A + C)</td><td className="value mono">{fmt(r.as1, 0)} mm²/m</td><td className="ref">{r.cc1}</td></tr>
                <tr><td className="label">Direction 2 (Layers B + D)</td><td className="value mono">{fmt(r.as2, 0)} mm²/m</td><td className="ref">{r.cc2}</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>Rate by area</strong> = Σ over layers of (1000 / spacing) × mass per metre (kg/m²). <strong>Rate by volume</strong> = rate by area ÷ (t / 1000) (kg/m³). Each layer is bars in one direction at the given spacing.</p>
                  <p><strong>Crack control</strong> classifies the provided steel area per metre (Σ Ø²·π/4 × bars/m for the two directions) against 1.75t / 3.5t / 6t — an indicative guide to the degree of crack control, not a serviceability check. Bar masses per AS/NZS 4671.</p>
                  <p className="hint">Indicative estimating tool — not a bar schedule or design check. Verify independently.</p>
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

export default SlabReo;
