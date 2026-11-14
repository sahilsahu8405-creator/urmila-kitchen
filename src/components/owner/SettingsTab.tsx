import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Save, Check, Phone, Clock } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { settings, deliverySlots, updateSettings } = useSettings();

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [contactPhone, setContactPhone] = useState(settings.contact_phone);
  const [cutoffTime, setCutoffTime] = useState(settings.default_cutoff_time.slice(0, 5));
  const [deliveryCharge, setDeliveryCharge] = useState(String(settings.delivery_charge));
  const [address, setAddress] = useState(settings.address);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 12-Hour vs 24-Hour format toggle (Default to 12-hour for owner friendliness)
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  // Parse 24h ("20:00") into 12h parts ({ hour: '8', minute: '00', period: 'PM' })
  const parse24to12 = (val24: string) => {
    const parts = (val24 || '20:00').split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) h = 20;
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return {
      hour: String(h),
      minute: m,
      period,
    };
  };

  const initial12 = parse24to12(settings.default_cutoff_time.slice(0, 5));
  const [hour12, setHour12] = useState(initial12.hour);
  const [minute12, setMinute12] = useState(initial12.minute);
  const [period12, setPeriod12] = useState<'AM' | 'PM'>(initial12.period);

  // Sync state when settings load from DB or cache
  useEffect(() => {
    setWhatsappNumber(settings.whatsapp_number);
    setContactPhone(settings.contact_phone);
    const timeSlice = settings.default_cutoff_time.slice(0, 5);
    setCutoffTime(timeSlice);
    setDeliveryCharge(String(settings.delivery_charge));
    setAddress(settings.address);

    const parsed = parse24to12(timeSlice);
    setHour12(parsed.hour);
    setMinute12(parsed.minute);
    setPeriod12(parsed.period);
  }, [settings]);

  // Convert 12h changes into 24h format
  const handle12hChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    setHour12(newHour);
    setMinute12(newMinute);
    setPeriod12(newPeriod);

    let h = parseInt(newHour, 10);
    if (isNaN(h)) h = 12;
    if (newPeriod === 'PM' && h < 12) h += 12;
    if (newPeriod === 'AM' && h === 12) h = 0;
    const formattedHour = h < 10 ? `0${h}` : `${h}`;
    setCutoffTime(`${formattedHour}:${newMinute}`);
  };

  const get12HourDisplay = (val24: string) => {
    const { hour, minute, period } = parse24to12(val24);
    return `${hour}:${minute} ${period}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCharge = deliveryCharge.trim() === '' ? 0 : Number(deliveryCharge);
    const finalDeliveryCharge = isNaN(parsedCharge) ? 0 : parsedCharge;

    await updateSettings({
      whatsapp_number: whatsappNumber,
      contact_phone: contactPhone,
      default_cutoff_time: `${cutoffTime}:00`,
      delivery_charge: finalDeliveryCharge,
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
                placeholder="WhatsApp number (10 digits)"
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
                placeholder="Customer support number (10 digits)"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-charcoal/80">
                  Daily Cutoff Time (IST)
                </label>
                {/* 12-Hour vs 24-Hour Option Switcher */}
                <div className="inline-flex items-center p-0.5 rounded-lg bg-cream border border-borderLight text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      timeFormat === '12h'
                        ? 'bg-forest text-cream shadow-xs'
                        : 'text-charcoal/60 hover:text-charcoal'
                    }`}
                  >
                    12-Hour (AM/PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      timeFormat === '24h'
                        ? 'bg-forest text-cream shadow-xs'
                        : 'text-charcoal/60 hover:text-charcoal'
                    }`}
                  >
                    24-Hour
                  </button>
                </div>
              </div>

              {timeFormat === '12h' ? (
                /* 12-Hour Selector UI */
                <div className="flex items-center gap-2">
                  {/* Hours Dropdown */}
                  <div className="relative">
                    <select
                      value={hour12}
                      onChange={(e) => handle12hChange(e.target.value, minute12, period12)}
                      className="px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30 cursor-pointer appearance-none pr-8"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-charcoal/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                  </div>

                  <span className="font-bold text-forest text-base">:</span>

                  {/* Minutes Dropdown */}
                  <div className="relative">
                    <select
                      value={minute12}
                      onChange={(e) => handle12hChange(hour12, e.target.value, period12)}
                      className="px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30 cursor-pointer appearance-none pr-8"
                    >
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-charcoal/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                  </div>

                  {/* AM / PM Segmented Control */}
                  <div className="inline-flex rounded-xl bg-cream border border-borderLight p-1">
                    <button
                      type="button"
                      onClick={() => handle12hChange(hour12, minute12, 'AM')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        period12 === 'AM'
                          ? 'bg-forest text-cream shadow-xs'
                          : 'text-charcoal/60 hover:text-charcoal'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => handle12hChange(hour12, minute12, 'PM')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        period12 === 'PM'
                          ? 'bg-forest text-cream shadow-xs'
                          : 'text-charcoal/60 hover:text-charcoal'
                      }`}
                    >
                      PM
                    </button>
                  </div>

                  {/* Equivalent 24h tag */}
                  <span className="text-xs font-bold text-olive ml-1 shrink-0">
                    ({cutoffTime} IST)
                  </span>
                </div>
              ) : (
                /* 24-Hour Input with live 12h badge */
                <div>
                  <input
                    type="time"
                    required
                    value={cutoffTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCutoffTime(val);
                      const parsed = parse24to12(val);
                      setHour12(parsed.hour);
                      setMinute12(parsed.minute);
                      setPeriod12(parsed.period);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <span className="text-xs font-bold text-olive mt-1 block">
                    Equals {get12HourDisplay(cutoffTime)} IST
                  </span>
                </div>
              )}

              <span className="text-[11px] text-charcoal/60 mt-1.5 block">
                Orders placed before <strong className="text-forest">{get12HourDisplay(cutoffTime)}</strong> ({cutoffTime} IST) qualify for next-day delivery.
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
