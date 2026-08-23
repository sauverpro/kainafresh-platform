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

interface StatsContentItem { value?: string, label?: string }
interface StatsContent { tag?: string; heading?: string; items?: StatsContentItem[] }

interface StoryContent { tag?: string; heading?: string; paragraphs?: string[] }
interface ValuesContentItem { icon: string; title: string; description: string; }
interface ValuesContent { 
  tag?: string; 
  heading?: string; 
  subheading?: string; 
  vision?: string; 
  mission?: string; 
  items?: ValuesContentItem[]; 
}
interface TeamContent {  name?: string; role?: string; initials?: string;phone_number?:string;email?:string }
interface CtaContent { heading?: string; subheading?: string; primaryCta?: { label: string; to: string }; secondaryCta?: { label: string; to: string } }

interface CmsSection { type: string; content: HeroContent & StatsContent & StoryContent & ValuesContent & TeamContent & CtaContent }

/**
 * ============================================================================
 * KainaFresh Organic Platform — Our Farm & About Us Page Component
 * ============================================================================
 * 
 * Features:
 * 1. CMS Page Section Hydration from MariaDB (/api/pages/slug/about).
 * 2. Farm History, Stats Bar, Mission & Values, and Team Showcase.
 * 3. Integrated glassmorphic page loading screen during database fetch.
 */

// Import PageLoader overlay component
import PageLoader from '../../components/PageLoader/PageLoader';

/**
 * About Functional Component.
 */

function About() {
  // Update document head title for SEO
  usePageTitle('about', 'About');

  // CMS sections state container
  const [sections, setSections] = useState<CmsSection[]>([]);

  // Page loading indicator state (defaults to true)
  const [loading, setLoading] = useState(true);
  const [cmsAboutHero, setCmsAboutHero] = useState<HeroContent | null>(null);
  const [cmsStat, setCmsStat] = useState<StatsContent | null>(null);
  const [cmsStory, setCmsStory] = useState<StoryContent | null>(null);
  const [cmsMission, setCmsMission] = useState<ValuesContent | null>(null);
  const [cmsTeam, setCmsTeam] = useState<TeamContent | null>(null);

  // Lifecycle effect: Query MariaDB for 'about' page CMS sections on mount
  useEffect(() => {
    setLoading(true);

    apiGet<{ success: boolean; data: { sections: CmsSection[] } }>('/api/pages/slug/about')
      .then((res) => {
        if (res.success && res.data?.sections) {
          const sections = res.data.sections;
          setSections(sections);

          const find = <T,>(type: string): T | null => {
            const s = sections.find((sec) => sec.type === type);
            return s ? (s.content as T) : null;
          };

          const aboutHeroSec = sections.find((sec) => sec.type === 'about-hero');
          if (aboutHeroSec) setCmsAboutHero(aboutHeroSec.content as HeroContent);

          const statsValue = sections.find((sec) => sec.type === 'about-stats-bar')?.content;
          setCmsStat(
            Array.isArray(statsValue)
              ? { items: statsValue as StatsContentItem[] }
              : (statsValue as StatsContent) ?? null
          );

          setCmsStory(find<StoryContent>('about-story'));

          const missionContent = sections.find((sec) => sec.type === 'about-values')?.content;
          const missionValue = missionContent;

          if (Array.isArray(missionValue)) {
            setCmsMission({ items: missionValue as ValuesContentItem[] });
          } else if (missionValue && typeof missionValue === 'object') {
            if ('items' in missionValue && Array.isArray(missionValue.items)) {
              setCmsMission(missionValue as ValuesContent);
            } else {
              setCmsMission({
                tag: (missionValue as any).tag,
                heading: (missionValue as any).heading,
                subheading: (missionValue as any).subheading,
                vision: (missionValue as any).vision,
                mission: (missionValue as any).mission,
                items: (missionValue as any).items || []
              });
            }
          } else {
            setCmsMission(null);
          }
        }
      })
      .catch(() => {
        // Fall back gracefully to hardcoded defaults
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  // Helper method: Extracts specific CMS section content by type string
  const getSection = <T,>(type: string): T | null => {
    const s = sections.find((sec) => sec.type === type);
    return s ? (s.content as T) : null;
  };

  // Hydrate from CMS or fall back to defaults
  const heroFromSection = getSection<HeroContent>('hero');
  const hero: HeroContent = {
    location: cmsAboutHero?.location ?? heroFromSection?.location ?? 'Musanze & Bugesera, Rwanda',
    heading: cmsAboutHero?.heading ?? heroFromSection?.heading ?? 'Growing Fresh.',
    headingHighlight: cmsAboutHero?.headingHighlight ?? heroFromSection?.headingHighlight ?? 'Building Community.',
    description: cmsAboutHero?.description ?? heroFromSection?.description ?? 'KainaFresh is a Rwanda-based farm dedicated to producing premium, organic agricultural produce — from our fields directly to your table.',
    cta: cmsAboutHero?.cta ?? heroFromSection?.cta ?? { label: 'Get in Touch', to: '/contact' },
    stat_top: cmsAboutHero?.stat_top ?? heroFromSection?.stat_top ?? { stat_number: 50, stat_label: 'Hectares Farmed' },
    stat_bottom: cmsAboutHero?.stat_bottom ?? heroFromSection?.stat_bottom ?? { stat_number: 100, stat_label: 'Organic Certified' },
  };

  const statsBar = getSection<StatsContent>('stats_bar');
  const story = getSection<StoryContent>('story');
  const stories: StoryContent = {
    tag: cmsStory?.tag ?? story?.tag,
    heading: cmsStory?.heading ?? story?.heading,
    paragraphs: cmsStory?.paragraphs ?? story?.paragraphs
  };

  const valuesSection = getSection<ValuesContent>('values');
  const valuesContent = cmsMission ?? valuesSection ?? { items: [] };

  const teamSection = getSection<TeamContent>('team');
  const ctaSection = getSection<CtaContent>('cta');

  const teamSection = getSection<TeamContent>('team');
  const ctaSection = getSection<CtaContent>('cta');
  // stat action bar 
  const stats = cmsStat?.items;

  const stats = cmsStat?.items ?? statsBar?.items ?? DEFAULT_STATS;
  const values = valuesContent?.items && valuesContent.items.length > 0
    ? valuesContent.items.map((v) => ({
        icon: ICON_MAP[v.iconName ?? v.icon] ?? Leaf,
        title: v.title,
        description: v.description,
      }))
    : DEFAULT_VALUES;

  const team = teamSection?.members ?? DEFAULT_TEAM;

  const team = teamSection?.members ?? DEFAULT_TEAM;

  // Render glassmorphic page loader overlay if data is fetching
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
            <span className="section-tag">{stories?.tag}</span>
            <h2>{stories?.heading }</h2>
            <p>{stories.paragraphs}</p>
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
            <span className="section-tag">{valuesContent?.tag }</span>
            <h2>{valuesContent?.heading }</h2>
            <p>
              {valuesContent?.subheading }
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-3 pt-3">
              <div className="value-card card">
                <h2 className='text-3xl'>Our Vision</h2>
                <p className='pt-3'>
                  {valuesContent?.vision}

                </p>
              </div>
              <div className="value-card card">
                <h2 className='text-3xl'>Our Mission</h2>
                <p className='pt-3'>
                  {valuesContent.mission}
                </p>
              </div>

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
