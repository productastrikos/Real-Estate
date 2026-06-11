import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { SITES, GROWTH_DATA } from "../data/sites.js";
import {
  computeKpiData,
  computeRadarData,
  computeCostData,
  computeHeatmapData,
  generateAIInsights,
  computeAIScore,
} from "../utils/siteComputations.js";
import { dxfBboxToLatLon, dxfBoundaryToLatLon } from "../utils/dxfParser.js";
import { updateAcquisitionData } from "../data/acquisitionData.js";

const SiteDataContext = createContext(null);

/* Compute rectangular parcel polygon from site coords + acreage */
function acreagePoly(lat, lon, acreage) {
  const sqFt = acreage * 43560;
  const side = Math.sqrt(sqFt);
  const dLat = (side / 364000) * 0.5;
  const dLon = (side / (364000 * Math.cos((lat * Math.PI) / 180))) * 0.5;
  return [
    [lat + dLat, lon - dLon],
    [lat + dLat, lon + dLon],
    [lat - dLat, lon + dLon],
    [lat - dLat, lon - dLon],
  ];
}

function getSitePolygon(site, dxfData) {
  if (site.boundary?.length) return site.boundary;
  const [lat, lon] = site.coords || [47.3, -120.5];
  const acreage = parseFloat(site.area) || 200;
  // Prefer an exact DXF boundary polyline if available (more accurate parcel shape)
  if (dxfData?.siteBoundary && dxfData.siteBbox) {
    const poly = dxfBoundaryToLatLon(dxfData.siteBoundary, dxfData.siteBbox, lat, lon);
    if (poly && poly.length) return poly;
  }
  if (dxfData?.siteBbox) {
    const poly = dxfBboxToLatLon(dxfData.siteBbox, lat, lon);
    if (poly) return poly;
  }
  return acreagePoly(lat, lon, acreage);
}

export function SiteDataProvider({ children }) {
  const [sites, setSites] = useState(SITES);
  const [parcelPolygons, setParcelPolygons] = useState({});
  const [siteExtras, setSiteExtras] = useState({}); /* siteId → { dxfData } */
  const [lastAddedSiteId, setLastAddedSiteId] = useState(null);

  /* Pre-compute polygons for default sites */
  useMemo(() => {
    const polys = {};
    SITES.forEach((s) => {
      polys[s.id] = getSitePolygon(s, null);
    });
    setParcelPolygons(polys);
  }, []);

  const addSite = useCallback((siteObj, dxfData = null) => {
    const scored = { ...siteObj, aiScore: siteObj.aiScore || computeAIScore(siteObj) };
    /* Populate acquisitionData for pages using getAcquisitionData(siteId) */
    if (scored._acq) {
      updateAcquisitionData(scored.id, {
        /* defaults derived from simple site fields */
        overallSiteScore: scored.aiScore,
        electricalCapacityMW: scored.power ? Math.round(scored.power * 5) : 300,
        waterCapacityMGD: 14,
        railAccess: scored.rail || "N/A",
        railSpurFeasibility: scored.railScore >= 85 ? "Direct connection possible" : "Connection feasible",
        /* _acq values from the parser override defaults — they carry richer parsed data */
        ...scored._acq,
      });
    }
    setSites((prev) => {
      const idx = prev.findIndex((s) => s.id === scored.id);
      return idx >= 0 ? prev.map((s, i) => (i === idx ? scored : s)) : [...prev, scored];
    });
    setParcelPolygons((prev) => ({
      ...prev,
      [scored.id]: getSitePolygon(scored, dxfData),
    }));
    if (dxfData) {
      setSiteExtras((prev) => ({ ...prev, [scored.id]: { dxfData } }));
    }
    setLastAddedSiteId(scored.id);
  }, []);

  const deleteSite = useCallback((id) => {
    setSites((prev) => prev.filter((s) => s.id !== id));
    setParcelPolygons((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setSiteExtras((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  }, []);

  const getParcelPolygon = useCallback((id) => parcelPolygons[id] || null, [parcelPolygons]);

  const kpiData = useMemo(() => computeKpiData(sites), [sites]);
  const radarData = useMemo(() => computeRadarData(sites), [sites]);
  const costData = useMemo(() => computeCostData(sites), [sites]);
  const heatmapData = useMemo(() => computeHeatmapData(sites), [sites]);
  const aiInsights = useMemo(() => generateAIInsights(sites), [sites]);

  return (
    <SiteDataContext.Provider
      value={{
        sites,
        addSite,
        deleteSite,
        kpiData,
        radarData,
        costData,
        heatmapData,
        growthData: GROWTH_DATA,
        aiInsights,
        getParcelPolygon,
        siteExtras,
        lastAddedSiteId,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used within SiteDataProvider");
  return ctx;
}
