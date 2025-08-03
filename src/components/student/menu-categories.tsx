'use client';

import { cn } from '@/lib/utils';

const categories = [
  { id: 'ALL', name: 'All Items', icon: '🍽️' },
  { id: 'MAIN_COURSE', name: 'Main Course', icon: '🍛' },
  { id: 'BEVERAGES', name: 'Beverages', icon: '🥤' },
  { id: 'DESSERTS', name: 'Desserts', icon: '🍰' },
  { id: 'SNACKS', name: 'Snacks', icon: '🥗' },
];

interface MenuCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function MenuCategories({ selectedCategory, onCategoryChange }: MenuCategoriesProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all',
              selectedCategory === category.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}