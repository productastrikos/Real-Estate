import ReactECharts from "echarts-for-react";
import StatusChip from "../../components/ui/StatusChip.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";

const C = {
  blue: "#5b8de0", sky: "#38bdf8", teal: "#14b8a6", amber: "#f59e0b",
  pink: "#ec4899", indigo: "#6366f1", lime: "#a3e635", violet: "#8b5cf6",
  success: "#16a34a", warning: "#d97706",
  text: "#e8eef5", muted: "#afc3d8", faint: "#8ca0b6",
  panel: "#0a0a0a", surface: "#202020", grid: "rgba(255,255,255,0.05)",
};

const PALETTE = [C.blue, C.sky, C.teal, C.amber, C.pink, C.indigo, C.lime, C.violet];
const siteColor = (i) => PALETTE[i % PALETTE.length];

function RadarChart({ radarData }) {
  if (!radarData?.sites?.length) return null;
  const option = {
    backgroundColor: "transparent",
    tooltip: { backgroundColor: C.panel, borderColor: "rgba(255,255,255,0.12)", textStyle: { color: C.text, fontSize: 11 } },
    legend: { bottom: 0, textStyle: { color: C.muted, fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    radar: {
      indicator: radarData.dimensions.map((name) => ({ name, max: 100 })),
      shape: "polygon", radius: "65%", center: ["50%", "45%"],
      axisName: { color: C.faint, fontSize: 9 },
      splitLine: { lineStyle: { color: C.grid } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: C.grid } },
    },
    series: [{
      type: "radar",
      data: radarData.sites.map((site, i) => ({
        name: site.name,
        value: site.values,
        lineStyle: { color: siteColor(i), width: 1.8 },
        itemStyle: { color: siteColor(i) },
        areaStyle: { color: siteColor(i), opacity: 0.08 },
        symbol: "circle", symbolSize: 4,
      })),
    }],
  };
  return <ReactECharts option={option} style={{ height: 260, width: "100%" }} opts={{ renderer: "svg" }} />;
}

function CostBarChart({ costData }) {
  if (!costData?.sites?.length) return null;
  const option = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: C.panel, borderColor: "rgba(255,255,255,0.12)", textStyle: { color: C.text, fontSize: 10 } },
    legend: { bottom: 0, textStyle: { color: C.muted, fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    grid: { top: 16, right: 16, bottom: 40, left: 48 },
    xAxis: { type: "category", data: costData.sites, axisLabel: { color: C.faint, fontSize: 9 }, axisLine: { lineStyle: { color: C.grid } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { color: C.faint, fontSize: 9, formatter: "${value}M" }, splitLine: { lineStyle: { color: C.grid } }, axisLine: { show: false } },
    series: [
      { name: "Infrastructure", type: "bar", stack: "cost", data: costData.infra, itemStyle: { color: C.blue }, barMaxWidth: 36 },
      { name: "Operations", type: "bar", stack: "cost", data: costData.ops, itemStyle: { color: C.sky } },
      { name: "ESG Savings", type: "bar", stack: "cost", data: costData.savings.map((v) => -v), itemStyle: { color: `${C.success}cc`, borderRadius: [4, 4, 0, 0] } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 260, width: "100%" }} opts={{ renderer: "svg" }} />;
}

function TrendChart({ growthData }) {
  if (!growthData) return null;
  const option = {
    backgroundColor: "transparent",
    tooltip: { trigger: "axis", backgroundColor: C.panel, borderColor: "rgba(255,255,255,0.12)", textStyle: { color: C.text, fontSize: 10 } },
    legend: { bottom: 0, textStyle: { color: C.muted, fontSize: 10 }, itemWidth: 10, itemHeight: 10 },
    grid: { top: 16, right: 16, bottom: 40, left: 44 },
    xAxis: { type: "category", data: growthData.years, axisLabel: { color: C.faint, fontSize: 9 }, axisLine: { lineStyle: { color: C.grid } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { color: C.faint, fontSize: 9 }, splitLine: { lineStyle: { color: C.grid } }, axisLine: { show: false } },
    series: [
      { name: "Industrial Growth", type: "line", data: growthData.actual, smooth: true, symbol: "circle", symbolSize: 4, lineStyle: { color: C.blue, width: 2 }, itemStyle: { color: C.blue }, areaStyle: { color: `${C.blue}1a` }, connectNulls: false },
      { name: "Growth Forecast", type: "line", data: growthData.forecast, smooth: true, symbol: "circle", symbolSize: 4, lineStyle: { color: C.violet, width: 2, type: "dashed" }, itemStyle: { color: C.violet }, connectNulls: false },
      { name: "Utility Demand", type: "line", data: growthData.utility, smooth: true, symbol: "none", lineStyle: { color: C.amber, width: 1.5, type: "dashed" }, itemStyle: { color: C.amber } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 260, width: "100%" }} opts={{ renderer: "svg" }} />;
}

function HeatmapChart({ heatmapData }) {
  if (!heatmapData?.sites?.length) return null;
  const data = [];
  heatmapData.values.forEach((row, si) => row.forEach((val, mi) => data.push([mi, si, val])));
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      formatter: (p) => `${heatmapData.sites[p.value[1]]}<br>${heatmapData.metrics[p.value[0]]}: <b>${p.value[2]}${p.value[2] <= 1 ? "" : "%"}</b>`,
      backgroundColor: C.panel, borderColor: "rgba(255,255,255,0.12)", textStyle: { color: C.text, fontSize: 10 },
    },
    grid: { top: 16, right: 16, bottom: 40, left: 80 },
    xAxis: { type: "category", data: heatmapData.metrics, axisLabel: { color: C.faint, fontSize: 9 }, axisLine: { lineStyle: { color: C.grid } }, axisTick: { show: false }, splitArea: { show: true, areaStyle: { color: ["transparent", `${C.grid}`] } } },
    yAxis: { type: "category", data: heatmapData.sites, axisLabel: { color: C.faint, fontSize: 9 }, axisLine: { show: false }, axisTick: { show: false } },
    visualMap: { min: 0, max: 100, show: false, inRange: { color: ["#1a1a2e", "#1a3a4a", "#0ea5e920", C.teal, C.blue] } },
    series: [{
      type: "heatmap", data,
      label: { show: true, color: C.text, fontSize: 9, fontWeight: 600, formatter: (p) => p.value[2] <= 1 ? (p.value[2] ? "Y" : "N") : `${p.value[2]}` },
      itemStyle: { borderColor: "#111", borderWidth: 1, borderRadius: 3 },
    }],
  };
  return <ReactECharts option={option} style={{ height: 260, width: "100%" }} opts={{ renderer: "svg" }} />;
}

function ComparisonTable({ sites }) {
  const pct = (v) => <span style={{ fontWeight: 600, color: v >= 90 ? C.success : v >= 80 ? C.blue : C.warning, fontVariantNumeric: "tabular-nums" }}>{v}%</span>;
  return (
    <div className="table-wrap">
      <table className="data-table" aria-label="Cross-site infrastructure comparison">
        <thead>
          <tr>
            <th>Site</th>
            <th className="num">Power</th>
            <th>Water</th>
            <th>Logistics</th>
            <th className="num">ESG</th>
            <th>Risk</th>
            <th className="num">AI Score</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id}>
              <td>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontWeight: 600, color: "var(--ds-text)" }}>{site.shortName}</span>
                  <span style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>{site.type}</span>
                </div>
              </td>
              <td className="num">{pct(site.power)}</td>
              <td><span style={{ color: (site.waterPct || 0) >= 80 ? C.success : (site.waterPct || 0) >= 60 ? C.amber : C.warning, fontWeight: 500 }}>{site.waterLabel}</span></td>
              <td style={{ color: "var(--ds-text-muted)" }}>{site.rail}</td>
              <td className="num"><span style={{ fontWeight: 600, color: site.esg >= 85 ? C.success : site.esg >= 75 ? C.blue : C.warning, fontVariantNumeric: "tabular-nums" }}>{site.esg}</span></td>
              <td><StatusChip status={site.riskLevel} label={site.risk} /></td>
              <td className="num"><span style={{ fontWeight: 700, color: site.aiScore >= 90 ? C.success : site.aiScore >= 85 ? C.blue : C.muted, fontVariantNumeric: "tabular-nums" }}>{site.aiScore}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BottomAnalytics() {
  const { sites, radarData, costData, heatmapData, growthData } = useSiteData();

  return (
    <section className="section" aria-label="Analytics">
      <div className="section__header">
        <span className="section-heading">Cross-Site Comparison</span>
        <span className="text-faint">Computed from {sites.length} active site{sites.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="panel" style={{ marginBottom: 16, overflow: "hidden" }}>
        <ComparisonTable sites={sites} />
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Infrastructure Radar</span>
            <span className="text-faint" style={{ fontSize: 9 }}>6 dimensions · {sites.length} sites</span>
          </div>
          <RadarChart radarData={radarData} />
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Cost Breakdown ($M)</span>
            <span className="text-faint" style={{ fontSize: 9 }}>Infra · Ops · ESG savings</span>
          </div>
          <CostBarChart costData={costData} />
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Industrial Growth Forecast</span>
            <span className="text-faint" style={{ fontSize: 9 }}>2020–2030 · * = predicted</span>
          </div>
          <TrendChart growthData={growthData} />
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Infrastructure Readiness Heatmap</span>
            <span className="text-faint" style={{ fontSize: 9 }}>Score / 100</span>
          </div>
          <HeatmapChart heatmapData={heatmapData} />
        </div>
      </div>
    </section>
  );
}
