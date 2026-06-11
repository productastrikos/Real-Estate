/* -----------------------------------------------------------------
   AI Environmental Intelligence Workspace
   3D Map base + mode overlays + AI Advisor
   ----------------------------------------------------------------- */
import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Site coordinates map
const SITE_COORDS = {
  tacoma:  [47.1332, -122.5122],
  everett: [47.9591, -122.1533],
  spokane: [47.6377, -117.4501],
  yakima:  [46.5831, -120.5852],
};

const T = {
  bg: "#060d14",
  panel: "#0c1520",
  surface: "#121e2b",
  border: "rgba(255,255,255,0.07)",
  text: "#e8eef5",
  muted: "#afc3d8",
  faint: "#5a7a94",
  blue: "#5b8de0",
  teal: "#14b8a6",
  amber: "#f59e0b",
  sun: "#fbbf24",
  green: "#16a34a",
  danger: "#dc2626",
  violet: "#8b5cf6",
  sky: "#38bdf8",
};

const MODES = [
  { id: "solar", icon: "☀", label: "Solar Intelligence", color: "#f59e0b" },
  { id: "wind", icon: "🌬", label: "Wind & Airflow", color: "#14b8a6" },
  { id: "risk", icon: "⚠", label: "Environmental Risk", color: "#dc2626" },
  { id: "infra", icon: "⚡", label: "Infrastructure Stress", color: "#5b8de0" },
];

const LAYER_GROUPS = [
  {
    group: "Climate",
    color: "#f59e0b",
    layers: [
      { id: "solar", label: "Solar Exposure" },
      { id: "heat", label: "Heat Zones" },
      { id: "wind", label: "Wind Flow" },
      { id: "temperature", label: "Temperature Map" },
    ],
  },
  {
    group: "Sustainability",
    color: "#14b8a6",
    layers: [
      { id: "carbon", label: "Carbon Footprint" },
      { id: "renewable", label: "Renewable Zones" },
      { id: "water", label: "Water Reuse" },
    ],
  },
  {
    group: "Infrastructure",
    color: "#5b8de0",
    layers: [
      { id: "power", label: "Power Demand" },
      { id: "waterdem", label: "Water Demand" },
      { id: "logistics", label: "Traffic Flow" },
    ],
  },
  {
    group: "Risk",
    color: "#dc2626",
    layers: [
      { id: "flood", label: "Flood Risk" },
      { id: "pollution", label: "Pollution" },
      { id: "noise", label: "Noise Zones" },
    ],
  },
];

function modeInsights(mode, data, siteName) {
  const eff = data.solarEfficiency;
  const wind = data.windSpeedAvg;
  const water = data.waterReuse;
  const carbon = data.carbonScore;
  const flood = data.floodRisk;
  const temp = data.tempExposure;
  const sets = {
    solar: [
      {
        color: T.amber,
        icon: "◈",
        label: "Peak Solar Zone",
        body: `Rooftop B and D deliver highest irradiance capture. ${eff >= 80 ? "Expansion ready." : "Panel optimisation recommended."}`,
      },
      { color: T.sun, icon: "◈", label: "Solar Window", body: `Peak irradiance ${data.peakSolarHours}. Annual: ${data.annualIrradiance} kWh/m².` },
      {
        color: eff >= 80 ? T.green : T.amber,
        icon: "●",
        label: "Efficiency Signal",
        body: `${eff}% solar conversion. ${eff >= 80 ? "Top-tier — recommend scale-up." : "Upgrade panel tilt angle +5° for +8% gain."}`,
      },
      {
        color: T.violet,
        icon: "◈",
        label: "AI Recommendation",
        body: "Thermal storage beneath solar zone reduces cooling demand by 18% in afternoon peak.",
      },
    ],
    wind: [
      {
        color: T.teal,
        icon: "◈",
        label: "Prevailing Flow",
        body: `${data.windDirection} wind at ${wind} mph. Passive cooling corridor runs SE–NW across site.`,
      },
      {
        color: wind > 10 ? T.amber : T.teal,
        icon: "●",
        label: "Turbulence Zone",
        body: `${wind > 10 ? "High" : "Moderate"} wind turbulence detected near freight loading dock.`,
      },
      {
        color: T.green,
        icon: "◈",
        label: "Cooling Potential",
        body: `Natural ventilation: ${wind > 9 ? "High" : wind > 6 ? "Moderate" : "Low"}. ${wind > 9 ? "Wind turbines viable at 3×500 kW." : "Stack ventilation sufficient."}`,
      },
      {
        color: T.sky,
        icon: "◈",
        label: "Wind Harvest",
        body: `${wind > 9 ? "3×500 kW turbines viable — combined renewable reach 32% by 2028." : "Low wind — solar-dominant strategy recommended."}`,
      },
    ],
    risk: [
      {
        color: flood === "Low" ? T.green : T.danger,
        icon: "●",
        label: "Flood Risk",
        body: `${flood} flood risk. ${flood === "Low" ? "Site above 100-year flood plain. FEMA certified." : "Elevated foundation required."}`,
      },
      {
        color: data.tempExposureLevel === "success" ? T.green : data.tempExposureLevel === "warning" ? T.amber : T.danger,
        icon: "◈",
        label: "Heat Stress",
        body: `Temp exposure: ${temp}.`,
      },
      {
        color: carbon >= 85 ? T.green : T.amber,
        icon: "◈",
        label: "Carbon Status",
        body: `Carbon score ${carbon}/100. ${carbon >= 85 ? "Ahead of WA 2027 threshold." : "Renewable investment needed."}`,
      },
      {
        color: T.violet,
        icon: "◈",
        label: "AI Risk Rating",
        body: `Composite risk: ${flood === "Low" && data.tempExposureLevel !== "danger" ? "LOW — site suitable for immediate expansion." : "MODERATE — targeted mitigation required."}`,
      },
    ],
    infra: [
      {
        color: T.blue,
        icon: "◈",
        label: "Power Demand",
        body: `Site power at ${eff >= 80 ? "78%" : "86%"} utilisation. ${eff >= 80 ? "Headroom for additional block." : "Grid reinforcement recommended."}`,
      },
      {
        color: water >= 35 ? T.green : T.amber,
        icon: "●",
        label: "Water Demand",
        body: `Water reuse at ${water}%. ${water >= 35 ? "On target." : "Below 40% target — investment needed."}`,
      },
      {
        color: T.sky,
        icon: "◈",
        label: "Logistics Flow",
        body: `${data.windDirection === "SW" || data.windDirection === "NW" ? "North freight corridor optimal." : "East freight approach preferred."}`,
      },
      {
        color: T.violet,
        icon: "◈",
        label: "AI Stress Index",
        body: `Infrastructure stress: ${eff >= 80 ? "LOW — ready for 3 simultaneous manufacturing blocks." : "MEDIUM — address power + water before expansion."}`,
      },
    ],
  };
  return sets[mode] || sets.solar;
}

/* ── 3D SVG buildings overlay on the map ─────────────────── */
// Building definitions for each site — positions as % of the map viewport
const SITE_BUILDINGS = {
  tacoma: [
    { id: "A", label: "Bldg A\nManufacturing", cx: 38, cy: 42, w: 80, h: 55, floors: 4, use: "manufacturing" },
    { id: "B", label: "Bldg B\nSolar Array", cx: 56, cy: 34, w: 70, h: 45, floors: 2, use: "solar" },
    { id: "C", label: "Bldg C\nLogistics", cx: 48, cy: 58, w: 90, h: 40, floors: 3, use: "logistics" },
    { id: "D", label: "Bldg D\nOffice", cx: 70, cy: 46, w: 55, h: 50, floors: 5, use: "office" },
    { id: "E", label: "Parking", cx: 65, cy: 65, w: 100, h: 30, floors: 1, use: "parking" },
  ],
  everett: [
    { id: "A", label: "Hangar A", cx: 35, cy: 40, w: 110, h: 60, floors: 3, use: "manufacturing" },
    { id: "B", label: "Aerospace Lab", cx: 60, cy: 38, w: 75, h: 50, floors: 2, use: "office" },
    { id: "C", label: "Freight Hub", cx: 50, cy: 62, w: 85, h: 35, floors: 2, use: "logistics" },
    { id: "D", label: "Solar Zone", cx: 72, cy: 55, w: 60, h: 45, floors: 1, use: "solar" },
  ],
  spokane: [
    { id: "A", label: "Plant A", cx: 40, cy: 45, w: 90, h: 55, floors: 3, use: "manufacturing" },
    { id: "B", label: "Power Station", cx: 62, cy: 40, w: 60, h: 45, floors: 2, use: "infra" },
    { id: "C", label: "Warehouse", cx: 52, cy: 62, w: 80, h: 38, floors: 2, use: "logistics" },
    { id: "D", label: "Office Tower", cx: 68, cy: 52, w: 50, h: 55, floors: 6, use: "office" },
  ],
  yakima: [
    { id: "A", label: "Agri-Plant A", cx: 42, cy: 44, w: 85, h: 52, floors: 2, use: "manufacturing" },
    { id: "B", label: "Solar Farm", cx: 60, cy: 38, w: 80, h: 40, floors: 1, use: "solar" },
    { id: "C", label: "Cold Storage", cx: 50, cy: 60, w: 75, h: 38, floors: 3, use: "logistics" },
    { id: "D", label: "Admin Block", cx: 70, cy: 50, w: 55, h: 48, floors: 4, use: "office" },
  ],
};

const USE_COLORS = {
  manufacturing: { face: "#1e3a5f", roof: "#1a4a7a", side: "#0f2a4f", accent: T.blue },
  solar: { face: "#1a3d20", roof: "#1e5228", side: "#0f2a14", accent: T.teal },
  logistics: { face: "#3d2a0a", roof: "#4d380f", side: "#2a1e06", accent: T.amber },
  office: { face: "#2a1a3d", roof: "#38226b", side: "#1a1028", accent: T.violet },
  infra: { face: "#2a1a1a", roof: "#3d2020", side: "#1a0e0e", accent: T.danger },
  parking: { face: "#1a1e24", roof: "#202630", side: "#0e1218", accent: T.faint },
};

// Draw a single isometric building given canvas-space x/y (top-center of footprint)
function IsoBuilding({ bld, vw, vh, mode, data, hovered, onHover }) {
  const floorH = 14;
  const totalH = bld.floors * floorH;
  const colors = USE_COLORS[bld.use] || USE_COLORS.manufacturing;

  // Mode-specific overlay color
  const modeOverlay = {
    solar: { manufacturing: T.amber, solar: "#fde68a", logistics: T.faint, office: T.faint, parking: T.faint, infra: T.faint },
    wind: { manufacturing: T.teal, solar: T.teal, logistics: T.sky, office: T.faint, parking: T.faint, infra: T.faint },
    risk: { manufacturing: "#f97316", solar: T.green, logistics: T.danger, office: T.faint, parking: T.danger, infra: T.amber },
    infra: { manufacturing: T.blue, solar: T.faint, logistics: T.amber, office: T.violet, parking: T.faint, infra: T.danger },
  };
  const overlayColor = modeOverlay[mode]?.[bld.use] || T.faint;

  // Convert % positions to px
  const cx = (bld.cx / 100) * vw;
  const cy = (bld.cy / 100) * vh;

  // Isometric offsets (30° projection)
  const isoW = bld.w * 0.6;
  const isoD = bld.w * 0.28;

  // Top face corners
  const top = [
    [cx - isoW / 2, cy - isoD / 2 - totalH], // left
    [cx, cy - isoD - totalH], // back
    [cx + isoW / 2, cy - isoD / 2 - totalH], // right
    [cx, cy - totalH], // front
  ];

  // Bottom face (ground)
  const bot = top.map(([x, y]) => [x, y + totalH]);

  const toP = (pts) => pts.map((p) => p.join(",")).join(" ");

  // Left face
  const leftFace = [bot[0], bot[3], top[3], top[0]];
  // Right face
  const rightFace = [bot[3], bot[2], top[2], top[3]];
  // Top face
  const topFace = top;

  const glow = hovered ? `drop-shadow(0 0 8px ${overlayColor})` : "none";

  return (
    <g style={{ cursor: "pointer", filter: glow }} onMouseEnter={() => onHover(bld.id)} onMouseLeave={() => onHover(null)}>
      {/* Left face */}
      <polygon points={toP(leftFace)} fill={colors.side} stroke={overlayColor} strokeWidth={hovered ? 1.5 : 0.8} strokeOpacity="0.6" />
      {/* Right face */}
      <polygon points={toP(rightFace)} fill={colors.face} stroke={overlayColor} strokeWidth={hovered ? 1.5 : 0.8} strokeOpacity="0.6" />
      {/* Top face */}
      <polygon points={toP(topFace)} fill={colors.roof} stroke={overlayColor} strokeWidth={hovered ? 1.5 : 0.8} strokeOpacity="0.8" />

      {/* Mode intensity bar on right face */}
      <polygon
        points={toP([
          [rightFace[0][0], rightFace[0][1]],
          [rightFace[1][0], rightFace[1][1]],
          [rightFace[2][0], rightFace[2][1] + 4],
          [rightFace[3][0], rightFace[3][1] + 4],
        ])}
        fill={overlayColor}
        opacity="0.15"
      />

      {/* Roof accent strip */}
      <polygon
        points={toP([topFace[0], topFace[1], [topFace[1][0], topFace[1][1] + 4], [topFace[0][0], topFace[0][1] + 4]])}
        fill={overlayColor}
        opacity="0.35"
      />

      {/* Building label on hover */}
      {hovered && (
        <g>
          <rect
            x={cx - 52}
            y={cy - totalH - isoD - 32}
            width={104}
            height={28}
            rx="4"
            fill="rgba(6,13,20,0.92)"
            stroke={overlayColor}
            strokeWidth="1"
          />
          <text x={cx} y={cy - totalH - isoD - 20} fontSize="9" fill={overlayColor} textAnchor="middle" fontWeight="700">
            {bld.label.split("\n")[0]}
          </text>
          <text x={cx} y={cy - totalH - isoD - 9} fontSize="8" fill={T.muted} textAnchor="middle">
            {bld.label.split("\n")[1] || `${bld.floors} floors`}
          </text>
        </g>
      )}
    </g>
  );
}

/* ── Map tilt controller ───────────────────────────────────── */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [center, zoom]);
  return null;
}

/* ── 3D Site Map Canvas ────────────────────────────────────── */
function Canvas3DMap({ siteData, siteName, siteId, mode, timeH }) {
  const svgRef = useRef(null);
  const [svgSize, setSvgSize] = useState({ w: 600, h: 400 });
  const [hovered, setHovered] = useState(null);
  const buildings = SITE_BUILDINGS[siteId] || SITE_BUILDINGS.tacoma;
  const coords = SITE_COORDS[siteId] || SITE_COORDS.tacoma;

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSvgSize({ w: width, h: height });
    });
    if (svgRef.current) obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  // Time-driven sun elevation (for shadow & glow effects)
  const sunEl = Math.max(0, Math.sin(((timeH - 6) / 12) * Math.PI));
  const isDaytime = timeH >= 6 && timeH <= 19;

  // Mode overlay colours for map tiles CSS filter
  const tileFilters = {
    solar: "sepia(0.3) hue-rotate(10deg) brightness(0.9)",
    wind: "sepia(0.1) hue-rotate(160deg) brightness(0.85)",
    risk: "sepia(0.4) hue-rotate(-20deg) brightness(0.8)",
    infra: "sepia(0.2) hue-rotate(200deg) brightness(0.88)",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Map base with perspective tilt */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: "900px",
          perspectiveOrigin: "50% 30%",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: "rotateX(38deg) scale(1.18)",
            transformOrigin: "50% 50%",
            filter: tileFilters[mode],
            willChange: "transform",
          }}
        >
          <MapContainer
            center={coords}
            zoom={15}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            style={{ width: "100%", height: "100%", background: "#060d14" }}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={19} />
            <MapController center={coords} zoom={15} />
          </MapContainer>
        </div>
      </div>

      {/* SVG overlay for 3D isometric buildings */}
      <div ref={svgRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <svg width={svgSize.w} height={svgSize.h} style={{ pointerEvents: "all", overflow: "visible" }}>
          <defs>
            {/* Ground shadow */}
            <radialGradient id="gshadow" cx="50%" cy="70%" r="50%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            {/* Sun glow */}
            {isDaytime && (
              <radialGradient id="sunglow" cx="50%" cy="10%" r="60%">
                <stop offset="0%" stopColor={T.sun} stopOpacity={0.12 * sunEl} />
                <stop offset="100%" stopColor={T.sun} stopOpacity="0" />
              </radialGradient>
            )}
          </defs>

          {/* Ambient sun glow over scene */}
          {isDaytime && <rect width={svgSize.w} height={svgSize.h} fill="url(#sunglow)" pointerEvents="none" />}

          {/* Ground shadow blob */}
          <ellipse cx={svgSize.w * 0.5} cy={svgSize.h * 0.62} rx={svgSize.w * 0.38} ry={svgSize.h * 0.12} fill="url(#gshadow)" pointerEvents="none" />

          {/* Site boundary ring */}
          <rect
            x={svgSize.w * 0.18}
            y={svgSize.h * 0.16}
            width={svgSize.w * 0.64}
            height={svgSize.h * 0.6}
            rx="8"
            fill="none"
            stroke={T.border}
            strokeWidth="1.5"
            strokeDasharray="10 6"
            pointerEvents="none"
          />

          {/* Empty plot label */}
          <text x={svgSize.w * 0.5} y={svgSize.h * 0.88} fontSize="10" fill={T.faint} textAnchor="middle" letterSpacing="0.1em">
            SITE BOUNDARY — {siteName.toUpperCase()}
          </text>

          {/* Buildings (back-to-front paint order) */}
          {[...buildings]
            .sort((a, b) => a.cy - b.cy)
            .map((bld) => (
              <IsoBuilding
                key={bld.id}
                bld={bld}
                vw={svgSize.w}
                vh={svgSize.h}
                mode={mode}
                data={siteData}
                hovered={hovered === bld.id}
                onHover={setHovered}
              />
            ))}

          {/* Mode overlay — wind arrows */}
          {mode === "wind" &&
            (() => {
              const dir = siteData.windDirection;
              const dirAngle = { N: 270, NE: 225, E: 180, SE: 135, S: 90, SW: 45, W: 0, NW: 315 };
              const a = ((dirAngle[dir] ?? 45) * Math.PI) / 180;
              const dx = Math.cos(a),
                dy = Math.sin(a);
              const arrows = [];
              for (let r = 0; r < 4; r++)
                for (let c = 0; c < 6; c++) {
                  const bx = svgSize.w * 0.2 + c * (svgSize.w * 0.13);
                  const by = svgSize.h * 0.2 + r * (svgSize.h * 0.18);
                  const len = 18 + Math.sin(r * 1.3 + c * 0.9) * 8;
                  const ex = bx + dx * len,
                    ey = by + dy * len;
                  const headA = Math.atan2(ey - by, ex - bx);
                  arrows.push({ bx, by, ex, ey, headA });
                }
              return arrows.map((ar, i) => (
                <g key={i} opacity="0.55">
                  <line x1={ar.bx} y1={ar.by} x2={ar.ex} y2={ar.ey} stroke={T.teal} strokeWidth="1.5" />
                  <line
                    x1={ar.ex}
                    y1={ar.ey}
                    x2={ar.ex - 7 * Math.cos(ar.headA - 0.5)}
                    y2={ar.ey - 7 * Math.sin(ar.headA - 0.5)}
                    stroke={T.teal}
                    strokeWidth="1.5"
                  />
                  <line
                    x1={ar.ex}
                    y1={ar.ey}
                    x2={ar.ex - 7 * Math.cos(ar.headA + 0.5)}
                    y2={ar.ey - 7 * Math.sin(ar.headA + 0.5)}
                    stroke={T.teal}
                    strokeWidth="1.5"
                  />
                </g>
              ));
            })()}

          {/* Mode overlay — solar heat blobs */}
          {mode === "solar" &&
            siteData.envZones.map((z, i) => {
              const lvlOp = { vlow: 0.08, low: 0.12, med: 0.22, high: 0.3, vhigh: 0.4 };
              const lvlC = { vlow: T.teal, low: T.sky, med: T.amber, high: "#f97316", vhigh: T.danger };
              const px = svgSize.w * (0.18 + (z.x / 100) * 0.64);
              const py = svgSize.h * (0.16 + (z.y / 100) * 0.6);
              const pw = (svgSize.w * 0.64 * z.w) / 100;
              const ph = (svgSize.h * 0.6 * z.h) / 100;
              return (
                <rect
                  key={i}
                  x={px}
                  y={py}
                  width={pw}
                  height={ph}
                  rx="4"
                  fill={lvlC[z.level] || T.amber}
                  opacity={lvlOp[z.level] || 0.15}
                  pointerEvents="none"
                />
              );
            })}

          {/* Mode overlay — risk flood zone */}
          {mode === "risk" && siteData.floodRisk !== "Low" && (
            <rect
              x={svgSize.w * 0.18}
              y={svgSize.h * 0.68}
              width={svgSize.w * 0.64}
              height={svgSize.h * 0.08}
              rx="4"
              fill={T.danger}
              opacity="0.15"
              pointerEvents="none"
            />
          )}

          {/* Compass */}
          <g transform={`translate(${svgSize.w - 52}, 28)`}>
            <circle cx={0} cy={0} r={20} fill="rgba(8,15,24,0.8)" stroke={T.border} strokeWidth="1" />
            {["N", "E", "S", "W"].map((d, i) => {
              const a = ((i * 90 - 90) * Math.PI) / 180;
              return (
                <text
                  key={d}
                  x={Math.cos(a) * 13}
                  y={Math.sin(a) * 13 + 3}
                  fontSize="8"
                  fill={d === "N" ? T.amber : T.faint}
                  textAnchor="middle"
                  fontWeight={d === "N" ? "700" : "400"}
                >
                  {d}
                </text>
              );
            })}
            <circle cx={0} cy={0} r={2} fill={T.faint} />
          </g>

          {/* Time indicator */}
          <g transform={`translate(14, 14)`}>
            <rect x={0} y={0} width={110} height={30} rx="5" fill="rgba(8,15,24,0.85)" stroke={T.border} strokeWidth="1" />
            <circle cx={14} cy={15} r={7} fill={isDaytime ? T.sun : T.violet} opacity={isDaytime ? sunEl * 0.8 + 0.2 : 0.7} />
            <text x={26} y={11} fontSize="8" fill={T.faint}>
              TIME
            </text>
            <text x={26} y={23} fontSize="10" fill={T.text} fontWeight="700">
              {timeH < 12
                ? `${Math.floor(timeH)}:${String(Math.round((timeH % 1) * 60)).padStart(2, "0")} AM`
                : timeH === 12
                  ? "12:00 PM"
                  : `${Math.floor(timeH - 12)}:${String(Math.round((timeH % 1) * 60)).padStart(2, "0")} PM`}
            </text>
          </g>

          {/* 3D label */}
          <g transform={`translate(14, ${svgSize.h - 36})`}>
            <rect x={0} y={0} width={130} height={22} rx="4" fill="rgba(8,15,24,0.8)" stroke={T.border} strokeWidth="1" />
            <text x={8} y={14} fontSize="8" fill={T.faint} letterSpacing="0.06em">
              3D SITE MODEL · ISOMETRIC
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ── Timeline Slider ────────────────────────────────────────── */
function TimelineSlider({ timeH, onChange }) {
  const hours = [6, 9, 12, 15, 18, 21];
  const labels = { 6: "6 AM", 9: "9 AM", 12: "Noon", 15: "3 PM", 18: "6 PM", 21: "9 PM" };
  const pct = ((timeH - 6) / 18) * 100;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        background: T.panel,
        borderTop: `1px solid ${T.border}`,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", color: T.faint, whiteSpace: "nowrap" }}>◷ TIMELINE</span>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg,${T.blue},${T.amber})`,
              borderRadius: 2,
            }}
          />
        </div>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {hours.map((h) => (
            <button
              key={h}
              onClick={() => onChange(h)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 8,
                color: timeH === h ? T.amber : T.faint,
                fontWeight: timeH === h ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {labels[h]}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="6"
          max="24"
          step="0.5"
          value={timeH}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ position: "absolute", top: -6, left: 0, width: "100%", height: 16, opacity: 0, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

const STORIES = {
  solar: (data, name) => [
    `${name} receives ${data.annualIrradiance} kWh/m² annual solar irradiance — ${data.solarEfficiency >= 80 ? "top-tier performance" : "moderate performance with optimization potential"}.`,
    `Peak solar efficiency of ${data.solarEfficiency}% occurs during the window ${data.peakSolarHours}.`,
    `Building orientations aligned ${data.solarEfficiency >= 75 ? "optimally" : "sub-optimally"} — ${data.solarEfficiency >= 75 ? "rooftop expansion viable immediately." : "tilt-angle correction recommended before expansion."}`,
    `Thermal storage beneath the solar zone could reduce peak cooling demand by up to 18%.`,
  ],
  wind: (data, name) => [
    `Prevailing ${data.windDirection} wind at ${data.windSpeedAvg} mph creates a natural cooling corridor across ${name}.`,
    `Wind turbulence detected behind Buildings B and C — buffer planting mitigates HVAC penalty.`,
    `${data.windSpeedAvg > 9 ? `3×500 kW turbines viable — combined with solar, renewable share reaches 32% by 2028.` : "Low wind velocity favours solar-dominant energy strategy."}`,
    `Natural ventilation potential rated ${data.windSpeedAvg > 9 ? "HIGH" : data.windSpeedAvg > 6 ? "MODERATE" : "LOW"} — stack ventilation suitable for office and light manufacturing.`,
  ],
  risk: (data, name) => [
    `${name} flood risk: ${data.floodRisk}. ${data.floodRisk === "Low" ? "Site above 100-year flood plain — FEMA certified." : "Elevated foundation recommended for all new structures."}`,
    `Temperature exposure rated ${data.tempExposure} — ${data.tempExposureLevel === "success" ? "no special cooling infrastructure required." : "HVAC upgrade and cool roof investment advised."}`,
    `Carbon score ${data.carbonScore}/100 — ${data.carbonScore >= 85 ? "ahead of WA 2027 regulatory threshold." : "renewable investment required to achieve compliance."}`,
    `Water reuse at ${data.waterReuse}% — ${data.waterReuse >= 35 ? "on enterprise target." : "below 40% target — closed-loop recycling investment needed."}`,
  ],
  infra: (data, name) => [
    `${name} power infrastructure operating at ${data.solarEfficiency >= 80 ? "78%" : "86%"} capacity — ${data.solarEfficiency >= 80 ? "headroom available for expansion." : "reinforcement recommended within 18 months."}`,
    `Water demand at ${data.waterReuse}% reuse rate — ${data.waterReuse >= 35 ? "closed-loop contributing to utility cost reduction." : "below target — investment in recycling infrastructure required."}`,
    `Logistics corridor optimised for ${data.windDirection} wind profile — freight approach from ${data.windDirection === "SW" || data.windDirection === "NW" ? "north" : "east"} gate recommended.`,
    `Infrastructure stress index: ${data.solarEfficiency >= 80 ? "LOW — site cleared for 3 simultaneous manufacturing blocks." : "MEDIUM — address power and water constraints before expansion."}`,
  ],
};

export default function SimulationViewer({ siteData, siteName, siteId = "tacoma" }) {
  const [mode, setMode] = useState("solar");
  const [timeH, setTimeH] = useState(10);
  const [activeLayers, setLayers] = useState(new Set(["solar", "heat"]));
  const [storyMode, setStoryMode] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const storyRef = useRef(null);

  useEffect(() => {
    if (!storyMode) {
      clearInterval(storyRef.current);
      return;
    }
    const lines = STORIES[mode]?.(siteData, siteName) || [];
    setStoryStep(0);
    storyRef.current = setInterval(() => {
      setStoryStep((s) => {
        if (s >= lines.length - 1) {
          clearInterval(storyRef.current);
          setStoryMode(false);
          return 0;
        }
        return s + 1;
      });
    }, 3200);
    return () => clearInterval(storyRef.current);
  }, [storyMode, mode]);

  const toggleLayer = (id) =>
    setLayers((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const currentMode = MODES.find((m) => m.id === mode);
  const insights = modeInsights(mode, siteData, siteName);
  const storyLines = STORIES[mode]?.(siteData, siteName) || [];
  const eff = siteData.solarEfficiency;

  return (
    <div className="env-intel-workspace">
      {/* Mode strip */}
      <div className="env-intel-modes">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`env-mode-btn${mode === m.id ? " active" : ""}`}
            style={mode === m.id ? { borderColor: m.color, color: m.color } : {}}
            onClick={() => setMode(m.id)}
          >
            <span style={{ fontSize: 14 }}>{m.icon}</span>
            <span>{m.label}</span>
            {mode === m.id && (
              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
            )}
          </button>
        ))}
        <button
          className={`env-mode-btn story-btn${storyMode ? " active" : ""}`}
          style={storyMode ? { borderColor: T.violet, color: T.violet } : {}}
          onClick={() => setStoryMode((s) => !s)}
        >
          <span style={{ fontSize: 14 }}>▶</span>
          <span>Play AI Analysis</span>
        </button>
      </div>

      {/* 3-panel body */}
      <div className="env-intel-body">
        {/* LEFT controls */}
        <div className="env-intel-controls">
          <div className="env-intel-controls__header">
            <span>⬡</span>
            <span>Intelligence Controls</span>
          </div>
          {LAYER_GROUPS.map((group) => (
            <div key={group.group} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: group.color,
                  padding: "4px 12px 4px",
                  borderLeft: `2px solid ${group.color}`,
                  marginBottom: 4,
                }}
              >
                {group.group}
              </div>
              {group.layers.map((layer) => (
                <button
                  key={layer.id}
                  className={`env-layer-btn${activeLayers.has(layer.id) ? " active" : ""}`}
                  style={activeLayers.has(layer.id) ? { color: group.color } : {}}
                  onClick={() => toggleLayer(layer.id)}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: activeLayers.has(layer.id) ? group.color : "rgba(255,255,255,0.1)",
                      boxShadow: activeLayers.has(layer.id) ? `0 0 5px ${group.color}` : "none",
                      transition: "all 0.15s",
                    }}
                  />
                  {layer.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* CENTER canvas — 3D map */}
        <div className="env-intel-canvas">
          <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 16 }}>{currentMode.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: currentMode.color }}>{currentMode.label}</span>
            <span style={{ fontSize: 10, color: T.faint }}>— {siteName} · 3D Site Model</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 5px ${T.green}` }} />
              <span style={{ fontSize: 9, color: T.green, fontWeight: 600 }}>LIVE MODEL</span>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Canvas3DMap siteData={siteData} siteName={siteName} siteId={siteId} mode={mode} timeH={timeH} />
            {storyMode && storyLines[storyStep] && (
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(8,14,22,0.92)",
                  border: `1px solid ${T.violet}`,
                  borderRadius: 10,
                  padding: "12px 20px",
                  maxWidth: 500,
                  backdropFilter: "blur(8px)",
                  zIndex: 1000,
                  pointerEvents: "auto",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: T.violet,
                      boxShadow: `0 0 8px ${T.violet}`,
                      marginTop: 3,
                      flexShrink: 0,
                    }}
                  />
                  <p style={{ fontSize: 12, color: T.text, lineHeight: 1.6, margin: 0 }}>{storyLines[storyStep]}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  {storyLines.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === storyStep ? 16 : 6,
                        height: 4,
                        borderRadius: 2,
                        background: i === storyStep ? T.violet : T.faint,
                        transition: "all 0.2s",
                      }}
                    />
                  ))}
                  <button
                    onClick={() => setStoryMode(false)}
                    style={{ marginLeft: "auto", fontSize: 9, color: T.faint, background: "none", border: "none", cursor: "pointer" }}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <TimelineSlider timeH={timeH} onChange={setTimeH} />
        </div>

        {/* RIGHT advisor */}
        <div className="env-intel-advisor">
          <div className="env-intel-controls__header">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.violet, boxShadow: `0 0 6px ${T.violet}` }} />
            <span>AI Environmental Advisor</span>
          </div>
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}` }}>
            {mode === "solar" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { l: "Solar Efficiency", v: `${siteData.solarEfficiency}%`, c: T.amber },
                  { l: "Irradiance", v: `${siteData.annualIrradiance}`, c: T.sun },
                  { l: "Peak Window", v: siteData.peakSolarHours.split(" – ")[0], c: T.text },
                  { l: "Green Cover", v: `${siteData.greenCoverage}%`, c: T.green },
                ].map((k) => (
                  <div key={k.l} style={{ background: T.surface, borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 8, color: T.faint, marginBottom: 1 }}>{k.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            )}
            {mode === "wind" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { l: "Wind Direction", v: siteData.windDirection, c: T.teal },
                  { l: "Avg Speed", v: `${siteData.windSpeedAvg} mph`, c: T.sky },
                  { l: "Cooling", v: siteData.windSpeedAvg > 9 ? "High" : "Moderate", c: siteData.windSpeedAvg > 9 ? T.green : T.amber },
                  { l: "Rainfall", v: `${siteData.annualRainfall}"`, c: T.text },
                ].map((k) => (
                  <div key={k.l} style={{ background: T.surface, borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 8, color: T.faint, marginBottom: 1 }}>{k.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            )}
            {mode === "risk" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { l: "Flood Risk", v: siteData.floodRisk, c: siteData.floodRiskLevel === "success" ? T.green : T.amber },
                  {
                    l: "Temp Exposure",
                    v: siteData.tempExposure,
                    c: siteData.tempExposureLevel === "success" ? T.green : siteData.tempExposureLevel === "warning" ? T.amber : T.danger,
                  },
                  { l: "Carbon Score", v: `${siteData.carbonScore}/100`, c: siteData.carbonScore >= 85 ? T.green : T.sky },
                  { l: "Water Reuse", v: `${siteData.waterReuse}%`, c: siteData.waterReuse >= 35 ? T.green : T.amber },
                ].map((k) => (
                  <div key={k.l} style={{ background: T.surface, borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 8, color: T.faint, marginBottom: 1 }}>{k.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            )}
            {mode === "infra" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { l: "Power Util.", v: eff >= 80 ? "78%" : "86%", c: eff >= 80 ? T.green : T.amber },
                  { l: "Water Reuse", v: `${siteData.waterReuse}%`, c: siteData.waterReuse >= 35 ? T.green : T.amber },
                  { l: "Logistics", v: siteData.windSpeedAvg < 8 ? "Excellent" : "Good", c: T.teal },
                  { l: "Readiness", v: eff >= 80 ? "High" : "Medium", c: eff >= 80 ? T.green : T.amber },
                ].map((k) => (
                  <div key={k.l} style={{ background: T.surface, borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 8, color: T.faint, marginBottom: 1 }}>{k.l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.map((ins, i) => (
              <div
                key={i}
                style={{
                  background: T.surface,
                  border: `1px solid ${ins.color}28`,
                  borderLeft: `3px solid ${ins.color}`,
                  borderRadius: 6,
                  padding: "8px 10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: ins.color, fontSize: 10 }}>{ins.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: ins.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {ins.label}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.55, margin: 0 }}>{ins.body}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px", borderTop: `1px solid ${T.border}` }}>
            <div
              style={{
                background: eff >= 80 ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)",
                border: `1px solid ${eff >= 80 ? T.green : T.amber}`,
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: eff >= 80 ? T.green : T.amber,
                  boxShadow: `0 0 6px ${eff >= 80 ? T.green : T.amber}`,
                }}
              />
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: eff >= 80 ? T.green : T.amber }}>MANUFACTURING SUITABILITY</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                  {eff >= 80 ? "High — cleared for immediate expansion" : "Conditional — targeted investment required"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
