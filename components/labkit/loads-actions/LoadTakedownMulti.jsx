'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

// ============================================================
// LOAD TAKEDOWN ENGINE — AS/NZS 1170.0 / 1170.1 (MULTI-COLUMN)
// Identical engine to the single-column Load Takedown tool, run
// once per column. A shared floor schedule (one row per floor,
// top→bottom) carries a tributary area per column.
// Verified by hand-check.
// ============================================================

const num = (v) => parseFloat(v) || 0;

// Live-load area reduction, AS/NZS 1170.1 Cl 3.4.2: ψa = 0.3 + 3/√A, bounded [0.4, 1.0]
function liveLoadReduction(A) {
  if (!A || A <= 0) return 1.0;
  let psi = 0.3 + 3.0 / Math.sqrt(A);
  if (psi > 1.0) psi = 1.0;
  if (psi < 0.4) psi = 0.4;
  return psi;
}

// Run the takedown for a single column. `getA(floorIdx)` returns the trib area.
function computeColumn(floors, col, getA) {
  let cumG = 0, cumQ = 0, cumQl = 0, cumQs = 0;
  const rows = floors.map((f, idx) => {
    const A = num(getA(idx));
    const psi_a = f.reduceQ ? liveLoadReduction(A) : 1.0;
    const sw = col.swOn ? 25.0 * (num(col.swB) / 1000) * (num(col.swD) / 1000) * num(f.h) : 0;
    const G_floor = num(f.sdl) * A + sw;
    const Q_floor = num(f.q) * A * psi_a;
    cumG += G_floor;
    cumQ += Q_floor;
    cumQl += Q_floor * num(f.psi_l);
    cumQs += Q_floor * num(f.psi_s);
    const c1 = 1.35 * cumG;
    const c2 = 1.2 * cumG + 1.5 * cumQ;
    const c3 = 1.2 * cumG + 1.5 * cumQl;
    const c4 = cumG + cumQs;
    return { label: f.label, isRoof: f.isRoof, A, psi_a, reduceQ: f.reduceQ, sw, G_floor, Q_floor, cumG, cumQ, c1, c2, c3, c4 };
  });
  const finalC1 = 1.35 * cumG;
  const finalC2 = 1.2 * cumG + 1.5 * cumQ;
  const finalC3 = 1.2 * cumG + 1.5 * cumQl;
  const finalC4 = cumG + cumQs;
  return { rows, cumG, cumQ, finalC1, finalC2, finalC3, finalC4, ulsGov: Math.max(finalC1, finalC2, finalC3) };
}

const fmt = (v, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

const MAX_COLS = 12;

// Floor properties (shared) — trib areas are stored separately per column.
const newFloor = (label, isRoof = false) => ({
  label, isRoof,
  h: '3.5', sdl: isRoof ? '3.5' : '5.5', q: isRoof ? '1.5' : '3.0',
  psi_l: isRoof ? '0' : '0.4', psi_s: isRoof ? '0' : '0.7', reduceQ: true,
});

const DEFAULT_FLOORS = [newFloor('Roof', true), newFloor('L3'), newFloor('L2'), newFloor('L1')];
// trib[floorIdx][colIdx]
const DEFAULT_TRIB = DEFAULT_FLOORS.map(() => ['40', '40']);
const DEFAULT_COLS = [
  { label: 'C1', swOn: false, swB: '400', swD: '400' },
  { label: 'C2', swOn: false, swB: '400', swD: '400' },
];

function LoadTakedownMulti() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '' });
  const [floors, setFloors] = useState(DEFAULT_FLOORS);
  const [trib, setTrib] = useState(DEFAULT_TRIB);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const results = useMemo(
    () => cols.map((col, ci) => computeColumn(floors, col, (fi) => (trib[fi] ? trib[fi][ci] : 0))),
    [floors, trib, cols],
  );

  const combined = useMemo(() => {
    let gov = 0, sls = 0, g = 0, q = 0;
    results.forEach((r) => { gov += r.ulsGov; sls += r.finalC4; g += r.cumG; q += r.cumQ; });
    return { gov, sls, g, q };
  }, [results]);

  // ---- Floor ops ----
  const updateFloor = (idx, key, value) =>
    setFloors((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  const updateTrib = (fi, ci, value) =>
    setTrib((prev) => prev.map((row, i) => (i === fi ? row.map((a, j) => (j === ci ? value : a)) : row)));
  const addFloor = () => {
    setFloors((prev) => [...prev, newFloor(`L${prev.length}`)]);
    setTrib((prev) => [...prev, cols.map(() => '0')]);
  };
  const addRoof = () => {
    setFloors((prev) => [newFloor('Roof', true), ...prev]);
    setTrib((prev) => [cols.map(() => '0'), ...prev]);
  };
  const deleteFloor = (idx) => {
    setFloors((prev) => prev.filter((_, i) => i !== idx));
    setTrib((prev) => prev.filter((_, i) => i !== idx));
  };
  const clearFloors = () => {
    setFloors([newFloor('Roof', true)]);
    setTrib([cols.map(() => '0')]);
  };

  // ---- Column ops ----
  const updateCol = (idx, key, value) =>
    setCols((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  const addColumn = () => {
    if (cols.length >= MAX_COLS) return;
    setCols((prev) => [...prev, { label: `C${prev.length + 1}`, swOn: false, swB: '400', swD: '400' }]);
    setTrib((prev) => prev.map((row) => [...row, '0']));
  };
  const deleteColumn = (idx) => {
    if (cols.length <= 1) return;
    setCols((prev) => prev.filter((_, i) => i !== idx));
    setTrib((prev) => prev.map((row) => row.filter((_, j) => j !== idx)));
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
            <span className="current">Load Takedown — Multi-Column</span>
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
                <td>Gravity Load Takedown — {cols.length} columns</td>
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
          <h1 className="title">Gravity Load Takedown — Multi-Column</h1>
          <div className="subtitle">AS/NZS 1170.0 &amp; 1170.1 · One floor schedule, multiple columns · Cumulative G &amp; Q with live-load area reduction</div>
        </div>

        {/* ---- Project meta (screen) ---- */}
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

        {/* ---- Column setup strip ---- */}
        <div className="takedown-setup no-print" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="bulk-toolbar" style={{ margin: 0 }}>
            <strong style={{ color: 'var(--brand-gold-bright)', fontSize: '0.85rem' }}>Columns</strong>
            <span className="bulk-spacer" />
            <button className="bulk-btn" type="button" onClick={addColumn} disabled={cols.length >= MAX_COLS}>+ Add column</button>
          </div>
          <div className="takedown-cols">
            {cols.map((c, ci) => (
              <div className="takedown-col-card" key={ci}>
                <div className="takedown-col-head">
                  <input
                    type="text"
                    className="takedown-col-label"
                    value={c.label}
                    onChange={(e) => updateCol(ci, 'label', e.target.value)}
                  />
                  {cols.length > 1 ? (
                    <button type="button" className="bulk-del" onClick={() => deleteColumn(ci)} aria-label="Remove column">×</button>
                  ) : null}
                </div>
                <label className="takedown-check">
                  <input type="checkbox" checked={c.swOn} onChange={(e) => updateCol(ci, 'swOn', e.target.checked)} />
                  Self-weight
                </label>
                {c.swOn ? (
                  <div className="takedown-sw-row">
                    <input type="number" value={c.swB} onChange={(e) => updateCol(ci, 'swB', e.target.value)} placeholder="b" step="50" />
                    <span>×</span>
                    <input type="number" value={c.swD} onChange={(e) => updateCol(ci, 'swD', e.target.value)} placeholder="d" step="50" />
                    <span>mm</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* ---- Toolbar ---- */}
        <div className="bulk-toolbar no-print">
          <button className="btn-calc" type="button" onClick={addFloor}>+ Add floor</button>
          <button className="bulk-btn" type="button" onClick={addRoof}>+ Add roof (top)</button>
          <span className="bulk-spacer" />
          <button className="bulk-btn bulk-btn-danger" type="button" onClick={clearFloors}>Clear floors</button>
        </div>

        <p className="hint no-print" style={{ margin: '0 0 10px' }}>
          One row = one floor, top → bottom. Each column has its own tributary area per floor (A columns). Units: m, m², kPa.
          Tick &quot;Reduce Q&quot; to apply the live-load area reduction (ψa = 0.3 + 3/√A) to that floor.
        </p>

        {/* ---- Editable floor schedule with per-column trib areas ---- */}
        <div className="bulk-grid-wrap no-print">
          <table className="bulk-grid">
            <thead>
              <tr>
                <th className="bulk-th-idx" />
                <th style={{ minWidth: 70 }}>Floor</th>
                <th>Roof</th>
                <th>h<span className="bulk-unit">m</span></th>
                {cols.map((c, ci) => (
                  <th key={ci} className="bulk-th-res">A · {c.label}<span className="bulk-unit">m²</span></th>
                ))}
                <th>G (SDL)<span className="bulk-unit">kPa</span></th>
                <th>Q<span className="bulk-unit">kPa</span></th>
                <th>ψl</th>
                <th>ψs</th>
                <th>Reduce Q</th>
                <th className="bulk-th-idx" />
              </tr>
            </thead>
            <tbody>
              {floors.map((f, ri) => (
                <tr key={ri}>
                  <td className="bulk-idx">{ri + 1}</td>
                  <td><input type="text" value={f.label} onChange={(e) => updateFloor(ri, 'label', e.target.value)} /></td>
                  <td className="bulk-check-cell"><input type="checkbox" checked={!!f.isRoof} onChange={(e) => updateFloor(ri, 'isRoof', e.target.checked)} /></td>
                  <td><input type="number" value={f.h} onChange={(e) => updateFloor(ri, 'h', e.target.value)} /></td>
                  {cols.map((c, ci) => (
                    <td key={ci} className="bulk-res-cell">
                      <input type="number" value={trib[ri] ? trib[ri][ci] : '0'} onChange={(e) => updateTrib(ri, ci, e.target.value)} />
                    </td>
                  ))}
                  <td><input type="number" value={f.sdl} onChange={(e) => updateFloor(ri, 'sdl', e.target.value)} /></td>
                  <td><input type="number" value={f.q} onChange={(e) => updateFloor(ri, 'q', e.target.value)} /></td>
                  <td><input type="number" value={f.psi_l} onChange={(e) => updateFloor(ri, 'psi_l', e.target.value)} /></td>
                  <td><input type="number" value={f.psi_s} onChange={(e) => updateFloor(ri, 'psi_s', e.target.value)} /></td>
                  <td className="bulk-check-cell"><input type="checkbox" checked={!!f.reduceQ} onChange={(e) => updateFloor(ri, 'reduceQ', e.target.checked)} /></td>
                  <td className="bulk-del"><button type="button" onClick={() => deleteFloor(ri)} aria-label="Delete floor">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---- Summary band ---- */}
        <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="bulk-sum-card fail">
            <span className="bulk-sum-n">{fmt(combined.gov, 0)}</span>
            <span className="bulk-sum-l">Σ governing ULS, all columns (kN)</span>
          </div>
          <div className="bulk-sum-card">
            <span className="bulk-sum-n">{fmt(combined.sls, 0)}</span>
            <span className="bulk-sum-l">Σ SLS, all columns (kN)</span>
          </div>
          <div className="bulk-sum-card">
            <span className="bulk-sum-n">{cols.length}</span>
            <span className="bulk-sum-l">Columns</span>
          </div>
        </div>

        {/* ---- Per-column results ---- */}
        {cols.map((col, ci) => {
          const r = results[ci];
          return (
            <section key={ci} style={{ marginTop: 18 }}>
              <div className="col-heading">
                <h2 className="label">Column {col.label}{col.swOn ? ` (incl. SW ${col.swB}×${col.swD} mm)` : ''}</h2>
                <p className="hint">Governing ULS {fmt(r.ulsGov, 1)} kN · SLS {fmt(r.finalC4, 1)} kN</p>
              </div>
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>Floor</th>
                    <th>A (m²)</th>
                    <th>ψa</th>
                    <th>G floor</th>
                    <th>Q floor</th>
                    <th>ΣG</th>
                    <th>ΣQ</th>
                    <th>1.35G</th>
                    <th>1.2G+1.5Q</th>
                    <th>1.2G+1.5ψl·Q</th>
                    <th>SLS</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((x, i) => (
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
                    <td colSpan={5}><strong>FOOTING ({col.label})</strong></td>
                    <td className="mono"><strong>{fmt(r.cumG, 1)}</strong></td>
                    <td className="mono"><strong>{fmt(r.cumQ, 1)}</strong></td>
                    <td className="mono"><strong>{fmt(r.finalC1, 1)}</strong></td>
                    <td className="mono"><strong>{fmt(r.finalC2, 1)}</strong></td>
                    <td className="mono"><strong>{fmt(r.finalC3, 1)}</strong></td>
                    <td className="mono"><strong>{fmt(r.finalC4, 1)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </section>
          );
        })}

        {/* ---- Theory toggle ---- */}
        <section className="no-print" style={{ marginTop: 18 }}>
          <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>
            {theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions
          </button>
          {theoryOpen ? (
            <div className="bulk-theory">
              <p>Each column is computed by the identical engine used in the single-column Load Takedown tool, run once per column against its own tributary areas.</p>
              <p><strong>Per floor:</strong> G = SDL·A + column self-weight (25·b·d·h for the storey, if enabled). Q = q·A·ψa. <strong>Reduction</strong> (AS/NZS 1170.1 Cl 3.4.2): ψa = 0.3 + 3/√A, bounded 0.4–1.0, per floor where ticked. <strong>Combinations</strong> (AS/NZS 1170.0): 1.35G; 1.2G+1.5Q; 1.2G+1.5ψl·Q; SLS G+ψs·Q. Governing ULS = largest of the three at the base.</p>
              <p className="hint">The all-columns summary simply sums each column&apos;s governing reaction — it is not a frame analysis. Wind/earthquake/pattern loading not included. Indicative only; verify independently.</p>
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

export default LoadTakedownMulti;
