import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Package,
} from "lucide-react";
import heroFarmers from "../../assets/images/hero-farmers.png";
import productPlaceholder from "../../assets/images/placeholder.png";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

/**
 * Home Page
 * All data below is placeholder dummy data structured to match the API response shape.
 * TODO: Replace each data block with the corresponding API call when the backend is ready.
 * Reference: GET /api/content/home → API_CONTRACT.md
 */

// --- Dummy Data ---

const HERO = {
  badge: "100% Organic · Farm to Table",
  heading: "Farm Fresh Produce,",
  headingAccent: "Delivered Direct to You.",
  subheading:
    "We grow it. We pack it. We deliver it — fresh, certified, and straight from our fields to your table. Experience the taste of real agriculture.",
  primaryCta: { label: "Shop Now", to: "/products" },
  secondaryCta: { label: "Wholesale & Exports", to: "/wholesale" },
  stats: [
    { value: "350+", label: "Happy Customers" },
    { value: "20+", label: "Produce Varieties" },
    { value: "100%", label: "Organic Certified" },
  ],
};

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

// --- Component ---

function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (id:any) => setOpenFaq(openFaq === id ? null : id);

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
              <span className="hero-badge">{HERO.badge}</span>
              <h1>
                Elevate Your Health with Our Proven{" "}
                <span className="hero-accent">Organic</span>{" "}
                <span className="hero-accent-secondary">Farming!</span>
              </h1>
              <p>
                Our expert team crafts tailored strategies, executes effective
                farming, and drives sustainable growth for your family's
                nutrition.
              </p>

              <div className="hero-ctas">
                <Link
                  to={HERO.primaryCta.to}
                  className="btn btn-primary hero-cta-primary"
                >
                  {HERO.primaryCta.label} <ArrowRight size={16} />
                </Link>
                <Link
                  to={HERO.secondaryCta.to}
                  className="btn btn-outline-green hero-cta-secondary"
                >
                  <span className="play-icon">▶</span> {HERO.secondaryCta.label}
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
            <span className="home-tag">Why KainaFresh</span>
            <h2>Fresh Food, Done Right</h2>
          </div>
          <div className="vp-grid">
            {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
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
              <span className="home-tag">Got Questions?</span>
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about ordering from KainaFresh.</p>
            </div>
            <div className="faq-list">
              {FAQS.map((faq) => (
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
      <Footer />
    </>
  );
}

export default Home;
