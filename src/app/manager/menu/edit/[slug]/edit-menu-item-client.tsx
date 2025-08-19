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
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  foodType: 'VEG' | 'NON_VEG' | 'HALAL';
  image: string;
  isAvailable: boolean;
  variants: MenuItemVariant[];
  menu: {
    id: string;
    name: string;
    university: {
      id: string;
      name: string;
    };
  };
}

interface EditMenuItemClientProps {
  slug: string;
}

export function EditMenuItemClient({ slug: identifier }: EditMenuItemClientProps) {
  const router = useRouter();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    foodType: 'VEG' as 'VEG' | 'NON_VEG' | 'HALAL',
    image: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchMenuItem();
  }, [identifier]);

  const fetchMenuItem = async () => {
    try {
      const response = await fetch(`/api/manager/menu/items/by-identifier/${identifier}`);
      if (response.ok) {
        const data = await response.json();
        setMenuItem(data.menuItem);
        setFormData({
          name: data.menuItem.name,
          description: data.menuItem.description || '',
          category: data.menuItem.category || '',
          foodType: data.menuItem.foodType || 'VEG',
          image: data.menuItem.image || '',
          isAvailable: data.menuItem.isAvailable
        });
      } else if (response.status === 404) {
        router.push('/manager/menu');
      }
    } catch (error) {
      console.error('Failed to fetch menu item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!menuItem) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/manager/menu/items/by-identifier/${identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/manager/menu');
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Menu item not found</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit menu item</h1>
            <p className="text-gray-600">Update your menu item details</p>
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
          <LoadingButton
            onClick={handleSubmit}
            loading={submitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save changes
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
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Item name"
                  className="text-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Menu item"
                    width={800}
                    height={400}
                    loading="lazy"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 bg-white shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Input
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Enter image URL"
                      className="max-w-md mx-auto"
                    />
                    <p className="text-sm text-gray-500">
                      Add an image URL or upload files
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Variants Display (Read-only for now) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Variants</h3>
            <div className="space-y-3">
              {menuItem.variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className={`font-medium ${variant.isDefault ? 'text-primary' : 'text-gray-900'}`}>
                      {variant.name}
                      {variant.isDefault && <span className="text-xs text-primary ml-2">(Default)</span>}
                    </span>
                  </div>
                  <span className="font-medium">${variant.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Variant editing will be available in a future update
            </p>
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
                  Menu
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {menuItem.menu.name}
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
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
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Beverages, Main Course"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Type
                </label>
                <select
                  value={formData.foodType}
                  onChange={(e) => setFormData(prev => ({ ...prev, foodType: e.target.value as 'VEG' | 'NON_VEG' | 'HALAL' }))}
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
              </div>
            </div>
          </Card>

          {/* Preview */}
          {preview && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={formData.name}
                    width={800}
                    height={400}
                    loading="lazy"
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{formData.name || 'Menu Item Name'}</h4>
                    <Badge variant={formData.isAvailable ? "default" : "secondary"}>
                      {formData.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  
                  {formData.description && (
                    <p className="text-sm text-gray-600 mb-2">{formData.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    {formData.category && (
                      <Badge variant="outline">{formData.category}</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <FoodTypeIcon type={formData.foodType} size="sm" />
                      <span className="text-xs text-gray-600">
                        {formData.foodType === 'VEG' ? 'Veg' : formData.foodType === 'NON_VEG' ? 'Non-Veg' : 'Halal'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {menuItem.variants.map((variant) => (
                      <div key={variant.id} className="flex justify-between text-sm">
                        <span className={variant.isDefault ? "font-medium" : ""}>
                          {variant.name}
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