import React, { useEffect } from 'react';
import { Order } from '../../types/database.types';
import { generateWhatsAppOrderUrl } from '../../lib/whatsapp';
import { useSettings } from '../../context/SettingsContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageSquare, Copy, Check, Calendar, MapPin, ExternalLink, ArrowRight } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { settings } = useSettings();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (order) {
      // Fire celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#244638', '#A8B69B', '#BD8061', '#777F52'],
        });
      } catch (e) {}
    }
  }, [order]);

  if (!order) return null;

  const whatsappUrl = generateWhatsAppOrderUrl(order, settings.whatsapp_number);

  const handleCopy = () => {
    const text = `Order Ref: ${order.order_reference}\nDate: ${order.delivery_date}\nTotal: ₹${order.total_amount}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-cream rounded-3xl border border-borderLight shadow-elevated p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-forest-50 border border-forest/20 text-forest flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9 text-forest" />
        </div>

        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-olive">Order Logged Successfully</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
            Almost Done!
          </h2>
          <p className="text-sm text-charcoal/80 mt-1 max-w-sm mx-auto">
            Please tap below to send your pre-formatted order summary on WhatsApp to complete confirmation with the kitchen.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="bg-cream-light rounded-2xl border border-borderLight p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-borderLight">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-charcoal/60 font-semibold">Order Reference</span>
              <p className="font-mono text-lg font-bold text-forest">{order.order_reference}</p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-cream border border-borderLight text-charcoal hover:text-forest text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-charcoal/60">Delivery Date</span>
              <p className="font-bold text-forest">{order.delivery_date}</p>
            </div>
            <div>
              <span className="text-charcoal/60">Delivery Slot</span>
              <p className="font-bold text-forest">{order.delivery_slot?.name || 'Selected Slot'}</p>
            </div>
            <div>
              <span className="text-charcoal/60">Customer Name</span>
              <p className="font-medium text-charcoal truncate">{order.customer_name}</p>
            </div>
            <div>
              <span className="text-charcoal/60">Total Amount</span>
              <p className="font-serif font-bold text-base text-forest">₹{order.total_amount}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-4 px-6 rounded-full bg-emerald-700 text-cream font-bold text-base hover:bg-emerald-600 transition-all shadow-card flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Send Order on WhatsApp</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
          </button>

          <p className="text-[11px] text-center text-charcoal/70 leading-relaxed px-2">
            <strong>Important:</strong> Opening WhatsApp loads your pre-filled order text. Please click <strong>"Send"</strong> in WhatsApp so Urmila's Kitchen receives your order.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full border border-forest/30 text-forest font-semibold text-xs hover:bg-cream-dark/50 transition-colors mt-2"
          >
            Back to Kitchen Menu
          </button>
        </div>
      </div>
    </div>
  );
};

