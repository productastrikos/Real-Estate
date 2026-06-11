import { useMemo, useState } from "react";

/* ── SVG canvas dimensions ────────────────────────────────── */
const W = 640;
const H = 420;
const px = (v) => (v / 100) * W;
const py = (v) => (v / 100) * H;
const svgPts = (arr) => arr.map(([x, y]) => `${px(x)},${py(y)}`).join(" ");

/* Normalize [lat,lon] boundary to 0-100 SVG space with padding */
function normalizeBoundary(boundary) {
  if (!boundary?.length) return null;
  const lats = boundary.map(([lat]) => lat);
  const lons = boundary.map(([, lon]) => lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const pad = 6;
  const scale = 100 - pad * 2;
  return boundary.map(([lat, lon]) => [
    (lon - minLon) / (maxLon - minLon) * scale + pad,
    (maxLat - lat) / (maxLat - minLat) * scale + pad,
  ]);
}

/* ── Suitability levels ───────────────────────────────────── */
const SUIT = {
  vhigh:  { color: "#22c55e", fill: "rgba(34,197,94,0.20)",   label: "Very High" },
  high:   { color: "#86efac", fill: "rgba(134,239,172,0.16)", label: "High" },
  medium: { color: "#fbbf24", fill: "rgba(251,191,36,0.15)",  label: "Medium" },
  low:    { color: "#fb923c", fill: "rgba(251,146,60,0.15)",  label: "Low" },
  vlow:   { color: "#ef4444", fill: "rgba(239,68,68,0.16)",   label: "Very Low" },
};

/* ── Constraint layer types ───────────────────────────────── */
const CTYPES = {
  wetland:   { color: "#22d3ee", dash: "4,6",  label: "Wetland Preserve" },
  flood:     { color: "#7dd3fc", dash: "12,4", label: "Flood / Tidal Zone" },
  highway:   { color: "#f97316", dash: "10,5", label: "Highway Buffer" },
  powerline: { color: "#ef4444", dash: "6,4",  label: "Power Line Buffer" },
  rail:      { color: "#a78bfa", dash: "8,4",  label: "Rail Corridor" },
  riparian:  { color: "#14b8a6", dash: "3,3",  label: "Riparian Setback" },
  slope:     { color: "#dc2626", dash: "5,5",  label: "Steep Slope (>15%)" },
  airspace:  { color: "#8b5cf6", dash: "8,3",  label: "Airspace Restriction" },
};

/* ── Terrain background SVG ───────────────────────────────── */
function TerrainSVG({ site }) {
  const region = (site.region || "").toLowerCase();
  const isCoast = ["tacoma", "everett", "seattle", "puget", "metro"].some((k) => region.includes(k));
  const isEast  = ["yakima", "spokane", "valley"].some((k) => region.includes(k));

  const base  = isCoast ? "#020a0e" : isEast ? "#050802" : "#020608";
  const band1 = isCoast ? "#030e14" : isEast ? "#070b02" : "#030a0e";
  const band2 = isCoast ? "#040c10" : isEast ? "#090d03" : "#04090e";

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={base} />

      {/* Terrain bands */}
      <polygon points={svgPts([[0,0],[100,0],[100,30],[76,26],[46,28],[18,24],[0,28]])} fill={band1} />
      <polygon points={svgPts([[0,28],[18,24],[46,28],[76,26],[100,30],[100,54],[80,48],[50,52],[22,48],[0,52]])} fill={band2} />
      <polygon points={svgPts([[0,52],[22,48],[50,52],[80,48],[100,54],[100,76],[70,70],[40,72],[14,68],[0,72]])} fill={band1} />

      {/* Water feature — coastal sites */}
      {isCoast && (
        <polygon points={svgPts([[0,58],[18,56],[20,70],[16,84],[0,86]])} fill="#031426" opacity={0.92} />
      )}
      {/* Semi-arid flat patch — eastern sites */}
      {isEast && (
        <ellipse cx={px(74)} cy={py(26)} rx={px(7)} ry={py(4.5)} fill="#080e02" opacity={0.7} />
      )}

      {/* Vegetation / scrub patches */}
      <ellipse cx={px(15)} cy={py(36)} rx={px(4.5)} ry={py(2.5)} fill={isEast ? "#050e02" : "#020c10"} opacity={0.5} />
      <ellipse cx={px(55)} cy={py(20)} rx={px(3.5)} ry={py(2)}   fill={isEast ? "#070c02" : "#030e0e"} opacity={0.45} />
      <ellipse cx={px(82)} cy={py(48)} rx={px(3.5)} ry={py(2)}   fill={isEast ? "#060a02" : "#020c0e"} opacity={0.5} />

      {/* Subtle elevation contours */}
      {[18, 34, 50, 66, 82].map((y, i) => (
        <polyline
          key={i}
          points={svgPts([[0, y + Math.sin(i * 1.3) * 2.5], [25, y - 2], [50, y + 1.5], [75, y - 1], [100, y + 2]])}
          fill="none"
          stroke="rgba(56,189,248,0.07)"
          strokeWidth="0.9"
        />
      ))}

      {/* Distance grid */}
      <defs>
        <pattern id="feas-grid" width={px(10)} height={py(10)} patternUnits="userSpaceOnUse">
          <path
            d={`M ${px(10)} 0 L 0 0 0 ${py(10)}`}
            fill="none"
            stroke="rgba(56,189,248,0.04)"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#feas-grid)" opacity={0.9} />
    </g>
  );
}

/* ── Dynamic zone + constraint + infra data ───────────────── */
function buildSvgData(site) {
  const region = (site.region || "").toLowerCase();
  const type   = (site.type   || "").toLowerCase();
  const isCoast    = ["tacoma", "everett", "seattle", "puget", "metro"].some((k) => region.includes(k));
  const isEast     = ["yakima", "spokane", "valley"].some((k) => region.includes(k));
  const isAerospace = type.includes("aerospace");
  const solar = site.solarScore || 65;

  if (isCoast) {
    return {
      zones: [
        {
          id: "z1", suit: "vhigh",
          label: isAerospace ? "Aerospace Assembly Zone" : "Core Industrial Zone",
          desc:  "Prime flat industrial land with direct highway access and rail connectivity within 400m. All primary utilities at site boundary — lowest infrastructure lead-time of any zone.",
          pts: [[26,15],[70,15],[72,25],[72,55],[68,74],[26,74],[24,52],[24,25]],
        },
        {
          id: "z2", suit: "high",
          label: isAerospace ? "Aerospace Logistics Corridor" : "Port Rail Logistics",
          desc:  "BNSF mainline adjacent with existing switch points. Port or freight handling capability within 1km provides immediate dock-side operations. Rail spur extension feasible.",
          pts: [[10,13],[26,13],[24,25],[24,52],[26,74],[10,74]],
        },
        {
          id: "z3", suit: "high",
          label: "Utility Corridor Zone",
          desc:  "Power substation adjacent, water main at N boundary. All primary utility connections within 150m — lowest infrastructure procurement lead-time of any zone.",
          pts: [[26,4],[92,4],[92,13],[26,13],[24,8]],
        },
        {
          id: "z4", suit: "low",
          label: "Tidal Buffer / Flood Zone",
          desc:  "Located within FEMA tidal flood zone (BFE +1.4m). Any structure requires elevation above BFE. Permit timeline 12–18 months. Mitigation adds ~$280/sqft construction cost.",
          pts: [[64,15],[82,15],[84,28],[82,40],[64,38]],
        },
        {
          id: "z5", suit: "vlow",
          label: "Wetland Preserve",
          desc:  "Designated wetland preserve under Washington Critical Areas Ordinance. Development prohibited. Section 404 (Army Corps) + Section 401 (Ecology) permits required for any disturbance.",
          pts: [[2,13],[10,13],[10,74],[2,74]],
        },
        {
          id: "z6", suit: "medium",
          label: "Shoreline / Environmental Setback",
          desc:  "Shoreline Management Act setback (100–150m) restricts development intensity. Environmental coordination required. Suitable for low-impact ancillary uses and green infrastructure.",
          pts: [[2,74],[92,74],[92,88],[2,88]],
        },
      ],
      constraintLines: [
        { type: "highway",   pts: [[0,90],[100,90]] },
        { type: "powerline", pts: [[0,4],[100,4]] },
        { type: "wetland",   pts: [[10,13],[10,74]] },
        { type: "riparian",  pts: [[2,74],[92,74]] },
      ],
      constraintAreas: [
        { type: "flood",    pts: [[62,13],[84,13],[86,42],[80,42],[78,24],[64,24],[62,13]] },
        { type: "wetland",  pts: [[2,11],[12,11],[12,76],[2,76]] },
        { type: "riparian", pts: [[2,74],[94,74],[94,90],[2,90]] },
      ],
      infra: [
        { pts: [[0,89],[100,89]], color: "#ccc", sw: 5 },
        { pts: [[0,93],[100,93]], color: "#bbb", sw: 4 },
        { pts: [[44,4],[44,88]],  color: "#888", sw: 2 },
        { pts: [[0,3],[100,3]],   color: "#f59e0b", sw: 2, dash: "8,3" },
        { pts: [[0,72],[100,72]], color: "#6b7280", sw: 2, dash: "10,5" },
      ],
    };
  }

  if (isEast) {
    return {
      zones: [
        {
          id: "z1", suit: "vhigh",
          label: "Industrial Core Zone",
          desc:  "Best logistics profile in eastern Washington. Flat terrain, direct highway access, 230kV transmission adjacent. Lowest construction cost per sqft — optimal primary development zone.",
          pts: [[22,16],[66,16],[68,24],[68,56],[62,72],[22,72],[20,54],[20,26]],
        },
        {
          id: "z2", suit: solar >= 80 ? "vhigh" : "high",
          label: solar >= 80 ? "Prime Solar Array Zone" : "Rail & Freight Terminal Zone",
          desc:  solar >= 80
            ? `Highest solar irradiance in region (${solar}+ index). Flat grade requires minimal earthworks — ideal for large-format solar + BESS co-location. 28MW Phase 1 viable.`
            : "BNSF intermodal facility within 2km. Flat grade maintains rail alignment within BNSF design standards. 1.2km spur extension feasible at $1.8M capital.",
          pts: [[34,28],[62,28],[64,44],[60,58],[34,56],[32,42]],
        },
        {
          id: "z3", suit: "medium",
          label: "Power Transmission Corridor",
          desc:  "230kV transmission corridor imposes 150–180m horizontal setback with height restriction. Suitable for outdoor equipment yards, EV charging parking, and low-profile utility infrastructure.",
          pts: [[4,10],[20,10],[20,26],[22,16],[22,72],[20,72],[20,84],[4,84]],
        },
        {
          id: "z4", suit: "low",
          label: "River Flood Plain Buffer",
          desc:  "100-year flood plain restricts development intensity. Ecology permit required for fill and grade works. Foundation design must account for flood risk — adds 15–22% to groundworks cost.",
          pts: [[68,16],[88,16],[88,26],[86,56],[80,72],[68,56],[68,24]],
        },
        {
          id: "z5", suit: "vlow",
          label: "Highway Easement Zone",
          desc:  "WSDOT highway easement prohibits any permanent structure. Right-of-way federally protected under 23 CFR 710. No variance pathway exists for industrial development within easement.",
          pts: [[4,84],[98,84],[98,96],[4,96]],
        },
        {
          id: "z6", suit: "medium",
          label: "Secondary Industrial Zone",
          desc:  "Transition zone suitable for secondary industrial and logistics uses after primary zones are established. Minor earthworks required for drainage management.",
          pts: [[22,72],[84,72],[84,84],[22,84]],
        },
      ],
      constraintLines: [
        { type: "highway",   pts: [[0,86],[100,86]] },
        { type: "highway",   pts: [[0,90],[100,90]] },
        { type: "powerline", pts: [[0,8],[100,8]] },
        { type: "flood",     pts: [[72,16],[72,74]] },
      ],
      constraintAreas: [
        { type: "flood",   pts: [[68,14],[92,14],[92,74],[82,74],[80,24],[70,16],[68,14]] },
        { type: "highway", pts: [[4,84],[100,84],[100,96],[4,96]] },
      ],
      infra: [
        { pts: [[0,87],[100,87]], color: "#ccc", sw: 5 },
        { pts: [[0,92],[100,92]], color: "#bbb", sw: 5 },
        { pts: [[44,8],[44,84]],  color: "#999", sw: 3 },
        { pts: [[76,8],[76,84]],  color: "#888", sw: 2 },
        { pts: [[0,7],[100,7]],   color: "#f59e0b", sw: 2, dash: "8,3" },
        { pts: [[0,72],[100,72]], color: "#6b7280", sw: 2, dash: "10,5" },
      ],
    };
  }

  /* Generic / uploaded site */
  return {
    zones: [
      {
        id: "z1", suit: "vhigh",
        label: "Primary Development Zone",
        desc:  "Core buildable area with optimal infrastructure connectivity. All primary utilities accessible within project scope. Lowest infrastructure lead-time of any site zone.",
        pts: [[24,15],[70,15],[72,24],[72,55],[68,72],[24,72],[22,52],[22,24]],
      },
      {
        id: "z2", suit: "high",
        label: "Logistics & Access Zone",
        desc:  "Secondary zone with good highway and infrastructure access. Supports logistics and ancillary operational requirements. Suitable for Phase 2 expansion.",
        pts: [[8,13],[24,13],[22,24],[22,52],[24,72],[8,72]],
      },
      {
        id: "z3", suit: "medium",
        label: "Utility Infrastructure Zone",
        desc:  "Utility corridor and support infrastructure zone. Limited buildable area due to setback requirements from powerline corridor. Suitable for low-profile equipment.",
        pts: [[24,4],[88,4],[88,13],[24,13],[22,8]],
      },
      {
        id: "z4", suit: "low",
        label: "Environmental Buffer Zone",
        desc:  "Environmental constraint zone requiring regulatory coordination before development. Section 404 or equivalent permits likely needed for any grading or impervious surface.",
        pts: [[68,18],[86,18],[88,30],[86,44],[68,36]],
      },
      {
        id: "z5", suit: "vlow",
        label: "Restricted / Protected Zone",
        desc:  "Restricted zone — development not permitted under current regulatory framework. Retain in natural state to satisfy critical areas obligations and avoid permitting delays.",
        pts: [[2,11],[10,11],[10,72],[2,72]],
      },
      {
        id: "z6", suit: "medium",
        label: "Buffer & Transition Zone",
        desc:  "Transition zone between primary development and site boundary. Low-intensity uses permitted with appropriate stormwater management plan.",
        pts: [[2,72],[90,72],[90,86],[2,86]],
      },
    ],
    constraintLines: [
      { type: "highway",   pts: [[0,88],[100,88]] },
      { type: "powerline", pts: [[0,4],[100,4]] },
      { type: "riparian",  pts: [[8,11],[8,74]] },
    ],
    constraintAreas: [
      { type: "wetland",  pts: [[2,11],[12,11],[12,74],[2,74]] },
      { type: "riparian", pts: [[2,72],[92,72],[92,88],[2,88]] },
    ],
    infra: [
      { pts: [[0,87],[100,87]], color: "#bbb", sw: 5 },
      { pts: [[44,4],[44,86]],  color: "#999", sw: 2 },
      { pts: [[0,3],[100,3]],   color: "#f59e0b", sw: 2, dash: "8,3" },
    ],
  };
}

/* ── Left-panel data builders ─────────────────────────────── */
function criterionColor(v) {
  if (v >= 85) return "#22c55e";
  if (v >= 70) return "#84cc16";
  if (v >= 55) return "#eab308";
  return "#ef4444";
}

function scoreLabel(score) {
  if (score >= 90) return { label: "Excellent", color: "#22c55e" };
  if (score >= 82) return { label: "Strong",    color: "#22c55e" };
  if (score >= 72) return { label: "Good",       color: "#eab308" };
  if (score >= 60) return { label: "Moderate",   color: "#eab308" };
  return { label: "Low", color: "#ef4444" };
}

function buildCriteria(site) {
  const power  = site.power || site.gridAvailabilityPct || 80;
  const water  = site.waterPct || 70;
  const solar  = site.solarScore || 65;
  const rail   = site.railScore || 70;
  const esg    = site.esg || site.esgScore || 75;
  const area   = parseFloat(site.area) || 300;
  const expand = site.expandPotential === "High" ? 10 : site.expandPotential === "Medium" ? 4 : 0;
  return [
    { label: "Solar Resource",      value: solar },
    { label: "Land Suitability",    value: Math.min(100, Math.round(60 + (area / 500) * 22 + expand)) },
    { label: "Grid Connectivity",   value: power },
    { label: "Environmental Impact",value: Math.min(100, Math.round(esg * 0.88 + 8)) },
    { label: "Water Availability",  value: water },
    { label: "Accessibility",       value: Math.round(rail * 0.55 + power * 0.45 * 0.85) },
    { label: "Slope & Topography",  value: Math.min(100, Math.round(78 + (area > 400 ? 10 : area > 280 ? 5 : 0))) },
    { label: "Risk Factors",        value: Math.min(100, Math.round(60 + (esg - 60) * 0.45 + (site.ragStatus === "success" ? 8 : 0))) },
  ];
}

function buildAdvisor(site) {
  const score = site.aiScore || 75;
  const solar = site.solarScore || 65;
  const esg   = site.esg || site.esgScore || 75;
  const power = site.power || site.gridAvailabilityPct || 80;
  const water = site.waterPct || 70;
  const rail  = site.railScore || 70;
  const envRisk   = esg >= 85 ? { val: "LOW",        color: "#22c55e" }
                  : esg >= 75 ? { val: "MEDIUM",      color: "#eab308" }
                  : esg >= 65 ? { val: "MEDIUM-HIGH", color: "#f97316" }
                  : { val: "HIGH", color: "#ef4444" };
  const renewable = solar >= 85 ? { val: "EXCELLENT", color: "#22c55e" }
                  : solar >= 72 ? { val: "GOOD",       color: "#84cc16" }
                  : solar >= 55 ? { val: "FAIR",       color: "#eab308" }
                  : { val: "POOR", color: "#ef4444" };
  const infra     = (power >= 88 && water >= 80) ? { val: "LOW",  color: "#22c55e" }
                  : power >= 75 ? { val: "MEDIUM",  color: "#eab308" }
                  : { val: "HIGH", color: "#ef4444" };
  return {
    score, envRisk, renewable, infra,
    utility:        Math.round(power * 0.45 + water * 0.35 + rail * 0.2 * 0.9),
    timeline:       score >= 88 ? 16 : score >= 80 ? 20 : score >= 70 ? 26 : 32,
    sustainability: Math.min(100, Math.round(esg * 0.55 + solar * 0.25 + water * 0.2 * 0.85)),
  };
}

function buildRootCause(site) {
  const solar = site.solarScore || 65;
  const rail  = site.railScore || 70;
  const power = site.power || 80;
  const water = site.waterPct || 70;
  const esg   = site.esg || 75;
  const strengths = [];
  if (solar >= 85) strengths.push(`${solar}-point solar irradiance score`);
  if (rail  >= 88) strengths.push(`strong rail connectivity (${rail})`);
  if (power >= 90) strengths.push(`grid availability at ${power}%`);
  const concerns = [];
  if (water < 70) concerns.push(`water capacity below threshold (${water}%)`);
  if (esg   < 75) concerns.push(`environmental coordination required (ESG ${esg})`);
  if (power < 78) concerns.push(`grid upgrade recommended (${power}%)`);
  const base = strengths.length
    ? strengths.join(" and ") + " drive site competitiveness."
    : "Infrastructure alignment confirms baseline suitability.";
  const note = concerns.length
    ? " " + concerns[0].charAt(0).toUpperCase() + concerns[0].slice(1) + "."
    : " Site shows strong infrastructure alignment.";
  return base + note;
}

function buildRecommendations(site) {
  const recs = [];
  const solar = site.solarScore || 65;
  const rail  = site.railScore || 70;
  const power = site.power || 80;
  const water = site.waterPct || 70;
  if (solar >= 80) recs.push(`Develop ${Math.round(solar * 0.35)}MW solar array — optimal irradiance window`);
  if (rail  >= 88) recs.push(`Rail terminal Phase 1 viable — ${site.rail || "Good"} access confirmed`);
  if (water < 70)  recs.push("Secure water utility agreement — pressure below threshold");
  if (power < 85)  recs.push("Negotiate grid capacity upgrade with utility provider");
  recs.push("Commission geotechnical survey for eastern parcel boundary");
  if (site.expandPotential === "High") recs.push("Initiate Phase 2 expansion environmental review");
  return recs.slice(0, 4);
}

const LAYER_KEYS   = ["zones", "constraints", "elevation", "infra"];
const LAYER_LABELS = { zones: "Zones", constraints: "Constraints", elevation: "Elevation", infra: "Infrastructure" };

/* ── Main component ───────────────────────────────────────── */
export default function FeasibilityViewer({ site }) {
  const [selectedZone, setSelectedZone] = useState(null);
  const [layers, setLayers] = useState({ zones: true, constraints: true, elevation: true, infra: true });

  const criteria        = useMemo(() => buildCriteria(site), [site]);
  const advisor         = useMemo(() => buildAdvisor(site),  [site]);
  const rootCause       = useMemo(() => buildRootCause(site), [site]);
  const recommendations = useMemo(() => buildRecommendations(site), [site]);
  const svgData         = useMemo(() => buildSvgData(site), [site.id, site.region, site.type, site.solarScore]);
  const normalBoundary  = useMemo(() => normalizeBoundary(site.boundary), [site.boundary]);

  const { label, color } = scoreLabel(site.aiScore || 75);
  const score = site.aiScore || 75;
  const lat   = (site.coords && site.coords[0]) || 47.25;
  const lng   = (site.coords && site.coords[1]) || -122.44;
  const coordStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lng).toFixed(2)}°${lng <= 0 ? "W" : "E"}`;
  const activeZone = svgData.zones.find((z) => z.id === selectedZone);

  const visibleCTypes = useMemo(() => {
    const seen = new Set();
    [...svgData.constraintLines, ...svgData.constraintAreas].forEach((c) => seen.add(c.type));
    return [...seen].filter((t) => CTYPES[t]);
  }, [svgData]);

  function toggleLayer(key) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const prediction = useMemo(() => {
    const prob = advisor.score >= 85
      ? 88 + Math.round((advisor.score - 85) * 0.5)
      : 68 + Math.round(advisor.score * 0.22);
    const suffix = advisor.renewable.val === "EXCELLENT"
      ? `Renewable profile positions site in top 8% of ${site.region || "WA"} candidates.`
      : advisor.renewable.val === "GOOD"
      ? "Renewable integration viable — utility contracts recommended."
      : "Supplemental energy agreements required before acquisition stage.";
    return `${prob}% success probability with infrastructure alignment. ${suffix}`;
  }, [advisor, site.region]);

  return (
    <div className="feas-viewer">
      {/* ── Left Panel ── */}
      <div className="feas-left">
        <div className="feas-section-label">Feasibility Score</div>
        <div className="feas-score-num" style={{ color }}>{score}%</div>
        <div className="feas-score-sub" style={{ color }}>{label}</div>
        <div className="feas-score-bar">
          <div className="feas-score-bar-fill" style={{ width: `${score}%`, background: color }} />
        </div>

        {activeZone ? (
          <>
            <button className="feas-back-btn" onClick={() => setSelectedZone(null)}>
              ← All Zones
            </button>
            <div className="feas-zone-detail">
              <div className="feas-zone-detail-label">
                <span className="feas-zone-suit-dot" style={{ background: SUIT[activeZone.suit]?.color }} />
                {activeZone.label}
              </div>
              <div className="feas-zone-suit-badge" style={{ color: SUIT[activeZone.suit]?.color, borderColor: SUIT[activeZone.suit]?.color }}>
                {SUIT[activeZone.suit]?.label} Suitability
              </div>
              <div className="feas-zone-desc">{activeZone.desc}</div>
            </div>
            <div className="feas-section-label" style={{ marginTop: 12 }}>Criteria Breakdown</div>
            {criteria.slice(0, 5).map((c) => (
              <div key={c.label} className="feas-criterion">
                <div className="feas-criterion-row">
                  <span className="feas-criterion-label">{c.label}</span>
                  <span className="feas-criterion-val" style={{ color: criterionColor(c.value) }}>{c.value}%</span>
                </div>
                <div className="feas-criterion-bar">
                  <div className="feas-criterion-bar-fill" style={{ width: `${c.value}%`, background: criterionColor(c.value) }} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="feas-section-label" style={{ marginTop: 14 }}>Criteria Breakdown</div>
            {criteria.map((c) => (
              <div key={c.label} className="feas-criterion">
                <div className="feas-criterion-row">
                  <span className="feas-criterion-label">{c.label}</span>
                  <span className="feas-criterion-val" style={{ color: criterionColor(c.value) }}>{c.value}%</span>
                </div>
                <div className="feas-criterion-bar">
                  <div className="feas-criterion-bar-fill" style={{ width: `${c.value}%`, background: criterionColor(c.value) }} />
                </div>
              </div>
            ))}
          </>
        )}

        <div className="feas-site-info">
          <div className="feas-info-row"><span>Area</span><span>{site.area || "—"}</span></div>
          <div className="feas-info-row"><span>Type</span><span>{site.type || "—"}</span></div>
          <div className="feas-info-row"><span>Coords</span><span>{coordStr}</span></div>
        </div>
      </div>

      {/* ── Center Panel: SVG Map ── */}
      <div className="feas-center">
        <div className="feas-map-header">
          <span className="feas-map-site-name">{(site.name || "SITE").toUpperCase()}</span>
          <span className="feas-map-location">· {site.region || "WA"} ({site.type || "Industrial"})</span>
          <div className="feas-layer-btns">
            {LAYER_KEYS.map((k) => (
              <button
                key={k}
                className={`feas-basemap-btn${layers[k] ? " active" : ""}`}
                onClick={() => toggleLayer(k)}
              >
                {LAYER_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="feas-map-wrap">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <TerrainSVG site={site} />

            {/* Infrastructure lines */}
            {layers.infra && svgData.infra.map((line, i) => (
              <polyline
                key={`infra-${i}`}
                points={svgPts(line.pts)}
                fill="none"
                stroke={line.color}
                strokeWidth={line.sw}
                strokeDasharray={line.dash || "none"}
                opacity={0.55}
              />
            ))}

            {/* Elevation contour overlay */}
            {layers.elevation && [22, 40, 58, 76].map((y, i) => (
              <polyline
                key={`elev-${i}`}
                points={svgPts([[0, y + Math.sin(i * 0.8) * 3], [20, y - 1], [45, y + 2], [70, y - 1], [100, y + 1.5]])}
                fill="none"
                stroke="rgba(56,189,248,0.14)"
                strokeWidth="1.2"
                strokeDasharray="3,5"
              />
            ))}

            {/* Constraint area fills */}
            {layers.constraints && svgData.constraintAreas.map((ca, i) => {
              const ct = CTYPES[ca.type] || CTYPES.wetland;
              return (
                <polygon
                  key={`ca-${i}`}
                  points={svgPts(ca.pts)}
                  fill={ct.color}
                  fillOpacity={0.08}
                  stroke={ct.color}
                  strokeWidth="1"
                  strokeDasharray={ct.dash}
                  strokeOpacity={0.55}
                />
              );
            })}

            {/* Constraint lines */}
            {layers.constraints && svgData.constraintLines.map((cl, i) => {
              const ct = CTYPES[cl.type] || CTYPES.highway;
              return (
                <polyline
                  key={`cl-${i}`}
                  points={svgPts(cl.pts)}
                  fill="none"
                  stroke={ct.color}
                  strokeWidth="1.5"
                  strokeDasharray={ct.dash}
                  opacity={0.75}
                />
              );
            })}

            {/* Suitability zone polygons */}
            {layers.zones && svgData.zones.map((zone) => {
              const s = SUIT[zone.suit];
              const isSelected = selectedZone === zone.id;
              const avgX = zone.pts.reduce((a, [x]) => a + x, 0) / zone.pts.length;
              const avgY = zone.pts.reduce((a, [, y]) => a + y, 0) / zone.pts.length;
              const zoneW = (Math.max(...zone.pts.map(([x]) => x)) - Math.min(...zone.pts.map(([x]) => x))) / 100 * W;
              return (
                <g key={zone.id}>
                  <polygon
                    points={svgPts(zone.pts)}
                    fill={s.fill}
                    stroke={s.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeOpacity={isSelected ? 1 : 0.7}
                    style={{ cursor: "pointer", transition: "stroke-width 0.15s, fill-opacity 0.15s" }}
                    onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                  />
                  {zoneW > 35 && (
                    <text
                      x={px(avgX)}
                      y={py(avgY)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={zoneW > 120 ? 9 : 7.5}
                      fontFamily="monospace"
                      fontWeight="700"
                      fill={s.color}
                      fillOpacity={0.9}
                      style={{ pointerEvents: "none" }}
                    >
                      {zone.label.length > 18 ? zone.label.slice(0, 16) + "…" : zone.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Real site boundary polygon */}
            {normalBoundary ? (
              <>
                {/* Outer glow */}
                <polygon
                  points={svgPts(normalBoundary)}
                  fill="none"
                  stroke="rgba(34,197,94,0.22)"
                  strokeWidth="8"
                  style={{ pointerEvents: "none" }}
                />
                {/* Land area highlight inside real boundary */}
                <polygon
                  points={svgPts(normalBoundary)}
                  fill="rgba(34,197,94,0.04)"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="12,6"
                  style={{ pointerEvents: "none" }}
                />
              </>
            ) : (
              /* Fallback: simple dashed rectangle */
              <rect
                x={px(2)} y={py(3)} width={px(96)} height={py(92)}
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.5"
                strokeDasharray="10,6"
                opacity={0.35}
              />
            )}

            {/* Selected zone pulse ring */}
            {selectedZone && (() => {
              const zone = svgData.zones.find((z) => z.id === selectedZone);
              if (!zone) return null;
              return (
                <polygon
                  points={svgPts(zone.pts)}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="4,3"
                  opacity={0.22}
                  style={{ pointerEvents: "none" }}
                />
              );
            })()}
          </svg>

          {/* Legend overlay */}
          <div className="feas-map-legend">
            {Object.entries(SUIT).map(([k, s]) => (
              <div key={k} className="feas-legend-item">
                <span className="feas-legend-swatch" style={{ background: s.color }} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="feas-right">
        <div className="feas-section-label">Constraint Layers</div>
        {visibleCTypes.map((t) => {
          const ct = CTYPES[t];
          return (
            <div key={t} className="feas-legend-row">
              <svg width="18" height="8" style={{ flexShrink: 0 }}>
                <line x1="0" y1="4" x2="18" y2="4" stroke={ct.color} strokeWidth="1.5" strokeDasharray={ct.dash} />
              </svg>
              <span className="feas-legend-label">{ct.label}</span>
            </div>
          );
        })}

        <div className="feas-section-label" style={{ marginTop: 12 }}>Land Suitability</div>
        {Object.entries(SUIT).map(([k, s]) => (
          <div key={k} className="feas-legend-row">
            <span className="feas-legend-swatch2" style={{ background: s.color }} />
            <span className="feas-legend-label">{s.label}</span>
          </div>
        ))}

        <div className="feas-advisor-header">
          <span>AI Site Advisor</span>
          <span style={{ color: "#7c3aed" }}>▲</span>
        </div>

        {[
          { label: "Feasibility",       val: `${advisor.score}%`,         color },
          { label: "Env Risk",          val: advisor.envRisk.val,          color: advisor.envRisk.color },
          { label: "Renewable",         val: advisor.renewable.val,        color: advisor.renewable.color },
          { label: "Infra Complexity",  val: advisor.infra.val,            color: advisor.infra.color },
          { label: "Utility Readiness", val: `${advisor.utility}%`,        color: "#94a3b8" },
          { label: "Timeline",          val: `${advisor.timeline} months`, color: "#f59e0b" },
          { label: "Sustainability",    val: `${advisor.sustainability}%`, color: "#22c55e" },
        ].map((r, i) => (
          <div key={i} className="feas-advisor-row">
            <span className="feas-advisor-label">{r.label}</span>
            <span className="feas-advisor-val" style={{ color: r.color }}>{r.val}</span>
          </div>
        ))}

        <div className="feas-ai-block">
          <div className="feas-ai-block-title">Root Cause</div>
          <div className="feas-ai-block-text">{rootCause}</div>
        </div>

        <div className="feas-ai-block">
          <div className="feas-ai-block-title">Prediction</div>
          <div className="feas-ai-block-text">{prediction}</div>
        </div>

        <div className="feas-ai-block">
          <div className="feas-ai-block-title">Recommendations</div>
          {recommendations.map((r, i) => (
            <div key={i} className="feas-rec-row">
              <span className="feas-rec-num">{i + 1}</span>
              <span className="feas-ai-block-text">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
