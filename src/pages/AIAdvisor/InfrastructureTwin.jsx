/* =====================================================================
   InfrastructureTwin — 4-Campus Portfolio Masterplan on Satellite Map
   Tacoma: Aerospace · Everett: Logistics · Spokane: Innovation · Yakima: Energy
   ===================================================================== */
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSiteData } from "../../context/SiteDataContext.jsx";

const DARK = {
  bg: "#03080f",
  panel: "#060d1a",
  card: "#0a1525",
  border: "rgba(56,189,248,0.18)",
  text: "#cce8ff",
  muted: "#5a8aaa",
  sky: "#38bdf8",
  cyan: "#22d3ee",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  purple: "#a855f7",
  amber: "#eab308",
  green: "#22c55e",
  red: "#ef4444",
  teal: "#14b8a6",
};
const LIGHT = {
  bg: "#e8f4ff",
  panel: "#f2f8ff",
  card: "#ffffff",
  border: "rgba(30,100,200,0.18)",
  text: "#0d1e33",
  muted: "#4a6a88",
  sky: "#1a7fcf",
  cyan: "#0891b2",
  blue: "#1d4ed8",
  violet: "#7c3aed",
  purple: "#9333ea",
  amber: "#b45309",
  green: "#15803d",
  red: "#dc2626",
  teal: "#0f766e",
};

function rCol(pct, T) {
  return pct >= 80 ? T.green : pct >= 60 ? T.amber : T.red;
}
function hex2rgba(h, a) {
  if (!h || h[0] !== "#") return `rgba(56,189,248,${a})`;
  const r = parseInt(h.slice(1, 3), 16),
    g = parseInt(h.slice(3, 5), 16),
    b = parseInt(h.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Real site boundaries ──────────────────────────────────────────── */
const SITE_BOUNDARIES = {
  tacoma: [
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
  everett: [
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
  spokane: [
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
  yakima: [
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
  rnt001: [
    [47.4885, -122.2232],
    [47.488, -122.2112],
    [47.4838, -122.2098],
    [47.4775, -122.2108],
    [47.477, -122.2232],
    [47.4808, -122.2248],
  ],
  blm002: [
    [48.7582, -122.4858],
    [48.7576, -122.4716],
    [48.753, -122.4706],
    [48.7458, -122.4722],
    [48.7455, -122.4858],
    [48.7492, -122.4874],
  ],
};

/* ── Coordinate utilities ──────────────────────────────────────────── */
function svgToLatLon(x, y, boundary) {
  if (!boundary?.length) return [47.5, -120.5];
  const lats = boundary.map(([la]) => la),
    lons = boundary.map(([, lo]) => lo);
  const minLat = Math.min(...lats),
    maxLat = Math.max(...lats);
  const minLon = Math.min(...lons),
    maxLon = Math.max(...lons);
  const pad = 6,
    scale = 100 - pad * 2;
  return [maxLat - ((y - pad) / scale) * (maxLat - minLat), ((x - pad) / scale) * (maxLon - minLon) + minLon];
}
function pointInPolygon([lat, lon], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i],
      [yj, xj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function clampToBoundary(corners, boundary) {
  const cLat = corners.reduce((s, [la]) => s + la, 0) / corners.length;
  const cLon = corners.reduce((s, [, lo]) => s + lo, 0) / corners.length;
  let out = corners;
  for (let i = 0; i < 50; i++) {
    if (out.every((c) => pointInPolygon(c, boundary))) return out;
    out = out.map(([la, lo]) => [la + (cLat - la) * 0.14, lo + (cLon - lo) * 0.14]);
  }
  return out;
}

function buildingPolygon(b, boundary) {
  let corners;
  const s = b.shape;
  if (s === "pts") {
    corners = b.pts.map(([x, y]) => svgToLatLon(x, y, boundary));
  } else if (s === "hex") {
    const { cx, cy, r, ry = r * 0.75 } = b;
    corners = Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 - 30) * Math.PI) / 180;
      return svgToLatLon(cx + r * Math.cos(a), cy + ry * Math.sin(a), boundary);
    });
  } else if (s === "ushape") {
    const { x, y, w, h, courtW, courtH } = b;
    const cl = x + (w - courtW) / 2;
    corners = [
      svgToLatLon(x, y, boundary),
      svgToLatLon(x + w, y, boundary),
      svgToLatLon(x + w, y + h, boundary),
      svgToLatLon(cl + courtW, y + h, boundary),
      svgToLatLon(cl + courtW, y + h - courtH, boundary),
      svgToLatLon(cl, y + h - courtH, boundary),
      svgToLatLon(cl, y + h, boundary),
      svgToLatLon(x, y + h, boundary),
    ];
  } else if (s === "lshape") {
    const { x, y, w, h } = b;
    const { side = "br", nw, nh } = b.notch || {};
    if (side === "br")
      corners = [
        svgToLatLon(x, y, boundary),
        svgToLatLon(x + w, y, boundary),
        svgToLatLon(x + w, y + h - nh, boundary),
        svgToLatLon(x + w - nw, y + h - nh, boundary),
        svgToLatLon(x + w - nw, y + h, boundary),
        svgToLatLon(x, y + h, boundary),
      ];
    else if (side === "tr")
      corners = [
        svgToLatLon(x, y, boundary),
        svgToLatLon(x + w - nw, y, boundary),
        svgToLatLon(x + w - nw, y + nh, boundary),
        svgToLatLon(x + w, y + nh, boundary),
        svgToLatLon(x + w, y + h, boundary),
        svgToLatLon(x, y + h, boundary),
      ];
    else if (side === "bl")
      corners = [
        svgToLatLon(x, y, boundary),
        svgToLatLon(x + w, y, boundary),
        svgToLatLon(x + w, y + h, boundary),
        svgToLatLon(x + nw, y + h, boundary),
        svgToLatLon(x + nw, y + h - nh, boundary),
        svgToLatLon(x, y + h - nh, boundary),
      ];
    else
      corners = [
        svgToLatLon(x + nw, y, boundary),
        svgToLatLon(x + w, y, boundary),
        svgToLatLon(x + w, y + h, boundary),
        svgToLatLon(x, y + h, boundary),
        svgToLatLon(x, y + nh, boundary),
        svgToLatLon(x + nw, y + nh, boundary),
      ];
  } else {
    const { x, y, w, h } = b;
    corners = [svgToLatLon(x, y, boundary), svgToLatLon(x + w, y, boundary), svgToLatLon(x + w, y + h, boundary), svgToLatLon(x, y + h, boundary)];
  }
  return clampToBoundary(corners, boundary);
}

/* ── Layer system ──────────────────────────────────────────────────── */
const LAYER_TYPES = [
  { id: "all", label: "All Buildings", icon: "⬛" },
  { id: "assembly", label: "Assembly / Mfg", icon: "⚙" },
  { id: "logistics", label: "Logistics", icon: "🚚" },
  { id: "utility", label: "Utility / Energy", icon: "⚡" },
  { id: "office", label: "Corporate / R&D", icon: "🏛" },
  { id: "phase1", label: "Phase 1 Only", icon: "①" },
];
function isBuildingHighlighted(b, layer) {
  if (layer === "all") return true;
  if (layer === "phase1") return b.phase === 1;
  if (layer === "assembly") return ["assembly", "hangar", "mfg"].includes(b.type);
  if (layer === "logistics") return ["logistics", "rail", "freight", "yard", "storage"].includes(b.type);
  if (layer === "utility") return ["utility", "energy", "solar", "safety", "tech"].includes(b.type);
  if (layer === "office") return ["office", "training", "research", "security"].includes(b.type);
  return true;
}

/* ── MapAutoFit ────────────────────────────────────────────────────── */
function MapAutoFit({ boundary }) {
  const map = useMap();
  useEffect(() => {
    if (!boundary?.length) return;
    map.fitBounds(Leaflet.latLngBounds(boundary), { padding: [28, 28] });
  }, [boundary, map]);
  return null;
}

/* ══════════════════════════════════════════════════════════════════
   CAMPUS PLANS
   ══════════════════════════════════════════════════════════════════ */
const CAMPUS_PLANS = {
  /* ── TACOMA — Boeing Aerospace Manufacturing Campus ─────────── */
  tacoma: {
    type: "aerospace",
    name: "Boeing South Tacoma Aerospace Manufacturing Campus",
    subtitle: "605 ac · Port of Tacoma Terminal 7 · BNSF Mainline · PSE 115kV · SR-167",
    zones: [
      { id: "logistics", label: "LOGISTICS GATEWAY", x: 10, y: 8, w: 80, h: 12, color: "#6b7280" },
      { id: "engineering", label: "ENGINEERING CAMPUS", x: 10, y: 21, w: 80, h: 17, color: "#3b82f6" },
      { id: "mfg", label: "MANUFACTURING DISTRICT", x: 10, y: 39, w: 80, h: 17, color: "#38bdf8" },
      { id: "fab", label: "FINAL ASSEMBLY ZONE", x: 8, y: 57, w: 84, h: 13, color: "#22d3ee" },
      { id: "flighttest", label: "FLIGHT TEST & DELIVERY", x: 10, y: 71, w: 80, h: 11, color: "#8b5cf6" },
      { id: "utility", label: "UTILITY & SAFETY", x: 10, y: 83, w: 38, h: 9, color: "#eab308" },
      { id: "corporate", label: "CORPORATE CAMPUS", x: 52, y: 83, w: 38, h: 9, color: "#22c55e" },
    ],
    buildings: [
      {
        id: "sec_gate",
        label: "Security Gate Complex",
        sub: "Vehicle access · Guard post · Visitor screening",
        x: 43,
        y: 17,
        w: 14,
        h: 4,
        color: "#6b7280",
        type: "security",
        phase: 1,
        readiness: 95,
        capex: "$2.1M",
        why: "Midpoint between Logistics Gateway and Engineering Campus — first secure filter before any plant access.",
      },
      {
        id: "sup_log",
        label: "Supplier Logistics Ctr",
        sub: "JIT · 340k sqft · 42 dock doors · BNSF rail offload",
        x: 11,
        y: 9,
        w: 27,
        h: 9,
        color: "#64748b",
        type: "logistics",
        phase: 1,
        readiness: 88,
        capex: "$18M",
        why: "NW corner adjacent to BNSF mainline — minimises rail spur length and enables direct track-side offload.",
      },
      {
        id: "highbay",
        label: "High Bay Warehouse",
        sub: "28ft clear height · 180k sqft · Vertical AS/RS",
        x: 43,
        y: 9,
        w: 19,
        h: 9,
        color: "#64748b",
        type: "logistics",
        phase: 1,
        readiness: 86,
        capex: "$14M",
        why: "Central to inbound flow — receives from Supplier Logistics and feeds directly down to manufacturing zones.",
      },
      {
        id: "dist_ctr",
        label: "Distribution Center",
        sub: "Outbound · Cross-dock · 48 trailer bays",
        x: 67,
        y: 9,
        w: 22,
        h: 9,
        color: "#64748b",
        type: "logistics",
        phase: 2,
        readiness: 84,
        capex: "$11M",
        why: "East buffer separates outbound shipments from inbound rail traffic to prevent cross-flow congestion.",
      },
      {
        id: "eng_hq",
        label: "Engineering Center",
        sub: "Design · Stress · Systems · 1,200 engineers",
        shape: "ushape",
        x: 11,
        y: 22,
        w: 35,
        h: 13,
        courtW: 18,
        courtH: 5,
        color: "#3b82f6",
        type: "office",
        phase: 1,
        readiness: 91,
        capex: "$42M",
        why: "North of noisy manufacturing — U-shape courtyard creates a protected collaborative workspace for design teams.",
      },
      {
        id: "dt_cmd",
        label: "Digital Twin Command",
        sub: "Operations · AI Command · Fleet & production monitoring",
        shape: "hex",
        cx: 64,
        cy: 29,
        r: 7,
        ry: 5,
        color: "#818cf8",
        type: "tech",
        phase: 1,
        readiness: 88,
        capex: "$28M",
        why: "Geometric centre of Engineering Campus — equal fibre runs to all workstations; hexagonal form signals hub status.",
      },
      {
        id: "eng_labs",
        label: "Engineering Labs",
        sub: "Structural test · Simulation · Prototyping",
        x: 76,
        y: 22,
        w: 13,
        h: 13,
        color: "#6366f1",
        type: "tech",
        phase: 2,
        readiness: 85,
        capex: "$16M",
        why: "East wing isolates vibration-sensitive testing equipment from general foot traffic in the main engineering floors.",
      },
      {
        id: "fuselage",
        label: "Fuselage Manufacturing",
        sub: "CNC · Robotic drilling · 280k sqft · 3 bays",
        x: 11,
        y: 40,
        w: 35,
        h: 9,
        color: "#38bdf8",
        type: "assembly",
        phase: 1,
        readiness: 91,
        capex: "$32M",
        why: "N→S supply chain: raw aluminium arrives from BNSF at north, fuselage sections exit south directly into FAB.",
      },
      {
        id: "wing_mfg",
        label: "Wing Manufacturing",
        sub: "Wing box · Composite spar · 300k sqft",
        x: 51,
        y: 40,
        w: 38,
        h: 9,
        color: "#0891b2",
        type: "assembly",
        phase: 1,
        readiness: 89,
        capex: "$38M",
        why: "Adjacent to Fuselage Mfg for inline wing-body join — shared overhead crane runway eliminates inter-building transport.",
      },
      {
        id: "composite",
        label: "Composite Manufacturing",
        sub: "CFRP · Autoclave · Layup · Nacelles",
        shape: "lshape",
        x: 11,
        y: 50,
        w: 22,
        h: 6,
        notch: { side: "br", nw: 12, nh: 3 },
        color: "#0e7490",
        type: "assembly",
        phase: 2,
        readiness: 78,
        capex: "$24M",
        why: "SW corner — autoclave ovens require 50m setback from occupied buildings; exhaust path is unobstructed to the west.",
      },
      {
        id: "machine",
        label: "Machine Shop & NDT",
        sub: "Precision machining · Non-destructive testing",
        x: 37,
        y: 50,
        w: 14,
        h: 6,
        color: "#1e40af",
        type: "mfg",
        phase: 1,
        readiness: 87,
        capex: "$12M",
        why: "Midpoint between Composite Mfg and Wing Mfg — serves both production lines without cross-campus part transport.",
      },
      {
        id: "paintprep",
        label: "Paint Prep & Surface",
        sub: "Blasting · Priming · Corrosion protection",
        x: 55,
        y: 50,
        w: 14,
        h: 6,
        color: "#155e75",
        type: "mfg",
        phase: 2,
        readiness: 76,
        capex: "$9M",
        why: "Isolated from offices due to chemical overspray; directly above NDT Lab for a sequential surface→inspect flow.",
      },
      {
        id: "ndtlab",
        label: "NDT & Quality Lab",
        sub: "X-ray · Ultrasonic · Dimensional inspection",
        x: 73,
        y: 50,
        w: 14,
        h: 6,
        color: "#164e63",
        type: "tech",
        phase: 2,
        readiness: 74,
        capex: "$8M",
        why: "Adjacent to Paint Prep and Machine Shop — on-the-spot inspection eliminates inter-building part movements.",
      },
      {
        id: "fab_main",
        label: "FINAL ASSEMBLY BUILDING",
        sub: "6 bays · 1.2M sqft · 80ft clear height · Aircraft integration",
        x: 9,
        y: 58,
        w: 82,
        h: 11,
        color: "#22d3ee",
        type: "assembly",
        phase: 1,
        readiness: 93,
        capex: "$145M",
        isFAB: true,
        why: "Widest flat pad spans full campus width — N→S linear flow lets fuselage, wing, and systems join without backtracking.",
      },
      {
        id: "paint_hgr",
        label: "Paint Hangar",
        sub: "Full aircraft paint · 3 bays · Climate controlled",
        x: 11,
        y: 72,
        w: 23,
        h: 9,
        color: "#7c3aed",
        type: "hangar",
        phase: 2,
        readiness: 79,
        capex: "$22M",
        why: "Directly south of FAB — completed aircraft tow into paint without crossing any active roadway or taxiway.",
      },
      {
        id: "ft_hangar",
        label: "Flight Test Hangar",
        sub: "Pre-flight ground run · Engine test · Systems check",
        x: 38,
        y: 72,
        w: 26,
        h: 9,
        color: "#6d28d9",
        type: "hangar",
        phase: 2,
        readiness: 77,
        capex: "$28M",
        why: "East of Paint Hangar — paint → systems check → engine run is a single east-to-west sequence with no U-turns.",
      },
      {
        id: "delivery",
        label: "Delivery Center",
        sub: "Customer acceptance · Aircraft handover · Documentation",
        x: 68,
        y: 72,
        w: 21,
        h: 9,
        color: "#5b21b6",
        type: "office",
        phase: 2,
        readiness: 81,
        capex: "$15M",
        why: "SE corner at public road edge — customer-facing handover location fully separated from manufacturing traffic.",
      },
      {
        id: "apron",
        label: "Aircraft Apron & Taxiway",
        sub: "68 stands · Ground test area · Tow routes",
        x: 9,
        y: 82,
        w: 82,
        h: 3,
        color: "#4b5563",
        type: "yard",
        phase: 2,
        readiness: 81,
        capex: "$22M",
        why: "Full-width buffer between flight test zone and corporate area — prevents vehicles from crossing active taxiways.",
      },
      {
        id: "substation",
        label: "PSE 115kV Substation",
        sub: "115kV primary · 34.5kV distribution",
        x: 11,
        y: 84,
        w: 11,
        h: 7,
        color: "#ca8a04",
        type: "utility",
        phase: 1,
        readiness: 95,
        capex: "$8M",
        why: "SW corner — PacifiCorp HV line enters from south; placement minimises cable length across the entire site.",
      },
      {
        id: "datacenter",
        label: "Campus Data Center",
        sub: "Tier III · 2N redundancy · 4MW",
        x: 25,
        y: 84,
        w: 11,
        h: 7,
        color: "#d97706",
        type: "tech",
        phase: 1,
        readiness: 91,
        capex: "$12M",
        why: "Adjacent to substation — shortest HV cable run for the power-hungry compute cluster reduces losses and cost.",
      },
      {
        id: "fire_stn",
        label: "ARFF Fire Station",
        sub: "Aircraft rescue · CFR units · 24/7",
        x: 39,
        y: 84,
        w: 8,
        h: 7,
        color: "#b45309",
        type: "safety",
        phase: 1,
        readiness: 97,
        capex: "$4M",
        why: "Geometric centre of the entire campus — maximum 3-minute response radius to FAB, hangars, and fuel storage.",
      },
      {
        id: "corp_hq",
        label: "Corporate HQ",
        sub: "Executive · Admin · Client services",
        x: 53,
        y: 84,
        w: 14,
        h: 7,
        color: "#16a34a",
        type: "office",
        phase: 1,
        readiness: 88,
        capex: "$18M",
        why: "SE corner visible from SR-167 main approach — corporate presence at the campus front door for clients.",
      },
      {
        id: "training",
        label: "Training Academy",
        sub: "Workforce dev · Simulator bays · 800 capacity",
        x: 71,
        y: 84,
        w: 11,
        h: 7,
        color: "#15803d",
        type: "training",
        phase: 1,
        readiness: 85,
        capex: "$9M",
        why: "Adjacent to HQ — HR and management oversight co-located with the workforce development program.",
      },
      {
        id: "emp_svc",
        label: "Employee Services",
        sub: "Medical · Cafeteria · Fitness",
        x: 84,
        y: 84,
        w: 5,
        h: 7,
        color: "#166534",
        type: "office",
        phase: 2,
        readiness: 80,
        capex: "$6M",
        why: "Easternmost quiet corner — medical and cafeteria need low vibration; staff gate is directly adjacent.",
      },
    ],
    roads: [
      {
        type: "main",
        pts: [
          [50, 8],
          [50, 92],
        ],
        label: "Main Boulevard",
      },
      {
        type: "main",
        pts: [
          [10, 20],
          [90, 20],
        ],
        label: "North Access Road",
      },
      {
        type: "main",
        pts: [
          [10, 38],
          [90, 38],
        ],
        label: "Engineering Drive",
      },
      {
        type: "truck",
        pts: [
          [10, 56],
          [90, 56],
        ],
        label: "Manufacturing Truck Road",
      },
      {
        type: "main",
        pts: [
          [10, 70],
          [90, 70],
        ],
        label: "Assembly Drive",
      },
      {
        type: "main",
        pts: [
          [10, 83],
          [90, 83],
        ],
        label: "South Ring Road",
      },
      {
        type: "truck",
        pts: [
          [10, 20],
          [10, 56],
        ],
        label: "West Truck Corridor",
      },
      {
        type: "truck",
        pts: [
          [90, 20],
          [90, 56],
        ],
        label: "East Truck Corridor",
      },
      {
        type: "emergency",
        pts: [
          [11, 8],
          [11, 92],
        ],
        label: "West Emergency Corridor",
      },
      {
        type: "emergency",
        pts: [
          [89, 8],
          [89, 92],
        ],
        label: "East Emergency Corridor",
      },
      {
        type: "employee",
        pts: [
          [34, 38],
          [34, 20],
        ],
        label: "Engineering Access W",
      },
      {
        type: "employee",
        pts: [
          [66, 38],
          [66, 20],
        ],
        label: "Engineering Access E",
      },
    ],
    bayDividers: [
      {
        pts: [
          [36, 58],
          [36, 69],
        ],
      },
      {
        pts: [
          [63, 58],
          [63, 69],
        ],
      },
    ],
    gates: [
      { x: 50, y: 8, label: "Main Gate North", color: "#22c55e" },
      { x: 10, y: 38, label: "Truck Gate West", color: "#eab308" },
      { x: 90, y: 38, label: "Truck Gate East", color: "#eab308" },
      { x: 50, y: 92, label: "Employee Gate South", color: "#38bdf8" },
    ],
    aiSummary: {
      readiness: 88,
      confidence: 91,
      utilityCoord: 79,
      sustainability: 82,
      complexity: 68,
      engineeringValidation:
        "Phase 1 foundation is solid. PSE 115kV substation permitting on critical path — 6-week lead with Pierce County PUD. Stormwater permit must precede Phase 2 clearing. FAB structural RFQ not yet issued.",
      utilityConflicts: [
        "Pierce County stormwater permit blocks Phase 2 clearing (MEDIUM)",
        "BNSF rail spur coordination — 8-week lead time (MEDIUM)",
        "FAB structural engineer RFQ not yet issued (LOW)",
      ],
      capexOptimization:
        "Phase 1-2 utility trenching consolidation saves $420K. Composite Mfg shared autoclave with Wing Plant reduces capex $2.4M. Solar canopy on warehouses yields $180K/yr.",
      recommendations: [
        "Initiate Pierce County stormwater permit — 8-week critical path",
        "Issue FAB structural RFQ immediately — 12-week design lead",
        "Coordinate BNSF rail spur concurrent with site grading",
        "Bundle Phases 1-2 utility trenching for $420K savings",
      ],
    },
    kpis: { area: "605 ac", power: "PSE 115kV", workers: 4200, capex: "$473M", readiness: 88 },
  },

  /* ── EVERETT — Smart Industrial & Logistics Park ────────────── */
  everett: {
    type: "logistics",
    name: "Boeing Everett Smart Logistics & Distribution Park",
    subtitle: "420 ac · Port of Everett · BNSF Rail · SR-526 · Paine Field proximity",
    zones: [
      { id: "gateway", label: "TRUCK & RAIL GATEWAY", x: 25, y: 8, w: 50, h: 10, color: "#6b7280" },
      { id: "dist", label: "DISTRIBUTION DISTRICT", x: 10, y: 19, w: 80, h: 28, color: "#f97316" },
      { id: "freight", label: "FREIGHT YARD", x: 10, y: 48, w: 80, h: 19, color: "#ea580c" },
      { id: "fleet", label: "FLEET OPERATIONS", x: 10, y: 68, w: 80, h: 24, color: "#78716c" },
    ],
    buildings: [
      {
        id: "rail_term",
        label: "Rail Terminal",
        sub: "BNSF/Port of Everett · Rail offload · 4 sidings",
        x: 11,
        y: 9,
        w: 24,
        h: 8,
        color: "#7c3aed",
        type: "rail",
        phase: 1,
        readiness: 96,
        capex: "$6.8M",
        why: "NW corner — BNSF mainline enters from north-west; shortest rail spur minimises civil cost and grade risk.",
      },
      {
        id: "truck_gate",
        label: "Truck Gate Complex",
        sub: "Access control · Weigh station · 12 lanes",
        x: 41,
        y: 9,
        w: 18,
        h: 8,
        color: "#6b7280",
        type: "security",
        phase: 1,
        readiness: 95,
        capex: "$2.4M",
        why: "Central-north position — equal drive distance to both Distribution Centres A and B from SR-526.",
      },
      {
        id: "customs",
        label: "Customs & Inspection",
        sub: "CBP · Bonded warehouse · Import clearance",
        x: 65,
        y: 9,
        w: 24,
        h: 8,
        color: "#6b7280",
        type: "logistics",
        phase: 1,
        readiness: 88,
        capex: "$4.2M",
        why: "NE corner — international containers off Port of Everett waterfront arrive via the east access road.",
      },
      {
        id: "dist_a",
        label: "Distribution Center A",
        sub: "340k sqft · 42 dock doors · Pick & pack · Automated",
        x: 11,
        y: 20,
        w: 36,
        h: 12,
        color: "#f97316",
        type: "logistics",
        phase: 1,
        readiness: 91,
        capex: "$28M",
        why: "West half — receives directly from Rail Terminal; FIFO flow southward to cross-dock below.",
      },
      {
        id: "dist_b",
        label: "Distribution Center B",
        sub: "310k sqft · Belt conveyors · 38 dock doors",
        x: 53,
        y: 20,
        w: 35,
        h: 12,
        color: "#f97316",
        type: "logistics",
        phase: 1,
        readiness: 89,
        capex: "$26M",
        why: "East half — handles customs-cleared imports from NE Customs gate; keeps import and domestic streams separate.",
      },
      {
        id: "xdock_l",
        label: "Cross-Dock West",
        sub: "Inbound · Sortation · 24/7 · 20 doors",
        x: 11,
        y: 34,
        w: 20,
        h: 9,
        color: "#ea580c",
        type: "logistics",
        phase: 1,
        readiness: 87,
        capex: "$14M",
        why: "West inbound leg of H-shape — aligns with Distribution Centre A outbound doors for direct zero-handling transfer.",
      },
      {
        id: "xdock_c",
        label: "Cross-Dock Center Hub",
        sub: "Central sortation · Belt conveyors · Temp control",
        x: 35,
        y: 35,
        w: 28,
        h: 7,
        color: "#c2410c",
        type: "logistics",
        phase: 1,
        readiness: 87,
        capex: "$16M",
        why: "Centre hub of H-shape — east-west sortation belts between both wings eliminate all double-handling.",
      },
      {
        id: "xdock_r",
        label: "Cross-Dock East",
        sub: "Outbound · Trailer staging · 28 dock doors",
        x: 67,
        y: 34,
        w: 21,
        h: 9,
        color: "#ea580c",
        type: "logistics",
        phase: 1,
        readiness: 87,
        capex: "$14M",
        why: "East outbound leg — trailer staging connects directly to Truck Yard below for same-shift dispatch.",
      },
      {
        id: "cold_store",
        label: "Cold Storage Facility",
        sub: "-20°C · 80k sqft · Pharma-grade · Solar roof",
        x: 11,
        y: 44,
        w: 18,
        h: 4,
        color: "#0891b2",
        type: "storage",
        phase: 2,
        readiness: 78,
        capex: "$18M",
        why: "NW of cross-dock — cold chain distance from inbound dock to refrigerated storage is kept under 60m.",
      },
      {
        id: "parcel_hub",
        label: "Parcel & Courier Hub",
        sub: "Last-mile sortation · 32 van bays · Track & trace",
        x: 35,
        y: 44,
        w: 22,
        h: 4,
        color: "#0f766e",
        type: "logistics",
        phase: 2,
        readiness: 76,
        capex: "$11M",
        why: "Centre of cross-dock row — equal drive distance for last-mile vans dispatching east or west.",
      },
      {
        id: "rail_yard",
        label: "Rail Yard",
        sub: "4 classification tracks · 80-car capacity",
        x: 11,
        y: 49,
        w: 38,
        h: 14,
        color: "#7c3aed",
        type: "rail",
        phase: 1,
        readiness: 92,
        capex: "$12M",
        why: "SW — four classification tracks need a straight BNSF mainline run clear of at-grade road crossings.",
      },
      {
        id: "truck_yard",
        label: "Truck Yard",
        sub: "180 trailer slots · Drop & hook · Fuel island",
        x: 54,
        y: 49,
        w: 35,
        h: 14,
        color: "#78716c",
        type: "yard",
        phase: 1,
        readiness: 90,
        capex: "$8M",
        why: "East of Rail Yard — trailer and rail operations physically separated; both feed Freight Terminal above.",
      },
      {
        id: "frght_term",
        label: "Freight Terminal",
        sub: "Administration · Customs clearance · Rate desk",
        x: 11,
        y: 64,
        w: 78,
        h: 5,
        color: "#57534e",
        type: "office",
        phase: 1,
        readiness: 88,
        capex: "$6M",
        why: "Transition strip — administration sits between the freight yard it dispatches and the fleet operations it schedules.",
      },
      {
        id: "fleet_ops",
        label: "Fleet Operations Ctr",
        sub: "Dispatch · Route planning · Driver hub · 24/7",
        x: 11,
        y: 69,
        w: 29,
        h: 13,
        color: "#78716c",
        type: "office",
        phase: 1,
        readiness: 86,
        capex: "$14M",
        why: "SW of fleet zone — dispatch at origin point of truck routes, directly adjacent to the west exit gate.",
      },
      {
        id: "wms_dc",
        label: "WMS / Data Center",
        sub: "Warehouse mgmt · TMS · Track & trace · Tier III",
        x: 45,
        y: 69,
        w: 20,
        h: 13,
        color: "#0891b2",
        type: "tech",
        phase: 1,
        readiness: 91,
        capex: "$16M",
        why: "Centre of fleet zone — serves both distribution buildings and fleet operations with equal network latency.",
      },
      {
        id: "maint_fac",
        label: "Vehicle Maintenance",
        sub: "Truck shop · Lifting bays · Fleet service",
        x: 70,
        y: 69,
        w: 19,
        h: 13,
        color: "#57534e",
        type: "logistics",
        phase: 2,
        readiness: 78,
        capex: "$9M",
        why: "East end — heavy vehicle lifts need wide clearance and deep slab not suited to the main building footprint.",
      },
      {
        id: "emp_hub",
        label: "Employee Hub",
        sub: "Cafeteria · Rest areas · Lockers · Medical",
        x: 26,
        y: 83,
        w: 47,
        h: 7,
        color: "#65a30d",
        type: "office",
        phase: 1,
        readiness: 84,
        capex: "$7M",
        why: "South centre — equal walking distance for staff across all four surrounding operational zones.",
      },
    ],
    roads: [
      {
        type: "main",
        pts: [
          [50, 8],
          [50, 92],
        ],
        label: "Main Boulevard",
      },
      {
        type: "main",
        pts: [
          [10, 18],
          [90, 18],
        ],
        label: "Gateway Road",
      },
      {
        type: "main",
        pts: [
          [10, 48],
          [90, 48],
        ],
        label: "Distribution Access Road",
      },
      {
        type: "truck",
        pts: [
          [10, 68],
          [90, 68],
        ],
        label: "Freight Terminal Road",
      },
      {
        type: "main",
        pts: [
          [10, 82],
          [90, 82],
        ],
        label: "Fleet Operations Road",
      },
      {
        type: "truck",
        pts: [
          [10, 18],
          [10, 68],
        ],
        label: "West Truck Loop",
      },
      {
        type: "truck",
        pts: [
          [90, 18],
          [90, 68],
        ],
        label: "East Truck Loop",
      },
      {
        type: "rail",
        pts: [
          [11, 12],
          [11, 63],
        ],
        label: "Rail Mainline West",
      },
      {
        type: "rail",
        pts: [
          [11, 55],
          [48, 55],
        ],
        label: "Classification Tracks",
      },
      {
        type: "emergency",
        pts: [
          [89, 8],
          [89, 92],
        ],
        label: "East Emergency Corridor",
      },
      {
        type: "utility",
        pts: [
          [12, 68],
          [12, 92],
        ],
        label: "Utility Corridor",
      },
    ],
    gates: [
      { x: 20, y: 8, label: "Rail Gate", color: "#7c3aed" },
      { x: 50, y: 8, label: "Main Truck Gate", color: "#eab308" },
      { x: 78, y: 8, label: "Customs Gate", color: "#0891b2" },
      { x: 50, y: 92, label: "Fleet Exit South", color: "#22c55e" },
    ],
    aiSummary: {
      readiness: 89,
      confidence: 93,
      utilityCoord: 91,
      sustainability: 76,
      complexity: 55,
      engineeringValidation:
        "Optimal logistics infrastructure. BNSF rail + Port of Everett dual connectivity gives unmatched freight throughput. WMS/TMS platform integration is on critical path for Phase 2 automation.",
      utilityConflicts: [
        "Cold storage refrigerant selection required for permitting (MEDIUM)",
        "BNSF rail spur — 8-week coordination lead time (MEDIUM)",
        "WSDOT oversized load permit for freight terminal access (LOW)",
      ],
      capexOptimization:
        "Bundle Distribution Centers A & B procurement for $3.2M savings. Cold storage solar PV reduces energy 38%. Rail-truck transfer automation adds $4M capex, ROI in 4 years.",
      recommendations: [
        "Initiate BNSF rail spur design with Port of Everett immediately",
        "Issue WMS/TMS platform RFP — 16-week selection cycle",
        "Bundle DC A & DC B construction for $3.2M procurement savings",
        "Cold storage Phase 2 — refrigerant type decision needed for permitting",
      ],
    },
    kpis: { area: "420 ac", power: "PSE 115kV", workers: 1800, capex: "$253M", readiness: 89 },
  },

  /* ── SPOKANE — Technology & Innovation Campus ───────────────── */
  spokane: {
    type: "innovation",
    name: "Boeing Spokane Technology & Innovation Campus",
    subtitle: "280 ac · Avista 230kV · Spokane International Airport · I-90 · Spokane Valley",
    zones: [
      { id: "arrival", label: "VISITOR ARRIVAL", x: 30, y: 8, w: 40, h: 11, color: "#22c55e" },
      { id: "corporate", label: "CORPORATE DISTRICT", x: 10, y: 20, w: 80, h: 20, color: "#3b82f6" },
      { id: "innovation", label: "INNOVATION DISTRICT", x: 10, y: 41, w: 80, h: 22, color: "#818cf8" },
      { id: "academy", label: "ACADEMY DISTRICT", x: 10, y: 64, w: 80, h: 17, color: "#06b6d4" },
      { id: "support", label: "SUPPORT & SERVICES", x: 10, y: 82, w: 80, h: 10, color: "#78716c" },
    ],
    buildings: [
      {
        id: "welcome",
        label: "Welcome & Visitor Center",
        sub: "Reception · Security · Campus info · Tours",
        shape: "hex",
        cx: 65,
        cy: 13,
        r: 6,
        ry: 4.5,
        color: "#22c55e",
        type: "office",
        phase: 1,
        readiness: 93,
        capex: "$4.2M",
        why: "East of main entry — first building visible from Spokane Valley Hwy; hexagonal form is a distinctive landmark for wayfinding.",
      },
      {
        id: "vis_park",
        label: "Visitor Parking",
        sub: "320 spaces · EV charging · Covered entry",
        x: 11,
        y: 9,
        w: 29,
        h: 9,
        color: "#4ade80",
        type: "yard",
        phase: 1,
        readiness: 90,
        capex: "$2.8M",
        why: "West of entrance — visitor cars kept away from the corporate drop-off circle on the east side.",
      },
      {
        id: "hq_l",
        label: "HQ West Wing",
        sub: "Finance · Legal · HR · Executive floors",
        x: 11,
        y: 21,
        w: 18,
        h: 11,
        color: "#3b82f6",
        type: "office",
        phase: 1,
        readiness: 95,
        capex: "$22M",
        why: "West wing of H-shape — back-office functions (Finance, HR) kept away from the client-facing Central Tower entry.",
      },
      {
        id: "hq_conn_l",
        label: "HQ Connector (W)",
        sub: "Glass atrium walkway · Climate corridor",
        x: 29,
        y: 25,
        w: 5,
        h: 4,
        color: "#93c5fd",
        type: "office",
        phase: 1,
        readiness: 92,
        capex: "$1.2M",
        why: "Glass climate corridor enabling executive movement between West Wing and Central Tower in all weather.",
      },
      {
        id: "hq_c",
        label: "HQ Central Tower",
        sub: "C-Suite · Boardroom · Client hub · Reception",
        x: 34,
        y: 21,
        w: 32,
        h: 11,
        color: "#2563eb",
        type: "office",
        phase: 1,
        readiness: 95,
        capex: "$35M",
        why: "Centre of H-shape — maximum campus visibility from main drive; boardroom commands a panoramic east view.",
      },
      {
        id: "hq_conn_r",
        label: "HQ Connector (E)",
        sub: "Glass atrium walkway · Climate corridor",
        x: 66,
        y: 25,
        w: 5,
        h: 4,
        color: "#93c5fd",
        type: "office",
        phase: 1,
        readiness: 92,
        capex: "$1.2M",
        why: "Mirror of west connector — maintains symmetric H-form and provides a redundant executive circulation path.",
      },
      {
        id: "hq_r",
        label: "HQ East Wing",
        sub: "Strategy · Communications · Partnerships",
        x: 71,
        y: 21,
        w: 17,
        h: 11,
        color: "#3b82f6",
        type: "office",
        phase: 1,
        readiness: 95,
        capex: "$18M",
        why: "East wing — outward-facing strategy teams benefit from direct proximity to the Visitor Arrival zone.",
      },
      {
        id: "exec_suite",
        label: "Executive Suite",
        sub: "CEO · C-Suite offices · Private conference rooms",
        x: 37,
        y: 35,
        w: 26,
        h: 5,
        color: "#1d4ed8",
        type: "office",
        phase: 1,
        readiness: 91,
        capex: "$8M",
        why: "Directly south of Central Tower — secure vertical connection; kept separate from public reception floor.",
      },
      {
        id: "rnd_labs",
        label: "R&D Laboratories",
        sub: "Advanced research · Clean rooms · 200 researchers",
        shape: "lshape",
        x: 11,
        y: 42,
        w: 30,
        h: 12,
        notch: { side: "br", nw: 16, nh: 6 },
        color: "#818cf8",
        type: "research",
        phase: 1,
        readiness: 88,
        capex: "$34M",
        why: "West of Innovation District — L-shape courtyard faces east, maximising Spokane morning daylight in lab spaces.",
      },
      {
        id: "ai_center",
        label: "AI Operations Center",
        sub: "ML training · Inference · AI command · Digital twin",
        shape: "hex",
        cx: 63,
        cy: 48,
        r: 8,
        ry: 6,
        color: "#7c3aed",
        type: "tech",
        phase: 1,
        readiness: 85,
        capex: "$28M",
        why: "Geometric centre of Innovation District — equal fibre latency to all systems; hexagonal form signals data hub.",
      },
      {
        id: "dt_center",
        label: "Digital Twin Center",
        sub: "Simulation platform · IoT integration · Real-time",
        x: 75,
        y: 42,
        w: 14,
        h: 12,
        color: "#6d28d9",
        type: "tech",
        phase: 1,
        readiness: 83,
        capex: "$22M",
        why: "Adjacent to AI Centre — digital twin platform requires sub-1ms link to the AI compute cluster next door.",
      },
      {
        id: "innov_hub",
        label: "Innovation Hub",
        sub: "Startups · Incubator · Demo lab · Events",
        x: 11,
        y: 55,
        w: 20,
        h: 7,
        color: "#a78bfa",
        type: "research",
        phase: 2,
        readiness: 79,
        capex: "$11M",
        why: "West edge — startup incubator near public gate for easier partner and investor access without full campus clearance.",
      },
      {
        id: "sim_lab",
        label: "Simulation Lab",
        sub: "Physics sim · CFD · Structural · VR/AR cave",
        x: 35,
        y: 55,
        w: 20,
        h: 7,
        color: "#8b5cf6",
        type: "tech",
        phase: 2,
        readiness: 77,
        capex: "$14M",
        why: "Centre of Innovation District — positioned between R&D Labs and Prototyping for rapid design-test cycles.",
      },
      {
        id: "proto",
        label: "Prototyping Workshop",
        sub: "3D printing · CNC · Electronics lab · Fabrication",
        x: 59,
        y: 55,
        w: 17,
        h: 7,
        color: "#7c3aed",
        type: "research",
        phase: 2,
        readiness: 75,
        capex: "$8M",
        why: "East of Sim Lab — prototypes are immediately scanned and digitised at the adjacent Digital Twin Centre.",
      },
      {
        id: "train_acad",
        label: "Training Academy",
        sub: "Technical training · Simulators · 800 capacity",
        x: 11,
        y: 65,
        w: 35,
        h: 12,
        color: "#06b6d4",
        type: "training",
        phase: 1,
        readiness: 87,
        capex: "$18M",
        why: "West of Academy District — workforce enters from west staff gate; training is the first facility reached.",
      },
      {
        id: "conf_ctr",
        label: "Conference Center",
        sub: "Auditorium · Ballroom · 1,200 capacity · Catering",
        x: 51,
        y: 65,
        w: 37,
        h: 12,
        color: "#0891b2",
        type: "office",
        phase: 1,
        readiness: 85,
        capex: "$22M",
        why: "East of Training Academy — large auditorium needs truck load-in access from the east perimeter road.",
      },
      {
        id: "medical",
        label: "Medical Center",
        sub: "Occupational health · Wellness · Clinic",
        x: 11,
        y: 78,
        w: 17,
        h: 4,
        color: "#10b981",
        type: "office",
        phase: 1,
        readiness: 90,
        capex: "$5M",
        why: "West edge near staff entry — emergency response from west gate; proximate to the highest-density work areas.",
      },
      {
        id: "cafeteria",
        label: "Cafeteria & Dining",
        sub: "1,500 seat capacity · Multiple dining concepts",
        x: 32,
        y: 78,
        w: 22,
        h: 4,
        color: "#059669",
        type: "office",
        phase: 1,
        readiness: 88,
        capex: "$7M",
        why: "Centre of support zone — within 90-second walk for any of the 3,200 campus employees.",
      },
      {
        id: "fitness",
        label: "Fitness & Recreation",
        sub: "Gym · Pool · Sports courts · Wellness",
        x: 58,
        y: 78,
        w: 18,
        h: 4,
        color: "#10b981",
        type: "office",
        phase: 2,
        readiness: 79,
        capex: "$9M",
        why: "East of cafeteria — peak use at lunch and end-of-day; east orientation avoids afternoon western glare.",
      },
      {
        id: "childcare",
        label: "Childcare Center",
        sub: "50-child capacity · Licensed · Outdoor play area",
        x: 80,
        y: 78,
        w: 9,
        h: 4,
        color: "#34d399",
        type: "office",
        phase: 2,
        readiness: 76,
        capex: "$3.5M",
        why: "Far east quiet corner — separate drop-off lane feasible; minimal through-traffic exposure for children.",
      },
      {
        id: "data_ctr",
        label: "Campus Data Center",
        sub: "Tier III · HPC cluster · Avista green power · 6MW",
        x: 11,
        y: 83,
        w: 20,
        h: 7,
        color: "#0891b2",
        type: "tech",
        phase: 1,
        readiness: 92,
        capex: "$18M",
        why: "SW corner — Avista fibre enters from south; Spokane Valley cold climate cuts cooling energy cost by 34%.",
      },
      {
        id: "power_plt",
        label: "Campus Power Plant",
        sub: "3MW CHP · Solar tie-in · Avista grid backup",
        x: 35,
        y: 83,
        w: 16,
        h: 7,
        color: "#ca8a04",
        type: "utility",
        phase: 1,
        readiness: 94,
        capex: "$8M",
        why: "Centre of support zone — CHP heat distribution loops are balanced from the midpoint of the campus.",
      },
      {
        id: "sec_ops",
        label: "Security Operations",
        sub: "SOC · CCTV · Access management center",
        x: 55,
        y: 83,
        w: 16,
        h: 7,
        color: "#6b7280",
        type: "security",
        phase: 1,
        readiness: 96,
        capex: "$4M",
        why: "Between Data Centre and Parking Structure — monitors critical infrastructure and vehicle perimeter simultaneously.",
      },
      {
        id: "park_gar",
        label: "Parking Structure",
        sub: "1,200 spaces · EV charging · 6 levels",
        x: 75,
        y: 83,
        w: 13,
        h: 7,
        color: "#78716c",
        type: "yard",
        phase: 2,
        readiness: 80,
        capex: "$24M",
        why: "NE corner — employees commute via I-90 east interchange; parking at destination minimises internal drive distance.",
      },
    ],
    roads: [
      {
        type: "campus",
        pts: [
          [50, 8],
          [50, 92],
        ],
        label: "Main Campus Drive",
      },
      {
        type: "main",
        pts: [
          [10, 19],
          [90, 19],
        ],
        label: "North Arrival Road",
      },
      {
        type: "campus",
        pts: [
          [10, 40],
          [90, 40],
        ],
        label: "Corporate Boulevard",
      },
      {
        type: "campus",
        pts: [
          [10, 63],
          [90, 63],
        ],
        label: "Innovation Promenade",
      },
      {
        type: "campus",
        pts: [
          [10, 81],
          [90, 81],
        ],
        label: "Academy Drive",
      },
      {
        type: "employee",
        pts: [
          [11, 8],
          [11, 92],
        ],
        label: "West Campus Walk",
      },
      {
        type: "employee",
        pts: [
          [89, 8],
          [89, 92],
        ],
        label: "East Campus Walk",
      },
      {
        type: "employee",
        pts: [
          [30, 19],
          [30, 40],
        ],
        label: "West Corporate Access",
      },
      {
        type: "employee",
        pts: [
          [70, 19],
          [70, 40],
        ],
        label: "East Corporate Access",
      },
    ],
    gates: [
      { x: 50, y: 8, label: "Main Visitor Entrance", color: "#22c55e" },
      { x: 11, y: 50, label: "Staff Gate West", color: "#38bdf8" },
      { x: 89, y: 50, label: "Staff Gate East", color: "#38bdf8" },
      { x: 50, y: 92, label: "Service Gate South", color: "#6b7280" },
    ],
    aiSummary: {
      readiness: 90,
      confidence: 89,
      utilityCoord: 94,
      sustainability: 91,
      complexity: 52,
      engineeringValidation:
        "Highest utility coordination of all sites. Avista 230kV provides $0.042/kWh — best-in-class operating cost. AI Center HPC cooling load is the only outstanding MEP specification.",
      utilityConflicts: [
        "AI Center HPC cooling load specification pending (MEDIUM)",
        "Data center Tier III certification timeline — 14 months (LOW)",
        "Conference center A/V systems integration scope unclear (LOW)",
      ],
      capexOptimization:
        "Low power costs reduce operational CAPEX $1.2M/yr vs western WA. Phase 1 solar ROI at 6.8 years. $240K Avista incentive rebate available for energy efficiency.",
      recommendations: [
        "Finalize AI Center HPC cooling specification — blocks MEP design",
        "Leverage Avista incentive program for $240K efficiency rebates",
        "Pre-zone Phase 2 expansion area with Spokane County now",
        "Accelerate Training Academy permitting — 18-month construction lead",
      ],
    },
    kpis: { area: "280 ac", power: "Avista 230kV", workers: 3200, capex: "$336M", readiness: 90 },
  },

  /* ── YAKIMA — Utility & Energy Campus ──────────────────────── */
  yakima: {
    type: "energy",
    name: "Boeing Yakima Clean Energy & Utility Campus",
    subtitle: "320 ac · PacifiCorp 115kV · 8.4MW Solar · 160MWh BESS · Yakima Aquifer",
    zones: [
      { id: "solar", label: "SOLAR GENERATION ARRAY", x: 52, y: 8, w: 38, h: 52, color: "#eab308" },
      { id: "storage", label: "BATTERY ENERGY STORAGE", x: 10, y: 8, w: 40, h: 24, color: "#f97316" },
      { id: "utility", label: "UTILITY CORE", x: 10, y: 33, w: 40, h: 27, color: "#ca8a04" },
      { id: "ops", label: "OPERATIONS CENTER", x: 10, y: 61, w: 40, h: 18, color: "#0891b2" },
      { id: "water", label: "WATER & COOLING", x: 52, y: 61, w: 38, h: 18, color: "#06b6d4" },
      { id: "ev", label: "EV CHARGING HUB", x: 10, y: 80, w: 80, h: 12, color: "#22c55e" },
    ],
    buildings: [
      {
        id: "solar_ph1",
        label: "Solar Array Phase 1",
        sub: "4.2MW · 15,400 panels · Ground-mounted",
        x: 53,
        y: 9,
        w: 36,
        h: 24,
        color: "#fbbf24",
        type: "solar",
        phase: 1,
        readiness: 90,
        capex: "$14M",
        why: "East half unobstructed south-facing slope — maximum irradiance; proximity to inverter station minimises DC cable loss.",
      },
      {
        id: "solar_ph2",
        label: "Solar Array Phase 2",
        sub: "4.2MW · Phase 2 expansion · Total 8.4MW",
        x: 53,
        y: 34,
        w: 36,
        h: 24,
        color: "#f59e0b",
        type: "solar",
        phase: 2,
        readiness: 74,
        capex: "$14M",
        why: "Directly south of Phase 1 — same orientation and slope; shares combiner wiring and inverter bay.",
      },
      {
        id: "inverter",
        label: "Inverter Station",
        sub: "24× 350kW inverters · DC combiner boxes · Monitoring",
        x: 61,
        y: 58,
        w: 15,
        h: 5,
        color: "#d97706",
        type: "utility",
        phase: 1,
        readiness: 88,
        capex: "$3.2M",
        why: "SE corner of solar zone — shortest DC cable run from both Phase 1 and Phase 2 array strings combined.",
      },
      {
        id: "bess_a",
        label: "BESS Array A",
        sub: "80MWh · LiFePO4 · Tesla Megapack units",
        x: 11,
        y: 9,
        w: 38,
        h: 6,
        color: "#f97316",
        type: "storage",
        phase: 1,
        readiness: 85,
        capex: "$48M",
        why: "NW corner — maximum thermal separation from solar panels; nearest buildable pad to the grid substation.",
      },
      {
        id: "bess_b",
        label: "BESS Array B",
        sub: "80MWh · Phase 2 · Total 160MWh system",
        x: 11,
        y: 16,
        w: 38,
        h: 6,
        color: "#ea580c",
        type: "storage",
        phase: 2,
        readiness: 72,
        capex: "$48M",
        why: "South of BESS A — parallel battery string shares Battery Control Room hardware, reducing BMS cost by $1.1M.",
      },
      {
        id: "batt_ctrl",
        label: "Battery Control Room",
        sub: "BMS · SCADA · Thermal management · Fire suppression",
        x: 11,
        y: 23,
        w: 19,
        h: 8,
        color: "#c2410c",
        type: "utility",
        phase: 1,
        readiness: 87,
        capex: "$6.4M",
        why: "Between BESS arrays and substation — BMS fibre links to both battery banks remain under 10m.",
      },
      {
        id: "grid_hub",
        label: "Grid Interconnect Hub",
        sub: "POI · Revenue metering · Protection switchgear",
        x: 33,
        y: 23,
        w: 16,
        h: 8,
        color: "#b45309",
        type: "utility",
        phase: 1,
        readiness: 82,
        capex: "$8.2M",
        why: "Adjacent to Battery Control Room — Point-of-Interconnect metering at the generation-to-grid transition boundary.",
      },
      {
        id: "main_sub",
        label: "Main Substation",
        sub: "PacifiCorp 115kV · 34.5kV collection bus",
        constraint: "PacifiCorp interconnect study pending",
        x: 11,
        y: 34,
        w: 18,
        h: 11,
        color: "#ca8a04",
        type: "utility",
        phase: 1,
        readiness: 78,
        capex: "$5.2M",
        why: "PacifiCorp 115kV enters from south — southernmost buildable pad minimises HV transmission span across the site.",
      },
      {
        id: "backup_sub",
        label: "Backup Substation",
        sub: "Grid redundancy · Island mode ready · N-1",
        x: 33,
        y: 34,
        w: 14,
        h: 11,
        color: "#d97706",
        type: "utility",
        phase: 2,
        readiness: 70,
        capex: "$3.8M",
        why: "Adjacent to main substation — N-1 redundancy requires parallel equipment within the same switchyard footprint.",
      },
      {
        id: "backup_gen",
        label: "Backup Generators",
        sub: "4× 2MW diesel · Black-start · Emergency supply",
        x: 11,
        y: 47,
        w: 18,
        h: 10,
        color: "#b45309",
        type: "utility",
        phase: 1,
        readiness: 92,
        capex: "$4.4M",
        why: "West of substation — diesel tanks require 15m fire-safety setback from HV switchgear.",
      },
      {
        id: "trans_yard",
        label: "Transformer Yard",
        sub: "15× power transformers · HV switchyard · Grounding",
        x: 33,
        y: 47,
        w: 14,
        h: 10,
        color: "#92400e",
        type: "utility",
        phase: 1,
        readiness: 80,
        capex: "$6.8M",
        why: "Between generators and backup substation — transformer yard serves as common equipment for both feeds.",
      },
      {
        id: "ops_center",
        label: "Utility Operations Center",
        sub: "NOC · SCADA · Energy management · 24/7 ops",
        x: 11,
        y: 62,
        w: 22,
        h: 14,
        color: "#0891b2",
        type: "tech",
        phase: 1,
        readiness: 86,
        capex: "$12M",
        why: "SW of utility zone — operations staff maintain physical proximity to both substation controls and SCADA room.",
      },
      {
        id: "scada_noc",
        label: "SCADA / NOC",
        sub: "Grid monitoring · Microgrid control · AI analytics",
        x: 37,
        y: 62,
        w: 12,
        h: 8,
        color: "#0e7490",
        type: "tech",
        phase: 1,
        readiness: 88,
        capex: "$8M",
        why: "Adjacent to Ops Centre — SCADA co-location reduces mean-time-to-respond to grid events.",
      },
      {
        id: "sec_comms",
        label: "Security & Communications",
        sub: "Perimeter security · Fiber ring · Radio tower",
        x: 37,
        y: 71,
        w: 12,
        h: 5,
        color: "#164e63",
        type: "security",
        phase: 1,
        readiness: 94,
        capex: "$3M",
        why: "Between SCADA and water treatment — perimeter fibre ring runs this corridor; radio tower covers both site halves.",
      },
      {
        id: "water_trt",
        label: "Water Treatment Plant",
        sub: "1.2M gal/day · Industrial RO · WA water rights",
        x: 53,
        y: 62,
        w: 20,
        h: 11,
        color: "#06b6d4",
        type: "utility",
        phase: 1,
        readiness: 84,
        capex: "$9.6M",
        why: "East side — Yakima Aquifer wellheads are on the east; plant sited above the primary aquifer recharge zone.",
      },
      {
        id: "cooling",
        label: "Cooling Plant",
        sub: "Chiller loop · Dry coolers · Heat recovery",
        x: 53,
        y: 74,
        w: 20,
        h: 5,
        color: "#0891b2",
        type: "utility",
        phase: 2,
        readiness: 74,
        capex: "$4.8M",
        why: "South of water treatment — chiller loop fed by treated water; co-location eliminates a secondary pump station.",
      },
      {
        id: "retention",
        label: "Retention Pond",
        sub: "Stormwater mgmt · Environmental buffer · Irrigation",
        x: 76,
        y: 62,
        w: 12,
        h: 17,
        color: "#22d3ee",
        type: "yard",
        phase: 1,
        readiness: 88,
        capex: "$1.8M",
        why: "Far SE — stormwater flows east-to-west across the graded site; pond sits at the lowest topographic point.",
      },
      {
        id: "ev_a",
        label: "EV Charging Bay A",
        sub: "24× 150kW DC fast charge · Fleet trucks · 24/7",
        x: 11,
        y: 81,
        w: 14,
        h: 9,
        color: "#22c55e",
        type: "energy",
        phase: 1,
        readiness: 82,
        capex: "$3.6M",
        why: "West of EV zone — fleet trucks exit via west gate; fast chargers positioned on the return path, not departure.",
      },
      {
        id: "ev_b",
        label: "EV Charging Bay B",
        sub: "24× 150kW DC fast charge · Fleet trucks",
        x: 28,
        y: 81,
        w: 14,
        h: 9,
        color: "#16a34a",
        type: "energy",
        phase: 2,
        readiness: 74,
        capex: "$3.6M",
        why: "Adjacent to EV A — parallel DC string shares the same transformer vault, avoiding a second civil trench.",
      },
      {
        id: "ev_c",
        label: "EV Charging Bay C",
        sub: "24× 50kW AC · Staff vehicles · Smart metering",
        x: 45,
        y: 81,
        w: 13,
        h: 9,
        color: "#15803d",
        type: "energy",
        phase: 2,
        readiness: 72,
        capex: "$2.4M",
        why: "Centre-east — staff EVs arrive from east entrance; AC charging placed at the point of arrival.",
      },
      {
        id: "fleet_mnt",
        label: "Fleet Maintenance Bay",
        sub: "EV service · Battery diagnostics · Workshop",
        x: 61,
        y: 81,
        w: 14,
        h: 9,
        color: "#78716c",
        type: "logistics",
        phase: 2,
        readiness: 76,
        capex: "$4.2M",
        why: "East of EV C — maintenance bays provide direct drive-in access from every adjacent charging row.",
      },
      {
        id: "staff_park",
        label: "Staff Parking",
        sub: "200 spaces · EV charging · Tree-shaded canopy",
        x: 77,
        y: 81,
        w: 12,
        h: 9,
        color: "#4ade80",
        type: "yard",
        phase: 1,
        readiness: 85,
        capex: "$1.8M",
        why: "Far east — staff entering from east access road park at destination before any site penetration.",
      },
    ],
    roads: [
      {
        type: "main",
        pts: [
          [50, 8],
          [50, 80],
        ],
        label: "Main Access Road",
      },
      {
        type: "main",
        pts: [
          [10, 8],
          [90, 8],
        ],
        label: "North Perimeter Road",
      },
      {
        type: "utility",
        pts: [
          [52, 8],
          [52, 80],
        ],
        label: "Solar Service Road",
      },
      {
        type: "utility",
        pts: [
          [10, 32],
          [50, 32],
        ],
        label: "BESS Access Road",
      },
      {
        type: "utility",
        pts: [
          [10, 60],
          [50, 60],
        ],
        label: "Utility Core Road",
      },
      {
        type: "main",
        pts: [
          [10, 80],
          [90, 80],
        ],
        label: "EV Charging Access",
      },
      {
        type: "emergency",
        pts: [
          [11, 8],
          [11, 92],
        ],
        label: "West Emergency Corridor",
      },
      {
        type: "emergency",
        pts: [
          [89, 8],
          [89, 80],
        ],
        label: "East Emergency Corridor",
      },
    ],
    gates: [
      { x: 50, y: 8, label: "Main Entry Gate", color: "#22c55e" },
      { x: 10, y: 45, label: "Utility Access W", color: "#eab308" },
      { x: 52, y: 8, label: "Solar Service Gate", color: "#fbbf24" },
      { x: 50, y: 92, label: "EV Hub Gate S", color: "#22c55e" },
    ],
    aiSummary: {
      readiness: 82,
      confidence: 87,
      utilityCoord: 78,
      sustainability: 96,
      complexity: 64,
      engineeringValidation:
        "Best-in-class sustainability profile. PacifiCorp 115kV interconnect study is on critical path — 6-month lead. BESS thermal management spec must be finalized before procurement.",
      utilityConflicts: [
        "PacifiCorp interconnect study — 6-month critical path (HIGH)",
        "WA Dept of Ecology water rights amendment for expansion (MEDIUM)",
        "BESS thermal management specification not finalized (MEDIUM)",
      ],
      capexOptimization:
        "8.4MW solar covers 140% of campus load — net exporter. BESS arbitrage generates $1.8M/yr revenue. EV charging revenue $420K/yr. Phase 2 solar ROI at 8.4 years.",
      recommendations: [
        "Immediately initiate PacifiCorp interconnect study — 6-month lead",
        "Finalize BESS thermal management spec before Megapack procurement",
        "File WA water rights amendment for Phase 2 water treatment",
        "Engage Yakima County for Phase 3 solar expansion pre-zoning",
      ],
    },
    kpis: { area: "320 ac", power: "PacifiCorp 115kV", workers: 420, capex: "$211M", readiness: 82 },
  },

  /* ── RENTON — EV Manufacturing Campus ──────────────────────── */
  rnt001: {
    type: "ev_manufacturing",
    name: "Renton Advanced EV Manufacturing Campus",
    subtitle: "285 ac · PSE 115kV · BNSF East Valley Connector · SR-167 · Cedar River",
    zones: [
      { id: "logistics", label: "LOGISTICS GATEWAY", x: 10, y: 8, w: 80, h: 11, color: "#6b7280" },
      { id: "battery", label: "BATTERY MANUFACTURING", x: 10, y: 20, w: 80, h: 18, color: "#3b82f6" },
      { id: "assembly", label: "EV ASSEMBLY DISTRICT", x: 10, y: 39, w: 80, h: 17, color: "#38bdf8" },
      { id: "drivetrain", label: "DRIVETRAIN & POWERTRAIN", x: 8, y: 57, w: 84, h: 13, color: "#22d3ee" },
      { id: "rnd", label: "R&D & ENGINEERING", x: 10, y: 71, w: 80, h: 11, color: "#8b5cf6" },
      { id: "utility", label: "UTILITY & SUSTAINABILITY", x: 10, y: 83, w: 80, h: 9, color: "#eab308" },
    ],
    buildings: [
      {
        id: "rail_gate",
        label: "Rail & Truck Gateway",
        sub: "BNSF offload · 6 rail sidings · Truck gate · 8 lanes",
        x: 13,
        y: 9,
        w: 25,
        h: 8,
        color: "#7c3aed",
        type: "rail",
        phase: 1,
        readiness: 94,
        capex: "$5.8M",
        why: "NW corner — BNSF East Valley connector enters from north-west; shortest rail spur minimises civil cost and grade risk.",
      },
      {
        id: "receiving",
        label: "Receiving & Inspection",
        sub: "QC · Incoming inspection · 380k sqft",
        x: 43,
        y: 9,
        w: 20,
        h: 8,
        color: "#64748b",
        type: "logistics",
        phase: 1,
        readiness: 90,
        capex: "$16M",
        why: "Central — equal distance from rail and truck gates, feeds directly into battery manufacturing below.",
      },
      {
        id: "warehouse",
        label: "Component Warehouse",
        sub: "JIT storage · 280k sqft · 38 dock doors",
        x: 68,
        y: 9,
        w: 20,
        h: 8,
        color: "#64748b",
        type: "logistics",
        phase: 1,
        readiness: 88,
        capex: "$13M",
        why: "East buffer — separates outbound vehicles from inbound component flow to prevent cross-traffic.",
      },
      {
        id: "cell_mfg",
        label: "Battery Cell Manufacturing",
        sub: "Cell formation · Electrolyte fill · 320k sqft",
        x: 11,
        y: 21,
        w: 32,
        h: 14,
        color: "#3b82f6",
        type: "assembly",
        phase: 1,
        readiness: 92,
        capex: "$48M",
        why: "NW — cell formation requires humidity <1% RH; isolated dry-room with N₂ purge, furthest from Cedar River moisture source.",
      },
      {
        id: "module",
        label: "Module & Pack Assembly",
        sub: "Module stacking · Pack integration · 280k sqft",
        x: 48,
        y: 21,
        w: 30,
        h: 14,
        color: "#2563eb",
        type: "assembly",
        phase: 1,
        readiness: 90,
        capex: "$35M",
        why: "Adjacent to cell manufacturing — inline N→S flow: cell → module → pack eliminates cross-campus battery transport.",
      },
      {
        id: "bms_lab",
        label: "BMS & Electronics Lab",
        sub: "BMS design · Test · Validation · Clean room",
        shape: "hex",
        cx: 85,
        cy: 29,
        r: 5,
        ry: 3.8,
        color: "#818cf8",
        type: "tech",
        phase: 1,
        readiness: 86,
        capex: "$22M",
        why: "East of module assembly — BMS validation tests the packs produced immediately next door, minimising vibration risk.",
      },
      {
        id: "press_shop",
        label: "Stamping & Press Shop",
        sub: "Body panels · Structural stampings · 240k sqft",
        x: 11,
        y: 40,
        w: 30,
        h: 9,
        color: "#38bdf8",
        type: "mfg",
        phase: 1,
        readiness: 88,
        capex: "$28M",
        why: "West — stamping presses require isolated foundation against vibration; cedar River NW dampens press-induced groundwave.",
      },
      {
        id: "paint",
        label: "Paint & Surface Treatment",
        sub: "E-coat · Primer · Topcoat · 3 booths",
        x: 46,
        y: 40,
        w: 28,
        h: 9,
        color: "#0891b2",
        type: "mfg",
        phase: 1,
        readiness: 86,
        capex: "$32M",
        why: "Centre — paint booths need cross-ventilation; central position enables equal duct run length to all exhaust stacks.",
      },
      {
        id: "final_assy",
        label: "FINAL EV ASSEMBLY LINE",
        sub: "4 lines · 160k units/yr · 1.1M sqft · Automated",
        x: 9,
        y: 50,
        w: 82,
        h: 9,
        color: "#22d3ee",
        type: "assembly",
        phase: 1,
        readiness: 95,
        capex: "$124M",
        isFAB: true,
        why: "Full campus width — N→S supply chain: body → paint → assembly → test without backtracking; AGV lane runs full length.",
      },
      {
        id: "drivetrain_b",
        label: "Drivetrain Manufacturing",
        sub: "Motor · Reducer · Axle assembly · 220k sqft",
        x: 11,
        y: 59,
        w: 34,
        h: 9,
        color: "#0e7490",
        type: "assembly",
        phase: 1,
        readiness: 91,
        capex: "$30M",
        why: "SW — motor and axle assembly generates high vibration; positioned at S perimeter, away from precision BMS labs.",
      },
      {
        id: "powertrain",
        label: "Powertrain Integration",
        sub: "Motor-inverter-reducer integration · Test cells",
        x: 50,
        y: 59,
        w: 30,
        h: 9,
        color: "#155e75",
        type: "mfg",
        phase: 1,
        readiness: 89,
        capex: "$24M",
        why: "Adjacent to drivetrain mfg — inline integration eliminates inter-building assembly cart transport.",
      },
      {
        id: "vehi_test",
        label: "Vehicle Test Track",
        sub: "Dynamometer · Safety test · PDI · 40 bays",
        x: 11,
        y: 69,
        w: 21,
        h: 10,
        color: "#7c3aed",
        type: "hangar",
        phase: 2,
        readiness: 80,
        capex: "$18M",
        why: "SW corner — test track access gate at Cedar River boundary separates test traffic from production vehicle flow.",
      },
      {
        id: "delivery_ctr",
        label: "Delivery Center",
        sub: "PDI · Fleet handover · Customer delivery · 60 bays",
        x: 37,
        y: 69,
        w: 23,
        h: 10,
        color: "#6d28d9",
        type: "office",
        phase: 2,
        readiness: 78,
        capex: "$12M",
        why: "South centre — customer delivery at S boundary separates visitor traffic from manufacturing operations.",
      },
      {
        id: "rnd_center",
        label: "R&D Center",
        sub: "EV platform R&D · AI integration · 400 engineers",
        x: 65,
        y: 69,
        w: 23,
        h: 10,
        color: "#5b21b6",
        type: "research",
        phase: 1,
        readiness: 84,
        capex: "$28M",
        why: "SE corner quiet zone — R&D needs vibration isolation from press shop; quietest location in campus.",
      },
      {
        id: "substation",
        label: "PSE 115kV Substation",
        sub: "115kV primary · 34.5kV distribution",
        x: 11,
        y: 84,
        w: 12,
        h: 7,
        color: "#ca8a04",
        type: "utility",
        phase: 1,
        readiness: 96,
        capex: "$8.2M",
        why: "SW corner — PSE Grady Way line enters from south; southernmost pad minimises HV cable span across site.",
      },
      {
        id: "bess",
        label: "Battery Energy Storage",
        sub: "80MWh BESS · Grid arbitrage · Peak shaving",
        x: 26,
        y: 84,
        w: 14,
        h: 7,
        color: "#d97706",
        type: "energy",
        phase: 1,
        readiness: 88,
        capex: "$32M",
        why: "Adjacent to substation — co-location with site BESS reduces interconnect cable cost $1.4M.",
      },
      {
        id: "solar_cp",
        label: "Solar Carport Array",
        sub: "1.1MW · 320 EV-ready spaces · Smart charging",
        x: 44,
        y: 84,
        w: 14,
        h: 7,
        color: "#b45309",
        type: "solar",
        phase: 1,
        readiness: 90,
        capex: "$3.6M",
        why: "Centre of support zone — equal shade distance for all employee parking stalls; DC coupling to adjacent BESS.",
      },
      {
        id: "datacenter",
        label: "Campus Data Center",
        sub: "Tier III · 3MW · AI/ML training cluster",
        x: 62,
        y: 84,
        w: 12,
        h: 7,
        color: "#92400e",
        type: "tech",
        phase: 1,
        readiness: 88,
        capex: "$14M",
        why: "Adjacent to substation — shortest HV cable run for AI compute cluster reduces losses and cost.",
      },
      {
        id: "emp_svc",
        label: "Employee Services Hub",
        sub: "Medical · Cafeteria · Fitness · 2,400 capacity",
        x: 77,
        y: 84,
        w: 11,
        h: 7,
        color: "#166534",
        type: "office",
        phase: 1,
        readiness: 86,
        capex: "$8M",
        why: "SE corner — near employee gate and R&D center; cafeteria peak load at shift change not impeding production.",
      },
    ],
    roads: [
      {
        type: "main",
        pts: [
          [50, 8],
          [50, 92],
        ],
        label: "Main Campus Drive",
      },
      {
        type: "main",
        pts: [
          [10, 19],
          [90, 19],
        ],
        label: "North Logistics Road",
      },
      {
        type: "main",
        pts: [
          [10, 38],
          [90, 38],
        ],
        label: "Battery Manufacturing Drive",
      },
      {
        type: "truck",
        pts: [
          [10, 49],
          [90, 49],
        ],
        label: "Assembly Truck Road",
      },
      {
        type: "main",
        pts: [
          [10, 68],
          [90, 68],
        ],
        label: "R&D & Test Drive",
      },
      {
        type: "main",
        pts: [
          [10, 83],
          [90, 83],
        ],
        label: "Utility Ring Road",
      },
      {
        type: "truck",
        pts: [
          [10, 19],
          [10, 49],
        ],
        label: "West Truck Corridor",
      },
      {
        type: "truck",
        pts: [
          [90, 19],
          [90, 49],
        ],
        label: "East Truck Corridor",
      },
      {
        type: "emergency",
        pts: [
          [11, 8],
          [11, 92],
        ],
        label: "West Emergency Corridor",
      },
      {
        type: "emergency",
        pts: [
          [89, 8],
          [89, 92],
        ],
        label: "East Emergency Corridor",
      },
      {
        type: "employee",
        pts: [
          [35, 38],
          [35, 19],
        ],
        label: "Battery Mfg Access W",
      },
      {
        type: "employee",
        pts: [
          [65, 38],
          [65, 19],
        ],
        label: "Battery Mfg Access E",
      },
      {
        type: "rail",
        pts: [
          [13, 8],
          [13, 38],
        ],
        label: "BNSF Rail Spur",
      },
    ],
    gates: [
      { x: 50, y: 8, label: "Main Gate North", color: "#22c55e" },
      { x: 13, y: 8, label: "BNSF Rail Gate", color: "#7c3aed" },
      { x: 10, y: 49, label: "Truck Gate West", color: "#eab308" },
      { x: 90, y: 49, label: "Truck Gate East", color: "#eab308" },
      { x: 50, y: 92, label: "Employee Gate South", color: "#38bdf8" },
    ],
    aiSummary: {
      readiness: 90,
      confidence: 92,
      utilityCoord: 86,
      sustainability: 84,
      complexity: 62,
      engineeringValidation:
        "Phase 1 foundation is solid. PSE 115kV permitting on critical path — 8-week lead with PSE large power group. BNSF Industrial Track Agreement not yet initiated. Cell manufacturing dry-room HVAC specification must be finalized before MEP RFQ.",
      utilityConflicts: [
        "PSE 115kV large power agreement — 8-week critical path lead (MEDIUM)",
        "BNSF East Valley Rd ITA not yet initiated — 12-week lead (MEDIUM)",
        "Cell manufacturing dry-room HVAC spec not finalized (LOW)",
      ],
      capexOptimization:
        "Phase 1-2 utility trench consolidation saves $380K. Solar carport on employee parking yields $160K/yr. BESS peak shaving generates $220K/yr via PSE demand charge management.",
      recommendations: [
        "Initiate PSE 115kV large power agreement — 8-week critical path",
        "File BNSF Industrial Track Agreement — 12-week lead time before construction",
        "Finalize cell manufacturing dry-room HVAC spec — blocks MEP design",
        "Apply for WA Clean Energy Fund EV manufacturing grant — up to $8M available",
      ],
    },
    kpis: { area: "285 ac", power: "PSE 115kV", workers: 3800, capex: "$473M", readiness: 90 },
  },

  /* ── BELLINGHAM — Aerospace Hub ─────────────────────────────── */
  blm002: {
    type: "aerospace",
    name: "Bellingham Aerospace Manufacturing Hub",
    subtitle: "380 ac · PSE 115kV · BNSF Rail · KBLI Airport Apron · I-5 / SR-539",
    zones: [
      { id: "gateway", label: "TRUCK & RAIL GATEWAY", x: 25, y: 8, w: 50, h: 10, color: "#6b7280" },
      { id: "component", label: "COMPONENT MANUFACTURING", x: 10, y: 19, w: 80, h: 18, color: "#3b82f6" },
      { id: "assembly", label: "AEROSPACE ASSEMBLY", x: 10, y: 38, w: 80, h: 19, color: "#38bdf8" },
      { id: "flighttest", label: "FLIGHT TEST & DELIVERY", x: 8, y: 58, w: 84, h: 12, color: "#8b5cf6" },
      { id: "engineering", label: "ENGINEERING & R&D", x: 10, y: 71, w: 80, h: 11, color: "#22d3ee" },
      { id: "utility", label: "UTILITY & SUPPORT", x: 10, y: 83, w: 80, h: 9, color: "#eab308" },
    ],
    buildings: [
      {
        id: "rail_term",
        label: "Rail Terminal",
        sub: "BNSF · 4 sidings · Rail offload · Port linkage",
        x: 11,
        y: 9,
        w: 22,
        h: 8,
        color: "#7c3aed",
        type: "rail",
        phase: 1,
        readiness: 94,
        capex: "$6.4M",
        why: "NW corner — BNSF Bellingham Yard spur enters from south-west; shortest rail spur minimises civil cost.",
      },
      {
        id: "truck_gate",
        label: "Truck Gate Complex",
        sub: "Access control · Weigh station · 10 lanes",
        x: 40,
        y: 9,
        w: 18,
        h: 8,
        color: "#6b7280",
        type: "security",
        phase: 1,
        readiness: 95,
        capex: "$2.2M",
        why: "Central-north — equal drive distance from SR-539 and Airport Dr to both component plants.",
      },
      {
        id: "air_log",
        label: "Airport Logistics Hub",
        sub: "KBLI airside · Direct delivery · Bond store",
        x: 64,
        y: 9,
        w: 24,
        h: 8,
        color: "#0891b2",
        type: "logistics",
        phase: 1,
        readiness: 90,
        capex: "$5.8M",
        why: "NE corner — KBLI apron adjacent; airside delivery without public road transit reduces component handling damage 40%.",
      },
      {
        id: "fuselage",
        label: "Fuselage Manufacturing",
        sub: "CNC · Robotic drilling · 280k sqft · 3 bays",
        x: 11,
        y: 20,
        w: 34,
        h: 14,
        color: "#3b82f6",
        type: "assembly",
        phase: 1,
        readiness: 91,
        capex: "$34M",
        why: "West — raw aluminium arrives from BNSF at north; fuselage sections exit south into assembly bays.",
      },
      {
        id: "composite",
        label: "Composite Manufacturing",
        sub: "CFRP · Autoclave · Layup · Wing skins · 260k sqft",
        x: 50,
        y: 20,
        w: 38,
        h: 14,
        color: "#0891b2",
        type: "assembly",
        phase: 1,
        readiness: 89,
        capex: "$38M",
        why: "East — autoclave ovens require 50m setback from occupied buildings; BPA buffer NE provides safe exhaust path.",
      },
      {
        id: "precision",
        label: "Precision Machine Shop",
        sub: "5-axis CNC · NDT · Jig & fixture · 180k sqft",
        x: 11,
        y: 35,
        w: 20,
        h: 5,
        color: "#2563eb",
        type: "mfg",
        phase: 1,
        readiness: 87,
        capex: "$14M",
        why: "Transition strip between component and assembly — parts move directly from machining to assembly.",
      },
      {
        id: "ndt_lab",
        label: "NDT & Quality Lab",
        sub: "X-ray · Ultrasonic · CMM · Dimensional",
        x: 36,
        y: 35,
        w: 16,
        h: 5,
        color: "#1d4ed8",
        type: "tech",
        phase: 2,
        readiness: 84,
        capex: "$10M",
        why: "Centre between fuselage and composite plants — single inspection lab serves both production lines.",
      },
      {
        id: "major_assy",
        label: "MAJOR ASSEMBLY BUILDING",
        sub: "4 bays · 1.0M sqft · 75ft clear height · Jig assembly",
        x: 9,
        y: 39,
        w: 82,
        h: 11,
        color: "#22d3ee",
        type: "assembly",
        phase: 1,
        readiness: 94,
        capex: "$138M",
        isFAB: true,
        why: "Full campus width — N→S: fuselage + composite join in central bays; wing-body join at S bays; linear flow.",
      },
      {
        id: "paint_hgr",
        label: "Paint Hangar",
        sub: "Full aircraft paint · 2 bays · Climate controlled",
        x: 11,
        y: 51,
        w: 22,
        h: 9,
        color: "#7c3aed",
        type: "hangar",
        phase: 2,
        readiness: 78,
        capex: "$20M",
        why: "Directly south of Major Assembly — completed aircraft tow into paint without crossing any road or taxiway.",
      },
      {
        id: "ft_hangar",
        label: "Flight Test Hangar",
        sub: "Engine test · Systems check · Pre-delivery",
        x: 38,
        y: 51,
        w: 26,
        h: 9,
        color: "#6d28d9",
        type: "hangar",
        phase: 2,
        readiness: 76,
        capex: "$26M",
        why: "East of Paint Hangar — paint → systems check → engine run is a sequential flow with no U-turns.",
      },
      {
        id: "delivery_ctr",
        label: "Delivery Center",
        sub: "Customer acceptance · KBLI delivery · Documentation",
        x: 68,
        y: 51,
        w: 20,
        h: 9,
        color: "#5b21b6",
        type: "office",
        phase: 2,
        readiness: 82,
        capex: "$13M",
        why: "SE corner adjacent to KBLI apron — direct airside access for customer acceptance.",
      },
      {
        id: "apron",
        label: "Aircraft Apron & Taxiway",
        sub: "28 stands · Ground test area · Tow routes",
        x: 9,
        y: 61,
        w: 82,
        h: 3,
        color: "#4b5563",
        type: "yard",
        phase: 2,
        readiness: 80,
        capex: "$18M",
        why: "Full-width buffer between flight test and engineering zones — prevents vehicles crossing active taxiways.",
      },
      {
        id: "eng_hq",
        label: "Engineering Center",
        sub: "Design · Stress · Systems · 800 engineers",
        shape: "ushape",
        x: 11,
        y: 72,
        w: 32,
        h: 11,
        courtW: 16,
        courtH: 5,
        color: "#22d3ee",
        type: "office",
        phase: 1,
        readiness: 90,
        capex: "$38M",
        why: "South quiet zone — U-shape courtyard faces north; Bellingham morning sun into labs; isolated from press shop.",
      },
      {
        id: "ai_center",
        label: "AI Digital Twin Center",
        sub: "Simulation · IoT · AI monitoring · Digital twin",
        shape: "hex",
        cx: 63,
        cy: 77,
        r: 6,
        ry: 4.5,
        color: "#818cf8",
        type: "tech",
        phase: 1,
        readiness: 86,
        capex: "$24M",
        why: "Centre of engineering zone — equal fibre latency to all R&D labs and production SCADA systems.",
      },
      {
        id: "rnd_labs",
        label: "R&D Laboratories",
        sub: "Advanced materials · Aerostructures · 180 researchers",
        x: 76,
        y: 72,
        w: 13,
        h: 11,
        color: "#6366f1",
        type: "research",
        phase: 2,
        readiness: 82,
        capex: "$18M",
        why: "East quiet corner — vibration-sensitive equipment isolated from press shop and machining.",
      },
      {
        id: "substation",
        label: "PSE 115kV Substation",
        sub: "115kV primary · 34.5kV distribution",
        x: 11,
        y: 84,
        w: 11,
        h: 7,
        color: "#ca8a04",
        type: "utility",
        phase: 1,
        readiness: 95,
        capex: "$7.8M",
        why: "SW corner — PSE Cornwall Ave line enters from south-east; minimises HV cable span.",
      },
      {
        id: "datacenter",
        label: "Campus Data Center",
        sub: "Tier III · 3MW · 2N redundancy",
        x: 25,
        y: 84,
        w: 12,
        h: 7,
        color: "#d97706",
        type: "tech",
        phase: 1,
        readiness: 90,
        capex: "$13M",
        why: "Adjacent to substation — Bellingham cool climate reduces cooling energy 28%.",
      },
      {
        id: "arff",
        label: "ARFF Fire Station",
        sub: "Aircraft rescue · CFR units · 24/7",
        x: 41,
        y: 84,
        w: 8,
        h: 7,
        color: "#b45309",
        type: "safety",
        phase: 1,
        readiness: 97,
        capex: "$3.8M",
        why: "Geometric centre of campus — max 3-min response radius to Major Assembly, hangars, and apron.",
      },
      {
        id: "corp_hq",
        label: "Corporate HQ",
        sub: "Executive · Admin · Client reception",
        x: 53,
        y: 84,
        w: 13,
        h: 7,
        color: "#16a34a",
        type: "office",
        phase: 1,
        readiness: 88,
        capex: "$16M",
        why: "SE corner facing Airport Dr — customer-facing corporate presence at campus front door for KBLI arrivals.",
      },
      {
        id: "training",
        label: "Training Academy",
        sub: "Workforce dev · Simulator bays · 600 capacity",
        x: 70,
        y: 84,
        w: 11,
        h: 7,
        color: "#15803d",
        type: "training",
        phase: 1,
        readiness: 84,
        capex: "$8.5M",
        why: "Adjacent to HQ — HR and management oversight co-located with aerospace workforce development.",
      },
      {
        id: "emp_hub",
        label: "Employee Services Hub",
        sub: "Medical · Cafeteria · Fitness",
        x: 83,
        y: 84,
        w: 6,
        h: 7,
        color: "#166534",
        type: "office",
        phase: 2,
        readiness: 80,
        capex: "$5.5M",
        why: "Easternmost quiet corner — medical and cafeteria need low vibration; near east staff gate.",
      },
    ],
    roads: [
      {
        type: "main",
        pts: [
          [50, 8],
          [50, 92],
        ],
        label: "Main Campus Boulevard",
      },
      {
        type: "main",
        pts: [
          [10, 18],
          [90, 18],
        ],
        label: "North Logistics Road",
      },
      {
        type: "main",
        pts: [
          [10, 37],
          [90, 37],
        ],
        label: "Component Manufacturing Drive",
      },
      {
        type: "truck",
        pts: [
          [10, 50],
          [90, 50],
        ],
        label: "Assembly Truck Road",
      },
      {
        type: "main",
        pts: [
          [10, 70],
          [90, 70],
        ],
        label: "Engineering Drive",
      },
      {
        type: "main",
        pts: [
          [10, 83],
          [90, 83],
        ],
        label: "Utility Ring Road",
      },
      {
        type: "truck",
        pts: [
          [10, 18],
          [10, 50],
        ],
        label: "West Truck Loop",
      },
      {
        type: "truck",
        pts: [
          [90, 18],
          [90, 50],
        ],
        label: "East Truck Loop",
      },
      {
        type: "rail",
        pts: [
          [11, 12],
          [11, 37],
        ],
        label: "BNSF Rail Spur",
      },
      {
        type: "emergency",
        pts: [
          [89, 8],
          [89, 92],
        ],
        label: "East Emergency Corridor",
      },
      {
        type: "utility",
        pts: [
          [12, 70],
          [12, 92],
        ],
        label: "Utility Corridor",
      },
    ],
    gates: [
      { x: 20, y: 8, label: "Rail Gate", color: "#7c3aed" },
      { x: 50, y: 8, label: "Main Truck Gate", color: "#eab308" },
      { x: 78, y: 8, label: "Airport Logistics", color: "#0891b2" },
      { x: 50, y: 92, label: "Employee Gate South", color: "#22c55e" },
    ],
    aiSummary: {
      readiness: 88,
      confidence: 91,
      utilityCoord: 88,
      sustainability: 78,
      complexity: 60,
      engineeringValidation:
        "Solid Phase 1 plan. PSE 115kV at Cornwall Ave is on critical path — 8-week lead. KBLI FAA Part 77 compliance check required for Major Assembly height. BNSF Bellingham Yard ITA not yet initiated.",
      utilityConflicts: [
        "PSE 115kV Cornwall Ave large power agreement — 8-week critical path (MEDIUM)",
        "KBLI FAA Form 7460-1 for Major Assembly height (>9m AGL) — 45-day lead (MEDIUM)",
        "BNSF Bellingham Yard ITA not initiated — 12-week lead (LOW)",
      ],
      capexOptimization:
        "Phase 1-2 utility trench consolidation saves $360K. Bellingham cool climate reduces data center cooling cost 28%/yr. Solar carport yields $140K/yr net metering revenue.",
      recommendations: [
        "Initiate PSE 115kV Cornwall Ave large power agreement — 8-week lead",
        "File FAA Form 7460-1 for Major Assembly building — 45-day advance notice",
        "File BNSF Bellingham Yard Industrial Track Agreement — 12-week lead",
        "Bundle Phases 1-2 utility trenching for $360K savings",
      ],
    },
    kpis: { area: "380 ac", power: "PSE 115kV", workers: 3200, capex: "$462M", readiness: 88 },
  },
};

/* ── Road style lookup ─────────────────────────────────────────────── */
const ROAD_STYLE = {
  main: { color: "#e2e8f0", weight: 3.5, opacity: 0.85 },
  truck: { color: "#fbbf24", weight: 2.5, opacity: 0.75 },
  employee: { color: "#38bdf8", weight: 1.8, opacity: 0.65 },
  campus: { color: "#a3e635", weight: 2.0, opacity: 0.65 },
  utility: { color: "#fb923c", weight: 1.5, opacity: 0.6, dashArray: "5 4" },
  emergency: { color: "#ef4444", weight: 1.5, opacity: 0.55, dashArray: "8 6" },
  rail: { color: "#a78bfa", weight: 2.0, opacity: 0.75, dashArray: "12 4" },
};

/* ── CAD / DXF Export ───────────────────────────────────────────────── */
function generateDXF(plan, boundary) {
  const refLat = boundary.reduce((s, [la]) => s + la, 0) / boundary.length;
  const refLon = boundary.reduce((s, [, lo]) => s + lo, 0) / boundary.length;
  const LAT_M = 111319.9;
  const LON_M = 111319.9 * Math.cos((refLat * Math.PI) / 180);
  function toXY([lat, lon]) {
    return [(lon - refLon) * LON_M, (lat - refLat) * LAT_M];
  }
  function clean(s) {
    return String(s || "").replace(/[^\x20-\x7E]/g, "-");
  }

  function lwpoly(pts, layer, closed = true) {
    const flag = closed ? 1 : 0;
    let s = `  0\nLWPOLYLINE\n  8\n${layer}\n 90\n${pts.length}\n 70\n${flag}\n`;
    for (const [x, y] of pts) s += ` 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n`;
    return s;
  }
  function txt(text, x, y, h, layer, justH = 0) {
    const t = clean(text);
    let s = `  0\nTEXT\n  8\n${layer}\n 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n 30\n0.0\n 40\n${h}\n  1\n${t}\n`;
    if (justH) s += ` 72\n${justH}\n 11\n${x.toFixed(3)}\n 21\n${y.toFixed(3)}\n`;
    return s;
  }
  function circ(cx, cy, r, layer) {
    return `  0\nCIRCLE\n  8\n${layer}\n 10\n${cx.toFixed(3)}\n 20\n${cy.toFixed(3)}\n 30\n0.0\n 40\n${r}\n`;
  }

  const LAYERS = [
    ["SITE-BOUNDARY", 3, "CONTINUOUS"],
    ["ZONES", 9, "CONTINUOUS"],
    ["ZONE-LABELS", 7, "CONTINUOUS"],
    ["BUILDINGS", 5, "CONTINUOUS"],
    ["BUILDING-LABELS", 7, "CONTINUOUS"],
    ["BUILDING-DETAILS", 8, "CONTINUOUS"],
    ["ROADS-MAIN", 7, "CONTINUOUS"],
    ["ROADS-TRUCK", 2, "DASHED"],
    ["ROADS-EMERGENCY", 1, "DASHED"],
    ["ROADS-RAIL", 6, "DASHED"],
    ["ROADS-UTILITY", 30, "DASHED"],
    ["ROADS-EMPLOYEE", 4, "CONTINUOUS"],
    ["GATES", 3, "CONTINUOUS"],
    ["NORTH-ARROW", 7, "CONTINUOUS"],
    ["TITLE-BLOCK", 7, "CONTINUOUS"],
  ];
  const ROAD_LAYER = {
    main: "ROADS-MAIN",
    campus: "ROADS-MAIN",
    truck: "ROADS-TRUCK",
    emergency: "ROADS-EMERGENCY",
    rail: "ROADS-RAIL",
    utility: "ROADS-UTILITY",
    employee: "ROADS-EMPLOYEE",
  };

  let d = "";

  // HEADER
  d += "  0\nSECTION\n  2\nHEADER\n";
  d += "  9\n$ACADVER\n  1\nAC1015\n";
  d += "  9\n$INSBASE\n 10\n0.0\n 20\n0.0\n 30\n0.0\n";
  d += "  9\n$EXTMIN\n 10\n-5000.0\n 20\n-5000.0\n 30\n0.0\n";
  d += "  9\n$EXTMAX\n 10\n5000.0\n 20\n5000.0\n 30\n0.0\n";
  d += "  9\n$LUNITS\n 70\n2\n";
  d += "  9\n$LUPREC\n 70\n3\n";
  d += "  9\n$MEASUREMENT\n 70\n1\n";
  d += "  0\nENDSEC\n";

  // TABLES
  d += "  0\nSECTION\n  2\nTABLES\n";
  d += "  0\nTABLE\n  2\nLTYPE\n 70\n3\n";
  d += "  0\nLTYPE\n  2\nCONTINUOUS\n 70\n0\n  3\nSolid\n 72\n65\n 73\n0\n 40\n0.0\n";
  d += "  0\nLTYPE\n  2\nDASHED\n 70\n0\n  3\nDashed\n 72\n65\n 73\n2\n 40\n0.75\n 49\n0.5\n 49\n-0.25\n";
  d += "  0\nLTYPE\n  2\nDOT\n 70\n0\n  3\nDot\n 72\n65\n 73\n2\n 40\n0.5\n 49\n0.0\n 49\n-0.5\n";
  d += "  0\nENDTAB\n";
  d += `  0\nTABLE\n  2\nLAYER\n 70\n${LAYERS.length}\n`;
  for (const [name, color, ltype] of LAYERS) d += `  0\nLAYER\n  2\n${name}\n 70\n0\n 62\n${color}\n  6\n${ltype}\n`;
  d += "  0\nENDTAB\n";
  d += "  0\nTABLE\n  2\nSTYLE\n 70\n1\n";
  d += "  0\nSTYLE\n  2\nSTANDARD\n 70\n0\n 40\n0.0\n 41\n1.0\n 50\n0.0\n 71\n0\n 42\n2.5\n  3\ntxt\n  4\n\n";
  d += "  0\nENDTAB\n";
  d += "  0\nENDSEC\n";

  // ENTITIES
  d += "  0\nSECTION\n  2\nENTITIES\n";

  // Site boundary
  d += lwpoly(boundary.map(toXY), "SITE-BOUNDARY", true);

  // Zones
  for (const z of plan.zones) {
    const corners = clampToBoundary(
      [
        svgToLatLon(z.x, z.y, boundary),
        svgToLatLon(z.x + z.w, z.y, boundary),
        svgToLatLon(z.x + z.w, z.y + z.h, boundary),
        svgToLatLon(z.x, z.y + z.h, boundary),
      ],
      boundary,
    );
    const pts = corners.map(toXY);
    d += lwpoly(pts, "ZONES", true);
    const cx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
    const cy = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
    d += txt(z.label, cx, cy, 6, "ZONE-LABELS", 1);
  }

  // Buildings
  for (const b of plan.buildings) {
    const poly = buildingPolygon(b, boundary);
    const pts = poly.map(toXY);
    d += lwpoly(pts, "BUILDINGS", true);
    const cx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
    const cy = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
    d += txt(b.label, cx, cy + 4, 2.5, "BUILDING-LABELS", 1);
    if (b.sub) d += txt(b.sub, cx, cy + 1, 1.8, "BUILDING-DETAILS", 1);
    if (b.why) d += txt("WHY: " + b.why, cx, cy - 3, 1.5, "BUILDING-DETAILS", 1);
  }

  // Roads
  for (const road of plan.roads) {
    const pts = road.pts.map(([x, y]) => toXY(svgToLatLon(x, y, boundary)));
    d += lwpoly(pts, ROAD_LAYER[road.type] || "ROADS-MAIN", false);
  }

  // Gates
  for (const gate of plan.gates) {
    const [gx, gy] = toXY(svgToLatLon(gate.x, gate.y, boundary));
    d += circ(gx, gy, 8, "GATES");
    d += txt(gate.label, gx, gy + 12, 2.5, "GATES", 1);
  }

  // Title block (right of site)
  const allPts = boundary.map(toXY);
  const maxX = Math.max(...allPts.map(([x]) => x)) + 40;
  const maxY = Math.max(...allPts.map(([, y]) => y));
  d += txt(plan.name, maxX, maxY, 9, "TITLE-BLOCK");
  d += txt(plan.subtitle, maxX, maxY - 16, 3.5, "TITLE-BLOCK");
  d += txt("AREA: " + plan.kpis.area + "   POWER: " + plan.kpis.power, maxX, maxY - 25, 3, "TITLE-BLOCK");
  d += txt(
    "WORKERS: " + plan.kpis.workers.toLocaleString() + "   CAPEX: " + plan.kpis.capex + "   READINESS: " + plan.kpis.readiness + "%",
    maxX,
    maxY - 33,
    3,
    "TITLE-BLOCK",
  );
  d += txt("Blueprint Intelligence - Astrikos AI", maxX, maxY - 43, 2.5, "TITLE-BLOCK");
  d += txt("EXPORT DATE: " + new Date().toISOString().split("T")[0], maxX, maxY - 51, 2.5, "TITLE-BLOCK");
  d += txt("All coordinates in metres from local site origin", maxX, maxY - 59, 2.5, "TITLE-BLOCK");
  d += txt("Layers: SITE-BOUNDARY  ZONES  BUILDINGS  ROADS-*  GATES", maxX, maxY - 67, 2.5, "TITLE-BLOCK");

  // North arrow
  const [nx, ny] = [maxX + 60, maxY - 100];
  d += lwpoly(
    [
      [nx, ny],
      [nx, ny + 30],
    ],
    "NORTH-ARROW",
    false,
  );
  d += lwpoly(
    [
      [nx, ny + 30],
      [nx - 7, ny + 15],
    ],
    "NORTH-ARROW",
    false,
  );
  d += lwpoly(
    [
      [nx, ny + 30],
      [nx + 7, ny + 15],
    ],
    "NORTH-ARROW",
    false,
  );
  d += txt("N", nx, ny + 33, 7, "NORTH-ARROW", 1);

  d += "  0\nENDSEC\n  0\nEOF\n";
  return d;
}

function downloadCAD(plan, boundary, siteKey) {
  const dxf = generateDXF(plan, boundary);
  const blob = new Blob([dxf], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${siteKey}_masterplan_${new Date().toISOString().split("T")[0]}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── BlueprintSVG — professional 2-D CAD plan renderer ────────────── */
const ROAD_C = {
  main: "#c8d4e2",
  truck: "#fbbf24",
  rail: "#a78bfa",
  emergency: "#ef4444",
  utility: "#fb923c",
  employee: "#38bdf8",
  campus: "#a3e635",
};
const ROAD_W = { main: 1.0, truck: 0.7, rail: 0.65, emergency: 0.6, utility: 0.55, employee: 0.55, campus: 0.7 };
const ROAD_D = { rail: "2 0.8", emergency: "1.8 0.8", utility: "1.4 0.8" };
const BTYPE_ICON = {
  assembly: "⚙",
  mfg: "⚙",
  hangar: "✈",
  logistics: "⬢",
  rail: "⬢",
  storage: "▣",
  office: "▦",
  research: "⬡",
  tech: "◈",
  utility: "⚡",
  energy: "⚡",
  solar: "☀",
  safety: "⊕",
  security: "◉",
  training: "▤",
  yard: "▭",
};

function bldgShape(b, fillOp, strokeC, strokeW) {
  const props = { fill: b.color, fillOpacity: fillOp, stroke: strokeC, strokeWidth: strokeW, strokeLinejoin: "round" };
  if (b.shape === "hex") {
    const { cx, cy, r, ry = r * 0.75 } = b;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 - 30) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + ry * Math.sin(a)).toFixed(2)}`;
    }).join(" ");
    return <polygon points={pts} {...props} />;
  }
  if (b.shape === "pts") {
    return <polygon points={b.pts.map(([px, py]) => `${px},${py}`).join(" ")} {...props} />;
  }
  if (b.shape === "ushape") {
    const { x, y, w, h, courtW, courtH } = b;
    const cl = x + (w - courtW) / 2;
    return (
      <path
        d={`M${x},${y}L${x + w},${y}L${x + w},${y + h}L${cl + courtW},${y + h}L${cl + courtW},${y + h - courtH}L${cl},${y + h - courtH}L${cl},${y + h}L${x},${y + h}Z`}
        {...props}
      />
    );
  }
  if (b.shape === "lshape") {
    const { x, y, w, h } = b;
    const { side = "br", nw, nh } = b.notch || {};
    const d =
      side === "br"
        ? `M${x},${y}L${x + w},${y}L${x + w},${y + h - nh}L${x + w - nw},${y + h - nh}L${x + w - nw},${y + h}L${x},${y + h}Z`
        : side === "tr"
          ? `M${x},${y}L${x + w - nw},${y}L${x + w - nw},${y + nh}L${x + w},${y + nh}L${x + w},${y + h}L${x},${y + h}Z`
          : side === "bl"
            ? `M${x},${y}L${x + w},${y}L${x + w},${y + h}L${x + nw},${y + h}L${x + nw},${y + h - nh}L${x},${y + h - nh}Z`
            : `M${x + nw},${y}L${x + w},${y}L${x + w},${y + h}L${x},${y + h}L${x},${y + nh}L${x + nw},${y + nh}Z`;
    return <path d={d} {...props} />;
  }
  return <rect x={b.x} y={b.y} width={b.w} height={b.h} {...props} />;
}
function bldgCx(b) {
  return b.shape === "hex" ? b.cx : b.shape === "pts" ? b.pts.reduce((s, [px]) => s + px, 0) / b.pts.length : b.x + (b.w || 0) / 2;
}
function bldgCy(b) {
  return b.shape === "hex"
    ? b.cy
    : b.shape === "pts"
      ? b.pts.reduce((s, [, py]) => s + py, 0) / b.pts.length
      : b.shape === "ushape"
        ? b.y + (b.h || 0) * 0.42
        : b.y + (b.h || 0) / 2;
}
function bldgW(b) {
  return b.shape === "hex" ? b.r * 2 : b.w || 8;
}

function BlueprintSVG({ plan, T, night, selBuilding, setSelBuilding, activeLayer }) {
  const bg = night ? "#020a18" : "#f4f8ff";
  const paper = night ? "#030e22" : "#ffffff";
  const bdr = night ? "rgba(56,189,248,0.32)" : "rgba(30,100,200,0.32)";
  const grid = night ? "rgba(56,189,248,0.045)" : "rgba(30,100,200,0.055)";
  const title = night ? "#38bdf8" : "#1a4fa0";
  const sub = night ? "#4a7a9a" : "#5a7a9a";

  function isVisible(b) {
    if (activeLayer === "all") return true;
    if (activeLayer === "phase1") return b.phase === 1;
    if (activeLayer === "assembly") return ["assembly", "hangar", "mfg"].includes(b.type);
    if (activeLayer === "logistics") return ["logistics", "rail", "freight", "yard", "storage"].includes(b.type);
    if (activeLayer === "utility") return ["utility", "energy", "solar", "safety", "tech"].includes(b.type);
    if (activeLayer === "office") return ["office", "training", "research", "security"].includes(b.type);
    return true;
  }

  const VW = 106,
    VH = 112,
    P = 3;

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", background: bg }}>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }}>
        <defs>
          <filter id="ts" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.45" result="b" />
            <feFlood floodColor="#000" floodOpacity="0.9" result="f" />
            <feComposite in="f" in2="b" operator="in" result="s" />
            <feMerge>
              <feMergeNode in="s" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow2">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Hatch pattern for phase-2 buildings */}
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Page background */}
        <rect width={VW} height={VH} fill={bg} />

        {/* Drawing paper */}
        <rect x={P} y={P} width={100} height={97} fill={paper} stroke={bdr} strokeWidth={0.45} />

        {/* Grid (5-unit) */}
        <g stroke={grid} strokeWidth={0.15}>
          {Array.from({ length: 21 }, (_, i) => (
            <g key={i}>
              <line x1={P} x2={P + 100} y1={P + i * 5} y2={P + i * 5} />
              <line x1={P + i * 5} x2={P + i * 5} y1={P} y2={P + 97} />
            </g>
          ))}
        </g>

        {/* Corner registration marks */}
        {[
          [P, P],
          [P + 100, P],
          [P, P + 97],
          [P + 100, P + 97],
        ].map(([mx, my], i) => (
          <g key={i} stroke={bdr} strokeWidth={0.35}>
            <line x1={mx + (mx === P ? 0 : 0)} y1={my} x2={mx + (mx === P ? 2.5 : -2.5)} y2={my} />
            <line x1={mx} y1={my + (my === P ? 0 : 0)} x2={mx} y2={my + (my === P ? 2.5 : -2.5)} />
          </g>
        ))}

        <g transform={`translate(${P},${P})`}>
          {/* ── Zone fills ───────────────────────── */}
          {plan.zones.map((z) => (
            <g key={z.id}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                fill={z.color}
                fillOpacity={0.11}
                stroke={z.color}
                strokeOpacity={0.55}
                strokeWidth={0.3}
                strokeDasharray="2.2 1.2"
              />
              <text
                x={z.x + z.w / 2}
                y={z.y + 2.5}
                textAnchor="middle"
                fill={z.color}
                fontSize={1.85}
                fontWeight="900"
                fontFamily="'Courier New',monospace"
                letterSpacing="0.5"
                filter="url(#ts)"
              >
                {z.label}
              </text>
            </g>
          ))}

          {/* ── Road network ─────────────────────── */}
          {plan.roads.map((r, i) => {
            const c = ROAD_C[r.type] || ROAD_C.main;
            const d = r.pts.map(([rx, ry], j) => `${j === 0 ? "M" : "L"}${rx},${ry}`).join("");
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={c}
                strokeWidth={ROAD_W[r.type] || 0.75}
                strokeOpacity={night ? 0.88 : 0.72}
                strokeDasharray={ROAD_D[r.type]}
                strokeLinecap="round"
              />
            );
          })}

          {/* ── Bay dividers ─────────────────────── */}
          {(plan.bayDividers || []).map((bd, i) => {
            const d = bd.pts.map(([rx, ry], j) => `${j === 0 ? "M" : "L"}${rx},${ry}`).join("");
            return <path key={i} d={d} fill="none" stroke="#22d3ee" strokeWidth={0.45} strokeOpacity={0.55} strokeDasharray="2 1" />;
          })}

          {/* ── Buildings ────────────────────────── */}
          {plan.buildings.map((b) => {
            const vis = isVisible(b);
            const isSel = selBuilding === b.id;
            const isFAB = !!b.isFAB;
            const ph2 = b.phase === 2;
            const fillOp = isSel ? 0.82 : isFAB ? 0.68 : ph2 ? 0.42 : 0.56;
            const strokeC = isSel ? "#ffffff" : b.color;
            const strokeW = isSel ? 0.65 : isFAB ? 0.5 : 0.35;

            const cx = bldgCx(b),
              cy = bldgCy(b),
              bw = bldgW(b);
            const words = b.label.split(" ");
            const maxW = Math.max(8, Math.floor(bw * 2.2));
            let lbl = words.length <= 3 ? b.label : words.slice(0, 3).join(" ");
            if (lbl.length > maxW) lbl = lbl.slice(0, maxW - 1) + "…";
            const fs = Math.max(1.0, Math.min(1.85, (bw / Math.max(5, lbl.length)) * 1.95));
            const readColor = b.readiness >= 80 ? "#22c55e" : b.readiness >= 60 ? "#eab308" : "#ef4444";

            return (
              <g key={b.id} onClick={() => setSelBuilding((p) => (p === b.id ? null : b.id))} style={{ cursor: "pointer", opacity: vis ? 1 : 0.18 }}>
                {bldgShape(b, fillOp, strokeC, strokeW)}
                {/* Phase-2 hatch overlay */}
                {ph2 && !isSel && <g opacity={0.35}>{bldgShape(b, 1, "none", 0)}</g>}
                {/* Readiness bar (2px bottom strip) */}
                {b.w >= 4 && !b.shape && (
                  <rect x={b.x} y={b.y + b.h - 0.9} width={b.w * (b.readiness / 100)} height={0.9} fill={readColor} fillOpacity={0.75} rx={0.3} />
                )}
                {/* Label */}
                {bw >= 5 && (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={fs}
                    fontFamily="'Courier New',monospace"
                    fontWeight="bold"
                    filter="url(#ts)"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {lbl}
                  </text>
                )}
                {/* Selected highlight ring */}
                {isSel && bldgShape({ ...b, color: "transparent" }, 0, "#ffffff", 0.9)}
              </g>
            );
          })}

          {/* ── Gate markers ─────────────────────── */}
          {plan.gates.map((g, i) => (
            <g key={i}>
              <circle cx={g.x} cy={g.y} r={2.4} fill={g.color} fillOpacity={0.92} stroke="#ffffff" strokeWidth={0.4} filter="url(#glow2)" />
              <text
                x={g.x}
                y={g.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize={1.5}
                fontWeight="900"
                fontFamily="monospace"
                style={{ pointerEvents: "none" }}
              >
                G
              </text>
              <text
                x={g.x}
                y={g.y + 4.2}
                textAnchor="middle"
                fill={g.color}
                fontSize={1.35}
                fontFamily="monospace"
                filter="url(#ts)"
                style={{ pointerEvents: "none" }}
              >
                {g.label.split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          ))}

          {/* ── Site perimeter ───────────────────── */}
          <rect
            x={8}
            y={8}
            width={84}
            height={84}
            fill="none"
            stroke={night ? "rgba(34,197,94,0.65)" : "rgba(22,163,74,0.65)"}
            strokeWidth={0.7}
            strokeDasharray="none"
          />
          {/* Corner diamonds */}
          {[
            [8, 8],
            [92, 8],
            [92, 92],
            [8, 92],
          ].map(([px, py], i) => (
            <polygon
              key={i}
              points={`${px},${py - 1.8} ${px + 1.8},${py} ${px},${py + 1.8} ${px - 1.8},${py}`}
              fill={night ? "#22c55e" : "#16a34a"}
              opacity={0.85}
            />
          ))}
        </g>
        {/* end plan translate */}

        {/* ── North arrow ──────────────────────── */}
        <g transform={`translate(${P + 93},${P + 10})`}>
          <circle cx={0} cy={0} r={5.5} fill={night ? "rgba(3,14,34,0.8)" : "rgba(240,248,255,0.8)"} stroke={bdr} strokeWidth={0.35} />
          <polygon points="0,-4.5 -1.8,0 0,-2 1.8,0" fill={title} opacity={0.95} filter="url(#glow2)" />
          <polygon points="0,-4.5 0,-2 -1.8,0" fill={night ? "rgba(56,189,248,0.4)" : "rgba(26,79,160,0.35)"} />
          <polygon points="0,4.5 -1.8,0 0,2 1.8,0" fill={night ? "#334155" : "#cbd5e1"} />
          <text x={0} y={8.5} textAnchor="middle" fill={title} fontSize={2.6} fontWeight="900" fontFamily="'Courier New',monospace">
            N
          </text>
        </g>

        {/* ── Legend (top-left float) ────────────── */}
        <g transform={`translate(${P + 1},${P + 1})`}>
          <rect
            x={0}
            y={0}
            width={28}
            height={20}
            fill={night ? "rgba(2,8,24,0.82)" : "rgba(240,248,255,0.88)"}
            stroke={bdr}
            strokeWidth={0.3}
            rx={1}
          />
          <text x={1.5} y={3} fill={title} fontSize={1.6} fontWeight="900" fontFamily="'Courier New',monospace" letterSpacing="0.3">
            LEGEND
          </text>
          {[
            { c: ROAD_C.main, l: "Main Road", d: null },
            { c: ROAD_C.truck, l: "Truck Route", d: "2 1" },
            { c: ROAD_C.rail, l: "Rail Spur", d: "2 0.8" },
            { c: ROAD_C.emergency, l: "Emergency", d: "1.5 0.8" },
          ].map(({ c, l, d }, i) => (
            <g key={i} transform={`translate(1.5,${5 + i * 3.5})`}>
              <line x1={0} y1={0} x2={5} y2={0} stroke={c} strokeWidth={0.9} strokeDasharray={d} strokeLinecap="round" />
              <text x={6.5} y={0.5} fill={night ? "#8aaabb" : "#5a7a9a"} fontSize={1.5} fontFamily="monospace">
                {l}
              </text>
            </g>
          ))}
          <g transform={`translate(1.5,19.5)`}>
            <rect x={0} y={-1.2} width={2.5} height={2.5} fill="#22c55e" fillOpacity={0.6} stroke="#22c55e" strokeWidth={0.3} />
            <text x={4} y={0.5} fill={night ? "#8aaabb" : "#5a7a9a"} fontSize={1.5} fontFamily="monospace">
              Phase 1
            </text>
            <rect x={14} y={-1.2} width={2.5} height={2.5} fill="#6b7280" fillOpacity={0.4} stroke="#6b7280" strokeWidth={0.3} />
            <text x={18} y={0.5} fill={night ? "#8aaabb" : "#5a7a9a"} fontSize={1.5} fontFamily="monospace">
              Phase 2
            </text>
          </g>
        </g>

        {/* ── Title block ──────────────────────── */}
        <rect
          x={P}
          y={P + 97}
          width={100}
          height={12}
          fill={night ? "rgba(2,6,18,0.96)" : "rgba(218,232,255,0.96)"}
          stroke={bdr}
          strokeWidth={0.35}
        />
        <line x1={P} x2={P + 100} y1={P + 100.5} y2={P + 100.5} stroke={bdr} strokeWidth={0.2} />
        <line x1={P + 66} x2={P + 66} y1={P + 97} y2={P + 109} stroke={bdr} strokeWidth={0.2} />

        {/* Site name + subtitle */}
        <text x={P + 2} y={P + 100} fill={title} fontSize={2.4} fontWeight="900" fontFamily="'Courier New',monospace" letterSpacing="0.25">
          {plan.name.toUpperCase()}
        </text>
        <text x={P + 2} y={P + 102.8} fill={sub} fontSize={1.55} fontFamily="'Courier New',monospace">
          {plan.subtitle}
        </text>

        {/* KPI boxes (right side of title block) */}
        {[
          { l: "AREA", v: plan.kpis.area },
          { l: "POWER", v: plan.kpis.power },
          { l: "WORKERS", v: plan.kpis.workers.toLocaleString() },
          { l: "CAPEX", v: plan.kpis.capex },
        ].map(({ l, v }, i) => (
          <g key={l} transform={`translate(${P + 68 + i * 8.5},${P + 97.8})`}>
            <rect
              x={0}
              y={0}
              width={8}
              height={5.5}
              fill={night ? "rgba(56,189,248,0.07)" : "rgba(30,100,200,0.06)"}
              stroke={bdr}
              strokeWidth={0.2}
              rx={0.5}
            />
            <text x={4} y={1.9} textAnchor="middle" fill={sub} fontSize={1.3} fontFamily="monospace">
              {l}
            </text>
            <text x={4} y={4.2} textAnchor="middle" fill={title} fontSize={1.6} fontFamily="'Courier New',monospace" fontWeight="bold">
              {v}
            </text>
          </g>
        ))}

        {/* Readiness badge */}
        <g transform={`translate(${P + 68 + 4 * 8.5},${P + 97.8})`}>
          <rect
            x={0}
            y={0}
            width={8}
            height={5.5}
            fill={night ? "rgba(34,197,94,0.1)" : "rgba(22,163,74,0.08)"}
            stroke={night ? "rgba(34,197,94,0.4)" : "rgba(22,163,74,0.4)"}
            strokeWidth={0.25}
            rx={0.5}
          />
          <text x={4} y={1.9} textAnchor="middle" fill={sub} fontSize={1.3} fontFamily="monospace">
            READY
          </text>
          <text
            x={4}
            y={4.3}
            textAnchor="middle"
            fill={night ? "#22c55e" : "#15803d"}
            fontSize={2.2}
            fontFamily="'Courier New',monospace"
            fontWeight="900"
          >
            {plan.kpis.readiness}%
          </text>
        </g>

        {/* Scale bar */}
        <g transform={`translate(${P + 2},${P + 105.5})`}>
          {[0, 10, 20].map((x) => (
            <line key={x} x1={x} y1={-0.8} x2={x} y2={0.8} stroke={sub} strokeWidth={0.3} />
          ))}
          <line x1={0} y1={0} x2={20} y2={0} stroke={sub} strokeWidth={0.4} />
          <rect x={0} y={-0.8} width={10} height={1.6} fill={sub} fillOpacity={0.4} />
          <text x={10} y={-1.4} textAnchor="middle" fill={sub} fontSize={1.4} fontFamily="monospace">
            SCALE 1:4 000
          </text>
          <text x={0} y={2.5} fill={sub} fontSize={1.3} fontFamily="monospace">
            0
          </text>
          <text x={10} y={2.5} textAnchor="middle" fill={sub} fontSize={1.3} fontFamily="monospace">
            500m
          </text>
          <text x={20} y={2.5} textAnchor="end" fill={sub} fontSize={1.3} fontFamily="monospace">
            1 km
          </text>
        </g>

        {/* Watermark */}
        <text
          x={P + 98}
          y={P + 108.5}
          textAnchor="end"
          fill={night ? "rgba(56,189,248,0.2)" : "rgba(30,100,200,0.2)"}
          fontSize={1.5}
          fontFamily="monospace"
          fontWeight="bold"
        >
          ASTRIKOS AI · BLUEPRINT INTELLIGENCE
        </text>
      </svg>
    </div>
  );
}

/* ── CampusMapView ─────────────────────────────────────────────────── */
function CampusMapView({ plan, boundary, siteKey, selBuilding, setSelBuilding, activeLayer, T, night }) {
  const tileUrl = night
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const zoneRects = useMemo(
    () =>
      plan.zones.map((z) => ({
        ...z,
        positions: clampToBoundary(
          [
            svgToLatLon(z.x, z.y, boundary),
            svgToLatLon(z.x + z.w, z.y, boundary),
            svgToLatLon(z.x + z.w, z.y + z.h, boundary),
            svgToLatLon(z.x, z.y + z.h, boundary),
          ],
          boundary,
        ),
      })),
    [plan, siteKey],
  );

  const buildingPolys = useMemo(() => plan.buildings.map((b) => ({ ...b, positions: buildingPolygon(b, boundary) })), [plan, siteKey]);

  const roadLines = useMemo(
    () =>
      plan.roads.map((r) => ({
        ...r,
        positions: r.pts.map(([x, y]) => svgToLatLon(x, y, boundary)),
      })),
    [plan, siteKey],
  );

  const bayLines = useMemo(
    () =>
      (plan.bayDividers || []).map((bd) => ({
        positions: bd.pts.map(([x, y]) => svgToLatLon(x, y, boundary)),
      })),
    [plan, siteKey],
  );

  const gatePoints = useMemo(
    () =>
      plan.gates.map((g) => {
        const pt = svgToLatLon(g.x, g.y, boundary);
        return { ...g, center: clampToBoundary([pt], boundary)[0] };
      }),
    [plan, siteKey],
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer center={[47.5, -120.5]} zoom={13} style={{ width: "100%", height: "100%" }} zoomControl attributionControl={false}>
        <TileLayer url={tileUrl} maxZoom={19} />
        <MapAutoFit key={siteKey} boundary={boundary} />

        {/* Zone fills with permanent labels */}
        {zoneRects.map((z) => (
          <Polygon
            key={z.id}
            positions={z.positions}
            pathOptions={{ color: z.color, weight: 1.5, fillColor: z.color, fillOpacity: 0.14, dashArray: "5 7", opacity: 0.7 }}
          >
            <Tooltip permanent direction="center" opacity={0.95} className="campus-zone-lbl">
              {z.label}
            </Tooltip>
          </Polygon>
        ))}

        {/* Road network */}
        {roadLines.map((r, i) => {
          const st = ROAD_STYLE[r.type] || ROAD_STYLE.main;
          return (
            <Polyline
              key={`road${i}`}
              positions={r.positions}
              pathOptions={{ color: st.color, weight: st.weight, opacity: st.opacity, dashArray: st.dashArray }}
            >
              {r.label && <Tooltip sticky>{r.label}</Tooltip>}
            </Polyline>
          );
        })}

        {/* Bay dividers inside FAB */}
        {bayLines.map((bl, i) => (
          <Polyline key={`bay${i}`} positions={bl.positions} pathOptions={{ color: "#22d3ee", weight: 1, opacity: 0.55, dashArray: "6 5" }} />
        ))}

        {/* Buildings */}
        {buildingPolys.map((b) => {
          const highlighted = isBuildingHighlighted(b, activeLayer);
          const isSel = selBuilding === b.id;
          const isFAB = !!b.isFAB;
          const col = b.color || T.sky;
          return (
            <Polygon
              key={b.id}
              positions={b.positions}
              pathOptions={{
                color: isSel ? "#ffffff" : col,
                weight: isSel ? 3 : isFAB ? 2.5 : highlighted ? 1.8 : 1.2,
                fillColor: col,
                fillOpacity: isSel ? 0.72 : highlighted ? (isFAB ? 0.62 : 0.48) : 0.28,
                opacity: highlighted || isSel ? 1 : 0.65,
              }}
              eventHandlers={{ click: () => setSelBuilding((p) => (p === b.id ? null : b.id)) }}
            >
              <Tooltip sticky className="bldg-tip">
                <div style={{ minWidth: 148 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, lineHeight: 1.3 }}>{b.label}</div>
                  {b.sub && <div style={{ color: "#94a3b8", fontSize: 8.5, marginTop: 2, lineHeight: 1.4 }}>{b.sub}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 5, fontSize: 9 }}>
                    <span style={{ color: b.readiness >= 80 ? "#22c55e" : b.readiness >= 60 ? "#eab308" : "#ef4444" }}>◆ {b.readiness}%</span>
                    <span style={{ color: "#818cf8" }}>{b.capex}</span>
                    <span style={{ color: "#94a3b8" }}>Ph.{b.phase}</span>
                  </div>
                  {b.constraint && <div style={{ color: "#fb923c", fontSize: 8.5, marginTop: 3 }}>⚠ {b.constraint}</div>}
                </div>
              </Tooltip>
            </Polygon>
          );
        })}

        {/* Gate markers */}
        {gatePoints.map((g, i) => (
          <CircleMarker
            key={`gate${i}`}
            center={g.center}
            radius={5}
            pathOptions={{ color: g.color || T.green, weight: 2, fillColor: g.color || T.green, fillOpacity: 0.85 }}
          >
            <Tooltip>{g.label}</Tooltip>
          </CircleMarker>
        ))}

        {/* Triple-layer green site boundary */}
        <Polygon positions={boundary} pathOptions={{ color: "#22c55e", weight: 10, fill: false, opacity: 0.13 }} />
        <Polygon positions={boundary} pathOptions={{ color: "#22c55e", weight: 3, fill: false, opacity: 1 }} />
        <Polygon positions={boundary} pathOptions={{ color: "#ffffff", weight: 1.5, fill: false, opacity: 0.55, dashArray: "10 18" }} />
      </MapContainer>

      {/* CSS overrides for Leaflet tooltips */}
      <style>{`
        .leaflet-tooltip.campus-zone-lbl {
          background: transparent !important; border: none !important;
          box-shadow: none !important; padding: 0 !important;
          color: rgba(255,255,255,0.92) !important;
          font-family: monospace !important; font-size: 8.5px !important;
          font-weight: 900 !important; letter-spacing: 1.6px !important;
          text-shadow: 0 0 10px rgba(0,0,0,1), 0 1px 5px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1) !important;
          white-space: nowrap !important; pointer-events: none !important;
        }
        .leaflet-tooltip.campus-zone-lbl::before { display: none !important; }
        .leaflet-tooltip.bldg-tip {
          background: rgba(4,10,24,0.93) !important;
          border: 1px solid rgba(56,189,248,0.32) !important;
          color: #cce8ff !important;
          font-family: 'Segoe UI',monospace,sans-serif !important;
          border-radius: 5px !important; padding: 8px 10px !important;
        }
        .leaflet-tooltip.bldg-tip::before { display: none !important; }
      `}</style>
    </div>
  );
}

/* ── Building Detail Panel ─────────────────────────────────────────── */
function BuildingDetailPanel({ building: b, T, night, onClose }) {
  if (!b) return null;
  const col = b.color || T.sky;
  return (
    <div
      style={{
        position: "absolute",
        left: 10,
        top: 10,
        zIndex: 1000,
        width: 220,
        background: night ? "rgba(4,10,24,0.95)" : "rgba(240,248,255,0.97)",
        border: `1.5px solid ${hex2rgba(col, 0.5)}`,
        borderRadius: 8,
        padding: 12,
        color: T.text,
        fontFamily: "'Segoe UI',monospace,sans-serif",
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 16px ${hex2rgba(col, 0.2)}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: col, lineHeight: 1.3, flex: 1, letterSpacing: 0.3 }}>{b.label}</div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 14, padding: "0 0 0 6px", lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      {b.sub && <div style={{ fontSize: 9, color: T.muted, marginBottom: 9, lineHeight: 1.5 }}>{b.sub}</div>}
      {b.why && (
        <div
          style={{
            padding: "5px 8px",
            background: hex2rgba(T.teal, 0.08),
            border: `1px solid ${hex2rgba(T.teal, 0.25)}`,
            borderRadius: 4,
            fontSize: 9,
            color: T.teal,
            lineHeight: 1.5,
            marginBottom: 9,
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: 0.8, marginRight: 5, opacity: 0.7 }}>WHY HERE —</span>
          {b.why}
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 8, color: T.muted, letterSpacing: 1 }}>READINESS</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: rCol(b.readiness, T), fontFamily: "monospace" }}>{b.readiness}%</span>
        </div>
        <div style={{ height: 4, background: hex2rgba(T.sky, 0.12), borderRadius: 2 }}>
          <div
            style={{
              height: "100%",
              width: `${b.readiness}%`,
              background: `linear-gradient(90deg,${rCol(b.readiness, T)},${hex2rgba(rCol(b.readiness, T), 0.6)})`,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {[
          ["PHASE", `Phase ${b.phase}`, b.phase === 1 ? T.sky : b.phase === 2 ? T.amber : T.violet],
          ["CAPEX", b.capex, T.purple],
          ["TYPE", (b.type || "").toUpperCase(), T.teal],
        ].map(([l, v, c]) => (
          <div
            key={l}
            style={{
              padding: "2px 7px",
              background: hex2rgba(c, 0.12),
              border: `1px solid ${hex2rgba(c, 0.35)}`,
              borderRadius: 10,
              fontSize: 8,
              color: c,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {l} · {v}
          </div>
        ))}
      </div>
      {b.constraint && (
        <div
          style={{
            padding: "6px 8px",
            background: hex2rgba(T.amber, 0.1),
            border: `1px solid ${hex2rgba(T.amber, 0.3)}`,
            borderRadius: 4,
            fontSize: 9,
            color: T.amber,
            lineHeight: 1.4,
          }}
        >
          ⚠ {b.constraint}
        </div>
      )}
      {b.isFAB && (
        <div
          style={{
            padding: "6px 8px",
            background: hex2rgba(T.cyan, 0.08),
            border: `1px solid ${hex2rgba(T.cyan, 0.25)}`,
            borderRadius: 4,
            fontSize: 9,
            color: T.cyan,
            lineHeight: 1.4,
            marginTop: 6,
          }}
        >
          ★ CRITICAL PATH — Largest building on campus
        </div>
      )}
    </div>
  );
}

/* ── AI Blueprint Review Panel ─────────────────────────────────────── */
function AIPanel({ summary, T, night }) {
  return (
    <div
      style={{
        width: 244,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 9,
        background: night ? "rgba(20,8,50,0.55)" : "rgba(240,232,255,0.75)",
        border: `1.5px solid ${hex2rgba(T.violet, 0.35)}`,
        borderRadius: 8,
        padding: 14,
        overflowY: "auto",
        boxShadow: `0 0 24px ${hex2rgba(T.violet, 0.18)}`,
      }}
    >
      <div
        style={{
          color: T.purple,
          fontWeight: 800,
          fontSize: 13,
          fontFamily: "monospace",
          letterSpacing: 1,
          borderBottom: `1px solid ${hex2rgba(T.violet, 0.25)}`,
          paddingBottom: 8,
        }}
      >
        AI BLUEPRINT REVIEW
      </div>
      <div style={{ background: hex2rgba(T.violet, 0.08), borderRadius: 5, padding: 10, border: `1px solid ${hex2rgba(T.violet, 0.2)}` }}>
        <div style={{ color: T.muted, fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>BLUEPRINT READINESS</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ color: rCol(summary.readiness, T), fontSize: 26, fontWeight: 900, fontFamily: "monospace" }}>{summary.readiness}</span>
          <span style={{ color: T.muted, fontSize: 11 }}>/ 100</span>
          <span style={{ color: T.purple, fontSize: 10, marginLeft: "auto" }}>⚡ {summary.confidence}% conf</span>
        </div>
        <div style={{ height: 4, background: hex2rgba(T.violet, 0.15), borderRadius: 2, marginTop: 6 }}>
          <div
            style={{ height: "100%", width: `${summary.readiness}%`, background: `linear-gradient(90deg,${T.violet},${T.purple})`, borderRadius: 2 }}
          />
        </div>
      </div>
      <div style={{ background: hex2rgba(T.sky, 0.06), borderRadius: 5, padding: 10, border: `1px solid ${hex2rgba(T.sky, 0.18)}` }}>
        <div style={{ color: T.sky, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 5 }}>ENGINEERING VALIDATION</div>
        <div style={{ color: T.text, fontSize: 10, lineHeight: 1.55 }}>{summary.engineeringValidation}</div>
      </div>
      <div>
        <div style={{ color: T.amber, fontSize: 9, letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>UTILITY CONFLICTS</div>
        {summary.utilityConflicts.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
            <div
              style={{
                width: 3,
                minHeight: 14,
                flexShrink: 0,
                marginTop: 2,
                borderRadius: 2,
                background: c.includes("HIGH") ? T.red : c.includes("MEDIUM") ? T.amber : T.teal,
              }}
            />
            <div style={{ color: T.text, fontSize: 9.5, lineHeight: 1.45 }}>{c}</div>
          </div>
        ))}
      </div>
      <div style={{ background: hex2rgba(T.green, 0.06), borderRadius: 5, padding: 10, border: `1px solid ${hex2rgba(T.green, 0.18)}` }}>
        <div style={{ color: T.green, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 5 }}>CAPEX OPTIMIZATION</div>
        <div style={{ color: T.text, fontSize: 9.5, lineHeight: 1.5 }}>{summary.capexOptimization}</div>
      </div>
      <div>
        <div style={{ color: T.cyan, fontSize: 9, letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>RECOMMENDATIONS</div>
        {summary.recommendations.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
            <div style={{ color: T.cyan, fontSize: 9, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>{i + 1}.</div>
            <div style={{ color: T.text, fontSize: 9.5, lineHeight: 1.45 }}>{r}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Layer Panel ───────────────────────────────────────────────────── */
function LayerPanel({ active, setActive, T, night }) {
  return (
    <div
      style={{
        width: 170,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        background: night ? "rgba(4,10,22,0.65)" : "rgba(225,242,255,0.85)",
        border: `1px solid ${hex2rgba(T.sky, 0.16)}`,
        borderRadius: 8,
        padding: 10,
        overflowY: "auto",
      }}
    >
      <div style={{ color: T.sky, fontSize: 9, letterSpacing: 2, fontWeight: 700, marginBottom: 6, fontFamily: "monospace" }}>PLANNING LAYERS</div>
      {LAYER_TYPES.map((l) => {
        const isActive = active === l.id;
        return (
          <div
            key={l.id}
            onClick={() => setActive(l.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 9px",
              borderRadius: 5,
              cursor: "pointer",
              background: isActive ? hex2rgba(T.sky, 0.14) : "transparent",
              border: `1px solid ${isActive ? hex2rgba(T.sky, 0.45) : hex2rgba(T.sky, 0.08)}`,
              color: isActive ? T.sky : T.muted,
              fontSize: 11,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 12 }}>{l.icon}</span>
            <span>{l.label}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 10, borderTop: `1px solid ${hex2rgba(T.sky, 0.1)}`, paddingTop: 8 }}>
        <div style={{ color: T.muted, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>READINESS</div>
        {[
          ["≥ 80% Ready", T.green],
          ["60–79% Review", T.amber],
          ["< 60% Blocked", T.red],
        ].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 16, height: 3, background: c, borderRadius: 1 }} />
            <span style={{ color: T.muted, fontSize: 8.5 }}>{l}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, color: T.muted, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>ROAD TYPES</div>
        {[
          ["Main Boulevard", "#e2e8f0"],
          ["Truck Route", "#fbbf24"],
          ["Rail", "#a78bfa"],
          ["Emergency", "#ef4444"],
          ["Utility", "#fb923c"],
        ].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 16, height: 3, background: c, borderRadius: 1 }} />
            <span style={{ color: T.muted, fontSize: 8.5 }}>{l}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, color: T.muted, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>PHASES</div>
        {[
          ["Phase 1", T.sky],
          ["Phase 2", T.amber],
          ["Phase 3", T.violet],
        ].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 16, height: 3, background: c, borderRadius: 1 }} />
            <span style={{ color: T.muted, fontSize: 8.5 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KPI Bar ───────────────────────────────────────────────────────── */
function KPIBar({ plan, T, night, onExport }) {
  const { kpis } = plan;
  const TYPE_BADGE = { aerospace: "⚙ AEROSPACE", logistics: "🚚 LOGISTICS", innovation: "💡 INNOVATION", energy: "⚡ ENERGY" };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 14px",
        flexShrink: 0,
        background: night ? "rgba(3,8,18,0.9)" : "rgba(215,235,255,0.9)",
        borderBottom: `1px solid ${hex2rgba(T.sky, 0.18)}`,
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.sky, letterSpacing: 0.5 }}>{plan.name}</div>
          <div
            style={{
              padding: "2px 8px",
              borderRadius: 10,
              fontSize: 8,
              fontWeight: 800,
              background: hex2rgba(T.violet, 0.15),
              border: `1px solid ${hex2rgba(T.violet, 0.3)}`,
              color: T.purple,
              letterSpacing: 0.8,
            }}
          >
            {TYPE_BADGE[plan.type] || plan.type?.toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: 9.5, color: T.muted, marginTop: 2 }}>{plan.subtitle}</div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          ["Area", kpis.area],
          ["Power", kpis.power],
          ["Workers", kpis.workers.toLocaleString()],
          ["CAPEX", kpis.capex],
        ].map(([l, v]) => (
          <div
            key={l}
            style={{
              textAlign: "center",
              padding: "3px 10px",
              background: hex2rgba(T.sky, 0.07),
              borderRadius: 6,
              border: `1px solid ${hex2rgba(T.sky, 0.15)}`,
            }}
          >
            <div style={{ fontSize: 8, color: T.muted, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.sky, fontFamily: "monospace" }}>{v}</div>
          </div>
        ))}
        <div
          style={{
            textAlign: "center",
            padding: "3px 12px",
            background: hex2rgba(rCol(kpis.readiness, T), 0.12),
            borderRadius: 6,
            border: `1px solid ${hex2rgba(rCol(kpis.readiness, T), 0.35)}`,
          }}
        >
          <div style={{ fontSize: 8, color: T.muted, letterSpacing: 1 }}>READINESS</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: rCol(kpis.readiness, T), fontFamily: "monospace" }}>{kpis.readiness}%</div>
        </div>
        <button
          onClick={onExport}
          title="Download DXF — opens in AutoCAD / FreeCAD / QCAD"
          style={{
            padding: "5px 13px",
            background: hex2rgba(T.teal, 0.12),
            border: `1px solid ${hex2rgba(T.teal, 0.4)}`,
            borderRadius: 5,
            color: T.teal,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.6,
            fontFamily: "monospace",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = hex2rgba(T.teal, 0.24))}
          onMouseLeave={(e) => (e.currentTarget.style.background = hex2rgba(T.teal, 0.12))}
        >
          ⬇ EXPORT DXF
        </button>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */
export default function InfrastructureTwin({ siteId, siteName }) {
  const [night, setNight] = useState(() => document.body.getAttribute("data-theme") !== "light");
  useEffect(() => {
    const obs = new MutationObserver(() => setNight(document.body.getAttribute("data-theme") !== "light"));
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const { getParcelPolygon } = useSiteData();

  const T = night ? DARK : LIGHT;
  const siteKey = (siteId || "tacoma").toLowerCase();
  const plan = CAMPUS_PLANS[siteKey] || CAMPUS_PLANS.tacoma;

  /* Prefer the uploaded boundary (GeoJSON polygon / DXF-derived), fall back to static coords */
  const boundary = getParcelPolygon(siteId) || SITE_BOUNDARIES[siteKey] || SITE_BOUNDARIES.tacoma;

  const [selBuilding, setSelBuilding] = useState(null);
  const [activeLayer, setActiveLayer] = useState("all");
  const [viewMode, setViewMode] = useState("satellite");

  useEffect(() => {
    setSelBuilding(null);
    setActiveLayer("all");
  }, [siteId]);

  const selectedBuilding = plan.buildings.find((b) => b.id === selBuilding) || null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background: night
          ? "radial-gradient(ellipse at 30% 20%, #050e1f 0%, #03080f 60%, #020609 100%)"
          : "radial-gradient(ellipse at 30% 20%, #d4e8ff 0%, #e4f1ff 60%, #eef7ff 100%)",
        color: T.text,
        fontFamily: "'Segoe UI',monospace,sans-serif",
        overflow: "hidden",
      }}
    >
      <KPIBar plan={plan} T={T} night={night} onExport={() => downloadCAD(plan, boundary, siteKey)} />

      <div style={{ flex: 1, display: "flex", gap: 10, padding: 10, overflow: "hidden", minHeight: 0 }}>
        <LayerPanel active={activeLayer} setActive={setActiveLayer} T={T} night={night} />

        <div style={{ flex: 1, position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${hex2rgba(T.sky, 0.2)}` }}>
          {/* Download DXF button */}
          <button
            onClick={() => downloadCAD(plan, boundary, siteKey)}
            title="Download professional DXF master plan"
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 13px",
              background: night ? "rgba(20,184,166,0.18)" : "rgba(0,120,100,0.12)",
              border: `1px solid ${hex2rgba(T.teal, 0.55)}`,
              borderRadius: 7,
              color: T.teal,
              fontSize: 9,
              fontWeight: 900,
              fontFamily: "monospace",
              letterSpacing: "0.8px",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hex2rgba(T.teal, 0.28);
              e.currentTarget.style.borderColor = T.teal;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = night ? "rgba(20,184,166,0.18)" : "rgba(0,120,100,0.12)";
              e.currentTarget.style.borderColor = hex2rgba(T.teal, 0.55);
            }}
          >
            ⬇ DOWNLOAD DXF
          </button>

          {/* View mode toggle */}
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1000,
              display: "flex",
              gap: 4,
              background: night ? "rgba(3,8,18,0.88)" : "rgba(240,248,255,0.92)",
              border: `1px solid ${hex2rgba(T.sky, 0.22)}`,
              borderRadius: 7,
              padding: "3px 4px",
            }}
          >
            {[
              ["blueprint", "📐 BLUEPRINT"],
              ["map", "🛰 SATELLITE"],
            ].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "4px 11px",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: viewMode === mode ? hex2rgba(T.sky, 0.22) : "transparent",
                  border: `1px solid ${hex2rgba(T.sky, viewMode === mode ? 0.55 : 0.12)}`,
                  color: viewMode === mode ? T.sky : T.muted,
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {viewMode === "blueprint" ? (
            <BlueprintSVG plan={plan} T={T} night={night} selBuilding={selBuilding} setSelBuilding={setSelBuilding} activeLayer={activeLayer} />
          ) : (
            <CampusMapView
              plan={plan}
              boundary={boundary}
              siteKey={siteKey}
              selBuilding={selBuilding}
              setSelBuilding={setSelBuilding}
              activeLayer={activeLayer}
              T={T}
              night={night}
            />
          )}
          <BuildingDetailPanel building={selectedBuilding} T={T} night={night} onClose={() => setSelBuilding(null)} />
        </div>

        <AIPanel summary={plan.aiSummary} T={T} night={night} />
      </div>
    </div>
  );
}
