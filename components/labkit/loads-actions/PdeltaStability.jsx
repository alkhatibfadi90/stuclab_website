'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// P-DELTA STABILITY — AS 1170.4:2024 Cl 6.7.3
// Inter-storey stability coefficient:
//   θ = d_st·ΣW / (h_si·μ·ΣF)              [Eq 6.7(2)]
//   d_st = d_ie·μ/Sp (when elastic input)  [Eq 6.7(1)]
//   amplifier = max(0.9/(1−θ), 1.0)        [Cl 6.7.3.2]
//   θ≤0.1 neglect · 0.1<θ≤0.2 amplify · θ>0.2 redesign  [Cl 6.7.3.1]
// Engine hand-verified against the Standard.
// ============================================================

const num = (v) => parseFloat(v) || 0;

function computeRow(row, opts) {
  const d_ie = num(row.drift);
  const W = num(row.Ptot);
  const F = num(row.sumF);
  const h = num(row.h);
  const mu = num(opts.mu) || 1;
  const Sp = num(opts.Sp) || 1;

  if (W <= 0 || F <= 0 || h <= 0) return { valid: false };

  const d_st = opts.driftMode === 'elastic' ? (d_ie * mu) / Sp : d_ie; // mm
  const denom = h * mu * F;
  const theta = denom > 0 ? (d_st * W) / denom : 0;

  let verdict, cls, amp;
  if (theta <= 0.10) { verdict = 'Neglect'; cls = 'pass'; amp = 1.0; }
  else if (theta <= 0.20) { verdict = 'Amplify'; cls = 'warn'; amp = Math.max(0.9 / (1 - theta), 1.0); }
  else { verdict = 'Redesign'; cls = 'fail'; amp = Math.max(0.9 / (1 - theta), 1.0); }

  return { valid: true, d_ie, d_st, theta, verdict, cls, amp };
}

const fmt = (v, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

const COLUMNS = [
  { key: 'storey', label: 'Storey', unit: '', type: 'text', w: 80 },
  { key: 'Ptot', label: 'P_tot (ΣW)', unit: 'kN', type: 'num' },
  { key: 'sumF', label: 'V_s (ΣF)', unit: 'kN', type: 'num' },
  { key: 'drift', label: 'Drift Δ', unit: 'mm', type: 'num' },
  { key: 'h', label: 'h_si', unit: 'mm', type: 'num' },
];
const PASTE_KEYS = COLUMNS.map((c) => c.key);

const blankRow = (i) => ({ storey: `Storey ${i}`, Ptot: '115000', sumF: '5600', drift: '45', h: '3500' });

const EXAMPLE = [
  { storey: 'L20', Ptot: '23000', sumF: '5600', drift: '12', h: '3500' },
  { storey: 'L15', Ptot: '57000', sumF: '8900', drift: '18', h: '3500' },
  { storey: 'L10', Ptot: '92000', sumF: '11200', drift: '22', h: '3500' },
  { storey: 'L5', Ptot: '128000', sumF: '12800', drift: '20', h: '3500' },
  { storey: 'L1', Ptot: '165000', sumF: '13500', drift: '14', h: '4000' },
];

function PdeltaStability() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '' });
  const [driftMode, setDriftMode] = useState('elastic'); // elastic | design
  const [mu, setMu] = useState('2');
  const [Sp, setSp] = useState('0.77');
  const [rows, setRows] = useState(() => [blankRow(1), blankRow(2), blankRow(3)]);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const opts = useMemo(() => ({ driftMode, mu, Sp }), [driftMode, mu, Sp]);
  const computed = useMemo(() => rows.map((r) => computeRow(r, opts)), [rows, opts]);

  const summary = useMemo(() => {
    let neglect = 0, amplify = 0, redesign = 0, invalid = 0, maxTheta = 0, maxStorey = '';
    computed.forEach((r, i) => {
      if (!r.valid) { invalid += 1; return; }
      if (r.theta > maxTheta) { maxTheta = r.theta; maxStorey = rows[i].storey; }
      if (r.theta <= 0.10) neglect += 1;
      else if (r.theta <= 0.20) amplify += 1;
      else redesign += 1;
    });
    return { neglect, amplify, redesign, invalid, maxTheta, maxStorey };
  }, [computed, rows]);

  // ---- Row ops ----
  const updateCell = (i, key, value) => setRows((p) => p.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  const addRow = () => setRows((p) => [...p, blankRow(p.length + 1)]);
  const deleteRow = (i) => setRows((p) => p.filter((_, j) => j !== i));
  const clearAll = () => setRows([blankRow(1)]);
  const loadExample = () => setRows(EXAMPLE.map((r) => ({ ...r })));

  function parsePaste(text) {
    return text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '').map((line, i) => {
      const cells = line.indexOf('\t') !== -1 ? line.split('\t') : line.trim().split(/\s+/);
      const row = blankRow(i + 1);
      PASTE_KEYS.forEach((k, ci) => { if (cells[ci] !== undefined && cells[ci] !== '') row[k] = cells[ci].trim(); });
      return row;
    });
  }
  const applyPaste = (replace) => {
    const parsed = parsePaste(pasteText);
    if (parsed.length === 0) { setShowPaste(false); return; }
    setRows((p) => (replace ? parsed : [...p, ...parsed]));
    setPasteText(''); setShowPaste(false);
  };
  const handleCellPaste = (e, rowIdx) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (text.indexOf('\t') === -1 && text.indexOf('\n') === -1) return;
    e.preventDefault();
    const parsed = parsePaste(text);
    setRows((prev) => {
      const next = [...prev];
      parsed.forEach((p, k) => {
        const t = rowIdx + k;
        if (t < next.length) next[t] = { ...next[t], ...p, storey: next[t].storey };
        else next.push(p);
      });
      return next;
    });
  };

  return (
    <div className="labkit-page">
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">Struc<span className="lab">Lab</span></Link>
          <div className="location">
            <span>LabKit</span>
            <span className="sep">›</span>
            <span>Loads &amp; Actions</span>
            <span className="sep">›</span>
            <span className="current">P-Delta Stability</span>
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
              <tr>
                <td className="ppb-label">Project</td><td>{meta.project || '—'}</td>
                <td className="ppb-label">Job No.</td><td style={{ width: '18%' }}>{meta.jobno || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Calculation</td><td>P-Delta Stability — Inter-storey θ</td>
                <td className="ppb-label">By</td><td>{meta.byname || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Reference</td><td>AS 1170.4:2024 Cl 6.7.3</td>
                <td className="ppb-label">Date</td><td>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">P-Delta Stability</h1>
          <div className="subtitle">AS 1170.4:2024 Cl 6.7.3 · Inter-storey stability coefficient θ · ETABS storey schedule</div>
        </div>

        <div className="bulk-meta no-print">
          <div className="input-field"><label>Project name</label><input type="text" value={meta.project} onChange={(e) => setMeta({ ...meta, project: e.target.value })} placeholder="e.g. 123 Smith St Tower" /></div>
          <div className="input-field"><label>Job No.</label><input type="text" value={meta.jobno} onChange={(e) => setMeta({ ...meta, jobno: e.target.value })} placeholder="e.g. 24-118" /></div>
          <div className="input-field"><label>By</label><input type="text" value={meta.byname} onChange={(e) => setMeta({ ...meta, byname: e.target.value })} placeholder="Initials" /></div>
        </div>

        {/* ---- Global params ---- */}
        <div className="seismic-params no-print" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="input-field">
            <label>Drift input</label>
            <select value={driftMode} onChange={(e) => setDriftMode(e.target.value)}>
              <option value="elastic">Elastic d_ie (tool applies μ/Sp)</option>
              <option value="design">Design drift d_st (pre-factored)</option>
            </select>
          </div>
          <div className="input-field"><label>μ (structural ductility)</label><input type="number" step="0.1" value={mu} onChange={(e) => setMu(e.target.value)} /></div>
          <div className="input-field"><label>Sp (performance factor)</label><input type="number" step="0.01" value={Sp} onChange={(e) => setSp(e.target.value)} /></div>
        </div>

        {/* ---- Toolbar ---- */}
        <div className="bulk-toolbar no-print">
          <button className="btn-calc" type="button" onClick={addRow}>+ Add storey</button>
          <button className="bulk-btn" type="button" onClick={() => setShowPaste(true)}>Paste from Excel</button>
          <button className="bulk-btn" type="button" onClick={loadExample}>Load example</button>
          <span className="bulk-spacer" />
          <button className="bulk-btn bulk-btn-danger" type="button" onClick={clearAll}>Clear all</button>
        </div>

        <p className="hint no-print" style={{ margin: '0 0 10px' }}>
          One row = one storey. P_tot = total gravity load above (ΣW, typically G + 0.3Q). V_s = seismic storey shear above (ΣF).
          Drift Δ per the &quot;Drift input&quot; mode above. h_si = inter-storey height (centre-to-centre). Units: kN, mm.
        </p>

        {/* ---- Editable grid ---- */}
        <div className="bulk-grid-wrap no-print">
          <table className="bulk-grid">
            <thead>
              <tr>
                <th className="bulk-th-idx" />
                {COLUMNS.map((c) => (
                  <th key={c.key} style={c.w ? { minWidth: c.w } : undefined}>{c.label}{c.unit ? <span className="bulk-unit">{c.unit}</span> : null}</th>
                ))}
                <th className="bulk-th-res">θ</th>
                <th className="bulk-th-res">Amp</th>
                <th className="bulk-th-res">Verdict</th>
                <th className="bulk-th-idx" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const res = computed[ri];
                return (
                  <tr key={ri}>
                    <td className="bulk-idx">{ri + 1}</td>
                    {COLUMNS.map((c) => (
                      <td key={c.key}>
                        <input
                          type={c.type === 'num' ? 'number' : 'text'}
                          value={row[c.key]}
                          onChange={(e) => updateCell(ri, c.key, e.target.value)}
                          onPaste={(e) => handleCellPaste(e, ri)}
                        />
                      </td>
                    ))}
                    <td className="bulk-res mono">{res.valid ? fmt(res.theta, 4) : '—'}</td>
                    <td className="bulk-res mono">{res.valid ? `${fmt(res.amp, 3)}×` : '—'}</td>
                    <td className={`bulk-status ${res.valid ? res.cls : ''}`}>{res.valid ? res.verdict.toUpperCase() : 'INVALID'}</td>
                    <td className="bulk-del"><button type="button" onClick={() => deleteRow(ri)} aria-label="Delete storey">×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---- Summary band ---- */}
        <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="bulk-sum-card pass"><span className="bulk-sum-n">{summary.neglect}</span><span className="bulk-sum-l">Neglect (θ≤0.10)</span></div>
          <div className="bulk-sum-card warn"><span className="bulk-sum-n">{summary.amplify}</span><span className="bulk-sum-l">Amplify (0.10–0.20)</span></div>
          <div className="bulk-sum-card fail"><span className="bulk-sum-n">{summary.redesign}</span><span className="bulk-sum-l">Redesign (θ&gt;0.20)</span></div>
          <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(summary.maxTheta, 3)}</span><span className="bulk-sum-l">Max θ{summary.maxStorey ? ` — ${summary.maxStorey}` : ''}</span></div>
        </div>

        {/* ---- Results table (print view) ---- */}
        <section style={{ marginTop: 18 }}>
          <div className="col-heading">
            <h2 className="label">Stability coefficient per storey</h2>
            <p className="hint">θ = d_st·ΣW / (h_si·μ·ΣF). Drift input: {driftMode === 'elastic' ? 'elastic d_ie → d_st = d_ie·μ/Sp' : 'design drift d_st'} · μ = {mu} · Sp = {Sp}.</p>
          </div>
          <table className="calc-table">
            <thead>
              <tr>
                <th>Storey</th><th>P_tot (kN)</th><th>V_s (kN)</th>
                <th>Δ in (mm)</th><th>d_st (mm)</th><th>h_si (mm)</th>
                <th>θ</th><th>Amplifier</th><th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const res = computed[ri];
                if (!res.valid) {
                  return (<tr key={ri}><td><strong>{row.storey}</strong></td><td colSpan={7} className="hint">Invalid / incomplete input</td><td className="bulk-status">INVALID</td></tr>);
                }
                return (
                  <tr key={ri}>
                    <td><strong>{row.storey}</strong></td>
                    <td className="mono">{fmt(num(row.Ptot), 0)}</td>
                    <td className="mono">{fmt(num(row.sumF), 0)}</td>
                    <td className="mono">{fmt(res.d_ie, 1)}</td>
                    <td className="mono">{fmt(res.d_st, 1)}</td>
                    <td className="mono">{fmt(num(row.h), 0)}</td>
                    <td className="mono"><strong>{fmt(res.theta, 4)}</strong></td>
                    <td className="mono">{fmt(res.amp, 3)}×</td>
                    <td className={`bulk-status ${res.cls}`}>{res.verdict.toUpperCase()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ---- Theory ---- */}
        <section className="no-print" style={{ marginTop: 18 }}>
          <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>{theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions</button>
          {theoryOpen ? (
            <div className="bulk-theory">
              <p><strong>Stability coefficient</strong> (AS 1170.4:2024 Eq 6.7(2)): θ = d_st·ΣW_j / (h_si·μ·ΣF_j), where ΣW is total gravity load above the storey, ΣF the total horizontal seismic force above, h_si the inter-storey height (centre-to-centre), and μ the structural ductility factor.</p>
              <p><strong>Design drift</strong> (Eq 6.7(1)): d_st = d_ie·μ/Sp. When elastic drift d_ie is entered, the tool applies μ/Sp; the μ then partly cancels in θ, leaving θ = d_ie·ΣW/(h·Sp·ΣF). Enter design drift directly to keep μ explicit.</p>
              <p><strong>Verdict</strong> (Cl 6.7.3.1): θ ≤ 0.1 P-delta need not be considered; 0.1 &lt; θ ≤ 0.2 calculate P-delta effects; θ &gt; 0.2 potentially unstable, redesign. <strong>Amplifier</strong> (Cl 6.7.3.2): scale equivalent static forces and deflections by 0.9/(1−θ), not less than 1.0 — or use a second-order analysis.</p>
              <p className="hint">Indicative only. Confirm P_tot gravity combination, drift basis, and μ/Sp against your design basis. Verify independently.</p>
            </div>
          ) : null}
        </section>

        <div className="print-footer">StrucLab · LabKit · struclab.com.au · Generated {today}</div>
        <div className="workspace-footer">
          <span>StrucLab · LabKit · struclab.com.au</span>
          <span className="mono">Generated {today}</span>
        </div>
      </div>

      {showPaste ? (
        <div className="bulk-modal-overlay" onClick={() => setShowPaste(false)}>
          <div className="bulk-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="label">Paste from Excel</h3>
            <p className="hint">Tab- or space-separated rows. Column order:</p>
            <p className="bulk-paste-order mono">{PASTE_KEYS.join(' · ')}</p>
            <textarea className="bulk-paste-area" value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder={'L20\t23000\t5600\t12\t3500'} />
            <div className="bulk-modal-actions">
              <button className="bulk-btn" type="button" onClick={() => setShowPaste(false)}>Cancel</button>
              <button className="bulk-btn" type="button" onClick={() => applyPaste(false)}>Append</button>
              <button className="btn-calc" type="button" onClick={() => applyPaste(true)}>Replace all</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PdeltaStability;
