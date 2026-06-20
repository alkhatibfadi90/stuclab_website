'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';

// ============================================================
// SEISMIC LATERAL — AS 1170.4:2024 (Equivalent Static Method)
// Tables encoded from the Standard:
//   Table 3.1 — probability factor kp
//   Table 3.2 — hazard design factor Z (selected locations)
//   Table 3.3 — minimum kpZ
//   Table 6.4 — spectral shape factor Ch(T) (closed-form equations)
// Engine hand-verified.
// ============================================================

const num = (v) => parseFloat(v) || 0;

// --- Table 3.1: probability factor kp ---
const KP_TABLE = [
  { label: '1/2500', P: 2500, kp: 1.8 },
  { label: '1/2000', P: 2000, kp: 1.7 },
  { label: '1/1500', P: 1500, kp: 1.5 },
  { label: '1/1000', P: 1000, kp: 1.3 },
  { label: '1/800', P: 800, kp: 1.25 },
  { label: '1/500', P: 500, kp: 1.0 },
  { label: '1/250', P: 250, kp: 0.75 },
  { label: '1/200', P: 200, kp: 0.7 },
  { label: '1/100', P: 100, kp: 0.5 },
];

// --- Table 3.3: minimum kpZ (by annual probability denominator) ---
const MIN_KPZ = { 2500: 0.15, 2000: 0.14, 1500: 0.12, 1000: 0.10, 500: 0.08 };

// --- Table 3.2: hazard design factor Z (selected locations, AS 1170.4:2024) ---
const Z_TABLE = {
  Adelaide: 0.10, Bendigo: 0.09, Brisbane: 0.08, Broome: 0.12, Bundaberg: 0.11,
  Canberra: 0.08, Carnarvon: 0.09, Dampier: 0.12, Darwin: 0.09, Esperance: 0.09,
  Geelong: 0.10, Geraldton: 0.09, Gladstone: 0.09, Gosford: 0.09, Hobart: 0.08,
  Karratha: 0.12, 'Latrobe Valley': 0.10, Melbourne: 0.08, Newcastle: 0.11,
  Perth: 0.09, 'Port Augusta': 0.11, 'Port Hedland': 0.12, 'Port Lincoln': 0.10,
  Sydney: 0.08, 'Tennant Creek': 0.13, 'Wagga Wagga': 0.09, Whyalla: 0.09,
  Wollongong: 0.09, Wyndham: 0.09,
  // Meckering region (high)
  Cunderdin: 0.22, Meckering: 0.20, Dowerin: 0.20, Goomalling: 0.16, Wongan: 0.15,
};

// Typical IL → annual probability of exceedance (common pairing; user can override)
const IL_TO_P = { 1: 500, 2: 500, 3: 1000, 4: 1500 };

const KT_OPTS = [
  { v: 0.11, label: '0.11 — Steel moment frame' },
  { v: 0.075, label: '0.075 — Concrete moment frame' },
  { v: 0.06, label: '0.06 — Eccentric braced / shear wall' },
  { v: 0.05, label: '0.05 — Other (concentric braced, etc.)' },
];

// --- Table 6.4: spectral shape factor Ch(T) (closed-form, equivalent static) ---
function getCh(T, soil) {
  const E = {
    Ae: { a: 0.8, b: 15.5, mid: 0.704, cap: 2.35, hi: 1.056 },
    Be: { a: 1.0, b: 19.4, mid: 0.88, cap: 2.94, hi: 1.32 },
    Ce: { a: 1.3, b: 23.8, mid: 1.25, cap: 3.68, hi: 1.874 },
    De: { a: 1.1, b: 25.8, mid: 1.98, cap: 3.68, hi: 2.97 },
    Ee: { a: 1.1, b: 25.8, mid: 3.08, cap: 3.68, hi: 4.62 },
  }[soil];
  if (!E) return 0;
  if (T <= 0.1) return E.a + E.b * T;
  if (T <= 1.5) return Math.min(E.mid / T, E.cap);
  return E.hi / (T * T);
}

const fmt = (v, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

// ---- Level schema (Stage 1) ----
const newLevel = (label, rl) => ({ label, rl: String(rl), area: '400', sdl: '6.0', psi_c: '0.3', plant: false });

const DEFAULT_LEVELS = [
  newLevel('Roof', 17.5),
  newLevel('L4', 14.0),
  newLevel('L3', 10.5),
  newLevel('L2', 7.0),
  newLevel('L1', 3.5),
];

function SeismicLateral() {
  const [meta, setMeta] = useState({ project: '', jobno: '', byname: '' });
  const [levels, setLevels] = useState(DEFAULT_LEVELS);

  // Stage 2 seismic params
  const [loc, setLoc] = useState('Perth');
  const [zCustom, setZCustom] = useState('');
  const [kpMode, setKpMode] = useState('IL'); // IL | P | custom
  const [il, setIl] = useState('2');
  const [pSel, setPSel] = useState('500');
  const [kpCustom, setKpCustom] = useState('1.0');
  const [soil, setSoil] = useState('Be');
  const [sp, setSp] = useState('0.77');
  const [mu, setMu] = useState('2');
  const [kt, setKt] = useState('0.06');
  const [t1in, setT1in] = useState('');
  const [theoryOpen, setTheoryOpen] = useState(false);

  const today = useMemo(
    () => new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
    [],
  );

  // ---- Resolve Z ----
  const Z = useMemo(() => (loc === 'custom' ? num(zCustom) : (Z_TABLE[loc] || 0)), [loc, zCustom]);

  // ---- Resolve kp and the governing annual probability ----
  const { kp, P_denom } = useMemo(() => {
    if (kpMode === 'custom') return { kp: num(kpCustom), P_denom: 500 };
    if (kpMode === 'P') {
      const row = KP_TABLE.find((r) => String(r.P) === pSel);
      return { kp: row ? row.kp : 1.0, P_denom: row ? row.P : 500 };
    }
    // IL
    const Pd = IL_TO_P[il] || 500;
    const row = KP_TABLE.find((r) => r.P === Pd);
    return { kp: row ? row.kp : 1.0, P_denom: Pd };
  }, [kpMode, kpCustom, pSel, il]);

  // ---- Stage 1: seismic weight ----
  const stage1 = useMemo(() => {
    const rows = levels.map((l) => {
      // Seismic weight at level = (SDL · area)·... plant adds nothing extra here beyond SDL,
      // ψc applies to the live-load portion; here SDL is taken as the seismic dead+SDL line load.
      const W = num(l.sdl) * num(l.area);
      return { label: l.label, rl: num(l.rl), W, plant: l.plant };
    });
    const totalW = rows.reduce((s, r) => s + r.W, 0);
    const rls = rows.map((r) => r.rl);
    const baseRL = rls.length ? Math.min(...rls) : 0;
    const hn = rls.length ? Math.max(...rls) - baseRL : 0;
    return { rows, totalW, baseRL, hn };
  }, [levels]);

  // ---- Stage 2: base shear + distribution ----
  const stage2 = useMemo(() => {
    const W = stage1.totalW;
    const hn = stage1.hn;
    let T1 = num(t1in) > 0 ? num(t1in) : 1.25 * num(kt) * Math.pow(hn, 0.75);
    const Ch = getCh(T1, soil);
    const minKpZ = MIN_KPZ[P_denom] ?? 0;
    const kpZ_raw = kp * Z;
    const kpZ = Math.max(kpZ_raw, minKpZ);
    const minGoverns = kpZ > kpZ_raw + 1e-9;
    const Cd = (kpZ * Ch * num(sp)) / (num(mu) || 1);
    const V = Cd * W;
    const Vs = 0.30 * V;
    let k;
    if (T1 <= 0.5) k = 1;
    else if (T1 >= 2.5) k = 2;
    else k = 1 + (T1 - 0.5) / 2.0;

    // Distribution
    const wh = stage1.rows.map((r) => ({ ...r, hi: r.rl - stage1.baseRL, whk: r.W * Math.pow(Math.max(r.rl - stage1.baseRL, 0), k) }));
    const sumWhk = wh.reduce((s, r) => s + r.whk, 0) || 1;
    const forces = wh.map((r) => ({ ...r, Fi: (r.whk / sumWhk) * V, Fis: (r.whk / sumWhk) * Vs }));
    // sort top→bottom for cumulative shear & overturning moment
    const sorted = [...forces].sort((a, b) => b.hi - a.hi);
    let cumF = 0, cumFs = 0;
    sorted.forEach((r) => { cumF += r.Fi; cumFs += r.Fis; r.cumShear = cumF; r.cumShearS = cumFs; });
    sorted.forEach((row) => {
      let M = 0, Ms = 0;
      sorted.forEach((j) => { if (j.hi > row.hi) { M += j.Fi * (j.hi - row.hi); Ms += j.Fis * (j.hi - row.hi); } });
      row.cumMoment = M; row.cumMomentS = Ms;
    });
    return { T1, Ch, kpZ_raw, kpZ, minKpZ, minGoverns, Cd, V, Vs, k, rows: sorted };
  }, [stage1, kp, Z, P_denom, soil, sp, mu, kt, t1in]);

  // ---- Level ops ----
  const updateLevel = (i, key, value) => setLevels((p) => p.map((l, j) => (j === i ? { ...l, [key]: value } : l)));
  const addLevel = () => setLevels((p) => [...p, newLevel(`L${p.length}`, 0)]);
  const deleteLevel = (i) => setLevels((p) => p.filter((_, j) => j !== i));
  const clearLevels = () => setLevels([newLevel('Roof', 0)]);

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
            <span className="current">Seismic Lateral</span>
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
                <td className="ppb-label">Calculation</td><td>Seismic Lateral — Equivalent Static</td>
                <td className="ppb-label">By</td><td>{meta.byname || '—'}</td>
              </tr>
              <tr>
                <td className="ppb-label">Reference</td><td>AS 1170.4:2024</td>
                <td className="ppb-label">Date</td><td>{today}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="tool-header">
          <h1 className="title">Seismic Lateral Loads</h1>
          <div className="subtitle">AS 1170.4:2024 · Equivalent static method · Seismic weight → base shear → vertical distribution &amp; torsion</div>
        </div>

        <div className="bulk-meta no-print">
          <div className="input-field"><label>Project name</label><input type="text" value={meta.project} onChange={(e) => setMeta({ ...meta, project: e.target.value })} placeholder="e.g. 123 Smith St Tower" /></div>
          <div className="input-field"><label>Job No.</label><input type="text" value={meta.jobno} onChange={(e) => setMeta({ ...meta, jobno: e.target.value })} placeholder="e.g. 24-118" /></div>
          <div className="input-field"><label>By</label><input type="text" value={meta.byname} onChange={(e) => setMeta({ ...meta, byname: e.target.value })} placeholder="Initials" /></div>
        </div>

        {/* ===== STAGE 1 — SEISMIC WEIGHT ===== */}
        <div className="seismic-stage">Stage 1 — Building &amp; seismic weight (Cl 6.2.2)</div>
        <div className="bulk-toolbar no-print">
          <button className="btn-calc" type="button" onClick={addLevel}>+ Add level</button>
          <span className="bulk-spacer" />
          <button className="bulk-btn bulk-btn-danger" type="button" onClick={clearLevels}>Clear levels</button>
        </div>
        <p className="hint no-print" style={{ margin: '0 0 10px' }}>
          One row = one level. RL in metres (base = lowest RL). Seismic weight per level = SDL × area. ψc is the
          live-load combination factor for earthquake mass; plant flag is informational.
        </p>
        <div className="bulk-grid-wrap no-print">
          <table className="bulk-grid">
            <thead>
              <tr>
                <th className="bulk-th-idx" />
                <th style={{ minWidth: 70 }}>Level</th>
                <th>RL<span className="bulk-unit">m</span></th>
                <th>Area<span className="bulk-unit">m²</span></th>
                <th>SDL<span className="bulk-unit">kPa</span></th>
                <th>ψc</th>
                <th>Plant</th>
                <th className="bulk-th-res">W<span className="bulk-unit">kN</span></th>
                <th className="bulk-th-idx" />
              </tr>
            </thead>
            <tbody>
              {levels.map((l, ri) => {
                const W = num(l.sdl) * num(l.area);
                return (
                  <tr key={ri}>
                    <td className="bulk-idx">{ri + 1}</td>
                    <td><input type="text" value={l.label} onChange={(e) => updateLevel(ri, 'label', e.target.value)} /></td>
                    <td><input type="number" value={l.rl} onChange={(e) => updateLevel(ri, 'rl', e.target.value)} /></td>
                    <td><input type="number" value={l.area} onChange={(e) => updateLevel(ri, 'area', e.target.value)} /></td>
                    <td><input type="number" value={l.sdl} onChange={(e) => updateLevel(ri, 'sdl', e.target.value)} /></td>
                    <td><input type="number" value={l.psi_c} onChange={(e) => updateLevel(ri, 'psi_c', e.target.value)} /></td>
                    <td className="bulk-check-cell"><input type="checkbox" checked={!!l.plant} onChange={(e) => updateLevel(ri, 'plant', e.target.checked)} /></td>
                    <td className="bulk-res mono">{fmt(W, 1)}</td>
                    <td className="bulk-del"><button type="button" onClick={() => deleteLevel(ri)} aria-label="Delete level">×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="bulk-summary" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(stage1.totalW, 0)}</span><span className="bulk-sum-l">Total seismic weight W (kN)</span></div>
          <div className="bulk-sum-card"><span className="bulk-sum-n">{fmt(stage1.hn, 2)}</span><span className="bulk-sum-l">Building height hn (m)</span></div>
        </div>

        {/* ===== STAGE 2 — BASE SHEAR ===== */}
        <div className="seismic-stage">Stage 2 — Base shear &amp; vertical distribution (Cl 6.2 / 6.3)</div>
        <div className="seismic-params no-print">
          <div className="input-field">
            <label>Location (Z, Table 3.2)</label>
            <select value={loc} onChange={(e) => setLoc(e.target.value)}>
              {Object.keys(Z_TABLE).map((c) => <option key={c} value={c}>{c} (Z={Z_TABLE[c].toFixed(2)})</option>)}
              <option value="custom">Custom…</option>
            </select>
          </div>
          {loc === 'custom' ? (
            <div className="input-field"><label>Custom Z</label><input type="number" step="0.01" value={zCustom} onChange={(e) => setZCustom(e.target.value)} /></div>
          ) : null}

          <div className="input-field">
            <label>kp source</label>
            <select value={kpMode} onChange={(e) => setKpMode(e.target.value)}>
              <option value="IL">Importance level</option>
              <option value="P">Annual probability</option>
              <option value="custom">Custom kp</option>
            </select>
          </div>
          {kpMode === 'IL' ? (
            <div className="input-field">
              <label>Importance level</label>
              <select value={il} onChange={(e) => setIl(e.target.value)}>
                <option value="1">IL1 (1/500)</option>
                <option value="2">IL2 (1/500)</option>
                <option value="3">IL3 (1/1000)</option>
                <option value="4">IL4 (1/1500)</option>
              </select>
            </div>
          ) : null}
          {kpMode === 'P' ? (
            <div className="input-field">
              <label>Annual probability (Table 3.1)</label>
              <select value={pSel} onChange={(e) => setPSel(e.target.value)}>
                {KP_TABLE.map((r) => <option key={r.P} value={String(r.P)}>{r.label} (kp={r.kp})</option>)}
              </select>
            </div>
          ) : null}
          {kpMode === 'custom' ? (
            <div className="input-field"><label>kp</label><input type="number" step="0.05" value={kpCustom} onChange={(e) => setKpCustom(e.target.value)} /></div>
          ) : null}

          <div className="input-field">
            <label>Sub-soil class (Table 6.4)</label>
            <select value={soil} onChange={(e) => setSoil(e.target.value)}>
              <option value="Ae">Ae — Strong rock</option>
              <option value="Be">Be — Rock</option>
              <option value="Ce">Ce — Shallow soil</option>
              <option value="De">De — Deep/soft soil</option>
              <option value="Ee">Ee — Very soft soil</option>
            </select>
          </div>
          <div className="input-field"><label>Sp (Cl 6.5)</label><input type="number" step="0.01" value={sp} onChange={(e) => setSp(e.target.value)} /></div>
          <div className="input-field"><label>μ (Cl 6.5)</label><input type="number" step="0.1" value={mu} onChange={(e) => setMu(e.target.value)} /></div>
          <div className="input-field">
            <label>kt (frame type, Cl 6.2.3)</label>
            <select value={kt} onChange={(e) => setKt(e.target.value)}>
              {KT_OPTS.map((o) => <option key={o.v} value={String(o.v)}>{o.label}</option>)}
            </select>
          </div>
          <div className="input-field"><label>T1 override (s) — blank = auto</label><input type="number" step="0.01" value={t1in} onChange={(e) => setT1in(e.target.value)} placeholder="auto" /></div>
        </div>

        <div className="seismic-results-grid">
          <div><span className="seismic-rk">T1</span><span className="seismic-rv">{fmt(stage2.T1, 3)} s</span></div>
          <div><span className="seismic-rk">Ch(T1)</span><span className="seismic-rv">{fmt(stage2.Ch, 3)}</span></div>
          <div><span className="seismic-rk">kp·Z</span><span className="seismic-rv">{fmt(stage2.kpZ, 3)}</span></div>
          <div><span className="seismic-rk">Cd = kpZ·Ch·Sp/μ</span><span className="seismic-rv">{fmt(stage2.Cd, 4)}</span></div>
          <div><span className="seismic-rk">k (distribution)</span><span className="seismic-rv">{fmt(stage2.k, 3)}</span></div>
          <div className="seismic-rv-strong"><span className="seismic-rk">Base shear V</span><span className="seismic-rv">{fmt(stage2.V, 0)} kN</span></div>
          <div><span className="seismic-rk">Vs (30%)</span><span className="seismic-rv">{fmt(stage2.Vs, 0)} kN</span></div>
        </div>
        {stage2.minGoverns ? (
          <p className="seismic-flag">Minimum kp·Z governs: raw kp·Z = {fmt(stage2.kpZ_raw, 3)} below the Table 3.3 minimum {fmt(stage2.minKpZ, 2)} for this annual probability — the minimum has been applied.</p>
        ) : null}

        <section style={{ marginTop: 14 }}>
          <div className="col-heading">
            <h2 className="label">Vertical distribution — primary (100%) &amp; secondary (30%)</h2>
            <p className="hint">Fx = (wi·hi^k / Σ wi·hi^k)·V. Cumulative storey shear and overturning moment, top → bottom.</p>
          </div>
          <table className="calc-table">
            <thead>
              <tr>
                <th>Level</th><th>hi (m)</th><th>wi (kN)</th><th>wi·hi^k</th>
                <th>Fx (kN)</th><th>ΣV (kN)</th><th>OTM (kNm)</th>
                <th>Fx,30%</th><th>ΣV,30%</th>
              </tr>
            </thead>
            <tbody>
              {stage2.rows.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.label}</strong></td>
                  <td className="mono">{fmt(r.hi, 2)}</td>
                  <td className="mono">{fmt(r.W, 1)}</td>
                  <td className="mono">{fmt(r.whk, 0)}</td>
                  <td className="mono">{fmt(r.Fi, 1)}</td>
                  <td className="mono">{fmt(r.cumShear, 1)}</td>
                  <td className="mono">{fmt(r.cumMoment, 0)}</td>
                  <td className="mono">{fmt(r.Fis, 1)}</td>
                  <td className="mono">{fmt(r.cumShearS, 1)}</td>
                </tr>
              ))}
              <tr className="summary-row">
                <td colSpan={4}><strong>BASE</strong></td>
                <td className="mono"><strong>{fmt(stage2.V, 1)}</strong></td>
                <td className="mono"><strong>{fmt(stage2.V, 1)}</strong></td>
                <td className="mono">—</td>
                <td className="mono"><strong>{fmt(stage2.Vs, 1)}</strong></td>
                <td className="mono"><strong>{fmt(stage2.Vs, 1)}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ===== STAGE 3 — ACCIDENTAL TORSION ===== */}
        <div className="seismic-stage">Stage 3 — Accidental torsion (Cl 6.6)</div>
        <p className="hint" style={{ margin: '0 0 10px' }}>
          Accidental eccentricity = ±0.1·b applied to the storey force. Enter the plan dimension b for each direction;
          torsional moment per level T = Fx · 0.1·b.
        </p>
        <TorsionBlock rows={stage2.rows} />

        {/* ---- Theory ---- */}
        <section className="no-print" style={{ marginTop: 18 }}>
          <button className="bulk-btn" type="button" onClick={() => setTheoryOpen((o) => !o)}>
            {theoryOpen ? 'Hide' : 'Show'} method &amp; assumptions
          </button>
          {theoryOpen ? (
            <div className="bulk-theory">
              <p><strong>Spectral shape Ch(T)</strong> — AS 1170.4:2024 Table 6.4 closed-form equations per sub-soil class (equivalent static values, not the bracketed modal values).</p>
              <p><strong>Period</strong> T1 = 1.25·kt·hn^0.75 (Cl 6.2.3) unless overridden. <strong>Cd</strong> = kp·Z·Ch(T1)·Sp/μ (Cl 6.5), with kp from Table 3.1 and the minimum kp·Z floor from Table 3.3 enforced. <strong>Base shear</strong> V = Cd·W; secondary direction Vs = 0.30·V. <strong>Distribution</strong> Fx = (wi·hi^k/Σ)·V with k = 1 (T1≤0.5), 2 (T1≥2.5), linearly interpolated between (Cl 6.3).</p>
              <p className="hint">Z values encoded from Table 3.2 for selected locations — confirm against the current Standard / NCC for your site. Indicative only; verify independently.</p>
            </div>
          ) : null}
        </section>

        <div className="print-footer">StrucLab · LabKit · struclab.com.au · Generated {today}</div>
        <div className="workspace-footer">
          <span>StrucLab · LabKit · struclab.com.au</span>
          <span className="mono">Generated {today}</span>
        </div>
      </div>
    </div>
  );
}

// ---- Stage 3 torsion sub-component ----
function TorsionBlock({ rows }) {
  const [bMajor, setBMajor] = useState('30');
  const [bMinor, setBMinor] = useState('20');
  const e_major = 0.1 * num(bMajor);
  const e_minor = 0.1 * num(bMinor);
  return (
    <>
      <div className="seismic-params no-print" style={{ gridTemplateColumns: 'repeat(2, minmax(160px,1fr))' }}>
        <div className="input-field"><label>Plan dim b — major dir (m)</label><input type="number" value={bMajor} onChange={(e) => setBMajor(e.target.value)} /></div>
        <div className="input-field"><label>Plan dim b — minor dir (m)</label><input type="number" value={bMinor} onChange={(e) => setBMinor(e.target.value)} /></div>
      </div>
      <table className="calc-table">
        <thead>
          <tr><th>Level</th><th>Fx (kN)</th><th>e major = 0.1b (m)</th><th>T major (kNm)</th><th>e minor (m)</th><th>T minor (kNm)</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><strong>{r.label}</strong></td>
              <td className="mono">{fmt(r.Fi, 1)}</td>
              <td className="mono">{fmt(e_major, 2)}</td>
              <td className="mono">{fmt(r.Fi * e_major, 1)}</td>
              <td className="mono">{fmt(e_minor, 2)}</td>
              <td className="mono">{fmt(r.Fi * e_minor, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}


export default SeismicLateral;
