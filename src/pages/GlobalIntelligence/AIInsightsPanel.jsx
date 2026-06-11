import { useState } from "react";
import { IcoAI, IcoAlert, IcoClose } from "../../components/icons/Icons.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";

function statusLabel(score) {
  if (score >= 90) return "Recommended";
  if (score >= 85) return "Strong";
  if (score >= 78) return "Conditional";
  return "Watch";
}

function buildReportSections(sites) {
  if (!sites?.length) return [];
  const ranked = [...sites].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  const top = ranked[0];
  const avgEsg = Math.round(sites.reduce((s, x) => s + (x.esg || 0), 0) / sites.length);
  const totalInv = sites.reduce((s, x) => s + (x.investment || 0), 0);
  const avgPower = Math.round(sites.reduce((s, x) => s + (x.power || 0), 0) / sites.length);
  const riskPower = sites.filter((s) => s.power < 80);
  const riskWater = sites.filter((s) => (s.waterPct || 0) < 65);

  const alerts = [
    ...riskPower.map((s) => ({ level: "danger", site: s.shortName, risk: `Power at ${s.power}% (below 80% threshold)`, action: s.issue || "Review and upgrade power infrastructure" })),
    ...riskWater.map((s) => ({ level: (s.waterPct || 0) < 50 ? "danger" : "warning", site: s.shortName, risk: `Water at ${s.waterPct}% capacity`, action: "Water sustainability plan required before expansion" })),
    ...sites.filter((s) => s.issue && s.ragStatus === "warning" && !riskPower.includes(s) && !riskWater.includes(s)).map((s) => ({ level: "warning", site: s.shortName, risk: s.issue, action: "Monitor and plan mitigation" })),
  ].slice(0, 5);

  const recommendations = [
    top && `Prioritize ${top.shortName} expansion — highest AI score at ${top.aiScore}%.`,
    riskPower[0] && `Address power risk at ${riskPower[0].shortName} (${riskPower[0].power}% availability).`,
    riskWater[0] && `Implement water resilience plan at ${riskWater[0].shortName}.`,
    `Optimize ESG performance across portfolio (current avg: ${avgEsg}/100, target: 85).`,
    sites.length > 1 && `Benchmark underperforming sites against ${top?.shortName} operational model.`,
  ].filter(Boolean);

  return [
    {
      heading: "Executive Summary",
      color: "#8b5cf6",
      content: `AI analysis of ${sites.length} site${sites.length !== 1 ? "s" : ""} reveals ${top?.name} as the primary expansion candidate with ${top?.aiScore}% confidence. Portfolio power availability ${avgPower}%${riskPower.length ? ` (${riskPower.length} site at risk)` : ""}. Enterprise ESG score ${avgEsg}/100. Total infrastructure investment: $${totalInv}M.`,
    },
    {
      heading: "Site Rankings",
      color: "#16a34a",
      rows: ranked.map((s) => ({
        site: s.name,
        score: `${s.aiScore}%`,
        status: statusLabel(s.aiScore),
        detail: `Power ${s.power}% · Water ${s.waterPct}% · Rail: ${s.rail} · ESG: ${s.esg}/100`,
      })),
    },
    ...(alerts.length ? [{
      heading: "Critical Risk Alerts",
      color: "#dc2626",
      alerts,
    }] : []),
    {
      heading: "Strategic Recommendations",
      color: "#8b5cf6",
      items: recommendations,
    },
    {
      heading: "ESG & Sustainability Outlook",
      color: "#16a34a",
      content: `Portfolio ESG average: ${avgEsg}/100.${ranked[0] ? ` Top performer: ${ranked[0].shortName} (${ranked[0].esg}/100).` : ""}${riskWater.length ? ` Water risk at ${riskWater.map((s) => s.shortName).join(", ")} — action required.` : " All sites meeting water targets."} Solar and renewable integration opportunities identified across portfolio.`,
    },
  ];
}

function AICard({ card }) {
  return (
    <div className={`ai-card ${card.type}`}>
      <div className="ai-card__type">{card.typeLabel}</div>
      <div className="ai-card__title">{card.title}</div>
      <div className="ai-card__body">{card.body}</div>
      {card.bullets?.length > 0 && (
        <ul className="ai-card__list">
          {card.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {card.confidence && (
        <div className="ai-card__confidence">
          <IcoAI size={10} />
          {card.confidence}
        </div>
      )}
      {card.meta && <div style={{ marginTop: 8, fontSize: 10, color: "var(--ds-text-faint)", fontStyle: "italic" }}>{card.meta}</div>}
    </div>
  );
}

function FullAIReportModal({ sites, onClose }) {
  const sections = buildReportSections(sites);
  return (
    <>
      <div className="modal-backdrop animate-fade-in" onClick={onClose} aria-hidden />
      <div className="modal-frame animate-fade-in" role="dialog" aria-modal="true" style={{ maxWidth: 720, width: "95vw", maxHeight: "88vh" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcoAI size={16} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ds-text)", margin: 0 }}>Full AI Intelligence Report</h2>
              <p style={{ fontSize: 12, color: "var(--ds-text-faint)", margin: 0 }}>{sites.length} Active Site{sites.length !== 1 ? "s" : ""} · Generated by AI Engine</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><IcoClose size={15} /></button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sections.map((section, i) => (
            <div key={i} className="modal-section">
              <div className="modal-section__label" style={{ color: section.color, borderLeft: `3px solid ${section.color}`, paddingLeft: 8 }}>
                {section.heading}
              </div>

              {section.content && <p style={{ fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.65, marginTop: 8 }}>{section.content}</p>}

              {section.rows && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {section.rows.map((r, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 12px", background: "var(--ds-surface)", borderRadius: 8, border: "1px solid var(--ds-border)" }}>
                      <div style={{ minWidth: 36, textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: section.color }}>{r.score}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ds-text)" }}>{r.site}</div>
                        <div style={{ fontSize: 11, color: "var(--ds-text-muted)", marginTop: 2 }}>{r.detail}</div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 600, flexShrink: 0,
                        background: r.status === "Recommended" ? "#16a34a22" : r.status === "Strong" ? "#5b8de022" : r.status === "Watch" ? "#dc262622" : "#d9770622",
                        color: r.status === "Recommended" ? "#16a34a" : r.status === "Strong" ? "#5b8de0" : r.status === "Watch" ? "#dc2626" : "#d97706",
                        border: `1px solid ${r.status === "Recommended" ? "#16a34a44" : r.status === "Strong" ? "#5b8de044" : r.status === "Watch" ? "#dc262644" : "#d9770644"}`,
                      }}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {section.alerts && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                  {section.alerts.map((a, j) => (
                    <div key={j} style={{ display: "flex", gap: 12, padding: "8px 12px", background: a.level === "danger" ? "rgba(220,38,38,0.06)" : "rgba(217,119,6,0.06)", borderRadius: 8, border: `1px solid ${a.level === "danger" ? "rgba(220,38,38,0.2)" : "rgba(217,119,6,0.2)"}` }}>
                      <div style={{ flexShrink: 0 }}><IcoAlert size={14} style={{ color: a.level === "danger" ? "#dc2626" : "#d97706" }} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: a.level === "danger" ? "#dc2626" : "#d97706" }}>{a.site}</span>
                          <span style={{ fontSize: 11, color: "var(--ds-text-muted)" }}>{a.risk}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>Action: {a.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.items && (
                <ul style={{ margin: "8px 0 0", padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn btn-control" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AIInsightsPanel() {
  const { aiInsights, sites } = useSiteData();
  const [showReport, setShowReport] = useState(false);
  const riskCount = sites.filter((s) => s.ragStatus === "warning" || s.ragStatus === "danger").length;

  return (
    <>
      <aside className="ai-panel" aria-label="AI Strategic Intelligence">
        <div className="ai-panel__header">
          <div className="ai-panel__dot" aria-hidden />
          <span className="card-title" style={{ letterSpacing: "0.04em", color: "var(--ds-advisory)" }}>
            AI Strategic Intelligence
          </span>
        </div>

        <div style={{ padding: "8px 10px", margin: "6px 10px 0", background: "var(--ds-modal-advisory-bg)", borderRadius: 8, border: "1px solid var(--ds-modal-advisory-border)", fontSize: 11, color: "var(--ds-text-muted)", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: "var(--ds-advisory)" }}>{aiInsights.length} active insight{aiInsights.length !== 1 ? "s" : ""}</span>
          {" "}across {sites.length} site{sites.length !== 1 ? "s" : ""}.
          {riskCount > 0 && <> <span style={{ color: "#dc2626", fontWeight: 600 }}>{riskCount}</span> require immediate attention.</>}
        </div>

        {aiInsights.map((card, i) => (
          <AICard key={i} card={card} />
        ))}

        <div style={{ padding: "8px 10px 12px" }}>
          <button className="btn btn-advisory btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowReport(true)}>
            <IcoAI size={13} />
            Full AI Report
          </button>
        </div>
      </aside>

      {showReport && <FullAIReportModal sites={sites} onClose={() => setShowReport(false)} />}
    </>
  );
}
