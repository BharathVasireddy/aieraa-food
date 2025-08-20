'use client';

import { useEffect, useMemo, useState } from 'react';

import { StudentNavigation } from '@/components/navigation/student-navigation';
import { Button } from '@/components/ui/button';
import { MenuCategories } from '@/components/student/menu-categories';
import { MenuSearch } from '@/components/student/menu-search';
import { MenuItemCard } from '@/components/student/menu-item-card';
import { ChefHat, Search } from 'lucide-react';

interface StudentMenuClientProps {
  userName: string;
  universityName: string;
}

export function StudentMenuClient({ userName, universityName }: StudentMenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduledDate, setScheduledDate] = useState<string>(''); // yyyy-MM-dd
  interface StudentSettings { timezone: string; orderCutoffTime: string; maxAdvanceDays: number; name: string }
  interface StudentVariant { id: string; name: string; price: number; isDefault?: boolean }
  interface StudentMenuItem { id: string; name: string; description?: string; image?: string; category?: string; foodType?: string; variants?: StudentVariant[] }
  const [menuItems, setMenuItems] = useState<StudentMenuItem[]>([]);
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(today.getUTCDate()).padStart(2, '0');
    setScheduledDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    async function load() {
      if (!scheduledDate) return;
      setLoading(true);
      try {
        const [settingsRes, menuRes, cartRes] = await Promise.all([
          fetch('/api/student/settings'),
          fetch(`/api/student/menu?date=${scheduledDate}`),
          fetch('/api/student/cart'),
        ]);
        if (settingsRes.ok) {
          const { data } = await settingsRes.json();
          setSettings(data.settings);
        }
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
    return (menuItems || []).filter((item: StudentMenuItem) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu</h1>
          <p className="text-gray-600 text-sm">Order from {universityName}</p>
        </div>

        {/* Date selector (mobile-first pills) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 mb-4">
          {Array.from({ length: Math.min(settings?.maxAdvanceDays || 7, 7) }).map((_, idx) => {
            const d = new Date();
            d.setUTCDate(d.getUTCDate() + idx);
            const yyyy = d.getUTCFullYear();
            const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(d.getUTCDate()).padStart(2, '0');
            const key = `${yyyy}-${mm}-${dd}`;
            const label = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : key.slice(5);
            const active = scheduledDate === key;
            return (
              <button
                key={key}
                onClick={() => setScheduledDate(key)}
                className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'}`}
              >
                {label}
              </button>
            );
          })}
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
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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