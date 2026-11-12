import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '../../lib/supabase';
import { PartyEnquiry } from '../../types/database.types';
import { generateWhatsAppPartyEnquiryUrl } from '../../lib/whatsapp';
import { X, Sparkles, Users, Calendar, Clock, MapPin, Check, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

interface PartyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedDish?: string;
}

export const PartyBookingModal: React.FC<PartyBookingModalProps> = ({
  isOpen,
  onClose,
  preSelectedDish,
}) => {
  const { menuItems, settings, isUsingFallback } = useSettings();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventType, setEventType] = useState('Family Gathering');
  const [eventDate, setEventDate] = useState('');
  const [requiredTime, setRequiredTime] = useState('13:00');
  const [guestCount, setGuestCount] = useState(15);
  const [selectedDishes, setSelectedDishes] = useState<string[]>(() =>
    preSelectedDish ? [preSelectedDish] : []
  );
  const [customDishes, setCustomDishes] = useState('');
  const [approximateBudget, setApproximateBudget] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<PartyEnquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const eventTypes = [
    'Family Gathering',
    'Birthday Party',
    'Kitty Party',
    'Anniversary Celebration',
    'House Party',
    'Office / Corporate Event',
    'Festive Gathering',
    'Other Celebration',
  ];

  const handleToggleDish = (dishName: string) => {
    setSelectedDishes(prev =>
      prev.includes(dishName) ? prev.filter(d => d !== dishName) : [...prev, dishName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!eventDate) {
      setErrorMessage('Please select the event date.');
      return;
    }

    if (guestCount < 5) {
      setErrorMessage('Party and bulk bookings require a minimum of 5 guests.');
      return;
    }

    if (!deliveryLocation.trim()) {
      setErrorMessage('Please enter the delivery location or event venue.');
      return;
    }

    setIsSubmitting(true);

    try {
      let enquiryRef = `PE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      let enquiryId = `enquiry-${Date.now()}`;

      if (!isUsingFallback) {
        const { data, error } = await supabase.rpc('submit_party_enquiry', {
          p_customer_name: customerName,
          p_customer_phone: cleanPhone,
          p_customer_email: customerEmail || null,
          p_event_type: eventType,
          p_event_date: eventDate,
          p_required_time: `${requiredTime}:00`,
          p_guest_count: guestCount,
          p_food_preferences: '100% Pure Vegetarian',
          p_requested_dishes: selectedDishes,
          p_custom_dishes: customDishes || null,
          p_approximate_budget: approximateBudget ? Number(approximateBudget) : null,
          p_delivery_location: deliveryLocation,
          p_special_requirements: specialRequirements || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.enquiry_reference) {
          enquiryRef = data.enquiry_reference;
          enquiryId = data.enquiry_id;
        }
      }

      const enquiry: PartyEnquiry = {
        id: enquiryId,
        enquiry_reference: enquiryRef,
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_email: customerEmail || null,
        event_type: eventType,
        event_date: eventDate,
        required_time: requiredTime,
        guest_count: guestCount,
        food_preferences: '100% Pure Vegetarian',
        requested_dishes: selectedDishes,
        custom_dishes: customDishes || null,
        approximate_budget: approximateBudget ? Number(approximateBudget) : null,
        delivery_location: deliveryLocation,
        special_requirements: specialRequirements || null,
        quoted_amount: null,
        advance_paid: null,
        advance_payment_reference: null,
        internal_notes: null,
        status: 'new_enquiry',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in local cache
      try {
        const existing = JSON.parse(localStorage.getItem('urmila_party_enquiries') || '[]');
        existing.unshift(enquiry);
        localStorage.setItem('urmila_party_enquiries', JSON.stringify(existing));
      } catch (e) {}

      setSubmittedEnquiry(enquiry);
    } catch (err: any) {
      console.error('Party enquiry submission error:', err);
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-cream rounded-3xl border border-borderLight shadow-elevated overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-borderLight bg-cream-light flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-olive uppercase tracking-wider">Gatherings & Catering</span>
              <h2 className="font-serif text-2xl font-bold text-forest">Party & Bulk Order Enquiry</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream border border-borderLight flex items-center justify-center text-charcoal hover:text-forest"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Submitted: Show WhatsApp Handoff Screen */}
        {submittedEnquiry ? (
          <div className="p-6 sm:p-8 overflow-y-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest/20 text-forest flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-forest" />
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-olive tracking-widest">Enquiry Registered</span>
              <h3 className="font-serif text-2xl font-bold text-forest mt-1">Enquiry {submittedEnquiry.enquiry_reference}</h3>
              <p className="text-sm text-charcoal/75 mt-1 max-w-md mx-auto">
                Thank you, {submittedEnquiry.customer_name}! Your party booking request is ready to send to Urmila's Kitchen on WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cream-light border border-borderLight text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Event:</span>
                <span className="font-semibold text-forest">{submittedEnquiry.event_type} ({submittedEnquiry.guest_count} guests)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Date & Time:</span>
                <span className="font-semibold text-forest">{submittedEnquiry.event_date} at {submittedEnquiry.required_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Dishes Requested:</span>
                <span className="font-semibold text-forest">{submittedEnquiry.requested_dishes.length} items</span>
              </div>
            </div>

            <div className="pt-2 max-w-md mx-auto space-y-3">
              <a
                href={generateWhatsAppPartyEnquiryUrl(submittedEnquiry, settings.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-full bg-emerald-700 text-cream font-bold text-sm hover:bg-emerald-600 transition-all shadow-card flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Send Party Enquiry on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-full border border-forest/30 text-forest text-xs font-semibold hover:bg-cream-dark/50"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form Area */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                <Users className="w-4 h-4 text-terracotta" />
                <span>1. Event Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  >
                    {eventTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    Number of Guests (Min. 5) <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    Event Date <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    Required Delivery Time
                  </label>
                  <input
                    type="time"
                    value={requiredTime}
                    onChange={(e) => setRequiredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              </div>
            </div>

            {/* Requested Dishes (Multi-select) */}
            <div className="space-y-3 pt-4 border-t border-borderLight">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-charcoal/80 uppercase tracking-wider">
                  Select Desired Dishes from Menu ({selectedDishes.length} selected)
                </label>
              </div>

              <div className="max-h-44 overflow-y-auto p-3 rounded-2xl bg-cream-light border border-borderLight grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {menuItems.map((dish) => {
                  const isChecked = selectedDishes.includes(dish.name);
                  return (
                    <label
                      key={dish.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-forest/10 font-bold text-forest' : 'hover:bg-cream-dark/40 text-charcoal'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDish(dish.name)}
                        className="rounded text-forest focus:ring-forest"
                      />
                      <span className="truncate">{dish.name}</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                  Custom Dish Requests or Special Menu Notes (Optional)
                </label>
                <input
                  type="text"
                  value={customDishes}
                  onChange={(e) => setCustomDishes(e.target.value)}
                  placeholder="e.g. Jain food only, extra chutneys, specific fondue pot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
            </div>

            {/* Contact & Location Details */}
            <div className="space-y-4 pt-4 border-t border-borderLight">
              <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>2. Contact & Delivery Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    Your Full Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Vikram Mehra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                    WhatsApp Number <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                  Delivery Location / Event Venue Address <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Building, street, area, PIN code..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                  Estimated Budget (Optional, ₹)
                </label>
                <input
                  type="number"
                  value={approximateBudget}
                  onChange={(e) => setApproximateBudget(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-full bg-forest text-cream font-bold text-base hover:bg-forest-light transition-all shadow-card flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <span>Submit Party Enquiry & Open WhatsApp →</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

