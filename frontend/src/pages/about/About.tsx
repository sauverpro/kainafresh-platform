import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, ShieldCheck, Award, ArrowRight, MapPin } from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import pepperImage from '../../assets/images/pepper.png';
import { apiGet } from '../../api/client';
import { usePageTitle } from '../../hooks/usePageTitle';
import './About.css';

/**
 * About Us Page
 * Fetches content from: GET /api/pages/slug/about
 * Section types: hero, stats_bar, story, values, team, cta
 * Falls back to hardcoded defaults if the page is not yet seeded in the CMS.
 */

// Icon map: CMS stores icon names as strings, we map them to lucide-react components
const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Leaf, ShieldCheck, Users, Award,
};



const DEFAULT_VALUES = [
  { icon: Leaf, title: 'Sustainable Farming', description: 'We use eco-friendly practices that protect the soil, water, and biodiversity for generations to come.' },
  { icon: ShieldCheck, title: 'Quality & Safety', description: 'Every product is inspected, packed, and handled under strict quality standards before it reaches you.' },
  { icon: Users, title: 'Community First', description: 'We work directly with local communities, creating fair employment and supporting local economies.' },
  { icon: Award, title: 'Farm Transparency', description: 'From seed to delivery, we believe you deserve to know exactly where your food comes from.' },
];

const DEFAULT_TEAM = [
  { name: 'Jean-Pierre Uwimana', role: 'Founder & Farm Director', initials: 'JU' },
  { name: 'Amina Keza', role: 'Head of Operations', initials: 'AK' },
  { name: 'David Mugisha', role: 'Export & Logistics Manager', initials: 'DM' },
];

// ── TypeScript shapes matching the CMS section content JSON ──
interface HeroContent { 
  location?: string; 
  heading?: string;
   headingHighlight?: string; 
   description?: string; 
   cta?: { label: string; to: string } ;
   stat_top?: {stat_number:number; stat_label:string};
   stat_bottom?: {stat_number:number; stat_label:string};
  }

interface StatsContentItem { iconName?: string; icon?: string; title: string; description: string }
interface StatsContent { tag?: string; heading?: string; items?: StatsContentItem[] }

interface StoryContent { tag?: string; heading?: string; paragraphs?: string[] }
interface ValuesContent { tag?: string; heading?: string; subheading?: string; items?: { iconName: string; title: string; description: string }[] }
interface TeamContent { tag?: string; heading?: string; members?: { name: string; role: string; initials: string }[] }
interface CtaContent { heading?: string; subheading?: string; primaryCta?: { label: string; to: string }; secondaryCta?: { label: string; to: string } }

interface CmsSection { type: string; content: HeroContent & StatsContent & StoryContent & ValuesContent & TeamContent & CtaContent }

import PageLoader from '../../components/PageLoader/PageLoader';

function About() {
  usePageTitle('about', 'About');
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [cmsAboutHero, setCmsAboutHero] = useState<HeroContent | null>(null);
  const [cmsStat, setCmsStat] = useState<StatsContent | null>(null);

  useEffect(() => {
    setLoading(true);
    apiGet<{ success: boolean; data: { sections: CmsSection[] } }>('/api/pages/slug/about')
      .then((res) => { 
        if (!res.success || !res.data?.sections) return;
        const sections = res.data.sections;
        const find = <T,>(type: string): T | null => {
          const s = sections.find((sec) => sec.type === type);
          return s ? (s.content as T) : null;
        };
        // check if section type is about-hero
        setCmsAboutHero(find<HeroContent>('about-hero'));
        // now let's check if section type is about-stats-bar
        const stats_value = sections.find((sec)=>sec.type === 'about-stats-bar');
        
        const StatValue = stats_value?.content;
        setCmsStat(
          Array.isArray(StatValue)
            ? {items: StatValue as StatsContentItem []} :
            (StatValue as StatsContent) ?? null
        );

        
        

       })
      .catch(() => { /* silently fall back to hardcoded defaults */ })
      .finally(() => { setLoading(false); });
  }, []);

  // Helper: find a section of a given type from the CMS response
  const getSection = <T,>(type: string): T | null => {
    const s = sections.find((sec) => sec.type === type);
    return s ? (s.content as T) : null;
  };

  // Hydrate from CMS or fall back to defaults
  const hero :HeroContent = {
    location: cmsAboutHero?.location,
    heading: cmsAboutHero?.heading,
    headingHighlight: cmsAboutHero?.headingHighlight,
    cta: cmsAboutHero?.cta,
    stat_top: cmsAboutHero?.stat_top,
    stat_bottom: cmsAboutHero?.stat_bottom,
    description : cmsAboutHero?.description
  }
  const statsBar = getSection<StatsContent>('stats_bar');
  const story = getSection<StoryContent>('story');
  const valuesSection = getSection<ValuesContent>('values');
  const teamSection = getSection<TeamContent>('team');
  const ctaSection = getSection<CtaContent>('cta');

  const stats = cmsStat?.items ;

  
  const values = valuesSection?.items
    ? valuesSection.items.map((v) => ({ icon: ICON_MAP[v.iconName] ?? Leaf, title: v.title, description: v.description }))
    : DEFAULT_VALUES;
  const team = teamSection?.members ?? DEFAULT_TEAM;

  if (loading) {
    return <PageLoader text="Loading farm story and credentials from database..." />;
  }

  return (
    <>
      <Navbar />
      <main className="about-page fade-in-content">

        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-tag">
              <MapPin size={14} /> {hero.location}
            </span>
            <h1>
              {hero?.heading ?? 'Growing Fresh.'}<br />
              
            </h1>
             <h2 className="text-2xl">
              <span className="highlight-orange">{hero?.headingHighlight ?? 'Building Community.'}</span>
             </h2>
            <p>
              {hero?.description ?? 'KainaFresh is a Rwanda-based farm dedicated to producing premium, organic agricultural produce — from our fields directly to your table.'}
            </p>
            <Link to={hero?.cta?.to ?? '/contact'} className="btn btn-primary">
              {hero?.cta?.label ?? 'Get in Touch'} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="about-hero-visual">
            <img src={pepperImage} alt="Fresh KainaFresh Pepper" className="about-hero-image" />
            <div className="about-stat-card stat-card-1">
              <strong>{hero.stat_top?.stat_number}+</strong>
              <span>{hero.stat_top?.stat_label}</span>
            </div>
            <div className="about-stat-card stat-card-2">
              <strong>{hero.stat_bottom?.stat_number}</strong>
              <span>{hero.stat_bottom?.stat_label}</span>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="about-stats-bar">
          {stats.map((stat) => (
            <div key={stat.label} className="stats-bar-item">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        {/* ── Our Story ── */}
        <section className="about-story">
          <div className="about-story-text">
            <span className="section-tag">{story?.tag ?? 'Our Story'}</span>
            <h2>{story?.heading ?? 'From a small plot of land to a thriving farm.'}</h2>
            {(story?.paragraphs ?? [
              'KainaFresh started with a simple belief: that Rwandans deserve access to food that is genuinely fresh, honestly grown, and responsibly delivered.',
              'Today, we manage over 20 varieties of produce — from tomatoes and avocados to seasonal greens and tropical fruits.',
            ]).map((para, i) => <p key={i}>{para}</p>)}
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
            <span className="section-tag">{valuesSection?.tag ?? 'What We Stand For'}</span>
            <h2>{valuesSection?.heading ?? 'Our Mission & Values'}</h2>
            <p>
              {valuesSection?.subheading ?? 'Everything we do is guided by a commitment to freshness, sustainability, and the communities that make our farm possible.'}
            </p>
          </div>
          <div className="values-grid">
            {values.map(({ icon: Icon, title, description }) => (
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
            <span className="section-tag">{teamSection?.tag ?? 'The People Behind the Farm'}</span>
            <h2>{teamSection?.heading ?? 'Meet Our Team'}</h2>
          </div>
          <div className="team-grid">
            {team.map((member) => (
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
            <h2>{ctaSection?.heading ?? 'Ready to taste the difference?'}</h2>
            <p>{ctaSection?.subheading ?? 'Order fresh produce from KainaFresh or get in touch to learn more about our farm.'}</p>
            <div className="about-cta-buttons">
              <Link to={ctaSection?.primaryCta?.to ?? '/'} className="btn btn-primary">{ctaSection?.primaryCta?.label ?? 'Shop Now'}</Link>
              <Link to={ctaSection?.secondaryCta?.to ?? '/contact'} className="btn btn-secondary">{ctaSection?.secondaryCta?.label ?? 'Contact Us'}</Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

export default About;
