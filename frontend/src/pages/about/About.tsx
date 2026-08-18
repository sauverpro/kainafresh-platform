import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, ShieldCheck, Award, ArrowRight, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import pepperImage from '../../assets/images/pepper.png';
import './About.css';

/**
 * About Us Page
 * Content is structured to be CMS-driven.
 * TODO: Replace hardcoded data with API call to GET /api/content/about
 * See API_CONTRACT.md for the expected response shape.
 */

// Placeholder data — will come from GET /api/content/about
const STATS = [
  { value: '350+', label: 'Happy Customers' },
  { value: '5+', label: 'Years Farming' },
  { value: '100%', label: 'Organic Certified' },
  { value: '20+', label: 'Produce Varieties' },
];

const VALUES = [
  {
    icon: Leaf,
    title: 'Sustainable Farming',
    description:
      'We use eco-friendly practices that protect the soil, water, and biodiversity for generations to come.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Safety',
    description:
      'Every product is inspected, packed, and handled under strict quality standards before it reaches you.',
  },
  {
    icon: Users,
    title: 'Community First',
    description:
      'We work directly with local communities, creating fair employment and supporting local economies.',
  },
  {
    icon: Award,
    title: 'Farm Transparency',
    description:
      'From seed to delivery, we believe you deserve to know exactly where your food comes from.',
  },
];

const TEAM = [
  { name: 'Jean-Pierre Uwimana', role: 'Founder & Farm Director', initials: 'JU' },
  { name: 'Amina Keza', role: 'Head of Operations', initials: 'AK' },
  { name: 'David Mugisha', role: 'Export & Logistics Manager', initials: 'DM' },
];

function About() {
  return (
    <>
      <Navbar />
      <main className="about-page">

        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-tag">
              <MapPin size={14} /> Kigali, Rwanda
            </span>
            <h1>
              Growing Fresh.<br />
              <span className="highlight-orange">Building Community.</span>
            </h1>
            <p>
              KainaFresh is a Rwanda-based farm dedicated to producing premium, organic agricultural
              produce — from our fields directly to your table. We believe fresh food should be
              accessible, honest, and good for the planet.
            </p>
            <Link to="/contact" className="btn btn-primary">
              Get in Touch <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </Link>
          </div>
          <div className="about-hero-visual">
            <img src={pepperImage} alt="Fresh KainaFresh Pepper" className="about-hero-image" />
            <div className="about-stat-card stat-card-1">
              <strong>350+</strong>
              <span>Happy Customers</span>
            </div>
            <div className="about-stat-card stat-card-2">
              <strong>100%</strong>
              <span>Organic Certified</span>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="about-stats-bar">
          {STATS.map((stat) => (
            <div key={stat.label} className="stats-bar-item">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* ── Our Story ── */}
        <section className="about-story">
          <div className="about-story-text">
            <span className="section-tag">Our Story</span>
            <h2>From a small plot of land to a thriving farm.</h2>
            <p>
              KainaFresh started with a simple belief: that Rwandans deserve access to food that is
              genuinely fresh, honestly grown, and responsibly delivered. What began as a small
              family farm in the hills of Kigali has grown into a full-scale agricultural operation
              serving hundreds of households, restaurants, and exporters across the region.
            </p>
            <p>
              Today, we manage over 20 varieties of produce — from tomatoes and avocados to seasonal
              greens and tropical fruits. Every harvest is hand-picked and quality-checked before
              packing, ensuring that what reaches you is the very best we can offer.
            </p>
          </div>
          <div className="about-story-visual">
            <div className="story-image-block story-block-main">
              <Leaf size={48} color="rgba(7, 105, 53, 0.3)" />
              <p>Farm Image</p>
            </div>
            <div className="story-image-block story-block-secondary">
              <Leaf size={32} color="rgba(243, 153, 39, 0.4)" />
              <p>Harvest</p>
            </div>
          </div>
        </section>

        {/* ── Mission & Values ── */}
        <section className="about-values">
          <div className="about-values-header">
            <span className="section-tag">What We Stand For</span>
            <h2>Our Mission & Values</h2>
            <p>
              Everything we do is guided by a commitment to freshness, sustainability, and the
              communities that make our farm possible.
            </p>
          </div>
          <div className="values-grid">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="value-card card">
                <div className="value-icon-wrap">
                  <Icon size={28} color="var(--color-primary)" strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Team ── */}
        <section className="about-team">
          <div className="about-team-header">
            <span className="section-tag">The People Behind the Farm</span>
            <h2>Meet Our Team</h2>
          </div>
          <div className="team-grid">
            {TEAM.map((member) => (
              <div key={member.name} className="team-card card">
                <div className="team-avatar">{member.initials}</div>
                <h3>{member.name}</h3>
                <span className="team-role">{member.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="about-cta">
          <div className="about-cta-inner">
            <h2>Ready to taste the difference?</h2>
            <p>Order fresh produce from KainaFresh or get in touch to learn more about our farm.</p>
            <div className="about-cta-buttons">
              <Link to="/" className="btn btn-primary">Shop Now</Link>
              <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

export default About;
