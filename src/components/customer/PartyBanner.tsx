import React from 'react';
import { ArrowRight, Sparkles, Users, Award, Clock } from 'lucide-react';

interface PartyBannerProps {
  onOpenPartyModal: () => void;
}

export const PartyBanner: React.FC<PartyBannerProps> = ({ onOpenPartyModal }) => {
  return (
    <section id="party-orders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="relative rounded-3xl overflow-hidden bg-forest text-cream shadow-elevated">
        {/* Subtle decorative glow in the background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-terracotta/10 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16 relative z-10">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream/10 border border-cream/20 text-cream text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sage-light" />
              <span>Bulk & Catering Specialists</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-cream leading-tight">
              Making gatherings <br />
              <span className="italic font-normal text-sage-light">more delicious.</span>
            </h2>

            <p className="text-base sm:text-lg text-cream/80 max-w-lg leading-relaxed">
              Thoughtful food for birthdays, family gatherings, kitty parties, office events, and celebrations of 5 to 100+ guests.
            </p>

            {/* Value bullets */}
            <div className="grid grid-cols-2 gap-4 pt-2 pb-2 text-xs sm:text-sm text-cream/90 font-medium">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-sage-light shrink-0" />
                <span>Custom Guest Count</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-sage-light shrink-0" />
                <span>Curated Menu Platters</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sage-light shrink-0" />
                <span>Scheduled Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sage-light shrink-0" />
                <span>Zero Compromise Taste</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenPartyModal}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-cream text-forest font-bold text-base hover:bg-cream-light hover:shadow-card transition-all active:scale-95 shadow-sm"
              >
                <span>Plan Your Party Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-cream/20 shadow-card aspect-4/3 sm:aspect-16/11 bg-forest-dark/40">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80"
                alt="Exquisite catering spread for parties by Urmila's Kitchen"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-center sm:text-left">
                <p className="text-xs uppercase tracking-wider text-sage-light font-semibold">Specialty Buffets & Platters</p>
                <p className="text-sm font-bold text-cream font-serif">Crafted fresh for your memorable occasions</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
