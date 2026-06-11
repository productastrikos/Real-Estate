import { useState } from "react";
import { Ico } from "../../components/icons/Icons.jsx";
import StatusChip from "../../components/ui/StatusChip.jsx";
import DrilldownModal from "../../components/ui/DrilldownModal.jsx";
import { CAPACITY_CHARTS } from "../../data/envData.js";

/* Parse numeric part from strings like "82 MW", "12M L/day", "34%", "Excellent" */
function parseNum(val) {
  if (typeof val === "number") return val;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}
function logMap(v) { return v === "Excellent" ? 95 : v === "Good" ? 78 : v === "Fair" ? 60 : 40; }

export default function CapacityKPIs({ advisorData, chartsData, siteId = "tacoma" }) {
  const [drilldown, setDrilldown] = useState(null);
  const charts = chartsData || CAPACITY_CHARTS[siteId] || CAPACITY_CHARTS.tacoma;
  const siteName = siteId.charAt(0).toUpperCase() + siteId.slice(1);

  const powerMW   = parseNum(advisorData.powerCapacity);
  const waterML   = parseNum(advisorData.waterCapacity);
  const logNum    = logMap(advisorData.logisticsReadiness);
  const renewPct  = parseNum(advisorData.renewableIntegration);
  const infraPct  = advisorData.infraReadiness;
  const aiFeasPct = advisorData.aiFeasibility;

  const cards = [
    {
      label: "Power Capacity",
      value: advisorData.powerCapacity,
      icon: "bolt",
      accentColor: infraPct >= 85 ? "#16a34a" : powerMW >= 70 ? "#16a34a" : powerMW >= 50 ? "#d97706" : "#dc2626",
      rag: powerMW >= 70 ? "success" : powerMW >= 50 ? "warning" : "danger",
      drillContent: {
        title: "Power Capacity",
        subtitle: `${siteName} — ${advisorData.powerCapacity} on-site available`,
        icon: "bolt",
        description: "Total on-site power capacity available for manufacturing operations. Includes primary grid connection, on-site generation, and contracted backup. Higher capacity enables simultaneous multi-process high-draw manufacturing.",
        threshold: {
          current: powerMW,
          max: 120,
          unit: "MW",
          bands: [
            { label: "Critical (<50 MW)", max: 50, color: "#dc2626" },
            { label: "Constrained (50–70 MW)", max: 70, color: "#d97706" },
            { label: "Sufficient (70+ MW)", max: 120, color: "#16a34a" },
          ],
        },
        sparkData: charts.powerCapacity,
        trendPct: "+11%",
        trendPos: true,
        trendCaption: "projected to 2030",
        aiRec: `Power capacity at ${advisorData.powerCapacity} ${powerMW >= 70 ? "supports full multi-site manufacturing load. Consider grid reinforcement to unlock headroom for Phase 3 expansion." : "is constrained — recommend $18M grid reinforcement within 18 months to unlock 24 MW additional capacity and remove bottleneck risk."}`,
        contexts: [
          { type: powerMW >= 70 ? "success" : "warning", heading: "Grid Status", body: `${advisorData.powerCapacity} available with ${powerMW >= 80 ? "full headroom" : "limited headroom"} for expansion. Dual-feed topology ${powerMW >= 80 ? "confirmed" : "recommended"}.` },
          { type: "info", heading: "2030 Forecast", body: `Capacity projected to reach ${charts.powerCapacity[charts.powerCapacity.length - 1]} MW by 2030 on current expansion plan.` },
        ],
      },
    },
    {
      label: "Water Supply Capacity",
      value: advisorData.waterCapacity,
      icon: "droplet",
      accentColor: waterML >= 10 ? "#16a34a" : waterML >= 7 ? "#d97706" : "#dc2626",
      rag: waterML >= 10 ? "success" : waterML >= 7 ? "warning" : "danger",
      drillContent: {
        title: "Water Supply Capacity",
        subtitle: `${siteName} — ${advisorData.waterCapacity} daily supply`,
        icon: "droplet",
        description: "Total daily freshwater supply capacity available for manufacturing processes, cooling systems, and site utilities. Measured in megalitres per day. Adequate supply is essential for cooling-intensive operations and regulatory compliance with water-use permits.",
        threshold: {
          current: waterML,
          max: 20,
          unit: "ML/day",
          bands: [
            { label: "Stressed (<7 ML)", max: 7, color: "#dc2626" },
            { label: "Adequate (7–10 ML)", max: 10, color: "#d97706" },
            { label: "Sufficient (10+ ML)", max: 20, color: "#16a34a" },
          ],
        },
        sparkData: charts.waterCapacity,
        trendPct: "+15%",
        trendPos: true,
        trendCaption: "projected to 2030",
        aiRec: `Water capacity at ${advisorData.waterCapacity} ${waterML >= 10 ? "is sufficient for planned operations. Closed-loop recycling investment will reduce net draw and provide stress resilience through 2035." : "is below optimal — install closed-loop recycling system ($2.8M) to reduce freshwater dependency and qualify for state water-efficiency grant."}`,
        contexts: [
          { type: waterML >= 10 ? "success" : "warning", heading: "Supply Assessment", body: `${advisorData.waterCapacity} covers ${waterML >= 10 ? "all planned processes including cooling-intensive operations" : "basic operations but not cooling-intensive manufacturing"}.` },
          { type: "info", heading: "Reuse Potential", body: "Closed-loop water recycling can reduce net freshwater draw by 58%, improving sustainability score and reducing operating cost." },
        ],
      },
    },
    {
      label: "Logistics Readiness",
      value: advisorData.logisticsReadiness,
      icon: "factory",
      accentColor: advisorData.logisticsReadiness === "Excellent" ? "#16a34a" : "#d97706",
      rag: advisorData.logisticsReadiness === "Excellent" ? "success" : "warning",
      drillContent: {
        title: "Logistics Readiness",
        subtitle: `${siteName} — ${advisorData.logisticsReadiness} · Freight & Distribution Score`,
        icon: "factory",
        description: "Composite score measuring the site's freight, rail, road, and port connectivity. Incorporates HGV access, rail siding availability, highway interchange proximity, and intermodal transfer capability. Determines efficiency of inbound raw material supply and outbound product distribution.",
        threshold: {
          current: logNum,
          max: 100,
          unit: "Score",
          bands: [
            { label: "Poor (<60)", max: 60, color: "#dc2626" },
            { label: "Good (60–80)", max: 80, color: "#d97706" },
            { label: "Excellent (80+)", max: 100, color: "#16a34a" },
          ],
        },
        sparkData: charts.logistics,
        trendPct: "+5%",
        trendPos: true,
        trendCaption: "projected improvement",
        aiRec: `Logistics readiness is ${advisorData.logisticsReadiness} at ${siteName}. ${advisorData.logisticsReadiness === "Excellent" ? "Maintain dedicated freight corridor. Potential 18% logistics cost reduction via route optimisation with current infrastructure." : "Rail upgrade to Class 1 and direct HGV corridor would improve logistics score by 12+ points and reduce supply chain lead times."}`,
        contexts: [
          { type: advisorData.logisticsReadiness === "Excellent" ? "success" : "info", heading: "Freight Access", body: `${advisorData.logisticsReadiness === "Excellent" ? "BNSF mainline + SR highway direct access. Best-in-portfolio logistics connectivity." : "Road access confirmed. Rail connection upgrade recommended to unlock Excellent rating."}` },
          { type: "info", heading: "2030 Projection", body: `Logistics score projected at ${charts.logistics[charts.logistics.length - 1]} by 2030 with planned infrastructure improvements.` },
        ],
      },
    },
    {
      label: "Renewable Integration",
      value: advisorData.renewableIntegration,
      icon: "leaf",
      accentColor: renewPct >= 40 ? "#16a34a" : renewPct >= 20 ? "#d97706" : "#dc2626",
      rag: renewPct >= 40 ? "success" : renewPct >= 20 ? "warning" : "danger",
      drillContent: {
        title: "Renewable Integration",
        subtitle: `${siteName} — ${advisorData.renewableIntegration} renewable energy share`,
        icon: "leaf",
        description: "Percentage of total site energy consumption sourced from renewable generation (solar, wind, hydro, or green tariff). A higher rate reduces carbon intensity, lowers exposure to grid price volatility, and directly improves ESG score — a key criterion for green financing eligibility.",
        threshold: {
          current: renewPct,
          max: 100,
          unit: "%",
          bands: [
            { label: "Low (<20%)", max: 20, color: "#dc2626" },
            { label: "Developing (20–40%)", max: 40, color: "#d97706" },
            { label: "Leading (40%+)", max: 100, color: "#16a34a" },
          ],
        },
        sparkData: charts.renewable,
        trendPct: "+28%",
        trendPos: true,
        trendCaption: "projected to 2030",
        aiRec: `Renewable integration at ${advisorData.renewableIntegration}. ${renewPct >= 40 ? "On track for net-zero target. Accelerate toward 70%+ with Phase 2 solar expansion to lock in green bond eligibility." : renewPct >= 20 ? "Transition to green power tariff and on-site solar deployment will reach 40%+ target within 24 months at $4.2M capital cost." : "Urgent: renewable integration below threshold. Deploy PPA green tariff immediately (no capex) to reach 20% within 3 months."}`,
        contexts: [
          { type: renewPct >= 40 ? "success" : renewPct >= 20 ? "warning" : "danger", heading: "Current Status", body: `${renewPct}% renewable — ${renewPct >= 40 ? "above enterprise target" : "below 40% enterprise target"}. Solar irradiance at site supports ground-mount expansion.` },
          { type: "info", heading: "2030 Target", body: `Projected renewable share: ${charts.renewable[charts.renewable.length - 1]}% by 2030. Net-zero achievable with planned solar and green tariff transition.` },
        ],
      },
    },
    {
      label: "Infrastructure Readiness",
      value: `${infraPct}%`,
      icon: "gauge",
      accentColor: infraPct >= 80 ? "#16a34a" : infraPct >= 65 ? "#d97706" : "#dc2626",
      rag: infraPct >= 80 ? "success" : infraPct >= 65 ? "warning" : "danger",
      drillContent: {
        title: "Infrastructure Readiness",
        subtitle: `${siteName} — ${infraPct}% overall readiness score`,
        icon: "gauge",
        description: "Composite score measuring the overall readiness of site infrastructure for manufacturing deployment. Aggregates power grid status, water utility availability, road/rail connectivity, utility permit status, and civil works completion. A score above 80% indicates shovel-ready status.",
        threshold: {
          current: infraPct,
          max: 100,
          unit: "%",
          bands: [
            { label: "Not Ready (<65%)", max: 65, color: "#dc2626" },
            { label: "Conditional (65–80%)", max: 80, color: "#d97706" },
            { label: "Ready (80%+)", max: 100, color: "#16a34a" },
          ],
        },
        sparkData: charts.occupancy,
        trendPct: "+9%",
        trendPos: true,
        trendCaption: "improvement this year",
        aiRec: `Infrastructure readiness at ${infraPct}% places ${siteName} ${infraPct >= 80 ? "in shovel-ready status. Phase 1 construction can commence within 60 days subject to permit finalisation." : "in conditional status. Address power and utility gaps identified in the dependency flow to unlock full readiness within 18 months."}`,
        contexts: [
          { type: infraPct >= 80 ? "success" : "warning", heading: "Readiness Status", body: `${infraPct}% — ${infraPct >= 80 ? "all primary infrastructure services confirmed and permit-ready" : "key utility upgrades required before full manufacturing deployment"}.` },
          { type: "info", heading: "Key Gap", body: infraPct >= 85 ? "Minor: fiber redundancy upgrade recommended for data-intensive manufacturing. Est. $0.4M." : `Power and utility reinforcement programme required. Est. $${Math.round((90 - infraPct) * 0.8)}M investment to reach 85%+ readiness.` },
        ],
      },
    },
    {
      label: "AI Manufacturing Feasibility",
      value: `${aiFeasPct}%`,
      icon: "ai",
      accentColor: aiFeasPct >= 85 ? "#16a34a" : aiFeasPct >= 70 ? "#d97706" : "#dc2626",
      rag: aiFeasPct >= 85 ? "success" : aiFeasPct >= 70 ? "warning" : "danger",
      drillContent: {
        title: "AI Manufacturing Feasibility",
        subtitle: `${siteName} — ${aiFeasPct}% AI confidence score`,
        icon: "ai",
        description: "AI-computed composite feasibility score for high-tech manufacturing deployment at this site. Calculated from 47 parameters including power quality, water resilience, logistics score, environmental compliance, workforce availability, and infrastructure trajectory. Scores above 85% indicate strong suitability for advanced manufacturing.",
        threshold: {
          current: aiFeasPct,
          max: 100,
          unit: "%",
          bands: [
            { label: "Low Feasibility (<70%)", max: 70, color: "#dc2626" },
            { label: "Moderate (70–85%)", max: 85, color: "#d97706" },
            { label: "High (85%+)", max: 100, color: "#16a34a" },
          ],
        },
        sparkData: [
          aiFeasPct - 6, aiFeasPct - 5, aiFeasPct - 5, aiFeasPct - 4,
          aiFeasPct - 3, aiFeasPct - 3, aiFeasPct - 2, aiFeasPct - 2,
          aiFeasPct - 1, aiFeasPct - 1, aiFeasPct, aiFeasPct,
        ],
        trendPct: "+4%",
        trendPos: true,
        trendCaption: "vs previous quarter",
        aiRec: `AI feasibility score of ${aiFeasPct}% ${aiFeasPct >= 85 ? "confirms strong suitability for EV battery, aerospace, and smart industrial manufacturing. Prioritise this site for next expansion cycle." : aiFeasPct >= 70 ? "indicates conditional suitability. Address top infrastructure gaps to reach 85%+ and unlock full advanced manufacturing deployment." : "indicates significant barriers. Targeted infrastructure investment in power and logistics is required before recommending manufacturing commitment."}`,
        contexts: [
          { type: aiFeasPct >= 85 ? "success" : "warning", heading: "AI Assessment", body: `Score of ${aiFeasPct}% driven by ${aiFeasPct >= 85 ? "strong power capacity, logistics readiness, and ESG trajectory" : "good logistics but constrained by power and renewable integration gaps"}.` },
          { type: "info", heading: "Recommended Uses", body: advisorData.recommendedFor?.join(", ") || "Review full advisor data for recommended manufacturing types." },
        ],
      },
    },
  ];

  return (
    <>
      <div className="kpi-grid-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="stat-mini-card"
            style={{ borderTop: `2px solid ${c.accentColor}`, cursor: "pointer" }}
            onClick={() => setDrilldown(c)}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setDrilldown(c)}
            role="button"
            aria-label={`${c.label}: ${c.value}. Click for details.`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: c.accentColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Ico name={c.icon} size={13} />
              </div>
              <span className="stat-mini-card__label" style={{ fontSize: 9 }}>{c.label}</span>
            </div>
            <span className="stat-mini-card__value" style={{ color: c.accentColor, fontSize: 17 }}>{c.value}</span>
            <StatusChip status={c.rag} label="" />
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
            trendPct: drilldown.drillContent.trendPct,
            trendPos: drilldown.drillContent.trendPos,
            trendCaption: drilldown.drillContent.trendCaption,
            sparkData: drilldown.drillContent.sparkData,
          }}
          directContent={drilldown.drillContent}
          onClose={() => setDrilldown(null)}
        />
      )}
    </>
  );
}
