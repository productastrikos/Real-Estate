import { IcoAI, IcoClose, IcoTrendUp, IcoTrendDown } from "../../components/icons/Icons.jsx";

export default function BoardReportModal({ site, financials, aiRec, risks, execKpis, onClose }) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const activeRisks = risks.filter((r) => r.level !== "low");

  return (
    <>
      <div className="modal-backdrop animate-fade-in" onClick={onClose} aria-hidden />
      <div className="modal-frame animate-fade-in" role="dialog" aria-modal="true" style={{ maxWidth: 780, width: "95vw", maxHeight: "90vh" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#8b5cf6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IcoAI size={16} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ds-text)", margin: 0 }}>Board Report — {site.name}</h2>
              <p style={{ fontSize: 12, color: "var(--ds-text-faint)", margin: 0 }}>
                Executive Decision Intelligence · Generated {today} · AI-Powered
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <IcoClose size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* AI Recommendation summary */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--ds-modal-advisory-bg)",
              borderRadius: 10,
              border: "1px solid var(--ds-modal-advisory-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div className="modal-ai-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-advisory)" }}>AI Executive Assessment</span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "#8b5cf622",
                  border: "1px solid #8b5cf644",
                  color: "#8b5cf6",
                  fontWeight: 600,
                }}
              >
                {aiRec.confidence}% AI Confidence
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)", marginBottom: 4 }}>{aiRec.headline}</div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
              {aiRec.reasons.map((r, i) => (
                <li key={i} style={{ fontSize: 11, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* KPI snapshot */}
          <div className="modal-section">
            <div className="modal-section__label">Executive KPI Snapshot</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
                marginTop: 8,
              }}
            >
              {execKpis.map((kpi) => (
                <div
                  key={kpi.id}
                  style={{
                    padding: "10px 12px",
                    background: "var(--ds-surface)",
                    borderRadius: 8,
                    border: "1px solid var(--ds-border)",
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ds-text)" }}>{kpi.value}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 3,
                      fontSize: 10,
                      color: kpi.trendPos ? "var(--ds-success)" : "var(--ds-warning)",
                    }}
                  >
                    {kpi.trendPos ? <IcoTrendUp size={10} /> : <IcoTrendDown size={10} />}
                    {kpi.trend}
                    <span style={{ color: "var(--ds-text-faint)" }}>· {kpi.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk summary */}
          <div className="modal-section">
            <div className="modal-section__label">
              Risk Summary —{" "}
              <span style={{ color: activeRisks.length > 0 ? "#dc2626" : "#16a34a" }}>
                {activeRisks.length} Active Risk{activeRisks.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {risks.map((risk, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    background:
                      risk.level === "high" ? "rgba(220,38,38,0.06)" : risk.level === "medium" ? "rgba(217,119,6,0.06)" : "rgba(22,163,74,0.04)",
                    borderRadius: 8,
                    border: `1px solid ${risk.level === "high" ? "rgba(220,38,38,0.2)" : risk.level === "medium" ? "rgba(217,119,6,0.2)" : "rgba(22,163,74,0.15)"}`,
                  }}
                >
                  <div style={{ minWidth: 70 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: risk.level === "high" ? "#dc262622" : risk.level === "medium" ? "#d9770622" : "#16a34a22",
                        color: risk.level === "high" ? "#dc2626" : risk.level === "medium" ? "#d97706" : "#16a34a",
                        textTransform: "uppercase",
                      }}
                    >
                      {risk.level} risk
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text)" }}>
                      {risk.category} — {risk.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>{risk.mitigation}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text-muted)" }}>{risk.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Watch items */}
          {aiRec.watchSites && aiRec.watchSites.length > 0 && (
            <div className="modal-section">
              <div className="modal-section__label">Watch Items for Board Attention</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {aiRec.watchSites.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "8px 12px",
                      background: w.urgency === "danger" ? "rgba(220,38,38,0.06)" : "rgba(217,119,6,0.06)",
                      borderRadius: 8,
                      border: `1px solid ${w.urgency === "danger" ? "rgba(220,38,38,0.2)" : "rgba(217,119,6,0.2)"}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        flexShrink: 0,
                        alignSelf: "flex-start",
                        marginTop: 1,
                        background: w.urgency === "danger" ? "#dc262622" : "#d9770622",
                        color: w.urgency === "danger" ? "#dc2626" : "#d97706",
                        textTransform: "uppercase",
                      }}
                    >
                      {w.urgency === "danger" ? "Critical" : "Warning"}
                    </span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-text)" }}>{w.name}</div>
                      <div style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>{w.issue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {/* <button className="btn btn-advisory btn-sm">Export PDF</button> */}
            <button className="btn btn-control" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
