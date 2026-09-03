import type { UserProfile } from "../api/client";

export type UserRole = "admin" | "sales_manager" | "customer";

/**
 * Which sidebar nav item ids each role is allowed to see.
 * `admin` can access everything; `sales_manager` only inventory,
 * customers and sales.
 */
const NAV_ACCESS: Record<string, UserRole[]> = {
  dashboard: ["admin"],
  cms: ["admin"],
  settings: ["admin"],
  inventory: ["admin", "sales_manager"],
  customers: ["admin", "sales_manager"],
  sales: ["admin", "sales_manager"],
};

/** Default landing page for a role after login / when access is denied. */
export const DEFAULT_HOME: Record<UserRole, string> = {
  admin: "/dashboard",
  sales_manager: "/sales",
  customer: "/",
};

/** Normalize an arbitrary role string to a known UserRole (or "customer"). */
export function normalizeRole(role?: string): UserRole {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "admin";
    case "sales_manager":
    case "sales-manager":
    case "salesmanager":
      return "sales_manager";
    default:
      return "customer";
  }
}

/** Extract an authenticated role from a persisted user profile. */
export function roleOf(user?: UserProfile | null): UserRole {
  return normalizeRole(user?.role);
}

/** Whether a role may see a given sidebar nav item (by its id). */
export function canAccessNav(itemId: string, user?: UserProfile | null): boolean {
  const role = roleOf(user);
  if (role === "admin") return true;
  const allowed = NAV_ACCESS[itemId];
  return Boolean(allowed?.includes(role));
}

/**
 * Whether a role may visit a given pathname. Admin can access everything;
 * sales_manager only inventory, customers and sales pages.
 */
export function canAccessPath(pathname: string, user?: UserProfile | null): boolean {
  const role = roleOf(user);
  if (role === "admin") return true;
  if (role === "sales_manager") {
    return (
      pathname === "/sales" ||
      pathname.startsWith("/sales") ||
      pathname.startsWith("/admin/customers") ||
      pathname.startsWith("/admin/products") ||
      pathname.startsWith("/admin/orders") ||
      pathname.startsWith("/ecommerce/invoices") ||
      pathname.startsWith("/stock") ||
      pathname.startsWith("/inventory")
    );
  }
  // customers are not allowed into any part of the admin portal
  return false;
}
