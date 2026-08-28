import { Outlet } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const { isExpanded, isHovered, isMobileOpen, toggleMobileSidebar } = useSidebar();

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
        <main className="px-6 py-4 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
