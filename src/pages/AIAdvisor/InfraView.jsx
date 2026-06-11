/* ─────────────────────────────────────────────────────────────
   InfraView — SVG site plan visualization
   Top-down enterprise infrastructure map of selected site
   ───────────────────────────────────────────────────────────── */

const C = {
  bg: "#0a0a0a",
  surface: "#111820",
  border: "rgba(255,255,255,0.08)",
  text: "#e8eef5",
  muted: "#afc3d8",
  faint: "#4a6080",
  teal: "#14b8a6",
  blue: "#5b8de0",
  amber: "#f59e0b",
  orange: "#f97316",
  green: "#16a34a",
  sky: "#38bdf8",
  gray: "#334155",
};

export default function InfraView({ layers = {}, siteName = "Tacoma" }) {
  const show = (id) => layers[id] !== false; // default visible

  return (
    <div className="infra-view">
      <div className="infra-view__header">
        <span className="card-title">{siteName} — Infrastructure Site Plan</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="text-faint">320 Acres · Operational View</span>
          <span className="chip chip-info" style={{ fontSize: 9 }}>
            AI Overlay
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <svg viewBox="0 0 760 500" style={{ width: "100%", height: "100%" }} aria-label={`Infrastructure site plan for ${siteName}`}>
          <defs>
            <pattern id="iv-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={C.border} strokeWidth="0.5" />
            </pattern>
            <marker id="iv-arrow-orange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={C.orange} />
            </marker>
            <marker id="iv-arrow-amber" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill={C.amber} />
            </marker>
          </defs>

          {/* Background grid */}
          <rect x="0" y="0" width="760" height="500" fill={C.bg} />
          <rect x="0" y="0" width="760" height="500" fill="url(#iv-grid)" />

          {/* Site boundary */}
          <rect x="28" y="24" width="704" height="452" fill="none" stroke={C.faint} strokeWidth="1.5" strokeDasharray="8 5" rx="4" />
          <text x="36" y="20" fontSize="9" fill={C.faint}>
            SITE BOUNDARY — 320 ACRES
          </text>

          {/* ── Manufacturing Zone A (North) ── */}
          {show("mfg") && (
            <g>
              <rect x="44" y="40" width="280" height="140" rx="4" fill={`${C.teal}14`} stroke={C.teal} strokeWidth="1.5" />
              <text x="184" y="106" fontSize="13" fill={C.teal} textAnchor="middle" fontWeight="700">
                MFG ZONE A
              </text>
              <text x="184" y="122" fontSize="9" fill={C.muted} textAnchor="middle">
                EV Manufacturing · 96,000 m²
              </text>
              {/* Internal bays */}
              <line x1="138" y1="40" x2="138" y2="180" stroke={`${C.teal}40`} strokeWidth="1" strokeDasharray="4 3" />
              <line x1="230" y1="40" x2="230" y2="180" stroke={`${C.teal}40`} strokeWidth="1" strokeDasharray="4 3" />
              <text x="91" y="54" fontSize="8" fill={`${C.teal}99`}>
                Bay 1
              </text>
              <text x="180" y="54" fontSize="8" fill={`${C.teal}99`}>
                Bay 2
              </text>
              <text x="268" y="54" fontSize="8" fill={`${C.teal}99`}>
                Bay 3
              </text>
            </g>
          )}

          {/* ── Manufacturing Zone B (Central-Left) ── */}
          {show("mfg") && (
            <g>
              <rect x="44" y="200" width="180" height="130" rx="4" fill={`${C.teal}14`} stroke={C.teal} strokeWidth="1.5" />
              <text x="134" y="262" fontSize="11" fill={C.teal} textAnchor="middle" fontWeight="700">
                MFG ZONE B
              </text>
              <text x="134" y="276" fontSize="9" fill={C.muted} textAnchor="middle">
                Assembly · 58,500 m²
              </text>
            </g>
          )}

          {/* ── EV Charging Hub ── */}
          {show("mfg") && (
            <g>
              <rect x="44" y="350" width="180" height="100" rx="4" fill={`${C.blue}10`} stroke={C.blue} strokeWidth="1.5" />
              <text x="134" y="397" fontSize="10" fill={C.blue} textAnchor="middle" fontWeight="700">
                EV CHARGING HUB
              </text>
              <text x="134" y="412" fontSize="9" fill={C.muted} textAnchor="middle">
                320 Stalls · 3.2 MW
              </text>
              {/* EV symbols */}
              {[60, 100, 140, 180].map((x) => (
                <rect key={x} x={x} y={425} width={14} height={10} rx="1" fill={`${C.blue}50`} stroke={C.blue} strokeWidth="0.8" />
              ))}
            </g>
          )}

          {/* ── Utility Corridor (vertical, x≈340) ── */}
          {show("utility") && (
            <g>
              <rect x="330" y="24" width="36" height="452" fill={`${C.amber}08`} stroke={C.amber} strokeWidth="1" strokeDasharray="6 4" rx="2" />
              <text x="348" y="256" fontSize="8" fill={C.amber} textAnchor="middle" fontWeight="700" transform="rotate(-90,348,256)">
                UTILITY CORRIDOR
              </text>
              {/* Conduit lines */}
              <line x1="336" y1="24" x2="336" y2="476" stroke={`${C.amber}40`} strokeWidth="0.8" />
              <line x1="342" y1="24" x2="342" y2="476" stroke={`${C.amber}40`} strokeWidth="0.8" />
              <line x1="358" y1="24" x2="358" y2="476" stroke={`${C.amber}40`} strokeWidth="0.8" />
              <line x1="364" y1="24" x2="364" y2="476" stroke={`${C.amber}40`} strokeWidth="0.8" />
            </g>
          )}

          {/* ── Solar Zone (SW) ── */}
          {show("solar") && (
            <g>
              <rect x="240" y="200" width="88" height="250" rx="4" fill={`${C.amber}10`} stroke={C.amber} strokeWidth="1.5" strokeDasharray="5 3" />
              <text x="284" y="326" fontSize="9" fill={C.amber} textAnchor="middle" fontWeight="700">
                SOLAR
              </text>
              <text x="284" y="340" fontSize="8" fill={C.muted} textAnchor="middle">
                2.4 MW
              </text>
              {/* Solar panel grid pattern */}
              {[208, 240, 272, 304, 336, 368, 400, 432].map((y) =>
                [248, 278, 304].map((x) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width={20} height={14} rx="1" fill={`${C.amber}20`} stroke={`${C.amber}60`} strokeWidth="0.5" />
                )),
              )}
            </g>
          )}

          {/* ── Logistics Road (horizontal, y≈242) ── */}
          {show("logistics") && (
            <g>
              <rect x="370" y="230" width="362" height="28" rx="3" fill={`${C.orange}12`} stroke={C.orange} strokeWidth="1.2" />
              <text x="552" y="249" fontSize="8" fill={C.orange} textAnchor="middle" fontWeight="700">
                LOGISTICS ACCESS ROAD
              </text>
              {/* Road markings */}
              {[400, 450, 500, 550, 600, 650, 700].map((x) => (
                <line key={x} x1={x} y1={244} x2={x + 28} y2={244} stroke={`${C.orange}60`} strokeWidth="1" strokeDasharray="18 10" />
              ))}
              {/* Arrow */}
              <line x1="706" y1="244" x2="728" y2="244" stroke={C.orange} strokeWidth="2" markerEnd="url(#iv-arrow-orange)" />
            </g>
          )}

          {/* ── Freight Movement Area ── */}
          {show("freight") && (
            <g>
              <rect x="370" y="280" width="180" height="160" rx="4" fill={`${C.gray}20`} stroke={C.gray} strokeWidth="1" strokeDasharray="4 3" />
              <text x="460" y="358" fontSize="9" fill={C.gray} textAnchor="middle" fontWeight="700">
                FREIGHT
              </text>
              <text x="460" y="372" fontSize="8" fill={C.faint} textAnchor="middle">
                Turning Radius Zone
              </text>
            </g>
          )}

          {/* ── Power Substation ── */}
          {show("power") && (
            <g>
              <rect x="566" y="40" width="90" height="80" rx="6" fill={`${C.blue}18`} stroke={C.blue} strokeWidth="2" />
              <text x="611" y="78" fontSize="10" fill={C.blue} textAnchor="middle" fontWeight="700">
                SUBSTATION
              </text>
              <text x="611" y="92" fontSize="8" fill={C.muted} textAnchor="middle">
                82 MW · Grid Tie
              </text>
              {/* Lightning bolt symbol */}
              <path d="M 606 54 L 600 70 L 609 70 L 602 86 L 622 66 L 612 66 Z" fill={`${C.blue}80`} stroke={C.blue} strokeWidth="0.8" />
            </g>
          )}

          {/* Power line to mfg zone */}
          {show("power") && <line x1="566" y1="80" x2="324" y2="80" stroke={C.blue} strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />}

          {/* ── Water Infrastructure ── */}
          {show("water") && (
            <g>
              <circle cx="668" cy="380" r="34" fill={`${C.sky}10`} stroke={C.sky} strokeWidth="1.5" />
              <text x="668" y="378" fontSize="9" fill={C.sky} textAnchor="middle" fontWeight="700">
                WATER
              </text>
              <text x="668" y="392" fontSize="8" fill={C.muted} textAnchor="middle">
                12M L/day
              </text>
              {/* Droplet */}
              <path
                d="M668 356 C658 366 656 374 662 380 C668 386 676 380 674 374 C670 368 668 356 668 356Z"
                fill={`${C.sky}40`}
                stroke={C.sky}
                strokeWidth="1"
              />
            </g>
          )}

          {/* Green buffer */}
          {show("green") && (
            <g>
              <rect x="562" y="140" width="170" height="82" rx="4" fill={`${C.green}0a`} stroke={C.green} strokeWidth="1" strokeDasharray="4 3" />
              <text x="648" y="182" fontSize="9" fill={C.green} textAnchor="middle" fontWeight="700">
                GREEN BUFFER
              </text>
              <text x="648" y="196" fontSize="8" fill={C.muted} textAnchor="middle">
                4.2 Acres
              </text>
            </g>
          )}

          {/* ── Rail Connection ── */}
          {show("logistics") && (
            <g>
              <line x1="44" y1="460" x2="200" y2="460" stroke={C.orange} strokeWidth="3" />
              <line x1="44" y1="470" x2="200" y2="470" stroke={C.orange} strokeWidth="3" />
              {/* Rail ties */}
              {[60, 90, 120, 150, 180].map((x) => (
                <line key={x} x1={x} y1="456" x2={x} y2="474" stroke={C.orange} strokeWidth="2" />
              ))}
              <text x="50" y="490" fontSize="8" fill={C.orange} fontWeight="700">
                BNSF RAIL
              </text>
              <line x1="44" y1="460" x2="18" y2="460" stroke={C.orange} strokeWidth="3" markerEnd="url(#iv-arrow-amber)" />
            </g>
          )}

          {/* ── Compass & Scale ── */}
          <g>
            <text x="704" y="476" fontSize="9" fill={C.faint} textAnchor="middle">
              N↑
            </text>
            <line x1="640" y1="480" x2="700" y2="480" stroke={C.faint} strokeWidth="1.5" />
            <line x1="640" y1="476" x2="640" y2="484" stroke={C.faint} strokeWidth="1.5" />
            <line x1="700" y1="476" x2="700" y2="484" stroke={C.faint} strokeWidth="1.5" />
            <text x="668" y="494" fontSize="8" fill={C.faint} textAnchor="middle">
              200 m
            </text>
          </g>

          {/* Site label */}
          <text x="40" y="494" fontSize="8" fill={C.faint}>
            {siteName} Industrial Park · AI Infrastructure Overlay
          </text>
        </svg>
      </div>
    </div>
  );
}
