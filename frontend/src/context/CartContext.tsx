import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartProduct {
  id: number | string;
  name: string;
  price: number;
  currency?: string;
  unit?: string;
  unit_name?: string;
  category?: string;
  image?: string;
  product_image?: string;
  inStock?: boolean;
  shelf_life?: number;
  description?: string;
  badge?: string;
  purchaseType?: 'retail' | 'wholesale';
  retail_min_qty?: number;
  wholesale_min_qty?: number;
  wholesale_price?: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kainafresh_cart_items';
const DEFAULT_DELIVERY_FEE = 0; // 1500 RWF standard delivery

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.debug('Failed saving cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product: CartProduct, quantity: number = 1) => {
    setCartItems((prev) => {
      // Same product added under a different purchase type (retail vs
      // wholesale) stays as its own line because price/step differ.
      const key = `${product.id}|${product.purchaseType ?? 'retail'}`;
      const existingIndex = prev.findIndex(
        (item) => `${item.product.id}|${item.product.purchaseType ?? 'retail'}` === key,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const minQtyFor = (product: CartProduct): number =>
    product.purchaseType === 'wholesale'
      ? (product.wholesale_min_qty ?? 1)
      : (product.retail_min_qty ?? 1);

  const removeFromCart = (productId: number | string) => {
    setCartItems((prev) => prev.filter((item) => String(item.product.id) !== String(productId)));
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (String(item.product.id) !== String(productId)) return item;
        const min = Math.max(1, minQtyFor(item.product));
        const snapped = Math.round(Math.floor(quantity) / min) * min;
        return {
          ...item,
          quantity: Math.max(min, snapped || min),
        };
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (Number(item.product.price) || 0) * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        cartCount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
