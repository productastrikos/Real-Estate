export default function AIExecRec({ data, onGenerateReport }) {
  return (
    <div
      style={{
        background: "var(--ds-panel)",
        borderRadius: 8,
        border: "1px solid var(--ds-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: "1px solid var(--ds-internal-divider)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div className="ai-panel__dot" />
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-muted)" }}>AI Executive Recommendation</span>
      </div>

      {/* Primary recommendation */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--ds-internal-divider)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text)" }}>{data.primarySite}</span>
          <span className="ai-card__confidence">{data.confidence}% AI confidence</span>
        </div>
        <span className="chip chip-success" style={{ fontSize: 9, marginBottom: 8, display: "inline-flex" }}>
          {data.headline}
        </span>
        <ul className="ai-card__list" style={{ marginTop: 6 }}>
          {data.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      {/* Secondary recommendation */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--ds-internal-divider)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text)" }}>{data.secondarySite}</span>
          <span className="ai-card__confidence" style={{ fontSize: 9 }}>
            {data.secondaryConf}%
          </span>
        </div>
        <span className="chip chip-info" style={{ fontSize: 9, marginBottom: 6, display: "inline-flex" }}>
          Secondary Recommendation
        </span>
        <p style={{ fontSize: 11, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>{data.secondaryNote}</p>
      </div>

      {/* Watch list */}
      <div style={{ padding: "10px 16px", flex: 1 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ds-text-faint)",
            marginBottom: 8,
          }}
        >
          Watch Sites
        </div>
        {data.watchSites.map((w) => (
          <div
            key={w.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "6px 0",
              borderBottom: "1px solid var(--ds-internal-divider)",
            }}
          >
            <span className={`chip chip-${w.urgency}`} style={{ fontSize: 9, flexShrink: 0 }}>
              {w.urgency === "danger" ? "CRITICAL" : "WARNING"}
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text)", marginBottom: 2 }}>{w.name}</div>
              <div style={{ fontSize: 10, color: "var(--ds-text-muted)" }}>{w.issue}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 12px", borderTop: "1px solid var(--ds-internal-divider)" }}>
        <button className="btn btn-advisory" style={{ width: "100%", height: 32, fontSize: 11 }} onClick={onGenerateReport}>
          Generate Board Report
        </button>
      </div>
    </div>
  );
}
