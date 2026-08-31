import { create } from "zustand";
import type { Product } from "./useProductStore";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_KEY = "kainafresh_cart";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clear: () => void;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore storage errors */
  }
}

export const useCartStore = create<CartState>((set, get) => {
  const initial = loadCart();

  const update = (items: CartItem[]) => {
    persist(items);
    set({ items });
  };

  return {
    items: initial,

    addItem: (product, quantity = 1) => {
      const current = get().items;
      const existing = current.find(
        (i) => String(i.product.id) === String(product.id),
      );
      let next: CartItem[];
      if (existing) {
        next = current.map((i) =>
          String(i.product.id) === String(product.id)
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      } else {
        next = [...current, { product, quantity }];
      }
      update(next);
    },

    removeItem: (productId) => {
      update(
        get().items.filter((i) => String(i.product.id) !== String(productId)),
      );
    },

    updateQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        update(
          get().items.filter((i) => String(i.product.id) !== String(productId)),
        );
        return;
      }
      update(
        get().items.map((i) =>
          String(i.product.id) === String(productId) ? { ...i, quantity } : i,
        ),
      );
    },

    clear: () => update([]),
  };
});

// Derived-value selectors (kept as pure helpers to avoid storing derived state)
export const selectCartCount = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
