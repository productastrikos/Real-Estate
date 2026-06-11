/**
 * Generates 2 sample Excel + DXF files for upload testing.
 * Run: node generate-test-data.mjs
 * Output: test-data/Portland_Industrial.xlsx  test-data/Portland_Industrial.dxf
 *         test-data/Denver_Logistics.xlsx      test-data/Denver_Logistics.dxf
 */

import * as XLSX from "./node_modules/xlsx/xlsx.mjs";
import { writeFileSync, mkdirSync } from "fs";

mkdirSync("./test-data", { recursive: true });

// ─── Site definitions ───────────────────────────────────────────────────────

const SITES = [
  {
    slug: "Portland_Industrial",
    master: {
      SiteCode: "PORT-001",
      SiteName: "Portland Industrial Zone",
      Region: "Oregon",
      TotalAcreage: 320,
      Latitude: 45.5051,
      Longitude: -122.675,
      ZonedUse: "Industrial",
      FloodZone: "Zone X",
      AssessedValueM: 128,
    },
    infra: {
      SiteCode: "PORT-001",
      GridAvailabilityPct: 92,
      GridCapacityMW: 45,
      WaterPressurePsi: 72, // waterPct = round(72/80*100)=90 → High
      FiberPresent: "Yes",
    },
    logistics: {
      SiteCode: "PORT-001",
      RailScore: 88,
      RailAccess: "Good",
      HighwayAccess: "Excellent",
    },
    environmental: {
      SiteCode: "PORT-001",
      SolarScore: 65,
      ESGScore: 82,
    },
    computed: {
      SiteCode: "PORT-001",
      InvestmentM: 128,
      ROIPct: 14,
    },
    // DXF boundary in feet (~320 acres = 4000ft x 3480ft)
    bboxFt: { w: 4000, h: 3480 },
    dxfLayers: ["A-SITE-BNDR", "E-UTIL-POWR", "P-UTIL-WATR", "T-RAIL", "C-ROAD-DRWY", "A-BLDG-PROD"],
  },
  {
    slug: "Denver_Logistics",
    master: {
      SiteCode: "DEN-001",
      SiteName: "Denver Logistics Hub",
      Region: "Colorado",
      TotalAcreage: 450,
      Latitude: 39.7392,
      Longitude: -104.9903,
      ZonedUse: "Logistics",
      FloodZone: "Zone X",
      AssessedValueM: 180,
    },
    infra: {
      SiteCode: "DEN-001",
      GridAvailabilityPct: 85,
      GridCapacityMW: 60,
      WaterPressurePsi: 55, // waterPct = round(55/80*100)=68 → Medium
      FiberPresent: "Yes",
    },
    logistics: {
      SiteCode: "DEN-001",
      RailScore: 95,
      RailAccess: "Excellent",
      HighwayAccess: "Excellent",
    },
    environmental: {
      SiteCode: "DEN-001",
      SolarScore: 91,
      ESGScore: 78,
    },
    computed: {
      SiteCode: "DEN-001",
      InvestmentM: 180,
      ROIPct: 16,
    },
    // DXF boundary in feet (~450 acres = 4500ft x 4356ft)
    bboxFt: { w: 4500, h: 4356 },
    dxfLayers: ["A-SITE-BNDR", "E-UTIL-POWR", "P-UTIL-WATR", "T-RAIL", "Z-SITE-SOLR", "Z-ZONE-EXPN", "C-ROAD-DRWY", "A-BLDG-PROD", "A-BLDG-UTIL"],
  },
];

// ─── Excel generator ─────────────────────────────────────────────────────────

function makeExcel(site) {
  const wb = XLSX.utils.book_new();

  const addSheet = (name, rows) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  addSheet("Site Master", [site.master]);
  addSheet("Infrastructure", [site.infra]);
  addSheet("Logistics", [site.logistics]);
  addSheet("Environmental", [site.environmental]);
  addSheet("Computed Metrics", [site.computed]);

  const outPath = `./test-data/${site.slug}.xlsx`;
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  writeFileSync(outPath, buf);
  console.log("✓ Excel →", outPath);
}

// ─── DXF generator ───────────────────────────────────────────────────────────

function buildDXF(site) {
  const { bboxFt, dxfLayers, master } = site;
  const w = bboxFt.w;
  const h = bboxFt.h;

  const lines = [];
  const L = (...args) => args.forEach((a) => lines.push(String(a)));

  // HEADER
  L("  0", "SECTION", "  2", "HEADER");
  L("  9", "$ACADVER", "  1", "AC1015"); // AutoCAD 2000
  L("  0", "ENDSEC");

  // TABLES (minimal — just layer table)
  L("  0", "SECTION", "  2", "TABLES");
  L("  0", "TABLE", "  2", "LAYER");
  for (const lyr of dxfLayers) {
    L("  0", "LAYER");
    L("  2", lyr);
    L(" 70", "0"); // flags
    L(" 62", "7"); // color white
    L("  6", "Continuous");
  }
  L("  0", "ENDTAB");
  L("  0", "ENDSEC");

  // ENTITIES
  L("  0", "SECTION", "  2", "ENTITIES");

  // Site boundary LWPOLYLINE (closed rectangle, w×h ft, origin 0,0)
  const corners = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
    [0, 0],
  ];
  L("  0", "LWPOLYLINE");
  L("  8", "A-SITE-BNDR");
  L(" 90", String(corners.length)); // vertex count
  L(" 70", "1"); // closed flag
  for (const [x, y] of corners) {
    L(" 10", x.toFixed(3));
    L(" 20", y.toFixed(3));
  }

  // Power grid line
  L("  0", "LINE");
  L("  8", "E-UTIL-POWR");
  L(" 10", "0.0", " 20", "0.0", " 30", "0.0");
  L(" 11", (w / 2).toFixed(1), " 21", (h / 2).toFixed(1), " 31", "0.0");

  // Water utility line
  L("  0", "LINE");
  L("  8", "P-UTIL-WATR");
  L(" 10", (w * 0.1).toFixed(1), " 20", (h * 0.5).toFixed(1), " 30", "0.0");
  L(" 11", (w * 0.9).toFixed(1), " 21", (h * 0.5).toFixed(1), " 31", "0.0");

  // Rail spur
  if (dxfLayers.includes("T-RAIL")) {
    L("  0", "LINE");
    L("  8", "T-RAIL");
    L(" 10", "0.0", " 20", (h * 0.2).toFixed(1), " 30", "0.0");
    L(" 11", w.toFixed(1), " 21", (h * 0.2).toFixed(1), " 31", "0.0");
  }

  // Solar field zone
  if (dxfLayers.includes("Z-SITE-SOLR")) {
    const sx = w * 0.6,
      sy = h * 0.6,
      sw = w * 0.35,
      sh = h * 0.35;
    const solarCorners = [
      [sx, sy],
      [sx + sw, sy],
      [sx + sw, sy + sh],
      [sx, sy + sh],
      [sx, sy],
    ];
    L("  0", "LWPOLYLINE");
    L("  8", "Z-SITE-SOLR");
    L(" 90", String(solarCorners.length));
    L(" 70", "1");
    for (const [x, y] of solarCorners) {
      L(" 10", x.toFixed(2));
      L(" 20", y.toFixed(2));
    }
  }

  // Expansion zone
  if (dxfLayers.includes("Z-ZONE-EXPN")) {
    const ex = w * 0.05,
      ey = h * 0.6,
      ew = w * 0.4,
      eh = h * 0.35;
    const expCorners = [
      [ex, ey],
      [ex + ew, ey],
      [ex + ew, ey + eh],
      [ex, ey + eh],
      [ex, ey],
    ];
    L("  0", "LWPOLYLINE");
    L("  8", "Z-ZONE-EXPN");
    L(" 90", String(expCorners.length));
    L(" 70", "1");
    for (const [x, y] of expCorners) {
      L(" 10", x.toFixed(2));
      L(" 20", y.toFixed(2));
    }
  }

  // Road access
  if (dxfLayers.includes("C-ROAD-DRWY")) {
    L("  0", "LINE");
    L("  8", "C-ROAD-DRWY");
    L(" 10", (w * 0.4).toFixed(1), " 20", "0.0", " 30", "0.0");
    L(" 11", (w * 0.4).toFixed(1), " 21", (h * 0.3).toFixed(1), " 31", "0.0");
  }

  // Buildings (production)
  if (dxfLayers.includes("A-BLDG-PROD")) {
    const bx = w * 0.15,
      by = h * 0.25,
      bw = w * 0.3,
      bh = h * 0.25;
    const bCorners = [
      [bx, by],
      [bx + bw, by],
      [bx + bw, by + bh],
      [bx, by + bh],
      [bx, by],
    ];
    L("  0", "LWPOLYLINE");
    L("  8", "A-BLDG-PROD");
    L(" 90", String(bCorners.length));
    L(" 70", "1");
    for (const [x, y] of bCorners) {
      L(" 10", x.toFixed(2));
      L(" 20", y.toFixed(2));
    }
  }

  // Utility building
  if (dxfLayers.includes("A-BLDG-UTIL")) {
    const ux = w * 0.6,
      uy = h * 0.25,
      uw = w * 0.12,
      uh = h * 0.12;
    const uCorners = [
      [ux, uy],
      [ux + uw, uy],
      [ux + uw, uy + uh],
      [ux, uy + uh],
      [ux, uy],
    ];
    L("  0", "LWPOLYLINE");
    L("  8", "A-BLDG-UTIL");
    L(" 90", String(uCorners.length));
    L(" 70", "1");
    for (const [x, y] of uCorners) {
      L(" 10", x.toFixed(2));
      L(" 20", y.toFixed(2));
    }
  }

  // Site name TEXT label
  L("  0", "TEXT");
  L("  8", "A-SITE-BNDR");
  L(" 10", (w * 0.5).toFixed(1), " 20", (h * 0.5).toFixed(1), " 30", "0.0");
  L(" 40", "80.0");
  L("  1", master.SiteName);

  L("  0", "ENDSEC");
  L("  0", "EOF");

  const outPath = `./test-data/${site.slug}.dxf`;
  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log("✓ DXF  →", outPath);
}

// ─── Generate all files ───────────────────────────────────────────────────────

for (const site of SITES) {
  makeExcel(site);
  buildDXF(site);
}

console.log("\nDone! Find your files in ./test-data/");
console.log("Expected AI Scores:");
console.log("  Portland Industrial Zone: ~87  (power 92, water 90, rail 88, esg 82, solar 65)");
console.log("  Denver Logistics Hub:     ~83  (power 85, water 68, rail 95, esg 78, solar 91)");
