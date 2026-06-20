'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

// ============================================================
// LOAD TAKEDOWN ENGINE — AS/NZS 1170.0 / 1170.1
// Single column. Accumulates G and Q floor-by-floor (top→bottom)
// with live-load area reduction (Cl 3.4.2) and the standard
// load combinations. Verified by hand-check.
// ============================================================

// Live-load area reduction, AS/NZS 1170.1 Cl 3.4.2: ψa = 0.3 + 3/√A, bounded [0.4, 1.0]
function liveLoadReduction(A) {
  if (!A || A <= 0) return 1.0;
  let psi = 0.3 + 3.0 / Math.sqrt(A);
  if (psi > 1.0) psi = 1.0;
  if (psi < 0.4) psi = 0.4;
  return psi;
}

function computeTakedown(floors, col) {
  const num = (v) => parseFloat(v) || 0;
  let cumG = 0, cumQ = 0, cumQl = 0, cumQs = 0;

  const rows = floors.map((f) => {
    const A = num(f.A);
    const psi_a = f.reduceQ ? liveLoadReduction(A) : 1.0;
    // Column self-weight this storey = 25 · b · d · h (kN), b,d in mm, h in m
    const sw = col.swOn ? 25.0 * (num(col.swB) / 1000) * (num(col.swD) / 1000) * num(f.h) : 0;
    const G_floor = num(f.sdl) * A + sw;
    const Q_floor = num(f.q) * A * psi_a;

    cumG += G_floor;
    cumQ += Q_floor;
    cumQl += Q_floor * num(f.psi_l);
    cumQs += Q_floor * num(f.psi_s);

    const c1 = 1.35 * cumG;                 // 1.35 G
    const c2 = 1.2 * cumG + 1.5 * cumQ;     // 1.2 G + 1.5 Q
    const c3 = 1.2 * cumG + 1.5 * cumQl;    // 1.2 G + 1.5 ψl Q
    const c4 = cumG + cumQs;                // SLS: G + ψs Q

    return { label: f.label, isRoof: f.isRoof, A, psi_a, reduceQ: f.reduceQ, sw, G_floor, Q_floor, cumG, cumQ, c1, c2, c3, c4 };
  });

  const finalC1 = 1.35 * cumG;
  const finalC2 = 1.2 * cumG + 1.5 * cumQ;
  const finalC3 = 1.2 * cumG + 1.5 * cumQl;
  const finalC4 = cumG + cumQs;
  const ulsGov = Math.max(finalC1, finalC2, finalC3);

  return { rows, cumG, cumQ, finalC1, finalC2, finalC3, finalC4, ulsGov };
}

const fmt = (v, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

// ============================================================
// Floor schema (one row per floor, top → bottom)
// ============================================================
const FLOOR_COLS = [
  { key: 'label', label: 'Floor', unit: '', type: 'text', w: 70 },
  { key: 'isRoof', label: 'Roof', unit: '', type: 'check' },
  { key: 'h', label: 'h', unit: 'm', type: 'num' },
  { key: 'A', label: 'A_trib', unit: 'm²', type: 'num' },
  { key: 'sdl', label: 'G (SDL)', unit: 'kPa', type: 'num' },
  { key: 'q', label: 'Q', unit: 'kPa', type: 'num' },
  { key: 'psi_l', label: 'ψl', unit: '', type: 'num' },
  { key: 'psi_s', label: 'ψs', unit: '', type: 'num' },
  { key: 'reduceQ', label: 'Reduce Q', unit: '', type: 'check' },
];

const PASTE_KEYS = ['label', 'isRoof', 'h', 'A', 'sdl', 'q', 'psi_l', 'psi_s', 'reduceQ'];

const newFloor = (label, isRoof = false) => ({
  label, isRoof,
  h: '3.5', A: '40', sdl: isRoof ? '3.5' : '5.5', q: isRoof ? '1.5' : '3.0',
  psi_l: isRoof ? '0' : '0.4', psi_s: isRoof ? '0' : '0.7', reduceQ: true,
});

const DEFAULT_FLOORS = [
  newFloor('Roof', true),
  newFloor('L3'),
  newFloor('L2'),
  newFloor('L1'),
];

function LoadTakedown() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '', collabel: 'C1' });
  const [sw, setSw] = useState({ swOn: false, swB: '400', swD: '400' });
  const [floors, setFloors] = useState(DEFAULT_FLOORS);
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const result = useMemo(() => computeTakedown(floors, sw), [floors, sw]);

  // ---- Row ops ----
  const updateFloor = (idx, key, value) =>
    setFloors((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  const addFloor = () => setFloors((prev) => [...prev, newFloor(`L${prev.length}`)]);
  const addRoof = () => setFloors((prev) => [newFloor('Roof', true), ...prev]);
  const deleteFloor = (idx) => setFloors((prev) => prev.filter((_, i) => i !== idx));
  const clearFloors = () => setFloors([newFloor('Roof', true)]);

  // ---- Inline Excel paste onto a cell (label·roof·h·A·sdl·q·ψl·ψs·reduceQ) ----
  const handleCellPaste = (e, rowIdx) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (text.indexOf('\t') === -1 && text.indexOf('\n') === -1) return;
    e.preventDefault();
    const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
    const parsed = lines.map((line, i) => {
      const cells = line.indexOf('\t') !== -1 ? line.split('\t') : line.trim().split(/\s+/);
      const f = newFloor(`L${i + 1}`);
      PASTE_KEYS.forEach((k, ci) => {
        if (cells[ci] === undefined || cells[ci] === '') return;
        const v = cells[ci].trim();
        if (k === 'isRoof' || k === 'reduceQ') f[k] = /^(y|yes|true|1)$/i.test(v);
        else f[k] = v;
      });
      return f;
    });
    setFloors((prev) => {
      const next = [...prev];
      parsed.forEach((p, k) => {
        const t = rowIdx + k;
        if (t < next.length) next[t] = { ...next[t], ...p };
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
            <span className="current">Load Takedown</span>
          </div>
        </div>
        <ThemeToggle />
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
            <div className="lh-meta">
              Engineering Calculation<br />
              struclab.com.au
            </div>
          </div>
        </div>

        <div className="print-project-block">
          <table>
            <tbody>
              <tr>
                <td className="ppb-label">Project</td>
                <td>{meta.project || '—'}</td>
                <td className="ppb-label">Job No.</td>
                <td style={{ width: '18%' }}>{meta.jobno || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Calculation</td>
                <td>Gravity Load Takedown — Column {meta.collabel || '—'}</td>
                <td className="ppb-label">By</td>
                <td>{meta.byname || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Reference</td>
                <td>AS/NZS 1170.0 &amp; 1170.1</td>
                <td className="ppb-label">Date</td>
                <td>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Gravity Load Takedown</h1>
          <div className="subtitle">AS/NZS 1170.0 &amp; 1170.1 · Single column · Cumulative G &amp; Q with live-load area reduction</div>
        </div>

        {/* ---- Project meta + column setup (screen) ---- */}
        <div className="bulk-meta no-print">
          <div className="input-field">
            <label>Project name</label>
            <input type="text" value={meta.project} onChange={(e) => setMeta({ ...meta, project: e.target.value })} placeholder="e.g. 123 Smith St Tower" />
          </div>
          <div className="input-field">
            <label>Job No.</label>
            <input type="text" value={meta.jobno} onChange={(e) => setMeta({ ...meta, jobno: e.target.value })} placeholder="e.g. 24-118" />
          </div>
          <div className="input-field">
            <label>By</label>
            <input type="text" value={meta.byname} onChange={(e) => setMeta({ ...meta, byname: e.target.value })} placeholder="Initials" />
          </div>
        </div>

        <div className="takedown-setup no-print">
          <div className="input-field">
            <label>Column label</label>
            <input type="text" value={meta.collabel} onChange={(e) => setMeta({ ...meta, collabel: e.target.value })} />
          </div>
          <label className="takedown-check">
            <input type="checkbox" checked={sw.swOn} onChange={(e) => setSw({ ...sw, swOn: e.target.checked })} />
            Include column self-weight (25·b·d·h per storey)
          </label>
          {sw.swOn ? (
            <>
              <div className="input-field">
                <label>b (mm)</label>
                <input type="number" value={sw.swB} onChange={(e) => setSw({ ...sw, swB: e.target.value })} step="50" />
              </div>
              <div className="input-field">
                <label>d (mm)</label>
                <input type="number" value={sw.swD} onChange={(e) => setSw({ ...sw, swD: e.target.value })} step="50" />
              </div>
            </>
          ) : null}
        </div>

        {/* ---- Toolbar ---- */}
        <div className="bulk-toolbar no-print">
          <button className="btn-calc" type="button" onClick={addFloor}>+ Add floor</button>
          <button className="bulk-btn" type="button" onClick={addRoof}>+ Add roof (top)</button>
          <span className="bulk-spacer" />
          <button className="bulk-btn bulk-btn-danger" type="button" onClick={clearFloors}>Clear floors</button>
        </div>

        <p className="hint no-print" style={{ margin: '0 0 10px' }}>
          One row = one floor, listed top → bottom. Units: m, m², kPa. ψl, ψs are the AS/NZS 1170.0 combination factors.
          Tick &quot;Reduce Q&quot; to apply the live-load area reduction (ψa = 0.3 + 3/√A). Paste a block from Excel onto any cell.
        </p>

        {/* ---- Editable floor schedule (screen) ---- */}
        <div className="bulk-grid-wrap no-print">
          <table className="bulk-grid">
            <thead>
              <tr>
                <th className="bulk-th-idx" />
                {FLOOR_COLS.map((c) => (
                  <th key={c.key} style={c.w ? { minWidth: c.w } : undefined}>
                    {c.label}
                    {c.unit ? <span className="bulk-unit">{c.unit}</span> : null}
                  </th>
                ))}
                <th className="bulk-th-idx" />
              </tr>
            </thead>
            <tbody>
              {floors.map((f, ri) => (
                <tr key={ri}>
                  <td className="bulk-idx">{ri + 1}</td>
                  {FLOOR_COLS.map((c) => (
                    <td key={c.key} className={c.type === 'check' ? 'bulk-check-cell' : undefined}>
                      {c.type === 'check' ? (
                        <input
                          type="checkbox"
                          checked={!!f[c.key]}
                          onChange={(e) => updateFloor(ri, c.key, e.target.checked)}
                        />
                      ) : (
                        <input
                          type={c.type === 'num' ? 'number' : 'text'}
                          value={f[c.key]}
                          onChange={(e) => updateFloor(ri, c.key, e.target.value)}
                          onPaste={(e) => handleCellPaste(e, ri)}
                        />
                      )}
                    </td>
                  ))}
                  <td className="bulk-del">
                    <button type="button" onClick={() => deleteFloor(ri)} aria-label="Delete floor">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---- Summary band ---- */}
        <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="bulk-sum-card fail">
            <span className="bulk-sum-n">{fmt(result.ulsGov, 0)}</span>
            <span className="bulk-sum-l">Governing ULS reaction (kN)</span>
          </div>
          <div className="bulk-sum-card">
            <span className="bulk-sum-n">{fmt(result.finalC4, 0)}</span>
            <span className="bulk-sum-l">SLS reaction G+ψs·Q (kN)</span>
          </div>
          <div className="bulk-sum-card">
            <span className="bulk-sum-n">{fmt(result.cumG, 0)} / {fmt(result.cumQ, 0)}</span>
            <span className="bulk-sum-l">Unfactored ΣG / ΣQ (kN)</span>
          </div>
        </div>

        {/* ---- Results table (also the print view) ---- */}
        <section style={{ marginTop: 18 }}>
          <div className="col-heading">
            <h2 className="label">Takedown — Column {meta.collabel || ''}{sw.swOn ? ` (incl. SW ${sw.swB}×${sw.swD} mm)` : ''}</h2>
            <p className="hint">Reactions accumulate top → bottom. Combinations per AS/NZS 1170.0.</p>
          </div>
          <table className="calc-table">
            <thead>
              <tr>
                <th>Floor</th>
                <th>A (m²)</th>
                <th>ψa</th>
                <th>G floor (kN)</th>
                <th>Q floor (kN)</th>
                <th>ΣG (kN)</th>
                <th>ΣQ (kN)</th>
                <th>1.35G</th>
                <th>1.2G+1.5Q</th>
                <th>1.2G+1.5ψl·Q</th>
                <th>SLS</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((x, i) => (
                <tr key={i}>
                  <td><strong>{x.label}</strong>{x.isRoof ? <span className="bulk-status pass" style={{ fontSize: '0.65rem', marginLeft: 6 }}>ROOF</span> : null}</td>
                  <td className="mono">{fmt(x.A, 1)}</td>
                  <td className="mono">{fmt(x.psi_a, 3)}{!x.reduceQ ? <span className="hint"> (off)</span> : null}</td>
                  <td className="mono">{fmt(x.G_floor, 1)}{x.sw > 0 ? <span className="hint"> (SW {fmt(x.sw, 1)})</span> : null}</td>
                  <td className="mono">{fmt(x.Q_floor, 1)}</td>
                  <td className="mono">{fmt(x.cumG, 1)}</td>
                  <td className="mono">{fmt(x.cumQ, 1)}</td>
                  <td className="mono">{fmt(x.c1, 1)}</td>
                  <td className="mono">{fmt(x.c2, 1)}</td>
                  <td className="mono">{fmt(x.c3, 1)}</td>
                  <td className="mono">{fmt(x.c4, 1)}</td>
                </tr>
              ))}
              <tr className="summary-row">
                <td colSpan={5}><strong>FOOTING REACTION ({meta.collabel || 'column'})</strong></td>
                <td className="mono"><strong>{fmt(result.cumG, 1)}</strong></td>
                <td className="mono"><strong>{fmt(result.cumQ, 1)}</strong></td>
                <td className="mono"><strong>{fmt(result.finalC1, 1)}</strong></td>
                <td className="mono"><strong>{fmt(result.finalC2, 1)}</strong></td>
                <td className="mono"><strong>{fmt(result.finalC3, 1)}</strong></td>
                <td className="mono"><strong>{fmt(result.finalC4, 1)}</strong></td>
              </tr>
            </tbody>
          </table>
          <p className="hint" style={{ marginTop: 8 }}>
            Governing ULS = {fmt(result.ulsGov, 1)} kN · SLS (G+ψs·Q) = {fmt(result.finalC4, 1)} kN ·
            Unfactored ΣG = {fmt(result.cumG, 1)} kN, ΣQ (reduced) = {fmt(result.cumQ, 1)} kN.
          </p>
        </section>

        {/* ---- Theory toggle ---- */}
        <section className="no-print" style={{ marginTop: 18 }}>
          <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>
            {theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions
          </button>
          {theoryOpen ? (
            <div className="bulk-theory">
              <p><strong>Per floor:</strong> G = SDL·A<sub>trib</sub> + column self-weight (25·b·d·h for the storey, if enabled). Q = q·A<sub>trib</sub>·ψa.</p>
              <p><strong>Live-load area reduction</strong> (AS/NZS 1170.1 Cl 3.4.2): ψa = 0.3 + 3/√A, bounded 0.4 ≤ ψa ≤ 1.0, applied per floor where &quot;Reduce Q&quot; is ticked. Roof live load is typically not reduced — set the toggle per your judgement.</p>
              <p><strong>Combinations</strong> (AS/NZS 1170.0): ULS 1.35G; 1.2G + 1.5Q; 1.2G + 1.5ψl·Q. SLS G + ψs·Q. Governing ULS = the largest of the three ULS cases at the column base.</p>
              <p className="hint">Indicative only — wind/earthquake/pattern-loading combinations and any other actions are not included. Verify independently.</p>
            </div>
          ) : null}
        </section>

        <div className="print-footer">
          StrucLab · LabKit · struclab.com.au · Generated {today}
        </div>

        <div className="workspace-footer">
          <span>StrucLab · LabKit · struclab.com.au</span>
          <span className="mono">Generated {today}</span>
        </div>
      </div>
    </div>
  );
}

export default LoadTakedown;
