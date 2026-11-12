import React from 'react';
import { Order, PartyEnquiry } from '../../types/database.types';
import {
  ShoppingBag,
  CheckCircle,
  Sparkles,
  Utensils,
  PlusCircle,
  Calendar,
  Clock,
  Printer,
  TrendingUp,
  AlertCircle,
  Phone,
} from 'lucide-react';

interface OverviewTabProps {
  orders: Order[];
  enquiries: PartyEnquiry[];
  onNavigateTab: (tab: string) => void;
  onOpenAddDishModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  orders,
  enquiries,
  onNavigateTab,
  onOpenAddDishModal,
}) => {
  // Metric calculations
  const newOrders = orders.filter(
    (o) => o.order_status === 'pending_whatsapp' || o.order_status === 'awaiting_confirmation'
  ).length;

  const confirmedOrders = orders.filter(
    (o) => o.order_status === 'confirmed' || o.order_status === 'preparing' || o.order_status === 'ready'
  ).length;

  const newPartyEnquiries = enquiries.filter(
    (e) => e.status === 'new_enquiry' || e.status === 'contacted'
  ).length;

  const confirmedRevenue = orders
    .filter((o) => o.order_status === 'confirmed' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner: Today's Overview */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">Today's Overview</h2>
        <p className="text-sm text-charcoal/70 mt-1">
          Simple real-time snapshot of your cloud kitchen pre-orders and party requests.
        </p>
      </div>

      {/* 3 Prominent Stat Cards Matching Reference 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metric 1: New Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-cream-light p-6 rounded-2xl border-2 border-borderLight hover:border-forest/40 transition-all cursor-pointer shadow-subtle hover:shadow-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">New Orders</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-forest">{newOrders}</span>
            <span className="text-xs text-charcoal/60 ml-2 font-medium">Awaiting action</span>
          </div>
        </div>

        {/* Metric 2: Confirmed Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-cream-light p-6 rounded-2xl border-2 border-borderLight hover:border-forest/40 transition-all cursor-pointer shadow-subtle hover:shadow-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">Confirmed</span>
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-forest">{confirmedOrders}</span>
            <span className="text-xs text-charcoal/60 ml-2 font-medium">To prepare / deliver</span>
          </div>
        </div>

        {/* Metric 3: Party Enquiries */}
        <div
          onClick={() => onNavigateTab('party')}
          className="bg-cream-light p-6 rounded-2xl border-2 border-borderLight hover:border-forest/40 transition-all cursor-pointer shadow-subtle hover:shadow-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal/70">Party Enquiries</span>
            <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-forest">{newPartyEnquiries}</span>
            <span className="text-xs text-charcoal/60 ml-2 font-medium">Bulk bookings</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards Matching Reference 1 */}
      <div>
        <h3 className="font-serif text-xl font-bold text-forest mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={onOpenAddDishModal}
            className="p-4 rounded-2xl bg-cream-light border-2 border-borderLight hover:border-forest hover:bg-cream-dark/30 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-forest text-cream flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-forest">Add Dish</span>
          </button>

          <button
            onClick={() => onNavigateTab('menu')}
            className="p-4 rounded-2xl bg-cream-light border-2 border-borderLight hover:border-forest hover:bg-cream-dark/30 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-forest-50 text-forest flex items-center justify-center group-hover:scale-110 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-forest">Manage Menu</span>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-4 rounded-2xl bg-cream-light border-2 border-borderLight hover:border-forest hover:bg-cream-dark/30 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-forest-50 text-forest flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-forest">View Orders</span>
          </button>

          <button
            onClick={() => onNavigateTab('prep')}
            className="p-4 rounded-2xl bg-cream-light border-2 border-borderLight hover:border-forest hover:bg-cream-dark/30 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-olive/15 text-olive flex items-center justify-center group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-forest">Kitchen Prep Sheet</span>
          </button>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="p-4 rounded-2xl bg-cream-light border-2 border-borderLight hover:border-forest hover:bg-cream-dark/30 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-sage/20 text-forest flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-forest">Business Calendar</span>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-4 rounded-2xl bg-cream-light border-2 border-borderLight hover:border-forest hover:bg-cream-dark/30 transition-all flex flex-col items-center justify-center gap-3 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-forest">Cutoff & Slots</span>
          </button>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-cream-light rounded-2xl border border-borderLight p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-forest">Recent Pre-Orders</h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-bold text-forest hover:underline"
          >
            See all orders →
          </button>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-charcoal/60 py-6 text-center">No orders recorded yet.</p>
        ) : (
          <div className="divide-y divide-borderLight/60">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-forest">{order.order_reference}</span>
                    <span className="text-xs font-semibold text-charcoal">{order.customer_name}</span>
                  </div>
                  <p className="text-[11px] text-charcoal/60 mt-0.5">
                    For: <strong className="text-forest">{order.delivery_date}</strong> • Slot: {order.delivery_slot?.name || 'Selected'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-sm text-forest">₹{order.total_amount}</span>
                  <span className="block text-[10px] uppercase font-bold text-olive">{order.order_status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
