/**
 * campusDataLoader
 * ----------------
 * Merges KPI data from CSV files with geometry from DXF files.
 *
 * CSV sources (served from /data/):
 *   site_metadata.csv   - site name, subtitle, centre lat/lon, top-level KPIs
 *   buildings_kpi.csv   - per-building KPIs (readiness, capex, phase, constraint)
 *   ai_insights.csv     - AI summary, conflicts, recommendations
 *
 * Map source (served from /dxf/):
 *   {site}.dxf          - building footprints, site boundary, roads
 */

import { fetchAndParseDXF } from "./infrastructureDxfParser.js";

/* ── Minimal CSV parser (no external dependency) ─────────────── */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = splitRow(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = splitRow(line);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (vals[i] ?? "").trim()]));
  });
}

function splitRow(line) {
  const out = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

async function fetchCSV(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`CSV not found: ${path} (HTTP ${res.status})`);
  return parseCSV(await res.text());
}

/* ── Load all data for one site ─────────────────────────────── */
export async function loadCampusData(siteKey) {
  /* Fetch all three CSV files in parallel */
  const [siteMetas, buildingRows, aiRows] = await Promise.all([
    fetchCSV("/data/site_metadata.csv"),
    fetchCSV("/data/buildings_kpi.csv"),
    fetchCSV("/data/ai_insights.csv"),
  ]);

  /* ── Site metadata row ───────────────────────────────────── */
  const siteMeta = siteMetas.find(r => r.site === siteKey);
  if (!siteMeta) throw new Error(`site_metadata.csv has no row for site="${siteKey}"`);

  const centerLat = parseFloat(siteMeta.centerLat);
  const centerLon = parseFloat(siteMeta.centerLon);

  /* ── KPI values - read directly from CSV columns ─────────── */
  const kpis = {
    area:      siteMeta.kpi_area      || "—",
    power:     siteMeta.kpi_power     || "—",
    workers:   parseInt(siteMeta.kpi_workers)   || 0,
    capex:     siteMeta.kpi_capex     || "—",
    readiness: parseInt(siteMeta.kpi_readiness) || 75,
  };

  /* ── Building KPI lookup map: dxf_label -> row ───────────── */
  const kpiMap = {};
  for (const row of buildingRows) {
    if (row.site === siteKey) kpiMap[row.dxf_label] = row;
  }

  /* ── Parse DXF for geometry (boundary, buildings, roads) ─── */
  const { boundary, buildings, roads } = await fetchAndParseDXF(
    siteKey, centerLat, centerLon, kpiMap
  );

  /* ── AI insights row ─────────────────────────────────────── */
  const aiRow = aiRows.find(r => r.site === siteKey) ?? {};
  const aiSummary = {
    readiness:               parseInt(aiRow.readiness)     || 80,
    utilityCoord:            parseInt(aiRow.utilityCoord)  || 80,
    sustainability:          parseInt(aiRow.sustainability) || 80,
    complexity:              parseInt(aiRow.complexity)    || 50,
    confidence:              parseInt(aiRow.confidence)    || 85,
    engineeringValidation:   aiRow.engineeringValidation   || "",
    capexOptimization:       aiRow.capexOptimization       || "",
    environmentalAdaptation: aiRow.environmentalAdaptation || "",
    utilityConflicts:        aiRow.utilityConflicts?.split("|").filter(Boolean) ?? [],
    recommendations:         aiRow.recommendations?.split("|").filter(Boolean)  ?? [],
  };

  return {
    name:     siteMeta.name,
    subtitle: siteMeta.subtitle,
    faaNote:  siteMeta.faaNote || null,
    dirLabel: siteMeta.dirLabel,
    type:     siteMeta.type || "aerospace",
    kpis,        /* from site_metadata.csv */
    boundary,    /* from DXF BOUNDARY layer */
    buildings,   /* from DXF ZONE_* layers + buildings_kpi.csv */
    roads,       /* from DXF ROADS layer */
    aiSummary,   /* from ai_insights.csv */
  };
}