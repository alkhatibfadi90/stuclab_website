'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

// ============================================================
// CALCULATION ENGINE — VERIFIED
// Copied byte-for-byte from ColumnPunching.jsx (single-column
// tool, verified against BG&E). The bulk tool runs THIS SAME
// engine once per row so results are identical to the single
// tool for any given column. DO NOT diverge this engine — if
// the single tool's engine changes, mirror the change here.
// ============================================================
function computeResults(raw) {
  const num = (v) => parseFloat(v) || 0;

  const fc = num(raw.fc);
  const scp = num(raw.scp);
  const Ds = num(raw.Ds);
  const dom = num(raw.dom);
  const shape = raw.shape;
  const L = num(raw.L);
  const W = num(raw.W);
  const D = num(raw.D);
  const position = raw.position;
  const Vstar = Math.abs(num(raw.Vstar));
  const Mvx = Math.abs(num(raw.Mvx));
  const Mvy = Math.abs(num(raw.Mvy));
  const u_ineff = num(raw.u_ineff);
  const shear_head = raw.shear_head;
  const ties_provided = raw.ties_provided;
  const lig_size = num(raw.lig_size);
  const lig_s = num(raw.lig_s);
  const fsyf = num(raw.fsyf);

  const phi = 0.70;

  // ---- Geometry ----
  let aL, aW, u_gross, betaH, configText;
  if (shape === 'rect') {
    aL = L + dom;
    aW = W + dom;
    if (position === 'I') {
      u_gross = 2 * aL + 2 * aW;
      configText = 'Interior';
    } else if (position === 'E') {
      u_gross = 2 * aL + aW; // simplified, assumes one face on edge
      configText = 'Edge';
    } else {
      u_gross = aL + aW;
      configText = 'Corner';
    }
    betaH = Math.max(L, W) / Math.min(L, W);
  } else {
    aL = D + dom;
    aW = D + dom;
    u_gross = Math.PI * (D + dom);
    if (position === 'E') u_gross = 0.5 * Math.PI * (D + dom);
    if (position === 'C') u_gross = 0.25 * Math.PI * (D + dom);
    betaH = 1.0;
    configText = position === 'I' ? 'Interior (circular)' : position === 'E' ? 'Edge (circular)' : 'Corner (circular)';
  }
  const u = Math.max(u_gross - u_ineff, 0.001);

  // ---- fcv ----
  const fcv_max = 0.34 * Math.sqrt(fc);
  const fcv1 = 0.17 * (1 + 2 / betaH) * Math.sqrt(fc);
  const fcv = Math.min(fcv_max, fcv1);

  // ---- φVuo ----
  const phiVuo_noSH = phi * u * dom * (fcv + 0.3 * scp) / 1000;
  const phiVuo_max_SH = phi * 0.2 * u * dom * fc / 1000;
  const phiVuo1_SH = phi * u * dom * (0.5 * Math.sqrt(fc) + 0.3 * scp) / 1000;
  const phiVuo_SH = Math.min(phiVuo_max_SH, phiVuo1_SH);
  const phiVuo = (shear_head === 'Y') ? phiVuo_SH : phiVuo_noSH;

  // ---- Biaxial φVu — Cl 9.3.4(a) — no ties ----
  function calcVu_noTies(Mvstar_kNm, a) {
    if (Mvstar_kNm <= 0) return { phiVu: phiVuo, ecc: 0, denom: 1 };
    const Mvstar_Nmm = Mvstar_kNm * 1e6;
    const Vstar_N = Vstar * 1e3;
    const ecc = (u * Mvstar_Nmm) / (8 * Vstar_N * a * dom);
    const denom = 1 + ecc;
    return { phiVu: phiVuo / denom, ecc, denom };
  }
  const vuX = calcVu_noTies(Mvx, aL);
  const vuY = calcVu_noTies(Mvy, aW);

  // ---- Biaxial φVu,min — Cl 9.3.4(b) — min ties ----
  function calcVuMin(Mvstar_kNm, a) {
    if (Mvstar_kNm <= 0) return { phiVu: 1.2 * phiVuo, denom: 1 };
    const Mvstar_Nmm = Mvstar_kNm * 1e6;
    const Vstar_N = Vstar * 1e3;
    const denom = 1 + (u * Mvstar_Nmm) / (2 * Vstar_N * a * a);
    return { phiVu: 1.2 * phiVuo / denom, denom };
  }
  const vuMinX = calcVuMin(Mvx, aL);
  const vuMinY = calcVuMin(Mvy, aW);

  // ---- Provided closed fitments — Cl 9.3.4(d) ----
  function calcVuProvided(phiVu_min, a_dir) {
    const x_strip = Ds;
    const y_strip = a_dir;
    const Asw_min_per_s = (fsyf > 0) ? (0.2 * y_strip) / fsyf : 0;
    const Asw_one_leg = Math.PI * Math.pow(lig_size / 2, 2);
    const Asw_per_s_provided = (lig_s > 0) ? Asw_one_leg / lig_s : 0;
    const phiVu_max = (y_strip > 0) ? 3 * phiVu_min * Math.sqrt(x_strip / y_strip) : phiVu_min;
    let ratio = 0;
    let phiVu_provided = phiVu_min;
    if (ties_provided === 'Y' && Asw_min_per_s > 0) {
      ratio = Asw_per_s_provided / Asw_min_per_s;
      phiVu_provided = Math.min(phiVu_min * Math.sqrt(ratio), phiVu_max);
    }
    return { Asw_min_per_s, Asw_per_s_provided, ratio, phiVu_max, phiVu_provided };
  }
  const vuProvX = calcVuProvided(vuMinX.phiVu, aL);
  const vuProvY = calcVuProvided(vuMinY.phiVu, aW);

  // ---- Governing ----
  const govNoTies = vuX.phiVu <= vuY.phiVu
    ? { dir: 'X', phiVu: vuX.phiVu, M: Mvx }
    : { dir: 'Y', phiVu: vuY.phiVu, M: Mvy };
  const govMin = vuMinX.phiVu <= vuMinY.phiVu
    ? { dir: 'X', phiVu: vuMinX.phiVu }
    : { dir: 'Y', phiVu: vuMinY.phiVu };
  const govProvided = vuProvX.phiVu_provided <= vuProvY.phiVu_provided
    ? { dir: 'X', phiVu: vuProvX.phiVu_provided }
    : { dir: 'Y', phiVu: vuProvY.phiVu_provided };

  const utilNoTies = Vstar / govNoTies.phiVu;
  const utilMin = Vstar / govMin.phiVu;
  const utilProvided = Vstar / govProvided.phiVu;

  // Governing case the row reports, mirroring single-tool logic:
  // ties=Y  -> provided ties;  ties=N & M>0 -> no-ties;  M=0 -> φVuo
  const anyMoment = Mvx > 0 || Mvy > 0;
  let governingPhiVu, governingUtil, governingDir, basis;
  if (!anyMoment) {
    governingPhiVu = phiVuo; governingUtil = Vstar / phiVuo; governingDir = '—'; basis = 'φVuo';
  } else if (ties_provided === 'Y') {
    governingPhiVu = govProvided.phiVu; governingUtil = utilProvided; governingDir = govProvided.dir; basis = 'φVu (ties)';
  } else {
    governingPhiVu = govNoTies.phiVu; governingUtil = utilNoTies; governingDir = govNoTies.dir; basis = 'φVu (no ties)';
  }

  return {
    valid: true,
    phiVuo, vuX, vuY, vuMinX, vuMinY, vuProvX, vuProvY,
    govNoTies, govMin, govProvided,
    utilNoTies, utilMin, utilProvided,
    u, betaH, fcv, configText,
    Vstar, Mvx, Mvy,
    governingPhiVu, governingUtil, governingDir, basis,
  };
}

const fmt = (v, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';
const statusClass = (util) => (!Number.isFinite(util) ? '' : util > 1.0 ? 'fail' : util > 0.85 ? 'warn' : 'pass');
const statusLabel = (util) => (!Number.isFinite(util) ? '—' : util > 1.0 ? 'FAIL' : util > 0.85 ? 'CHECK' : 'PASS');

// ============================================================
// COLUMN SCHEMA — order matches the grid + Excel paste order
// ============================================================
const COLUMNS = [
  { key: 'colid', label: 'Col ID', unit: '', type: 'text', w: 70 },
  { key: 'fc', label: "f'c", unit: 'MPa', type: 'num' },
  { key: 'scp', label: 'σcp', unit: 'MPa', type: 'num' },
  { key: 'Ds', label: 'Ds', unit: 'mm', type: 'num' },
  { key: 'dom', label: 'd_om', unit: 'mm', type: 'num' },
  { key: 'shape', label: 'Shape', unit: 'rect/circ', type: 'select', opts: ['rect', 'circ'] },
  { key: 'L', label: 'L', unit: 'mm', type: 'num' },
  { key: 'W', label: 'W', unit: 'mm', type: 'num' },
  { key: 'D', label: 'D (circ)', unit: 'mm', type: 'num' },
  { key: 'position', label: 'Pos', unit: 'I/E/C', type: 'select', opts: ['I', 'E', 'C'] },
  { key: 'Vstar', label: 'V*', unit: 'kN', type: 'num' },
  { key: 'Mvx', label: 'Mv*x', unit: 'kNm', type: 'num' },
  { key: 'Mvy', label: 'Mv*y', unit: 'kNm', type: 'num' },
  { key: 'shear_head', label: 'SH', unit: 'Y/N', type: 'select', opts: ['N', 'Y'] },
  { key: 'u_ineff', label: 'u_ineff', unit: 'mm', type: 'num' },
  { key: 'ties_provided', label: 'Ties', unit: 'Y/N', type: 'select', opts: ['N', 'Y'] },
  { key: 'lig_size', label: 'Lig', unit: 'mm', type: 'num' },
  { key: 'lig_s', label: 's', unit: 'mm', type: 'num' },
  { key: 'fsyf', label: 'fsy.f', unit: 'MPa', type: 'num' },
];

const PASTE_KEYS = COLUMNS.map((c) => c.key);

const blankRow = (i) => ({
  colid: `C${i}`, fc: '50', scp: '0', Ds: '200', dom: '167', shape: 'rect',
  L: '600', W: '400', D: '500', position: 'I', Vstar: '500', Mvx: '25', Mvy: '15',
  shear_head: 'N', u_ineff: '0', ties_provided: 'N', lig_size: '12', lig_s: '150', fsyf: '500',
});

const EXAMPLE = [
  { colid: 'C1', fc: '50', scp: '0', Ds: '200', dom: '167', shape: 'rect', L: '600', W: '400', D: '500', position: 'I', Vstar: '500', Mvx: '25', Mvy: '15', shear_head: 'N', u_ineff: '0', ties_provided: 'N', lig_size: '12', lig_s: '150', fsyf: '500' },
  { colid: 'C2', fc: '50', scp: '0', Ds: '200', dom: '167', shape: 'rect', L: '500', W: '500', D: '500', position: 'I', Vstar: '620', Mvx: '40', Mvy: '0', shear_head: 'N', u_ineff: '0', ties_provided: 'N', lig_size: '12', lig_s: '150', fsyf: '500' },
  { colid: 'C3', fc: '40', scp: '0', Ds: '250', dom: '215', shape: 'rect', L: '800', W: '400', D: '500', position: 'E', Vstar: '750', Mvx: '80', Mvy: '20', shear_head: 'N', u_ineff: '0', ties_provided: 'Y', lig_size: '16', lig_s: '125', fsyf: '500' },
  { colid: 'C4', fc: '50', scp: '0', Ds: '200', dom: '167', shape: 'rect', L: '400', W: '400', D: '500', position: 'C', Vstar: '250', Mvx: '35', Mvy: '35', shear_head: 'N', u_ineff: '0', ties_provided: 'N', lig_size: '12', lig_s: '150', fsyf: '500' },
  { colid: 'C5', fc: '50', scp: '1.5', Ds: '200', dom: '167', shape: 'rect', L: '700', W: '350', D: '500', position: 'I', Vstar: '950', Mvx: '60', Mvy: '30', shear_head: 'N', u_ineff: '0', ties_provided: 'Y', lig_size: '12', lig_s: '100', fsyf: '500' },
  { colid: 'C6', fc: '50', scp: '0', Ds: '200', dom: '167', shape: 'circ', L: '0', W: '0', D: '500', position: 'I', Vstar: '480', Mvx: '0', Mvy: '0', shear_head: 'N', u_ineff: '0', ties_provided: 'N', lig_size: '12', lig_s: '150', fsyf: '500' },
];

function ColumnPunchingBulk() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '' });
  const [rows, setRows] = useState(() => [blankRow(1), blankRow(2), blankRow(3)]);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  const computed = useMemo(
    () => rows.map((row) => {
      try { return computeResults(row); }
      catch { return { valid: false }; }
    }),
    [rows],
  );

  const summary = useMemo(() => {
    let pass = 0, check = 0, fail = 0, invalid = 0, max = 0;
    computed.forEach((r) => {
      if (!r.valid || !Number.isFinite(r.governingUtil)) { invalid += 1; return; }
      max = Math.max(max, r.governingUtil);
      if (r.governingUtil > 1.0) fail += 1;
      else if (r.governingUtil > 0.85) check += 1;
      else pass += 1;
    });
    return { pass, check, fail, invalid, max, total: computed.length };
  }, [computed]);

  // ---- Row ops ----
  const updateCell = (rowIdx, key, value) =>
    setRows((prev) => prev.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r)));
  const addRow = () => setRows((prev) => [...prev, blankRow(prev.length + 1)]);
  const deleteRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => setRows([blankRow(1)]);
  const loadExample = () => setRows(EXAMPLE.map((r) => ({ ...r })));

  // ---- Paste parsing (tab- or whitespace-separated, multi-line) ----
  function parsePaste(text) {
    const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
    return lines.map((line, i) => {
      const cells = line.indexOf('\t') !== -1 ? line.split('\t') : line.trim().split(/\s+/);
      const row = blankRow(i + 1);
      PASTE_KEYS.forEach((k, ci) => {
        if (cells[ci] !== undefined && cells[ci] !== '') {
          let v = cells[ci].trim();
          if (['shape', 'position', 'shear_head', 'ties_provided'].includes(k)) {
            v = v.toUpperCase();
            if (k === 'shape') v = v.startsWith('C') ? 'circ' : 'rect';
            else v = v.charAt(0);
          }
          row[k] = v;
        }
      });
      return row;
    });
  }
  const applyPaste = (replace) => {
    const parsed = parsePaste(pasteText);
    if (parsed.length === 0) { setShowPaste(false); return; }
    setRows((prev) => (replace ? parsed : [...prev, ...parsed]));
    setPasteText('');
    setShowPaste(false);
  };

  // ---- Inline single-cell Excel paste (paste a block onto a cell) ----
  const handleCellPaste = (e, rowIdx) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (text.indexOf('\t') === -1 && text.indexOf('\n') === -1) return; // single value -> normal paste
    e.preventDefault();
    const parsed = parsePaste(text);
    setRows((prev) => {
      const next = [...prev];
      parsed.forEach((p, k) => {
        const target = rowIdx + k;
        if (target < next.length) next[target] = { ...next[target], ...p, colid: next[target].colid };
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
            <span>Concrete</span>
            <span className="sep">›</span>
            <span className="current">Column Punching — Bulk</span>
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
                <td>Concrete Column Punching — Bulk Check</td>
                <td className="ppb-label">By</td>
                <td>{meta.byname || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Reference</td>
                <td>AS 3600:2018 Clause 9.3</td>
                <td className="ppb-label">Date</td>
                <td>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Concrete Column Punching — Bulk</h1>
          <div className="subtitle">AS 3600:2018 Cl 9.3 · Multi-column schedule · Biaxial moment · Same engine as the single-column tool</div>
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

        {/* ---- Toolbar ---- */}
        <div className="bulk-toolbar no-print">
          <button className="btn-calc" type="button" onClick={addRow}>+ Add row</button>
          <button className="bulk-btn" type="button" onClick={() => setShowPaste(true)}>Paste from Excel</button>
          <button className="bulk-btn" type="button" onClick={loadExample}>Load example</button>
          <span className="bulk-spacer" />
          <button className="bulk-btn bulk-btn-danger" type="button" onClick={clearAll}>Clear all</button>
        </div>

        <p className="hint no-print" style={{ margin: '0 0 10px' }}>
          One row = one column. Units: mm, kN, kNm, MPa. Set Shape = circ to use D as the circular diameter (L, W ignored).
          Negative V* / moments are taken by magnitude. Paste order matches the column order below.
        </p>

        {/* ---- Editable grid (screen) ---- */}
        <div className="bulk-grid-wrap no-print">
          <table className="bulk-grid">
            <thead>
              <tr>
                <th className="bulk-th-idx" />
                {COLUMNS.map((c) => (
                  <th key={c.key} style={c.w ? { minWidth: c.w } : undefined}>
                    {c.label}
                    {c.unit ? <span className="bulk-unit">{c.unit}</span> : null}
                  </th>
                ))}
                <th className="bulk-th-res">φVu (kN)</th>
                <th className="bulk-th-res">Util</th>
                <th className="bulk-th-res">Status</th>
                <th className="bulk-th-idx" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const res = computed[ri];
                const cls = res.valid ? statusClass(res.governingUtil) : '';
                return (
                  <tr key={ri}>
                    <td className="bulk-idx">{ri + 1}</td>
                    {COLUMNS.map((c) => (
                      <td key={c.key}>
                        {c.type === 'select' ? (
                          <select value={row[c.key]} onChange={(e) => updateCell(ri, c.key, e.target.value)}>
                            {c.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={c.type === 'num' ? 'number' : 'text'}
                            value={row[c.key]}
                            onChange={(e) => updateCell(ri, c.key, e.target.value)}
                            onPaste={(e) => handleCellPaste(e, ri)}
                          />
                        )}
                      </td>
                    ))}
                    <td className="bulk-res mono">{res.valid ? fmt(res.governingPhiVu, 1) : '—'}</td>
                    <td className="bulk-res mono">{res.valid ? fmt(res.governingUtil, 2) : '—'}</td>
                    <td className={`bulk-status ${cls}`}>{res.valid ? statusLabel(res.governingUtil) : 'INVALID'}</td>
                    <td className="bulk-del">
                      <button type="button" onClick={() => deleteRow(ri)} aria-label="Delete row">×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---- Summary band ---- */}
        <div className="bulk-summary">
          <div className="bulk-sum-card pass">
            <span className="bulk-sum-n">{summary.pass}</span>
            <span className="bulk-sum-l">Pass (≤0.85)</span>
          </div>
          <div className="bulk-sum-card warn">
            <span className="bulk-sum-n">{summary.check}</span>
            <span className="bulk-sum-l">Check (0.85–1.00)</span>
          </div>
          <div className="bulk-sum-card fail">
            <span className="bulk-sum-n">{summary.fail}</span>
            <span className="bulk-sum-l">Fail (&gt;1.00)</span>
          </div>
          <div className="bulk-sum-card">
            <span className="bulk-sum-n">{fmt(summary.max, 2)}</span>
            <span className="bulk-sum-l">Max utilisation</span>
          </div>
        </div>

        {/* ---- Results table (also the print view) ---- */}
        <section style={{ marginTop: 18 }}>
          <div className="col-heading">
            <h2 className="label">Results — governing per column</h2>
            <p className="hint">Status basis: ties = Y → φVu (provided ties); ties = N &amp; M&gt;0 → φVu (no ties); M = 0 → φVuo.</p>
          </div>
          <table className="calc-table">
            <thead>
              <tr>
                <th>Col</th>
                <th>Config</th>
                <th>u (mm)</th>
                <th>φVuo (kN)</th>
                <th>Basis</th>
                <th>Dir</th>
                <th>φVu (kN)</th>
                <th>V* (kN)</th>
                <th>Util</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const res = computed[ri];
                if (!res.valid) {
                  return (
                    <tr key={ri}>
                      <td>{row.colid || ri + 1}</td>
                      <td colSpan={8} className="hint">Invalid / incomplete input</td>
                      <td className="bulk-status">INVALID</td>
                    </tr>
                  );
                }
                return (
                  <tr key={ri}>
                    <td><strong>{row.colid || ri + 1}</strong></td>
                    <td>{res.configText}</td>
                    <td className="mono">{fmt(res.u, 0)}</td>
                    <td className="mono">{fmt(res.phiVuo, 1)}</td>
                    <td>{res.basis}</td>
                    <td>{res.governingDir}</td>
                    <td className="mono">{fmt(res.governingPhiVu, 1)}</td>
                    <td className="mono">{fmt(res.Vstar, 0)}</td>
                    <td className="mono">{fmt(res.governingUtil, 2)}</td>
                    <td className={`bulk-status ${statusClass(res.governingUtil)}`}>{statusLabel(res.governingUtil)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* ---- Theory toggle ---- */}
        <section className="no-print" style={{ marginTop: 18 }}>
          <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>
            {theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions
          </button>
          {theoryOpen ? (
            <div className="bulk-theory">
              <p>Each row is computed by the identical engine used in the single-column Column Punching tool, so a row reproduces the single tool exactly for the same inputs. Per row:</p>
              <p><strong>φVuo</strong> — Cl 9.3.3, with optional shear-head branch (Cl 9.3.3(b)). <strong>Biaxial φVu</strong> — Cl 9.3.4(a), eccentricity taken about both axes (Mv*x on aL, Mv*y on aW), governing (smaller) direction reported. <strong>Min ties</strong> Cl 9.3.4(b); <strong>provided fitments</strong> Cl 9.3.4(d) capped by φVu,max = 3·φVu,min·√(x/y). Edge/corner perimeter follows the single tool's simplified treatment. u_ineff subtracts ineffective perimeter for openings.</p>
              <p className="hint">Indicative only — verify independently. See the single-column tool for the full per-clause working of any one column.</p>
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

      {/* ---- Paste modal ---- */}
      {showPaste ? (
        <div className="bulk-modal-overlay" onClick={() => setShowPaste(false)}>
          <div className="bulk-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="label">Paste from Excel</h3>
            <p className="hint">
              Copy rows from Excel and paste below. Tab- or space-separated. Column order:
            </p>
            <p className="bulk-paste-order mono">{PASTE_KEYS.join(' · ')}</p>
            <textarea
              className="bulk-paste-area"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={'C1\t50\t0\t200\t167\trect\t600\t400\t500\tI\t500\t25\t15\tN\t0\tN\t12\t150\t500'}
            />
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

export default ColumnPunchingBulk;
