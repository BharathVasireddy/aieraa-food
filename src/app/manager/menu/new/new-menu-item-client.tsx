'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, ImagePlus, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { FoodTypeIcon } from '@/components/ui/food-type-icon';

interface MenuItemVariant {
  name: string;
  price: number;
  isDefault: boolean;
}

interface Menu {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface NewMenuItem {
  name: string;
  description: string;
  category: string;
  foodType: 'VEG' | 'NON_VEG' | 'HALAL';
  image: string;
  variants: MenuItemVariant[];
  isAvailable: boolean;
}

export function NewMenuItemClient() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [basePrice, setBasePrice] = useState<number>(0);

  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: '',
    description: '',
    category: '',
    foodType: 'VEG',
    image: '',
    variants: [{ name: 'Regular', price: 0, isDefault: true }],
    isAvailable: true
  });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/manager/menu');
      if (response.ok) {
        const data = await response.json();
        setMenus(data.menus || []);
        if (data.menus?.length > 0) {
          setSelectedMenuId(data.menus[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setNewItem(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', price: 0, isDefault: false }]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    if (newItem.variants.length > 1) {
      setNewItem(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const handleVariantChange = (index: number, field: keyof MenuItemVariant, value: string | number | boolean) => {
    setNewItem(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value as never } : variant
      )
    }));
  };

  const handleSubmit = async () => {
    if (!selectedMenuId || !newItem.name) return;

    setSubmitting(true);
    try {
      const variantsPayload = hasVariants
        ? newItem.variants
        : [{ name: 'Regular', price: Number(basePrice) || 0, isDefault: true }];

      const response = await fetch('/api/manager/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: selectedMenuId,
          ...newItem,
          variants: variantsPayload
        })
      });

      if (response.ok) {
        const json = await response.json();
        const createdId: string | undefined = json?.data?.menuItem?.id;
        if (createdId) {
          const today = new Date();
          const yyyy = today.getUTCFullYear();
          const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(today.getUTCDate()).padStart(2, '0');
          const date = `${yyyy}-${mm}-${dd}`;
          try {
            await fetch('/api/manager/menu/availability', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ menuItemId: createdId, date, isAvailable: newItem.isAvailable })
            });
          } catch (e) {}
        }
        router.push('/manager/menu');
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndAddAnother = async () => {
    await handleSubmit();
    if (!submitting) {
              setNewItem({
          name: '',
          description: '',
          category: newItem.category, // Keep the category for convenience
          foodType: 'VEG',
          image: '',
          variants: [{ name: 'Regular', price: 0, isDefault: true }],
          isAvailable: true
        });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/manager/menu">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to menu
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add menu item</h1>
            <p className="text-gray-600">Create a new item for your menu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {preview ? 'Hide preview' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveAndAddAnother}
            disabled={!newItem.name || submitting}
          >
            Save and add another
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            loading={submitting}
            disabled={!newItem.name || (!hasVariants && (basePrice === null || basePrice === undefined))}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </LoadingButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Basic information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Short sleeve t-shirt"
                  className="text-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this menu item..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg min-h-[120px] resize-none"
                  rows={5}
                />
              </div>
            </div>
          </Card>

          {/* Media */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Media</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
              {newItem.image ? (
                <div className="relative">
                  <img
                    src={newItem.image}
                    alt="Menu item"
                    width={800}
                    height={400}
                    loading="lazy"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewItem(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 bg-white shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <div className="grid gap-3 max-w-md mx-auto">
                      <Input
                        value={newItem.image}
                        onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Enter image URL"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          id="file-input"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(true);
                            try {
                              const form = new FormData();
                              form.append('file', file);
                              const res = await fetch('/api/upload', { method: 'POST', body: form });
                              if (res.ok) {
                                const data = await res.json();
                                if (data?.url) setNewItem(prev => ({ ...prev, image: data.url as string }));
                              }
                            } catch (err) {
                              console.error('Upload failed', err);
                            } finally {
                              setUploading(false);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="block w-full text-sm text-gray-600"
                        />
                        <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'or paste URL above'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Max ~5MB. In production, configure cloud storage.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Pricing & Variants */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pricing & Variants</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="rounded"
                />
                This product has variants
              </label>
            </div>

            {!hasVariants ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Base price</label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="pl-8"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500">A default variant will be created automatically.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-end mb-3">
                  <Button type="button" variant="outline" size="sm" onClick={handleAddVariant} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add variant
                  </Button>
                </div>
                <div className="space-y-4">
                  {newItem.variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Variant {index + 1}</span>
                        {newItem.variants.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveVariant(index)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Option name</label>
                          <Input placeholder="e.g., Small, Large" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input type="number" placeholder="0.00" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)} className="pl-8" step="0.01" />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={variant.isDefault} onChange={(e) => handleVariantChange(index, 'isDefault', e.target.checked)} className="rounded" />
                            Default option
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMenuId}
                  onChange={(e) => setSelectedMenuId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newItem.isAvailable}
                    onChange={(e) => setNewItem(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    className="rounded"
                  />
                  Available for purchase
                </label>
              </div>
            </div>
          </Card>

          {/* Organization */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Beverages, Main Course"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <select
                  value={newItem.foodType}
                  onChange={(e) => setNewItem(prev => ({ ...prev, foodType: e.target.value as 'VEG' | 'NON_VEG' | 'HALAL' }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="HALAL">Halal</option>
                </select>
                <div className="mt-2 flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FoodTypeIcon type="VEG" size="sm" />
                    <span className="text-gray-600">Vegetarian</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FoodTypeIcon type="NON_VEG" size="sm" />
                    <span className="text-gray-600">Non-Vegetarian</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FoodTypeIcon type="HALAL" size="sm" />
                    <span className="text-gray-600">Halal</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Halal items are automatically non-vegetarian
                </p>
              </div>
            </div>
          </Card>

          {/* Preview */}
          {preview && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {newItem.image && (
                  <img
                    src={newItem.image}
                    alt={newItem.name}
                    width={800}
                    height={400}
                    loading="lazy"
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{newItem.name || 'Menu Item Name'}</h4>
                    <Badge variant={newItem.isAvailable ? "default" : "secondary"}>
                      {newItem.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  {newItem.description && (
                    <p className="text-sm text-gray-600 mb-2">{newItem.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    {newItem.category && (
                      <Badge variant="outline">{newItem.category}</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <FoodTypeIcon type={newItem.foodType} size="sm" />
                      <span className="text-xs text-gray-600">
                        {newItem.foodType === 'VEG' ? 'Veg' : newItem.foodType === 'NON_VEG' ? 'Non-Veg' : 'Halal'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {newItem.variants.map((variant, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={variant.isDefault ? "font-medium" : ""}>
                          {variant.name || `Variant ${index + 1}`}
                        </span>
                        <span className="font-medium">${variant.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}