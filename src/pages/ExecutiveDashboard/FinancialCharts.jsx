import ReactECharts from "echarts-for-react";

const C = {
  blue: "#5b8de0",
  teal: "#14b8a6",
  amber: "#f59e0b",
  green: "#16a34a",
  violet: "#8b5cf6",
  sky: "#38bdf8",
  orange: "#f97316",
  red: "#ef4444",
  muted: "#afc3d8",
  faint: "#5a7a94",
  text: "#e8eef5",
  panel: "#0a0a0a",
  grid: "rgba(255,255,255,0.05)",
};

const TT = { backgroundColor: C.panel, borderColor: "rgba(255,255,255,0.12)", textStyle: { color: C.text, fontSize: 10 } };

/* ── Static cross-site data ─────────────────────────────────────── */
const SITES_ORDER = ["Everett", "Tacoma", "Spokane", "Yakima"];

const INVEST_ALLOC = {
  "Power Infra": { data: [85, 72, 95, 60], color: "#f59e0b" },
  "Production": { data: [120, 105, 110, 95], color: "#38bdf8" },
  "Logistics": { data: [65, 88, 55, 48], color: "#a855f7" },
  "Utilities": { data: [42, 38, 45, 50], color: "#22d3ee" },
  "Sustainability": { data: [28, 22, 35, 45], color: "#22c55e" },
};

const RESOURCE_DIST = {
  "Power": { data: [40, 30, 38, 28], color: "#f59e0b" },
  "Cooling": { data: [20, 15, 18, 30], color: "#38bdf8" },
  "Water": { data: [15, 10, 14, 22], color: "#3b82f6" },
  "Logistics": { data: [25, 45, 30, 20], color: "#a855f7" },
};

const RADAR_DATA = {
  everett: [88, 82, 76, 72, 68],
  tacoma: [92, 78, 80, 70, 74],
  spokane: [72, 85, 88, 80, 90],
  yakima: [65, 80, 92, 94, 85],
};
const RADAR_INDICATORS = ["Logistics", "Utilities", "Scalability", "Sustainability", "Land Avail."];
const RADAR_COLORS = { everett: "#38bdf8", tacoma: "#f59e0b", spokane: "#22c55e", yakima: "#f97316" };

/* ── Per-site phase costing ─────────────────────────────────────── */
const PHASE_COST = {
  tacoma: [
    { p: "Land Preparation", v: 18 },
    { p: "Utility Routing", v: 32 },
    { p: "Foundation", v: 45 },
    { p: "Infrastructure Build", v: 58 },
    { p: "Commissioning", v: 22 },
  ],
  everett: [
    { p: "Land Preparation", v: 25 },
    { p: "Utility Routing", v: 38 },
    { p: "Foundation", v: 52 },
    { p: "Infrastructure Build", v: 72 },
    { p: "Commissioning", v: 28 },
  ],
  spokane: [
    { p: "Land Preparation", v: 15 },
    { p: "Utility Routing", v: 28 },
    { p: "Foundation", v: 40 },
    { p: "Infrastructure Build", v: 50 },
    { p: "Commissioning", v: 18 },
  ],
  yakima: [
    { p: "Land Preparation", v: 12 },
    { p: "Utility Routing", v: 24 },
    { p: "Foundation", v: 36 },
    { p: "Infrastructure Build", v: 44 },
    { p: "Commissioning", v: 15 },
  ],
};
const PHASE_COLS = ["#eab308", "#f97316", "#3b82f6", "#22d3ee", "#22c55e"];

/* ── Chart 1: Infrastructure Investment Allocation ───────────────── */
function InvestmentAllocationChart() {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      ...TT,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (p) => `<b>${p[0].axisValue}</b><br/>${p.map((i) => `${i.marker}${i.seriesName}: $${i.value}M`).join("<br/>")}`,
    },
    legend: { bottom: 0, textStyle: { color: C.muted, fontSize: 9 }, itemWidth: 10, itemHeight: 10 },
    grid: { top: 12, right: 12, bottom: 40, left: 52 },
    xAxis: {
      type: "category",
      data: SITES_ORDER,
      axisLabel: { color: C.faint, fontSize: 9 },
      axisLine: { lineStyle: { color: C.grid } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: C.faint, fontSize: 9, formatter: "${value}M" },
      splitLine: { lineStyle: { color: C.grid } },
      axisLine: { show: false },
    },
    series: Object.entries(INVEST_ALLOC).map(([name, { data, color }], i, arr) => ({
      name,
      type: "bar",
      stack: "invest",
      barMaxWidth: 36,
      data,
      itemStyle: { color, borderRadius: i === arr.length - 1 ? [4, 4, 0, 0] : 0 },
      label: { show: false },
    })),
  };
  return <ReactECharts option={option} style={{ height: 200, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Chart 2: Site Development Phase Costing ─────────────────────── */
function PhaseCostingChart({ siteId }) {
  const phases = PHASE_COST[siteId] || PHASE_COST.tacoma;
  const maxV = Math.max(...phases.map((p) => p.v));
  const option = {
    backgroundColor: "transparent",
    tooltip: { ...TT, trigger: "axis", axisPointer: { type: "shadow" }, formatter: (p) => `${p[0].name}: <b>$${p[0].value}M</b>` },
    grid: { top: 8, right: 60, bottom: 8, left: 120 },
    xAxis: {
      type: "value",
      max: Math.ceil(maxV * 1.15),
      axisLabel: { color: C.faint, fontSize: 9, formatter: "${value}M" },
      splitLine: { lineStyle: { color: C.grid } },
      axisLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: phases.map((p) => p.p).reverse(),
      axisLabel: { color: C.muted, fontSize: 9, fontFamily: "monospace" },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 16,
        data: [...phases].reverse().map((p, i) => ({
          value: p.v,
          itemStyle: { color: PHASE_COLS[phases.length - 1 - i], borderRadius: [0, 4, 4, 0] },
        })),
        label: { show: true, position: "right", formatter: "${c}M", color: C.muted, fontSize: 9 },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Chart 3: Infrastructure Resource Distribution ───────────────── */
function ResourceDistributionChart() {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      ...TT,
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (p) => `<b>${p[0].axisValue}</b><br/>${p.map((i) => `${i.marker}${i.seriesName}: ${i.value}%`).join("<br/>")}`,
    },
    legend: { bottom: 0, textStyle: { color: C.muted, fontSize: 9 }, itemWidth: 10, itemHeight: 10 },
    grid: { top: 12, right: 12, bottom: 40, left: 52 },
    xAxis: {
      type: "category",
      data: SITES_ORDER,
      axisLabel: { color: C.faint, fontSize: 9 },
      axisLine: { lineStyle: { color: C.grid } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: C.faint, fontSize: 9, formatter: "{value}%" },
      splitLine: { lineStyle: { color: C.grid } },
      axisLine: { show: false },
    },
    series: Object.entries(RESOURCE_DIST).map(([name, { data, color }], i, arr) => ({
      name,
      type: "bar",
      stack: "res",
      barMaxWidth: 36,
      data,
      itemStyle: { color, borderRadius: i === arr.length - 1 ? [4, 4, 0, 0] : 0 },
    })),
  };
  return <ReactECharts option={option} style={{ height: 200, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Chart 4: Expansion Readiness Radar ──────────────────────────── */
function ExpansionRadarChart() {
  const option = {
    backgroundColor: "transparent",
    tooltip: { ...TT, trigger: "item" },
    legend: {
      bottom: 0,
      textStyle: { color: C.muted, fontSize: 9 },
      itemWidth: 10,
      itemHeight: 10,
      data: Object.keys(RADAR_DATA).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
    },
    radar: {
      indicator: RADAR_INDICATORS.map((n) => ({ name: n, max: 100 })),
      center: ["50%", "48%"],
      radius: "62%",
      axisName: { color: C.muted, fontSize: 9, fontFamily: "monospace" },
      splitLine: { lineStyle: { color: C.grid } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.08)" } },
    },
    series: [
      {
        type: "radar",
        data: Object.entries(RADAR_DATA).map(([site, vals]) => ({
          name: site.charAt(0).toUpperCase() + site.slice(1),
          value: vals,
          lineStyle: { color: RADAR_COLORS[site], width: 1.8 },
          itemStyle: { color: RADAR_COLORS[site] },
          areaStyle: { color: `${RADAR_COLORS[site]}18` },
          symbol: "circle",
          symbolSize: 4,
        })),
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 200, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Export ─────────────────────────────────────────────────────── */
export default function FinancialCharts({ data, siteId = "tacoma" }) {
  const siteName = siteId.charAt(0).toUpperCase() + siteId.slice(1);
  const charts = [
    { title: "Infrastructure Investment Allocation", sub: "CAPEX by zone ($M) · all sites", el: <InvestmentAllocationChart /> },
    { title: "Site Development Phase Costing", sub: `${siteName} · build phase breakdown`, el: <PhaseCostingChart siteId={siteId} /> },
    { title: "Infrastructure Resource Distribution", sub: "% allocation by site · all sites", el: <ResourceDistributionChart /> },
    { title: "Expansion Readiness Comparison", sub: "multi-site capability radar", el: <ExpansionRadarChart /> },
  ];
  return (
    <div className="forecast-grid">
      {charts.map((c) => (
        <div key={c.title} className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">{c.title}</span>
            <span className="text-faint" style={{ fontSize: 9 }}>
              {c.sub}
            </span>
          </div>
          {c.el}
        </div>
      ))}
    </div>
  );
}
