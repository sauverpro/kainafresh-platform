import { useEffect, useRef, useState } from "react";
import { Menu, Search, Bell, ChevronDown, X, LogOut, UserRoundPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "sonner";

interface HeaderProps {
  onOpenProfile?: () => void;
}

export default function Header({ onOpenProfile }: HeaderProps) {
  const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const profileName: string =
    user?.full_name?.trim() || user?.username?.trim() || "User";
  const initials: string = profileName.slice(0, 2).toUpperCase();
  const roleLabel =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "sales_manager"
        ? "Sales Manager"
        : "Customer";

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-white/10 dark:bg-gray-900 lg:px-6">
      {/* Sidebar toggles */}
      <button
        type="button"
        onClick={() => {
          // lg+ collapses the pinned rail, below lg opens the slide-over
          if (window.innerWidth >= 1024) toggleSidebar();
          else toggleMobileSidebar();
        }}
        aria-label="Toggle sidebar"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-[420px] sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search or type command..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-14 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[11px] font-medium text-gray-400 dark:border-white/10 dark:bg-white/5">
          Search
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Theme toggle */}
        {/* <button
          type="button"
          onClick={() => setIsDark((d) => !d)}
          aria-label="Toggle dark mode"
          className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button> */}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-white dark:ring-gray-900" />
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 sm:block">
              {profileName}
            </span>
            <ChevronDown
              className={[
                "hidden h-4 w-4 text-gray-400 transition-transform duration-200 sm:block",
                profileOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg dark:border-white/10 dark:bg-gray-900">
              <div className="px-4 py-2">
                <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-100">
                  {user?.full_name || profileName}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  @{user?.username || "user"}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  {roleLabel}
                </span>
              </div>
              <hr className="my-1.5 border-gray-100 dark:border-white/10" />
              <button
                type="button"
                onClick={() => {
                  onOpenProfile?.();
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <UserRoundPen size={15} /> My Profile
              </button>
              <hr className="my-1.5 border-gray-100 dark:border-white/10" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
