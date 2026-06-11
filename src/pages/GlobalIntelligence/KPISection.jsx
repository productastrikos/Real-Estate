import KpiCard from "../../components/ui/KpiCard.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";

export default function KPISection({ onDrilldown }) {
  const { kpiData, sites } = useSiteData();

  return (
    <section className="section" aria-label="Key performance indicators">
      <div className="section__header">
        <span className="section-heading">Infrastructure KPIs</span>
        <span className="text-faint">
          {sites.length} site{sites.length !== 1 ? "s" : ""} · Computed from uploaded site data
        </span>
      </div>
      <div className="kpi-grid">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} onDrilldown={onDrilldown} />
        ))}
      </div>
    </section>
  );
}
