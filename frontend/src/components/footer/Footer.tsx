import { Link } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#076935] text-white py-16 px-6 md:px-[5%] mt-16 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Brand */}
        <div>
          <h2 className="font-bold text-2xl mb-4 tracking-tight">
            Kaina<span className="text-[#F39927]">Fresh</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-xs">
            Delivering premium, farm-fresh organic produce directly to your door. Good for you, good for the earth.
          </p>
          <div className="flex gap-4">
            <a href="#" aria-label="Facebook" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-[#F39927] hover:text-[#076935] transition-all hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-[#F39927] hover:text-[#076935] transition-all hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Twitter" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-[#F39927] hover:text-[#076935] transition-all hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-6 tracking-wide">Quick Links</h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="/" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Home</Link></li>
            <li><Link to="/about" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Our Farm</Link></li>
            <li><Link to="/wholesale" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Wholesale</Link></li>
            <li><Link to="/contact" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-lg mb-6 tracking-wide">Legal</h3>
          <ul className="flex flex-col gap-3">
            <li><Link to="#" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Privacy Policy</Link></li>
            <li><Link to="#" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Terms of Service</Link></li>
            <li><Link to="#" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Refund Policy</Link></li>
            <li><Link to="#" className="text-white/80 text-sm hover:text-[#F39927] transition-colors">Shipping Info</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-semibold text-lg mb-6 tracking-wide">Contact Us</h3>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3 text-white/80 text-sm">
              <MapPin size={18} className="text-[#F39927] shrink-0" />
              123 Harvest Road, Kigali, Rwanda
            </li>
            <li className="flex items-center gap-3 text-white/80 text-sm">
              <Phone size={18} className="text-[#F39927] shrink-0" />
              +250 788 123 456
            </li>
            <li className="flex items-center gap-3 text-white/80 text-sm">
              <Mail size={18} className="text-[#F39927] shrink-0" />
              hello@kainafresh.com
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/10 pt-8 text-center">
        <p className="text-white/60 text-sm m-0">
          &copy; {new Date().getFullYear()} KainaFresh. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
