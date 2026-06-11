import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { SiteProvider, useSite } from "./context/SiteContext.jsx";
import { SiteDataProvider } from "./context/SiteDataContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import GlobalIntelligence from "./pages/GlobalIntelligence/index.jsx";
import SiteEnvironmental from "./pages/SiteEnvironmental/index.jsx";
import AIAdvisor from "./pages/AIAdvisor/index.jsx";
import ExecutiveDashboard from "./pages/ExecutiveDashboard/index.jsx";
import SiteFeasibility from "./pages/SiteFeasibility/index.jsx";
import FacilityPlanner from "./pages/FacilityPlanner/index.jsx";
import LoginPage from "./pages/Login/index.jsx";

const PAGE_MAP = {
  global: GlobalIntelligence,
  environmental: SiteEnvironmental,
  twin: AIAdvisor,
  executive: ExecutiveDashboard,
  feasibility: SiteFeasibility,
  facility: FacilityPlanner,
};

function AppInner() {
  const [theme, setTheme] = useState("dark");
  const { activePage } = useSite();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.setAttribute("data-theme", next);
  };

  const PageComponent = PAGE_MAP[activePage] || GlobalIntelligence;

  return (
    <Layout theme={theme} onToggleTheme={toggleTheme}>
      <PageComponent />
    </Layout>
  );
}

function AppGate() {
  const { user, login } = useAuth();

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <SiteDataProvider>
      <SiteProvider>
        <AppInner />
      </SiteProvider>
    </SiteDataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}
