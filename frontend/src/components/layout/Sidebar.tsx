import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { sideNavData } from "../../assets/data/sideNavData";
import SidebarNavItem from "./SidebarNavItem";
import { usePageStore } from "../../store/usePageStore";
import type { NavSection } from "../../assets/data/sideNavData.types";

export default function Sidebar() {
  const { isExpanded, isMobileOpen, isRailExpanded, setIsHovered } =
    useSidebar();
  const { pages, fetchPages } = usePageStore();
  const [settings, setSettings] = useState<{ site_title?: string; site_logo?: string } | null>(null);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    // fetch global site settings so the sidebar can show real title/logo
    import("../../api/client").then(({ apiGet }) => {
      apiGet<{ data?: unknown } | unknown[]>('/api/settings').then((res) => {
        const data =
          (res && typeof res === 'object' && 'data' in res
            ? (res as { data?: unknown }).data
            : undefined) ?? (Array.isArray(res) ? res[1] : res);
        setSettings(data || null);
      }).catch(() => setSettings(null));
    });
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
                path: `/crm/${p.id}`,
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
          {settings?.site_logo ? (
            <img src={(import.meta.env.VITE_API_BASE_URL || window.location.origin) + (settings.site_logo.startsWith('/') ? '' : '/') + settings.site_logo} alt={settings.site_title ?? 'logo'} className="h-9 w-9 rounded-lg object-contain" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
              <LayoutGrid className="h-5 w-5" />
            </span>
          )}
          <span
            className={[
              "whitespace-nowrap text-lg font-semibold text-gray-900 transition-all duration-200 dark:text-white",
              isRailExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0",
            ].join(" ")}
          >
            {settings?.site_title ?? 'Kaina Fresh LTD'}
          </span>
        </Link>
      </div>

      {/* Nav items */}
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
