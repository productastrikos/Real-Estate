import { useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { IcoClose, IcoTrendUp, IcoTrendDown, Ico } from "../icons/Icons.jsx";
import StatusChip from "./StatusChip.jsx";
import { DRILLDOWN_CONTENT } from "../../data/sites.js";

/* Compute 12 historical + 3 future month labels */
function getChartLabels() {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const labels = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(MONTHS[d.getMonth()]);
  }
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push(MONTHS[d.getMonth()] + "*");
  }
  return labels;
}

/* Generate 3-month linear projection from sparkData */
function generatePrediction(data) {
  if (!data || data.length < 2) return [null, null, null];
  const valid = data.filter((v) => v != null);
  const last = valid[valid.length - 1] ?? 0;
  const slice = valid.slice(-4);
  const trend = slice.length >= 2 ? (slice[slice.length - 1] - slice[0]) / (slice.length - 1) : 0;
  return [1, 2, 3].map((i) => Math.round((last + trend * i) * 10) / 10);
}

const C = {
  blue: "#5b8de0",
  sky: "#38bdf8",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  advisory: "#a78bfa",
  grid: "rgba(255,255,255,0.05)",
  text: "#8ca0b6",
  panel: "#0a0a0a",
};

/* ── 12-month trend + 3-month forecast chart ─────────────── */
function TrendChart({ data, labels, color }) {
  const pred = generatePrediction(data);
  const lastVal = data?.[data.length - 1] ?? 0;
  const histData = data ? [...data, null, null, null] : [];
  const predData = [...Array(11).fill(null), lastVal, ...pred];

  const option = {
    animation: false,
    backgroundColor: "transparent",
    grid: { top: 26, right: 16, bottom: 28, left: 44 },
    tooltip: {
      trigger: "axis",
      backgroundColor: C.panel,
      borderColor: "rgba(255,255,255,0.12)",
      textStyle: { color: "#e8eef5", fontSize: 11 },
      formatter: (params) => {
        const hist = params.find((p) => p.seriesName === "Historical");
        const fore = params.find((p) => p.seriesName === "Forecast");
        const lbl = params[0]?.name || "";
        let s = `<b>${lbl}</b><br/>`;
        if (hist?.value != null) s += `${hist.marker} ${hist.value}`;
        else if (fore?.value != null) s += `${fore.marker} Forecast: ${fore.value}`;
        return s;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: { color: C.text, fontSize: 9.5 },
      axisLine: { lineStyle: { color: C.grid } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: C.text, fontSize: 10 },
      splitLine: { lineStyle: { color: C.grid } },
      axisLine: { show: false },
    },
    series: [
      {
        name: "Historical",
        type: "line",
        data: histData,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { color, width: 2.5 },
        itemStyle: { color },
        connectNulls: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${color}33` },
              { offset: 1, color: `${color}00` },
            ],
          },
        },
      },
      {
        name: "Forecast",
        type: "line",
        data: predData,
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: { color: "#a78bfa", width: 2, type: "dashed" },
        itemStyle: { color: "#a78bfa" },
        connectNulls: false,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#a78bfa22" },
              { offset: 1, color: "#a78bfa00" },
            ],
          },
        },
        markArea: {
          silent: true,
          itemStyle: { color: "rgba(167,139,250,0.045)", borderWidth: 0 },
          label: { show: true, position: "insideTopLeft", color: "#a78bfa", fontSize: 8.5, fontWeight: 700, formatter: "Forecast ▸" },
          data: [[{ xAxis: labels[11] }, { xAxis: labels[14] }]],
        },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: 185, width: "100%" }} opts={{ renderer: "svg" }} />;
}

/* ── Threshold band visualiser ───────────────────────────── */
function ThresholdGauge({ threshold }) {
  if (!threshold) return null;
  const { current, max, unit, bands } = threshold;
  const pct = Math.min((current / max) * 100, 100);

  /* Build cumulative band segments */
  let cumulative = 0;
  const segments = bands.map((b) => {
    const start = cumulative;
    const width = (b.max / max) * 100 - cumulative;
    cumulative += width;
    return { ...b, start, width };
  });

  /* Find current band label */
  const currentBand = bands.find((b) => current <= b.max) || bands[bands.length - 1];

  return (
    <div className="modal-section">
      <div className="modal-section__label">Threshold Analysis</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: currentBand.color }}>
          {current}
          {unit && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 3, color: C.text }}>{unit}</span>}
        </span>
        <span
          style={{
            fontSize: 10,
            background: `${currentBand.color}22`,
            border: `1px solid ${currentBand.color}66`,
            color: currentBand.color,
            borderRadius: 6,
            padding: "2px 8px",
            fontWeight: 600,
          }}
        >
          {currentBand.label}
        </span>
      </div>

      {/* Track */}
      <div className="threshold-track">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="threshold-segment"
            style={{
              left: `${seg.start}%`,
              width: `${seg.width}%`,
              background: seg.color,
              opacity: 0.7,
              borderRadius: i === 0 ? "99px 0 0 99px" : i === segments.length - 1 ? "0 99px 99px 0" : "0",
            }}
          />
        ))}
        {/* Current value marker */}
        <div className="threshold-marker" style={{ left: `${pct}%` }} />
      </div>

      {/* Band labels */}
      <div className="threshold-labels">
        {bands.map((b) => (
          <div key={b.label} className="threshold-label" style={{ color: b.color }}>
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Context card ─────────────────────────────────────────── */
function ContextCard({ card }) {
  const colorMap = {
    success: "var(--ds-success)",
    warning: "var(--ds-warning)",
    danger: "var(--ds-danger)",
    advisory: "var(--ds-advisory)",
    info: "var(--ds-info)",
  };
  return (
    <div className={`modal-context-card ${card.type}`}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 4,
          color: colorMap[card.type] || colorMap.info,
        }}
      >
        {card.heading}
      </div>
      <div style={{ fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.55 }}>{card.body}</div>
    </div>
  );
}

/* ── Per-site breakdown bars ─────────────────────────────── */
function SiteBreakdown({ breakdown, avgLabel }) {
  if (!breakdown?.length) return null;
  const max = Math.max(...breakdown.map((b) => b.value), 1);
  return (
    <div className="modal-section">
      <div className="modal-section__label">Per-Site Breakdown</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {breakdown.map((site, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 72, fontSize: 11, color: "var(--ds-text-muted)", flexShrink: 0, fontWeight: 500 }}>{site.name}</div>
            <div style={{ flex: 1, height: 5, background: "var(--ds-border)", borderRadius: 99, overflow: "hidden", minWidth: 60 }}>
              <div style={{ height: "100%", width: `${(site.value / max) * 100}%`, background: "#5b8de0", borderRadius: 99 }} />
            </div>
            <div style={{ width: 84, fontSize: 11, color: "var(--ds-text)", textAlign: "right", flexShrink: 0, fontWeight: 600 }}>
              {site.value}
              {site.unit && <span style={{ fontSize: 9, color: "var(--ds-text-faint)", marginLeft: 3, fontWeight: 400 }}>{site.unit}</span>}
            </div>
          </div>
        ))}
        {avgLabel && (
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6, borderTop: "1px solid var(--ds-border)", fontSize: 11 }}>
            <span style={{ color: "var(--ds-text-faint)" }}>Portfolio avg:&nbsp;</span>
            <span style={{ color: "var(--ds-text)", fontWeight: 700 }}>{avgLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main modal ───────────────────────────────────────────── */
/* Accepts either `kpi` (looks up DRILLDOWN_CONTENT by id)
   OR `directContent` (inline content object, bypasses lookup) */
export default function DrilldownModal({ kpi, directContent, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!kpi && !directContent) return null;
  const content = directContent || DRILLDOWN_CONTENT[kpi?.id];
  if (!content) return null;

  const sparkColor = kpi?.ragStatus === "warning" ? C.warning : kpi?.ragStatus === "danger" ? C.danger : C.blue;

  const trendLabels = getChartLabels();

  /* Two-column layout: left = metrics, right = trend + AI */
  return (
    <>
      <div className="modal-backdrop animate-fade-in" onClick={onClose} aria-hidden />
      <div className="modal-frame animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* ── HEADER ── */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: sparkColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ico name={kpi?.icon || content.icon || "gauge"} size={16} color="#fff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 id="modal-title" style={{ fontSize: 16, fontWeight: 700, color: "var(--ds-text)", margin: 0 }}>
                  {content.title}
                </h2>
                {kpi?.status && <StatusChip status={kpi.status} />}
              </div>
              <p style={{ fontSize: 12, color: "var(--ds-text-faint)", margin: 0 }}>{content.subtitle}</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <IcoClose size={15} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="modal-body">
          {/* Row 1: Current value + Trend badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "12px 16px",
              background: "var(--ds-surface)",
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--ds-text-faint)",
                  marginBottom: 3,
                }}
              >
                Current Value
              </div>
              <div style={{ fontSize: 30, fontWeight: 700, color: sparkColor, lineHeight: 1 }}>
                {kpi?.value || content.currentValue || "—"}
                {(kpi?.unit || content.unit) && (
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ds-text-faint)", marginLeft: 4 }}>{kpi?.unit || content.unit}</span>
                )}
              </div>
            </div>
            {(kpi?.trendPct || content.trendPct) && (
              <div style={{ borderLeft: "1px solid var(--ds-internal-divider)", paddingLeft: 20 }}>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--ds-text-faint)",
                    marginBottom: 3,
                  }}
                >
                  12-Month Trend
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {(kpi?.trendPos ?? content.trendPos) ? (
                    <IcoTrendUp size={14} style={{ color: "var(--ds-success)" }} />
                  ) : (
                    <IcoTrendDown size={14} style={{ color: "var(--ds-warning)" }} />
                  )}
                  <span
                    style={{ fontSize: 18, fontWeight: 700, color: (kpi?.trendPos ?? content.trendPos) ? "var(--ds-success)" : "var(--ds-warning)" }}
                  >
                    {kpi?.trendPct || content.trendPct}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--ds-text-faint)", marginTop: 2 }}>{kpi?.trendCaption || content.trendCaption}</div>
              </div>
            )}
          </div>

          {/* Two-column grid: left = description + threshold + contexts, right = trend chart + AI rec */}
          {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}> */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* LEFT COLUMN */}
            {/* <div> */}
            {/* Description */}
            {content.description && (
              <div className="modal-section">
                <div className="modal-section__label">What This Metric Measures</div>
                <p style={{ fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.65 }}>{content.description}</p>
              </div>
            )}

            {/* Threshold gauge */}
            <ThresholdGauge threshold={content.threshold} />

            {/* Per-site breakdown */}
            <SiteBreakdown
              breakdown={content.siteBreakdown}
              avgLabel={kpi?.value ? `${kpi.value}${kpi.unit ? " " + kpi.unit : ""}` : null}
            />

            {/* Context cards */}
            {content.contexts && content.contexts.length > 0 && (
              <div className="modal-section">
                <div className="modal-section__label">Detailed Analysis</div>
                {content.contexts.map((card, i) => (
                  <ContextCard key={i} card={card} />
                ))}
              </div>
            )}
            {/* </div> */}

            {/* RIGHT COLUMN */}
            {/* <div> */}
            {/* Trend chart */}
            {(content.monthlyTrend || kpi?.monthlyTrend) && (
              <div className="modal-section">
                <div className="modal-section__label">12-Month Trend + 3-Month Forecast</div>
                <div
                  style={{
                    background: "var(--ds-surface)",
                    borderRadius: 10,
                    padding: "8px 4px 4px",
                    border: "1px solid var(--ds-border)",
                  }}
                >
                  <TrendChart data={content.monthlyTrend || kpi?.monthlyTrend} labels={trendLabels} color={sparkColor} />
                </div>
              </div>
            )}

            {/* AI Recommendation */}
            {content.aiRec && (
              <div className="modal-section">
                <div className="modal-section__label">AI Recommendation</div>
                <div className="modal-ai-box">
                  <div className="modal-ai-box__header">
                    <div className="modal-ai-dot" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-advisory)" }}>AI Intelligence Engine</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--ds-text-muted)", lineHeight: 1.65 }}>{content.aiRec}</p>
                </div>
              </div>
            )}
            {/* </div> */}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {/* <button className="btn btn-advisory btn-sm">Export Insight</button> */}
            <button className="btn btn-control" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
