import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import { FulfillmentMode, DeliverySlot } from '../../types/database.types';
import {
  Save,
  Check,
  Phone,
  Clock,
  ShoppingBag,
  Truck,
  MapPin,
  Sparkles,
  Edit3,
  Trash2,
  Plus,
  RotateCcw,
  Power,
  X,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    settings,
    deliverySlots,
    updateSettings,
    updateDeliverySlot,
    addDeliverySlot,
    deleteDeliverySlot,
    resetDeliverySlots,
  } = useSettings();

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number);
  const [contactPhone, setContactPhone] = useState(settings.contact_phone);
  const [cutoffTime, setCutoffTime] = useState(settings.default_cutoff_time.slice(0, 5));
  const [deliveryCharge, setDeliveryCharge] = useState(String(settings.delivery_charge));
  const [address, setAddress] = useState(settings.address);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>(settings.fulfillment_mode || 'pickup_only');
  const [pickupInstructions, setPickupInstructions] = useState(
    settings.pickup_instructions ||
      'Please show your Order Reference or WhatsApp confirmation at the kitchen counter for instant handoff.'
  );
  const [pickupMapsUrl, setPickupMapsUrl] = useState(
    settings.pickup_maps_url || 'https://maps.google.com/?q=Bandra+West+Mumbai'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);

  // Owner Access Credentials
  const { currentPin, currentPassword, ownerEmail, updateOwnerCredentials } = useOwnerAuth();
  const [ownerPinInput, setOwnerPinInput] = useState(currentPin);
  const [ownerPassInput, setOwnerPassInput] = useState(currentPassword);
  const [showPin, setShowPin] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [credNotice, setCredNotice] = useState<string | null>(null);
  const [credError, setCredError] = useState<string | null>(null);

  // Time Slot Editing State
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editSlotName, setEditSlotName] = useState('');
  const [editSlotStartTime, setEditSlotStartTime] = useState('12:30');
  const [editSlotEndTime, setEditSlotEndTime] = useState('14:00');
  const [editSlotCapacity, setEditSlotCapacity] = useState(25);
  const [editSlotType, setEditSlotType] = useState<'lunch' | 'dinner' | 'all_day'>('lunch');
  const [editSlotIsActive, setEditSlotIsActive] = useState(true);

  // Add New Slot State
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotName, setNewSlotName] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('11:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('13:00');
  const [newSlotCapacity, setNewSlotCapacity] = useState(25);
  const [newSlotType, setNewSlotType] = useState<'lunch' | 'dinner' | 'all_day'>('lunch');

  // 12-Hour vs 24-Hour format toggle for cutoff time
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
    setFulfillmentMode(settings.fulfillment_mode || 'pickup_only');
    if (settings.pickup_instructions) {
      setPickupInstructions(settings.pickup_instructions);
    }
    if (settings.pickup_maps_url) {
      setPickupMapsUrl(settings.pickup_maps_url);
    }

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

  const format24Time = (val: string) => {
    if (!val) return '';
    const parts = val.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    if (isNaN(h)) return val;
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${period}`;
  };

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCredNotice(null);
    setCredError(null);

    const res = updateOwnerCredentials(ownerPinInput, ownerPassInput);
    if (res.success) {
      setCredNotice('Owner security credentials updated successfully!');
      setTimeout(() => setCredNotice(null), 3000);
      return true;
    } else {
      setCredError(res.error || 'Failed to update credentials.');
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCharge = deliveryCharge.trim() === '' ? 0 : Number(deliveryCharge);
    const finalDeliveryCharge = isNaN(parsedCharge) ? 0 : parsedCharge;

    const isDelivery = fulfillmentMode === 'delivery_only' || fulfillmentMode === 'both';
    const isPickup = fulfillmentMode === 'pickup_only' || fulfillmentMode === 'both';

    if (ownerPinInput !== currentPin || ownerPassInput !== currentPassword) {
      const credResult = updateOwnerCredentials(ownerPinInput, ownerPassInput);
      if (!credResult.success) {
        setCredError(credResult.error || 'Failed to update credentials.');
        return;
      }
    }

    await updateSettings({
      whatsapp_number: whatsappNumber,
      contact_phone: contactPhone,
      default_cutoff_time: `${cutoffTime}:00`,
      delivery_charge: finalDeliveryCharge,
      address,
      fulfillment_mode: fulfillmentMode,
      is_delivery_enabled: isDelivery,
      is_pickup_enabled: isPickup,
      pickup_instructions: pickupInstructions,
      pickup_maps_url: pickupMapsUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // -------------------------------------------------------------
  // TIME SLOT MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const showNotice = (msg: string) => {
    setSlotNotice(msg);
    setTimeout(() => setSlotNotice(null), 3000);
  };

  const handleStartEditSlot = (slot: DeliverySlot) => {
    setEditingSlotId(slot.id);
    setEditSlotName(slot.name);
    setEditSlotStartTime(slot.start_time.slice(0, 5));
    setEditSlotEndTime(slot.end_time.slice(0, 5));
    setEditSlotCapacity(slot.max_capacity);
    setEditSlotType(slot.slot_type);
    setEditSlotIsActive(slot.is_active !== false);
    setIsAddingSlot(false);
  };

  const handleCancelEditSlot = () => {
    setEditingSlotId(null);
  };

  const handleSaveEditSlot = async (slotId: string) => {
    if (!editSlotName.trim()) {
      alert('Please enter a valid slot name.');
      return;
    }

    await updateDeliverySlot(slotId, {
      name: editSlotName.trim(),
      start_time: `${editSlotStartTime}:00`,
      end_time: `${editSlotEndTime}:00`,
      max_capacity: Number(editSlotCapacity) || 25,
      slot_type: editSlotType,
      is_active: editSlotIsActive,
    });

    setEditingSlotId(null);
    showNotice(`Time slot "${editSlotName.trim()}" updated successfully!`);
  };

  const handleToggleSlotActive = async (slot: DeliverySlot) => {
    const nextActive = !slot.is_active;
    await updateDeliverySlot(slot.id, { is_active: nextActive });
    showNotice(`Slot "${slot.name}" is now ${nextActive ? 'Active' : 'Paused'}.`);
  };

  const handleDeleteSlot = async (slotId: string, slotName: string) => {
    if (deliverySlots.length <= 1) {
      alert('You must have at least one active order slot.');
      return;
    }
    if (confirm(`Are you sure you want to delete the time slot "${slotName}"?`)) {
      await deleteDeliverySlot(slotId);
      showNotice(`Time slot "${slotName}" deleted.`);
    }
  };

  const handleSaveNewSlot = async () => {
    const generatedName =
      newSlotName.trim() ||
      `${newSlotType === 'lunch' ? 'Lunch' : newSlotType === 'dinner' ? 'Dinner' : 'Custom'} (${format24Time(
        newSlotStartTime
      )} - ${format24Time(newSlotEndTime)})`;

    await addDeliverySlot({
      name: generatedName,
      start_time: `${newSlotStartTime}:00`,
      end_time: `${newSlotEndTime}:00`,
      max_capacity: Number(newSlotCapacity) || 25,
      slot_type: newSlotType,
      is_active: true,
      display_order: deliverySlots.length + 1,
    });

    setIsAddingSlot(false);
    setNewSlotName('');
    showNotice(`New time slot "${generatedName}" added successfully!`);
  };

  const handleResetSlots = async () => {
    if (confirm('Reset all order slots back to system default (Lunch, Evening, Dinner)?')) {
      await resetDeliverySlots();
      showNotice('Order slots reset to system defaults.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Business Settings</h2>
        <p className="text-sm text-charcoal/70 mt-1">
          Configure order fulfillment mode, pickup location, delivery charges, contact numbers, and daily cutoff times.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-cream-light rounded-2xl border border-borderLight p-6 sm:p-8 space-y-7 shadow-subtle">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Settings updated and saved successfully!</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. ORDER FULFILLMENT & SERVICE MODE                      */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-forest" />
              <span>Order Fulfillment & Service Mode</span>
            </h3>
            <span className="text-[11px] font-bold text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
              {fulfillmentMode === 'pickup_only'
                ? 'Active: Kitchen Pickup Only'
                : fulfillmentMode === 'both'
                ? 'Active: Pickup + Delivery'
                : 'Active: Home Delivery Only'}
            </span>
          </div>

          <p className="text-xs text-charcoal/70">
            Control whether customers collect orders from the kitchen, receive home delivery, or can choose between both.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Option 1: Pickup Only */}
            <button
              type="button"
              onClick={() => setFulfillmentMode('pickup_only')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                fulfillmentMode === 'pickup_only'
                  ? 'bg-forest/10 border-forest text-forest shadow-xs ring-2 ring-forest/20'
                  : 'bg-cream border-borderLight text-charcoal hover:bg-cream-dark/30'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-forest">Kitchen Pickup Only</h4>
                <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">
                  Customers pick up at the kitchen counter. ₹0 delivery fee. Street address not requested.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-borderLight/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Recommended</span>
                {fulfillmentMode === 'pickup_only' && <Check className="w-4 h-4 text-forest" />}
              </div>
            </button>

            {/* Option 2: Both Pickup & Delivery */}
            <button
              type="button"
              onClick={() => setFulfillmentMode('both')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                fulfillmentMode === 'both'
                  ? 'bg-forest/10 border-forest text-forest shadow-xs ring-2 ring-forest/20'
                  : 'bg-cream border-borderLight text-charcoal hover:bg-cream-dark/30'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-forest">Both Pickup & Delivery</h4>
                <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">
                  Gives customers a choice between Self-Pickup (Free) and Home Delivery (₹ charge).
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-borderLight/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Flexible</span>
                {fulfillmentMode === 'both' && <Check className="w-4 h-4 text-forest" />}
              </div>
            </button>

            {/* Option 3: Delivery Only */}
            <button
              type="button"
              onClick={() => setFulfillmentMode('delivery_only')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                fulfillmentMode === 'delivery_only'
                  ? 'bg-forest/10 border-forest text-forest shadow-xs ring-2 ring-forest/20'
                  : 'bg-cream border-borderLight text-charcoal hover:bg-cream-dark/30'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2.5">
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-forest">Home Delivery Only</h4>
                <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">
                  Only home delivery is offered. Full delivery address is required at checkout.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-borderLight/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Classic</span>
                {fulfillmentMode === 'delivery_only' && <Check className="w-4 h-4 text-forest" />}
              </div>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. KITCHEN PICKUP LOCATION & INSTRUCTIONS                */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest" />
            <span>Kitchen Pickup Location & Instructions</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-charcoal/80 mb-1">
                Kitchen Pickup Address / Location
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
              <span className="text-[11px] text-charcoal/60 mt-1 block">
                Displayed to customers on checkout, in WhatsApp order summaries, and on order confirmation.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  Google Maps Directions Link
                </label>
                <input
                  type="url"
                  value={pickupMapsUrl}
                  onChange={(e) => setPickupMapsUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
                <span className="text-[10px] text-charcoal/50 mt-1 block">
                  Enables a 1-tap "Open in Google Maps" button for pickup customers.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  Pickup Counter Note / Instructions
                </label>
                <input
                  type="text"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
                <span className="text-[10px] text-charcoal/50 mt-1 block">
                  Short guidance shown on the customer pickup card.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. DELIVERY SETTINGS                                     */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest" />
              <span>Delivery Settings</span>
            </h3>
            {fulfillmentMode === 'pickup_only' && (
              <span className="text-[10px] font-bold text-charcoal/50 bg-cream border border-borderLight px-2 py-0.5 rounded-md">
                Inactive while Kitchen Pickup Only is active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <span className="text-[11px] text-charcoal/60 mt-1 block">
                Standard fee added to cart when home delivery is selected (₹0 when pickup is selected).
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. WHATSAPP & CALL CONTACTS                              */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. CUTOFF TIME SETTINGS                                  */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <h3 className="font-serif text-base font-bold text-forest flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest" />
            <span>Daily Pre-Order Cutoff Time</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-charcoal/80">
                  Daily Cutoff Time (IST)
                </label>
                {/* 12-Hour vs 24-Hour Switcher */}
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
                Orders placed before <strong className="text-forest">{get12HourDisplay(cutoffTime)}</strong> ({cutoffTime} IST) qualify for next-day fulfillment.
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. INTERACTIVE ORDER & PICKUP TIME SLOTS MANAGER        */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest" />
                <h4 className="font-serif text-base font-bold text-forest">
                  Configured Order & Pickup Time Slots
                </h4>
              </div>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Customize fulfillment windows, set order capacity per slot, pause, or add new slots.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddingSlot(true);
                  setEditingSlotId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Slot</span>
              </button>

              <button
                type="button"
                onClick={handleResetSlots}
                title="Reset to default slots"
                className="px-2.5 py-1.5 rounded-xl bg-cream border border-borderLight text-charcoal/70 hover:text-forest text-xs flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Feedback notice */}
          {slotNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{slotNotice}</span>
            </div>
          )}

          {/* Add New Slot Form Panel */}
          {isAddingSlot && (
            <div className="p-4 sm:p-5 rounded-2xl bg-cream border-2 border-forest/30 shadow-subtle space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-borderLight">
                <span className="font-serif text-sm font-bold text-forest flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-forest" />
                  <span>Create New Fulfillment Time Slot</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingSlot(false)}
                  className="w-7 h-7 rounded-full bg-cream-dark/30 hover:bg-cream-dark/50 flex items-center justify-center text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-charcoal/80 mb-1">
                    Slot Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    placeholder="e.g. Afternoon (2:30 PM - 4:30 PM)"
                    className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-forest font-semibold focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <span className="text-[10px] text-charcoal/50 mt-0.5 block">
                    Leave blank to auto-generate from start & end time.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/80 mb-1">
                    Max Order Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    required
                    value={newSlotCapacity}
                    onChange={(e) => setNewSlotCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-forest font-semibold focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <span className="text-[10px] text-charcoal/50 mt-0.5 block">
                    Maximum pre-orders kitchen can accept for this window.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/80 mb-1">
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotStartTime}
                    onChange={(e) => setNewSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-forest font-semibold focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <span className="text-[10px] text-olive font-bold mt-0.5 block">
                    Starts at {format24Time(newSlotStartTime)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/80 mb-1">
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotEndTime}
                    onChange={(e) => setNewSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-forest font-semibold focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <span className="text-[10px] text-olive font-bold mt-0.5 block">
                    Ends at {format24Time(newSlotEndTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-borderLight">
                <button
                  type="button"
                  onClick={() => setIsAddingSlot(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-borderLight bg-cream text-charcoal hover:bg-cream-dark/30 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewSlot}
                  className="px-4 py-1.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light shadow-xs"
                >
                  Create Slot
                </button>
              </div>
            </div>
          )}

          {/* Slots List Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {deliverySlots.map((slot) => {
              const isEditing = editingSlotId === slot.id;
              const isActive = slot.is_active !== false;

              if (isEditing) {
                // In-Place Card Editor
                return (
                  <div
                    key={slot.id}
                    className="p-3.5 bg-cream rounded-2xl border-2 border-forest shadow-md text-xs space-y-3 sm:col-span-3 lg:col-span-1"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-borderLight">
                      <span className="font-bold text-forest text-xs flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 text-olive" />
                        <span>Edit Slot</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelEditSlot}
                        className="text-charcoal/50 hover:text-charcoal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-charcoal/70 mb-0.5">
                          Display Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editSlotName}
                          onChange={(e) => setEditSlotName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-cream-light border border-borderLight text-xs font-bold text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-charcoal/70 mb-0.5">
                            Start ({format24Time(editSlotStartTime)})
                          </label>
                          <input
                            type="time"
                            value={editSlotStartTime}
                            onChange={(e) => setEditSlotStartTime(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-cream-light border border-borderLight text-xs text-forest focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-charcoal/70 mb-0.5">
                            End ({format24Time(editSlotEndTime)})
                          </label>
                          <input
                            type="time"
                            value={editSlotEndTime}
                            onChange={(e) => setEditSlotEndTime(e.target.value)}
                            className="w-full px-2 py-1 rounded-lg bg-cream-light border border-borderLight text-xs text-forest focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-charcoal/70 mb-0.5">
                          Max Orders Capacity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={editSlotCapacity}
                          onChange={(e) => setEditSlotCapacity(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-cream-light border border-borderLight text-xs text-forest font-bold focus:outline-none"
                        />
                      </div>

                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editSlotIsActive}
                          onChange={(e) => setEditSlotIsActive(e.target.checked)}
                          className="rounded text-forest focus:ring-forest"
                        />
                        <span className="text-[11px] font-semibold text-charcoal/80">
                          Slot is Active for Ordering
                        </span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-borderLight">
                      <button
                        type="button"
                        onClick={handleCancelEditSlot}
                        className="px-2.5 py-1 rounded-lg bg-cream-dark/30 hover:bg-cream-dark/50 text-[11px] font-semibold text-charcoal"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditSlot(slot.id)}
                        className="px-3 py-1 rounded-lg bg-forest text-cream text-[11px] font-bold hover:bg-forest-light shadow-2xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              // Normal Display Card with Action Buttons
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 bg-cream rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                    isActive
                      ? 'border-borderLight shadow-2xs hover:border-forest/40'
                      : 'border-borderLight/60 opacity-60 bg-cream-dark/20'
                  }`}
                >
                  <div>
                    {/* Top Status & Name */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="font-bold text-forest text-xs leading-snug line-clamp-2">
                        {slot.name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    {/* Window details */}
                    <div className="space-y-0.5 text-charcoal/70 text-[11px] mt-2 pt-2 border-t border-borderLight/60">
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal/50">Timing:</span>
                        <span className="font-semibold text-forest">
                          {format24Time(slot.start_time.slice(0, 5))} - {format24Time(slot.end_time.slice(0, 5))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal/50">Capacity:</span>
                        <span className="font-semibold text-charcoal">
                          Max {slot.max_capacity} orders
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons footer */}
                  <div className="mt-3 pt-2 border-t border-borderLight/60 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleSlotActive(slot)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        isActive
                          ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
                          : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60'
                      }`}
                      title={isActive ? 'Pause slot' : 'Activate slot'}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{isActive ? 'Pause' : 'Activate'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditSlot(slot)}
                        className="p-1.5 rounded-lg bg-cream border border-borderLight hover:bg-cream-dark/40 text-charcoal hover:text-forest transition-colors"
                        title="Edit slot details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id, slot.name)}
                        className="p-1.5 rounded-lg bg-cream border border-borderLight hover:bg-rose-50 text-charcoal hover:text-rose-600 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 7. OWNER PORTAL ACCESS & SECURITY CREDENTIALS            */}
        {/* ======================================================== */}
        <div className="space-y-4 pt-4 border-t border-borderLight">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest" />
              <h4 className="font-serif text-base font-bold text-forest">
                Owner Dashboard Access & Security Credentials
              </h4>
            </div>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Secure credentials for chef and owner login. Keep confidential. PIN is not based on the kitchen phone number.
            </p>
          </div>

          {credNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{credNotice}</span>
            </div>
          )}

          {credError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{credError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Owner Email */}
            <div>
              <label className="block text-xs font-bold text-charcoal/80 mb-1">
                Owner Login Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={ownerEmail}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-xs font-medium text-charcoal/80 cursor-default"
                />
              </div>
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Primary authorized administrator email
              </span>
            </div>

            {/* Quick Kitchen PIN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-charcoal/80">
                  Kitchen PIN (6 Digits)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-olive hover:text-forest font-semibold flex items-center gap-1"
                >
                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPin ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={ownerPinInput}
                  onChange={(e) => setOwnerPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit PIN"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm font-mono tracking-widest text-forest font-bold focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
                <KeyRound className="w-4 h-4 text-charcoal/50 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Keypad fast-access 6-digit PIN
              </span>
            </div>

            {/* Owner Master Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-charcoal/80">
                  Owner Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[11px] text-olive hover:text-forest font-semibold flex items-center gap-1"
                >
                  {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPass ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={ownerPassInput}
                  onChange={(e) => setOwnerPassInput(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-xs font-mono text-forest font-bold focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
                <Lock className="w-4 h-4 text-charcoal/50 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-charcoal/50 mt-1 block">
                Secure password for email login
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => handleSaveCredentials()}
              className="px-4 py-2 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Update Security Passcodes</span>
            </button>
          </div>
        </div>

        {/* Form Footer Save Button */}
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
