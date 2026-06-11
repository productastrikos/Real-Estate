import { useState } from "react";
import { IcoClose, IcoAlert, IcoAI } from "../../components/icons/Icons.jsx";

/* ── Per-risk drilldown content ─────────────────────────────── */
const RISK_DRILLDOWN = {
  "Flood Risk": {
    aiAnalysis:
      "Site is located above the 100-year flood plain with active FEMA certification. FEMA 2025 remapping has not affected the primary site boundary. Flood risk score of 8% reflects residual storm drainage and runoff exposure only. Negligible impact on operations or asset insurance.",
    actions: [
      { label: "Annual FEMA review", due: "Q4 2026", status: "scheduled" },
      { label: "Storm drainage capacity audit", due: "Q2 2026", status: "in-progress" },
      { label: "Flood insurance renewal", due: "Dec 2026", status: "pending" },
    ],
    trend: [8, 9, 8, 8, 7, 8, 7, 8, 8, 8, 8, 8],
    trendLabel: "12-month risk score",
  },
  "Freight Disruption": {
    aiAnalysis:
      "SR-509 grade-separation project (2026–2028) will temporarily reduce inbound freight capacity by 15–22%. Alternate routing via SR-516/I-5 adds approximately 12 minutes to truck cycle time but fully preserves throughput. Risk window: 24 months. Post-construction freight throughput improves by 40%.",
    actions: [
      { label: "Activate SR-516 alternate freight routing", due: "Q1 2026", status: "active" },
      { label: "Negotiate early delivery windows with 3PL providers", due: "Q4 2025", status: "completed" },
      { label: "Inventory buffer increase (14 days → 21 days)", due: "Q2 2026", status: "in-progress" },
    ],
    trend: [18, 20, 20, 22, 22, 22, 22, 22, 22, 22, 22, 22],
    trendLabel: "12-month risk score",
  },
  "Regulatory Risk": {
    aiAnalysis:
      "Washington State manufacturing emissions regulations expected 2027. Current ESG score positions the portfolio well above compliance threshold. No material compliance gap identified. Ongoing green tariff programmes and renewable integration further strengthen the compliance buffer.",
    actions: [
      { label: "File early water permit renewal", due: "Jun 2026", status: "pending" },
      { label: "Update emissions compliance roadmap", due: "Q3 2026", status: "in-progress" },
      { label: "Legal review of 2027 WA regs draft", due: "Q1 2026", status: "scheduled" },
    ],
    trend: [18, 17, 16, 16, 15, 15, 15, 15, 15, 15, 15, 15],
    trendLabel: "12-month risk score",
  },
  "Grid Dependency": {
    aiAnalysis:
      "PSE grid upgrade adds 8 MW additional capacity by Q3 2026 — current utilisation at 78% leaves healthy headroom. Single-feed topology is the primary residual risk; dual-feed upgrade removes it. Post-upgrade availability forecast: 99.4%. Budget approved; contractor shortlisted.",
    actions: [
      { label: "PSE transformer upgrade completion", due: "Q3 2026", status: "scheduled" },
      { label: "Dual-feed upgrade design review", due: "Q2 2026", status: "in-progress" },
      { label: "Backup generator test schedule", due: "Monthly", status: "active" },
    ],
    trend: [20, 18, 16, 15, 14, 13, 12, 12, 12, 12, 12, 12],
    trendLabel: "12-month risk score",
  },
  "Transformer Overload": {
    aiAnalysis:
      "CRITICAL: North substation running at 94% of rated peak capacity — industry safe threshold is 85%. Continued industrial load growth in Snohomish County projects full capacity breach by Q2 2027 without intervention. Manufacturing shutdown risk escalates monthly. Dual-feed grid reinforcement ($18M) must be approved within 6 months to maintain operations.",
    actions: [
      { label: "Board approval — $18M grid reinforcement", due: "30-day window", status: "urgent" },
      { label: "Emergency demand-response agreement with Snohomish PUD", due: "Q1 2026", status: "in-progress" },
      { label: "Portable generator contingency deployment", due: "Q1 2026", status: "pending" },
      { label: "Renewable microgrid feasibility study", due: "Q2 2026", status: "scheduled" },
    ],
    trend: [68, 72, 76, 80, 84, 88, 90, 92, 93, 94, 94, 94],
    trendLabel: "12-month capacity utilisation %",
  },
  "Flood Zone Risk": {
    aiAnalysis:
      "FEMA 2025 update places Everett northern parcel (14 acres) in the 100-year flood zone — an increase from the prior designation. Primary manufacturing buildings remain outside the flood boundary. Elevation certificate required for insurance and permitting. Flood-proofing works on the northern parcel estimated at $1.2M.",
    actions: [
      { label: "Commission FEMA elevation certificate", due: "Q1 2026", status: "in-progress" },
      { label: "Flood-proofing works on northern parcel", due: "Q3 2026", status: "pending" },
      { label: "Insurance premium review", due: "Q2 2026", status: "scheduled" },
    ],
    trend: [20, 25, 30, 35, 40, 45, 50, 55, 58, 58, 58, 58],
    trendLabel: "12-month risk score",
  },
  "Power Fluctuation": {
    aiAnalysis:
      "Grid congestion causing 3–4% weekly voltage deviation. Current impact: occasional production line micro-interruptions. Root cause: Snohomish PUD transmission corridor at 91% utilisation. Dual-feed upgrade removes the single point of failure; in the interim, industrial UPS deployment at critical production lines mitigates the shutdown risk.",
    actions: [
      { label: "Deploy industrial UPS on critical lines", due: "Q1 2026", status: "in-progress" },
      { label: "Dual-feed upgrade procurement", due: "Q2 2026", status: "pending" },
      { label: "Monthly PUD capacity review", due: "Monthly", status: "active" },
    ],
    trend: [20, 25, 30, 35, 38, 40, 42, 42, 42, 42, 42, 42],
    trendLabel: "12-month risk score",
  },
  "Wildfire Smoke": {
    aiAnalysis:
      "Eastern WA wildfire season (June–September) reduces outdoor air quality to unhealthy levels for an average of 18 days/year. Primary impact: outdoor worker safety and HVAC filter loading. Site HVAC upgraded to MERV-16 filtration in 2024; buffer filter inventory maintains 90 days of supply. Operational risk is low with current controls.",
    actions: [
      { label: "Pre-season HVAC filter buffer stock (90-day supply)", due: "May 2026", status: "scheduled" },
      { label: "Outdoor worker heat/smoke safety protocol update", due: "Q2 2026", status: "in-progress" },
      { label: "Air quality monitoring sensor calibration", due: "Q1 2026", status: "scheduled" },
    ],
    trend: [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
    trendLabel: "12-month risk score",
  },
  "Winter Solar Gap": {
    aiAnalysis:
      "Solar irradiance at Spokane drops from 1,560 kWh/m²/yr average to approximately 650 kWh/m² during November–February. This creates a 4-month window where renewable generation falls 58% below summer peak. An 8 MWh battery storage system bridges this gap and ensures >80% renewable share year-round. Capital plan approved; installation Q3 2026.",
    actions: [
      { label: "8 MWh battery storage installation", due: "Q3 2026", status: "in-progress" },
      { label: "Grid-draw scheduling optimisation for Nov–Feb", due: "Oct 2026", status: "pending" },
      { label: "Winter demand forecast update", due: "Q4 2026", status: "scheduled" },
    ],
    trend: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
    trendLabel: "12-month risk score",
  },
  "Water Supply": {
    aiAnalysis:
      "Spokane water infrastructure is rated stable through 2035 under current demand growth projections. The 2028 capital plan includes a utility expansion that adds 15% additional supply capacity. No material risk to operations. This is the lowest-risk water profile in the enterprise portfolio.",
    actions: [
      { label: "2028 water utility expansion — confirm budget", due: "Q3 2026", status: "scheduled" },
      { label: "Water usage efficiency audit", due: "Q2 2026", status: "pending" },
    ],
    trend: [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
    trendLabel: "12-month risk score",
  },
  "Water Stress": {
    aiAnalysis:
      "CRITICAL: Yakima reservoir trending 18% below the 10-year baseline — the fastest deterioration rate since 2012. Municipal water restrictions are probable by summer 2027 if reservoir levels do not recover. Roza Canal irrigation authority is also at 72% allocation. A closed-loop industrial recycling system ($4.2M) reduces freshwater draw by 58% and removes the expansion gate. State water-efficiency grant of $1.2M partially offsets cost. This is the single highest-priority capital action in the portfolio.",
    actions: [
      { label: "Board approval — $4.2M closed-loop recycling investment", due: "Immediate", status: "urgent" },
      { label: "Apply for state water-efficiency grant ($1.2M)", due: "Q1 2026", status: "in-progress" },
      { label: "Roza Canal augmentation agreement", due: "Q2 2026", status: "in-progress" },
      { label: "Wet cooling tower shutdown plan", due: "Q3 2026", status: "pending" },
    ],
    trend: [40, 48, 55, 60, 68, 72, 76, 80, 84, 86, 88, 88],
    trendLabel: "12-month risk score",
  },
  "Cooling System": {
    aiAnalysis:
      "Wet cooling tower draws 2.4M litres/day of municipal water — the largest single point of water dependency at Yakima. Dry-cooling conversion eliminates this dependency entirely and reduces overall site water consumption by 34%. Engineering review is 60% complete; conversion estimated at $2.8M with 3.2-year payback through utility savings. Expansion approval is gated on conversion completion.",
    actions: [
      { label: "Dry cooling conversion engineering approval", due: "Q2 2026", status: "in-progress" },
      { label: "Procurement tender for dry cooling equipment", due: "Q3 2026", status: "pending" },
      { label: "Interim water recirculation upgrade", due: "Q1 2026", status: "scheduled" },
    ],
    trend: [50, 55, 58, 62, 65, 68, 72, 74, 76, 76, 76, 76],
    trendLabel: "12-month risk score",
  },
  "Heat Stress Zones": {
    aiAnalysis:
      "Site temperatures at Yakima are projected to exceed 38°C for 28+ days per year by 2028, up from 14 days currently. Primary risks: worker safety incidents, equipment thermal failures, and reduced manufacturing throughput during peak summer. Cool-roof coating (18% heat load reduction) and worker safety protocol update are the near-term mitigations. Full remediation requires HVAC upgrade for outdoor-adjacent workspaces.",
    actions: [
      { label: "Cool-roof coating installation", due: "Q2 2026", status: "in-progress" },
      { label: "Worker heat-safety protocol update", due: "Q1 2026", status: "scheduled" },
      { label: "Outdoor workspace HVAC feasibility review", due: "Q3 2026", status: "pending" },
    ],
    trend: [28, 30, 33, 35, 38, 40, 42, 44, 46, 47, 48, 48],
    trendLabel: "12-month risk score",
  },
  "Freight Capacity": {
    aiAnalysis:
      "I-82 corridor is approaching capacity during peak hours (07:00–09:00 and 15:00–18:00). WSDOT capacity study projects widening completion by 2030. Off-peak freight scheduling eliminates 92% of the congestion exposure in the interim. Risk is low and fully manageable with scheduling optimisation alone.",
    actions: [
      { label: "Implement off-peak freight scheduling", due: "Q1 2026", status: "active" },
      { label: "Negotiate off-peak delivery windows with suppliers", due: "Q2 2026", status: "in-progress" },
      { label: "Monitor WSDOT I-82 widening project timeline", due: "Quarterly", status: "scheduled" },
    ],
    trend: [14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 18],
    trendLabel: "12-month risk score",
  },
};

const STATUS_COLOR = {
  urgent: "#dc2626",
  "in-progress": "#d97706",
  pending: "#5b8de0",
  scheduled: "#8b5cf6",
  active: "#16a34a",
  completed: "#16a34a",
};
const STATUS_BG = {
  urgent: "#dc262618",
  "in-progress": "#d9770618",
  pending: "#5b8de018",
  scheduled: "#8b5cf618",
  active: "#16a34a18",
  completed: "#16a34a18",
};

/* ── Sparkline SVG for trend ─────────────────────────────────── */
function TrendSparkline({ data, color }) {
  if (!data || data.length === 0) return null;
  const h = 40,
    w = 200;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 4 : 2.5} fill={color} />;
      })}
    </svg>
  );
}

/* ── Risk Drilldown Modal ────────────────────────────────────── */
function RiskDrilldownModal({ risk, onClose }) {
  const extra = risk.drilldown || RISK_DRILLDOWN[risk.title] || {};
  const levelColor = risk.level === "high" ? "#dc2626" : risk.level === "medium" ? "#d97706" : "#16a34a";
  const levelLabel = { low: "LOW RISK", medium: "MEDIUM RISK", high: "HIGH RISK" };

  return (
    <>
      <div className="modal-backdrop animate-fade-in" onClick={onClose} aria-hidden />
      <div className="modal-frame animate-fade-in" role="dialog" aria-modal="true" style={{ maxWidth: 680, width: "95vw", maxHeight: "90vh" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: levelColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IcoAlert size={16} color="#fff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ds-text)", margin: 0 }}>
                  {risk.category} — {risk.title}
                </h2>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontWeight: 700,
                    background: `${levelColor}22`,
                    border: `1px solid ${levelColor}66`,
                    color: levelColor,
                  }}
                >
                  {levelLabel[risk.level]}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--ds-text-faint)", margin: 0 }}>{risk.detail}</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <IcoClose size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Risk meter + score */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "12px 16px",
              background: "var(--ds-surface)",
              borderRadius: 10,
              border: "1px solid var(--ds-border)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--ds-text-faint)",
                  marginBottom: 3,
                }}
              >
                Risk Score
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: levelColor, lineHeight: 1 }}>{risk.pct}%</div>
            </div>
            <div style={{ flex: 1, borderLeft: "1px solid var(--ds-internal-divider)", paddingLeft: 20 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--ds-text-faint)",
                  marginBottom: 6,
                }}
              >
                Risk Level Track
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 99,
                  background: "var(--ds-border)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${risk.pct}%`,
                    borderRadius: 99,
                    background: levelColor,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 9, color: "#16a34a" }}>Low</span>
                <span style={{ fontSize: 9, color: "#d97706" }}>Medium</span>
                <span style={{ fontSize: 9, color: "#dc2626" }}>High</span>
              </div>
            </div>
            {extra.trend && (
              <div style={{ borderLeft: "1px solid var(--ds-internal-divider)", paddingLeft: 20 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "var(--ds-text-faint)",
                    marginBottom: 6,
                  }}
                >
                  Trend (12m)
                </div>
                <TrendSparkline data={extra.trend} color={levelColor} />
              </div>
            )}
          </div>

          {/* Current mitigation */}
          <div className="modal-section">
            <div className="modal-section__label">Current Mitigation</div>
            <div
              style={{
                padding: "8px 12px",
                background: `${levelColor}0d`,
                borderRadius: 8,
                border: `1px solid ${levelColor}33`,
                fontSize: 12,
                color: "var(--ds-text-muted)",
                marginTop: 8,
              }}
            >
              {risk.mitigation}
            </div>
          </div>

          {/* Action items */}
          {extra.actions && extra.actions.length > 0 && (
            <div className="modal-section">
              <div className="modal-section__label">Action Plan</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {extra.actions.map((action, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 12px",
                      background: "var(--ds-surface)",
                      borderRadius: 8,
                      border: "1px solid var(--ds-border)",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: STATUS_COLOR[action.status] || "#8ca0b6",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "var(--ds-text)" }}>{action.label}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                          background: STATUS_BG[action.status] || "#8ca0b618",
                          color: STATUS_COLOR[action.status] || "#8ca0b6",
                          textTransform: "uppercase",
                        }}
                      >
                        {action.status}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>{action.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI analysis */}
          {extra.aiAnalysis && (
            <div className="modal-section">
              <div className="modal-section__label">AI Risk Analysis</div>
              <div className="modal-ai-box" style={{ marginTop: 8 }}>
                <div className="modal-ai-box__header">
                  <div className="modal-ai-dot" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-advisory)" }}>AI Intelligence Engine</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.65 }}>{extra.aiAnalysis}</p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn btn-advisory btn-sm">Export Risk Report</button>
            <button className="btn btn-control" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main Risk Intelligence section ─────────────────────────── */
export default function RiskIntelligence({ risks }) {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const levelLabel = { low: "LOW RISK", medium: "MEDIUM RISK", high: "HIGH RISK" };

  return (
    <>
      <section className="section">
        <div className="section__header">
          <span className="section-heading">Risk Intelligence</span>
          <span className="chip chip-warning" style={{ fontSize: 9 }}>
            {risks.filter((r) => r.level !== "low").length} Active Risks
          </span>
        </div>
        <div className="risk-band">
          {risks.map((risk) => (
            <div
              key={risk.title}
              className={`risk-card ${risk.level}`}
              onClick={() => setSelectedRisk(risk)}
              style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <span className="risk-card__label">{risk.category}</span>
              <span className="risk-card__title">{risk.title}</span>
              <span className="risk-card__level">{levelLabel[risk.level]}</span>
              <p className="risk-card__detail">{risk.detail}</p>
              <div className="risk-meter">
                <div className={`risk-meter__fill ${risk.level}`} style={{ width: `${risk.pct}%` }} />
              </div>
              <span style={{ fontSize: 9, color: "var(--ds-text-faint)", marginTop: 2 }}>{risk.mitigation}</span>
              <span
                style={{
                  display: "block",
                  marginTop: 6,
                  fontSize: 9,
                  color: "var(--ds-advisory)",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                Click to drill down →
              </span>
            </div>
          ))}
        </div>
      </section>

      {selectedRisk && <RiskDrilldownModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </>
  );
}
