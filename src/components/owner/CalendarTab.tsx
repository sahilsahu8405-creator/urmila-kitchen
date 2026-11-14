import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { BusinessClosure } from '../../types/database.types';
import {
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
  Power,
} from 'lucide-react';

export const CalendarTab: React.FC = () => {
  const {
    settings,
    schedules,
    closures,
    updateSettings,
    addClosure,
    deleteClosure,
    toggleScheduleDay,
  } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [closureType, setClosureType] = useState<'single_closure' | 'holiday_range' | 'special_opening'>('single_closure');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isOpenOverride, setIsOpenOverride] = useState(false);

  const daysOfWeek = [
    { day: 0, label: 'Sunday' },
    { day: 1, label: 'Monday' },
    { day: 2, label: 'Tuesday' },
    { day: 3, label: 'Wednesday' },
    { day: 4, label: 'Thursday' },
    { day: 5, label: 'Friday' },
    { day: 6, label: 'Saturday' },
  ];

  const handleToggleEmergencyPause = async () => {
    const nextState = !settings.is_ordering_paused;
    const msg = nextState
      ? prompt('Enter pause message for website visitors:', 'Kitchen is currently full. Pre-orders will resume tomorrow.')
      : null;

    await updateSettings({
      is_ordering_paused: nextState,
      pause_banner_message: msg || settings.pause_banner_message,
    });
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    const finalEndDate = closureType === 'single_closure' ? startDate : endDate || startDate;

    await addClosure({
      closure_type: closureType,
      start_date: startDate,
      end_date: finalEndDate,
      is_open_override: closureType === 'special_opening' ? true : false,
      reason: reason || (closureType === 'special_opening' ? 'Special Opening Day' : 'Kitchen Maintenance'),
    });

    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Business Calendar & Schedules</h2>
        <p className="text-sm text-charcoal/70 mt-1">
          Configure weekly operating days, scheduled holidays, and special opening exceptions.
        </p>
      </div>

      {/* 1-Click Instant Emergency Pause Card */}
      <div className={`p-6 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        settings.is_ordering_paused
          ? 'bg-rose-50 border-rose-300'
          : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            settings.is_ordering_paused ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <Power className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              {settings.is_ordering_paused ? 'Kitchen Pre-Orders are PAUSED' : 'Kitchen is OPEN & Accepting Pre-Orders'}
            </h3>
            <p className="text-xs text-charcoal/75 mt-0.5">
              {settings.is_ordering_paused
                ? `Customer Banner: "${settings.pause_banner_message || 'Temporarily paused'}"`
                : 'Customers can place next-day orders normally.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleEmergencyPause}
          className={`px-5 py-3 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
            settings.is_ordering_paused
              ? 'bg-emerald-700 text-cream hover:bg-emerald-600'
              : 'bg-rose-700 text-cream hover:bg-rose-600'
          }`}
        >
          {settings.is_ordering_paused ? '▶ Resume Online Ordering' : '⏸ Pause All New Orders'}
        </button>
      </div>

      {/* Weekly Schedule Toggles */}
      <div className="bg-cream-light rounded-2xl border border-borderLight p-6 space-y-4">
        <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
          <Calendar className="w-5 h-5 text-forest" />
          <span>Weekly Operating Schedule</span>
        </h3>
        <p className="text-xs text-charcoal/70">
          Turn days on or off. Delivery slots will automatically respect these days.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {daysOfWeek.map(({ day, label }) => {
            const schedule = schedules.find((s) => s.day_of_week === day);
            const isOpen = schedule ? schedule.is_open : true;

            return (
              <div
                key={day}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isOpen ? 'bg-cream border-forest/40 shadow-sm' : 'bg-cream-dark/20 border-borderLight opacity-60'
                }`}
              >
                <span className="font-serif text-sm font-bold text-forest block">{label}</span>
                <button
                  type="button"
                  onClick={() => toggleScheduleDay(day, !isOpen)}
                  className={`mt-2 w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    isOpen ? 'bg-forest text-cream' : 'bg-cream-dark/50 text-charcoal'
                  }`}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Holidays & Special Openings */}
      <div className="bg-cream-light rounded-2xl border border-borderLight p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest flex items-center gap-2">
              <Clock className="w-5 h-5 text-forest" />
              <span>Holidays & Special Openings</span>
            </h3>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Individual dates, multi-day breaks, or special openings that override weekly closures.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-full bg-forest text-cream text-xs font-bold hover:bg-forest-light flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Date Rule</span>
          </button>
        </div>

        {closures.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-borderLight rounded-xl text-xs text-charcoal/60">
            No holidays or special opening exceptions scheduled. The kitchen operates on its regular weekly hours.
          </div>
        ) : (
          <div className="divide-y divide-borderLight/70">
            {closures.map((closure) => (
              <div key={closure.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-forest">
                      {closure.start_date}
                      {closure.end_date !== closure.start_date ? ` to ${closure.end_date}` : ''}
                    </span>
                    {closure.is_open_override ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        Special Opening (Open)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900">
                        Kitchen Closed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal/70 mt-0.5">{closure.reason}</p>
                </div>

                <button
                  onClick={() => deleteClosure(closure.id)}
                  className="p-2 text-charcoal/40 hover:text-rose-700 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Date Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl border border-borderLight p-6 max-w-md w-full shadow-elevated space-y-4">
            <h3 className="font-serif text-lg font-bold text-forest">Add Calendar Exception</h3>

            <form onSubmit={handleAddEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Rule Type</label>
                <select
                  value={closureType}
                  onChange={(e: any) => setClosureType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                >
                  <option value="single_closure">Single Day Closure (Kitchen Closed)</option>
                  <option value="holiday_range">Multi-Day Holiday Range (Kitchen Closed)</option>
                  <option value="special_opening">Special Opening Day (Overrides Weekly Closure)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                />
              </div>

              {closureType === 'holiday_range' && (
                <div>
                  <label className="block font-bold text-charcoal/80 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason (Festival Holiday, Maintenance, Special Opening...)"
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream-dark/40 font-semibold hover:bg-cream-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-cream font-bold hover:bg-forest-light"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

