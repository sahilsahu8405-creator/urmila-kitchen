import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { Hero } from '../components/customer/Hero';
import { CutoffBanner } from '../components/customer/CutoffBanner';
import { Bestsellers } from '../components/customer/Bestsellers';
import { CategoryPills } from '../components/customer/CategoryPills';
import { MenuCatalog } from '../components/customer/MenuCatalog';
import { PartyBanner } from '../components/customer/PartyBanner';
import { PhotoGallery } from '../components/customer/PhotoGallery';
import { CustomerReviews } from '../components/customer/CustomerReviews';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/customer/CartDrawer';
import { ProductDetailModal } from '../components/customer/ProductDetailModal';
import { CheckoutModal } from '../components/customer/CheckoutModal';
import { OrderSuccessModal } from '../components/customer/OrderSuccessModal';
import { PartyBookingModal } from '../components/customer/PartyBookingModal';
import { MenuItem, Order } from '../types/database.types';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { categories } = useSettings();
  const { itemCount, total, setIsCartOpen } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleOpenPartyModal = () => {
    setIsPartyModalOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col selection:bg-sage/30">
      {/* Navigation Header */}
      <Header onOpenPartyModal={handleOpenPartyModal} />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero onOpenPartyModal={handleOpenPartyModal} />

        {/* Live Next-Day Cutoff Countdown Banner */}
        <CutoffBanner />

        {/* Bestsellers Section (Proper Food Cards) */}
        <Bestsellers
          onSelectDish={(dish) => setSelectedDishForModal(dish)}
        />

        {/* Explore Menu Circular Icons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryPills
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
          />
        </div>

        {/* Digital Menu Catalog (68 Items from PDF with individual ordering) */}
        <MenuCatalog
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          onSelectDish={(dish) => setSelectedDishForModal(dish)}
        />

        {/* Party and Bulk Orders Banner (Completely Separate Workflow) */}
        <PartyBanner onOpenPartyModal={handleOpenPartyModal} />

        {/* Food Photography Gallery */}
        <PhotoGallery />

        {/* Customer Testimonials */}
        <CustomerReviews />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Convenient Floating Mobile Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-forest text-cream p-4 rounded-2xl shadow-elevated flex items-center justify-between border-2 border-sage/30 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream/15 flex items-center justify-center text-cream">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-bold text-sm block leading-none">
                  {itemCount} {itemCount === 1 ? 'dish' : 'dishes'} • ₹{total}
                </span>
                <span className="text-[10px] text-sage-light">Tap to view your selection</span>
              </div>
            </div>

            <div className="flex items-center gap-1 font-bold text-xs bg-cream text-forest px-3 py-1.5 rounded-full">
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Drawers & Modals */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      <ProductDetailModal
        item={selectedDishForModal}
        onClose={() => setSelectedDishForModal(null)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      <PartyBookingModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
      />
    </div>
  );
};
