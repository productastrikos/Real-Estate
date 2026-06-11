import { useState } from "react";
import { useSite } from "../../context/SiteContext.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { buildExecKpis, buildFinancials, buildExecRec, buildRisks } from "../../utils/siteComputations.js";
import ExecKPIs from "./ExecKPIs.jsx";
import FinancialCharts from "./FinancialCharts.jsx";
import AIExecRec from "./AIExecRec.jsx";
import RiskIntelligence from "./RiskIntelligence.jsx";
import BoardReportModal from "./BoardReportModal.jsx";

export default function ExecutiveDashboard() {
  const { selectedSiteId, setSelectedSiteId } = useSite();
  const { sites } = useSiteData();
  const [showBoardReport, setShowBoardReport] = useState(false);

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0] || {};
  const execKpis = buildExecKpis(site);
  const financials = buildFinancials(site);
  const aiRec = buildExecRec(site);
  const risks = buildRisks(site);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Strategic Intelligence</h1>
          <p className="page-subtitle">{site.name} · ROI · ESG compliance · Expansion readiness · Risk intelligence</p>
        </div>
        <div className="page-header__right">
          <div className="site-selector">
            {sites.map((s) => (
              <button
                key={s.id}
                className={`site-pill${selectedSiteId === s.id ? " active" : ""}${s.ragStatus === "warning" ? " warn" : ""}`}
                onClick={() => setSelectedSiteId(s.id)}
              >
                {s.shortName}
                {s.ragStatus === "warning" && <span style={{ marginLeft: 4, color: "var(--ds-warning)" }}>⚠</span>}
              </button>
            ))}
          </div>
          <span className="chip chip-advisory" style={{ marginLeft: 8 }}>
            AI-Powered
          </span>
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 6 }} onClick={() => setShowBoardReport(true)}>
            Generate Board Report
          </button>
        </div>
      </div>

      {/* Executive KPIs */}
      <section className="section">
        <div className="section__header">
          <span className="section-heading">Executive KPIs — {site.name}</span>
          <span className="text-faint">
            {site.area} · {site.type}
          </span>
        </div>
        <ExecKPIs kpis={execKpis} />
      </section>

      {/* Financial charts + AI recommendation side-by-side */}
      <section className="section">
        <div className="section__header">
          <span className="section-heading">Financial Analytics &amp; Strategic Intelligence</span>
          <span className="text-faint">2022–2030 · * = projected</span>
        </div>
        <div className="exec-split">
          <FinancialCharts data={financials} siteId={selectedSiteId} />
          <AIExecRec data={aiRec} onGenerateReport={() => setShowBoardReport(true)} />
        </div>
      </section>

      {/* Risk intelligence */}
      <RiskIntelligence risks={risks} />

      {showBoardReport && (
        <BoardReportModal
          site={site}
          financials={financials}
          aiRec={aiRec}
          risks={risks}
          execKpis={execKpis}
          onClose={() => setShowBoardReport(false)}
        />
      )}
    </div>
  );
}
