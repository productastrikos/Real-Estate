import { useSite } from "../../context/SiteContext.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import FeasibilityViewer from "./FeasibilityViewer.jsx";

const STATUS_COLOR = { excellent: "#22c55e", good: "#22c55e", moderate: "#eab308", low: "#dc2626" };

function scoreStatus(aiScore) {
  return aiScore >= 90 ? "excellent" : aiScore >= 82 ? "good" : aiScore >= 72 ? "moderate" : "low";
}

export default function SiteFeasibility() {
  const { selectedSiteId, setSelectedSiteId } = useSite();
  const { sites } = useSiteData();

  const feasibilitySites = sites.map((s) => ({
    id: s.id,
    label: s.name,
    shortName: s.shortName,
    score: s.aiScore || 0,
    status: scoreStatus(s.aiScore || 0),
  }));

  const activeSiteId = feasibilitySites.find((s) => s.id === selectedSiteId)
    ? selectedSiteId
    : feasibilitySites[0]?.id || "tacoma";

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0] || {};

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Site Feasibility &amp; Constraints</h1>
          <p className="page-subtitle">
            Comprehensive feasibility assessment with risk and constraint mapping
            {activeSite.name ? ` · ${activeSite.name}` : ""}
          </p>
        </div>
        <div className="page-header__right">
          <div className="site-selector">
            {feasibilitySites.map((s) => (
              <button
                key={s.id}
                className={`site-pill${activeSiteId === s.id ? " active" : ""}`}
                onClick={() => setSelectedSiteId(s.id)}
                title={`${s.label} — Feasibility Score: ${s.score}%`}
              >
                {s.label}
                <span
                  style={{
                    marginLeft: 5,
                    fontSize: 9,
                    fontWeight: 800,
                    color: STATUS_COLOR[s.status],
                    fontFamily: "monospace",
                  }}
                >
                  {s.score}%
                </span>
              </button>
            ))}
          </div>
          <span className="chip chip-success" style={{ marginLeft: 8 }}>
            Live Analysis
          </span>
        </div>
      </div>

      {/* Feasibility Viewer */}
      <section className="section" style={{ flex: 1, minHeight: 0 }}>
        <FeasibilityViewer site={activeSite} />
      </section>
    </div>
  );
}
