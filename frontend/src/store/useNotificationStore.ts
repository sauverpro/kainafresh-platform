import { create } from "zustand";

export type NotificationCategory = "orders" | "stock" | "hr" | "system";
export type NotificationType = "info" | "success" | "warning" | "error" | "order" | "stock" | "hr" | "system";
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string; // ISO or relative timestamp
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  soundAlerts: boolean;
  orderUpdates: boolean;
  inventoryAlerts: boolean;
  hrNotifications: boolean;
  systemAnnouncements: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailAlerts: true,
  pushNotifications: true,
  soundAlerts: false,
  orderUpdates: true,
  inventoryAlerts: true,
  hrNotifications: true,
  systemAnnouncements: true,
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-101",
    title: "New Wholesale Order Received",
    message: "Order #KF-9482 from Kigali Serena Hotel for 250kg fresh produce requires processing.",
    category: "orders",
    type: "order",
    priority: "high",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actionUrl: "/admin/orders",
    actionLabel: "View Order",
  },
  {
    id: "notif-102",
    title: "Low Inventory Warning: Hass Avocados",
    message: "Stock level for Hass Avocados (Grade A) dropped below 50kg threshold in Central Warehouse.",
    category: "stock",
    type: "stock",
    priority: "urgent",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actionUrl: "/stock",
    actionLabel: "Check Stock",
  },
  {
    id: "notif-103",
    title: "Leave Application Pending",
    message: "Eric Manzi submitted an annual leave request (5 days) starting Oct 1st.",
    category: "hr",
    type: "hr",
    priority: "medium",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    actionUrl: "/admin/hr/leave",
    actionLabel: "Review Request",
  },
  {
    id: "notif-104",
    title: "Monthly Payroll Processed",
    message: "September 2026 payroll calculation and bank disbursement schedules generated successfully.",
    category: "hr",
    type: "success",
    priority: "medium",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    actionUrl: "/admin/hr/payroll",
    actionLabel: "View Payroll",
  },
  {
    id: "notif-105",
    title: "System Backup & Maintenance",
    message: "Scheduled platform optimization and database index rebalancing completed without downtime.",
    category: "system",
    type: "system",
    priority: "low",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    actionUrl: "/settings",
    actionLabel: "System Status",
  },
  {
    id: "notif-106",
    title: "New Corporate Client Registered",
    message: "Inyange Foods Ltd created a wholesale account and submitted verification documents.",
    category: "orders",
    type: "info",
    priority: "low",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actionUrl: "/admin/customers",
    actionLabel: "View Customer",
  },
];

function loadSavedPreferences(): NotificationPreferences {
  try {
    const saved = localStorage.getItem("kainafresh_notification_prefs");
    if (saved) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to parse notification preferences", e);
  }
  return DEFAULT_PREFERENCES;
}

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreferences;
  filterCategory: string;
  filterStatus: string;
  
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<Notification, "id" | "createdAt" | "read">) => void;
  setFilterCategory: (category: string) => void;
  setFilterStatus: (status: string) => void;
  updatePreferences: (partial: Partial<NotificationPreferences>) => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  preferences: loadSavedPreferences(),
  filterCategory: "all",
  filterStatus: "all",

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  deleteNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  addNotification: (item) => {
    const newNotif: Notification = {
      ...item,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),

  updatePreferences: (partial) => {
    set((state) => {
      const updated = { ...state.preferences, ...partial };
      try {
        localStorage.setItem(
          "kainafresh_notification_prefs",
          JSON.stringify(updated)
        );
      } catch (e) {
        console.error("Failed to save notification preferences", e);
      }
      return { preferences: updated };
    });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
