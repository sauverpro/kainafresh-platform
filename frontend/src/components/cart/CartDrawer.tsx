import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import placeholderImg from '../../assets/images/placeholder.png';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartTotal,
    cartCount,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const resolveImage = (path?: string) => {
    if (!path) return placeholderImg;
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs z-[1000] flex justify-end transition-opacity duration-300"
      onClick={closeCart}
    >
      <div
        className="w-full max-w-[440px] h-full bg-[#FFFDF9] flex flex-col shadow-2xl font-sans transform transition-transform duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Shopping Basket"
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[#076935]/15 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#076935]/10 flex items-center justify-center">
              <ShoppingBag size={18} className="text-[#076935]" />
            </div>
            <h2 className="font-bold text-lg text-[#076935] m-0" style={{ fontFamily: 'var(--font-heading)' }}>
              Your Basket ({cartCount})
            </h2>
          </div>
          <button
            className="bg-transparent border-0 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            onClick={closeCart}
            aria-label="Close basket"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-full bg-[#076935]/10 flex items-center justify-center mb-6">
                <ShoppingBag size={48} className="text-[#076935]" />
              </div>
              <h3 className="text-xl font-bold text-[#076935] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Your basket is empty
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[300px] mb-6">
                Looks like you haven't added any fresh produce yet. Explore our farm selection today!
              </p>
              <button
                className="inline-flex items-center gap-2 bg-[#076935] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#055028] transition-all shadow-sm hover:scale-105 cursor-pointer"
                onClick={() => {
                  closeCart();
                  navigate('/products');
                }}
              >
                Browse Products <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cartItems.map(({ product, quantity }) => {
                const itemImg = resolveImage(product.image || product.product_image);
                const unitLabel = product.unit || product.unit_name || 'kg';
                const itemPrice = Number(product.price) || 0;

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border border-[#076935]/10 shadow-xs hover:border-[#076935]/25 transition-all"
                  >
                    <img src={itemImg} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-[#f4faf7] shrink-0" />

                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#F39927] block" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.category || 'Organic'}
                      </span>
                      <h4 className="font-semibold text-sm text-gray-800 truncate my-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 m-0">
                        <strong className="text-[#076935]">RWF {itemPrice.toLocaleString()}</strong> <span>/ {unitLabel}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5 bg-[#f4faf7] px-2 py-1 rounded-full border border-[#076935]/15">
                        <button
                          className="w-6 h-6 rounded-full border-0 bg-white text-[#076935] flex items-center justify-center hover:bg-[#076935] hover:text-white transition-colors cursor-pointer"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-xs min-w-[18px] text-center text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                          {quantity}
                        </span>
                        <button
                          className="w-6 h-6 rounded-full border-0 bg-white text-[#076935] flex items-center justify-center hover:bg-[#076935] hover:text-white transition-colors cursor-pointer"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="bg-transparent border-0 text-red-500 opacity-70 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        onClick={() => removeFromCart(product.id)}
                        aria-label="Remove item"
                        title="Remove from basket"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-[#076935]/15 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>RWF {cartSubtotal.toLocaleString()}</span>
              </div>
              {/* <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee (Kigali Metro)</span>
                <span>RWF {deliveryFee.toLocaleString()}</span>
              </div> */}
              <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-dashed border-gray-200">
                <span>Total</span>
                <strong className="text-xl text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                  RWF {cartTotal.toLocaleString()}
                </strong>
              </div>
            </div>

            <button
              className="w-full inline-flex items-center justify-center gap-2 bg-[#076935] text-white py-3.5 px-6 rounded-full font-bold text-base hover:bg-[#055028] transition-all shadow-md hover:shadow-lg cursor-pointer"
              onClick={handleCheckout}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <button
              className="bg-transparent border-0 text-gray-500 text-sm text-center hover:text-[#076935] cursor-pointer transition-colors"
              onClick={closeCart}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
