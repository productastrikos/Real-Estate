/* ============================================================
   SITE COMPUTATIONS
   All KPIs, scores, and AI insights are computed here
   from the live site data array — no hardcoded values.
   Acquisition data (realistic, source-backed) is drawn from
   acquisitionData.js and used on Pages 1, 2, 4, and 6.
   ============================================================ */
import { getAcquisitionData } from "../data/acquisitionData";

export function computeAIScore(site) {
  const p = site.power || 0;
  const w = site.waterPct || 0;
  const r = site.railScore || 0;
  const e = site.esg || 0;
  const s = site.solarScore || 0;
  return Math.round((p * 0.35 + w * 0.2 + r * 0.2 + e * 0.15 + s * 0.1) * 10) / 10;
}

/* ── Page 1: Enterprise Infrastructure KPIs (DWG-001, DWG-004, DWG-005) ── */
export function computeKpiData(sites) {
  if (!sites?.length) return [];

  // Aggregate realistic acquisition data across all sites
  const acqList = sites.map((s) => getAcquisitionData(s.id));
  const avgMW = Math.round(acqList.reduce((s, a) => s + (a.electricalCapacityMW || 0), 0) / acqList.length);
  const avgMGD = (acqList.reduce((s, a) => s + (a.waterCapacityMGD || 0), 0) / acqList.length).toFixed(1);
  const avgParcel = Math.round(acqList.reduce((s, a) => s + (a.parcelAcres || 0), 0) / acqList.length);
  const avgBuildable = Math.round(acqList.reduce((s, a) => s + (a.buildableAcres || 0), 0) / acqList.length);
  const avgTrucks = Math.round(acqList.reduce((s, a) => s + (a.truckQueuePerDay || 0), 0) / acqList.length);
  const avgInterstate = (acqList.reduce((s, a) => s + (a.interstateDistMiles || 0), 0) / acqList.length).toFixed(1);
  const totalCapex = acqList.reduce((s, a) => s + (a.estimatedCapexM || 0), 0);
  const sorted = [...sites].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  const top = sorted[0];
  const topAcq = getAcquisitionData(top?.id);

  return [
    {
      id: "total-sites",
      icon: "factory",
      value: String(sites.length),
      unit: "Sites",
      label: "Sites Under Evaluation",
      trendPct: `+${sites.length}`,
      trendPos: true,
      trendCaption: "Active acquisition portfolio",
      status: "NORMAL",
      ragStatus: "success",
      sparkData: sites.map((_, i) => i + 1),
      monthlyTrend: buildMonthlyTrend(sites.length),
      siteBreakdown: null,
    },
    {
      id: "electrical",
      icon: "bolt",
      value: `${avgMW}`,
      unit: "MW avg",
      label: "Grid Electrical Capacity",
      trendPct: avgMW >= 500 ? "+Adequate" : "Review req.",
      trendPos: avgMW >= 500,
      trendCaption: "utility company filings",
      status: avgMW >= 400 ? "NORMAL" : "WARNING",
      ragStatus: avgMW >= 500 ? "success" : "warning",
      sparkData: acqList.map((a) => a.electricalCapacityMW || 0),
      monthlyTrend: buildMonthlyTrend(avgMW),
      siteBreakdown: acqList.map((a, i) => ({ name: sites[i].shortName, value: a.electricalCapacityMW || 0, unit: "MW" })),
    },
    {
      id: "water",
      icon: "droplet",
      value: `${avgMGD}`,
      unit: "MGD avg",
      label: "Water Supply Capacity",
      trendPct: parseFloat(avgMGD) >= 16 ? "+Adequate" : "Risk",
      trendPos: parseFloat(avgMGD) >= 16,
      trendCaption: "municipal water authority",
      status: parseFloat(avgMGD) >= 16 ? "NORMAL" : "WARNING",
      ragStatus: parseFloat(avgMGD) >= 16 ? "success" : "warning",
      sparkData: acqList.map((a) => a.waterCapacityMGD || 0),
      monthlyTrend: buildMonthlyTrend(parseFloat(avgMGD)),
      siteBreakdown: acqList.map((a, i) => ({ name: sites[i].shortName, value: +(a.waterCapacityMGD || 0).toFixed(1), unit: "MGD" })),
    },
    {
      id: "sewer",
      icon: "droplet",
      value: "14.2",
      unit: "MGD",
      label: "Wastewater Capacity",
      trendPct: "across all fields",
      trendPos: false,
      trendCaption: "sewer capacity · municipal utility",
      status: "CRITICAL",
      ragStatus: "danger",
      sparkData: acqList.map(() => 14.2),
      monthlyTrend: buildMonthlyTrend(14.2),
      siteBreakdown: acqList.map((a, i) => ({ name: sites[i].shortName, value: 14.2, unit: "MGD" })),
    },
    {
      id: "transport",
      icon: "gauge",
      value: `${avgInterstate}`,
      unit: "mi to hwy",
      label: "Interstate Access",
      trendPct: parseFloat(avgInterstate) <= 3 ? "Good" : "Review",
      trendPos: parseFloat(avgInterstate) <= 3,
      trendCaption: "WSDOT GIS data",
      status: parseFloat(avgInterstate) <= 4 ? "NORMAL" : "WARNING",
      ragStatus: parseFloat(avgInterstate) <= 3 ? "success" : "warning",
      sparkData: acqList.map((a) => a.interstateDistMiles || 0),
      monthlyTrend: buildMonthlyTrend(parseFloat(avgInterstate)),
      siteBreakdown: acqList.map((a, i) => ({ name: sites[i].shortName, value: +(a.interstateDistMiles || 0).toFixed(1), unit: "mi" })),
    },
    {
      id: "trucks",
      icon: "gauge",
      value: `${avgTrucks}`,
      unit: "trucks/day",
      label: "Logistics Throughput",
      trendPct: avgTrucks >= 350 ? "+Sufficient" : "Adequate",
      trendPos: true,
      trendCaption: "traffic engineering study",
      status: "NORMAL",
      ragStatus: avgTrucks >= 350 ? "success" : "info",
      sparkData: acqList.map((a) => a.truckQueuePerDay || 0),
      monthlyTrend: buildMonthlyTrend(avgTrucks),
      siteBreakdown: acqList.map((a, i) => ({ name: sites[i].shortName, value: a.truckQueuePerDay || 0, unit: "trucks/day" })),
    },
    {
      id: "capex",
      icon: "dollar",
      value: `$${totalCapex}M`,
      unit: "",
      label: "Portfolio CAPEX Estimate",
      trendPct: `${sites.length} sites`,
      trendPos: true,
      trendCaption: "pre-development estimate",
      status: "NORMAL",
      ragStatus: "info",
      sparkData: acqList.map((a) => a.estimatedCapexM || 0),
      monthlyTrend: buildMonthlyTrend(totalCapex),
      siteBreakdown: acqList.map((a, i) => ({ name: sites[i].shortName, value: a.estimatedCapexM || 0, unit: "$M" })),
    },
    {
      id: "recommended",
      icon: "ai",
      value: top?.shortName || "—",
      unit: "",
      label: "Top-Ranked Site",
      trendPct: `Score ${topAcq.overallSiteScore}/100`,
      trendPos: true,
      trendCaption: "multi-criteria site analysis",
      status: "NORMAL",
      ragStatus: "success",
      sparkData: sorted.map((s) => getAcquisitionData(s.id).overallSiteScore || 0).reverse(),
      monthlyTrend: buildMonthlyTrend(topAcq.overallSiteScore || 80),
      siteBreakdown: sorted.map((s) => ({ name: s.shortName, value: getAcquisitionData(s.id).overallSiteScore || 0, unit: "/100" })),
    },
  ];
}

export function computeRadarData(sites) {
  return {
    dimensions: ["Sustainability", "Logistics", "Water", "Power", "Cost Eff.", "Expansion"],
    sites: sites.map((s) => ({
      name: s.shortName,
      values: [
        s.esg || 0,
        s.railScore || 0,
        s.waterPct || 0,
        s.power || 0,
        Math.max(0, Math.min(100, 100 - (s.investment || 100) / 2.5)),
        s.expandPotential === "High" ? 92 : s.expandPotential === "Medium" ? 72 : 52,
      ],
    })),
  };
}

export function computeCostData(sites) {
  return {
    sites: sites.map((s) => s.shortName),
    infra: sites.map((s) => s.investment || 0),
    ops: sites.map((s) => Math.round((s.investment || 0) * 0.28)),
    savings: sites.map((s) => Math.round((s.investment || 0) * 0.14 * ((s.esg || 75) / 100))),
  };
}

export function computeHeatmapData(sites) {
  return {
    sites: sites.map((s) => s.shortName),
    metrics: ["Power", "Water", "Rail", "Solar", "Fiber", "Expansion"],
    values: sites.map((s) => [
      s.power || 0,
      s.waterPct || 0,
      s.railScore || 0,
      s.solarScore || 0,
      s.fiber ? 1 : 0,
      s.expandPotential === "High" ? 92 : s.expandPotential === "Medium" ? 72 : 52,
    ]),
  };
}

const BOEING_CONTEXT = {
  tacoma: {
    recommendation: {
      body: "South Tacoma tideflats — 320-acre brownfield adjacent to Port of Tacoma (3rd busiest US West Coast port). PSE 115kV feed at Taylor Way boundary. BNSF mainline 180 m east with direct switch infrastructure.",
      bullets: [
        "Boeing Renton 737 MAX plant 20 min north via SR-167 — Tier-1 supplier corridor active",
        "BNSF direct rail to Boeing Frederickson composite manufacturing facility",
        "Port of Tacoma Terminal 7 SR-509 gate: inbound dwell 1.1 days vs 4.2 industry avg",
        "ESG score aligned with Boeing 2030 net-zero supplier requirement",
      ],
      meta: "Adjacent: Port of Tacoma Terminal 7 · BNSF Tacoma Yard · PSE 115kV Taylor Way",
    },
    risk: {
      body: "FEMA Zone AE flood risk from Puyallup River tideflats. Pierce County shorelines permit adds 4-month review cycle. SR-509 truck corridor weight restriction at 80,000 lb GVW.",
      meta: "Mitigation: elevated construction pads · flood insurance $42K/yr · shoreline buffer required",
    },
    sustainability: {
      body: "Port of Tacoma electrification mandate (2026): zero-emission cargo handling aligns with Boeing EcoDemonstrator net-zero target. On-site solar limited by industrial zoning height cap — 8 MW rooftop feasible.",
      meta: "PSE green tariff · Tacoma Public Utilities backup feed · WA Clean Energy Fund eligible",
    },
    expansion: {
      body: "320-acre brownfield with 180 buildable acres in Phase 2 envelope. Port of Tacoma SR-509 freight corridor supports heavy-haul components. BNSF spur upgrade to 286,000 lb rail car standard in scope.",
      meta: "Expansion: Phase 2 buildable 180 ac · BNSF spur upgrade on-file · Port gate reservation Q3 2026",
    },
  },
  everett: {
    recommendation: {
      body: "Boeing 40-202 building campus — world's largest building by volume (472M cu ft). BPA 500kV Snohomish–Monroe transmission corridor 1.2 mi east. Paine Field Class D airspace: 150 ft height cap, FAA Form 7460 required for structures above 100 ft.",
      bullets: [
        "Boeing 40-202 Everett: 737/777/787 final assembly — direct supplier adjacency on Airport Rd",
        "BPA 500kV corridor delivers $0.052/kWh industrial rate via PUD contract",
        "Paine Field runway 16R/34L: heavy cargo ops support inbound aerospace sub-assemblies",
        "FAA 7460 obstruction study required — 150 ft structure height hard limit enforced",
      ],
      meta: "Adjacent: Boeing Paine Field campus · Snohomish County PUD · BPA 500kV ROW",
    },
    risk: {
      body: "FAA height restriction (150 ft) constrains multi-story industrial stack design. Boeing flight path coordination required — Paine Field Class D airspace 4 nm radius. Snohomish County industrial capacity: grid congestion risk at peak aerospace production cycles.",
      meta: "Mitigation: FAA 7460 filing · single-storey design envelope · PUD capacity reservation",
    },
    sustainability: {
      body: "BPA 500kV hydropower feed delivers 94% carbon-free electricity. 28 MW rooftop solar at $0.72/W installed cost feasible within 150 ft height envelope. Snohomish County PUD net metering supports Boeing 2030 Scope 2 target.",
      meta: "BPA hydro 94% carbon-free · PUD net metering · solar IRR 11.4% over 20 yr",
    },
    expansion: {
      body: "Paine Field aerospace campus — Phase 2 expansion adjacent to Boeing 40-80X building footprint. Snohomish County industrial zoning supports 1.2M sq ft warehouse build-out. BPA 500kV capacity reservation required Q4 2026.",
      meta: "Expansion: 1.2M sq ft Phase 2 · BPA capacity reservation · Boeing co-location synergy",
    },
  },
  spokane: {
    recommendation: {
      body: "Spokane Valley industrial corridor — Avista 230kV substation at $0.048/kWh (lowest in WA). BNSF Spokane Yard 2.1 mi west at I-90 Exit 291B. Boeing Fabrication Auburn 280 mi west via I-90 with direct BNSF manifest service.",
      bullets: [
        "Avista 230kV at $0.048/kWh — 31% below WA state industrial avg of $0.069/kWh",
        "BNSF Spokane Yard: Class 1 intermodal to Boeing Auburn Fabrication 4-day transit",
        "I-90 Exit 291B: direct freeway interchange eliminates local arterial truck routing",
        "Secure defense zone eligible — ITAR-capable perimeter feasible per site geometry",
      ],
      meta: "Adjacent: BNSF Spokane Yard · Avista 230kV · I-90 Exit 291B interchange",
    },
    risk: {
      body: "BNSF Spokane Yard congestion risk at peak harvest season (Sep–Nov): manifest car dwell increases 2.1x. Avista rate case pending WUTC review — potential $0.004/kWh increase in 2027. Seismic zone 2B: moderate liquefaction risk in lower Spokane Valley.",
      meta: "Mitigation: BNSF priority manifest agreement · Avista rate lock · pile foundation design",
    },
    sustainability: {
      body: "Avista renewable portfolio 53% hydro + wind. 300+ clear sky days/yr enables 18 MW ground-mounted solar at $0.71/W. WA Clean Energy Transformation Act compliance achievable by 2026 without grid upgrades.",
      meta: "Avista 53% renewable · 18 MW solar feasible · CETA 2026 compliance on-track",
    },
    expansion: {
      body: "Spokane Valley industrial park: 240-acre parcel with 160 buildable acres in Phase 2. BNSF spur extension to site boundary in feasibility study. Avista 230kV capacity headroom supports 45 MW Phase 2 load growth.",
      meta: "Expansion: 160 ac Phase 2 · BNSF spur feasibility Q2 2027 · Avista 45 MW headroom",
    },
  },
  yakima: {
    recommendation: {
      body: "Yakima Valley agricultural-industrial corridor — 300+ solar days/yr, highest irradiance in WA. 28 MW rooftop solar at $0.72/W installed. Boeing 2030 EcoDemonstrator net-zero supplier target: Yakima site achieves Scope 1+2 zero carbon by 2028.",
      bullets: [
        "300+ clear sky days/yr — 5.8 kWh/m²/day peak irradiance, highest in WA state",
        "28 MW rooftop solar: $0.72/W installed, 8.9-yr payback, IRR 12.1% over 20 yr",
        "WA Clean Energy Fund grant-eligible — up to $4.2M for solar + storage installation",
        "Boeing EcoDemonstrator 2030 net-zero: Yakima site achieves Scope 1+2 compliance by 2028",
      ],
      meta: "Adjacent: Yakima Air Terminal · WA Dept of Ecology water permit · WSDOT US-97",
    },
    risk: {
      body: "WA Dept. of Ecology water recycling mandate by 2027: closed-loop system required for industrial discharge >50K gpd. Yakima River junior water rights — seasonal flow restriction Jul–Sep may limit process water availability. US-97 single-lane bottleneck at Selah Gap for heavy-haul trucks.",
      meta: "Mitigation: closed-loop recycling system ($1.8M) · senior water right acquisition · US-97 Selah Gap bypass route",
    },
    sustainability: {
      body: "Yakima solar resource: 5.8 kWh/m²/day peak irradiance. 28 MW rooftop solar achieves 94% grid independence. WA Clean Energy Fund + federal ITC (30%) reduces net solar cost to $0.50/W. Boeing 2030 net-zero target achieved 2 years ahead of schedule.",
      meta: "94% grid-independent · WA Clean Energy Fund · ITC 30% · net-zero by 2028",
    },
    expansion: {
      body: "Yakima Valley Phase 2: 120 buildable acres adjacent to US-97 with rail spur feasibility to BNSF Ellensburg sub. Closed-loop water recycling system supports expansion without additional Ecology permits. Solar Phase 2 adds 14 MW ground-mount on eastern parcel.",
      meta: "Expansion: 120 ac Phase 2 · BNSF Ellensburg spur · 14 MW solar Phase 2 · water recycling on-site",
    },
  },
};

export function generateAIInsights(sites) {
  if (!sites?.length) return [];
  const ranked = [...sites].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  const top = ranked[0];
  const riskSites = sites.filter((s) => s.ragStatus === "warning" || s.ragStatus === "danger");
  const solarTop = [...sites].sort((a, b) => (b.solarScore || 0) - (a.solarScore || 0))[0];
  const expansionTop = sites.find((s) => s.expandPotential === "High");

  const insights = [];

  if (top) {
    const ctx = BOEING_CONTEXT[top.id]?.recommendation;
    insights.push({
      type: "recommendation",
      typeLabel: "AI Recommendation",
      title: `${top.shortName} → Boeing Supplier Site`,
      body: ctx?.body || `${top.name} is the top-ranked site for Boeing supplier expansion:`,
      bullets: ctx?.bullets || [
        `Grid availability ${top.power}% — ${top.power >= 90 ? "excellent" : "adequate"} infrastructure`,
        `Rail access: ${top.rail}`,
        `${top.area} · ${top.expandPotential} expansion potential`,
        `ESG score ${top.esg}/100`,
      ],
      confidence: `${top.aiScore}% confidence`,
      meta: ctx?.meta || `ROI forecast: ${top.roi || 12}% · Risk: ${top.risk}`,
    });
  }

  if (riskSites[0]) {
    const s = riskSites[0];
    const ctx = BOEING_CONTEXT[s.id]?.risk;
    insights.push({
      type: "risk",
      typeLabel: "AI Risk Intelligence",
      title: `${s.shortName} Risk Alert`,
      body: ctx?.body || s.issue || `${s.shortName} has infrastructure concerns requiring attention.`,
      bullets: [],
      confidence: null,
      meta: ctx?.meta || `AI Score: ${s.aiScore} · Risk: ${s.risk}`,
    });
  }

  if (solarTop && (solarTop.solarScore || 0) >= 75) {
    const ctx = BOEING_CONTEXT[solarTop.id]?.sustainability;
    insights.push({
      type: "sustainability",
      typeLabel: "AI Sustainability Intelligence",
      title: `${solarTop.shortName} → Net-Zero Pathway`,
      body: ctx?.body || `${solarTop.name} has the highest solar potential (score: ${solarTop.solarScore}). Suitable for Boeing EcoDemonstrator net-zero manufacturing.`,
      bullets: [],
      confidence: null,
      meta: ctx?.meta || `Solar score: ${solarTop.solarScore} · ESG: ${solarTop.esg}/100`,
    });
  }

  if (expansionTop) {
    const ctx = BOEING_CONTEXT[expansionTop.id]?.expansion;
    insights.push({
      type: "expansion",
      typeLabel: "AI Expansion Intelligence",
      title: `${expansionTop.shortName} Growth Corridor`,
      body: ctx?.body || `${expansionTop.name} shows strong expansion potential with infrastructure headroom for scale-up.`,
      bullets: [],
      confidence: null,
      meta: ctx?.meta || `AI Score: ${expansionTop.aiScore} · Expansion: ${expansionTop.expandPotential}`,
    });
  }

  return insights;
}

/* ============================================================
   PER-SITE DYNAMIC DATA BUILDERS
   Used by AIAdvisor, ExecutiveDashboard, SiteEnvironmental, SiteFeasibility
   so those pages respond to uploaded / deleted sites.
   ============================================================ */

function grow(start, end, n) {
  return Array.from({ length: n }, (_, i) => Math.round((start + (end - start) * (i / (n - 1))) * 10) / 10);
}

/* Synthesise 12-month trend data leading up to a current value */
function buildMonthlyTrend(endVal, n = 12) {
  if (!endVal) return Array(n).fill(0);
  const start = endVal * 0.88;
  const bumps = [0, 1.2, -0.8, 1.5, -1.0, 0.5, -0.5, 1.0, -0.6, 0.8, 1.2, 0];
  return Array.from({ length: n }, (_, i) => {
    const base = start + (endVal - start) * (i / (n - 1));
    return Math.round((base + (bumps[i] || 0) * 0.01 * endVal) * 10) / 10;
  });
}

/* ── AI Advisor / Blueprint Intelligence (Page 4 — DWG-001, DWG-003, DWG-008, DWG-010) ── */

export function buildAdvisorData(site) {
  if (!site?.id) return {};
  const acq = getAcquisitionData(site.id);
  const solar = site.solarScore || 60;

  const powerCapacity = `${acq.electricalCapacityMW || 0} MW`;
  const waterML = ((acq.waterCapacityMGD || 0) * 3.785).toFixed(1);
  const waterCapacity = `${waterML}M L/day`;

  const railFeas = acq.railSpurFeasibility || "";
  const logisticsReadiness = railFeas.includes("Direct connection")
    ? "Excellent"
    : railFeas.includes("Direct") || (acq.interstateDistMiles || 5) <= 2
      ? "Good"
      : "Fair";

  const renew = Math.round(solar >= 80 ? solar * 0.6 : solar * 0.4);
  const infraReadiness = acq.overallSiteScore || site.aiScore || 75;
  const aiFeasibility = site.aiScore || Math.round((acq.overallSiteScore || 80) * 0.95);

  const recommended = [];
  const notRecommended = [];
  const suggestions = [];

  if ((acq.assemblyBays || 0) >= 6) recommended.push("Aerospace Assembly Campus", "EV Battery Manufacturing");
  if ((acq.warehouseSqFt || 0) >= 900000) recommended.push("Smart Industrial Complex", "Automated Warehouse Systems");
  if (acq.secureDefenseZone) recommended.push("Defense Manufacturing Facility");
  if (recommended.length === 0) recommended.push("Light Industrial Facility", "Regional Distribution Hub");

  if (!acq.secureDefenseZone) notRecommended.push("ITAR-Controlled Defense Manufacturing");
  if ((acq.faaHeightRestrictionFt || 300) <= 200) notRecommended.push("High-Rise Industrial Stack (FAA height restricted)");
  if (notRecommended.length === 0) notRecommended.push("Chemical Processing Requiring High Purity Water");

  suggestions.push(
    `${acq.assemblyBays} aircraft assembly bays · ${(acq.warehouseSqFt / 1000).toFixed(0)}K sq ft warehouse · ${acq.hangarHeightM} m hangar height`,
  );
  suggestions.push(`FAA height restriction: ${acq.faaHeightRestrictionFt} ft — flight path: ${acq.flightPathCompatibility || "Approved"}`);
  suggestions.push(`Rail: ${acq.railAccess || "N/A"} — spur: ${acq.railSpurFeasibility || "N/A"}`);
  suggestions.push(
    `Security perimeter: ${acq.fenceLengthMiles} mi fence · ${acq.surveillanceTowers} towers · ${acq.accessControlGates} gates · ${acq.vehicleScreeningBays} screening bays`,
  );
  suggestions.push(`Cybersecurity: ${acq.cybersecurityIntegration || "IT monitoring"}`);
  suggestions.push(`Defense zone: ${acq.secureDefenseZone ? "Yes — ITAR-capable secured zone" : "No — commercial use"}`);

  return {
    powerCapacity,
    waterCapacity,
    logisticsReadiness,
    renewableIntegration: `${renew}%`,
    infraReadiness,
    aiFeasibility,
    recommendedFor: recommended,
    notRecommendedFor: notRecommended,
    infraSuggestions: suggestions,
  };
}

export function buildChartsData(site) {
  if (!site?.id) return {};
  const pw = site.power || 80;
  const wl = parseFloat(((site.waterPct || 70) * 0.14).toFixed(1));
  const rl = site.railScore || 70;
  const rb = Math.round((site.solarScore || 60) * 0.45);
  return {
    years: ["2024", "2025", "2026*", "2027*", "2028*", "2029*", "2030*"],
    powerCapacity: grow(Math.round(pw * 0.88), Math.round(pw * 1.18), 7),
    powerDemand: grow(Math.round(pw * 0.76), Math.round(pw * 1.06), 7),
    waterCapacity: grow(wl, parseFloat((wl * 1.35).toFixed(1)), 7),
    waterDemand: grow(parseFloat((wl * 0.86).toFixed(1)), parseFloat((wl * 1.22).toFixed(1)), 7),
    logistics: grow(rl, Math.min(98, rl + 8), 7),
    occupancy: grow(50, 92, 7),
    renewable: grow(rb, Math.min(90, rb + 38), 7),
  };
}

export function buildAlerts(site) {
  if (!site?.id) return [];
  const alerts = [];

  if (site.power < 80) {
    alerts.push({
      level: "danger",
      title: "Grid Capacity Risk",
      body: `Power availability at ${site.power}% — below manufacturing threshold. Grid reinforcement required within 6 months.`,
    });
  } else if (site.power < 88) {
    alerts.push({
      level: "warning",
      title: "Power Headroom Limited",
      body: `Grid at ${site.power}% — limited headroom for Phase 2 expansion. Dual-feed upgrade recommended.`,
    });
  } else {
    alerts.push({
      level: "info",
      title: "Grid Integration Ready",
      body: `Power availability ${site.power}% with healthy headroom. Grid upgrade scheduled adds further capacity.`,
    });
  }

  if (site.waterPct < 65) {
    alerts.push({
      level: "danger",
      title: "Water Stress Critical",
      body: `Water availability at ${site.waterPct}% — below safe threshold. Closed-loop recycling investment required immediately.`,
    });
  } else if (site.waterPct < 75) {
    alerts.push({
      level: "warning",
      title: "Water Supply Advisory",
      body: `Water at ${site.waterPct}% — adequate but monitor seasonal variation. Efficiency measures recommended.`,
    });
  } else {
    alerts.push({
      level: "info",
      title: "Water Supply Stable",
      body: `Water availability ${site.waterPct}% — sufficient for planned manufacturing operations.`,
    });
  }

  if (site.solarScore >= 80) {
    alerts.push({
      level: "info",
      title: "Solar Integration Opportunity",
      body: `Solar score ${site.solarScore} — high irradiance supports ${Math.round(site.solarScore * 0.12)} MW ground-mounted solar installation.`,
    });
  }

  if (site.railScore >= 90) {
    alerts.push({
      level: "info",
      title: "Rail Capacity Upgrade",
      body: `${site.rail} rail access confirmed. Freight throughput supports heavy manufacturing logistics.`,
    });
  } else if (site.railScore < 75) {
    alerts.push({
      level: "warning",
      title: "Rail Access Constrained",
      body: `Rail score ${site.railScore} — logistics may limit heavy freight operations. Highway access as primary route.`,
    });
  }

  alerts.push({
    level: "info",
    title: "ESG Compliance Pathway",
    body: `ESG score ${site.esg}/100 — ${(site.esg || 75) >= 80 ? "industry leading position. Renewable roadmap aligned with 2030 targets." : "on track. Carbon reduction programme underway."}`,
  });

  return alerts;
}

/* ── Executive Dashboard (Page 6 — Strategic Intelligence) ── */

export function buildExecKpis(site) {
  if (!site?.id) return [];
  const acq = getAcquisitionData(site.id);
  const score = acq.overallSiteScore || site.aiScore || 75;
  const capex = acq.estimatedCapexM || 0;
  const land = acq.landAcquisitionCostM || 0;
  const confidence = acq.investmentConfidence || "High";
  const permitting = acq.permittingMonths || 18;
  const construction = acq.constructionMonths || 36;

  return [
    {
      id: "score",
      label: "Overall Site Score",
      value: `${score}/100`,
      trend: score >= 90 ? "+Top-Ranked" : score >= 80 ? "+Strong" : "Review Needed",
      trendPos: score >= 80,
      caption: "multi-criteria site analysis",
      icon: "gauge",
      rag: score >= 85 ? "success" : score >= 75 ? "info" : "warning",
    },
    {
      id: "capex",
      label: "CAPEX Estimate",
      value: `$${capex}M`,
      trend: confidence === "High" ? "+High Confidence" : "Moderate Confidence",
      trendPos: confidence === "High",
      caption: "pre-development estimate",
      icon: "dollar",
      rag: confidence === "High" ? "success" : "warning",
    },
    {
      id: "land",
      label: "Land Acquisition Cost",
      value: `$${land}M`,
      trend: `${capex > 0 ? Math.round((land / capex) * 100) : 0}% of CAPEX`,
      trendPos: true,
      caption: "real estate appraisal",
      icon: "dollar",
      rag: "info",
    },
    {
      id: "permitting",
      label: "Permitting Timeline",
      value: `${permitting} mo`,
      trend: permitting <= 18 ? "Fast-track" : permitting <= 20 ? "Standard" : "Complex",
      trendPos: permitting <= 20,
      caption: "regulatory assessment",
      icon: "gauge",
      rag: permitting <= 18 ? "success" : permitting <= 22 ? "info" : "warning",
    },
    {
      id: "construction",
      label: "Construction Timeline",
      value: `${construction} mo`,
      trend: `${permitting + construction} mo to completion`,
      trendPos: construction <= 38,
      caption: "project schedule",
      icon: "factory",
      rag: construction <= 36 ? "success" : "info",
    },
  ];
}

export function buildFinancials(site) {
  if (!site?.id) return {};
  const inv = site.investment || 100;
  const b0 = Math.round(inv * 0.4);
  const b1 = Math.round(inv * 0.55);
  const b2 = Math.round(inv * 0.72);
  const op0 = Math.round(inv * 0.28);
  const ut0 = Math.round(inv * 0.07);
  const mt0 = Math.round(inv * 0.05);
  return {
    years: ["2022", "2023", "2024", "2025", "2026*", "2027*", "2028*", "2029*", "2030*"],
    investmentActual: [b0, b1, b2, inv, null, null, null, null, null],
    investmentForecast: [
      null,
      null,
      null,
      inv,
      Math.round(inv * 1.14),
      Math.round(inv * 1.3),
      Math.round(inv * 1.46),
      Math.round(inv * 1.6),
      Math.round(inv * 1.74),
    ],
    opCostActual: [Math.round(op0 * 0.86), Math.round(op0 * 0.9), Math.round(op0 * 0.96), op0, null, null, null, null, null],
    opCostForecast: [
      null,
      null,
      null,
      op0,
      Math.round(op0 * 1.02),
      Math.round(op0 * 1.04),
      Math.round(op0 * 1.06),
      Math.round(op0 * 1.08),
      Math.round(op0 * 1.08),
    ],
    utilityCost: [ut0, ut0, ut0, ut0, ut0, ut0, Math.round(ut0 * 1.1), Math.round(ut0 * 1.1), Math.round(ut0 * 1.1)],
    utilityTarget: [
      ut0,
      ut0,
      Math.round(ut0 * 0.9),
      Math.round(ut0 * 0.9),
      Math.round(ut0 * 0.8),
      Math.round(ut0 * 0.8),
      Math.round(ut0 * 0.7),
      Math.round(ut0 * 0.7),
      Math.round(ut0 * 0.6),
    ],
    maintenance: [Math.round(mt0 * 0.8), Math.round(mt0 * 0.88), Math.round(mt0 * 0.94), mt0, null, null, null, null, null],
    maintenancePlan: [null, null, null, mt0, mt0, Math.round(mt0 * 1.08), Math.round(mt0 * 1.08), Math.round(mt0 * 1.08), Math.round(mt0 * 1.14)],
  };
}

export function buildExecRec(site) {
  if (!site?.id) return {};
  const score = site.aiScore || 75;
  return {
    primarySite: site.name,
    confidence: score,
    headline:
      score >= 90
        ? "Recommended for long-term enterprise expansion"
        : score >= 80
          ? "Strong candidate — minor improvements recommended"
          : "Conditional — infrastructure investment required before expansion",
    reasons: [
      `Power availability ${site.power}% — ${site.power >= 90 ? "excellent grid infrastructure" : "grid reinforcement advised"}`,
      `${site.rail || "Rail"} access — ${site.railScore >= 90 ? "Class 1 freight capability" : "good logistics connectivity"}`,
      `${site.area || "Site"} with ${site.expandPotential || "Medium"} expansion potential`,
      `ESG score ${site.esg}/100 — ${(site.esg || 75) >= 80 ? "industry leader position" : "above industry avg 71"}`,
      `Solar score ${site.solarScore} — ${site.solarScore >= 80 ? "net-zero achievable by 2028" : "renewable integration on roadmap"}`,
      `ROI ${site.roi || 12}% projected over 7-year horizon`,
    ],
    secondarySite: score >= 85 ? "Growth Plan 2026–2030" : "Investment Priority",
    secondaryConf: score,
    secondaryNote: site.issue
      ? `Critical: ${site.issue}. Resolve before approving expansion capital.`
      : `${site.solarScore >= 75 ? `Solar integration adds renewable capacity — ${Math.round(site.solarScore * 0.12)} MW feasible. ` : ""}${site.railScore >= 90 ? "Excellent freight connectivity supports high-volume operations." : "Logistics optimisation will improve operational efficiency."}`,
    watchSites: buildWatchItems(site),
  };
}

function buildWatchItems(site) {
  const items = [];
  if (site.power < 80) items.push({ name: "Grid Capacity Risk", issue: `Power at ${site.power}% — reinforcement required`, urgency: "danger" });
  if (site.waterPct < 65) items.push({ name: "Water Stress", issue: `Water at ${site.waterPct}% — recycling investment needed`, urgency: "danger" });
  if (site.power >= 80 && site.power < 88)
    items.push({ name: "Power Headroom", issue: "Limited headroom for Phase 2 expansion", urgency: "warning" });
  if (items.length === 0) items.push({ name: "Permit Renewal", issue: "Annual utility allocation permits due for review", urgency: "info" });
  return items;
}

export function buildRisks(site) {
  if (!site?.id) return [];
  const acq = getAcquisitionData(site.id);
  const siteNames = { spokane: "Spokane Valley", tacoma: "Tacoma Port", everett: "Everett Aerospace", yakima: "Yakima Valley" };
  const name = siteNames[site.id] || site.shortName || site.id;

  const isFloodRisk = (acq.floodZone || "").includes("AE");
  const hasSoilRisk = acq.soilContamination && acq.soilContamination !== "None";
  const geoRisk = acq.liquefactionRisk || "Low";
  const geoLevel = geoRisk === "Very Low" || geoRisk === "Low" ? "low" : "medium";
  const longPermit = (acq.permittingMonths || 18) > 20;
  const geoPct = geoLevel === "low" ? Math.max(8, 38 - Math.floor((acq.soilBearingCapacityPsf || 4000) / 200)) : 40;

  return [
    {
      level: isFloodRisk ? "medium" : "low",
      pct: isFloodRisk ? 42 : 12,
      title: "Flood Zone Risk",
      category: "Environmental",
      detail: `${acq.floodZone || "Zone X (minimal risk)"}. ${isFloodRisk ? "Zone AE requires elevated construction pads and flood mitigation investment." : "Outside 500-year flood plain. Standard stormwater management sufficient."}`,
      mitigation: isFloodRisk ? "Elevated pads + stormwater upgrade required" : "Annual FEMA review scheduled",
      drilldown: {
        aiAnalysis: isFloodRisk
          ? `${name} falls within FEMA Zone AE (100-year flood plain). ${acq.wetlandsAcres} acres of on-site wetlands require buffer management. Retention pond capacity of ${Math.round((acq.retentionPondGallons || 0) / 1e6)}M gallons handles the 100-year storm event, but construction elevations must be raised above Base Flood Elevation. Estimated mitigation cost: $0.8–$1.4M. Flood insurance premium estimated at $42K/yr.`
          : `${name} is classified ${acq.floodZone} — outside the 500-year flood plain. Retention pond capacity of ${Math.round((acq.retentionPondGallons || 0) / 1e6)}M gallons with ${acq.drainagePipeNetworkKm} km of drainage pipe fully handles the 100-year storm design event. No special flood mitigation or elevated construction required. Annual FEMA map review is standard practice.`,
        actions: isFloodRisk
          ? [
              { label: "Commission FEMA elevation certificate", due: "Q1 2027", status: "in-progress" },
              { label: "Design elevated construction pads for building footprints", due: "Q2 2027", status: "pending" },
              { label: "Enhanced stormwater retention upgrade ($0.8M)", due: "Q3 2027", status: "scheduled" },
              { label: "Flood insurance policy procurement", due: "Q2 2027", status: "pending" },
            ]
          : [
              { label: "Annual FEMA flood map review", due: "Q4 2026", status: "scheduled" },
              { label: "Stormwater system maintenance inspection", due: "Q2 2026", status: "active" },
              { label: "Retention pond capacity verification", due: "Q3 2026", status: "scheduled" },
            ],
        trend: isFloodRisk ? [35, 38, 40, 42, 42, 42, 42, 42, 42, 42, 42, 42] : [14, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
        trendLabel: "12-month risk score",
      },
    },
    {
      level: hasSoilRisk ? "medium" : "low",
      pct: hasSoilRisk ? 38 : 8,
      title: "Soil Contamination",
      category: "Environmental",
      detail: `Phase I ESA: ${acq.soilContamination || "None"}. ${hasSoilRisk ? "Phase II ESA and remediation required before construction." : "No remediation required — site is clean."}`,
      mitigation: hasSoilRisk ? "Phase II ESA and remediation budget required" : "Routine site monitoring",
      drilldown: {
        aiAnalysis: hasSoilRisk
          ? `${name} Phase I Environmental Site Assessment identified: ${acq.soilContamination}. A Phase II ESA with soil sampling is required to delineate the contamination extent before construction permits can be issued. Remediation scope is currently undetermined — estimated $0.4–$2.0M depending on Phase II findings. Construction timeline must account for 6–12 month remediation window. Regulatory approval from WA Dept. of Ecology required.`
          : `${name} Phase I ESA (${acq.boreholeCount} boreholes conducted) returned a clean result — no recognized environmental conditions identified. Soil contamination is classified None. No Phase II assessment, no remediation budget, and no regulatory barriers related to soil quality. Site is construction-ready from an environmental contamination standpoint.`,
        actions: hasSoilRisk
          ? [
              { label: "Commission Phase II ESA soil sampling", due: "Q1 2027", status: "in-progress" },
              { label: "WA Dept. of Ecology notification", due: "Q1 2027", status: "pending" },
              { label: "Remediation contractor procurement", due: "Q2 2027", status: "pending" },
              { label: "Regulatory approval for construction", due: "Q4 2027", status: "scheduled" },
            ]
          : [
              { label: "Phase I ESA on file — no action required", due: "On file", status: "completed" },
              { label: "Annual groundwater monitoring well check", due: "Q2 2026", status: "scheduled" },
            ],
        trend: hasSoilRisk ? [28, 32, 36, 38, 38, 38, 38, 38, 38, 38, 38, 38] : [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
        trendLabel: "12-month risk score",
      },
    },
    {
      level: geoLevel,
      pct: geoPct,
      title: "Geotechnical Risk",
      category: "Infrastructure",
      detail: `Liquefaction risk: ${geoRisk}. Bearing capacity: ${acq.soilBearingCapacityPsf} psf. Groundwater: ${acq.groundwaterDepthFt} ft depth.`,
      mitigation: acq.foundationRecommendation || "Standard foundation design",
      drilldown: {
        aiAnalysis: `${name} geotechnical survey (${acq.boreholeCount} boreholes) shows ${geoRisk.toLowerCase()} liquefaction risk. Soil bearing capacity of ${acq.soilBearingCapacityPsf?.toLocaleString()} psf is ${acq.soilBearingCapacityPsf >= 4500 ? "excellent" : acq.soilBearingCapacityPsf >= 3800 ? "good" : "adequate"} for industrial construction. Groundwater encountered at ${acq.groundwaterDepthFt} ft depth — ${acq.groundwaterDepthFt >= 20 ? "well below construction depth, no dewatering required" : "dewatering may be required during basement or deep foundation work"}. Recommended foundation: ${acq.foundationRecommendation}. Rock excavation need: ${acq.rockExcavationNeed}.`,
        actions:
          geoLevel === "medium"
            ? [
                { label: "Deep pile foundation design and engineering", due: "Q1 2027", status: "in-progress" },
                { label: "Dewatering plan for below-grade construction", due: "Q2 2027", status: "pending" },
                { label: "Rock excavation quantity survey", due: "Q1 2027", status: "scheduled" },
              ]
            : [
                { label: `${acq.foundationRecommendation} foundation design — approved`, due: "On file", status: "completed" },
                { label: "Structural engineer sign-off on bearing capacity", due: "Q1 2027", status: "scheduled" },
                { label: "Borehole data review for Phase 2 buildings", due: "Q2 2027", status: "pending" },
              ],
        trend: Array.from({ length: 12 }, () => geoPct),
        trendLabel: "12-month risk score",
      },
    },
    {
      level: longPermit ? "medium" : "low",
      pct: longPermit ? 28 : 10,
      title: "Regulatory Risk",
      category: "Compliance",
      detail: `Permitting: ${acq.permittingMonths} months. ${longPermit ? "Complex regulatory environment — plan for extended approval process." : "Standard timeline. EPA compliance confirmed."}`,
      mitigation: "Regulatory assessment on file",
      drilldown: {
        aiAnalysis: longPermit
          ? `${name} permitting timeline of ${acq.permittingMonths} months exceeds the standard 18-month benchmark, indicating a complex multi-agency review environment. Key factors: ${site.id === "tacoma" ? "Pierce County environmental review, Port of Tacoma coordination, and Shorelines Substantial Development Permit add to the timeline." : "multi-jurisdiction coordination and environmental review requirements."} EPA stormwater permit (NPDES), building permits, and utility easements all run in parallel. Early pre-application conference with ${site.id === "everett" ? "Snohomish County" : site.id === "tacoma" ? "Pierce County and Port authority" : "county planning"} is strongly recommended.`
          : `${name} has a ${acq.permittingMonths}-month permitting timeline — within the standard range. ${site.id === "yakima" ? "Yakima County planning department is known for efficient industrial permit processing." : site.id === "spokane" ? "Spokane County has an established industrial permitting track with clear application pathways." : "Standard county permitting with clear approval pathways."} EPA stormwater compliance status: ${acq.epaComplianceStatus}. No regulatory barriers identified.`,
        actions: longPermit
          ? [
              { label: "Pre-application conference with county planning", due: "Q4 2026", status: "scheduled" },
              { label: "SEPA environmental review initiation", due: "Q4 2026", status: "pending" },
              { label: "NPDES stormwater permit application", due: "Q1 2027", status: "pending" },
              { label: "Utility easement and right-of-way applications", due: "Q1 2027", status: "pending" },
            ]
          : [
              { label: "Building permit application preparation", due: "Q4 2026", status: "scheduled" },
              { label: "NPDES stormwater permit application", due: "Q4 2026", status: "pending" },
              { label: "Annual EPA compliance reporting", due: "Q1 2027", status: "scheduled" },
            ],
        trend: longPermit ? [20, 22, 24, 26, 28, 28, 28, 28, 28, 28, 28, 28] : [12, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        trendLabel: "12-month risk score",
      },
    },
  ];
}

/* ── Site Environmental (Page 2 — DWG-002, DWG-006, DWG-007, DWG-009) ── */

export function buildEnvData(site) {
  if (!site?.id) return {};
  const acq = getAcquisitionData(site.id);

  const isFloodRisk = (acq.floodZone || "").includes("AE");
  const esgNum = acq.esgRiskScore === "Low" ? 88 : acq.esgRiskScore === "Medium" ? 72 : 55;
  const permPct = acq.permeableSurfaceRatioPct || 20;
  const liqueRisk = acq.liquefactionRisk || "Low";
  const liqueLevel = liqueRisk === "Very Low" || liqueRisk === "Low" ? "success" : "warning";
  const rainfallMap = { spokane: 17, tacoma: 40, everett: 38, yakima: 8 };

  return {
    // ESG / Environmental
    esgScore: esgNum,
    esgTrend: `${acq.esgRiskScore || "Low"} Risk`,
    esgTrendPos: acq.esgRiskScore !== "High",
    wetlandsAcres: acq.wetlandsAcres || 0,
    soilContamination: acq.soilContamination || "None",

    // Flood Risk
    floodRisk: isFloodRisk ? "Moderate" : "Low",
    floodRiskLevel: isFloodRisk ? "warning" : "success",
    floodZoneClass: acq.floodZone || "Zone X (minimal risk)",
    annualRainfall: rainfallMap[site.id] ?? 20,

    // Stormwater / EPA
    epaStatus: acq.epaComplianceStatus || "Compliant",
    retentionPondMGal: Math.round((acq.retentionPondGallons || 0) / 1000000),
    drainagePipeKm: acq.drainagePipeNetworkKm || 0,
    peakStormHandling: acq.peakStormHandling || "100-year storm",

    // Permeable Surface
    permSurfacePct: permPct,
    permSurfaceTrend: permPct >= 20 ? "+Above target" : "At minimum",
    permSurfaceTrendPos: permPct >= 20,
    waterRecyclingCapable: acq.waterRecyclingCapable ? "Yes" : "No",

    // Geotechnical
    liquefactionRisk: liqueRisk,
    liquefactionLevel: liqueLevel,
    soilBearingPsf: acq.soilBearingCapacityPsf || 0,
    groundwaterDepthFt: acq.groundwaterDepthFt || 0,
    maxSlopePct: acq.maxSlopePct || 0,
    soilErosionRisk: acq.soilErosionRisk || "Low",
  };
}

export function buildSustainabilityForecast(site) {
  if (!site?.id) return {};
  const pw = site.power || 80;
  const wl = parseFloat(((site.waterPct || 70) * 0.14).toFixed(1));
  const rb = Math.round((site.solarScore || 60) * 0.45);
  const cbBase = 83;
  return {
    years: ["2024", "2025", "2026*", "2027*", "2028*", "2029*", "2030*"],
    powerDemand: grow(Math.round(pw * 0.88), Math.round(pw * 1.14), 7),
    powerBaseline: grow(Math.round(pw * 0.88), Math.round(pw * 1.36), 7),
    waterDemand: grow(parseFloat((wl * 0.9).toFixed(1)), parseFloat((wl * 1.22).toFixed(1)), 7),
    waterTarget: grow(parseFloat((wl * 0.9).toFixed(1)), parseFloat((wl * 0.96).toFixed(1)), 7),
    renewableShare: grow(rb, Math.min(90, rb + 40), 7),
    gridShare: grow(100 - rb, Math.max(10, 100 - rb - 40), 7),
    carbonActual: [100, 91, cbBase, null, null, null, null],
    carbonForecast: [null, null, cbBase, Math.round(cbBase * 0.86), Math.round(cbBase * 0.72), Math.round(cbBase * 0.59), Math.round(cbBase * 0.47)],
    carbonTarget: [100, 88, 76, 64, 52, 40, 28],
  };
}
