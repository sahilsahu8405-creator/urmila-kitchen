import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/common/BrandLogo';
import { OverviewTab } from '../components/owner/OverviewTab';
import { OrdersTab } from '../components/owner/OrdersTab';
import { KitchenPrepTab } from '../components/owner/KitchenPrepTab';
import { MenuTab } from '../components/owner/MenuTab';
import { PartyEnquiriesTab } from '../components/owner/PartyEnquiriesTab';
import { CalendarTab } from '../components/owner/CalendarTab';
import { SettingsTab } from '../components/owner/SettingsTab';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useSettings } from '../context/SettingsContext';
import { Order, OrderStatus, PartyEnquiry, MenuItem } from '../types/database.types';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  X,
  Menu,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const OwnerDashboardPage: React.FC = () => {
  const { isOwner, isLoading, signOut } = useOwnerAuth();
  const { categories, menuItems, refreshData, isUsingFallback } = useSettings();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<PartyEnquiry[]>([]);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('');
  const [newDishCatId, setNewDishCatId] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishImage, setNewDishImage] = useState('');

  // Protect route
  useEffect(() => {
    if (!isLoading && !isOwner) {
      navigate('/owner/login');
    }
  }, [isOwner, isLoading, navigate]);

  // Load orders and enquiries
  useEffect(() => {
    const loadOrdersAndEnquiries = async () => {
      // 1. Try Supabase
      if (!isUsingFallback) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, delivery_slot:delivery_slots(*)')
          .order('created_at', { ascending: false });

        if (orderData && orderData.length > 0) {
          setOrders(orderData);
        } else {
          // Fallback to local storage if empty
          try {
            const local = JSON.parse(localStorage.getItem('urmila_local_orders') || '[]');
            setOrders(local);
          } catch (e) {}
        }

        const { data: enquiryData } = await supabase
          .from('party_enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (enquiryData && enquiryData.length > 0) {
          setEnquiries(enquiryData);
        } else {
          try {
            const localEnq = JSON.parse(localStorage.getItem('urmila_party_enquiries') || '[]');
            setEnquiries(localEnq);
          } catch (e) {}
        }
      } else {
        // Fallback local storage
        try {
          const local = JSON.parse(localStorage.getItem('urmila_local_orders') || '[]');
          setOrders(local);
          const localEnq = JSON.parse(localStorage.getItem('urmila_party_enquiries') || '[]');
          setEnquiries(localEnq);
        } catch (e) {}
      }
    };

    loadOrdersAndEnquiries();
  }, [isUsingFallback]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );

    // Save in local storage
    try {
      const local = JSON.parse(localStorage.getItem('urmila_local_orders') || '[]');
      const updated = local.map((o: any) => (o.id === orderId ? { ...o, order_status: newStatus } : o));
      localStorage.setItem('urmila_local_orders', JSON.stringify(updated));
    } catch (e) {}

    if (!isUsingFallback) {
      await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
    }
  };

  const handleUpdateEnquiry = async (enquiryId: string, updates: Partial<PartyEnquiry>) => {
    setEnquiries(prev =>
      prev.map(e => (e.id === enquiryId ? { ...e, ...updates } : e))
    );

    try {
      const local = JSON.parse(localStorage.getItem('urmila_party_enquiries') || '[]');
      const updated = local.map((e: any) => (e.id === enquiryId ? { ...e, ...updates } : e));
      localStorage.setItem('urmila_party_enquiries', JSON.stringify(updated));
    } catch (e) {}

    if (!isUsingFallback) {
      await supabase.from('party_enquiries').update(updates).eq('id', enquiryId);
    }
  };

  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    const catId = newDishCatId || categories[0]?.id;
    const price = newDishPrice.trim() ? Number(newDishPrice) : null;

    const newItem: Partial<MenuItem> = {
      name: newDishName,
      category_id: catId,
      price,
      description: newDishDesc || null,
      image_url: newDishImage || null,
      is_available: true,
      is_bestseller: false,
      is_party_special: false,
      dietary_flags: { is_veg: true },
      display_order: menuItems.length + 1,
    };

    if (!isUsingFallback) {
      await supabase.from('menu_items').insert([newItem]);
      await refreshData();
    } else {
      // Local fallback addition
      const mockId = `item-${Date.now()}`;
      const createdItem: MenuItem = { ...(newItem as MenuItem), id: mockId };
      try {
        const savedCustom = JSON.parse(localStorage.getItem('urmila_custom_prices') || '{}');
        savedCustom[mockId] = price;
        localStorage.setItem('urmila_custom_prices', JSON.stringify(savedCustom));
      } catch (e) {}
      await refreshData();
    }

    setIsAddDishOpen(false);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDesc('');
    setNewDishImage('');
    setActiveTab('menu');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter(o => o.order_status === 'pending_whatsapp' || o.order_status === 'awaiting_confirmation').length },
    { id: 'prep', label: 'Kitchen Prep Sheet', icon: ChefHat },
    { id: 'menu', label: 'Menu & Prices', icon: UtensilsCrossed },
    { id: 'party', label: 'Party Enquiries', icon: Sparkles, badge: enquiries.filter(e => e.status === 'new_enquiry').length },
    { id: 'calendar', label: 'Calendar & Schedules', icon: Calendar },
    { id: 'settings', label: 'Business Settings', icon: Settings },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <BrandLogo size="lg" />
          <p className="text-sm font-semibold text-forest animate-pulse">Loading Owner Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-forest text-cream p-4 flex items-center justify-between border-b border-forest-light">
        <BrandLogo isLight size="sm" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-forest-light text-cream"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Matching Reference 1 */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-forest text-cream flex flex-col justify-between p-5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Portal Tagline */}
          <div className="pt-2">
            <BrandLogo isLight size="md" />
            <span className="text-[11px] font-semibold text-sage-light uppercase tracking-widest mt-1 block">
              Owner Dashboard
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cream text-forest shadow-sm'
                      : 'text-cream/80 hover:bg-forest-light hover:text-cream'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-terracotta text-cream' : 'bg-terracotta text-cream'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-forest-light/40 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-cream/70 hover:text-cream hover:bg-forest-light transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </Link>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-forest-light transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {activeTab === 'overview' && (
          <OverviewTab
            orders={orders}
            enquiries={enquiries}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenAddDishModal={() => setIsAddDishOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'prep' && (
          <KitchenPrepTab orders={orders} />
        )}

        {activeTab === 'menu' && (
          <MenuTab onOpenAddDishModal={() => setIsAddDishOpen(true)} />
        )}

        {activeTab === 'party' && (
          <PartyEnquiriesTab
            enquiries={enquiries}
            onUpdateEnquiry={handleUpdateEnquiry}
          />
        )}

        {activeTab === 'calendar' && <CalendarTab />}

        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Add Dish Modal */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-cream rounded-2xl border border-borderLight p-6 max-w-md w-full shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-forest">Add Dish to Menu</h3>
              <button
                onClick={() => setIsAddDishOpen(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="e.g. Stuffed Paneer Tikka"
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Category *</label>
                <select
                  value={newDishCatId}
                  onChange={(e) => setNewDishCatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">
                  Price (₹) — Leave blank for Party/Bulk only
                </label>
                <input
                  type="number"
                  min="1"
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  placeholder="e.g. 250 (Optional)"
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Crispy, flavourful, made with desi ingredients..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">Photograph Image URL (Optional)</label>
                <input
                  type="url"
                  value={newDishImage}
                  onChange={(e) => setNewDishImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-light border border-borderLight text-xs text-charcoal"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDishOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream-dark/40 font-semibold hover:bg-cream-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-cream font-bold hover:bg-forest-light"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
