import { useState } from "react";
import { X, AlertCircle, Loader2, KeyRound, UserRoundPen, Mail, Phone, User } from "lucide-react";
import { apiPost, apiPut } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "sonner";
import Modal from "../ui/Modal";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Reusable "My Profile" modal available on any authenticated page via the
 * header profile dropdown. Lets the logged-in user edit their own profile
 * details and optionally change their password.
 */
export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    current_password: "",
    new_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      if (profile.new_password) {
        if (profile.new_password.length < 8) {
          setError("New password must be at least 8 characters.");
          setSaving(false);
          return;
        }
        await apiPost(`/api/auth/change_password/${user.id}`, {
          current_password: profile.current_password,
          new_password: profile.new_password,
        });
        toast.success("Password updated successfully");
      }
      await apiPut(`/api/admin/users/update/${user.id}`, {
        username: profile.username.trim(),
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        phone_number: profile.phone_number.trim(),
        role: user.role || "admin",
      });
      setUser({
        ...user,
        username: profile.username.trim(),
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        phone_number: profile.phone_number.trim(),
      });
      toast.success("Profile updated successfully");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      size="lg"
      title={
        <div className="flex w-full items-center justify-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0f766e]">
            <UserRoundPen size={16} />
          </span>
          My Profile
        </div>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600">
              <User size={13} /> Username
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setField("username", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-600">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setField("full_name", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600">
              <Mail size={13} /> Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setField("email", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600">
              <Phone size={13} /> Phone Number
            </label>
            <input
              type="text"
              value={profile.phone_number}
              onChange={(e) => setField("phone_number", e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#0f766e]/20"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <KeyRound size={16} /> Change Password
          </p>
          <p className="mb-3 mt-0.5 text-xs text-amber-700">
            Optional — leave blank to keep your current password.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-amber-800">Current Password</label>
              <input
                type="password"
                value={profile.current_password}
                onChange={(e) => setField("current_password", e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-amber-800">New Password</label>
              <input
                type="password"
                value={profile.new_password}
                onChange={(e) => setField("new_password", e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
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
            {saving ? <Loader2 size={16} className="animate-spin" /> : <UserRoundPen size={16} />}
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
