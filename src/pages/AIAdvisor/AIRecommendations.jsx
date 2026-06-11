export default function AIRecommendations({ advisorData }) {
  return (
    <div className="rec-panel">
      <div className="rec-panel__header">
        <div className="ai-panel__dot" />
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-muted)" }}>AI Recommendation Engine</span>
        <span className="ai-card__confidence" style={{ marginLeft: "auto" }}>
          AI {advisorData.aiFeasibility}% feasibility
        </span>
      </div>

      {/* Recommended for */}
      <div className="rec-section">
        <div className="rec-section__label">Recommended For</div>
        {advisorData.recommendedFor.map((item) => (
          <div key={item} className="rec-item">
            <div className="rec-item__icon yes">✔</div>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Not recommended */}
      <div className="rec-section">
        <div className="rec-section__label">Not Recommended</div>
        {advisorData.notRecommendedFor.map((item) => (
          <div key={item} className="rec-item">
            <div className="rec-item__icon no">✖</div>
            <span style={{ color: "var(--ds-text-faint)" }}>{item}</span>
          </div>
        ))}
      </div>

      {/* AI Infrastructure suggestions */}
      <div className="rec-section" style={{ flex: 1 }}>
        <div className="rec-section__label">AI Infrastructure Suggestions</div>
        <ul className="ai-card__list">
          {advisorData.infraSuggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      {/* Readiness meters */}
      <div className="rec-section" style={{ flexShrink: 0 }}>
        <div className="rec-section__label">Readiness Overview</div>
        {[
          {
            label: "Infrastructure Readiness",
            value: advisorData.infraReadiness,
            color: advisorData.infraReadiness >= 85 ? "var(--ds-success)" : "var(--ds-warning)",
          },
          { label: "AI Feasibility Score", value: advisorData.aiFeasibility, color: "#8b5cf6" },
          { label: "Renewable Integration", value: parseInt(advisorData.renewableIntegration), color: "#14b8a6" },
        ].map((m) => (
          <div key={m.label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "var(--ds-text-muted)" }}>{m.label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.value}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${m.value}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--ds-internal-divider)" }}>
        <button className="btn btn-advisory" style={{ width: "100%", height: 32, fontSize: 11 }}>
          Full Infrastructure Report
        </button>
      </div>
    </div>
  );
}
