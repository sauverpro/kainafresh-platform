import { useState } from "react";
import {
  Search,
  Eye,
  Users,
  ShoppingBag,
  Building2,
  Banknote,
  SlidersHorizontal,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  UserX,
  UserCheck,
  RefreshCw,
  Plus,
} from "lucide-react";
import CustomerDrawer, { type CustomerProfile } from "../../../components/customers/CustomerDrawer";
import { toast } from "sonner";

// Initial Mock Dataset for Customer Management
const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "KF-C101",
    full_name: "Jean-Paul Habimana",
    username: "jhabimana",
    email: "jeanpaul@kigali.rw",
    phone: "+250 788 123 456",
    district: "Gasabo",
    address: "KG 14 Ave, Remera",
    segment: "retail",
    status: "active",
    total_orders: 14,
    total_spent: 185000,
    last_order: "2026-08-29",
    preferred_payment: "MTN Mobile Money",
    registered_at: "2026-04-12",
    notes: "Prefers organic Hass avocados packed in eco-friendly boxes.",
  },
  {
    id: "KF-C102",
    full_name: "Serena Hotel Kigali",
    username: "serena_procurement",
    email: "procurement@serenahotels.rw",
    phone: "+250 788 987 654",
    district: "Nyarugenge",
    address: "KN 3 Ave, Nyarugenge",
    segment: "wholesale",
    status: "active",
    total_orders: 42,
    total_spent: 1840000,
    last_order: "2026-08-31",
    preferred_payment: "Bank Wire / Corporate Invoice",
    registered_at: "2026-01-15",
    notes: "B2B Bulk order twice a week. Requires Grade A produce with phytosanitary Certificate.",
  },
  {
    id: "KF-C103",
    full_name: "Aline Murekatete",
    username: "aline_m",
    email: "aline.murekatete@gmail.com",
    phone: "+250 783 456 789",
    district: "Kicukiro",
    address: "KK 15 Rd, Niboye",
    segment: "vip",
    status: "active",
    total_orders: 28,
    total_spent: 420000,
    last_order: "2026-08-28",
    preferred_payment: "Airtel Money",
    registered_at: "2026-03-01",
    notes: "Weekly farm box subscriber. Delivery on Saturday mornings.",
  },
  {
    id: "KF-C104",
    full_name: "Simba Supermarket Gishushu",
    username: "simba_gishushu",
    email: "inventory@simbasupermarket.rw",
    phone: "+250 788 333 444",
    district: "Gasabo",
    address: "KG 7 Ave, Gishushu",
    segment: "wholesale",
    status: "active",
    total_orders: 56,
    total_spent: 3250000,
    last_order: "2026-08-30",
    preferred_payment: "Corporate Invoice",
    registered_at: "2025-11-20",
    notes: "Daily delivery of leafy greens & Irish potatoes at 6:00 AM.",
  },
  {
    id: "KF-C105",
    full_name: "Eric Ndayishimiye",
    username: "endayishimiye",
    email: "eric.n@yahoo.fr",
    phone: "+250 785 112 233",
    district: "Musanze",
    address: "Muhoza Sector, Plot 4",
    segment: "retail",
    status: "inactive",
    total_orders: 2,
    total_spent: 24000,
    last_order: "2026-06-10",
    preferred_payment: "Cash on Delivery",
    registered_at: "2026-05-18",
  },
  {
    id: "KF-C106",
    full_name: "Inyange Exporters Ltd",
    username: "inyange_exp",
    email: "exports@inyange.rw",
    phone: "+250 788 555 777",
    district: "Gasabo",
    address: "Free Zone Phase 1, Masoro",
    segment: "wholesale",
    status: "suspended",
    total_orders: 8,
    total_spent: 1200000,
    last_order: "2026-07-02",
    preferred_payment: "Bank Wire",
    registered_at: "2026-02-10",
    notes: "Account temporarily suspended pending audit reconciliation.",
  },
];

export default function CustomerList() {
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | "retail" | "wholesale" | "suspended">("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Bento Card Statistics
  const totalCustomers = customers.length;
  const activeRetail = customers.filter((c) => c.segment === "retail" || c.segment === "vip").length;
  const wholesaleCount = customers.filter((c) => c.segment === "wholesale").length;
  const totalRevenueLtv = customers.reduce((sum, c) => sum + c.total_spent, 0);

  // Unique Districts list for dropdown filter
  const uniqueDistricts = Array.from(new Set(customers.map((c) => c.district)));

  // Filtered Customers List
  const filteredCustomers = customers.filter((c) => {
    if (segmentFilter === "retail" && (c.segment !== "retail" && c.segment !== "vip")) return false;
    if (segmentFilter === "wholesale" && c.segment !== "wholesale") return false;
    if (segmentFilter === "suspended" && c.status !== "suspended") return false;

    if (districtFilter !== "all" && c.district !== districtFilter) return false;

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const matchName = c.full_name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchDistrict = c.district.toLowerCase().includes(q);
      const matchId = c.id.toString().toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchDistrict && !matchId) return false;
    }
    return true;
  });

  const handleStatusChange = (id: string | number, newStatus: "active" | "suspended") => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.success(`Customer ${id} status updated to ${newStatus}`);
  };

  const handleSaveNotes = (id: string | number, notes: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes } : c))
    );
    toast.success("Customer internal note saved.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View customer accounts, retail buyers, wholesale B2B partners, and order history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Customer list refreshed")}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => toast.info("Create customer modal triggered")}
            className="flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs transition-all"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* 1. Bento Summary Cards — 100% Homogeneous with StatCard.tsx */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Customers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
            <Users className="h-5.5 w-5.5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {totalCustomers}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              Registered Accounts
            </span>
          </div>
        </div>

        {/* Card 2: Retail Shoppers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#076935]/10 text-[#076935] dark:bg-green-500/15 dark:text-green-300">
            <ShoppingBag className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Retail & VIP Buyers</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {activeRetail}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              Individual Accounts
            </span>
          </div>
        </div>

        {/* Card 3: B2B Wholesale Partners */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Building2 className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">B2B Wholesale Partners</p>
              <p className="mt-1.5 text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {wholesaleCount}
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              Corporate Accounts
            </span>
          </div>
        </div>

        {/* Card 4: Total Customer Spend (LTV) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400">
            <Banknote className="h-5.5 w-5.5" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Customer Revenue</p>
              <p className="mt-1.5 text-2xl font-semibold text-gray-800 dark:text-white">
                {(totalRevenueLtv / 1000000).toFixed(2)}M <span className="text-xs font-normal text-gray-400">RWF</span>
              </p>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
              Cumulative LTV
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900 shadow-xs">
        {/* Segment Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-gray-100/80 rounded-xl dark:bg-white/5">
          <button
            onClick={() => setSegmentFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "all"
                ? "bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setSegmentFilter("retail")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "retail"
                ? "bg-white text-[#076935] shadow-xs dark:bg-gray-800 dark:text-green-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Retail Buyers ({activeRetail})
          </button>
          <button
            onClick={() => setSegmentFilter("wholesale")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "wholesale"
                ? "bg-white text-amber-600 shadow-xs dark:bg-gray-800 dark:text-amber-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            B2B Wholesale ({wholesaleCount})
          </button>
          <button
            onClick={() => setSegmentFilter("suspended")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              segmentFilter === "suspended"
                ? "bg-white text-red-600 shadow-xs dark:bg-gray-800 dark:text-red-400"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
            }`}
          >
            Suspended ({customers.filter((c) => c.status === "suspended").length})
          </button>
        </div>

        {/* Search & District Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer name, email, phone, district..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3.5 py-2 text-xs text-gray-900 focus:border-[#076935] focus:bg-white focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white dark:focus:border-[#076935]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">All Districts</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Customer Data Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-white/10 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider dark:bg-white/5 dark:border-white/10 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">ID</th>
                <th className="px-5 py-3.5 font-semibold">Customer Name</th>
                <th className="px-5 py-3.5 font-semibold">Contact Info</th>
                <th className="px-5 py-3.5 font-semibold">Segment</th>
                <th className="px-5 py-3.5 font-semibold">District & Location</th>
                <th className="px-5 py-3.5 font-semibold">Orders & LTV</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium">No customers found</p>
                      <p className="text-xs text-gray-400">Try clearing search or changing segment filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {/* ID */}
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      {customer.id}
                    </td>

                    {/* Customer Avatar & Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#076935]/10 font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                          {customer.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {customer.full_name}
                          </p>
                          <p className="text-[11px] text-gray-400">@{customer.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-5 py-4 space-y-1">
                      <p className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                        <Phone size={12} className="text-gray-400" /> {customer.phone}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Mail size={12} className="text-gray-400" /> {customer.email}
                      </p>
                    </td>

                    {/* Segment Badge */}
                    <td className="px-5 py-4">
                      {customer.segment === "wholesale" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          <Building2 size={12} /> B2B Wholesale
                        </span>
                      ) : customer.segment === "vip" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                          VIP Subscriber
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          Retail Buyer
                        </span>
                      )}
                    </td>

                    {/* District */}
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-gray-400" />
                        {customer.district}
                      </span>
                      <span className="text-[11px] text-gray-400 block truncate max-w-[140px]">
                        {customer.address}
                      </span>
                    </td>

                    {/* Orders & LTV Spend */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {customer.total_orders} <span className="font-normal text-gray-400">orders</span>
                      </p>
                      <p className="text-[11px] font-bold text-[#076935] dark:text-green-300">
                        {customer.total_spent.toLocaleString()} RWF
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {customer.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                          <UserX size={12} /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td
                      className="px-5 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
                          title="View Profile Drawer"
                        >
                          <Eye size={16} />
                        </button>
                        {customer.status === "active" ? (
                          <button
                            onClick={() => handleStatusChange(customer.id, "suspended")}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-white/10"
                            title="Suspend Account"
                          >
                            <UserX size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(customer.id, "active")}
                            className="rounded-lg p-1.5 text-[#076935] hover:bg-green-50 dark:hover:bg-white/10"
                            title="Activate Account"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Customer Detail Drawer */}
      <CustomerDrawer
        open={Boolean(selectedCustomer)}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onStatusChange={handleStatusChange}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}
