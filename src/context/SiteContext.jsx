import { createContext, useContext, useState } from "react";

/* ============================================================
   SiteContext — Global selected site + active page state
   Provides cross-page synchronization: selecting a site on
   Page 1 automatically drives Pages 2, 3, and 4.
   ============================================================ */

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [selectedSiteId, setSelectedSiteId] = useState("tacoma");
  const [activePage, setActivePage] = useState("global");

  /* Navigate to a page, optionally with a site change */
  const navigateTo = (page, siteId) => {
    if (siteId) setSelectedSiteId(siteId);
    setActivePage(page);
  };

  return <SiteContext.Provider value={{ selectedSiteId, setSelectedSiteId, activePage, setActivePage, navigateTo }}>{children}</SiteContext.Provider>;
}

/* Convenience hook */
export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
