import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Building2,
  UserCheck,
  UserX,
  Save,
  CheckCircle,
  Clock,
  MessageSquare,
} from "lucide-react";

export interface CustomerProfile {
  id: string | number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  district: string;
  address: string;
  segment: "retail" | "wholesale" | "vip";
  status: "active" | "inactive" | "suspended";
  total_orders: number;
  total_spent: number;
  last_order: string;
  preferred_payment: string;
  registered_at: string;
  notes?: string;
  username?: string;
}

interface CustomerDrawerProps {
  customer: CustomerProfile | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (id: string | number, newStatus: "active" | "suspended") => void;
  onSaveNotes?: (id: string | number, notes: string) => void;
}

export default function CustomerDrawer({
  customer,
  open,
  onClose,
  onStatusChange,
  onSaveNotes,
}: CustomerDrawerProps) {
  const [adminNotes, setAdminNotes] = useState(customer?.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  if (!open || !customer) return null;

  const handleSaveNotes = () => {
    setSavingNotes(true);
    setTimeout(() => {
      onSaveNotes?.(customer.id, adminNotes);
      setSavingNotes(false);
    }, 400);
  };

  const getSegmentBadge = (seg: CustomerProfile["segment"]) => {
    switch (seg) {
      case "wholesale":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            <Building2 size={12} /> B2B Wholesale
          </span>
        );
      case "vip":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
            VIP Subscriber
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
            Retail Buyer
          </span>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border-l dark:border-white/10 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-[#076935]/10 px-2.5 py-1 text-xs font-bold text-[#076935] dark:bg-green-500/20 dark:text-green-300">
                  Customer #{customer.id}
                </span>
                {customer.status === "active" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                    <CheckCircle size={12} /> Active Account
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                    <UserX size={12} /> Suspended
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-white/5 dark:bg-white/5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#076935] text-lg font-black text-white shadow-xs">
                {customer.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {customer.full_name}
                </h2>
                {customer.username && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{customer.username}
                  </p>
                )}
                <div className="mt-1.5">{getSegmentBadge(customer.segment)}</div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-gray-800">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ShoppingBag size={14} className="text-[#076935]" /> Total Orders
                </span>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {customer.total_orders || 0}{" "}
                  <span className="text-xs font-normal text-gray-400">orders</span>
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-gray-800">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CreditCard size={14} className="text-[#076935]" /> Lifetime Spend
                </span>
                <p className="mt-1 text-xl font-bold text-[#076935] dark:text-green-300">
                  {(customer.total_spent || 0).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-gray-400">RWF</span>
                </p>
              </div>
            </div>

            {/* Contact & Logistics Information */}
            <div className="mt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Contact & Logistics Details
              </h4>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone (MoMo / WhatsApp)</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300"
                >
                  WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {customer.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Primary Delivery Address</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {customer.district} · {customer.address || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-white/5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Preferred Payment Method</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {customer.preferred_payment || 'Cash on Delivery'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Timeline */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Account Timeline
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                  <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" /> Account Created
                  </span>
                  <span className="text-gray-400">{formatDate(customer.registered_at)}</span>
                </div>
                {customer.last_order && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-2.5 dark:bg-white/5">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" /> Last Order Date
                    </span>
                    <span className="text-gray-400">{formatDate(customer.last_order)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <MessageSquare size={14} /> Internal Sales Manager Notes
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1 text-xs font-bold text-[#076935] hover:underline"
                >
                  <Save size={12} /> {savingNotes ? "Saving..." : "Save Note"}
                </button>
              </div>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add private admin note (e.g., Prefers crate packaging, VIP buyer...)"
                className="w-full h-20 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-900 focus:border-[#076935] focus:outline-hidden dark:border-white/10 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/10 flex items-center gap-2">
            {customer.status === "active" ? (
              <button
                onClick={() => onStatusChange?.(customer.id, "suspended")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <UserX size={16} /> Suspend Account
              </button>
            ) : (
              <button
                onClick={() => onStatusChange?.(customer.id, "active")}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#076935] py-2.5 text-xs font-bold text-white hover:bg-[#055028] shadow-xs"
              >
                <UserCheck size={16} /> Activate Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}