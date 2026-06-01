'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// CONCRETE COVER — AS 3600:2018 Cl 4.10.3
// Required cover for corrosion protection by exposure class and
// f'c. Tables 4.10.3.2 (standard) & 4.10.3.3 (rigid formwork),
// plus cast-against-ground adjustment (Cl 4.10.3.5).
// '—' = strength not permitted; (bracket) = concession value.
// Encoded from the Standard.
// ============================================================

const n = (v) => parseFloat(v) || 0;

// fc grades and their column index
const GRADES = [20, 25, 32, 40, 50];

// Table 4.10.3.2 — standard formwork & compaction. null = not permitted.
// Values are required cover (mm); concession brackets noted separately.
const T_STD = {
  A1: [20, 20, 20, 20, 20],
  A2: [50, 30, 25, 20, 20],
  B1: [null, 60, 40, 30, 25],
  B2: [null, null, 65, 45, 35],
  C1: [null, null, null, 70, 50],
  C2: [null, null, null, null, 65],
};
// concession (bracketed) cells per Standard
const STD_CONCESSION = { 'A2-20': true, 'B1-25': true, 'B2-32': true, 'C1-40': true };

// Table 4.10.3.3 — rigid formwork, intense/repetitive compaction
const T_RIGID = {
  A1: [20, 20, 20, 20, 20],
  A2: [45, 30, 20, 20, 20],
  B1: [null, 45, 30, 25, 20],
  B2: [null, null, 50, 35, 25],
  C1: [null, null, null, 60, 45],
  C2: [null, null, null, null, 60],
};
const RIGID_CONCESSION = { 'A2-20': true, 'B1-25': true, 'B2-32': true, 'C1-40': true };

const CLASSES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const CLASS_DESC = {
  A1: 'Mild — interior, fully enclosed (residential/non-aggressive)',
  A2: 'Mild — interior, above ground, sheltered',
  B1: 'Moderate — interior exposed / exterior inland, non-aggressive',
  B2: 'Severe — exterior, coastal (≥1 km from sea), industrial',
  C1: 'Very severe — coastal (100 m–1 km) / tidal–splash spray zone',
  C2: 'Extreme — tidal/splash zone, in seawater',
};

function CoverTool() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '' });
  const [cls, setCls] = useState('B1');
  const [fc, setFc] = useState('40');
  const [method, setMethod] = useState('std'); // std | rigid
  const [ground, setGround] = useState('none'); // none | membrane | direct
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(() => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }), []);

  const result = useMemo(() => {
    const table = method === 'rigid' ? T_RIGID : T_STD;
    const conc = method === 'rigid' ? RIGID_CONCESSION : STD_CONCESSION;
    const gi = GRADES.indexOf(n(fc));
    if (gi === -1) return { ok: false, msg: 'Select a standard grade (20, 25, 32, 40, 50).' };
    const base = table[cls][gi];
    if (base == null) return { ok: false, msg: `f'c = ${fc} MPa is not permitted for exposure class ${cls}. Increase the grade.` };
    const isConcession = !!conc[`${cls}-${fc}`];
    let cover = base;
    let groundNote = '';
    if (ground === 'membrane') { cover = base + 10; groundNote = '+10 mm (cast against ground, damp-proof membrane)'; }
    else if (ground === 'direct') { cover = base + 20; groundNote = '+20 mm (cast against ground, no membrane)'; }
    return { ok: true, base, cover, isConcession, groundNote };
  }, [cls, fc, method, ground]);

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span><span className="sep">›</span>
            <span>Concrete</span><span className="sep">›</span>
            <span className="current">Cover &amp; Exposure</span>
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
            <tr><td className="ppb-label">Project</td><td>{meta.project || '—'}</td><td className="ppb-label">Job No.</td><td style={{ width: '18%' }}>{meta.jobno || '—'}</td></tr>
            <tr><td className="ppb-label">Calculation</td><td>Concrete Cover for Corrosion Protection</td><td className="ppb-label">By</td><td>{meta.byname || '—'}</td></tr>
            <tr><td className="ppb-label">Reference</td><td>AS 3600:2018 Cl 4.10.3</td><td className="ppb-label">Date</td><td>{today}</td></tr>
          </tbody></table>
        </div>

        <div className="tool-header">
          <h1 className="title">Concrete Cover &amp; Exposure</h1>
          <div className="subtitle">AS 3600:2018 Cl 4.10.3 · Required cover for corrosion protection by exposure classification and grade</div>
        </div>

        <div className="bulk-meta no-print">
          <div className="input-field"><label>Project name</label><input type="text" value={meta.project} onChange={(e) => setMeta({ ...meta, project: e.target.value })} placeholder="e.g. 123 Smith St Tower" /></div>
          <div className="input-field"><label>Job No.</label><input type="text" value={meta.jobno} onChange={(e) => setMeta({ ...meta, jobno: e.target.value })} placeholder="e.g. 24-118" /></div>
          <div className="input-field"><label>By</label><input type="text" value={meta.byname} onChange={(e) => setMeta({ ...meta, byname: e.target.value })} placeholder="Initials" /></div>
        </div>

        <div className="seismic-params no-print" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div className="input-field">
            <label>Exposure classification</label>
            <select value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label>f&apos;c (MPa)</label>
            <select value={fc} onChange={(e) => setFc(e.target.value)}>
              {GRADES.map((g) => <option key={g} value={String(g)}>{g}{g === 50 ? '+' : ''}</option>)}
            </select>
          </div>
          <div className="input-field">
            <label>Formwork / compaction</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="std">Standard (Table 4.10.3.2)</option>
              <option value="rigid">Rigid formwork / intense (4.10.3.3)</option>
            </select>
          </div>
          <div className="input-field">
            <label>Cast against ground?</label>
            <select value={ground} onChange={(e) => setGround(e.target.value)}>
              <option value="none">No</option>
              <option value="membrane">Yes — with membrane (+10)</option>
              <option value="direct">Yes — no membrane (+20)</option>
            </select>
          </div>
        </div>

        <p className="hint no-print" style={{ margin: '0 0 4px' }}>{CLASS_DESC[cls]}</p>

        {/* Result banner */}
        <div className={`footing-verdict ${result.ok ? 'pass' : 'fail'}`}>
          <div className="footing-verdict-main">
            <span className="footing-verdict-label">Required cover</span>
            <span className="footing-verdict-value">{result.ok ? `${result.cover} mm` : '—'}</span>
          </div>
          <span className={`footing-verdict-status ${result.ok ? 'pass' : 'fail'}`}>{cls} · {fc} MPa</span>
        </div>

        {!result.ok ? (
          <p className="seismic-flag">{result.msg}</p>
        ) : (
          <section style={{ marginTop: 4 }}>
            <table className="calc-table">
              <tbody>
                <tr><td className="label">Table cover (corrosion)</td><td className="value mono">{result.base} mm</td><td className="ref">{method === 'rigid' ? 'Table 4.10.3.3' : 'Table 4.10.3.2'}{result.isConcession ? ' — concession value (Cl 4.3.2)' : ''}</td></tr>
                {result.groundNote ? <tr><td className="label">Cast-against-ground adjustment</td><td className="value mono">+{ground === 'direct' ? 20 : 10} mm</td><td className="ref">{result.groundNote}</td></tr> : null}
                <tr><td className="label"><strong>Required cover</strong></td><td className="value mono"><strong>{result.cover} mm</strong></td><td className="ref">corrosion protection governing</td></tr>
              </tbody>
            </table>
            <p className="hint" style={{ marginTop: 8 }}>
              Note: cover must also satisfy fire requirements (Section 5) and be ≥ the bar diameter / aggregate-related minimums (Cl 4.10.2). The governing cover is the greatest of all applicable requirements.
            </p>
          </section>
        )}

        {/* Reference table */}
        <section style={{ marginTop: 16 }}>
          <div className="col-heading"><h2 className="label">{method === 'rigid' ? 'Table 4.10.3.3 — rigid formwork' : 'Table 4.10.3.2 — standard formwork'}</h2><p className="hint">Required cover (mm). Bracket = concession value (Cl 4.3.2); — = grade not permitted.</p></div>
          <table className="calc-table">
            <thead><tr><th>Class</th>{GRADES.map((g) => <th key={g}>{g}{g === 50 ? '+' : ''} MPa</th>)}</tr></thead>
            <tbody>
              {CLASSES.map((c) => {
                const table = method === 'rigid' ? T_RIGID : T_STD;
                const conc = method === 'rigid' ? RIGID_CONCESSION : STD_CONCESSION;
                return (
                  <tr key={c}>
                    <td className="label"><strong>{c}</strong></td>
                    {GRADES.map((g, gi) => {
                      const v = table[c][gi];
                      const isC = conc[`${c}-${g}`];
                      const sel = c === cls && String(g) === fc;
                      return (
                        <td key={g} className="mono" style={sel ? { background: 'var(--gold-tint)', color: 'var(--text)', fontWeight: 700 } : undefined}>
                          {v == null ? '—' : (isC ? `(${v})` : v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="no-print" style={{ marginTop: 16 }}>
          <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} exposure classifications</button>
          {theoryOpen ? (
            <div className="bulk-theory">
              {CLASSES.map((c) => <p key={c}><strong>{c}</strong> — {CLASS_DESC[c]}</p>)}
              <p className="hint">Summarised from AS 3600 Cl 4.3 / Table 4.3. Determine the actual class from the Standard for your site and surface (the full table covers many specific situations). Indicative — verify independently.</p>
            </div>
          ) : null}
        </section>

        <div className="print-footer">StrucLab · LabKit · struclab.com.au · Generated {today}</div>
        <div className="workspace-footer"><span>StrucLab · LabKit · struclab.com.au</span><span className="mono">Generated {today}</span></div>
      </div>
    </div>
  );
}

export default CoverTool;
