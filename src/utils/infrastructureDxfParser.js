/**
 * DXF parser for InfrastructureTwin campus map data.
 * Layers used:
 *   BOUNDARY  - site perimeter LWPOLYLINE (feet, local coords)
 *   ZONE_*    - building footprint LWPOLYLINEs coloured by zone type
 *   ROADS     - road polylines
 *   ANNOT     - TEXT/MTEXT labels inside each building footprint
 *
 * Coordinates in feet; converted via site centerLat/centerLon from CSV.
 */

const FT_PER_DEG_LAT = 364000;

const ZONE_COLOR_MAP = {
  ZONE_RED:     "#ef4444",
  ZONE_CYAN:    "#22d3ee",
  ZONE_BLUE:    "#3b82f6",
  ZONE_PURPLE:  "#a855f7",
  ZONE_GREEN:   "#22c55e",
  ZONE_YELLOW:  "#eab308",
  ZONE_MAGENTA: "#ec4899",
  ZONE_ORANGE:  "#f97316",
  ZONE_GRAY:    "#6b7280",
  ZONE_TEAL:    "#14b8a6",
  ZONE_SKY:     "#38bdf8",
  ZONE_VIOLET:  "#8b5cf6",
};

function parseDXFRaw(text) {
  const lines = text.split(/\r?\n/);
  let i = 0;
  let inEntities = false;
  let curType = null;
  let curLayer = "0";
  let verts = [];
  const byLayer = {};
  const textLabels = [];

  function flush() {
    if (curLayer && verts.length >= 2) {
      (byLayer[curLayer] ??= []).push({ type: curType, verts: [...verts] });
    }
    verts = [];
  }

  while (i < lines.length - 1) {
    const gc  = lines[i].trim();
    const val = (lines[i + 1] ?? "").trim();
    i += 2;

    if (gc === "2") {
      if (val === "ENTITIES") { inEntities = true; continue; }
      if (val === "ENDSEC")   { inEntities = false; continue; }
    }
    if (!inEntities) continue;

    if (gc === "0") { flush(); curType = val; }
    if (gc === "8")  curLayer = val;
    if (gc === "10") verts.push([parseFloat(val) || 0, 0]);
    if (gc === "20" && verts.length) verts[verts.length - 1][1] = parseFloat(val) || 0;

    if (gc === "1" && (curType === "TEXT" || curType === "MTEXT")) {
      const pos = verts.length ? [...verts[verts.length - 1]] : [0, 0];
      textLabels.push({ label: val, x: pos[0], y: pos[1] });
    }
  }
  flush();
  return { byLayer, textLabels };
}

function ptInRect(px, py, verts) {
  const xs = verts.map(v => v[0]);
  const ys = verts.map(v => v[1]);
  return px >= Math.min(...xs) && px <= Math.max(...xs)
      && py >= Math.min(...ys) && py <= Math.max(...ys);
}

function makeConverter(byLayer, centerLat, centerLon) {
  const bndrVerts = (byLayer["BOUNDARY"] ?? [])[0]?.verts ?? [];
  let cx = 0, cy = 0;
  if (bndrVerts.length) {
    const xs = bndrVerts.map(v => v[0]);
    const ys = bndrVerts.map(v => v[1]);
    cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  }
  const ftPerDegLon = FT_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  return ([x, y]) => [
    centerLat + (y - cy) / FT_PER_DEG_LAT,
    centerLon + (x - cx) / ftPerDegLon,
  ];
}

export function parseCampusDXF(dxfText, centerLat, centerLon, kpiMap = {}) {
  const { byLayer, textLabels } = parseDXFRaw(dxfText);
  const toLatLon = makeConverter(byLayer, centerLat, centerLon);

  const bndrVerts = (byLayer["BOUNDARY"] ?? [])[0]?.verts ?? [];
  const boundary = bndrVerts.map(toLatLon);

  const buildings = [];
  const zoneKeys = Object.keys(byLayer).filter(l => l.startsWith("ZONE_"));

  for (const layer of zoneKeys) {
    const color = ZONE_COLOR_MAP[layer] ?? "#888888";
    for (const entity of byLayer[layer]) {
      const { verts } = entity;
      if (verts.length < 3) continue;
      const xs = verts.map(v => v[0]);
      const ys = verts.map(v => v[1]);
      const bcx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const bcy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const matched = textLabels.find(t => ptInRect(t.x, t.y, verts));
      const dxfLabel = matched?.label ?? "?";
      const kpi = kpiMap[dxfLabel] ?? {};
      buildings.push({
        id:          kpi.id        ?? dxfLabel.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        label:       kpi.full_label ?? dxfLabel,
        sub:         kpi.description ?? "",
        color,
        type:        kpi.type        ?? "building",
        phase:       parseInt(kpi.phase)     || 1,
        readiness:   parseInt(kpi.readiness) || 75,
        capex:       kpi.capex       ?? "",
        bays:        kpi.bays ? parseInt(kpi.bays) : undefined,
        constraint:  kpi.constraint  || null,
        solar:       kpi.solar === "true",
        dxfLabel,
        positions:   verts.map(toLatLon),
        centerLatLon: toLatLon([bcx, bcy]),
      });
    }
  }

  const roads = (byLayer["ROADS"] ?? []).map((entity, idx) => ({
    id: `road_${idx}`,
    positions: entity.verts.map(toLatLon),
  }));

  return { boundary, buildings, roads };
}

export async function fetchAndParseDXF(siteKey, centerLat, centerLon, kpiMap = {}) {
  const res = await fetch(`/dxf/${siteKey}.dxf`);
  if (!res.ok) throw new Error(`DXF fetch failed for ${siteKey}: ${res.status}`);
  const text = await res.text();
  return parseCampusDXF(text, centerLat, centerLon, kpiMap);
}