/* =====================================================================
   FacilityPlanner — Aerospace Facility Layout & Building Intelligence
   Uses same site boundaries as SiteEnvironmental; shows only green
   (vhigh + high suitability) zones and places all 16 aerospace
   building categories within them.
   ===================================================================== */
import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSite } from "../../context/SiteContext.jsx";

/* ── Dark theme tokens ──────────────────────────────────────────────── */
const D = {
  bg: "#02060c", panel: "#050e1a", card: "#071222",
  border: "rgba(56,189,248,0.12)", text: "#d0eaff", muted: "#4e7a9a",
  sky: "#38bdf8", cyan: "#22d3ee", green: "#22c55e", amber: "#f59e0b",
  red: "#ef4444", violet: "#8b5cf6", purple: "#a855f7", teal: "#14b8a6",
  blue: "#3b82f6", pink: "#ec4899",
};

/* ── 16 Aerospace Building Type Definitions ─────────────────────────── */
const BLDG_TYPES = {
  assembly:  {
    label: "Main Aircraft Assembly",     color: "#22c55e",
    sqft: "280,000 sqft", personnel: 1200, capex: "$145M", energy: "18.4 MW",
    desc: "Primary airframe final assembly hall. 80 ft clear height, 50-ton overhead crane, FOD-controlled floor, class-A vibration isolation, pressurized test stations.",
    features: ["FAA-compliant climate control", "50T overhead cranes", "ESD flooring", "Pressurized test stations"],
  },
  component: {
    label: "Component Manufacturing",    color: "#38bdf8",
    sqft: "120,000 sqft", personnel: 480, capex: "$62M", energy: "7.2 MW",
    desc: "Sub-assembly production: fuselage sections, wing spars, bulkheads. CNC 5-axis machining, composite layup bays, autoclave curing.",
    features: ["CNC 5-axis machining", "Composite autoclave", "Metrology lab", "Avionics clean room"],
  },
  warehouse: {
    label: "Warehouse & Logistics",      color: "#a78bfa",
    sqft: "85,000 sqft", personnel: 120, capex: "$28M", energy: "2.1 MW",
    desc: "High-bay automated storage, inbound inspection docks, JIT supply chain hub. 48 dock doors, ASRS racking to 40 ft.",
    features: ["ASRS robotic storage", "48 dock doors", "ERP integration", "Customs-bonded zone"],
  },
  paint:     {
    label: "Paint & Finish Hangar",      color: "#f472b6",
    sqft: "42,000 sqft", personnel: 85, capex: "$32M", energy: "4.8 MW",
    desc: "Climate-controlled finishing bays. HVAC for temperature/humidity, overspray HEPA filtration, VOC abatement system to <25 lbs/day.",
    features: ["VOC abatement system", "HEPA filtration", "4 independent bays", "FAA AC 43.13 compliance"],
  },
  mro:       {
    label: "MRO / Aircraft Hangars",     color: "#34d399",
    sqft: "110,000 sqft", personnel: 340, capex: "$55M", energy: "5.6 MW",
    desc: "Maintenance, Repair & Overhaul facility. Heavy maintenance capability, FAA Part 145 Repair Station certification, engine shop, non-destructive testing.",
    features: ["FAA Part 145 certified", "Widebody aircraft capable", "Engine shop bay", "NDT lab"],
  },
  rnd:       {
    label: "R&D Center",                 color: "#818cf8",
    sqft: "55,000 sqft", personnel: 220, capex: "$48M", energy: "3.2 MW",
    desc: "Applied aerospace research. Composites development, wind tunnel simulation, propulsion test rigs, digital twin modeling center.",
    features: ["Anechoic test chamber", "Composites R&D lab", "Simulation suite", "ISO 17025 calibration lab"],
  },
  office:    {
    label: "Engineering & Office HQ",    color: "#a5b4fc",
    sqft: "68,000 sqft", personnel: 650, capex: "$22M", energy: "2.8 MW",
    desc: "Program management, structural engineering, systems integration, flight sciences. SCIF-certified sections for classified programs.",
    features: ["SCIF-certified floor", "PLM workstation cluster", "500-seat conference", "Customer briefing suite"],
  },
  mission:   {
    label: "Mission Control / Ops",      color: "#c084fc",
    sqft: "14,000 sqft", personnel: 45, capex: "$18M", energy: "1.6 MW",
    desc: "24/7 flight test operations command, real-time telemetry display wall, range safety console, airspace coordination. Dual-redundant power.",
    features: ["Real-time telemetry wall", "Range safety console", "Dual-redundant power", "Satellite uplink"],
  },
  qa:        {
    label: "Quality Inspection Lab",     color: "#4ade80",
    sqft: "32,000 sqft", personnel: 110, capex: "$26M", energy: "2.4 MW",
    desc: "Dimensional inspection (CMM), NDT (UT/ET/RT), materials testing, FAA-approved First Article Inspection. AS9100D / NADCAP certified.",
    features: ["CMM inspection suite", "X-ray / CT scanning", "Materials testing lab", "NADCAP-certified NDT"],
  },
  engine:    {
    label: "Engine Test Facility",       color: "#fb923c",
    sqft: "28,000 sqft", personnel: 65, capex: "$85M", energy: "12.0 MW",
    desc: "High-bypass turbofan test cells. 250 dB acoustic isolation, thrust up to 120,000 lbf. Jet-A fuel farm (500k gal), water injection suppression.",
    features: ["250 dB acoustic isolation", "120,000 lbf thrust capacity", "500k gallon fuel farm", "Blast deflectors"],
  },
  airfield:  {
    label: "Flight Test / Apron",        color: "#94a3b8",
    sqft: "420,000 sqft", personnel: 30, capex: "$78M", energy: "0.8 MW",
    desc: "Concrete apron for aircraft parking, ground run-up, pre/post-flight ops. Dedicated taxiway to active runway. FAA Form 7460 filed.",
    features: ["68 aircraft parking stands", "Jet blast deflectors", "MALSR lighting system", "Fueling hydrant"],
  },
  utility:   {
    label: "Utility & Infrastructure",   color: "#fbbf24",
    sqft: "18,000 sqft", personnel: 25, capex: "$42M", energy: "— (source)",
    desc: "Primary substation (2×25 MVA transformers), chilled water plant (2,000 RT), compressed air grid, industrial wastewater pre-treatment, fire suppression.",
    features: ["50 MVA primary substation", "2,000 RT chiller plant", "Fire suppression tank", "Industrial WW pre-treatment"],
  },
  security:  {
    label: "Security & Safety Ops",      color: "#ef4444",
    sqft: "8,000 sqft", personnel: 60, capex: "$6M", energy: "0.3 MW",
    desc: "Perimeter access control, vehicle inspection, guard posts, ARFF Class 4 fire station, CCTV operations center, emergency coordination room.",
    features: ["ARFF Class 4 fire station", "Vehicle bomb inspection", "Perimeter IDS/CCTV", "Emergency coordination"],
  },
  employee:  {
    label: "Employee Facilities",        color: "#e879f9",
    sqft: "38,000 sqft", personnel: 200, capex: "$14M", energy: "1.2 MW",
    desc: "Central campus hub: 1,200-seat cafeteria, fitness center, medical clinic, childcare, locker rooms, transit hub for 3,000 employees.",
    features: ["1,200-seat cafeteria", "Medical clinic", "Childcare center", "200 EV charging spaces"],
  },
  solar:     {
    label: "Sustainability / Solar",     color: "#86efac",
    sqft: "200,000 sqft", personnel: 8, capex: "$38M", energy: "−14.5 MW gen",
    desc: "28 MW rooftop + carport solar array (bifacial 580 W modules), 8 MWh BESS, rainwater harvest (4.8M L/yr). LEED Platinum target.",
    features: ["28 MW solar generation", "8 MWh BESS storage", "Rainwater harvest", "LEED Platinum target"],
  },
  hardstand: {
    label: "Outdoor Industrial Areas",  color: "#64748b",
    sqft: "320,000 sqft", personnel: 0, capex: "$12M", energy: "—",
    desc: "Aircraft tow-out staging, fuselage jig storage, wide-body component laydown, water-blast test area, contractor staging yards.",
    features: ["150-ton heavy haul road", "Fuselage jig storage", "Water-blast test area", "Contractor lay-down yard"],
  },
};

/* ── Facility Plans (boundary + green zones + 16 buildings per site) ── */
const FACILITY_PLANS = {
  everett: {
    name: "Everett Aerospace Manufacturing Campus",
    region: "Everett, WA — 480 Acres",
    aiScore: 91,
    boundary: [
      [47.9787,-122.1875],[47.9717,-122.1935],[47.9689,-122.1970],
      [47.9638,-122.1977],[47.9558,-122.1971],[47.9542,-122.1953],
      [47.9416,-122.1937],[47.9424,-122.1602],[47.9424,-122.1202],
      [47.9491,-122.1202],[47.9492,-122.1152],[47.9544,-122.1150],
      [47.9556,-122.1174],[47.9590,-122.1222],[47.9618,-122.1250],
      [47.9657,-122.1297],[47.9713,-122.1351],[47.9788,-122.1381],
    ],
    greenZones: [
      { id:"gz1", suit:"vhigh", label:"Aerospace Assembly Zone", color:"#22c55e",
        pts:[[16,18],[72,18],[74,30],[72,64],[16,64],[14,46],[14,30]] },
      { id:"gz2", suit:"high",  label:"SR-526 Logistics Corridor", color:"#86efac",
        pts:[[72,18],[88,18],[88,30],[86,64],[78,64],[72,64],[74,30]] },
    ],
    buildings: [
      { id:"b1",  type:"security",  x:16, y:20, w:4,  h:7,  label:"Security & Entry Control" },
      { id:"b2",  type:"office",    x:21, y:20, w:18, h:7,  label:"Engineering HQ" },
      { id:"b3",  type:"rnd",       x:41, y:20, w:15, h:7,  label:"Applied Research Center" },
      { id:"b4",  type:"mission",   x:58, y:20, w:12, h:7,  label:"Mission Control / Ops" },
      { id:"b5",  type:"component", x:16, y:29, w:22, h:12, label:"Component Manufacturing" },
      { id:"b6",  type:"assembly",  x:40, y:29, w:30, h:12, label:"Final Assembly Hall" },
      { id:"b7",  type:"warehouse", x:73, y:20, w:13, h:18, label:"Warehouse & Logistics Hub" },
      { id:"b8",  type:"mro",       x:16, y:43, w:18, h:10, label:"MRO & Overhaul Facility" },
      { id:"b9",  type:"paint",     x:36, y:43, w:14, h:10, label:"Paint & Finish Hangar" },
      { id:"b10", type:"qa",        x:52, y:43, w:10, h:10, label:"Quality Inspection Lab" },
      { id:"b11", type:"employee",  x:64, y:43, w:7,  h:10, label:"Employee Campus Hub" },
      { id:"b12", type:"utility",   x:73, y:40, w:13, h:12, label:"Utility & Substation" },
      { id:"b13", type:"engine",    x:16, y:55, w:13, h:8,  label:"Engine Test Cells" },
      { id:"b14", type:"airfield",  x:31, y:55, w:26, h:8,  label:"Flight Apron & Taxiway" },
      { id:"b15", type:"hardstand", x:59, y:55, w:11, h:8,  label:"Outdoor Staging Area" },
      { id:"b16", type:"solar",     x:73, y:54, w:13, h:9,  label:"Solar Array & BESS" },
    ],
    stats: { totalArea:"480 acres", sqft:"~1.52M sqft", personnel:"2,850", capex:"~$598M", timeline:"42–54 months" },
  },

  tacoma: {
    name: "Tacoma Port Manufacturing Hub",
    region: "Tacoma, WA — 320 Acres",
    aiScore: 87,
    boundary: [
      [47.1410373,-122.5161645],[47.1387507,-122.5096691],
      [47.1391383,-122.5035156],[47.1339058,-122.4979318],
      [47.1230905,-122.5006098],[47.1228579,-122.5058517],
      [47.126502, -122.5120052],[47.127161, -122.5165633],
      [47.1283628,-122.519982], [47.134526, -122.5215773],
      [47.137279, -122.517841], [47.1389456,-122.52012],
      [47.1403796,-122.5154479],
    ],
    greenZones: [
      { id:"gz1", suit:"vhigh", label:"Core Manufacturing Platform", color:"#22c55e",
        pts:[[24,18],[70,18],[72,28],[70,64],[24,64],[22,46],[22,28]] },
      { id:"gz2", suit:"high",  label:"BNSF Rail Logistics Zone", color:"#86efac",
        pts:[[12,18],[24,18],[22,28],[22,46],[24,64],[12,64]] },
      { id:"gz3", suit:"high",  label:"SR-509 Intermodal Hub", color:"#86efac",
        pts:[[70,18],[88,18],[88,30],[86,64],[78,64],[70,64],[72,28]] },
    ],
    buildings: [
      { id:"b1",  type:"security",  x:13, y:20, w:4,  h:5,  label:"Rail Security Gate" },
      { id:"b2",  type:"employee",  x:13, y:27, w:7,  h:9,  label:"Employee Facilities" },
      { id:"b3",  type:"office",    x:26, y:20, w:16, h:7,  label:"Engineering HQ" },
      { id:"b4",  type:"rnd",       x:44, y:20, w:13, h:7,  label:"R&D Center" },
      { id:"b5",  type:"mission",   x:59, y:20, w:9,  h:7,  label:"Operations Control" },
      { id:"b6",  type:"assembly",  x:26, y:29, w:28, h:14, label:"Assembly Hall A" },
      { id:"b7",  type:"component", x:56, y:29, w:12, h:14, label:"Component Mfg" },
      { id:"b8",  type:"warehouse", x:72, y:20, w:13, h:18, label:"SR-509 Freight Hub" },
      { id:"b9",  type:"mro",       x:26, y:45, w:16, h:11, label:"MRO Hangar" },
      { id:"b10", type:"paint",     x:44, y:45, w:12, h:11, label:"Paint Facility" },
      { id:"b11", type:"qa",        x:58, y:45, w:9,  h:11, label:"QA Lab" },
      { id:"b12", type:"utility",   x:72, y:40, w:13, h:11, label:"Utility Hub (PSE)" },
      { id:"b13", type:"engine",    x:26, y:58, w:12, h:5,  label:"Engine Test Cell" },
      { id:"b14", type:"airfield",  x:40, y:57, w:22, h:6,  label:"Cargo Apron" },
      { id:"b15", type:"hardstand", x:64, y:57, w:5,  h:6,  label:"Port Staging Area" },
      { id:"b16", type:"solar",     x:72, y:53, w:13, h:8,  label:"Rooftop Solar Array" },
    ],
    stats: { totalArea:"320 acres", sqft:"~1.15M sqft", personnel:"2,450", capex:"~$542M", timeline:"36–48 months" },
  },

  spokane: {
    name: "Spokane Valley Industrial Corridor",
    region: "Spokane, WA — 260 Acres",
    aiScore: 83,
    boundary: [
      [47.6124,-117.4642],[47.6123,-117.4311],[47.6184,-117.4200],
      [47.6206,-117.4261],[47.6239,-117.4293],[47.6286,-117.4294],
      [47.6330,-117.4308],[47.6389,-117.4350],[47.6409,-117.4401],
      [47.6463,-117.4432],[47.6510,-117.4461],[47.6543,-117.4498],
      [47.6606,-117.4528],[47.6663,-117.4581],[47.6515,-117.4861],
      [47.6456,-117.4849],[47.6478,-117.4758],[47.6382,-117.4723],
      [47.6249,-117.4759],
    ],
    greenZones: [
      { id:"gz1", suit:"vhigh", label:"Prime Industrial Zone", color:"#22c55e",
        pts:[[12,18],[76,18],[78,28],[76,64],[12,64],[10,46],[10,28]] },
      { id:"gz2", suit:"high",  label:"BNSF Intermodal Corridor", color:"#86efac",
        pts:[[76,18],[88,18],[88,30],[86,64],[80,64],[76,64],[78,28]] },
    ],
    buildings: [
      { id:"b1",  type:"security",  x:12, y:20, w:4,  h:6,  label:"Security Gate" },
      { id:"b2",  type:"office",    x:18, y:20, w:18, h:7,  label:"Engineering & Admin HQ" },
      { id:"b3",  type:"rnd",       x:38, y:20, w:16, h:7,  label:"R&D & Simulation Center" },
      { id:"b4",  type:"mission",   x:56, y:20, w:12, h:7,  label:"Operations Center" },
      { id:"b5",  type:"assembly",  x:12, y:29, w:28, h:13, label:"Assembly Hall 1" },
      { id:"b6",  type:"component", x:42, y:29, w:24, h:13, label:"Component Manufacturing" },
      { id:"b7",  type:"warehouse", x:78, y:20, w:8,  h:20, label:"BNSF Freight Terminal" },
      { id:"b8",  type:"mro",       x:12, y:44, w:18, h:11, label:"MRO Hangar" },
      { id:"b9",  type:"paint",     x:32, y:44, w:14, h:11, label:"Paint Hangar" },
      { id:"b10", type:"qa",        x:48, y:44, w:10, h:11, label:"QA Inspection Lab" },
      { id:"b11", type:"employee",  x:60, y:44, w:10, h:11, label:"Employee Hub" },
      { id:"b12", type:"utility",   x:78, y:42, w:8,  h:11, label:"Avista Substation" },
      { id:"b13", type:"engine",    x:12, y:57, w:14, h:6,  label:"Engine Test Cells" },
      { id:"b14", type:"airfield",  x:28, y:57, w:24, h:6,  label:"Test Apron" },
      { id:"b15", type:"hardstand", x:54, y:57, w:16, h:6,  label:"Industrial Staging" },
      { id:"b16", type:"solar",     x:78, y:55, w:8,  h:8,  label:"Solar Array (800 kW)" },
    ],
    stats: { totalArea:"260 acres", sqft:"~0.92M sqft", personnel:"2,100", capex:"~$438M", timeline:"34–44 months" },
  },

  yakima: {
    name: "Yakima Valley Renewable Energy Site",
    region: "Yakima, WA — 190 Acres",
    aiScore: 79,
    boundary: [
      [46.5893,-120.6042],[46.5857,-120.6044],[46.5855,-120.5938],
      [46.5711,-120.5937],[46.5713,-120.5745],[46.5726,-120.5726],
      [46.5752,-120.5723],[46.5766,-120.5714],[46.5776,-120.5725],
      [46.5854,-120.5725],[46.5855,-120.5791],[46.5890,-120.5791],
      [46.5893,-120.5888],[46.5927,-120.5886],[46.5929,-120.5978],
      [46.5894,-120.5978],
    ],
    greenZones: [
      { id:"gz1", suit:"high",  label:"Valley Processing Hub", color:"#86efac",
        pts:[[22,18],[54,18],[54,64],[22,64],[20,46],[20,28]] },
      { id:"gz2", suit:"vhigh", label:"Prime Solar Array Zone", color:"#22c55e",
        pts:[[54,18],[76,18],[78,28],[76,64],[54,64]] },
    ],
    buildings: [
      { id:"b1",  type:"security",  x:22, y:20, w:4,  h:7,  label:"Site Security Gate" },
      { id:"b2",  type:"office",    x:27, y:20, w:14, h:7,  label:"Operations HQ" },
      { id:"b4",  type:"rnd",       x:42, y:20, w:10, h:7,  label:"Solar R&D Lab" },
      { id:"b3",  type:"assembly",  x:22, y:29, w:18, h:11, label:"Processing Assembly Hall" },
      { id:"b6",  type:"warehouse", x:41, y:29, w:11, h:11, label:"Cold Storage Warehouse" },
      { id:"b5",  type:"component", x:22, y:42, w:14, h:10, label:"Component Workshop" },
      { id:"b7",  type:"mission",   x:37, y:42, w:8,  h:10, label:"Grid Control Room" },
      { id:"b10", type:"paint",     x:46, y:42, w:6,  h:10, label:"Surface Treatment Bay" },
      { id:"b8",  type:"employee",  x:22, y:54, w:12, h:8,  label:"Employee Center" },
      { id:"b9",  type:"mro",       x:35, y:54, w:10, h:8,  label:"Maintenance Facility" },
      { id:"b15", type:"engine",    x:46, y:54, w:6,  h:8,  label:"Process Test Rig" },
      { id:"b11", type:"solar",     x:55, y:20, w:18, h:20, label:"28 MW Solar Array — Ph.1" },
      { id:"b12", type:"solar",     x:55, y:42, w:18, h:10, label:"Solar Array Phase 2" },
      { id:"b13", type:"utility",   x:55, y:54, w:9,  h:8,  label:"Grid Interconnect Hub" },
      { id:"b14", type:"qa",        x:65, y:54, w:8,  h:8,  label:"Quality & Test Lab" },
      { id:"b16", type:"airfield",  x:55, y:33, w:18, h:8,  label:"Access & Logistics Apron" },
      { id:"b17", type:"hardstand", x:22, y:62, w:50, h:2,  label:"Outdoor Laydown Area" },
    ],
    stats: { totalArea:"190 acres", sqft:"~0.62M sqft", personnel:"1,250", capex:"~$318M", timeline:"30–40 months" },
  },
};

/* ── Convert SVG 0-100 space → [lat, lon] ───────────────────────────── */
function svgToLatLon(x, y, boundary) {
  if (!boundary?.length) return [47.5, -120.5];
  const lats = boundary.map(([lat]) => lat);
  const lons = boundary.map(([, lon]) => lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const pad = 6, scale = 100 - pad * 2;
  return [
    maxLat - (y - pad) / scale * (maxLat - minLat),
    (x - pad) / scale * (maxLon - minLon) + minLon,
  ];
}

/* ── Ray-casting point-in-polygon ────────────────────────────────────── */
function pointInPolygon([lat, lon], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j];
    if (((yi > lat) !== (yj > lat)) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

/* ── Shrink building corners toward parcel centroid until all inside ─── */
function clampToBoundary(corners, boundary) {
  if (!boundary?.length) return corners;
  const lats = boundary.map(([la]) => la), lons = boundary.map(([, lo]) => lo);
  const cx = (Math.min(...lats) + Math.max(...lats)) / 2;
  const cy = (Math.min(...lons) + Math.max(...lons)) / 2;
  let pts = [...corners];
  let iter = 0;
  while (pts.some(c => !pointInPolygon(c, boundary)) && iter < 80) {
    pts = pts.map(([la, lo]) => [la + (cx - la) * 0.1, lo + (cy - lo) * 0.1]);
    iter++;
  }
  return pts;
}

/* ── Build 4-corner [lat,lon][] for a rectangle in SVG space ─────────── */
function buildingCorners(b, boundary) {
  const corners = [
    svgToLatLon(b.x,       b.y,       boundary),
    svgToLatLon(b.x + b.w, b.y,       boundary),
    svgToLatLon(b.x + b.w, b.y + b.h, boundary),
    svgToLatLon(b.x,       b.y + b.h, boundary),
  ];
  return clampToBoundary(corners, boundary);
}

/* ── Auto-fit map to boundary ────────────────────────────────────────── */
function MapAutoFit({ boundary }) {
  const map = useMap();
  useEffect(() => {
    if (boundary?.length) map.fitBounds(Leaflet.latLngBounds(boundary), { padding: [20, 20] });
  }, [boundary, map]);
  return null;
}

/* ── Stat KPI chip ───────────────────────────────────────────────────── */
function StatChip({ label, value, color }) {
  return (
    <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 8, padding: "7px 10px", flex: 1 }}>
      <div style={{ fontSize: 9, color: D.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: color || D.text }}>{value}</div>
    </div>
  );
}

/* ── Building list item ──────────────────────────────────────────────── */
function BldgRow({ b, selected, onSelect }) {
  const bt = BLDG_TYPES[b.type];
  if (!bt) return null;
  const isSelected = selected?.id === b.id;
  return (
    <div
      onClick={() => onSelect(isSelected ? null : b)}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6,
        cursor: "pointer", marginBottom: 2,
        background: isSelected ? `rgba(${hexToRgb(bt.color)},0.12)` : "transparent",
        border: isSelected ? `1px solid ${bt.color}40` : "1px solid transparent",
        transition: "background 0.15s",
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: 2, background: bt.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: D.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.label}</div>
        <div style={{ fontSize: 9, color: D.muted, marginTop: 1 }}>{bt.sqft}</div>
      </div>
      <div style={{ fontSize: 9, color: bt.color, fontWeight: 700, flexShrink: 0 }}>{bt.capex}</div>
    </div>
  );
}

/* ── Selected building detail panel ─────────────────────────────────── */
function BuildingDetail({ b, onClose }) {
  const bt = BLDG_TYPES[b.type];
  if (!bt) return null;
  return (
    <div style={{ background: D.card, border: `1px solid ${bt.color}40`, borderRadius: 10, padding: 12, marginTop: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: bt.color }} />
            <span style={{ fontSize: 9, color: bt.color, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>{bt.label}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: D.text }}>{b.label}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: D.muted, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
      </div>
      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
        {[
          ["Floor Area",   bt.sqft],
          ["Personnel",    `${bt.personnel} staff`],
          ["CAPEX Est.",   bt.capex],
          ["Energy Load",  bt.energy],
        ].map(([l, v]) => (
          <div key={l} style={{ background: D.panel, borderRadius: 5, padding: "5px 7px" }}>
            <div style={{ fontSize: 9, color: D.muted }}>{l}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: D.text, marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
      {/* Description */}
      <p style={{ fontSize: 10, color: D.muted, lineHeight: 1.5, margin: "0 0 8px" }}>{bt.desc}</p>
      {/* Features */}
      <div style={{ fontSize: 9, color: D.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 5 }}>Key Features</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {bt.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: D.text }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: bt.color, flexShrink: 0 }} />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Hex to RGB helper ───────────────────────────────────────────────── */
function hexToRgb(hex) {
  if (!hex || hex[0] !== "#") return "56,189,248";
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

/* ── 3D Isometric view ──────────────────────────────────────────────── */
const ISO_H = {
  assembly:9, component:7, warehouse:5, paint:5, mro:7,
  rnd:6, office:5, mission:5, qa:5, engine:8,
  airfield:0.8, utility:6, security:3, employee:4, solar:1.5, hardstand:0.3,
};
const HW=4, HH=2, HS=7, OX=450, OY=110;
function ip(wx, wy, wz=0) { return { x:(wx-wy)*HW+OX, y:(wx+wy)*HH-wz*HS+OY }; }
function ipts(arr) { return arr.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "); }
function adjB(hex, f) {
  if (!hex || hex[0]!=="#") return hex;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return "#"+[r,g,b].map(c=>Math.min(255,Math.round(c*f)).toString(16).padStart(2,"0")).join("");
}

function IsoView3D({ plan, selBuilding, onSelect }) {
  const sorted = useMemo(() =>
    [...plan.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y)), [plan]);

  return (
    <svg viewBox="0 0 900 560" style={{ width:"100%",height:"100%",background:D.bg,display:"block" }}>
      {/* Ground */}
      <polygon points={ipts([ip(0,0),ip(100,0),ip(100,100),ip(0,100)])}
        fill="#060f1e" stroke="rgba(56,189,248,0.10)" strokeWidth={1} />
      {/* Grid */}
      {[0,10,20,30,40,50,60,70,80,90,100].map(v=>(
        <g key={v}>
          <line x1={ip(v,0).x} y1={ip(v,0).y} x2={ip(v,100).x} y2={ip(v,100).y}
            stroke="rgba(56,189,248,0.05)" strokeWidth={0.5}/>
          <line x1={ip(0,v).x} y1={ip(0,v).y} x2={ip(100,v).x} y2={ip(100,v).y}
            stroke="rgba(56,189,248,0.05)" strokeWidth={0.5}/>
        </g>
      ))}
      {/* Zone fills */}
      {plan.greenZones.map(z=>(
        <polygon key={z.id} points={ipts(z.pts.map(([x,y])=>ip(x,y,0)))}
          fill={z.color} fillOpacity={0.09} stroke={z.color} strokeWidth={0.8} strokeOpacity={0.45}/>
      ))}
      {/* Perimeter */}
      <polygon points={ipts([ip(0,0),ip(100,0),ip(100,100),ip(0,100)])}
        fill="none" stroke={D.cyan} strokeWidth={1.5} strokeOpacity={0.35} strokeDasharray="8,12"/>
      {/* Buildings back→front */}
      {sorted.map(b=>{
        const bt = BLDG_TYPES[b.type]; if (!bt) return null;
        const h  = ISO_H[b.type]||4;
        const isSel = selBuilding?.id===b.id;
        const lh = isSel ? h+1.5 : h;
        const {x:bx,y:by,w:bw,h:bh} = b;
        const a0=ip(bx,by),    b0=ip(bx+bw,by),    c0=ip(bx+bw,by+bh), d0=ip(bx,by+bh);
        const a1=ip(bx,by,lh), b1=ip(bx+bw,by,lh), c1=ip(bx+bw,by+bh,lh), d1=ip(bx,by+bh,lh);
        const cTop  = isSel ? adjB(bt.color,1.25) : bt.color;
        const cEast = adjB(bt.color,0.68);
        const cSouth= adjB(bt.color,0.48);
        const cx=(a1.x+b1.x+c1.x+d1.x)/4, cy=(a1.y+b1.y+c1.y+d1.y)/4;
        const fs=Math.max(5,Math.min(8,Math.min(bw,bh)*0.32));
        return (
          <g key={b.id} onClick={()=>onSelect(p=>p?.id===b.id?null:b)} style={{cursor:"pointer"}}>
            <polygon points={ipts([d0,c0,c1,d1])} fill={cSouth} stroke="rgba(0,0,0,0.55)" strokeWidth={0.4}/>
            <polygon points={ipts([b0,c0,c1,b1])} fill={cEast}  stroke="rgba(0,0,0,0.55)" strokeWidth={0.4}/>
            <polygon points={ipts([a1,b1,c1,d1])} fill={cTop}   stroke="rgba(0,0,0,0.5)"  strokeWidth={0.6}
              fillOpacity={isSel?1:0.88}/>
            {isSel && <>
              <polygon points={ipts([a1,b1,c1,d1])} fill="none" stroke="#fff" strokeWidth={2} strokeOpacity={0.85}/>
              <polygon points={ipts([d0,c0,c1,d1])} fill="none" stroke={D.cyan} strokeWidth={0.8} strokeOpacity={0.5}/>
              <polygon points={ipts([b0,c0,c1,b1])} fill="none" stroke={D.cyan} strokeWidth={0.8} strokeOpacity={0.5}/>
            </>}
            {bw>5 && bh>5 && (
              <text x={cx} y={cy+1} textAnchor="middle" fill="#fff"
                fontSize={fs} fontWeight={600} opacity={0.82}
                style={{pointerEvents:"none",userSelect:"none"}}>
                {b.label.length>18?b.label.slice(0,16)+"…":b.label}
              </text>
            )}
          </g>
        );
      })}
      {/* Overlay */}
      <text x={16} y={28} fill={D.cyan} fontSize={11} fontWeight={700} opacity={0.9}>{plan.name}</text>
      <text x={16} y={42} fill={D.muted} fontSize={9} opacity={0.75}>{plan.region} · AI Score {plan.aiScore}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
const SITES = [
  { id:"everett", label:"Everett",  score:91, color:"#22c55e" },
  { id:"tacoma",  label:"Tacoma",   score:87, color:"#22c55e" },
  { id:"spokane", label:"Spokane",  score:83, color:"#22c55e" },
  { id:"yakima",  label:"Yakima",   score:79, color:"#eab308" },
];

const DXF_FILES = {
  everett: "/dxf/everett.dxf",
  tacoma:  "/dxf/tacoma.dxf",
  spokane: "/dxf/spokane.dxf",
  yakima:  "/dxf/yakima.dxf",
};

export default function FacilityPlanner({ embedded = false }) {
  const { selectedSiteId, setSelectedSiteId } = useSite();
  const [selBuilding, setSelBuilding] = useState(null);
  const [basemap, setBasemap] = useState("satellite");
  const [view3D, setView3D] = useState(false);

  const siteKey = FACILITY_PLANS[selectedSiteId] ? selectedSiteId : "everett";
  const plan = FACILITY_PLANS[siteKey];
  const boundary = plan.boundary;

  /* Reset selected building when site changes */
  useEffect(() => { setSelBuilding(null); }, [siteKey]);

  /* Center from boundary */
  const center = useMemo(() => {
    if (!boundary?.length) return [47.5, -120.5];
    const lats = boundary.map(([la]) => la), lons = boundary.map(([,lo]) => lo);
    return [(Math.min(...lats)+Math.max(...lats))/2, (Math.min(...lons)+Math.max(...lons))/2];
  }, [boundary]);

  /* Precompute zone positions */
  const zonePolygons = useMemo(() =>
    plan.greenZones.map(z => ({
      ...z,
      positions: z.pts.map(([x,y]) => svgToLatLon(x, y, boundary)),
    })), [plan, boundary]);

  /* Precompute building positions */
  const buildingPolygons = useMemo(() =>
    plan.buildings.map(b => ({
      ...b,
      positions: buildingCorners(b, boundary),
    })), [plan, boundary]);

  /* Category type counts */
  const categoryStats = useMemo(() => {
    const counts = {};
    plan.buildings.forEach(b => { counts[b.type] = (counts[b.type] || 0) + 1; });
    return counts;
  }, [plan]);

  const tileUrl = basemap === "satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const tileAttrib = basemap === "satellite" ? "© Esri" : "© CARTO";

  return (
    <div className={embedded ? undefined : "animate-fade-in"}>
      {/* ── Page Header (standalone only) ────────────────────────────── */}
      {!embedded && (
        <div className="page-header">
          <div className="page-header__left">
            <h1 className="page-title">Facility Layout Planner</h1>
            <p className="page-subtitle">Aerospace campus digital twin · Green zones only · All 16 facility categories placed</p>
          </div>
          <div className="page-header__right">
            <div className="site-selector">
              {SITES.map(s => {
                const active = siteKey === s.id;
                return (
                  <button key={s.id} onClick={() => setSelectedSiteId(s.id)}
                    className={`site-pill${active ? " active" : ""}`}>
                    {s.label}
                    <span style={{ marginLeft:5, fontSize:10, opacity:0.8 }}>AI {s.score}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {[["satellite","Satellite"],["dark","Night"]].map(([k,l]) => (
                <button key={k} onClick={() => { setBasemap(k); setView3D(false); }} style={{
                  padding:"4px 10px", borderRadius:20, border:`1px solid ${!view3D&&basemap===k ? D.cyan : "rgba(56,189,248,0.2)"}`,
                  background: !view3D&&basemap===k ? `${D.cyan}18` : "transparent",
                  color: !view3D&&basemap===k ? D.cyan : D.muted, fontSize:10, fontWeight:600, cursor:"pointer",
                }}>{l}</button>
              ))}
              <button onClick={() => setView3D(v=>!v)} style={{
                padding:"4px 10px", borderRadius:20,
                border:`1px solid ${view3D ? "#a855f7" : "rgba(168,85,247,0.3)"}`,
                background: view3D ? "rgba(168,85,247,0.15)" : "transparent",
                color: view3D ? "#a855f7" : D.muted, fontSize:10, fontWeight:600, cursor:"pointer",
              }}>3D View</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Embedded sub-header (section mode only) ──────────────────── */}
      {embedded && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--ds-text,#d0eaff)" }}>Facility Layout Digital Twin</span>
            <span className="chip chip-advisory">AI-Planned</span>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[["satellite","Satellite"],["dark","Night"]].map(([k,l]) => (
              <button key={k} onClick={() => { setBasemap(k); setView3D(false); }} style={{
                padding:"3px 9px", borderRadius:20, border:`1px solid ${!view3D&&basemap===k ? D.cyan : "rgba(56,189,248,0.2)"}`,
                background: !view3D&&basemap===k ? `${D.cyan}18` : "transparent",
                color: !view3D&&basemap===k ? D.cyan : D.muted, fontSize:10, fontWeight:600, cursor:"pointer",
              }}>{l}</button>
            ))}
            <button onClick={() => setView3D(v=>!v)} style={{
              padding:"3px 9px", borderRadius:20,
              border:`1px solid ${view3D ? "#a855f7" : "rgba(168,85,247,0.3)"}`,
              background: view3D ? "rgba(168,85,247,0.15)" : "transparent",
              color: view3D ? "#a855f7" : D.muted, fontSize:10, fontWeight:600, cursor:"pointer",
            }}>3D View</button>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div style={{
        display:"flex",
        height: embedded ? 620 : "calc(100vh - var(--ds-header-h) - 165px)",
        minHeight: embedded ? 520 : 420,
        gap:12,
      }}>

        {/* ── Map / 3D View ──────────────────────────────────────────── */}
        <div style={{ flex:1, borderRadius:10, overflow:"hidden", border:`1px solid ${D.border}`, position:"relative" }}>

          {/* ── 3D Isometric View ──────────────────────────────────────── */}
          {view3D && (
            <IsoView3D plan={plan} selBuilding={selBuilding} onSelect={setSelBuilding} />
          )}

          {/* ── Leaflet Map ────────────────────────────────────────────── */}
          {!view3D && (<>
          <MapContainer center={center} zoom={13} style={{ width:"100%", height:"100%" }}
            zoomControl={true} attributionControl={false}>

            <TileLayer url={tileUrl} attribution={tileAttrib} maxZoom={19} />
            <MapAutoFit key={siteKey} boundary={boundary} />

            {/* Green zones */}
            {zonePolygons.map(z => (
              <Polygon key={z.id} positions={z.positions}
                pathOptions={{ color: z.color, weight: 1.5, fillColor: z.color, fillOpacity: 0.12, dashArray:"4,4" }}>
                <Tooltip sticky>{z.label}</Tooltip>
              </Polygon>
            ))}

            {/* Building footprints */}
            {buildingPolygons.map(b => {
              const bt = BLDG_TYPES[b.type];
              if (!bt) return null;
              const isSel = selBuilding?.id === b.id;
              return (
                <Polygon key={b.id} positions={b.positions}
                  pathOptions={{
                    color: bt.color, weight: isSel ? 3 : 1.5,
                    fillColor: bt.color, fillOpacity: isSel ? 0.45 : 0.22,
                    dashArray: isSel ? null : null,
                  }}
                  eventHandlers={{ click: () => setSelBuilding(prev => prev?.id === b.id ? null : b) }}>
                  <Tooltip sticky>
                    <span style={{ fontSize:11, fontWeight:600 }}>{b.label}</span>
                    <br/>
                    <span style={{ fontSize:10, color:"#aaa" }}>{bt.label} · {bt.sqft}</span>
                  </Tooltip>
                </Polygon>
              );
            })}

            {/* Site boundary — rendered on top */}
            <Polygon positions={boundary}
              pathOptions={{ color:"#22d3ee", weight:7, fill:false, opacity:0.18 }} />
            <Polygon positions={boundary}
              pathOptions={{ color:"#22d3ee", weight:2.5, fill:false, opacity:1 }} />
            <Polygon positions={boundary}
              pathOptions={{ color:"#ffffff", weight:1.5, fill:false, opacity:0.6, dashArray:"10,18" }} />
          </MapContainer>

          {/* Map legend overlay */}
          <div style={{
            position:"absolute", bottom:10, left:10, zIndex:500, background:"rgba(5,14,26,0.88)",
            border:`1px solid ${D.border}`, borderRadius:8, padding:"8px 10px", maxWidth:180,
            backdropFilter:"blur(6px)",
          }}>
            <div style={{ fontSize:9, color:D.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:5 }}>Building Categories</div>
            {Object.entries(BLDG_TYPES).map(([k, bt]) => {
              const count = categoryStats[k] || 0;
              if (!count) return null;
              return (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                  <div style={{ width:8, height:8, borderRadius:1, background:bt.color, flexShrink:0 }} />
                  <span style={{ fontSize:9, color:D.text, flex:1 }}>{bt.label}</span>
                  {count > 1 && <span style={{ fontSize:8, color:D.muted }}>×{count}</span>}
                </div>
              );
            })}
          </div>
          </>)}
        </div>

        {/* ── Intelligence Panel ─────────────────────────────────────── */}
        <div style={{ width:280, display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>

          {/* Site header */}
          <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:D.text }}>{plan.name}</div>
                <div style={{ fontSize:10, color:D.muted, marginTop:2 }}>{plan.region}</div>
              </div>
              <div style={{ background:`${SITES.find(s=>s.id===siteKey)?.color}20`, border:`1px solid ${SITES.find(s=>s.id===siteKey)?.color}50`, borderRadius:6, padding:"2px 7px", fontSize:12, fontWeight:800, color:SITES.find(s=>s.id===siteKey)?.color }}>
                AI {plan.aiScore}
              </div>
            </div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {[
                ["Area", plan.stats.totalArea],
                ["Sqft", plan.stats.sqft],
                ["Staff", plan.stats.personnel],
              ].map(([l,v]) => (
                <div key={l} style={{ background:D.panel, borderRadius:5, padding:"4px 7px", flex:1 }}>
                  <div style={{ fontSize:8, color:D.muted }}>{l}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:D.text }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:4, marginTop:4 }}>
              <div style={{ background:D.panel, borderRadius:5, padding:"4px 7px", flex:1 }}>
                <div style={{ fontSize:8, color:D.muted }}>Total CAPEX</div>
                <div style={{ fontSize:11, fontWeight:700, color:D.amber }}>{plan.stats.capex}</div>
              </div>
              <div style={{ background:D.panel, borderRadius:5, padding:"4px 7px", flex:1 }}>
                <div style={{ fontSize:8, color:D.muted }}>Timeline</div>
                <div style={{ fontSize:11, fontWeight:700, color:D.cyan }}>{plan.stats.timeline}</div>
              </div>
            </div>
            {DXF_FILES[siteKey] && (
              <a
                href={DXF_FILES[siteKey]}
                download={`${siteKey}_facility_plan.dxf`}
                style={{
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  marginTop:8, padding:"6px 0", background:D.panel,
                  border:`1px solid ${D.cyan}40`, borderRadius:6,
                  fontSize:10, fontWeight:700, color:D.cyan, textDecoration:"none",
                }}
              >
                ↓ Download DXF / CAD File
              </a>
            )}
          </div>

          {/* Zone legend */}
          <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:9, color:D.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Buildable Zones</div>
            {plan.greenZones.map(z => (
              <div key={z.id} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:z.color, opacity:0.8 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, fontWeight:600, color:D.text }}>{z.label}</div>
                  <div style={{ fontSize:9, color: z.suit==="vhigh" ? "#22c55e" : "#86efac" }}>
                    {z.suit === "vhigh" ? "Very High Suitability" : "High Suitability"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected building detail OR full list */}
          {selBuilding ? (
            <BuildingDetail b={selBuilding} onClose={() => setSelBuilding(null)} />
          ) : (
            <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:10, padding:"10px 12px", flex:1, minHeight:0, overflow:"auto" }}>
              <div style={{ fontSize:9, color:D.muted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                Facility Buildings — {plan.buildings.length} placed
              </div>
              {plan.buildings.map(b => (
                <BldgRow key={b.id} b={b} selected={selBuilding} onSelect={setSelBuilding} />
              ))}
              <div style={{ marginTop:8, padding:"6px 0", borderTop:`1px solid ${D.border}`, fontSize:9, color:D.muted, textAlign:"center" }}>
                Click a building on the map or list for details
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
