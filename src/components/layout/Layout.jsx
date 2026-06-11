import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { useSite } from "../../context/SiteContext.jsx";

export default function Layout({ children, theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const { activePage, setActivePage } = useSite();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="app-shell">
        <Sidebar collapsed={collapsed} />
        <div className="app-main">
          <Header
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
          <main id="main-content" className="app-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
