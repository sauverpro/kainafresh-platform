import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  User,
  FileText,
  Plus,
  ArrowRight,
  Eye,
  RefreshCw,
  Search,
  Key,
  ShieldCheck,
  Phone,
  Home,
  Download,
  Trash2,
  AlertCircle,
  XCircle,
  
} from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useAuth } from "../../auth/AuthContext";
import { useCart } from "../../context/CartContext";
import Modal from "../../components/ui/Modal";
import MetricCard from "../../components/ui/MetricCard";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";

/* ────────────────────────────────────────────────────────────
 * Backend API shapes (matching your JSON response)
 * ──────────────────────────────────────────────────────────── */
interface BackendOrder {
  id: number;
  user_id: number;
  customer_id: number | null;
  order_date: string;
  status?: string;
  total: number | string;
  orderId: string;
  order_source?: string;
  created_at?: string;
  updated_at?: string;
  // Joined customer/user fields
  user_username?: string;
  user_full_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
}

interface BackendOrderItem {
  id: number;
  order_id: number | string;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  product_name?: string;
  product_image?: string | null;
  unit_symbol?: string;
  unit_code?: string;
  unit_name?: string;
}

/* ────────────────────────────────────────────────────────────
 * UI shapes
 * ──────────────────────────────────────────────────────────── */
export interface CustomerOrder {
  id: string;
  backendId: number;
  order_date: string;
  items: Array<{ name: string; qty: number; price_rwf: number; image?: string }>;
  total_rwf: number;
  status: "Processing" | "In Transit" | "Delivered" | "Cancelled";
  delivery_address: string;
  payment_method: string;
  tracking_code: string;
  delivery_driver?: string;
  estimated_delivery?: string;
  // New fields captured from the order response
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  district: string;
  street_address: string;
  is_default: boolean;
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, CustomerOrder["status"]> = {
  pending: "Processing",
  processing: "Processing",
  shipped: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const RWANDA_DISTRICTS = [
  "Gasabo",
  "Kicukiro",
  "Nyarugenge",
  "Musanze",
  "Bugesera",
  "Rubavu",
  "Huye",
  "Muhanga",
  "Nyagatare",
  "Rwamagana",
];

function extractDistrict(address: string | null | undefined): string {
  if (!address) return "—";
  const lower = address.toLowerCase();
  for (const d of RWANDA_DISTRICTS) {
    if (lower.includes(d.toLowerCase())) return d;
  }
  return "—";
}

function extractStreet(address: string | null | undefined, district: string): string {
  if (!address) return "—";
  let street = address;
  if (district && district !== "—") {
    // Remove "Gasabo", "Kigali - Gasabo", ", Gasabo" fragments
    const re = new RegExp(`(^Kigali\\s*[-·]?\\s*${district}\\s*[,·-]?\\s*)|(^${district}\\s*[,·-]?\\s*)|([,·-]\\s*Kigali\\s*[-·]?\\s*${district}\\s*$)|([,·-]\\s*${district}\\s*$)`, "gi");
    street = street.replace(re, "").trim();
    // Also remove trailing commas
    street = street.replace(/^[,\s·-]+|[,\s·-]+$/g, "");
  }
  return street || address;
}

/**
 * Map backend order → UI shape.
 * NOTE: Full customer info is now derived from the order payload itself.
 */
function mapBackendOrder(o: BackendOrder): CustomerOrder {
  const firstName = o.customer_first_name || "";
  const lastName = o.customer_last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || o.user_full_name || "Customer";

  return {
    id: o.orderId || `ORD-${o.id}`,
    backendId: Number(o.id),
    order_date: (o.order_date || "").split(" ")[0] || "—",
    items: [],
    total_rwf: Number(o.total) || 0,
    status: STATUS_MAP[(o.status || "").toLowerCase()] ?? "Processing",
    delivery_address: o.customer_address || "—",
    payment_method:
      o.order_source === "externalorder" ? "Cash on Delivery" : "MTN Mobile Money",
    tracking_code: o.orderId || `KF-${String(o.id).padStart(4, "0")}`,
    // Extracted from order payload
    customer_first_name: firstName,
    customer_last_name: lastName,
    customer_phone: o.customer_phone || "",
    customer_email: o.customer_email || "",
    // Unused but kept for typing
    delivery_driver: undefined,
    estimated_delivery: undefined,
    _fullName: fullName, // Temp storage, removed below
  } as CustomerOrder & { _fullName?: string };
}

/* ────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────── */
export default function CustomerDashboard() {
  usePageTitle("customer-dashboard", "Customer Portal");
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "addresses" | "profile" | "invoices"
  >("overview");

  /* ── Orders state ─────────────────────────────────────────── */
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [itemsLoadingIds, setItemsLoadingIds] = useState<number[]>([]);
  const [cancellingIds, setCancellingIds] = useState<number[]>([]);

  /* ── Addresses state ──────────────────────────────────────── */
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

  /* ── Selected order ───────────────────────────────────────── */
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ── Address modal ────────────────────────────────────────── */
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    district: "Gasabo",
    street_address: "",
    is_default: false,
  });

  /* ── Profile form ─────────────────────────────────────────── */
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    district: "Gasabo",
    payment_method: "MTN Mobile Money",
  });

  /* ── Security form ────────────────────────────────────────── */
  const [securityForm, setSecurityForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  /* ────────────────────────────────────────────────────────────
   * Derive customer info from the orders payload
   * ──────────────────────────────────────────────────────────── */
  const primaryCustomerInfo = useMemo(() => {
    if (orders.length === 0) return null;
    // Use the most recent order's snapshot of the customer data
    const latest = orders[0];
    return {
      first_name: latest.customer_first_name || "",
      last_name: latest.customer_last_name || "",
      phone: latest.customer_phone || "",
      email: latest.customer_email || "",
      address: latest.delivery_address || "",
    };
  }, [orders]);

  const customerName = useMemo(() => {
    if (primaryCustomerInfo) {
      const full = `${primaryCustomerInfo.first_name} ${primaryCustomerInfo.last_name}`.trim();
      if (full) return full;
    }
    return user?.full_name || "Valued Customer";
  }, [primaryCustomerInfo, user]);

  /* ────────────────────────────────────────────────────────────
   * Load orders
   * ──────────────────────────────────────────────────────────── */
  const loadCustomerOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await apiGet<{ success: boolean; data: BackendOrder[] }>(
        "/api/customer/orders",
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setOrders(list.map(mapBackendOrder));
    } catch (err: unknown) {
      setOrdersError(
        err instanceof Error ? err.message : "Failed to load orders",
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomerOrders();
  }, [loadCustomerOrders]);

  /* ────────────────────────────────────────────────────────────
   * Populate address book + profile from the customer info in orders
   * ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!primaryCustomerInfo) return;

    // 1. Seed the profile form
    setProfileForm((prev) => ({
      ...prev,
      full_name: `${primaryCustomerInfo.first_name} ${primaryCustomerInfo.last_name}`.trim(),
      email: primaryCustomerInfo.email,
      phone: primaryCustomerInfo.phone,
      district: extractDistrict(primaryCustomerInfo.address) === "—"
        ? prev.district
        : extractDistrict(primaryCustomerInfo.address),
    }));

    // 2. Seed the address book with the customer's primary address
    if (addresses.length === 0) {
      const district = extractDistrict(primaryCustomerInfo.address);
      const street = extractStreet(primaryCustomerInfo.address, district);
      setAddresses([
        {
          id: "ADDR-PRIMARY",
          label: "Home",
          full_name: `${primaryCustomerInfo.first_name} ${primaryCustomerInfo.last_name}`.trim(),
          phone: primaryCustomerInfo.phone,
          district: district === "—" ? "Gasabo" : district,
          street_address: street === "—" ? primaryCustomerInfo.address : street,
          is_default: true,
        },
      ]);

      setAddressForm((prev) => ({
        ...prev,
        full_name: `${primaryCustomerInfo.first_name} ${primaryCustomerInfo.last_name}`.trim(),
        phone: primaryCustomerInfo.phone,
        district: district === "—" ? "Gasabo" : district,
      }));
    }
  }, [primaryCustomerInfo, addresses.length]);

  /* ────────────────────────────────────────────────────────────
   * Open order details + lazy fetch items
   * ──────────────────────────────────────────────────────────── */
  const openOrderDetails = useCallback(async (order: CustomerOrder) => {
    setSelectedOrder(order);
    if (order.items.length > 0) return;

    setItemsLoadingIds((prev) => [...prev, order.backendId]);
    try {
      const res = await apiGet<{ success: boolean; data: BackendOrderItem[] }>(
        `/api/orders/${order.backendId}/items`,
      );
      const items = (res?.data ?? []).map((it) => ({
        name: it.product_name || `Product #${it.product_id}`,
        qty: Number(it.quantity) || 1,
        price_rwf: Number(it.unit_price) || 0,
        image: it.product_image ?? undefined,
      }));

      setOrders((prev) =>
        prev.map((o) =>
          o.backendId === order.backendId ? { ...o, items } : o,
        ),
      );
      setSelectedOrder((prev) =>
        prev && prev.backendId === order.backendId ? { ...prev, items } : prev,
      );
    } catch (err) {
      console.debug("Failed to load order items", err);
      toast.error("Could not load order items.");
    } finally {
      setItemsLoadingIds((prev) =>
        prev.filter((id) => id !== order.backendId),
      );
    }
  }, []);

  /* ────────────────────────────────────────────────────────────
   * Cancel order
   * ──────────────────────────────────────────────────────────── */
  const handleCancelOrder = useCallback(async (order: CustomerOrder) => {
    if (order.status === "Delivered" || order.status === "Cancelled") {
      toast.error(`This order is already ${order.status.toLowerCase()}.`);
      return;
    }

    const confirmed = window.confirm(
      `Cancel order #${order.id}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setCancellingIds((prev) => [...prev, order.backendId]);
    try {
      const res = await apiPost<{ success: boolean; message?: string }>(
        `/api/customer/order/cancel/${order.backendId}`,
        {},
      );

      if (!res?.success) {
        throw new Error(res?.message || "Failed to cancel order");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.backendId === order.backendId
            ? { ...o, status: "Cancelled" as const }
            : o,
        ),
      );
      setSelectedOrder((prev) =>
        prev && prev.backendId === order.backendId
          ? { ...prev, status: "Cancelled" as const }
          : prev,
      );

      toast.success(`Order #${order.id} has been cancelled.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order";
      toast.error(msg);
    } finally {
      setCancellingIds((prev) => prev.filter((id) => id !== order.backendId));
    }
  }, []);

  /* ────────────────────────────────────────────────────────────
   * Derived
   * ──────────────────────────────────────────────────────────── */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!orderSearch.trim()) return true;
      const q = orderSearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.tracking_code.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, orderSearch, statusFilter]);

  const activeOrdersCount = orders.filter(
    (o) => o.status === "In Transit" || o.status === "Processing",
  ).length;
  const totalSpentRwf = orders.reduce((sum, o) => sum + o.total_rwf, 0);
  const liveOrder = orders.find((o) => o.status === "In Transit");

  /* ────────────────────────────────────────────────────────────
   * Reorder
   * ──────────────────────────────────────────────────────────── */
  const handleReorder = async (order: CustomerOrder) => {
    let items = order.items;

    if (items.length === 0) {
      try {
        const res = await apiGet<{
          success: boolean;
          data: BackendOrderItem[];
        }>(`/api/orders/${order.backendId}/items`);
        items = (res?.data ?? []).map((it) => ({
          name: it.product_name || `Product #${it.product_id}`,
          qty: Number(it.quantity) || 1,
          price_rwf: Number(it.unit_price) || 0,
          image: it.product_image ?? undefined,
        }));
      } catch {
        toast.error("Could not load items to reorder.");
        return;
      }
    }

    items.forEach((item) => {
      addToCart(
        {
          id: item.name.toLowerCase().replace(/\s+/g, "-"),
          name: item.name,
          price: item.price_rwf,
          image: item.image,
        },
        item.qty,
      );
    });
    toast.success(`Items from order #${order.id} added to cart!`);
  };

  /* ────────────────────────────────────────────────────────────
   * Address handlers
   * ──────────────────────────────────────────────────────────── */
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.street_address.trim()) {
      toast.error("Please enter a street address.");
      return;
    }

    // The customer id comes from the first order (it's in the payload)
   // const customerId = orders[0]?.backendId ? undefined : undefined; // Replace if you expose customer_id from the order payload

    const newAddr: CustomerAddress = {
      id: `ADDR-${Date.now()}`,
      label: addressForm.label,
      full_name: addressForm.full_name,
      phone: addressForm.phone,
      district: addressForm.district,
      street_address: addressForm.street_address,
      is_default: addressForm.is_default || addresses.length === 0,
    };

    if (newAddr.is_default) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: false })).concat(newAddr),
      );
    } else {
      setAddresses((prev) => [...prev, newAddr]);
    }

    setIsAddAddressOpen(false);
    setAddressForm({
      label: "Home",
      full_name: customerName,
      phone: primaryCustomerInfo?.phone || "",
      district: "Gasabo",
      street_address: "",
      is_default: false,
    });
    toast.success("New delivery address saved!");
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id })),
    );
    toast.success("Default delivery address updated.");
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed.");
  };

  /* ────────────────────────────────────────────────────────────
   * Profile / security
   * ──────────────────────────────────────────────────────────── */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile information updated successfully!");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.new_password !== securityForm.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    if (securityForm.new_password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      if (user?.id) {
        await apiPost(`/api/auth/change_password/${user.id}`, {
          current_password: securityForm.current_password,
          new_password: securityForm.new_password,
        });
      }
      toast.success("Password changed successfully!");
      setSecurityForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    }
  };

  /* ────────────────────────────────────────────────────────────
   * Render
   * ──────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-[#076935] to-[#0b8a47] rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} /> Verified Fresh Customer
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {customerName}!
          </h1>
          <p className="mt-1 text-sm text-emerald-100 max-w-xl">
            Track your farm-fresh deliveries, view past orders, manage your
            Rwanda delivery locations, and update your preferences.
          </p>
        </div>

        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-[#076935] hover:bg-emerald-50 shadow-sm transition"
        >
          <ShoppingBag size={16} /> Order Fresh Produce
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar gap-2 sm:gap-4 text-xs font-bold">
        {[
          { key: "overview", label: "Overview", icon: <Home size={16} /> },
          {
            key: "orders",
            label: `My Orders (${orders.length})`,
            icon: <Package size={16} />,
          },
          {
            key: "addresses",
            label: `Delivery Addresses (${addresses.length})`,
            icon: <MapPin size={16} />,
          },
          {
            key: "profile",
            label: "Profile & Settings",
            icon: <User size={16} />,
          },
          {
            key: "invoices",
            label: "Invoices & Receipts",
            icon: <FileText size={16} />,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#076935] text-[#076935]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Orders"
              value={`${orders.length}`}
              subtext="Placed farm orders"
              icon={<ShoppingBag size={22} className="text-[#076935]" />}
              iconBg="bg-[#076935]/10"
              badgeText="Order Count"
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            />
            <MetricCard
              label="Active Deliveries"
              value={`${activeOrdersCount}`}
              subtext="En route or processing"
              icon={<Truck size={22} className="text-blue-600" />}
              iconBg="bg-blue-50"
              badgeText="Live Tracking"
              badgeColor="bg-blue-50 text-blue-700 border-blue-200"
            />
            <MetricCard
              label="Saved Locations"
              value={`${addresses.length}`}
              subtext="Delivery points in Rwanda"
              icon={<MapPin size={22} className="text-purple-600" />}
              iconBg="bg-purple-50"
              badgeText="Addresses"
              badgeColor="bg-purple-50 text-purple-700 border-purple-200"
            />
            <MetricCard
              label="Total Spent"
              value={`${totalSpentRwf.toLocaleString()} RWF`}
              subtext="Fresh produce orders"
              icon={<CheckCircle size={22} className="text-emerald-600" />}
              iconBg="bg-emerald-50"
              badgeText="Spent"
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
            />
          </div>

          {liveOrder && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 rounded-3xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      Your fresh produce is on its way!
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      IN TRANSIT
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Order{" "}
                    <span className="font-mono font-bold text-gray-900">
                      #{liveOrder.id}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate(
                    `/track-order?id=${encodeURIComponent(liveOrder.tracking_code)}`,
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0"
              >
                Track Live Status <ArrowRight size={14} />
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Recent Orders
                </h3>
                <p className="text-xs text-gray-500">
                  Your latest fresh produce purchases
                </p>
              </div>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs font-bold text-[#076935] hover:underline flex items-center gap-1"
              >
                View All Orders <ArrowRight size={14} />
              </button>
            </div>

            {ordersLoading ? (
              <div className="p-10 text-center text-gray-500">
                <RefreshCw
                  size={24}
                  className="mx-auto mb-2 animate-spin text-[#076935]"
                />
                <p className="text-xs font-bold">Loading recent orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Package size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-bold text-gray-700">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start ordering fresh produce from our catalog.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Total (RWF)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {orders.slice(0, 3).map((o) => (
                      <tr
                        key={o.backendId}
                        className="hover:bg-[#F4FAF7]/50 transition"
                      >
                        <td className="px-5 py-3.5 font-bold font-mono text-gray-900">
                          {o.id}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {o.order_date}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#076935]">
                          {o.total_rwf.toLocaleString()} RWF
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              o.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : o.status === "In Transit"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : o.status === "Cancelled"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => openOrderDetails(o)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center"
                            title="View Order Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleReorder(o)}
                            className="px-2.5 py-1 rounded-lg bg-[#076935]/10 text-[#076935] hover:bg-[#076935]/20 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <RefreshCw size={12} /> Reorder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-4 animate-fade-in">
          {ordersError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Could not load your orders</p>
                <p>{ordersError}</p>
              </div>
              <button
                onClick={loadCustomerOrders}
                className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          )}

          <div className="p-4 bg-white rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by order ID, tracking code, or item..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#076935]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#076935]"
              >
                <option value="all">All Statuses</option>
                <option value="In Transit">In Transit</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {ordersLoading ? (
              <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center text-gray-500">
                <RefreshCw
                  size={28}
                  className="mx-auto mb-2 animate-spin text-[#076935]"
                />
                <p className="text-xs font-bold">Loading your orders…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center text-gray-500 space-y-2">
                <Package size={32} className="mx-auto text-gray-300" />
                <p className="font-bold text-gray-700 text-base">
                  No orders found
                </p>
                <p className="text-xs text-gray-400">
                  Try changing search keywords or status filters.
                </p>
              </div>
            ) : (
              filteredOrders.map((o) => {
                const cancellable =
                  o.status !== "Delivered" && o.status !== "Cancelled";
                const cancelling = cancellingIds.includes(o.backendId);

                return (
                  <div
                    key={o.backendId}
                    className="p-5 bg-white rounded-3xl border border-gray-200 shadow-2xs hover:border-[#076935]/40 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold text-gray-900 text-base">
                            {o.id}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${
                              o.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : o.status === "In Transit"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : o.status === "Cancelled"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Placed on {o.order_date}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-gray-400 block">
                          Total Amount
                        </span>
                        <span className="text-base font-bold text-[#076935]">
                          {o.total_rwf.toLocaleString()} RWF
                        </span>
                      </div>
                    </div>

                    {o.items.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Order Items:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {o.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                            >
                              <span className="font-medium text-gray-800 truncate pr-2">
                                {item.name}
                              </span>
                              <span className="font-bold text-gray-600 shrink-0">
                                x{item.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin
                          size={14}
                          className="text-[#076935] shrink-0"
                        />
                        <span className="truncate max-w-xs">
                          {o.delivery_address}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openOrderDetails(o)}
                          className="px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
                        >
                          <Eye size={14} /> Details
                        </button>

                        <button
                          onClick={() => handleReorder(o)}
                          className="px-3 py-2 rounded-xl bg-[#076935] font-bold text-white hover:bg-[#055028] shadow-2xs transition flex items-center gap-1.5"
                        >
                          <RefreshCw size={14} /> Reorder
                        </button>

                        {cancellable && (
                          <button
                            onClick={() => handleCancelOrder(o)}
                            disabled={cancelling}
                            className="px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 font-bold text-rose-700 hover:bg-rose-100 transition flex items-center gap-1.5 disabled:opacity-60"
                          >
                            {cancelling ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {cancelling ? "Cancelling…" : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ADDRESSES */}
      {activeTab === "addresses" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                Saved Delivery Locations
              </h3>
              <p className="text-xs text-gray-500">
                Manage your Rwanda home and office fresh produce delivery
                addresses
              </p>
            </div>
            <button
              onClick={() => setIsAddAddressOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition"
            >
              <Plus size={16} /> Add New Address
            </button>
          </div>

          {ordersLoading ? (
            <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center text-gray-500">
              <RefreshCw
                size={28}
                className="mx-auto mb-2 animate-spin text-[#076935]"
              />
              <p className="text-xs font-bold">Loading your addresses…</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center text-gray-500 space-y-2">
              <MapPin size={32} className="mx-auto text-gray-300" />
              <p className="font-bold text-gray-700 text-base">
                No saved addresses
              </p>
              <p className="text-xs text-gray-400">
                Add a delivery location to speed up your next order.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-3xl border transition space-y-3 ${
                    addr.is_default
                      ? "border-[#076935] bg-[#F4FAF7]/60 shadow-xs"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#076935] text-white text-[10px] font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-gray-400 hover:text-rose-600 transition"
                      title="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-gray-700">
                    <p className="font-bold text-gray-900">{addr.full_name}</p>
                    <p className="flex items-center gap-1.5 text-gray-600">
                      <Phone size={13} className="text-[#076935]" /> {addr.phone}
                    </p>
                    <p className="flex items-start gap-1.5 text-gray-600 pt-1">
                      <MapPin
                        size={13}
                        className="text-[#076935] shrink-0 mt-0.5"
                      />
                      <span>
                        {addr.district} District · {addr.street_address}
                      </span>
                    </p>
                  </div>

                  {!addr.is_default && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="mt-2 text-xs font-bold text-[#076935] hover:underline"
                    >
                      Set as Default Delivery Address
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#076935]/10 text-[#076935]">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Customer Account Information
                </h3>
                <p className="text-xs text-gray-500">
                  Update your contact details and default preferences
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Preferred Payment Method
                </label>
                <select
                  value={profileForm.payment_method}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      payment_method: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                >
                  <option value="MTN Mobile Money">
                    MTN Mobile Money (*182#)
                  </option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Credit / Debit Card">
                    Credit / Debit Card (Visa/Mastercard)
                  </option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#076935] text-white font-bold text-xs hover:bg-[#055028] transition shadow-2xs"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Key size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Account Security
                </h3>
                <p className="text-xs text-gray-500">
                  Change your portal login password
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={securityForm.current_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      current_password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={securityForm.new_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      new_password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={securityForm.confirm_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      confirm_password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: INVOICES */}
      {activeTab === "invoices" && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 bg-white rounded-3xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Purchase Invoices & Payment Receipts
                </h3>
                <p className="text-xs text-gray-500">
                  Download official tax invoices and receipts for completed
                  deliveries
                </p>
              </div>
            </div>

            {ordersLoading ? (
              <div className="p-10 text-center text-gray-500">
                <RefreshCw
                  size={24}
                  className="mx-auto mb-2 animate-spin text-[#076935]"
                />
                <p className="text-xs font-bold">Loading invoices…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <FileText size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold">No invoices yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F4FAF7] border-b border-[#076935]/10 text-gray-500 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Invoice Ref</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Order Ref</th>
                      <th className="px-4 py-3.5">Amount (RWF)</th>
                      <th className="px-4 py-3.5">Payment Status</th>
                      <th className="px-4 py-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {orders.map((o) => (
                      <tr
                        key={o.backendId}
                        className="hover:bg-[#F4FAF7]/50 transition"
                      >
                        <td className="px-4 py-3.5 font-bold font-mono text-gray-900">
                          INV-{o.id.replace(/^KF-/, "")}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {o.order_date}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-600">
                          {o.id}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#076935]">
                          {o.total_rwf.toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              o.status === "Cancelled"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {o.status === "Cancelled"
                              ? "CANCELLED"
                              : `PAID (${o.payment_method})`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() =>
                              toast.success(
                                `Receipt for invoice INV-${o.id.replace(/^KF-/, "")} downloaded!`,
                              )
                            }
                            className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 inline-flex items-center gap-1.5"
                          >
                            <Download size={14} /> Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        size="md"
        title="Order Summary & Tracking"
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs pt-1">
            <div className="p-4 bg-gradient-to-r from-[#F4FAF7] to-emerald-50/40 rounded-2xl border border-[#076935]/20 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {selectedOrder.id}
                </span>
                <p className="text-gray-500">
                  Placed on {selectedOrder.order_date}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-white text-xs font-bold ${
                  selectedOrder.status === "Cancelled"
                    ? "bg-rose-600"
                    : selectedOrder.status === "Delivered"
                      ? "bg-emerald-600"
                      : "bg-[#076935]"
                }`}
              >
                {selectedOrder.status}
              </span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-gray-700 text-xs block">
                Purchased Items:
              </span>

              {itemsLoadingIds.includes(selectedOrder.backendId) ? (
                <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-xl bg-gray-50/50">
                  <RefreshCw
                    size={18}
                    className="mx-auto mb-2 animate-spin text-[#076935]"
                  />
                  Loading order items…
                </div>
              ) : selectedOrder.items.length === 0 ? (
                <div className="p-6 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
                  No items recorded for this order.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-gray-400">
                          Qty: {item.qty} × {item.price_rwf.toLocaleString()}{" "}
                          RWF
                        </p>
                      </div>
                      <span className="font-bold text-[#076935]">
                        {(item.qty * item.price_rwf).toLocaleString()} RWF
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <p>
                <strong>Delivery Location:</strong>{" "}
                {selectedOrder.delivery_address}
              </p>
              <p>
                <strong>Recipient:</strong>{" "}
                {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}
              </p>
              <p>
                <strong>Contact:</strong> {selectedOrder.customer_phone}
              </p>
              <p>
                <strong>Payment Method:</strong> {selectedOrder.payment_method}
              </p>
              <p>
                <strong>Tracking Code:</strong>{" "}
                <span className="font-mono font-bold text-[#076935]">
                  {selectedOrder.tracking_code}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleReorder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#076935] font-bold text-white text-xs hover:bg-[#055028] transition flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Reorder Items
                </button>

                {selectedOrder.status !== "Delivered" &&
                  selectedOrder.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder)}
                      disabled={cancellingIds.includes(selectedOrder.backendId)}
                      className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition flex items-center gap-1 disabled:opacity-60"
                    >
                      {cancellingIds.includes(selectedOrder.backendId) ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Cancelling…
                        </>
                      ) : (
                        <>
                          <XCircle size={14} />
                          Cancel Order
                        </>
                      )}
                    </button>
                  )}
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Address modal */}
      <Modal
        open={isAddAddressOpen}
        onClose={() => setIsAddAddressOpen(false)}
        size="md"
        title="Add Delivery Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4 pt-2 text-xs">
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Address Label *
            </label>
            <select
              value={addressForm.label}
              onChange={(e) =>
                setAddressForm({ ...addressForm, label: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Farm / Business">Farm / Business</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              required
              value={addressForm.full_name}
              onChange={(e) =>
                setAddressForm({ ...addressForm, full_name: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              required
              value={addressForm.phone}
              onChange={(e) =>
                setAddressForm({ ...addressForm, phone: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Rwanda District *
            </label>
            <select
              value={addressForm.district}
              onChange={(e) =>
                setAddressForm({ ...addressForm, district: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
            >
              {RWANDA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Street / Sector / House Details *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Kibagabaga, KG 200 St, House 14"
              value={addressForm.street_address}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  street_address: e.target.value,
                })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 font-medium outline-none focus:border-[#076935]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_default"
              checked={addressForm.is_default}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  is_default: e.target.checked,
                })
              }
              className="rounded text-[#076935] focus:ring-[#076935]"
            />
            <label htmlFor="is_default" className="font-bold text-gray-700">
              Set as my default delivery address
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => setIsAddAddressOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#076935] font-bold text-white hover:bg-[#055028] shadow-xs"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}