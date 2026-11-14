import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Truck, AlertCircle, ArrowRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { calculateCutoffCountdown, CutoffCountdown } from '../../lib/cutoff';

export const CutoffBanner: React.FC = () => {
  const { settings, schedules, closures } = useSettings();
  const [countdown, setCountdown] = useState<CutoffCountdown>(() =>
    calculateCutoffCountdown(settings.default_cutoff_time, schedules, closures)
  );

  useEffect(() => {
    // Recalculate every second
    const interval = setInterval(() => {
      setCountdown(calculateCutoffCountdown(settings.default_cutoff_time, schedules, closures));
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.default_cutoff_time, schedules, closures]);

  // If ordering is paused by the owner
  if (settings.is_ordering_paused) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-10 z-20 relative">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900 font-serif">Kitchen Operations Temporarily Paused</h3>
            <p className="text-sm text-amber-800/90 mt-0.5">
              {settings.pause_banner_message || 'We are currently preparing ongoing orders. Online pre-ordering will reopen shortly.'}
            </p>
          </div>
          <a
            href={`https://wa.me/91${settings.whatsapp_number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-light shrink-0"
          >
            Enquire on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const padZero = (n: number) => String(n).padStart(2, '0');

  // Convert "20:00:00" to readable 12-hour format like "8:00 PM"
  const formattedCutoff12h = (() => {
    const parts = (settings.default_cutoff_time || '20:00:00').split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) h = 20;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-14 z-20 relative">
      <div className="bg-cream-light border border-borderLight rounded-2xl p-4 sm:p-5 shadow-card transition-all">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
          
          {/* Column 1: Pre-order Header */}
          <div className="md:col-span-4 flex items-center gap-3.5 border-b md:border-b-0 md:border-r border-borderLight/70 pb-3 md:pb-0 pr-0 md:pr-4">
            <div className="w-11 h-11 rounded-xl bg-forest/5 border border-forest/15 flex items-center justify-center text-forest shrink-0">
              <Calendar className="w-5 h-5 text-forest" />
            </div>
            <div>
              <p className="text-xs font-semibold text-olive uppercase tracking-wider">
                {countdown.isPastCutoff ? 'Next Booking Window' : `Daily ${formattedCutoff12h} Cutoff`}
              </p>
              <h3 className="text-base sm:text-lg font-bold text-forest font-serif leading-tight">
                {countdown.isPastCutoff ? 'Order for Next Available Date' : "Pre-order for Tomorrow's Delivery"}
              </h3>
            </div>
          </div>

          {/* Column 2: Live Countdown Digits */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-borderLight/70 pb-3 md:pb-0 px-2">
            <span className="text-xs font-medium text-charcoal/70 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-terracotta" />
              <span>
                {countdown.isPastCutoff ? 'Next cutoff countdown' : `Order before ${formattedCutoff12h}`}
              </span>
            </span>

            {/* Countdown Blocks */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-forest tracking-tight bg-cream px-2 py-0.5 rounded-lg border border-borderLight">
                  {padZero(countdown.hours)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal/60 mt-0.5">Hrs</span>
              </div>
              <span className="text-xl font-bold text-forest -mt-4">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-forest tracking-tight bg-cream px-2 py-0.5 rounded-lg border border-borderLight">
                  {padZero(countdown.minutes)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal/60 mt-0.5">Min</span>
              </div>
              <span className="text-xl font-bold text-forest -mt-4">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-terracotta tracking-tight bg-cream px-2 py-0.5 rounded-lg border border-borderLight">
                  {padZero(countdown.seconds)}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-charcoal/60 mt-0.5">Sec</span>
              </div>
            </div>
          </div>

          {/* Column 3: Next Delivery & Order Now */}
          <div className="md:col-span-4 flex items-center justify-between gap-3 pl-0 md:pl-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest shrink-0">
                <Truck className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="text-xs text-charcoal/70">Next Delivery</p>
                <p className="text-sm font-bold text-forest">
                  {countdown.nextEligibleDeliveryFormatted}
                </p>
              </div>
            </div>

            <a
              href="#menu"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-light transition-all shrink-0 active:scale-95 shadow-sm"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

