import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Package,
  Truck,
  Globe,
  CheckCircle,
  TrendingUp,
  Handshake,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import { apiGet } from "../../api/client";
import "./Wholesale.css";

/**
 * Wholesale & Exports Page
 * Hero section driven by: GET /api/pages/slug/wholesale (CMS section type: "hero")
 * Remaining content uses hardcoded defaults (benefits, products, process, form).
 * Contact form submission: POST /api/wholesale/inquiry — NOT YET IMPLEMENTED (mock).
 */

interface WholesaleHero {
  badge?: string;
  heading?: string;
  headingAccent?: string;
  description?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
}

const BENEFITS = [
  {
    icon: Package,
    title: "Bulk Pricing",
    description:
      "Competitive tiered pricing for large volume orders. The more you order, the better the rate.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description:
      "Scheduled, on-time delivery with cold-chain logistics to preserve freshness throughout transit.",
  },
  {
    icon: Globe,
    title: "Export Ready",
    description:
      "All produce is certified and packaged to meet international export standards and phytosanitary requirements.",
  },
  {
    icon: TrendingUp,
    title: "Consistent Supply",
    description:
      "Year-round availability on most produce lines. We plan our harvests to match your supply needs.",
  },
  {
    icon: Handshake,
    title: "Dedicated Account Manager",
    description:
      "Every wholesale client gets a dedicated point of contact for orders, queries, and custom arrangements.",
  },
  {
    icon: CheckCircle,
    title: "Certified Quality",
    description:
      "All products are organically certified, inspected, and graded before any bulk order is dispatched.",
  },
];

const PRODUCT_CATEGORIES = [
  {
    name: "Fresh Vegetables",
    examples: "Tomatoes, Peppers, Onions, Carrots, Cabbage",
    minOrder: "50 kg",
    emoji: "🥬",
  },
  {
    name: "Tropical Fruits",
    examples: "Avocados, Mangoes, Pineapples, Passion Fruit",
    minOrder: "30 kg",
    emoji: "🥭",
  },
  {
    name: "Root Crops",
    examples: "Potatoes, Sweet Potatoes, Cassava, Yams",
    minOrder: "100 kg",
    emoji: "🥔",
  },
  {
    name: "Leafy Greens",
    examples: "Kale, Spinach, Amaranth, Lettuce",
    minOrder: "20 kg",
    emoji: "🌿",
  },
  {
    name: "Legumes",
    examples: "Beans, Lentils, Peas, Soybeans",
    minOrder: "50 kg",
    emoji: "🫘",
  },
  {
    name: "Grains & Cereals",
    examples: "Maize, Sorghum, Rice, Millet",
    minOrder: "100 kg",
    emoji: "🌾",
  },
];

const EXPORT_DESTINATIONS = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "DRC Congo",
  "Burundi",
  "Europe (selected countries)",
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Submit an Inquiry",
    description:
      "Fill in the inquiry form below or email us directly. Tell us what you need, quantities, and your preferred delivery schedule.",
  },
  {
    number: "02",
    title: "Get a Custom Quote",
    description:
      "Our team reviews your requirements and sends back a tailored pricing proposal within 24 hours.",
  },
  {
    number: "03",
    title: "Confirm & Sign",
    description:
      "Review the quote, agree on terms, and sign a supply agreement. A deposit confirms your order slot.",
  },
  {
    number: "04",
    title: "Harvest, Pack & Deliver",
    description:
      "We harvest to your schedule, pack under quality control, and dispatch with full tracking.",
  },
];

function Wholesale() {
  const [cmsHero, setCmsHero] = useState<WholesaleHero | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "",
    productInterest: "",
    estimatedQuantity: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiGet<{ success: boolean; data: { sections: { type: string; content: WholesaleHero }[] } }>('/api/pages/slug/wholesale')
      .then((res) => {
        if (!res.success || !res.data?.sections) return;
        const heroSection = res.data.sections.find((s) => s.type === 'hero');
        if (heroSection) setCmsHero(heroSection.content);
      })
      .catch(() => { /* silently use defaults */ });
  }, []);

  // Merge CMS with defaults
  const hero: WholesaleHero = {
    badge: cmsHero?.badge ?? 'Wholesale & Exports',
    heading: cmsHero?.heading ?? 'Fresh Produce at Scale.',
    headingAccent: cmsHero?.headingAccent ?? 'Direct from Our Farm.',
    description: cmsHero?.description ?? 'Supplying restaurants, supermarkets, distributors, and exporters across East Africa and beyond.',
    primaryCta: cmsHero?.primaryCta ?? { label: 'Submit an Inquiry', to: '#inquiry-form' },
    secondaryCta: cmsHero?.secondaryCta ?? { label: 'How It Works', to: '#how-it-works' },
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Replace with apiPost('/api/wholesale/inquiry', form) when endpoint is ready
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <main className="wholesale-page">
        {/* ── Hero ── */}
        <section className="wholesale-hero">
          <div className="wholesale-hero-inner">
            <span className="ws-tag">
              <Globe size={14} /> {hero.badge}
            </span>
            <h1>
              {hero.heading}
              <br />
              <span className="highlight-orange">{hero.headingAccent}</span>
            </h1>
            <p>{hero.description}</p>
            <div className="ws-hero-actions">
              <a href={hero.primaryCta?.to ?? '#inquiry-form'} className="btn btn-secondary">
                {hero.primaryCta?.label ?? 'Submit an Inquiry'}
              </a>
              <a href={hero.secondaryCta?.to ?? '#how-it-works'} className="btn btn-outline-white">
                {hero.secondaryCta?.label ?? 'How It Works'}
              </a>
            </div>
            <div className="ws-hero-stats">
              <div className="ws-hero-stat">
                <strong>50+</strong>
                <span>Wholesale clients</span>
              </div>
              <div className="ws-hero-stat">
                <strong>6</strong>
                <span>Export destinations</span>
              </div>
              <div className="ws-hero-stat">
                <strong>20+</strong>
                <span>Product varieties</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="ws-benefits">
          <div className="ws-section-header">
            <span className="section-tag">Why KainaFresh</span>
            <h2>The Smart Choice for Bulk Buyers</h2>
            <p>
              We make large-scale procurement simple, reliable, and
              cost-effective.
            </p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="benefit-card card">
                <div className="benefit-icon">
                  <Icon
                    size={26}
                    color="var(--color-primary)"
                    strokeWidth={1.8}
                  />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Products ── */}
        <section className="ws-products">
          <div className="ws-section-header">
            <span className="section-tag">What We Offer</span>
            <h2>Product Categories</h2>
            <p>
              Available in bulk with minimum order quantities. Custom packaging
              available on request.
            </p>
          </div>
          <div className="products-grid">
            {PRODUCT_CATEGORIES.map((cat) => (
              <div key={cat.name} className="product-cat-card card">
                <div className="product-cat-emoji">{cat.emoji}</div>
                <h3>{cat.name}</h3>
                <p className="product-cat-examples">{cat.examples}</p>
                <div className="product-cat-moq">
                  <Package size={13} />
                  Min. order: <strong>{cat.minOrder}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Exports ── */}
        <section className="ws-exports">
          <div className="ws-exports-inner">
            <div className="ws-exports-text">
              <span className="section-tag section-tag-light">
                Export Capabilities
              </span>
              <h2>We Export Across East Africa & Beyond</h2>
              <p>
                KainaFresh is certified for export and has established logistics
                partnerships for cross-border deliveries. All export produce is
                packed to international phytosanitary and food safety standards.
              </p>
              <div className="export-destinations">
                {EXPORT_DESTINATIONS.map((dest) => (
                  <span key={dest} className="export-badge">
                    <CheckCircle size={13} /> {dest}
                  </span>
                ))}
              </div>
            </div>
            <div className="ws-exports-visual">
              <Globe size={120} color="rgba(255,255,255,0.15)" />
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="ws-process" id="how-it-works">
          <div className="ws-section-header">
            <span className="section-tag">The Process</span>
            <h2>How It Works</h2>
            <p>
              From first inquiry to delivery — a simple, transparent process.
            </p>
          </div>
          <div className="process-steps">
            {PROCESS_STEPS.map((step, index) => (
              <div key={step.number} className="process-step">
                <div className="step-number">{step.number}</div>
                <div
                  className="step-connector"
                  style={{
                    display:
                      index < PROCESS_STEPS.length - 1 ? "block" : "none",
                  }}
                />
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Inquiry Form ── */}
        <section className="ws-inquiry" id="inquiry-form">
          <div className="ws-inquiry-inner">
            <div className="ws-inquiry-text">
              <span className="section-tag">Get Started</span>
              <h2>Submit a Wholesale Inquiry</h2>
              <p>
                Tell us about your requirements and our team will get back to
                you with a tailored quote within 24 business hours.
              </p>
              <div className="ws-contact-links">
                <a href="tel:+250700000000" className="ws-contact-link">
                  <Phone size={16} /> +250 700 000 000
                </a>
                <a
                  href="mailto:wholesale@kainafresh.rw"
                  className="ws-contact-link"
                >
                  <Mail size={16} /> wholesale@kainafresh.rw
                </a>
              </div>
            </div>

            {submitted ? (
              <div className="ws-success-message">
                <CheckCircle size={48} color="var(--color-primary)" />
                <h3>Inquiry Received!</h3>
                <p>
                  Thank you for reaching out. Our wholesale team will contact
                  you within 24 hours.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form className="ws-form" onSubmit={handleSubmit}>
                <div className="ws-form-row">
                  <div className="form-group">
                    <label htmlFor="ws-company">
                      Company / Organization Name *
                    </label>
                    <input
                      id="ws-company"
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Kigali Supermarket Ltd"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ws-contact">Your Full Name *</label>
                    <input
                      id="ws-contact"
                      type="text"
                      name="contactName"
                      value={form.contactName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                </div>
                <div className="ws-form-row">
                  <div className="form-group">
                    <label htmlFor="ws-email">Email Address *</label>
                    <input
                      id="ws-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ws-phone">Phone Number</label>
                    <input
                      id="ws-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+250 700 000 000"
                    />
                  </div>
                </div>
                <div className="ws-form-row">
                  <div className="form-group">
                    <label htmlFor="ws-country">Country / Destination *</label>
                    <input
                      id="ws-country"
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="e.g. Kenya"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ws-product">Product Interest</label>
                    <div className="select-wrapper">
                      <select
                        id="ws-product"
                        name="productInterest"
                        value={form.productInterest}
                        onChange={handleChange}
                      >
                        <option value="">Select a category</option>
                        {PRODUCT_CATEGORIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        <option value="Mixed">
                          Mixed / Multiple categories
                        </option>
                      </select>
                      <ChevronDown size={16} className="select-icon" />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ws-quantity">
                    Estimated Quantity / Frequency
                  </label>
                  <input
                    id="ws-quantity"
                    type="text"
                    name="estimatedQuantity"
                    value={form.estimatedQuantity}
                    onChange={handleChange}
                    placeholder="e.g. 500 kg weekly"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ws-message">Additional Requirements</label>
                  <textarea
                    id="ws-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your needs, delivery preferences, packaging requirements..."
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary ws-submit-btn ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner" /> Sending…
                    </>
                  ) : (
                    <>
                      Send Inquiry <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Wholesale;
