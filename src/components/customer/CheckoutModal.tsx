import React, { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { supabase } from '../../lib/supabase';
import { Order, OrderStatus } from '../../types/database.types';
import { calculateCutoffCountdown, isDateOpenForDelivery, formatDateToYYYYMMDD, getNowInIST } from '../../lib/cutoff';
import { X, Calendar, Clock, MapPin, Phone, User, Check, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { settings, deliverySlots, schedules, closures, isUsingFallback } = useSettings();

  // Compute eligible delivery dates (next 7 days starting from next eligible open day)
  const eligibleDates = useMemo(() => {
    const countdown = calculateCutoffCountdown(settings.default_cutoff_time, schedules, closures);
    const nowIST = getNowInIST();
    const list: { dateStr: string; label: string }[] = [];

    let startOffset = countdown.isPastCutoff ? 2 : 1;
    for (let i = startOffset; i < startOffset + 7; i++) {
      const d = new Date(nowIST);
      d.setDate(nowIST.getDate() + i);
      const dStr = formatDateToYYYYMMDD(d);

      if (isDateOpenForDelivery(dStr, schedules, closures)) {
        const isTomorrow = i === 1;
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const label = isTomorrow ? `Tomorrow, ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : d.toLocaleDateString('en-US', options);
        list.push({ dateStr: dStr, label });
      }
    }
    return list;
  }, [settings.default_cutoff_time, schedules, closures]);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => eligibleDates[0]?.dateStr || '');
  const [selectedSlotId, setSelectedSlotId] = useState(() => deliverySlots[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for WhatsApp updates.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return;
    }

    if (!deliveryDate) {
      setErrorMessage('Please select an eligible delivery date.');
      return;
    }

    if (!selectedSlotId) {
      setErrorMessage('Please select a delivery slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedSlot = deliverySlots.find(s => s.id === selectedSlotId);
      const itemsPayload = items.map(ci => ({
        menu_item_id: ci.item.id,
        quantity: ci.quantity,
        special_instructions: ci.special_instructions || '',
      }));

      let orderRef = `UK-${formatDateToYYYYMMDD(new Date()).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      let orderId = `order-${Date.now()}`;

      // Call Supabase RPC create_customer_order if tables exist
      if (!isUsingFallback) {
        const { data, error } = await supabase.rpc('create_customer_order', {
          p_customer_name: customerName,
          p_customer_phone: cleanPhone,
          p_customer_email: customerEmail || null,
          p_delivery_address: deliveryAddress,
          p_locality: locality || null,
          p_pin_code: pinCode || null,
          p_landmark: landmark || null,
          p_delivery_instructions: deliveryInstructions || null,
          p_delivery_date: deliveryDate,
          p_delivery_slot_id: selectedSlotId,
          p_delivery_type: 'delivery',
          p_order_notes: orderNotes || null,
          p_items: itemsPayload,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.order_reference) {
          orderRef = data.order_reference;
          orderId = data.order_id;
        }
      }

      // Constructed Order Object
      const newOrder: Order = {
        id: orderId,
        order_reference: orderRef,
        lookup_token: `token-${Date.now()}`,
        customer_name: customerName,
        customer_phone: cleanPhone,
        customer_email: customerEmail || null,
        delivery_address: deliveryAddress,
        locality: locality || null,
        pin_code: pinCode || null,
        landmark: landmark || null,
        delivery_instructions: deliveryInstructions || null,
        delivery_date: deliveryDate,
        delivery_slot_id: selectedSlotId,
        delivery_type: 'delivery',
        order_notes: orderNotes || null,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        order_status: 'pending_whatsapp',
        whatsapp_opened: false,
        items_snapshot: items.map(ci => ({
          name: ci.item.name,
          quantity: ci.quantity,
          price: ci.item.price,
          subtotal: (ci.item.price || 0) * ci.quantity,
          instructions: ci.special_instructions,
        })),
        cancellation_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        delivery_slot: selectedSlot,
      };

      // Save locally to orders history cache
      try {
        const existing = JSON.parse(localStorage.getItem('urmila_local_orders') || '[]');
        existing.unshift(newOrder);
        localStorage.setItem('urmila_local_orders', JSON.stringify(existing));
      } catch (e) {}

      clearCart();
      onClose();
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-cream rounded-3xl border border-borderLight shadow-elevated overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-borderLight bg-cream-light flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold text-olive uppercase tracking-wider">Guest Checkout</span>
            <h2 className="font-serif text-2xl font-bold text-forest mt-0.5">Delivery & Pre-Order Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream border border-borderLight flex items-center justify-center text-charcoal hover:text-forest"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Delivery Date & Slot Selection */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-terracotta" />
              <span>1. Choose Delivery Date & Slot</span>
            </h3>

            {/* Date Picker Pills */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-2">
                Available Delivery Dates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {eligibleDates.map((item) => {
                  const isSelected = deliveryDate === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setDeliveryDate(item.dateStr)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-forest text-cream border-forest shadow-sm'
                          : 'bg-cream-light text-charcoal hover:bg-cream-dark/40 border-borderLight'
                      }`}
                    >
                      <span className="block text-xs font-bold leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Slot Selector */}
            <div>
              <label className="block text-xs font-semibold text-charcoal/70 uppercase tracking-wider mb-2">
                Preferred Delivery Slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {deliverySlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-forest text-cream border-forest shadow-sm'
                          : 'bg-cream-light text-charcoal hover:bg-cream-dark/40 border-borderLight'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{slot.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sage-light" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4 pt-4 border-t border-borderLight">
            <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
              <User className="w-4 h-4 text-terracotta" />
              <span>2. Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                  Full Name <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
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
                <span className="text-[10px] text-charcoal/50 mt-1 block">
                  Used to deliver order confirmation & tracking via WhatsApp
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Address */}
          <div className="space-y-4 pt-4 border-t border-borderLight">
            <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta" />
              <span>3. Delivery Address</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                Street Address / Building / Flat No. <span className="text-terracotta">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Flat / Floor / Wing, Building Name, Street..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-light border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Locality / Area</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Bandra West"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 400050"
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal/80 mb-1">Landmark</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near temple, park..."
                  className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal/80 mb-1">
                Order Note / Instructions (Optional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Leave with security, ring bell twice..."
                className="w-full px-3.5 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          </div>

          {/* Section 4: Order Summary Snapshot */}
          <div className="p-4 rounded-2xl bg-cream-light border border-borderLight space-y-2">
            <div className="flex justify-between text-xs text-charcoal/70">
              <span>Items Total ({items.length} items)</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-charcoal/70">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="border-t border-borderLight/80 pt-2 flex justify-between text-base font-bold text-forest font-serif">
              <span>Total Payable</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-forest text-cream font-bold text-base hover:bg-forest-light transition-all shadow-card flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Next-Day Pre-Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-charcoal/60 mt-2">
              Next step: Automatically generates your WhatsApp order summary to send to Urmila's Kitchen.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
