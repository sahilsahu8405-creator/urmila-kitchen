import React from 'react';
import { ArrowRight, Sparkles, Utensils } from 'lucide-react';

interface HeroProps {
  onOpenPartyModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenPartyModal }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:pt-14 md:pb-16 bg-cream">
      {/* Subtle organic background foliage element */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sage/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-terracotta/5 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Status Pill Indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-sage/40 text-forest text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Next-Day Cloud Kitchen</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-forest tracking-tight leading-[1.15] mb-5">
              Good food. <br className="hidden sm:inline" />
              <span className="text-forest-dark italic font-normal">Beautifully made.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-charcoal/80 max-w-xl font-normal leading-relaxed mb-8">
              Discover delicious vegetarian favourites, thoughtfully prepared with pure ingredients and ready to make tomorrow special.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href="#menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-forest text-cream font-semibold text-base hover:bg-forest-light hover:shadow-card active:scale-[0.98] transition-all"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onOpenPartyModal}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-forest/25 text-forest font-semibold text-base hover:bg-cream-dark/50 active:scale-[0.98] transition-all"
              >
                Party Orders
              </button>
            </div>

            {/* Quality Badges */}
            <div className="mt-10 pt-6 border-t border-borderLight/60 flex items-center gap-6 text-xs text-charcoal/70 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-olive" />
                <span>100% Pure Vegetarian</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-olive" />
                <span>Made Fresh to Order</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-olive" />
                <span>Direct WhatsApp Handoff</span>
              </div>
            </div>
          </div>

          {/* Right Image Presentation Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Outer Decorative Glow/Border */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-cream-light bg-cream-dark/20 aspect-4/3 sm:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80"
                  alt="Delicious artisanal Paneer Tikka prepared by Urmila's Kitchen"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Dish Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-cream/90 backdrop-blur-md rounded-2xl p-3.5 border border-borderLight shadow-subtle flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border border-emerald-700 flex items-center justify-center p-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      </span>
                      <p className="text-sm font-bold text-forest font-serif">Artisanal Specialties</p>
                    </div>
                    <p className="text-xs text-charcoal/70 mt-0.5">Prepared fresh with pure desi ingredients</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-terracotta uppercase tracking-wider">Next-Day Fresh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
