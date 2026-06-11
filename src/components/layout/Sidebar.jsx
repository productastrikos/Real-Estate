import { useSite } from "../../context/SiteContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Ico } from "../icons/Icons.jsx";

const NAV_ITEMS = [
  { id: "global", label: "Command Center", icon: "globe", page: 1, badge: null },
  { id: "environmental", label: "Site Environmental", icon: "leaf", page: 2, badge: null },
  // { id: "feasibility", label: "Site Feasibility Twin", icon: "layers", page: 3, badge: null },
  { id: "twin", label: "Blueprint Intelligence", icon: "building", page: 4, badge: null },
  // { id: "facility", label: "Facility Layout Planner", icon: "factory", page: 5, badge: null },
  { id: "executive", label: "Strategic Intelligence", icon: "gauge", page: 6, badge: 2 },
];

export default function Sidebar({ collapsed }) {
  const { activePage, setActivePage } = useSite();
  const { logout } = useAuth();
  return (
    <aside className={`app-sidebar${collapsed ? " collapsed" : ""}`} aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div
          className="sidebar-logo__mark"
          aria-hidden
          style={{ background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <img
            src="/Astrikos_solo_logo.png"
            alt="Astrikos"
            style={{ width: 28, height: 28, objectFit: "contain", filter: "var(--ds-logo-filter)" }}
          />
        </div>
        <span className="sidebar-logo__text">RES Platform</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Platform navigation">
        <div className="sidebar-section-label">Platform</div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item${activePage === item.id ? " active" : ""}`}
            role="button"
            tabIndex={0}
            aria-current={activePage === item.id ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            onClick={() => setActivePage(item.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActivePage(item.id)}
          >
            <span className="sidebar-item__icon">
              <Ico name={item.icon} size={16} />
            </span>
            <span className="sidebar-item__label">{` ${item.label}`}</span>
            {/* {item.badge && (
              <span className="sidebar-item__badge" aria-label={`${item.badge} alerts`}>
                {item.badge}
              </span>
            )} */}
          </div>
        ))}

        {/* <div className="sidebar-section-label" style={{ marginTop: 16 }}>
          Reports
        </div>
        <div className="sidebar-item" role="button" tabIndex={0} title={collapsed ? "Analytics" : undefined}>
          <span className="sidebar-item__icon">
            <Ico name="gauge" size={16} />
          </span>
          <span className="sidebar-item__label">Analytics</span>
        </div>
        <div className="sidebar-item" role="button" tabIndex={0} title={collapsed ? "Settings" : undefined}>
          <span className="sidebar-item__icon">
            <Ico name="settings" size={16} />
          </span>
          <span className="sidebar-item__label">Settings</span>
        </div> */}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="sidebar-item"
          role="button"
          tabIndex={0}
          title={collapsed ? "Sign out" : undefined}
          style={{ color: "#ef4444" }}
          onClick={logout}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && logout()}
        >
          <span className="sidebar-item__icon">
            <Ico name="logout" size={16} />
          </span>
          <span className="sidebar-item__label" style={{ color: "#ef4444" }}>
            Sign Out
          </span>
        </div>
      </div>
    </aside>
  );
}
