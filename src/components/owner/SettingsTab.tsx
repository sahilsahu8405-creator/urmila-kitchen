import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Settings, Save, Check, Phone, Clock, MapPin, DollarSign, Truck } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { settings, deliverySlots, updateSettings } = useSettings();

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [contactPhone, setContactPhone] = useState(settings.contact_phone);
  const [cutoffTime, setCutoffTime] = useState(settings.default_cutoff_time.slice(0, 5));
  const [deliveryCharge, setDeliveryCharge] = useState(String(settings.delivery_charge));
  const [address, setAddress] = useState(settings.address);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      whatsapp_number: whatsappNumber,
      contact_phone: contactPhone,
      default_cutoff_time: `${cutoffTime}:00`,
      delivery_charge: Number(deliveryCharge) || 50,
      address,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Business Settings</h2>
        <p className="text-sm text-charcoal/70 mt-1">
          Configure contact numbers, daily cutoff times, and delivery fees.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-cream-light rounded-2xl border border-borderLight p-6 sm:p-8 space-y-6 shadow-subtle">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        {/* WhatsApp & Phone */}
        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
            <Phone className="w-4 h-4 text-forest" />
            <span>Order Dispatch & WhatsApp Communication</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal/80 mb-1">
                Official Business WhatsApp Number
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 9204417026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
              <span className="text-[11px] text-charcoal/60 mt-1 block">
                All pre-orders and party enquiries are sent directly to this WhatsApp number.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/80 mb-1">
                Customer Support Call Phone
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 9204417026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          </div>
        </div>

        {/* Cutoff & Delivery */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest" />
            <span>Next-Day Pre-Order Cutoff</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal/80 mb-1">
                Daily Cutoff Time (IST)
              </label>
              <input
                type="time"
                required
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
              <span className="text-[11px] text-charcoal/60 mt-1 block">
                Orders placed before this time qualify for next-day delivery. Orders placed after roll over to the following day.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal/80 mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          </div>
        </div>

        {/* Kitchen Address */}
        <div className="space-y-2 pt-4 border-t border-borderLight">
          <label className="block text-xs font-bold text-charcoal/80 mb-1">
            Kitchen Pickup Address / Location
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
          />
        </div>

        {/* Delivery Slots Overview */}
        <div className="space-y-3 pt-4 border-t border-borderLight">
          <h4 className="font-serif text-sm font-bold text-forest">Configured Delivery Slots:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {deliverySlots.map((slot) => (
              <div key={slot.id} className="p-3 bg-cream rounded-xl border border-borderLight text-xs">
                <span className="font-bold text-forest block">{slot.name}</span>
                <span className="text-charcoal/60 text-[11px]">Max Capacity: {slot.max_capacity} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-borderLight flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-forest text-cream font-bold text-sm hover:bg-forest-light flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
