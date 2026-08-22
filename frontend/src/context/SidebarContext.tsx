/**
 * ============================================================================
 * KainaFresh Organic Platform — Collapsible Admin Sidebar Context Provider
 * ============================================================================
 * 
 * Context State Features:
 * 1. `isExpanded`: Desktop expanded vs collapsed icon rail state.
 * 2. `isHovered`: Expand-on-hover temporary expansion when rail is collapsed.
 * 3. `isMobileOpen`: Slide-over drawer toggle for mobile viewports (<768px).
 * 4. `openSubmenu`: Active accordion dropdown submenu identifier.
 * 5. `useSidebar()`: Custom hook for consuming sidebar state in any component.
 */

// Import React Context primitives and hooks
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Interface definition for Sidebar Context state values and action dispatchers.
 */
interface SidebarContextValue {
  /** Pinned desktop state: true = full width, false = icon-only rail */
  isExpanded: boolean;
  /** Temporary expand-on-hover while the rail is collapsed */
  isHovered: boolean;
  /** Slide-over state for small screens */
  isMobileOpen: boolean;
  /** ID of the currently open dropdown submenu, if any */
  openSubmenu: string | null;
  /** Toggle desktop sidebar pin state */
  toggleSidebar: () => void;
  /** Toggle mobile drawer open/close state */
  toggleMobileSidebar: () => void;
  /** Setter for hover state */
  setIsHovered: (hovered: boolean) => void;
  /** Setter for open submenu ID */
  setOpenSubmenu: (id: string | null) => void;
  /** Computed boolean: true whenever rail should render expanded view */
  isRailExpanded: boolean;
}

// Create React Context instance
const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

/**
 * Sidebar Context Provider Wrapper Component.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  // Desktop pinned expanded state (defaults to true)
  const [isExpanded, setIsExpanded] = useState(true);

  // Hover state when collapsed
  const [isHovered, setIsHovered] = useState(false);

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Submenu open accordion identifier
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Memoized toggle handler for desktop sidebar
  const toggleSidebar = useCallback(() => setIsExpanded((prev) => !prev), []);

  // Memoized toggle handler for mobile drawer
  const toggleMobileSidebar = useCallback(
    () => setIsMobileOpen((prev) => !prev),
    []
  );

  // Computed context object payload
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
    // Provide sidebar state payload to children nodes
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

/**
 * Custom hook for accessing SidebarContext inside sub-components.
 * Throws exception if called outside a <SidebarProvider>.
 */
export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
