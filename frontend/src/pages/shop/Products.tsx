import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Leaf, PackageX } from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import Loader from "../../components/Loader/Loader";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useProductStore, type Product } from "../../store/useProductStore";
import productPlaceholder from "../../assets/images/placeholder.png";

const CURRENCY = "RWF";

export default function Products() {
  usePageTitle("products", "Products");
  const { products, loading, error, fetchProducts, resetError } =
    useProductStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const reset = () => {
    resetError();
    fetchProducts();
  };

  const visible = products.filter((p) => p.status === "active");
  const searched = visible.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero / page header */}
      <section className="bg-gradient-to-b from-brand-50 via-white to-white px-4 pb-14 pt-28 text-center sm:pt-32">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700">
            <Leaf size={14} /> Fresh From Our Farm
          </span>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Our Products
          </h1>
          <p className="mt-3 text-gray-500">
            Directly from the farm to your table. Handpicked, organic and
            freshly harvested.
          </p>

          <div className="relative mx-auto mt-8 max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-brand-100 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {loading ? (
          <Loader text="Loading products..." />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageX size={40} className="text-red-500" />
            <p className="mt-4 text-gray-700">{error}</p>
            <button
              onClick={reset}
              className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Try again
            </button>
          </div>
        ) : searched.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageX size={40} className="text-gray-300" />
            <p className="mt-4 text-gray-500">
              {query
                ? `No products match "${query}".`
                : "No products available yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {searched.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const unit = product.unit_symbol ?? product.unit_code ?? "";
  const unitName = product.unit_name ?? "Organic";
  const img = product.product_image ?? productPlaceholder;
  const navigate = useNavigate();

  const openProduct = () => navigate(`/shop/${product.id}`);

  return (
    <div
      onClick={openProduct}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-100 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand-600/90 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          Farm Fresh
        </span>
      </div>

      <div className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
          {unitName}
        </span>
        <h3 className="mt-1 line-clamp-2 text-base font-bold text-gray-900">
          {product.name}
        </h3>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="product-price">
            <strong className="text-lg font-extrabold text-brand-700">
              {CURRENCY} {Number(product.price).toLocaleString()}
            </strong>
            {unit && (
              <span className="ml-1 text-xs font-medium text-gray-400">
                / {unit}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openProduct();
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <ShoppingCart size={14} />
            Order
          </button>
        </div>
      </div>
    </div>
  );
}
