import { useState } from "react";
import { IcoFilter } from "../../components/icons/Icons.jsx";
import { useSiteData } from "../../context/SiteDataContext.jsx";

function FilterSection({ label, children }) {
  return (
    <div className="filter-section">
      <div className="filter-section__label">{label}</div>
      {children}
    </div>
  );
}

function CheckOption({ label, checked, onChange }) {
  return (
    <label className="filter-option" style={{ cursor: "pointer" }}>
      <div className={`filter-checkbox${checked ? " checked" : ""}`} onClick={onChange} aria-hidden>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5l2.5 2.5L8 2.5" />
          </svg>
        )}
      </div>
      <span onClick={onChange}>{label}</span>
    </label>
  );
}

export default function FilterPanel({ filters, onFiltersChange }) {
  const [aiMin, setAiMin] = useState(70);
  const { sites } = useSiteData();

  /* Build regions dynamically from all loaded sites (shortName deduped + sorted) */
  const regions = [...new Set(sites.map((s) => s.shortName).filter(Boolean))].sort();

  const toggle = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const isChecked = (key, value) => (filters[key] || []).includes(value);

  return (
    <aside className="filter-panel" aria-label="Site filters">
      {/* Header */}
      <div className="filter-section" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <IcoFilter size={13} />
        <span className="card-title" style={{ letterSpacing: "0.04em" }}>
          Smart Filters
        </span>
      </div>

      <FilterSection label="Region">
        {regions.map((r) => (
          <CheckOption key={r} label={r} checked={isChecked("regions", r)} onChange={() => toggle("regions", r)} />
        ))}
        {regions.length === 0 && (
          <span style={{ fontSize: 10, color: "var(--ds-text-faint)", fontStyle: "italic", padding: "2px 0" }}>
            No sites loaded
          </span>
        )}
      </FilterSection>

      {/* <FilterSection label="Site Type">
        {SITE_TYPES.map((t) => (
          <CheckOption key={t} label={t} checked={isChecked("types", t)} onChange={() => toggle("types", t)} />
        ))}
      </FilterSection>

      <FilterSection label="Infrastructure">
        {INFRA.map((f) => (
          <CheckOption key={f} label={f} checked={isChecked("infra", f)} onChange={() => toggle("infra", f)} />
        ))}
      </FilterSection>

      <FilterSection label="ESG">
        {ESG_FILTERS.map((f) => (
          <CheckOption key={f} label={f} checked={isChecked("esg", f)} onChange={() => toggle("esg", f)} />
        ))}
      </FilterSection> */}

      {/* <FilterSection label={`Min AI Score: ${aiMin}`}>
        <input
          type="range"
          min={50}
          max={100}
          value={aiMin}
          onChange={(e) => {
            setAiMin(Number(e.target.value));
            onFiltersChange({ ...filters, aiMin: Number(e.target.value) });
          }}
          className="ai-score-slider"
          aria-label={`Minimum AI score: ${aiMin}`}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span className="text-faint">50</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ds-chart-blue)" }}>{aiMin}</span>
          <span className="text-faint">100</span>
        </div>
      </FilterSection> */}

      {/* Reset */}
      <div style={{ padding: "8px 14px 12px" }}>
        <button
          className="btn btn-control btn-sm"
          style={{ width: "100%" }}
          onClick={() => onFiltersChange({ regions: [], types: [], infra: [], esg: [], aiMin: 70 })}
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}
