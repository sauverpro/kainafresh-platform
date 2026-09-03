// CustomerList.tsx
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  ShoppingBag,
  Building2,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  UserX,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../api/client";
import { toast } from "sonner";
import Modal from "../../../components/ui/Modal";
import StatusDropdown, {
  type StatusOption,
} from "../../../components/ui/StatusDropdown";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";

/* ------------------------------------------------------------------------
 * Options
 * --------------------------------------------------------------------- */
const SEGMENT_OPTIONS: StatusOption[] = [
  { value: "retail", label: "Retail Buyer", dotClassName: "bg-blue-500" },
  { value: "wholesale", label: "B2B Wholesale", dotClassName: "bg-amber-500" },
  { value: "vip", label: "VIP Subscriber", dotClassName: "bg-purple-500" },
];

const STATUS_OPTIONS: StatusOption[] = [
  { value: "active", label: "Active", dotClassName: "bg-emerald-500" },
  { value: "inactive", label: "Inactive", dotClassName: "bg-rose-500" },
  { value: "suspended", label: "Suspended", dotClassName: "bg-gray-500" },
];

/* ------------------------------------------------------------------------
 * Types
 * --------------------------------------------------------------------- */
interface Customer {
  id: number | string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  // Extended fields (computed or from other tables)
  full_name?: string;
  district?: string;
  segment?: "retail" | "wholesale" | "vip";
  status?: "active" | "inactive" | "suspended";
  total_orders?: number;
  total_spent?: number;
  last_order?: string | null;
  preferred_payment?: string;
  notes?: string;
}

type SegmentKey = "retail" | "wholesale" | "vip";
type StatusKey = "active" | "inactive" | "suspended";

interface CustomerStats {
  total: number;
  retail: number;
  wholesale: number;
  vip: number;
  active: number;
  suspended: number;
}

const SEGMENT_LABELS: Record<SegmentKey, string> = {
  retail: "Retail Buyer",
  wholesale: "B2B Wholesale",
  vip: "VIP Subscriber",
};

const SEGMENT_KEYS: SegmentKey[] = ["retail", "wholesale", "vip"];

const SEGMENT_BADGE: Record<SegmentKey, string> = {
  retail: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  wholesale: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  vip: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
};

const STATUS_BADGE: Record<StatusKey, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  inactive: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  suspended: "bg-gray-50 text-gray-700 ring-1 ring-gray-200",
};

const SEGMENT_DOT: Record<SegmentKey, string> = {
  retail: "bg-blue-500",
  wholesale: "bg-amber-500",
  vip: "bg-purple-500",
};

/* ------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------- */
function normalizeSegmentKey(segment?: string): SegmentKey {
  const s = (segment || "retail").toLowerCase();
  if (s === "wholesale") return "wholesale";
  if (s === "vip") return "vip";
  return "retail";
}

function normalizeStatusKey(status?: string): StatusKey {
  const s = (status || "active").toLowerCase();
  if (s === "inactive") return "inactive";
  if (s === "suspended") return "suspended";
  return "active";
}

function extractDistrict(address: string | null): string {
  if (!address) return "Unknown";
  const districts = ["Gasabo", "Kicukiro", "Nyarugenge", "Musanze", "Bugesera", "Rubavu"];
  for (const district of districts) {
    if (address.toLowerCase().includes(district.toLowerCase())) {
      return district;
    }
  }
  return "Unknown";
}

function fullName(c: Customer): string {
  return `${c.first_name} ${c.last_name}`.trim() || "Unnamed Customer";
}

function computeStats(customers: Customer[]): CustomerStats {
  const stats: CustomerStats = {
    total: customers.length,
    retail: 0,
    wholesale: 0,
    vip: 0,
    active: 0,
    suspended: 0,
  };
  for (const c of customers) {
    const segment = normalizeSegmentKey(c.segment);
    if (segment === "retail") stats.retail++;
    else if (segment === "wholesale") stats.wholesale++;
    else stats.vip++;

    const status = normalizeStatusKey(c.status);
    if (status === "active") stats.active++;
    else if (status === "suspended") stats.suspended++;
  }
  return stats;
}

/* ------------------------------------------------------------------------
 * Small presentational component: stat card
 * --------------------------------------------------------------------- */
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#076935]/10 bg-white p-4 transition hover:shadow-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p
          className="text-2xl font-bold leading-tight text-gray-900"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {value}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
 * Main page
 * --------------------------------------------------------------------- */
export default function CustomerList() {
  usePageTitle("customers-management", "Manage Customers");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<SegmentKey | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
    district: "Kigali - Gasabo",
    segment: "retail" as string,
    status: "active" as string,
    preferred_payment: "MTN Mobile Money",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiGet<{ success: boolean; data: Customer[] }>(
        "/api/customers"
      );
      const data = Array.isArray(res?.data) ? res.data : [];
      
      // Transform data to include computed fields
      const transformedData = data.map((c) => ({
        ...c,
        full_name: fullName(c),
        district: extractDistrict(c.address),
        segment: normalizeSegmentKey(c.segment),
        status: normalizeStatusKey(c.status),
        total_orders: 0, // Would come from orders count
        total_spent: 0, // Would come from orders total
        last_order: null,
        preferred_payment: "Cash on Delivery",
        notes: "",
      }));
      
      setCustomers(transformedData);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const stats = useMemo(() => computeStats(customers), [customers]);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (segmentFilter !== "all" && normalizeSegmentKey(c.segment) !== segmentFilter)
        return false;
      if (statusFilter !== "all" && normalizeStatusKey(c.status) !== statusFilter)
        return false;
      if (!q) return true;
      return (
        (c.first_name || "").toLowerCase().includes(q) ||
        (c.last_name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q)
      );
    });
  }, [customers, search, segmentFilter, statusFilter]);

  // ----- Create / Edit -----
  const openCreate = () => {
    setEditing(null);
    setForm({
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
      district: "Kigali - Gasabo",
      segment: "retail",
      status: "active",
      preferred_payment: "MTN Mobile Money",
      notes: "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      first_name: c.first_name || "",
      last_name: c.last_name || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      district: c.district || "Kigali - Gasabo",
      segment: normalizeSegmentKey(c.segment),
      status: normalizeStatusKey(c.status),
      preferred_payment: c.preferred_payment || "MTN Mobile Money",
      notes: c.notes || "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const setFormField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim()) {
      setFormError("Please fill in first name, last name, and phone number.");
      return;
    }

    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setSaving(true);
    setFormError(null);
    
    try {
      const base = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: `${form.address.trim()}, ${form.district}`,
        segment: form.segment,
        status: form.status,
        preferred_payment: form.preferred_payment,
        notes: form.notes.trim() || null,
      };

      if (editing) {
        await apiPut(`/api/customers/update/${editing.id}`, base);
        toast.success(`Customer "${form.first_name} ${form.last_name}" updated successfully`);
      } else {
        await apiPost("/api/customers", base);
        toast.success(`Customer "${form.first_name} ${form.last_name}" created successfully`);
      }
      
      setFormOpen(false);
      setEditing(null);
      await loadCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ----- Delete -----
  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteSubmitting(true);
    try {
      await apiDelete(`/api/customers/delete/${deleting.id}`);
      toast.success(`Customer "${fullName(deleting)}" deleted`);
      setDeleting(null);
      await loadCustomers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete customer";
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ----- Status Change -----
  const handleStatusChange = async (id: string | number, newStatus: "active" | "inactive" | "suspended") => {
    try {
      await apiPut(`/api/customers/status/${id}`, { status: newStatus });
      toast.success(`Customer status updated to ${newStatus}`);
      await loadCustomers();
    } catch (error) {
      toast.error("Failed to update customer status");
    }
  };

  // Stat cards
  const statsCards: StatCardProps[] = [
    {
      label: "Total Customers",
      value: stats.total,
      icon: <Users size={22} className="text-[#076935]" />,
      accent: "bg-green-50",
    },
    {
      label: "Retail Buyers",
      value: stats.retail,
      icon: <ShoppingBag size={22} className="text-blue-600" />,
      accent: "bg-blue-50",
    },
    {
      label: "B2B Wholesale",
      value: stats.wholesale,
      icon: <Building2 size={22} className="text-amber-600" />,
      accent: "bg-amber-50",
    },
    {
      label: "VIP Subscribers",
      value: stats.vip,
      icon: <Users size={22} className="text-purple-600" />,
      accent: "bg-purple-50",
    },
  ];

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
      active
        ? "bg-[#076935] text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer accounts, segments, and order history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#055028]"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Could not load customers</p>
            <p className="text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={loadCustomers}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <Loader2 size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-3xl border border-[#076935]/10 bg-white">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {(["all", ...SEGMENT_KEYS] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSegmentFilter(s)}
                  className={filterBtn(segmentFilter === s)}
                >
                  {s === "all" ? "All" : SEGMENT_LABELS[s]}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusKey | "all")
              }
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 outline-none focus:border-[#076935]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#076935]/10 bg-[#F4FAF7] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3" style={{ fontFamily: "var(--font-heading)" }}>
                  Customer
                </th>
                <th className="hidden px-4 py-3 md:table-cell" style={{ fontFamily: "var(--font-heading)" }}>
                  Contact
                </th>
                <th className="px-4 py-3" style={{ fontFamily: "var(--font-heading)" }}>
                  Segment
                </th>
                <th className="hidden px-4 py-3 lg:table-cell" style={{ fontFamily: "var(--font-heading)" }}>
                  Location
                </th>
                <th className="hidden px-4 py-3 sm:table-cell" style={{ fontFamily: "var(--font-heading)" }}>
                  Orders
                </th>
                <th className="px-4 py-3" style={{ fontFamily: "var(--font-heading)" }}>
                  Status
                </th>
                <th className="px-4 py-3 text-right" style={{ fontFamily: "var(--font-heading)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <Loader2
                      size={32}
                      className="mx-auto mb-3 animate-spin text-[#076935]"
                    />
                    <p
                      className="font-bold text-base text-gray-700"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <Users size={36} className="mx-auto mb-3 text-gray-300" />
                    <p
                      className="font-bold text-base text-gray-700 mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      No customers found
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Try adjusting your search or filters, or add a new customer.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const segment = normalizeSegmentKey(c.segment);
                  const status = normalizeStatusKey(c.status);
                  return (
                    <tr
                      key={c.id}
                      className="transition-colors hover:bg-[#F4FAF7]/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#076935]/10 font-bold text-[#076935]">
                            {fullName(c).charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">
                              {fullName(c)}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {c.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone size={12} /> {c.phone}
                          </p>
                          {c.email && (
                            <p className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail size={12} /> {c.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${SEGMENT_BADGE[segment]}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${SEGMENT_DOT[segment]}`} />
                          {SEGMENT_LABELS[segment]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin size={12} className="text-gray-400" />
                          {c.district || "Unknown"}
                        </span>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">
                          {c.address || "—"}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="font-semibold text-gray-800">
                          {c.total_orders || 0}
                        </p>
                        <p className="text-xs text-[#076935]">
                          {c.total_spent ? `${c.total_spent.toLocaleString()} RWF` : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[status]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status === "active"
                                ? "bg-emerald-500"
                                : status === "suspended"
                                ? "bg-gray-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {status === "active"
                            ? "Active"
                            : status === "suspended"
                            ? "Suspended"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label="Actions"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#076935] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#076935]/40"
                              >
                                <MoreVertical size={17} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => setViewing(c)}
                                className="text-gray-700"
                              >
                                <Eye size={15} /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(c)}
                                className="text-gray-700"
                              >
                                <Pencil size={15} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {status === "active" ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(c.id, "suspended")}
                                  className="text-amber-600"
                                >
                                  <UserX size={15} /> Suspend
                                </DropdownMenuItem>
                              ) : status === "suspended" ? (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(c.id, "active")}
                                  className="text-emerald-600"
                                >
                                  <UserCheck size={15} /> Activate
                                </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleting(c)}
                                className="text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                              >
                                <Trash2 size={15} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filteredCustomers.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {filteredCustomers.length} of {customers.length} customer
            {customers.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {/* ---------- Create / Edit Modal ---------- */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        size="lg"
        title={
          <div className="flex w-full items-center justify-center gap-2.5 mx-auto">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#076935]">
              {editing ? <Pencil size={16} /> : <Plus size={16} />}
            </span>
            {editing ? "Edit Customer" : "Add New Customer"}
          </div>
        }
      >
        {formError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setFormField("first_name", e.target.value)}
                placeholder="e.g. Jean"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setFormField("last_name", e.target.value)}
                placeholder="e.g. Habimana"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setFormField("phone", e.target.value)}
                placeholder="+250 7xx xxx xxx"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setFormField("email", e.target.value)}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                District
              </label>
              <select
                value={form.district}
                onChange={(e) => setFormField("district", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              >
                <option value="Kigali - Gasabo">Kigali - Gasabo</option>
                <option value="Kigali - Kicukiro">Kigali - Kicukiro</option>
                <option value="Kigali - Nyarugenge">Kigali - Nyarugenge</option>
                <option value="Bugesera">Bugesera</option>
                <option value="Musanze">Musanze</option>
                <option value="Rubavu">Rubavu</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Street / House / Landmark
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setFormField("address", e.target.value)}
                placeholder="KG 123 St, House No. 4"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Customer Segment
              </label>
              <StatusDropdown
                value={form.segment}
                options={SEGMENT_OPTIONS}
                onChange={(v) => setFormField("segment", v)}
                ariaLabel="Select segment"
                align="start"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Status
              </label>
              <StatusDropdown
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(v) => setFormField("status", v)}
                ariaLabel="Select status"
                align="start"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Preferred Payment Method
              </label>
              <select
                value={form.preferred_payment}
                onChange={(e) => setFormField("preferred_payment", e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
              >
                <option value="MTN Mobile Money">MTN Mobile Money</option>
                <option value="Airtel Money">Airtel Money</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Bank Wire">Bank Wire</option>
                <option value="Corporate Invoice">Corporate Invoice</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Internal Notes              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setFormField("notes", e.target.value)}
                rows={3}
                placeholder="Add internal notes about this customer..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20 resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#055028] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : editing ? (
                <Pencil size={16} />
              ) : (
                <Plus size={16} />
              )}
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------- View Modal ---------- */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        size="md"
        title={
          <div className="flex flex-1 items-center justify-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#076935]">
              <Eye size={16} />
            </span>
            Customer Details
          </div>
        }
      >
        {viewing && (
          <div>
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#076935] text-lg font-bold text-white">
                {fullName(viewing).charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {fullName(viewing)}
                </p>
                <p className="text-sm text-gray-500">ID: {viewing.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Users size={14} /> Segment
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${SEGMENT_BADGE[normalizeSegmentKey(viewing.segment)]}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${SEGMENT_DOT[normalizeSegmentKey(viewing.segment)]}`}
                  />
                  {SEGMENT_LABELS[normalizeSegmentKey(viewing.segment)]}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Status
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[normalizeStatusKey(viewing.status)]}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      normalizeStatusKey(viewing.status) === "active"
                        ? "bg-emerald-500"
                        : normalizeStatusKey(viewing.status) === "suspended"
                        ? "bg-gray-500"
                        : "bg-rose-500"
                    }`}
                  />
                  {normalizeStatusKey(viewing.status) === "active"
                    ? "Active"
                    : normalizeStatusKey(viewing.status) === "suspended"
                    ? "Suspended"
                    : "Inactive"}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Phone size={14} /> Phone
                </p>
                <p className="mt-1.5 text-sm text-gray-800">{viewing.phone}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Mail size={14} /> Email
                </p>
                <p className="mt-1.5 text-sm text-gray-800">
                  {viewing.email || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:col-span-2">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <MapPin size={14} /> Address
                </p>
                <p className="mt-1.5 text-sm text-gray-800">
                  {viewing.district || "Unknown"} · {viewing.address || "—"}
                </p>
              </div>
              {viewing.notes && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Notes
                  </p>
                  <p className="mt-1.5 text-sm text-gray-800">{viewing.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setViewing(null);
                  openEdit(viewing);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#055028]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Delete Modal ---------- */}
      <Modal
        open={Boolean(deleting)}
        onClose={() => !deleteSubmitting && setDeleting(null)}
        size="sm"
        showCloseIcon={!deleteSubmitting}
        title={
          <div className="flex flex-1 items-center justify-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Trash2 size={16} />
            </span>
            Delete Customer
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-gray-600">
          Are you sure you want to delete customer{" "}
          <strong className="text-gray-900">
            {deleting ? fullName(deleting) : ""}
          </strong>
          ? This action cannot be undone.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleting(null)}
            disabled={deleteSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {deleteSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {deleteSubmitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}