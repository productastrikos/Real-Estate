import { useState, useRef, useEffect } from "react";
import { IcoMenu, IcoBell, IcoSun, IcoMoon, IcoAI, IcoUser, IcoSettings, IcoAlert, IcoCheck, IcoLogout, IcoBrain } from "../icons/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const NOTIFICATIONS = [
  {
    id: 1,
    level: "danger",
    title: "Transformer Overload — Everett",
    body: "North substation at 94% peak capacity. Exceeds safe threshold of 85%. Grid upgrade critical within 6 months.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    level: "danger",
    title: "Water Stress Critical — Yakima",
    body: "Reservoir 18% below 10-year baseline. Municipal water restrictions possible by summer 2027.",
    time: "4 hours ago",
    read: false,
  },
  {
    id: 3,
    level: "warning",
    title: "Water Permit Renewal — Tacoma",
    body: "Municipal allocation permit requires renewal by December 2026. Early filing recommended.",
    time: "1 day ago",
    read: false,
  },
];

const AI_INSIGHTS_PREVIEW = [
  {
    type: "recommendation",
    color: "#8b5cf6",
    title: "Tacoma → Primary Expansion",
    body: "94% AI confidence. Infrastructure resilience 98%, ROI 16.2% — highest in portfolio. Commit Phase 2 before Q3 2026.",
  },
  {
    type: "risk",
    color: "#dc2626",
    title: "Everett Power Alert",
    body: "Grid demand to exceed Tier-2 threshold within 3 years. Hybrid renewable backup system (+$4.2M) recommended.",
  },
  {
    type: "sustainability",
    color: "#16a34a",
    title: "Yakima Solar Opportunity",
    body: "8MW solar potential at 1,820 kWh/m². Offsets water stress costs. 9,200 tCO₂/yr offset achievable.",
  },
  {
    type: "expansion",
    color: "#5b8de0",
    title: "Spokane Growth Corridor",
    body: "28% industrial growth by 2030. Eastern WA cost advantage + BNSF rail + 12MW solar permit submitted.",
  },
];

export default function Header({ collapsed, onToggleCollapse, theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const aiRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
        setAiPanelOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (aiRef.current && !aiRef.current.contains(e.target)) setAiPanelOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const markRead = (id) => setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));

  const levelColor = { danger: "#dc2626", warning: "#d97706", info: "#5b8de0" };

  return (
    <header className="app-header" role="banner">
      {/* Collapse toggle */}
      <button className="btn-icon" onClick={onToggleCollapse} aria-label="Toggle sidebar" title="Toggle sidebar">
        <IcoMenu size={16} />
      </button>

      {/* Page breadcrumb */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, marginRight: 8 }}>
        <span className="page-title" style={{ fontSize: 14, fontWeight: 600 }}>
          Real Estate Strategy Planning
        </span>
        {/* <span className="page-subtitle">Washington State Operations</span> */}
      </div>

      {/* AI Advisory button */}
      <div ref={aiRef} style={{ position: "relative", marginLeft: "auto" }}>
        <button
          className={`btn-icon${aiPanelOpen ? " active" : ""} btn-advisory`}
          style={{ background: "var(--ds-advisory)", color: "#fff", border: "1px solid var(--ds-advisory-strong)", width: 34, height: 34 }}
          onClick={() => {
            setAiPanelOpen((v) => !v);
            setNotifOpen(false);
            setProfileOpen(false);
          }}
          aria-label="AI Strategic Intelligence"
          title="AI Strategic Intelligence"
        >
          <IcoBrain size={15} />
        </button>

        {/* AI Panel dropdown */}
        {aiPanelOpen && (
          <div
            className="animate-slide-up"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 340,
              background: "var(--ds-panel)",
              borderRadius: 12,
              boxShadow: "var(--ds-shadow-lg)",
              border: "1px solid var(--ds-border)",
              zIndex: 2000,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 14px 10px",
                borderBottom: "1px solid var(--ds-internal-divider)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div className="ai-panel__dot" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-advisory)", flex: 1 }}>AI Strategic Intelligence</span>
              <span
                style={{
                  fontSize: 9,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "#8b5cf622",
                  color: "#8b5cf6",
                  fontWeight: 700,
                }}
              >
                4 insights
              </span>
            </div>

            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {AI_INSIGHTS_PREVIEW.map((insight, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--ds-internal-divider)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-surface-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: insight.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, fontWeight: 700, color: insight.color }}>{insight.title}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--ds-text-muted)", margin: 0, lineHeight: 1.5 }}>{insight.body}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: "10px 14px" }}>
              <button className="btn btn-advisory btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => setAiPanelOpen(false)}>
                <IcoBrain size={12} />
                View Full AI Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        className="btn-icon"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <IcoSun size={15} /> : <IcoMoon size={15} />}
      </button>

      {/* Notifications */}
      <div ref={notifRef} className="notif-badge" style={{ position: "relative" }}>
        <button
          className="btn-icon"
          aria-label={`Notifications — ${unreadCount} alerts`}
          title="Notifications"
          onClick={() => {
            setNotifOpen((v) => !v);
            setAiPanelOpen(false);
            setProfileOpen(false);
          }}
        >
          <IcoBell size={16} />
        </button>
        {unreadCount > 0 && (
          <span className="notif-count" aria-hidden>
            {unreadCount}
          </span>
        )}

        {/* Notification dropdown */}
        {notifOpen && (
          <div
            className="animate-slide-up"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 360,
              background: "var(--ds-panel)",
              borderRadius: 12,
              boxShadow: "var(--ds-shadow-lg)",
              border: "1px solid var(--ds-border)",
              zIndex: 2000,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 14px 10px",
                borderBottom: "1px solid var(--ds-internal-divider)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ds-text)" }}>Notifications</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 9,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "#dc262622",
                      color: "#dc2626",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  style={{
                    fontSize: 10,
                    background: "none",
                    border: "none",
                    color: "var(--ds-advisory)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification items */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--ds-internal-divider)",
                    background: notif.read ? "transparent" : `${levelColor[notif.level]}08`,
                    cursor: "pointer",
                    display: "flex",
                    gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-surface-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = notif.read ? "transparent" : `${levelColor[notif.level]}08`)}
                  onClick={() => markRead(notif.id)}
                >
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    {notif.read ? (
                      <IcoCheck size={14} style={{ color: "var(--ds-text-faint)" }} />
                    ) : (
                      <IcoAlert size={14} style={{ color: levelColor[notif.level] }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: notif.read ? 500 : 700,
                          color: notif.read ? "var(--ds-text-muted)" : "var(--ds-text)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: levelColor[notif.level],
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: "var(--ds-text-faint)", margin: 0, lineHeight: 1.4 }}>{notif.body}</p>
                    <span style={{ fontSize: 10, color: "var(--ds-text-faint)", marginTop: 3, display: "block" }}>{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "8px 14px", borderTop: "1px solid var(--ds-internal-divider)", textAlign: "center" }}>
              <span style={{ fontSize: 11, color: "var(--ds-text-faint)" }}>{notifications.length} total alerts · Click to dismiss</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div ref={profileRef} style={{ position: "relative" }}>
        <button
          className="profile-trigger"
          onClick={() => {
            setProfileOpen((v) => !v);
            setNotifOpen(false);
            setAiPanelOpen(false);
          }}
          aria-label="User profile"
          aria-haspopup="menu"
          aria-expanded={profileOpen}
        >
          {user?.name
            ? user.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "AD"}
        </button>
        {profileOpen && (
          <div className="profile-menu animate-slide-up" role="menu">
            <div className="profile-menu__header">
              <div className="profile-menu__name">{user?.name || "Administrator"}</div>
              <div className="profile-menu__email">{user?.email || ""}</div>
            </div>
            {/* <button className="profile-menu__item" role="menuitem">
              <IcoUser size={14} /> My Profile
            </button>
            <button className="profile-menu__item" role="menuitem">
              <IcoSettings size={14} /> Settings
            </button> */}
            <button
              className="profile-menu__item destructive"
              role="menuitem"
              onClick={() => {
                setProfileOpen(false);
                logout();
              }}
            >
              <IcoLogout size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
