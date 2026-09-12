import React, { createContext, useContext, useState, useEffect } from 'react';

export type PurchaseType = 'retail' | 'wholesale';

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
  purchaseType?: PurchaseType;
  retail_min_qty?: number;
  wholesale_min_qty?: number;
  wholesale_price?: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
  purchaseType: PurchaseType; 
  segment: PurchaseType;         
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: CartProduct,
    quantity?: number,
    segment?: PurchaseType,      
  ) => void;
  removeFromCart: (productId: number | string, purchaseType?: PurchaseType) => void;
  updateQuantity: (product: CartProduct, quantity: number, purchaseType?: PurchaseType) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
 orderSegment: PurchaseType;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'kainafresh_cart_items';
const DEFAULT_DELIVERY_FEE = 0;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as CartItem[];
      // Migrate old items that don't have segment/purchaseType
      return parsed.map((item) => {
        const pt = item.purchaseType ?? item.segment ?? item.product.purchaseType ?? 'retail';
        return {
          ...item,
          purchaseType: pt,
          segment: pt,
          product: { ...item.product, purchaseType: pt },
        };
      });
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

  const minQtyFor = (product: CartProduct, segment: PurchaseType): number =>
    segment === 'wholesale'
      ? (product.wholesale_min_qty ?? 1)
      : (product.retail_min_qty ?? 1);

  const clampToMin = (value: number, product: CartProduct, segment: PurchaseType): number => {
    const min = Math.max(1, minQtyFor(product, segment));
    return Math.max(min, Math.floor(value));
  };

  const addToCart = (
    product: CartProduct,
    quantity: number = 1,
    segment?: PurchaseType,
  ) => {
    // Resolve segment: explicit arg > product.purchaseType > 'retail'
    const resolvedSegment: PurchaseType =
      segment ?? product.purchaseType ?? 'retail';

    const clamped = clampToMin(quantity, product, resolvedSegment);

    // Normalize the product with the chosen segment baked in
    const normalizedProduct: CartProduct = {
      ...product,
      purchaseType: resolvedSegment,
    };

    setCartItems((prev) => {
      const key = `${product.id}|${resolvedSegment}`;
      const existingIndex = prev.findIndex(
        (item) =>
          `${item.product.id}|${item.purchaseType ?? 'retail'}` === key,
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: clampToMin(
            updated[existingIndex].quantity + clamped,
            updated[existingIndex].product,
            resolvedSegment,
          ),
          // ensure fields stay in sync
          purchaseType: resolvedSegment,
          segment: resolvedSegment,
          product: {
            ...updated[existingIndex].product,
            purchaseType: resolvedSegment,
          },
        };
        return updated;
      }

      return [
        ...prev,
        {
          product: normalizedProduct,
          quantity: clamped,
          purchaseType: resolvedSegment,
          segment: resolvedSegment,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (
    productId: number | string,
    purchaseType?: PurchaseType,
  ) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        if (String(item.product.id) !== String(productId)) return true;
        if (purchaseType && item.purchaseType !== purchaseType) return true;
        return false;
      }),
    );
  };

  const updateQuantity = (
    product: CartProduct,
    quantity: number,
    purchaseType?: PurchaseType,
  ) => {
    if (quantity < 1) return;
    const segment: PurchaseType =
      purchaseType ?? product.purchaseType ?? 'retail';
    const key = `${product.id}|${segment}`;

    setCartItems((prev) =>
      prev.map((item) => {
        if (`${item.product.id}|${item.purchaseType ?? 'retail'}` !== key) {
          return item;
        }
        return {
          ...item,
          quantity: clampToMin(quantity, item.product, segment),
        };
      }),
    );
  };

  const clearCart = () => setCartItems([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.product.price) || 0) * item.quantity,
    0,
  );
  const deliveryFee = cartItems.length > 0 ? DEFAULT_DELIVERY_FEE : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  /**
   * Aggregate order segment:
   * - If ALL items are wholesale → 'wholesale'
   * - If ALL items are retail     → 'retail'
   * - If mixed                    → 'wholesale' (or 'mixed' if you extend type)
   */
  const orderSegment: PurchaseType = React.useMemo(() => {
    if (cartItems.length === 0) return 'retail';
    const hasWholesale = cartItems.some((i) => i.purchaseType === 'wholesale');
    const hasRetail = cartItems.some((i) => i.purchaseType === 'retail');
    if (hasWholesale && !hasRetail) return 'wholesale';
    if (hasRetail && !hasWholesale) return 'retail';
    return 'wholesale'; // mixed — default to wholesale
  }, [cartItems]);

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
        orderSegment,
       
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