import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Phone, Clock, MapPin, ShieldCheck, Heart, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer id="contact" className="bg-forest-dark text-cream border-t border-forest-light/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-forest-light/20">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo isLight size="lg" />
            <p className="text-sm text-cream/75 max-w-sm leading-relaxed mt-3">
              Independent cloud kitchen specializing in gourmet vegetarian starters, chaats, baked dishes, fondue, and celebratory party catering. Prepared fresh to order for next-day delivery.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-sage-light">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Pure Desi Ghee & Fresh Ingredients</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-lg font-bold text-cream">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-cream/75">
              <li>
                <a href="#menu" className="hover:text-cream transition-colors">Digital Menu (68 Dishes)</a>
              </li>
              <li>
                <a href="#party-orders" className="hover:text-cream transition-colors">Party & Bulk Orders</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-cream transition-colors">Food Photography Gallery</a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-cream transition-colors">Customer Testimonials</a>
              </li>
            </ul>
          </div>

          {/* Business & WhatsApp Contact */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif text-lg font-bold text-cream">Contact & Kitchen Hours</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-cream/75">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sage-light shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-cream">Operating Cutoff:</span> Daily until{' '}
                  <span className="text-amber-300 font-bold">{settings.default_cutoff_time.slice(0, 5)} IST</span> for next-day deliveries
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sage-light shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sage-light shrink-0" />
                <a
                  href={`tel:${settings.contact_phone}`}
                  className="hover:text-cream underline font-semibold"
                >
                  +91 {settings.contact_phone}
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={`https://wa.me/91${settings.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 text-cream text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm"
              >
                <span>WhatsApp Kitchen Chat</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <p>© {new Date().getFullYear()} Urmila's Kitchen. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Made with care for authentic taste</span>
            {/* Owner portal access */}
            <Link
              to="/owner"
              className="inline-flex items-center gap-1.5 text-cream/40 hover:text-cream transition-colors py-1 px-2 rounded hover:bg-forest"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
