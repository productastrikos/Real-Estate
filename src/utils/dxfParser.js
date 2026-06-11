/* Simple DXF parser — extracts engineering data from DXF files
   Handles the MIP_*_Masterplan.dxf format (ezdxf output)
   and general DXF R12/2000/2004 format */

export function parseDXFFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(parseDXFContent(e.target.result));
      } catch (err) {
        reject(new Error(`DXF parse failed: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsText(file, "utf-8");
  });
}

function parseDXFContent(content) {
  const lines = content.split(/\r?\n/).map((l) => l.trim());

  const layers = new Set();
  const entityCounts = {};
  const lwPolylines = {};
  const textEntities = [];

  let i = 0;
  let inEntities = false;
  let curType = null;
  let curLayer = null;
  let collecting = false;
  let verts = [];

  function savePolyline() {
    if (collecting && curLayer && verts.length >= 2) {
      if (!lwPolylines[curLayer]) lwPolylines[curLayer] = [];
      lwPolylines[curLayer].push([...verts]);
    }
    collecting = false;
    verts = [];
  }

  while (i < lines.length - 1) {
    const gc = parseInt(lines[i]);
    const val = lines[i + 1] || "";

    if (gc === 0) {
      savePolyline();
      curType = val.trim();
      if (curType === "ENTITIES") { inEntities = true; }
      else if (curType === "ENDSEC") { inEntities = false; }
      else if (inEntities && curLayer) {
        entityCounts[curLayer] = (entityCounts[curLayer] || 0) + 1;
      }
      if (curType === "LWPOLYLINE") collecting = true;
    }

    if (gc === 8) {
      curLayer = val.trim();
      layers.add(curLayer);
    }

    if (gc === 1 && (curType === "TEXT" || curType === "MTEXT")) {
      textEntities.push(val.trim());
    }

    if (collecting) {
      if (gc === 10) verts.push([parseFloat(val) || 0, 0]);
      else if (gc === 20 && verts.length > 0) verts[verts.length - 1][1] = parseFloat(val) || 0;
    }

    i += 2;
  }
  savePolyline();

  /* Derive site boundary */
  const bndrPolylines =
    lwPolylines["A-SITE-BNDR"] ||
    lwPolylines["SITE-BNDR"] ||
    lwPolylines["BOUNDARY"] ||
    lwPolylines["PERIMETER"] ||
    [];

  let siteBbox = null;
  let siteBoundary = null; // raw DXF local coords for the main boundary polyline
  if (bndrPolylines.length > 0) {
    const all = bndrPolylines.flat();
    const xs = all.map((v) => v[0]);
    const ys = all.map((v) => v[1]);
    siteBbox = {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      widthFt: Math.max(...xs) - Math.min(...xs),
      heightFt: Math.max(...ys) - Math.min(...ys),
    };
    // prefer the first boundary polyline as the detailed parcel boundary
    siteBoundary = bndrPolylines[0];
  }

  const layerArr = [...layers];

  /* Infrastructure flags from layer names */
  const has = (pat) => layerArr.some((l) => l.toUpperCase().includes(pat.toUpperCase()));
  const infraFlags = {
    hasPowerGrid: has("POWR") || has("ELEC") || has("E-UTIL"),
    hasWaterUtil: has("WATR") || has("PLMB") || has("P-UTIL"),
    hasRailSpur: has("RAIL") || has("T-RAIL"),
    hasSolarField: has("SOLR") || has("SOLAR") || has("Z-SITE-SOLR"),
    hasGasUtil: has("GAS"),
    hasStormwater: has("STRM") || has("STORM"),
    hasExpansionZone: has("EXPN") || has("EXPAN") || has("Z-ZONE"),
    hasRoadAccess: has("ROAD") || has("DRWY") || has("C-ROAD"),
  };

  const buildingCount =
    (lwPolylines["A-BLDG-PROD"] || []).length +
    (lwPolylines["A-BLDG-UTIL"] || []).length +
    (lwPolylines["A-BLDG"] || []).length;

  const totalEntities = Object.values(entityCounts).reduce((s, v) => s + v, 0);

  return {
    layers: layerArr,
    layerCount: layerArr.length,
    entityCounts,
    totalEntities,
    siteBbox,
    siteBoundary,
    infraFlags,
    buildingCount: buildingCount || Math.floor(totalEntities / 8),
    texts: textEntities.slice(0, 20),
  };
}

/* Convert DXF local-space bounding box to lat/lon polygon
   centerLat/Lon = site center from Excel, bbox in feet */
export function dxfBboxToLatLon(siteBbox, centerLat, centerLon) {
  if (!siteBbox) return null;
  const LAT_FT = 364000;
  const LON_FT = 364000 * Math.cos((centerLat * Math.PI) / 180);
  const dLat = siteBbox.heightFt / LAT_FT / 2;
  const dLon = siteBbox.widthFt / LON_FT / 2;
  return [
    [centerLat + dLat, centerLon - dLon],
    [centerLat + dLat, centerLon + dLon],
    [centerLat - dLat, centerLon + dLon],
    [centerLat - dLat, centerLon - dLon],
  ];
}

/* Convert DXF local-space boundary polyline to lat/lon polygon
   siteBoundary: array of [x(ft), y(ft)] in same coordinate space used for siteBbox
   centerLat/centerLon: site center (from excel). Uses bbox center to compute offsets. */
export function dxfBoundaryToLatLon(siteBoundary, siteBbox, centerLat, centerLon) {
  if (!siteBoundary || !siteBbox) return null;
  const LAT_FT = 364000;
  const LON_FT = 364000 * Math.cos((centerLat * Math.PI) / 180);
  const centerX = (siteBbox.minX + siteBbox.maxX) / 2;
  const centerY = (siteBbox.minY + siteBbox.maxY) / 2;
  return siteBoundary.map(([x, y]) => {
    const dx = x - centerX; // feet
    const dy = y - centerY; // feet
    const lat = centerLat + dy / LAT_FT;
    const lon = centerLon + dx / LON_FT;
    return [lat, lon];
  });
}
