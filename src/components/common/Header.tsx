import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Menu, X, ArrowRight, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onOpenPartyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPartyModal }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Menu', href: '#menu' },
    { label: 'Party Orders', href: '#party-orders' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setMobileMenuOpen(false);
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-borderLight transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-charcoal">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-forest transition-colors py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
          ))}
        </nav>

        {/* Right Actions: Cart & Order Now */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Pill Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-cream-light hover:bg-cream-dark/60 border border-borderLight transition-all text-forest"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-terracotta text-cream text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {itemCount}
              </span>
            )}
          </button>

          {/* Desktop Order Now Button */}
          <a
            href="#menu"
            onClick={(e) => handleNavClick(e, '#menu')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-forest text-cream text-sm font-semibold hover:bg-forest-light transition-all shadow-sm active:scale-95"
          >
            Order Now
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-cream-light border border-borderLight text-charcoal hover:text-forest"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cream border-b border-borderLight px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-elevated">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-lg font-medium text-charcoal hover:text-forest py-2 border-b border-borderLight/50 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 text-olive" />
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <a
              href="#menu"
              onClick={(e) => handleNavClick(e, '#menu')}
              className="w-full text-center py-3 rounded-full bg-forest text-cream font-semibold shadow-sm text-base"
            >
              Order for Tomorrow
            </a>
            {onOpenPartyModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPartyModal();
                }}
                className="w-full text-center py-2.5 rounded-full border border-forest/30 text-forest font-semibold hover:bg-forest/5 text-base"
              >
                Book Party Catering
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

