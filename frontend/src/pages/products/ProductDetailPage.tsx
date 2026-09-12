import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Leaf,
  ShoppingCart,
  Star,
  Store,
  Building2,
  Truck,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/Loader/Loader";
import QtyStepper from "../../components/products/QtyStepper";
import { apiGet } from "../../api/client";
import { useCart, type CartProduct, type PurchaseType } from "../../context/CartContext";
import { usePageTitle } from "../../hooks/usePageTitle";
import productPlaceholder from "../../assets/images/placeholder.png";

interface ApiUnit {
  id: number | string;
  name: string;
}

interface ApiProduct {
  id: number | string;
  name: string;
  price: number | string;
  description?: string;
  product_image?: string;
  image?: string;
  unit_id?: number | string;
  unit_name?: string;
  unit?: string;
  unit_code?: string;
  unit_symbol?: string;
  shelf_life?: number | string;
  status?: string;
  category?: string;
  wholesale_price?: number | string;
  wholesale_min_qty?: number | string;
  retail_min_qty?: number | string;
}

const DEFAULT_RETAIL_MIN_QTY = 1;
const DEFAULT_WHOLESALE_MIN_QTY = 1;

export default function ProductDetailPage() {
  usePageTitle("product", "Product Details");

  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<CartProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(
    "retail",
  );
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setError("Invalid product id.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Load units map for fallback unit naming
      const unitsMap: Record<string, string> = {};
      try {
        const unitsRes = await apiGet<{ success?: boolean; data?: ApiUnit[] }>(
          "/api/units",
        );
        const unitsList =
          unitsRes?.data ?? (Array.isArray(unitsRes) ? unitsRes : []);
        if (Array.isArray(unitsList)) {
          unitsList.forEach((u) => {
            unitsMap[String(u.id)] = u.name;
          });
        }
      } catch {
        // units are optional — fall back to unit_name / 'kg'
      }

      try {
        const res = await apiGet<{ success?: boolean; data?: ApiProduct }>(
          `/api/products/${id}`,
        );
        const item = res?.data ?? (Array.isArray(res) ? res[0] : null);

        if (!item) {
          setError("Product not found.");
          return;
        }

        const rawImg = item.product_image || item.image;
        const imgUrl = rawImg
          ? /^https?:\/\//.test(rawImg)
            ? rawImg
            : `${API_BASE}${rawImg.startsWith("/") ? rawImg : "/" + rawImg}`
          : productPlaceholder;

        const unitIdKey = item.unit_id ? String(item.unit_id) : "";
        const resolvedUnit =
          item.unit_name ||
          item.unit_symbol ||
          item.unit ||
          (unitIdKey ? unitsMap[unitIdKey] : "kg");

        const resolved: CartProduct = {
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: Number(item.price) || 0,
          unit: resolvedUnit || "kg",
          category: item.category || "Organic Produce",
          image: imgUrl,
          inStock: item.status !== "inactive",
          shelf_life: item.shelf_life ? Number(item.shelf_life) : undefined,
          wholesale_price:
            Number(item.wholesale_price) > 0
              ? Number(item.wholesale_price)
              : undefined,
          wholesale_min_qty:
            Number(item.wholesale_min_qty) > 0
              ? Number(item.wholesale_min_qty)
              : DEFAULT_WHOLESALE_MIN_QTY,
          retail_min_qty:
            Number(item.retail_min_qty) > 0
              ? Number(item.retail_min_qty)
              : DEFAULT_RETAIL_MIN_QTY,
        };

        if (!cancelled) {
          setProduct(resolved);
          setQuantity(
            resolved.wholesale_min_qty ?? DEFAULT_WHOLESALE_MIN_QTY,
          );
          setPurchaseType("wholesale");
        }
      } catch (err) {
        if (!cancelled) {
          console.debug("Failed loading product detail", err);
          setError("Failed to load this product. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, API_BASE]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price) || 0;
    if (purchaseType === "wholesale") {
      const ws = Number(product.wholesale_price) || 0;
      return ws > 0 ? ws : base;
    }
    return base;
  }, [product, purchaseType]);

  const minQty = useMemo(() => {
    if (!product) return 1;
    return purchaseType === "wholesale"
      ? (product.wholesale_min_qty ?? DEFAULT_WHOLESALE_MIN_QTY)
      : (product.retail_min_qty ?? DEFAULT_RETAIL_MIN_QTY);
  }, [product, purchaseType]);

  const lineTotal = useMemo(
    () => (product ? unitPrice * quantity : 0),
    [product, unitPrice, quantity],
  );

  const handleAddToCart = () => {
    if (!product) return;
    const qty = Math.max(minQty, Math.floor(quantity) || minQty);
    addToCart(
      {
        ...product,
        price: unitPrice,
        purchaseType,
      },
      qty,
      purchaseType,
    );
    setAddedToast(
      `Added ${qty} ${product.unit || "item"} of ${product.name} (${
        purchaseType === "wholesale" ? "Wholesale" : "Retail"
      })`,
    );
    setTimeout(() => setAddedToast(null), 3000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 overflow-x-hidden font-sans bg-[#FFFDF9] min-h-screen">
          <Loader text="Loading fresh organic product..." />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main
        className="pt-20 overflow-x-hidden font-sans bg-[#FFFDF9] min-h-screen"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {addedToast && (
          <div className="fixed bottom-6 right-6 bg-[#076935] text-white px-5 py-3.5 rounded-full flex items-center gap-2.5 font-bold text-sm z-[1100] shadow-xl animate-bounce">
            <ShoppingCart size={18} className="text-white" />
            <span>{addedToast}</span>
          </div>
        )}

        {error || !product ? (
          <section className="pt-14 px-6 md:px-[5%] pb-24">
            <div className="max-w-3xl mx-auto text-center bg-white rounded-3xl border border-[#076935]/10 p-12 shadow-xs">
              <Leaf size={48} className="mx-auto mb-4 text-[#076935]" />
              <h2
                className="text-2xl font-bold text-[#076935] mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {error ?? "Product not found."}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                The product you are looking for may have been removed or is
                unavailable.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-6 py-3 rounded-full font-bold text-sm transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <ArrowLeft size={16} /> Back to Products
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="pt-10 pb-16 px-6 md:px-[5%]">
              <div className="max-w-7xl mx-auto">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#076935] hover:text-[#F39927] transition-colors mb-6"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <ArrowLeft size={16} /> Back to Products Catalog
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  {/* ── Product Image ── */}
                  <div className="relative bg-[#f4faf7] rounded-3xl border border-[#076935]/10 p-8 lg:sticky lg:top-28 flex items-center justify-center min-h-[360px]">
                    <img
                      src={product.image || productPlaceholder}
                      alt={product.name}
                      className="w-full max-h-96 object-cover rounded-2xl"
                    />
                    <span
                      className="absolute top-5 left-5 bg-[#076935] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Leaf size={12} /> 100% Organic
                    </span>
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center font-bold text-sm text-gray-400 rounded-3xl">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* ── Product Info & Purchase ── */}
                  <div>
                    <span
                      className="text-xs font-bold uppercase tracking-wider text-[#F39927] block mb-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {product.category || "Organic Produce"}
                    </span>
                    <h1
                      className="text-3xl md:text-4xl font-bold text-[#076935] mb-3"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {product.name}
                    </h1>

                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex items-center gap-0.5 text-[#F39927]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        Premium quality farm produce
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {product.description ||
                        "Description not available for this product. Check back soon."}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-7 p-4 bg-[#f4faf7] rounded-xl text-xs text-gray-800">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-[#076935]" />
                        Shelf Life:{" "}
                        <strong>{product.shelf_life ?? 7} days</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Truck size={15} className="text-[#076935]" />
                        Delivery: <strong>Same Day / 24h</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-[#076935]" />
                        Quality: <strong>Guaranteed</strong>
                      </span>
                    </div>

                    {/* ── Retail / Wholesale selector ── */}
                    <div className="mb-6">
                      <span
                        className="block text-sm font-semibold text-gray-800 mb-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        Buy As:
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setPurchaseType("retail");
                            setQuantity(
                              product.retail_min_qty ?? DEFAULT_RETAIL_MIN_QTY,
                            );
                          }}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            purchaseType === "retail"
                              ? "border-[#076935] bg-[#f4faf7]"
                              : "border-gray-200 bg-white hover:border-[#076935]/40"
                          }`}
                        >
                          <Store
                            size={20}
                            className={`mt-0.5 ${purchaseType === "retail" ? "text-[#076935]" : "text-gray-400"}`}
                          />
                          <span>
                            <strong
                              className="block text-sm text-gray-800"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Retail
                            </strong>
                            <span className="text-xs text-gray-500">
                              Min.{" "}
                              {product.retail_min_qty ?? DEFAULT_RETAIL_MIN_QTY}{" "}
                              {product.unit || "unit"}(s)
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPurchaseType("wholesale");
                            setQuantity(
                              product.wholesale_min_qty ??
                                DEFAULT_WHOLESALE_MIN_QTY,
                            );
                          }}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                            purchaseType === "wholesale"
                              ? "border-[#F39927] bg-amber-50"
                              : "border-gray-200 bg-white hover:border-[#F39927]/40"
                          }`}
                        >
                          <Building2
                            size={20}
                            className={`mt-0.5 ${purchaseType === "wholesale" ? "text-[#F39927]" : "text-gray-400"}`}
                          />
                          <span>
                            <strong
                              className="block text-sm text-gray-800"
                              style={{ fontFamily: "var(--font-heading)" }}
                            >
                              Wholesale
                            </strong>
                            <span className="text-xs text-gray-500">
                              Bulk pricing · min.{" "}
                              {product.wholesale_min_qty ??
                                DEFAULT_WHOLESALE_MIN_QTY}{" "}
                              {product.unit || "unit"}(s)
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* ── Price ── */}
                    <div className="mb-6">
                      <span className="text-xs text-gray-500 block mb-1">
                        {purchaseType === "wholesale"
                          ? "Wholesale price"
                          : "Retail price"}{" "}
                        / {product.unit || "kg"}
                      </span>
                      <div className="flex items-end gap-3">
                        <strong
                          className="text-4xl font-bold text-[#076935]"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          RWF{" "}
                          {unitPrice.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                        {purchaseType === "wholesale" &&
                          Number(product.price) !== unitPrice && (
                            <span className="text-base font-semibold text-gray-400 line-through mb-1">
                              RWF{" "}
                              {(Number(product.price) || 0).toLocaleString()}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* ── Quantity selector ── */}
                    <div className="mb-7">
                      <div className="flex items-center justify-between mb-2">
                        <label
                          className="text-sm font-semibold text-gray-800"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          Quantity ({product.unit || "kg"}):
                        </label>
                        <span className="text-[11px] text-gray-400">
                          Min {minQty}
                        </span>
                      </div>
                      <QtyStepper
                        key={`${purchaseType}-${minQty}`}
                        value={quantity}
                        onChange={setQuantity}
                        min={minQty}
                        unit={product.unit || "kg"}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!product.inStock}
                      onClick={handleAddToCart}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3.5 px-6 rounded-full font-bold text-base transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <ShoppingCart size={18} />
                      {product.inStock
                        ? `Add ${quantity} ${product.unit || "item"} to Basket — RWF ${lineTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                        : "Out of Stock"}
                    </button>

                    <div className="flex flex-col gap-1.5 mt-6 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#076935]" />{" "}
                        100% Organic Quality Guarantee
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Truck size={14} className="text-[#076935]" /> 24-Hour
                        Cold Chain Fresh Delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
