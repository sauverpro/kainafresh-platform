import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';
import { apiGet } from '../../api/client';

interface FooterNavLink {
  link?: string;
  link_name?: string;
}

export default function Footer() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string | null>(null);
  const [navLinks, setNavLinks] = useState<FooterNavLink[]>([]);
  const [primaryEmail, setPrimaryEmail] = useState<string | null>(null);
  const [secondaryEmail, setSecondaryEmail] = useState<string | null>(null);
  const [primaryNumber, setPrimaryNumber] = useState<string | null>(null);
  const [secondaryNumber, setSecondaryNumber] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [facebook, setFacebook] = useState<string | null>(null);
  const [instagram, setInstagram] = useState<string | null>(null);
  const [tiktok, setTiktok] = useState<string | null>(null);
  const [linkedin, setLinkedin] = useState<string | null>(null);
  const [youtube, setYoutube] = useState<string | null>(null);
 

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
     
      
      try {
        const settings = await apiGet<Record<string, unknown>>('/api/settings/');
        const settingsPayload = (settings?.data ?? settings ?? {}) as Record<string, unknown>;

        const settingData = (Array.isArray(settingsPayload)
          ? settingsPayload[0] ?? null
          : Array.isArray(settingsPayload?.results)
            ? settingsPayload.results[0] ?? null
            : settingsPayload?.settings && typeof settingsPayload.settings === 'object'
              ? settingsPayload.settings
              : settingsPayload ?? null) as Record<string, string> | null;

        if (!cancelled && settingData) {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;
          const resolvedTitle = settingData.site_title ?? settingData.siteTitle ?? settingData.title ?? 'KainaFresh';

          setAddress(settingData.address ?? null);
          setSiteTitle(resolvedTitle);
          setSecondaryEmail(settingData.secondary_email ?? null);
          setPrimaryEmail(settingData.primary_email ?? null);
          setPrimaryNumber(settingData.primary_number ?? null);
          setSecondaryNumber(settingData.secondary_number ?? null);
          setFacebook(settingData.facebook ?? null);
          setInstagram(settingData.instagram ?? null);
          setTiktok(settingData.tiktok ?? null);
          setYoutube(settingData.youtube ?? null);
          setLinkedin(settingData.linkedin ?? null);

          if (settingData.site_logo) {
            const raw = settingData.site_logo;
            const src = /^https?:\/\//.test(raw) ? raw : `${API_BASE}${raw.startsWith('/') ? raw : '/' + raw}`;
            setLogoSrc(src);
          } else {
            setLogoSrc(null);
          }
        }
      } catch (error) {
        console.debug('Failed to load settings', error);
      }

      try {
        const navigations = await apiGet<Record<string, unknown>>('/api/navlinks/nav');
        const navigationData = (navigations?.data ?? navigations?.results ?? []) as FooterNavLink[];
        if (!cancelled && Array.isArray(navigationData)) {
          setNavLinks(navigationData);
        }
      } catch (error) {
        console.debug('Failed to load navigations', error);
      }

      
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  return (
    <footer className="bg-[#FFFDF9] text-[#1F2937] border-t border-[#076935]/15 py-16 px-6 md:px-[5%] mt-16" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 max-w-7xl mx-auto">
        
        {/* Brand */}
        <div>
          {logoSrc && (
            <img 
              src={logoSrc} 
              alt={siteTitle || 'Logo'} 
              className="h-12 w-auto mb-4 object-contain"
            />
          )}
          <p className="text-xl font-bold mb-2 site-title text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>{siteTitle ?? 'KainaFresh'}</p>
          <p className="text-[#4B5563] text-sm leading-relaxed mb-6 max-w-xs">
            Delivering premium, farm-fresh organic produce directly to your door. Good for you, good for the earth.
          </p>

          {/* Social media icons with green tint background and orange hover */}
          <div className="flex gap-3 mb-6">
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#076935]/10 text-[#076935] hover:bg-[#F39927] hover:text-white transition-all hover:-translate-y-1 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#076935]/10 text-[#076935] hover:bg-[#F39927] hover:text-white transition-all hover:-translate-y-1 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            )}
            {tiktok && (
              <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#076935]/10 text-[#076935] hover:bg-[#F39927] hover:text-white transition-all hover:-translate-y-1 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#076935]/10 text-[#076935] hover:bg-[#F39927] hover:text-white transition-all hover:-translate-y-1 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            )}
            {youtube && (
              <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#076935]/10 text-[#076935] hover:bg-[#F39927] hover:text-white transition-all hover:-translate-y-1 shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links from api endpoint */}
        <div>
          <h3 className="font-semibold text-lg mb-6 tracking-wide text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>Quick Links</h3>
          <ul className="flex flex-col gap-3">
            {navLinks.length > 0 ? (
              navLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.link || '#'} 
                    className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all"
                  >
                    {link.link_name}
                  </Link>
                </li>
              ))
            ) : (
              // Fallback to static links if no navigation data from endpoint
              <>
                <li><Link to="/" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Home</Link></li>
                <li><Link to="/about" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Our Story & Farm</Link></li>
                <li><Link to="/wholesale" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Wholesale & Exports</Link></li>
                <li><Link to="/contact" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Contact Us</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Legal & Actions */}
        <div>
          <h3 className="font-semibold text-lg mb-6 tracking-wide text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>Legal & Info</h3>
          <ul className="flex flex-col gap-3 mb-6">
            <li><Link to="#" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
            <li><Link to="#" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Terms of Service</Link></li>
            <li><Link to="#" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Refund Policy</Link></li>
            <li><Link to="#" className="text-[#374151] text-sm hover:text-[#F39927] hover:translate-x-1 inline-block transition-all">Shipping Info</Link></li>
          </ul>

          {/* Quick Action Button */}
          <Link 
            to="/wholesale" 
            className="inline-flex items-center gap-2 bg-[#F39927] hover:bg-[#d8821a] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xs transition-all hover:scale-105"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Bulk Orders & Exports
          </Link>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-semibold text-lg mb-6 tracking-wide text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>Contact Us</h3>
          <ul className="flex flex-col gap-4 mb-6">
            {primaryNumber && (
              <li className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-8 h-8 rounded-full bg-[#F39927]/15 flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-[#F39927]" />
                </div>
                <a href={`tel:${primaryNumber}`} className="hover:text-[#F39927] font-medium transition-colors">
                  {primaryNumber}
                </a>
              </li>
            )}
            {secondaryNumber && (
              <li className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-8 h-8 rounded-full bg-[#F39927]/15 flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-[#F39927]" />
                </div>
                <a href={`tel:${secondaryNumber}`} className="hover:text-[#F39927] font-medium transition-colors">
                  {secondaryNumber}
                </a>
              </li>
            )}
            {primaryEmail && (
              <li className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-8 h-8 rounded-full bg-[#076935]/10 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-[#076935]" />
                </div>
                <a href={`mailto:${primaryEmail}`} className="hover:text-[#F39927] font-medium transition-colors">
                  {primaryEmail}
                </a>
              </li>
            )}
            {secondaryEmail && (
              <li className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-8 h-8 rounded-full bg-[#076935]/10 flex items-center justify-center shrink-0">
                  <Mail size={15} className="text-[#076935]" />
                </div>
                <a href={`mailto:${secondaryEmail}`} className="hover:text-[#F39927] font-medium transition-colors">
                  {secondaryEmail}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-center gap-3 text-[#374151] text-sm">
                <div className="w-8 h-8 rounded-full bg-[#076935]/10 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-[#076935]" />
                </div>
                <span>{address}</span>
              </li>
            )}
          </ul>

          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 bg-[#076935] hover:bg-[#055028] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xs transition-all hover:scale-105"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Send Inquiry Form
          </Link>
        </div>

      </div>

      <div className="border-t border-[#076935]/15 pt-8 text-center max-w-7xl mx-auto">
        <p className="text-[#6B7280] text-sm m-0">
          &copy; {new Date().getFullYear()} <b className="site-title text-[#076935]" style={{ fontFamily: 'var(--font-heading)' }}>{siteTitle || 'Kaina Fresh'}</b>. All rights reserved. Premium Organic Produce.
        </p>
      </div>
    </footer>
  );
}