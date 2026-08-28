import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { sideNavData } from "../../assets/data/sideNavData";
import SidebarNavItem from "./SidebarNavItem";
import { usePageStore } from "../../store/usePageStore";
import { apiGet } from "../../api/client";
import type { NavSection } from "../../assets/data/sideNavData.types";

interface SiteSettings {
  site_title?: string;
  site_logo?: string;
  [key: string]: unknown;
}

export default function Sidebar() {
  const { isExpanded, isMobileOpen, isRailExpanded, setIsHovered } =
    useSidebar();
  const { pages, fetchPages } = usePageStore();

  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const settingsResp = await apiGet<unknown>("/api/settings");
        let settingsData: SiteSettings | null = null;
        if (
          settingsResp &&
          typeof settingsResp === "object" &&
          "data" in settingsResp
        ) {
          settingsData = (settingsResp as { data: SiteSettings }).data;
        }
        if (!cancelled && settingsData) {
          const API_BASE =
            import.meta.env.VITE_API_BASE_URL || window.location.origin;
          if (settingsData.site_title) setSiteTitle(settingsData.site_title);
          if (settingsData.site_logo) {
            const raw = settingsData.site_logo;
            const src = /^https?:\/\//.test(raw)
              ? raw
              : `${API_BASE}${raw.startsWith("/") ? raw : "/" + raw}`;
            setLogoSrc(src);
          }
        }
      } catch (err) {
        console.debug("Failed loading settings", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const navData: NavSection[] = useMemo(() => {
    return sideNavData.map((section) => ({
      ...section,
      items: section.items.map((item) => {
        if (item.id !== "crm") return item;
        return {
          ...item,
          subItems: item.subItems?.map((sub) => {
            if (sub.label !== "Pages") return sub;
            return {
              ...sub,
              otherSub: pages.map((p) => ({
                label: p.title,
                path: `/crm/${encodeURIComponent(p.slug)}`,
              })),
            };
          }),
        };
      }),
    }));
  }, [pages]);

  return (
    <aside
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => !isExpanded && setIsHovered(false)}
      className={[
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white",
        "transition-all duration-300 ease-in-out dark:border-white/10 dark:bg-gray-900",
        isRailExpanded ? "w-[260px]" : "w-[84px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="flex h-[72px] shrink-0 items-center gap-2.5 px-6">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={siteTitle ?? "Kaina Fresh"}
              className="h-9 w-9 shrink-0 object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              KF
            </span>
          )}
          <span
            className={[
              "whitespace-nowrap text-lg font-semibold text-gray-900 transition-all duration-200 dark:text-white",
              isRailExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0",
            ].join(" ")}
          >
            {siteTitle ?? "Kaina Fresh"}
          </span>
        </Link>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        {navData.map((section) => (
          <div key={section.id} className="mb-6">
            <h3
              className={[
                "mb-3 px-3 text-xs font-medium uppercase tracking-wide text-gray-400 transition-all duration-200 dark:text-gray-500",
                isRailExpanded ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              {isRailExpanded ? section.title : "•••"}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem key={item.id} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
