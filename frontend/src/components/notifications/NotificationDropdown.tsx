import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  ShoppingCart,
  Package,
  Users,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  useNotificationStore,
  type Notification,
  type NotificationCategory,
} from "../../store/useNotificationStore";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(category: NotificationCategory, type: string) {
  switch (category) {
    case "orders":
      return <ShoppingCart size={16} className="text-blue-600" />;
    case "stock":
      return <Package size={16} className="text-amber-600" />;
    case "hr":
      return <Users size={16} className="text-emerald-600" />;
    case "system":
    default:
      if (type === "warning" || type === "error") {
        return <AlertTriangle size={16} className="text-red-600" />;
      }
      return <ShieldCheck size={16} className="text-purple-600" />;
  }
}

function getPriorityBadge(priority: Notification["priority"]) {
  switch (priority) {
    case "urgent":
      return (
        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Urgent
        </span>
      );
    case "high":
      return (
        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          High
        </span>
      );
    case "medium":
      return (
        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Medium
        </span>
      );
    case "low":
    default:
      return null;
  }
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | NotificationCategory>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (item: Notification) => {
    if (!item.read) {
      markAsRead(item.id);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900 z-50 overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#076935]/10 px-2 py-0.5 text-[11px] font-bold text-[#076935] dark:bg-emerald-500/20 dark:text-emerald-400">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#076935] hover:text-[#055028] dark:text-emerald-400 dark:hover:text-emerald-300 transition"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 px-3 py-2 text-xs scrollbar-none dark:border-white/10">
            {(
              [
                { id: "all", label: "All" },
                { id: "orders", label: "Orders" },
                { id: "stock", label: "Inventory" },
                { id: "hr", label: "HR" },
                { id: "system", label: "System" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#076935] text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-2">
                  <Info size={20} />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  No notifications
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  You're all caught up in this category.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`group relative flex items-start gap-3 p-3.5 transition hover:bg-gray-50 dark:hover:bg-white/5 ${
                    !item.read
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 font-medium"
                      : ""
                  }`}
                >
                  {/* Category Icon */}
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 shadow-xs">
                    {getNotificationIcon(item.category, item.type)}
                  </div>

                  {/* Content Area */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(item)}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      {getPriorityBadge(item.priority)}
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      {item.actionLabel && (
                        <span className="inline-flex items-center gap-0.5 font-bold text-[#076935] dark:text-emerald-400 hover:underline">
                          {item.actionLabel} <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (Read/Delete) */}
                  <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        title="Mark as read"
                        className="p-1 rounded text-gray-400 hover:bg-emerald-100 hover:text-[#076935] dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 transition"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      title="Delete notification"
                      className="p-1 rounded text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Unread Status Dot Indicator */}
                  {!item.read && (
                    <span className="absolute top-3.5 right-2 h-2 w-2 rounded-full bg-[#076935] dark:bg-emerald-400 group-hover:hidden" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="border-t border-gray-100 p-2.5 text-center dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={() => {
                navigate("/notifications");
                setIsOpen(false);
              }}
              className="w-full rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5 transition"
            >
              View Notification Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
