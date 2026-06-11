import * as XLSX from "xlsx";

/* Flexible column finder — case-insensitive, partial match */
function col(row, ...keys) {
  for (const key of keys) {
    const k = key.toLowerCase().replace(/\s+/g, "");
    const match = Object.keys(row).find((r) => r.toLowerCase().replace(/\s+/g, "").includes(k));
    if (match !== undefined && row[match] !== null && row[match] !== undefined && row[match] !== "") {
      return row[match];
    }
  }
  return null;
}

function num(v, fallback = 0) {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

/* Known WA city coordinates for name-based fallback */
const WA_COORDS = {
  tacoma: [47.2529, -122.4443],
  "tacoma industrial": [47.2529, -122.4443],
  everett: [47.9789, -122.2021],
  "everett aerospace": [47.9789, -122.2021],
  spokane: [47.6588, -117.426],
  "spokane logistics": [47.6588, -117.426],
  yakima: [46.6021, -120.5059],
  "yakima manufacturing": [46.6021, -120.5059],
  seattle: [47.6062, -122.3321],
  bellevue: [47.6101, -122.2015],
  kent: [47.3809, -122.2348],
  renton: [47.4829, -122.2171],
};

function lookupCoords(name) {
  const lower = (name || "").toLowerCase();
  for (const [key, coords] of Object.entries(WA_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return null;
}

function getSheet(wb, ...names) {
  for (const name of names) {
    const direct = wb.Sheets[name];
    if (direct) return XLSX.utils.sheet_to_json(direct, { defval: null });
    const fuzzy = Object.keys(wb.Sheets).find((k) => k.toLowerCase().includes(name.toLowerCase()));
    if (fuzzy) return XLSX.utils.sheet_to_json(wb.Sheets[fuzzy], { defval: null });
  }
  return [];
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary", cellDates: true });

        let masterRows = getSheet(wb, "Site Master", "SiteMaster", "Master", "Sites");
        /* Fall back to the first sheet for arbitrary single-sheet Excel files */
        if (!masterRows.length && wb.SheetNames.length > 0) {
          masterRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });
        }
        const infraRows = getSheet(wb, "Infrastructure", "Infra", "Infrastructure Details");
        const logRows = getSheet(wb, "Logistics", "Logistics Details");
        const envRows = getSheet(wb, "Environmental", "Environment", "ESG");
        const compRows = getSheet(wb, "Computed Metrics", "Computed", "Metrics");

        const sites = masterRows.map((master, idx) => {
          const siteCode = String(col(master, "SiteCode", "Site Code", "Code") || `SITE-${String(idx + 1).padStart(3, "0")}`);
          const id = siteCode.toLowerCase().replace(/[^a-z0-9]/g, "");

          /* Match related rows */
          const byCode = (rows) => rows.find((r) => String(col(r, "SiteCode", "Site Code", "Code") || "") === siteCode) || rows[idx] || {};
          const infra = byCode(infraRows);
          const log = byCode(logRows);
          const env = byCode(envRows);
          const comp = byCode(compRows);

          const name = String(col(master, "SiteName", "Site Name", "Name") || siteCode);
          const shortName = name.split(" ")[0];
          const region = String(col(master, "Region") || "Washington");
          const acreage = num(col(master, "TotalAcreage", "Total Acreage", "Acreage", "Acres"), 200);

          /* Coordinates */
          let lat = num(col(master, "Latitude", "Lat"), 0);
          let lon = num(col(master, "Longitude", "Lon", "Long"), 0);
          if (!lat || !lon) {
            const fallback = lookupCoords(name);
            if (fallback) [lat, lon] = fallback;
            else {
              lat = 47.3;
              lon = -120.5;
            }
          }

          const zoning = String(col(master, "ZonedUse", "Zoned Use", "Zoning", "Zone", "Type") || "Industrial");
          const floodZone = String(col(master, "FloodZone", "Flood Zone", "Flood") || "Zone X");

          /* Infrastructure */
          const power = num(col(infra, "GridAvailabilityPct", "Grid Availability", "GridAvail", "PowerAvail", "Power"), 80);
          const gridMW = num(col(infra, "GridCapacityMW", "Grid Capacity", "CapacityMW", "MW"), 30);
          const waterPsi = num(col(infra, "WaterPressurePsi", "Water Pressure", "WaterPsi"), 60);
          const waterPct = Math.min(100, Math.round((waterPsi / 80) * 100));
          const waterLabel = waterPct >= 80 ? "High" : waterPct >= 60 ? "Medium" : "Low";
          const fiberRaw = col(infra, "FiberPresent", "Fiber", "FiberAvail");
          const fiber = fiberRaw === true || fiberRaw === 1 || String(fiberRaw).toLowerCase() === "yes" || String(fiberRaw).toLowerCase() === "true";

          /* Logistics */
          const railScore = num(col(log, "RailScore", "Rail Score", "Rail"), 70);
          const railAccess = String(
            col(log, "RailAccess", "Rail Access", "Rail") || (railScore >= 90 ? "Excellent" : railScore >= 75 ? "Good" : "Fair"),
          );
          const highway = String(col(log, "HighwayAccess", "Highway Access", "Highway") || "Good");

          /* Environmental */
          const solarScore = num(col(env, "SolarScore", "Solar Score", "Solar"), 60);
          const solar = solarScore >= 88 ? "Very High" : solarScore >= 72 ? "High" : solarScore >= 50 ? "Medium" : "Low";
          const esg = num(col(env, "ESGScore", "ESG Score", "ESG"), 75);

          /* Financials */
          const investment = num(
            col(comp, "InvestmentM", "Investment", "Invest", "Cost") || col(master, "AssessedValueM", "Assessed Value"),
            Math.round(acreage * 0.4),
          );
          const roi = num(col(comp, "ROIPct", "ROI"), 12);

          /* Acquisition / strategic fields (used by buildExecKpis via getAcquisitionData) */
          const estimatedCapexM = num(col(comp, "EstimatedCapexM", "Capex", "CapexM"), investment);
          const landAcquisitionCostM = num(col(comp, "LandAcquisitionCostM", "LandCostM", "LandM"), Math.round(investment * 0.15));
          const permittingMonths = num(col(comp, "PermittingMonths", "Permitting"), 18);
          const constructionMonths = num(col(comp, "ConstructionMonths", "Construction"), 36);
          const overallSiteScore = num(col(comp, "OverallSiteScore", "SiteScore"), 0);

          /* Computed scores */
          const aiScore = Math.round(power * 0.35 + waterPct * 0.2 + railScore * 0.2 + esg * 0.15 + solarScore * 0.1);
          const atRisk = power < 80 || waterPct < 60 || floodZone.toLowerCase().includes(" ae");
          const ragStatus = atRisk ? "warning" : "success";
          const riskLevel = atRisk ? "warning" : "success";
          const risk = atRisk ? "Medium" : "Low";

          let issue = null;
          if (power < 80) issue = `Power availability at ${power}% — grid reinforcement required`;
          else if (waterPct < 60) issue = `Water availability at ${waterPct}% — stress risk detected`;

          const expandPotential = acreage >= 300 ? "High" : acreage >= 180 ? "Medium" : "Low";

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
            risk,
            riskLevel,
            status: atRisk ? "WARNING" : "NORMAL",
            ragStatus,
            investment,
            laborAvail: esg >= 80 ? "High" : "Medium",
            expandPotential,
            highlight: false,
            issue,
            description: `${name} — AI Score ${aiScore}/100. ${acreage} acres, ${zoning}.`,
            powerTrend: Array(12)
              .fill(0)
              .map((_, i) => Math.max(0, Math.min(100, power - (11 - i) * 0.3))),
            esgTrend: Array(12)
              .fill(0)
              .map((_, i) => Math.max(0, Math.min(100, esg - (11 - i) * 0.4))),
            /* acquisition fields for getAcquisitionData integration */
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
            _source: "excel",
          };
        });

        resolve(sites.filter((s) => s.name && s.coords[0] && s.coords[1]));
      } catch (err) {
        reject(new Error(`Excel parse failed: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsBinaryString(file);
  });
}
