function num(v, fallback = 0) {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

function bool(v) {
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "yes" || String(v) === "1" || String(v).toLowerCase() === "true";
}

function siteFromRow(row) {
  const siteCode = String(row["SiteCode"] || row["Site Code"] || row["Code"] || "SITE-001");
  const id = siteCode.toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = String(row["SiteName"] || row["Site Name"] || row["Name"] || siteCode);
  const shortName = name.split(" ")[0];
  const region = String(row["Region"] || "Washington");
  const acreage = num(row["TotalAcreage"] || row["Total Acreage"] || row["Acreage"] || row["Acres"], 200);
  const lat = num(row["Latitude"] || row["Lat"], 47.3);
  const lon = num(row["Longitude"] || row["Lon"] || row["Long"], -120.5);
  const zoning = String(row["ZonedUse"] || row["Zoned Use"] || row["Zoning"] || row["Type"] || "Industrial");
  const floodZone = String(row["FloodZone"] || row["Flood Zone"] || row["Flood"] || "Zone X");

  const power = num(row["GridAvailabilityPct"] || row["Grid Availability"] || row["PowerAvail"] || row["Power"], 80);
  const gridMW = num(row["GridCapacityMW"] || row["Grid Capacity"] || row["MW"], 300);
  const waterPsi = num(row["WaterPressurePsi"] || row["Water Pressure"] || row["WaterPsi"], 60);
  const waterPct = Math.min(100, Math.round((waterPsi / 80) * 100));
  const waterLabel = waterPct >= 80 ? "High" : waterPct >= 60 ? "Medium" : "Low";
  const fiber = bool(row["FiberPresent"] || row["Fiber"] || row["FiberAvail"]);

  const railScore = num(row["RailScore"] || row["Rail Score"] || row["Rail"], 70);
  const railAccess = String(row["RailAccess"] || row["Rail Access"] || (railScore >= 90 ? "Excellent" : railScore >= 75 ? "Good" : "Fair"));
  const highway = String(row["HighwayAccess"] || row["Highway Access"] || row["Highway"] || "Good");

  const solarScore = num(row["SolarScore"] || row["Solar Score"] || row["Solar"], 60);
  const solar = solarScore >= 88 ? "Very High" : solarScore >= 72 ? "High" : solarScore >= 50 ? "Medium" : "Low";
  const esg = num(row["ESGScore"] || row["ESG Score"] || row["ESG"], 75);

  const investment = num(row["InvestmentM"] || row["Investment"] || row["Invest"] || row["Cost"], Math.round(acreage * 0.4));
  const roi = num(row["ROIPct"] || row["ROI"], 12);
  const estimatedCapexM = num(row["EstimatedCapexM"] || row["Capex"] || row["CapexM"], investment);
  const landAcquisitionCostM = num(row["LandAcquisitionCostM"] || row["LandCostM"] || row["LandM"], Math.round(investment * 0.15));
  const permittingMonths = num(row["PermittingMonths"] || row["Permitting"], 18);
  const constructionMonths = num(row["ConstructionMonths"] || row["Construction"], 36);
  const overallSiteScore = num(row["OverallSiteScore"] || row["SiteScore"], 0);

  const aiScore = Math.round(power * 0.35 + waterPct * 0.2 + railScore * 0.2 + esg * 0.15 + solarScore * 0.1);
  const atRisk = power < 80 || waterPct < 60 || floodZone.toLowerCase().includes(" ae");
  const ragStatus = atRisk ? "warning" : "success";
  let issue = null;
  if (power < 80) issue = `Power availability at ${power}% — grid reinforcement required`;
  else if (waterPct < 60) issue = `Water availability at ${waterPct}% — stress risk detected`;

  return {
    id,
    name,
    shortName,
    coords: [lat, lon],
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
    _source: "csv",
  };
}

function parseCSVText(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSVText(e.target.result);
        const sites = rows.map(siteFromRow).filter((s) => s.coords[0] && s.coords[1]);
        if (!sites.length) throw new Error("No valid sites found in CSV");
        resolve(sites);
      } catch (err) {
        reject(new Error(`CSV parse failed: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file, "utf-8");
  });
}
