/* =========================================================
   OperationalMap — Site-Specific Operational Intelligence
   Each site has UNIQUE zones, flow paths, AI insights, modes
   PAGE 3 CENTER VISUAL
   ========================================================= */
import { useState, useEffect, useRef } from "react";

const T = {
  bg: "#060a10",
  panel: "#0c1420",
  border: "rgba(91,141,224,0.16)",
  text: "#e8eef5",
  muted: "#afc3d8",
  faint: "#3d5a78",
  blue: "#5b8de0",
  teal: "#14b8a6",
  amber: "#f59e0b",
  orange: "#f97316",
  green: "#16a34a",
  lime: "#a3e635",
  danger: "#dc2626",
  violet: "#8b5cf6",
  sky: "#38bdf8",
  pink: "#ec4899",
};
function hex2rgb(h) {
  if (!h || h.length < 7) return "91,141,224";
  return `${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)}`;
}

const MODES = [
  { id: "zones", icon: "⬛", label: "Zone Overview", color: T.blue },
  { id: "flow", icon: "➜", label: "Material Flow", color: T.teal },
  { id: "energy", icon: "⚡", label: "Energy & Solar", color: T.amber },
  { id: "logistics", icon: "🚚", label: "Logistics", color: T.orange },
  { id: "stress", icon: "⚠", label: "Capacity Stress", color: T.danger },
];

/* ════════════════════════════════════════════════════════════
   SITE OPERATIONAL DEFINITIONS
   ════════════════════════════════════════════════════════════ */
const OP_DEFS = {
  /* ── TACOMA: Port Industrial / Freight Flow Manufacturing ── */
  tacoma: {
    identity: "Port Industrial Flow",
    story: "Freight-driven manufacturing — logistics orchestrates production rhythm",
    zones: [
      { id: "entry", label: "Port Entry", sub: "Gate + weighbridge", x: 2, y: 40, w: 10, h: 18, type: "gate", cap: 80 },
      { id: "rcv", label: "Receiving", sub: "Inbound inspection", x: 14, y: 36, w: 18, h: 26, type: "inbound", cap: 72 },
      { id: "stage", label: "Staging", sub: "Parts prep · 3 shifts", x: 14, y: 10, w: 20, h: 24, type: "staging", cap: 68 },
      { id: "asm1", label: "Assembly Line 1", sub: "EV chassis · 240/day", x: 36, y: 8, w: 24, h: 30, type: "mfg", cap: 91 },
      { id: "asm2", label: "Assembly Line 2", sub: "EV powertrain", x: 36, y: 42, w: 24, h: 26, type: "mfg", cap: 88 },
      { id: "qc", label: "Quality Control", sub: "ISO 9001 · 100% scan", x: 62, y: 20, w: 16, h: 18, type: "qc", cap: 74 },
      { id: "pack", label: "Pack & Ship", sub: "Outbound prep", x: 62, y: 42, w: 16, h: 22, type: "ship", cap: 82 },
      { id: "dispatch", label: "Dispatch Hub", sub: "Rail + road routing", x: 80, y: 20, w: 12, h: 52, type: "logistics", cap: 77 },
      { id: "yard", label: "Truck Yard", sub: "180-bay staging", x: 80, y: 74, w: 12, h: 16, type: "parking", cap: 60 },
      { id: "util", label: "Utility Block", sub: "Power + compressed air", x: 2, y: 62, w: 10, h: 28, type: "power", cap: 55 },
    ],
    flowPaths: {
      flow: [
        {
          id: "f1",
          pts: [
            [12, 49],
            [14, 49],
          ],
          color: T.teal,
          label: "Inbound",
        },
        {
          id: "f2",
          pts: [
            [32, 23],
            [36, 23],
          ],
          color: T.teal,
          label: "Stage→Asm1",
        },
        {
          id: "f3",
          pts: [
            [60, 23],
            [62, 23],
          ],
          color: T.sky,
          label: "Asm1→QC",
        },
        {
          id: "f4",
          pts: [
            [60, 55],
            [62, 55],
          ],
          color: T.sky,
          label: "Asm2→Pack",
        },
        {
          id: "f5",
          pts: [
            [78, 32],
            [80, 32],
          ],
          color: T.orange,
          label: "QC→Dispatch",
        },
        {
          id: "f6",
          pts: [
            [78, 53],
            [80, 53],
          ],
          color: T.orange,
          label: "Pack→Dispatch",
        },
      ],
      logistics: [
        {
          id: "l1",
          pts: [
            [2, 49],
            [14, 49],
            [23, 49],
            [23, 36],
          ],
          color: T.orange,
        },
        {
          id: "l2",
          pts: [
            [92, 45],
            [80, 45],
          ],
          color: T.amber,
        },
        {
          id: "l3",
          pts: [
            [7, 62],
            [7, 70],
          ],
          color: T.faint,
        },
      ],
      energy: [
        {
          id: "e1",
          pts: [
            [7, 62],
            [14, 49],
            [14, 36],
            [36, 36],
          ],
          color: T.amber,
        },
        {
          id: "e2",
          pts: [
            [7, 62],
            [36, 62],
            [60, 62],
            [80, 62],
          ],
          color: T.amber,
        },
      ],
      stress: [
        {
          id: "s1",
          pts: [
            [36, 23],
            [60, 23],
            [62, 23],
          ],
          color: T.danger,
        },
        {
          id: "s2",
          pts: [
            [36, 55],
            [60, 55],
          ],
          color: T.danger,
        },
      ],
    },
    stressMap: { asm1: 91, asm2: 88, pack: 82, dispatch: 77, qc: 74, rcv: 72, stage: 68, entry: 80, util: 55, yard: 60 },
    insights: {
      zones: [
        {
          color: T.blue,
          icon: "⬛",
          title: "Port Industrial Layout",
          body: "4-zone linear layout: Receive → Stage → Assemble → Ship · Freight-driven rhythm",
        },
        { color: T.teal, icon: "🔄", title: "Assembly Efficiency", body: "Line 1 at 91% capacity · Line 2 at 88% · Combined: 480 units/day" },
        { color: T.amber, icon: "⚠", title: "Dispatch Constraint", body: "Dispatch hub becoming bottleneck at peak hours · Expansion recommended" },
        { color: T.sky, icon: "✓", title: "Freight Timing", body: "Rail + road synchronized scheduling reduces holding time by 2.3 hrs/shift" },
      ],
      flow: [
        { color: T.teal, icon: "➜", title: "Main Flow Corridor", body: "Port Entry → Receiving → Staging → Assembly → QC → Pack → Dispatch" },
        { color: T.orange, icon: "🚛", title: "Outbound Volume", body: "420 units dispatched/day · 18 road trucks + 3 rail cars per shift" },
        { color: T.sky, icon: "◈", title: "Bottleneck Analysis", body: "QC → Pack → Dispatch transition creates 34-min avg delay at 85%+ capacity" },
        { color: T.amber, icon: "📊", title: "Flow Efficiency", body: "Overall material flow efficiency: 82% · Industry benchmark: 78%" },
      ],
      energy: [
        { color: T.amber, icon: "⚡", title: "Power Distribution", body: "Utility block feeds 4 zones · Peak draw at 14:00: 8.4 MW" },
        { color: T.lime, icon: "☀", title: "Solar Offset", body: "Rooftop solar contributes 2.8 MW · 33% offset during daylight hours" },
        {
          color: T.orange,
          icon: "🔥",
          title: "Process Heat Recovery",
          body: "Assembly lines generate 280 kW recoverable heat · Currently 41% captured",
        },
        { color: T.sky, icon: "✓", title: "Energy ROI", body: "AI energy management saves $180K/year vs unmanaged baseline" },
      ],
      logistics: [
        {
          color: T.orange,
          icon: "🚚",
          title: "Daily Freight Volume",
          body: "840 inbound + 420 outbound movements/day · Peak: 07:00–10:00, 14:00–17:00",
        },
        { color: T.amber, icon: "⏱", title: "Gate Turnaround", body: "Avg gate-to-dock time: 18 min · Target: 14 min · Improvement: RFID tracking" },
        { color: T.teal, icon: "📦", title: "Inventory Turns", body: "Raw materials: 4.2 turns/month · WIP: 1.8 turns · Finished goods: 3.1 turns" },
        { color: T.sky, icon: "📊", title: "Dock Utilization", body: "24 loading bays at 77% avg utilization · 3 bays reserved for expedited" },
      ],
      stress: [
        {
          color: T.danger,
          icon: "⚠",
          title: "Assembly Line 1 Critical",
          body: "Line 1 at 91% capacity — risk threshold 95% · Maintenance window recommended",
        },
        { color: T.orange, icon: "🔥", title: "Assembly Line 2 Load", body: "Line 2 at 88% · High but stable · Monitor for surge demand periods" },
        {
          color: T.amber,
          icon: "📈",
          title: "Capacity Forecast",
          body: "Q4 demand surge will push both lines to 98%+ · Pre-emptive staffing required",
        },
        { color: T.teal, icon: "✓", title: "QC Throughput", body: "QC at 74% capacity — adequate buffer for line speed variations" },
      ],
    },
  },

  /* ── EVERETT: Aerospace / Sustainable Green Manufacturing ── */
  everett: {
    identity: "Aerospace Green Flow",
    story: "Sustainable aerospace manufacturing — renewable energy powers precision production",
    zones: [
      { id: "parts", label: "Parts Store", sub: "Climate-controlled", x: 2, y: 8, w: 16, h: 26, type: "inbound", cap: 65 },
      { id: "subasm", label: "Sub-Assembly", sub: "Precision components", x: 20, y: 8, w: 22, h: 26, type: "staging", cap: 78 },
      { id: "hanA", label: "Hangar A", sub: "Final assembly · aircraft", x: 2, y: 38, w: 40, h: 30, type: "mfg", cap: 84 },
      { id: "hanB", label: "Hangar B", sub: "MRO + testing", x: 2, y: 72, w: 30, h: 18, type: "mfg", cap: 71 },
      { id: "solar", label: "Solar Farm 6MW", sub: "Renewable generation", x: 46, y: 8, w: 30, h: 22, type: "solar", cap: 91 },
      { id: "wind", label: "Wind Turbines", sub: "3×500kW", x: 80, y: 8, w: 12, h: 22, type: "wind", cap: 72 },
      { id: "green", label: "Green Zone", sub: "Biodiversity corridor", x: 46, y: 34, w: 18, h: 24, type: "green", cap: 100 },
      { id: "water", label: "Water Reuse", sub: "21% cycle", x: 46, y: 62, w: 20, h: 18, type: "water", cap: 68 },
      { id: "rnd", label: "R&D Lab", sub: "Materials + composites", x: 68, y: 34, w: 24, h: 24, type: "rd", cap: 82 },
      { id: "grid", label: "Renewable Grid", sub: "Smart distribution", x: 68, y: 62, w: 24, h: 28, type: "power", cap: 88 },
      { id: "airside", label: "Airside", sub: "Taxiway access", x: 35, y: 72, w: 10, h: 18, type: "gate", cap: 55 },
    ],
    flowPaths: {
      flow: [
        {
          id: "f1",
          pts: [
            [18, 21],
            [20, 21],
          ],
          color: T.teal,
        },
        {
          id: "f2",
          pts: [
            [42, 21],
            [42, 38],
          ],
          color: T.teal,
        },
        {
          id: "f3",
          pts: [
            [21, 53],
            [2, 53],
          ],
          color: T.sky,
        },
        {
          id: "f4",
          pts: [
            [37, 72],
            [37, 68],
          ],
          color: T.orange,
        },
      ],
      logistics: [
        {
          id: "l1",
          pts: [
            [2, 21],
            [2, 38],
          ],
          color: T.orange,
        },
        {
          id: "l2",
          pts: [
            [37, 90],
            [37, 72],
            [35, 72],
          ],
          color: T.amber,
        },
      ],
      energy: [
        {
          id: "e1",
          pts: [
            [61, 30],
            [68, 30],
            [68, 62],
          ],
          color: T.lime,
        },
        {
          id: "e2",
          pts: [
            [80, 30],
            [92, 30],
            [92, 50],
            [68, 50],
          ],
          color: T.lime,
        },
        {
          id: "e3",
          pts: [
            [68, 76],
            [46, 76],
            [46, 80],
            [2, 80],
            [2, 72],
          ],
          color: T.amber,
        },
      ],
      stress: [
        {
          id: "s1",
          pts: [
            [42, 21],
            [42, 38],
            [2, 38],
          ],
          color: T.danger,
        },
        {
          id: "s2",
          pts: [
            [68, 34],
            [68, 62],
          ],
          color: T.amber,
        },
      ],
    },
    stressMap: { hanA: 84, rnd: 82, grid: 88, solar: 91, subasm: 78, hanB: 71, wind: 72, water: 68, parts: 65, green: 100, airside: 55 },
    insights: {
      zones: [
        {
          color: T.lime,
          icon: "☀",
          title: "Renewable-Powered Campus",
          body: "6 MW solar + 3 turbines meet 42% of site demand · On track for 55% by 2027",
        },
        { color: T.blue, icon: "⬛", title: "Aerospace Layout", body: "Parts → Sub-assembly → Hangar A final assembly → Airside delivery" },
        {
          color: T.teal,
          icon: "🌿",
          title: "Green Zone Integration",
          body: "Biodiversity corridor reduces ambient temp by 3°C across southern campus",
        },
        { color: T.violet, icon: "🔬", title: "R&D Capability", body: "Composites lab supports next-gen aircraft materials · 12 active programs" },
      ],
      flow: [
        { color: T.teal, icon: "➜", title: "Assembly Flow", body: "Parts Store → Sub-Assembly → Hangar A → Airside delivery" },
        { color: T.orange, icon: "✈", title: "Aircraft Throughput", body: "Hangar A: 2.4 aircraft/month final assembly · MRO: 8 aircraft/month" },
        {
          color: T.sky,
          icon: "◈",
          title: "Component Lead Time",
          body: "Sub-assembly to hangar: 14-day avg · Target: 11 days · Bottleneck: composite cure",
        },
        { color: T.lime, icon: "📊", title: "Supply Chain Performance", body: "On-time delivery: 94% · Supplier quality index: 97.2%" },
      ],
      energy: [
        { color: T.lime, icon: "⚡", title: "Renewable Generation", body: "Solar 6 MW + wind 1.5 MW = 7.5 MW peak · Meets 42% of peak demand" },
        { color: T.green, icon: "♻", title: "Water Efficiency", body: "Water reuse system cycles 21% of process water · Saves 180K gallons/month" },
        { color: T.amber, icon: "📊", title: "Grid Export", body: "Surplus renewable energy exported to grid: avg 1.2 MW during peak solar" },
        { color: T.teal, icon: "✓", title: "Carbon Trajectory", body: "On track to reduce Scope 1+2 emissions by 38% vs 2022 baseline" },
      ],
      logistics: [
        {
          color: T.orange,
          icon: "🚚",
          title: "Parts Delivery Schedule",
          body: "58 supplier deliveries/week · JIT delivery for composites and precision parts",
        },
        { color: T.amber, icon: "✈", title: "Airside Logistics", body: "Aircraft taxied to airside for final delivery · 2 movements/week planned" },
        {
          color: T.teal,
          icon: "📦",
          title: "Inventory Management",
          body: "Parts Store: 28-day stock · Sub-assembly WIP: 6.2 days · Optimized for Hangar A pull",
        },
        { color: T.sky, icon: "📊", title: "Logistics KPIs", body: "OTIF: 94% · Supplier lead time variance: ±2.1 days · Improving trend" },
      ],
      stress: [
        { color: T.lime, icon: "⚡", title: "Grid at Capacity", body: "Smart grid hub at 88% — adequate but monitor for demand spikes" },
        { color: T.amber, icon: "⚠", title: "Hangar A Load", body: "84% capacity — aircraft demand increasing · Hangar expansion in planning" },
        { color: T.green, icon: "✓", title: "Renewable Surplus", body: "Solar farm at 91% efficiency — no capacity constraints" },
        { color: T.teal, icon: "📊", title: "Overall Stress Score", body: "Site stress index: 62/100 — healthy operational margin across all zones" },
      ],
    },
  },

  /* ── SPOKANE: Smart Factory / AI-Driven Manufacturing ────── */
  spokane: {
    identity: "Smart Factory AI Flow",
    story: "AI-orchestrated manufacturing — automation and data intelligence drive every process",
    zones: [
      { id: "rnd", label: "R&D Center", sub: "Innovation hub", x: 2, y: 6, w: 18, h: 20, type: "rd", cap: 86 },
      { id: "auto", label: "Automation Core", sub: "44K m² robotics floor", x: 22, y: 6, w: 26, h: 28, type: "auto", cap: 94 },
      { id: "smartA", label: "Smart MFG A", sub: "AI-controlled lines", x: 50, y: 6, w: 20, h: 26, type: "mfg", cap: 89 },
      { id: "data", label: "Data Center", sub: "Edge AI · 340kW", x: 72, y: 6, w: 20, h: 26, type: "ai", cap: 78 },
      { id: "aiops", label: "AI Ops Center", sub: "Unified control", x: 72, y: 36, w: 20, h: 20, type: "ai", cap: 82 },
      { id: "smartB", label: "Smart MFG B", sub: "Lights-out nights", x: 50, y: 36, w: 20, h: 22, type: "mfg", cap: 91 },
      { id: "roboW", label: "Robotics Warehouse", sub: "Automated ASRS", x: 22, y: 38, w: 26, h: 20, type: "warehouse", cap: 85 },
      { id: "solar", label: "Solar Array 8.8MW", sub: "Highest ROI asset", x: 2, y: 62, w: 48, h: 22, type: "solar", cap: 88 },
      { id: "sub", label: "Smart Substation", sub: "AI demand response", x: 52, y: 62, w: 16, h: 14, type: "power", cap: 76 },
      { id: "cool", label: "Smart HVAC Core", sub: "AI cooling management", x: 72, y: 60, w: 20, h: 16, type: "cooling", cap: 70 },
      { id: "hub", label: "Employee Hub", sub: "EV charging · campus", x: 72, y: 78, w: 20, h: 12, type: "parking", cap: 55 },
    ],
    flowPaths: {
      flow: [
        {
          id: "f1",
          pts: [
            [20, 16],
            [22, 16],
          ],
          color: T.violet,
        },
        {
          id: "f2",
          pts: [
            [48, 19],
            [50, 19],
          ],
          color: T.violet,
        },
        {
          id: "f3",
          pts: [
            [70, 19],
            [72, 19],
          ],
          color: T.sky,
        },
        {
          id: "f4",
          pts: [
            [48, 47],
            [50, 47],
          ],
          color: T.violet,
        },
        {
          id: "f5",
          pts: [
            [22, 48],
            [22, 38],
          ],
          color: T.teal,
        },
        {
          id: "f6",
          pts: [
            [72, 46],
            [72, 38],
            [70, 38],
          ],
          color: T.sky,
        },
      ],
      energy: [
        {
          id: "e1",
          pts: [
            [26, 62],
            [22, 62],
            [22, 58],
          ],
          color: T.lime,
        },
        {
          id: "e2",
          pts: [
            [52, 69],
            [50, 69],
            [50, 58],
            [72, 58],
            [72, 60],
          ],
          color: T.lime,
        },
        {
          id: "e3",
          pts: [
            [68, 69],
            [72, 69],
          ],
          color: T.amber,
        },
      ],
      logistics: [
        {
          id: "l1",
          pts: [
            [2, 48],
            [22, 48],
            [22, 58],
          ],
          color: T.orange,
        },
        {
          id: "l2",
          pts: [
            [48, 48],
            [22, 48],
          ],
          color: T.orange,
        },
      ],
      stress: [
        {
          id: "s1",
          pts: [
            [22, 19],
            [48, 19],
            [50, 19],
          ],
          color: T.danger,
        },
        {
          id: "s2",
          pts: [
            [50, 47],
            [72, 47],
            [72, 36],
          ],
          color: T.danger,
        },
      ],
    },
    stressMap: { auto: 94, smartB: 91, smartA: 89, solar: 88, rnd: 86, roboW: 85, aiops: 82, data: 78, sub: 76, cool: 70, hub: 55 },
    insights: {
      zones: [
        {
          color: T.violet,
          icon: "🤖",
          title: "AI-Orchestrated Site",
          body: "R&D drives automation · AI Ops Center coordinates all 11 zones in real-time",
        },
        {
          color: T.lime,
          icon: "⚡",
          title: "8.8 MW Solar Array",
          body: "Highest efficiency solar asset in portfolio · 88% performance ratio · 19-yr ROI",
        },
        {
          color: T.sky,
          icon: "💡",
          title: "Lights-Out MFG B",
          body: "Smart MFG B operates fully automated 22:00–06:00 · +18% throughput at zero labor cost",
        },
        {
          color: T.teal,
          icon: "◈",
          title: "ASRS Warehouse",
          body: "Robotic warehouse handles 2,400 picks/hr · 99.7% pick accuracy · Zero labor injuries",
        },
      ],
      flow: [
        { color: T.violet, icon: "➜", title: "AI-Directed Flow", body: "R&D → Automation Core → Smart MFG A → AI Ops → Smart MFG B (lights-out)" },
        {
          color: T.sky,
          icon: "🤖",
          title: "Robotics Throughput",
          body: "Automation core processes 1,200 parts/hr · 34% faster than human-staffed equivalent",
        },
        {
          color: T.teal,
          icon: "◈",
          title: "ASRS Integration",
          body: "Robotic warehouse feeds both MFG lines automatically · Zero stockout events in 90 days",
        },
        { color: T.lime, icon: "📊", title: "OEE Score", body: "Overall Equipment Effectiveness: 88% · Top-quartile smart manufacturing benchmark" },
      ],
      energy: [
        { color: T.lime, icon: "☀", title: "Solar Dominance", body: "8.8 MW solar offsets 52% of annual energy draw · Best in portfolio" },
        {
          color: T.violet,
          icon: "🤖",
          title: "AI Energy Management",
          body: "Predictive load balancing reduces peak draw by 19% · Saves $320K annually",
        },
        {
          color: T.sky,
          icon: "❄",
          title: "Smart HVAC Efficiency",
          body: "AI HVAC maintains 21°C across all zones · 27% less energy than fixed setpoints",
        },
        { color: T.teal, icon: "⚡", title: "Demand Response", body: "Smart substation participates in grid demand response · $44K/yr revenue" },
      ],
      logistics: [
        {
          color: T.orange,
          icon: "🤖",
          title: "Autonomous Logistics",
          body: "22 AMRs (autonomous robots) handle intra-site logistics · No human drivers needed",
        },
        { color: T.amber, icon: "📦", title: "Just-in-Time Precision", body: "AI optimizes delivery schedules · WIP inventory reduced 41% vs 2022" },
        { color: T.teal, icon: "🚚", title: "External Freight", body: "32 supplier deliveries/week · AI dock scheduling eliminates waiting time" },
        {
          color: T.violet,
          icon: "📊",
          title: "Logistics AI Score",
          body: "AI logistics optimization score: 94/100 · Best-in-class for smart manufacturing",
        },
      ],
      stress: [
        {
          color: T.danger,
          icon: "⚠",
          title: "Automation Core Peak",
          body: "At 94% capacity — approaching critical threshold · Add robotic cell recommended",
        },
        { color: T.orange, icon: "🔥", title: "Smart MFG B Load", body: "91% capacity during peak production + lights-out mode · Monitor closely" },
        {
          color: T.amber,
          icon: "📊",
          title: "Data Center Thermal",
          body: "340 kW server load at 78% · Smart cooling manages within safe thresholds",
        },
        { color: T.lime, icon: "✓", title: "Solar Headroom", body: "Solar array at 88% — no capacity constraints · Expansion viable" },
      ],
    },
  },

  /* ── YAKIMA: Heavy Industrial / Utility-Intensive Park ───── */
  yakima: {
    identity: "Heavy Industrial Flow",
    story: "High-energy heavy manufacturing — utility resilience and process heat define operations",
    zones: [
      { id: "sub138", label: "138kV Substation", sub: "Primary power feed", x: 2, y: 6, w: 18, h: 20, type: "power", cap: 87 },
      { id: "sub69", label: "69kV Distribution", sub: "Secondary feed", x: 22, y: 6, w: 16, h: 18, type: "power", cap: 78 },
      { id: "cool1", label: "Cooling Tower 1", sub: "4×1200 RT primary", x: 40, y: 6, w: 16, h: 18, type: "cooling", cap: 88 },
      { id: "cool2", label: "Cooling Tower 2", sub: "Emergency backup", x: 58, y: 6, w: 16, h: 18, type: "cooling", cap: 62 },
      { id: "corrA", label: "Utility Corridor", sub: "Power + water trunk", x: 2, y: 28, w: 80, h: 6, type: "road", cap: 82 },
      { id: "hvyA", label: "Heavy MFG A", sub: "Forging · 56K m²", x: 2, y: 36, w: 30, h: 32, type: "mfg", cap: 92 },
      { id: "hvyB", label: "Heavy MFG B", sub: "Casting & pressing", x: 34, y: 36, w: 26, h: 30, type: "mfg", cap: 89 },
      { id: "water", label: "Water Treatment", sub: "2.4M gal/day", x: 62, y: 36, w: 18, h: 22, type: "water", cap: 91 },
      { id: "waste", label: "Waste Heat Recovery", sub: "Steam → 42% captured", x: 34, y: 68, w: 26, h: 22, type: "infra", cap: 74 },
      { id: "solar", label: "Solar Array 5.2MW", sub: "Partial offset", x: 62, y: 62, w: 30, h: 28, type: "solar", cap: 76 },
      { id: "tank", label: "Storage Tanks", sub: "Fuel + chemical", x: 2, y: 72, w: 30, h: 18, type: "tank", cap: 58 },
    ],
    flowPaths: {
      flow: [
        {
          id: "f1",
          pts: [
            [20, 28],
            [20, 36],
          ],
          color: T.amber,
        },
        {
          id: "f2",
          pts: [
            [38, 28],
            [38, 36],
          ],
          color: T.amber,
        },
        {
          id: "f3",
          pts: [
            [17, 68],
            [17, 72],
          ],
          color: T.teal,
        },
        {
          id: "f4",
          pts: [
            [47, 66],
            [47, 68],
          ],
          color: T.orange,
        },
        {
          id: "f5",
          pts: [
            [66, 58],
            [66, 62],
          ],
          color: T.sky,
        },
      ],
      energy: [
        {
          id: "e1",
          pts: [
            [20, 26],
            [20, 6],
            [22, 6],
          ],
          color: T.danger,
        },
        {
          id: "e2",
          pts: [
            [38, 26],
            [38, 6],
            [40, 6],
          ],
          color: T.danger,
        },
        {
          id: "e3",
          pts: [
            [66, 28],
            [66, 36],
          ],
          color: T.sky,
        },
        {
          id: "e4",
          pts: [
            [77, 62],
            [77, 42],
          ],
          color: T.lime,
        },
      ],
      logistics: [
        {
          id: "l1",
          pts: [
            [2, 34],
            [2, 28],
            [82, 28],
          ],
          color: T.orange,
        },
        {
          id: "l2",
          pts: [
            [82, 28],
            [82, 60],
          ],
          color: T.amber,
        },
      ],
      stress: [
        {
          id: "s1",
          pts: [
            [2, 52],
            [32, 52],
            [34, 52],
          ],
          color: T.danger,
        },
        {
          id: "s2",
          pts: [
            [66, 36],
            [62, 36],
            [62, 28],
          ],
          color: T.danger,
        },
      ],
    },
    stressMap: { hvyA: 92, cool1: 88, water: 91, sub138: 87, hvyB: 89, corrA: 82, sub69: 78, waste: 74, solar: 76, cool2: 62, tank: 58 },
    insights: {
      zones: [
        {
          color: T.danger,
          icon: "⚠",
          title: "High-Stress Infrastructure",
          body: "Site carries highest utility load in portfolio · Sub, cooling, water all above 85%",
        },
        {
          color: T.amber,
          icon: "🔌",
          title: "Dual Substation Setup",
          body: "138kV + 69kV substations provide redundant feed · Critical for 24/7 operations",
        },
        {
          color: T.sky,
          icon: "💧",
          title: "Water Treatment Scale",
          body: "Largest water treatment facility in portfolio · 2.4M gal/day process water",
        },
        {
          color: T.lime,
          icon: "☀",
          title: "Solar Expansion Needed",
          body: "5.2 MW solar only offsets 22% of demand · Doubling recommended for ESG targets",
        },
      ],
      flow: [
        { color: T.amber, icon: "➜", title: "Power Distribution Flow", body: "138kV → Utility Corridor → Heavy MFG A+B → Process equipment" },
        { color: T.teal, icon: "💧", title: "Process Water Circuit", body: "Water treatment → Heavy MFG A+B → Waste heat recovery → recycle 42%" },
        {
          color: T.orange,
          icon: "🔥",
          title: "Forging Process Flow",
          body: "Raw stock → Heavy MFG A (forge) → B (casting/pressing) → QC → Dispatch",
        },
        { color: T.sky, icon: "📊", title: "Throughput Metrics", body: "Heavy MFG A: 340 tons/day forged · MFG B: 280 tons/day casting & pressing" },
      ],
      energy: [
        {
          color: T.danger,
          icon: "🔌",
          title: "Peak Power Draw",
          body: "Peak demand: 18.4 MW · Highest in portfolio · Q2 grid reinforcement critical",
        },
        {
          color: T.orange,
          icon: "🔥",
          title: "Process Heat Recovery",
          body: "Waste heat recovery captures 42% of forge exhaust · Steam feeds heating circuit",
        },
        {
          color: T.lime,
          icon: "☀",
          title: "Solar Contribution",
          body: "5.2 MW offsets 22% of daylight demand · ROI: 8.1 years at current energy prices",
        },
        { color: T.sky, icon: "💧", title: "Cooling Energy Load", body: "Cooling towers consume 2.1 MW continuously · Largest site energy expense" },
      ],
      logistics: [
        {
          color: T.orange,
          icon: "🚚",
          title: "Raw Material Inbound",
          body: "680 tons raw stock/day · Utility corridor is primary inbound + outbound artery",
        },
        {
          color: T.amber,
          icon: "⚠",
          title: "Corridor Congestion",
          body: "Utility corridor at 82% capacity · Single-lane constraint during forging peak hours",
        },
        {
          color: T.teal,
          icon: "📦",
          title: "Chemical Logistics",
          body: "Storage tanks: 30-day fuel reserve · Chemical stock: 14-day production supply",
        },
        {
          color: T.sky,
          icon: "📊",
          title: "Outbound Shipping",
          body: "420 tons finished product/day dispatched · Rail preferred for heavy components",
        },
      ],
      stress: [
        {
          color: T.danger,
          icon: "⚠",
          title: "Heavy MFG A Critical",
          body: "At 92% capacity — highest stress in portfolio · Planned maintenance window needed",
        },
        { color: T.danger, icon: "🔥", title: "Water Treatment Alert", body: "At 91% design capacity · Upgrade required before Q3 volume increase" },
        { color: T.orange, icon: "⚡", title: "Substation 138kV Load", body: "87% utilization · Grid reinforcement project scheduled Q2 2027" },
        {
          color: T.amber,
          icon: "📊",
          title: "Overall Risk Index",
          body: "Site risk index: 84/100 (High) · Priority 1 for infrastructure investment",
        },
      ],
    },
  },
};

function pct(v, tot) {
  return (v / 100) * tot;
}

function usePhase(speed = 0.01) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    let id;
    const tick = () => {
      setPhase((p) => (p + speed) % (Math.PI * 2));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [speed]);
  return phase;
}

function useMovingDots(active, paths, W, H) {
  const [dots, setDots] = useState([]);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!active || !paths.length) {
      setDots([]);
      return;
    }
    const init = paths.map((fp, i) => ({ id: i, fp, t: Math.random(), speed: 0.003 + Math.random() * 0.004 }));
    setDots(init);
    const tick = () => {
      setDots((prev) => prev.map((d) => ({ ...d, t: (d.t + d.speed) % 1 })));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, paths.length]);
  return dots;
}

function interpPts(pts, t, W, H) {
  const segs = pts.length - 1;
  if (segs === 0) return { x: pct(pts[0][0], W), y: pct(pts[0][1], H) };
  const si = Math.floor(t * segs),
    st = t * segs - si;
  const p0 = pts[Math.min(si, segs - 1)],
    p1 = pts[Math.min(si + 1, segs)];
  return { x: pct(p0[0] + (p1[0] - p0[0]) * st, W), y: pct(p0[1] + (p1[1] - p0[1]) * st, H) };
}

const ZSTYLE = {
  inbound: { fill: "#0a1e14", stroke: "#0e5028", label: T.green },
  staging: { fill: "#0a1420", stroke: "#1a4060", label: T.sky },
  mfg: { fill: "#0a1e3a", stroke: "#1a5080", label: T.blue },
  qc: { fill: "#1a0a30", stroke: "#4a1a80", label: T.violet },
  ship: { fill: "#1a0e00", stroke: "#6a3a08", label: T.orange },
  logistics: { fill: "#1a0e00", stroke: "#7a3a08", label: T.amber },
  parking: { fill: "#0d1420", stroke: "#253a54", label: T.faint },
  solar: { fill: "#0a1e0a", stroke: "#14802a", label: T.lime },
  wind: { fill: "#061020", stroke: "#0a3060", label: T.sky },
  green: { fill: "#061e10", stroke: "#0e5028", label: T.green },
  water: { fill: "#061420", stroke: "#0a4060", label: T.sky },
  rd: { fill: "#1a0a30", stroke: "#4a1a80", label: T.violet },
  auto: { fill: "#0a1a30", stroke: "#1a3a80", label: T.blue },
  ai: { fill: "#1a0a2a", stroke: "#5a1a7a", label: T.violet },
  cooling: { fill: "#001420", stroke: "#0a4060", label: T.teal },
  infra: { fill: "#1a0a0a", stroke: "#5a2020", label: T.danger },
  tank: { fill: "#1a1200", stroke: "#4a3a08", label: T.amber },
  power: { fill: "#200a00", stroke: "#802010", label: T.danger },
  road: { fill: "none", stroke: T.faint, label: T.faint },
  gate: { fill: "#0a1214", stroke: "#1a3a40", label: T.muted },
  warehouse: { fill: "#1a1200", stroke: "#7a4a10", label: T.amber },
};

function stressColor(pct) {
  if (pct >= 90) return T.danger;
  if (pct >= 80) return T.orange;
  if (pct >= 70) return T.amber;
  return T.green;
}

function SiteZones({ def, W, H, mode, phase }) {
  return (
    <g>
      <defs>
        <pattern id="opGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0L0 0 0 24" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#opGrid)" />
      <rect
        x={pct(1, W)}
        y={pct(3, H)}
        width={pct(98, W)}
        height={pct(89, H)}
        rx="5"
        fill="none"
        stroke="rgba(91,141,224,0.18)"
        strokeWidth="1"
        strokeDasharray="8 5"
      />
      {def.zones.map((z) => {
        const st = ZSTYLE[z.type] || ZSTYLE.mfg;
        const sc = stressColor(z.cap);
        const isStress = mode === "stress";
        const borderColor = isStress ? sc : st.stroke;
        const fillColor = isStress ? `rgba(${hex2rgb(sc)},0.12)` : st.fill;
        if (z.type === "road") {
          return (
            <rect
              key={z.id}
              x={pct(z.x, W)}
              y={pct(z.y, H)}
              width={pct(z.w, W)}
              height={pct(z.h, H)}
              fill="none"
              stroke={T.faint}
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.4"
            />
          );
        }
        return (
          <g key={z.id}>
            <rect
              x={pct(z.x, W)}
              y={pct(z.y, H)}
              width={pct(z.w, W)}
              height={pct(z.h, H)}
              rx="3"
              fill={fillColor}
              stroke={borderColor}
              strokeWidth={isStress ? 1.8 : 1.2}
            />
            {isStress && (
              <rect
                x={pct(z.x, W)}
                y={pct(z.y + z.h - 3, H)}
                width={pct(z.w * (z.cap / 100), W)}
                height={pct(3, H)}
                rx="1.5"
                fill={sc}
                opacity="0.7"
              />
            )}
            <text
              x={pct(z.x + z.w / 2, W)}
              y={pct(z.y + z.h / 2 - (isStress ? 4 : 3), H)}
              fontSize={pct(z.w, W) > 50 ? 9 : 7.5}
              fill={isStress ? sc : st.label}
              textAnchor="middle"
              fontWeight="700"
            >
              {z.label}
            </text>
            <text x={pct(z.x + z.w / 2, W)} y={pct(z.y + z.h / 2 + 8, H)} fontSize="7" fill={T.faint} textAnchor="middle">
              {isStress ? `${z.cap}%` : z.sub}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function FlowOverlay({ def, W, H, mode, phase }) {
  const pathDef = def.flowPaths;
  const modeKey = mode === "zones" ? "flow" : mode;
  const paths = pathDef[modeKey] || pathDef.flow || [];
  const dots = useMovingDots(mode === "flow" || mode === "logistics", paths, W, H);
  const modeColor = MODES.find((m) => m.id === mode)?.color || T.teal;

  return (
    <g>
      {paths.map((fp) => {
        const pxPts = fp.pts.map(([px, py]) => `${pct(px, W)},${pct(py, H)}`).join(" ");
        const tot = 28;
        return (
          <g key={fp.id}>
            <polyline points={pxPts} fill="none" stroke={fp.color} strokeWidth="1" opacity="0.15" />
            <polyline points={pxPts} fill="none" stroke={fp.color} strokeWidth="2.5" strokeDasharray="10 18" opacity="0.82">
              <animate attributeName="stroke-dashoffset" from={tot} to="0" dur="4s" repeatCount="indefinite" />
            </polyline>
          </g>
        );
      })}
      {dots.map((d) => {
        const pos = interpPts(d.fp.pts, d.t, W, H);
        return (
          <circle key={d.id} cx={pos.x} cy={pos.y} r="3.5" fill={d.fp.color} opacity="0.9">
            <animate attributeName="r" values="2.5;4.5;2.5" dur="2s" repeatCount="indefinite" />
          </circle>
        );
      })}
    </g>
  );
}

function InsightPanel({ def, mode, siteName, siteId }) {
  const cards = def.insights[mode] || def.insights.zones;
  const curMode = MODES.find((m) => m.id === mode);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: "8px 0", overflowY: "auto", flex: 1 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: curMode?.color,
          padding: "0 10px",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        Operational Intelligence
      </div>
      <div style={{ fontSize: 8, color: T.faint, padding: "0 10px 4px", flexShrink: 0 }}>
        {siteName} · {def.identity}
      </div>
      <div
        style={{
          fontSize: 7.5,
          color: T.faint,
          padding: "0 10px 6px",
          flexShrink: 0,
          fontStyle: "italic",
          lineHeight: 1.5,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {def.story}
      </div>
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            margin: "0 8px",
            padding: "7px 9px",
            background: `rgba(${hex2rgb(c.color)},0.08)`,
            border: `1px solid rgba(${hex2rgb(c.color)},0.28)`,
            borderRadius: 5,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 11 }}>{c.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: c.color }}>{c.title}</span>
          </div>
          <p style={{ fontSize: 8, color: T.muted, margin: 0, lineHeight: 1.45 }}>{c.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function OperationalMap({ siteName, siteId }) {
  const [mode, setMode] = useState("zones");
  const canvasRef = useRef(null);
  const [cs, setCs] = useState({ w: 780, h: 430 });
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCs({ w: Math.round(width), h: Math.round(height) });
    });
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, []);
  const id = siteId || (siteName && siteName.toLowerCase()) || "tacoma";
  const def = OP_DEFS[id] || OP_DEFS.tacoma;
  const phase = usePhase(0.01);
  const curMode = MODES.find((m) => m.id === mode);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 215px",
        background: T.bg,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        minHeight: 520,
        height: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "7px 12px",
            borderBottom: `1px solid ${T.border}`,
            background: T.panel,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 9, color: T.faint, fontWeight: 700, letterSpacing: "0.07em", marginRight: 8, textTransform: "uppercase" }}>
            View
          </span>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                padding: "4px 11px",
                fontSize: 9.5,
                fontWeight: 600,
                borderRadius: 5,
                marginRight: 3,
                cursor: "pointer",
                transition: "all 0.15s",
                background: mode === m.id ? `rgba(${hex2rgb(m.color)},0.18)` : "transparent",
                border: mode === m.id ? `1px solid ${m.color}` : "1px solid transparent",
                color: mode === m.id ? m.color : T.muted,
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 8.5, color: curMode?.color, fontWeight: 600 }}>{def.identity}</span>
        </div>
        <div ref={canvasRef} style={{ flex: 1, overflow: "hidden", background: T.bg }}>
          <svg width={cs.w} height={cs.h} style={{ display: "block" }}>
            <SiteZones def={def} W={cs.w} H={cs.h} mode={mode} phase={phase} />
            <FlowOverlay def={def} W={cs.w} H={cs.h} mode={mode} phase={phase} />
            <text x={cs.w - 10} y={cs.h - 8} fontSize="8" fill={curMode?.color} textAnchor="end" opacity="0.4" letterSpacing="0.08em">
              {curMode?.label?.toUpperCase()} · {def.identity?.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>
      <div style={{ borderLeft: `1px solid ${T.border}`, background: T.panel, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "9px 10px 5px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: curMode?.color }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, color: T.muted }}>Operational Intel</span>
          </div>
        </div>
        <InsightPanel def={def} mode={mode} siteName={siteName} siteId={id} />
      </div>
    </div>
  );
}
