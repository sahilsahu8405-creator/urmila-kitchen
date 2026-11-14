import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { X, Star, Send, CheckCircle2, Sparkles } from 'lucide-react';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({ isOpen, onClose }) => {
  const { submitReview, menuItems } = useSettings();

  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [dishHighlight, setDishHighlight] = useState('');
  const [eventType, setEventType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMessage('Please share a few words about your experience.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitReview({
      customer_name: customerName.trim(),
      rating,
      review_text: reviewText.trim(),
      dish_highlight: dishHighlight.trim() || null,
      event_type: eventType.trim() || null,
      image_url: null,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset fields
        setCustomerName('');
        setRating(5);
        setReviewText('');
        setDishHighlight('');
        setEventType('');
      }, 2500);
    } else {
      setErrorMessage(res.error || 'Failed to submit review. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-cream rounded-3xl border border-borderLight shadow-elevated p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-cream-light border border-borderLight flex items-center justify-center text-charcoal hover:text-forest transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-forest">Thank You!</h3>
            <p className="text-sm text-charcoal/70 max-w-sm mx-auto leading-relaxed">
              Your review has been submitted to Urmila's Kitchen. We appreciate your gracious feedback!
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest font-semibold text-olive">Your Experience</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">Share Your Review</h2>
              <p className="text-xs text-charcoal/70 mt-1">
                Tell us about the dishes you enjoyed or your special celebration.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-charcoal/20'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-forest ml-2">
                    {rating === 5 ? 'Exceptional (5/5)' : `${rating} out of 5`}
                  </span>
                </div>
              </div>

              {/* Dish Highlight / Favourite */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                    Favourite Dish (Optional)
                  </label>
                  <input
                    type="text"
                    value={dishHighlight}
                    onChange={(e) => setDishHighlight(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                    Occasion (Optional)
                  </label>
                  <input
                    type="text"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                  />
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  Your Review *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was the taste, packaging, and freshness of your meal?"
                  className="w-full px-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-forest hover:bg-forest-light text-cream font-bold text-sm transition-all shadow-subtle flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

