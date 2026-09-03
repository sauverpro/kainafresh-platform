import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ShoppingCart,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Package,
} from "lucide-react";
import heroFarmers from "../../assets/images/hero-farmers.png";
import productPlaceholder from "../../assets/images/placeholder.png";
import "./Home.css";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import PartnersSection from "../../components/partners/PartnersSection";
import { apiGet } from "../../api/client";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useCart, type CartProduct } from '../../context/CartContext';

/**
 * Home Page
 * CMS data: GET /api/pages/slug/home → sections of type hero, value_props, faqs
 * Featured products: GET /api/products?featured=true (NOT YET IMPLEMENTED — uses dummy data)
 * Falls back gracefully to hardcoded defaults when CMS page is not seeded.
 */

// ── TypeScript interfaces for CMS section content ──
const ICON_COMPONENTS: Record<string, React.FC<{ size?: number; strokeWidth?: number; color?: string }>> = {
  Leaf, Truck, ShieldCheck, Package,
};

// CMS icon values may arrive as PascalCase ("Truck") or kebab/lowercase ("truck", "shield-check")
const resolveIcon = (name?: string) => {
  if (!name) return Leaf;
  if (ICON_COMPONENTS[name]) return ICON_COMPONENTS[name];
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  const match = Object.keys(ICON_COMPONENTS).find((key) => key.toLowerCase() === normalized);
  return match ? ICON_COMPONENTS[match] : Leaf;
};

interface HeroContent {
  badge?: string; heading?: string; headingAccent?: string; headingAccentSecondary?: string;
  subheading?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

// home cta content
interface HomectaContent {
  heading?:string,
  paragraph?: string,
  primary_cta?: {label: string, to: string};
  secondary_cta?: {label:string, to: string};
}

interface ValuePropItem { iconName?: string; icon?: string; title: string; description: string }
interface ValuePropsContent { tag?: string; heading?: string; items?: ValuePropItem[] }

interface FaqItem { question: string; answer: string }
interface FaqsContent { tag?: string; heading?: string; subheading?: string; items?: FaqItem[] }

interface CmsSection { type: string; content: HeroContent & ValuePropsContent & FaqsContent }
interface SpotlightContent{
  tag?: string;
  heading?: string;
  paragraphs?: string;
  primaryCta?: {label: string; to: string;}
  secondaryCta?: {label: string; to: string;}
  organic?: {label: string; number: string;}
  working_hours?: {label: string; number: string;}
}
interface CatalogContent{

  heading?: string;
  paragraphs?: string;
  primaryCta?: {label: string; to: string;}
  
}
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
interface ApiUnit {
  id: number | string;
  name: string;
}

// ── REMOVED DUMMY DATA ──
// const FEATURED_PRODUCTS = [...] // DELETE THIS

/**
 * ============================================================================
 * KainaFresh Organic Platform — Public Home Landing Page Component
 * ============================================================================
 * 
 * Features:
 * 1. CMS Page Section Hydration from MariaDB (/api/pages/slug/home).
 * 2. Hero Section with dynamic headlines, subheadings, and CTA buttons.
 * 3. Value Propositions Grid featuring eco-friendly organic farming benefits.
 * 4. Interactive Accordion FAQ Component.
 * 5. Full glassmorphic page loading overlay while data retrieves.
 */

// Import centered page loader for smooth database retrieval loading states
import Loader from "../../components/Loader/Loader";

/**
 * Main Home Landing Page Functional Component.
 */
function Home() {
  // Update document HTML title tag for SEO optimization
  usePageTitle("home", "Home");
  const { addToCart } = useCart();
  // Dynamic CMS state definitions
  const [cmsHero, setCmsHero] = useState<HeroContent | null>(null);
  const [cmsValueProps, setCmsValueProps] = useState<ValuePropsContent | null>(null);
  const [cmsFaqs, setCmsFaqs] = useState<FaqsContent | null>(null);

  // FAQ accordion open item toggle index state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Dynamic CTA section content state
  const [cmsHomeCta, setCmsHomeCta] = useState<HomectaContent | null>(null);
  const [cmsSpotligh, setCmsSpotlight] = useState<SpotlightContent | null>(null)
  const [cmsCatalog, setCmsCatalog] = useState<CatalogContent | null>(null);
  // Page loading indicator state while fetching CMS data from MariaDB
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<CartProduct[]>([]);
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  
  // Lifecycle effect: Query CMS sections for page slug 'home' on mount
  useEffect(() => {
    async function loadData(){
      let cancelled = false;
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
              setProducts([]);
            }
          }
        } catch (err) {
          console.debug('Failed to fetch products from backend, using fallback', err);
          // Only set empty array if we didn't get any products
          if (!cancelled) {
            setProducts([]);
          }
        }
    }
    // Perform HTTP GET request to retrieve dynamic CMS sections
    apiGet<{ success: boolean; data: { sections: CmsSection[] } }>('/api/pages/slug/home')
      .then((res) => {
        if (!res.success || !res.data?.sections) return;
        const sections = res.data.sections;

        // Helper function to extract specific CMS section payload by type key
        const find = <T,>(type: string): T | null => {
          const s = sections.find((sec) => sec.type === type);
          return s ? (s.content as T) : null;
        };

        // Populate state variables with dynamic content
        setCmsHero(find<HeroContent>('hero'));
        setCmsHomeCta(find<HomectaContent>('home-cta'));
        setCmsSpotlight(find<SpotlightContent>('story-spotlight'));
        setCmsCatalog(find<CatalogContent>('product_catalog'));
        const valuePropsSection = sections.find((sec) => sec.type === 'value_props');
        // some CMS rows store a bare items array, so we set for array data
        const valuePropsContent = valuePropsSection?.content;
        setCmsValueProps(
          Array.isArray(valuePropsContent)
            ? { items: valuePropsContent as ValuePropItem[] }
            : (valuePropsContent as ValuePropsContent) ?? null
        );
        // get faqs questions and answer from api
        const FaqsSection = sections.find((sec)=> sec.type === 'faqs');
        const valueFaq = FaqsSection?.content;
        setCmsFaqs(
          Array.isArray(valueFaq) ? {items: valueFaq as FaqItem[]} :(valueFaq as FaqsContent)
        );

        // Load products data after CMS
        loadData();
      })
      .catch(() => { 
        // Silently catch network errors and rely on fallback defaults
        loadData(); // Still try to load products even if CMS fails
      })
      .finally(() => {
        // Complete loading phase
        setLoading(false);
      });
      
  }, []);

  // Toggle handler for opening/closing FAQ accordion items
  const toggleFaq = (id: number) => setOpenFaq(openFaq === id ? null : id);

  // Merge dynamic CMS hero data with fallback default copy
  const hero = {
    badge: cmsHero?.badge ?? 'Farm-fresh, direct to you',
    heading: cmsHero?.heading ?? 'Farm Fresh Produce,',
    headingAccent: cmsHero?.headingAccent ?? 'Delivered Direct',
    headingAccentSecondary: cmsHero?.headingAccentSecondary ?? 'to You.',
    subheading: cmsHero?.subheading ?? 'We grow it. We pack it. We deliver it — fresh, certified, and straight from our fields to your table.',
    primaryCta: { label: cmsHero?.primaryCta?.label ?? 'Our Products', to: cmsHero?.primaryCta?.to ?? '/products' },
    secondaryCta: { label: cmsHero?.secondaryCta?.label ?? 'Wholesale & Exports', to: cmsHero?.secondaryCta?.to ?? '/wholesale' },
  };
  const story ={
    tag: cmsSpotligh?.tag,
    heading: cmsSpotligh?.heading,
    paragraphs: cmsSpotligh?.paragraphs,
    primaryCta : cmsSpotligh?.primaryCta,
    secondaryCta: cmsSpotligh?.secondaryCta,
    organic: cmsSpotligh?.organic,
    working_hours : cmsSpotligh?.working_hours
  }
  const catalog ={
    heading: cmsCatalog?.heading,
    paragraphs: cmsCatalog?.paragraphs,
    primaryCta : cmsCatalog?.primaryCta
  }
  const homeCTA = {
    heading: cmsHomeCta?.heading ?? 'Fresh Food, Direct to You',
    paragraph: cmsHomeCta?.paragraph ?? 'Ready to taste the difference of real organic farming? Order today.',
    primary_cta: { label: cmsHomeCta?.primary_cta?.label ?? 'Order Now', to: cmsHomeCta?.primary_cta?.to ?? '/products' },
    secondary_cta: { label: cmsHomeCta?.secondary_cta?.label ?? 'Contact Sales', to: cmsHomeCta?.secondary_cta?.to ?? '/contact' }
  };

  // Merge dynamic value props with fallbacks
  const valueProps = (cmsValueProps?.items && cmsValueProps.items.length > 0)
    ? cmsValueProps.items.map((v) => ({
        icon: resolveIcon(v.iconName ?? v.icon),
        title: v.title,
        description: v.description,
      }))
    : [
        { icon: Leaf, title: '100% Certified Organic', description: 'Grown naturally without synthetic pesticides or chemicals.' },
        { icon: Truck, title: 'Farm to Door in 24 Hours', description: 'Harvested daily and delivered fresh to your doorstep.' },
        { icon: ShieldCheck, title: 'Direct Farm Pricing', description: 'No middlemen — fair prices for you, fair pay for our farmers.' },
        { icon: Package, title: 'Zero-Waste Packaging', description: 'Eco-friendly, biodegradable materials that protect the planet.' },
      ];

  // Merge dynamic FAQs with fallbacks
  const faqs = (cmsFaqs?.items && cmsFaqs.items.length > 0)
    ? cmsFaqs.items.map((f, i) => ({ id: i + 1, question: f.question, answer: f.answer }))
    : [
        { id: 1, question: 'How do I place an order?', answer: 'Browse our products, add items to cart, and checkout easily.' },
        { id: 2, question: 'Do you deliver to my area?', answer: 'We deliver across Kigali and surrounding districts.' },
        { id: 3, question: 'How do I know produce is organic?', answer: 'KainaFresh is certified organic with regular farm inspections.' },
      ];

  //Get only first 4 products for featured display
  const featuredProducts = products.slice(0, 4);

  // Render a stable page shell (header) with a centered loader while fetching
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="home-page">
          <Loader text="Fetching fresh produce data from database..." />
        </main>
      </>
    );
  }

  return (
    <>
      {/* Global Header Navigation Bar */}
      <Navbar />

      {/* Main Home Page Container with Fade-in Animation */}
      <main className="home-page fade-in-content">
        {/* ── Hero ── */}
        {/* ── Hero ── */}
        <section className="hero">
          {/* Noise background */}
          <div className="hero-noise"></div>

          {/* Graphic elements (floating dots/leaves like the reference) */}
          <div className="hero-graphic hero-graphic-1"></div>
          <div className="hero-graphic hero-graphic-2"></div>
          <div className="hero-graphic hero-graphic-3"></div>

          <div className="hero-grid">
            {/* Left Column: Text & CTAs */}
            <div className="hero-text-content">
              <span className="hero-badge">{hero.badge}</span>
              <h1>
                {hero.heading}
                <span className="hero-accent">{hero.headingAccent}</span>{" "}
                <span className="hero-accent-secondary">
                  {hero.headingAccentSecondary}
                </span>
              </h1>
              <p>{hero.subheading}</p>

              <div className="hero-ctas">
                <Link
                  to={hero.primaryCta.to}
                  className="btn btn-primary hero-cta-primary"
                >
                  {hero.primaryCta.label} <ArrowRight size={16} />
                </Link>
                <Link
                  to={hero.secondaryCta.to}
                  className="btn btn-outline-green hero-cta-secondary"
                >
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="hero-image-content">
              <div className="hero-image-backdrop"></div>
              <img
                src={heroFarmers}
                alt="KainaFresh farmers holding fresh produce"
                className="hero-image"
              />
            </div>
          </div>
        </section>

        {/* ── Value Propositions ── */}
        <section className="value-props">
          <div className="vp-header">
            <span className="home-tag">{cmsValueProps?.tag ?? 'Why KainaFresh'}</span>
            <h2>{cmsValueProps?.heading ?? 'Fresh Food, Done Right'}</h2>
          </div>
          <div className="vp-grid">
            {valueProps.map(({ icon: Icon, title, description }) => (
              <div key={title} className="vp-card card flex flex-col justify-between">
                <div>
                  <div className="vp-icon">
                    <Icon
                      size={26}
                      strokeWidth={1.8}
                      color="var(--color-primary)"
                    />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <Link to="/about" className="vp-read-more-btn mt-4 inline-flex items-center justify-center gap-1 text-sm font-semibold text-[#076935] hover:text-[#F39927] transition-colors">
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Story Spotlight Teaser ── */}
        <section className="story-spotlight">
          <div className="story-spotlight-inner">
            <div className="story-spotlight-text">
              <span className="home-tag">{story.tag}</span>
              <h2>{story.heading}</h2>
              <p>
                {story.paragraphs}
              </p>
              <div className="story-metrics">
                <div className="story-metric-item">
                  <strong>{story.organic?.number}</strong>
                  <span>{story.organic?.label}</span>
                </div>
               
                <div className="story-metric-item">
                  <strong>{story.working_hours?.number}</strong>
                  <span>{story.working_hours?.label}</span>
                </div>
              </div>
              <div className="story-cta-wrap">
                <Link to={story.primaryCta?.to || '/about'} className="btn btn-primary story-btn">
                  {story.primaryCta?.label || 'Learn More'} <ArrowRight size={16} />
                </Link>
                <Link to={story.secondaryCta?.to || '/contact'} className="btn btn-outline-green">
                 {story.secondaryCta?.label || 'Get in Touch'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Products ── */}
        <section className="featured-products">
          <div className="fp-header">
            <div>
              <span className="home-tag">Fresh Today</span>
              <h2>Featured Products</h2>
              <p>Directly from our farm, available for order today.</p>
            </div>
            <Link to="/products" className="btn btn-outline-green fp-see-all">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>

          {/* ── UPDATED: Now using API products with 4 per row ── */}
          <div className="fp-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1.5rem' 
          }}>
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="product-card card">
                  <div className="product-img-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                    {product.badge && (
                      <span className="product-badge">{product.badge}</span>
                    )}
                    {!product.inStock && (
                      <div className="product-out-of-stock">Out of Stock</div>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-footer">
                      <div className="product-price">
                        <strong>
                          RWF {product.price.toLocaleString()}
                        </strong>
                        <span>{product.unit}</span>
                      </div>
                      <button
                        className="btn btn-primary product-order-btn"
                        disabled={!product.inStock}
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart size={14} />
                        Order
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                      <Link to={`/products`} className="text-xs font-semibold text-[#076935] hover:text-[#F39927] inline-flex items-center gap-1">
                        View Product Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              //Fallback message when no products are available
              <div className="col-span-4 text-center py-8 text-gray-500">
                <p>No products available at the moment. Please check back later.</p>
              </div>
            )}
          </div>

          {/* Prompt to View More Products */}
          <div className="fp-bottom-prompt mt-12 text-center p-8 bg-white rounded-2xl border border-[#076935]/10 shadow-xs max-w-3xl mx-auto">
            <h3 className="font-heading text-xl text-[#076935] mb-2 font-bold">{catalog?.heading || 'Explore Our Full Produce Catalog'}</h3>
            <p className="text-gray-600 text-sm mb-5">{catalog?.paragraphs || 'From seasonal root crops to freshly picked vegetables, order directly from our farm.'}</p>
            <Link to={catalog?.primaryCta?.to || '/products'} className="btn btn-primary">
              {catalog?.primaryCta?.label || 'Browse All Products'} <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── Wholesale & Export Banner ── */}
        <section className="wholesale-banner">
          <div className="wholesale-banner-inner">
            <div className="wholesale-banner-content">
              <span className="home-tag orange">Wholesale & Export Solutions</span>
              <h2>Bulk Supply for Supermarkets, Hotels & International Importers</h2>
              <p>
                Whether you need consistent bulk orders for your restaurant chain or high-quality produce for international markets, KainaFresh delivers grade-A crops with guaranteed cold-chain reliability.
              </p>
              <div className="wholesale-banner-ctas">
                <Link to="/wholesale" className="btn btn-secondary">
                  View Wholesale Offerings <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn btn-outline-white">
                  Request Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Partners Showcase ── */}
        <PartnersSection />

        {/* ── FAQs ── */}
        <section className="faqs">
          <div className="faq-inner">
            <div className="faq-header">
              <span className="home-tag">{cmsFaqs?.tag ?? 'Got Questions?'}</span>
              <h2>{cmsFaqs?.heading ?? 'Frequently Asked Questions'}</h2>
              <p>{cmsFaqs?.subheading ?? 'Everything you need to know about our organic produce, delivery, and orders.'}</p>
            </div>
            <div className="faq-list">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item ${openFaq === faq.id ? "open" : ""}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={openFaq === faq.id}
                  >
                    <span>{faq.question}</span>
                    {openFaq === faq.id ? (
                      <ChevronUp size={18} color="var(--color-primary)" />
                    ) : (
                      <ChevronDown size={18} color="var(--color-text-light)" />
                    )}
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Prompt to Read More FAQs / Contact Support */}
            <div className="faq-prompt mt-10 text-center p-6 bg-[#076935]/5 rounded-2xl border border-[#076935]/15">
              <p className="text-gray-700 text-sm font-medium mb-3">Have specific questions about custom deliveries or bulk orders?</p>
              <Link to="/contact" className="btn btn-outline-green inline-flex items-center gap-2">
                Contact Customer Support <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="home-cta">
          <div className="home-cta-inner">
            <h2>{homeCTA.heading}</h2>
            <p>
              {homeCTA.paragraph}
            </p>
            <div className="home-cta-buttons">
              <Link to={homeCTA.primary_cta.to || '/products'} className="btn btn-primary">
                {homeCTA.primary_cta.label}
              </Link>
              <Link to={homeCTA.secondary_cta.to || '/contact'} className="btn btn-secondary">
                {homeCTA.secondary_cta.label}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;