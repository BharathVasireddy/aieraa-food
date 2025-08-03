'use client';

import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { StudentNavigation } from '@/components/navigation/student-navigation';
import { Button } from '@/components/ui/button';
import { MenuCategories } from '@/components/student/menu-categories';
import { MenuSearch } from '@/components/student/menu-search';
import { MenuItemCard } from '@/components/student/menu-item-card';
import { sampleMenuItems } from '@/lib/sample-menu-data';

import { authOptions } from '@/lib/auth';

interface StudentMenuProps {
  userName: string;
  universityName: string;
}

function StudentMenu({ userName, universityName }: StudentMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<Array<{ itemId: string; variantId?: string; quantity: number }>>([]);

  // Filter menu items based on category and search
  const filteredItems = sampleMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (itemId: string, variantId?: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.itemId === itemId && item.variantId === variantId);
      if (existingItem) {
        return prev.map((item) =>
          item.itemId === itemId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { itemId, variantId, quantity }];
    });

    // Show a toast or notification here in a real app
    console.log(`Added ${quantity} item(s) to cart`);
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavigation userName={userName} universityName={universityName} />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Today&apos;s Menu</h1>
          <p className="text-gray-600">Order your favorite food from {universityName}</p>
        </div>

        {/* Today's Special */}
        <div className="bg-primary text-white rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Today&apos;s Special</h2>
              <p className="text-white/90 mb-4">Delicious Chicken Biryani with Raita & Boiled Egg</p>
              <Button variant="secondary" onClick={() => handleAddToCart('1', '1a', 1)}>
                Order Now - ₹120
              </Button>
            </div>
            <div className="text-6xl">🍛</div>
          </div>
        </div>

        {/* Search */}
        <MenuSearch onSearch={setSearchQuery} />

        {/* Categories */}
        <MenuCategories selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory === 'ALL'
                ? 'All Items'
                : selectedCategory.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </h3>
            <p className="text-sm text-gray-600">{filteredItems.length} items available</p>
          </div>
          {cartItemCount > 0 && (
            <Button variant="outline" className="relative">
              View Cart ({cartItemCount})
            </Button>
          )}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                basePrice={item.basePrice}
                category={item.category}
                isAvailable={item.isAvailable}
                variants={item.variants}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No items match "${searchQuery}". Try a different search term.`
                : 'No items available in this category right now.'}
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
            >
              View All Items
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Server component wrapper
export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return <StudentMenu userName={session.user.name} universityName={session.user.university || 'University'} />;
}