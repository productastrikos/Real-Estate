import { useState } from "react";
import { useSite } from "../../context/SiteContext.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { buildAdvisorData, buildChartsData, buildAlerts } from "../../utils/siteComputations.js";
import CapacityKPIs from "./CapacityKPIs.jsx";
import InfrastructureTwin from "./InfrastructureTwin.jsx";
import CapacityCharts from "./CapacityCharts.jsx";
import SmartAlerts from "./SmartAlerts.jsx";

export default function AIAdvisor() {
  const { selectedSiteId, setSelectedSiteId } = useSite();
  const { sites } = useSiteData();

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0] || {};
  const advisorData = buildAdvisorData(site);
  const chartsData = buildChartsData(site);
  const alerts = buildAlerts(site);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Blueprint Intelligence</h1>
          <p className="page-subtitle">Infrastructure planning · Manufacturing suitability · Utility feasibility · Operational readiness</p>
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
        </div>
      </div>

      {/* Capacity KPIs */}
      <section className="section">
        <div className="section__header">
          <span className="section-heading">Site Capacity Overview — {site.name}</span>
          <span className="text-faint">
            {site.area} · {site.type}
          </span>
        </div>
        <CapacityKPIs advisorData={advisorData} chartsData={chartsData} siteId={site.id || selectedSiteId} />
      </section>

      {/* Infrastructure Intelligence Twin — Boeing Campus Masterplan */}
      <section className="section" style={{ height: 780, minHeight: 700 }}>
        <InfrastructureTwin siteId={selectedSiteId} siteName={site.name} />
      </section>

      {/* Capacity analytics charts */}
      <CapacityCharts chartsData={chartsData} siteId={selectedSiteId} />

      {/* Smart alerts */}
      <SmartAlerts alerts={alerts} />
    </div>
  );
}
