import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/database.types';
import {
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  Filter,
} from 'lucide-react';

interface OrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, onUpdateOrderStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending_whatsapp', label: 'Pending WhatsApp' },
    { id: 'awaiting_confirmation', label: 'Awaiting Action' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'out_for_delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'all' ? true : o.order_status === selectedStatus;
    const matchesDate = selectedDate ? o.delivery_date === selectedDate : true;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q
      ? true
      : o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.order_reference.toLowerCase().includes(q) ||
        o.delivery_address.toLowerCase().includes(q);
    return matchesStatus && matchesDate && matchesQuery;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_whatsapp':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending WhatsApp</span>;
      case 'awaiting_confirmation':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Awaiting Confirmation</span>;
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'preparing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Preparing in Kitchen</span>;
      case 'ready':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">Ready for Dispatch</span>;
      case 'out_for_delivery':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">Out for Delivery</span>;
      case 'delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">Delivered</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const openCustomerWhatsApp = (order: Order) => {
    const phone = order.customer_phone.replace(/\D/g, '');
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;
    const msg = `Namaste ${order.customer_name}! Regarding your Urmila's Kitchen order ${order.order_reference} for delivery on ${order.delivery_date}: `;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Order Management</h2>
          <p className="text-sm text-charcoal/70">
            View customer pre-orders, confirm status, and coordinate deliveries with ease.
          </p>
        </div>
        <div className="text-sm font-semibold text-forest bg-cream-light px-4 py-2 rounded-xl border border-borderLight">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-borderLight no-scrollbar">
        {statusTabs.map((tab) => {
          const count = tab.id === 'all' ? orders.length : orders.filter(o => o.order_status === tab.id).length;
          const isActive = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-forest text-cream shadow-sm'
                  : 'bg-cream-light text-charcoal hover:bg-cream-dark/50 border border-borderLight'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search and Date Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, order reference, or address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
          />
          <Search className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-3 py-2 rounded-xl bg-cream-dark/40 text-xs font-semibold hover:bg-cream-dark"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-cream-light rounded-2xl border border-borderLight">
          <p className="font-serif text-lg font-bold text-forest mb-1">No orders found</p>
          <p className="text-xs text-charcoal/60">Try clearing filters or checking back as new pre-orders arrive.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-cream-light rounded-2xl border-2 border-borderLight p-5 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-borderLight">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-forest bg-cream px-2.5 py-1 rounded-lg border border-borderLight">
                      {order.order_reference}
                    </span>
                    {getStatusBadge(order.order_status)}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-forest mt-2">
                    {order.customer_name} • <span className="font-sans text-sm text-charcoal/80 font-normal">{order.customer_phone}</span>
                  </h3>
                  <p className="text-xs text-charcoal/70 mt-0.5">
                    <strong>Delivery Address:</strong> {order.delivery_address}
                    {order.locality ? `, ${order.locality}` : ''}
                    {order.pin_code ? ` (PIN: ${order.pin_code})` : ''}
                  </p>
                  {order.delivery_instructions && (
                    <p className="text-xs text-terracotta mt-0.5 font-medium">
                      Note: {order.delivery_instructions}
                    </p>
                  )}
                </div>

                <div className="text-left lg:text-right shrink-0">
                  <div className="text-xs text-charcoal/70">
                    Delivery Date: <strong className="text-forest text-sm">{order.delivery_date}</strong>
                  </div>
                  <div className="text-xs text-charcoal/70 mt-0.5">
                    Slot: <strong className="text-forest">{order.delivery_slot?.name || 'Standard Slot'}</strong>
                  </div>
                  <div className="mt-1 font-serif text-2xl font-bold text-forest">
                    ₹{order.total_amount}
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div className="py-3 text-xs space-y-1 bg-cream/50 rounded-xl p-3 my-3">
                <span className="font-bold text-charcoal/80 block uppercase tracking-wider text-[10px]">
                  Ordered Dishes:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                  {(order.items_snapshot || []).map((it: any, i: number) => (
                    <div key={i} className="bg-cream p-2.5 rounded-lg border border-borderLight/80 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-forest truncate mr-2">
                          {it.name} <strong className="text-charcoal">x {it.quantity}</strong>
                        </span>
                        <span className="font-serif font-bold text-charcoal">₹{it.subtotal || it.price * it.quantity}</span>
                      </div>
                      {it.instructions && (
                        <p className="text-[11px] text-olive font-semibold italic mt-1">
                          ↳ Note: {it.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {order.order_notes && (
                  <div className="mt-2 pt-2 border-t border-borderLight/60 text-xs">
                    <span className="font-bold text-forest">Overall Order Instruction: </span>
                    <span className="text-charcoal/80 italic">{order.order_notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Large, Non-technical owner friendly) */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                {/* 1-Click WhatsApp Button */}
                <button
                  type="button"
                  onClick={() => openCustomerWhatsApp(order)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 text-cream text-xs font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </button>

                {/* Status Transitions */}
                <div className="flex flex-wrap items-center gap-2">
                  {order.order_status === 'pending_whatsapp' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                      className="px-4 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light active:scale-95"
                    >
                      ✓ Confirm Order
                    </button>
                  )}

                  {order.order_status === 'awaiting_confirmation' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                      className="px-4 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light active:scale-95"
                    >
                      ✓ Accept & Confirm
                    </button>
                  )}

                  {order.order_status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                      className="px-4 py-2.5 rounded-xl bg-purple-700 text-cream text-xs font-bold hover:bg-purple-600 active:scale-95"
                    >
                      🍳 Mark as Preparing
                    </button>
                  )}

                  {order.order_status === 'preparing' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                      className="px-4 py-2.5 rounded-xl bg-teal-700 text-cream text-xs font-bold hover:bg-teal-600 active:scale-95"
                    >
                      📦 Mark Ready for Dispatch
                    </button>
                  )}

                  {order.order_status === 'ready' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'out_for_delivery')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-700 text-cream text-xs font-bold hover:bg-indigo-600 active:scale-95"
                    >
                      🚚 Mark Out for Delivery
                    </button>
                  )}

                  {order.order_status === 'out_for_delivery' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                      className="px-4 py-2.5 rounded-xl bg-forest text-cream text-xs font-bold hover:bg-forest-light active:scale-95"
                    >
                      🎉 Mark Delivered
                    </button>
                  )}

                  {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel order ${order.order_reference}?`)) {
                          onUpdateOrderStatus(order.id, 'cancelled');
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50 active:scale-95"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

