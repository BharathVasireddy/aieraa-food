'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react';
import { showToast } from '@/lib/error-handlers';
import { LoadingButton } from '@/components/ui/loading-button';

interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  isAvailable: boolean;
  variants?: MenuItemVariant[];
  onAddToCart: (itemId: string, variantId?: string, quantity?: number) => void;
}

export function MenuItemCard({
  id,
  name,
  description,
  basePrice,
  category,
  isAvailable,
  variants = [],
  onAddToCart,
}: MenuItemCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const currentPrice = selectedVariant
    ? variants.find((v) => v.id === selectedVariant)?.price || basePrice
    : basePrice;

  const handleAddToCart = async () => {
    if (!isAvailable) {
      showToast.error('This item is currently not available');
      return;
    }

    if (selectedVariant) {
      const variant = variants.find(v => v.id === selectedVariant);
      if (variant && !variant.isAvailable) {
        showToast.error('Selected variant is not available');
        return;
      }
    }

    setIsAddingToCart(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onAddToCart(id, selectedVariant || undefined, quantity);
      
      // Show success message
      const variantName = selectedVariant 
        ? variants.find(v => v.id === selectedVariant)?.name 
        : '';
      const itemName = variantName ? `${name} (${variantName})` : name;
      const quantityText = quantity === 1 ? '' : ` x${quantity}`;
      
      showToast.success(`${itemName}${quantityText} added to cart!`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast.error('Unable to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementQuantity = () => setQuantity(Math.min(quantity + 1, 10));
  const decrementQuantity = () => setQuantity(Math.max(quantity - 1, 1));

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        {/* Food Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-4xl">
            {category === 'MAIN_COURSE' && '🍛'}
            {category === 'BEVERAGES' && '🥤'}
            {category === 'DESSERTS' && '🍰'}
            {category === 'SNACKS' && '🥗'}
            {!['MAIN_COURSE', 'BEVERAGES', 'DESSERTS', 'SNACKS'].includes(category) && '🍽️'}
          </div>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            </div>
            <Badge
              variant={isAvailable ? 'default' : 'secondary'}
              className={
                isAvailable
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }
            >
              {isAvailable ? 'Available' : 'Sold Out'}
            </Badge>
          </div>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Size/Quantity:</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={!variant.isAvailable}
                    className={`px-3 py-2 rounded-2xl text-sm font-medium transition-colors ${
                      selectedVariant === variant.id
                        ? 'bg-primary text-white'
                        : variant.isAvailable
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {variant.name} - ₹{variant.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold text-primary">₹{currentPrice}</div>
            
            {isAvailable && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-2xl">
                  <button
                    onClick={decrementQuantity}
                    className="p-2 hover:bg-gray-50 transition-colors rounded-l-2xl"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-gray-50 transition-colors rounded-r-2xl"
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <LoadingButton
            onClick={handleAddToCart}
            disabled={!isAvailable}
            loading={isAddingToCart}
            loadingText="Adding..."
            className="w-full"
            size="lg"
          >
            {isAvailable ? `Add to Cart • ₹${currentPrice * quantity}` : 'Sold Out'}
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
}