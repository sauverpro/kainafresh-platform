import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Globe, Send, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';
import { apiGet } from '../../api/client';
import './Contact.css';

/**
 * Contact Us Page
 * Hero/banner text: GET /api/pages/slug/contact (CMS section type: "hero")
 * Contact details:  GET /api/settings  (phone, email, address, social links)
 * Contact form:     POST /api/contact — NOT YET IMPLEMENTED. Uses console.log mock.
 */

// Settings shape from GET /api/settings (response is an array: [0]="settings", [1]=data)
interface SiteSettings {
  site_title?: string;
  primary_email?: string;
  secondary_email?: string;
  primary_number?: string;
  secondary_number?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
}

interface HeroContent {
  badge?: string;
  heading?: string;
  subheading?: string;
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

function Contact() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [hero, setHero] = useState<HeroContent>({});
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch CMS page data for the hero section
    apiGet<{ success: boolean; data: { sections: { type: string; content: HeroContent }[] } }>('/api/pages/slug/contact')
      .then((res) => {
        if (res.success && res.data?.sections) {
          const heroSection = res.data.sections.find((s) => s.type === 'hero');
          if (heroSection) setHero(heroSection.content);
        }
      })
      .catch(() => { /* silently fall back to defaults */ });

    // Fetch site settings for contact info
    // NOTE: Backend returns ["settings", {...}] — we read index [1]
    apiGet<[string, SiteSettings]>('/api/settings')
      .then((res) => { if (res[1]) setSettings(res[1]); })
      .catch(() => { /* silently fall back */ });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // POST /api/contact is not yet implemented — using mock
    console.log('Contact form submission (mock):', form);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const socialLinks = [
    { label: 'Facebook', url: settings.facebook },
    { label: 'Instagram', url: settings.instagram },
    { label: 'TikTok', url: settings.tiktok },
    { label: 'LinkedIn', url: settings.linkedin },
    { label: 'YouTube', url: settings.youtube },
  ].filter((s) => s.url);

  return (
    <>
      <Navbar />
      <main className="contact-page">

        {/* ── Hero Banner ── */}
        <section className="contact-hero">
          <div className="contact-hero-inner">
            <span className="contact-tag">
              <Mail size={14} /> {hero.badge ?? 'Contact KainaFresh'}
            </span>
            <h1>
              {hero.heading ?? 'Get in'}{' '}
              <span className="contact-accent">{hero.heading ? '' : 'Touch'}</span>
            </h1>
            <p>{hero.subheading ?? "We'd love to hear from you. Reach out with questions, wholesale inquiries, or feedback."}</p>
          </div>
          <div className="contact-hero-orb" aria-hidden="true" />
        </section>

        {/* ── Info + Form Grid ── */}
        <section className="contact-body">
          <div className="contact-body-inner">

            {/* Left: Info Cards */}
            <div className="contact-info-col">
              <h2 className="contact-info-heading">How to Reach Us</h2>

              <div className="contact-info-card">
                <div className="contact-info-icon-wrap">
                  <Phone size={22} color="var(--color-primary)" />
                </div>
                <div>
                  <span className="contact-info-label">Phone</span>
                  <a href={`tel:${settings.primary_number ?? '+250700000000'}`} className="contact-info-value">
                    {settings.primary_number ?? '+250 700 000 000'}
                  </a>
                  {settings.secondary_number && (
                    <a href={`tel:${settings.secondary_number}`} className="contact-info-value contact-info-secondary">
                      {settings.secondary_number}
                    </a>
                  )}
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon-wrap">
                  <Mail size={22} color="var(--color-primary)" />
                </div>
                <div>
                  <span className="contact-info-label">Email</span>
                  <a href={`mailto:${settings.primary_email ?? 'hello@kainafresh.rw'}`} className="contact-info-value">
                    {settings.primary_email ?? 'hello@kainafresh.rw'}
                  </a>
                  {settings.secondary_email && (
                    <a href={`mailto:${settings.secondary_email}`} className="contact-info-value contact-info-secondary">
                      {settings.secondary_email}
                    </a>
                  )}
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon-wrap">
                  <MapPin size={22} color="var(--color-primary)" />
                </div>
                <div>
                  <span className="contact-info-label">Location</span>
                  <span className="contact-info-value">{settings.address ?? 'KG 123 St, Kigali, Rwanda'}</span>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon-wrap">
                  <Clock size={22} color="var(--color-primary)" />
                </div>
                <div>
                  <span className="contact-info-label">Working Hours</span>
                  <span className="contact-info-value">Mon – Sat: 8am – 6pm</span>
                  <span className="contact-info-value contact-info-secondary">Sunday: Closed</span>
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="contact-socials">
                  <span className="contact-info-label">Follow Us</span>
                  <div className="contact-social-links">
                    {socialLinks.map(({ label, url }) => (
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="contact-social-btn" aria-label={label}>
                        <Globe size={18} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-col">
              {submitted ? (
                <div className="contact-success">
                  <CheckCircle size={52} color="var(--color-primary)" />
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our team will get back to you within 24 business hours.</p>
                  <button className="btn btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <h2 className="contact-form-heading">Send Us a Message</h2>
                  <p className="contact-form-sub">Fill in the form below and we'll get back to you promptly.</p>

                  <div className="contact-form-row">
                    <div className="form-group">
                      <label htmlFor="contact-name">Your Name *</label>
                      <input id="contact-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-email">Email Address *</label>
                      <input id="contact-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" required />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="form-group">
                      <label htmlFor="contact-phone">Phone Number</label>
                      <input id="contact-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+250 700 000 000" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact-subject">Subject</label>
                      <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange}>
                        <option value="">Select a topic</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Wholesale / Bulk Order">Wholesale / Bulk Order</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Product Question">Product Question</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">Message *</label>
                    <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} placeholder="Tell us how we can help..." rows={5} required />
                  </div>

                  <button type="submit" className={`btn btn-primary contact-submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                    {isLoading ? <span className="spinner" /> : <><Send size={16} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>

      </main>
    </>
  );
}

export default Contact;
