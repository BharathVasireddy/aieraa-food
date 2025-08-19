'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ImageIcon, Search, Filter, MoreHorizontal, Eye, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { FoodTypeIcon } from '@/components/ui/food-type-icon';
import { generateSlug } from '@/lib/slug-utils';

interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  slug?: string; // Optional until database migration
  description?: string;
  image?: string;
  category?: string;
  foodType: 'VEG' | 'NON_VEG' | 'HALAL';
  isAvailable: boolean;
  variants: MenuItemVariant[];
  createdAt: string;
  updatedAt: string;
}

interface Menu {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  items: MenuItem[];
}

export function MenuManagementClient() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  // Click outside to close action menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuOpen) {
        setActionMenuOpen(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/manager/menu');
      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus || []);
        if (data.menus?.length > 0) {
          setSelectedMenu(data.menus[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/manager/menu/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchMenus();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/manager/menu/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !isAvailable })
      });

      if (response.ok) {
        await fetchMenus();
      }
    } catch (error) {
      console.error('Failed to update item availability:', error);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const filteredItems = selectedMenu?.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(selectedMenu?.items.map(item => item.category).filter(Boolean))) as string[];

  const getFoodTypeLabel = (foodType: 'VEG' | 'NON_VEG' | 'HALAL') => {
    switch (foodType) {
      case 'VEG':
        return 'Veg';
      case 'NON_VEG':
        return 'Non-Veg';
      case 'HALAL':
        return 'Halal';
      default:
        return 'Veg';
    }
  };

  // Helper function to get the appropriate identifier for URLs
  const getItemIdentifier = (item: MenuItem) => {
    return item.slug || generateSlug(item.name) || item.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Menu items</h2>
          <p className="text-gray-600">Manage your menu items and pricing</p>
        </div>
        <Link href="/manager/menu/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add menu item
          </Button>
        </Link>
      </div>

      {/* Menu Selection */}
      {menus.length > 1 && (
        <Card className="p-4">
          <div className="flex gap-2 flex-wrap">
            {menus.map((menu) => (
              <Button
                key={menu.id}
                variant={selectedMenu?.id === menu.id ? "default" : "outline"}
                onClick={() => setSelectedMenu(menu)}
                size="sm"
              >
                {menu.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-visible">
        <div className="overflow-x-auto" style={{ overflowY: 'visible' }}>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variants
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price range
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const minPrice = Math.min(...item.variants.map(v => v.price));
                const maxPrice = Math.max(...item.variants.map(v => v.price));
                const priceRange = minPrice === maxPrice ? `$${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link href={`/manager/menu/edit/${getItemIdentifier(item)}`} className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                            {item.name}
                          </Link>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={item.isAvailable ? "default" : "secondary"}>
                        {item.isAvailable ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.category || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FoodTypeIcon type={item.foodType} size="sm" />
                        <span className="text-gray-900">{getFoodTypeLabel(item.foodType)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                      {priceRange}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-item-id={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpen(actionMenuOpen === item.id ? null : item.id);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {actionMenuOpen === item.id && (
                          <div 
                            className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-40"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/manager/menu/edit/${getItemIdentifier(item)}`}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b"
                              onClick={() => setActionMenuOpen(null)}
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                // Show item details modal (to be implemented)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                toggleItemAvailability(item.id, item.isAvailable);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              {item.isAvailable ? 'Mark as inactive' : 'Mark as active'}
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                handleDeleteItem(item.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ImageIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? "Try adjusting your search or filter" 
                : "Get started by adding your first menu item"}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Link href="/manager/menu/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add menu item
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      {/* Selected items actions */}
      {selectedItems.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Mark as active
              </Button>
              <Button variant="outline" size="sm">
                Mark as inactive
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                Delete selected
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}