import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  SlidersHorizontal,
  Settings,
  ShoppingCart,
  Package,
  Users,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Mail,
  Volume2,
  Smartphone,
  Plus,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { usePageTitle } from "../../../hooks/usePageTitle";
import MetricCard from "../../../components/ui/MetricCard";
import Modal from "../../../components/ui/Modal";
import { toast } from "sonner";
import {
  useNotificationStore,
  type Notification,
  type NotificationCategory,
} from "../../../store/useNotificationStore";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
}

function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case "orders":
      return <ShoppingCart size={18} className="text-blue-600" />;
    case "stock":
      return <Package size={18} className="text-amber-600" />;
    case "hr":
      return <Users size={18} className="text-emerald-600" />;
    case "system":
    default:
      return <ShieldCheck size={18} className="text-purple-600" />;
  }
}

function getPriorityBadge(priority: Notification["priority"]) {
  switch (priority) {
    case "urgent":
      return (
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">
          Urgent
        </span>
      );
    case "high":
      return (
        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
          High Priority
        </span>
      );
    case "medium":
      return (
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          Medium
        </span>
      );
    case "low":
    default:
      return (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          Low
        </span>
      );
  }
}

export default function NotificationsPage() {
  usePageTitle("notifications", "Notifications Center");
  const navigate = useNavigate();

  const {
    notifications,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    updatePreferences,
  } = useNotificationStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const priorityAlerts = notifications.filter(
      (n) => n.priority === "high" || n.priority === "urgent"
    ).length;
    const systemCount = notifications.filter((n) => n.category === "system").length;

    return { total, unread, priorityAlerts, systemCount };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus === "unread" && item.read) return false;
      if (selectedStatus === "read" && !item.read) return false;
      if (selectedPriority !== "all" && item.priority !== selectedPriority) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [notifications, selectedCategory, selectedStatus, selectedPriority, search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkRead = () => {
    selectedIds.forEach((id) => markAsRead(id));
    toast.success(`Marked ${selectedIds.length} notifications as read.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteNotification(id));
    toast.success(`Deleted ${selectedIds.length} notifications.`);
    setSelectedIds([]);
  };

  const handleCreateTestNotification = () => {
    addNotification({
      title: "Manual Test Alert",
      message: "This is a test notification generated from the Notification Center dashboard.",
      category: "system",
      type: "info",
      priority: "medium",
      actionUrl: "/settings",
      actionLabel: "View Settings",
    });
    toast.success("Test notification created!");
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Notification Center
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor activity alerts, orders, inventory warnings, and HR notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCreateTestNotification}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-white/10 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/5 transition"
          >
            <Plus size={15} /> Send Test Alert
          </button>

          <button
            type="button"
            onClick={() => setIsPrefModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#055028] transition"
          >
            <Settings size={15} /> Alert Preferences
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Notifications"
          value={stats.total}
          unit="alerts"
          subtext="All stored notifications"
          icon={<Bell size={22} className="text-[#076935]" />}
          iconBg="bg-[#076935]/10"
          badgeText="Total"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <MetricCard
          label="Unread Alerts"
          value={stats.unread}
          unit="unread"
          subtext="Requires attention"
          icon={<AlertTriangle size={22} className="text-orange-600" />}
          iconBg="bg-orange-50"
          badgeText="Pending"
          badgeColor="bg-orange-50 text-orange-700 border-orange-200"
        />

        <MetricCard
          label="Priority Items"
          value={stats.priorityAlerts}
          unit="urgent"
          subtext="High & urgent notifications"
          icon={<AlertTriangle size={22} className="text-red-600" />}
          iconBg="bg-red-50"
          badgeText="Priority"
          badgeColor="bg-red-50 text-red-700 border-red-200"
        />

        <MetricCard
          label="System Log Notices"
          value={stats.systemCount}
          unit="logs"
          subtext="Automated platform alerts"
          icon={<ShieldCheck size={22} className="text-purple-600" />}
          iconBg="bg-purple-50"
          badgeText="System"
          badgeColor="bg-purple-50 text-purple-700 border-purple-200"
        />
      </div>

      {/* Filters & Control Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications by keyword..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-2 text-xs text-gray-900 outline-none focus:border-[#076935] focus:bg-white dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter size={14} className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="all">All Categories</option>
                <option value="orders">Orders & Sales</option>
                <option value="stock">Inventory & Stock</option>
                <option value="hr">HR & Management</option>
                <option value="system">System & Security</option>
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">All Statuses</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 font-semibold text-gray-700 outline-none focus:border-[#076935] dark:border-white/10 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-3 dark:border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  filteredNotifications.length > 0 &&
                  selectedIds.length === filteredNotifications.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
              />
              Select All ({filteredNotifications.length})
            </label>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleBulkMarkRead}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-[#076935] hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 transition"
                >
                  <CheckCheck size={14} /> Mark Read ({selectedIds.length})
                </button>

                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 transition"
                >
                  <Trash2 size={14} /> Delete ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {stats.unread > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#076935] hover:underline dark:text-emerald-400"
              >
                <CheckCheck size={14} /> Mark All as Read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete all notifications?"
                    )
                  ) {
                    clearAll();
                    toast.success("All notifications cleared.");
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-600 transition"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Notification Cards List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-white/10 dark:bg-gray-900 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#076935] dark:bg-emerald-950/30 dark:text-emerald-400 mb-3">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No Notifications Found
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto dark:text-gray-400">
              There are no notifications matching your search filter or selected category.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start gap-4 rounded-2xl border p-4 transition shadow-xs hover:shadow-md ${
                !item.read
                  ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                  : "border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900"
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => handleToggleSelect(item.id)}
                className="mt-1 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
              />

              {/* Category Icon */}
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 shadow-xs">
                {getCategoryIcon(item.category)}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-[#076935] dark:bg-emerald-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <span className="text-xs font-mono font-medium text-gray-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  {item.message}
                </p>

                {/* Footer Link / Actions */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-3 text-xs">
                    {item.actionUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          markAsRead(item.id);
                          navigate(item.actionUrl!);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-[#076935] hover:underline dark:text-emerald-400"
                      >
                        {item.actionLabel || "View Details"} <ExternalLink size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => markAsRead(item.id)}
                      disabled={item.read}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-40 dark:hover:text-gray-300"
                    >
                      {item.read ? "Read" : "Mark Read"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteNotification(item.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Preferences Modal */}
      <Modal
        open={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        size="md"
        title="Notification Preferences"
      >
        <div className="space-y-5 text-xs">
          <p className="text-gray-500 dark:text-gray-400">
            Configure how you want to receive alerts and manage notification categories.
          </p>

          <div className="space-y-4 divide-y divide-gray-100 dark:divide-white/10">
            {/* Delivery Channels */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider dark:text-white text-[11px]">
                Delivery Channels
              </h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Email Summaries & Urgent Alerts
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Send urgent order and system notices to your registered email.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailAlerts}
                  onChange={(e) =>
                    updatePreferences({ emailAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-emerald-600" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      Push Notifications
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Browser push notifications for real-time order status updates.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) =>
                    updatePreferences({ pushNotifications: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 size={16} className="text-purple-600" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      In-App Sound Effects
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Play subtle audio tone when new notifications arrive.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.soundAlerts}
                  onChange={(e) =>
                    updatePreferences({ soundAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
                />
              </div>
            </div>

            {/* Category Preferences */}
            <div className="space-y-3 pt-4">
              <h4 className="font-bold text-gray-900 uppercase tracking-wider dark:text-white text-[11px]">
                Subscribed Categories
              </h4>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Order & Wholesale Updates
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    Alerts for new orders, invoices, and customer registrations.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.orderUpdates}
                  onChange={(e) =>
                    updatePreferences({ orderUpdates: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Inventory & Low Stock Warnings
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    Low stock thresholds and warehouse item movements.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inventoryAlerts}
                  onChange={(e) =>
                    updatePreferences({ inventoryAlerts: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    HR & Leave Management
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    Employee leave requests, payroll alerts, and performance reviews.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.hrNotifications}
                  onChange={(e) =>
                    updatePreferences({ hrNotifications: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-[#076935] focus:ring-[#076935]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                toast.success("Preferences saved successfully!");
                setIsPrefModalOpen(false);
              }}
              className="rounded-xl bg-[#076935] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#055028] transition"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
