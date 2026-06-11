#!/usr/bin/env node
/* generateSampleFiles.js
   Generates 4 sample .xlsx + .dxf files for upload testing.
   Run: node scripts/generateSampleFiles.js
   Output: public/samples/
*/
import * as XLSX from "xlsx";
import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/samples");
mkdirSync(OUT, { recursive: true });

/* ── Site definitions ──────────────────────────────────────────── */
const SITES = [
  {
    code: "RNT-001",
    name: "Renton Industrial Park",
    lat: 47.4829,
    lon: -122.2171,
    acreage: 245,
    floodZone: "Zone X",
    region: "King County, WA",
    zone: "Heavy Industrial",
    gridMW: 420,
    gridAvail: 94,
    waterPsi: 72,
    fiber: "Yes",
    railScore: 88,
    railAccess: "BNSF Railway (1.2 mi)",
    highway: "Excellent – SR-167 / I-405",
    solar: 68,
    esg: 83,
    investM: 310,
    roi: 14.2,
    capexM: 310,
    landM: 52,
    permitting: 16,
    construction: 34,
    siteScore: 87,
  },
  {
    code: "BLM-002",
    name: "Bellingham Aerospace Hub",
    lat: 48.7519,
    lon: -122.4787,
    acreage: 195,
    floodZone: "Zone X",
    region: "Whatcom County, WA",
    zone: "Aerospace Industrial",
    gridMW: 380,
    gridAvail: 91,
    waterPsi: 68,
    fiber: "Yes",
    railScore: 79,
    railAccess: "BNSF Railway (3.1 mi)",
    highway: "Good – I-5 at 2.8 mi",
    solar: 61,
    esg: 88,
    investM: 272,
    roi: 13.1,
    capexM: 272,
    landM: 38,
    permitting: 19,
    construction: 32,
    siteScore: 83,
  },
  {
    code: "KNW-003",
    name: "Kennewick Tech Campus",
    lat: 46.2112,
    lon: -119.1372,
    acreage: 310,
    floodZone: "Zone X",
    region: "Benton County, WA",
    zone: "Light Industrial / Tech",
    gridMW: 510,
    gridAvail: 97,
    waterPsi: 75,
    fiber: "Yes",
    railScore: 82,
    railAccess: "BNSF Railway (direct)",
    highway: "Excellent – I-182 / US-395",
    solar: 88,
    esg: 76,
    investM: 388,
    roi: 15.8,
    capexM: 388,
    landM: 44,
    permitting: 14,
    construction: 30,
    siteScore: 91,
  },
  {
    code: "OLY-004",
    name: "Olympia Gateway Industrial",
    lat: 47.0379,
    lon: -122.9007,
    acreage: 175,
    floodZone: "Zone X",
    region: "Thurston County, WA",
    zone: "Port Industrial",
    gridMW: 295,
    gridAvail: 89,
    waterPsi: 64,
    fiber: "Yes",
    railScore: 75,
    railAccess: "UPRR Port Spur (1.5 mi)",
    highway: "Good – US-101 / I-5",
    solar: 57,
    esg: 81,
    investM: 228,
    roi: 12.4,
    capexM: 228,
    landM: 29,
    permitting: 15,
    construction: 28,
    siteScore: 79,
  },
];

/* ── Write Excel files (one site per file) ─────────────────────── */
for (const s of SITES) {
  const wb = XLSX.utils.book_new();

  /* Sheet 1 – Site Master */
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Site Code", "Site Name", "Latitude", "Longitude", "Total Acreage", "Flood Zone", "Region", "ZonedUse"],
      [s.code, s.name, s.lat, s.lon, s.acreage, s.floodZone, s.region, s.zone],
    ]),
    "Site Master",
  );

  /* Sheet 2 – Infrastructure */
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Site Code", "GridCapacityMW", "GridAvailabilityPct", "WaterPressurePsi", "FiberPresent"],
      [s.code, s.gridMW, s.gridAvail, s.waterPsi, s.fiber],
    ]),
    "Infrastructure",
  );

  /* Sheet 3 – Logistics */
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Site Code", "RailScore", "RailAccess", "HighwayAccess"],
      [s.code, s.railScore, s.railAccess, s.highway],
    ]),
    "Logistics",
  );

  /* Sheet 4 – Environmental */
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Site Code", "SolarScore", "ESGScore"],
      [s.code, s.solar, s.esg],
    ]),
    "Environmental",
  );

  /* Sheet 5 – Computed Metrics */
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ["Site Code", "InvestmentM", "ROIPct", "EstimatedCapexM", "LandAcquisitionCostM", "PermittingMonths", "ConstructionMonths", "OverallSiteScore"],
      [s.code, s.investM, s.roi, s.capexM, s.landM, s.permitting, s.construction, s.siteScore],
    ]),
    "Computed Metrics",
  );

  const filename = `${s.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}_site_data.xlsx`;
  XLSX.writeFile(wb, join(OUT, filename));
  console.log(`  ✓ ${filename}`);
}

/* ── Write DXF files ───────────────────────────────────────────── */
function makeDXF(s) {
  /* Site boundary: 40% of acreage as square in feet */
  const sqFt = s.acreage * 43560;
  const half = Math.sqrt(sqFt) / 2;
  const bx = 5000,
    by = 5000; /* origin offset */

  /* Rectangle corners for boundary polyline */
  const corners = [
    [bx - half, by - half],
    [bx + half, by - half],
    [bx + half, by + half],
    [bx - half, by + half],
    [bx - half, by - half] /* close */,
  ];

  function lwPoly(layer, pts) {
    const verts = pts.map(([x, y]) => ` 10\n${x.toFixed(2)}\n 20\n${y.toFixed(2)}`).join("\n");
    return `  0\nLWPOLYLINE\n  8\n${layer}\n 70\n1\n 90\n${pts.length}\n${verts}`;
  }

  /* Two production buildings */
  const b1x = bx - half * 0.3,
    b1y = by - half * 0.3,
    bw = half * 0.35,
    bh = half * 0.25;
  const b2x = bx + half * 0.05,
    b2y = by - half * 0.3;
  const bldg1 = [
    [b1x, b1y],
    [b1x + bw, b1y],
    [b1x + bw, b1y + bh],
    [b1x, b1y + bh],
    [b1x, b1y],
  ];
  const bldg2 = [
    [b2x, b2y],
    [b2x + bw, b2y],
    [b2x + bw, b2y + bh],
    [b2x, b2y + bh],
    [b2x, b2y],
  ];

  /* Utility building */
  const ux = bx - half * 0.3,
    uy = by + half * 0.15;
  const utilBldg = [
    [ux, uy],
    [ux + bw * 0.5, uy],
    [ux + bw * 0.5, uy + bh * 0.5],
    [ux, uy + bh * 0.5],
    [ux, uy],
  ];

  /* Road */
  const road = [
    [bx - half, by],
    [bx + half, by],
  ];

  /* Solar field area */
  const sx = bx - half * 0.3,
    sy = by + half * 0.4;
  const solar = [
    [sx, sy],
    [sx + half * 0.5, sy],
    [sx + half * 0.5, sy + half * 0.2],
    [sx, sy + half * 0.2],
    [sx, sy],
  ];

  /* Power line */
  const power = [
    [bx - half, by + half * 0.6],
    [bx + half, by + half * 0.6],
  ];

  /* Water pipe */
  const water = [
    [bx - half * 0.8, by - half],
    [bx - half * 0.8, by + half],
  ];

  /* Rail spur */
  const rail = [
    [bx - half, by - half * 0.5],
    [bx, by - half * 0.5],
  ];

  return `  0\nSECTION\n  2\nHEADER\n  9\n$ACADVER\n  1\nAC1015\n  0\nENDSEC\n  0\nSECTION\n  2\nENTITIES\n${lwPoly("A-SITE-BNDR", corners)}\n${lwPoly("A-BLDG-PROD", bldg1)}\n${lwPoly("A-BLDG-PROD", bldg2)}\n${lwPoly("A-BLDG-UTIL", utilBldg)}\n${lwPoly("C-ROAD", road)}\n${lwPoly("Z-SITE-SOLR", solar)}\n${lwPoly("E-UTIL", power)}\n${lwPoly("P-UTIL", water)}\n${lwPoly("T-RAIL", rail)}\n  0\nTEXT\n  8\nA-ANNO-TEXT\n 10\n${bx.toFixed(2)}\n 20\n${(by + half * 0.7).toFixed(2)}\n 40\n120\n  1\n${s.name}\n  0\nENDSEC\n  0\nEOF\n`;
}

for (const s of SITES) {
  const content = makeDXF(s);
  const filename = `${s.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}_masterplan.dxf`;
  writeFileSync(join(OUT, filename), content, "utf-8");
  console.log(`  ✓ ${filename}`);
}

console.log(`\n✅ Generated ${SITES.length * 2} files in public/samples/`);
