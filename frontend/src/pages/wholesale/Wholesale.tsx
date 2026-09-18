import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
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
} from "lucide-react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import PageShellSkeleton from "../../components/skeletons/PageShellSkeleton";
import { apiGet, apiPost } from "../../api/client";
import { usePageTitle } from "../../hooks/usePageTitle";
import "./Wholesale.css";

/**
 * Wholesale & Exports Page
 * Hero section driven by: GET /api/pages/slug/wholesale (CMS section type: "hero")
 * Remaining content uses hardcoded defaults (benefits, products, process, form).
 * Contact form submission: POST /api/wholesale/inquiry — NOT YET IMPLEMENTED (mock).
 */
// Icon map: CMS stores icon names as strings, we map them to lucide-react components
const ICON_MAP: Record<
  string,
  React.FC<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  Package,
  Truck,
  Globe,
  CheckCircle,
  TrendingUp,
  Handshake,
};
interface WholesaleHero {
  badge?: string;
  heading?: string;
  headingHighlight?: string;
  description?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  client_stat?: { stat_label: string; stat_number: string };
  export_stat?: { stat_label: string; stat_number: string };
  product_stat?: { stat_label: string; stat_number: string };
}
interface WhyContentItem {
  icon: string;
  title: string;
  description: string;
}
interface WhyContent {
  tag?: string;
  heading?: string;
  paragraphs?: string;
  items?: WhyContentItem[];
}
interface DestinationContentItem {
  destination: string;
}
interface DestinationContent {
  tag?: string;
  heading?: string;
  paragraphs?: string;
  items?: DestinationContentItem[];
}
interface ProgressItem {
  number: string;
  title: string;
  description: string;
}
interface ProgressContent {
  tag?: string;
  heading?: string;
  paragraphs?: string;
  items?: ProgressItem[];
}
/**
 * ============================================================================
 * KainaFresh Organic Platform — Wholesale B2B & Export Program Component
 * ============================================================================
 *
 * Features:
 * 1. B2B Wholesale inquiry form with country, product interest, and volume specs.
 * 2. Export capabilities showcase, cold-chain logistics specs, and certifications.
 * 3. Integrated glassmorphic page loading screen during database fetch.
 */

function Wholesale() {
  usePageTitle("wholesale", "Wholesale & Exports");
  const [cmsHero, setCmsHero] = useState<WholesaleHero | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
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
  const [cmsWhy, setCmsWhy] = useState<WhyContent | null>(null);
  const [cmsDestination, setCmsDestination] =
    useState<DestinationContent | null>(null);
  const [cmsProgress, setCmsProgress] = useState<ProgressContent | null>(null);
  const [primaryEmail, setPrimaryEmail] = useState<string | null>(null);
  const [secondaryEmail, setSecondaryEmail] = useState<string | null>(null);
  const [primaryNumber, setPrimaryNumber] = useState<string | null>(null);
  const [secondaryNumber, setSecondaryNumber] = useState<string | null>(null);
  useEffect(() => {
    async function loadData() {
      try {
        const settings =
          await apiGet<Record<string, unknown>>("/api/settings/");
        const settingsPayload =
          (settings as { data?: unknown })?.data ?? settings ?? {};

        const payloadAsObj = settingsPayload as Record<string, unknown>;
        const settingData = Array.isArray(settingsPayload)
          ? (settingsPayload[0] ?? null)
          : Array.isArray(payloadAsObj?.results)
            ? (payloadAsObj.results[0] ?? null)
            : payloadAsObj?.settings &&
                typeof payloadAsObj.settings === "object"
              ? payloadAsObj.settings
              : (settingsPayload ?? null);
        const finalData = (settingData || {}) as Record<string, string>;
        setPrimaryEmail(finalData.primary_email ?? null);
        setSecondaryEmail(finalData.secondary_email ?? null);
        setPrimaryNumber(finalData.primary_number ?? null);
        setSecondaryNumber(finalData.secondary_nummber ?? null);
      } catch (error) {
        console.debug("Failed to load data", error);
      }
    }
    apiGet<{
      success: boolean;
      data: { sections: { type: string; content: WholesaleHero }[] };
    }>("/api/pages/slug/wholesale")
      .then((res) => {
        if (!res.success || !res.data?.sections) return;
        const heroSection = res.data.sections.find(
          (s) => s.type === "wholesale-hero" || s.type === "hero",
        );
        if (heroSection) setCmsHero(heroSection.content);
        const Whysection = res.data.sections.find(
          (s) =>
            s.type === "ws-benefits" ||
            s.type === "benefits" ||
            s.type === "why_us",
        );
        const whycontents = Whysection?.content;
        if (Array.isArray(whycontents)) {
          setCmsWhy({ items: whycontents as WhyContentItem[] });
        } else if (whycontents && typeof whycontents === "object") {
          if ("items" in whycontents && Array.isArray(whycontents.items)) {
            setCmsWhy(whycontents as WhyContent);
          } else {
            // If it's an object but no items, treat it as the content with tag, heading, etc.
            const obj = whycontents as Partial<WhyContent>;
            setCmsWhy({
              tag: obj.tag,
              heading: obj.heading,
              paragraphs: obj.paragraphs,
              items: obj.items || [],
            });
          }
        }
        const destinationSec = res.data.sections.find(
          (sec) =>
            sec.type === "ws-exports" ||
            sec.type === "exports" ||
            sec.type === "destinations",
        );
        const destinationValue = destinationSec?.content;
        if (Array.isArray(destinationValue)) {
          setCmsDestination({
            items: destinationValue as DestinationContentItem[],
          });
        } else if (destinationValue && typeof destinationValue === "object") {
          if (
            "items" in destinationValue &&
            Array.isArray(destinationValue.items)
          ) {
            setCmsDestination(destinationValue as DestinationContent);
          } else {
            const obj = destinationValue as Partial<DestinationContent>;
            setCmsDestination({
              tag: obj.tag,
              heading: obj.heading,
              paragraphs: obj.paragraphs,
              items: obj.items || [],
            });
          }
        } else {
          setCmsDestination(null);
        }
        // progress section
        const progressT = res.data.sections.find(
          (sec) =>
            sec.type === "ws-process" ||
            sec.type === "process" ||
            sec.type === "how_it_works",
        );
        const progressContent = progressT?.content;
        if (Array.isArray(progressContent)) {
          setCmsProgress({ items: progressContent as ProgressItem[] });
        } else if (progressContent && typeof progressContent === "object") {
          if (
            "items" in progressContent &&
            Array.isArray(progressContent.items)
          ) {
            setCmsProgress(progressContent as ProgressContent);
          } else {
            const obj = progressContent as Partial<ProgressContent>;
            setCmsProgress({
              tag: obj.tag,
              heading: obj.heading,
              paragraphs: obj.paragraphs,
              items: obj.items || [],
            });
          }
        } else {
          setCmsProgress(null);
        }
      })

      .catch(() => {
        /* silently use defaults */
      })
      .finally(() => {
        setPageLoading(false);
      });
    loadData();
  }, []);

  // Merge CMS with defaults
  const hero: WholesaleHero = {
    badge: cmsHero?.badge,
    heading: cmsHero?.heading,
    headingHighlight: cmsHero?.headingHighlight,
    description: cmsHero?.description,
    primaryCta: cmsHero?.primaryCta,
    secondaryCta: cmsHero?.secondaryCta,
    client_stat: cmsHero?.client_stat,
    export_stat: cmsHero?.export_stat,
    product_stat: cmsHero?.product_stat,
  };
  const wholesale_why = cmsWhy || { items: [] };
  //  map value icons
  const values =
    wholesale_why?.items && wholesale_why.items.length > 0
      ? wholesale_why.items.map((v) => ({
          icon: ICON_MAP[v.icon] ?? Package,
          title: v.title,
          description: v.description,
        }))
      : [];
  const destinationcontent = cmsDestination || { items: [] };
  const destinationVal =
    destinationcontent?.items && destinationcontent.items.length > 0
      ? destinationcontent.items.map((v) => ({
          destination: v.destination,
        }))
      : [];
  const progresscontent = cmsProgress || { items: [] };
  const progressVal =
    progresscontent?.items && progresscontent.items.length > 0
      ? progresscontent.items.map((v) => ({
          number: v.number,
          title: v.title,
          description: v.description,
        }))
      : [];
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Replace with apiPost('/api/wholesale/inquiry', form) when endpoint is ready
    try {
      await apiPost("/api/inquiry/create", {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        country: form.country.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        productInterest: form.productInterest.trim(),
        message: form.message.trim(),
        estimatedQuantity: form.estimatedQuantity.trim(),
      });
      setTimeout(() => {
        setIsLoading(false);
        setSubmitted(true);
      }, 1200);
    } catch (error) {
      console.debug("Failed", error);
    }
  };

  if (pageLoading) {
    return <PageShellSkeleton />;
  }

  return (
    <>
      <Navbar />
      <main className="wholesale-page fade-in-content">
        {/* ── Hero ── */}
        <section className="wholesale-hero">
          <div className="wholesale-hero-inner">
            <span className="ws-tag">
              <Globe size={14} /> {hero.badge}
            </span>
            <h1>
              {hero.heading}
              <br />
              <span className="highlight-orange">{hero.headingHighlight}</span>
            </h1>
            <p>{hero.description}</p>
            <div className="ws-hero-actions">
              <a href={hero.primaryCta?.to} className="btn btn-secondary">
                {hero.primaryCta?.label}
              </a>
              <a href={hero.secondaryCta?.to} className="btn btn-outline-white">
                {hero.secondaryCta?.label}
              </a>
            </div>
            <div className="ws-hero-stats">
              <div className="ws-hero-stat">
                <strong>{hero.client_stat?.stat_number}</strong>
                <span>{hero.client_stat?.stat_label}</span>
              </div>
              <div className="ws-hero-stat">
                <strong>{hero.export_stat?.stat_number}</strong>
                <span>{hero.export_stat?.stat_label}</span>
              </div>
              <div className="ws-hero-stat">
                <strong>{hero.product_stat?.stat_number}</strong>
                <span>{hero.product_stat?.stat_label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="ws-benefits">
          <div className="ws-section-header">
            <span className="section-tag">{wholesale_why.tag}</span>
            <h2>{wholesale_why.heading}</h2>
            <p>{wholesale_why.paragraphs}</p>
          </div>
          <div className="benefits-grid">
            {values.map(({ icon: Icon, title, description }) => (
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
        {/* <section className="ws-products">
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
        </section> */}

        {/* ── Exports ── */}
        <section className="ws-exports">
          <div className="ws-exports-inner">
            <div className="ws-exports-text">
              <span className="section-tag section-tag-light">
                {destinationcontent.tag}
              </span>
              <h2>{destinationcontent.heading}</h2>
              <p>{destinationcontent.paragraphs}</p>
              <div className="export-destinations">
                {destinationVal.map((dest) => (
                  <span key={dest.destination} className="export-badge">
                    <CheckCircle size={13} /> {dest.destination}
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
            <span className="section-tag">{progresscontent.tag}</span>
            <h2>{progresscontent.heading}</h2>
            <p>{progresscontent.paragraphs}</p>
          </div>
          <div className="process-steps">
            {progressVal.map((step, index) => (
              <div key={step.number} className="process-step">
                <div className="step-number">{step.number}</div>
                <div
                  className="step-connector"
                  style={{
                    display: index < progressVal.length - 1 ? "block" : "none",
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
                {primaryNumber && (
                  <a href={`tel:${primaryNumber}`} className="ws-contact-link">
                    <Phone size={16} /> {primaryNumber}
                  </a>
                )}
                {secondaryNumber && (
                  <a
                    href={`tel:${secondaryNumber}`}
                    className="ws-contact-link"
                  >
                    <Phone size={16} /> {secondaryNumber}
                  </a>
                )}

                {primaryEmail && (
                  <a
                    href={`mailto:${primaryEmail}`}
                    className="ws-contact-link"
                  >
                    <Mail size={16} /> {primaryEmail}
                  </a>
                )}
                {secondaryEmail && (
                  <a
                    href={`mailto:${secondaryEmail}`}
                    className="ws-contact-link"
                  >
                    <Mail size={16} /> {secondaryEmail}
                  </a>
                )}
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
                    <label htmlFor="ws-company text-gray-800">
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
                    <input
                      id="ws-product"
                      type="text"
                      name="productInterest"
                      value={form.productInterest}
                      onChange={handleChange}
                      placeholder="e.g. Organic Avocados, Fresh Tomatoes..."
                    />
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
      <Footer />
    </>
  );
}

export default Wholesale;
