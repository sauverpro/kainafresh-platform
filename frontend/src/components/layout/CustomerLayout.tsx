import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import UserProfileModal from "./UserProfileModal";
import { toast } from "sonner";
import { apiGet } from "../../api/client";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer";
import MobileBottomNav from "../navbar/MobileBottomNav";

interface SiteSettings {
  site_title?: string;
  site_logo?: string;
  [key: string]: unknown;
}

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { openCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | null>(null);

  const customerName = user?.full_name || user?.username || "Customer";
  const initials = customerName.slice(0, 2).toUpperCase();

  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
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
    }
    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out of customer portal");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Customer Portal Navbar */}
      <header className="sticky top-0 z-40 h-[72px] bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={siteTitle ?? "KainaFresh"}
              className="h-10 w-10 object-contain rounded-xl"
            />
          ) : (
            <div className="h-10 w-10 rounded-2xl bg-[#076935] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              K
            </div>
          )}
          <div>
            <span className="font-bold text-lg text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {siteTitle ? (
                siteTitle
              ) : (
                <>
                  Kaina<span className="text-[#076935]">Fresh</span>
                </>
              )}
            </span>
            <span className="block text-[10px] font-bold text-[#076935] uppercase tracking-wider">
              Customer Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCart}
            className="relative p-2 text-gray-600 hover:text-[#076935] hover:bg-gray-100 rounded-xl transition"
            title="Basket"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#076935] text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-gray-200" />

          {/* Profile Badge */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <div className="h-9 w-9 rounded-full bg-[#076935] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {initials}
              </div>
              <span className="hidden sm:block text-xs font-bold text-gray-800">
                {customerName}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Profile Modal */}
      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Shopping Cart Drawer & Mobile Dock */}
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
}
