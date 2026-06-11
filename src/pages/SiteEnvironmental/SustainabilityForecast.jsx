import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";

/* ── Theme-aware colour hook ─────────────────────────────────────── */
function useThemeColors() {
  const [isLight, setIsLight] = useState(() => document.body?.dataset?.theme === "light");
  useEffect(() => {
    const obs = new MutationObserver(() => setIsLight(document.body?.dataset?.theme === "light"));
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return {
    text: isLight ? "#0d0d0d" : "#e8eef5",
    muted: isLight ? "#1f1f1f" : "#afc3d8",
    faint: isLight ? "#4a4a4a" : "#8ca0b6",
    grid: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)",
    panel: isLight ? "#ffffff" : "#0a0a0a",
    tooltipBorder: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)",
    cardBg: isLight ? "rgba(0,120,200,0.05)" : "rgba(56,189,248,0.06)",
    cardBorder: isLight ? "rgba(0,120,200,0.18)" : "rgba(56,189,248,0.14)",
    riskBg: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)",
    riskBorder: isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.07)",
  };
}

/* ── Per-site data ────────────────────────────────────────────────── */
const LAND_DATA = {
  tacoma: {
    cats: ["Industrial Zone", "Buffer Zone", "Wetland Restricted", "Expansion Reserve"],
    vals: [48, 22, 18, 12],
    cols: ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
  },
  everett: {
    cats: ["Industrial Zone", "Buffer Zone", "Wetland Restricted", "Expansion Reserve"],
    vals: [42, 28, 20, 10],
    cols: ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
  },
  spokane: {
    cats: ["Industrial Zone", "Buffer Zone", "Semi-Arid Restricted", "Expansion Reserve"],
    vals: [55, 20, 10, 15],
    cols: ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
  },
  yakima: {
    cats: ["Industrial Zone", "Agri. Buffer", "Semi-Arid Restricted", "Expansion Reserve"],
    vals: [50, 18, 14, 18],
    cols: ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"],
  },
};

const ACCESS_DATA = {
  tacoma: ["I-5 Highway Access", "Freight Corridor", "Port of Tacoma", "Industrial Site"],
  everett: ["SR-526 Access", "Boeing Corridor", "Everett Port", "Aerospace Campus"],
  spokane: ["US-395 Highway", "Rail Distribution Hub", "Inland Logistics", "Industrial Site"],
  yakima: ["I-82 Highway", "Agricultural Corridor", "Solar Access Route", "Industrial Site"],
};

const ACCESS_SUB = {
  tacoma: ["Primary arterial · 4 lanes", "2.1 mi dedicated haul road", "Deep-water container port", "Proposed site entry"],
  everett: ["Direct freeway ramp", "Restricted-access corridor", "Break-bulk capable", "Controlled-access campus"],
  spokane: ["High-capacity inland route", "BNSF connection point", "Multi-modal distribution", "Expansion-ready parcel"],
  yakima: ["Regional arterial", "50k-acre agricultural zone", "340+ days/yr irradiation", "Greenfield industrial"],
};

const UTIL_DATA = {
  tacoma: { cats: ["Power Grid", "Water Access", "Fiber Network", "Gas Line"], vals: [88, 92, 75, 80] },
  everett: { cats: ["Power Grid", "Water Access", "Fiber Network", "Gas Line"], vals: [90, 85, 85, 75] },
  spokane: { cats: ["Power Grid", "Water Access", "Fiber Network", "Gas Line"], vals: [92, 78, 68, 85] },
  yakima: { cats: ["Power Grid", "Water Access", "Fiber Network", "Gas Line"], vals: [82, 65, 60, 72] },
};

const UTIL_COLORS = ["#f59e0b", "#3b82f6", "#22d3ee", "#a855f7"];

const RISK_DATA = {
  tacoma: [
    { label: "Flood Risk", level: "MEDIUM" },
    { label: "Terrain Complexity", level: "LOW" },
    { label: "Stormwater Mgmt", level: "HIGH" },
    { label: "Env. Permits", level: "MEDIUM" },
  ],
  everett: [
    { label: "Coastal Setback", level: "HIGH" },
    { label: "Terrain Complexity", level: "LOW" },
    { label: "Seismic Risk", level: "MEDIUM" },
    { label: "Env. Permits", level: "HIGH" },
  ],
  spokane: [
    { label: "Flood Risk", level: "LOW" },
    { label: "Terrain Complexity", level: "MEDIUM" },
    { label: "Heat Risk", level: "LOW" },
    { label: "Env. Permits", level: "LOW" },
  ],
  yakima: [
    { label: "Heat Exposure", level: "HIGH" },
    { label: "Water Availability", level: "HIGH" },
    { label: "Terrain Complexity", level: "LOW" },
    { label: "Env. Permits", level: "MEDIUM" },
  ],
};

const RISK_COL = { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

/* ── Land Suitability (stacked horizontal bar) ───────────────────── */
function LandSuitabilityChart({ siteId, C }) {
  const d = LAND_DATA[siteId] || LAND_DATA.tacoma;
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: C.panel,
      borderColor: C.tooltipBorder,
      textStyle: { color: C.text, fontSize: 10 },
      formatter: (p) => p.map((i) => `${i.marker} ${i.seriesName}: ${i.value}%`).join("<br/>"),
    },
    legend: { bottom: 0, textStyle: { color: C.muted, fontSize: 9 }, itemWidth: 10, itemHeight: 10 },
    grid: { top: 12, right: 16, bottom: 40, left: 8 },
    xAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: C.faint, fontSize: 9, formatter: "{value}%" },
      splitLine: { lineStyle: { color: C.grid } },
      axisLine: { show: false },
    },
    yAxis: { type: "category", data: ["Land Use"], axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
    series: d.cats.map((cat, i) => ({
      name: cat,
      type: "bar",
      stack: "land",
      barMaxWidth: 28,
      data: [d.vals[i]],
      itemStyle: { color: d.cols[i], borderRadius: i === 0 ? [4, 0, 0, 4] : i === d.cats.length - 1 ? [0, 4, 4, 0] : 0 },
      label: { show: d.vals[i] > 10, position: "inside", formatter: `${d.vals[i]}%`, fontSize: 9, color: "#fff" },
    })),
  };
  return <ReactECharts option={option} style={{ height: 130, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Site Accessibility Flow (HTML) ──────────────────────────────── */
function AccessibilityFlow({ siteId, C }) {
  const steps = ACCESS_DATA[siteId] || ACCESS_DATA.tacoma;
  const subs = ACCESS_SUB[siteId] || ACCESS_SUB.tacoma;
  const icons = ["🛣️", "🚚", "🏗️", "🏭"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, padding: "8px 16px 4px" }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 8,
              padding: "7px 12px",
            }}
          >
            <span style={{ fontSize: 16 }}>{icons[i]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.text, fontFamily: "monospace", fontWeight: 600 }}>{step}</div>
              <div style={{ fontSize: 9, color: C.faint, fontFamily: "monospace", marginTop: 1 }}>{subs[i]}</div>
            </div>
            {i === steps.length - 1 && (
              <span
                style={{ fontSize: 8, color: "#22c55e", fontFamily: "monospace", border: "1px solid #22c55e", padding: "2px 6px", borderRadius: 4 }}
              >
                TARGET
              </span>
            )}
          </div>
          {i < steps.length - 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "2px 0" }}>
              <div style={{ width: 1, height: 8, background: "rgba(56,189,248,0.3)" }} />
              <div style={{ fontSize: 10, color: "rgba(56,189,248,0.5)" }}>▼</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Utility Availability (horizontal bars) ──────────────────────── */
function UtilityAvailabilityChart({ siteId, C }) {
  const d = UTIL_DATA[siteId] || UTIL_DATA.tacoma;
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: C.panel,
      borderColor: C.tooltipBorder,
      textStyle: { color: C.text, fontSize: 10 },
      formatter: (p) => `${p[0].name}: <b>${p[0].value}%</b>`,
    },
    grid: { top: 8, right: 56, bottom: 8, left: 100 },
    xAxis: { type: "value", max: 100, axisLabel: { show: false }, splitLine: { lineStyle: { color: C.grid } }, axisLine: { show: false } },
    yAxis: {
      type: "category",
      data: [...d.cats].reverse(),
      axisLabel: { color: C.muted, fontSize: 9, fontFamily: "monospace" },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 16,
        data: [...d.vals]
          .reverse()
          .map((v, i) => ({ value: v, itemStyle: { color: UTIL_COLORS[d.cats.length - 1 - i], borderRadius: [0, 4, 4, 0] } })),
        label: { show: true, position: "right", formatter: "{c}%", color: C.muted, fontSize: 9 },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 160, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Site Risk Grid (HTML) ───────────────────────────────────────── */
function SiteRiskGrid({ siteId, C }) {
  const risks = RISK_DATA[siteId] || RISK_DATA.tacoma;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 8px 4px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {risks.map((r) => (
          <div
            key={r.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: C.riskBg,
              border: `1px solid ${C.riskBorder}`,
              borderRadius: 7,
              padding: "8px 10px",
            }}
          >
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{r.label}</span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: 700,
                color: RISK_COL[r.level],
                border: `1px solid ${RISK_COL[r.level]}`,
                padding: "1px 7px",
                borderRadius: 4,
                background: `${RISK_COL[r.level]}18`,
              }}
            >
              {r.level}
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8, color: C.faint, fontFamily: "monospace", marginTop: 4, textAlign: "center" }}>
        Constraint assessment based on county planning &amp; environmental survey data
      </div>
    </div>
  );
}

/* ── Export ──────────────────────────────────────────────────────── */
export default function SustainabilityForecast({ forecastData, siteId = "tacoma" }) {
  const C = useThemeColors();
  return (
    <section className="section">
      <div className="section__header">
        <span className="section-heading">Site Feasibility Analysis</span>
        <span className="text-faint">Land use · Accessibility · Utility readiness · Risk constraints</span>
      </div>
      <div className="forecast-grid">
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Land Suitability Distribution</span>
            <span className="text-faint" style={{ fontSize: 9 }}>
              usable vs restricted allocation
            </span>
          </div>
          <LandSuitabilityChart siteId={siteId} C={C} />
        </div>
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Site Accessibility Flow</span>
            <span className="text-faint" style={{ fontSize: 9 }}>
              logistics &amp; connectivity chain
            </span>
          </div>
          <AccessibilityFlow siteId={siteId} C={C} />
        </div>
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Utility Availability</span>
            <span className="text-faint" style={{ fontSize: 9 }}>
              infrastructure readiness score
            </span>
          </div>
          <UtilityAvailabilityChart siteId={siteId} C={C} />
        </div>
        <div className="chart-card">
          <div className="chart-card__header">
            <span className="card-title">Site Risk &amp; Constraints</span>
            <span className="text-faint" style={{ fontSize: 9 }}>
              environmental &amp; planning blockers
            </span>
          </div>
          <SiteRiskGrid siteId={siteId} C={C} />
        </div>
      </div>
    </section>
  );
}
