import { useState, useRef } from "react";
import { IcoClose } from "../../components/icons/Icons.jsx";
import { parseExcelFile } from "../../utils/excelParser.js";
import { parseCSVFile } from "../../utils/csvParser.js";
import { parseGeoJSONFile } from "../../utils/geojsonParser.js";
import { parseDXFFile } from "../../utils/dxfParser.js";
import { useSiteData } from "../../context/SiteDataContext.jsx";

function DropZone({ accept, label, icon, file, onFile, error, required, loading }) {
  const ref = useRef();
  const hasBorder = file ? "var(--ds-success)" : error ? "#dc2626" : required ? "rgba(239,68,68,0.45)" : "var(--ds-border)";
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      style={{
        border: `2px dashed ${hasBorder}`,
        borderRadius: 8,
        padding: "16px 12px",
        textAlign: "center",
        cursor: "pointer",
        background: file ? "rgba(22,163,74,0.04)" : error ? "rgba(239,68,68,0.03)" : "var(--ds-surface)",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {required && !file && (
        <div style={{ position: "absolute", top: 6, right: 8, fontSize: 8, color: "#ef4444", fontWeight: 700, letterSpacing: "0.04em" }}>
          REQUIRED
        </div>
      )}
      <div style={{ fontSize: 20, marginBottom: 6 }}>{loading ? "⟳" : icon}</div>
      {file ? (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-success)" }}>{file.name}</div>
          <div style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>{(file.size / 1024).toFixed(1)} KB</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: loading ? "var(--ds-text-faint)" : "var(--ds-text)" }}>
            {loading ? "Parsing…" : label}
          </div>
          <div style={{ fontSize: 10, color: "var(--ds-text-faint)", marginTop: 2 }}>Click or drag to upload</div>
        </div>
      )}
      {error && <div style={{ fontSize: 10, color: "#dc2626", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function SitePreviewCard({ site }) {
  const flagColor = site.ragStatus === "success" ? "#16a34a" : "#d97706";
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 7,
        border: "1px solid var(--ds-border)",
        background: "var(--ds-surface)",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `${flagColor}1a`,
          border: `1px solid ${flagColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 800,
          color: flagColor,
          flexShrink: 0,
        }}
      >
        {site.aiScore}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text)" }}>{site.name}</div>
        <div style={{ fontSize: 10, color: "var(--ds-text-faint)", marginTop: 1 }}>
          {site.area} · {site.type}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
          {[
            ["Power", `${site.power}%`, site.power >= 85 ? "#16a34a" : "#d97706"],
            ["Water", `${site.waterPct}%`, site.waterPct >= 70 ? "#16a34a" : "#d97706"],
            ["Rail", site.railScore, site.railScore >= 80 ? "#16a34a" : "#d97706"],
            ["ESG", site.esg, site.esg >= 80 ? "#16a34a" : "#d97706"],
          ].map(([k, v, c]) => (
            <div key={k} style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 9, color: "var(--ds-text-faint)" }}>{k}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: c }}>{v}</span>
            </div>
          ))}
        </div>
        {site.issue && <div style={{ marginTop: 5, fontSize: 9, color: "#d97706" }}>&#9888; {site.issue}</div>}
      </div>
    </div>
  );
}

function linkStyle(color) {
  return {
    fontSize: 9,
    color,
    fontWeight: 600,
    textDecoration: "none",
    padding: "2px 6px",
    background: `${color}1a`,
    borderRadius: 4,
    border: `1px solid ${color}44`,
  };
}

const STEP_ACTIVE = { background: "#5b8de0", color: "#fff", border: "1.5px solid #5b8de0" };
const STEP_DONE = { background: "#16a34a", color: "#fff", border: "1.5px solid #16a34a" };
const STEP_IDLE = { background: "var(--ds-surface)", color: "var(--ds-text-faint)", border: "1.5px solid var(--ds-border)" };

function StepDot({ n, state }) {
  const s = state === "done" ? STEP_DONE : state === "active" ? STEP_ACTIVE : STEP_IDLE;
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
        ...s,
      }}
    >
      {state === "done" ? "✓" : n}
    </div>
  );
}

export default function SiteUploadModal({ onClose }) {
  const { addSite } = useSiteData();

  /* ── File state ── */
  const [dataFile, setDataFile] = useState(null);
  const [geojsonFile, setGeojsonFile] = useState(null);
  const [dxfFile, setDxfFile] = useState(null);

  /* ── Parsed results ── */
  const [parsedSites, setParsedSites] = useState(null); // from CSV or XLSX
  const [geoBoundaries, setGeoBoundaries] = useState(null); // siteId → [[lat,lon]] from GeoJSON
  const [parsedDxf, setParsedDxf] = useState(null);

  /* ── Error / loading state ── */
  const [dataError, setDataError] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [dxfError, setDxfError] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  /* ── UI state ── */
  const [selected, setSelected] = useState(new Set());
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false); // tracks if user tried to submit with missing files

  /* ── Helpers ── */
  const handleDataFile = async (file) => {
    setDataFile(file);
    setParsedSites(null);
    setDataError(null);
    setSelected(new Set());
    setParsing(true);
    try {
      const isExcel = /\.(xlsx|xls|xlsm)$/i.test(file.name);
      const sites = await (isExcel ? parseExcelFile(file) : parseCSVFile(file));
      if (!sites.length) throw new Error("No sites found in file");
      setParsedSites(sites);
      setSelected(new Set(sites.map((s) => s.id)));
    } catch (e) {
      setDataError(e.message);
      setParsedSites(null);
    } finally {
      setParsing(false);
    }
  };

  const handleGeoJSON = async (file) => {
    setGeojsonFile(file);
    setGeoError(null);
    setGeoLoading(true);
    try {
      const sites = await parseGeoJSONFile(file);
      const boundaries = {};
      sites.forEach((s) => {
        if (s.boundary?.length) boundaries[s.id] = s.boundary;
      });
      if (!Object.keys(boundaries).length) throw new Error("No polygon boundary found in GeoJSON");
      setGeoBoundaries(boundaries);
    } catch (e) {
      setGeoError(e.message);
      setGeoBoundaries(null);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleDxf = async (file) => {
    setDxfFile(file);
    setDxfError(null);
    try {
      const data = await parseDXFFile(file);
      setParsedDxf(data);
    } catch (e) {
      setDxfError(e.message);
    }
  };

  const handleAdd = () => {
    setSubmitted(true);
    if (!parsedSites || !geoBoundaries || selected.size === 0) return;
    const boundaryKeys = Object.keys(geoBoundaries);
    parsedSites
      .filter((s) => selected.has(s.id))
      .forEach((site) => {
        /* Match boundary by id, fall back to first boundary if ids differ */
        const boundary = geoBoundaries[site.id] || geoBoundaries[boundaryKeys[0]];
        addSite({ ...site, boundary }, parsedDxf);
      });
    setDone(true);
    setTimeout(onClose, 1200);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const canAdd = parsedSites && geoBoundaries && selected.size > 0;

  const step1State = parsedSites ? "done" : "active";
  const step2State = geoBoundaries ? "done" : parsedSites ? "active" : "idle";
  const step3State = parsedDxf ? "done" : geoBoundaries ? "active" : "idle";

  return (
    <>
      <div className="modal-backdrop animate-fade-in" onClick={onClose} />
      <div className="modal-frame animate-fade-in" role="dialog" aria-modal="true" style={{ maxWidth: 680, width: "95vw", maxHeight: "92vh" }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "#5b8de0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              📁
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ds-text)", margin: 0 }}>Upload Site Data</h2>
              <p style={{ fontSize: 11, color: "var(--ds-text-faint)", margin: 0 }}>
                Steps 1 &amp; 2 are required · Step 3 is optional · Map auto-flies to site on add
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <IcoClose size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>
                {selected.size} site{selected.size > 1 ? "s" : ""} added — map flying to location
              </div>
              <div style={{ fontSize: 11, color: "var(--ds-text-faint)", marginTop: 6 }}>
                KPIs · GIS Map · AI Insights · Executive · Environmental · Blueprint — all updated
              </div>
            </div>
          ) : (
            <>
              {/* ── STEP 1: Site Attributes ──────────────────────────────── */}
              <div style={{ border: `1px solid ${submitted && !parsedSites ? "#dc2626" : "var(--ds-border)"}`, borderRadius: 8, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--ds-surface)",
                    borderBottom: "1px solid var(--ds-border)",
                  }}
                >
                  <StepDot n={1} state={step1State} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      Site Attributes
                      <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: "0.04em" }}>REQUIRED</span>
                    </div>
                    <div style={{ fontSize: 9, color: "var(--ds-text-faint)" }}>Upload .xlsx or .csv — format is auto-detected</div>
                  </div>
                  {parsedSites && (
                    <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>
                      ✓ {parsedSites.length} site{parsedSites.length !== 1 ? "s" : ""} loaded
                    </span>
                  )}
                  {submitted && !parsedSites && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>⚠ Required</span>}
                </div>
                <div style={{ padding: 12 }}>
                  <DropZone
                    accept=".xlsx,.xls,.xlsm,.csv"
                    label="Drop .xlsx or .csv here"
                    icon="📊"
                    file={dataFile}
                    onFile={handleDataFile}
                    error={dataFile ? dataError : null}
                    required={!dataFile}
                    loading={parsing}
                  />
                  {parsing && (
                    <div style={{ textAlign: "center", paddingTop: 8, fontSize: 10, color: "var(--ds-text-faint)" }}>Parsing file…</div>
                  )}
                </div>
              </div>

              {/* ── STEP 2: Site Boundary ──────────────────────────────── */}
              <div
                style={{ border: `1px solid ${submitted && !geoBoundaries ? "#dc2626" : "var(--ds-border)"}`, borderRadius: 8, overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--ds-surface)",
                    borderBottom: "1px solid var(--ds-border)",
                  }}
                >
                  <StepDot n={2} state={step2State} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      Site Boundary
                      <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: "0.04em" }}>REQUIRED</span>
                    </div>
                    <div style={{ fontSize: 9, color: "var(--ds-text-faint)" }}>
                      GeoJSON with polygon geometry — sets precise parcel boundary on the map
                    </div>
                  </div>
                  {geoBoundaries && <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>✓ Boundary loaded</span>}
                  {submitted && !geoBoundaries && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>⚠ Required</span>}
                </div>
                <div style={{ padding: 12, display: "grid", gridTemplateColumns: geoBoundaries ? "1fr 1fr" : "1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b", marginBottom: 5, letterSpacing: "0.05em", textAlign: "center" }}>
                      🗺️ GeoJSON
                    </div>
                    <DropZone
                      accept=".geojson,.json"
                      label="Drop .geojson here"
                      icon="🗺️"
                      file={geojsonFile}
                      onFile={handleGeoJSON}
                      error={geoError}
                      required={!geoBoundaries}
                      loading={geoLoading}
                    />
                  </div>
                  {geoBoundaries && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 7,
                        border: "1px solid rgba(245,158,11,0.25)",
                        background: "rgba(245,158,11,0.05)",
                        fontSize: 10,
                        alignSelf: "center",
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: 6 }}>Boundary Extracted</div>
                      {Object.entries(geoBoundaries).map(([id, poly]) => (
                        <div key={id} style={{ display: "flex", justifyContent: "space-between", color: "var(--ds-text-faint)", marginBottom: 3 }}>
                          <span>{id}</span>
                          <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>{poly.length} vertices</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── STEP 3: CAD Drawing (optional) ──────────────────────── */}
              <div style={{ border: "1px solid var(--ds-border)", borderRadius: 8, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--ds-surface)",
                    borderBottom: "1px solid var(--ds-border)",
                  }}
                >
                  <StepDot n={3} state={step3State} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      CAD Drawing
                      <span style={{ fontSize: 9, color: "var(--ds-text-faint)", fontWeight: 400 }}>(optional)</span>
                    </div>
                    <div style={{ fontSize: 9, color: "var(--ds-text-faint)" }}>
                      DXF masterplan — adds precise boundary + infra layers (power, rail, solar, roads)
                    </div>
                  </div>
                  {parsedDxf && <span style={{ fontSize: 10, color: "#5b8de0", fontWeight: 700 }}>✓ {parsedDxf.layerCount} layers</span>}
                </div>
                <div style={{ padding: 12, display: "grid", gridTemplateColumns: parsedDxf ? "1fr 1fr" : "1fr", gap: 10 }}>
                  <DropZone accept=".dxf" label="Drop DXF masterplan here" icon="📐" file={dxfFile} onFile={handleDxf} error={dxfError} />
                  {parsedDxf && (
                    <div
                      style={{
                        padding: "8px 10px",
                        borderRadius: 7,
                        border: "1px solid rgba(91,141,224,0.25)",
                        background: "rgba(91,141,224,0.05)",
                        fontSize: 10,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: "#5b8de0", marginBottom: 5 }}>DXF Layers Detected</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 8px", color: "var(--ds-text-faint)" }}>
                        <span>Layers</span>
                        <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>{parsedDxf.layerCount}</span>
                        <span>Buildings</span>
                        <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>{parsedDxf.buildingCount}</span>
                        <span>Entities</span>
                        <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>{parsedDxf.totalEntities}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                        {Object.entries(parsedDxf.infraFlags)
                          .filter(([, v]) => v)
                          .map(([k]) => (
                            <span
                              key={k}
                              style={{
                                fontSize: 9,
                                background: "rgba(22,163,74,0.12)",
                                color: "#16a34a",
                                border: "1px solid rgba(22,163,74,0.25)",
                                borderRadius: 4,
                                padding: "1px 6px",
                              }}
                            >
                              {k.replace("has", "")}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── SAMPLE DOWNLOADS ─────────────────────────────────────── */}
              {/* <div style={{ padding: "10px 12px", background: "var(--ds-surface)", border: "1px solid var(--ds-border)", borderRadius: 7 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ds-text)", marginBottom: 8 }}>Download Sample Files to Upload</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { label: "Renton Mfg Park",      xlsx: "/samples/rnt_001_site_data.xlsx", csv: "/samples/rnt_001_site_data.csv", geojson: "/samples/rnt_001_site_data.geojson", dxf: "/samples/rnt_001_masterplan.dxf" },
                    { label: "Bellingham Aerospace",  xlsx: "/samples/blm_002_site_data.xlsx", csv: "/samples/blm_002_site_data.csv", geojson: "/samples/blm_002_site_data.geojson", dxf: "/samples/blm_002_masterplan.dxf" },
                  ].map((s) => (
                    <div key={s.label} style={{ padding: "6px 8px", background: "rgba(91,141,224,0.04)", border: "1px solid rgba(91,141,224,0.15)", borderRadius: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--ds-text)", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 8, color: "var(--ds-text-faint)", marginBottom: 4 }}>Step 1 · Site Attributes:</div>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 6 }}>
                        {s.xlsx    && <a href={s.xlsx}    download style={linkStyle("#16a34a")}>↓ XLSX</a>}
                        {s.csv     && <a href={s.csv}     download style={linkStyle("#0ea5e9")}>↓ CSV</a>}
                      </div>
                      <div style={{ fontSize: 8, color: "var(--ds-text-faint)", marginBottom: 4 }}>Step 2 · Boundary:</div>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 6 }}>
                        {s.geojson && <a href={s.geojson} download style={linkStyle("#f59e0b")}>↓ GeoJSON</a>}
                      </div>
                      {s.dxf && (
                        <>
                          <div style={{ fontSize: 8, color: "var(--ds-text-faint)", marginBottom: 4 }}>Step 3 · CAD:</div>
                          <a href={s.dxf} download style={linkStyle("#5b8de0")}>↓ DXF</a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div> */}

              {/* ── SITE PREVIEW ─────────────────────────────────────────── */}
              {parsedSites && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ds-text)", marginBottom: 8 }}>
                    {parsedSites.length} site{parsedSites.length > 1 ? "s" : ""} found — click to select:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                    {parsedSites.map((site) => (
                      <div
                        key={site.id}
                        onClick={() => toggleSelect(site.id)}
                        style={{
                          cursor: "pointer",
                          outline: selected.has(site.id) ? "2px solid rgba(91,141,224,0.5)" : "2px solid transparent",
                          borderRadius: 8,
                          transition: "outline 0.15s",
                        }}
                      >
                        <SitePreviewCard site={site} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ACTIONS ──────────────────────────────────────────────── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
                <div style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>
                  {!parsedSites && <span style={{ color: "#ef4444" }}>↑ Step 1 required &nbsp;</span>}
                  {!geoBoundaries && <span style={{ color: "#ef4444" }}>↑ Step 2 required</span>}
                  {parsedSites && geoBoundaries && <span style={{ color: "#16a34a" }}>✓ Ready to add</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-control" onClick={onClose}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleAdd} style={{ opacity: canAdd ? 1 : 0.5 }}>
                    Add {selected.size > 0 ? selected.size : ""} Site{selected.size !== 1 ? "s" : ""} to Dashboard
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
