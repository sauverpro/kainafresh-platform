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
import { apiGet } from "../../api/client";
import { usePageTitle } from "../../hooks/usePageTitle";

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

// --- Dummy Data ---

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: "Fresh Green Beans",
    category: "Vegetables",
    price: 1200,
    unit: "kg",
    currency: "RWF",
    badge: "Best Seller",
    inStock: true,
    image: productPlaceholder,
  },
  {
    id: 2,
    name: "Organic Avocados",
    category: "Fruits",
    price: 800,
    unit: "piece",
    currency: "RWF",
    badge: "New",
    inStock: true,
    image: productPlaceholder,
  },
  {
    id: 3,
    name: "Farm Tomatoes",
    category: "Vegetables",
    price: 1500,
    unit: "kg",
    currency: "RWF",
    badge: null,
    inStock: true,
    image: productPlaceholder,
  },
  {
    id: 4,
    name: "Sweet Potatoes",
    category: "Root Crops",
    price: 900,
    unit: "kg",
    currency: "RWF",
    badge: "Seasonal",
    inStock: true,
    image: productPlaceholder,
  },
  {
    id: 5,
    name: "Fresh Spinach",
    category: "Leafy Greens",
    price: 600,
    unit: "bunch",
    currency: "RWF",
    badge: null,
    inStock: false,
    image: productPlaceholder,
  },
  {
    id: 6,
    name: "Passion Fruit",
    category: "Fruits",
    price: 400,
    unit: "piece",
    currency: "RWF",
    badge: "Popular",
    inStock: true,
    image: productPlaceholder,
  },
];

// const FAQS = [
//   {
//     id: 1,
//     question: "How do I place an order?",
//     answer:
//       "Browse our products, add your items to the cart, and checkout. You can pay on delivery or via mobile money. Orders placed before 2 PM are delivered the next day.",
//   },
//   {
//     id: 2,
//     question: "Do you deliver to my area?",
//     answer:
//       "We currently deliver across Kigali and surrounding districts. Enter your location at checkout to confirm delivery availability and estimated time.",
//   },
//   {
//     id: 3,
//     question: "How do I know the produce is truly organic?",
//     answer:
//       "KainaFresh is certified organic. Our farm undergoes regular inspections, and all products carry a certification label. You can visit our farm — we welcome it!",
//   },
//   {
//     id: 4,
//     question: "Can I order in bulk for my business?",
//     answer:
//       "Absolutely. We have a dedicated wholesale programme for restaurants, supermarkets, and exporters. Visit our Wholesale & Exports page or contact us directly.",
//   },
//   {
//     id: 5,
//     question: "What if I receive produce that is not fresh?",
//     answer:
//       "We stand behind every delivery. If anything isn't up to standard, contact us within 24 hours and we will replace it or issue a full refund — no questions asked.",
//   },
// ];

// ── Component ──

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

  // Dynamic CMS state definitions
  const [cmsHero, setCmsHero] = useState<HeroContent | null>(null);
  const [cmsValueProps, setCmsValueProps] = useState<ValuePropsContent | null>(null);
  const [cmsFaqs, setCmsFaqs] = useState<FaqsContent | null>(null);

  // FAQ accordion open item toggle index state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // Dynamic CTA section content state
  const [cmsHomeCta, setCmsHomeCta] = useState<HomectaContent | null>(null);

  // Page loading indicator state while fetching CMS data from MariaDB
  const [loading, setLoading] = useState(true);

  // Lifecycle effect: Query CMS sections for page slug 'home' on mount
  useEffect(() => {
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

        
      })
      .catch(() => { 
        // Silently catch network errors and rely on fallback defaults
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
    primaryCta: { label: cmsHero?.primaryCta?.label ?? 'Our Products', to: cmsHero?.primaryCta?.to ?? '/shop' },
    secondaryCta: { label: cmsHero?.secondaryCta?.label ?? 'Wholesale & Exports', to: cmsHero?.secondaryCta?.to ?? '/wholesale' },
  };

  const homeCTA = {
    heading: cmsHomeCta?.heading ?? 'Fresh Food, Direct to You',
    paragraph: cmsHomeCta?.paragraph ?? 'Ready to taste the difference of real organic farming? Order today.',
    primary_cta: { label: cmsHomeCta?.primary_cta?.label ?? 'Order Now', to: cmsHomeCta?.primary_cta?.to ?? '/shop' },
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
              <div key={title} className="vp-card card">
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
            ))}
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
            <Link to="/shop" className="btn btn-outline-green fp-see-all">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>

          <div className="fp-grid">
            {FEATURED_PRODUCTS.map((product) => (
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
                        {product.currency} {product.price.toLocaleString()}
                      </strong>
                      <span>/ {product.unit}</span>
                    </div>
                    <button
                      className="btn btn-primary product-order-btn"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart size={14} />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="faqs">
          <div className="faq-inner">
            <div className="faq-header">
              <span className="home-tag">{cmsFaqs?.tag ?? ''}</span>
              <h2>{cmsFaqs?.heading ?? ''}</h2>
              <p>{cmsFaqs?.subheading ?? ''}</p>
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
              <Link to={homeCTA.primary_cta.to || '/shop'} className="btn btn-primary">
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