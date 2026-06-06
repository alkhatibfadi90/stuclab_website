'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// SLAB POST-TENSION RATE — Estimates & Quantities
// PT strand mass (kg/m², kg/m³) + average applied stress for a
// PT slab/beam. Strand properties by size; losses by profile.
// Verified against the sheet (D250/w1000, 2 tendons × 5 strands
// 12.7mm, draped → 7.85 kg/m², 31.40 kg/m³, 4.38 MPa).
// ============================================================

const n = (v) => parseFloat(v) || 0;

// strand size (mm) -> { area mm², min breaking load kN, min tensile strength MPa }
const STRAND = {
  '5': { a: 19.6, mbl: 30.4, mts: 1550 },
  '7': { a: 38.5, mbl: 65.5, mts: 1700 },
  '9.3': { a: 54.7, mbl: 102, mts: 1860 },
  '12.7': { a: 100, mbl: 184, mts: 1840 },
  '15.2': { a: 143, mbl: 250, mts: 1750 },
};
const STRAND_SIZES = ['5', '7', '9.3', '12.7', '15.2'];
const PROFILE_LOSS = { Draped: 30, Constant: 20 };

function compute(I) {
  const D = n(I.D), w = n(I.w), nTendon = n(I.nTendon), nStrand = n(I.nStrand);
  const s = STRAND[I.size] || STRAND['12.7'];
  const loss = PROFILE_LOSS[I.profile] ?? 30;

  const area = w / 1000;              // m² per m strip
  const vol = D * w / 1e6;            // m³ per m strip
  const totStrands = nTendon * nStrand;
  const massPerM = totStrands * s.a / 1e6 * 7850;
  const byArea = area > 0 ? massPerM / area : 0;
  const byVol = vol > 0 ? massPerM / vol : 0;

  const jack = 0.85 * s.mbl;
  const lessLoss = jack * (1 - loss / 100);
  const avgStress = (D * w) > 0 ? lessLoss * totStrands * 1000 / (D * w) : 0;

  return { s, loss, area, vol, totStrands, massPerM, byArea, byVol, jack, lessLoss, avgStress };
}

const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  D: '250', w: '1000', nTendon: '2', nStrand: '5', size: '12.7', profile: 'Draped',
};

// --- Slab PT section: slab band + top/bottom mats with end cogs, dots only at ends,
//     draped tendon full length, anchorage coils at each end ---
function PtSketch({ I }) {
  const D = n(I.D), w = n(I.w);
  const draped = I.profile === 'Draped';
  const VBW = 460, VBH = 200;
  const bw = 360, cx = VBW / 2, cy = 96;
  const th = Math.min(Math.max(D * 0.16, 44), 58);
  const L = cx - bw / 2, R = cx + bw / 2, T = cy - th / 2, B = cy + th / 2;
  const cov = 9;
  const matTop = T + cov, matBot = B - cov;
  const dotTop = matTop + 5, dotBot = matBot - 5;
  const gap = matBot - matTop;
  const cog = gap * 0.62;
  const botInset = 3;

  // end zones: dots only within ~22% of each end (like the reference)
  const zone = bw * 0.22;
  const endL0 = L + 14, endL1 = L + zone;
  const endR1 = R - 14, endR0 = R - zone;
  const ndE = 5;
  const dotsL = Array.from({ length: ndE }).map((_, i) => endL0 + ((endL1 - endL0) / (ndE - 1)) * i);
  const dotsR = Array.from({ length: ndE }).map((_, i) => endR0 + ((endR1 - endR0) / (ndE - 1)) * i);

  // draped tendon: high near ends (at anchor height ~mid), dips low at midspan
  const anchorY = cy;                    // tendon enters at mid-depth at the anchor
  const lowY = matBot - 4;               // low point near bottom at midspan
  const tendon = draped
    ? `M ${L + cov + 18} ${anchorY} Q ${cx} ${lowY + (lowY - anchorY) * 0.25} ${R - cov - 18} ${anchorY}`
    : `M ${L + cov + 18} ${anchorY} L ${R - cov - 18} ${anchorY}`;

  // anchorage coil (zigzag spring) at each end
  const coil = (x0, dir) => {
    const n0 = 4, len = 14, amp = 4;
    let d = `M ${x0} ${anchorY}`;
    for (let i = 0; i < n0; i++) {
      const x1 = x0 + dir * (len / n0) * (i + 0.5);
      const x2 = x0 + dir * (len / n0) * (i + 1);
      d += ` L ${x1} ${anchorY - amp} L ${x2} ${anchorY + amp}`;
    }
    d += ` L ${x0 + dir * len} ${anchorY}`;
    return d;
  };

  const tris = [];
  Array.from({ length: 7 }).forEach((_, i, a) => {
    const x = L + 30 + ((bw - 60) / (a.length - 1)) * i, y = cy + 6, s = 2.4;
    tris.push(<path key={i} d={`M ${x} ${y - s} L ${x - s} ${y + s} L ${x + s} ${y + s} Z`} fill="var(--line-strong)" opacity="0.4" />);
  });

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <marker id="dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 2 L6 5 L0 8" fill="none" stroke="var(--text-muted)" strokeWidth="1" />
        </marker>
      </defs>
      <text x={cx} y={24} fill="var(--brand-gold-bright)" fontSize="11" textAnchor="middle" fontFamily="var(--brand-font-sans)">SECTION — {draped ? 'draped tendon' : 'constant tendon'}</text>

      <rect x={L} y={T} width={bw} height={th} fill="var(--card-input)" stroke="var(--text-muted)" strokeWidth="1.5" />
      {tris}

      {/* end reo: one U-bar each end (top leg + rounded return + bottom leg), cut at end-zone dots */}
      {(() => {
        const rr = 6;                       // U corner radius
        const endCov = cov - 3;             // slightly reduced cover at the ends
        // left U: from inner end (endL1) along top, round down at the left, back along bottom
        const leftU = `M ${endL1} ${matTop} L ${L + endCov + rr} ${matTop} A ${rr} ${rr} 0 0 0 ${L + endCov} ${matTop + rr} L ${L + endCov} ${matBot - rr} A ${rr} ${rr} 0 0 0 ${L + endCov + rr} ${matBot} L ${endL1} ${matBot}`;
        const rightU = `M ${endR0} ${matTop} L ${R - endCov - rr} ${matTop} A ${rr} ${rr} 0 0 1 ${R - endCov} ${matTop + rr} L ${R - endCov} ${matBot - rr} A ${rr} ${rr} 0 0 1 ${R - endCov - rr} ${matBot} L ${endR0} ${matBot}`;
        return (
          <>
            <path d={leftU} fill="none" stroke="var(--brand-gold-deep)" strokeWidth="0.9" strokeLinejoin="round" />
            <path d={rightU} fill="none" stroke="var(--brand-gold-deep)" strokeWidth="0.9" strokeLinejoin="round" />
          </>
        );
      })()}
      {/* dots only at the end zones */}
      {dotsL.map((x, i) => <circle key={`tl${i}`} cx={x} cy={dotTop} r="2.1" fill="var(--brand-gold)" />)}
      {dotsR.map((x, i) => <circle key={`tr${i}`} cx={x} cy={dotTop} r="2.1" fill="var(--brand-gold)" />)}
      {dotsL.map((x, i) => <circle key={`bl${i}`} cx={x} cy={dotBot} r="2.1" fill="var(--brand-gold)" />)}
      {dotsR.map((x, i) => <circle key={`br${i}`} cx={x} cy={dotBot} r="2.1" fill="var(--brand-gold)" />)}

      {/* draped tendon */}
      <path d={tendon} fill="none" stroke="var(--brand-gold)" strokeWidth="1.8" />
      {/* anchorage coils at each end */}
      <path d={coil(L + cov + 4, 1)} fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1.1" />
      <path d={coil(R - cov - 4, -1)} fill="none" stroke="var(--brand-gold-bright)" strokeWidth="1.1" />
      {/* anchor end plates */}
      <rect x={L + cov + 1} y={anchorY - 6} width="2.5" height="12" fill="var(--brand-gold-bright)" />
      <rect x={R - cov - 3.5} y={anchorY - 6} width="2.5" height="12" fill="var(--brand-gold-bright)" />

      {/* dimensions */}
      <line x1={L} y1={B + 14} x2={R} y2={B + 14} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={cx} y={B + 26} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">span (rate basis: w = {fmt(w, 0)} mm strip)</text>
      <line x1={L - 14} y1={T} x2={L - 14} y2={B} stroke="var(--text-muted)" strokeWidth="0.8" markerStart="url(#dim)" markerEnd="url(#dim)" />
      <text x={L - 26} y={cy} fill="var(--text-faint)" fontSize="8.5" textAnchor="middle" fontFamily="var(--brand-font-mono)" transform={`rotate(-90 ${L - 26} ${cy})`}>D = {fmt(D, 0)}</text>

      <text x={cx} y={VBH - 8} fill="var(--text-faint)" fontSize="9" textAnchor="middle" fontFamily="var(--brand-font-mono)">{I.nTendon} tendons × {I.nStrand} strands ({I.size} mm)  ·  anchored both ends  ·  thickness enlarged</text>
    </svg>
  );
}

function SlabPtReo() {
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
            <span className="current">Slab PT Rate</span>
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
            <tr><td className="ppb-label">Calculation</td><td>Slab Post-Tension Rate</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>Estimating rate (indicative)</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Slab Post-Tension Rate</h1>
          <div className="subtitle">Estimates &amp; Quantities · PT strand mass (kg/m², kg/m³) and average applied prestress for a PT slab or beam</div>
        </div>

        <div className="body">
          <aside className="inputs-col no-print">
            <div className="col-heading"><h2 className="label">Inputs</h2><p className="hint">Units: mm, MPa</p></div>

            <div className="meta-block">
              <h3 className="meta-title">Project</h3>
              <div className="input-field"><label>Project name</label><input type="text" value={I.project} onChange={set('project')} placeholder="e.g. 123 Smith St Tower" /></div>
              <div className="input-row">
                <div className="input-field"><label>Job No.</label><input type="text" value={I.jobno} onChange={set('jobno')} /></div>
                <div className="input-field"><label>By</label><input type="text" value={I.byname} onChange={set('byname')} /></div>
              </div>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Element</h3>
              <div className="input-row">
                <div className="input-field"><label>Depth D (mm)</label><input type="number" value={I.D} onChange={set('D')} step="25" /></div>
                <div className="input-field"><label>Width w (mm)</label><input type="number" value={I.w} onChange={set('w')} step="100" /></div>
              </div>
              <p className="hint">Width is the strip the tendons serve (rate basis).</p>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Post-tensioning</h3>
              <div className="input-row">
                <div className="input-field"><label>No. of tendons</label><input type="number" value={I.nTendon} onChange={set('nTendon')} /></div>
                <div className="input-field"><label>Strands / tendon</label><input type="number" value={I.nStrand} onChange={set('nStrand')} /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>Strand size (mm)</label><select value={I.size} onChange={set('size')}>{STRAND_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="input-field"><label>Profile</label><select value={I.profile} onChange={set('profile')}><option value="Draped">Draped (30% loss)</option><option value="Constant">Constant (20% loss)</option></select></div>
              </div>
              <p className="hint">Strand: {r.s.a} mm², MBL {r.s.mbl} kN, MTS {r.s.mts} MPa.</p>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byArea, 2)}</span><span className="bulk-sum-l">PT rate by area (kg/m²)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.byVol, 1)}</span><span className="bulk-sum-l">PT rate by volume (kg/m³)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(r.avgStress, 2)}</span><span className="bulk-sum-l">Avg applied stress (MPa)</span></div>
            </div>

            <div className="bulk-theory" style={{ marginTop: 0, marginBottom: 16 }}>
              <PtSketch I={I} />
            </div>

            <div className="col-heading"><h2 className="label">Breakdown</h2><p className="hint">Strand density 7,850 kg/m³.</p></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Total strands</td><td className="value mono">{fmt(r.totStrands, 0)}</td><td className="ref">{I.nTendon} tendons × {I.nStrand} strands</td></tr>
                <tr><td className="label">Strand mass / m</td><td className="value mono">{fmt(r.massPerM, 2)} kg/m</td><td className="ref">strands × {r.s.a} mm² × 7,850</td></tr>
                <tr><td className="label">By area</td><td className="value mono">{fmt(r.byArea, 2)} kg/m²</td><td className="ref">per {fmt(n(I.w), 0)} mm width strip</td></tr>
                <tr><td className="label">By volume</td><td className="value mono">{fmt(r.byVol, 1)} kg/m³</td><td className="ref">/ ({fmt(n(I.D), 0)}×{fmt(n(I.w), 0)} section)</td></tr>
              </tbody>
            </table>

            <div className="col-heading" style={{ marginTop: 16 }}><h2 className="label">Average applied prestress</h2><p className="hint">Indicative — assumes {r.loss}% total losses ({I.profile.toLowerCase()}).</p></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Jacking force / strand</td><td className="value mono">{fmt(r.jack, 1)} kN</td><td className="ref">0.85 × MBL ({r.s.mbl} kN)</td></tr>
                <tr><td className="label">After losses</td><td className="value mono">{fmt(r.lessLoss, 1)} kN</td><td className="ref">− {r.loss}% losses</td></tr>
                <tr className="summary-row"><td className="label"><strong>Avg applied stress</strong></td><td className="value mono"><strong>{fmt(r.avgStress, 2)} MPa</strong></td><td className="ref">over {fmt(n(I.D), 0)}×{fmt(n(I.w), 0)} section</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>PT mass</strong> = (tendons × strands) × strand area × 7,850 kg/m³ per metre run. <strong>By area</strong> = mass / (w/1000); <strong>by volume</strong> = mass / (D·w section). <strong>Average applied stress</strong> = strand jacking force (0.85 × min breaking load) less losses (30% draped / 20% constant), × total strands / (D × w).</p>
                  <p className="hint">Strand properties (area, MBL, MTS) are standard values by strand size. Indicative estimating tool — not a PT design. Tendon force, profile and losses must be confirmed by the PT designer. Verify independently.</p>
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

export default SlabPtReo;
