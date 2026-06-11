function num(v, fallback = 0) {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

function bool(v) {
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "yes" || String(v) === "1" || String(v).toLowerCase() === "true";
}

/* Convert GeoJSON Polygon coordinates [[lon,lat],...] to [[lat,lon],...] for Leaflet */
function geoJsonPolyToLatLon(coordinates) {
  if (!coordinates || !coordinates[0]) return null;
  return coordinates[0].map(([lon, lat]) => [lat, lon]);
}

function siteFromProperties(props, geometry) {
  const siteCode = String(props["SiteCode"] || props["Site Code"] || props["Code"] || "SITE-001");
  const id = siteCode.toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = String(props["SiteName"] || props["Site Name"] || props["Name"] || siteCode);
  const shortName = name.split(" ")[0];
  const region = String(props["Region"] || "Washington");
  const acreage = num(props["TotalAcreage"] || props["Total Acreage"] || props["Acreage"], 200);

  /* Coordinates — use embedded lat/lon props, or derive from geometry centroid */
  let lat = num(props["Latitude"] || props["Lat"], 0);
  let lon = num(props["Longitude"] || props["Lon"], 0);
  if ((!lat || !lon) && geometry?.type === "Polygon" && geometry.coordinates?.[0]?.length) {
    const pts = geometry.coordinates[0];
    lon = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    lat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  }

  const zoning = String(props["ZonedUse"] || props["Zoned Use"] || props["Zoning"] || props["Type"] || "Industrial");
  const floodZone = String(props["FloodZone"] || props["Flood Zone"] || "Zone X");

  const power = num(props["GridAvailabilityPct"] || props["Grid Availability"] || props["Power"], 80);
  const gridMW = num(props["GridCapacityMW"] || props["Grid Capacity"] || props["MW"], 300);
  const waterPsi = num(props["WaterPressurePsi"] || props["Water Pressure"] || props["WaterPsi"], 60);
  const waterPct = Math.min(100, Math.round((waterPsi / 80) * 100));
  const waterLabel = waterPct >= 80 ? "High" : waterPct >= 60 ? "Medium" : "Low";
  const fiber = bool(props["FiberPresent"] || props["Fiber"]);

  const railScore = num(props["RailScore"] || props["Rail Score"], 70);
  const railAccess = String(props["RailAccess"] || props["Rail Access"] || (railScore >= 90 ? "Excellent" : railScore >= 75 ? "Good" : "Fair"));
  const highway = String(props["HighwayAccess"] || props["Highway Access"] || "Good");

  const solarScore = num(props["SolarScore"] || props["Solar Score"], 60);
  const solar = solarScore >= 88 ? "Very High" : solarScore >= 72 ? "High" : solarScore >= 50 ? "Medium" : "Low";
  const esg = num(props["ESGScore"] || props["ESG Score"] || props["ESG"], 75);

  const investment = num(props["InvestmentM"] || props["Investment"], Math.round(acreage * 0.4));
  const roi = num(props["ROIPct"] || props["ROI"], 12);
  const estimatedCapexM = num(props["EstimatedCapexM"] || props["Capex"], investment);
  const landAcquisitionCostM = num(props["LandAcquisitionCostM"] || props["LandCostM"], Math.round(investment * 0.15));
  const permittingMonths = num(props["PermittingMonths"] || props["Permitting"], 18);
  const constructionMonths = num(props["ConstructionMonths"] || props["Construction"], 36);
  const overallSiteScore = num(props["OverallSiteScore"] || props["SiteScore"], 0);

  const aiScore = Math.round(power * 0.35 + waterPct * 0.2 + railScore * 0.2 + esg * 0.15 + solarScore * 0.1);
  const atRisk = power < 80 || waterPct < 60 || floodZone.toLowerCase().includes(" ae");
  const ragStatus = atRisk ? "warning" : "success";
  let issue = null;
  if (power < 80) issue = `Power availability at ${power}% — grid reinforcement required`;
  else if (waterPct < 60) issue = `Water availability at ${waterPct}% — stress risk detected`;

  /* Extract boundary polygon from GeoJSON geometry */
  const boundary = geometry?.type === "Polygon" ? geoJsonPolyToLatLon(geometry.coordinates) : null;

  return {
    id,
    name,
    shortName,
    coords: [lat, lon],
    boundary: boundary || undefined,
    type: zoning,
    region,
    area: `${acreage} Acres`,
    power,
    water: waterLabel,
    waterPct,
    waterLabel,
    rail: railAccess,
    railScore,
    highway,
    fiber,
    solar,
    solarScore,
    aiScore,
    roi,
    esg,
    risk: atRisk ? "Medium" : "Low",
    riskLevel: ragStatus,
    status: atRisk ? "WARNING" : "NORMAL",
    ragStatus,
    investment,
    laborAvail: esg >= 80 ? "High" : "Medium",
    expandPotential: acreage >= 300 ? "High" : acreage >= 180 ? "Medium" : "Low",
    highlight: false,
    issue,
    description: `${name} — AI Score ${aiScore}/100. ${acreage} acres, ${zoning}.`,
    powerTrend: Array(12).fill(0).map((_, i) => Math.max(0, Math.min(100, power - (11 - i) * 0.3))),
    esgTrend: Array(12).fill(0).map((_, i) => Math.max(0, Math.min(100, esg - (11 - i) * 0.4))),
    _acq: {
      estimatedCapexM,
      landAcquisitionCostM,
      permittingMonths,
      constructionMonths,
      overallSiteScore: overallSiteScore || aiScore,
      investmentConfidence: aiScore >= 85 ? "High" : "Moderate",
      electricalCapacityMW: gridMW || Math.round(power * 5),
      waterCapacityMGD: Math.round((waterPsi / 80) * 22),
      railAccess,
      railSpurFeasibility: railScore >= 85 ? "Direct connection possible" : "Connection feasible",
      parcelAcres: acreage,
      buildableAcres: Math.round(acreage * 0.8),
      truckQueuePerDay: Math.round(power * 3.5),
      interstateDistMiles: highway === "Excellent" ? 1.5 : highway === "Good" ? 3.0 : 5.5,
      interstateRef: region.includes("Seattle") || region.includes("Tacoma") ? "I-5" : "I-90",
    },
    _source: "geojson",
  };
}

export function parseGeoJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        let features = [];
        if (json.type === "FeatureCollection") features = json.features || [];
        else if (json.type === "Feature") features = [json];
        else throw new Error('GeoJSON must be a Feature or FeatureCollection with site properties');

        const sites = features
          .filter((f) => f.properties)
          .map((f) => siteFromProperties(f.properties, f.geometry))
          .filter((s) => s.coords[0] && s.coords[1]);

        if (!sites.length) throw new Error("No valid sites found in GeoJSON");
        resolve(sites);
      } catch (err) {
        reject(new Error(`GeoJSON parse failed: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file, "utf-8");
  });
}
