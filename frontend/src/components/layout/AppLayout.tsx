import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSidebar } from "../../context/SidebarContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { sideNavData } from "../../assets/data/sideNavData";
import { apiGet } from "../../api/client";

export default function AppLayout() {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const [settings, setSettings] = useState<{ site_title?: string; site_logo?: string } | null>(null);

  useEffect(() => {
    // fetch site settings once on mount
    apiGet<{ data?: any }>("/api/settings")
      .then((res) => {
        const data = res?.data ?? (Array.isArray(res) ? res[1] : res);
        setSettings(data || null);
      })
      .catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    const defaultTitle = settings?.site_title ?? "Kaina Fresh LTD";
    const defaultFavicon = "/favicon.svg";

    let title = defaultTitle;
    let favicon = defaultFavicon;

    function checkSub(sub: any) {
      if (sub.path === location.pathname) {
        if (!settings?.site_title && sub.title) title = sub.title;
        if (!settings?.site_logo && sub.favicon) favicon = sub.favicon;
        return true;
      }
      if (sub.otherSub?.length) {
        for (const o of sub.otherSub) if (checkSub(o)) return true;
      }
      return false;
    }

    for (const section of sideNavData) {
      for (const item of section.items) {
        if (item.path === location.pathname) {
          if (!settings?.site_title) title = item.title ?? item.label ?? title;
          if (!settings?.site_logo && item.favicon) favicon = item.favicon;
        }
        if (item.subItems?.length) {
          for (const sub of item.subItems) {
            if (checkSub(sub)) {
              if (!settings?.site_title) title = sub.title ?? sub.label ?? title;
              break;
            }
          }
        }
      }
    }

    document.title = title;

    // build full favicon URL when settings provide a relative path
    if (settings?.site_logo) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const raw = settings.site_logo;
      favicon = /^https?:\/\//.test(raw) ? raw : `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
    }

    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = favicon;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = favicon;
      document.head.appendChild(newLink);
    }
  }, [location.pathname, settings]);

  const railExpanded = isExpanded || isHovered;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-40 bg-gray-900/40 transition-opacity duration-300 lg:hidden"
        />
      )}

      <div
        className={[
          "transition-all duration-300 ease-in-out",
          railExpanded ? "lg:ml-[260px]" : "lg:ml-[84px]",
        ].join(" ")}
      >
        <Header />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}