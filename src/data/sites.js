/* ============================================================
   MOCK DATA — Washington State Manufacturing Sites
   ============================================================ */

export const SITES = [
  {
    id: "tacoma",
    name: "Tacoma Industrial Park",
    shortName: "Tacoma",
    coords: [47.1332, -122.5122],
    boundary: [
      [47.1410373, -122.5161645],
      [47.1387507, -122.5096691],
      [47.1391383, -122.5035156],
      [47.1339058, -122.4979318],
      [47.1230905, -122.5006098],
      [47.1228579, -122.5058517],
      [47.126502,  -122.5120052],
      [47.127161,  -122.5165633],
      [47.1283628, -122.519982],
      [47.134526,  -122.5215773],
      [47.137279,  -122.517841],
      [47.1389456, -122.52012],
      [47.1403796, -122.5154479],
    ],
    type: "EV Manufacturing",
    region: "Seattle Metro",
    area: "320 Acres",
    power: 98,
    water: "High",
    waterPct: 92,
    waterLabel: "High",
    rail: "Excellent",
    railScore: 95,
    highway: "Excellent",
    fiber: true,
    solar: "Medium",
    solarScore: 65,
    aiScore: 94,
    roi: 16,
    esg: 91,
    risk: "Low",
    riskLevel: "success",
    status: "NORMAL",
    ragStatus: "success",
    investment: 142,
    laborAvail: "High",
    expandPotential: "High",
    highlight: true,
    issue: null,
    description:
      "Prime EV manufacturing hub with exceptional grid infrastructure, excellent freight rail, and high expansion feasibility. Top-ranked site for near-term investment.",
    powerTrend: [94, 95, 96, 96, 97, 97, 98, 98, 98, 97, 98, 98],
    esgTrend: [82, 83, 84, 85, 85, 87, 87, 88, 89, 90, 91, 91],
  },
  {
    id: "everett",
    name: "Everett Aerospace Zone",
    shortName: "Everett",
    coords: [47.9591, -122.1533],
    boundary: [
      [47.9787, -122.1875], [47.9717, -122.1935], [47.9689, -122.1970],
      [47.9638, -122.1977], [47.9558, -122.1971], [47.9542, -122.1953],
      [47.9416, -122.1937], [47.9424, -122.1602], [47.9424, -122.1202],
      [47.9491, -122.1202], [47.9492, -122.1152], [47.9544, -122.1150],
      [47.9556, -122.1174], [47.9590, -122.1222], [47.9618, -122.1250],
      [47.9657, -122.1297], [47.9713, -122.1351], [47.9788, -122.1381],
    ],
    type: "Aerospace Manufacturing",
    region: "Everett",
    area: "480 Acres",
    power: 76,
    water: "Medium",
    waterPct: 68,
    waterLabel: "Medium",
    rail: "Good",
    railScore: 78,
    highway: "Excellent",
    fiber: true,
    solar: "Low",
    solarScore: 45,
    aiScore: 82,
    roi: 12,
    esg: 74,
    risk: "Medium",
    riskLevel: "warning",
    status: "WARNING",
    ragStatus: "warning",
    investment: 98,
    laborAvail: "High",
    expandPotential: "Medium",
    highlight: false,
    issue: "Power fluctuation risk — grid congestion due to rapid industrial expansion",
    description:
      "Major aerospace hub adjacent to Boeing facilities. Excellent highway and deep-water port access. Power capacity requires reinforcement within 18 months.",
    powerTrend: [88, 87, 86, 85, 84, 83, 82, 80, 79, 78, 77, 76],
    esgTrend: [70, 71, 71, 72, 72, 73, 73, 73, 74, 74, 74, 74],
  },
  {
    id: "spokane",
    name: "Spokane Logistics Corridor",
    shortName: "Spokane",
    coords: [47.6377, -117.4501],
    boundary: [
      [47.6124, -117.4642], [47.6123, -117.4311], [47.6184, -117.4200],
      [47.6206, -117.4261], [47.6239, -117.4293], [47.6286, -117.4294],
      [47.6330, -117.4308], [47.6389, -117.4350], [47.6409, -117.4401],
      [47.6463, -117.4432], [47.6510, -117.4461], [47.6543, -117.4498],
      [47.6606, -117.4528], [47.6663, -117.4581], [47.6515, -117.4861],
      [47.6456, -117.4849], [47.6478, -117.4758], [47.6382, -117.4723],
      [47.6249, -117.4759],
    ],
    type: "Logistics Hub",
    region: "Spokane",
    area: "260 Acres",
    power: 88,
    water: "High",
    waterPct: 85,
    waterLabel: "High",
    rail: "Excellent",
    railScore: 92,
    highway: "Good",
    fiber: true,
    solar: "High",
    solarScore: 88,
    aiScore: 87,
    roi: 14,
    esg: 83,
    risk: "Low",
    riskLevel: "success",
    status: "NORMAL",
    ragStatus: "success",
    investment: 88,
    laborAvail: "Medium",
    expandPotential: "High",
    highlight: false,
    issue: null,
    description:
      "Strategic eastside logistics hub with exceptional rail and high solar potential. Industrial growth projected at 28% by 2030 driven by regional distribution demand.",
    powerTrend: [85, 85, 86, 86, 87, 87, 87, 88, 88, 88, 88, 88],
    esgTrend: [78, 79, 79, 80, 80, 81, 81, 82, 82, 83, 83, 83],
  },
  {
    id: "yakima",
    name: "Yakima Manufacturing Cluster",
    shortName: "Yakima",
    coords: [46.5831, -120.5852],
    boundary: [
      [46.5893, -120.6042], [46.5857, -120.6044], [46.5855, -120.5938],
      [46.5711, -120.5937], [46.5713, -120.5745], [46.5726, -120.5726],
      [46.5752, -120.5723], [46.5766, -120.5714], [46.5776, -120.5725],
      [46.5854, -120.5725], [46.5855, -120.5791], [46.5890, -120.5791],
      [46.5893, -120.5888], [46.5927, -120.5886], [46.5929, -120.5978],
      [46.5894, -120.5978],
    ],
    type: "Smart Industrial Park",
    region: "Yakima",
    area: "190 Acres",
    power: 82,
    water: "Medium",
    waterPct: 58,
    waterLabel: "Medium",
    rail: "Good",
    railScore: 72,
    highway: "Good",
    fiber: false,
    solar: "Very High",
    solarScore: 94,
    aiScore: 81,
    roi: 11,
    esg: 78,
    risk: "Medium",
    riskLevel: "warning",
    status: "WARNING",
    ragStatus: "warning",
    investment: 100,
    laborAvail: "Medium",
    expandPotential: "Medium",
    highlight: false,
    issue: "Water stress risk projected by 2029 — reservoir levels trending 18% below 10-year baseline",
    description:
      "High solar irradiance makes this ideal for solar-assisted or net-zero manufacturing. Water management infrastructure investment required before 2027.",
    powerTrend: [80, 80, 81, 81, 82, 82, 82, 83, 83, 82, 82, 82],
    esgTrend: [74, 74, 75, 75, 76, 76, 77, 77, 78, 78, 78, 78],
  },
];

/* ── KPI card data ───────────────────────────────────────── */
export const KPI_DATA = [
  {
    id: "total-sites",
    icon: "factory",
    value: "12",
    unit: "Sites",
    label: "Total Sites Managed",
    trendPct: "+33%",
    trendPos: true,
    trendCaption: "Added this quarter",
    status: "NORMAL",
    ragStatus: "success",
    sparkData: [6, 7, 7, 8, 8, 9, 9, 10, 11, 11, 12, 12],
  },
  {
    id: "recommended",
    icon: "ai",
    value: "Tacoma",
    unit: "",
    label: "Recommended Expansion Site",
    trendPct: "92%",
    trendPos: true,
    trendCaption: "AI confidence",
    status: "NORMAL",
    ragStatus: "success",
    sparkData: [80, 82, 83, 85, 86, 87, 88, 89, 90, 91, 92, 92],
  },
  {
    id: "esg",
    icon: "leaf",
    value: "84",
    unit: "/100 ESG",
    label: "Enterprise Sustainability Score",
    trendPct: "+7.7%",
    trendPos: true,
    trendCaption: "vs previous quarter",
    status: "NORMAL",
    ragStatus: "success",
    sparkData: [74, 75, 76, 77, 78, 79, 80, 80, 81, 82, 83, 84],
  },
  {
    id: "investment",
    icon: "dollar",
    value: "$428M",
    unit: "",
    label: "Infrastructure Investment",
    trendPct: "+10.9%",
    trendPos: true,
    trendCaption: "vs previous quarter",
    status: "NORMAL",
    ragStatus: "success",
    sparkData: [340, 355, 360, 368, 375, 382, 390, 398, 410, 418, 424, 428],
  },
  {
    id: "power",
    icon: "bolt",
    value: "96.4%",
    unit: "",
    label: "Power Availability",
    trendPct: "-1.2%",
    trendPos: false,
    trendCaption: "1 site has issue",
    status: "WARNING",
    ragStatus: "warning",
    alertSite: "Everett Aerospace Zone",
    alertMsg: "Power fluctuation risk detected",
    sparkData: [98, 98, 97, 98, 97, 97, 96, 97, 96, 97, 96, 96.4],
  },
  {
    id: "water",
    icon: "droplet",
    value: "81%",
    unit: "",
    label: "Water Sustainability",
    trendPct: "-3.1%",
    trendPos: false,
    trendCaption: "1 site at risk",
    status: "WARNING",
    ragStatus: "warning",
    alertSite: "Yakima Site",
    alertMsg: "Water stress risk projected by 2029",
    sparkData: [88, 87, 87, 86, 85, 85, 84, 83, 83, 82, 82, 81],
  },
  {
    id: "carbon",
    icon: "carbon",
    value: "28%",
    unit: "",
    label: "Carbon Reduction Potential",
    trendPct: "+4.2%",
    trendPos: true,
    trendCaption: "vs previous quarter",
    status: "NORMAL",
    ragStatus: "success",
    sparkData: [18, 19, 20, 21, 22, 23, 24, 25, 25, 26, 27, 28],
  },
  {
    id: "efficiency",
    icon: "gauge",
    value: "87%",
    unit: "",
    label: "Operational Efficiency",
    trendPct: "+2.1%",
    trendPos: true,
    trendCaption: "cross-site average",
    status: "NORMAL",
    ragStatus: "success",
    sparkData: [82, 82, 83, 83, 84, 84, 85, 85, 86, 86, 87, 87],
  },
];

/* ── Bottom analytics: radar dimensions per site ──────── */
export const RADAR_DATA = {
  dimensions: ["Sustainability", "Logistics", "Water", "Power", "Cost Eff.", "Expansion"],
  sites: [
    { name: "Tacoma", values: [91, 95, 92, 98, 78, 96] },
    { name: "Everett", values: [74, 88, 68, 76, 84, 72] },
    { name: "Spokane", values: [83, 92, 85, 88, 88, 90] },
    { name: "Yakima", values: [78, 72, 58, 82, 92, 70] },
  ],
};

/* ── Stacked bar: costs per site (in $M) ─────────────── */
export const COST_DATA = {
  sites: ["Tacoma", "Everett", "Spokane", "Yakima"],
  infra: [142, 98, 88, 100],
  ops: [42, 38, 32, 36],
  savings: [28, 14, 22, 18],
};

/* ── Trend chart: industrial growth forecast ──────────── */
export const GROWTH_DATA = {
  years: ["2020", "2021", "2022", "2023", "2024", "2025", "2026*", "2027*", "2028*", "2029*", "2030*"],
  actual: [100, 104, 108, 114, 120, 128, null, null, null, null, null],
  forecast: [null, null, null, null, null, 128, 136, 145, 155, 160, 164],
  utility: [100, 102, 105, 109, 115, 122, 130, 138, 147, 154, 160],
};

/* ── Heatmap: site × metric ───────────────────────────── */
export const HEATMAP_DATA = {
  sites: ["Tacoma", "Everett", "Spokane", "Yakima"],
  metrics: ["Power", "Water", "Rail", "Solar", "Fiber", "Expansion"],
  values: [
    [98, 92, 95, 65, 1, 96],
    [76, 68, 78, 45, 1, 72],
    [88, 85, 92, 88, 1, 90],
    [82, 58, 72, 94, 0, 70],
  ],
};

/* ── KPI drilldown modal content ──────────────────────── */
export const DRILLDOWN_CONTENT = {
  "total-sites": {
    title: "Total Sites Managed",
    subtitle: "12 Active Sites Across Washington State",
    description:
      "Tracks the total number of active manufacturing and logistics sites under enterprise management across Washington State. Growth in this metric indicates successful portfolio expansion and reflects the company's geographic diversification strategy.",
    threshold: {
      current: 12,
      max: 20,
      unit: "Sites",
      bands: [
        { label: "Critical", max: 4, color: "#dc2626" },
        { label: "Below Target", max: 8, color: "#d97706" },
        { label: "Target", max: 20, color: "#16a34a" },
      ],
    },
    aiRec:
      "Target Tacoma and Spokane for the next two expansion cycles based on infrastructure readiness scores (94% and 88% respectively) and ROI projections exceeding 14%. A phased approach with 2 additional sites by Q4 2026 is projected to increase portfolio value by $64M.",
    contexts: [
      {
        type: "info",
        heading: "Regional Distribution",
        body: "Seattle Metro (4 sites), Spokane (3 sites), Tacoma (2 sites), Yakima (2 sites), Everett (1 site).",
      },
      {
        type: "success",
        heading: "Quarterly Expansion — 3 New Sites",
        body: "Q1 2026 additions: two logistics hubs near Vancouver WA and one semiconductor campus in Redmond.",
      },
    ],
  },
  recommended: {
    title: "AI Recommended Site",
    subtitle: "Tacoma Industrial Park — 92% Confidence",
    description:
      "AI confidence score representing the model's certainty in its primary site recommendation for the next expansion cycle. Calculated from 47 infrastructure, environmental, financial, and logistics parameters. A higher score indicates stronger multi-dimensional alignment with enterprise manufacturing requirements.",
    threshold: {
      current: 92,
      max: 100,
      unit: "% Confidence",
      bands: [
        { label: "Low Confidence", max: 50, color: "#dc2626" },
        { label: "Moderate", max: 70, color: "#d97706" },
        { label: "High", max: 100, color: "#16a34a" },
      ],
    },
    aiRec:
      "Tacoma Industrial Park remains the top-ranked site with 92% confidence. Key drivers: 98% power availability, SR-509 highway direct access, BNSF rail adjacency, and ESG score of 91/100. Recommended action: commit Phase 2 expansion funding ($58M) before Q3 2026 to secure preferred build slot with primary contractor.",
    contexts: [
      {
        type: "success",
        heading: "Infrastructure Readiness",
        body: "Power 98%, excellent rail freight, Tier-1 fiber, SR-509 highway direct access, 320 acres available.",
      },
      {
        type: "info",
        heading: "ROI Prediction",
        body: "16% ROI over 7-year horizon. Break-even at Year 4. NPV at 8% discount rate: $38.4M positive.",
      },
    ],
  },
  esg: {
    title: "Enterprise Sustainability Score",
    subtitle: "84 / 100 — Industry Benchmark: 71",
    description:
      "Composite sustainability index measuring carbon emissions, water efficiency, renewable energy adoption, waste reduction, and community impact across all sites. Scored on a 0–100 scale benchmarked against the Pacific Northwest industrial sector. ESG score directly influences access to green financing facilities and regulatory compliance positioning.",
    threshold: {
      current: 84,
      max: 100,
      unit: "/ 100",
      bands: [
        { label: "Non-Compliant", max: 40, color: "#dc2626" },
        { label: "Below Benchmark", max: 65, color: "#d97706" },
        { label: "Leader", max: 100, color: "#16a34a" },
      ],
    },
    aiRec:
      "ESG score is 13 points above the industry benchmark. To reach 90+ (green bond eligibility threshold), close the two remaining gaps: (1) improve Yakima water reuse rate from 42% to 65% via closed-loop system investment ($2.8M), and (2) accelerate Tacoma green tariff transition. Combined impact: +6 ESG points within 18 months.",
    contexts: [
      { type: "success", heading: "Carbon Progress", body: "Scope 2 emissions reduced 18% YoY from Spokane solar and Tacoma green power tariff." },
      {
        type: "warning",
        heading: "Water Reuse — At Risk",
        body: "Yakima water reuse at 42%, dragging enterprise average. Remediation plan required by Q3 2026.",
      },
    ],
  },
  investment: {
    title: "Infrastructure Investment",
    subtitle: "$428M Total — Up $42M This Quarter",
    description:
      "Total committed capital across all site infrastructure programs including power grid, water utilities, transportation, and digital connectivity. Reflects cumulative spend on construction, equipment, and civil works. Trend growth indicates active portfolio expansion and capital redeployment from operational savings.",
    threshold: {
      current: 428,
      max: 600,
      unit: "$M",
      bands: [
        { label: "Underfunded", max: 150, color: "#dc2626" },
        { label: "Developing", max: 300, color: "#d97706" },
        { label: "On Track", max: 600, color: "#16a34a" },
      ],
    },
    aiRec:
      "Shift $12M from Everett standalone grid reinforcement to a shared renewable microgrid serving Everett + Tacoma. Projected cost reduction: 22%. Frees $8M for Yakima water recycling infrastructure, unlocking ESG uplift. Optimal capital reallocation improves enterprise ROI by 1.4 percentage points.",
    contexts: [
      {
        type: "info",
        heading: "Category Breakdown",
        body: "Power $168M · Water & utilities $94M · Transport & logistics $112M · Fiber & comms $54M.",
      },
      { type: "success", heading: "Tacoma Anchor", body: "$142M committed to Tacoma. Phase 2 expansion budgeted $58M for FY2027." },
    ],
  },
  power: {
    title: "Power Availability",
    subtitle: "96.4% Enterprise Average — 1 Site at Risk",
    description:
      "Average grid power availability across all sites, weighted by installed manufacturing capacity. Measures the percentage of scheduled operating hours where full power capacity is available without interruption, brownout, or planned curtailment. Critical for continuous manufacturing operations where even brief outages cause significant production loss.",
    threshold: {
      current: 96.4,
      max: 100,
      unit: "%",
      bands: [
        { label: "Critical (<80%)", max: 80, color: "#dc2626" },
        { label: "Warning (80–90%)", max: 90, color: "#d97706" },
        { label: "Target (90%+)", max: 100, color: "#16a34a" },
      ],
    },
    aiRec:
      "Deploy hybrid renewable backup system (2MW battery + 800kW solar canopy) at Everett site. Estimated cost $4.2M. Reduces grid dependency by 28% and eliminates peak-load risk within 9 months. Without intervention, Everett availability is projected to drop to 68% by Q2 2028 as regional industrial demand grows.",
    contexts: [
      {
        type: "warning",
        heading: "Alert: Everett Aerospace Zone",
        body: "Availability 76%. Grid congestion from 34% industrial load growth in Snohomish County.",
      },
      {
        type: "danger",
        heading: "Root Cause",
        body: "Snohomish PUD transmission corridor at 91% capacity. No upgrade until 2028 under current plan.",
      },
    ],
  },
  water: {
    title: "Water Sustainability",
    subtitle: "81% Enterprise Average — 1 Site At Risk",
    description:
      "Composite water sustainability index combining freshwater draw efficiency, reuse/recycling rate, drought risk exposure, and regulatory compliance across all sites. A score of 100% represents fully closed-loop water management with zero net freshwater draw increase. Declining scores indicate growing vulnerability to water stress and potential regulatory intervention.",
    threshold: {
      current: 81,
      max: 100,
      unit: "%",
      bands: [
        { label: "Critical (<60%)", max: 60, color: "#dc2626" },
        { label: "At Risk (60–75%)", max: 75, color: "#d97706" },
        { label: "Sustainable (75%+)", max: 100, color: "#16a34a" },
      ],
    },
    aiRec:
      "Install closed-loop industrial water recycling system at Yakima. Budget $2.8M. Reduces freshwater draw by 58%. Combined with Roza Canal augmentation plan, removes all stress risk. Payback period: 4.2 years via utility cost avoidance. This single investment also unlocks a $1.2M state water-efficiency grant.",
    contexts: [
      { type: "warning", heading: "Alert: Yakima Cluster", body: "Reservoir levels 18% below 10-year baseline. Stress threshold projected Q2 2029." },
      {
        type: "info",
        heading: "Usage Forecast",
        body: "Closed-loop recycling reduces risk by 62%. Combined with augmentation plan, eliminates risk entirely.",
      },
    ],
  },
  carbon: {
    title: "Carbon Reduction Potential",
    subtitle: "28% Achievable Reduction Across Portfolio",
    description:
      "Estimated total achievable Scope 1 and Scope 2 carbon emissions reduction across the enterprise portfolio, expressed as a percentage relative to the 2022 baseline. Calculated from renewable energy deployment potential, efficiency improvements, and electrification opportunities at each site. This is a forward-looking metric showing maximum achievable reduction with recommended capital investments.",
    threshold: {
      current: 28,
      max: 50,
      unit: "% Reduction",
      bands: [
        { label: "Minimal (<10%)", max: 10, color: "#dc2626" },
        { label: "Developing (10–20%)", max: 20, color: "#d97706" },
        { label: "On Track (20%+)", max: 50, color: "#16a34a" },
      ],
    },
    aiRec:
      "Execute the 3-phase renewable transition: Phase 1 (2026) — Spokane 6MW solar install (-4% enterprise carbon). Phase 2 (2027) — Yakima 8MW ground-mount (-7%). Phase 3 (2028) — Tacoma full green tariff conversion (-17%). Total investment: $22M. Net carbon reduction: 28% vs baseline, with carbon credit revenue partially offsetting cost.",
    contexts: [
      {
        type: "success",
        heading: "Solar Opportunities",
        body: "Yakima (94 solar score) + Spokane (88) offer 14MW combined. Carbon offset: ~9,200 tonnes CO₂/yr.",
      },
      {
        type: "info",
        heading: "Transition Timeline",
        body: "Without action, carbon footprint grows 12% by 2030. With plan: net 28% reduction achievable.",
      },
    ],
  },
  sewer: {
    title: "Wastewater Capacity",
    subtitle: "14.2 MGD — CRITICAL: Near Maximum Allocation",
    description:
      "Total municipal sewer discharge capacity allocated across all enterprise sites, measured in million gallons per day (MGD). This figure represents the aggregate permitted wastewater output limit negotiated with local utility authorities. Exceeding this threshold triggers mandatory operational curtailment, regulatory penalties, and potential facility shutdown orders. Current utilisation is approaching permitted limits across all fields.",
    threshold: {
      current: 14.2,
      max: 20,
      unit: "MGD",
      bands: [
        { label: "Critical (>13 MGD)", max: 13, color: "#dc2626" },
        { label: "Warning (8–13 MGD)", max: 18, color: "#d97706" },
        { label: "Safe (<8 MGD)", max: 20, color: "#16a34a" },
      ],
    },
    aiRec:
      "Immediate action required: negotiate emergency capacity expansion with King County Metro Wastewater (+3.5 MGD, est. $6.2M) and deploy on-site wastewater pre-treatment at Tacoma and Everett to reduce municipal discharge by 22%. Without intervention, all four sites will breach their individual allocation caps within 14 months, triggering regulatory penalties estimated at $1.8M/quarter.",
    contexts: [
      {
        type: "danger",
        heading: "Critical: Tacoma & Everett Near Cap",
        body: "Tacoma at 97% of 5.8 MGD permit. Everett at 94% of 4.2 MGD permit. Breach imminent without load reduction.",
      },
      {
        type: "warning",
        heading: "Permit Renewal Risk",
        body: "All four site discharge permits expire Q1 2027. Regulators reviewing allocation reductions of 15–20% due to regional sewer infrastructure constraints.",
      },
      {
        type: "info",
        heading: "Mitigation Options",
        body: "On-site grey-water recycling ($2.1M at Tacoma) reduces municipal load by 1.8 MGD. Zero-liquid-discharge system ($4.8M) could offset 3.2 MGD portfolio-wide.",
      },
    ],
  },
  efficiency: {
    title: "Operational Efficiency",
    subtitle: "87% Cross-Site Average",
    description:
      "Weighted average operational efficiency score across all manufacturing sites, integrating uptime, throughput ratio, energy efficiency per unit output, mean-time-to-repair (MTTR), and logistics cycle time. A benchmark of 87% positions the enterprise in the top quartile of Pacific Northwest industrial operators. Improvement is driven primarily by predictive maintenance deployment and process automation.",
    threshold: {
      current: 87,
      max: 100,
      unit: "%",
      bands: [
        { label: "Poor (<70%)", max: 70, color: "#dc2626" },
        { label: "Average (70–80%)", max: 80, color: "#d97706" },
        { label: "Good (80%+)", max: 100, color: "#16a34a" },
      ],
    },
    aiRec:
      "Extend predictive maintenance AI to Everett and Yakima — currently deployed only at Tacoma and Spokane. Projected efficiency gain: +6 points over 12 months. Estimated cost avoidance: $3.4M/year. Additionally, deploying automated AGV logistics at Everett's receiving dock would eliminate 14% of MTTR incidents linked to manual handling.",
    contexts: [
      {
        type: "success",
        heading: "Top Performer: Tacoma",
        body: "Efficiency 94% — automated logistics integration + 99.2% uptime on primary lines.",
      },
      { type: "info", heading: "Maintenance Performance", body: "MTTR improved 18% YoY. Predictive maintenance deployed at Tacoma and Spokane." },
    ],
  },
};
