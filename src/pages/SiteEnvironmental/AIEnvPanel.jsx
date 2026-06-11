import { useState } from "react";
import DrilldownModal from "../../components/ui/DrilldownModal.jsx";

const TYPE_STYLE = {
  recommendation: { color: "#8b5cf6", label: "Recommendation", borderColor: "#8b5cf6" },
  sustainability: { color: "#16a34a", label: "Sustainability", borderColor: "#16a34a" },
  risk: { color: "#d97706", label: "Risk Alert", borderColor: "#d97706" },
  expansion: { color: "#5b8de0", label: "Opportunity", borderColor: "#5b8de0" },
};

const TYPE_ICON = {
  recommendation: "gauge",
  sustainability: "leaf",
  risk: "bolt",
  expansion: "factory",
};

/* Generate a 12-point confidence trend that ends at `base` */
function genTrend(base) {
  return Array.from({ length: 12 }, (_, i) => Math.round(Math.max(50, Math.min(100, base - 10 + i * 0.9 + Math.sin(i * 1.1) * 3))));
}

function buildDrillContent(ins) {
  const ts = TYPE_STYLE[ins.type] || TYPE_STYLE.recommendation;
  const icon = TYPE_ICON[ins.type] || "gauge";
  const isRisk = ins.type === "risk";

  return {
    title: ins.title,
    subtitle: `${ts.label} · ${ins.confidence}% AI Confidence`,
    icon,
    description: ins.body,
    threshold: {
      current: ins.confidence,
      max: 100,
      unit: "% confidence",
      bands: [
        { label: "Low (<60%)", max: 60, color: "#dc2626" },
        { label: "Moderate (60–75%)", max: 75, color: "#d97706" },
        { label: "High (75–90%)", max: 90, color: "#5b8de0" },
        { label: "Very High (90%+)", max: 100, color: "#16a34a" },
      ],
    },
    aiRec:
      `This AI insight carries ${ins.confidence}% model confidence based on multi-source environmental and infrastructure data. ` +
      ins.body +
      " " +
      (ins.confidence >= 90
        ? "Immediate action is strongly recommended to capture the projected value."
        : ins.confidence >= 75
          ? "Plan and budget for implementation within the next 30–60 days."
          : "Monitor conditions and re-evaluate in 60 days before committing capital."),
    sparkData: genTrend(ins.confidence),
    trendPct: isRisk ? "-2.1%" : "+3.4%",
    trendPos: !isRisk,
    trendCaption: "AI confidence 12-month",
    contexts: [{ type: isRisk ? "warning" : ins.type === "sustainability" ? "success" : "info", heading: ts.label, body: ins.body }],
  };
}

export default function AIEnvPanel({ insights }) {
  const [drilldown, setDrilldown] = useState(null);

  return (
    <>
      <div className="ai-panel">
        <div className="ai-panel__header">
          <div className="ai-panel__dot" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-muted)" }}>AI Sustainability Insights</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {insights.map((ins, i) => {
            const style = TYPE_STYLE[ins.type] || TYPE_STYLE.recommendation;
            return (
              <div
                key={i}
                className="ai-card"
                style={{ borderLeftColor: style.borderColor, cursor: "pointer" }}
                onClick={() => setDrilldown(ins)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setDrilldown(ins)}
                role="button"
                aria-label={`${ins.title}: click for details`}
              >
                <div className="ai-card__type" style={{ color: style.color }}>
                  {style.label}
                </div>
                <div className="ai-card__title">{ins.title}</div>
                <div className="ai-card__body">{ins.body}</div>
                <div className="ai-card__confidence">AI {ins.confidence}% confidence</div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "10px 12px", borderTop: "1px solid var(--ds-internal-divider)" }}>
          <button className="btn btn-advisory" style={{ width: "100%", height: 32, fontSize: 11 }}>
            Full Sustainability Report
          </button>
        </div>
      </div>

      {drilldown && (
        <DrilldownModal
          kpi={{
            icon: TYPE_ICON[drilldown.type] || "gauge",
            status: drilldown.type === "risk" ? "ALERT" : "ACTIVE",
            ragStatus: drilldown.type === "risk" ? "warning" : drilldown.type === "expansion" ? "success" : "info",
            value: `${drilldown.confidence}%`,
          }}
          directContent={buildDrillContent(drilldown)}
          onClose={() => setDrilldown(null)}
        />
      )}
    </>
  );
}
