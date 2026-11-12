import React from 'react';
import { Category } from '../../types/database.types';
import {
  UtensilsCrossed,
  Salad,
  Flame,
  Soup,
  Layers,
  Pizza,
  Sandwich,
  Coffee,
  Sparkles,
} from 'lucide-react';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'starters':
        return <Salad className="w-5 h-5" />;
      case 'chaats':
        return <Flame className="w-5 h-5" />;
      case 'mains':
        return <Soup className="w-5 h-5" />;
      case 'mexican-mains':
        return <Pizza className="w-5 h-5" />;
      case 'baked-dishes':
        return <Layers className="w-5 h-5" />;
      case 'sandwich-corner':
        return <Sandwich className="w-5 h-5" />;
      case 'fondue-section':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'drinks':
        return <Coffee className="w-5 h-5" />;
      case 'desserts':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <UtensilsCrossed className="w-5 h-5" />;
    }
  };

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest inline-block relative">
          Explore the Menu
          <span className="block h-1 w-12 bg-terracotta mx-auto mt-2 rounded-full" />
        </h2>
        <p className="text-sm text-charcoal/70 mt-2">
          Select a category to browse our curated vegetarian selections
        </p>
      </div>

      {/* Horizontal Scrollable Icon Buttons */}
      <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-4 scrollbar-none no-scrollbar">
        {/* "All" button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex flex-col items-center gap-2 p-3 sm:p-3.5 rounded-2xl transition-all shrink-0 min-w-[80px] sm:min-w-[90px] border ${
            selectedCategoryId === null
              ? 'bg-forest text-cream border-forest shadow-md scale-105'
              : 'bg-cream-light text-charcoal hover:bg-cream-dark/40 border-borderLight hover:border-forest/30'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              selectedCategoryId === null ? 'bg-cream/15 text-cream' : 'bg-cream text-forest'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold whitespace-nowrap">All Dishes</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center gap-2 p-3 sm:p-3.5 rounded-2xl transition-all shrink-0 min-w-[84px] sm:min-w-[96px] border ${
                isSelected
                  ? 'bg-forest text-cream border-forest shadow-md scale-105'
                  : 'bg-cream-light text-charcoal hover:bg-cream-dark/40 border-borderLight hover:border-forest/30'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-cream/15 text-cream' : 'bg-cream text-forest'
                }`}
              >
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

