'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// PAD FOOTING REINFORCEMENT RATE — Estimating
// Reproduces the BG&E reo-rate logic: geometry + reo layout →
// total reo mass, kg/m² and kg/m³. Verified against the sheet
// (5500×5500×1200, N28 → 59.88 kg/m², 49.90 kg/m³).
// ============================================================

const n = (v) => parseFloat(v) || 0;

const BAR_MASS = { 10: 0.632, 12: 0.91, 16: 1.619, 20: 2.528, 24: 3.64, 28: 4.955, 32: 6.471, 36: 8.91, 40: 10.112 };
const STARTER_LAP = { 12: 500, 16: 650, 20: 800, 24: 1000, 28: 1150, 32: 1300 };
const BARS = [12, 16, 20, 24, 28, 32, 36, 40];

function compute(I) {
  const W = n(I.W), L = n(I.L), t = n(I.D), cov = n(I.cover);
  const nA = n(I.nA), dA = n(I.dA), nB = n(I.nB), dB = n(I.dB), nS = n(I.nS), dS = n(I.dS);
  const reoCog = n(I.reoCog), starterCog = n(I.starterCog);
  const starterLap = STARTER_LAP[dB] || 0;

  const area = W * L / 1e6;
  const vol = area * t / 1000;
  const lenA = (W - 2 * (cov + dA / 2) + reoCog * 2) / 1000;
  const lenB = (L - 2 * (cov + dB / 2) + reoCog * 2) / 1000;
  const lenS = (starterLap + t + starterCog - cov - dA - dB) / 1000;
  const wA = lenA * nA * (BAR_MASS[dA] || 0);
  const wB = lenB * nB * (BAR_MASS[dB] || 0);
  const wS = lenS * nS * (BAR_MASS[dS] || 0);
  const total = wA + wB + wS;
  return { area, vol, lenA, lenB, lenS, wA, wB, wS, total, starterLap, byArea: area > 0 ? total / area : 0, byVol: vol > 0 ? total / vol : 0 };
}

const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  W: '5500', L: '5500', D: '1200', cover: '50',
  nA: '28', dA: '28', nB: '28', dB: '28', nS: '8', dS: '28',
  reoCog: '400', starterCog: '250',
};

// --- Live SVG sketch: plan (top reo grid) + section (depth, layers, starters) ---
function PadSketch({ I }) {
  const W = n(I.W), t = n(I.D), cov = n(I.cover);
  const colB = 600; // representative column stub width (visual only)

  const VBW = 460, VBH = 250;
  const maxW = 300;
  const sc = Math.min(maxW / Math.max(W, 1), 0.06);
  const fW = W * sc;
  const fH = Math.max(t * sc, 28);
  const colW = Math.min(colB * sc, fW * 0.3);
  const colH = 48;
  const cx = VBW / 2;
  const footY = 118;
  const covPx = Math.max(Math.min((cov / Math.max(W, 1)) * fW, 9), 4);
  const left = cx - fW / 2, right = cx + fW / 2;
  const botReoY = footY + fH - covPx;
  const upTurn = Math.min(fH - covPx * 2, 18);
  const colLeft = cx - colW / 2, colRight = cx + colW / 2;

  // bottom bars: keep clear of the U-bar turn-ups at both ends
  const barL = left + covPx + 10, barR = right - covPx - 10;
  const nDots = 6;
  const dots = Array.from({ length: nDots }).map((_, i) => barL + ((barR - barL) / (nDots - 1)) * i);

  // concrete poché: scattered small triangles
  const tris = [];
  const seed = [[0.12,0.35],[0.22,0.72],[0.34,0.28],[0.43,0.6],[0.56,0.4],[0.65,0.75],[0.74,0.32],[0.85,0.62],[0.5,0.78],[0.3,0.5]];
  seed.forEach(([fx, fy], i) => {
    const x = left + fx * fW, y = footY + fy * fH;
    if (x > colLeft - 4 && x < colRight + 4 && y < footY + 6) return;
    const s = 3.2;
    tris.push(<path key={`t${i}`} d={`M ${x} ${y - s} L ${x - s} ${y + s} L ${x + s} ${y + s} Z`} fill="var(--line-strong)" opacity="0.55" />);
  });

  const starterFoot = 16; // horizontal cog foot length at the bottom bend

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker id="dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 2 L6 5 L0 8" fill="none" stroke="var(--text-muted)" strokeWidth="1" />
        </marker>
      </defs>

      <text x={cx} y={24} fill="var(--brand-gold-bright)" fontSize="11" textAnchor="middle" fontFamily="var(--brand-font-sans)">SECTION</text>

      {/* column stub */}
      <rect x={colLeft} y={footY - colH} width={colW} height={colH} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.2" />
      {/* footing body */}
      <rect x={left} y={footY} width={fW} height={fH} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" />
      {/* concrete poché triangles */}
      {tris}

      {/* bottom reo mat with U-bar turned-up ends */}
      <path d={`M ${left + covPx} ${botReoY - upTurn} L ${left + covPx} ${botReoY} L ${right - covPx} ${botReoY} L ${right - covPx} ${botReoY - upTurn}`}
            fill="none" stroke="var(--brand-gold)" strokeWidth="1.8" strokeLinejoin="round" />
      {dots.map((x, i) => <circle key={i} cx={x} cy={botReoY - 4} r="2.3" fill="var(--brand-gold-deep)" />)}

      {/* starter bars: vertical up the column, L-bend cog along the footing bottom */}
      <path d={`M ${colLeft + 5 + starterFoot} ${botReoY} L ${colLeft + 5} ${botReoY} L ${colLeft + 5} ${footY - colH + 7}`}
            fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1.4" strokeLinejoin="round" />
      <path d={`M ${colRight - 5 - starterFoot} ${botReoY} L ${colRight - 5} ${botReoY} L ${colRight - 5} ${footY - colH + 7}`}
            fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1.4" strokeLinejoin="round" />
      {/* column ties: straight horizontal lines */}
      {[0.28, 0.5, 0.72].map((f, i) => (
        <line key={i} x1={colLeft + 5} y1={footY - colH + colH * f} x2={colRight - 5} y2={footY - colH + colH * f} stroke="var(--brand-gold-bright)" strokeWidth="0.9" />
      ))}

      {/* dimensions */}
      <line x1={left} y1={footY + fH + 14} x2={right} y2={footY + fH + 14} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={footY + fH + 28} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">W = {fmt(W, 0)} mm</text>
      <line x1={right + 16} y1={footY} x2={right + 16} y2={footY + fH} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={right + 30} y={footY + fH / 2} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${right + 30} ${footY + fH / 2})`}>D = {fmt(t, 0)} mm</text>
      <text x={colRight + 10} y={footY - colH + 14} fill="var(--text-faint)" fontSize="8" textAnchor="start" fontFamily="var(--brand-font-mono)">starters</text>

      <text x={cx} y={VBH - 10} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">cover {fmt(cov, 0)} mm  ·  N{I.dA} / N{I.dB} bottom layers  ·  N{I.dS} starters</text>
    </svg>
  );
}

function PadFootingReo() {
  const [I, setI] = useState(DEFAULTS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);
  const r = useMemo(() => compute(I), [I]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Estimates &amp; Quantities</span><span className="sep">›</span>
            <span className="current">Pad Footing Reo Rate</span>
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
            <tr><td className="ppb-label">Calculation</td><td>Pad Footing Reinforcement Rate</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>Estimating rate (indicative)</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Pad Footing Reinforcement Rate</h1>
          <div className="subtitle">Estimating · Reinforcement mass, kg/m² and kg/m³ for an isolated pad footing</div>
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
              <h3 className="meta-title">Pad geometry</h3>
              <div className="input-row">
                <div className="input-field"><label>Width W (mm)</label><input type="number" value={I.W} onChange={set('W')} step="100" /></div>
                <div className="input-field"><label>Length L (mm)</label><input type="number" value={I.L} onChange={set('L')} step="100" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Depth D (mm)</label><input type="number" value={I.D} onChange={set('D')} step="50" /></div>
                <div className="input-field"><label>Cover (mm)</label><input type="number" value={I.cover} onChange={set('cover')} step="5" /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Reinforcement</h3>
              <div className="input-row">
                <div className="input-field"><label>Layer A — no.</label><input type="number" value={I.nA} onChange={set('nA')} /></div>
                <div className="input-field"><label>Layer A — Ø</label><select value={I.dA} onChange={set('dA')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Layer B — no.</label><input type="number" value={I.nB} onChange={set('nB')} /></div>
                <div className="input-field"><label>Layer B — Ø</label><select value={I.dB} onChange={set('dB')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Starters — no.</label><input type="number" value={I.nS} onChange={set('nS')} /></div>
                <div className="input-field"><label>Starters — Ø</label><select value={I.dS} onChange={set('dS')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Reo cog (mm)</label><input type="number" value={I.reoCog} onChange={set('reoCog')} step="50" /></div>
                <div className="input-field"><label>Starter cog (mm)</label><input type="number" value={I.starterCog} onChange={set('starterCog')} step="50" /></div>
              </div>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byArea, 1)}</span><span className="bulk-sum-l">Rate by area (kg/m²)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byVol, 1)}</span><span className="bulk-sum-l">Rate by volume (kg/m³)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.total, 0)}</span><span className="bulk-sum-l">Total reo mass (kg)</span></div>
            </div>

            <div className="bulk-theory" style={{ marginTop: 0, marginBottom: 16 }}>
              <PadSketch I={I} />
            </div>

            <div className="col-heading"><h2 className="label">Breakdown</h2><p className="hint">Bar mass per AS/NZS 4671 standard masses.</p></div>
            <table className="calc-table">
              <thead><tr><th>Item</th><th>No.</th><th>Bar</th><th>Length (m)</th><th>Mass (kg)</th></tr></thead>
              <tbody>
                <tr><td className="label">Layer A</td><td className="mono">{I.nA}</td><td className="mono">N{I.dA}</td><td className="mono">{fmt(r.lenA, 3)}</td><td className="mono">{fmt(r.wA, 1)}</td></tr>
                <tr><td className="label">Layer B</td><td className="mono">{I.nB}</td><td className="mono">N{I.dB}</td><td className="mono">{fmt(r.lenB, 3)}</td><td className="mono">{fmt(r.wB, 1)}</td></tr>
                <tr><td className="label">Starter bars</td><td className="mono">{I.nS}</td><td className="mono">N{I.dS}</td><td className="mono">{fmt(r.lenS, 3)}</td><td className="mono">{fmt(r.wS, 1)}</td></tr>
                <tr className="summary-row"><td className="label"><strong>Total</strong></td><td /><td /><td className="mono"><strong>—</strong></td><td className="mono"><strong>{fmt(r.total, 1)}</strong></td></tr>
              </tbody>
            </table>

            <div className="col-heading" style={{ marginTop: 16 }}><h2 className="label">Quantities</h2></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Plan area</td><td className="value mono">{fmt(r.area, 2)} m²</td><td className="ref">W × L</td></tr>
                <tr><td className="label">Concrete volume</td><td className="value mono">{fmt(r.vol, 2)} m³</td><td className="ref">area × D</td></tr>
                <tr><td className="label">Starter lap length</td><td className="value mono">{fmt(r.starterLap, 0)} mm</td><td className="ref">by bar Ø</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p>Reinforcement mass = Σ(bar length × number × mass per metre) for each layer plus starters. Layer bar length = (dimension − 2(cover + Ø/2) + 2·cog). Starter length = (lap + D + starter cog − cover − Ø_A − Ø_B). Bar masses are AS/NZS 4671 standard values.</p>
                  <p><strong>Rate by area</strong> = total mass / plan area (kg/m²); <strong>rate by volume</strong> = total mass / concrete volume (kg/m³). These are estimating rates for early-stage steel tonnage and benchmarking.</p>
                  <p className="hint">Indicative estimating tool — not a detailed bar schedule. Confirm laps, cogs and detailing against the design. Verify independently.</p>
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

export default PadFootingReo;
