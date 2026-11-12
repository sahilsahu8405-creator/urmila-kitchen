import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Star, Quote, MessageSquarePlus } from 'lucide-react';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';

export const CustomerReviews: React.FC = () => {
  const { reviews } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const approvedReviews = reviews.filter((r) => r.is_approved);

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Word of Mouth</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">Customer Reviews</h2>
          <p className="text-sm text-charcoal/70 mt-1 max-w-md">
            Genuine feedback from patrons who celebrate daily meals and gatherings with Urmila's Kitchen.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream-light border border-forest/30 text-forest text-xs font-bold hover:bg-forest hover:text-cream transition-all shadow-subtle self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {approvedReviews.length === 0 ? (
        <div className="bg-cream-light/60 rounded-3xl border border-dashed border-borderLight p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-olive/10 text-olive flex items-center justify-center mx-auto mb-3">
            <Quote className="w-6 h-6 rotate-180" />
          </div>
          <h3 className="font-serif text-xl font-bold text-forest mb-1.5">Your Experience Matters</h3>
          <p className="text-xs sm:text-sm text-charcoal/70 max-w-md mx-auto leading-relaxed mb-6">
            We hold ourselves to authentic kitchen standards. If you have recently enjoyed our dishes, we would be delighted to hear your thoughts.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 rounded-full bg-forest text-cream text-xs font-bold hover:bg-forest-light transition-all shadow-sm"
          >
            Leave First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-cream-light rounded-2xl border border-borderLight p-6 sm:p-7 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-olive/40 mb-3 rotate-180" />
                <p className="text-charcoal/85 text-sm sm:text-base leading-relaxed italic mb-4">
                  "{review.review_text}"
                </p>
              </div>

              <div className="pt-4 border-t border-borderLight/60">
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
      )}

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

