import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Users, ShieldCheck, Award, ArrowRight, MapPin, Target, Eye, Sparkles } from 'lucide-react';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import PartnersSection from '../../components/partners/PartnersSection';
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

        // team section
        const teamSec = sections.find((sec) => sec.type === 'team' || sec.type === 'about-team');
        if (teamSec?.content) {
          const content = teamSec.content as Record<string, unknown>;
          const members = (content.members || content.items || (Array.isArray(content) ? content : null)) as TeamContent[] | null;
          if (Array.isArray(members) && members.length > 0) {
            setCmsTeam(members);
          }
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
        <section className="about-values bg-[#FFFDF9] py-20 px-6 md:px-[5%]">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#F39927] bg-[#F39927]/10 px-4 py-1.5 rounded-full mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                <Sparkles size={14} /> {valuesContent?.tag || 'Purpose & Principles'}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#076935] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {valuesContent?.heading || 'Guided by Vision, Driven by Quality'}
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {valuesContent?.subheading || 'At KainaFresh, every harvest is rooted in our commitment to sustainable farming, community empowerment, and uncompromised food safety.'}
              </p>
            </div>

            {/* Premium Vision & Mission Highlight Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Vision Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#076935] via-[#06582d] to-[#044020] p-8 md:p-10 text-white shadow-xl flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                <div>
                  <div className="inline-flex items-center gap-2.5 bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full text-sm md:text-base font-bold uppercase tracking-wider mb-6 text-white shadow-sm border border-white/20" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Eye size={20} className="text-[#F39927]" /> Our Vision
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    Leading East Africa's Sustainable Harvest
                  </h3>
                  <p className="text-white/85 text-base md:text-lg leading-relaxed font-sans">
                    {valuesContent?.vision || 'To be a leading East African producer and exporter of fresh, high-quality horticultural products, recognized for our sustainable practices and unwavering commitment to excellence.'}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-2 text-xs font-semibold text-white/70">

                </div>
              </div>

              {/* Mission Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F39927] via-[#e58a1c] to-[#d8821a] p-8 md:p-10 text-white shadow-xl flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                <div>
                  <div className="inline-flex items-center gap-2.5 bg-white/25 backdrop-blur-md px-6 py-2.5 rounded-full text-sm md:text-base font-bold uppercase tracking-wider mb-6 text-white shadow-sm border border-white/20" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Target size={20} className="text-white" /> Our Mission
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    Cultivating Trust from Farm to Door
                  </h3>
                  <p className="text-white/90 text-base md:text-lg leading-relaxed font-sans">
                    {valuesContent?.mission || 'To consistently cultivate and supply premium, safe, and healthy produce to local and international markets while fostering sustainable agriculture and empowering our local community.'}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-2 text-xs font-semibold text-white/80">

                </div>
              </div>
            </div>

            {/* Core Values Section Subheader */}
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>
                Our Core Pillars & Values
              </h3>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group bg-white p-7 rounded-3xl border border-[#076935]/10 shadow-xs hover:shadow-xl hover:border-[#076935]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col text-left"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#076935]/10 flex items-center justify-center mb-5 text-[#076935] group-hover:bg-[#076935] group-hover:text-white transition-colors duration-300">
                    <Icon size={26} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#076935] transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                    {title}
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        {team.length > 0 && (
          <section className="about-team">
            <div className="about-team-header">
              <span className="section-tag">The People Behind the Farm</span>
              <h2>Meet Our Team</h2>
            </div>
            <div className="team-grid">
              {team.map((member, index) => (
                <div key={`team-member-${member.name || index}`} className="team-card card">
                  <div className="team-avatar">{member.initials}</div>
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p className='text-sm'>{member.email}</p>
                  <p className='text-sm'>{member.phone_number}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Partners Showcase ── */}
        <PartnersSection title="Our Strategic Partners & Cooperatives" />

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
