import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  UserCog,
  ShoppingBag,
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
  EyeOff,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
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
const ROLE_OPTIONS: StatusOption[] = [
  { value: "admin", label: "Admin", dotClassName: "bg-indigo-500" },
  {
    value: "sales_manager",
    label: "Sales Manager",
    dotClassName: "bg-sky-500",
  },
  { value: "customer", label: "Customer", dotClassName: "bg-amber-500" },
];

const STATUS_OPTIONS: StatusOption[] = [
  { value: "active", label: "Active", dotClassName: "bg-emerald-500" },
  { value: "inactive", label: "Inactive", dotClassName: "bg-rose-500" },
];

/* ------------------------------------------------------------------------
 * Types
 * --------------------------------------------------------------------- */
interface ManagedUser {
  id: number | string;
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
  status?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

type RoleKey = "admin" | "sales_manager" | "customer";
type StatusKey = "active" | "inactive";

interface UserStats {
  total: number;
  admin: number;
  salesManager: number;
  customer: number;
}

const ROLE_LABELS: Record<RoleKey, string> = {
  admin: "Admin",
  sales_manager: "Sales Manager",
  customer: "Customer",
};

const ROLE_KEYS: RoleKey[] = ["admin", "sales_manager", "customer"];

const ROLE_BADGE: Record<RoleKey, string> = {
  admin: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  sales_manager: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  customer: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

const STATUS_BADGE: Record<StatusKey, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  inactive: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

const ROLE_DOT: Record<RoleKey, string> = {
  admin: "bg-indigo-500",
  sales_manager: "bg-sky-500",
  customer: "bg-amber-500",
};

/* ------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------- */
function normalizeRoleKey(role?: string): RoleKey {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "sales_manager" || r === "sales-manager" || r === "salesmanager")
    return "sales_manager";
  return "customer";
}

function normalizeStatusKey(status?: string): StatusKey {
  return (status || "").toLowerCase() === "inactive" ? "inactive" : "active";
}

function initialsOf(u: ManagedUser): string {
  const name = u.full_name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() || "U";
  }
  return (u.username || "U").slice(0, 2).toUpperCase();
}

function displayName(u: ManagedUser): string {
  return u.full_name?.trim() || u.username || "Unnamed User";
}

function computeStats(users: ManagedUser[]): UserStats {
  const stats: UserStats = {
    total: users.length,
    admin: 0,
    salesManager: 0,
    customer: 0,
  };
  for (const u of users) {
    const role = normalizeRoleKey(u.role);
    if (role === "admin") stats.admin++;
    else if (role === "sales_manager") stats.salesManager++;
    else stats.customer++;
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
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
      >
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
export default function UserManagement() {
  usePageTitle("users-management", "Manage Users");

  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleKey | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");

  // modals
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [viewing, setViewing] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState<ManagedUser | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // form state
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    phone_number: "",
    role: "sales_manager" as string,
    status: "active" as string,
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiGet<{ success: boolean; data: ManagedUser[] }>(
        "/api/admin/users",
      );
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => computeStats(users), [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && normalizeRoleKey(u.role) !== roleFilter)
        return false;
      if (
        statusFilter !== "all" &&
        normalizeStatusKey(u.status) !== statusFilter
      )
        return false;
      if (!q) return true;
      return (
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone_number || "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  // ----- create / edit -----
  const openCreate = () => {
    setEditing(null);
    setForm({
      username: "",
      full_name: "",
      email: "",
      phone_number: "",
      role: "sales_manager",
      status: "active",
      password: "",
    });
    setFormError(null);
    setShowPassword(false);
    setFormOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setForm({
      username: u.username || "",
      full_name: u.full_name || "",
      email: u.email || "",
      phone_number: u.phone_number || "",
      role: normalizeRoleKey(u.role),
      status: normalizeStatusKey(u.status),
      password: "",
    });
    setFormError(null);
    setShowPassword(false);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
    setShowPassword(false);
  };

  const setFormField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.email.trim() || !form.full_name.trim()) {
      setFormError("Please fill in username, full name and email.");
      return;
    }
    if (!editing && form.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const base = {
        username: form.username.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        role: form.role,
      };
      if (editing) {
        await apiPut(`/api/admin/users/update/${editing.id}`, base);
        toast.success(`User "${form.username}" updated successfully`);
      } else {
        await apiPost("/api/admin/users/new", {
          ...base,
          password: form.password,
        });
        toast.success(`User "${form.username}" created successfully`);
      }
      setFormOpen(false);
      setEditing(null);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ----- delete -----
  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteSubmitting(true);
    try {
      if (String(deleting.id) === String(currentUser?.id)) {
        toast.error("You cannot delete your own account.");
        setDeleting(null);
        return;
      }
      await apiDelete(`/api/admin/users/delete/${deleting.id}`);
      toast.success(`User "${displayName(deleting)}" deleted`);
      setDeleting(null);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user";
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const statsCards: StatCardProps[] = [
    {
      label: "Total Users",
      value: stats.total,
      icon: <Users size={22} className="text-[#0f766e]" />,
      accent: "bg-teal-50",
    },
    {
      label: "Admins",
      value: stats.admin,
      icon: <ShieldCheck size={22} className="text-indigo-600" />,
      accent: "bg-indigo-50",
    },
    {
      label: "Sales Managers",
      value: stats.salesManager,
      icon: <UserCog size={22} className="text-sky-600" />,
      accent: "bg-sky-50",
    },
    {
      label: "Customers",
      value: stats.customer,
      icon: <ShoppingBag size={22} className="text-amber-600" />,
      accent: "bg-amber-50",
    },
  ];

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
      active
        ? "bg-[#0f766e] text-white shadow-sm"
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
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage system users and their roles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115e59]"
          >
            <Plus size={16} />
            Add User
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
            <p className="font-bold">Could not load users</p>
            <p className="text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={loadUsers}
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
              placeholder="Search name, username, email..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {(["all", ...ROLE_KEYS] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={filterBtn(roleFilter === r)}
                >
                  {r === "all" ? "All" : ROLE_LABELS[r]}
                </button>
              ))}
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusKey | "all")
              }
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 outline-none focus:border-[#0f766e]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#076935]/10 bg-[#F4FAF7] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th
                  className="px-4 py-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  User
                </th>
                <th
                  className="px-4 py-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Username
                </th>
                <th
                  className="hidden px-4 py-3 md:table-cell"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Email
                </th>
                <th
                  className="hidden px-4 py-3 lg:table-cell"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Phone
                </th>
                <th
                  className="px-4 py-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Role
                </th>
                <th
                  className="hidden px-4 py-3 sm:table-cell"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Status
                </th>
                <th
                  className="px-4 py-3 text-right"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
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
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <Users size={36} className="mx-auto mb-3 text-gray-300" />
                    <p
                      className="font-bold text-base text-gray-700 mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      No users found
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Try adjusting your search or filters, or add a new user.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const role = normalizeRoleKey(u.role);
                  const status = normalizeStatusKey(u.status);
                  const isSelf = String(u.id) === String(currentUser?.id);
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-[#F4FAF7]/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">
                              {displayName(u)}
                              {isSelf && (
                                <span className="ml-2 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.username || "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                        {u.email || "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">
                        {u.phone_number || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE[role]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${ROLE_DOT[role]}`}
                          />
                          {ROLE_LABELS[role]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[status]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
                          />
                          {status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label="Actions"
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#0f766e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f766e]/40"
                              >
                                <MoreVertical size={17} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => setViewing(u)}
                                className="text-gray-700"
                              >
                                <Eye size={15} /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEdit(u)}
                                className="text-gray-700"
                              >
                                <Pencil size={15} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleting(u)}
                                disabled={isSelf}
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
        {!loading && filteredUsers.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {filteredUsers.length} of {users.length} user
            {users.length === 1 ? "" : "s"}
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0f766e]">
              {editing ? <Pencil size={16} /> : <Plus size={16} />}
            </span>
            {editing ? "Edit User" : "Add New User"}
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
                Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setFormField("username", e.target.value)}
                placeholder="e.g. jdoe"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setFormField("full_name", e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setFormField("email", e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Phone Number
              </label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => setFormField("phone_number", e.target.value)}
                placeholder="+250 7xx xxx xxx"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Role <span className="text-rose-500">*</span>
              </label>
              <StatusDropdown
                value={form.role}
                options={ROLE_OPTIONS}
                onChange={(v) => setFormField("role", v)}
                ariaLabel="Select role"
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
           {!editing && <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                {editing ? "Password" : "Password"}{" "}
                {!editing && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setFormField("password", e.target.value)}
                  placeholder={
                    editing
                      ? "Leave blank to keep current password"
                      : "At least 8 characters"
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-3 pr-11 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-400 transition hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {editing && (
                <p className="text-xs text-gray-400">
                  Leave blank to keep the current password unchanged.
                </p>
              )}
            </div>}
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#115e59] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : editing ? (
                <Pencil size={16} />
              ) : (
                <Plus size={16} />
              )}
              {saving ? "Saving..." : editing ? "Save Changes" : "Create User"}
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0f766e]">
              <Eye size={16} />
            </span>
            User Details
          </div>
        }
      >
        {viewing && (
          <div>
            <div className="mb-5 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#115e59] text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {initialsOf(viewing)}
              </div>
              <div>
                <p
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {displayName(viewing)}
                </p>
                <p className="text-sm text-gray-500">
                  @{viewing.username || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <UserCog size={14} /> Role
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_BADGE[normalizeRoleKey(viewing.role)]}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${ROLE_DOT[normalizeRoleKey(viewing.role)]}`}
                  />
                  {ROLE_LABELS[normalizeRoleKey(viewing.role)]}
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
                    className={`h-1.5 w-1.5 rounded-full ${normalizeStatusKey(viewing.status) === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  {normalizeStatusKey(viewing.status) === "active"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Mail size={14} /> Email
                </p>
                <p className="mt-1.5 text-sm text-gray-800">
                  {viewing.email || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Phone size={14} /> Phone
                </p>
                <p className="mt-1.5 text-sm text-gray-800">
                  {viewing.phone_number || "—"}
                </p>
              </div>
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Delete Modal (inline, Tailwind) ---------- */}
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
            Delete User
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-gray-600">
          Are you sure you want to delete user{" "}
          <strong className="text-gray-900">
            {deleting ? displayName(deleting) : ""}
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
