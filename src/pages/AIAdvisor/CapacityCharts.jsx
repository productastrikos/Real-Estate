/* ── Per-site infrastructure chart data ───────────────────────────── */
const DEP_FLOW = {
  tacoma:  ["Grid Tie-In", "Main Substation", "Transformer Bank", "Production Plants", "Cooling Systems", "Logistics Dispatch"],
  everett: ["Port Utility Feed", "Substation", "Transformer", "Aerospace Plant", "Cooling Tower", "Rail Logistics"],
  spokane: ["Power Corridor", "Transformer Bank", "Manufacturing Core", "Utility Systems", "Expansion Zone"],
  yakima:  ["Solar Field", "Battery Storage", "Cooling Infrastructure", "Production Zone", "Water Recycling"],
};
const DEP_SUB = {
  tacoma:  ["PSE 230 kV","34.5 kV switchyard","4.16 kV step-down","Assembly blocks A–B","Chiller network","BNSF + truck dock"],
  everett: ["Marine shore power","132 kV yard","MV distribution","180k sqft hall","Industrial chillers","Port rail spur"],
  spokane: ["BPA 230 kV tie","34.5 kV step-down","Manufacturing HV bus","HVAC + process","Phase 3 land bank"],
  yakima:  ["4.2 MW PV array","Grid-scale BESS","3× Atlas Copco","Assembly 1–4","RO + distribution"],
};

const SEQ_DATA = {
  tacoma:  [
    { label: "Freight Routing",         mo: "1–3",   col: "#eab308" },
    { label: "Warehouse Build",         mo: "3–8",   col: "#f97316" },
    { label: "Production Zone",         mo: "6–14",  col: "#3b82f6" },
    { label: "Dispatch Integration",    mo: "12–18", col: "#22c55e" },
  ],
  everett: [
    { label: "Port Access Works",       mo: "1–4",   col: "#eab308" },
    { label: "Utility Trenching",       mo: "3–7",   col: "#f97316" },
    { label: "Aerospace Hall",          mo: "5–15",  col: "#3b82f6" },
    { label: "Rail Integration",        mo: "14–20", col: "#22c55e" },
  ],
  spokane: [
    { label: "Grid Expansion",          mo: "1–3",   col: "#eab308" },
    { label: "Foundation Phase",        mo: "2–7",   col: "#f97316" },
    { label: "Manufacturing Core",      mo: "6–14",  col: "#3b82f6" },
    { label: "Future Expansion Prep",   mo: "12–18", col: "#22c55e" },
  ],
  yakima:  [
    { label: "Solar Infrastructure",    mo: "1–4",   col: "#eab308" },
    { label: "Cooling Install",         mo: "3–8",   col: "#f97316" },
    { label: "Water Recycling System",  mo: "5–10",  col: "#3b82f6" },
    { label: "Production Zone",         mo: "8–16",  col: "#22c55e" },
  ],
};

const COORD_DATA = {
  tacoma:  [
    { util: "Power",     label: "Substation → Plants",        overlap: false, col: "#f59e0b" },
    { util: "Water",     label: "City main → Treatment",      overlap: false, col: "#3b82f6" },
    { util: "Stormwater",label: "Site → Retention basin",     overlap: true,  col: "#22d3ee" },
    { util: "Logistics", label: "Freight corridor crossing",  overlap: true,  col: "#a855f7" },
  ],
  everett: [
    { util: "Power",     label: "Shore → Substation",         overlap: false, col: "#f59e0b" },
    { util: "Water",     label: "Municipal → Cooling",        overlap: false, col: "#3b82f6" },
    { util: "Coastal",   label: "Setback conflict zone",      overlap: true,  col: "#ef4444" },
    { util: "Rail",      label: "Rail crosses utility trench",overlap: true,  col: "#a855f7" },
  ],
  spokane: [
    { util: "Power",     label: "BPA corridor → Site",        overlap: false, col: "#f59e0b" },
    { util: "Water",     label: "City supply → Treatment",    overlap: false, col: "#3b82f6" },
    { util: "Gas",       label: "NW Pipeline parallel run",   overlap: false, col: "#22d3ee" },
    { util: "Expansion", label: "Future trench reserved",     overlap: false, col: "#22c55e" },
  ],
  yakima:  [
    { util: "Solar DC",  label: "Array → BESS combiner",      overlap: false, col: "#f59e0b" },
    { util: "Water",     label: "Irrigation → RO plant",      overlap: true,  col: "#3b82f6" },
    { util: "Cooling",   label: "BESS heat → Cooling loop",   overlap: false, col: "#22d3ee" },
    { util: "Process",   label: "Water reuse crosses DC run", overlap: true,  col: "#ef4444" },
  ],
};

const ALLOC_DATA = {
  tacoma:  { label: "Logistics Capacity",    segs: [{ name: "Freight Hub", val: 40, col: "#f59e0b" }, { name: "Warehouse", val: 30, col: "#3b82f6" }, { name: "Production", val: 20, col: "#22d3ee" }, { name: "Utilities", val: 10, col: "#8b5cf6" }] },
  everett: { label: "Power Capacity",        segs: [{ name: "Aerospace Plant", val: 45, col: "#f59e0b" }, { name: "Logistics", val: 25, col: "#3b82f6" }, { name: "Cooling", val: 20, col: "#22d3ee" }, { name: "Expansion", val: 10, col: "#8b5cf6" }] },
  spokane: { label: "Expansion Allocation",  segs: [{ name: "Manufacturing", val: 35, col: "#f59e0b" }, { name: "Energy Grid", val: 30, col: "#3b82f6" }, { name: "Future Expansion", val: 25, col: "#22d3ee" }, { name: "Utilities", val: 10, col: "#8b5cf6" }] },
  yakima:  { label: "Utility Allocation",    segs: [{ name: "Solar", val: 40, col: "#f59e0b" }, { name: "Cooling", val: 30, col: "#3b82f6" }, { name: "Water Recycling", val: 20, col: "#22d3ee" }, { name: "Production", val: 10, col: "#8b5cf6" }] },
};

const CARD = { text: "#cce8ff", muted: "#5a8aaa", faint: "#3a6080", border: "rgba(255,255,255,0.08)" };

/* ── Chart 1: Infrastructure Dependency Flow ─────────────────────── */
function DependencyFlow({ siteId }) {
  const steps = DEP_FLOW[siteId] || DEP_FLOW.tacoma;
  const subs  = DEP_SUB[siteId]  || DEP_SUB.tacoma;
  const cols  = ["#f59e0b","#f97316","#38bdf8","#22d3ee","#22c55e","#a855f7"];
  return (
    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%",
            background: `${cols[i % cols.length]}12`,
            border: `1px solid ${cols[i % cols.length]}30`,
            borderRadius: 7, padding: "6px 10px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cols[i % cols.length], flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: CARD.text, fontFamily: "monospace", fontWeight: 600 }}>{step}</div>
              <div style={{ fontSize: 8, color: CARD.muted, fontFamily: "monospace" }}>{subs[i] || ""}</div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 1, height: 10, background: CARD.faint, margin: "1px 0" }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Chart 2: Construction Sequencing Flow ───────────────────────── */
function SequencingFlow({ siteId }) {
  const steps = SEQ_DATA[siteId] || SEQ_DATA.tacoma;
  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${s.col}20`,
            border: `1.5px solid ${s.col}`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 9, color: s.col, fontFamily: "monospace",
            fontWeight: 700, flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ flex: 1, background: `${s.col}0a`, border: `1px solid ${s.col}20`,
            borderRadius: 6, padding: "5px 10px", display: "flex", alignItems: "center",
            justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: CARD.text, fontFamily: "monospace", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 9, color: CARD.muted, fontFamily: "monospace" }}>Mo {s.mo}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 4 }}>
        <div style={{ height: 3, borderRadius: 2, overflow: "hidden", display: "flex" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, background: s.col, opacity: 0.7,
              borderRadius: i === 0 ? "2px 0 0 2px" : i === steps.length - 1 ? "0 2px 2px 0" : 0 }} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 4 }}>
          {steps.map((s, i) => (
            <span key={i} style={{ flex: 1, fontSize: 7, color: CARD.faint, fontFamily: "monospace", textAlign: "center" }}>
              {s.label.split(" ")[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Chart 3: Utility Coordination Layout ────────────────────────── */
function UtilityCoordination({ siteId }) {
  const items = COORD_DATA[siteId] || COORD_DATA.tacoma;
  const conflicts = items.filter(x => x.overlap).length;
  return (
    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8,
          background: item.overlap ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${item.overlap ? "rgba(239,68,68,0.25)" : CARD.border}`,
          borderRadius: 6, padding: "7px 10px" }}>
          <div style={{ width: 4, height: 28, background: item.col, borderRadius: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, color: item.col, fontFamily: "monospace", fontWeight: 700 }}>{item.util}</span>
              {item.overlap && (
                <span style={{ fontSize: 7, color: "#ef4444", border: "1px solid #ef444450",
                  padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>CONFLICT</span>
              )}
            </div>
            <div style={{ fontSize: 9, color: CARD.muted, fontFamily: "monospace", marginTop: 1 }}>{item.label}</div>
          </div>
          <span style={{ fontSize: 16 }}>{item.overlap ? "⚠" : "✓"}</span>
        </div>
      ))}
      <div style={{ fontSize: 8, fontFamily: "monospace", textAlign: "center", marginTop: 2,
        color: conflicts > 0 ? "#f59e0b" : "#22c55e" }}>
        {conflicts > 0
          ? `${conflicts} routing conflict${conflicts > 1 ? "s" : ""} require coordination`
          : "All utility corridors clear — no routing conflicts"}
      </div>
    </div>
  );
}

/* ── Chart 4: Infrastructure Capacity Allocation ─────────────────── */
function CapacityAllocation({ siteId }) {
  const d = ALLOC_DATA[siteId] || ALLOC_DATA.tacoma;
  return (
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 9, color: CARD.muted, fontFamily: "monospace" }}>{d.label}</div>
      <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", gap: 1 }}>
        {d.segs.map((s, i) => (
          <div key={i} style={{ flex: s.val, background: s.col, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 8, color: "#fff", fontFamily: "monospace", fontWeight: 700 }}>
            {s.val >= 15 ? `${s.val}%` : ""}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {d.segs.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.col, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: CARD.muted, fontFamily: "monospace", width: 110, flexShrink: 0 }}>{s.name}</span>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
              <div style={{ width: `${s.val}%`, height: "100%", background: s.col, borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 9, color: s.col, fontFamily: "monospace", fontWeight: 700, width: 28, textAlign: "right" }}>{s.val}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Export ──────────────────────────────────────────────────────── */
export default function CapacityCharts({ chartsData, siteId = "tacoma" }) {
  return (
    <section className="section">
      <div className="section__header">
        <span className="section-heading">Infrastructure Planning Analysis</span>
        <span className="text-faint">Dependency chain · Build sequence · Utility coordination · Capacity allocation</span>
      </div>
      <div className="forecast-grid">
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Infrastructure Dependency Flow</span>
            <span className="text-faint" style={{ fontSize: 9 }}>utility dependency chain</span>
          </div>
          <DependencyFlow siteId={siteId} />
        </div>
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Construction Sequencing</span>
            <span className="text-faint" style={{ fontSize: 9 }}>location-based build phases</span>
          </div>
          <SequencingFlow siteId={siteId} />
        </div>
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Utility Coordination Layout</span>
            <span className="text-faint" style={{ fontSize: 9 }}>routing &amp; conflict analysis</span>
          </div>
          <UtilityCoordination siteId={siteId} />
        </div>
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Infrastructure Capacity Allocation</span>
            <span className="text-faint" style={{ fontSize: 9 }}>capacity distribution by zone</span>
          </div>
          <CapacityAllocation siteId={siteId} />
        </div>
      </div>
    </section>
  );
}
