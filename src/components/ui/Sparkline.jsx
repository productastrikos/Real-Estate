/* ============================================================
   Sparkline — lightweight SVG trend line for KPI cards
   ============================================================ */
export default function Sparkline({ data = [], color = "#5b8de0", width = 80, height = 32 }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (height - pad * 2) - ((v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyPoints = points.join(" ");

  // Area fill path
  const firstX = parseFloat(points[0].split(",")[0]);
  const lastX = parseFloat(points[points.length - 1].split(",")[0]);
  const areaPath = `M ${firstX} ${height} L ${points[0].replace(",", " ")} L ${points
    .slice(1)
    .map((p) => p.replace(",", " "))
    .join(" L ")} L ${lastX} ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline" aria-hidden>
      <defs>
        <linearGradient id={`spark-grad-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#spark-grad-${color.replace("#", "")})`} />
      {/* Line */}
      <polyline points={polyPoints} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      <circle cx={parseFloat(points[points.length - 1].split(",")[0])} cy={parseFloat(points[points.length - 1].split(",")[1])} r="2" fill={color} />
    </svg>
  );
}
