import { IcoEye, IcoTrendUp, IcoTrendDown, Ico } from "../icons/Icons.jsx";
import StatusChip from "./StatusChip.jsx";
import Sparkline from "./Sparkline.jsx";

/* Icon background colour by KPI */
const ICON_COLORS = {
  factory: "#5b8de0",
  bolt: "#d97706",
  droplet: "#0ea5e9",
  leaf: "#16a34a",
  dollar: "#5b8de0",
  carbon: "#14b8a6",
  gauge: "#5b8de0",
  ai: "#8b5cf6",
};

/* Sparkline colour by status */
const SPARK_COLOR = {
  success: "#5b8de0",
  warning: "#d97706",
  danger: "#dc2626",
};

export default function KpiCard({ kpi, onDrilldown }) {
  const { icon, value, unit, label, trendPct, trendPos, trendCaption, ragStatus, status, sparkData, alertMsg } = kpi;

  const iconBg = ICON_COLORS[icon] ?? "#5b8de0";
  const sparkColor = SPARK_COLOR[ragStatus] ?? "#5b8de0";

  return (
    <article
      className="kpi-card"
      onClick={() => onDrilldown(kpi)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onDrilldown(kpi)}
      aria-label={`${label}: ${value}${unit ? " " + unit : ""}. Status: ${status}. Click for details.`}
    >
      {/* Row 1: icon + trend */}
      <div className="kpi-card__row1">
        <div className="kpi-icon" style={{ background: iconBg }} aria-hidden>
          <Ico name={icon} size={14} />
        </div>
        <div className="kpi-card__trend">
          {trendPct && (
            <span className={`trend-badge ${trendPos ? "positive" : "negative"}`}>
              {trendPos ? <IcoTrendUp size={9} /> : <IcoTrendDown size={9} />}
              {trendPct}
            </span>
          )}
          <span className="trend-caption">{trendCaption}</span>
        </div>
      </div>

      {/* Row 2: value */}
      <div className="kpi-card__value-row">
        <span className="stat-value">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>

      {/* Row 3: label */}
      <div className="kpi-card__label">{label}</div>

      {/* Sparkline */}
      {/* {sparkData && (
        <div style={{ marginBottom: 6 }}>
          <Sparkline data={sparkData} color={sparkColor} width={80} height={28} />
        </div>
      )}
 */}
      {/* Alert text */}
      {alertMsg && (
        <div
          style={{
            fontSize: 10,
            color: "var(--ds-warning)",
            marginBottom: 6,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          ⚠ {alertMsg}
        </div>
      )}

      {/* Divider */}
      <div className="kpi-card__divider" />

      {/* Footer: RAG badge + detail button */}
      <div className="kpi-card__footer">
        <StatusChip status={status} />
        <button
          className="kpi-detail-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDrilldown(kpi);
          }}
          aria-label={`Open ${label} detail`}
          title="View details"
        >
          <IcoEye size={11} />
        </button>
      </div>
    </article>
  );
}
