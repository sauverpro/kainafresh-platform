import { useState, useEffect } from 'react';
import { Handshake, ExternalLink, Leaf } from 'lucide-react';
import { apiGet } from '../../api/client';

export interface PartnerItem {
  id: number | string;
  partner_name: string;
  partner_logo?: string;
  logo?: string;
  partner_link?: string;
  link?: string;
}

interface PartnersSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PartnersSection({
  title = 'Our Trusted Partners & Cooperatives',
  subtitle = 'Collaborating with certified farm cooperatives, exporters, and agricultural leaders across Rwanda.',
  className = '',
}: PartnersSectionProps) {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  useEffect(() => {
    let cancelled = false;

    async function loadPartners() {
      try {
        const res = await apiGet<{ status?: boolean; success?: boolean; data?: PartnerItem[] | PartnerItem }>('/api/partners');
        let list: PartnerItem[] = [];

        if (res?.data) {
          if (Array.isArray(res.data)) {
            list = res.data;
          } else if (typeof res.data === 'object') {
            list = [res.data];
          }
        } else if (Array.isArray(res)) {
          list = res;
        }

        if (!cancelled) {
          setPartners(list);
        }
      } catch (err) {
        console.debug('Failed to load partners from API', err);
        if (!cancelled) setPartners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPartners();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveLogo = (logoPath?: string) => {
    if (!logoPath) return null;
    if (/^https?:\/\//.test(logoPath)) return logoPath;
    return `${API_BASE}${logoPath.startsWith('/') ? logoPath : '/' + logoPath}`;
  };

  if (loading || partners.length === 0) {
    return null; // Silent hide if no partners exist in DB
  }

  return (
    <section className={`py-16 px-6 md:px-[5%] bg-white border-y border-[#076935]/10 ${className}`}>
      <div className="max-w-7xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#076935] bg-[#076935]/10 px-4 py-1.5 rounded-full mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          <Handshake size={15} /> Strategic Collaborations
        </span>

        <h2 className="text-3xl md:text-4xl font-bold text-[#076935] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>

        <p className="text-gray-600 text-base max-w-2xl mx-auto mb-10">
          {subtitle}
        </p>

        {/* Partners Display Grid or Empty State */}
        {partners.length === 0 ? (
          <div className="p-8 bg-[#FFFDF9] rounded-2xl border border-[#076935]/10 max-w-md mx-auto text-center">
            <Handshake size={36} className="mx-auto mb-3 text-[#076935]/40" />
            <p className="text-gray-600 text-sm font-medium m-0">
              No current partners listed yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {partners.map((partner) => {
              const logoUrl = resolveLogo(partner.partner_logo || partner.logo);
              const partnerUrl = partner.partner_link || partner.link || '#';
              const hasLink = partnerUrl && partnerUrl !== '#';

              const CardContent = (
                <div className="group h-full flex flex-col items-center justify-center p-6 bg-[#FFFDF9] rounded-2xl border border-[#076935]/10 hover:border-[#076935]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={partner.partner_name}
                      className="max-h-16 w-auto object-contain mb-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#076935]/10 flex items-center justify-center mb-3 text-[#076935] group-hover:bg-[#076935] group-hover:text-white transition-colors">
                      <Leaf size={24} />
                    </div>
                  )}

                  <h4 className="font-bold text-sm text-gray-800 group-hover:text-[#076935] transition-colors text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                    {partner.partner_name}
                  </h4>

                  {hasLink && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#F39927] mt-2 opacity-80 group-hover:opacity-100">
                      Visit Site <ExternalLink size={12} />
                    </span>
                  )}
                </div>
              );

              return hasLink ? (
                <a
                  key={partner.id}
                  href={partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline block h-full"
                >
                  {CardContent}
                </a>
              ) : (
                <div key={partner.id} className="h-full">
                  {CardContent}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
