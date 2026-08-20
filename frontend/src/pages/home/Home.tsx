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
import { apiGet } from "../../api/client";

/**
 * Home Page
 * CMS data: GET /api/pages/slug/home → sections of type hero, value_props, faqs
 * Featured products: GET /api/products?featured=true (NOT YET IMPLEMENTED — uses dummy data)
 * Falls back gracefully to hardcoded defaults when CMS page is not seeded.
 */

// ── TypeScript interfaces for CMS section content ──
const ICON_MAP: Record<string, React.FC<{ size?: number; strokeWidth?: number; color?: string }>> = {
  Leaf, Truck, ShieldCheck, Package,
};

interface HeroContent {
  badge?: string; heading?: string; headingAccent?: string; headingAccentSecondary?: string;
  subheading?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

interface ValuePropItem { iconName: string; title: string; description: string }
interface ValuePropsContent { tag?: string; heading?: string; items?: ValuePropItem[] }

interface FaqItem { question: string; answer: string }
interface FaqsContent { tag?: string; heading?: string; subheading?: string; items?: FaqItem[] }

interface CmsSection { type: string; content: HeroContent & ValuePropsContent & FaqsContent }

// --- Dummy Data ---

const VALUE_PROPS = [
  {
    icon: Leaf,
    title: "Organically Grown",
    description:
      "No synthetic chemicals. Every crop is grown using eco-friendly practices that are good for the soil and good for you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Order today, receive tomorrow. Our cold-chain logistics ensure your produce arrives as fresh as the day it was picked.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description:
      "Every product is hand-inspected and graded before packing. If it's not perfect, it doesn't leave our farm.",
  },
  {
    icon: Package,
    title: "Bulk & Wholesale",
    description:
      "Need large volumes? We supply restaurants, supermarkets, and exporters with consistent, certified bulk produce.",
  },
];

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

const FAQS = [
  {
    id: 1,
    question: "How do I place an order?",
    answer:
      "Browse our products, add your items to the cart, and checkout. You can pay on delivery or via mobile money. Orders placed before 2 PM are delivered the next day.",
  },
  {
    id: 2,
    question: "Do you deliver to my area?",
    answer:
      "We currently deliver across Kigali and surrounding districts. Enter your location at checkout to confirm delivery availability and estimated time.",
  },
  {
    id: 3,
    question: "How do I know the produce is truly organic?",
    answer:
      "KainaFresh is certified organic. Our farm undergoes regular inspections, and all products carry a certification label. You can visit our farm — we welcome it!",
  },
  {
    id: 4,
    question: "Can I order in bulk for my business?",
    answer:
      "Absolutely. We have a dedicated wholesale programme for restaurants, supermarkets, and exporters. Visit our Wholesale & Exports page or contact us directly.",
  },
  {
    id: 5,
    question: "What if I receive produce that is not fresh?",
    answer:
      "We stand behind every delivery. If anything isn't up to standard, contact us within 24 hours and we will replace it or issue a full refund — no questions asked.",
  },
];

// ── Component ──

function Home() {
  const [cmsHero, setCmsHero] = useState<HeroContent | null>(null);
  const [cmsValueProps, setCmsValueProps] = useState<ValuePropsContent | null>(null);
  const [cmsFaqs, setCmsFaqs] = useState<FaqsContent | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    apiGet<{ success: boolean; data: { sections: CmsSection[] } }>('/api/pages/slug/home')
      .then((res) => {
        if (!res.success || !res.data?.sections) return;
        const sections = res.data.sections;
        const find = <T,>(type: string): T | null => {
          const s = sections.find((sec) => sec.type === type);
          return s ? (s.content as T) : null;
        };
        setCmsHero(find<HeroContent>('hero'));
        setCmsValueProps(find<ValuePropsContent>('value_props'));
        setCmsFaqs(find<FaqsContent>('faqs'));
      })
      .catch(() => { /* silently fall back to hardcoded defaults */ });
  }, []);

  const toggleFaq = (id: number) => setOpenFaq(openFaq === id ? null : id);

  // Merge CMS data with fallback defaults
  const hero: HeroContent = {
    badge: cmsHero?.badge ?? 'Farm-fresh, direct to you',
    heading: cmsHero?.heading ?? 'Farm Fresh Produce,',
    headingAccent: cmsHero?.headingAccent ?? 'Delivered Direct',
    headingAccentSecondary: cmsHero?.headingAccentSecondary ?? 'to You.',
    subheading: cmsHero?.subheading ?? 'We grow it. We pack it. We deliver it — fresh, certified, and straight from our fields to your table.',
    primaryCta: cmsHero?.primaryCta ?? { label: 'Shop Now', to: '/products' },
    secondaryCta: cmsHero?.secondaryCta ?? { label: 'Wholesale & Exports', to: '/wholesale' },
  };

  const valueProps = cmsValueProps?.items
    ? cmsValueProps.items.map((v) => ({ icon: ICON_MAP[v.iconName] ?? Leaf, title: v.title, description: v.description }))
    : VALUE_PROPS;

  const faqs = cmsFaqs?.items
    ? cmsFaqs.items.map((f, i) => ({ id: i + 1, question: f.question, answer: f.answer }))
    : FAQS;

  return (
    <>
      <Navbar />
      <main className="home-page">
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
                  <span className="play-icon">▶</span> {hero.secondaryCta.label}
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
            <Link to="/products" className="btn btn-outline-green fp-see-all">
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
              <span className="home-tag">{cmsFaqs?.tag ?? 'Got Questions?'}</span>
              <h2>{cmsFaqs?.heading ?? 'Frequently Asked Questions'}</h2>
              <p>{cmsFaqs?.subheading ?? 'Everything you need to know about ordering from KainaFresh.'}</p>
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
            <h2>Ready to taste farm-fresh produce?</h2>
            <p>
              Join over 350 households and businesses already ordering from
              KainaFresh.
            </p>
            <div className="home-cta-buttons">
              <Link to="/products" className="btn btn-primary">
                Start Shopping
              </Link>
              <Link to="/wholesale" className="btn btn-secondary">
                Wholesale Inquiries
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;
