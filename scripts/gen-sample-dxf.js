/**
 * gen-sample-dxf.js
 * Generates professional sample DXF files for rnt001 and blm002.
 * Run: node scripts/gen-sample-dxf.js
 */

const fs   = require("fs");
const path = require("path");

/* ── Constants ──────────────────────────────────────────────────────── */
const LAT_FT = 364000;
function lonFt(lat) { return 364000 * Math.cos((lat * Math.PI) / 180); }

/* ── Coordinate utils ───────────────────────────────────────────────── */
function svgToLatLon(x, y, boundary) {
  const lats = boundary.map(([la]) => la), lons = boundary.map(([, lo]) => lo);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const pad = 6, scale = 100 - pad * 2;
  return [maxLat - ((y - pad) / scale) * (maxLat - minLat),
          ((x - pad) / scale) * (maxLon - minLon) + minLon];
}
function llToFt(lat, lon, cLat, cLon) {
  return [(lon - cLon) * lonFt(cLat), (lat - cLat) * LAT_FT];
}
function svgToFt(x, y, boundary, cLat, cLon) {
  const [la, lo] = svgToLatLon(x, y, boundary);
  return llToFt(la, lo, cLat, cLon);
}
function ptInPoly([lat, lon], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j];
    if (((yi > lat) !== (yj > lat)) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function clamp(corners, boundary) {
  const cLa = corners.reduce((s, [la]) => s + la, 0) / corners.length;
  const cLo = corners.reduce((s, [, lo]) => s + lo, 0) / corners.length;
  let out = corners;
  for (let i = 0; i < 50; i++) {
    if (out.every(c => ptInPoly(c, boundary))) return out;
    out = out.map(([la, lo]) => [la + (cLa - la) * 0.14, lo + (cLo - lo) * 0.14]);
  }
  return out;
}
function bldgPoly(b, boundary, cLat, cLon) {
  let corners;
  if (b.shape === "hex") {
    const { cx, cy, r, ry = r * 0.75 } = b;
    corners = Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 - 30) * Math.PI / 180;
      return svgToLatLon(cx + r * Math.cos(a), cy + ry * Math.sin(a), boundary);
    });
  } else if (b.shape === "ushape") {
    const { x, y, w, h, courtW, courtH } = b;
    const cl = x + (w - courtW) / 2;
    corners = [
      svgToLatLon(x, y, boundary), svgToLatLon(x + w, y, boundary),
      svgToLatLon(x + w, y + h, boundary), svgToLatLon(cl + courtW, y + h, boundary),
      svgToLatLon(cl + courtW, y + h - courtH, boundary), svgToLatLon(cl, y + h - courtH, boundary),
      svgToLatLon(cl, y + h, boundary), svgToLatLon(x, y + h, boundary),
    ];
  } else if (b.shape === "lshape") {
    const { x, y, w, h } = b, { side = "br", nw, nh } = b.notch || {};
    const pts = side === "br" ? [[x,y],[x+w,y],[x+w,y+h-nh],[x+w-nw,y+h-nh],[x+w-nw,y+h],[x,y+h]]
              : side === "tr" ? [[x,y],[x+w-nw,y],[x+w-nw,y+nh],[x+w,y+nh],[x+w,y+h],[x,y+h]]
              : side === "bl" ? [[x,y],[x+w,y],[x+w,y+h],[x+nw,y+h],[x+nw,y+h-nh],[x,y+h-nh]]
              : [[x+nw,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y+nh],[x+nw,y+nh]];
    corners = pts.map(([px, py]) => svgToLatLon(px, py, boundary));
  } else if (b.shape === "pts") {
    corners = b.pts.map(([px, py]) => svgToLatLon(px, py, boundary));
  } else {
    const { x, y, w, h } = b;
    corners = [[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([px,py]) => svgToLatLon(px,py,boundary));
  }
  return clamp(corners, boundary).map(([la,lo]) => llToFt(la,lo,cLat,cLon));
}

/* ── DXF entity helpers ─────────────────────────────────────────────── */
let _handle = 100;
function handle() { return (_handle++).toString(16).toUpperCase(); }

function lwpoly(pts, layer, closed = true, color = null, ltype = null) {
  let s = `  0\nLWPOLYLINE\n  5\n${handle()}\n100\nAcDbEntity\n  8\n${layer}\n`;
  if (color !== null) s += ` 62\n${color}\n`;
  if (ltype)          s += `  6\n${ltype}\n`;
  s += `100\nAcDbPolyline\n 90\n${pts.length}\n 70\n${closed ? 1 : 0}\n 43\n0.0\n`;
  for (const [x, y] of pts) s += ` 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n`;
  return s;
}
function hatchSolid(pts, layer, color) {
  const cx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
  const cy = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
  let s = `  0\nHATCH\n  5\n${handle()}\n100\nAcDbEntity\n  8\n${layer}\n 62\n${color}\n`;
  s += `100\nAcDbHatch\n 10\n0.0\n 20\n0.0\n 30\n0.0\n210\n0.0\n220\n0.0\n230\n1.0\n`;
  s += `  2\nSOLID\n 70\n1\n 71\n0\n 91\n1\n 92\n1\n 93\n${pts.length}\n 72\n2\n 73\n1\n 74\n0\n 93\n${pts.length}\n`;
  for (const [x, y] of pts) s += ` 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n`;
  s += ` 97\n0\n 75\n0\n 76\n1\n 52\n0.0\n 41\n1.0\n 73\n0\n 79\n0\n 98\n1\n`;
  s += ` 10\n${cx.toFixed(3)}\n 20\n${cy.toFixed(3)}\n`;
  return s;
}
function txt(str, x, y, h, layer, color = null, just = 0) {
  const t = String(str).replace(/[^\x20-\x7E]/g, "-").replace(/&/g, "+");
  let s = `  0\nTEXT\n  5\n${handle()}\n100\nAcDbEntity\n  8\n${layer}\n`;
  if (color !== null) s += ` 62\n${color}\n`;
  s += `100\nAcDbText\n 10\n${x.toFixed(3)}\n 20\n${y.toFixed(3)}\n 30\n0.0\n 40\n${h.toFixed(3)}\n  1\n${t}\n  7\nSTANDARD\n`;
  if (just) s += ` 72\n${just}\n 11\n${x.toFixed(3)}\n 21\n${y.toFixed(3)}\n`;
  return s;
}
function circ(cx, cy, r, layer, color = null) {
  let s = `  0\nCIRCLE\n  5\n${handle()}\n100\nAcDbEntity\n  8\n${layer}\n`;
  if (color !== null) s += ` 62\n${color}\n`;
  s += `100\nAcDbCircle\n 10\n${cx.toFixed(3)}\n 20\n${cy.toFixed(3)}\n 30\n0.0\n 40\n${r.toFixed(3)}\n`;
  return s;
}

/* ── Color map (SVG hex → DXF ACI) ─────────────────────────────────── */
const COLOR_MAP = {
  "#3b82f6":5, "#2563eb":5, "#1d4ed8":5, "#38bdf8":4, "#22d3ee":4, "#0891b2":4,
  "#0e7490":4, "#155e75":4, "#164e63":4, "#22c55e":3, "#16a34a":3, "#15803d":3,
  "#166534":3, "#4ade80":3, "#34d399":3, "#eab308":2, "#d97706":2, "#ca8a04":2,
  "#b45309":2, "#92400e":2, "#f97316":30, "#ea580c":30, "#c2410c":30, "#fb923c":30,
  "#7c3aed":6, "#6d28d9":6, "#5b21b6":6, "#8b5cf6":6, "#a855f7":6, "#818cf8":5,
  "#6366f1":5, "#ef4444":1, "#dc2626":1, "#6b7280":8, "#78716c":8, "#64748b":8,
  "#57534e":8, "#4b5563":8, "#fbbf24":2, "#a78bfa":6,
};
function aci(hex) { return COLOR_MAP[hex] || 7; }

/* ── Site data ──────────────────────────────────────────────────────── */
const BOUNDARIES = {
  rnt001: [[47.4885,-122.2232],[47.4880,-122.2112],[47.4838,-122.2098],[47.4775,-122.2108],[47.4770,-122.2232],[47.4808,-122.2248]],
  blm002: [[48.7582,-122.4858],[48.7576,-122.4716],[48.7530,-122.4706],[48.7458,-122.4722],[48.7455,-122.4858],[48.7492,-122.4874]],
};
const CENTERS = {
  rnt001: [47.4829, -122.2171],
  blm002: [48.7519, -122.4787],
};

const PLANS = {
  rnt001: {
    name:"Renton Advanced EV Manufacturing Campus",
    subtitle:"285 ac · PSE 115kV · BNSF East Valley Connector · SR-167 · Cedar River",
    kpis:{area:"285 ac",power:"PSE 115kV",workers:3800,capex:"$473M",readiness:90},
    zones:[
      {id:"logistics",  label:"LOGISTICS GATEWAY",       x:10,y:8, w:80,h:11,color:"#6b7280"},
      {id:"battery",    label:"BATTERY MANUFACTURING",   x:10,y:20,w:80,h:18,color:"#3b82f6"},
      {id:"assembly",   label:"EV ASSEMBLY DISTRICT",    x:10,y:39,w:80,h:17,color:"#38bdf8"},
      {id:"drivetrain", label:"DRIVETRAIN & POWERTRAIN", x:8, y:57,w:84,h:13,color:"#22d3ee"},
      {id:"rnd",        label:"R&D & ENGINEERING",       x:10,y:71,w:80,h:11,color:"#8b5cf6"},
      {id:"utility",    label:"UTILITY & SUSTAINABILITY",x:10,y:83,w:80,h:9, color:"#eab308"},
    ],
    buildings:[
      {id:"rail_gate",   label:"Rail & Truck Gateway",      x:13,y:9, w:25,h:8, color:"#7c3aed",type:"rail"},
      {id:"receiving",   label:"Receiving & Inspection",    x:43,y:9, w:20,h:8, color:"#64748b",type:"logistics"},
      {id:"warehouse",   label:"Component Warehouse",       x:68,y:9, w:20,h:8, color:"#64748b",type:"logistics"},
      {id:"cell_mfg",    label:"Battery Cell Manufacturing",x:11,y:21,w:32,h:14,color:"#3b82f6",type:"assembly"},
      {id:"module",      label:"Module & Pack Assembly",    x:48,y:21,w:30,h:14,color:"#2563eb",type:"assembly"},
      {id:"bms_lab",     label:"BMS & Electronics Lab",     shape:"hex",cx:85,cy:29,r:5,ry:3.8,color:"#818cf8",type:"tech"},
      {id:"press_shop",  label:"Stamping & Press Shop",     x:11,y:40,w:30,h:9, color:"#38bdf8",type:"mfg"},
      {id:"paint",       label:"Paint & Surface Treatment", x:46,y:40,w:28,h:9, color:"#0891b2",type:"mfg"},
      {id:"final_assy",  label:"FINAL EV ASSEMBLY LINE",    x:9, y:50,w:82,h:9, color:"#22d3ee",type:"assembly",isFAB:true},
      {id:"drivetrain_b",label:"Drivetrain Manufacturing",  x:11,y:59,w:34,h:9, color:"#0e7490",type:"assembly"},
      {id:"powertrain",  label:"Powertrain Integration",    x:50,y:59,w:30,h:9, color:"#155e75",type:"mfg"},
      {id:"vehi_test",   label:"Vehicle Test Track",        x:11,y:69,w:21,h:10,color:"#7c3aed",type:"hangar"},
      {id:"delivery_ctr",label:"Delivery Center",           x:37,y:69,w:23,h:10,color:"#6d28d9",type:"office"},
      {id:"rnd_center",  label:"R&D Center",                x:65,y:69,w:23,h:10,color:"#5b21b6",type:"research"},
      {id:"substation",  label:"PSE 115kV Substation",      x:11,y:84,w:12,h:7, color:"#ca8a04",type:"utility"},
      {id:"bess",        label:"Battery Energy Storage",    x:26,y:84,w:14,h:7, color:"#d97706",type:"energy"},
      {id:"solar_cp",    label:"Solar Carport Array",       x:44,y:84,w:14,h:7, color:"#b45309",type:"solar"},
      {id:"datacenter",  label:"Campus Data Center",        x:62,y:84,w:12,h:7, color:"#92400e",type:"tech"},
      {id:"emp_svc",     label:"Employee Services Hub",     x:77,y:84,w:11,h:7, color:"#166534",type:"office"},
      // Engineering HQ ushape
      {id:"eng_hq_l",    label:"Eng. HQ West",              x:11,y:72,w:12,h:8, color:"#8b5cf6",type:"office"},
      {id:"eng_hq_c",    label:"Eng. HQ Center",            x:25,y:72,w:20,h:8, color:"#7c3aed",type:"office"},
      {id:"eng_hq_r",    label:"Eng. HQ East",              x:47,y:72,w:12,h:8, color:"#8b5cf6",type:"office"},
    ],
    roads:[
      {type:"main",    pts:[[50,8],[50,92]],label:"Main Campus Drive"},
      {type:"main",    pts:[[10,19],[90,19]],label:"North Logistics Road"},
      {type:"main",    pts:[[10,38],[90,38]],label:"Battery Mfg Drive"},
      {type:"truck",   pts:[[10,49],[90,49]],label:"Assembly Truck Road"},
      {type:"main",    pts:[[10,68],[90,68]],label:"R&D & Test Drive"},
      {type:"main",    pts:[[10,83],[90,83]],label:"Utility Ring Road"},
      {type:"truck",   pts:[[10,19],[10,49]],label:"West Truck Corridor"},
      {type:"truck",   pts:[[90,19],[90,49]],label:"East Truck Corridor"},
      {type:"emergency",pts:[[11,8],[11,92]],label:"West Emergency"},
      {type:"emergency",pts:[[89,8],[89,92]],label:"East Emergency"},
      {type:"rail",    pts:[[13,8],[13,38]],label:"BNSF Rail Spur"},
    ],
    gates:[
      {x:50,y:8, label:"Main Gate North"},
      {x:13,y:8, label:"BNSF Rail Gate"},
      {x:10,y:49,label:"Truck Gate West"},
      {x:90,y:49,label:"Truck Gate East"},
      {x:50,y:92,label:"Employee Gate South"},
    ],
    infraLayers:["E-UTIL-POWR","T-RAIL","Z-ZONE-BATT","Z-SITE-SOLR","C-ROAD"],
  },

  blm002: {
    name:"Bellingham Aerospace Manufacturing Hub",
    subtitle:"380 ac · PSE 115kV · BNSF Rail · KBLI Airport Apron · I-5 / SR-539",
    kpis:{area:"380 ac",power:"PSE 115kV",workers:3200,capex:"$462M",readiness:88},
    zones:[
      {id:"gateway",   label:"TRUCK & RAIL GATEWAY",      x:25,y:8, w:50,h:10,color:"#6b7280"},
      {id:"component", label:"COMPONENT MANUFACTURING",   x:10,y:19,w:80,h:18,color:"#3b82f6"},
      {id:"assembly",  label:"AEROSPACE ASSEMBLY",        x:10,y:38,w:80,h:19,color:"#38bdf8"},
      {id:"flighttest",label:"FLIGHT TEST & DELIVERY",    x:8, y:58,w:84,h:12,color:"#8b5cf6"},
      {id:"engineering",label:"ENGINEERING & R&D",        x:10,y:71,w:80,h:11,color:"#22d3ee"},
      {id:"utility",   label:"UTILITY & SUPPORT",         x:10,y:83,w:80,h:9, color:"#eab308"},
    ],
    buildings:[
      {id:"rail_term",  label:"Rail Terminal",             x:11,y:9, w:22,h:8, color:"#7c3aed",type:"rail"},
      {id:"truck_gate", label:"Truck Gate Complex",        x:40,y:9, w:18,h:8, color:"#6b7280",type:"security"},
      {id:"air_log",    label:"Airport Logistics Hub",     x:64,y:9, w:24,h:8, color:"#0891b2",type:"logistics"},
      {id:"fuselage",   label:"Fuselage Manufacturing",    x:11,y:20,w:34,h:14,color:"#3b82f6",type:"assembly"},
      {id:"composite",  label:"Composite Manufacturing",   x:50,y:20,w:38,h:14,color:"#0891b2",type:"assembly"},
      {id:"precision",  label:"Precision Machine Shop",    x:11,y:35,w:20,h:5, color:"#2563eb",type:"mfg"},
      {id:"ndt_lab",    label:"NDT & Quality Lab",         x:36,y:35,w:16,h:5, color:"#1d4ed8",type:"tech"},
      {id:"major_assy", label:"MAJOR ASSEMBLY BUILDING",   x:9, y:39,w:82,h:11,color:"#22d3ee",type:"assembly",isFAB:true},
      {id:"paint_hgr",  label:"Paint Hangar",              x:11,y:51,w:22,h:9, color:"#7c3aed",type:"hangar"},
      {id:"ft_hangar",  label:"Flight Test Hangar",        x:38,y:51,w:26,h:9, color:"#6d28d9",type:"hangar"},
      {id:"delivery_ctr",label:"Delivery Center",          x:68,y:51,w:20,h:9, color:"#5b21b6",type:"office"},
      {id:"apron",      label:"Aircraft Apron & Taxiway",  x:9, y:61,w:82,h:3, color:"#4b5563",type:"yard"},
      {id:"ai_center",  label:"AI Digital Twin Center",    shape:"hex",cx:63,cy:77,r:6,ry:4.5,color:"#818cf8",type:"tech"},
      {id:"rnd_labs",   label:"R&D Laboratories",          x:76,y:72,w:13,h:11,color:"#6366f1",type:"research"},
      {id:"substation", label:"PSE 115kV Substation",      x:11,y:84,w:11,h:7, color:"#ca8a04",type:"utility"},
      {id:"datacenter", label:"Campus Data Center",        x:25,y:84,w:12,h:7, color:"#d97706",type:"tech"},
      {id:"arff",       label:"ARFF Fire Station",         x:41,y:84,w:8, h:7, color:"#b45309",type:"safety"},
      {id:"corp_hq",    label:"Corporate HQ",              x:53,y:84,w:13,h:7, color:"#16a34a",type:"office"},
      {id:"training",   label:"Training Academy",          x:70,y:84,w:11,h:7, color:"#15803d",type:"training"},
      {id:"emp_hub",    label:"Employee Services Hub",     x:83,y:84,w:6, h:7, color:"#166534",type:"office"},
      // Engineering HQ ushape
      {id:"eng_hq",     label:"Engineering Center West",   x:11,y:72,w:18,h:11,color:"#22d3ee",type:"office"},
      {id:"eng_hq_c",   label:"Engineering Center East",   x:32,y:72,w:10,h:11,color:"#0891b2",type:"office"},
    ],
    roads:[
      {type:"main",    pts:[[50,8],[50,92]],label:"Main Campus Boulevard"},
      {type:"main",    pts:[[10,18],[90,18]],label:"North Logistics Road"},
      {type:"main",    pts:[[10,37],[90,37]],label:"Component Mfg Drive"},
      {type:"truck",   pts:[[10,50],[90,50]],label:"Assembly Truck Road"},
      {type:"main",    pts:[[10,70],[90,70]],label:"Engineering Drive"},
      {type:"main",    pts:[[10,83],[90,83]],label:"Utility Ring Road"},
      {type:"truck",   pts:[[10,18],[10,50]],label:"West Truck Loop"},
      {type:"truck",   pts:[[90,18],[90,50]],label:"East Truck Loop"},
      {type:"rail",    pts:[[11,12],[11,37]],label:"BNSF Rail Spur"},
      {type:"emergency",pts:[[89,8],[89,92]],label:"East Emergency"},
    ],
    gates:[
      {x:20,y:8, label:"Rail Gate"},
      {x:50,y:8, label:"Main Truck Gate"},
      {x:78,y:8, label:"Airport Logistics"},
      {x:50,y:92,label:"Employee Gate South"},
    ],
    infraLayers:["E-UTIL-POWR","T-RAIL","Z-ZONE-HANGAR","C-ROAD"],
  },
};

/* ── DXF Header + Tables ─────────────────────────────────────────────── */
function dxfHeader(extMin, extMax) {
  return `  0\nSECTION\n  2\nHEADER\n`
    + `  9\n$ACADVER\n  1\nAC1015\n`
    + `  9\n$INSBASE\n 10\n0.0\n 20\n0.0\n 30\n0.0\n`
    + `  9\n$EXTMIN\n 10\n${extMin[0].toFixed(1)}\n 20\n${extMin[1].toFixed(1)}\n 30\n0.0\n`
    + `  9\n$EXTMAX\n 10\n${extMax[0].toFixed(1)}\n 20\n${extMax[1].toFixed(1)}\n 30\n0.0\n`
    + `  9\n$LUNITS\n 70\n2\n`
    + `  9\n$LUPREC\n 70\n2\n`
    + `  9\n$ANGBASE\n 50\n0.0\n`
    + `  9\n$MEASUREMENT\n 70\n1\n`
    + `  0\nENDSEC\n`;
}

function dxfTables(extraLayers) {
  const LAYERS = [
    ["BOUNDARY",     3,  "CONTINUOUS", 0.5],
    ["ZONES",        9,  "CONTINUOUS", 0.18],
    ["ZONE-LABELS",  7,  "CONTINUOUS", 0.0],
    ["A-BLDG-PROD",  4,  "CONTINUOUS", 0.25],
    ["A-BLDG-UTIL",  2,  "CONTINUOUS", 0.25],
    ["A-BLDG-OFFC",  3,  "CONTINUOUS", 0.25],
    ["A-BLDG",       5,  "CONTINUOUS", 0.25],
    ["A-BLDG-FILL",  254,"CONTINUOUS", 0.0],
    ["ROADS-MAIN",   7,  "CONTINUOUS", 0.35],
    ["ROADS-TRUCK",  2,  "DASHED",     0.25],
    ["ROADS-RAIL",   6,  "CENTER",     0.2],
    ["ROADS-EMERG",  1,  "DASHED",     0.18],
    ["GATES",        3,  "CONTINUOUS", 0.0],
    ["NORTH-ARROW",  7,  "CONTINUOUS", 0.0],
    ["TITLE-BLOCK",  7,  "CONTINUOUS", 0.0],
    ["ANNOTATION",   7,  "CONTINUOUS", 0.0],
    ...extraLayers.map(l => [l, 5, "CONTINUOUS", 0.0]),
  ];
  let s = `  0\nSECTION\n  2\nTABLES\n`;
  s += `  0\nTABLE\n  2\nLTYPE\n 70\n5\n`;
  s += `  0\nLTYPE\n  2\nCONTINUOUS\n 70\n0\n  3\nSolid\n 72\n65\n 73\n0\n 40\n0.0\n`;
  s += `  0\nLTYPE\n  2\nDASHED\n 70\n0\n  3\nDashed\n 72\n65\n 73\n2\n 40\n0.75\n 49\n0.5\n 49\n-0.25\n`;
  s += `  0\nLTYPE\n  2\nCENTER\n 70\n0\n  3\nCenter\n 72\n65\n 73\n4\n 40\n2.0\n 49\n1.25\n 49\n-0.25\n 49\n0.25\n 49\n-0.25\n`;
  s += `  0\nLTYPE\n  2\nDOT\n 70\n0\n  3\nDot\n 72\n65\n 73\n2\n 40\n0.5\n 49\n0.0\n 49\n-0.5\n`;
  s += `  0\nENDTAB\n`;
  s += `  0\nTABLE\n  2\nLAYER\n 70\n${LAYERS.length}\n`;
  for (const [name, color, ltype, lw] of LAYERS) {
    s += `  0\nLAYER\n  2\n${name}\n 70\n0\n 62\n${color}\n  6\n${ltype}\n 370\n${Math.round(lw*100)}\n`;
  }
  s += `  0\nENDTAB\n`;
  s += `  0\nTABLE\n  2\nSTYLE\n 70\n1\n`;
  s += `  0\nSTYLE\n  2\nSTANDARD\n 70\n0\n 40\n0.0\n 41\n1.0\n 50\n0.0\n 71\n0\n 42\n2.5\n  3\ntxt\n  4\n\n`;
  s += `  0\nENDTAB\n  0\nENDSEC\n`;
  return s;
}

/* ── Road layer map ─────────────────────────────────────────────────── */
const ROAD_LAYER = { main:"ROADS-MAIN", campus:"ROADS-MAIN", truck:"ROADS-TRUCK", rail:"ROADS-RAIL", emergency:"ROADS-EMERG" };
const ROAD_COLOR = { main:7, campus:7, truck:2, rail:6, emergency:1 };

/* ── Building type → layer ──────────────────────────────────────────── */
function bldgLayer(b) {
  if (["assembly","hangar","mfg","rail"].includes(b.type)) return "A-BLDG-PROD";
  if (["utility","energy","solar","safety","tech","storage"].includes(b.type)) return "A-BLDG-UTIL";
  if (["office","training","research","security"].includes(b.type)) return "A-BLDG-OFFC";
  return "A-BLDG";
}

/* ── Main generator ─────────────────────────────────────────────────── */
function generateDXF(siteKey) {
  _handle = 200;
  const plan     = PLANS[siteKey];
  const boundary = BOUNDARIES[siteKey];
  const [cLat, cLon] = CENTERS[siteKey];

  /* Convert boundary to local feet */
  const bndrFt = boundary.map(([la, lo]) => llToFt(la, lo, cLat, cLon));
  const allX   = bndrFt.map(([x]) => x), allY = bndrFt.map(([, y]) => y);
  const siteW  = Math.max(...allX) - Math.min(...allX);
  const siteH  = Math.max(...allY) - Math.min(...allY);
  const pad    = siteW * 0.12;

  let ent = "";

  /* ── Site boundary (triple-line) ── */
  ent += lwpoly(bndrFt, "BOUNDARY", true, 3);
  ent += lwpoly(bndrFt.map(([x, y]) => [x + 6, y + 6]), "BOUNDARY", true, 3);
  ent += lwpoly(bndrFt.map(([x, y]) => [x - 6, y - 6]), "BOUNDARY", true, 8);
  ent += txt(`SITE BOUNDARY — ${plan.kpis.area}`,
    bndrFt[0][0], bndrFt[0][1] + siteH * 0.03, siteW * 0.012, "BOUNDARY", 3);

  /* ── Zones ── */
  for (const z of plan.zones) {
    const corners = [[z.x,z.y],[z.x+z.w,z.y],[z.x+z.w,z.y+z.h],[z.x,z.y+z.h]]
      .map(([sx,sy]) => svgToFt(sx, sy, boundary, cLat, cLon));
    const col = aci(z.color);
    ent += hatchSolid(corners, "ZONES", col);
    ent += lwpoly(corners, "ZONES", true, col, "DASHED");
    const cx = corners.reduce((s,[x])=>s+x,0)/corners.length;
    const cy = corners.reduce((s,[,y])=>s+y,0)/corners.length;
    ent += txt(z.label, cx, cy + siteH * 0.016, siteW * 0.009, "ZONE-LABELS", 7, 1);
  }

  /* ── Buildings ── */
  for (const b of plan.buildings) {
    const pts  = bldgPoly(b, boundary, cLat, cLon);
    const col  = aci(b.color);
    const lyr  = bldgLayer(b);
    ent += hatchSolid(pts, lyr, col);
    ent += lwpoly(pts, lyr, true, col);
    /* FAB extra thick outline */
    if (b.isFAB) {
      ent += lwpoly(pts, lyr, true, 7);
    }
    /* Label */
    const cx = pts.reduce((s,[x])=>s+x,0)/pts.length;
    const cy = pts.reduce((s,[,y])=>s+y,0)/pts.length;
    const fs = siteW * 0.007;
    ent += txt(b.label.split(" ").slice(0,3).join(" "), cx, cy - fs*0.4, fs, "ANNOTATION", 7, 1);
  }

  /* ── Roads ── */
  for (const r of plan.roads) {
    const pts = r.pts.map(([sx,sy]) => svgToFt(sx, sy, boundary, cLat, cLon));
    const rl  = ROAD_LAYER[r.type] || "ROADS-MAIN";
    const rc  = ROAD_COLOR[r.type] || 7;
    ent += lwpoly(pts, rl, false, rc);
  }

  /* ── Gates ── */
  const gateR = siteW * 0.009;
  for (const g of plan.gates) {
    const [gx, gy] = svgToFt(g.x, g.y, boundary, cLat, cLon);
    ent += circ(gx, gy, gateR, "GATES", 3);
    ent += circ(gx, gy, gateR * 0.55, "GATES", 3);
    ent += txt(g.label, gx, gy + gateR * 1.6, siteW * 0.0065, "GATES", 3, 1);
  }

  /* ── Infrastructure layers (triggers parser flags) ── */
  for (const layer of plan.infraLayers) {
    const [ax, ay] = svgToFt(8, 8, boundary, cLat, cLon);
    const [bx, by] = svgToFt(92, 8, boundary, cLat, cLon);
    ent += lwpoly([[ax,ay],[bx,by]], layer, false, 5);
  }

  /* ── North arrow ── */
  const naX = Math.max(...allX) + pad * 0.5, naY = Math.max(...allY);
  const naH = siteH * 0.09;
  ent += lwpoly([[naX,naY],[naX,naY+naH]], "NORTH-ARROW", false, 7);
  ent += lwpoly([[naX,naY+naH],[naX-naH*0.2,naY+naH*0.55],[naX,naY+naH*0.7],[naX+naH*0.2,naY+naH*0.55]], "NORTH-ARROW", true, 7);
  ent += txt("N", naX, naY + naH * 1.1, naH * 0.5, "NORTH-ARROW", 7, 1);

  /* ── Title block ── */
  const tbX0 = Math.min(...allX) - pad, tbY0 = Math.min(...allY) - pad * 1.6;
  const tbW  = siteW + pad * 2;
  ent += lwpoly([[tbX0,tbY0],[tbX0+tbW,tbY0],[tbX0+tbW,tbY0+pad*1.3],[tbX0,tbY0+pad*1.3]], "TITLE-BLOCK", true, 7);
  ent += lwpoly([[tbX0,tbY0+pad*0.85],[tbX0+tbW,tbY0+pad*0.85]], "TITLE-BLOCK", false, 8);
  ent += lwpoly([[tbX0+tbW*0.6,tbY0],[tbX0+tbW*0.6,tbY0+pad*1.3]], "TITLE-BLOCK", false, 8);

  const fs1 = tbW * 0.018, fs2 = tbW * 0.011, fs3 = tbW * 0.008;
  ent += txt(plan.name.toUpperCase(), tbX0 + tbW * 0.01, tbY0 + pad * 1.05, fs1, "TITLE-BLOCK", 7);
  ent += txt(plan.subtitle, tbX0 + tbW * 0.01, tbY0 + pad * 0.65, fs2, "TITLE-BLOCK", 8);
  ent += txt(`AREA: ${plan.kpis.area}   POWER: ${plan.kpis.power}   WORKERS: ${plan.kpis.workers.toLocaleString()}   CAPEX: ${plan.kpis.capex}   READINESS: ${plan.kpis.readiness}%`,
    tbX0 + tbW * 0.01, tbY0 + pad * 0.38, fs3, "TITLE-BLOCK", 8);

  const kx = tbX0 + tbW * 0.62;
  ent += txt("BLUEPRINT INTELLIGENCE", kx, tbY0 + pad * 1.05, fs2, "TITLE-BLOCK", 7);
  ent += txt("Astrikos AI Platform", kx, tbY0 + pad * 0.65, fs3, "TITLE-BLOCK", 8);
  ent += txt(`Export: ${new Date().toISOString().split("T")[0]}   Units: Feet   CRS: WGS84`, kx, tbY0 + pad * 0.38, fs3, "TITLE-BLOCK", 8);

  /* ── Scale bar ── */
  const sbLen = siteW * 0.25, sbX = tbX0 + tbW * 0.01, sbY = tbY0 + pad * 0.12;
  ent += lwpoly([[sbX,sbY],[sbX+sbLen,sbY]], "TITLE-BLOCK", false, 7);
  for (const tick of [sbX, sbX+sbLen/2, sbX+sbLen]) {
    ent += lwpoly([[tick,sbY-sbLen*0.02],[tick,sbY+sbLen*0.02]], "TITLE-BLOCK", false, 7);
  }
  ent += lwpoly([[sbX,sbY-sbLen*0.02],[sbX+sbLen/2,sbY-sbLen*0.02],[sbX+sbLen/2,sbY+sbLen*0.02],[sbX,sbY+sbLen*0.02]], "TITLE-BLOCK", true, 254);
  ent += txt("0", sbX, sbY + sbLen * 0.04, sbLen * 0.035, "TITLE-BLOCK", 7, 1);
  ent += txt(`${Math.round(sbLen/2)} ft`, sbX+sbLen/2, sbY+sbLen*0.04, sbLen*0.035, "TITLE-BLOCK", 7, 1);
  ent += txt(`${Math.round(sbLen)} ft`, sbX+sbLen, sbY+sbLen*0.04, sbLen*0.035, "TITLE-BLOCK", 7, 1);

  /* ── DXF file ── */
  const extMin = [Math.min(...allX)-pad*1.1, tbY0 - pad*0.2];
  const extMax = [Math.max(...allX)+pad*0.7, Math.max(...allY)+pad*0.3];

  return dxfHeader(extMin, extMax)
    + dxfTables(plan.infraLayers)
    + `  0\nSECTION\n  2\nENTITIES\n`
    + ent
    + `  0\nENDSEC\n  0\nEOF\n`;
}

/* ── Write files ─────────────────────────────────────────────────────── */
const OUT_DIRS = [
  path.join(__dirname, "../public/samples"),
  path.join(__dirname, "../dist/samples"),
];

for (const dir of OUT_DIRS) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const siteKey of ["rnt001", "blm002"]) {
  const prefix = siteKey === "rnt001" ? "rnt_001" : "blm_002";
  const dxf = generateDXF(siteKey);
  for (const dir of OUT_DIRS) {
    const outPath = path.join(dir, `${prefix}_masterplan.dxf`);
    fs.writeFileSync(outPath, dxf, "utf8");
    console.log(`✓ ${outPath} (${(dxf.length/1024).toFixed(0)} KB)`);
  }
}
console.log("Done.");
