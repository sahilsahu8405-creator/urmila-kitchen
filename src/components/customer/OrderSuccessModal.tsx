import React, { useEffect, useState } from 'react';
import { Order } from '../../types/database.types';
import { generateWhatsAppOrderUrl } from '../../lib/whatsapp';
import { useSettings } from '../../context/SettingsContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageSquare, Copy, Check, ExternalLink, RefreshCw, ArrowLeft, MapPin, ShoppingBag } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { settings } = useSettings();
  const [copiedText, setCopiedText] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [hasAttemptedAutoOpen, setHasAttemptedAutoOpen] = useState(false);

  useEffect(() => {
    if (order && !hasAttemptedAutoOpen) {
      setHasAttemptedAutoOpen(true);
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#244638', '#A8B69B', '#BD8061', '#777F52'],
        });
      } catch (e) { }

      // Attempt popup redirect to WhatsApp
      const url = generateWhatsAppOrderUrl(order, settings.whatsapp_number, order.payment_preference || undefined);
      try {
        const opened = window.open(url, '_blank');
        if (!opened || opened.closed || typeof opened.closed === 'undefined') {
          console.warn('Popup blocked by browser; user will click manual button');
        }
      } catch (e) {
        console.warn('Auto open caught error:', e);
      }
    }
  }, [order, settings.whatsapp_number, hasAttemptedAutoOpen]);

  if (!order) return null;

  const whatsappUrl = generateWhatsAppOrderUrl(order, settings.whatsapp_number, order.payment_preference || undefined);
  // Extract decoded message for manual copying
  const messageText = decodeURIComponent(whatsappUrl.split('text=')[1] || '');

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(order.order_reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleManualOpenWhatsApp = () => {
    window.location.href = whatsappUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-cream rounded-3xl border border-borderLight shadow-elevated p-6 sm:p-8 animate-in zoom-in-95 duration-200 my-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-forest-50 border-2 border-forest/20 text-forest flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-forest" />
        </div>

        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Order Saved Successfully</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
            Send Order via WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/80 mt-1.5 max-w-md mx-auto">
            Your order has been recorded in our system. Click the green button below to open WhatsApp and tap <strong>"Send"</strong> to finalize your booking with Urmila's Kitchen.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-cream-light rounded-2xl border border-borderLight p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-borderLight">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-charcoal/60 font-bold">Order Reference</span>
              <p className="font-mono text-lg font-bold text-forest">{order.order_reference}</p>
            </div>
            <button
              onClick={handleCopyRef}
              className="p-2 rounded-xl bg-cream border border-borderLight text-charcoal hover:text-forest text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRef ? 'Copied' : 'Copy Ref'}</span>
            </button>
          </div>

          {(() => {
            const isPickup =
              order.delivery_type === 'pickup' ||
              order.delivery_address?.toLowerCase().startsWith('kitchen pickup');
            const pickupAddress =
              order.delivery_address.replace(/^Kitchen Pickup:\s*/i, '').trim() ||
              settings.address ||
              'Main Kitchen, Bandra West, Mumbai, Maharashtra';

            return (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-charcoal/60">
                    {isPickup ? 'Pickup Date' : 'Delivery Date'}
                  </span>
                  <p className="font-bold text-forest">{order.delivery_date}</p>
                </div>
                <div>
                  <span className="text-charcoal/60">
                    {isPickup ? 'Pickup Slot' : 'Delivery Slot'}
                  </span>
                  <p className="font-bold text-forest">
                    {order.delivery_slot?.name || 'Selected Slot'}
                  </p>
                </div>
                <div>
                  <span className="text-charcoal/60">Customer Name</span>
                  <p className="font-semibold text-charcoal truncate">{order.customer_name}</p>
                </div>
                <div>
                  <span className="text-charcoal/60">Grand Total</span>
                  <p className="font-serif font-bold text-base text-forest">₹{order.total_amount}</p>
                </div>

                {/* Pickup / Delivery Address */}
                <div className="col-span-2 pt-2 border-t border-borderLight/60">
                  <span className="text-charcoal/60 text-[11px] block">
                    {isPickup ? 'Kitchen Pickup Location:' : 'Delivery Address:'}
                  </span>
                  <p className="font-semibold text-forest text-xs mt-0.5 leading-snug">
                    {isPickup ? pickupAddress : order.delivery_address}
                  </p>
                  {isPickup && settings.pickup_maps_url && (
                    <a
                      href={settings.pickup_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-olive hover:underline mt-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-terracotta" />
                      <span>View Directions on Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-charcoal/40" />
                    </a>
                  )}
                </div>

                {order.payment_preference && (
                  <div className="col-span-2 pt-2 border-t border-borderLight/60 flex items-center justify-between text-xs">
                    <span className="text-charcoal/60">Payment Mode:</span>
                    <span className="font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
                      {order.payment_preference}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Primary Action: Direct WhatsApp Link */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-full bg-emerald-700 text-cream font-bold text-base hover:bg-emerald-600 transition-all shadow-card flex items-center justify-center gap-2.5 active:scale-[0.98] text-center"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span>Open WhatsApp to Confirm</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-80 shrink-0" />
          </a>

          {/* Fallback buttons if popup didn't trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleManualOpenWhatsApp}
              className="py-2.5 px-3 rounded-xl border border-emerald-700/40 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Opening App</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="py-2.5 px-3 rounded-xl border border-borderLight bg-cream-light text-charcoal text-xs font-semibold hover:bg-cream-dark/40 flex items-center justify-center gap-1.5"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Message Copied!' : 'Copy Full Message'}</span>
            </button>
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed text-center">
            <strong>Next step:</strong> After WhatsApp opens with your pre-filled order summary, tap <strong>Send</strong> in WhatsApp. Urmila's Kitchen will confirm your order and provide payment instructions.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full border border-forest/30 text-forest font-semibold text-xs hover:bg-cream-dark/50 transition-colors mt-2"
          >
            Return to Kitchen Menu
          </button>
        </div>
      </div>
    </div>
  );
};
