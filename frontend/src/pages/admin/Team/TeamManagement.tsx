import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { apiGet, apiPost, apiDelete } from "../../../api/client";
import { toast } from "sonner";
import Modal from "../../../components/ui/Modal";
import TableSkeleton from "../../../components/ui/TableSkeleton";

interface TeamMember {
  id: number | string;
  name?: string;
  role?: string;
  phone_number?: string;
  email?: string;
}

interface TeamForm {
  name: string;
  role: string;
  phone_number: string;
  email: string;
}

const EMPTY_FORM: TeamForm = {
  name: "",
  role: "",
  phone_number: "",
  email: "",
};

function displayName(m: TeamMember): string {
  return m.name?.trim() || "Unnamed member";
}

export default function TeamManagement() {
  usePageTitle("team-management", "Team Management");

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState<TeamMember | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [form, setForm] = useState<TeamForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiGet<{ status: boolean; data: TeamMember[] }>(
        "/api/team",
      );
      setMembers(Array.isArray(res?.data) ? res.data : []);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [
        m.name,
        m.role,
        m.email,
        m.phone_number,
      ].some((v) => (v || "").toLowerCase().includes(q)),
    );
  }, [members, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({
      name: m.name || "",
      role: m.role || "",
      phone_number: m.phone_number || "",
      email: m.email || "",
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

  const setFormField = (field: keyof TeamForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.role.trim() ||
      !form.phone_number.trim() ||
      !form.email.trim()
    ) {
      setFormError("Please fill in name, role, phone and email.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim(),
      };
      if (editing) {
        await apiPost(`/api/team/edit/${editing.id}`, payload);
        toast.success(`Team member "${form.name}" updated successfully`);
      } else {
        await apiPost("/api/team/new", payload);
        toast.success(`Team member "${form.name}" added successfully`);
      }
      setFormOpen(false);
      setEditing(null);
      await loadTeam();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteSubmitting(true);
    try {
      await apiDelete(`/api/team/delete/${deleting.id}`);
      toast.success(`Team member "${displayName(deleting)}" deleted`);
      setDeleting(null);
      await loadTeam();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete member";
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const statsCards = [
    { label: "Total Members", value: members.length, icon: <Users size={22} className="text-[#076935]" />, accent: "bg-[#076935]/10" },
    { label: "Directors & Leads", value: members.filter((m) => /director|lead|founder|manager/i.test(m.role || "")).length, icon: <UserCog size={22} className="text-[#F39927]" />, accent: "bg-[#F39927]/10" },
    { label: "Support Roles", value: members.filter((m) => /support|it|officer|coordinator/i.test(m.role || "")).length, icon: <ShieldCheck size={22} className="text-emerald-700" />, accent: "bg-emerald-50" },
  ];

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>
            Team Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the team members displayed on the About (Our Farm) page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#055028]"
          >
            <Plus size={16} />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsCards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-[#076935]/10 bg-white p-4 transition hover:shadow-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.accent}`}>{card.icon}</div>
            <div>
              <p className="text-2xl font-bold leading-tight text-gray-900" style={{ fontFamily: "var(--font-heading)" }}>{card.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Could not load team members</p>
            <p className="text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={loadTeam}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <Loader2 size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="overflow-hidden rounded-3xl border border-[#076935]/10 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, role, email..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
            />
          </div>
          <span className="text-xs text-gray-500">{filtered.length} of {members.length} members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#076935]/10 bg-[#F4FAF7] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3" style={{ fontFamily: "var(--font-heading)" }}>Member</th>
                <th className="px-4 py-3" style={{ fontFamily: "var(--font-heading)" }}>Role</th>
                <th className="hidden px-4 py-3 md:table-cell" style={{ fontFamily: "var(--font-heading)" }}>Email</th>
                <th className="hidden px-4 py-3 lg:table-cell" style={{ fontFamily: "var(--font-heading)" }}>Phone</th>
                <th className="px-4 py-3 text-right" style={{ fontFamily: "var(--font-heading)" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <TableSkeleton columns={5} rows={5} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    <Users size={36} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-bold text-base text-gray-700 mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                      No team members found
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Try adjusting your search, or add a new team member.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-[#F4FAF7]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-800">{displayName(m)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#076935]/10 px-2.5 py-1 text-xs font-semibold text-[#076935] ring-1 ring-[#076935]/25">
                        {m.role || "—"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{m.email || "—"}</td>
                    <td className="hidden px-4 py-3 text-gray-600 lg:table-cell">{m.phone_number || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(m)}
                          aria-label="Edit member"
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#076935] transition hover:bg-[#076935]/10"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(m)}
                          aria-label="Delete member"
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {filtered.length} of {members.length} member{members.length === 1 ? "" : "s"}
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#076935]/10 text-[#076935]">
              {editing ? <Pencil size={16} /> : <Plus size={16} />}
            </span>
            {editing ? "Edit Team Member" : "Add Team Member"}
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
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setFormField("name", e.target.value)}
                placeholder="e.g. Jean-Pierre Uwimana"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setFormField("role", e.target.value)}
                placeholder="e.g. Founder & Farm Director"
                className={inputCls}
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
                placeholder="name@kainafresh.rw"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => setFormField("phone_number", e.target.value)}
                placeholder="+250 7xx xxx xxx"
                className={inputCls}
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
              <X size={16} /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#055028] disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : editing ? <Pencil size={16} /> : <Plus size={16} />}
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
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
            Delete Team Member
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-gray-600">
          Are you sure you want to delete member{" "}
          <strong className="text-gray-900">{deleting ? displayName(deleting) : ""}</strong>?
          This action cannot be undone.
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
            {deleteSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {deleteSubmitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>

    </div>
  );
}