import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowRight,
  Package,
  User,
  Mail,
  ImageOff,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/Loader/Loader";
import { usePageTitle } from "../../hooks/usePageTitle";
import {
  fetchOrder,
  fetchOrderItems,
  type OrderSummary,
  type OrderLine,
} from "../../services/checkout";

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [items, setItems] = useState<OrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  usePageTitle("order", "Order Confirmation");

  useEffect(() => {
    let cancelled = false;
    if (!orderId) return;

    (async () => {
      try {
        const [orderRes, itemsRes] = await Promise.all([
          fetchOrder(orderId),
          fetchOrderItems(orderId),
        ]);
        if (cancelled) return;
        setOrder(orderRes);
        setItems(itemsRes);
      } catch (err: unknown) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Could not load your order.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="min-h-screen bg-brand-25">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6">
        {loading ? (
          <Loader text="Loading your order..." />
        ) : error ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-gray-600">{error}</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Continue shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : order ? (
          <>
            {/* Success banner */}
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
                <CheckCircle2 size={34} className="text-brand-600" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-gray-900">
                Thank you! Your order is confirmed.
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Order #{order.id} ·{" "}
                {new Date(order.order_date ?? Date.now()).toLocaleString()} ·{" "}
                <span className="font-semibold uppercase text-brand-700">
                  {order.status}
                </span>
              </p>

              {order.customer_first_name && (
                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <User size={14} />
                  {order.customer_first_name} {order.customer_last_name}
                  {order.customer_email && (
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <Mail size={13} /> {order.customer_email}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Package size={18} className="text-brand-600" /> Order items
              </h2>
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 py-4"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name ?? "Item"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <ImageOff size={18} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {item.product_name ?? `Product #${item.product_id}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        RWF {Number(item.unit_price).toLocaleString()} ×{" "}
                        {Number(item.quantity).toLocaleString()}{" "}
                        {item.unit_symbol ?? ""}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      RWF{" "}
                      {Number(item.subtotal).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>
                  RWF{" "}
                  {Number(order.total).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/shop")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Continue shopping <ArrowRight size={16} />
            </button>
          </>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
