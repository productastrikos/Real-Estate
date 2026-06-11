import { useState } from "react";

const LAYERS = [
  { id: "mfg", label: "Manufacturing Zones", color: "#14b8a6", defaultOn: true },
  { id: "utility", label: "Utility Corridors", color: "#f59e0b", defaultOn: true },
  { id: "solar", label: "Solar Zones", color: "#fbbf24", defaultOn: true },
  { id: "logistics", label: "Logistics Network", color: "#f97316", defaultOn: true },
  { id: "power", label: "Power Infrastructure", color: "#5b8de0", defaultOn: true },
  { id: "water", label: "Water Infrastructure", color: "#38bdf8", defaultOn: false },
  { id: "freight", label: "Freight Zones", color: "#94a3b8", defaultOn: false },
  { id: "green", label: "Green Buffer", color: "#16a34a", defaultOn: false },
];

export default function InfraLayers({ onLayersChange }) {
  const [layers, setLayers] = useState(() => {
    const m = {};
    LAYERS.forEach((l) => {
      m[l.id] = l.defaultOn;
    });
    return m;
  });

  const toggle = (id) => {
    const next = { ...layers, [id]: !layers[id] };
    setLayers(next);
    onLayersChange?.(next);
  };

  return (
    <div className="infra-layers-panel">
      <div
        style={{
          padding: "10px 14px 8px",
          borderBottom: "1px solid var(--ds-border)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--ds-text-faint)",
          flexShrink: 0,
        }}
      >
        Infrastructure Layers
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {LAYERS.map((layer) => (
          <div
            key={layer.id}
            className="layer-item"
            onClick={() => toggle(layer.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && toggle(layer.id)}
            aria-pressed={layers[layer.id]}
          >
            <div className="layer-dot" style={{ background: layers[layer.id] ? layer.color : "var(--ds-surface-raised)" }} />
            <span style={{ flex: 1, fontSize: 12, color: layers[layer.id] ? "var(--ds-text)" : "var(--ds-text-faint)" }}>{layer.label}</span>
            <div className={`layer-toggle${layers[layer.id] ? " on" : ""}`} aria-hidden />
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--ds-border)", flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: "var(--ds-text-faint)", marginBottom: 6 }}>Site: 320 Acres · Zone Coverage</div>
        {[
          { label: "Manufacturing", pct: 48, color: "#14b8a6" },
          { label: "Solar Zones", pct: 18, color: "#fbbf24" },
          { label: "Green Buffer", pct: 22, color: "#16a34a" },
          { label: "Infrastructure", pct: 12, color: "#5b8de0" },
        ].map((b) => (
          <div key={b.label} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: "var(--ds-text-muted)" }}>{b.label}</span>
              <span style={{ fontSize: 10, color: b.color, fontWeight: 600 }}>{b.pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${b.pct}%`, background: b.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
