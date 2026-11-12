import React, { useState } from 'react';
import { PartyEnquiry, PartyEnquiryStatus } from '../../types/database.types';
import {
  Sparkles,
  Users,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';

interface PartyEnquiriesTabProps {
  enquiries: PartyEnquiry[];
  onUpdateEnquiry: (enquiryId: string, updates: Partial<PartyEnquiry>) => void;
}

export const PartyEnquiriesTab: React.FC<PartyEnquiriesTabProps> = ({
  enquiries,
  onUpdateEnquiry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<PartyEnquiry | null>(null);

  // Edit fields for quotation & advance
  const [quoteInput, setQuoteInput] = useState('');
  const [advanceInput, setAdvanceInput] = useState('');
  const [advanceRefInput, setAdvanceRefInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const filteredEnquiries = enquiries.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    return !q
      ? true
      : e.customer_name.toLowerCase().includes(q) ||
        e.customer_phone.includes(q) ||
        e.enquiry_reference.toLowerCase().includes(q) ||
        e.event_type.toLowerCase().includes(q);
  });

  const getStatusBadge = (status: PartyEnquiryStatus) => {
    switch (status) {
      case 'new_enquiry':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">New Request</span>;
      case 'contacted':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">Contacted</span>;
      case 'quotation_sent':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900">Quotation Shared</span>;
      case 'advance_paid':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900">Advance Received</span>;
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">Confirmed Booking</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">Event Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Declined / Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const openWhatsApp = (enquiry: PartyEnquiry) => {
    const phone = enquiry.customer_phone.replace(/\D/g, '');
    const clean = phone.length === 10 ? `91${phone}` : phone;
    const msg = `Namaste ${enquiry.customer_name}! Regarding your party enquiry (${enquiry.enquiry_reference}) with Urmila's Kitchen for ${enquiry.event_type} on ${enquiry.event_date}: `;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenEdit = (enquiry: PartyEnquiry) => {
    setSelectedEnquiry(enquiry);
    setQuoteInput(enquiry.quoted_amount ? String(enquiry.quoted_amount) : '');
    setAdvanceInput(enquiry.advance_paid ? String(enquiry.advance_paid) : '');
    setAdvanceRefInput(enquiry.advance_payment_reference || '');
    setNotesInput(enquiry.internal_notes || '');
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    onUpdateEnquiry(selectedEnquiry.id, {
      quoted_amount: quoteInput ? Number(quoteInput) : null,
      advance_paid: advanceInput ? Number(advanceInput) : null,
      advance_payment_reference: advanceRefInput || null,
      internal_notes: notesInput || null,
      status: advanceInput && Number(advanceInput) > 0 ? 'advance_paid' : quoteInput ? 'quotation_sent' : selectedEnquiry.status,
    });

    setSelectedEnquiry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Party & Bulk Bookings</h2>
          <p className="text-sm text-charcoal/70">
            Track large family gatherings, kitty parties, and corporate catering enquiries.
          </p>
        </div>
        <div className="text-sm font-semibold text-forest bg-cream-light px-4 py-2 rounded-xl border border-borderLight">
          Total Enquiries: {enquiries.length}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, enquiry reference or event type..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
        />
        <Search className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Enquiries Cards */}
      {filteredEnquiries.length === 0 ? (
        <div className="p-12 text-center bg-cream-light rounded-2xl border border-borderLight">
          <p className="font-serif text-lg font-bold text-forest mb-1">No party enquiries found</p>
          <p className="text-xs text-charcoal/60">
            New party bookings submitted from the website or WhatsApp will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-cream-light rounded-2xl border-2 border-borderLight p-5 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-borderLight">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-forest bg-cream px-2.5 py-1 rounded-lg border border-borderLight">
                      {enquiry.enquiry_reference}
                    </span>
                    {getStatusBadge(enquiry.status)}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-forest mt-2">
                    {enquiry.customer_name} • <span className="font-sans text-sm text-charcoal/80 font-normal">{enquiry.customer_phone}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal/70 mt-1">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      <strong>Event:</strong> {enquiry.event_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-forest" />
                      <strong>Guests:</strong> {enquiry.guest_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-forest" />
                      <strong>Date:</strong> {enquiry.event_date} at {enquiry.required_time}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal/70 mt-1">
                    <strong>Location:</strong> {enquiry.delivery_location}
                  </p>
                </div>

                <div className="text-left lg:text-right shrink-0">
                  {enquiry.quoted_amount ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Quotation</span>
                      <span className="font-serif text-2xl font-bold text-forest">₹{enquiry.quoted_amount}</span>
                      {enquiry.advance_paid && (
                        <span className="block text-xs font-semibold text-emerald-700">
                          Advance: ₹{enquiry.advance_paid}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-charcoal/60">
                      Budget: {enquiry.approximate_budget ? `₹${enquiry.approximate_budget}` : 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* Dishes Requested */}
              <div className="py-3 text-xs bg-cream/50 rounded-xl p-3 my-3 space-y-1">
                <span className="font-bold text-charcoal/80 uppercase tracking-wider text-[10px] block">
                  Requested Dishes ({enquiry.requested_dishes.length} items):
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {enquiry.requested_dishes.map((dish, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-cream border border-borderLight text-xs font-medium text-forest"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
                {enquiry.custom_dishes && (
                  <p className="text-xs text-olive font-medium mt-1">
                    Custom Requests: {enquiry.custom_dishes}
                  </p>
                )}
                {enquiry.internal_notes && (
                  <p className="text-xs text-terracotta mt-1">
                    Kitchen Notes: {enquiry.internal_notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openWhatsApp(enquiry)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 text-cream text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Customer</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(enquiry)}
                    className="px-3.5 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light active:scale-95"
                  >
                    Edit Quote & Advance
                  </button>

                  {enquiry.status === 'advance_paid' && (
                    <button
                      onClick={() => onUpdateEnquiry(enquiry.id, { status: 'confirmed' })}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-700 text-cream text-xs font-bold hover:bg-emerald-600"
                    >
                      ✓ Confirm Booking
                    </button>
                  )}

                  {enquiry.status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateEnquiry(enquiry.id, { status: 'completed' })}
                      className="px-3.5 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Quotation / Advance Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl border border-borderLight p-6 max-w-md w-full shadow-elevated space-y-4">
            <h3 className="font-serif text-lg font-bold text-forest">
              Update Quote & Advance for {selectedEnquiry.enquiry_reference}
            </h3>

            <form onSubmit={handleSaveDetails} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Quoted Amount (₹)</label>
                <input
                  type="number"
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-sm font-bold text-forest"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Advance Amount Received (₹)</label>
                <input
                  type="number"
                  value={advanceInput}
                  onChange={(e) => setAdvanceInput(e.target.value)}
                  placeholder="e.g. 3000"
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-sm font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Advance Reference / UPI ID</label>
                <input
                  type="text"
                  value={advanceRefInput}
                  onChange={(e) => setAdvanceRefInput(e.target.value)}
                  placeholder="UPI transaction reference or Cash"
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Menu adjustments, special dippers..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 rounded-xl bg-cream-dark/40 font-semibold hover:bg-cream-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-cream font-bold hover:bg-forest-light"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
