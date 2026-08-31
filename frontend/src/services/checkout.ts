import { apiGet, apiPost, getToken, getCurrentUser } from "../api/client";
import { decodeJwt } from "../utils/jwt";
import type { CartItem } from "../store/useCartStore";

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface CustomerData {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface OrderLine {
  id: number | string;
  order_id: number | string;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_name?: string;
  product_image?: string | null;
  unit_code?: string;
  unit_name?: string;
  unit_symbol?: string;
}

export interface OrderSummary {
  id: number | string;
  user_id: number;
  customer_id?: number | null;
  order_date?: string;
  status?: string;
  total: number;
  order_source?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

const GUEST_MAP_KEY = "kainafresh_guest_users";

function loadGuestMap(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(GUEST_MAP_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveGuestMap(map: Record<string, number>) {
  try {
    localStorage.setItem(GUEST_MAP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/**
 * Resolve the user id to attach to an order.
 * - Logged-in user: decoded from the stored JWT.
 * - Guest: register a real user via /api/auth/register and cache the id by email.
 * Returns { userId, email }.
 */
export async function resolveOrderUserId(
  email: string,
  fullName: string,
  phone: string,
): Promise<{ userId: number; email: string }> {
  const token = getToken();
  const current = getCurrentUser();
  if (token) {
    const payload = decodeJwt(token);
    const userId = current?.id ?? payload?.user_id;
    if (userId) {
      return {
        userId: Number(userId),
        email: current?.email || payload?.email || email,
      };
    }
  }

  const normalizedEmail = email.trim().toLowerCase();
  const map = loadGuestMap();
  if (map[normalizedEmail]) {
    return { userId: map[normalizedEmail], email: normalizedEmail };
  }

  const baseName = normalizedEmail.split("@")[0].replace(/[^a-z0-9_.]/gi, "") || "guest";
  const username = `${baseName}_${Date.now().toString(36)}`;
  const password = `guest_${Math.random().toString(36).slice(2, 12)}`;

  try {
    const res = await apiPost<ApiResponse<{ user: { id: number } }>>(
      "/api/auth/register",
      {
        username,
        email: normalizedEmail,
        password,
        phone_number: phone,
        full_name: fullName.trim(),
      },
    );
    const id = Number(res.data?.user?.id);
    if (!id) throw new Error("Could not create account for this email.");
    map[normalizedEmail] = id;
    saveGuestMap(map);
    return { userId: id, email: normalizedEmail };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.toLowerCase().includes("email already exists")) {
      throw new Error(
        "An account already exists for this email. Please log in to continue with this email.",
      );
    }
    throw err;
  }
}

/**
 * Create a customer record (optional) and return its id, or null if skipped/failed.
 */
export async function createCustomer(
  data: CustomerData,
): Promise<number | null> {
  try {
    const res = await apiPost<ApiResponse<{ id: number }>>(
      "/api/customers",
      data,
    );
    return res.data?.id ? Number(res.data.id) : null;
  } catch {
    return null;
  }
}

/**
 * Create an order with its line items, given a resolved user id.
 * Returns the created order id.
 */
export async function createOrder(
  userId: number,
  subtotal: number,
  customerId: number | null,
  items: CartItem[],
): Promise<OrderSummary> {
  const total = Number(subtotal.toFixed(2));

  const res = await apiPost<ApiResponse<OrderSummary>>("/api/orders", {
    user_id: userId,
    total,
    customer_id: customerId ?? null,
    order_source: "ecommerce",
  });

  const order = res.data;
  if (!order?.id) {
    throw new Error(res.message || "Failed to create order");
  }

  for (const item of items) {
    await apiPost<ApiResponse<OrderLine>>(`/api/orders/${order.id}/items`, {
      product_id: Number(item.product.id),
      quantity: item.quantity,
    });
  }

  return order;
}

export async function fetchOrder(orderId: number | string): Promise<OrderSummary> {
  const res = await apiGet<ApiResponse<OrderSummary>>(`/api/orders/${orderId}`);
  if (!res.data) throw new Error("Order not found");
  return res.data;
}

export async function fetchOrderItems(
  orderId: number | string,
): Promise<OrderLine[]> {
  const res = await apiGet<ApiResponse<OrderLine[]>>(
    `/api/orders/${orderId}/items`,
  );
  return res.data ?? [];
}
