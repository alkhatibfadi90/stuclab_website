'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

// ============================================================
// LOAD COMBINATION GENERATOR — AS/NZS 1170.0:2002
// Strength (Cl 4.2.2), Stability (Cl 4.2.1), Serviceability
// (Cl 4.3 / Appendix C). ψ factors from Table 4.1.
// Pure data generation — no analysis. Verified against the Standard.
// ============================================================

// Table 4.1 — short-term ψs, long-term ψl, combination ψc, earthquake ψE
const OCCUPANCY = {
  'Residential / domestic': { ps: 0.7, pl: 0.4, pc: 0.4, pE: 0.3 },
  Offices: { ps: 0.7, pl: 0.4, pc: 0.4, pE: 0.3 },
  Parking: { ps: 0.7, pl: 0.4, pc: 0.4, pE: 0.3 },
  Retail: { ps: 0.7, pl: 0.4, pc: 0.4, pE: 0.3 },
  Storage: { ps: 1.0, pl: 0.6, pc: 0.6, pE: 0.6 },
  Other: { ps: 1.0, pl: 0.6, pc: 0.6, pE: 0.6 },
  'Roof (floor-type activities)': { ps: 0.7, pl: 0.4, pc: 0.4, pE: 0.3 },
  'Roof (other)': { ps: 0.7, pl: 0.0, pc: 0.0, pE: 0.0 },
};

const f = (x) => {
  // round to 3 dp then trim, so 1.5*0.4 shows "0.6" not "0.6000000001"
  const r = Math.round(x * 1000) / 1000;
  if (r === 1) return '1.0';
  if (r === 0.9) return '0.9';
  return String(r);
};

// Build a combination string from terms, dropping zero/absent ones.
function combo(terms) {
  const parts = terms
    .filter((t) => t.on && t.coef !== 0)
    .map((t) => {
      const c = t.coef;
      const cstr = c === 1 ? '' : `${f(c)} `;
      return `${cstr}${t.sym}`;
    });
  return parts.join(' + ');
}

function generate(actions, psi) {
  const { G, Q, Wu, Eu, Su } = actions; // booleans
  const { pc, pl, pE, ps } = psi;
  const ULS = [];
  const STB = [];
  const SLS = [];

  // ---- Strength Cl 4.2.2 ----
  // (a) 1.35G
  if (G) ULS.push({ id: '4.2.2(a)', expr: '1.35 G', note: 'Permanent only' });
  // (b) 1.2G + 1.5Q
  if (G && Q) ULS.push({ id: '4.2.2(b)', expr: combo([{ on: G, coef: 1.2, sym: 'G' }, { on: Q, coef: 1.5, sym: 'Q' }]), note: 'Permanent + imposed' });
  // (c) 1.2G + 1.5ψl Q
  if (G && Q) ULS.push({ id: '4.2.2(c)', expr: `1.2 G + ${f(1.5 * pl)} Q`, note: `Permanent + long-term imposed (ψl=${f(pl)})` });
  // (d) 1.2G + Wu + ψc Q
  if (G && Wu) ULS.push({ id: '4.2.2(d)', expr: combo([{ on: G, coef: 1.2, sym: 'G' }, { on: Wu, coef: 1, sym: 'Wu' }, { on: Q, coef: pc, sym: 'Q' }]), note: `Permanent + wind + imposed (ψc=${f(pc)})` });
  // (e) 0.9G + Wu
  if (G && Wu) ULS.push({ id: '4.2.2(e)', expr: '0.9 G + Wu', note: 'Permanent + wind reversal' });
  // (f) G + Eu + ψE Q
  if (G && Eu) ULS.push({ id: '4.2.2(f)', expr: combo([{ on: G, coef: 1, sym: 'G' }, { on: Eu, coef: 1, sym: 'Eu' }, { on: Q, coef: pE, sym: 'Q' }]), note: `Permanent + earthquake + imposed (ψE=${f(pE)})` });
  // (g) 1.2G + Su + ψc Q
  if (G && Su) ULS.push({ id: '4.2.2(g)', expr: combo([{ on: G, coef: 1.2, sym: 'G' }, { on: Su, coef: 1, sym: 'Su' }, { on: Q, coef: pc, sym: 'Q' }]), note: `Permanent + earth/liquid pressure + imposed (ψc=${f(pc)})` });

  // ---- Stability Cl 4.2.1 ----
  if (G) STB.push({ id: '4.2.1(a)', expr: '0.9 G', note: 'Net stabilising' });
  if (G) STB.push({ id: '4.2.1(b)(i)', expr: '1.35 G', note: 'Net destabilising' });
  if (G && Q) STB.push({ id: '4.2.1(b)(ii)', expr: combo([{ on: G, coef: 1.2, sym: 'G' }, { on: Q, coef: 1.5, sym: 'Q' }]), note: 'Destabilising + imposed' });
  if (G && Wu) STB.push({ id: '4.2.1(b)(iv)', expr: combo([{ on: G, coef: 1.2, sym: 'G' }, { on: Wu, coef: 1, sym: 'Wu' }, { on: Q, coef: pc, sym: 'Q' }]), note: `Destabilising + wind (ψc=${f(pc)})` });
  if (G && Eu) STB.push({ id: '4.2.1(b)(v)', expr: combo([{ on: G, coef: 1, sym: 'G' }, { on: Eu, coef: 1, sym: 'Eu' }, { on: Q, coef: pE, sym: 'Q' }]), note: `Destabilising + earthquake (ψE=${f(pE)})` });

  // ---- Serviceability Cl 4.3 / App C (common SLS combos) ----
  if (G) SLS.push({ id: 'SLS-1', expr: 'G', note: 'Permanent (long-term)' });
  if (G && Q) SLS.push({ id: 'SLS-2', expr: `G + ${f(ps)} Q`, note: `Short-term imposed (ψs=${f(ps)})` });
  if (G && Q) SLS.push({ id: 'SLS-3', expr: `G + ${f(pl)} Q`, note: `Long-term imposed (ψl=${f(pl)})` });
  if (G && Wu && Q) SLS.push({ id: 'SLS-4', expr: `G + Ws + ${f(pl)} Q`, note: `Wind + long-term imposed (ψl=${f(pl)})` });
  else if (G && Wu) SLS.push({ id: 'SLS-4', expr: 'G + Ws', note: 'Serviceability wind' });

  return { ULS, STB, SLS };
}

function LoadCombinations() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '' });
  const [actions, setActions] = useState({ G: true, Q: true, Wu: true, Eu: false, Su: false });
  const [occ, setOcc] = useState('Offices');
  const [custom, setCustom] = useState(false);
  const [psiC, setPsiC] = useState({ ps: '0.7', pl: '0.4', pc: '0.4', pE: '0.3' });
  const [copied, setCopied] = useState('');

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const psi = useMemo(() => {
    if (custom) return { ps: parseFloat(psiC.ps) || 0, pl: parseFloat(psiC.pl) || 0, pc: parseFloat(psiC.pc) || 0, pE: parseFloat(psiC.pE) || 0 };
    return OCCUPANCY[occ];
  }, [custom, psiC, occ]);

  const result = useMemo(() => generate(actions, psi), [actions, psi]);

  const toggle = (k) => setActions((a) => ({ ...a, [k]: !a[k] }));

  const allText = useMemo(() => {
    const lines = [];
    lines.push('STRENGTH (ULS) — AS/NZS 1170.0 Cl 4.2.2');
    result.ULS.forEach((c, i) => lines.push(`${i + 1}. ${c.expr}`));
    lines.push('');
    lines.push('STABILITY (ULS) — Cl 4.2.1');
    result.STB.forEach((c, i) => lines.push(`${i + 1}. ${c.expr}`));
    lines.push('');
    lines.push('SERVICEABILITY (SLS) — Cl 4.3');
    result.SLS.forEach((c, i) => lines.push(`${i + 1}. ${c.expr}`));
    return lines.join('\n');
  }, [result]);

  const copyAll = async () => {
    try { await navigator.clipboard.writeText(allText); setCopied('all'); setTimeout(() => setCopied(''), 1500); } catch { /* noop */ }
  };
  const downloadCSV = () => {
    const rows = [['Set', 'No.', 'Combination', 'Clause', 'Note']];
    result.ULS.forEach((c, i) => rows.push(['Strength', i + 1, c.expr, c.id, c.note]));
    result.STB.forEach((c, i) => rows.push(['Stability', i + 1, c.expr, c.id, c.note]));
    result.SLS.forEach((c, i) => rows.push(['Serviceability', i + 1, c.expr, c.id, c.note]));
    const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'load-combinations.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const ACTION_DEFS = [
    { k: 'G', label: 'G — Permanent (dead)' },
    { k: 'Q', label: 'Q — Imposed (live)' },
    { k: 'Wu', label: 'Wu — Wind' },
    { k: 'Eu', label: 'Eu — Earthquake' },
    { k: 'Su', label: 'Su — Earth / liquid pressure' },
  ];

  const Section = ({ title, sub, items }) => (
    <section style={{ marginTop: 16 }}>
      <div className="col-heading"><h2 className="label">{title}</h2><p className="hint">{sub}</p></div>
      <table className="calc-table">
        <thead><tr><th style={{ width: 50 }}>No.</th><th>Combination</th><th>Clause</th><th>Description</th></tr></thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={4} className="hint">No combinations — enable the relevant actions.</td></tr>
          ) : items.map((c, i) => (
            <tr key={c.id}>
              <td className="mono">{i + 1}</td>
              <td className="mono" style={{ fontWeight: 600, color: 'var(--text)' }}>{c.expr}</td>
              <td className="hint mono">{c.id}</td>
              <td className="hint">{c.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Automation</span><span className="sep">›</span>
            <span className="current">Load Combination Generator</span>
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
          <div className="lh-row">
            <div className="lh-brand">Struc<span className="lab">Lab</span></div>
            <div className="lh-meta">Engineering Calculation<br />struclab.com.au</div>
          </div>
        </div>

        <div className="print-project-block">
          <table>
            <tbody>
              <tr><td className="ppb-label">Project</td><td>{meta.project || '—'}</td><td className="ppb-label">Job No.</td><td style={{ width: '18%' }}>{meta.jobno || '—'}</td></tr>
              <tr><td className="ppb-label">Calculation</td><td>Load Combinations</td><td className="ppb-label">By</td><td>{meta.byname || '—'}</td></tr>
              <tr><td className="ppb-label">Reference</td><td>AS/NZS 1170.0:2002 Section 4</td><td className="ppb-label">Date</td><td>{today}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Load Combination Generator</h1>
          <div className="subtitle">AS/NZS 1170.0:2002 · Strength, stability &amp; serviceability combinations ready to paste into analysis software</div>
        </div>

        <div className="bulk-meta no-print">
          <div className="input-field"><label>Project name</label><input type="text" value={meta.project} onChange={(e) => setMeta({ ...meta, project: e.target.value })} placeholder="e.g. 123 Smith St Tower" /></div>
          <div className="input-field"><label>Job No.</label><input type="text" value={meta.jobno} onChange={(e) => setMeta({ ...meta, jobno: e.target.value })} placeholder="e.g. 24-118" /></div>
          <div className="input-field"><label>By</label><input type="text" value={meta.byname} onChange={(e) => setMeta({ ...meta, byname: e.target.value })} placeholder="Initials" /></div>
        </div>

        {/* ---- Action selection + occupancy ---- */}
        <div className="seismic-params no-print" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          <div>
            <div className="rc-label" style={{ marginBottom: 8 }}>Actions present</div>
            <div className="combo-actions">
              {ACTION_DEFS.map((a) => (
                <label key={a.k} className={`combo-action ${actions[a.k] ? 'on' : ''}`}>
                  <input type="checkbox" checked={actions[a.k]} onChange={() => toggle(a.k)} />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="input-field">
              <label>Imposed action ψ factors</label>
              <select value={custom ? 'custom' : occ} onChange={(e) => { if (e.target.value === 'custom') setCustom(true); else { setCustom(false); setOcc(e.target.value); } }}>
                {Object.keys(OCCUPANCY).map((o) => <option key={o} value={o}>{o}</option>)}
                <option value="custom">Custom…</option>
              </select>
            </div>
            {custom ? (
              <div className="combo-psi-grid">
                <div className="input-field"><label>ψs</label><input type="number" step="0.05" value={psiC.ps} onChange={(e) => setPsiC({ ...psiC, ps: e.target.value })} /></div>
                <div className="input-field"><label>ψl</label><input type="number" step="0.05" value={psiC.pl} onChange={(e) => setPsiC({ ...psiC, pl: e.target.value })} /></div>
                <div className="input-field"><label>ψc</label><input type="number" step="0.05" value={psiC.pc} onChange={(e) => setPsiC({ ...psiC, pc: e.target.value })} /></div>
                <div className="input-field"><label>ψE</label><input type="number" step="0.05" value={psiC.pE} onChange={(e) => setPsiC({ ...psiC, pE: e.target.value })} /></div>
              </div>
            ) : (
              <p className="hint" style={{ marginTop: 8 }}>ψs={f(psi.ps)} · ψl={f(psi.pl)} · ψc={f(psi.pc)} · ψE={f(psi.pE)} (Table 4.1)</p>
            )}
          </div>
        </div>

        <div className="bulk-toolbar no-print">
          <button className="btn-calc" type="button" onClick={copyAll}>{copied === 'all' ? 'Copied ✓' : 'Copy all'}</button>
          <button className="bulk-btn" type="button" onClick={downloadCSV}>Download CSV</button>
        </div>

        <Section title="Strength (ULS)" sub="AS/NZS 1170.0 Cl 4.2.2 — basic combinations for checking strength." items={result.ULS} />
        <Section title="Stability (ULS)" sub="Cl 4.2.1 — stabilising and destabilising combinations." items={result.STB} />
        <Section title="Serviceability (SLS)" sub="Cl 4.3 / Appendix C — common serviceability combinations. Confirm the appropriate SLS condition for your check." items={result.SLS} />

        <p className="hint" style={{ marginTop: 14 }}>
          Symbols: G permanent, Q imposed, Wu ultimate wind, Ws serviceability wind, Eu earthquake, Su earth/liquid pressure.
          Combinations follow AS/NZS 1170.0 Section 4 with ψ factors from Table 4.1. Indicative — confirm the governing actions and any project-specific combinations for your design. Verify independently.
        </p>

        <div className="print-footer">StrucLab · LabKit · struclab.com.au · Generated {today}</div>
        <div className="workspace-footer">
          <span>StrucLab · LabKit · struclab.com.au</span>
          <span className="mono">Generated {today}</span>
        </div>
      </div>
    </div>
  );
}

export default LoadCombinations;
