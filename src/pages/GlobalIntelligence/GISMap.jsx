import React, { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Polygon, Circle, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSiteData } from "../../context/SiteDataContext.jsx";
import { useSite } from "../../context/SiteContext.jsx";

/* ─── Site state color by AI score / risk ────────────────── */
function siteColor(site, isSelected) {
  if (isSelected) return "#22d3ee";
  if (site.ragStatus === "danger") return "#ef4444";
  if (site.ragStatus === "warning") return "#d97706";
  if ((site.aiScore || 0) >= 90) return "#22d3ee";
  if ((site.aiScore || 0) >= 82) return "#22c55e";
  return "#5b8de0";
}

function siteLabel(site) {
  if ((site.aiScore || 0) >= 90) return "RECOMMENDED";
  if ((site.aiScore || 0) >= 82) return "STRONG";
  if (site.ragStatus === "warning") return "CONSTRAINED";
  if (site.ragStatus === "danger") return "AT RISK";
  return "ACTIVE";
}

/* ─── Scale a polygon outward from its centroid ─────────────
   factor > 1 = larger, factor < 1 = smaller
   offset = [dLat, dLon] translation after scaling             */
function scalePolygon(poly, factor, offset = [0, 0]) {
  if (!poly?.length) return poly;
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  return poly.map(([lat, lon]) => [cx + (lat - cx) * factor + offset[0], cy + (lon - cy) * factor + offset[1]]);
}

/* ─── Generate industrial footprints from parcel polygon ──── */
function buildFootprints(site, poly) {
  if (!poly?.length) return [];
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  const lats = poly.map((p) => p[0]);
  const lons = poly.map((p) => p[1]);
  const h = Math.max(...lats) - Math.min(...lats);
  const w = Math.max(...lons) - Math.min(...lons);
  const fp = [];

  // Production hall — center 45% of parcel
  fp.push({
    id: "prod",
    label: "Production Hall",
    color: "#1e3a5f",
    positions: [
      [cx + h * 0.08, cy - w * 0.2],
      [cx + h * 0.08, cy + w * 0.18],
      [cx - h * 0.14, cy + w * 0.18],
      [cx - h * 0.14, cy - w * 0.2],
    ],
  });

  // Substation — NE corner
  fp.push({
    id: "sub",
    label: "Substation",
    color: "#4c1d95",
    positions: [
      [cx + h * 0.24, cy + w * 0.22],
      [cx + h * 0.24, cy + w * 0.34],
      [cx + h * 0.35, cy + w * 0.34],
      [cx + h * 0.35, cy + w * 0.22],
    ],
  });

  // Logistics yard — S edge
  fp.push({
    id: "yard",
    label: "Logistics Yard",
    color: "#0c4a6e",
    positions: [
      [cx - h * 0.28, cy - w * 0.3],
      [cx - h * 0.28, cy + w * 0.3],
      [cx - h * 0.38, cy + w * 0.3],
      [cx - h * 0.38, cy - w * 0.3],
    ],
  });

  // Solar array — W quadrant if solarScore >= 75
  if ((site.solarScore || 0) >= 75) {
    fp.push({
      id: "solar",
      label: "Solar Array",
      color: "#78350f",
      positions: [
        [cx + h * 0.3, cy - w * 0.42],
        [cx + h * 0.3, cy - w * 0.22],
        [cx + h * 0.44, cy - w * 0.22],
        [cx + h * 0.44, cy - w * 0.42],
      ],
    });
  }

  // Rail terminal — SW corner if railScore >= 88
  if ((site.railScore || 0) >= 88) {
    fp.push({
      id: "rail-term",
      label: "Rail Terminal",
      color: "#1c3461",
      positions: [
        [cx - h * 0.18, cy - w * 0.44],
        [cx - h * 0.18, cy - w * 0.28],
        [cx - h * 0.28, cy - w * 0.28],
        [cx - h * 0.28, cy - w * 0.44],
      ],
    });
  }

  return fp;
}

/* ─── Generate utility stub lines for any site location ───── */
function buildSiteStubs(site) {
  if (!site?.coords) return { power: [], rail: [], road: [] };
  const [lat, lon] = site.coords;
  return {
    power: [
      [lat, lon],
      [lat + 0.08, lon - 0.06],
      [lat + 0.14, lon - 0.04],
    ],
    rail: [
      [lat, lon],
      [lat - 0.06, lon + 0.05],
      [lat - 0.1, lon + 0.12],
    ],
    road: [
      [lat, lon],
      [lat + 0.04, lon + 0.08],
      [lat - 0.02, lon + 0.16],
    ],
  };
}

/* ─── OpenStreetMap / Overpass API  ──────────────────────────
   Real infrastructure data fetched from OSM for Washington State.
   Bounding box: south=45.5 west=-124.8 north=49.0 east=-116.9    */
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const WA_BBOX = "45.5,-124.8,49.0,-116.9";

const OSM_FILTERS = {
  power: '"power"="line"',
  rail: '"railway"="rail"',
  highway: '"highway"~"motorway|trunk|primary"',
  water: '"waterway"~"river|canal"',
  fiber: '"telecom"~"line|cable"',
};

async function fetchOSMLayer(layerId) {
  const filter = OSM_FILTERS[layerId];
  if (!filter) return [];
  const query = `[out:json][timeout:30];way[${filter}](${WA_BBOX});out geom qt;`;
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const { elements } = await res.json();
  return (elements || []).filter((e) => e.geometry?.length > 1).map((e) => e.geometry.map((pt) => [pt.lat, pt.lon]));
}

/* ─── WA-specific flood zones ────────────────────────────── */
const FLOOD_ZONES = [
  {
    id: "ev-ae",
    risk: "AE",
    positions: [
      [47.985, -122.222],
      [47.985, -122.19],
      [47.971, -122.19],
      [47.971, -122.222],
    ],
    color: "#3b82f6",
  },
  {
    id: "ev-x",
    risk: "X",
    positions: [
      [47.97, -122.235],
      [47.97, -122.208],
      [47.96, -122.208],
      [47.96, -122.235],
    ],
    color: "#60a5fa",
  },
  {
    id: "ya-x",
    risk: "X",
    positions: [
      [46.612, -120.528],
      [46.612, -120.497],
      [46.596, -120.497],
      [46.596, -120.528],
    ],
    color: "#60a5fa",
  },
  {
    id: "sp-x",
    risk: "X",
    positions: [
      [47.668, -117.438],
      [47.668, -117.418],
      [47.652, -117.418],
      [47.652, -117.438],
    ],
    color: "#60a5fa",
  },
];

/* ─── Wetlands ───────────────────────────────────────────── */
const WETLANDS = [
  {
    id: "tc-w1",
    positions: [
      [47.264, -122.458],
      [47.264, -122.442],
      [47.256, -122.442],
      [47.256, -122.458],
    ],
  },
  {
    id: "ev-w1",
    positions: [
      [47.977, -122.218],
      [47.977, -122.208],
      [47.972, -122.208],
      [47.972, -122.218],
    ],
  },
];

/* ─── FAA Airspace ───────────────────────────────────────── */
const FAA_AIRSPACE = [
  { id: "seatac", center: [47.449, -122.309], radius: 9000, label: "SEA-TAC Class B", color: "#60a5fa" },
  { id: "paine", center: [47.906, -122.282], radius: 5500, label: "Paine Field Cl. D", color: "#a78bfa" },
  { id: "gegspo", center: [47.619, -117.534], radius: 7500, label: "GEG Class C", color: "#60a5fa" },
  { id: "yakima", center: [46.568, -120.544], radius: 5200, label: "YKM Class D", color: "#a78bfa" },
];

/* ─── WA site IDs (have full infrastructure data) ──────────── */
const WA_SITE_IDS = new Set([
  "tacoma",
  "everett",
  "spokane",
  "yakima",
  "tacomaindustrialpark",
  "everettaerospacezone",
  "spokanenlogisticscorridor",
  "yakimamanufacturingcluster",
]);

/* ─── Parcel Intelligence Panel ──────────────────────────── */
function ParcelIntelPanel({ site, onClose, onNavigate, getPolyFn }) {
  if (!site) return null;
  const color = siteColor(site, false);
  const label = siteLabel(site);
  const metrics = [
    { key: "Power", val: `${site.power || "—"}%` },
    { key: "Water", val: site.waterLabel || site.water || "—" },
    { key: "Rail", val: site.rail || "—" },
    { key: "Solar", val: String(site.solarScore || "—") },
    { key: "ESG", val: `${site.esg || "—"}/100` },
    { key: "ROI", val: `${site.roi || "—"}%` },
  ];
  return (
    <div className="parcel-intel-panel">
      <div className="parcel-intel-panel__header">
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
          <div className="parcel-intel-panel__name">{site.name}</div>
          <div style={{ fontSize: 10, color: "var(--ds-text-faint)", marginTop: 2 }}>
            {site.area} · {site.type}
          </div>
        </div>
        <button className="parcel-intel-panel__close" onClick={onClose}>
          ×
        </button>
      </div>

      {/* AI Score bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 9, color: "var(--ds-text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>AI Infrastructure Score</span>
          <span style={{ fontSize: 11, fontWeight: 800, color }}>{site.aiScore || 0}/100</span>
        </div>
        <div style={{ height: 4, background: "var(--ds-surface)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${site.aiScore || 0}%`, background: color, borderRadius: 2, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="parcel-intel-panel__metrics">
        {metrics.map(({ key, val }) => (
          <div key={key} className="parcel-intel-panel__metric">
            <div className="parcel-intel-panel__metric-label">{key}</div>
            <div className="parcel-intel-panel__metric-val">{val}</div>
          </div>
        ))}
      </div>

      {/* Risk alert */}
      {site.issue && (
        <div
          style={{
            padding: "5px 8px",
            background: "var(--ds-warning-bg)",
            border: "1px solid var(--ds-warning-border)",
            borderRadius: 5,
            fontSize: 10,
            color: "var(--ds-warning)",
            marginBottom: 8,
          }}
        >
          ⚠ {site.issue}
        </div>
      )}

      {/* Expansion + source badges */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {site.expandPotential && (
          <span
            style={{
              fontSize: 9,
              padding: "2px 7px",
              borderRadius: 4,
              background: site.expandPotential === "High" ? "rgba(34,197,94,0.12)" : "rgba(91,141,224,0.12)",
              color: site.expandPotential === "High" ? "#22c55e" : "#5b8de0",
              border: `1px solid ${site.expandPotential === "High" ? "rgba(34,197,94,0.3)" : "rgba(91,141,224,0.3)"}`,
              fontWeight: 700,
            }}
          >
            Expansion: {site.expandPotential}
          </span>
        )}
        {site.fiber && (
          <span
            style={{
              fontSize: 9,
              padding: "2px 7px",
              borderRadius: 4,
              background: "rgba(139,92,246,0.12)",
              color: "#8b5cf6",
              border: "1px solid rgba(139,92,246,0.3)",
              fontWeight: 700,
            }}
          >
            Fiber ✓
          </span>
        )}
        {["excel", "csv", "geojson"].includes(site._source) && (
          <span
            style={{
              fontSize: 9,
              padding: "2px 7px",
              borderRadius: 4,
              background: "rgba(20,184,166,0.12)",
              color: "#14b8a6",
              border: "1px solid rgba(20,184,166,0.3)",
              fontWeight: 700,
            }}
          >
            {site._source === "geojson" ? "GeoJSON" : site._source === "csv" ? "CSV" : "Excel"} Upload
          </span>
        )}
      </div>

      {/* Download row */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        <button
          onClick={() => {
            const poly = getPolyFn(site.id);
            if (poly) downloadGeoJSON(site, poly);
          }}
          style={{
            flex: 1,
            fontSize: 9,
            padding: "4px 0",
            borderRadius: 5,
            border: "1px solid rgba(245,158,11,0.4)",
            background: "rgba(245,158,11,0.08)",
            color: "#f59e0b",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ↓ GeoJSON
        </button>
        <button
          onClick={() => downloadCSV(site)}
          style={{
            flex: 1,
            fontSize: 9,
            padding: "4px 0",
            borderRadius: 5,
            border: "1px solid rgba(14,165,233,0.4)",
            background: "rgba(14,165,233,0.08)",
            color: "#0ea5e9",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ↓ CSV
        </button>
      </div>

      {/* Navigation */}
      <div className="parcel-intel-panel__actions">
        <button
          className="btn btn-primary btn-sm"
          style={{ fontSize: 10, padding: "0 8px", height: 26 }}
          onClick={() => onNavigate("environmental", site)}
        >
          Environmental
        </button>
        <button className="btn btn-control btn-sm" style={{ fontSize: 10, padding: "0 8px", height: 26 }} onClick={() => onNavigate("twin", site)}>
          Blueprint
        </button>
        <button
          className="btn btn-control btn-sm"
          style={{ fontSize: 10, padding: "0 8px", height: 26 }}
          onClick={() => onNavigate("executive", site)}
        >
          Executive
        </button>
      </div>
    </div>
  );
}

/* ─── Fly to selected regions when filter changes ────────── */
function MapController({ regions, sites }) {
  const map = useMap();
  const regionKey = (regions || []).slice().sort().join("|");

  useEffect(() => {
    if (!regions?.length) {
      map.flyTo(WA_CENTER, WA_ZOOM, { duration: 1 });
      return;
    }
    const selected = sites.filter((s) => regions.includes(s.region) || regions.includes(s.shortName));
    if (!selected.length) return;

    if (selected.length === 1) {
      map.flyTo(selected[0].coords, 12, { duration: 1 });
    } else {
      const lats = selected.filter((s) => s.coords).map((s) => s.coords[0]);
      const lons = selected.filter((s) => s.coords).map((s) => s.coords[1]);
      if (!lats.length) return;
      map.flyToBounds(
        [
          [Math.min(...lats) - 0.05, Math.min(...lons) - 0.1],
          [Math.max(...lats) + 0.05, Math.max(...lons) + 0.1],
        ],
        { padding: [50, 50], duration: 1 },
      );
    }
  }, [regionKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/* ─── Basemap URLs ────────────────────────────────────────── */
const BASEMAPS = {
  dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", subdomains: "abcd", maxZoom: 19 },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", maxZoom: 18 },
  terrain: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", maxZoom: 18 },
};

const LAYER_DEFS = [
  // { id: "sites",      label: "Sites" },
  { id: "parcels", label: "Parcels" },
  // { id: "footprints", label: "Footprints" },
  { id: "power", label: "Power" },
  { id: "rail", label: "Rail" },
  // { id: "highway", label: "Highway" },
  { id: "water", label: "Water" },
  { id: "fiber", label: "Fiber" },
  { id: "airspace", label: "Airspace" },
  { id: "flood", label: "Flood" },
];

const WA_CENTER = [47.3, -120.5];
const WA_ZOOM = 7;

/* ── Download site as GeoJSON ────────────────────────────── */
function downloadGeoJSON(site, poly) {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [poly.map(([lat, lon]) => [lon, lat])],
        },
        properties: {
          SiteCode: site.id.toUpperCase(),
          SiteName: site.name,
          Latitude: site.coords[0],
          Longitude: site.coords[1],
          TotalAcreage: parseFloat(site.area) || 200,
          ZonedUse: site.type,
          Region: site.region,
          FloodZone: "Zone X",
          GridAvailabilityPct: site.power,
          GridCapacityMW: site._acq?.electricalCapacityMW || Math.round((site.power || 80) * 5),
          WaterPressurePsi: Math.round(((site.waterPct || 75) / 100) * 80),
          FiberPresent: site.fiber ? "Yes" : "No",
          RailScore: site.railScore,
          RailAccess: site.rail,
          HighwayAccess: site.highway,
          SolarScore: site.solarScore,
          ESGScore: site.esg,
          InvestmentM: site.investment,
          ROIPct: site.roi,
          EstimatedCapexM: site._acq?.estimatedCapexM || 0,
          LandAcquisitionCostM: site._acq?.landAcquisitionCostM || 0,
          PermittingMonths: site._acq?.permittingMonths || 18,
          ConstructionMonths: site._acq?.constructionMonths || 36,
          OverallSiteScore: site.aiScore,
        },
      },
    ],
  };
  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${site.id}_site_data.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Download site as CSV ────────────────────────────────── */
function downloadCSV(site) {
  const headers =
    "SiteCode,SiteName,Latitude,Longitude,TotalAcreage,ZonedUse,Region,FloodZone,GridAvailabilityPct,GridCapacityMW,WaterPressurePsi,FiberPresent,RailScore,RailAccess,HighwayAccess,SolarScore,ESGScore,InvestmentM,ROIPct,EstimatedCapexM,LandAcquisitionCostM,PermittingMonths,ConstructionMonths,OverallSiteScore";
  const row = [
    site.id.toUpperCase(),
    site.name,
    site.coords[0],
    site.coords[1],
    parseFloat(site.area) || 200,
    site.type,
    site.region,
    "Zone X",
    site.power,
    site._acq?.electricalCapacityMW || Math.round((site.power || 80) * 5),
    Math.round(((site.waterPct || 75) / 100) * 80),
    site.fiber ? "Yes" : "No",
    site.railScore,
    site.rail,
    site.highway,
    site.solarScore,
    site.esg,
    site.investment,
    site.roi,
    site._acq?.estimatedCapexM || 0,
    site._acq?.landAcquisitionCostM || 0,
    site._acq?.permittingMonths || 18,
    site._acq?.constructionMonths || 36,
    site.aiScore,
  ].join(",");
  const blob = new Blob([headers + "\n" + row], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${site.id}_site_data.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Fly to newly uploaded sites ────────────────────────── */
function NewSiteWatcher({ sites }) {
  const { lastAddedSiteId, getParcelPolygon } = useSiteData();
  const map = useMap();
  const prevId = React.useRef(null);

  useEffect(() => {
    if (!lastAddedSiteId || lastAddedSiteId === prevId.current) return;
    prevId.current = lastAddedSiteId;
    const site = sites.find((s) => s.id === lastAddedSiteId);
    if (!site?.coords) return;
    const poly = getParcelPolygon(lastAddedSiteId);
    if (poly?.length) {
      const lats = poly.map((p) => p[0]);
      const lons = poly.map((p) => p[1]);
      map.flyToBounds(
        [
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)],
        ],
        { padding: [60, 60], maxZoom: 13, duration: 1.4 },
      );
    } else {
      map.flyTo(site.coords, 12, { duration: 1.4 });
    }
  }, [lastAddedSiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function GISMap({ filters, onSiteSelect, selectedSiteId: selectedSiteIdProp }) {
  const { sites, getParcelPolygon } = useSiteData();
  const { selectedSiteId: ctxSiteId, navigateTo } = useSite();
  const activeSiteId = selectedSiteIdProp || ctxSiteId;

  const [activeLayers, setActiveLayers] = useState(["sites", "parcels", "power", "rail", "highway"]);
  const [basemap, setBasemap] = useState("dark");
  const [intelSite, setIntelSite] = useState(null);

  /* OSM live data ─────────────────────────────────────────── */
  const osmCache = useRef({});
  const [osmData, setOsmData] = useState({});
  const [osmFetching, setOsmFetching] = useState({});

  useEffect(() => {
    const needed = Object.keys(OSM_FILTERS).filter((id) => activeLayers.includes(id) && !osmCache.current[id] && !osmFetching[id]);
    if (!needed.length) return;
    needed.forEach((id) => {
      setOsmFetching((p) => ({ ...p, [id]: true }));
      fetchOSMLayer(id)
        .then((lines) => {
          osmCache.current[id] = lines;
          setOsmData((p) => ({ ...p, [id]: lines }));
        })
        .catch(() => {
          osmCache.current[id] = [];
        })
        .finally(() => setOsmFetching((p) => ({ ...p, [id]: false })));
    });
  }, [activeLayers]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLayer = (id) => setActiveLayers((p) => (p.includes(id) ? p.filter((l) => l !== id) : [...p, id]));

  const handleNavigate = (dest, site) => {
    navigateTo(dest, site.id);
    if (onSiteSelect) onSiteSelect(site, dest);
  };

  const handleParcelClick = (site) => {
    setIntelSite(site);
    if (onSiteSelect) onSiteSelect(site);
  };

  const visibleSites = useMemo(
    () =>
      sites.filter((s) => {
        if (filters?.aiMin && (s.aiScore || 0) < filters.aiMin) return false;
        if (filters?.regions?.length && !filters.regions.includes(s.region) && !filters.regions.includes(s.shortName)) return false;
        return true;
      }),
    [sites, filters],
  );

  /* For uploaded (non-WA) sites, generate stub infrastructure lines */
  const uploadedSites = useMemo(() => visibleSites.filter((s) => !WA_SITE_IDS.has(s.id)), [visibleSites]);

  const bm = BASEMAPS[basemap];

  return (
    <div style={{ position: "relative", height: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid var(--ds-border)" }}>
      <MapContainer center={WA_CENTER} zoom={WA_ZOOM} style={{ height: "100%", width: "100%" }} zoomControl={false} attributionControl={false}>
        <TileLayer url={bm.url} {...(bm.subdomains ? { subdomains: bm.subdomains } : {})} maxZoom={bm.maxZoom} key={basemap} />

        {/* Fly to region when filter changes */}
        <MapController regions={filters?.regions} sites={sites} />

        {/* Fly to newly uploaded site */}
        <NewSiteWatcher sites={sites} />

        {/* Satellite label overlay */}
        {basemap === "satellite" && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
            opacity={0.8}
          />
        )}

        {/* ── PARCEL POLYGONS ─────────────────────────────── */}
        {activeLayers.includes("parcels") &&
          visibleSites.map((site) => {
            const poly = getParcelPolygon(site.id);
            if (!poly) return null;
            const isSelected = site.id === activeSiteId;
            const color = siteColor(site, isSelected);
            return (
              <React.Fragment key={`parcel-group-${site.id}`}>
                {/* White halo behind — makes border pop over any layer color */}
                <Polygon
                  positions={poly}
                  pathOptions={{
                    color: "#ffffff",
                    weight: isSelected ? 7 : 5,
                    opacity: 0.3,
                    fillOpacity: 0,
                    dashArray: isSelected ? null : "8 5",
                  }}
                />
                {/* Colored border + fill on top */}
                <Polygon
                  positions={poly}
                  pathOptions={{
                    color,
                    weight: isSelected ? 3.5 : 2.5,
                    opacity: 1,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.32 : 0.2,
                    dashArray: isSelected ? null : "8 5",
                  }}
                  eventHandlers={{ click: () => handleParcelClick(site) }}
                >
                  <Tooltip sticky direction="top">
                    {site.name} · AI {site.aiScore}/100
                  </Tooltip>
                </Polygon>
              </React.Fragment>
            );
          })}

        {/* ── INDUSTRIAL FOOTPRINTS ────────────────────────── */}
        {activeLayers.includes("footprints") &&
          visibleSites.map((site) => {
            const poly = getParcelPolygon(site.id);
            if (!poly) return null;
            const footprints = buildFootprints(site, poly);
            return footprints.map((fp) => (
              <Polygon
                key={`fp-${site.id}-${fp.id}`}
                positions={fp.positions}
                pathOptions={{ color: fp.color, weight: 1.5, fillColor: fp.color, fillOpacity: 0.55 }}
              >
                <Tooltip sticky>{fp.label}</Tooltip>
              </Polygon>
            ));
          })}

        {/* ── OSM POWER LINES (live from OpenStreetMap) ───── */}
        {activeLayers.includes("power") &&
          (osmData.power || []).map((line, i) => (
            <Polyline key={`osm-pw-${i}`} positions={line} pathOptions={{ color: "#f59e0b", weight: 2, opacity: 0.75, dashArray: "8 5" }} />
          ))}
        {activeLayers.includes("power") &&
          uploadedSites.map((site) => {
            const stubs = buildSiteStubs(site);
            return (
              <Polyline
                key={`pw-stub-${site.id}`}
                positions={stubs.power}
                pathOptions={{ color: "#f59e0b", weight: 1.5, opacity: 0.5, dashArray: "6 4" }}
              />
            );
          })}

        {/* ── OSM RAIL (live from OpenStreetMap) ──────────── */}
        {activeLayers.includes("rail") &&
          (osmData.rail || []).map((line, i) => (
            <Polyline key={`osm-rl-${i}`} positions={line} className="rail-flow" pathOptions={{ color: "#5b8de0", weight: 2.8, opacity: 0.8 }} />
          ))}
        {activeLayers.includes("rail") &&
          uploadedSites.map((site) => {
            const stubs = buildSiteStubs(site);
            return (
              <Polyline
                key={`rl-stub-${site.id}`}
                positions={stubs.rail}
                className="rail-flow"
                pathOptions={{ color: "#5b8de0", weight: 2, opacity: 0.55 }}
              />
            );
          })}

        {/* ── OSM HIGHWAY (live from OpenStreetMap) ───────── */}
        {activeLayers.includes("highway") &&
          (osmData.highway || []).map((line, i) => (
            <Polyline key={`osm-hw-${i}`} positions={line} pathOptions={{ color: "#14b8a6", weight: 2.5, opacity: 0.7 }} />
          ))}
        {activeLayers.includes("highway") &&
          uploadedSites.map((site) => {
            const stubs = buildSiteStubs(site);
            return <Polyline key={`hw-stub-${site.id}`} positions={stubs.road} pathOptions={{ color: "#14b8a6", weight: 1.8, opacity: 0.5 }} />;
          })}

        {/* ── OSM WATERWAYS (live from OpenStreetMap) ─────── */}
        {activeLayers.includes("water") &&
          (osmData.water || []).map((line, i) => (
            <Polyline key={`osm-wt-${i}`} positions={line} pathOptions={{ color: "#06b6d4", weight: 1.6, opacity: 0.65, dashArray: "5 4" }} />
          ))}

        {/* ── OSM TELECOM/FIBER (live from OpenStreetMap) ─── */}
        {activeLayers.includes("fiber") &&
          (osmData.fiber || []).map((line, i) => (
            <Polyline key={`osm-fb-${i}`} positions={line} pathOptions={{ color: "#a855f7", weight: 1.4, opacity: 0.6, dashArray: "3 5" }} />
          ))}

        {/* ── FAA AIRSPACE ────────────────────────────────── */}
        {activeLayers.includes("airspace") &&
          FAA_AIRSPACE.map((a) => (
            <Circle
              key={a.id}
              center={a.center}
              radius={a.radius}
              pathOptions={{ color: a.color, weight: 1.2, fillColor: a.color, fillOpacity: 0.04, dashArray: "6 6", opacity: 0.55 }}
            >
              <Tooltip sticky permanent={false}>
                {a.label}
              </Tooltip>
            </Circle>
          ))}

        {/* ── FLOOD ZONES ─────────────────────────────────── */}
        {activeLayers.includes("flood") &&
          FLOOD_ZONES.map((z) => (
            <Polygon
              key={z.id}
              positions={z.positions}
              pathOptions={{ color: z.color, weight: 1.5, fillColor: z.color, fillOpacity: 0.14, dashArray: "4 3" }}
            >
              <Tooltip sticky>Flood Zone {z.risk}</Tooltip>
            </Polygon>
          ))}

        {/* Wetlands */}
        {activeLayers.includes("flood") &&
          WETLANDS.map((w) => (
            <Polygon
              key={w.id}
              positions={w.positions}
              pathOptions={{ color: "#16a34a", weight: 1, fillColor: "#16a34a", fillOpacity: 0.18, dashArray: "3 4" }}
            >
              <Tooltip sticky>Wetland Buffer</Tooltip>
            </Polygon>
          ))}

        {/* ── SITE MARKERS (removed – parcels serve as clickable site indicators) */}
      </MapContainer>

      {/* ── PARCEL INTELLIGENCE PANEL ───────────────────── */}
      <ParcelIntelPanel site={intelSite} onClose={() => setIntelSite(null)} onNavigate={handleNavigate} getPolyFn={getParcelPolygon} />

      {/* ── BASEMAP TOGGLE ───────────────────────────────── */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 400, display: "flex", gap: 4 }}>
        {[
          ["dark", "Dark"],
          ["satellite", "Satellite"],
          ["terrain", "Terrain"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setBasemap(key)}
            style={{
              height: 28,
              padding: "0 10px",
              borderRadius: 6,
              fontSize: 10.5,
              fontWeight: 600,
              background: basemap === key ? "var(--ds-accent-bg)" : "var(--ds-panel)",
              border: `1px solid ${basemap === key ? "var(--ds-accent-border)" : "var(--ds-border)"}`,
              color: basemap === key ? "var(--ds-accent)" : "var(--ds-text-muted)",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── LAYER CONTROLS ───────────────────────────────── */}
      <div className="map-controls">
        {LAYER_DEFS.map((l) => (
          <button key={l.id} className={`map-layer-btn${activeLayers.includes(l.id) ? " active" : ""}`} onClick={() => toggleLayer(l.id)}>
            {l.label}
            {osmFetching[l.id] ? " ⟳" : ""}
          </button>
        ))}
      </div>

      {/* ── LEGEND ───────────────────────────────────────── */}
      {/* <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 10,
          zIndex: 400,
          background: "var(--ds-panel)",
          border: "1px solid var(--ds-border)",
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 9.5,
          color: "var(--ds-text-faint)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxWidth: 140,
        }}
      >
        {[
          { color: "#22d3ee", label: "Recommended (90+)" },
          { color: "#22c55e", label: "Strong (82+)" },
          { color: "#d97706", label: "Constrained" },
          { color: "#ef4444", label: "At Risk" },
          { color: "#3b82f6", label: "Flood Zone" },
          { color: "#60a5fa", label: "FAA Airspace" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color + "33", border: `1.5px solid ${color}`, flexShrink: 0 }} />
            {label}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <div style={{ width: 16, height: 3, borderRadius: 2, background: "#5b8de0" }} />
          Rail (animated)
        </div>
      </div> */}

      {/* ── SITE COUNT ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: intelSite ? 290 : 10,
          zIndex: 400,
          background: "var(--ds-panel)",
          border: "1px solid var(--ds-border)",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 10,
          color: "var(--ds-text-faint)",
          transition: "left 0.2s",
        }}
      >
        {visibleSites.length}/{sites.length} sites · {basemap === "satellite" ? "Satellite" : basemap === "terrain" ? "Terrain" : "Dark"} · Parcel
        intelligence active
      </div>
    </div>
  );
}
