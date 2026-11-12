import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { CustomerReview } from '../../types/database.types';
import { Star, CheckCircle, XCircle, Trash2, MessageSquare, Quote, Plus } from 'lucide-react';

export const ReviewsTab: React.FC = () => {
  const { reviews, approveReview, deleteReview, submitReview } = useSettings();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [dishHighlight, setDishHighlight] = useState('');

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'pending') return !r.is_approved;
    if (activeFilter === 'approved') return r.is_approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) return;

    await submitReview({
      customer_name: customerName.trim(),
      rating,
      review_text: reviewText.trim(),
      dish_highlight: dishHighlight.trim() || null,
      event_type: 'Direct Feedback',
      image_url: null,
    });

    // Reset
    setCustomerName('');
    setRating(5);
    setReviewText('');
    setDishHighlight('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Customer Reviews</h2>
          <p className="text-sm text-charcoal/70">
            Moderate incoming reviews and approve genuine feedback for display on the homepage.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-5 py-3 rounded-full bg-forest text-cream font-bold text-xs hover:bg-forest-light transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Manual Add Form */}
      {showAddModal && (
        <form onSubmit={handleManualAdd} className="bg-cream-light p-5 sm:p-6 rounded-2xl border border-forest/30 shadow-subtle space-y-4">
          <h3 className="font-serif text-lg font-bold text-forest">Add a Customer Testimonial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. S. Sen"
                className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase mb-1">Rating (1 - 5) *</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-sm"
              >
                <option value={5}>5 Stars - Outstanding</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Good</option>
                <option value={2}>2 Stars - Fair</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Dish Highlight (Optional)</label>
            <input
              type="text"
              value={dishHighlight}
              onChange={(e) => setDishHighlight(e.target.value)}
              placeholder="e.g. Cheese Corn Balls"
              className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal uppercase mb-1">Review Text *</label>
            <textarea
              rows={3}
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Customer's authentic words..."
              className="w-full px-3.5 py-2 rounded-xl bg-cream border border-borderLight text-charcoal text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-cream border border-borderLight text-xs font-semibold text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light"
            >
              Save Review
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-forest text-cream shadow-sm'
              : 'bg-cream-light text-charcoal hover:bg-cream-dark/50 border border-borderLight'
          }`}
        >
          All Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeFilter === 'pending'
              ? 'bg-forest text-cream shadow-sm'
              : 'bg-cream-light text-charcoal hover:bg-cream-dark/50 border border-borderLight'
          }`}
        >
          <span>Pending Approval</span>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-cream text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeFilter === 'approved'
              ? 'bg-forest text-cream shadow-sm'
              : 'bg-cream-light text-charcoal hover:bg-cream-dark/50 border border-borderLight'
          }`}
        >
          Approved & Published ({reviews.filter((r) => r.is_approved).length})
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-cream-light rounded-2xl border border-borderLight overflow-hidden shadow-subtle">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-cream-dark/30 flex items-center justify-center mx-auto text-charcoal/40">
              <MessageSquare className="w-7 h-7" />
            </div>
            <p className="font-serif text-base font-bold text-forest">No Reviews in this Category</p>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              When customers submit reviews through the public website, they will appear here awaiting your approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-borderLight/60">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-forest">{rev.customer_name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        rev.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.is_approved ? 'Live on Site' : 'Pending Approval'}
                    </span>
                    {rev.dish_highlight && (
                      <span className="text-[10px] font-semibold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                        {rev.dish_highlight}
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-charcoal/20'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-charcoal/60 ml-1">({rev.rating}/5)</span>
                  </div>

                  <p className="text-xs sm:text-sm text-charcoal/80 italic leading-relaxed">
                    "{rev.review_text}"
                  </p>

                  {rev.created_at && (
                    <p className="text-[10px] text-charcoal/40">
                      Submitted: {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-borderLight/60">
                  {rev.is_approved ? (
                    <button
                      onClick={() => approveReview(rev.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-cream border border-borderLight hover:bg-cream-dark text-charcoal text-xs font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-charcoal/60" />
                      <span>Unpublish</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => approveReview(rev.id, true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-cream text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete review from ${rev.customer_name}?`)) {
                        deleteReview(rev.id);
                      }
                    }}
                    className="p-1.5 text-charcoal/40 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
