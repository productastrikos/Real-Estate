# MIP Platform — Complete Page Analysis & Data Ingestion Guide

**Manufacturing Intelligence Platform (MIP)**  
React + Vite · 4 active pages · Washington State · 4 sites: Tacoma, Everett, Spokane, Yakima

---

## Table of Contents

1. [Platform Architecture](#1-platform-architecture)
2. [Page 1 — Enterprise Infrastructure](#2-page-1--enterprise-infrastructure-globalintelligence)
3. [Page 2 — Site Environmental](#3-page-2--site-environmental-siteenvironmental)
4. [Page 3 — Blueprint Intelligence](#4-page-3--blueprint-intelligence-aiadvisor)
5. [Page 4 — Strategic Intelligence](#5-page-4--strategic-intelligence-executivedashboard)
6. [Current Data Architecture](#6-current-data-architecture)
7. [Real Data Ingestion Strategy](#7-real-data-ingestion-strategy)
8. [API Sources Per Data Field](#8-api-sources-per-data-field)
9. [Recommended Implementation Roadmap](#9-recommended-implementation-roadmap)

---

## 1. Platform Architecture

```
App.jsx
├── SiteProvider (context/SiteContext.jsx)
│     └── State: activePage, selectedSiteId, setActivePage, setSelectedSiteId
├── Layout
│     ├── Sidebar (4 nav items → activePage)
│     └── <PageComponent /> (switches by activePage)
│
├── PAGE_MAP
│     ├── global       → GlobalIntelligence   (Page 1)
│     ├── environmental → SiteEnvironmental   (Page 2)
│     ├── twin         → AIAdvisor            (Page 3)
│     └── executive    → ExecutiveDashboard   (Page 4)
│
└── Data Layer (ALL STATIC — no API calls)
      ├── src/data/sites.js    → SITES[], KPI_DATA[], RADAR_DATA, COST_DATA, GROWTH_DATA
      └── src/data/envData.js  → ENV_SITE_DATA, SUSTAINABILITY_FORECAST, ENV_AI_INSIGHTS,
                                  ADVISOR_DATA, CAPACITY_CHARTS, SMART_ALERTS,
                                  EXEC_KPIS_BY_SITE, FINANCIAL_DATA_BY_SITE,
                                  EXEC_AI_REC_BY_SITE, RISK_DATA_BY_SITE
```

**Theme system:** `document.body[data-theme]` toggles `dark` / `light`. Components observe via `MutationObserver`.

**Sites:** All 4 pages share the same 4 site IDs: `tacoma`, `everett`, `spokane`, `yakima`.

---

## 2. Page 1 — Enterprise Infrastructure (`GlobalIntelligence`)

### Purpose
Enterprise-level overview of all 4 Washington State manufacturing sites. Entry point for investors and site selection decision-makers.

### Route / Nav
Sidebar item: **"Enterprise Infrastructure"** → `activePage = "global"`

### Layout (top to bottom)
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header: "Global Infrastructure Intelligence"          │
│  Subtitle: Washington State · 4 sites monitored            │
├─────────────────────────────────────────────────────────────┤
│  KPISection — 8 KPI cards in a grid                        │
├──────────────┬──────────────────────────┬───────────────────┤
│ FilterPanel  │      GISMap (Leaflet)    │ AIInsightsPanel   │
│ (left)       │      (center, main)      │ (right)           │
├──────────────┴──────────────────────────┴───────────────────┤
│  BottomAnalytics — 4 ECharts charts                        │
└─────────────────────────────────────────────────────────────┘
```

### Components & What They Show

#### KPISection (`KPISection.jsx`)
- Source: `KPI_DATA` array from `sites.js`
- Shows 8 enterprise KPIs with sparkline, trend %, RAG status, drilldown modal:

| KPI | Current Value | Description |
|-----|--------------|-------------|
| Portfolio AI Score | 88/100 | Weighted average AI feasibility across all sites |
| Power Availability | 96.4% | Grid availability across portfolio |
| ESG Portfolio Score | 84/100 | Enterprise sustainability score |
| Total Investment | $428M | Sum of committed capital across all sites |
| Avg Site ROI | 14.2% | Weighted average return on investment |
| Water Sustainability | 81% | Aggregate water supply reliability |
| Rail Connectivity | 88% | Average rail access score |
| Risk Index | Low | Portfolio-level operational risk |

Each card opens a `DrilldownModal` with: threshold gauge, 12-month sparkline, AI recommendation text, context cards.

#### FilterPanel (`FilterPanel.jsx`)
- Left sidebar with checkbox filters (does not filter data yet — wired to `filters` state but GISMap doesn't consume all filters)
- Filter groups: Regions (4), Site Types (5), Infrastructure (5), ESG (3), AI Score slider (min 70)

#### GISMap (`GISMap.jsx`)
- Library: **React-Leaflet + Leaflet.js**
- Real coordinates for all 4 sites (actual lat/lon)
- Custom SVG markers: square outline + solid dot, colored by RAG status
- Overlay polylines: `POWER_LINES` (3 routes), `RAIL_LINES` (2 routes), `HIGHWAY` (1 route) — approximate, not real infrastructure data
- Popup on marker click: site name, AI score, power %, ESG, risk level, nav buttons
- Layer toggle buttons: Sites, Power Lines, Rail, Highway

#### AIInsightsPanel (`AIInsightsPanel.jsx`)
- 4 static AI insight cards (one per insight type):
  - **Recommendation:** Tacoma → EV Manufacturing (92% confidence)
  - **Risk:** Everett Power Demand Alert
  - **Sustainability:** Yakima Solar Opportunity
  - **Expansion:** Spokane Growth Corridor
- "Full Report" button opens a modal with 5 sections: Executive Summary, Site Rankings, Risk Register, ESG Highlights, Investment Recommendations
- Insights are fully static strings — not computed from data

#### BottomAnalytics (`BottomAnalytics.jsx`)
- Library: **ECharts (echarts-for-react)**
- 4 charts rendered in a grid:
  - **Radar Chart:** 5-dimension comparison across all 4 sites (Logistics, Utilities, Scalability, Sustainability, Land Availability)
  - **Stacked Bar:** Infrastructure cost breakdown by site (Power, Production, Logistics, Utilities, Sustainability in $M)
  - **Line Chart:** Site growth trajectory 2024–2030 (AI score progression)
  - **Heatmap:** Infrastructure capacity matrix (sites × categories)

### Data Objects Used
```js
// sites.js
SITES[]          // 4 site objects with all attributes
KPI_DATA[]       // 8 KPI card definitions
RADAR_DATA       // { dimensions[], sites[{name, values[]}] }
COST_DATA        // stacked bar data by site
GROWTH_DATA      // line chart year × site values
HEATMAP_DATA     // matrix data for heatmap
```

### What Is Missing / Hardcoded
- Filter panel has no effect on GISMap site display
- Power/rail lines on map are approximate — not real infrastructure routes
- AI insights are static strings (not computed)
- All KPI trends are synthetic arrays (e.g. `[n-3, n-2.5, ... n]`)
- DrilldownModal spark data is derived from current value only

---

## 3. Page 2 — Site Environmental (`SiteEnvironmental`)

### Purpose
Per-site environmental feasibility analysis: solar, wind, flood, carbon, water. Includes a cinematic simulation viewer and 7-year sustainability forecast.

### Route / Nav
Sidebar item: **"Site Environmental"** → `activePage = "environmental"`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header + Site Selector (4 pills: Tacoma/Everett/...)  │
├─────────────────────────────────────────────────────────────┤
│  EnvKPIs — 4 KPI cards                                     │
├─────────────────────────────────────────────────────────────┤
│  SimulationViewer2 — Full-width cinematic twin              │
│  (4 mode tabs: Solar Intelligence / Wind / Shadow / Heatmap)│
├─────────────────────────────────────────────────────────────┤
│  SustainabilityForecast — 4 ECharts forecast charts        │
└─────────────────────────────────────────────────────────────┘
```

### Components & What They Show

#### EnvKPIs (`EnvKPIs.jsx`)
4 KPI cards with sparklines and drilldown modals:

| KPI | Tacoma | Everett | Spokane | Yakima | Source Field |
|-----|--------|---------|---------|--------|-------------|
| Solar Efficiency | 72% | 45% | 88% | 94% | `solarEfficiency` |
| Flood Risk | Low | Medium | Low | Low | `floodRisk` |
| Carbon Score | 91/100 | 74/100 | 83/100 | 78/100 | `carbonScore` |
| Water Reuse | 34% | 21% | 42% | 18% | `waterReuse` |

Sub-values shown: `annualIrradiance` (kWh/m²/yr), `carbonTrend`, `waterReuseTrend`, `solarEffTrend`

#### SimulationViewer2 (`SimulationViewer2.jsx`)
- Custom SVG + CSS animation — no external map library
- Day/Night toggle synced with global theme
- 4 simulation modes (tab switcher):

**Mode 1 — Solar Intelligence**
- Animated sun arc across SVG sky
- Site zone blocks colored by solar suitability (Very High / High / Medium / Low / Very Low)
- Shadow polygon cast from buildings based on sun position
- Real-time sun angle calculation based on time of day
- Solar efficiency % displayed per zone
- Stats: irradiance value, peak hours, green coverage %

**Mode 2 — Wind & Airflow**
- Animated wind flow lines (SVG paths with stroke-dashoffset animation)
- Direction arrow indicator
- Wind speed overlay per zone
- Stats: avg wind speed, direction, rainfall

**Mode 3 — Shadow Analysis**
- Building shadow simulation at 3 time slots: Morning / Noon / Evening
- Shadow overlap % shown per zone
- Time-of-day selector
- Stats: shadow % at each time

**Mode 4 — Environmental Heatmap**
- Zone blocks colored by temperature (°C) on a green→yellow→red gradient
- Temperature label per zone
- Heat index legend
- Stats: zone temperatures, exposure level

Right panel: AI Environmental Insights (4 cards per site from `ENV_AI_INSIGHTS`)  
Types: recommendation / sustainability / risk / expansion — each with confidence %

#### SustainabilityForecast (`SustainabilityForecast.jsx`)
4 ECharts line/bar charts (2024–2030, * = projected):

| Chart | Metrics |
|-------|---------|
| Power Demand vs Capacity | `powerDemand[]` vs `powerCapacity[]` (MW) with baseline |
| Water Demand vs Target | `waterDemand[]` vs `waterTarget[]` (M L/day) |
| Renewable Energy Mix | `renewableShare[]` vs `gridShare[]` (%) stacked area |
| Carbon Trajectory | `carbonActual[]` + `carbonForecast[]` vs `carbonTarget[]` |

### Data Objects Used
```js
// envData.js
ENV_SITE_DATA[siteId]        // solar, flood, carbon, water, irradiance, wind, zones
SUSTAINABILITY_FORECAST[siteId] // 7-year projections for power/water/renewables/carbon
ENV_AI_INSIGHTS[siteId]      // 4 AI insight cards per site
```

### What Is Missing / Hardcoded
- Sun animation is time-of-day based on `new Date()` locally — not a real solar path model
- Zone temperatures in heatmap are static (not real-time IoT)
- Wind flow animation direction/speed is visual only — not weather API data
- AI insights are static strings — not LLM generated
- Forecast curves are manually authored arrays — not modeled projections

---

## 4. Page 3 — Blueprint Intelligence (`AIAdvisor`)

### Purpose
Pre-construction infrastructure planning view. Shows site capacity, infrastructure dependency topology, capacity analytics, and smart operational alerts.

### Route / Nav
Sidebar item: **"Blueprint Intelligence"** → `activePage = "twin"`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header + Site Selector                                │
├─────────────────────────────────────────────────────────────┤
│  CapacityKPIs — 5 KPI cards                                │
├─────────────────────────────────────────────────────────────┤
│  InfrastructureTwin — Full-width main visual               │
│  (dependency topology / blueprint twin canvas)              │
├─────────────────────────────────────────────────────────────┤
│  CapacityCharts — 4 ECharts charts                         │
├─────────────────────────────────────────────────────────────┤
│  SmartAlerts — alert card grid                             │
└─────────────────────────────────────────────────────────────┘
```

### Components & What They Show

#### CapacityKPIs (`CapacityKPIs.jsx`)
5 KPI cards derived from `ADVISOR_DATA`:

| KPI | Tacoma | Everett | Spokane | Yakima |
|-----|--------|---------|---------|--------|
| Power Capacity | 82 MW | 58 MW | 71 MW | 64 MW |
| Water Capacity | 12M L/day | 9.4M L/day | 10.2M L/day | 7.2M L/day |
| Logistics Readiness | Excellent | Good | Excellent | Good |
| Renewable Integration | 34% | 15% | 44% | 61% |
| Infra Readiness | 87% | 72% | 83% | 74% |

Each card has drilldown modal with: AI recommendation, 7-year sparkline from `CAPACITY_CHARTS`, threshold gauge, context cards.

#### InfrastructureTwin (`InfrastructureTwin.jsx`)
- Pure SVG — no canvas library, no external dependency
- Per-site dependency tree topology showing infrastructure nodes and their relationships
- 4 horizontal zone bands: Energy Infrastructure / Production / Utility Systems / Logistics

**Nodes (per site — example Tacoma):**

| Zone | Node | Readiness | Phase | CAPEX | Constraint |
|------|------|-----------|-------|-------|-----------|
| Energy | Grid Tie-In (PSE 230kV) | 92% | Phase 1 | $2.4M | None |
| Energy | Main Substation (34.5kV) | 78% | Phase 1 | $4.1M | PUD permit pending |
| Energy | Transformer Bank | 85% | Phase 1 | $1.8M | None |
| Energy | MV Switchgear | 88% | Phase 1 | $0.9M | None |
| Production | Assembly Block A (180k sqft) | 91% | Phase 1 | $22M | None |
| Production | Assembly Block B (120k sqft) | 84% | Phase 2 | $18M | Drainage study |
| Production | Integration Hall (80k sqft) | 79% | Phase 2 | $14M | Flood zone buffer |
| Utilities | Stormwater Mgmt | 64% | Phase 1 | $3.2M | Pierce County permit |
| Utilities | Water Treatment | 88% | Phase 1 | $2.1M | None |
| Utilities | Compressed Air | 93% | Phase 2 | $0.8M | None |
| Logistics | Port Rail Spur (BNSF) | 87% | Phase 1 | $5.6M | BNSF coordination |
| Logistics | Truck Dock Complex | 91% | Phase 2 | $3.4M | None |
| Logistics | Solar Canopy Array (2.8 MW) | 72% | Phase 3 | — | Incentive pending |
| Logistics | Backup Power (2.4 MW) | 96% | Phase 1 | $1.2M | None |

**Edges (connections):** Typed as `power`, `phase`, `utility`, `logistics`, `water` — each with a distinct color and dash pattern.

**Interactivity:**
- Node hover → tooltip with readiness %, phase, CAPEX, dependency, constraint
- Node click → select/deselect
- Layer filter buttons (All / Power / Utility / Logistics / Water / Phase)
- Animated particles flowing along edges (RAF loop)
- Day/Night mode synced with global theme toggle

**Right panel — AI Blueprint Advisor:**
- Overall design confidence score (computed average)
- 7 metrics: Blueprint Readiness, Engineering Validation, Utility Optimization, Sustainability, Construction Complexity, Env. Compatibility, CAPEX Efficiency
- 4 per-site AI insight strings

**Bottom — Construction Timeline:**
- 6 phases with month ranges and progress bars
- Clicking a phase highlights associated buildings on canvas with pulse ring

**Left panel — Layer filters:** All Layers, Power Routing, Utility Corridors, Logistics Routes, Water & Drainage, Construction Phases

#### CapacityCharts (`CapacityCharts.jsx`)
4 ECharts charts using `CAPACITY_CHARTS[siteId]`:

| Chart | Metrics | Years |
|-------|---------|-------|
| Power: Capacity vs Demand | `powerCapacity[]` vs `powerDemand[]` (MW) | 2024–2030 |
| Water: Capacity vs Demand | `waterCapacity[]` vs `waterDemand[]` (M L/day) | 2024–2030 |
| Logistics Score | `logistics[]` (%) | 2024–2030 |
| Renewable Integration | `renewable[]` (%) | 2024–2030 |

Also includes a cross-site radar chart (Investment Allocation) and resource distribution bar chart.

#### SmartAlerts (`SmartAlerts.jsx`)
Alert card grid with 5 alerts per site. Severity levels: `danger` / `warning` / `info`.

**Tacoma alerts:** Grid upgrade scheduled, Freight congestion risk, Solar integration ready, Water permit renewal, Workforce expansion  
**Everett alerts:** Transformer overload (DANGER), Power fluctuation, Utility bottleneck, Flood zone re-assessment, Port expansion Phase 2  
**Spokane alerts:** Solar farm permitting, Rail capacity upgrade, Wildfire smoke season, Winter solar buffer, Workforce development grant  
**Yakima alerts:** Water stress critical (DANGER), Solar canopy approval, Irrigation conflict risk, I-82 congestion, Heat mitigation study

### Data Objects Used
```js
// envData.js
ADVISOR_DATA[siteId]       // power/water/logistics/renewable/readiness/feasibility
CAPACITY_CHARTS[siteId]    // 7-year time series for 7 metrics
SMART_ALERTS[siteId]       // 5 alert cards per site
```

---

## 5. Page 4 — Strategic Intelligence (`ExecutiveDashboard`)

### Purpose
C-suite / board-level view: ROI, financial analytics, AI strategic recommendations, risk intelligence, board report generation.

### Route / Nav
Sidebar item: **"Strategic Intelligence"** → `activePage = "executive"`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header + Site Selector + "Generate Board Report" btn  │
├─────────────────────────────────────────────────────────────┤
│  ExecKPIs — 5 executive KPI cards                          │
├─────────────────────┬───────────────────────────────────────┤
│  FinancialCharts    │  AIExecRec (AI Recommendation panel)  │
│  (left, 4 charts)  │  (right)                              │
├─────────────────────┴───────────────────────────────────────┤
│  RiskIntelligence — risk matrix + drilldowns                │
├─────────────────────────────────────────────────────────────┤
│  [BoardReportModal — modal overlay on button click]         │
└─────────────────────────────────────────────────────────────┘
```

### Components & What They Show

#### ExecKPIs (`ExecKPIs.jsx`)
5 executive KPI cards with drilldown:

| KPI | Tacoma | Everett | Spokane | Yakima |
|-----|--------|---------|---------|--------|
| Site ROI | 16.2% | 12.1% | 14.4% | 11.8% |
| Total Investment | $163M | $98M | $124M | $88M |
| ESG Score | 91/100 | 74/100 | 83/100 | 78/100 |
| Expansion Readiness | Ready | Conditional | Ready | Conditional |
| Risk Level | Low | High | Low | Medium |

#### FinancialCharts (`FinancialCharts.jsx`)
4 ECharts charts:

| Chart | Content |
|-------|---------|
| Phase Cost Waterfall | 5 construction phases with $M cost per phase (site-specific) |
| Investment Allocation | Stacked bar: Power Infra / Production / Logistics / Utilities / Sustainability ($M) |
| Multi-site Radar | 5-axis radar comparing all 4 sites: Logistics/Utilities/Scalability/Sustainability/Land |
| IRR / NPV Line Chart | 3 financial curves: IRR trajectory, NPV growth, cumulative CAPEX |

**Per-site phase costs (example Tacoma):**
- Land Preparation: $18M
- Utility Routing: $32M
- Foundation: $45M
- Infrastructure Build: $58M
- Commissioning: $22M

#### AIExecRec (`AIExecRec.jsx`)
3-section recommendation panel:
1. **Primary recommendation:** Site name, confidence %, headline chip, 4–5 bullet reasons
2. **Secondary recommendation:** Site name, secondary confidence %, note
3. **Watch list:** Sites flagged for monitoring with reason

**Example (Tacoma selected):**
- Primary: Tacoma → EV Manufacturing Hub — 94% confidence
- Secondary: Spokane — 87% confidence — regional distribution hub potential
- Watch: Everett — transformer overload risk

#### RiskIntelligence (`RiskIntelligence.jsx`)
Risk matrix with per-risk drilldown modals:

| Risk | Tacoma Score | Everett Score |
|------|-------------|---------------|
| Flood Risk | 8% | 32% |
| Freight Disruption | 22% | 18% |
| Regulatory Risk | 15% | 20% |
| Grid Dependency | 12% | 94% (CRITICAL) |

Each risk opens a drilldown with:
- AI analysis text paragraph
- 3–4 action items (label, due date, status: scheduled/in-progress/active/pending/completed/urgent)
- 12-month trend sparkline
- Risk score history chart

#### BoardReportModal (`BoardReportModal.jsx`)
Full-screen modal simulating a PDF board report:
- Sections: Executive Summary, Site Decision Matrix, Financial Overview, Risk Register, ESG Report, Recommended Actions
- All data pulled from props (site, financials, aiRec, risks, execKpis)
- "Download PDF" button (currently placeholder — no actual PDF generation)

### Data Objects Used
```js
// envData.js
EXEC_KPIS_BY_SITE[siteId]      // ROI, investment, ESG, readiness, risk
FINANCIAL_DATA_BY_SITE[siteId] // phase costs, radar, IRR/NPV arrays
EXEC_AI_REC_BY_SITE[siteId]    // primary site, confidence, reasons, watch list
RISK_DATA_BY_SITE[siteId]      // risk items with scores and actions
```

---

## 6. Current Data Architecture

### Files
```
src/data/
  sites.js     ~280 lines   Static SITES[], KPI_DATA[], chart data
  envData.js   ~700 lines   All per-site data for pages 2, 3, 4
```

### Data Flow
```
Static JS files → imported directly into page components → rendered
        ↑
   No API calls, no database, no fetching, no loading states
```

### What Needs to Change for Real Data
Every component does this today:
```js
import { ENV_SITE_DATA } from "../../data/envData.js";
// then uses: ENV_SITE_DATA[selectedSiteId]
```

This needs to become:
```js
const { data, isLoading } = useSiteEnv(selectedSiteId); // React Query hook
```

---

## 7. Real Data Ingestion Strategy

### Option A — Direct Public API Calls (No Backend, POC Ready)

For fields where free public APIs exist and support CORS:

```
NREL NSRDB API     → solarEfficiency, annualIrradiance, peakSolarHours
NOAA CDO API       → windSpeedAvg, windDirection, annualRainfall
FEMA NFHL API      → floodRisk, floodRiskLevel
EIA OpenData API   → powerCapacity, grid availability scores
```

**Steps:**
1. Create `src/api/publicApis.js` with fetch functions
2. Create `src/hooks/useSiteEnv.js` using `useEffect + useState`
3. Replace `ENV_SITE_DATA[siteId]` with hook results
4. Add loading skeleton while fetching

**Pros:** No backend needed, works immediately  
**Cons:** Rate limits, CORS restrictions on some, need API keys

---

### Option B — Backend REST API (Full Platform)

Build a backend service that centralises all data:

```
Backend (FastAPI / Node.js Express)
├── GET /api/sites                     → SITES[] with live scores
├── GET /api/sites/:id/environmental   → solar, wind, flood, carbon, water
├── GET /api/sites/:id/blueprint       → readiness, CAPEX, permits, phases
├── GET /api/sites/:id/capacity        → power, water, logistics, renewable
├── GET /api/sites/:id/alerts          → active smart alerts
├── GET /api/sites/:id/executive       → ROI, financials, risk, AI rec
└── GET /api/sites/:id/forecast        → 7-year projections
```

Backend internally aggregates from:
- Public APIs (NREL, NOAA, FEMA, EIA)
- Your internal database (PostgreSQL) for proprietary fields
- A cron job that refreshes external API data every 24 hours
- An LLM call (Claude API) that generates insight text from metrics

---

### Option C — React Query + API Layer (Best Frontend Architecture)

Add two layers inside the existing React app without changing component structure:

```
src/
  api/
    sites.js          // fetch functions: getSites(), getSiteById()
    environmental.js  // getSiteEnv(id), getSustainabilityForecast(id)
    blueprint.js      // getAdvisorData(id), getCapacityCharts(id), getAlerts(id)
    executive.js      // getExecKPIs(id), getFinancials(id), getRisks(id)
  hooks/
    useSites.js       // useQuery("sites", getSites)
    useSiteEnv.js     // useQuery(["env", siteId], () => getSiteEnv(siteId))
    useAdvisorData.js // useQuery(["advisor", siteId], ...)
    useExecData.js    // useQuery(["exec", siteId], ...)
```

Each page component replaces `import { ENV_SITE_DATA }` with `useSiteEnv(selectedSiteId)`.  
React Query handles: caching, background refetch, loading/error states, stale-while-revalidate.

---

### Option D — Scheduled Pipeline + JSON Files (Simplest Real Data)

Build a script (Python or Node.js) that:
1. Calls real APIs (NREL, NOAA, FEMA, EIA) for each of the 4 sites
2. Transforms responses into the exact shape the frontend already expects
3. Writes output to `src/data/sites.json` and `src/data/envData.json`
4. Runs on a schedule (GitHub Actions cron, or local cron job)

Frontend reads JSON files instead of JS files — same import, real data, zero refactor.

**Best for:** Quick win on real data with minimal frontend changes.

---

## 8. API Sources Per Data Field

### Page 1 — Global Intelligence

| Field | Real Source | URL / Notes |
|-------|-------------|-------------|
| Site coordinates | Internal GIS / Google Places API | Already correct in sites.js |
| Power score (98%) | EIA API — grid reliability by region | api.eia.gov — free, needs key |
| AI Score | Computed from all sub-scores | Internal calculation |
| ROI | Finance system (SAP / custom model) | Internal only |
| ESG Score | ESG platform (Watershed, Persefoni) | Internal only |
| Rail score | FRA National Rail Plan data | railroads.dot.gov |
| GIS map overlays | ESRI / OpenStreetMap | Leaflet already handles tiles |

### Page 2 — Site Environmental

| Field | Real Source | URL / Notes |
|-------|-------------|-------------|
| `solarEfficiency`, `annualIrradiance` | NREL NSRDB API | developer.nrel.gov/api/solar — free key |
| `windSpeedAvg`, `windDirection` | NOAA Climate Data Online | api.noaa.gov/cdo-web — free key |
| `annualRainfall` | NOAA CDO or Open-Meteo | open-meteo.com — no key needed |
| `floodRisk`, `floodRiskLevel` | FEMA NFHL API | msc.fema.gov/arcgis/rest/services — free |
| `carbonScore` | Internal operational tracking | Internal only |
| `waterReuse` | Site metering / SCADA system | Internal only |
| `envZones[].tempC` | IoT sensors / Copernicus LST | Internal or Copernicus API |
| Forecast curves | NREL + NOAA projections + model | Combination of real + modeled |

### Page 3 — Blueprint Intelligence

| Field | Real Source | URL / Notes |
|-------|-------------|-------------|
| `powerCapacity` | Utility provider (PSE, Avista) | API or manual entry |
| `waterCapacity` | City water authority data | Manual or utility API |
| `logisticsReadiness` | USDOT freight data + internal | Internal scoring |
| `renewableIntegration` | Internal energy metering | SCADA / BMS system |
| `infraReadiness` | Project management system | Procore, Aconex API |
| Node `readiness %` | Engineering review status | Internal PM system |
| Node `constraint` text | Permit tracking system | Internal only |
| Node `capex` | Cost engineering system | Internal only |
| Smart alerts | Permit tracker + utility APIs | Internal + real feeds |

### Page 4 — Strategic Intelligence

| Field | Real Source | URL / Notes |
|-------|-------------|-------------|
| `roi` | Finance system | Internal (SAP, Oracle, custom) |
| `investment` | Finance / treasury system | Internal only |
| `esg` | ESG platform | Watershed, Workiva, Persefoni |
| Phase cost breakdown | Cost management system | Procore, Oracle P6 |
| IRR / NPV curves | Financial model | Excel model → API export |
| Risk scores | Internal risk register | Internal only |
| AI recommendations | Claude API (LLM) | Generate from metric inputs |
| Board report PDF | PDF library | `react-pdf` or Puppeteer |

---

## 9. Recommended Implementation Roadmap

### Phase 1 — Wire Public APIs for Page 2 (1–2 days)

Proves real data flows into the platform. No backend needed.

```
1. Get free API keys: NREL, NOAA, Open-Meteo
2. Create src/api/environmental.js
3. Create src/hooks/useSiteEnv.js
4. Replace ENV_SITE_DATA import in SiteEnvironmental/index.jsx
5. Add loading skeleton to EnvKPIs and SimulationViewer2
6. Test all 4 sites
```

Fields that go live: `solarEfficiency`, `annualIrradiance`, `windSpeedAvg`, `windDirection`, `annualRainfall`, `floodRisk`

Fields that stay static (internal data): `carbonScore`, `waterReuse`, `envZones`

---

### Phase 2 — Build FastAPI Backend (3–5 days)

```
backend/
  main.py               # FastAPI app
  routes/
    sites.py            # GET /api/sites
    environmental.py    # GET /api/sites/:id/environmental
    blueprint.py        # GET /api/sites/:id/blueprint
    executive.py        # GET /api/sites/:id/executive
  services/
    nrel.py             # NREL API wrapper
    noaa.py             # NOAA API wrapper
    fema.py             # FEMA API wrapper
    eia.py              # EIA API wrapper
  db/
    models.py           # SQLAlchemy models for proprietary fields
    seed.py             # Initial data seeding
  cache/
    redis_client.py     # 24h cache for external API responses
```

---

### Phase 3 — React Query Integration (2 days)

```
1. npm install @tanstack/react-query
2. Wrap App.jsx in <QueryClientProvider>
3. Create src/api/ fetch functions pointing to FastAPI
4. Create src/hooks/ React Query hooks per page
5. Replace all static imports in 4 pages with hook calls
6. Add Suspense boundaries + error boundaries
7. Add loading skeletons (already have StatusChip component)
```

---

### Phase 4 — AI-Generated Insights via Claude API (1 day)

Replace hardcoded insight strings with live LLM output:

```
Backend endpoint: POST /api/sites/:id/ai-insights
Input: { solarEfficiency, floodRisk, carbonScore, roi, riskScore, ... }
Output: { insights: [...], recommendations: [...], executiveSummary: "..." }

Uses: claude-sonnet-4-6 with a structured prompt
Cache: 24 hours (insights don't need real-time refresh)
```

---

### Phase 5 — Board Report PDF (1 day)

```
1. npm install @react-pdf/renderer
2. Create src/components/BoardReportPDF.jsx
3. Wire to existing BoardReportModal "Download PDF" button
4. Uses same data props already passed to the modal
```

---

### Summary Table

| Phase | Effort | Pages Affected | Complexity |
|-------|--------|----------------|-----------|
| 1. Public APIs (NREL/NOAA/FEMA) | 1–2 days | Page 2 | Low |
| 2. FastAPI backend | 3–5 days | All | Medium |
| 3. React Query hooks | 2 days | All | Medium |
| 4. Claude AI insights | 1 day | All panels | Low |
| 5. Real PDF export | 1 day | Page 4 modal | Low |

Total estimate: **8–11 days** for full real data ingestion across all 4 pages.

---

*Generated from codebase analysis of `d:\POC\build\src\` — MIP Platform v0.1.0*
