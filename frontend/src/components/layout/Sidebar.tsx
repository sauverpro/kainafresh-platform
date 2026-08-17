import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { sideNavData } from "../../data/sideNavData";
import SidebarNavItem from "./SidebarNavItem";

export default function Sidebar() {
  const { isExpanded, isMobileOpen, isRailExpanded, setIsHovered } = useSidebar();

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
        <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span
            className={[
              "whitespace-nowrap text-lg font-semibold text-gray-900 transition-all duration-200 dark:text-white",
              isRailExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0",
            ].join(" ")}
          >
            Kaina Fresh LTD
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        {sideNavData.map((section) => (
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
