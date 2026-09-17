import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Handshake,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  Upload,
  ImagePlus,
  ExternalLink,
  Leaf,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { apiGet, apiPostFormData, apiDelete } from "../../../api/client";
import { toast } from "sonner";
import Modal from "../../../components/ui/Modal";
import TableSkeleton from "../../../components/ui/TableSkeleton";
import MetricCard from "../../../components/ui/MetricCard";
import type { PartnerItem } from "../../../components/partners/PartnersSection";

interface PartnerForm {
  partner_name: string;
  partner_link: string;
}

const EMPTY_FORM: PartnerForm = { partner_name: "", partner_link: "" };

const API_BASE: string =
  import.meta.env.VITE_API_BASE_URL || window.location.origin;

function resolveLogo(logoPath?: string): string | null {
  if (!logoPath) return null;
  if (/^https?:\/\//.test(logoPath)) return logoPath;
  return `${API_BASE}${logoPath.startsWith("/") ? logoPath : "/" + logoPath}`;
}

export default function PartnerManagement() {
  usePageTitle("partners-management", "Partners Management");

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerItem | null>(null);
  const [deleting, setDeleting] = useState<PartnerItem | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiGet<{ status: boolean; data: PartnerItem[] }>(
        "/api/partners",
      );
      setPartners(Array.isArray(res?.data) ? res.data : []);
    } catch (err: unknown) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load partners",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) =>
      [p.partner_name || "", p.partner_link || ""].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [partners, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
    setFormOpen(true);
  };

  const openEdit = (p: PartnerItem) => {
    setEditing(p);
    setForm({
      partner_name: p.partner_name || "",
      partner_link: p.partner_link || "",
    });
    setFormError(null);
    setLogoFile(null);
    setLogoPreview(resolveLogo(p.partner_logo || p.logo));
    setRemoveLogo(false);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
  };

  const setFormField = (field: keyof PartnerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handlePickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setRemoveLogo(false);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.partner_name.trim()) {
      setFormError("Please fill in the partner name.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = new FormData();
      payload.append("partner_name", form.partner_name.trim());
      payload.append("partner_link", form.partner_link.trim());
      if (logoFile) {
        payload.append("partner_logo", logoFile);
      } else if (removeLogo) {
        payload.append("partner_logo", "");
      }
      if (editing) {
        await apiPostFormData(`/api/partners/edit/${editing.id}`, payload);
        toast.success(`Partner "${form.partner_name}" updated successfully`);
      } else {
        await apiPostFormData("/api/partners/new", payload);
        toast.success(`Partner "${form.partner_name}" added successfully`);
      }
      setFormOpen(false);
      setEditing(null);
      await loadPartners();
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
      await apiDelete(`/api/partners/delete/${deleting.id}`);
      toast.success(`Partner "${deleting.partner_name}" deleted`);
      setDeleting(null);
      await loadPartners();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete partner";
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const statsCards = [
    {
      label: "Total Partners",
      value: partners.length,
      icon: <Handshake size={22} className="text-[#076935]" />,
      accent: "bg-[#076935]/10",
    },
    // { label: "With Logo", value: partners.filter((p) => Boolean(p.partner_logo || p.logo)).length, icon: <ImagePlus size={22} className="text-[#F39927]" />, accent: "bg-[#F39927]/10" },
    // { label: "With Website Link", value: partners.filter((p) => Boolean(p.partner_link) && p.partner_link !== "#").length, icon: <ExternalLink size={22} className="text-emerald-700" />, accent: "bg-emerald-50" },
  ];

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20";

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Partners Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the partners shown in the partners sections across the site.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#076935] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#055028]"
          >
            <Plus size={16} />
            Add Partner
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label.toUpperCase()}
            value={card.value}
            subtext={card.value > 0 ? `Registered ${card.label.toLowerCase()}` : `No ${card.label.toLowerCase()} recorded`}
            icon={card.icon}
            iconBg={card.accent}
            badgeText="Verified Partner"
            badgeColor="bg-[#076935]/10 text-[#076935] border-[#076935]/20"
          />
        ))}
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Could not load partners</p>
            <p className="text-rose-600">{loadError}</p>
            <button
              type="button"
              onClick={loadPartners}
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
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, link..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#076935] focus:bg-white focus:ring-2 focus:ring-[#076935]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#076935]/10 bg-[#F4FAF7] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th
                  className="px-4 py-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Logo
                </th>
                <th
                  className="px-4 py-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Name
                </th>
                <th
                  className="hidden px-4 py-3 md:table-cell"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Website
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
                <TableSkeleton columns={4} rows={5} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-gray-500">
                    <Handshake
                      size={36}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p
                      className="font-bold text-base text-gray-700 mb-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      No partners found
                    </p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Try adjusting your search, or add a new partner.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const logoUrl = resolveLogo(p.partner_logo || p.logo);
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-[#F4FAF7]/50"
                    >
                      <td className="px-4 py-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={p.partner_name}
                            className="h-10 max-w-[120px] object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#076935]/10 text-[#076935]">
                            <Leaf size={18} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">
                          {p.partner_name || "—"}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                        {p.partner_link && p.partner_link !== "#" ? (
                          <span className="inline-flex items-center gap-1 text-sm text-[#076935]">
                            {p.partner_link} <ExternalLink size={12} />
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            aria-label="Edit partner"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#076935] transition hover:bg-[#076935]/10"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(p)}
                            aria-label="Delete partner"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing {filtered.length} of {partners.length} partner
            {partners.length === 1 ? "" : "s"}
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
            {editing ? "Edit Partner" : "Add Partner"}
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handlePickLogo}
          />

          {/* Logo uploader */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
              Partner Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-14 max-w-full object-contain"
                  />
                ) : (
                  <ImagePlus size={24} className="text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#076935]/30 bg-[#076935]/5 px-3 py-2 text-sm font-semibold text-[#076935] transition hover:bg-[#076935]/10"
                >
                  <Upload size={16} />
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </button>
                {(logoPreview || removeLogo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      setRemoveLogo(Boolean(editing));
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    <X size={14} />
                    Remove Logo
                  </button>
                )}
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Partner Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.partner_name}
                onChange={(e) => setFormField("partner_name", e.target.value)}
                placeholder="e.g. Musanze Organic Farmers Cooperative"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-600">
                Website Link
              </label>
              <input
                type="text"
                value={form.partner_link}
                onChange={(e) => setFormField("partner_link", e.target.value)}
                placeholder="https://example.com"
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
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : editing ? (
                <Pencil size={16} />
              ) : (
                <Plus size={16} />
              )}
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Partner"}
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
            Delete Partner
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-gray-600">
          Are you sure you want to delete partner{" "}
          <strong className="text-gray-900">
            {deleting ? deleting.partner_name : ""}
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
