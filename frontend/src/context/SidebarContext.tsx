import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface SidebarContextValue {
  /** Pinned desktop state: true = full width, false = icon-only rail */
  isExpanded: boolean;
  /** Temporary expand-on-hover while the rail is collapsed */
  isHovered: boolean;
  /** Slide-over state for small screens */
  isMobileOpen: boolean;
  /** id of the currently open dropdown submenu, if any */
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (hovered: boolean) => void;
  setOpenSubmenu: (id: string | null) => void;
  /** true whenever the rail should render its expanded (labelled) look */
  isRailExpanded: boolean;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSidebar = useCallback(() => setIsExpanded((prev) => !prev), []);
  const toggleMobileSidebar = useCallback(
    () => setIsMobileOpen((prev) => !prev),
    []
  );

  const value: SidebarContextValue = {
    isExpanded,
    isHovered,
    isMobileOpen,
    openSubmenu,
    toggleSidebar,
    toggleMobileSidebar,
    setIsHovered,
    setOpenSubmenu,
    isRailExpanded: isExpanded || isHovered || isMobileOpen,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
