import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Eye, Leaf, Check, X, Clock, SlidersHorizontal } from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import Loader from '../../components/Loader/Loader';
import ProductSkeleton from '../../components/ui/ProductSkeleton';
import { apiGet } from '../../api/client';
import { useCart, type CartProduct } from '../../context/CartContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import productPlaceholder from '../../assets/images/placeholder.png';

interface ApiProduct {
  id: number | string;
  name: string;
  price: number | string;
  currency?: string;
  unit_name?: string;
  unit?: string;
  unit_id?: number | string;
  category?: string;
  product_image?: string;
  image?: string;
  shelf_life?: number | string;
  status?: string;
  badge?: string;
  description?: string;
}

// Curated fallback produce items if database is empty or seeding is needed
const FALLBACK_PRODUCTS: CartProduct[] = [
  {
    id: 1,
    name: 'Fresh Organic Green Beans',
    category: 'Vegetables',
    price: 1200,
    unit: 'kg',
    currency: 'RWF',
    inStock: true,
    shelf_life: 7,
    image: productPlaceholder,
  },
  {
    id: 2,
    name: 'Hass Organic Avocados',
    category: 'Fruits',
    price: 800,
    unit: 'piece',
    currency: 'RWF',
    inStock: true,
    shelf_life: 10,
    image: productPlaceholder,
  },
  {
    id: 3,
    name: 'Fresh Farm Tomatoes',
    category: 'Vegetables',
    price: 1500,
    unit: 'kg',
    currency: 'RWF',
    inStock: true,
    shelf_life: 6,
    image: productPlaceholder,
  },
  {
    id: 4,
    name: 'Red Sweet Potatoes',
    category: 'Root Crops',
    price: 900,
    unit: 'kg',
    currency: 'RWF',
    inStock: true,
    shelf_life: 14,
    image: productPlaceholder,
  },
  {
    id: 5,
    name: 'Fresh Mountain Spinach',
    category: 'Leafy Greens',
    price: 600,
    unit: 'bunch',
    currency: 'RWF',
    inStock: true,
    shelf_life: 4,
    image: productPlaceholder,
  },
  {
    id: 6,
    name: 'Sweet Passion Fruit',
    category: 'Fruits',
    price: 400,
    unit: 'piece',
    currency: 'RWF',
    inStock: true,
    shelf_life: 12,
    image: productPlaceholder,
  },
  {
    id: 7,
    name: 'Crisp Carrots',
    category: 'Root Crops',
    price: 1100,
    unit: 'kg',
    currency: 'RWF',
    inStock: true,
    shelf_life: 14,
    image: productPlaceholder,
  },
  {
    id: 8,
    name: 'Fresh Garlic Cloves',
    category: 'Spices & Herbs',
    price: 2500,
    unit: 'kg',
    currency: 'RWF',
    inStock: true,
    shelf_life: 30,
    image: productPlaceholder,
  },
];

interface HeroSectionContent {
  tag?: string;
  heading?: string;
  subheading?: string;
}

interface ApiUnit {
  id: number | string;
  name: string;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export default function OurProducts() {
  usePageTitle('products', 'Our Products');

  const { addToCart } = useCart();

  const [products, setProducts] = useState<CartProduct[]>([]);
  const [cmsHero, setCmsHero] = useState<HeroSectionContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Quick View Modal state
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // 1. Fetch CMS Hero section from MariaDB (/api/pages/slug/products)
      try {
        const pageRes = await apiGet<{ success?: boolean; data?: { sections?: { type: string; content: HeroSectionContent }[] } }>('/api/pages/slug/products');
        const sections = pageRes?.data?.sections ?? [];
        const heroSection = sections.find(s => s.type === 'hero' || s.type === 'products-hero' || s.type === 'contact-hero');
        if (!cancelled && heroSection?.content) {
          setCmsHero(heroSection.content);
        }
      } catch (err) {
        console.debug('Failed loading CMS products page data', err);
      }

      // 2. Fetch units map from MariaDB (/api/units)
      const unitsMap: Record<string, string> = {};
      try {
        const unitsRes = await apiGet<{ success?: boolean; data?: ApiUnit[] }>('/api/units');
        const unitsList = unitsRes?.data ?? (Array.isArray(unitsRes) ? unitsRes : []);
        if (Array.isArray(unitsList)) {
          unitsList.forEach(u => {
            unitsMap[String(u.id)] = u.name;
          });
        }
      } catch (err) {
        console.debug('Failed loading units from DB', err);
      }

      // 3. Fetch products from MariaDB (/api/products)
      try {
        const res = await apiGet<{ success?: boolean; data?: ApiProduct[] }>('/api/products');
        const list = res?.data ?? (Array.isArray(res) ? res : []);

        if (!cancelled) {
          if (Array.isArray(list) && list.length > 0) {
            const mapped: CartProduct[] = list.map((item) => {
              const rawImg = item.product_image || item.image;
              const imgUrl = rawImg
                ? /^https?:\/\//.test(rawImg)
                  ? rawImg
                  : `${API_BASE}${rawImg.startsWith('/') ? rawImg : '/' + rawImg}`
                : productPlaceholder;

              const unitIdKey = item.unit_id ? String(item.unit_id) : '';
              const resolvedUnit = item.unit_name || item.unit || (unitIdKey ? unitsMap[unitIdKey] : 'kg');

              return {
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: Number(item.price) || 1000,
                unit: resolvedUnit || 'kg',
                category: item.category || 'Organic Produce',
                image: imgUrl,
                inStock: item.status !== 'inactive',
                shelf_life: item.shelf_life ? Number(item.shelf_life) : undefined,
              };
            });
            setProducts(mapped);
          } else {
            setProducts(FALLBACK_PRODUCTS);
          }
        }
      } catch (err) {
        console.debug('Failed to fetch products from backend, using fallback', err);
        if (!cancelled) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  // Dynamic category extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All Products', ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted products calculation
  const filteredProducts = useMemo(() => {
    const result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All Products' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesStock = !inStockOnly || p.inStock;

      return matchesSearch && matchesCategory && matchesStock;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, selectedCategory, inStockOnly, sortBy]);

  const handleAddToCart = (product: CartProduct, qty: number = 1) => {
    addToCart(product, qty);
    setAddedToast(`Added ${qty} ${product.unit || 'item'} of ${product.name} to basket`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const openQuickView = (product: CartProduct) => {
    setSelectedProduct(product);
    setModalQuantity(1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 overflow-x-hidden font-sans bg-[#FFFDF9] min-h-screen">
          <Loader text="Loading fresh organic products from database..." />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-20 overflow-x-hidden font-sans bg-[#FFFDF9] min-h-screen" style={{ fontFamily: 'var(--font-body)' }}>
        {/* Added Toast Notification */}
        {addedToast && (
          <div className="fixed bottom-6 right-6 bg-[#076935] text-white px-5 py-3.5 rounded-full flex items-center gap-2.5 font-bold text-sm z-[1100] shadow-xl animate-bounce">
            <Check size={18} className="text-white" />
            <span>{addedToast}</span>
          </div>
        )}

        {/* ── Top Search Header Section ── */}
        <section className="bg-white border-b border-gray-200 pt-8 pb-6">
          <div className="max-w-7xl mx-auto px-6">
            {/* ── Prominent Search Bar ── */}
            <div className="max-w-3xl mx-auto my-2">
              {cmsHero?.subheading && (
                <p className="text-center text-gray-500 text-sm mb-3">
                  {cmsHero.subheading}
                </p>
              )}
              <form
                onSubmit={(e) => e.preventDefault()}
                className="relative flex items-center bg-white rounded-full border-2 border-[#076935] p-1.5 shadow-md hover:shadow-lg transition-all focus-within:ring-4 focus-within:ring-[#076935]/15"
              >
                <input
                  type="text"
                  placeholder="Search products, organic produce, or categories (e.g. avocados, spinach)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2.5 pl-6 pr-28 bg-transparent text-gray-800 text-sm md:text-base focus:outline-none font-sans"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-28 text-gray-400 hover:text-gray-600 p-1 cursor-pointer border-0 bg-transparent"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#076935] hover:bg-[#055028] text-white px-7 py-3 rounded-full font-bold text-sm md:text-base transition-colors shrink-0 cursor-pointer shadow-sm ml-auto"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <Search size={18} /> Search
                </button>
              </form>
            </div>

            {/* Category Pills & Sort Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pt-2">
              {/* Horizontal Category Pills */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar flex-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#076935] text-white shadow-xs font-bold'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#076935] hover:text-[#076935]'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal size={15} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-gray-200 text-gray-700 text-xs md:text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#076935] cursor-pointer"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── Products Grid Content Area ── */}
        <section className="py-10 px-6 md:px-[5%] pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Results Count & Reset */}
            <div className="flex justify-between items-center mb-6 px-2 text-sm text-gray-500">
              <span>
                Showing <strong className="text-[#076935]">{filteredProducts.length}</strong> organic produce items
              </span>
              {(search || selectedCategory !== 'All Products' || inStockOnly || sortBy !== 'featured') && (
                <button
                  className="bg-transparent border-0 text-[#F39927] font-semibold text-xs hover:underline cursor-pointer"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All Products');
                    setInStockOnly(false);
                    setSortBy('featured');
                  }}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <ProductSkeleton count={8} />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#076935]/10 shadow-xs">
                <Leaf size={48} className="mx-auto mb-4 text-[#076935]" />
                <h3 className="text-xl font-bold text-[#076935] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  No produce found
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  We couldn't find any produce matching your filters. Try adjusting your search query or selecting another category.
                </p>
                <button
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-[#076935] text-[#076935] px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#076935] hover:text-white transition-all cursor-pointer"
                  onClick={() => {
                    setSearch('');
                    setSelectedCategory('All Products');
                    setInStockOnly(false);
                    setSortBy('featured');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white rounded-3xl border border-[#076935]/10 overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-xl hover:border-[#076935]/25 transition-all duration-300"
                  >
                    <div className="relative h-56 bg-[#f4faf7] overflow-hidden">
                      <img
                        src={product.image || productPlaceholder}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-[#076935] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs" style={{ fontFamily: 'var(--font-heading)' }}>
                        <Leaf size={11} /> Organic
                      </span>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center font-bold text-sm text-gray-400">
                          Out of Stock
                        </div>
                      )}
                      <button
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 bg-white text-[#076935] px-4 py-2 rounded-full text-xs font-bold shadow-md hover:bg-[#076935] hover:text-white transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5"
                        onClick={() => openQuickView(product)}
                        title="Quick View"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        <Eye size={16} /> Quick View
                      </button>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#F39927] mb-1 block" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.category || 'Produce'}
                      </span>
                      <h3 className="font-bold text-base text-gray-800 mb-1.5 line-clamp-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.name}
                      </h3>

                      {product.shelf_life && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                          <Clock size={12} /> Shelf Life: {product.shelf_life} days
                        </span>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                        <div>
                          <strong className="font-bold text-base text-[#076935] block leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                            RWF {(Number(product.price) || 0).toLocaleString()}
                          </strong>
                          <span className="text-xs text-gray-500">/ {product.unit || 'kg'}</span>
                        </div>

                        <button
                          className="inline-flex items-center gap-1.5 bg-[#076935] hover:bg-[#055028] text-white text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          disabled={!product.inStock}
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart size={15} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Quick View Modal ── */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1100] flex items-center justify-center p-6" onClick={() => setSelectedProduct(null)}>
            <div className="relative bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-700 transition-colors z-10 cursor-pointer border-0"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative bg-[#f4faf7] p-8 flex items-center justify-center">
                  <img
                    src={selectedProduct.image || productPlaceholder}
                    alt={selectedProduct.name}
                    className="w-full max-h-72 object-cover rounded-2xl"
                  />
                  <span className="absolute bottom-4 left-4 bg-[#076935] text-white text-xs font-bold px-3 py-1 rounded-full" style={{ fontFamily: 'var(--font-heading)' }}>
                    100% Organic Certified
                  </span>
                </div>

                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F39927] mb-1 block" style={{ fontFamily: 'var(--font-heading)' }}>
                      {selectedProduct.category}
                    </span>
                    <h2 className="text-2xl font-bold text-[#076935] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                      {selectedProduct.name}
                    </h2>

                    <div className="mb-4">
                      <strong className="text-2xl font-bold text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                        RWF {(Number(selectedProduct.price) || 0).toLocaleString()}
                      </strong>
                      <span className="text-gray-500 text-sm"> / {selectedProduct.unit || 'kg'}</span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {selectedProduct.description || 'Description not available.'}
                    </p>

                    <div className="flex gap-4 mb-6 p-3.5 bg-[#f4faf7] rounded-xl text-xs text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-[#076935]" />
                        <span>Shelf Life: <strong>{selectedProduct.shelf_life || 7} days</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Leaf size={16} className="text-[#076935]" />
                        <span>Delivery: <strong>Same Day / 24h</strong></span>
                      </div>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center justify-between mb-6">
                      <label className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'var(--font-heading)' }}>
                        Quantity ({selectedProduct.unit || 'kg'}):
                      </label>
                      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
                        <button
                          className="w-7 h-7 rounded-full border-0 bg-white font-bold cursor-pointer hover:bg-[#076935] hover:text-white transition-colors"
                          onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        >
                          -
                        </button>
                        <span className="font-bold text-sm min-w-[24px] text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                          {modalQuantity}
                        </span>
                        <button
                          className="w-7 h-7 rounded-full border-0 bg-white font-bold cursor-pointer hover:bg-[#076935] hover:text-white transition-colors"
                          onClick={() => setModalQuantity(modalQuantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#076935] hover:bg-[#055028] text-white py-3 px-6 rounded-full font-bold text-base transition-all shadow-md cursor-pointer"
                    onClick={() => {
                      handleAddToCart(selectedProduct, modalQuantity);
                      setSelectedProduct(null);
                    }}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <ShoppingCart size={18} /> Add {modalQuantity} to Basket — RWF{' '}
                    {((Number(selectedProduct.price) || 0) * modalQuantity).toLocaleString()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
