/* ============================================================
   SITE ACQUISITION DATA
   Realistic pre-construction land acquisition data per site.
   Sources: county GIS, utility filings, FEMA, FAA, geotechnical
   surveys, environmental assessments, and public infrastructure maps.

   Page distribution:
     Page 1 – Enterprise Infrastructure : DWG-001, DWG-004, DWG-005
     Page 2 – Site Environmental        : DWG-002, DWG-006, DWG-007, DWG-009
     Page 4 – Blueprint Intelligence    : DWG-001, DWG-003, DWG-008, DWG-010
     Page 6 – Strategic Intelligence    : Cross-cutting summary KPIs
   ============================================================ */

export const ACQUISITION = {
  /* ─── Spokane Valley Manufacturing Corridor ─────────────────
     Source: Spokane County GIS, Avista Utilities, WSDOT, FEMA   */
  spokane: {
    // DWG-001 Master Site Layout
    parcelAcres: 260,
    buildableAcres: 210,
    landUseAllocation: {
      Manufacturing: 44,
      Logistics: 20,
      Utilities: 11,
      GreenBuffer: 16,
      Parking: 9,
    },
    internalRoadsKm: 32,
    securityBufferFt: 300,

    // DWG-004 Utility Infrastructure
    electricalCapacityMW: 485,
    electricalProvider: "Avista Utilities",
    waterCapacityMGD: 18,
    sewageCapacityMGD: 15,
    gasLine: "20-inch industrial line",
    fiberConnectivity: "Dual redundant fiber",
    backupPowerFeasible: true,

    // DWG-005 Transportation & Logistics
    interstateDistMiles: 2.5,
    interstateRef: "I-90",
    railAccess: "BNSF Railway (0.8 mi)",
    railSpurFeasibility: "Direct connection possible",
    cargoAirportMiles: 7,
    cargoAirportRef: "GEG – Spokane International",
    portConnectivityMiles: 295,
    truckQueuePerDay: 320,
    employeeParkingSpaces: 8500,

    // DWG-002 Topographic Survey
    elevationRangeFt: "1,870 – 1,920",
    maxSlopePct: 2.1,
    floodplainPresent: false,
    cutFillCubicYards: 2200000,
    soilErosionRisk: "Low",
    naturalDrainageChannels: 2,

    // DWG-006 Environmental Constraints
    wetlandsAcres: 8,
    protectedSpecies: "None identified",
    floodZone: "Zone X (minimal risk)",
    soilContamination: "None",
    airQualityIndex: "Good",
    esgRiskScore: "Low",

    // DWG-007 Geotechnical
    boreholeCount: 145,
    soilBearingCapacityPsf: 4200,
    groundwaterDepthFt: 24,
    liquefactionRisk: "Very Low",
    rockExcavationNeed: "Low",
    foundationRecommendation: "Spread footing",

    // DWG-009 Stormwater & Drainage
    retentionPondGallons: 14000000,
    drainagePipeNetworkKm: 58,
    peakStormHandling: "100-year storm",
    waterRecyclingCapable: true,
    permeableSurfaceRatioPct: 18,
    epaComplianceStatus: "Compliant",

    // DWG-003 FAA Airspace
    distanceToAirportMiles: 7,
    faaHeightRestrictionFt: 220,
    radarInterferenceRisk: "Low",
    obstructionPenetrations: "None",
    flightPathCompatibility: "Approved",
    noiseExposureZone: "Outside 65 dB contour",

    // DWG-008 BIM Facility Concept
    assemblyBays: 5,
    hangarHeightM: 36,
    warehouseSqFt: 850000,
    roboticsZones: true,
    smartFactoryIntegration: true,
    digitalTwinCompatibility: "Full BIM integration",

    // DWG-010 Security
    fenceLengthMiles: 12,
    surveillanceTowers: 16,
    accessControlGates: 8,
    vehicleScreeningBays: 6,
    secureDefenseZone: false,
    cybersecurityIntegration: "OT + IT integrated SOC",

    // Strategic / Financial
    estimatedCapexM: 340,
    landAcquisitionCostM: 42,
    permittingMonths: 18,
    constructionMonths: 36,
    overallSiteScore: 82,
    investmentConfidence: "High",
  },

  /* ─── Tacoma Port Manufacturing Hub ─────────────────────────
     Source: Pierce County GIS, PSE/Tacoma Power, BNSF, FEMA     */
  tacoma: {
    // DWG-001 Master Site Layout
    parcelAcres: 320,
    buildableAcres: 272,
    landUseAllocation: {
      Manufacturing: 45,
      Logistics: 20,
      Utilities: 10,
      GreenBuffer: 15,
      Parking: 10,
    },
    internalRoadsKm: 42,
    securityBufferFt: 300,

    // DWG-004 Utility Infrastructure
    electricalCapacityMW: 650,
    electricalProvider: "PSE / Tacoma Power",
    waterCapacityMGD: 22,
    sewageCapacityMGD: 18,
    gasLine: "24-inch industrial line",
    fiberConnectivity: "Dual redundant fiber",
    backupPowerFeasible: true,

    // DWG-005 Transportation & Logistics
    interstateDistMiles: 1.8,
    interstateRef: "I-5",
    railAccess: "BNSF Port Rail (direct)",
    railSpurFeasibility: "Direct connection",
    cargoAirportMiles: 12,
    cargoAirportRef: "SEA – Seattle-Tacoma International",
    portConnectivityMiles: 0,
    truckQueuePerDay: 450,
    employeeParkingSpaces: 12000,

    // DWG-002 Topographic Survey
    elevationRangeFt: "50 – 85",
    maxSlopePct: 3.8,
    floodplainPresent: false,
    cutFillCubicYards: 3200000,
    soilErosionRisk: "Low",
    naturalDrainageChannels: 3,

    // DWG-006 Environmental Constraints
    wetlandsAcres: 42,
    protectedSpecies: "None identified",
    floodZone: "Zone AE (moderate risk)",
    soilContamination: "Minor remediation required",
    airQualityIndex: "Good",
    esgRiskScore: "Medium",

    // DWG-007 Geotechnical
    boreholeCount: 185,
    soilBearingCapacityPsf: 3800,
    groundwaterDepthFt: 12,
    liquefactionRisk: "Low",
    rockExcavationNeed: "Moderate",
    foundationRecommendation: "Deep pile foundations",

    // DWG-009 Stormwater & Drainage
    retentionPondGallons: 18000000,
    drainagePipeNetworkKm: 72,
    peakStormHandling: "100-year storm",
    waterRecyclingCapable: true,
    permeableSurfaceRatioPct: 22,
    epaComplianceStatus: "Compliant",

    // DWG-003 FAA Airspace
    distanceToAirportMiles: 12,
    faaHeightRestrictionFt: 320,
    radarInterferenceRisk: "Low",
    obstructionPenetrations: "None",
    flightPathCompatibility: "Approved",
    noiseExposureZone: "Outside 65 dB contour",

    // DWG-008 BIM Facility Concept
    assemblyBays: 8,
    hangarHeightM: 42,
    warehouseSqFt: 1200000,
    roboticsZones: true,
    smartFactoryIntegration: true,
    digitalTwinCompatibility: "Full BIM integration",

    // DWG-010 Security
    fenceLengthMiles: 18,
    surveillanceTowers: 24,
    accessControlGates: 12,
    vehicleScreeningBays: 8,
    secureDefenseZone: true,
    cybersecurityIntegration: "OT + IT integrated SOC",

    // Strategic / Financial
    estimatedCapexM: 520,
    landAcquisitionCostM: 68,
    permittingMonths: 22,
    constructionMonths: 42,
    overallSiteScore: 94,
    investmentConfidence: "High",
  },

  /* ─── Everett Aerospace Manufacturing Campus ─────────────────
     Source: Snohomish County GIS, SnoPUD, FAA (Paine Field), FEMA */
  everett: {
    // DWG-001 Master Site Layout
    parcelAcres: 220,
    buildableAcres: 185,
    landUseAllocation: {
      Manufacturing: 46,
      Logistics: 18,
      Utilities: 10,
      GreenBuffer: 16,
      Parking: 10,
    },
    internalRoadsKm: 28,
    securityBufferFt: 300,

    // DWG-004 Utility Infrastructure
    electricalCapacityMW: 520,
    electricalProvider: "Snohomish County PUD",
    waterCapacityMGD: 16,
    sewageCapacityMGD: 13,
    gasLine: "18-inch industrial line",
    fiberConnectivity: "Dual redundant fiber",
    backupPowerFeasible: true,

    // DWG-005 Transportation & Logistics
    interstateDistMiles: 3.2,
    interstateRef: "I-5",
    railAccess: "BNSF Railway (direct)",
    railSpurFeasibility: "Direct connection",
    cargoAirportMiles: 2,
    cargoAirportRef: "PAE – Paine Field",
    portConnectivityMiles: 28,
    truckQueuePerDay: 380,
    employeeParkingSpaces: 10500,

    // DWG-002 Topographic Survey
    elevationRangeFt: "40 – 75",
    maxSlopePct: 2.8,
    floodplainPresent: false,
    cutFillCubicYards: 2600000,
    soilErosionRisk: "Low",
    naturalDrainageChannels: 2,

    // DWG-006 Environmental Constraints
    wetlandsAcres: 18,
    protectedSpecies: "None identified",
    floodZone: "Zone X (minimal risk)",
    soilContamination: "None",
    airQualityIndex: "Good",
    esgRiskScore: "Low",

    // DWG-007 Geotechnical
    boreholeCount: 162,
    soilBearingCapacityPsf: 4800,
    groundwaterDepthFt: 16,
    liquefactionRisk: "Very Low",
    rockExcavationNeed: "Low",
    foundationRecommendation: "Spread footing with reinforcement",

    // DWG-009 Stormwater & Drainage
    retentionPondGallons: 16000000,
    drainagePipeNetworkKm: 64,
    peakStormHandling: "100-year storm",
    waterRecyclingCapable: true,
    permeableSurfaceRatioPct: 20,
    epaComplianceStatus: "Compliant",

    // DWG-003 FAA Airspace
    distanceToAirportMiles: 2,
    faaHeightRestrictionFt: 180,
    radarInterferenceRisk: "Low",
    obstructionPenetrations: "None",
    flightPathCompatibility: "Conditional – height restricted",
    noiseExposureZone: "Outside 65 dB contour",

    // DWG-008 BIM Facility Concept
    assemblyBays: 6,
    hangarHeightM: 38,
    warehouseSqFt: 950000,
    roboticsZones: true,
    smartFactoryIntegration: true,
    digitalTwinCompatibility: "Full BIM integration",

    // DWG-010 Security
    fenceLengthMiles: 15,
    surveillanceTowers: 20,
    accessControlGates: 10,
    vehicleScreeningBays: 7,
    secureDefenseZone: true,
    cybersecurityIntegration: "OT + IT integrated SOC",

    // Strategic / Financial
    estimatedCapexM: 428,
    landAcquisitionCostM: 58,
    permittingMonths: 20,
    constructionMonths: 38,
    overallSiteScore: 88,
    investmentConfidence: "High",
  },

  /* ─── Yakima Valley Renewable Energy Campus ──────────────────
     Source: Yakima County GIS, PacifiCorp, BNSF, FEMA           */
  yakima: {
    // DWG-001 Master Site Layout
    parcelAcres: 135,
    buildableAcres: 112,
    landUseAllocation: {
      Manufacturing: 42,
      Logistics: 18,
      Utilities: 12,
      GreenBuffer: 20,
      Parking: 8,
    },
    internalRoadsKm: 18,
    securityBufferFt: 250,

    // DWG-004 Utility Infrastructure
    electricalCapacityMW: 380,
    electricalProvider: "PacifiCorp",
    waterCapacityMGD: 14,
    sewageCapacityMGD: 11,
    gasLine: "16-inch industrial line",
    fiberConnectivity: "Single fiber (upgrade planned)",
    backupPowerFeasible: true,

    // DWG-005 Transportation & Logistics
    interstateDistMiles: 4.1,
    interstateRef: "I-82",
    railAccess: "BNSF Railway (8 mi)",
    railSpurFeasibility: "Connection feasible",
    cargoAirportMiles: 3,
    cargoAirportRef: "YKM – Yakima Air Terminal",
    portConnectivityMiles: 180,
    truckQueuePerDay: 280,
    employeeParkingSpaces: 7200,

    // DWG-002 Topographic Survey
    elevationRangeFt: "1,045 – 1,090",
    maxSlopePct: 1.2,
    floodplainPresent: false,
    cutFillCubicYards: 1800000,
    soilErosionRisk: "Very Low",
    naturalDrainageChannels: 1,

    // DWG-006 Environmental Constraints
    wetlandsAcres: 5,
    protectedSpecies: "None identified",
    floodZone: "Zone X (minimal risk)",
    soilContamination: "None",
    airQualityIndex: "Good",
    esgRiskScore: "Low",

    // DWG-007 Geotechnical
    boreholeCount: 118,
    soilBearingCapacityPsf: 5200,
    groundwaterDepthFt: 28,
    liquefactionRisk: "Very Low",
    rockExcavationNeed: "Very Low",
    foundationRecommendation: "Spread footing",

    // DWG-009 Stormwater & Drainage
    retentionPondGallons: 12000000,
    drainagePipeNetworkKm: 48,
    peakStormHandling: "100-year storm",
    waterRecyclingCapable: true,
    permeableSurfaceRatioPct: 25,
    epaComplianceStatus: "Compliant",

    // DWG-003 FAA Airspace
    distanceToAirportMiles: 3,
    faaHeightRestrictionFt: 260,
    radarInterferenceRisk: "Low",
    obstructionPenetrations: "None",
    flightPathCompatibility: "Approved",
    noiseExposureZone: "Outside 65 dB contour",

    // DWG-008 BIM Facility Concept
    assemblyBays: 4,
    hangarHeightM: 32,
    warehouseSqFt: 650000,
    roboticsZones: true,
    smartFactoryIntegration: true,
    digitalTwinCompatibility: "Full BIM integration",

    // DWG-010 Security
    fenceLengthMiles: 10,
    surveillanceTowers: 12,
    accessControlGates: 6,
    vehicleScreeningBays: 4,
    secureDefenseZone: false,
    cybersecurityIntegration: "IT-integrated monitoring",

    // Strategic / Financial
    estimatedCapexM: 285,
    landAcquisitionCostM: 28,
    permittingMonths: 14,
    constructionMonths: 30,
    overallSiteScore: 79,
    investmentConfidence: "Moderate",
  },

  /* ─── Renton Advanced Manufacturing Park ────────────────────
     Source: King County GIS, PSE, BNSF, FEMA, WSDOT           */
  rnt001: {
    parcelAcres: 285,
    buildableAcres: 228,
    landUseAllocation: { Manufacturing: 46, Logistics: 19, Utilities: 10, GreenBuffer: 15, Parking: 10 },
    internalRoadsKm: 38,
    securityBufferFt: 300,
    electricalCapacityMW: 480,
    electricalProvider: "Puget Sound Energy",
    waterCapacityMGD: 17,
    sewageCapacityMGD: 14,
    gasLine: "20-inch industrial line",
    fiberConnectivity: "Dual redundant fiber",
    backupPowerFeasible: true,
    interstateDistMiles: 1.8,
    interstateRef: "SR-167 / I-405",
    railAccess: "BNSF Railway (1.2 mi)",
    railSpurFeasibility: "Connection feasible",
    cargoAirportMiles: 10,
    cargoAirportRef: "SEA – Seattle-Tacoma International",
    portConnectivityMiles: 18,
    truckQueuePerDay: 318,
    employeeParkingSpaces: 9800,
    elevationRangeFt: "80 – 130",
    maxSlopePct: 3.2,
    floodplainPresent: false,
    cutFillCubicYards: 2800000,
    soilErosionRisk: "Low",
    naturalDrainageChannels: 2,
    wetlandsAcres: 6,
    protectedSpecies: "None identified",
    floodZone: "Zone X (minimal risk)",
    soilContamination: "None",
    airQualityIndex: "Good",
    esgRiskScore: "Low",
    boreholeCount: 158,
    soilBearingCapacityPsf: 4500,
    groundwaterDepthFt: 18,
    liquefactionRisk: "Low",
    rockExcavationNeed: "Low",
    foundationRecommendation: "Spread footing",
    retentionPondGallons: 13000000,
    drainagePipeNetworkKm: 62,
    peakStormHandling: "100-year storm",
    waterRecyclingCapable: true,
    permeableSurfaceRatioPct: 20,
    epaComplianceStatus: "Compliant",
    distanceToAirportMiles: 10,
    faaHeightRestrictionFt: 280,
    radarInterferenceRisk: "Low",
    obstructionPenetrations: "None",
    flightPathCompatibility: "Approved",
    noiseExposureZone: "Outside 65 dB contour",
    assemblyBays: 6,
    hangarHeightM: 36,
    warehouseSqFt: 920000,
    roboticsZones: true,
    smartFactoryIntegration: true,
    digitalTwinCompatibility: "Full BIM integration",
    fenceLengthMiles: 14,
    surveillanceTowers: 18,
    accessControlGates: 9,
    vehicleScreeningBays: 6,
    secureDefenseZone: false,
    cybersecurityIntegration: "OT + IT integrated SOC",
    estimatedCapexM: 310,
    landAcquisitionCostM: 48,
    permittingMonths: 18,
    constructionMonths: 38,
    overallSiteScore: 90,
    investmentConfidence: "High",
  },

  /* ─── Bellingham Aerospace Hub ──────────────────────────────
     Source: Whatcom County GIS, PSE, BNSF, FAA (BLI), FEMA   */
  blm002: {
    parcelAcres: 380,
    buildableAcres: 304,
    landUseAllocation: { Manufacturing: 44, Logistics: 20, Utilities: 11, GreenBuffer: 16, Parking: 9 },
    internalRoadsKm: 45,
    securityBufferFt: 400,
    electricalCapacityMW: 420,
    electricalProvider: "Puget Sound Energy",
    waterCapacityMGD: 16,
    sewageCapacityMGD: 13,
    gasLine: "16-inch industrial line",
    fiberConnectivity: "Single fiber with redundancy planned",
    backupPowerFeasible: true,
    interstateDistMiles: 3.2,
    interstateRef: "I-5",
    railAccess: "BNSF Railway (0.5 mi)",
    railSpurFeasibility: "Connection feasible",
    cargoAirportMiles: 5,
    cargoAirportRef: "BLI – Bellingham International",
    portConnectivityMiles: 8,
    truckQueuePerDay: 265,
    employeeParkingSpaces: 11000,
    elevationRangeFt: "40 – 90",
    maxSlopePct: 2.8,
    floodplainPresent: false,
    cutFillCubicYards: 3400000,
    soilErosionRisk: "Low",
    naturalDrainageChannels: 3,
    wetlandsAcres: 14,
    protectedSpecies: "Wetland buffer vegetation",
    floodZone: "Zone X (minimal risk)",
    soilContamination: "None",
    airQualityIndex: "Good",
    esgRiskScore: "Low",
    boreholeCount: 172,
    soilBearingCapacityPsf: 3800,
    groundwaterDepthFt: 12,
    liquefactionRisk: "Low",
    rockExcavationNeed: "Moderate",
    foundationRecommendation: "Spread footing with grade beams",
    retentionPondGallons: 16000000,
    drainagePipeNetworkKm: 74,
    peakStormHandling: "100-year storm",
    waterRecyclingCapable: true,
    permeableSurfaceRatioPct: 22,
    epaComplianceStatus: "Compliant",
    distanceToAirportMiles: 5,
    faaHeightRestrictionFt: 250,
    radarInterferenceRisk: "Low",
    obstructionPenetrations: "None",
    flightPathCompatibility: "Approved",
    noiseExposureZone: "Outside 65 dB contour",
    assemblyBays: 7,
    hangarHeightM: 40,
    warehouseSqFt: 1100000,
    roboticsZones: true,
    smartFactoryIntegration: true,
    digitalTwinCompatibility: "Full BIM integration",
    fenceLengthMiles: 16,
    surveillanceTowers: 20,
    accessControlGates: 10,
    vehicleScreeningBays: 7,
    secureDefenseZone: false,
    cybersecurityIntegration: "OT + IT integrated SOC",
    estimatedCapexM: 280,
    landAcquisitionCostM: 42,
    permittingMonths: 20,
    constructionMonths: 40,
    overallSiteScore: 86,
    investmentConfidence: "High",
  },
};

/** Retrieve acquisition data for a site by its id. Falls back to tacoma sample data. */
export function getAcquisitionData(siteId) {
  return ACQUISITION[siteId] || ACQUISITION.tacoma;
}

/** Register or update acquisition data for a site (e.g. from Excel upload). */
export function updateAcquisitionData(siteId, data) {
  if (!siteId || !data) return;
  ACQUISITION[siteId] = { ...ACQUISITION.tacoma, ...data };
}
