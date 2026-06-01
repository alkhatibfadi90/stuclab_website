'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// REBAR DEVELOPMENT LENGTH & LAP SPLICE — AS 3600:2018 Cl 13.1/13.2
// Basic Lsy.tb (13.1.2.2), tension Lsy.t, hook/cog (0.5 Lsy.t),
// plain bar (×1.5), lap Lsy.t.lap (13.2.2). Verified against the Standard.
// ============================================================

const n = (v) => parseFloat(v) || 0;

function compute(I) {
  const db = n(I.db), fsy = n(I.fsy), fc = Math.min(n(I.fc), 65), cd = n(I.cd);
  const k1 = I.topBar ? 1.3 : 1.0;
  const k2 = (132 - db) / 100;
  let k3 = 1.0 - 0.15 * (cd - db) / db;
  k3 = Math.max(0.7, Math.min(1.0, k3));

  let Lsytb = k2 > 0 && fc > 0 ? (0.5 * k1 * k3 * fsy * db) / (k2 * Math.sqrt(fc)) : 0;
  const floor = 0.058 * fsy * k1 * db;
  const floored = floor > Lsytb;
  Lsytb = Math.max(Lsytb, floor);

  let Lsyt = Lsytb;
  if (I.epoxy) Lsyt *= 1.5;
  if (I.lightweight) Lsyt *= 1.3;
  if (I.plain) Lsyt = Math.max(1.5 * Lsyt, 300);

  const Lcog = 0.5 * Lsyt;
  const k7 = I.k7low ? 1.0 : 1.25;
  const Llap = Math.max(k7 * Lsyt, 0.058 * fsy * k1 * db);

  return { k1, k2, k3, Lsytb, floor, floored, Lsyt, Lcog, Llap, k7 };
}

const fmt = (v, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
const round5 = (v) => Math.ceil(v / 5) * 5; // round up to next 5mm for practical detailing

const BARS = [10, 12, 16, 20, 24, 28, 32, 36, 40];

const DEFAULTS = {
  project: '', jobno: '', byname: '',
  db: '20', fsy: '500', fc: '40', cd: '40',
  topBar: false, epoxy: false, lightweight: false, plain: false, k7low: false,
};

function DevelopmentLength() {
  const [I, setI] = useState(DEFAULTS);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);
  const r = useMemo(() => compute(I), [I]);
  const set = (k) => (e) => setI({ ...I, [k]: e.target.value });
  const tog = (k) => (e) => setI({ ...I, [k]: e.target.checked });

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Concrete</span><span className="sep">›</span>
            <span className="current">Development Length &amp; Laps</span>
          </div>
        </div>
        <button className="btn-pdf" onClick={() => window.print()} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></svg>
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
          <table><tbody>
            <tr><td className="ppb-label">Project</td><td>{I.project || '—'}</td><td className="ppb-label">Job No.</td><td style={{ width: '18%' }}>{I.jobno || '—'}</td></tr>
            <tr><td className="ppb-label">Calculation</td><td>Rebar Development Length &amp; Lap Splice</td><td className="ppb-label">By</td><td>{I.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>AS 3600:2018 Cl 13.1.2, 13.2.2</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Development Length &amp; Laps</h1>
          <div className="subtitle">AS 3600:2018 Cl 13.1.2 / 13.2.2 · Deformed bar in tension — basic length, hook/cog, lap splice</div>
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
              <h3 className="meta-title">Bar &amp; concrete</h3>
              <div className="input-row">
                <div className="input-field"><label>Bar Ø (mm)</label><select value={I.db} onChange={set('db')}>{BARS.map((b) => <option key={b} value={b}>N{b}</option>)}</select></div>
                <div className="input-field"><label>fsy (MPa)</label><input type="number" value={I.fsy} onChange={set('fsy')} step="10" /></div>
              </div>
              <div className="input-row">
                <div className="input-field"><label>f&apos;c (MPa)</label><input type="number" value={I.fc} onChange={set('fc')} step="5" /></div>
                <div className="input-field"><label>cd (mm)</label><input type="number" value={I.cd} onChange={set('cd')} step="5" /></div>
              </div>
              <p className="hint">cd per Fig 13.1.2.2 — typically min(a/2, c1, c) for the bar layout.</p>
            </div>

            <div className="meta-block">
              <h3 className="meta-title">Modifiers</h3>
              <label className="takedown-check"><input type="checkbox" checked={I.topBar} onChange={tog('topBar')} /> Top bar (&gt;300 mm cast below) — k1 = 1.3</label>
              <label className="takedown-check"><input type="checkbox" checked={I.epoxy} onChange={tog('epoxy')} /> Epoxy-coated (×1.5)</label>
              <label className="takedown-check"><input type="checkbox" checked={I.lightweight} onChange={tog('lightweight')} /> Lightweight concrete (×1.3)</label>
              <label className="takedown-check"><input type="checkbox" checked={I.plain} onChange={tog('plain')} /> Plain (round) bar (×1.5, min 300)</label>
              <label className="takedown-check"><input type="checkbox" checked={I.k7low} onChange={tog('k7low')} /> Lap: As ≥ 2× req. &amp; ≤ half spliced (k7 = 1.0)</label>
            </div>
          </aside>

          <main className="results-col">
            <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)', margin: '0 0 16px' }}>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(round5(r.Lsyt))}</span><span className="bulk-sum-l">Lsy.t — tension dev. length (mm)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(round5(r.Llap))}</span><span className="bulk-sum-l">Lap splice Lsy.t.lap (mm)</span></div>
              <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(round5(r.Lcog))}</span><span className="bulk-sum-l">Hook/cog end (0.5 Lsy.t) (mm)</span></div>
            </div>

            <div className="col-heading"><h2 className="label">Calculation</h2><p className="hint">Values rounded up to 5 mm for detailing. AS 3600 Cl 13.1.2.2.</p></div>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">k1 (bar position)</td><td className="value mono">{fmt(r.k1, 1)}</td><td className="ref">{I.topBar ? 'Top bar' : 'Other'}</td></tr>
                <tr><td className="label">k2 = (132 − db)/100</td><td className="value mono">{fmt(r.k2, 3)}</td><td className="ref">db = {I.db} mm</td></tr>
                <tr><td className="label">k3 = 1 − 0.15(cd − db)/db</td><td className="value mono">{fmt(r.k3, 3)}</td><td className="ref">0.7 ≤ k3 ≤ 1.0</td></tr>
                <tr><td className="label">Lsy.tb (basic)</td><td className="value mono">{fmt(r.Lsytb, 0)} mm</td><td className="ref">{r.floored ? `lower limit 0.058·fsy·k1·db governs (${fmt(r.floor, 0)})` : 'main equation governs'}</td></tr>
                <tr><td className="label">Lsy.t (tension)</td><td className="value mono">{fmt(r.Lsyt, 0)} mm</td><td className="ref">{[I.epoxy ? '×1.5 epoxy' : null, I.lightweight ? '×1.3 LWC' : null, I.plain ? '×1.5 plain' : null].filter(Boolean).join(', ') || 'no modifiers'}</td></tr>
                <tr><td className="label">Hook / cog end</td><td className="value mono">{fmt(r.Lcog, 0)} mm</td><td className="ref">0.5 × Lsy.t (Cl 13.1.2.6)</td></tr>
                <tr><td className="label">Lap splice (tension)</td><td className="value mono">{fmt(r.Llap, 0)} mm</td><td className="ref">k7 = {fmt(r.k7, 2)} (Cl 13.2.2)</td></tr>
              </tbody>
            </table>

            <section className="no-print" style={{ marginTop: 16 }}>
              <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
              {theoryOpen ? (
                <div className="bulk-theory">
                  <p><strong>Basic (Cl 13.1.2.2):</strong> Lsy.tb = 0.5·k1·k3·fsy·db / (k2·√f&apos;c) ≥ 0.058·fsy·k1·db. k1 = 1.3 for a horizontal bar with &gt;300 mm of concrete cast below, else 1.0. k2 = (132 − db)/100. k3 = 1 − 0.15(cd − db)/db within 0.7–1.0. f&apos;c capped at 65 MPa.</p>
                  <p><strong>Modifiers:</strong> ×1.5 epoxy-coated, ×1.3 lightweight concrete. <strong>Plain bars</strong> (Cl 13.1.3): 1.5 × deformed value, min 300 mm. <strong>Hook/cog</strong> (Cl 13.1.2.6): end development = 0.5·Lsy.t. <strong>Lap</strong> (Cl 13.2.2): Lsy.t.lap = k7·Lsy.t ≥ 0.058·fsy·k1·db, k7 = 1.25 (or 1.0 if As provided ≥ 2× required and ≤ half the bars are spliced).</p>
                  <p className="hint">This is the basic method; the refined method (Cl 13.1.2.3, k4·k5) can give shorter lengths where transverse reinforcement / confining pressure is accounted for. cd must be determined from the actual bar layout. Indicative — verify independently.</p>
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

export default DevelopmentLength;
