/* =====================================================================
   SimulationViewer2 — Cinematic AI Site Feasibility & Constraints Twin
   Satellite terrain + holographic overlays + animated AI intelligence
   ===================================================================== */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, Tooltip, useMap } from "react-leaflet";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import { useSiteData } from "../../context/SiteDataContext.jsx";

/* ── Tokens ─────────────────────────────────────────────────────────── */
const D = {
  bg: "#02060c",
  panel: "#050e1a",
  card: "#071222",
  border: "rgba(56,189,248,0.12)",
  text: "#d0eaff",
  muted: "#4e7a9a",
  sky: "#38bdf8",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  purple: "#a855f7",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  orange: "#fb923c",
  teal: "#14b8a6",
  blue: "#3b82f6",
  yellow: "#fbbf24",
  pink: "#ec4899",
};
const L = {
  bg: "#e8f2ff",
  panel: "#f2f8ff",
  card: "#ffffff",
  border: "rgba(20,80,180,0.12)",
  text: "#0a1a30",
  muted: "#3a608a",
  sky: "#1a7fcf",
  cyan: "#0891b2",
  violet: "#7c3aed",
  purple: "#9333ea",
  amber: "#b45309",
  green: "#15803d",
  red: "#dc2626",
  orange: "#ea580c",
  teal: "#0f766e",
  blue: "#1d4ed8",
  yellow: "#a16207",
  pink: "#be185d",
};

const h2a = (h, a) => {
  if (!h || h[0] !== "#") return `rgba(56,189,248,${a})`;
  const r = parseInt(h.slice(1, 3), 16),
    g = parseInt(h.slice(3, 5), 16),
    b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

/* ── Suitability level config ────────────────────────────────────────── */
const SUIT_LEVELS = [
  { key: "vhigh", color: "#22c55e", label: "Very High", nightColor: "#00ff66" },
  { key: "high", color: "#86efac", label: "High", nightColor: "#4ade80" },
  { key: "medium", color: "#fbbf24", label: "Medium", nightColor: "#fde047" },
  { key: "low", color: "#fb923c", label: "Low", nightColor: "#fdba74" },
  { key: "vlow", color: "#ef4444", label: "Very Low", nightColor: "#f87171" },
];

const CTYPES = {
  highway: { color: "#f97316", label: "Highway Buffer", dash: "10,5" },
  powerline: { color: "#ef4444", label: "Power Line Buffer", dash: "6,4" },
  waterbody: { color: "#38bdf8", label: "Water Body Buffer", dash: "4,6" },
  protected: { color: "#14b8a6", label: "Protected Area", dash: "3,3" },
  flood: { color: "#7dd3fc", label: "Flood Zone", dash: "12,4" },
  slope: { color: "#dc2626", label: "Steep Slope (>15%)", dash: "5,5" },
};

/* ══════════════════════════════════════════════════════════════════════
   SITE DATA
   ══════════════════════════════════════════════════════════════════════ */
const SITES = {
  /* ── Tacoma Port Manufacturing Hub ──────────────────────────────── */
  tacoma: {
    name: "Tacoma Port Manufacturing Hub",
    region: "Tacoma, WA (Pierce County)",
    coords: "47.13°N 122.51°W",
    area: "420 Acres",
    type: "Port & Heavy Industrial",
    score: 87,
    rating: "Very Good",
    scoreColor: "#22c55e",
    criteria: [
      { label: "Solar Resource", v: 72 },
      { label: "Land Suitability", v: 88 },
      { label: "Grid Connectivity", v: 82 },
      { label: "Environmental Impact", v: 78 },
      { label: "Water Availability", v: 92 },
      { label: "Accessibility", v: 90 },
      { label: "Slope & Topography", v: 85 },
      { label: "Risk Factors", v: 80 },
    ],
    constraints: [
      { type: "flood", text: "Tidal flood zone — SW waterfront (1.4m BFE)" },
      { type: "protected", text: "Wetland buffer corridor — 80m setback required" },
      { type: "waterbody", text: "Commencement Bay riparian restriction — W edge" },
    ],
    ai: {
      envRisk: "LOW",
      renewable: "MEDIUM-HIGH",
      infraComplexity: "MEDIUM",
      utilityReady: 88,
      capex: "$54M",
      timeline: "18 months",
      sustainability: 82,
      rootCause:
        "Flat glacial-till platform at Tacoma tideflats — 420 acres of brownfield adjacent to Port of Tacoma's container terminal (3rd busiest US West Coast port). Direct BNSF mainline 180m east. PSE 115kV available at site boundary on Taylor Way. SW corner intersects FEMA Flood Zone AE (BFE +1.4m NAVD88).",
      prediction:
        "93% delivery probability within 11–14 months. Port container priority status cuts inbound material wait from 4.2 to 1.1 days. Tidal mitigation via break-away ground-floor construction adds ~$280/sqft but enables full NFIP compliance and unlocks federally-backed construction financing.",
      recs: [
        "Negotiate PSE Schedule I-2 Large Industrial rate ($0.058/kWh) — saves $340k/yr vs Schedule I-1 at current load forecast",
        "File BNSF Industrial Track Agreement for 380m spur off East 11th St connector — est. $1.6M capital, $1.1M/yr logistics savings",
        "FEMA Zone AE structures: elevate floor slabs to BFE +0.9m per ASCE 24-14 freeboard req. — install tide gate on stormwater outfall to prevent tidal backflow",
        "Pierce County Critical Areas Ordinance (Title 18E): maintain 80m OHWM setback on Hylebos Waterway — stake boundary before any grading activity",
        "Rooftop PV on Plant A + B combined: 2.1 MW at $0.72/W installed — qualifies for WA Clean Energy Fund incentive, 6.4-yr simple payback",
      ],
    },
    charts: {
      solar: [48, 52, 65, 78, 88, 92, 91, 87, 80, 68, 54, 44],
      wind: [14, 16, 15, 12, 10, 8, 7, 8, 10, 14, 16, 15],
      water: [104, 106, 100, 96, 92, 88, 90, 94, 100, 106, 105, 102],
      sustain: [74, 76, 77, 79, 80, 81, 82, 82, 83, 84, 85, 86],
      cost: [54, 55, 56, 57, 57, 58, 58, 59, 60, 60, 61, 62],
    },
  },

  /* ── Everett Aerospace Manufacturing Campus ─────────────────────── */
  everett: {
    name: "Everett Aerospace Manufacturing Campus",
    region: "Everett, WA (Snohomish County)",
    coords: "47.98°N 122.20°W",
    area: "580 Acres",
    type: "Aerospace & Advanced Manufacturing",
    score: 91,
    rating: "Excellent",
    scoreColor: "#22c55e",
    criteria: [
      { label: "Solar Resource", v: 70 },
      { label: "Land Suitability", v: 94 },
      { label: "Grid Connectivity", v: 95 },
      { label: "Environmental Impact", v: 88 },
      { label: "Water Availability", v: 80 },
      { label: "Accessibility", v: 92 },
      { label: "Slope & Topography", v: 90 },
      { label: "Risk Factors", v: 85 },
    ],
    constraints: [
      { type: "waterbody", text: "Puget Sound setback (100m) — W boundary" },
      { type: "powerline", text: "BPA 500kV transmission corridor (200m) — N" },
      { type: "protected", text: "Paine Field restricted airspace buffer zone" },
    ],
    ai: {
      envRisk: "LOW",
      renewable: "MEDIUM",
      infraComplexity: "LOW",
      utilityReady: 95,
      capex: "$78M",
      timeline: "16 months",
      sustainability: 84,
      rootCause:
        "580-acre aerospace-industrial campus adjacent to Boeing Everett facility. BPA 500kV Snohomish–Monroe corridor passes within 220m of NE boundary. Paine Field (KPAE) runway 34R threshold 1.1km north — FAA Part 77 surfaces constrain structures. Snohomish County I-2 Heavy Industrial zoning, no conditional use required.",
      prediction:
        "94% construction success probability at $78M CAPEX. BPA direct substation reduces grid cost 26% vs PSE distribution — available Q2 post-groundbreaking. BNSF Everett yard 0.9km east enables $2.1M rail spur with 3-yr payback. FAA coordination for structures ≤45m AGL: 60-day turnaround under 14 CFR Part 157.",
      recs: [
        "BPA 500kV direct industrial service: negotiate GIA (Generator Interconnection Agreement) — demand >10MW qualifies at ~$0.041/kWh vs $0.089 PSE standard rate",
        "File FAA Form 7460-1 for any structure >30m — initiate 45 days before permitting to keep 60-day FAA review on critical path",
        "BNSF Everett Yard spur: 0.9km at ≤0.3% grade from Lowell connector, $2.1M capital, JIT aerospace delivery cuts inbound logistics 35%",
        "Rooftop solar canopy over employee parking (400 spaces): 1.4 MW, Snohomish PUD NEM-C net metering, est. 7.2-yr payback",
        "SMA shoreline setback (RCW 90.58): stake OHWM on Puget Sound W boundary before site plan submission — avoids Shoreline Variance process (18-month delay risk)",
        "Rainwater harvest from assembly hangar roofs (2.4 ha): 4.8M L/yr reduces utility cost and satisfies DOE Manual Vol. V post-construction stormwater LID requirement",
      ],
    },
    charts: {
      solar: [42, 48, 62, 76, 86, 90, 89, 85, 78, 64, 50, 40],
      wind: [18, 20, 22, 20, 17, 14, 12, 14, 18, 22, 22, 20],
      water: [88, 90, 86, 82, 78, 76, 78, 82, 86, 90, 90, 88],
      sustain: [78, 80, 81, 82, 83, 84, 84, 85, 86, 87, 88, 89],
      cost: [78, 79, 80, 81, 82, 83, 83, 84, 85, 86, 86, 87],
    },
  },

  /* ── Spokane Valley Industrial Corridor ─────────────────────────── */
  spokane: {
    name: "Spokane Valley Industrial Corridor",
    region: "Spokane, WA (Spokane County)",
    coords: "47.66°N 117.43°W",
    area: "480 Acres",
    type: "Industrial Energy & Logistics Hub",
    score: 83,
    rating: "Good",
    scoreColor: "#22c55e",
    criteria: [
      { label: "Solar Resource", v: 85 },
      { label: "Land Suitability", v: 90 },
      { label: "Grid Connectivity", v: 88 },
      { label: "Environmental Impact", v: 75 },
      { label: "Water Availability", v: 72 },
      { label: "Accessibility", v: 94 },
      { label: "Slope & Topography", v: 97 },
      { label: "Risk Factors", v: 74 },
    ],
    constraints: [
      { type: "highway", text: "I-90 highway buffer zone (100m) — S boundary" },
      { type: "powerline", text: "Avista 230kV transmission corridor (180m)" },
      { type: "flood", text: "Spokane River 100-yr flood plain — NE quadrant" },
    ],
    ai: {
      envRisk: "MEDIUM",
      renewable: "HIGH",
      infraComplexity: "LOW",
      utilityReady: 88,
      capex: "$55M",
      timeline: "14 months",
      sustainability: 76,
      rootCause:
        "480-acre industrial corridor in Spokane Valley — flat basalt-till terrain, 0.3% cross-slope, lowest grading cost per sqft of all four sites. I-90 Exit 291B direct access, BNSF Spokane intermodal yard 1.2km north. Avista 230kV Sullivan–Trent corridor adjacent (WAC 296-45-035 180m setback on NE boundary). Spokane River 100-yr flood plain (FEMA Zone AE) clips NE corner.",
      prediction:
        "94% delivery probability. Avista IR-2 Large Industrial rate ($0.046/kWh) available at site boundary — grid connection within 5 months post-groundbreaking. Construction cost 18% below Puget Sound sites due to flat terrain and eastern WA labour rates. BNSF connection reduces inbound freight $1.4M/yr.",
      recs: [
        "Apply for Avista Rate Schedule IR-2 (Large Industrial, demand >1,000 kW) — $0.046/kWh vs $0.082 standard commercial, saves ~$420k/yr at 12 MW base load",
        "BNSF Spokane Intermodal spur: 1.2km extension off industrial track at Trent Ave, est. $1.8M capital, 400 TEU/wk capacity, $1.4M/yr logistics savings (3-yr payback)",
        "FEMA Zone AE (Spokane River): commission floodplain study under CLOMR process before siting any NE structures — 6-month process, prevents expensive redesign",
        "Wind assessment: Class 4 eastern WA resource at 80m hub height — 6×2.5MW IEC Class II turbines viable on N buffer, ~$18M capital, 22-yr IRR of 9.4% at current REC prices",
        "Avista 230kV setback (WAC 296-45-035): maintain 180m horizontal and 15m vertical clearance — use setback zone for 120-space parking and equipment laydown to eliminate wasted land",
        "Spokane County Critical Areas Ordinance: shallow basalt bedrock at 1.2–1.8m depth in NW quadrant — commission geotechnical borings grid 30m×30m before foundation design to avoid post-bid rock excavation change orders",
      ],
    },
    charts: {
      solar: [55, 60, 72, 82, 90, 94, 95, 92, 84, 74, 60, 50],
      wind: [24, 26, 28, 26, 22, 18, 16, 18, 22, 26, 28, 26],
      water: [48, 46, 44, 42, 40, 38, 36, 38, 42, 46, 48, 50],
      sustain: [68, 70, 71, 73, 74, 75, 76, 76, 77, 78, 78, 79],
      cost: [55, 56, 57, 58, 59, 60, 60, 61, 62, 63, 63, 64],
    },
  },

  /* ── Yakima Valley Renewable Energy Site ────────────────────────── */
  yakima: {
    name: "Yakima Valley Renewable Energy Site",
    region: "Yakima, WA (Yakima County)",
    coords: "46.60°N 120.50°W",
    area: "340 Acres",
    type: "Renewable Energy & Agri-Industrial",
    score: 79,
    rating: "Good",
    scoreColor: "#eab308",
    criteria: [
      { label: "Solar Resource", v: 90 },
      { label: "Land Suitability", v: 82 },
      { label: "Grid Connectivity", v: 78 },
      { label: "Environmental Impact", v: 72 },
      { label: "Water Availability", v: 88 },
      { label: "Accessibility", v: 75 },
      { label: "Slope & Topography", v: 80 },
      { label: "Risk Factors", v: 68 },
    ],
    constraints: [
      { type: "waterbody", text: "Yakima River irrigation district setback (90m)" },
      { type: "highway", text: "US-12 highway buffer (100m) — S boundary" },
      { type: "slope", text: "Yakima Ridge slope >15% — eastern escarpment" },
    ],
    ai: {
      envRisk: "MEDIUM-HIGH",
      renewable: "EXCELLENT",
      infraComplexity: "MEDIUM",
      utilityReady: 78,
      capex: "$44M",
      timeline: "20 months",
      sustainability: 86,
      rootCause:
        "340-acre agri-industrial site in lower Yakima Valley — 290+ sunny days/yr, highest GHI in Washington State (5.8 kWh/m²/day). Yakima Ridge escarpment eastern edge >15% slope, constrains eastern expansion. Yakima River irrigation district water rights (WRIA 37, Ecology Dept) complex — junior rights only available seasonally May–Sep. BPA Yakima–Ellensburg 230kV line 2.1km south; PSE Yakima substation 3.8km northwest.",
      prediction:
        "84% success probability contingent on water rights adjudication. Solar generation potential top 3% of WA sites — 28 MW Phase 1 achievable. Agrivoltaic dual-use (crops + panels) reduces SEPA review scope and local opposition risk significantly.",
      recs: [
        "File Washington State Dept of Ecology water right application (WAC 173-152) immediately — WRIA 37 senior rights adjudicated, new applications take 12–18 months; budget $45k–80k for water rights attorney and hydrogeological report",
        "Interconnect with PSE Yakima substation (3.8km, 230kV) under WUTC T-3 Large Power Service — avoid BPA GIA queue by using PSE distribution interconnection which is 6–8 months faster",
        "Agrivoltaic configuration: east–west tracking panels at 2m clearance — dual-use reduces land cost conflict, qualifies for USDA REAP grant (up to 25% of system cost), and satisfies Yakima County agricultural zoning",
        "Phase 1 solar: 28 MW using bifacial 580W modules at 1.5 GCR — est. $0.71/W installed, annual yield 48,400 MWh, PPA at $0.038/kWh achievable with DOE CDFI anchor offtake",
        "Yakima Ridge wind: commission IEC Class III wind assessment at 80m hub — existing WRCC data shows 7.2 m/s mean; 4×2.5MW turbines viable at N boundary, 15.4% capacity factor, $14M capital",
        "Yakima County Code Title 15C agricultural buffer: maintain 90m setback from Yakima River irrigation ditch (lateral class 4) — survey existing lateral alignment before grading to avoid Army Corps Section 404 wetland disturbance",
      ],
    },
    charts: {
      solar: [62, 68, 78, 86, 92, 96, 97, 94, 88, 80, 68, 58],
      wind: [20, 22, 24, 22, 18, 16, 14, 16, 20, 24, 24, 22],
      water: [78, 80, 76, 74, 72, 68, 66, 70, 74, 78, 80, 78],
      sustain: [78, 80, 81, 83, 84, 85, 86, 86, 87, 88, 88, 89],
      cost: [44, 45, 46, 47, 48, 49, 50, 51, 52, 52, 53, 54],
    },
  },

  /* ── Renton Advanced Manufacturing Park ─────────────────────────── */
  rnt001: {
    name: "Renton Advanced Manufacturing Park",
    region: "Renton, WA (King County)",
    coords: "47.48°N 122.22°W",
    area: "285 Acres",
    type: "EV Manufacturing & Advanced Automotive",
    score: 90,
    rating: "Excellent",
    scoreColor: "#22c55e",
    criteria: [
      { label: "Solar Resource", v: 68 },
      { label: "Land Suitability", v: 91 },
      { label: "Grid Connectivity", v: 91 },
      { label: "Environmental Impact", v: 82 },
      { label: "Water Availability", v: 88 },
      { label: "Accessibility", v: 94 },
      { label: "Slope & Topography", v: 88 },
      { label: "Risk Factors", v: 82 },
    ],
    constraints: [
      { type: "highway", text: "SR-167 buffer zone (80m) — W boundary" },
      { type: "waterbody", text: "Cedar River riparian setback (100m) — S edge" },
      { type: "protected", text: "King County critical areas — NE corner wetland buffer" },
    ],
    ai: {
      envRisk: "LOW",
      renewable: "MEDIUM",
      infraComplexity: "LOW",
      utilityReady: 91,
      capex: "$64M",
      timeline: "18 months",
      sustainability: 82,
      rootCause:
        "285-acre brownfield in Renton's Earlington industrial district adjacent to BNSF mainline. PSE 115kV at site boundary on Grady Way. SR-167 interchange 0.6km north enables direct heavy haul routing. Cedar River floodplain clips SW corner (FEMA Zone AE). King County CAO wetland buffer 60m NE corner.",
      prediction:
        "91% construction success probability at $64M CAPEX. PSE Schedule I-2 industrial rate available at groundbreaking. BNSF spur feasibility confirmed at East Valley Rd connector. EV manufacturing qualifies for WA Clean Energy Fund incentives reducing effective CAPEX by $8M.",
      recs: [
        "Negotiate PSE Schedule I-2 Large Industrial rate — $0.058/kWh base, saves $380k/yr at 14MW base load vs Schedule I-1",
        "File BNSF Industrial Track Agreement for 280m spur off East Valley Rd — est. $1.4M capital, $1.2M/yr logistics savings",
        "Cedar River SMA setback (RCW 90.58): stake OHWM on SW boundary before grading — avoids 18-month Shoreline Variance",
        "King County CAO wetland buffer NE corner: commission delineation survey immediately — stakes required before any Phase 1 clearing",
        "WA Clean Energy Fund application for EV battery manufacturing: up to $8M grant — submit 90 days before groundbreaking",
      ],
    },
    charts: {
      solar: [44, 50, 64, 78, 86, 90, 89, 85, 78, 66, 50, 42],
      wind: [16, 18, 17, 14, 12, 9, 8, 9, 12, 16, 18, 17],
      water: [96, 98, 94, 90, 86, 82, 84, 88, 94, 98, 98, 96],
      sustain: [76, 78, 79, 81, 82, 83, 82, 83, 84, 85, 86, 87],
      cost: [64, 65, 66, 67, 68, 68, 69, 70, 71, 71, 72, 73],
    },
  },

  /* ── Bellingham Aerospace Hub ────────────────────────────────────── */
  blm002: {
    name: "Bellingham Aerospace Hub",
    region: "Bellingham, WA (Whatcom County)",
    coords: "48.75°N 122.48°W",
    area: "380 Acres",
    type: "Aerospace Manufacturing",
    score: 86,
    rating: "Very Good",
    scoreColor: "#22c55e",
    criteria: [
      { label: "Solar Resource", v: 55 },
      { label: "Land Suitability", v: 89 },
      { label: "Grid Connectivity", v: 86 },
      { label: "Environmental Impact", v: 78 },
      { label: "Water Availability", v: 82 },
      { label: "Accessibility", v: 86 },
      { label: "Slope & Topography", v: 84 },
      { label: "Risk Factors", v: 76 },
    ],
    constraints: [
      { type: "protected", text: "BPA 230kV transmission buffer (180m) — NE corridor" },
      { type: "waterbody", text: "Bellingham Bay SMA setback (100m) — W boundary" },
      { type: "flood", text: "Whatcom Creek 100-yr flood zone — SE quadrant" },
    ],
    ai: {
      envRisk: "LOW",
      renewable: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 86,
      capex: "$70M",
      timeline: "20 months",
      sustainability: 80,
      rootCause:
        "380-acre aerospace-grade industrial site adjacent to Bellingham International Airport (KBLI). PSE 115kV at Cornwall Ave substation 1.1km east. BNSF mainline 0.8km south. BPA 230kV Custer–Ferndale corridor NE boundary (180m setback). Bellingham Bay SMA constrains W edge.",
      prediction:
        "88% construction success probability at $70M CAPEX. Airport proximity enables direct aircraft delivery logistics — 30-min ground transport vs 4.5hr trucking from Everett. Canadian border 35km north enables cross-border supply chain advantage.",
      recs: [
        "Negotiate PSE Schedule I-2 at Cornwall Ave substation — $0.061/kWh, saves $290k/yr vs standard commercial at 10MW base load",
        "BNSF spur from Bellingham Yard: 0.8km at 0.4% grade, est. $1.8M capital — serves aerospace component inbound",
        "BPA 230kV setback (WAC 296-45-035): 180m horizontal clearance NE boundary — use for parking and equipment laydown",
        "Bellingham Bay SMA (RCW 90.58): stake OHWM W edge before clearing — structures within 200m require Shoreline CUP",
        "Whatcom Creek flood zone SE: commission CLOMR study before siting SE structures — 6-month process prevents costly redesign",
      ],
    },
    charts: {
      solar: [38, 44, 58, 72, 82, 86, 85, 82, 74, 60, 44, 36],
      wind: [20, 22, 24, 22, 18, 15, 13, 15, 19, 23, 24, 22],
      water: [100, 102, 98, 94, 90, 86, 88, 92, 98, 102, 102, 100],
      sustain: [72, 74, 75, 77, 78, 79, 80, 80, 81, 82, 83, 84],
      cost: [70, 71, 72, 73, 74, 74, 75, 76, 77, 77, 78, 79],
    },
  },
};

/* ── Normalize [lat,lon] boundary → 0-100 SVG space ─────────────────── */
function normalizeBoundary(boundary) {
  if (!boundary?.length) return null;
  const lats = boundary.map(([lat]) => lat);
  const lons = boundary.map(([, lon]) => lon);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLon = Math.min(...lons),
    maxLon = Math.max(...lons);
  const pad = 6,
    scale = 100 - pad * 2;
  return boundary.map(([lat, lon]) => [((lon - minLon) / (maxLon - minLon)) * scale + pad, ((maxLat - lat) / (maxLat - minLat)) * scale + pad]);
}

/* ── Convert SVG 0-100 space back to [lat, lon] ──────────────────────── */
function svgToLatLon(x, y, boundary) {
  if (!boundary?.length) return [47.5, -120.5];
  const lats = boundary.map(([lat]) => lat);
  const lons = boundary.map(([, lon]) => lon);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLon = Math.min(...lons),
    maxLon = Math.max(...lons);
  const pad = 6,
    scale = 100 - pad * 2;
  return [maxLat - ((y - pad) / scale) * (maxLat - minLat), ((x - pad) / scale) * (maxLon - minLon) + minLon];
}

/* ── Clip a [lat,lon] polygon to the site boundary using Turf ─────────── */
function clipToBoundary(positions, boundary) {
  if (!boundary?.length || positions.length < 3) return positions;
  try {
    const toCoord = ([lat, lon]) => [lon, lat];
    const fromCoord = ([lon, lat]) => [lat, lon];
    const close = (pts) => [...pts, pts[0]];
    const zonePoly = turf.polygon([close(positions.map(toCoord))]);
    const sitePolyCoords = close(boundary.map(toCoord));
    const sitePoly = turf.polygon([sitePolyCoords]);
    const clipped = turf.intersect(turf.featureCollection([zonePoly, sitePoly]));
    if (!clipped) return null;
    const geom = clipped.geometry;
    if (geom.type === "Polygon") return geom.coordinates[0].slice(0, -1).map(fromCoord);
    if (geom.type === "MultiPolygon") return geom.coordinates[0][0].slice(0, -1).map(fromCoord);
    return null;
  } catch {
    return positions;
  }
}

/* ── OSM data cache (module-level, persists across re-renders) ───────── */
const osmCache = {};

/* Road colour by OSM highway type */
function roadStyle(type) {
  if (type === "motorway" || type === "motorway_link") return { color: "#fbbf24", weight: 3.5, opacity: 0.85 };
  if (type === "trunk" || type === "trunk_link") return { color: "#f59e0b", weight: 2.5, opacity: 0.8 };
  if (type === "primary" || type === "primary_link") return { color: "#e5e7eb", weight: 2, opacity: 0.75 };
  if (type === "secondary") return { color: "#9ca3af", weight: 1.5, opacity: 0.7 };
  return { color: "#6b7280", weight: 1, opacity: 0.55 };
}

/* ── Parse Overpass JSON into categorised feature arrays ──────────────── */
function parseOsmData(elements) {
  const roads = [],
    railways = [],
    waterways = [],
    powerLines = [],
    industrial = [],
    airports = [],
    buildings = [];
  for (const el of elements) {
    if (!el.geometry?.length) continue;
    const pts = el.geometry.map((g) => [g.lat, g.lon]);
    const tags = el.tags || {};
    if (tags.highway) roads.push({ pts, type: tags.highway });
    else if (tags.railway === "rail" || tags.railway === "light_rail") railways.push({ pts });
    else if (tags.waterway) waterways.push({ pts, type: tags.waterway });
    else if (tags.power === "line") powerLines.push({ pts });
    else if (tags.landuse === "industrial" || tags.industrial === "port") industrial.push({ pts });
    else if (tags.aeroway === "runway" || tags.aeroway === "taxiway") airports.push({ pts, type: tags.aeroway });
    else if (tags.building && tags.building !== "no") buildings.push({ pts, type: tags.building });
  }
  return { roads, railways, waterways, powerLines, industrial, airports, buildings };
}

/* ── Hook: fetch OSM features for a site boundary (cached) ───────────── */
function useOsmData(siteKey, boundary) {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!boundary?.length) return;
    if (osmCache[siteKey]) {
      setFeatures(osmCache[siteKey]);
      return;
    }
    const lats = boundary.map(([lat]) => lat);
    const lons = boundary.map(([, lon]) => lon);
    const pad = 0.025;
    const s = Math.min(...lats) - pad,
      w = Math.min(...lons) - pad;
    const n = Math.max(...lats) + pad,
      e = Math.max(...lons) + pad;
    const q = `[out:json][timeout:25];(way["highway"~"^(motorway|trunk|primary|secondary)(|_link)$"](${s},${w},${n},${e});way["railway"~"^(rail|light_rail)$"](${s},${w},${n},${e});way["waterway"~"^(river|stream|canal)$"](${s},${w},${n},${e});way["power"="line"](${s},${w},${n},${e});way["landuse"="industrial"](${s},${w},${n},${e});way["industrial"="port"](${s},${w},${n},${e});way["aeroway"~"^(runway|taxiway)$"](${s},${w},${n},${e});way["building"~"^(warehouse|industrial|hangar|manufacture|yes|storage|factory)$"](${s},${w},${n},${e}););out geom;`;
    setLoading(true);
    fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: q })
      .then((r) => r.json())
      .then((data) => {
        const p = parseOsmData(data.elements || []);
        osmCache[siteKey] = p;
        setFeatures(p);
      })
      .catch(() => setFeatures(null))
      .finally(() => setLoading(false));
  }, [siteKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return { features, loading };
}

/* ── Auto-fit map to boundary on mount ──────────────────────────────── */
function MapAutoFit({ boundary }) {
  const map = useMap();
  useEffect(() => {
    if (boundary?.length) {
      map.fitBounds(Leaflet.latLngBounds(boundary), { padding: [30, 30] });
    }
  }, [boundary, map]);
  return null;
}

/* ── Invalidate Leaflet size when container resizes ─────────────────── */
function MapResizer({ W, H }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 50);
  }, [W, H, map]);
  return null;
}

/* ══════════════════════════════════════════════════════════════════════
   SVG TERRAIN ARTWORK — cinematic satellite-style per biome
   All coords in 0-100 space, rendered via px(v,W)/py(v,H)
   ══════════════════════════════════════════════════════════════════════ */

/* ── Arizona Desert ─────────────────────────────────────────────────── */
function TerrainArizona({ W, H, night }) {
  const base = night ? "#0d0600" : "#c8913c";
  const sand1 = night ? "#180a01" : "#d4a855";
  const sand2 = night ? "#140902" : "#b87c2c";
  const rock1 = night ? "#1c1008" : "#8b5e34";
  const rock2 = night ? "#241408" : "#6b4222";
  const escarp = night ? "#0a0402" : "#5a3318";
  const veg = night ? "#0a0e04" : "#7a8a40";
  const road = night ? "#2a1a0a" : "#aaa085";
  const sky = night ? "#060c18" : "#a0c8f0";

  const p = (pts) => pts.map(([x, y]) => `${(x / 100) * W},${(y / 100) * H}`).join(" ");
  return (
    <g>
      {/* Sky strip */}
      <rect x={0} y={0} width={W} height={H * 0.08} fill={sky} />
      {/* Base desert floor */}
      <rect x={0} y={H * 0.08} width={W} height={H * 0.92} fill={base} />
      {/* Sand dune bands */}
      <polygon
        points={p([
          [0, 8],
          [100, 8],
          [100, 28],
          [68, 22],
          [40, 26],
          [12, 20],
          [0, 24],
        ])}
        fill={sand1}
      />
      <polygon
        points={p([
          [0, 28],
          [40, 26],
          [68, 22],
          [100, 28],
          [100, 48],
          [72, 42],
          [44, 46],
          [18, 40],
          [0, 44],
        ])}
        fill={sand2}
      />
      <polygon
        points={p([
          [0, 48],
          [18, 40],
          [44, 46],
          [72, 42],
          [100, 48],
          [100, 68],
          [78, 60],
          [50, 64],
          [20, 58],
          [0, 62],
        ])}
        fill={sand1}
      />
      {/* Rocky escarpment E */}
      <polygon
        points={p([
          [84, 8],
          [100, 8],
          [100, 72],
          [88, 68],
          [84, 56],
          [82, 44],
          [84, 32],
          [86, 20],
        ])}
        fill={escarp}
      />
      <polygon
        points={p([
          [86, 8],
          [100, 8],
          [100, 60],
          [90, 56],
          [88, 40],
          [90, 24],
          [88, 12],
        ])}
        fill={rock2}
      />
      {/* Rocky outcrops */}
      <polygon
        points={p([
          [10, 28],
          [24, 24],
          [30, 36],
          [22, 42],
          [8, 38],
        ])}
        fill={rock1}
      />
      <polygon
        points={p([
          [52, 20],
          [64, 18],
          [70, 30],
          [62, 36],
          [50, 30],
        ])}
        fill={rock1}
      />
      <polygon
        points={p([
          [34, 50],
          [50, 46],
          [55, 58],
          [46, 64],
          [32, 60],
        ])}
        fill={rock2}
      />
      {/* Sparse vegetation patches */}
      <ellipse cx={W * 0.15} cy={H * 0.36} rx={W * 0.04} ry={H * 0.025} fill={veg} opacity={0.6} />
      <ellipse cx={W * 0.45} cy={H * 0.56} rx={W * 0.03} ry={H * 0.02} fill={veg} opacity={0.5} />
      <ellipse cx={W * 0.7} cy={H * 0.44} rx={W * 0.035} ry={H * 0.02} fill={veg} opacity={0.5} />
      {/* Dry riverbed / wash */}
      <polyline
        points={p([
          [20, 100],
          [22, 82],
          [26, 68],
          [30, 52],
          [28, 36],
          [32, 20],
        ])}
        fill="none"
        stroke={night ? "#1a0e06" : "#c09860"}
        strokeWidth={W * 0.012}
        opacity={0.55}
      />
      {/* Utility corridor (power line right-of-way) */}
      <rect x={0} y={H * 0.07} width={W} height={H * 0.012} fill={road} opacity={0.35} />
      {/* Highway */}
      <rect x={0} y={H * 0.88} width={W} height={H * 0.038} fill={night ? "#201408" : "#c8b890"} opacity={0.9} />
      <rect x={0} y={H * 0.893} width={W} height={H * 0.012} fill={night ? "#302010" : "#e0d0a8"} opacity={0.7} />
      {/* Caliche flat (lighter patch) */}
      <polygon
        points={p([
          [20, 65],
          [60, 62],
          [65, 78],
          [25, 82],
        ])}
        fill={night ? "#1a1206" : "#d8c490"}
        opacity={0.55}
      />
      {/* Contour lines */}
      {[20, 35, 50, 65, 80].map((y, i) => (
        <polyline
          key={i}
          points={p([
            [0, y + Math.sin(i) * 3],
            [25, y - 2],
            [50, y + 1],
            [75, y - 1],
            [100, y + 2],
          ])}
          fill="none"
          stroke={night ? "rgba(255,160,60,0.07)" : "rgba(100,60,10,0.08)"}
          strokeWidth="0.8"
        />
      ))}
      {/* Distance grid */}
      <defs>
        <pattern id="tgAZ" width={W * 0.1} height={H * 0.1} patternUnits="userSpaceOnUse">
          <path
            d={`M ${W * 0.1} 0 L 0 0 0 ${H * 0.1}`}
            fill="none"
            stroke={night ? "rgba(251,146,60,0.045)" : "rgba(100,60,10,0.055)"}
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#tgAZ)" opacity={0.8} />
    </g>
  );
}

/* ── Washington Forest ──────────────────────────────────────────────── */
function TerrainWashington({ W, H, night }) {
  const base = night ? "#020802" : "#2d5c1e";
  const forest1 = night ? "#061006" : "#3a7a24";
  const forest2 = night ? "#04120a" : "#2a6030";
  const forest3 = night ? "#020e04" : "#246020";
  const wetland = night ? "#030c10" : "#2a5848";
  const river = night ? "#040c14" : "#3a6a9a";
  const clear = night ? "#080e04" : "#6a9a40";
  const road = night ? "#181818" : "#b0a888";
  const elev = night ? "#050f05" : "#4a8a30";

  const p = (pts) => pts.map(([x, y]) => `${(x / 100) * W},${(y / 100) * H}`).join(" ");
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={base} />
      {/* Forest canopy masses — irregular organic shapes */}
      <polygon
        points={p([
          [0, 0],
          [38, 0],
          [44, 18],
          [38, 36],
          [22, 32],
          [8, 28],
          [0, 18],
        ])}
        fill={forest1}
      />
      <polygon
        points={p([
          [38, 0],
          [72, 0],
          [78, 14],
          [74, 30],
          [58, 26],
          [44, 18],
        ])}
        fill={forest2}
      />
      <polygon
        points={p([
          [72, 0],
          [100, 0],
          [100, 32],
          [90, 38],
          [78, 30],
          [74, 14],
        ])}
        fill={forest3}
      />
      <polygon
        points={p([
          [0, 54],
          [24, 50],
          [32, 64],
          [28, 78],
          [14, 82],
          [0, 74],
        ])}
        fill={forest2}
      />
      <polygon
        points={p([
          [66, 52],
          [88, 50],
          [94, 68],
          [86, 80],
          [68, 76],
          [62, 64],
        ])}
        fill={forest1}
      />
      <polygon
        points={p([
          [24, 34],
          [60, 30],
          [66, 52],
          [50, 62],
          [28, 58],
          [20, 44],
        ])}
        fill={clear}
      />
      {/* River corridor — winding */}
      <polygon
        points={p([
          [42, 0],
          [50, 0],
          [52, 16],
          [56, 34],
          [54, 52],
          [50, 72],
          [46, 92],
          [40, 100],
          [36, 100],
          [40, 92],
          [44, 72],
          [48, 52],
          [50, 34],
          [46, 16],
          [44, 0],
        ])}
        fill={river}
      />
      {/* Wetland areas */}
      <polygon
        points={p([
          [0, 74],
          [14, 72],
          [18, 86],
          [10, 96],
          [0, 96],
        ])}
        fill={wetland}
        opacity={0.85}
      />
      <polygon
        points={p([
          [28, 78],
          [48, 74],
          [52, 88],
          [38, 94],
          [24, 90],
        ])}
        fill={wetland}
        opacity={0.75}
      />
      {/* Elevation ridgeline N */}
      <polygon
        points={p([
          [0, 0],
          [100, 0],
          [100, 6],
          [78, 14],
          [56, 10],
          [34, 14],
          [14, 10],
          [0, 8],
        ])}
        fill={elev}
      />
      {/* Roads */}
      <rect x={0} y={H * 0.46} width={W} height={H * 0.022} fill={road} opacity={0.65} />
      <rect x={W * 0.54} y={0} width={W * 0.022} height={H * 0.9} fill={road} opacity={0.55} />
      {/* Clearcut patches */}
      <polygon
        points={p([
          [60, 30],
          [78, 28],
          [82, 40],
          [74, 46],
          [60, 42],
        ])}
        fill={clear}
        opacity={0.7}
      />
      {/* Contour glow */}
      {[15, 30, 45, 60, 75].map((y, i) => (
        <polyline
          key={i}
          points={p([
            [0, y + Math.cos(i * 0.8) * 4],
            [25, y + 2],
            [50, y - 2],
            [75, y + 1],
            [100, y + Math.sin(i) * 3],
          ])}
          fill="none"
          stroke={night ? "rgba(56,255,80,0.05)" : "rgba(30,100,20,0.08)"}
          strokeWidth="0.7"
        />
      ))}
      <defs>
        <pattern id="tgWA" width={W * 0.1} height={H * 0.1} patternUnits="userSpaceOnUse">
          <path
            d={`M ${W * 0.1} 0 L 0 0 0 ${H * 0.1}`}
            fill="none"
            stroke={night ? "rgba(56,180,80,0.04)" : "rgba(20,80,20,0.055)"}
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#tgWA)" opacity={0.9} />
    </g>
  );
}

/* ── Texas Semi-Arid ────────────────────────────────────────────────── */
function TerrainTexas({ W, H, night }) {
  const base = night ? "#0a0804" : "#b89a60";
  const flat1 = night ? "#100c06" : "#c8ae78";
  const flat2 = night ? "#0c0a04" : "#a87e48";
  const scrub = night ? "#080c04" : "#7a8040";
  const caliche = night ? "#181408" : "#d8c888";
  const playa = night ? "#060c14" : "#5a8ab0";
  const road = night ? "#302010" : "#ccc0a0";
  const rail = night ? "#201810" : "#9a8870";

  const p = (pts) => pts.map(([x, y]) => `${(x / 100) * W},${(y / 100) * H}`).join(" ");
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={base} />
      {/* Flat terrain bands */}
      <polygon
        points={p([
          [0, 0],
          [100, 0],
          [100, 38],
          [72, 34],
          [44, 36],
          [18, 32],
          [0, 36],
        ])}
        fill={flat1}
      />
      <polygon
        points={p([
          [0, 36],
          [18, 32],
          [44, 36],
          [72, 34],
          [100, 38],
          [100, 58],
          [78, 52],
          [48, 56],
          [22, 52],
          [0, 56],
        ])}
        fill={flat2}
      />
      <polygon
        points={p([
          [0, 56],
          [22, 52],
          [48, 56],
          [78, 52],
          [100, 58],
          [100, 78],
          [70, 72],
          [40, 74],
          [12, 70],
          [0, 74],
        ])}
        fill={flat1}
      />
      {/* Caliche/alkali flats */}
      <polygon
        points={p([
          [8, 20],
          [34, 16],
          [42, 32],
          [30, 40],
          [6, 36],
        ])}
        fill={caliche}
        opacity={0.7}
      />
      <polygon
        points={p([
          [60, 42],
          [82, 38],
          [86, 52],
          [70, 58],
          [58, 52],
        ])}
        fill={caliche}
        opacity={0.6}
      />
      {/* Scrubland patches */}
      <ellipse cx={W * 0.2} cy={H * 0.22} rx={W * 0.05} ry={H * 0.03} fill={scrub} opacity={0.65} />
      <ellipse cx={W * 0.55} cy={H * 0.18} rx={W * 0.04} ry={H * 0.025} fill={scrub} opacity={0.6} />
      <ellipse cx={W * 0.38} cy={H * 0.55} rx={W * 0.06} ry={H * 0.03} fill={scrub} opacity={0.55} />
      <ellipse cx={W * 0.78} cy={H * 0.44} rx={W * 0.04} ry={H * 0.025} fill={scrub} opacity={0.6} />
      {/* Playa lake (NE) */}
      <ellipse cx={W * 0.76} cy={H * 0.28} rx={W * 0.09} ry={H * 0.055} fill={playa} opacity={0.85} />
      <ellipse cx={W * 0.76} cy={H * 0.28} rx={W * 0.07} ry={H * 0.04} fill={playa} opacity={0.6} />
      {/* Power transmission corridors */}
      <rect x={0} y={H * 0.03} width={W} height={H * 0.01} fill={night ? "#402808" : "#e0c880"} opacity={0.5} />
      <rect x={0} y={H * 0.05} width={W} height={H * 0.008} fill={night ? "#402808" : "#e0c880"} opacity={0.35} />
      {/* Highways */}
      <rect x={0} y={H * 0.87} width={W} height={H * 0.04} fill={night ? "#281c08" : "#d4c498"} opacity={0.9} />
      <rect x={0} y={H * 0.928} width={W} height={H * 0.035} fill={night ? "#281c08" : "#d4c498"} opacity={0.9} />
      <rect x={W * 0.44} y={0} width={W * 0.028} height={H * 0.87} fill={night ? "#281c08" : "#c8b888"} opacity={0.8} />
      <rect x={W * 0.75} y={0} width={W * 0.022} height={H * 0.87} fill={night ? "#281c08" : "#c0b080"} opacity={0.7} />
      {/* Rail line */}
      <rect x={0} y={H * 0.72} width={W} height={H * 0.014} fill={rail} opacity={0.7} />
      {/* Contour lines */}
      {[20, 38, 56, 74].map((y, i) => (
        <polyline
          key={i}
          points={p([
            [0, y + Math.sin(i * 1.2) * 2],
            [30, y + 1],
            [60, y - 1],
            [90, y + 1],
            [100, y],
          ])}
          fill="none"
          stroke={night ? "rgba(240,200,80,0.06)" : "rgba(120,90,20,0.07)"}
          strokeWidth="0.7"
        />
      ))}
      <defs>
        <pattern id="tgTX" width={W * 0.1} height={H * 0.1} patternUnits="userSpaceOnUse">
          <path
            d={`M ${W * 0.1} 0 L 0 0 0 ${H * 0.1}`}
            fill="none"
            stroke={night ? "rgba(240,190,60,0.04)" : "rgba(120,90,10,0.06)"}
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#tgTX)" opacity={0.8} />
    </g>
  );
}

/* ── California Coastal ─────────────────────────────────────────────── */
function TerrainCalifornia({ W, H, night }) {
  const ocean = night ? "#020810" : "#1a5a8a";
  const ocean2 = night ? "#030c18" : "#2a72a8";
  const shore = night ? "#180e06" : "#d4b87a";
  const coastal = night ? "#0c1406" : "#6a8a4a";
  const hills = night ? "#0a1004" : "#5a7838";
  const hillTop = night ? "#0e1608" : "#7a9850";
  const steep = night ? "#080e04" : "#4a6030";
  const cliff = night ? "#0c0a04" : "#7a6040";

  const p = (pts) => pts.map(([x, y]) => `${(x / 100) * W},${(y / 100) * H}`).join(" ");
  return (
    <g>
      {/* Ocean left side */}
      <rect x={0} y={0} width={W * 0.28} height={H} fill={ocean} />
      <polygon
        points={p([
          [0, 0],
          [22, 0],
          [26, 18],
          [24, 36],
          [20, 52],
          [22, 70],
          [20, 86],
          [22, 100],
          [0, 100],
        ])}
        fill={ocean}
      />
      <polygon
        points={p([
          [14, 0],
          [22, 0],
          [26, 18],
          [24, 36],
          [20, 52],
          [22, 70],
          [20, 86],
          [22, 100],
          [14, 100],
        ])}
        fill={ocean2}
      />
      {/* Ocean swells */}
      {[12, 26, 40, 54, 68, 82].map((y, i) => (
        <polyline
          key={i}
          points={p([
            [0, y],
            [14, y + Math.sin(i) * 1.5],
          ])}
          fill="none"
          stroke={night ? "rgba(100,200,255,0.06)" : "rgba(100,180,255,0.15)"}
          strokeWidth="1.5"
        />
      ))}
      {/* Sandy beach strip */}
      <polygon
        points={p([
          [20, 0],
          [26, 0],
          [28, 18],
          [26, 36],
          [24, 52],
          [26, 70],
          [24, 86],
          [26, 100],
          [22, 100],
          [20, 86],
          [22, 70],
          [20, 52],
          [24, 36],
          [22, 18],
          [22, 0],
        ])}
        fill={shore}
      />
      {/* Cliff face */}
      <polygon
        points={p([
          [24, 0],
          [28, 0],
          [30, 22],
          [28, 44],
          [26, 68],
          [28, 88],
          [26, 100],
          [22, 100],
          [24, 86],
          [22, 68],
          [24, 44],
          [26, 22],
        ])}
        fill={cliff}
      />
      {/* Coastal flat */}
      <polygon
        points={p([
          [26, 0],
          [100, 0],
          [100, 100],
          [26, 100],
        ])}
        fill={coastal}
      />
      {/* Hillside terrain E */}
      <polygon
        points={p([
          [72, 0],
          [100, 0],
          [100, 78],
          [90, 82],
          [78, 68],
          [74, 44],
          [70, 22],
          [70, 8],
        ])}
        fill={hills}
      />
      <polygon
        points={p([
          [82, 0],
          [100, 0],
          [100, 60],
          [94, 64],
          [88, 50],
          [86, 30],
          [84, 12],
        ])}
        fill={steep}
      />
      <polygon
        points={p([
          [90, 0],
          [100, 0],
          [100, 42],
          [96, 46],
          [92, 32],
          [92, 14],
          [90, 4],
        ])}
        fill={hillTop}
      />
      {/* Coastal ridge */}
      <polygon
        points={p([
          [26, 4],
          [68, 4],
          [70, 22],
          [64, 36],
          [38, 40],
          [28, 28],
          [26, 14],
        ])}
        fill={hillTop}
      />
      <polygon
        points={p([
          [28, 42],
          [66, 38],
          [70, 56],
          [54, 68],
          [30, 62],
          [26, 50],
        ])}
        fill={coastal}
      />
      {/* Highway along coast */}
      <rect x={W * 0.27} y={0} width={W * 0.022} height={H} fill={night ? "#302010" : "#c8b880"} opacity={0.8} />
      {/* Cross highway */}
      <rect x={W * 0.27} y={H * 0.12} width={W * 0.73} height={H * 0.022} fill={night ? "#281c08" : "#c8b880"} opacity={0.75} />
      {/* Power line along coast */}
      <rect x={W * 0.27} y={H * 0.14} width={W * 0.73} height={H * 0.008} fill={night ? "#403020" : "#d4c080"} opacity={0.55} />
      {/* Cliff shadow */}
      <polygon
        points={p([
          [26, 0],
          [30, 0],
          [30, 100],
          [26, 100],
        ])}
        fill={night ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"}
        opacity={0.7}
      />
      {/* Contour glow */}
      {[20, 38, 56, 74].map((y, i) => (
        <polyline
          key={i}
          points={p([
            [27, y],
            [50, y + Math.cos(i) * 3],
            [75, y - 1],
            [100, y + Math.sin(i) * 2],
          ])}
          fill="none"
          stroke={night ? "rgba(100,255,160,0.05)" : "rgba(40,100,40,0.07)"}
          strokeWidth="0.7"
        />
      ))}
      <defs>
        <pattern id="tgCA" width={W * 0.1} height={H * 0.1} patternUnits="userSpaceOnUse">
          <path
            d={`M ${W * 0.1} 0 L 0 0 0 ${H * 0.1}`}
            fill="none"
            stroke={night ? "rgba(56,200,160,0.04)" : "rgba(20,80,40,0.055)"}
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#tgCA)" opacity={0.8} />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SITE ZONE + OVERLAY DEFINITIONS
   Organic polygon shapes following terrain contours
   ══════════════════════════════════════════════════════════════════════ */
const ZONE_DEFS = {
  everett: {
    boundary: [
      [47.9787, -122.1875],
      [47.9717, -122.1935],
      [47.9689, -122.197],
      [47.9638, -122.1977],
      [47.9558, -122.1971],
      [47.9542, -122.1953],
      [47.9416, -122.1937],
      [47.9424, -122.1602],
      [47.9424, -122.1202],
      [47.9491, -122.1202],
      [47.9492, -122.1152],
      [47.9544, -122.115],
      [47.9556, -122.1174],
      [47.959, -122.1222],
      [47.9618, -122.125],
      [47.9657, -122.1297],
      [47.9713, -122.1351],
      [47.9788, -122.1381],
    ],
    // SVG space: left=west(Puget Sound), right=east(SR-526/I-5), top=north(Paine Field), bottom=south
    zones: [
      {
        id: "z1",
        suit: "vhigh",
        label: "Aerospace Assembly Zone",
        desc: "320-acre flat hardstand — glacial outwash soil, 0.2% cross-slope, no significant earthworks. BPA 500kV stubbed to NE corner. Snohomish County I-2 zoning, no CUP required. Shovel-ready Q3 2026.",
        pts: [
          [16, 18],
          [72, 18],
          [74, 30],
          [72, 64],
          [16, 64],
          [14, 46],
          [14, 30],
        ],
      },
      {
        id: "z2",
        suit: "high",
        label: "SR-526 Logistics Corridor",
        desc: "80-acre freight zone with SR-526 on-ramp 0.6km south. Grade-level dock doors, 36m truck staging depth. BNSF Everett Yard 0.9km east — rail spur extension feasible at $2.1M capital.",
        pts: [
          [72, 18],
          [88, 18],
          [88, 30],
          [86, 64],
          [78, 64],
          [72, 64],
          [74, 30],
        ],
      },
      {
        id: "z3",
        suit: "medium",
        label: "BPA 500kV Transmission Buffer",
        desc: "200m horizontal clearance zone under BPA Snohomish–Monroe 500kV line. Building height capped at 8m within buffer per WAC 296-45-035. Low-rise ancillary uses only — parking, laydown, solar canopy.",
        pts: [
          [12, 9],
          [80, 9],
          [82, 18],
          [12, 18],
        ],
      },
      {
        id: "z4",
        suit: "low",
        label: "Puget Sound SMA Setback",
        desc: "100m Shoreline Management Act setback from OHWM of Possession Sound (RCW 90.58). No structures permitted. Passive open space, native vegetation, pervious paths only. Any variance requires Ecology 18–24 month review.",
        pts: [
          [8, 18],
          [14, 18],
          [14, 64],
          [16, 64],
          [16, 88],
          [8, 88],
        ],
      },
      {
        id: "z5",
        suit: "vlow",
        label: "Paine Field Airspace Restriction",
        desc: "FAA Part 77 transitional surfaces from Paine Field (KPAE) runway 34R — all structures capped at 12m AGL within this zone. Industrial development not feasible. No variance pathway exists for airspace surfaces.",
        pts: [
          [80, 9],
          [92, 9],
          [92, 30],
          [88, 30],
          [88, 18],
          [82, 18],
        ],
      },
      {
        id: "z6",
        suit: "medium",
        label: "Stormwater & Environmental Buffer",
        desc: "South transitional strip requiring wetland delineation survey and stormwater management plan before any grading. 40% impervious cover limit. LID bioswale network required per Snohomish County DOE Manual Vol. V.",
        pts: [
          [16, 64],
          [86, 64],
          [84, 88],
          [16, 88],
        ],
      },
    ],
    constraintLines: [
      {
        type: "powerline",
        pts: [
          [12, 9],
          [92, 9],
        ],
      },
      {
        type: "powerline",
        pts: [
          [12, 12],
          [92, 12],
        ],
      },
      {
        type: "slope",
        pts: [
          [82, 9],
          [82, 64],
        ],
      },
      {
        type: "waterbody",
        pts: [
          [8, 18],
          [8, 88],
        ],
      },
    ],
    constraintAreas: [
      {
        type: "slope",
        pts: [
          [80, 9],
          [92, 9],
          [92, 64],
          [82, 64],
          [82, 9],
        ],
      },
      {
        type: "waterbody",
        pts: [
          [8, 18],
          [14, 18],
          [14, 88],
          [8, 88],
        ],
      },
    ],
    infra: [
      {
        type: "road",
        pts: [
          [16, 91],
          [92, 91],
        ],
        color: "#ccc",
        sw: 4,
      },
      {
        type: "road",
        pts: [
          [36, 9],
          [36, 88],
        ],
        color: "#aaa",
        sw: 2,
      },
      {
        type: "road",
        pts: [
          [62, 9],
          [62, 88],
        ],
        color: "#999",
        sw: 2,
      },
      {
        type: "power",
        pts: [
          [12, 9],
          [92, 9],
        ],
        color: "#f59e0b",
        sw: 2,
        dash: "8,3",
      },
      {
        type: "rail",
        pts: [
          [78, 9],
          [78, 88],
        ],
        color: "#a78bfa",
        sw: 2,
        dash: "12,5",
      },
    ],
    buildings: [
      { x: 18, y: 20, w: 28, h: 20, label: "Assembly Hangar Ph.1", col: "#0f2336", border: "#22c55e" },
      { x: 48, y: 20, w: 22, h: 18, label: "Assembly Hangar Ph.2", col: "#0f2336", border: "#22c55e" },
      { x: 18, y: 42, w: 22, h: 16, label: "MRO Facility", col: "#1e3a5f", border: "#38bdf8" },
      { x: 42, y: 44, w: 12, h: 12, label: "BPA Substation", col: "#3d2a0a", border: "#f59e0b" },
      { x: 56, y: 44, w: 14, h: 12, label: "Control & Admin", col: "#2a1a3d", border: "#8b5cf6" },
    ],
  },

  tacoma: {
    boundary: [
      [47.1410373, -122.5161645],
      [47.1387507, -122.5096691],
      [47.1391383, -122.5035156],
      [47.1339058, -122.4979318],
      [47.1230905, -122.5006098],
      [47.1228579, -122.5058517],
      [47.126502, -122.5120052],
      [47.127161, -122.5165633],
      [47.1283628, -122.519982],
      [47.134526, -122.5215773],
      [47.137279, -122.517841],
      [47.1389456, -122.52012],
      [47.1403796, -122.5154479],
    ],
    // SVG: left=west(Commencement Bay/BNSF), right=east(I-5/SR-509), top=north(waterfront), bottom=south
    zones: [
      {
        id: "z1",
        suit: "vhigh",
        label: "Core Manufacturing Platform",
        desc: "280-acre flat glacial-till hardstand — highest utility density in Pierce County. PSE 115kV at NE corner. BNSF mainline 180m west. Foundation cost lowest of all zones: compact till, 8m to bedrock. I-5 Exit 133 2.4km east.",
        pts: [
          [24, 18],
          [70, 18],
          [72, 28],
          [70, 64],
          [24, 64],
          [22, 46],
          [22, 28],
        ],
      },
      {
        id: "z2",
        suit: "high",
        label: "BNSF Rail Logistics Zone",
        desc: "BNSF Tacoma mainline 180m from zone W edge — existing switch infrastructure at East 11th St. 240m of linear dock face for simultaneous inbound/outbound rail operations. Port of Tacoma container terminal 1.8km via Marine View Drive.",
        pts: [
          [12, 18],
          [24, 18],
          [22, 28],
          [22, 46],
          [24, 64],
          [12, 64],
        ],
      },
      {
        id: "z3",
        suit: "high",
        label: "SR-509 Intermodal Hub",
        desc: "SR-509 on-ramp 400m north enables direct container truck routing. 60-acre footprint supports 16-door cross-dock facility. Redundant freight access independent of I-5 congestion (14 incidents/yr historically).",
        pts: [
          [70, 18],
          [88, 18],
          [88, 30],
          [86, 64],
          [78, 64],
          [70, 64],
          [72, 28],
        ],
      },
      {
        id: "z4",
        suit: "medium",
        label: "FEMA Flood Zone AE — Tidal",
        desc: "100-yr tidal flood zone, BFE +1.4m NAVD88 (FEMA FIRM Panel 53053C0665F). All structures require elevation above BFE + 0.9m freeboard per ASCE 24-14. Break-away ground-floor construction required for NFIP compliance.",
        pts: [
          [12, 64],
          [88, 64],
          [86, 84],
          [12, 84],
        ],
      },
      {
        id: "z5",
        suit: "vlow",
        label: "Jurisdictional Wetland Preserve",
        desc: "Category I wetland under Pierce County Critical Areas Ordinance (Title 18E). Any disturbance triggers Army Corps Section 404 + Ecology Section 401 review. Mitigation banking at $85,000/acre via Puyallup Tribe bank. Development permanently prohibited.",
        pts: [
          [8, 8],
          [16, 8],
          [16, 84],
          [8, 84],
        ],
      },
      {
        id: "z6",
        suit: "low",
        label: "Commencement Bay SMA Setback",
        desc: "200ft Shoreline Management Act setback from Commencement Bay OHWM (RCW 90.58). Combined SMA + SEPA + FEMA Zone AE jurisdiction — dual regulatory approval required. 42% permit success for passive uses; full industrial requires 18–24 month review.",
        pts: [
          [16, 8],
          [88, 8],
          [88, 18],
          [16, 18],
        ],
      },
    ],
    constraintLines: [
      {
        type: "flood",
        pts: [
          [12, 64],
          [12, 84],
        ],
      },
      {
        type: "highway",
        pts: [
          [24, 46],
          [88, 46],
        ],
      },
      {
        type: "powerline",
        pts: [
          [70, 9],
          [70, 88],
        ],
      },
      {
        type: "waterbody",
        pts: [
          [8, 8],
          [8, 84],
        ],
      },
    ],
    constraintAreas: [
      {
        type: "flood",
        pts: [
          [12, 64],
          [88, 64],
          [86, 84],
          [12, 84],
        ],
      },
      {
        type: "protected",
        pts: [
          [8, 8],
          [16, 8],
          [16, 18],
          [8, 18],
        ],
      },
    ],
    infra: [
      {
        type: "road",
        pts: [
          [24, 46],
          [88, 46],
        ],
        color: "#aaa",
        sw: 3,
      },
      {
        type: "road",
        pts: [
          [52, 9],
          [52, 84],
        ],
        color: "#999",
        sw: 2.5,
      },
      {
        type: "power",
        pts: [
          [70, 9],
          [70, 84],
        ],
        color: "#f59e0b",
        sw: 2,
        dash: "8,4",
      },
      {
        type: "rail",
        pts: [
          [12, 9],
          [12, 84],
        ],
        color: "#a78bfa",
        sw: 2.5,
        dash: "12,6",
      },
    ],
    buildings: [
      { x: 26, y: 20, w: 24, h: 18, label: "Mfg Plant A", col: "#0f2336", border: "#38bdf8" },
      { x: 26, y: 42, w: 22, h: 16, label: "Mfg Plant B", col: "#0f2336", border: "#38bdf8" },
      { x: 54, y: 22, w: 14, h: 12, label: "Solar Array", col: "#0f2a14", border: "#22c55e" },
      { x: 54, y: 38, w: 12, h: 12, label: "PSE Substation", col: "#3d2a0a", border: "#f59e0b" },
      { x: 70, y: 24, w: 14, h: 16, label: "Rail Terminal", col: "#1a1a2d", border: "#a78bfa" },
    ],
  },

  spokane: {
    boundary: [
      [47.6124, -117.4642],
      [47.6123, -117.4311],
      [47.6184, -117.42],
      [47.6206, -117.4261],
      [47.6239, -117.4293],
      [47.6286, -117.4294],
      [47.633, -117.4308],
      [47.6389, -117.435],
      [47.6409, -117.4401],
      [47.6463, -117.4432],
      [47.651, -117.4461],
      [47.6543, -117.4498],
      [47.6606, -117.4528],
      [47.6663, -117.4581],
      [47.6515, -117.4861],
      [47.6456, -117.4849],
      [47.6478, -117.4758],
      [47.6382, -117.4723],
      [47.6249, -117.4759],
    ],
    // SVG: left=west(Sullivan Rd), right=east(Flora Rd/I-90 E), top=north(Avista corridor), bottom=south(I-90)
    zones: [
      {
        id: "z1",
        suit: "vhigh",
        label: "Prime Industrial Zone",
        desc: "Flat basalt-till platform, 0.3% cross-slope — lowest earthworks cost of all 4 sites. Avista 230kV at N boundary, I-90 Exit 291B 0.8km south. Spokane County HI (Heavy Industrial) zoning, no rezoning required. Shovel-ready.",
        pts: [
          [12, 18],
          [76, 18],
          [78, 28],
          [76, 64],
          [12, 64],
          [10, 46],
          [10, 28],
        ],
      },
      {
        id: "z2",
        suit: "high",
        label: "BNSF Intermodal Corridor",
        desc: "BNSF Spokane Intermodal facility 1.2km north — direct spur extension via Trent Ave connector feasible at $1.8M. 120k sqft high-bay distribution, 40ft clear height. Rail alignment: 0.3% grade within BNSF Class IV standard.",
        pts: [
          [76, 18],
          [88, 18],
          [88, 30],
          [86, 64],
          [80, 64],
          [76, 64],
          [78, 28],
        ],
      },
      {
        id: "z3",
        suit: "medium",
        label: "Avista 230kV Transmission Buffer",
        desc: "Avista Sullivan–Trent 230kV corridor: 180m horizontal setback, 15m height limit per WAC 296-45-035. Low-rise ancillary uses permitted. Ideal for 800kW ground-mount solar, parking deck, and primary substation yard.",
        pts: [
          [10, 9],
          [78, 9],
          [80, 18],
          [10, 18],
        ],
      },
      {
        id: "z4",
        suit: "low",
        label: "Semi-Arid Expansion Reserve",
        desc: "Shallow topsoil over basalt bedrock at 1.2–1.8m depth (Warden formation) — rock excavation adds $22/sqft to foundation cost. Suitable for Phase 3 expansion after primary zones operational. Defer 5+ years.",
        pts: [
          [10, 64],
          [86, 64],
          [84, 82],
          [10, 82],
        ],
      },
      {
        id: "z5",
        suit: "vlow",
        label: "I-90 WSDOT Highway Easement",
        desc: "WSDOT permanent right-of-way under 23 CFR 710. All permanent structures prohibited. No encroachment variance pathway. Maintain WSDOT clear-zone requirement (30m from carriageway). Access road crossing permit required for heavy haul to z2.",
        pts: [
          [10, 82],
          [86, 82],
          [86, 92],
          [10, 92],
        ],
      },
      {
        id: "z6",
        suit: "medium",
        label: "Spokane River Flood Risk Zone",
        desc: "FEMA Zone AE — Spokane River 100-yr flood plain clips NE corner. CLOMR process required before siting structures. Flood elevation +0.9m above BFE per Spokane County floodplain ordinance. Best use: primary substation and BESS pad (elevated slab).",
        pts: [
          [78, 9],
          [92, 9],
          [92, 30],
          [88, 30],
          [88, 18],
          [80, 18],
        ],
      },
    ],
    constraintLines: [
      {
        type: "highway",
        pts: [
          [10, 82],
          [86, 82],
        ],
      },
      {
        type: "highway",
        pts: [
          [10, 88],
          [86, 88],
        ],
      },
      {
        type: "powerline",
        pts: [
          [10, 9],
          [80, 9],
        ],
      },
      {
        type: "powerline",
        pts: [
          [10, 12],
          [80, 12],
        ],
      },
      {
        type: "flood",
        pts: [
          [78, 9],
          [78, 30],
        ],
      },
    ],
    constraintAreas: [
      {
        type: "flood",
        pts: [
          [78, 9],
          [92, 9],
          [92, 30],
          [88, 30],
          [86, 18],
          [78, 18],
        ],
      },
    ],
    infra: [
      {
        type: "highway",
        pts: [
          [10, 84],
          [86, 84],
        ],
        color: "#bbb",
        sw: 5,
      },
      {
        type: "highway",
        pts: [
          [10, 89],
          [86, 89],
        ],
        color: "#bbb",
        sw: 5,
      },
      {
        type: "road",
        pts: [
          [44, 9],
          [44, 82],
        ],
        color: "#999",
        sw: 3,
      },
      {
        type: "road",
        pts: [
          [70, 9],
          [70, 82],
        ],
        color: "#888",
        sw: 2,
      },
      {
        type: "power",
        pts: [
          [10, 9],
          [80, 9],
        ],
        color: "#f59e0b",
        sw: 2.5,
        dash: "8,3",
      },
      {
        type: "power",
        pts: [
          [10, 12],
          [80, 12],
        ],
        color: "#f59e0b",
        sw: 1.5,
        dash: "6,3",
      },
      {
        type: "rail",
        pts: [
          [10, 72],
          [88, 72],
        ],
        color: "#a78bfa",
        sw: 2,
        dash: "10,5",
      },
    ],
    buildings: [
      { x: 14, y: 22, w: 26, h: 20, label: "Plant A", col: "#0f2336", border: "#38bdf8" },
      { x: 44, y: 22, w: 24, h: 20, label: "Plant B", col: "#0f2336", border: "#38bdf8" },
      { x: 14, y: 46, w: 20, h: 14, label: "Energy Hub", col: "#3d2a0a", border: "#f59e0b" },
      { x: 38, y: 46, w: 22, h: 14, label: "Logistics Ctr", col: "#1a1a2d", border: "#8b5cf6" },
      { x: 63, y: 46, w: 12, h: 14, label: "Avista Substation", col: "#3d1a1a", border: "#ef4444" },
      { x: 78, y: 20, w: 10, h: 30, label: "Freight Terminal", col: "#1a1a0a", border: "#f59e0b" },
    ],
  },

  yakima: {
    boundary: [
      [46.5893, -120.6042],
      [46.5857, -120.6044],
      [46.5855, -120.5938],
      [46.5711, -120.5937],
      [46.5713, -120.5745],
      [46.5726, -120.5726],
      [46.5752, -120.5723],
      [46.5766, -120.5714],
      [46.5776, -120.5725],
      [46.5854, -120.5725],
      [46.5855, -120.5791],
      [46.589, -120.5791],
      [46.5893, -120.5888],
      [46.5927, -120.5886],
      [46.5929, -120.5978],
      [46.5894, -120.5978],
    ],
    // SVG: left=west(Yakima River/irrigation), right=east(Yakima Ridge/slopes), top=north, bottom=south(US-12)
    zones: [
      {
        id: "z1",
        suit: "high",
        label: "Valley Processing Hub",
        desc: "120-acre flat valley floor — best water access on site. BPA 230kV Yakima substation 2.1km south. US-12 access via Yakima Ave interchange. Yakima County industrial zoning (I-1). Water right application (WRIA 37) recommended immediately.",
        pts: [
          [22, 18],
          [54, 18],
          [54, 64],
          [22, 64],
          [20, 46],
          [20, 28],
        ],
      },
      {
        id: "z2",
        suit: "vhigh",
        label: "Prime Solar Array Zone",
        desc: "140-acre flat bench — 5.8 kWh/m²/day GHI, 290+ clear days/yr (NREL NSRDB). Optimal south-facing aspect. 28MW Phase 1 achievable. Agrivoltaic dual-use (lavender/saffron understory) qualifies for USDA REAP grant (up to 25% capital). Best solar asset in Washington State.",
        pts: [
          [54, 18],
          [76, 18],
          [78, 28],
          [76, 64],
          [54, 64],
        ],
      },
      {
        id: "z3",
        suit: "medium",
        label: "Yakima Ridge Transition",
        desc: "East-facing slope 6–12% — requires minor cut-and-fill (+18% groundworks cost). Wind resource class 4 at 80m hub height (WRCC data: 7.2 m/s mean). 4×2.5MW turbines viable on ridge crest with 350m N–S spacing. Access road: 1.2km compacted gravel, $420k.",
        pts: [
          [76, 18],
          [86, 18],
          [86, 28],
          [84, 64],
          [78, 64],
          [76, 64],
          [78, 28],
        ],
      },
      {
        id: "z4",
        suit: "vlow",
        label: "Yakima Irrigation District Setback",
        desc: "Mandatory 90m setback from Wapato Irrigation Project canal centreline under DOE WAC 173-160 and RCW 90.03. Senior water rights held by Yakima Irrigation District — enforcement is robust. Development permanently prohibited within setback.",
        pts: [
          [8, 12],
          [22, 12],
          [20, 28],
          [20, 46],
          [22, 64],
          [8, 64],
        ],
      },
      {
        id: "z5",
        suit: "low",
        label: "Steep Escarpment Zone",
        desc: "Eastern escarpment, slope >15% — Critical Area per Yakima County code. Seismic hazard zone (M6.5+ within 50yr per USGS Quaternary Fault Map). Geotechnical slope-stability study mandatory (WAC 365-190-130). Retaining system: 180m × $3.2M estimated.",
        pts: [
          [86, 14],
          [92, 14],
          [92, 70],
          [88, 70],
          [84, 64],
          [86, 28],
          [86, 18],
        ],
      },
      {
        id: "z6",
        suit: "medium",
        label: "Agricultural Valley Buffer",
        desc: "South gradient 4–8%, transitional to US-12 corridor. Suitable for open-air logistics, agrivoltaic buffer planting, and stormwater bioswale (gravity flow to valley-floor retention basin, no pump required). Grade to 1% platform: cut ≈ fill, $420k for 8-acre pad.",
        pts: [
          [8, 64],
          [86, 64],
          [84, 82],
          [8, 82],
        ],
      },
    ],
    constraintLines: [
      {
        type: "waterbody",
        pts: [
          [8, 9],
          [88, 9],
        ],
      },
      {
        type: "powerline",
        pts: [
          [8, 14],
          [88, 14],
        ],
      },
      {
        type: "slope",
        pts: [
          [86, 14],
          [86, 82],
        ],
      },
      {
        type: "waterbody",
        pts: [
          [20, 12],
          [20, 82],
        ],
      },
    ],
    constraintAreas: [
      {
        type: "waterbody",
        pts: [
          [8, 12],
          [22, 12],
          [22, 82],
          [8, 82],
        ],
      },
      {
        type: "protected",
        pts: [
          [8, 64],
          [22, 64],
          [22, 82],
          [8, 82],
        ],
      },
    ],
    infra: [
      {
        type: "highway",
        pts: [
          [22, 12],
          [88, 12],
        ],
        color: "#bbb",
        sw: 3,
      },
      {
        type: "road",
        pts: [
          [50, 12],
          [50, 82],
        ],
        color: "#999",
        sw: 2,
      },
      {
        type: "road",
        pts: [
          [22, 36],
          [86, 36],
        ],
        color: "#888",
        sw: 2,
      },
      {
        type: "power",
        pts: [
          [8, 14],
          [88, 14],
        ],
        color: "#f59e0b",
        sw: 1.5,
        dash: "6,3",
      },
      {
        type: "coast",
        pts: [
          [20, 12],
          [20, 82],
        ],
        color: "#38bdf8",
        sw: 2,
        dash: "4,4",
      },
    ],
    buildings: [
      { x: 24, y: 20, w: 20, h: 16, label: "Solar Array Ph.1", col: "#0f2a14", border: "#22c55e" },
      { x: 46, y: 20, w: 18, h: 14, label: "Agrivoltaic Zone", col: "#0f2a14", border: "#22c55e" },
      { x: 24, y: 40, w: 22, h: 16, label: "Processing Plant", col: "#0f2336", border: "#38bdf8" },
      { x: 48, y: 42, w: 14, h: 14, label: "Substation", col: "#3d2a0a", border: "#f59e0b" },
      { x: 66, y: 24, w: 14, h: 22, label: "Ridge Wind Farm", col: "#0f2a14", border: "#22c55e" },
    ],
  },

  /* ── Renton Advanced Manufacturing Park ─────────────────────────── */
  rnt001: {
    boundary: [
      [47.4885, -122.2232],
      [47.4880, -122.2112],
      [47.4838, -122.2098],
      [47.4775, -122.2108],
      [47.4770, -122.2232],
      [47.4808, -122.2248],
    ],
    zones: [
      {
        id: "z1",
        suit: "vhigh",
        label: "EV Manufacturing Core",
        desc: "190-acre primary manufacturing zone — flat glacial platform, 0.2% cross-slope. PSE 115kV at SW corner. BNSF spur connection 280m E. King County I-2 zoning confirmed. Shovel-ready Q4 2026.",
        pts: [[14, 18], [76, 18], [78, 36], [76, 72], [14, 72], [12, 54], [12, 36]],
      },
      {
        id: "z2",
        suit: "high",
        label: "BNSF Rail & Logistics Corridor",
        desc: "55-acre freight zone with direct BNSF spur access at East Valley Rd connector. 280m rail offload face. SR-167 truck access at N interchange. Grade-level dock doors, 38m staging depth.",
        pts: [[76, 18], [88, 18], [88, 36], [86, 72], [78, 72], [76, 72], [78, 36]],
      },
      {
        id: "z3",
        suit: "medium",
        label: "SR-167 Highway Buffer",
        desc: "80m WSDOT right-of-way setback from SR-167 centre line. No permanent structures. Suitable for surface parking, stormwater detention, and employee green space. Direct SR-167 ramp at N boundary for heavy haul trucks.",
        pts: [[10, 9], [78, 9], [80, 18], [10, 18]],
      },
      {
        id: "z4",
        suit: "low",
        label: "Cedar River Riparian Setback",
        desc: "100m Shoreline Management Act setback from Cedar River OHWM (RCW 90.58). No structures permitted. Native vegetation restoration required. Any variance requires Ecology 18-month review.",
        pts: [[10, 72], [14, 72], [14, 88], [10, 88]],
      },
      {
        id: "z5",
        suit: "vlow",
        label: "King County CAO Wetland Buffer",
        desc: "60m Critical Areas Ordinance wetland buffer per King County Code 21A.24. No clearing or grading within buffer. Annual hydrology monitoring required. Mitigation via King County wetland bank if any disturbance.",
        pts: [[76, 9], [88, 9], [88, 18], [80, 18]],
      },
    ],
    constraintLines: [
      { type: "highway", pts: [[10, 14], [88, 14]], dash: "10,5" },
      { type: "waterbody", pts: [[10, 84], [88, 84]], dash: "4,6" },
    ],
    constraintAreas: [
      { type: "highway", pts: [[10, 9], [78, 9], [80, 18], [10, 18]] },
      { type: "waterbody", pts: [[10, 72], [14, 72], [14, 88], [10, 88]] },
      { type: "protected", pts: [[76, 9], [88, 9], [88, 18], [80, 18]] },
    ],
    infra: [
      { type: "road", pts: [[14, 91], [92, 91]], color: "#ccc", sw: 4 },
      { type: "road", pts: [[14, 9], [14, 88]], color: "#aaa", sw: 2 },
      { type: "road", pts: [[50, 9], [50, 88]], color: "#999", sw: 2 },
      { type: "power", pts: [[10, 9], [88, 9]], color: "#f59e0b", sw: 2, dash: "8,3" },
      { type: "rail", pts: [[82, 9], [82, 88]], color: "#a78bfa", sw: 2, dash: "12,5" },
    ],
    buildings: [
      { x: 16, y: 22, w: 24, h: 20, label: "Battery Mfg Plant", col: "#0f2336", border: "#38bdf8" },
      { x: 44, y: 22, w: 22, h: 18, label: "EV Assembly Hall", col: "#0f2336", border: "#22d3ee" },
      { x: 16, y: 46, w: 22, h: 18, label: "Drivetrain Plant", col: "#0f2336", border: "#38bdf8" },
      { x: 42, y: 48, w: 18, h: 16, label: "Quality Control", col: "#0f2336", border: "#818cf8" },
      { x: 64, y: 22, w: 14, h: 22, label: "Logistics Hub", col: "#3d2a0a", border: "#f59e0b" },
    ],
  },

  /* ── Bellingham Aerospace Hub ────────────────────────────────────── */
  blm002: {
    boundary: [
      [48.7582, -122.4858],
      [48.7576, -122.4716],
      [48.7530, -122.4706],
      [48.7458, -122.4722],
      [48.7455, -122.4858],
      [48.7492, -122.4874],
    ],
    zones: [
      {
        id: "z1",
        suit: "vhigh",
        label: "Aerospace Assembly Zone",
        desc: "240-acre primary manufacturing zone — flat glacial-marine terrace, 0.3% cross-slope. PSE 115kV at E boundary. BNSF spur 0.8km south. Whatcom County I-2 Heavy Industrial zoning confirmed. Adjacent to KBLI airport apron for direct aircraft delivery.",
        pts: [[14, 20], [74, 20], [76, 36], [74, 72], [14, 72], [12, 54], [12, 36]],
      },
      {
        id: "z2",
        suit: "high",
        label: "Airport Logistics Corridor",
        desc: "80-acre freight zone adjacent to KBLI runway threshold. Direct aircraft delivery — 30-min ground transport. BNSF spur access 0.8km south via Airport Dr connector. FAA-cleared 12m building height limit.",
        pts: [[74, 20], [88, 20], [88, 36], [86, 72], [78, 72], [74, 72], [76, 36]],
      },
      {
        id: "z3",
        suit: "medium",
        label: "BPA 230kV Transmission Buffer",
        desc: "180m horizontal clearance zone under BPA Custer–Ferndale 230kV line. Building height capped at 8m per WAC 296-45-035. Best use: parking, equipment laydown, solar canopy at ≤8m height.",
        pts: [[12, 9], [78, 9], [80, 20], [12, 20]],
      },
      {
        id: "z4",
        suit: "low",
        label: "Bellingham Bay SMA Setback",
        desc: "100m Shoreline Management Act setback from Bellingham Bay OHWM (RCW 90.58). No structures permitted. Native shoreline vegetation restoration required. Industrial development prohibited — variance requires Ecology 18–24 month review.",
        pts: [[8, 20], [14, 20], [14, 72], [8, 72]],
      },
      {
        id: "z5",
        suit: "vlow",
        label: "Whatcom Creek Flood Zone",
        desc: "FEMA 100-yr flood zone (Zone AE) along SE drainage corridor. Structures must be elevated to BFE + 0.9m freeboard per ASCE 24-14. Pile foundations required. Commission CLOMR study before any siting decisions.",
        pts: [[74, 72], [88, 72], [88, 88], [74, 88]],
      },
    ],
    constraintLines: [
      { type: "powerline", pts: [[12, 14], [88, 14]], dash: "6,4" },
      { type: "waterbody", pts: [[10, 20], [10, 88]], dash: "4,6" },
    ],
    constraintAreas: [
      { type: "powerline", pts: [[12, 9], [78, 9], [80, 20], [12, 20]] },
      { type: "waterbody", pts: [[8, 20], [14, 20], [14, 72], [8, 72]] },
      { type: "flood", pts: [[74, 72], [88, 72], [88, 88], [74, 88]] },
    ],
    infra: [
      { type: "road", pts: [[14, 91], [92, 91]], color: "#ccc", sw: 4 },
      { type: "road", pts: [[14, 9], [14, 88]], color: "#aaa", sw: 2 },
      { type: "road", pts: [[50, 9], [50, 88]], color: "#999", sw: 2 },
      { type: "power", pts: [[12, 9], [88, 9]], color: "#f59e0b", sw: 2, dash: "8,3" },
      { type: "rail", pts: [[80, 9], [80, 88]], color: "#a78bfa", sw: 2, dash: "12,5" },
    ],
    buildings: [
      { x: 16, y: 24, w: 26, h: 20, label: "Fuselage Mfg", col: "#0f2336", border: "#38bdf8" },
      { x: 46, y: 24, w: 22, h: 18, label: "Wing Assembly", col: "#0f2336", border: "#22d3ee" },
      { x: 16, y: 48, w: 24, h: 18, label: "Final Assembly", col: "#0f2336", border: "#22d3ee" },
      { x: 44, y: 50, w: 18, h: 16, label: "Flight Test Hangar", col: "#1a1040", border: "#8b5cf6" },
      { x: 64, y: 24, w: 14, h: 22, label: "Freight Terminal", col: "#3d2a0a", border: "#f59e0b" },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════════
   ZONE-LEVEL AI INTELLIGENCE  (shown when user clicks a zone)
   ══════════════════════════════════════════════════════════════════════ */
const ZONE_AI = {
  everett: {
    z1: {
      feasibility: 94,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 95,
      capex: "$38M",
      timeline: "12 months",
      rootCause:
        "320-acre flat glacial-outwash platform — 0.2% cross-slope, no significant earthworks. BPA 500kV stubbed within 220m at NE corner. Snohomish County I-2 Heavy Industrial zoning confirmed. Shovel-ready Q3 2026 per county pre-application conference.",
      prediction:
        "96% on-budget delivery probability. BPA direct substation cuts grid cost 26% vs PSE distribution ($0.041 vs $0.089/kWh). BNSF Everett Yard spur at $2.1M recovers in 3 years via logistics savings.",
      recs: [
        "Phase 1 Assembly Hangar: 180k sqft clear-span steel frame, 9-month build — orient N–S for Paine Field JIT corridor alignment",
        "BPA direct industrial service: negotiate GIA (Generator Interconnection Agreement) for 15MW firm capacity — initiate 12 months before commissioning",
        "BNSF Everett Yard spur: 0.9km via Lowell connector at 0.3% grade, $2.1M, BNSF Class IV standard — reduces inbound freight 35%",
        "Rainwater harvest from hangar roofs (2.4 ha): 4.8M L/yr — offsets Snohomish County utility cost, satisfies DOE Manual Vol. V LID requirement",
        "Solar canopy over 400-space parking: 1.4MW, Snohomish PUD NEM-C net metering, 7.2-yr simple payback",
        "File FAA Form 7460-1 for any structure >30m — 45-day advance notice, 60-day FAA review; must align with critical path",
      ],
    },
    z2: {
      feasibility: 86,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 88,
      capex: "$18M",
      timeline: "8 months",
      rootCause:
        "80-acre freight zone with SR-526 on-ramp 0.6km south. Flat terrain maintains optimal truck turn radius. BNSF Everett Yard 0.9km east — rail spur extension feasible at $2.1M with 3-yr payback at 220 TEU/day throughput.",
      prediction:
        "91% delivery probability within 8 months. 16-door cross-dock with AGV link to z1 assembly reduces inbound handling labour 35%. Container throughput 220 TEU/day at full utilisation.",
      recs: [
        "16-door cross-dock: orient loading docks perpendicular to SR-526 for minimal 53ft trailer turn radius (min. 26m)",
        "AGV link between z2 and z1 assembly floor: reduces manual handling FTEs by 4.2, $1.8M capital, 2.4-yr payback",
        "Truck staging: 28 simultaneous trailers at N boundary — WSDOT driveway permit required for SR-526 approach",
        "Weigh-in-motion sensors at gate entry: eliminates manual inspection, 4 min/truck savings, $120k installed",
        "BNSF rail spur from Everett Yard: 0.9km extension at BNSF Class IV standard — shared capital split with z1 reduces z2 share to $800k",
      ],
    },
    z3: {
      feasibility: 55,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 72,
      capex: "$4M",
      timeline: "Restricted — ancillary only",
      rootCause:
        "BPA Snohomish–Monroe 500kV corridor imposes 200m horizontal clearance and 8m building height limit per WAC 296-45-035. BPA easement non-negotiable — variance requests historically 100% denied. Best use: substation yard, solar canopy, and employee parking.",
      prediction:
        "Zone is permanently height-restricted but not unusable. 540kW ground-mount solar within 8m height limit achieves 6-yr payback. 400-space parking deck not viable (height); surface lot at 1.6 cars/space = 320 spaces.",
      recs: [
        "Primary substation location: 230kV/4.16kV transformation here minimises underground MV cable run to z1 hangar ($2.4M cable saving)",
        "Ground-mount solar: 1,200 panels × 450W within 8m height restriction = 540kW, 6-yr payback at Snohomish PUD NEM-C",
        "320-space surface parking with 40% EV charging stalls — satisfies WA State EV infrastructure code (RCW 19.405)",
        "Maintain WAC 296-45-035 5m clear zone each side of BPA centreline — mark permanently with survey pins before grading",
        "Secure equipment laydown yard during z1 construction phase — eliminates off-site storage cost ($180k/yr)",
      ],
    },
    z4: {
      feasibility: 32,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 35,
      capex: "$6M mitigation",
      timeline: "18–24 months permit",
      rootCause:
        "100m SMA setback from Possession Sound OHWM (RCW 90.58). No structures permitted within setback. Passive uses only: open space, native vegetation, pervious paths. Any variance requires Ecology Department review with historically poor outcomes for industrial applicants.",
      prediction:
        "Development not recommended. Shoreline Conditional Use Permit (SCUP) success rate <20% for industrial uses per Snohomish County SMP. Treat as ecological buffer — satisfies SMA compliance for entire site without costly permit process.",
      recs: [
        "Designate as ecological buffer — fulfils SMA open-space requirement for entire site under Snohomish SMP",
        "Install bioswale and native Puget Sound vegetation: reduces site stormwater TSS loading 45%, improves ESG metrics",
        "Passive employee trail along shoreline: satisfies open-space planning condition, low maintenance cost",
        "Stake OHWM line with licensed surveyor before any adjacent grading — prevents accidental encroachment triggering Ecology enforcement",
        "Avoid temporary staging here — even short-term disturbance requires Army Corps NWP-39 notification",
      ],
    },
    z5: {
      feasibility: 12,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 10,
      capex: "Not viable",
      timeline: "Permanently restricted",
      rootCause:
        "Paine Field (KPAE) runway 34R FAA Part 77 transitional surfaces — all structures capped at 12m AGL within this zone. FAA will not approve structures >12m AGL. No variance pathway exists under 14 CFR Part 77. Permanent restriction transfers with land title.",
      prediction:
        "FAA will not approve industrial structures. Zone is permanently restricted for tall construction. Exclude from all CAPEX modelling and development scope.",
      recs: [
        "Exclude from all development planning — reallocate budget to z1 and z2",
        "Low-profile perimeter fencing ≤3m and security infrastructure is permissible",
        "FAA-compliant obstruction lighting required on any structure >15m AGL at Paine Field boundary",
        "Use for temporary construction laydown only during z1 build phase — no permanent fixtures",
        "Document FAA restriction boundary with permanent survey markers for record plan",
      ],
    },
    z6: {
      feasibility: 58,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 64,
      capex: "$8M",
      timeline: "14 months",
      rootCause:
        "South transitional strip — wetland delineation survey required before any impervious surface. 40% impervious cover cap under Snohomish County LID standards. Stormwater management plan required per DOE Manual Vol. V before grading permit issued.",
      prediction:
        "72% permit success probability for low-intensity uses. LID bioswale network serving entire site can be routed through z6 — satisfies DOE post-construction requirements and enables full industrial development of z1/z2.",
      recs: [
        "Route site-wide LID bioswale network through z6 — satisfies Snohomish County stormwater requirement for entire site",
        "Position stormwater retention basin at south end: 2.4-acre capacity, serves z1 and z2 combined impervious area",
        "Employee amenity zone: cafeteria, fitness centre on green roof (0.25 FAR) — minimal impervious, qualifies for LID exemption",
        "Retain existing mature tree line on S boundary — reduces SEPA review scope by demonstrating ecological continuity",
        "Wetland delineation survey ($18k): complete before site plan submission to confirm buildable envelope",
      ],
    },
  },

  tacoma: {
    z1: {
      feasibility: 93,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 92,
      capex: "$32M",
      timeline: "11 months",
      rootCause:
        "280-acre flat glacial-till hardstand — PSE 115kV at NE corner, BNSF mainline 180m west, I-5 Exit 133 2.4km east. Compact till to 8m depth, lowest foundation cost in Pierce County. Highest utility density of all four sites — all utilities within 200m.",
      prediction:
        "93% delivery probability within 11 months. PSE Schedule I-2 rate ($0.058/kWh) saves $340k/yr vs I-1. Port container priority status cuts inbound material wait from 4.2 to 1.1 days. Tacoma Rail spur (380m, $1.6M) returns $1.1M/yr logistics saving.",
      recs: [
        "Negotiate PSE Schedule I-2 Large Industrial rate: demand >1,000kW qualifies — saves $340k/yr vs standard commercial",
        "Foundation: spread footings on compact glacial till — design for 3,000 psf bearing capacity per geotechnical bore log",
        "Orient buildings N–S for rooftop solar optimisation: 2.1MW combined Plant A + B, PSE NEM-C net metering",
        "Tacoma Rail spur: file BNSF Industrial Track Agreement for 380m extension off East 11th St — $1.6M capital, $1.1M/yr saving",
        "Compressed air header loop in utility corridor: serves all production bays at $0.008/SCF vs $0.024 portable compressor",
        "Stormwater 1-in-100yr retention basin at NW corner: 2.4-acre capacity, serves entire z1 — required for Pierce County NPDES permit",
      ],
    },
    z2: {
      feasibility: 85,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 86,
      capex: "$14M",
      timeline: "8 months",
      rootCause:
        "BNSF Tacoma mainline 180m from zone W edge — existing switch at East 11th St, compatible with 286k-lb rail car standard. 240m linear dock face for simultaneous inbound/outbound. Port of Tacoma container terminal 1.8km via Marine View Drive.",
      prediction:
        "88% delivery probability. Rail spur reduces logistics OPEX $1.4M/yr. Port priority cargo status: 400 TEU/wk inbound capacity. Container dwell time reduced from 4.2 to 1.1 days at full utilisation.",
      recs: [
        "Build rail spur from BNSF connection: 180m at 0.3% grade, BNSF Class IV alignment — file Industrial Track Agreement 6 months before construction",
        "16-door cross-dock with 36m truck staging depth: accommodates 53ft trailers with full turn radius (26m min)",
        "RFID inbound receiving gate: eliminates 2.4 FTE manual checking, $80k installed, 6-month payback",
        "Hazmat storage: position at far N end away from tidal buffer — satisfies EPA 40 CFR 264 secondary containment",
        "Negotiate Tacoma Port authority container priority status: reduces dwell from 4.2 to 1.1 days — apply 6 months before operations",
      ],
    },
    z3: {
      feasibility: 82,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 84,
      capex: "$12M",
      timeline: "7 months",
      rootCause:
        "SR-509 on-ramp 400m north — direct container truck routing independent of I-5. 60-acre footprint at flat grade, slab-on-grade construction. Redundant site access improves resilience to I-5 congestion events (historically 14 days/yr).",
      prediction:
        "85% delivery probability. Redundant SR-509 access reduces congestion exposure: saves 14 days/yr of logistics disruption worth $420k. Zone supports 80k sqft additional warehouse for future expansion within existing SEPA review.",
      recs: [
        "Secondary gatehouse here: redundant access independent of z1 main entry — required for business continuity planning",
        "Route heavy haul vehicles (>80 klbs) via this corridor: protects z1 internal road surfaces, extends maintenance interval 3×",
        "Transformer yard at NE corner: central distribution to both z1 and z3 minimises MV cable run ($1.2M saving)",
        "Truck weigh station at SR-509 entry: required for overweight loads to Port Tacoma terminals under Pierce County code",
        "Future 60k sqft warehouse expansion absorbs within existing SEPA review — pre-position utilities now at marginal cost",
      ],
    },
    z4: {
      feasibility: 52,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 45,
      capex: "$9M mitigation",
      timeline: "12–18 months permit",
      rootCause:
        "FEMA 100-yr tidal flood zone, BFE +1.4m NAVD88 (FIRM Panel 53053C0665F). All structures must be elevated to BFE + 0.9m freeboard per ASCE 24-14. Pile foundations required — shallow bearing capacity poor in tidal soils. NFIP compliance mandatory for any federally-backed financing.",
      prediction:
        "68% permit success probability with full tidal mitigation plan. Elevation adds $280/sqft but enables 40k sqft elevated utility/light industrial. Pierce County Flood Control Zone District pre-application recommended before any design investment.",
      recs: [
        "Elevate floor slabs to BFE + 0.9m NAVD88 per ASCE 24-14 freeboard: adds $1.8M but enables NFIP-compliant financing",
        "Break-away ground-floor wall construction: flood water passes through, upper structure protected — required per NFIP FIA-TB-9",
        "Tide gate on stormwater outfall: prevents tidal backflow into site drainage system — $220k installed",
        "Geotechnical study for pile foundation: tidal zone bearing capacity typically 800–1,200 psf vs 3,000 psf in z1 — essential before structural design",
        "Pre-application meeting with Pierce County Flood Control Zone District: free service, identifies permit path before $50k+ engineering investment",
      ],
    },
    z5: {
      feasibility: 8,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 0,
      capex: "Not viable",
      timeline: "Permanently restricted",
      rootCause:
        "Category I jurisdictional wetland under Pierce County Critical Areas Ordinance (Title 18E). Any disturbance triggers Army Corps Section 404 + Ecology Section 401 review. Mitigation banking via Puyallup Tribe wetland bank at $85,000/acre. Development permanently prohibited.",
      prediction:
        "Development not permitted under CWA Section 404. Treat as permanent ecological open space — fulfils Critical Areas buffer for entire site. Purchase mitigation credits for any z4 tidal activity.",
      recs: [
        "Retain in natural state: fulfils Pierce County CAO buffer obligation for entire site — avoids $500k+ mitigation banking requirement elsewhere",
        "Purchase 2 wetland mitigation bank credits via Puyallup Tribe bank ($170k): enables z4 tidal work without legal exposure",
        "Annual wetland hydrology monitoring: documents pre-construction baseline required for SEPA compliance",
        "Interpretive boardwalk (pervious): improves community relations and ESG reporting — no Section 404 permit required for boardwalk",
        "Do not use as construction staging area: even temporary impacts require Army Corps NWP-39 pre-notification",
      ],
    },
    z6: {
      feasibility: 35,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 28,
      capex: "$5M",
      timeline: "18–24 months",
      rootCause:
        "Combined SMA 200ft shoreline setback (RCW 90.58) and FEMA Zone AE jurisdiction. Dual regulatory process: Shoreline Conditional Use Permit + SEPA + FEMA floodplain review required for any development. Historical SMA variance success rate <15% for heavy industrial.",
      prediction:
        "42% permit success for passive uses only. Full industrial use requires combined SMA + SEPA + FEMA review — 18–24 month process at $800k–$1.2M cost. Recommend passive ecological use to avoid permit risk.",
      recs: [
        "Designate as SMA shoreline open space — avoids SCUP review, satisfies entire site's shoreline management plan compliance",
        "Bioswale network from z1/z2 stormwater: reduces Commencement Bay TSS discharge 65% — improves NPDES permit compliance",
        "Employee walking trail along bay edge: satisfies open-space planning condition, qualifies for Parks levy funding",
        "Do not connect stormwater outfall to bay without pre-treatment to DOE permit standards (WAC 173-201A)",
        "Shoreline restoration planting (native eelgrass and saltgrass): may reduce mitigation obligation for z4 tidal work",
      ],
    },
  },

  spokane: {
    z1: {
      feasibility: 94,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 92,
      capex: "$28M",
      timeline: "10 months",
      rootCause:
        "Flat basalt-till platform, 0.3% cross-slope — lowest earthworks cost of all 4 WA sites. Avista 230kV at N boundary, I-90 Exit 291B 0.8km south, BNSF intermodal 1.2km north. Spokane County HI (Heavy Industrial) zoning confirmed. Avista IR-2 rate $0.046/kWh — below state average.",
      prediction:
        "94% delivery probability. Avista grid connection within 5 months post-groundbreaking. Construction cost 18% below Puget Sound sites (lower labour rates + flat terrain). BNSF connection saves $1.4M/yr. Groundwater at 18m viable for geothermal HVAC.",
      recs: [
        "Avista Rate Schedule IR-2 (demand >1,000kW): $0.046/kWh vs $0.082 standard — saves $420k/yr at 12MW base load",
        "I-90 Exit 291B traffic signal coordination with WSDOT for heavy haul departures: $85k, reduces truck queue, improves safety record",
        "Foundation design: spread footings, 2,800 psf bearing capacity on basalt till — avoid NW quadrant where basalt bedrock at 1.2m requires blasting",
        "Wind resource: Class 4 at 80m hub height — 6×2.5MW IEC Class II turbines on N buffer, $18M capital, 22-yr IRR 9.4% at current REC prices",
        "Geothermal HVAC: groundwater at 18m depth, 12°C stable — heat exchange reduces HVAC energy cost 28%, $1.4M capital, 6-yr payback",
        "Spokane County B&O tax abatement for new manufacturing: apply 90 days before first payroll to capture 3-yr abatement ($280k/yr)",
      ],
    },
    z2: {
      feasibility: 84,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 88,
      capex: "$11M",
      timeline: "7 months",
      rootCause:
        "BNSF Spokane Intermodal facility 1.2km north — spur extension via Trent Ave feasible at $1.8M. Flat grade maintains BNSF Class IV alignment standard (0.3% max grade). Zone supports 120k sqft high-bay distribution at 40ft clear height.",
      prediction:
        "87% delivery probability. BNSF connection reduces inbound freight $1.4M/yr. 400 TEU/wk capacity at full utilisation. Cold storage wing (20k sqft) earns premium Yakima agricultural export revenue.",
      recs: [
        "High-bay distribution centre (120k sqft, 40ft clear): maximises BNSF intermodal throughput, BNSF AAR Class IV compatible",
        "Rail spur alignment: 0.5% grade into facility, 8-position unloading dock with overhead crane for inbound/outbound",
        "42-trailer outdoor staging at N boundary: independent of rail ops, I-90 truck access via Exit 291B",
        "Cold storage wing (20k sqft): serves Yakima Valley agricultural exports via I-90 — $380k premium revenue/yr",
        "Weigh-in-motion at entry gate: eliminates manual inspection for 286k-lb rail cars, saves 4 min/car",
      ],
    },
    z3: {
      feasibility: 60,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 70,
      capex: "$4M",
      timeline: "Restricted — ancillary only",
      rootCause:
        "Avista Sullivan–Trent 230kV corridor: 180m setback and 15m height limit per WAC 296-45-035. Avista will not grant height variances within the corridor — this is non-negotiable. Best use: primary substation yard, solar array, and employee parking.",
      prediction:
        "Zone is permanently height-restricted. Best value: primary 230kV substation here minimises MV cable run to z1 production (saves $2.8M vs placing substation elsewhere). 800kW ground-mount solar at 3m mounting height achieves 6-yr payback.",
      recs: [
        "Primary substation: 230kV/4.16kV, 4×30MVA units N+1 redundancy — here minimises MV cable to z1 by 60%, saves $2.8M",
        "20MWh BESS adjacent to substation: 2-hr backup + grid arbitrage revenue $180k/yr at current Avista tariff",
        "Ground-mount solar: 800kW within 3m height (WAC 296-45-035 compliant), 6-yr payback at Avista commercial rate",
        "120-space EV-ready parking lot: 40% EV charging stalls per WA EV code RCW 19.405 — $380k installed",
        "Emergency generator pad: position here away from production, within utility cable range — $120k, required for BNSF intermodal SLA",
      ],
    },
    z4: {
      feasibility: 40,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 42,
      capex: "$3M prep",
      timeline: "Phase 3 — 5+ years",
      rootCause:
        "Shallow topsoil over basalt bedrock (Warden formation) at 1.2–1.8m in NW quadrant; increases foundation cost $22/sqft. Semi-arid shrub-steppe vegetation requires dust suppression during construction. Suitable for Phase 3 expansion only after z1/z2 at full capacity.",
      prediction:
        "62% suitability for light industrial after Phase 1 complete. Rock excavation adds $22/sqft to foundation cost in NW quadrant. Commission geotechnical boring grid now at $18k — prevents post-bid change orders worth $400k+.",
      recs: [
        "Commission 30m×30m geotechnical boring grid: $18k, maps basalt depth, prevents $400k+ post-bid change orders for rock excavation",
        "Defer all construction until z1 and z2 at full operational capacity — no CAPEX commitment required now",
        "Revegetate with native Palouse bunchgrass: controls erosion, satisfies Spokane County LID requirement, $28k installed",
        "Reserve for Phase 3: 80k sqft light manufacturing capacity when primary zones exhausted — pre-position utility stub-outs now at marginal cost",
        "Install perimeter boundary fence and access control: prevents unauthorised access to undeveloped land, reduces liability",
      ],
    },
    z5: {
      feasibility: 5,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 0,
      capex: "Not viable",
      timeline: "Permanently restricted",
      rootCause:
        "WSDOT I-90 permanent right-of-way under 23 CFR 710. All permanent structures prohibited within ROW boundary. No encroachment variance pathway for industrial development — federally protected highway easement. Access road crossing permit available from WSDOT for heavy haul.",
      prediction:
        "Development not permitted. Exclude from all CAPEX modelling. WSDOT access road crossing permit ($8k, 90-day process) required for heavy haul vehicles from z1 to z2 BNSF rail zone — file this permit early.",
      recs: [
        "File WSDOT access road crossing permit ($8k, 90 days) for heavy haul route from z1 to z2 — critical path item",
        "Maintain WSDOT clear-zone: no vegetation >0.9m within 30m of I-90 carriageway — Spokane County enforcement active",
        "Use I-90 proximity as marketing asset: 60-second on-ramp access at Exit 291B is top site selection criterion",
        "Monitor WSDOT I-90 interchange upgrade programme (2027–2030): potential access geometry improvement at Exit 291B",
        "Exclude from all development planning and exclude from site area calculations in marketing materials",
      ],
    },
    z6: {
      feasibility: 60,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 74,
      capex: "$6M",
      timeline: "Phase 2",
      rootCause:
        "Spokane River 100-yr flood plain clips NE corner (FEMA Zone AE). CLOMR process required before siting structures — 6-month timeline, prevents costly redesign. Despite flood risk, location adjacent to Avista 230kV is optimal for primary substation and BESS.",
      prediction:
        "78% suitability for utility infrastructure with elevated slab. Substation positioned here cuts MV cable run to z1 production 60% vs alternatives, saving $2.8M. CLOMR process adds 6 months but confirms buildable elevation.",
      recs: [
        "Initiate CLOMR (Conditional Letter of Map Revision) immediately: 6-month FEMA process, $28k fee — confirms elevated slab as flood-compliant",
        "Primary substation on elevated slab (BFE +0.9m): 230kV/4.16kV transformation, optimally positioned for z1 MV cable routing",
        "Avista SCADA coordination hub: install grid monitoring per Avista IR-2 interconnection spec — required for direct 230kV service",
        "Lightning protection: install Franklin rod array across substation yard — Avista requirement for direct 230kV connection",
        "Battery storage (20MWh BESS): adjacent to substation, provides 2-hr backup + Avista demand response revenue (~$180k/yr)",
      ],
    },
  },

  yakima: {
    z1: {
      feasibility: 84,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 80,
      capex: "$22M",
      timeline: "14 months",
      rootCause:
        "120-acre flat valley floor — best water access and utility connectivity on site. BPA Yakima substation 2.1km south (230kV tap available). US-12 Yakima Ave interchange 1.4km west. Yakima County I-1 zoning. Water right application (WRIA 37, WAC 173-152) must be filed immediately — 12–18 month lead time.",
      prediction:
        "86% delivery probability with water rights secured. Yakima County B&O manufacturing tax credit $340k/yr. BPA Yakima substation rate below state average at $0.052/kWh. Agrivoltaic configuration reduces land-use conflict with irrigation district.",
      recs: [
        "File Ecology water right application (WAC 173-152, WRIA 37) immediately: 12–18 month process, $45k–$80k legal fees — most critical long-lead item",
        "BPA Yakima substation interconnect: PSE Yakima service territory at $0.052/kWh (Schedule I-2) — 3.8km, faster than BPA GIA queue by 6–8 months",
        "Yakima County B&O manufacturing credit: apply 90 days before first production payroll to capture 3-yr abatement ($340k/yr value)",
        "Closed-loop cooling water system: reduces municipal consumption 72%, dramatically improves Ecology permit prospects for water-intensive processes",
        "Position processing plant at site centre: equidistant from solar input (z2) and US-12 logistics output — minimises internal haulage",
        "Agrivoltaic buffer at W boundary: lavender/saffron understorey at 1.8m panel clearance — reduces irrigation district opposition and qualifies for USDA REAP grant",
      ],
    },
    z2: {
      feasibility: 96,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 88,
      capex: "$16M",
      timeline: "8 months",
      rootCause:
        "140-acre flat bench — highest GHI in Washington State: 5.8 kWh/m²/day, 290+ clear days/yr (NREL NSRDB data). Optimal south-facing aspect. 28MW Phase 1 achievable. Agrivoltaic dual-use qualifies for USDA REAP grant (25% of system cost, up to $500k). Federal ITC 30% reduces capital by $4.8M.",
      prediction:
        "28MW solar with 96% delivery confidence. LCOE $0.038/kWh over 15-year project life. Grid injection revenue $1.2M/yr at current PSE avoided-cost rate. 40MWh co-located BESS enables 6-hr time-shift to capture evening peak premium.",
      recs: [
        "Deploy 28MW bifacial mono-PERC array: 62,000 panels × 450W, 1.8m clearance for agrivoltaic understorey — optimal east-west row spacing 9.2m",
        "Dual-axis tracking: +18% yield vs fixed tilt, adds $1.1M capital — recovers in 2.8 years at $0.038/kWh LCOE",
        "40MWh BESS co-located with array: enables 6-hr time-shift, captures PSE peak tariff premium ($0.068/kWh vs off-peak $0.031/kWh)",
        "Agrivoltaic understorey: lavender/saffron at 1.8m panel clearance — $180k/yr additional crop revenue, qualifies USDA REAP grant ($500k max)",
        "Federal ITC 30% (IRA Section 48E): reduces $16M capital by $4.8M — ensure construction starts before 2032 ITC step-down",
        "BPA 230kV connection via 1.4km underground feeder: avoids overhead line easement conflict with irrigation district",
      ],
    },
    z3: {
      feasibility: 62,
      envRisk: "MEDIUM",
      infraComplexity: "HIGH",
      utilityReady: 60,
      capex: "$8M",
      timeline: "Phase 2 — 18 months",
      rootCause:
        "East-facing slope 6–12%, transitional to Yakima Ridge. Wind resource Class 4 at 80m hub height: WRCC historical data shows 7.2 m/s mean wind speed at ridge crest. 4×2.5MW turbines viable on N–S alignment with 350m spacing. Cut-and-fill for turbine pads: $2.4M.",
      prediction:
        "72% suitability for wind energy after earthworks. Wind capacity factor 38% at this location — top 10% for inland WA. 4×2.5MW = 10MW at 38% CF produces 33.3 GWh/yr, $2.6M/yr at $0.079/kWh PPA rate. IRR 11.2% over 25 years.",
      recs: [
        "Install met mast at ridge crest: 12-month monitoring programme ($85k) — AWEA-standard data required for turbine lender due diligence",
        "4×2.5MW IEC Class III turbines: N–S alignment, 350m spacing, 100m hub height — cut-and-fill crane pads 20m×20m per location, $2.4M total",
        "Access road: 5m compacted gravel from valley floor, 1.2km, $420k — required for 100-tonne crane during installation",
        "Noise assessment (WAC 173-60): nearest residence 1.4km — model to confirm ≤45dBA at property line, required before county permit",
        "Production forecast: 10MW at 38% CF = 33.3 GWh/yr, $2.6M/yr at $0.079 PPA — 20-yr fixed PPA with PSE achievable given site quality",
        "Grid connection: 10MW wind ties into BPA Yakima 230kV via same underground feeder as z2 solar — shared connection cost reduces per-MW capital",
      ],
    },
    z4: {
      feasibility: 8,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 0,
      capex: "Not viable",
      timeline: "Permanently restricted",
      rootCause:
        "Mandatory 90m setback from Wapato Irrigation Project canal centreline (Yakima Irrigation District, RCW 90.03, DOE WAC 173-160). Senior water rights held by YID since 1906 — enforcement is robust and legally unchallenged in 40+ years. Development permanently prohibited within setback.",
      prediction:
        "Development not permitted. DOE water rights enforcement by YID is historically 100% successful. Treat as permanent open space — fulfils riparian buffer requirement and strengthens Ecology water right application for z1.",
      recs: [
        "Treat as permanent riparian open space: satisfies DOE WAC 173-160 canal setback and strengthens Ecology water right application",
        "Engage Yakima Irrigation District early: supplemental industrial water right allocation (limited volume) may be available at $1,200–$2,400/acre-ft/yr",
        "Install native riparian planting (cottonwood, red-osier dogwood): reduces bank erosion, improves water quality, satisfies DOE permit conditions",
        "Annual canal monitoring: document pre-construction hydrology baseline — required for WAC 173-152 water right application",
        "Do not grade, fill, or hard-surface within 90m of canal centreline: triggers DOE enforcement and damages water right application",
      ],
    },
    z5: {
      feasibility: 28,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 22,
      capex: "$5M stabilisation",
      timeline: "Long-term only",
      rootCause:
        "Slope >15%, classified as Critical Area under Yakima County code. Seismic hazard zone — M6.5+ event probability 8% within 50 years per USGS Quaternary Fault Map (Ahtanum Creek fault system 4km east). Slope stability analysis mandatory per WAC 365-190-130 before any grading.",
      prediction:
        "32% suitability after slope stabilisation. Retaining wall system: 180 linear metres at $17,800/m = $3.2M. Turbine foundation point loads better suited to slope than distributed slabs — viable for wind turbines only after geotech confirmation.",
      recs: [
        "Commission geotechnical slope stability analysis before any grading: Yakima County mandatory requirement, $45k, 8-week timeline",
        "Slope monitoring: install 4 inclinometers and 2 piezometers — 12-month monitoring programme establishes safety baseline for permitting",
        "If stabilised: wind turbine foundations only — concentrated point loads more compatible with slope geometry than distributed slabs",
        "Hydroseeding with native Palouse grasses immediately after any ground disturbance: prevents erosion into irrigation canal",
        "Seismic hazard disclosure: document Ahtanum Creek fault proximity in site development plan per WAC 365-190-130",
      ],
    },
    z6: {
      feasibility: 55,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 58,
      capex: "$7M",
      timeline: "Phase 2 — 18 months",
      rootCause:
        "South gradient 4–8%, transitional between valley floor and US-12 corridor. Minor earthworks to establish 1% platform. Suitable for open-air logistics, agrivoltaic buffer planting, and bioswale routing. Gravity stormwater flow to z1 retention basin — no pump required.",
      prediction:
        "65% suitability for secondary industrial and logistics. Platform cost: cut≈fill at $420k for 8-acre pad. Agrivoltaic demonstration plot here creates community visibility asset from US-12 corridor.",
      recs: [
        "Grade to 1% uniform slope: cut ≈ fill geometry minimises waste, $420k for 8-acre platform — schedule with z1 grading for mobilisation cost sharing",
        "Bioswale follows natural gradient to z1 retention basin: gravity-fed, no pump — satisfies Yakima County stormwater LID requirement",
        "Agrivoltaic demonstration plot: visible from US-12 at 1.4km — community engagement asset, supports Yakima County agricultural zoning compliance",
        "30-trailer outdoor logistics staging: aggregate surface, operational within 3 months, $180k — immediate revenue generation before main facilities complete",
        "Secondary US-12 access road: upgrade existing agricultural track, $280k — independent access reduces congestion at main z1 gate",
      ],
    },
  },

  rnt001: {
    z1: {
      feasibility: 91,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 91,
      capex: "$48M",
      timeline: "14 months",
      rootCause:
        "190-acre flat brownfield platform — former industrial site, minimal remediation needed. PSE 115kV at Grady Way substation 0.4km SW. BNSF East Valley Rd connector 280m E. King County I-2 Heavy Industrial zoning confirmed. Shovel-ready Q4 2026 per county pre-app meeting.",
      prediction:
        "93% on-budget delivery probability. PSE I-2 rate ($0.058/kWh) cuts annual energy cost 34% vs commercial. BNSF spur at $1.4M recovers in 14 months via logistics savings. WA Clean Energy Fund reduces net CAPEX by $8M.",
      recs: [
        "Phase 1 Battery Manufacturing Hall: 140k sqft clear-span steel, orient E–W for BNSF rail offload at S dock face",
        "PSE Schedule I-2 Large Industrial: negotiate firm 14MW — initiate 10 months before commissioning",
        "BNSF East Valley Rd spur: 280m at 0.3% grade, $1.4M capital — JIT battery cell delivery reduces inbound 38%",
        "Solar canopy over 320-space employee parking: 1.1MW at $0.72/W installed, WA Clean Energy Fund rebate available",
        "EV DC fast charging: WA State RCW 19.405 mandate — install 40% EV-ready stalls in Phase 1",
      ],
    },
    z2: {
      feasibility: 84,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 86,
      capex: "$14M",
      timeline: "8 months",
      rootCause:
        "55-acre logistics zone with direct BNSF spur connection at East Valley Rd. Flat grade maintains BNSF Class IV alignment (0.3% max). SR-167 N interchange 0.6km provides heavy haul truck routing without traversing residential streets.",
      prediction:
        "87% delivery probability within 8 months. BNSF connection reduces inbound freight $1.2M/yr. 20-door cross-dock with AGV link to z1 manufacturing reduces handling labour 32%.",
      recs: [
        "20-door cross-dock: orient perpendicular to SR-167 N ramp for minimal 53ft trailer turn radius",
        "AGV conveyor link between z2 dock and z1 assembly floor: $1.6M capital, reduces 3.8 FTE manual handling",
        "BNSF rail spur: 280m at East Valley connector — file Industrial Track Agreement 6 months before construction",
        "Weigh-in-motion sensors at gate: eliminates manual inspection, saves 4 min/truck, $120k installed",
        "RFID inbound gate: automated receiving, 2.2 FTE savings, $80k installed, 5-month payback",
      ],
    },
    z3: {
      feasibility: 52,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 60,
      capex: "$3M",
      timeline: "Restricted — ancillary only",
      rootCause:
        "WSDOT SR-167 right-of-way setback 80m from centreline. No permanent structures within setback. Best use: stormwater detention, surface parking, employee green space. Direct SR-167 ramp access at N boundary eliminates residential street routing for heavy haul.",
      prediction:
        "Zone is not buildable for production facilities but provides critical stormwater and access functions. 300-space surface parking satisfies Phase 1 employee requirements. Stormwater detention basin serves entire site under King County SWDM requirements.",
      recs: [
        "WSDOT SR-167 setback: 80m from centreline — mark with survey stakes before any grading to prevent ROW encroachment",
        "300-space surface parking with 40% EV-ready stalls: complies with RCW 19.405 EV infrastructure mandate",
        "Stormwater detention basin: 0.8-acre wet pond provides 2-hr detention per King County SWDM Chapter 3",
        "Employee green space along SR-167 berms: noise attenuation, ESG reporting value, low maintenance cost",
        "Coordinate SR-167 ramp expansion with WSDOT: secure letter of no objection before site plan approval",
      ],
    },
    z4: {
      feasibility: 30,
      envRisk: "HIGH",
      infraComplexity: "MEDIUM",
      utilityReady: 25,
      capex: "$4M mitigation",
      timeline: "12–18 months permit",
      rootCause:
        "100m SMA setback from Cedar River OHWM (RCW 90.58). FEMA Zone AE floodplain (BFE +1.1m NAVD88) clips SW corner. No structures permitted within setback. Any development triggers Shoreline CUP + SEPA + FEMA review — poor outcomes for heavy industrial applicants historically.",
      prediction:
        "Development not recommended. Cedar River SMA setback + FEMA Zone AE = dual regulatory burden. Treat as ecological buffer — fulfils SMA open-space requirement for entire site.",
      recs: [
        "Designate as SMA ecological buffer — avoids SCUP review, fulfils King County Shoreline Master Program compliance",
        "Native vegetation restoration: Puyallup basin-native riparian shrubs — satisfies SMA shoreline restoration requirement",
        "Stake Cedar River OHWM line before any adjacent grading — Army Corps NWP-39 pre-notification if any disturbance",
        "Bioswale routing along S edge: gravity-fed from z1 stormwater, discharges to Cedar River via LID biofilter",
        "Employee nature trail (pervious): community and ESG benefit, no Section 404 permit required for ≤1.2m pervious path",
      ],
    },
    z5: {
      feasibility: 15,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 10,
      capex: "Not viable",
      timeline: "Permanently restricted",
      rootCause:
        "King County Critical Areas Ordinance (KCC 21A.24) Category II wetland buffer — 60m setback from delineated wetland edge. Annual hydrology monitoring required. Any disturbance triggers Army Corps Section 404 + Ecology Section 401. Mitigation via King County wetland bank.",
      prediction:
        "Development permanently prohibited under KCC CAO. Exclude from all CAPEX modelling. Purchase King County wetland bank credits if adjacent grading encroaches within buffer.",
      recs: [
        "Commission Phase II wetland delineation — establishes exact 60m buffer setback before site plan submission",
        "King County CAO: annual hydrology monitoring report required — budget $8k/yr for continuous well readings",
        "If z1 grading encroaches within 60m buffer: purchase King County wetland bank credits ($45k–$65k/acre)",
        "Do not use for construction staging — even short-term disturbance triggers Army Corps NWP-39 notification",
        "Retain buffer in natural state: qualifies for LEED Sustainable Sites credit SS4",
      ],
    },
  },

  blm002: {
    z1: {
      feasibility: 88,
      envRisk: "LOW",
      infraComplexity: "MEDIUM",
      utilityReady: 86,
      capex: "$52M",
      timeline: "16 months",
      rootCause:
        "240-acre flat glacial-marine terrace — 0.3% cross-slope, competent bearing soil at 1.4m depth. PSE 115kV at Cornwall Ave substation 1.1km east. BNSF mainline 0.8km south. Whatcom County I-2 zoning confirmed. KBLI airport apron proximity enables direct aircraft delivery — 30-min ground transport.",
      prediction:
        "90% delivery probability at $52M CAPEX. PSE I-2 rate ($0.061/kWh) saves $290k/yr. BNSF spur at $1.8M recovers in 3 years. Airport delivery cuts aerospace component inbound time 68% vs trucking from Everett.",
      recs: [
        "Phase 1 Fuselage Manufacturing: 200k sqft clear-span, orient N–S for BNSF rail offload at S dock face",
        "PSE Schedule I-2 at Cornwall Ave substation: initiate negotiation 12 months before commissioning — firm 12MW capacity",
        "BNSF Bellingham Yard spur: 0.8km via Airport Dr connector at 0.4% grade, $1.8M, Class IV standard",
        "KBLI Part 77 surfaces: structures >9m AGL within 2km of runway threshold require FAA Form 7460-1 — 45-day lead",
        "Rainwater harvest from assembly hangar roofs (3.2ha): 6.4M L/yr — Whatcom County NPDES stormwater credit",
      ],
    },
    z2: {
      feasibility: 82,
      envRisk: "LOW",
      infraComplexity: "LOW",
      utilityReady: 84,
      capex: "$16M",
      timeline: "10 months",
      rootCause:
        "80-acre KBLI-adjacent logistics zone. Direct ground transport to airport apron (<0.5km). Airport Dr connector provides BNSF spur access 0.8km south. FAA Part 77 transitional surfaces cap structures at 12m AGL nearest to runway.",
      prediction:
        "84% delivery probability. Airport proximity cuts aerospace component delivery time 68% vs trucking alternatives. Low-height cross-dock (12m max) feasible within FAA surface constraint. 24-door dock serves z1 fuselage manufacturing.",
      recs: [
        "Low-height cross-dock ≤12m: compliant with KBLI FAA Part 77 surfaces — file Form 7460-1 for any structure >9m AGL",
        "24-door dock: orient N–S perpendicular to Airport Dr for direct truck access from SR-539",
        "BNSF spur from Bellingham Yard: 0.8km Airport Dr connector — shared design with z1 to reduce capital split to $900k",
        "Airport Authority coordination: negotiate logistics easement across apron approach road — 60-day process, free",
        "Oversize load permit (Whatcom County): annual blanket permit for aerospace components >4.2m wide on Airport Dr",
      ],
    },
    z3: {
      feasibility: 48,
      envRisk: "MEDIUM",
      infraComplexity: "MEDIUM",
      utilityReady: 55,
      capex: "$4M",
      timeline: "Restricted — ancillary only",
      rootCause:
        "BPA Custer–Ferndale 230kV corridor — 180m horizontal clearance and 8m building height limit per WAC 296-45-035. BPA easement non-negotiable (historically 100% variance denial). Best use: substation yard, solar canopy ≤8m, equipment laydown, surface parking.",
      prediction:
        "Zone is permanently height-restricted but usable for support functions. 414kW ground-mount solar at ≤8m height achieves 7-yr payback. 360-space parking serves peak shift change without highway congestion.",
      recs: [
        "Primary PSE substation: 115kV/12kV transformation here minimises underground MV cable run to z1 hangar ($1.8M saving)",
        "Solar canopy: 920 panels × 450W at ≤8m height = 414kW, PSE NEM-C net metering, 7-yr payback",
        "360-space surface parking with 40% EV-ready: RCW 19.405 compliance, serves both z1 and z2 shift changes",
        "WAC 296-45-035: maintain 5m clear zone on each side of BPA centreline — permanent survey markers required",
        "Equipment laydown during z1 construction: eliminates $160k/yr off-site storage cost for aerospace component staging",
      ],
    },
    z4: {
      feasibility: 28,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 20,
      capex: "$5M mitigation",
      timeline: "18–24 months permit",
      rootCause:
        "100m Bellingham Bay Shoreline Management Act setback (RCW 90.58). Bellingham Bay is SMA 'Shoreline of Statewide Significance' — highest protection class. Historical SMA industrial variance success rate <15% for Whatcom County. Dual regulatory: Shoreline CUP + SEPA.",
      prediction:
        "Development not recommended. Shoreline of Statewide Significance designation means appeals go to Ecology Director — industrial variances nearly always denied. Treat as ecological buffer and passive open space.",
      recs: [
        "Designate as SMA ecological buffer — avoids SCUP, fulfils Whatcom County SMP compliance for entire site",
        "Shoreline restoration planting: native Bellingham Bay saltmarsh grasses — improves Whatcom County ESG score",
        "Employee walking trail (pervious): ESG benefit, no SMA permit required for ≤1.2m pervious path",
        "Bioswale from z1 stormwater: discharges to bay via LID biofilter — satisfies DOE NPDES permit",
        "Stake SMA setback with licensed surveyor before any grading — 100m from OHWM as surveyed, not estimated",
      ],
    },
    z5: {
      feasibility: 18,
      envRisk: "HIGH",
      infraComplexity: "HIGH",
      utilityReady: 15,
      capex: "$6M mitigation",
      timeline: "12–18 months permit",
      rootCause:
        "FEMA 100-yr flood zone (Zone AE) along Whatcom Creek SE drainage corridor. BFE +1.3m NAVD88. Pile foundations required — alluvial soils have 800–1,200 psf bearing capacity vs 3,000 psf on z1 glacial terrace. Structures require elevation to BFE + 0.9m freeboard per ASCE 24-14.",
      prediction:
        "68% permit success with full flood mitigation plan. Elevation adds $260/sqft. NFIP-compliant elevated structures feasible for limited light industrial but not aerospace assembly. Commission CLOMR study before design investment.",
      recs: [
        "Commission CLOMR study: $120k, 6-month process — determines exact AE flood extent before siting any structure",
        "Pile foundation design: 800–1,200 psf alluvial soils require 12m micropiles at $280/LF — geotechnical borings essential",
        "Elevated floor slab to BFE +0.9m per ASCE 24-14: adds $1.6M for any 40k sqft structure — only viable for light use",
        "Tide gate on Whatcom Creek outfall: prevents tidal backflow into drainage — $180k installed, DOE Section 401 permit required",
        "Pre-application meeting with Whatcom County Flood Control Zone District: free service before $40k+ engineering investment",
      ],
    },
  },
};

/* ── Terrain component selector ─────────────────────────────────────── */
function Terrain({ siteKey, W, H, night }) {
  if (siteKey === "tacoma" || siteKey === "rnt001" || siteKey === "blm002") return <TerrainWashington W={W} H={H} night={night} />;
  if (siteKey === "everett") return <TerrainCalifornia W={W} H={H} night={night} />;
  if (siteKey === "spokane") return <TerrainTexas W={W} H={H} night={night} />;
  return <TerrainArizona W={W} H={H} night={night} />; // yakima — semi-arid valley
}

/* ── Animated particles (wind / heat shimmer) ───────────────────────── */
function Particles({ W, H, night, siteKey }) {
  const count = 18;
  const seeds = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      dx: siteKey === "spokane" || siteKey === "yakima" ? 0.08 + Math.random() * 0.1 : 0.04 + Math.random() * 0.06,
      dy: siteKey === "tacoma" ? -0.02 : 0.01 + Math.random() * 0.03,
      r: 1 + Math.random() * 2,
      life: Math.random() * 100,
    })),
  ).current;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);
  seeds.forEach((s) => {
    s.x += s.dx;
    s.y += s.dy;
    s.life++;
    if (s.x > 105) s.x = 0;
    if (s.y < -5 || s.y > 105) {
      s.y = Math.random() * 100;
      s.x = 0;
    }
  });
  const col =
    siteKey === "everett"
      ? "rgba(251,191,36,0.25)"
      : siteKey === "tacoma"
        ? "rgba(56,189,248,0.2)"
        : siteKey === "spokane"
          ? "rgba(234,179,8,0.22)"
          : "rgba(56,189,248,0.2)";
  return (
    <g style={{ pointerEvents: "none" }}>
      {seeds.map((s, i) => (
        <circle key={i} cx={(s.x / 100) * W} cy={(s.y / 100) * H} r={s.r} fill={col} opacity={0.3 + Math.sin(s.life * 0.12) * 0.2} />
      ))}
    </g>
  );
}

/* ── Holographic pulse ring ──────────────────────────────────────────── */
function PulseRings({ W, H, night }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 120), 40);
    return () => clearInterval(id);
  }, []);
  const cx = W * 0.5,
    cy = H * 0.5;
  const r1 = 10 + (phase % 60) * 1.5;
  const r2 = 10 + ((phase + 30) % 60) * 1.5;
  const col = night ? "rgba(56,189,248," : "rgba(30,100,200,";
  return (
    <g style={{ pointerEvents: "none" }}>
      <circle cx={cx} cy={cy} r={r1} fill="none" stroke={`${col}${Math.max(0, 0.35 - (r1 / 90) * 0.35)})`} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r2} fill="none" stroke={`${col}${Math.max(0, 0.35 - (r2 / 90) * 0.35)})`} strokeWidth="0.7" />
    </g>
  );
}

/* ── Main map SVG ────────────────────────────────────────────────────── */
function SiteMap({ siteKey, night, W, H, selZone, setSelZone, T, boundaryOverride }) {
  const [hover, setHover] = useState(null);
  const site = ZONE_DEFS[siteKey] || ZONE_DEFS.everett;
  const siteInfo = SITES[siteKey] || SITES.everett;
  /* Prefer uploaded boundary (GeoJSON polygon / DXF-derived), fall back to static ZONE_DEFS coords */
  const boundary = boundaryOverride || site.boundary;

  const { features: osmF, loading: osmLoading } = useOsmData(siteKey, boundary);

  const [osmLayers, setOsmLayers] = useState({
    roads: true,
    railways: true,
    waterways: true,
    power: true,
    industrial: false,
    airports: true,
    buildings: false,
    terrain: false,
  });
  const toggleOsm = (k) => setOsmLayers((p) => ({ ...p, [k]: !p[k] }));

  const LAYER_PRESETS = {
    ALL: { roads: true, railways: true, waterways: true, power: true, industrial: true, airports: true, buildings: true, terrain: false },
    INFRA: { roads: true, railways: true, waterways: true, power: true, industrial: false, airports: false, buildings: false, terrain: false },
    CLEAN: { roads: false, railways: false, waterways: false, power: false, industrial: false, airports: false, buildings: false, terrain: false },
    TOPO: { roads: false, railways: false, waterways: true, power: false, industrial: false, airports: false, buildings: false, terrain: true },
  };

  const center = useMemo(() => {
    if (!boundary?.length) return [47.5, -120.5];
    return [boundary.reduce((s, [lat]) => s + lat, 0) / boundary.length, boundary.reduce((s, [, lon]) => s + lon, 0) / boundary.length];
  }, [siteKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const svcToLL = useCallback((x, y) => svgToLatLon(x, y, boundary), [siteKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const tileUrl = night
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  const labelUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, borderRadius: 6, overflow: "hidden" }}>
      <MapContainer key={siteKey} center={center} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl={false} attributionControl={false}>
        <TileLayer key={night ? "dark" : "sat"} url={tileUrl} />
        {!night && <TileLayer url={labelUrl} opacity={0.75} />}
        {osmLayers.terrain && <TileLayer url="https://tile.opentopomap.org/{z}/{x}/{y}.png" opacity={night ? 0.35 : 0.5} />}
        <MapAutoFit boundary={boundary} />
        <MapResizer W={W} H={H} />

        {/* ── OSM layer 1: Industrial zones (bottom — just tinted fill) ── */}
        {osmLayers.industrial &&
          osmF?.industrial.map((ind, i) => (
            <Polygon
              key={`ind-${i}`}
              positions={ind.pts}
              pathOptions={{ color: "#6b7280", weight: 1, fillColor: "#374151", fillOpacity: night ? 0.25 : 0.18, opacity: 0.5, dashArray: "4,4" }}
            />
          ))}

        {/* ── OSM layer 2: OSM building footprints (real existing buildings) ── */}
        {osmLayers.buildings &&
          osmF?.buildings.map((b, i) => (
            <Polygon
              key={`ob-${i}`}
              positions={b.pts}
              pathOptions={{
                color: night ? "#334155" : "#94a3b8",
                weight: 0.8,
                fillColor: night ? "#1e293b" : "#cbd5e1",
                fillOpacity: night ? 0.55 : 0.35,
                opacity: 0.7,
              }}
            />
          ))}

        {/* ── OSM layer 3: Waterways (rivers / canals) ── */}
        {osmLayers.waterways &&
          osmF?.waterways.map((w, i) => (
            <Polyline
              key={`ww-${i}`}
              positions={w.pts}
              pathOptions={{ color: w.type === "river" ? "#38bdf8" : "#93c5fd", weight: w.type === "river" ? 3.5 : 1.5, opacity: 0.9 }}
            />
          ))}

        {/* ── OSM layer 4: Roads ── */}
        {osmLayers.roads && osmF?.roads.map((r, i) => <Polyline key={`rd-${i}`} positions={r.pts} pathOptions={roadStyle(r.type)} />)}

        {/* ── OSM layer 5: Railways ── */}
        {osmLayers.railways &&
          osmF?.railways.map((r, i) => (
            <Polyline key={`rl-${i}`} positions={r.pts} pathOptions={{ color: "#a78bfa", weight: 2.5, opacity: 0.9, dashArray: "12,5" }} />
          ))}

        {/* ── OSM layer 6: Power lines ── */}
        {osmLayers.power &&
          osmF?.powerLines.map((p, i) => (
            <Polyline key={`pw-${i}`} positions={p.pts} pathOptions={{ color: "#f59e0b", weight: 1.5, opacity: 0.75, dashArray: "6,4" }} />
          ))}

        {/* ── OSM layer 7: Airport runways / taxiways ── */}
        {osmLayers.airports &&
          osmF?.airports.map((a, i) => (
            <Polyline
              key={`ap-${i}`}
              positions={a.pts}
              pathOptions={{ color: a.type === "runway" ? "#22c55e" : "#86efac", weight: a.type === "runway" ? 5 : 2.5, opacity: 0.85 }}
            />
          ))}

        {/* ── Site boundary — glow fill layer (bottom) ── */}
        {boundary && (
          <Polygon
            positions={boundary}
            pathOptions={{
              color: "transparent",
              weight: 0,
              fillColor: "#22d3ee",
              fillOpacity: 0.07,
            }}
          />
        )}

        {/* ── Zone polygons (semi-transparent, on top of OSM) ── */}
        {site.zones.map((z) => {
          const sl = SUIT_LEVELS.find((s) => s.key === z.suit);
          if (!sl || !boundary) return null;
          const col = night ? sl.nightColor : sl.color;
          const isSel = selZone === z.id;
          const isHov = hover === z.id;
          const rawPositions = z.pts.map(([x, y]) => svcToLL(x, y));
          const positions = clipToBoundary(rawPositions, boundary);
          if (!positions) return null;
          return (
            <Polygon
              key={z.id}
              positions={positions}
              pathOptions={{
                color: col,
                weight: isSel ? 2.5 : isHov ? 2 : 1,
                fillColor: col,
                fillOpacity: isSel ? 0.55 : isHov ? 0.48 : 0.35,
                opacity: isSel ? 1 : 0.75,
              }}
              eventHandlers={{
                click: () => setSelZone(selZone === z.id ? null : z.id),
                mouseover: (e) => {
                  setHover(z.id);
                  e.target.bringToFront();
                },
                mouseout: () => setHover(null),
              }}
            >
              <Tooltip permanent direction="center" className={`sim2-zone-lbl${isSel ? " sel" : ""}${night ? " night" : ""}`}>
                {z.label}
              </Tooltip>
            </Polygon>
          );
        })}

        {/* ── Constraint areas ── */}
        {site.constraintAreas?.map((c, i) => {
          if (!boundary) return null;
          const ct = CTYPES[c.type];
          const rawPos = c.pts.map(([x, y]) => svcToLL(x, y));
          const pos = clipToBoundary(rawPos, boundary);
          if (!pos) return null;
          return (
            <Polygon
              key={`ca-${i}`}
              positions={pos}
              pathOptions={{ color: ct.color, weight: 1.5, dashArray: ct.dash, fillColor: ct.color, fillOpacity: 0.06, opacity: 0.6 }}
            />
          );
        })}

        {/* ── Constraint lines ── */}
        {site.constraintLines?.map((c, i) => {
          if (!boundary) return null;
          const ct = CTYPES[c.type];
          return (
            <Polyline
              key={`cl-${i}`}
              positions={c.pts.map(([x, y]) => svcToLL(x, y))}
              pathOptions={{ color: ct.color, weight: 2, dashArray: ct.dash, opacity: 0.85 }}
            >
              <Tooltip sticky>{ct.label}</Tooltip>
            </Polyline>
          );
        })}

        {/* ── Planned infrastructure lines ── */}
        {site.infra.map((inf, i) => {
          if (!boundary) return null;
          return (
            <Polyline
              key={`inf-${i}`}
              positions={inf.pts.map(([x, y]) => svcToLL(x, y))}
              pathOptions={{ color: inf.color, weight: inf.sw || 2, dashArray: inf.dash, opacity: night ? 0.85 : 0.7 }}
            />
          );
        })}

        {/* ── Planned building footprints (top layer) ── */}
        {/* {site.buildings.map((b, i) => {
          if (!boundary) return null;
          const positions = [svcToLL(b.x, b.y), svcToLL(b.x + b.w, b.y), svcToLL(b.x + b.w, b.y + b.h), svcToLL(b.x, b.y + b.h)];
          return (
            <Polygon
              key={`bldg-${i}`}
              positions={positions}
              pathOptions={{ color: b.border, weight: 2, fillColor: night ? b.col : "#071830", fillOpacity: night ? 0.92 : 0.78 }}
            >
              <Tooltip permanent direction="center" className={`sim2-bldg-lbl${night ? " night" : ""}`}>
                {b.label}
              </Tooltip>
            </Polygon>
          );
        })} */}

        {/* ── Site boundary — bright outline on TOP of all layers ── */}
        {boundary && (
          <>
            {/* outer halo */}
            <Polygon positions={boundary} pathOptions={{ color: "#22d3ee", weight: 7, fill: false, opacity: 0.18, dashArray: null }} />
            {/* solid inner stroke */}
            <Polygon positions={boundary} pathOptions={{ color: "#22d3ee", weight: 3, fill: false, opacity: 1, dashArray: null }} />
            {/* animated dash overlay */}
            <Polygon positions={boundary} pathOptions={{ color: "#fff", weight: 1.5, fill: false, opacity: 0.7, dashArray: "10,18" }} />
          </>
        )}
      </MapContainer>

      {/* ── GIS Layers panel (top-right) ── */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 500,
          background: "rgba(2,6,16,0.92)",
          border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: 7,
          padding: "9px 10px",
          minWidth: 148,
        }}
      >
        <div style={{ fontSize: 8, color: "#38bdf8", fontFamily: "monospace", fontWeight: 800, letterSpacing: 1, marginBottom: 5 }}>
          GIS LAYERS {osmLoading && <span style={{ animation: "sfpulse 1s infinite" }}>⟳</span>}
        </div>
        {/* Quick filter presets */}
        <div style={{ display: "flex", gap: 3, marginBottom: 7 }}>
          {[
            ["ALL", "All layers"],
            ["INFRA", "Roads/Rail/Power"],
            ["CLEAN", "Zones only"],
            ["TOPO", "Terrain"],
          ].map(([p, tip]) => {
            const isActive =
              p === "ALL"
                ? Object.values(osmLayers).filter(Boolean).length >= 7
                : p === "INFRA"
                  ? osmLayers.roads && osmLayers.railways && osmLayers.power && !osmLayers.buildings && !osmLayers.terrain
                  : p === "CLEAN"
                    ? !Object.values(osmLayers).some(Boolean)
                    : osmLayers.terrain && osmLayers.waterways && !osmLayers.roads;
            return (
              <button
                key={p}
                title={tip}
                onClick={() => setOsmLayers(LAYER_PRESETS[p])}
                style={{
                  flex: 1,
                  padding: "3px 0",
                  fontSize: 7.5,
                  fontWeight: 700,
                  background: isActive ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.06)",
                  border: `1px solid ${isActive ? "rgba(56,189,248,0.6)" : "rgba(56,189,248,0.2)"}`,
                  borderRadius: 3,
                  cursor: "pointer",
                  color: isActive ? "#38bdf8" : "#4e7a9a",
                  fontFamily: "monospace",
                  letterSpacing: 0.5,
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
        {[
          { k: "roads", label: "Roads", color: "#fbbf24", dash: null },
          { k: "railways", label: "Rail", color: "#a78bfa", dash: "dashed" },
          { k: "waterways", label: "Water", color: "#38bdf8", dash: null },
          { k: "power", label: "Power Lines", color: "#f59e0b", dash: "dashed" },
          { k: "industrial", label: "Industrial", color: "#6b7280", dash: null },
          { k: "airports", label: "Airfields", color: "#22c55e", dash: null },
          { k: "buildings", label: "OSM Buildings", color: "#94a3b8", dash: null },
          { k: "terrain", label: "Topo Terrain", color: "#84cc16", dash: "dotted" },
        ].map(({ k, label, color, dash }) => {
          const on = osmLayers[k];
          return (
            <div
              key={k}
              onClick={() => toggleOsm(k)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                marginBottom: 5,
                padding: "3px 5px",
                borderRadius: 4,
                transition: "background 0.15s",
                background: on
                  ? `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},0.08)`
                  : "transparent",
              }}
            >
              {/* Line swatch */}
              <div style={{ width: 22, height: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: dash ? 2 : 3,
                    background: on ? color : "#2a3a4a",
                    borderRadius: 2,
                    borderTop:
                      dash === "dashed"
                        ? `2px dashed ${on ? color : "#2a3a4a"}`
                        : dash === "dotted"
                          ? `2px dotted ${on ? color : "#2a3a4a"}`
                          : "none",
                    opacity: on ? 1 : 0.4,
                  }}
                />
              </div>
              <span style={{ flex: 1, fontSize: 9, color: on ? "#d0eaff" : "#3a5a7a", fontFamily: "monospace", userSelect: "none" }}>{label}</span>
              {/* Toggle pill */}
              <div
                style={{
                  width: 24,
                  height: 12,
                  borderRadius: 6,
                  flexShrink: 0,
                  background: on ? color : "rgba(255,255,255,0.08)",
                  border: `1px solid ${on ? color : "rgba(255,255,255,0.15)"}`,
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 1,
                    left: on ? 13 : 1,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: on ? "#fff" : "#3a5a7a",
                    transition: "left 0.2s",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          zIndex: 500,
          pointerEvents: "none",
          background: night ? "rgba(2,6,16,0.8)" : "rgba(210,235,255,0.9)",
          border: `1px solid ${h2a(T.sky, 0.35)}`,
          borderRadius: 4,
          padding: "4px 10px",
          fontSize: 10,
          fontFamily: "'Courier New',monospace",
          fontWeight: 800,
          letterSpacing: 1,
          color: night ? "#38bdf8" : "#1a5fa0",
        }}
      >
        {siteInfo.name.toUpperCase()} · {siteInfo.region}
      </div>

      {/* Hover zone tooltip overlay */}
      {hover &&
        (() => {
          const z = site.zones.find((zn) => zn.id === hover);
          if (!z) return null;
          const sl = SUIT_LEVELS.find((s) => s.key === z.suit);
          const col = night ? sl.nightColor : sl.color;
          return (
            <div
              style={{
                position: "absolute",
                top: 46,
                left: 10,
                zIndex: 500,
                pointerEvents: "none",
                background: night ? "rgba(2,8,20,0.95)" : "rgba(230,245,255,0.97)",
                border: `1.5px solid ${col}`,
                borderRadius: 6,
                padding: "8px 12px",
                minWidth: 170,
              }}
            >
              <div style={{ color: col, fontSize: 10, fontWeight: 800, fontFamily: "monospace" }}>{z.label}</div>
              <div style={{ color: night ? "#8aaccc" : "#4a6a88", fontSize: 9, marginTop: 3 }}>{sl.label} Suitability</div>
              <div style={{ color: night ? "#5a7a9a" : "#7a9aaa", fontSize: 8, marginTop: 2 }}>Click for AI analysis</div>
            </div>
          );
        })()}
    </div>
  );
}

/* ── Score bar color ─────────────────────────────────────────────────── */
const scCol = (v) => (v >= 80 ? "#22c55e" : v >= 60 ? "#eab308" : "#ef4444");

/* ── Left Feasibility Panel ──────────────────────────────────────────── */
function FeasibilityPanel({ site, T, night, selZone, siteKey }) {
  const zones = ZONE_DEFS[siteKey]?.zones || [];
  const selZ = selZone ? zones.find((z) => z.id === selZone) : null;
  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: night ? "rgba(3,8,18,0.78)" : "rgba(220,238,255,0.88)",
        border: `1px solid ${h2a(T.sky, 0.16)}`,
        borderRadius: 8,
        padding: 11,
        overflowY: "auto",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Score */}
      <div>
        <div style={{ color: T.muted, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 5 }}>FEASIBILITY SCORE</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span
            style={{
              color: site.scoreColor,
              fontSize: 34,
              fontWeight: 900,
              fontFamily: "'Courier New',monospace",
              textShadow: night ? `0 0 18px ${site.scoreColor}` : "none",
            }}
          >
            {site.score}%
          </span>
          <span style={{ color: site.scoreColor, fontSize: 11, fontWeight: 700 }}>{site.rating}</span>
        </div>
        <div style={{ height: 5, background: h2a(T.sky, 0.12), borderRadius: 3 }}>
          <div
            style={{
              height: "100%",
              width: `${site.score}%`,
              borderRadius: 3,
              background: `linear-gradient(90deg,${site.scoreColor},${h2a(site.scoreColor, 0.55)})`,
              boxShadow: night ? `0 0 10px ${site.scoreColor}` : "none",
            }}
          />
        </div>
      </div>

      {/* Criteria */}
      <div style={{ borderTop: `1px solid ${h2a(T.sky, 0.1)}`, paddingTop: 7 }}>
        <div style={{ color: T.muted, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>CRITERIA BREAKDOWN</div>
        {site.criteria.map((c) => {
          const col = scCol(c.v);
          return (
            <div key={c.label} style={{ marginBottom: 5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ color: T.text, fontSize: 9 }}>{c.label}</span>
                <span style={{ color: col, fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}>{c.v}%</span>
              </div>
              <div style={{ height: 3, background: h2a(T.sky, 0.1), borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${c.v}%`, background: col, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Constraints */}
      <div style={{ borderTop: `1px solid ${h2a(T.sky, 0.1)}`, paddingTop: 7 }}>
        <div style={{ color: T.red, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>KEY CONSTRAINTS</div>
        {site.constraints.map((kc, i) => {
          const ct = CTYPES[kc.type];
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${ct.color}`, flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: T.text, fontSize: 9, lineHeight: 1.4 }}>{kc.text}</span>
            </div>
          );
        })}
      </div>

      {/* Selected zone */}
      {selZ &&
        (() => {
          const sl = SUIT_LEVELS.find((s) => s.key === selZ.suit);
          const col = night ? sl.nightColor : sl.color;
          return (
            <div
              style={{
                borderTop: `1px solid ${h2a(col, 0.3)}`,
                paddingTop: 7,
                background: h2a(col, 0.06),
                borderRadius: 5,
                padding: 8,
                border: `1px solid ${h2a(col, 0.2)}`,
              }}
            >
              <div style={{ color: col, fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>▶ {selZ.label.toUpperCase()}</div>
              <div style={{ color: T.muted, fontSize: 9, marginBottom: 3 }}>
                Suitability: <span style={{ color: col, fontWeight: 700 }}>{sl.label}</span>
              </div>
              <div style={{ color: T.text, fontSize: 9, lineHeight: 1.5 }}>
                {selZ.suit === "vhigh"
                  ? "Prime development zone. Proceed with detailed engineering immediately."
                  : selZ.suit === "high"
                    ? "Good potential — minor site prep required."
                    : selZ.suit === "medium"
                      ? "Moderate suitability — address constraints first."
                      : selZ.suit === "low"
                        ? "Significant mitigation work required."
                        : "Not recommended — regulatory restrictions active."}
              </div>
              {selZ.desc && (
                <div
                  style={{ color: T.muted, fontSize: 8.5, lineHeight: 1.55, marginTop: 5, paddingTop: 5, borderTop: `1px solid ${h2a(col, 0.15)}` }}
                >
                  {selZ.desc}
                </div>
              )}
            </div>
          );
        })()}

      {/* Metadata */}
      <div style={{ borderTop: `1px solid ${h2a(T.sky, 0.1)}`, paddingTop: 7 }}>
        {[
          ["Area", site.area],
          ["Type", site.type],
          ["Coords", site.coords],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ color: T.muted, fontSize: 9 }}>{k}</span>
            <span style={{ color: T.text, fontSize: 9, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Right AI Panel ──────────────────────────────────────────────────── */
function AiPanel({ site, T, night, selZone, siteKey }) {
  const [expanded, setExpanded] = useState(true);

  const zoneAI = selZone ? ZONE_AI[siteKey]?.[selZone] || null : null;
  const ai = zoneAI || site.ai;
  const zoneName = selZone ? ZONE_DEFS[siteKey]?.zones.find((z) => z.id === selZone)?.label || selZone : null;

  const envRiskColor =
    (ai.envRisk || "").includes("LOW") && !(ai.envRisk || "").includes("MEDIUM")
      ? "#22c55e"
      : (ai.envRisk || "").includes("HIGH")
        ? "#ef4444"
        : "#eab308";
  const infraCol = ai.infraComplexity === "LOW" ? "#22c55e" : ai.infraComplexity === "HIGH" ? "#ef4444" : "#eab308";
  const renewCol = !zoneAI ? (site.ai.renewable === "EXCELLENT" ? "#22c55e" : site.ai.renewable.includes("HIGH") ? "#22c55e" : "#eab308") : "#38bdf8";

  return (
    <div
      style={{
        width: 215,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        height: 500,
      }}
    >
      {/* Constraints legend */}
      {/* <div
        style={{
          background: night ? "rgba(3,8,18,0.78)" : "rgba(220,238,255,0.88)",
          border: `1px solid ${h2a(T.sky, 0.15)}`,
          borderRadius: 8,
          padding: 10,
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ color: T.text, fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 7 }}>CONSTRAINTS</div>
        {Object.entries(CTYPES).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <div
              style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${v.color}`, background: h2a(v.color, 0.1), flexShrink: 0 }}
            />
            <span style={{ color: T.text, fontSize: 9 }}>{v.label}</span>
          </div>
        ))}
      </div> */}

      {/* Land suitability legend */}
      {/* <div
        style={{
          background: night ? "rgba(3,8,18,0.78)" : "rgba(220,238,255,0.88)",
          border: `1px solid ${h2a(T.sky, 0.15)}`,
          borderRadius: 8,
          padding: 10,
          backdropFilter: "blur(6px)",
        }}
      >
        <div style={{ color: T.text, fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 7 }}>LAND SUITABILITY</div>
        {SUIT_LEVELS.map((sl) => (
          <div key={sl.key} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: night ? sl.nightColor : sl.color, flexShrink: 0 }} />
            <span style={{ color: T.text, fontSize: 9 }}>{sl.label}</span>
          </div>
        ))}
      </div> */}

      {/* AI Advisor */}
      <div
        style={{
          flex: 1,
          background: night ? "rgba(18,4,40,0.72)" : "rgba(240,232,255,0.85)",
          border: `1px solid ${h2a(zoneAI ? "#22c55e" : "#8b5cf6", 0.3)}`,
          borderRadius: 8,
          padding: 10,
          overflowY: "auto",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          onClick={() => setExpanded((o) => !o)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: expanded ? 8 : 0 }}
        >
          <div style={{ color: zoneAI ? "#22c55e" : "#a855f7", fontSize: 9, fontWeight: 800, letterSpacing: 2 }}>
            {zoneAI ? "AI ZONE ADVISOR" : "AI SITE ADVISOR"}
          </div>
          <span style={{ color: zoneAI ? "#22c55e" : "#8b5cf6", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>

        {expanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {zoneAI && (
              <div
                style={{
                  padding: "5px 8px",
                  background: h2a("#22c55e", 0.08),
                  border: `1px solid ${h2a("#22c55e", 0.25)}`,
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                <div style={{ color: "#22c55e", fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>SELECTED ZONE</div>
                <div style={{ color: T.text, fontSize: 9, fontWeight: 700, marginTop: 1 }}>{zoneName}</div>
              </div>
            )}

            {zoneAI ? (
              <>
                {[
                  ["Zone Feasibility", `${zoneAI.feasibility}%`, scCol(zoneAI.feasibility)],
                  ["Env Risk", zoneAI.envRisk, envRiskColor],
                  ["Infra Complexity", zoneAI.infraComplexity, infraCol],
                  ["Utility Readiness", `${zoneAI.utilityReady}%`, scCol(zoneAI.utilityReady)],
                  ["Est. Timeline", zoneAI.timeline, "#38bdf8"],
                  ["CAPEX", zoneAI.capex, "#f59e0b"],
                ].map(([k, v, c]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "3px 0",
                      borderBottom: `1px solid ${h2a("#22c55e", 0.1)}`,
                    }}
                  >
                    <span style={{ color: "#6a8aaa", fontSize: 9 }}>{k}</span>
                    <span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  ["Feasibility", `${site.score}%`, scCol(site.score)],
                  ["Env Risk", site.ai.envRisk, envRiskColor],
                  ["Renewable", site.ai.renewable, renewCol],
                  ["Infra Complexity", site.ai.infraComplexity, infraCol],
                  ["Utility Readiness", `${site.ai.utilityReady}%`, scCol(site.ai.utilityReady)],
                  ["Timeline", site.ai.timeline, "#38bdf8"],
                  ["Sustainability", `${site.ai.sustainability}%`, scCol(site.ai.sustainability)],
                ].map(([k, v, c]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "3px 0",
                      borderBottom: `1px solid ${h2a("#8b5cf6", 0.1)}`,
                    }}
                  >
                    <span style={{ color: "#6a8aaa", fontSize: 9 }}>{k}</span>
                    <span style={{ color: c, fontSize: 9, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </>
            )}

            <div
              style={{
                padding: "6px 8px",
                background: h2a("#ef4444", 0.07),
                border: `1px solid ${h2a("#ef4444", 0.2)}`,
                borderRadius: 4,
                marginTop: 2,
              }}
            >
              <div style={{ color: "#ef4444", fontSize: 8, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>ROOT CAUSE</div>
              <div style={{ color: T.text, fontSize: 8.5, lineHeight: 1.5 }}>{ai.rootCause}</div>
            </div>

            <div style={{ padding: "6px 8px", background: h2a("#eab308", 0.06), border: `1px solid ${h2a("#eab308", 0.2)}`, borderRadius: 4 }}>
              <div style={{ color: "#eab308", fontSize: 8, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>PREDICTION</div>
              <div style={{ color: T.text, fontSize: 8.5, lineHeight: 1.5 }}>{ai.prediction}</div>
            </div>

            <div>
              <div style={{ color: zoneAI ? "#22c55e" : "#a855f7", fontSize: 8, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>
                {zoneAI ? "ZONE RECOMMENDATIONS" : "RECOMMENDATIONS"}
              </div>
              {ai.recs.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                  <div
                    style={{
                      minWidth: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: h2a(zoneAI ? "#22c55e" : "#8b5cf6", 0.2),
                      color: zoneAI ? "#22c55e" : "#a855f7",
                      fontSize: 8,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ color: T.text, fontSize: 8.5, lineHeight: 1.45 }}>{r}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "7px 9px", background: h2a("#38bdf8", 0.06), border: `1px solid ${h2a("#38bdf8", 0.15)}`, borderRadius: 4 }}>
              <div style={{ color: "#38bdf8", fontSize: 8, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>CAPEX ESTIMATE</div>
              <div
                style={{
                  color: "#38bdf8",
                  fontSize: 18,
                  fontWeight: 900,
                  fontFamily: "'Courier New',monospace",
                  textShadow: night ? "0 0 12px rgba(56,189,248,0.6)" : "none",
                }}
              >
                {ai.capex}
              </div>
              <div style={{ color: "#5a8aaa", fontSize: 8, marginTop: 1 }}>Construction timeline: {ai.timeline}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Bottom sparkline charts ─────────────────────────────────────────── */
function BottomCharts({ site, T, night }) {
  const CHART_DEFS = [
    { key: "solar", label: "Solar Generation", unit: "kWh/m²", col: D.amber },
    { key: "wind", label: "Wind Intensity", unit: "mph", col: D.cyan },
    { key: "water", label: "Water Demand", unit: "kL/day", col: D.blue },
    { key: "sustain", label: "Sustainability", unit: "%", col: D.teal },
    { key: "cost", label: "CAPEX Forecast", unit: "$M", col: D.violet },
  ];
  const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div style={{ display: "flex", gap: 7, paddingTop: 8, borderTop: `1px solid ${h2a(T.sky, 0.1)}` }}>
      {CHART_DEFS.map((cd) => {
        const vals = site.charts[cd.key] || [];
        const mn = Math.min(...vals),
          mx = Math.max(...vals);
        const CW = 100,
          CH = 38;
        const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * CW},${CH - ((v - mn) / (mx - mn || 1)) * (CH - 6) + 3}`).join(" ");
        const last = vals[vals.length - 1],
          prev = vals[vals.length - 2];
        const trend = last > prev ? "↑" : last < prev ? "↓" : "→";
        const lgId = `bcg_${cd.key}`;
        return (
          <div
            key={cd.key}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 6,
              background: night ? "rgba(5,12,28,0.88)" : "rgba(248,252,255,0.92)",
              border: `1px solid ${h2a(cd.col, 0.2)}`,
              borderTop: `3px solid ${cd.col}`,
              backdropFilter: "blur(4px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "baseline" }}>
              <span style={{ color: T.muted, fontSize: 9, letterSpacing: 0.5 }}>{cd.label}</span>
              <span style={{ color: cd.col, fontSize: 12, fontWeight: 900, fontFamily: "monospace" }}>
                {last}
                <span style={{ fontSize: 8 }}>{cd.unit}</span>
                <span style={{ fontSize: 10, marginLeft: 2 }}>{trend}</span>
              </span>
            </div>
            <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ height: 38, display: "block" }}>
              <defs>
                <linearGradient id={lgId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cd.col} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={cd.col} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,${CH} ${pts} ${CW},${CH}`} fill={`url(#${lgId})`} />
              <polyline
                points={pts}
                fill="none"
                stroke={cd.col}
                strokeWidth="1.5"
                strokeLinejoin="round"
                filter={night ? "url(#mapGlow3)" : undefined}
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 1 }}>
              {[0, 2, 5, 8, 11].map((i) => (
                <span key={i} style={{ color: T.muted, fontSize: 7 }}>
                  {MONTHS[i]}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export default function SimulationViewer2({ siteData, siteName, siteId = "tacoma" }) {
  /* Sync theme with body[data-theme] */
  const [night, setNight] = useState(() => document.body.getAttribute("data-theme") !== "light");
  useEffect(() => {
    const obs = new MutationObserver(() => setNight(document.body.getAttribute("data-theme") !== "light"));
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const { getParcelPolygon } = useSiteData();

  const T = night ? D : L;
  const siteKey = (siteId || "tacoma").toLowerCase();
  const site = SITES[siteKey] || SITES.tacoma;

  /* Prefer the uploaded boundary (GeoJSON polygon / DXF-derived), fall back to static ZONE_DEFS coords */
  const uploadedBoundary = getParcelPolygon(siteId) || null;

  const [selZone, setSelZone] = useState(null);
  const [mapDims, setMapDims] = useState({ W: 680, H: 420 });
  const mapRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 80) setMapDims({ W: Math.round(width), H: Math.round(Math.max(height, 320)) });
    });
    if (mapRef.current) obs.observe(mapRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    setSelZone(null);
  }, [siteId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: night
          ? "radial-gradient(ellipse at 20% 10%,#060f24 0%,#02060c 55%,#010407 100%)"
          : "radial-gradient(ellipse at 20% 10%,#cce0ff 0%,#e4f0ff 55%,#eef6ff 100%)",
        color: T.text,
        fontFamily: "'Segoe UI',sans-serif",
        transition: "background 0.5s,color 0.3s",
        borderRadius: 8,
        overflow: "hidden",
        padding: 12,
        border: `1px solid ${h2a(T.sky, 0.14)}`,
        minHeight: 0,
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: T.text, textTransform: "uppercase" }}>
            Site Feasibility &amp; Constraints
          </div>
          <div style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>
            Comprehensive feasibility assessment with risk and constraint mapping · {site.name}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            style={{
              padding: "3px 10px",
              borderRadius: 12,
              fontSize: 9,
              fontWeight: 700,
              background: night ? h2a("#8b5cf6", 0.14) : h2a("#7c3aed", 0.1),
              border: `1px solid ${night ? h2a("#8b5cf6", 0.4) : h2a("#7c3aed", 0.35)}`,
              color: night ? "#a855f7" : "#7c3aed",
            }}
          >
            {night ? "🌙 NIGHT MODE" : "☀ DAY MODE"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: h2a("#22c55e", 0.1),
              border: `1px solid ${h2a("#22c55e", 0.3)}`,
              borderRadius: 12,
              color: "#22c55e",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
                animation: "sfpulse 1.5s infinite",
              }}
            />
            LIVE ANALYSIS
          </div>
        </div>
      </div>

      {/* ── Main 3-col layout ── */}
      <div style={{ display: "flex", gap: 10, flex: 1, alignItems: "stretch", minHeight: 0 }}>
        <FeasibilityPanel site={site} T={T} night={night} selZone={selZone} siteKey={siteKey} />

        {/* Map */}
        <div
          ref={mapRef}
          style={{
            flex: 1,
            position: "relative",
            minWidth: 0,
            height: 500,

            borderRadius: 6,
            overflow: "hidden",
            border: `1px solid ${h2a(T.sky, 0.2)}`,
            boxShadow: night ? `0 0 30px ${h2a(D.sky, 0.07)},inset 0 0 40px rgba(0,0,0,0.3)` : "none",
          }}
        >
          <SiteMap siteKey={siteKey} night={night} W={mapDims.W} H={mapDims.H} selZone={selZone} setSelZone={setSelZone} T={T} boundaryOverride={uploadedBoundary} />
        </div>

        <AiPanel site={site} T={T} night={night} selZone={selZone} siteKey={siteKey} />
      </div>

      {/* ── Bottom charts ── */}
      <BottomCharts site={site} T={T} night={night} />

      <style>{`
        @keyframes sfpulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .sim2-zone-lbl { background:rgba(2,8,20,0.75)!important; border:none!important; border-radius:3px!important; color:rgba(255,255,255,0.8)!important; font-size:9px!important; font-family:'Courier New',monospace!important; font-weight:700!important; padding:2px 5px!important; white-space:nowrap; box-shadow:none!important; }
        .sim2-zone-lbl::before { display:none!important; }
        .sim2-zone-lbl.sel { color:#22d3ee!important; background:rgba(2,14,30,0.9)!important; }
        .sim2-zone-lbl:not(.night) { background:rgba(240,250,255,0.85)!important; color:rgba(5,20,60,0.85)!important; }
        .sim2-bldg-lbl { background:rgba(2,8,20,0.82)!important; border:none!important; border-radius:3px!important; color:rgba(200,235,255,0.95)!important; font-size:8.5px!important; font-family:'Courier New',monospace!important; font-weight:700!important; padding:2px 6px!important; box-shadow:none!important; }
        .sim2-bldg-lbl::before { display:none!important; }
        .sim2-bldg-lbl:not(.night) { background:rgba(5,20,60,0.8)!important; color:rgba(220,240,255,0.95)!important; }
      `}</style>
    </div>
  );
}
