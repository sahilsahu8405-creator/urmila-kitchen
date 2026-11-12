import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Star, Quote } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { reviews } = useSettings();

  // If no reviews approved, do not show empty placeholders
  if (!reviews || reviews.length === 0) return null;

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest font-semibold text-olive">Word of Mouth</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Customer Reviews</h2>
        <p className="text-sm text-charcoal/70 mt-1.5 max-w-md mx-auto">
          Honest feedback from patrons who celebrate every day and special gatherings with us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="bg-cream-light rounded-2xl border border-borderLight p-6 sm:p-7 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              {/* Quotation icon */}
              <Quote className="w-8 h-8 text-olive/40 mb-3 rotate-180" />

              <p className="text-charcoal/85 text-sm sm:text-base leading-relaxed italic mb-4">
                "{review.review_text}"
              </p>
            </div>

            <div className="pt-4 border-t border-borderLight/60">
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-2 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-charcoal/20'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-forest">
                  — {review.customer_name}
                </span>
                {review.dish_highlight && (
                  <span className="text-[11px] font-medium text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                    {review.dish_highlight}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
