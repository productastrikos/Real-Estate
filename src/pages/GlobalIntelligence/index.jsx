import { useState } from "react";
import { useSite } from "../../context/SiteContext.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import KPISection from "./KPISection.jsx";
import FilterPanel from "./FilterPanel.jsx";
import GISMap from "./GISMap.jsx";
import AIInsightsPanel from "./AIInsightsPanel.jsx";
import BottomAnalytics from "./BottomAnalytics.jsx";
import DrilldownModal from "../../components/ui/DrilldownModal.jsx";
import SiteUploadModal from "./SiteUploadModal.jsx";
import { DRILLDOWN_CONTENT } from "../../data/sites.js";

/* Build rich drilldown content for dynamically-computed KPIs that are not
   covered by the static DRILLDOWN_CONTENT lookup table. */
function buildGlobalDrillContent(kpi) {
  /* If a static entry already exists, use it */
  if (DRILLDOWN_CONTENT[kpi.id]) return DRILLDOWN_CONTENT[kpi.id];

  const parseNum = (v) => {
    if (typeof v === "number") return v;
    const m = String(v).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  };
  const n = parseNum(kpi.value);

  if (kpi.id === "electrical") {
    return {
      title: "Grid Electrical Capacity",
      subtitle: `${kpi.value} ${kpi.unit} · Utility company filings`,
      icon: kpi.icon,
      description:
        "Average grid electrical capacity available across all evaluated sites, sourced from utility company interconnection filings and pre-feasibility studies. Manufacturing facilities typically require 400–600 MW of committed grid capacity for large-scale operations, with headroom for EV fleet charging and process expansion.",
      threshold: {
        current: n,
        max: 800,
        unit: "MW",
        bands: [
          { label: "Insufficient (<300 MW)", max: 300, color: "#dc2626" },
          { label: "Marginal (300–500 MW)", max: 500, color: "#d97706" },
          { label: "Adequate (500 MW+)", max: 800, color: "#16a34a" },
        ],
      },
      sparkData: kpi.sparkData,
      trendPct: kpi.trendPct,
      trendPos: kpi.trendPos,
      trendCaption: kpi.trendCaption,
      aiRec: `Average grid capacity of ${kpi.value} ${kpi.unit} ${n >= 500 ? "meets enterprise requirements for large-scale manufacturing. Verify peak-demand headroom and utility upgrade timelines before final site commitment." : "is below the 500 MW target threshold. Prioritise sites with utility upgrade agreements or on-site renewable generation capability to close the gap."}`,
      contexts: [
        {
          type: n >= 500 ? "success" : "warning",
          heading: "Capacity Assessment",
          body: `${kpi.value} ${kpi.unit} average across portfolio. ${n >= 500 ? "Sufficient for multi-line manufacturing operations." : "Review sites with capacity constraints — utility upgrade MOUs may be required."}`,
        },
        {
          type: "info",
          heading: "Data Source",
          body: "Utility company interconnection filings, Puget Sound Energy & Pacific Power grid studies, WUTC capacity reports.",
        },
      ],
    };
  }

  if (kpi.id === "parcel") {
    const buildable = kpi.trendPct ? String(kpi.trendPct).match(/(\d+)/) : null;
    const buildableAc = buildable ? parseInt(buildable[1]) : Math.round(n * 0.7);
    return {
      title: "Parcel Area",
      subtitle: `${kpi.value} ${kpi.unit} average · ${buildableAc} ac buildable`,
      icon: kpi.icon,
      description:
        "Average total parcel size across all evaluated sites, sourced from county GIS and parcel records. Includes total site acreage and net buildable area after accounting for wetlands, setbacks, easements, and buffer zones. Larger parcels provide greater expansion flexibility and accommodate phased construction without land constraints.",
      threshold: {
        current: n,
        max: 600,
        unit: "acres",
        bands: [
          { label: "Constrained (<100 ac)", max: 100, color: "#dc2626" },
          { label: "Adequate (100–250 ac)", max: 250, color: "#d97706" },
          { label: "Generous (250 ac+)", max: 600, color: "#16a34a" },
        ],
      },
      sparkData: kpi.sparkData,
      trendPct: kpi.trendPct,
      trendPos: kpi.trendPos,
      trendCaption: kpi.trendCaption,
      aiRec: `Average parcel of ${kpi.value} ${kpi.unit} with ~${buildableAc} ac buildable ${n >= 250 ? "provides strong expansion headroom. Reserve 30–40% as Phase 2 development land during initial site design." : n >= 100 ? "is adequate for initial build-out. Evaluate adjacency options for future expansion phases." : "is constrained — investigate adjacent parcel acquisition or vertical construction strategies to accommodate full programme scope."}`,
      contexts: [
        {
          type: n >= 250 ? "success" : n >= 100 ? "info" : "warning",
          heading: "Buildable Area",
          body: `Net buildable: ~${buildableAc} ac. Deductions include wetland buffers, setbacks, and access corridors per county ordinance.`,
        },
        {
          type: "info",
          heading: "Data Source",
          body: "County GIS parcel records, FEMA floodplain maps, US Fish & Wildlife wetlands inventory.",
        },
      ],
    };
  }

  if (kpi.id === "transport") {
    return {
      title: "Interstate Access",
      subtitle: `${kpi.value} ${kpi.unit} average · WSDOT GIS data`,
      icon: kpi.icon,
      description:
        "Average distance from each site to the nearest interstate highway on-ramp, sourced from WSDOT GIS network analysis. Proximity to interstate infrastructure is a primary logistics cost driver — shorter distances reduce drayage time, fuel cost, and driver hours. Sites within 2 miles benefit from direct freight access and lower carrier surcharges.",
      threshold: {
        current: n,
        max: 10,
        unit: "miles",
        bands: [
          { label: "Excellent (<2 mi)", max: 2, color: "#16a34a" },
          { label: "Good (2–4 mi)", max: 4, color: "#d97706" },
          { label: "Poor (4+ mi)", max: 10, color: "#dc2626" },
        ],
      },
      sparkData: kpi.sparkData,
      trendPct: kpi.trendPct,
      trendPos: kpi.trendPos,
      trendCaption: kpi.trendCaption,
      aiRec: `Average interstate distance of ${kpi.value} ${kpi.unit} ${n <= 2 ? "is excellent — direct highway access minimises logistics costs and transit times. No infrastructure investment required." : n <= 4 ? "is acceptable. Evaluate road improvement MOUs with county for access road upgrades to reduce drayage cycle time." : "is above the 4-mile threshold — additional logistics cost per trip. Prioritise sites with closer highway access or negotiate county access road improvements."}`,
      contexts: [
        {
          type: n <= 2 ? "success" : n <= 4 ? "warning" : "danger",
          heading: "Freight Access",
          body: `${kpi.value} mi average to nearest I-5, I-90, or SR-509 on-ramp. ${n <= 3 ? "Suitable for just-in-time manufacturing logistics." : "May require dedicated access road investment."}`,
        },
        {
          type: "info",
          heading: "Data Source",
          body: "WSDOT GIS network analysis, county road records, freight movement data.",
        },
      ],
    };
  }

  if (kpi.id === "trucks") {
    return {
      title: "Logistics Throughput",
      subtitle: `${kpi.value} ${kpi.unit} average · Traffic engineering study`,
      icon: kpi.icon,
      description:
        "Average daily truck traffic capacity at site access points, based on traffic engineering studies and road capacity analysis. Represents the maximum daily inbound and outbound freight movements supportable by existing road infrastructure before queuing or congestion thresholds are reached. Critical for supply chain reliability planning.",
      threshold: {
        current: n,
        max: 600,
        unit: "trucks/day",
        bands: [
          { label: "Limited (<200/day)", max: 200, color: "#dc2626" },
          { label: "Adequate (200–350/day)", max: 350, color: "#d97706" },
          { label: "High Capacity (350+/day)", max: 600, color: "#16a34a" },
        ],
      },
      sparkData: kpi.sparkData,
      trendPct: kpi.trendPct,
      trendPos: kpi.trendPos,
      trendCaption: kpi.trendCaption,
      aiRec: `Logistics throughput of ${kpi.value} ${kpi.unit} ${n >= 350 ? "supports high-volume manufacturing operations. Implement automated dock scheduling to maximise throughput efficiency and minimise dwell time." : n >= 200 ? "is sufficient for current programme scale. Monitor access road capacity as volumes grow — queue modelling recommended beyond 300 trucks/day." : "is below manufacturing requirements. Road widening or dedicated freight access investment will be required before operations commence."}`,
      contexts: [
        {
          type: n >= 350 ? "success" : n >= 200 ? "info" : "warning",
          heading: "Freight Capacity",
          body: `${kpi.value} trucks/day capacity. ${n >= 350 ? "Supports multi-shift just-in-time operations." : "Review turning radius, dock count, and queuing space for full-scale operations."}`,
        },
        {
          type: "info",
          heading: "Data Source",
          body: "Traffic engineering capacity studies, county road LOS analysis, site access point survey data.",
        },
      ],
    };
  }

  if (kpi.id === "capex") {
    return {
      title: "Portfolio CAPEX Estimate",
      subtitle: `${kpi.value} total · Pre-development estimate`,
      icon: kpi.icon,
      description:
        "Total pre-development capital expenditure estimate across all sites in the evaluation portfolio. Includes site preparation, utility connections, road access, environmental remediation allowances, and initial civil works. These are order-of-magnitude estimates (±30%) based on comparable industrial development benchmarks and are updated as detailed engineering progresses.",
      threshold: {
        current: n,
        max: 1000,
        unit: "$M",
        bands: [
          { label: "Under-invested (<$200M)", max: 200, color: "#dc2626" },
          { label: "Developing ($200–$500M)", max: 500, color: "#d97706" },
          { label: "Well-capitalised ($500M+)", max: 1000, color: "#16a34a" },
        ],
      },
      sparkData: kpi.sparkData,
      trendPct: kpi.trendPct,
      trendPos: kpi.trendPos,
      trendCaption: kpi.trendCaption,
      aiRec: `Portfolio CAPEX of ${kpi.value} across ${kpi.trendPct?.replace("+", "") || "all"} sites. ${n >= 500 ? "Capital programme is well-funded. Prioritise spend on highest-ROI sites — recommend concentrating 40–50% of budget in top 2 sites for maximum value creation." : "Consider additional capital allocation for utility infrastructure to unlock higher-tier sites. Green bond financing could fund renewable and water infrastructure at preferential rates."}`,
      contexts: [
        {
          type: "info",
          heading: "Estimate Basis",
          body: "Pre-development estimates (±30% accuracy). Includes civil, utilities, access roads, and environmental. Excludes fit-out and equipment.",
        },
        {
          type: n >= 500 ? "success" : "warning",
          heading: "Capital Deployment",
          body: `Typical split: Civil & site prep 35%, Power & utilities 30%, Transport access 20%, Digital & comms 15%.`,
        },
      ],
    };
  }

  /* Fallback for any unrecognised KPI */
  return {
    title: kpi.label,
    subtitle: `${kpi.value}${kpi.unit ? " " + kpi.unit : ""}`,
    icon: kpi.icon,
    description: kpi.trendCaption || "",
    threshold: null,
    sparkData: kpi.sparkData,
    trendPct: kpi.trendPct,
    trendPos: kpi.trendPos,
    trendCaption: kpi.trendCaption,
    aiRec: "",
    contexts: [],
  };
}

export default function GlobalIntelligence() {
  const [drilldownKpi, setDrilldownKpi] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const { navigateTo } = useSite();
  const { sites, deleteSite } = useSiteData();
  const [filters, setFilters] = useState({
    regions: [],
    types: [],
    infra: [],
    esg: [],
    aiMin: 70,
  });

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Real Estate Scenario Planning Intelligence</h1>
          <p className="page-subtitle">
            Site Selection · Washington State ·{" "}
            <span style={{ color: "var(--ds-success)", fontWeight: 500 }}>
              {sites.length} site{sites.length !== 1 ? "s" : ""} monitored
            </span>
          </p>
        </div>
        <div className="page-header__right">
          <span className="chip chip-advisory">AI-Powered</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
            + Upload Data
          </button>
        </div>
      </div>

      {/* Site management bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 12, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "var(--ds-text-faint)", marginRight: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Active Sites:
        </span>
        {sites.map((site) => (
          <div
            key={site.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 6px 3px 8px",
              background: "var(--ds-surface)",
              border: "1px solid var(--ds-border)",
              borderRadius: 20,
              fontSize: 10,
              color: "var(--ds-text-muted)",
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: site.ragStatus === "success" ? "#16a34a" : "#d97706", flexShrink: 0 }}
            />
            <span>{site.shortName}</span>
            <span style={{ fontSize: 9, color: "var(--ds-text-faint)" }}>#{site.aiScore}</span>
            <button
              onClick={() => deleteSite(site.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                color: "var(--ds-text-faint)",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
                lineHeight: 1,
                marginLeft: 1,
              }}
              title={`Remove ${site.name}`}
              aria-label={`Remove ${site.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {sites.length === 0 && (
          <span style={{ fontSize: 10, color: "var(--ds-text-faint)", fontStyle: "italic" }}>No sites — upload an Excel file to begin</span>
        )}
      </div>

      {/* KPI Row */}
      <KPISection onDrilldown={setDrilldownKpi} />

      {/* Three-panel intelligence grid */}
      <section className="section" aria-label="Site intelligence">
        <div className="section__header">
          <span className="section-heading">GIS Intelligence</span>
          <span className="text-faint">Click a site marker to view details · Click a button in the popup to drill into that page</span>
        </div>
        <div className="intelligence-grid">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
          <GISMap
            filters={filters}
            onSiteSelect={(site, dest) => {
              console.log("Navigate to", dest, "for site", site.name);
            }}
          />
          <AIInsightsPanel />
        </div>
      </section>

      {/* Bottom analytics */}
      <BottomAnalytics />

      {/* Drilldown modal */}
      {drilldownKpi && (
        <DrilldownModal
          kpi={drilldownKpi}
          directContent={{
            ...buildGlobalDrillContent(drilldownKpi),
            monthlyTrend: drilldownKpi?.monthlyTrend,
            siteBreakdown: drilldownKpi?.siteBreakdown,
          }}
          onClose={() => setDrilldownKpi(null)}
        />
      )}

      {/* Upload modal */}
      {showUpload && <SiteUploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
