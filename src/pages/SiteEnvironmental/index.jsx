import { useSite } from "../../context/SiteContext.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { buildEnvData, buildSustainabilityForecast } from "../../utils/siteComputations.js";
import EnvKPIs from "./EnvKPIs.jsx";
import SimulationViewer from "./SimulationViewer2.jsx";
import AIEnvPanel from "./AIEnvPanel.jsx";
import SustainabilityForecast from "./SustainabilityForecast.jsx";

export default function SiteEnvironmental() {
  const { selectedSiteId, setSelectedSiteId } = useSite();
  const { sites } = useSiteData();

  const site = sites.find((s) => s.id === selectedSiteId) || sites[0] || {};
  const envData = buildEnvData(site);
  const forecastData = buildSustainabilityForecast(site);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Site Environmental &amp; Sustainability Intelligence</h1>
          <p className="page-subtitle">Environmental feasibility · Carbon strategy · Sustainability forecast</p>
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
          <span className="chip chip-success" style={{ marginLeft: 8 }}>
            Live Data
          </span>
        </div>
      </div>

      {/* Environmental KPIs */}
      <section className="section">
        <div className="section__header">
          <span className="section-heading">Environmental KPIs — {site.name}</span>
          <span className="text-faint">
            Area: {site.area} · Type: {site.type}
          </span>
        </div>
        <EnvKPIs data={envData} siteName={site.name} />
      </section>

      {/* Simulation viewer + AI panel */}
      <section className="section">
        <div className="section__header">
          <span className="section-heading">Environmental Simulation</span>
          <span className="text-faint">Solar Intelligence · Wind & Airflow · Shadow Analysis · Environmental Heatmap</span>
        </div>
        <SimulationViewer siteData={envData} siteName={site.name} siteId={selectedSiteId} />
      </section>

      {/* Sustainability forecast charts */}
      <SustainabilityForecast forecastData={forecastData} siteId={selectedSiteId} />
    </div>
  );
}
