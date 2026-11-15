import React from 'react';
import { ArrowRight, Leaf, ChefHat, Truck, Sparkles, ShoppingBag } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface HeroProps {
  onOpenPartyModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenPartyModal }) => {
  const { galleryImages, settings } = useSettings();
  const isPickupOnly = (settings.fulfillment_mode || 'pickup_only') === 'pickup_only';

  // Dynamic image resolution:
  // 1. Locally configured custom hero image (if owner uploaded from dashboard)
  // 2. Featured image or "Hero" category image from Supabase gallery
  // 3. Pristine high-resolution paneer platter asset recreating the reference image
  const customHeroImage = typeof window !== 'undefined' ? localStorage.getItem('urmila_hero_image_override') : null;
  const featuredGalleryHero = galleryImages?.find(
    (img) => img.category?.toLowerCase() === 'hero' || img.is_featured
  )?.image_url;

  const heroImageUrl =
    customHeroImage || featuredGalleryHero || '/images/hero-paneer-clean.jpg';

  return (
    <section className="relative overflow-hidden bg-cream pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-16">
      {/* Subtle organic ambient warmth */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-sage/15 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-terracotta/5 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ======================================================== */}
          {/* LEFT CONTENT SECTION                                    */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start z-10">
            {/* 1. Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFE5D4] border border-[#CCD4BF] text-forest text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
              <Leaf className="w-3.5 h-3.5 text-forest" />
              <span>{isPickupOnly ? 'Next-Day Kitchen Pickup' : 'Next-Day Cloud Kitchen'}</span>
            </div>

            {/* 2. Editorial Headline with Curved Underline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] xl:text-[64px] font-bold text-forest tracking-tight leading-[1.1] mb-5">
              Good food. <br />
              <span className="relative inline-block italic font-normal text-forest">
                Beautifully made.
                {/* Decorative underline brushstroke */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3.5 text-[#A89F82]/90 pointer-events-none"
                  viewBox="0 0 240 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 8.5C55 3.2 135 2.2 236 9"
                    stroke="currentColor"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* 3. Description */}
            <p className="text-base sm:text-lg text-charcoal/80 max-w-lg font-normal leading-relaxed mb-8">
              Discover delicious vegetarian favourites, thoughtfully prepared with pure ingredients and ready to make tomorrow special.
            </p>

            {/* 4. Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href="#menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-forest text-cream font-semibold text-sm sm:text-base hover:bg-forest-light hover:shadow-card active:scale-[0.98] transition-all duration-300"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </a>

              <button
                type="button"
                onClick={onOpenPartyModal}
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-forest/35 bg-cream-light/60 text-forest font-semibold text-sm sm:text-base hover:bg-forest/5 hover:border-forest/60 active:scale-[0.98] transition-all duration-300"
              >
                Party Orders
              </button>
            </div>

            {/* 5. Trust Indicators */}
            <div className="mt-10 pt-6 border-t border-borderLight/80 w-full flex items-center justify-between sm:justify-start gap-4 sm:gap-7 text-xs sm:text-sm font-semibold text-forest">
              {/* Trust Item 1 */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-forest/5 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-forest stroke-[1.75]" />
                </div>
                <div className="leading-tight">
                  <span className="block text-forest font-bold">100% Pure</span>
                  <span className="block text-charcoal/70 font-medium text-[11px] sm:text-xs">Vegetarian</span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-borderLight/80 hidden sm:block" />

              {/* Trust Item 2 */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-forest/5 flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-forest stroke-[1.75]" />
                </div>
                <div className="leading-tight">
                  <span className="block text-forest font-bold">Freshly</span>
                  <span className="block text-charcoal/70 font-medium text-[11px] sm:text-xs">Prepared</span>
                </div>
              </div>

              <div className="h-8 w-[1px] bg-borderLight/80 hidden sm:block" />

              {/* Trust Item 3 */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-forest/5 flex items-center justify-center shrink-0">
                  {isPickupOnly ? (
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-forest stroke-[1.75]" />
                  ) : (
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-forest stroke-[1.75]" />
                  )}
                </div>
                <div className="leading-tight">
                  <span className="block text-forest font-bold">
                    {isPickupOnly ? 'Kitchen' : 'Next-Day'}
                  </span>
                  <span className="block text-charcoal/70 font-medium text-[11px] sm:text-xs">
                    {isPickupOnly ? 'Pickup' : 'Delivery'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT FOOD IMAGE & ORGANIC CURVE                        */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-xl lg:max-w-none">
              
              {/* Outer Presentation Frame with Organic Boundary */}
              <div className="relative rounded-3xl lg:rounded-4xl overflow-hidden shadow-elevated border-2 lg:border-3 border-cream-light bg-cream-dark/20 aspect-4/3 sm:aspect-5/4 lg:aspect-4/3 group">
                
                {/* Food Photograph */}
                <img
                  src={heroImageUrl}
                  alt="Delicious artisanal Paneer Tikka prepared by Urmila's Kitchen"
                  className="w-full h-full object-cover object-center transform group-hover:scale-103 transition-transform duration-700 ease-out"
                  loading="eager"
                />

                {/* Organic Asymmetric Wave Curve (Desktop Left Edge Overlay) */}
                <svg
                  className="absolute top-0 bottom-0 -left-1 w-20 sm:w-28 lg:w-36 h-full z-10 text-cream pointer-events-none hidden lg:block"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 0 L 70 0 C 42 22, 18 45, 48 72 C 65 85, 52 96, 28 100 L 0 100 Z"
                    fill="currentColor"
                  />
                </svg>

                {/* Subtle Artistic Foliage Accents along the Curve */}
                {/* Top Leaf Accent */}
                <div className="absolute top-4 left-10 lg:left-14 z-15 pointer-events-none hidden sm:block opacity-90 drop-shadow-sm transform -rotate-12">
                  <svg className="w-7 h-7 text-emerald-600 fill-emerald-500/20" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 5 4 9 9 10 1-5 4-9 9-10 1-5-3.5-10-8-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Bottom Foliage Accent */}
                <div className="absolute bottom-6 left-6 lg:left-10 z-15 pointer-events-none hidden sm:block opacity-85 drop-shadow-sm transform rotate-45">
                  <svg className="w-6 h-6 text-emerald-700 fill-emerald-600/25" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 5 4 9 9 10 1-5 4-9 9-10 1-5-3.5-10-8-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Subtle vignette gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/30 via-transparent to-transparent pointer-events-none" />

                {/* ======================================================== */}
                {/* FLOATING INFORMATION CARD                               */}
                {/* ======================================================== */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#FCFAF6]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#E8E2D5] shadow-elevated z-20 flex items-center gap-3 sm:gap-4 max-w-[92%] sm:max-w-none transition-transform duration-300 hover:scale-[1.02]">
                  {/* Left Side */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/80 border border-emerald-300 flex items-center justify-center shrink-0">
                      <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
                    </div>
                    <div>
                      <p className="font-serif text-xs sm:text-sm font-bold text-forest leading-tight">
                        Artisanal Specialities
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-charcoal/70 mt-0.5 leading-tight">
                        Prepared fresh with pure ingredients.
                      </p>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-7 sm:h-8 w-[1px] bg-borderLight/80 shrink-0" />

                  {/* Right Side */}
                  <div className="text-center shrink-0 pl-0.5">
                    <div className="flex items-center justify-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-terracotta animate-pulse" />
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-terracotta leading-none">
                        NEXT-DAY
                      </span>
                    </div>
                    <span className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-terracotta leading-tight mt-0.5">
                      FRESH
                    </span>
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
