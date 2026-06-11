/* ============================================================
   ICONS — SVG line-art, stroke-only, viewBox 0 0 24 24
   stroke-width 1.7, currentColor, round caps & joins
   ============================================================ */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IcoFactory = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M2 21V10l5-3v3l5-3v3l4-3v4H2Z" />
    <rect x="2" y="21" width="20" height="1" rx="0.5" />
    <rect x="7" y="14" width="3" height="7" />
    <rect x="12" y="14" width="3" height="7" />
    <path d="M17 10h5v11" />
  </svg>
);

export const IcoBolt = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M13 2L4.5 13H11L10 22L20.5 11H14L13 2Z" />
  </svg>
);

export const IcoDroplet = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M12 2C12 2 5 10.4 5 15a7 7 0 0 0 14 0C19 10.4 12 2 12 2Z" />
  </svg>
);

export const IcoLeaf = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M17 8C17 8 20 10 20 15s-4 7-8 7c-4 0-8-3-8-8 0-6 7-10 7-10" />
    <path d="M12 12C8 14 7 19 7 19" />
    <path d="M20 4c0 0-8 1-10 8" />
  </svg>
);

export const IcoDollar = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const IcoCarbon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M6 18.5a5.5 5.5 0 0 1 1-10.9 7 7 0 0 1 13.5 1.9A4.5 4.5 0 0 1 19.5 18.5H6Z" />
    <path d="M12 18v4M9 22h6" />
  </svg>
);

export const IcoGauge = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M12 22c5 0 9-4 9-9a9 9 0 0 0-9-9 9 9 0 0 0-9 9" />
    <path d="M7.4 10.6 12 12" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IcoAI = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <rect x="2" y="9" width="20" height="12" rx="3" />
    <path d="M8 9V6a4 4 0 0 1 8 0v3" />
    <circle cx="8.5" cy="15" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15" r="1.3" fill="currentColor" stroke="none" />
    <path d="M9 18h6" />
  </svg>
);

export const IcoMap = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3Z" />
    <path d="M9 4v13M15 7v13" />
  </svg>
);

export const IcoPin = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

export const IcoSearch = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-5-5" />
  </svg>
);

export const IcoBell = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 2 5 2 5H4s2-1 2-5" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IcoUser = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M3 20c0-4 4-7 9-7s9 3 9 7" />
  </svg>
);

export const IcoSettings = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

export const IcoChevronDown = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IcoChevronRight = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IcoClose = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const IcoEye = ({ size = 11, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IcoMenu = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IcoSun = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export const IcoMoon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
  </svg>
);

export const IcoTrendUp = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M22 7l-9 9-4-4L2 18" />
    <path d="M16 7h6v6" />
  </svg>
);

export const IcoTrendDown = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M22 17l-9-9-4 4L2 6" />
    <path d="M16 17h6v-6" />
  </svg>
);

export const IcoAlert = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const IcoCheck = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const IcoLogout = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IcoFilter = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M22 3H2l8 9.46V19l4 2V12.46L22 3Z" />
  </svg>
);

export const IcoLayers = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export const IcoGlobe = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
  </svg>
);

export const IcoBuilding = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9M3 15h6M15 15h6M15 21V9" />
  </svg>
);

export const IcoBrain = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className} aria-hidden>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

/* Map icon by name helper */
const ICON_MAP = {
  factory: IcoFactory,
  bolt: IcoBolt,
  droplet: IcoDroplet,
  leaf: IcoLeaf,
  dollar: IcoDollar,
  carbon: IcoCarbon,
  gauge: IcoGauge,
  ai: IcoAI,
  map: IcoMap,
  pin: IcoPin,
  search: IcoSearch,
  bell: IcoBell,
  user: IcoUser,
  settings: IcoSettings,
  chevrondown: IcoChevronDown,
  chevronright: IcoChevronRight,
  close: IcoClose,
  eye: IcoEye,
  menu: IcoMenu,
  sun: IcoSun,
  moon: IcoMoon,
  trendup: IcoTrendUp,
  trenddown: IcoTrendDown,
  alert: IcoAlert,
  check: IcoCheck,
  logout: IcoLogout,
  filter: IcoFilter,
  layers: IcoLayers,
  globe: IcoGlobe,
  building: IcoBuilding,
  brain: IcoBrain,
};

export function Ico({ name, size = 16, className }) {
  const Component = ICON_MAP[name?.toLowerCase()] ?? IcoFactory;
  return <Component size={size} className={className} />;
}
