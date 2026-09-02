import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { sideNavData } from "../../assets/data/sideNavData";
import SidebarNavItem from "./SidebarNavItem";
import { usePageStore } from "../../store/usePageStore";
import { apiGet } from "../../api/client";
import type { NavSection } from "../../assets/data/sideNavData.types";
import { Leaf } from "lucide-react";

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
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#076935]/20 bg-gradient-to-b from-[#076935] via-[#055028] to-[#03361a] text-white shadow-2xl",
        "transition-all duration-300 ease-in-out",
        isRailExpanded ? "w-[260px]" : "w-[84px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      {/* Brand Header */}
      <div className="flex h-[76px] shrink-0 items-center gap-3 px-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={siteTitle ?? "Kaina Fresh"}
              className="h-10 w-10 shrink-0 object-contain p-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-sm">
              <Leaf size={20} className="text-[#F39927]" />
            </div>
          )}
          <div
            className={[
              "flex flex-col whitespace-nowrap transition-all duration-200",
              isRailExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0",
            ].join(" ")}
          >
            <span className="text-base font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Kaina<span className="text-[#F39927]">Fresh</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation list */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 py-6">
        {navData.map((section) => (
          <div key={section.id} className="mb-6">
            <h3
              className={[
                "mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-white/50 transition-all duration-200",
                isRailExpanded ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isRailExpanded ? section.title : "•••"}
            </h3>
            <ul className="space-y-1.5">
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
