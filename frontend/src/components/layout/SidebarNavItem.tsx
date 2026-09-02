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
  const [openOtherSub, setOpenOtherSub] = useState<string | null>(null);

  const isOpen = openSubmenu === item.id;
  const hasSubItems = Boolean(item.subItems?.length);

  const isChildActive = item.subItems?.some(
    (s) =>
      s.path === location.pathname ||
      s.otherSub?.some((os) => os.path === location.pathname),
  );

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen, isRailExpanded, openOtherSub, item.subItems]);

  useEffect(() => {
    if (!item.subItems) return;
    for (const sub of item.subItems) {
      if (sub.otherSub?.some((os) => os.path === location.pathname)) {
        setOpenSubmenu(item.id);
        setOpenOtherSub(sub.label);
        return;
      }
    }
  }, [location.pathname, item, setOpenSubmenu]);

  const Icon = item.icon;

  const badge = item.badge && (
    <span className="rounded-full bg-[#F39927] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
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
            "group flex w-full items-center rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer",
            isOpen || isChildActive
              ? "bg-white !text-[#076935] shadow-md font-bold"
              : "text-white/85 hover:bg-white/15 hover:text-white",
            !isRailExpanded ? "justify-center" : "justify-between",
          ].join(" ")}
          style={{
            fontFamily: 'var(--font-heading)',
            color: (isOpen || isChildActive) ? '#076935' : undefined,
          }}
        >
          <span className="flex items-center gap-3">
            <Icon
              className={[
                "h-5 w-5 shrink-0 transition-colors duration-200",
                isOpen || isChildActive
                  ? "text-[#F39927]"
                  : "text-white/70 group-hover:text-white",
              ].join(" ")}
            />
            <span
              className={[
                "overflow-hidden whitespace-nowrap transition-all duration-200",
                isRailExpanded
                  ? "max-w-[160px] opacity-100"
                  : "max-w-0 opacity-0",
              ].join(" ")}
              style={{ color: (isOpen || isChildActive) ? '#076935' : undefined }}
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
                  isOpen
                    ? "rotate-180 text-[#F39927]"
                    : "text-white/60 group-hover:text-white",
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
          <ul className="mt-1.5 ml-3 space-y-1 border-l-2 border-white/20 pl-3">
            {item.subItems!.map((sub) => {
              if (sub.otherSub?.length) {
                const isGroupOpen =
                  openOtherSub === sub.label ||
                  sub.otherSub.some((os) => os.path === location.pathname);
                return (
                  <li key={sub.label}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenOtherSub(isGroupOpen ? null : sub.label)
                      }
                      className={[
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer",
                        isGroupOpen
                          ? "text-white font-bold bg-white/20"
                          : "text-white/75 hover:text-white hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span>{sub.label}</span>
                      <ChevronDown
                        className={[
                          "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                          isGroupOpen ? "rotate-180 text-[#F39927]" : "text-white/60",
                        ].join(" ")}
                      />
                    </button>
                    {isGroupOpen && (
                      <ul className="ml-2 mt-1 space-y-1 pl-2 border-l border-white/15">
                        {sub.otherSub.map((child) =>
                          child.path ? (
                            <li key={child.path}>
                              <NavLink
                                to={child.path}
                                className={({ isActive }) =>
                                  [
                                    "block rounded-md px-3 py-2 text-[13px] transition-all duration-150",
                                    isActive
                                      ? "bg-white/25 text-white font-bold backdrop-blur-md border-l-4 border-[#F39927] shadow-sm"
                                      : "text-white/75 hover:text-white hover:bg-white/10",
                                  ].join(" ")
                                }
                                style={({ isActive }) => (isActive ? { color: '#ffffff' } : {})}
                              >
                                {child.label}
                              </NavLink>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    )}
                  </li>
                );
              }
              if (!sub.path) return null;
              return (
                <li key={sub.path}>
                  <NavLink
                    to={sub.path}
                    className={({ isActive }) =>
                      [
                        "block rounded-lg px-3.5 py-2 text-sm transition-all duration-150 font-medium",
                        isActive
                          ? "bg-white/25 text-white font-bold backdrop-blur-md border-l-4 border-[#F39927] shadow-sm"
                          : "text-white/80 hover:text-white hover:bg-white/10",
                      ].join(" ")
                    }
                    style={({ isActive }) => (isActive ? { color: '#ffffff' } : {})}
                  >
                    {sub.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.path ?? "#"}
        className={({ isActive }) =>
          [
            "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer",
            isActive
              ? "bg-white !text-[#076935] font-bold shadow-md shadow-black/10"
              : "text-white/85 hover:bg-white/15 hover:text-white",
            !isRailExpanded ? "justify-center" : "",
          ].join(" ")
        }
        style={({ isActive }) => ({
          fontFamily: 'var(--font-heading)',
          color: isActive ? '#076935' : undefined,
        })}
      >
        {({ isActive }) => (
          <>
            <Icon
              className={[
                "h-5 w-5 shrink-0 transition-colors duration-200",
                isActive
                  ? "text-[#F39927]"
                  : "text-white/70 group-hover:text-white",
              ].join(" ")}
            />
            <span
              className={[
                "overflow-hidden whitespace-nowrap transition-all duration-200",
                isRailExpanded
                  ? "max-w-[160px] opacity-100"
                  : "max-w-0 opacity-0",
              ].join(" ")}
              style={{ color: isActive ? '#076935' : undefined }}
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
