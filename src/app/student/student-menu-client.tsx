'use client';

import { useEffect, useMemo, useState } from 'react';

import { StudentNavigation } from '@/components/navigation/student-navigation';
import { Button } from '@/components/ui/button';
import { MenuCategories } from '@/components/student/menu-categories';
import { MenuSearch } from '@/components/student/menu-search';
import { MenuItemCard } from '@/components/student/menu-item-card';
import { ChefHat, Search } from 'lucide-react';
import { useStudentOrdering } from '@/components/student/student-ordering-provider';

interface StudentMenuClientProps {
  userName: string;
  universityName: string;
}

export function StudentMenuClient({ userName, universityName }: StudentMenuClientProps) {
  const { selectedDate: scheduledDate, vegOnly, sort } = useStudentOrdering();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  interface StudentVariant { id: string; name: string; price: number; isDefault?: boolean }
  interface StudentMenuItem { id: string; name: string; description?: string; image?: string; category?: string; foodType?: string; variants?: StudentVariant[] }
  const [menuItems, setMenuItems] = useState<StudentMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // scheduledDate comes from provider

  useEffect(() => {
    async function load() {
      if (!scheduledDate) return;
      setLoading(true);
      try {
        const [menuRes, cartRes] = await Promise.all([
          fetch(`/api/student/menu?date=${scheduledDate}`),
          fetch('/api/student/cart'),
        ]);
        if (menuRes.ok) {
          const { data } = await menuRes.json();
          setMenuItems((data.items || []) as StudentMenuItem[]);
        }
        if (cartRes.ok) {
          const { data } = await cartRes.json();
          const count = (data.items || []).reduce((sum: number, it: { quantity: number }) => sum + it.quantity, 0);
          setCartCount(count);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [scheduledDate]);

  const filteredItems = useMemo(() => {
    let list = (menuItems || []).filter((item: StudentMenuItem) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !vegOnly || (item.foodType === 'VEG');
      return matchesCategory && matchesSearch && matchesVeg;
    });
    const extractPrice = (item: StudentMenuItem): number => {
      const price = item.variants?.[0]?.price ?? 0;
      return typeof price === 'number' ? price : 0;
    };
    if (sort === 'price_low') {
      list = [...list].sort((a: StudentMenuItem, b: StudentMenuItem) => extractPrice(a) - extractPrice(b));
    } else if (sort === 'price_high') {
      list = [...list].sort((a: StudentMenuItem, b: StudentMenuItem) => extractPrice(b) - extractPrice(a));
    }
    return list;
  }, [menuItems, selectedCategory, searchQuery, vegOnly, sort]);

  function FilterChip({ label, active }: { label: string; active: boolean }) {
    return (
      <span className={`px-3 py-2 rounded-full ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>{label}</span>
    );
  }

  const handleAddToCart = async (itemId: string, variantId?: string, quantity: number = 1) => {
    if (!scheduledDate) return;
    await fetch('/api/student/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId: itemId, variantId, quantity, scheduledForDate: scheduledDate })
    });
    // refresh count
    const cartRes = await fetch('/api/student/cart');
    if (cartRes.ok) {
      const { data } = await cartRes.json();
      const count = (data.items || []).reduce((sum: number, it: { quantity: number }) => sum + it.quantity, 0);
      setCartCount(count);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavigation userName={userName} universityName={universityName} />

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu</h1>
          <p className="text-gray-600 text-sm">Order from {universityName}</p>
        </div>

        {/* Date selector moved to header */}

        {/* Banners/Offers */}
        <div className="bg-primary text-white rounded-3xl p-6 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Today&apos;s Special</h2>
              <p className="text-white/90 mb-4">Delicious Chicken Biryani with Raita & Boiled Egg</p>
              <Button variant="secondary" onClick={() => handleAddToCart('1', '1a', 1)}>
                Order Now - ₹120
              </Button>
            </div>
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Search */}
        <MenuSearch onSearch={setSearchQuery} />

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-4 text-xs">
          <span className="px-3 py-2 rounded-full bg-gray-100">Sort</span>
          <FilterChip label="Relevance" active={sort==='relevance'} />
          <FilterChip label="Price Low" active={sort==='price_low'} />
          <FilterChip label="Price High" active={sort==='price_high'} />
          {vegOnly && <span className="px-3 py-2 rounded-full bg-green-100 text-green-700">Veg Only</span>}
        </div>

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
          {cartCount > 0 && (
            <Button variant="outline" className="relative">
              View Cart ({cartCount})
            </Button>
          )}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description || ''}
                basePrice={item.variants?.find((v:StudentVariant)=>v.isDefault)?.price || item.variants?.[0]?.price || 0}
                category={item.category || ''}
                isAvailable={true}
                variants={item.variants?.map((v:StudentVariant)=>({ id: v.id, name: v.name, price: v.price, isAvailable: true }))}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4 mx-auto">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
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