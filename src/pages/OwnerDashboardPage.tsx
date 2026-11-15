import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/common/BrandLogo';
import { OverviewTab } from '../components/owner/OverviewTab';
import { OrdersTab } from '../components/owner/OrdersTab';
import { KitchenPrepTab } from '../components/owner/KitchenPrepTab';
import { MenuTab } from '../components/owner/MenuTab';
import { EarningsTab } from '../components/owner/EarningsTab';
import { PartyEnquiriesTab } from '../components/owner/PartyEnquiriesTab';
import { CalendarTab } from '../components/owner/CalendarTab';
import { SettingsTab } from '../components/owner/SettingsTab';
import { GalleryTab } from '../components/owner/GalleryTab';
import { ReviewsTab } from '../components/owner/ReviewsTab';
import { AddDishModal } from '../components/owner/AddDishModal';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useSettings } from '../context/SettingsContext';
import { Order, OrderStatus, PartyEnquiry, MenuItem } from '../types/database.types';
import { uploadImageFile } from '../lib/storage';
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
  Image as ImageIcon,
  MessageSquare,
  Camera,
  TrendingUp,
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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter(o => o.order_status === 'pending_whatsapp' || o.order_status === 'awaiting_confirmation').length },
    { id: 'prep', label: 'Kitchen Prep Sheet', icon: ChefHat },
    { id: 'earnings', label: 'Daily Earnings', icon: TrendingUp },
    { id: 'menu', label: 'Menu & Prices', icon: UtensilsCrossed },
    { id: 'party', label: 'Party Enquiries', icon: Sparkles, badge: enquiries.filter(e => e.status === 'new_enquiry').length },
    { id: 'gallery', label: 'Kitchen Gallery', icon: ImageIcon },
    { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
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
            onClick={async () => {
              await signOut();
              navigate('/owner/login');
            }}
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

        {activeTab === 'earnings' && (
          <EarningsTab
            orders={orders}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
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

        {activeTab === 'gallery' && <GalleryTab />}

        {activeTab === 'reviews' && <ReviewsTab />}

        {activeTab === 'calendar' && <CalendarTab />}

        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Add Dish Modal */}
      <AddDishModal
        isOpen={isAddDishOpen}
        onClose={() => setIsAddDishOpen(false)}
      />
    </div>
  );
};

