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

// ── TypeScript shapes matching the CMS section content JSON ──
interface HeroContent {
  location?: string;
  heading?: string;
  headingHighlight?: string;
  description?: string;
  cta?: { label: string; to: string };
  stat_top?: { stat_number: number; stat_label: string };
  stat_bottom?: { stat_number: number; stat_label: string };
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
interface TeamContent {
  name?: string;
  role?: string;
  initials?: string;
  phone_number?: string;
  email?: string
}
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

// Import centered page loader component
import Loader from '../../components/Loader/Loader';

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
  const [cmsTeam, setCmsTeam] = useState<TeamContent[] | null>(null);

  // Lifecycle effect: Query MariaDB for 'about' page CMS sections on mount
  useEffect(() => {

    async function loadData() {
      try {
        const teams = await apiGet<{ status: boolean; data: TeamContent[] }>('/api/team');
        if (teams?.status && Array.isArray(teams?.data)) {
          setCmsTeam(teams.data);
        }


      } catch (error) {
        console.debug('Failed to load', error);
        setCmsTeam([]);
      }

    }

    apiGet<{ success: boolean; data: { sections: CmsSection[] } }>('/api/pages/slug/about')
      .then((res) => {
        if (!res.success || !res.data?.sections) return;
        const sections = res.data.sections;
        setSections(sections);
        const find = <T,>(type: string): T | null => {
          const s = sections.find((sec) => sec.type === type);
          return s ? (s.content as T) : null;
        };
        // check if section type is about-hero
        setCmsAboutHero(find<HeroContent>('about-hero'));
        // now let's check if section type is about-stats-bar
        const stats_value = sections.find((sec) => sec.type === 'about-stats-bar');

        const StatValue = stats_value?.content;
        setCmsStat(
          Array.isArray(StatValue)
            ? { items: StatValue as StatsContentItem[] } :
            (StatValue as StatsContent) ?? null
        );
        // our story section
        setCmsStory(find<StoryContent>('about-story'));
        // mission and vission
        const mission_content = sections.find((sec) => sec.type === 'about-values');
        const missionValue = mission_content?.content;

        // Properly handle the values content
        if (Array.isArray(missionValue)) {
          // If it's an array, wrap it in an object with items
          setCmsMission({ items: missionValue as ValuesContentItem[] });
        } else if (missionValue && typeof missionValue === 'object') {
          // If it's an object with items property
          if ('items' in missionValue && Array.isArray(missionValue.items)) {
            setCmsMission(missionValue as ValuesContent);
          } else {
            // If it's an object but no items, treat it as the content with tag, heading, etc.
            const mv = missionValue as ValuesContent;
            setCmsMission({
              tag: mv.tag,
              heading: mv.heading,
              subheading: mv.subheading,
              vision: mv.vision,
              mission: mv.mission,
              items: mv.items || []
            });
          }
        } else {
          setCmsMission(null);
        }

      })
      .catch(() => { /* silently fall back to hardcoded defaults */ })
      .finally(() => { setLoading(false); });
    loadData();
  }, []);

  // Helper method: Extracts specific CMS section content by type string
  const getSection = <T,>(type: string): T | null => {
    const s = sections.find((sec) => sec.type === type);
    return s ? (s.content as T) : null;
  };

  // Hydrate from CMS or fall back to defaults
  const hero: HeroContent = {
    location: cmsAboutHero?.location,
    heading: cmsAboutHero?.heading,
    headingHighlight: cmsAboutHero?.headingHighlight,
    cta: cmsAboutHero?.cta,
    stat_top: cmsAboutHero?.stat_top,
    stat_bottom: cmsAboutHero?.stat_bottom,
    description: cmsAboutHero?.description
  }


  const stories: StoryContent = {
    tag: cmsStory?.tag,
    heading: cmsStory?.heading,
    paragraphs: cmsStory?.paragraphs
  }
  // console.log(stories);
  const valuesContent = cmsMission || { items: [] };

  // Map values to icons
  const values = valuesContent?.items && valuesContent.items.length > 0
    ? valuesContent.items.map((v) => ({
      icon: ICON_MAP[v.icon] ?? Leaf,
      title: v.title,
      description: v.description,
    }))
    : [];



  const ctaSection = getSection<CtaContent>('cta');
  // stat action bar 
  const stats = cmsStat?.items ?? [];

  const team = cmsTeam || [];

  // Render a stable page shell (header) with a centered loader while fetching
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="about-page">
          <Loader text="Loading farm story and credentials from database..." />
        </main>
      </>
    );
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
            <h2>{stories?.heading}</h2>
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
            <span className="section-tag">{valuesContent?.tag}</span>
            <h2>{valuesContent?.heading}</h2>
            <p>
              {valuesContent?.subheading}
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
            <span className="section-tag">The People Behind the Farm</span>
            <h2>Meet Our Team</h2>
          </div>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.name} className="team-card card">
                <div className="team-avatar">{member.initials}</div>
                <h3>{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <p className='text-sm'>{member.email}</p>
                <p className='text-sm'>{member.phone_number}</p>
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
