import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  PackageX,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import CartLineItem from "../../components/cart/CartLineItem";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  useCartStore,
  selectCartCount,
  selectCartSubtotal,
} from "../../store/useCartStore";

export default function CartPage() {
  usePageTitle("cart", "Your Cart");
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clear } = useCartStore();

  const count = selectCartCount(items);
  const subtotal = selectCartSubtotal(items);

  return (
    <div className="min-h-screen bg-brand-25">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6">
        <button
          onClick={() => navigate("/shop")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          <ArrowLeft size={16} /> Continue shopping
        </button>

        <div className="mb-8 flex items-center gap-2">
          <ShoppingCart size={22} className="text-brand-700" />
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Your Cart
          </h1>
          <span className="ml-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
            {count} item{count === 1 ? "" : "s"}
          </span>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartLineItem
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={clear}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
                >
                  <Trash2 size={15} /> Clear cart
                </button>
              </div>
            </div>

            <OrderSummary
              subtotal={subtotal}
              onCheckout={() => navigate("/checkout")}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
        <PackageX size={30} className="text-brand-400" />
      </div>
      <h2 className="mt-5 text-lg font-bold text-gray-900">Your cart is empty</h2>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        Looks like you haven't added anything yet. Browse our fresh products to
        get started.
      </p>
      <Link
        to="/shop"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Browse products <ArrowRight size={16} />
      </Link>
    </div>
  );
}

interface OrderSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}

function OrderSummary({ subtotal, onCheckout }: OrderSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <dt>Subtotal</dt>
          <dd>RWF {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <dt>Delivery</dt>
          <dd className="text-brand-700">Free</dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
          <dt>Total</dt>
          <dd>RWF {subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>
        </div>
      </dl>
      <button
        onClick={onCheckout}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
      >
        Proceed to Checkout <ArrowRight size={16} />
      </button>
    </aside>
  );
}
