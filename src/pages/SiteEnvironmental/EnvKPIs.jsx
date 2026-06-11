import { useState } from "react";
import StatusChip from "../../components/ui/StatusChip.jsx";
import DrilldownModal from "../../components/ui/DrilldownModal.jsx";

export default function EnvKPIs({ data, siteName }) {
  const [drilldown, setDrilldown] = useState(null);

  const cards = [
    {
      label: "ESG Risk Score",
      value: `${data.esgScore}/100`,
      sub: `Wetlands: ${data.wetlandsAcres} ac`,
      trend: data.esgTrend,
      trendPos: data.esgTrendPos,
      rag: data.esgScore >= 85 ? "success" : data.esgScore >= 70 ? "info" : "warning",
      accentColor: data.esgScore >= 85 ? "#16a34a" : data.esgScore >= 70 ? "#3b82f6" : "#d97706",
      icon: "leaf",
      sparkData: Array.from({ length: 12 }, (_, i) => Math.max(0, data.esgScore - (11 - i) * 0.5)),
      drillContent: {
        title: "ESG Risk Score",
        subtitle: `${siteName} — ${data.esgScore}/100 · Environmental Assessment`,
        icon: "leaf",
        description:
          "Environmental, Social, and Governance (ESG) risk score derived from soil contamination status, wetlands area, air quality index, flood zone classification, and EPA compliance. Higher scores indicate lower environmental risk and stronger compliance posture for permitting and financing.",
        threshold: {
          current: data.esgScore,
          max: 100,
          unit: "/ 100",
          bands: [
            { label: "High Risk (<60)", max: 60, color: "#dc2626" },
            { label: "Moderate Risk (60–80)", max: 80, color: "#d97706" },
            { label: "Low Risk (80+)", max: 100, color: "#16a34a" },
          ],
        },
        aiRec: `ESG risk score: ${data.esgScore}/100 — ${data.esgTrendPos ? "low-risk profile with strong environmental compliance posture." : "moderate risk requiring targeted remediation before construction."} Soil: ${data.soilContamination}. Wetlands on site: ${data.wetlandsAcres} acres.`,
        sparkData: Array.from({ length: 12 }, (_, i) => Math.max(0, data.esgScore - (11 - i) * 0.5)),
        contexts: [
          {
            type: data.esgTrendPos ? "success" : "warning",
            heading: "Environmental Status",
            body: `ESG Risk: ${data.esgTrend}. Soil: ${data.soilContamination}. Wetlands: ${data.wetlandsAcres} acres.`,
          },
          { type: "info", heading: "Source", body: "US Fish & Wildlife Service, Phase I ESA, EPA AQI data, USFWS National Wetlands Inventory." },
        ],
      },
    },
    {
      label: "Flood Zone",
      value: `${data.floodRisk} Risk`,
      sub: data.floodZoneClass,
      trend: null,
      rag: data.floodRiskLevel,
      accentColor: data.floodRiskLevel === "success" ? "#16a34a" : "#d97706",
      icon: "droplet",
      sparkData: null,
      drillContent: {
        title: "Flood Zone Assessment",
        subtitle: `${siteName} — ${data.floodRisk} Risk · ${data.floodZoneClass}`,
        icon: "droplet",
        description:
          "FEMA flood zone classification determines flood insurance requirements, stormwater design standards, and construction elevations. Zone X sites are outside the 500-year flood plain. Zone AE sites are within the 100-year flood plain and require elevated construction and special insurance.",
        threshold: {
          current: data.floodRiskLevel === "success" ? 15 : data.floodRiskLevel === "warning" ? 55 : 85,
          max: 100,
          unit: "Risk Index",
          bands: [
            { label: "Low Risk", max: 30, color: "#16a34a" },
            { label: "Moderate Risk", max: 65, color: "#d97706" },
            { label: "High Risk", max: 100, color: "#dc2626" },
          ],
        },
        aiRec: `${data.floodZoneClass}. ${data.floodRiskLevel === "success" ? "No special flood mitigation required. Standard stormwater management handles 100-year event." : "Zone AE requires elevated construction pads, enhanced retention, and flood insurance. Budget $0.8–$1.4M for mitigation infrastructure."}`,
        sparkData: null,
        contexts: [
          {
            type: data.floodRiskLevel === "success" ? "success" : "warning",
            heading: "FEMA Classification",
            body: `${data.floodZoneClass}. Annual rainfall: ${data.annualRainfall}". Stormwater capacity: ${data.peakStormHandling}.`,
          },
        ],
      },
    },
    {
      label: "Stormwater / EPA",
      value: data.epaStatus,
      sub: `${data.retentionPondMGal}M gal retention · ${data.drainagePipeKm} km pipes`,
      trend: null,
      rag: data.epaStatus === "Compliant" ? "success" : "warning",
      accentColor: data.epaStatus === "Compliant" ? "#16a34a" : "#d97706",
      icon: "droplet",
      sparkData: null,
      drillContent: {
        title: "Stormwater & EPA Compliance",
        subtitle: `${siteName} — ${data.epaStatus} · ${data.retentionPondMGal}M gal retention capacity`,
        icon: "droplet",
        description:
          "Site stormwater management system designed for 100-year storm events per DWG-009. Includes retention pond capacity, drainage pipe network, and EPA stormwater permit compliance. All sites include water recycling capability and permeable surface areas per environmental standards.",
        threshold: {
          current: data.epaStatus === "Compliant" ? 95 : 40,
          max: 100,
          unit: "Compliance",
          bands: [
            { label: "Non-compliant (<60)", max: 60, color: "#dc2626" },
            { label: "In Progress (60–90)", max: 90, color: "#d97706" },
            { label: "Compliant (90+)", max: 100, color: "#16a34a" },
          ],
        },
        aiRec: `EPA compliance: ${data.epaStatus}. Retention capacity: ${data.retentionPondMGal}M gallons handles ${data.peakStormHandling}. Drainage network: ${data.drainagePipeKm} km. Water recycling: ${data.waterRecyclingCapable}.`,
        sparkData: null,
        contexts: [
          {
            type: "success",
            heading: "Drainage Infrastructure",
            body: `${data.drainagePipeKm} km pipe network. ${data.retentionPondMGal}M gal retention. Handles ${data.peakStormHandling}.`,
          },
          {
            type: "info",
            heading: "Water Recycling",
            body: `Water recycling capable: ${data.waterRecyclingCapable}. Permeable surface: ${data.permSurfacePct}%.`,
          },
        ],
      },
    },
    {
      label: "Permeable Surface",
      value: `${data.permSurfacePct}%`,
      sub: "Site environmental quality",
      trend: data.permSurfaceTrend,
      trendPos: data.permSurfaceTrendPos,
      rag: data.permSurfacePct >= 20 ? "success" : data.permSurfacePct >= 15 ? "info" : "warning",
      accentColor: data.permSurfacePct >= 20 ? "#16a34a" : "#d97706",
      icon: "leaf",
      sparkData: Array.from({ length: 12 }, (_, i) => Math.max(0, data.permSurfacePct - (11 - i) * 0.25)),
      drillContent: {
        title: "Permeable Surface Coverage",
        subtitle: `${siteName} — ${data.permSurfacePct}% permeable · Water recycling: ${data.waterRecyclingCapable}`,
        icon: "leaf",
        description:
          "Percentage of site area that is permeable (soil, vegetation, permeable paving) versus impervious hard surface. Higher permeable ratios reduce stormwater runoff, recharge groundwater, reduce heat island effect, and are a positive environmental indicator for regulatory approvals and ESG ratings.",
        threshold: {
          current: data.permSurfacePct,
          max: 40,
          unit: "%",
          bands: [
            { label: "Low (<15%)", max: 15, color: "#dc2626" },
            { label: "Adequate (15–20%)", max: 20, color: "#d97706" },
            { label: "Good (20%+)", max: 40, color: "#16a34a" },
          ],
        },
        aiRec: `${data.permSurfacePct}% permeable surface — ${data.permSurfacePct >= 20 ? "above minimum environmental standard. Green buffer contributes to regulatory goodwill and ESG rating." : "at minimum threshold. Increase green buffer planting and permeable paving to exceed 20% target."}`,
        sparkData: Array.from({ length: 12 }, (_, i) => Math.max(0, data.permSurfacePct - (11 - i) * 0.25)),
        contexts: [
          {
            type: data.permSurfaceTrendPos ? "success" : "warning",
            heading: "Status",
            body: `${data.permSurfaceTrend}. Water recycling: ${data.waterRecyclingCapable}. Annual rainfall: ${data.annualRainfall}".`,
          },
        ],
      },
    },
    {
      label: "Geotechnical Risk",
      value: data.liquefactionRisk,
      sub: `${data.soilBearingPsf.toLocaleString()} psf bearing capacity`,
      trend: null,
      rag: data.liquefactionLevel,
      accentColor: data.liquefactionLevel === "success" ? "#16a34a" : "#d97706",
      icon: "gauge",
      sparkData: null,
      drillContent: {
        title: "Geotechnical Risk Assessment",
        subtitle: `${siteName} — Liquefaction: ${data.liquefactionRisk} · ${data.soilBearingPsf.toLocaleString()} psf`,
        icon: "gauge",
        description:
          "Geotechnical risk based on borehole survey data (DWG-007). Covers liquefaction potential during seismic events, soil bearing capacity for foundation design, and groundwater depth. Higher bearing capacity reduces foundation cost. Deeper groundwater reduces construction complexity.",
        threshold: {
          current: data.liquefactionLevel === "success" ? 10 : 40,
          max: 100,
          unit: "Risk Index",
          bands: [
            { label: "Low Risk", max: 30, color: "#16a34a" },
            { label: "Moderate Risk", max: 60, color: "#d97706" },
            { label: "High Risk", max: 100, color: "#dc2626" },
          ],
        },
        aiRec: `Liquefaction risk: ${data.liquefactionRisk}. Bearing capacity: ${data.soilBearingPsf.toLocaleString()} psf — ${data.soilBearingPsf >= 4500 ? "excellent for spread footing" : data.soilBearingPsf >= 3500 ? "adequate for standard spread footing" : "lower — deep pile foundations required"}. Groundwater: ${data.groundwaterDepthFt} ft.`,
        sparkData: null,
        contexts: [
          {
            type: data.liquefactionLevel,
            heading: "Foundation Suitability",
            body: `Bearing: ${data.soilBearingPsf.toLocaleString()} psf. Groundwater: ${data.groundwaterDepthFt} ft. Max slope: ${data.maxSlopePct}%. Erosion risk: ${data.soilErosionRisk}.`,
          },
          { type: "info", heading: "Source", body: "Geotechnical engineering borehole survey and seismic hazard analysis." },
        ],
      },
    },
  ];

  return (
    <>
      <div className="env-kpi-grid">
        {cards.map((c) => (
          <div
            key={c.label}
            className="stat-mini-card"
            style={{ borderLeft: `3px solid ${c.accentColor}`, cursor: "pointer" }}
            onClick={() => setDrilldown(c)}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setDrilldown(c)}
            role="button"
            aria-label={`${c.label}: ${c.value}. Click for details.`}
          >
            <span className="stat-mini-card__label">{c.label}</span>
            <span className="stat-mini-card__value" style={{ color: c.accentColor, fontSize: 20 }}>
              {c.value}
            </span>
            <span className="stat-mini-card__sub">{c.sub}</span>
            {c.trend ? (
              <span className={`stat-mini-card__trend ${c.trendPos ? "pos" : "neg"}`}>{c.trend}</span>
            ) : (
              <StatusChip status={c.rag} label={c.value} />
            )}
          </div>
        ))}
      </div>
      {drilldown && (
        <DrilldownModal
          kpi={{
            icon: drilldown.icon,
            status: drilldown.rag?.toUpperCase(),
            ragStatus: drilldown.rag,
            value: drilldown.value,
            trendPct: drilldown.trend,
            trendPos: drilldown.trendPos,
            trendCaption: "site assessment",
          }}
          directContent={drilldown.drillContent}
          onClose={() => setDrilldown(null)}
        />
      )}
    </>
  );
}
