import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "../../assets/data/sideNavData.types";
import { useSidebar } from "../../context/SidebarContext";

interface Props {
  item: NavItem;
}

export default function SidebarNavItem({ item }: Props) {
  const { isRailExpanded, openSubmenu, setOpenSubmenu, setIsHovered } =
    useSidebar();
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  const isOpen = openSubmenu === item.id;
  const hasSubItems = Boolean(item.subItems?.length);
  const isChildActive = item.subItems?.some(
    (s) => s.path === location.pathname,
  );

  useEffect(() => {
    if (isChildActive && openSubmenu !== item.id) {
      setOpenSubmenu(item.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen, isRailExpanded]);

  const Icon = item.icon;

  const badge = item.badge && (
    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
      {item.badge}
    </span>
  );

  if (hasSubItems) {
    return (
      <li>
        <button
          type="button"
          onClick={() => {
            if (!isRailExpanded) setIsHovered(true);
            setOpenSubmenu(isOpen ? null : item.id);
          }}
          className={[
            "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
            isOpen || isChildActive
              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
            !isRailExpanded ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          <span className="flex items-center gap-3">
            <Icon
              className={[
                "h-5 w-5 shrink-0",
                isOpen || isChildActive
                  ? "text-brand-500"
                  : "text-gray-500 dark:text-gray-400",
              ].join(" ")}
            />
            <span
              className={[
                "overflow-hidden whitespace-nowrap transition-all duration-200",
                isRailExpanded
                  ? "max-w-[160px] opacity-100"
                  : "max-w-0 opacity-0",
              ].join(" ")}
            >
              {item.label}
            </span>
          </span>

          {isRailExpanded && (
            <span className="flex items-center gap-2">
              {badge}
              <ChevronDown
                className={[
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isOpen ? "rotate-180 text-brand-500" : "text-gray-400",
                ].join(" ")}
              />
            </span>
          )}
        </button>

        <div
          ref={contentRef}
          style={{ maxHeight: isRailExpanded ? maxHeight : "0px" }}
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        >
          <ul className="mt-1 ml-[34px] space-y-1 border-l border-gray-200 pl-3 dark:border-white/10">
            {item.subItems!.map((sub) => (
              <li key={sub.path}>
                <NavLink
                  to={sub.path}
                  className={({ isActive }) =>
                    [
                      "block rounded-md px-2.5 py-2 text-sm transition-colors duration-150",
                      isActive
                        ? "text-brand-600 font-medium dark:text-brand-300"
                        : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white",
                    ].join(" ")
                  }
                >
                  {sub.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        end
        to={item.path ?? "#"}
        className={({ isActive }) =>
          [
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
            isActive
              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white",
            !isRailExpanded ? "justify-center" : "",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={[
                "h-5 w-5 shrink-0",
                isActive
                  ? "text-brand-500"
                  : "text-gray-500 dark:text-gray-400",
              ].join(" ")}
            />
            <span
              className={[
                "overflow-hidden whitespace-nowrap transition-all duration-200",
                isRailExpanded
                  ? "max-w-[160px] opacity-100"
                  : "max-w-0 opacity-0",
              ].join(" ")}
            >
              {item.label}
            </span>
            {isRailExpanded && badge}
          </>
        )}
      </NavLink>
    </li>
  );
}
