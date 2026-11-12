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

export const HomePage: React.FC = () => {
  const { categories } = useSettings();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDishForModal, setSelectedDishForModal] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [partyDishPreselect, setPartyDishPreselect] = useState<string | undefined>(undefined);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleOpenPartyModal = (dishName?: string) => {
    setPartyDishPreselect(dishName);
    setIsPartyModalOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col selection:bg-sage/30">
      {/* Navigation Header */}
      <Header onOpenPartyModal={() => handleOpenPartyModal()} />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero onOpenPartyModal={() => handleOpenPartyModal()} />

        {/* Live Next-Day Cutoff Countdown Banner */}
        <CutoffBanner />

        {/* Bestsellers Section (Matching Reference 1) */}
        <Bestsellers
          onSelectDish={(dish) => setSelectedDishForModal(dish)}
          onOpenPartyModal={() => handleOpenPartyModal()}
        />

        {/* Explore Menu Circular Icons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryPills
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
          />
        </div>

        {/* Digital Menu Catalog (68 Items from PDF) */}
        <MenuCatalog
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          onSelectDish={(dish) => setSelectedDishForModal(dish)}
          onOpenPartyModal={() => handleOpenPartyModal()}
        />

        {/* Party and Bulk Orders Banner */}
        <PartyBanner onOpenPartyModal={() => handleOpenPartyModal()} />

        {/* Food Photography Gallery */}
        <PhotoGallery />

        {/* Customer Testimonials */}
        <CustomerReviews />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Drawers & Modals */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      <ProductDetailModal
        item={selectedDishForModal}
        onClose={() => setSelectedDishForModal(null)}
        onOpenPartyModal={handleOpenPartyModal}
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
        onClose={() => {
          setIsPartyModalOpen(false);
          setPartyDishPreselect(undefined);
        }}
        preSelectedDish={partyDishPreselect}
      />
    </div>
  );
};
