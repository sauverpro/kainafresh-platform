import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  ImageOff,
  CalendarDays,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/Loader/Loader";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useProductStore } from "../../store/useProductStore";
import { useCartStore } from "../../store/useCartStore";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selected, loading, error, getProduct } = useProductStore();
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  usePageTitle("product", "Product Details");

  useEffect(() => {
    if (id) {
      getProduct(id);
      setQuantity(1);
    }
  }, [id, getProduct]);

  const product = selected;
  const unit = product?.unit_symbol ?? product?.unit_code ?? "";

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-brand-25">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6">
        <button
          onClick={() => navigate("/shop")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          <ArrowLeft size={16} /> Back to products
        </button>

        {loading ? (
          <Loader text="Loading product..." />
        ) : error || !product ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 text-center shadow-sm">
            <ImageOff size={40} className="text-gray-300" />
            <p className="mt-4 text-gray-600">{error ?? "Product not found."}</p>
            <Link
              to="/shop"
              className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              {product.product_image ? (
                <img
                  src={product.product_image}
                  alt={product.name}
                  className="h-full max-h-[480px] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-gray-100">
                  <ImageOff size={56} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Leaf size={13} /> Farm Fresh · Organic
              </span>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              <p className="mt-2 text-xs uppercase tracking-wider text-gray-400">
                {product.unit_name ?? "Organic"}
              </p>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-3xl font-extrabold text-brand-700">
                  RWF {Number(product.price).toLocaleString()}
                </span>
                {unit && (
                  <span className="mb-1 text-sm font-medium text-gray-400">
                    / {unit}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mt-5 leading-relaxed text-gray-600">
                  {product.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
                  <CalendarDays size={16} className="text-brand-600" />
                  <span className="text-gray-600">
                    Shelf life:{" "}
                    <strong className="text-gray-900">
                      {product.shelf_life} day(s)
                    </strong>
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
                  <Leaf size={16} className="text-brand-600" />
                  <span className="text-gray-600">
                    Unit:{" "}
                    <strong className="text-gray-900">
                      {product.unit_name ?? product.unit_code ?? "—"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-brand-700"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-base font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-brand-700"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
                >
                  <ShoppingCart size={17} /> Add to Cart
                </button>
              </div>

              <button
                onClick={() => navigate("/shop")}
                className="mt-4 w-fit text-sm font-semibold text-brand-700 transition hover:text-brand-800"
              >
                Continue shopping →
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
