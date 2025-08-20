'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading-button';

export default function StudentCartPage() {
  interface CartApiItem {
    menuItem: { id: string; name: string; image?: string };
    variant: { id: string; name: string; price: number };
    quantity: number;
    scheduledForDate: string;
  }
  const [items, setItems] = useState<CartApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const scheduledDate = useMemo(() => items[0]?.scheduledForDate, [items]);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.quantity * it.variant.price, 0), [items]);
  const tax = useMemo(() => Math.round(subtotal * 0.05 * 100) / 100, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/cart');
        if (res.ok) {
          const { data }: { data: { items: CartApiItem[] } } = await res.json();
          setItems((data.items || []).map((it) => ({ ...it, scheduledForDate: it.scheduledForDate?.slice(0,10) })));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateQty = async (menuItemId: string, variantId: string, scheduledForDate: string, quantity: number) => {
    await fetch('/api/student/cart', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuItemId, variantId, quantity, scheduledForDate }) });
    setItems((prev) => prev.map((it) => it.menuItem.id === menuItemId && it.variant.id === variantId && it.scheduledForDate === scheduledForDate ? { ...it, quantity } : it));
  };

  const removeItem = async (menuItemId: string, variantId: string, scheduledForDate: string) => {
    await fetch(`/api/student/cart?menuItemId=${menuItemId}&variantId=${variantId}&scheduledForDate=${scheduledForDate}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((it) => !(it.menuItem.id === menuItemId && it.variant.id === variantId && it.scheduledForDate === scheduledForDate)));
  };

  const checkout = async () => {
    if (!scheduledDate) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/student/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduledForDate: scheduledDate }) });
      if (res.ok) {
        const { data } = await res.json();
        window.location.href = `/student/orders/${data.order.orderNumber}`;
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link href="/student"><Button>Browse Menu</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-2">Scheduled for</div>
            <div className="font-medium">{scheduledDate}</div>
          </Card>
          {items.map((it) => (
            <Card key={`${it.menuItem.id}-${it.variant.id}-${it.scheduledForDate}`} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{it.menuItem.name}</div>
                  <div className="text-sm text-gray-600 truncate">{it.variant.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-2xl overflow-hidden">
                    <button className="px-3 py-2" onClick={() => updateQty(it.menuItem.id, it.variant.id, it.scheduledForDate, Math.max(1, it.quantity - 1))}>-</button>
                    <div className="px-3 py-2 text-center w-10">{it.quantity}</div>
                    <button className="px-3 py-2" onClick={() => updateQty(it.menuItem.id, it.variant.id, it.scheduledForDate, Math.min(10, it.quantity + 1))}>+</button>
                  </div>
                  <div className="w-16 text-right font-medium">₹{(it.variant.price * it.quantity).toFixed(0)}</div>
                  <button className="text-sm text-red-600" onClick={() => removeItem(it.menuItem.id, it.variant.id, it.scheduledForDate)}>Remove</button>
                </div>
              </div>
            </Card>
          ))}
          <Card className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>Tax</span><span>₹{tax.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold mt-2">
              <span>Total</span><span>₹{total.toFixed(0)}</span>
            </div>
          </Card>
          <LoadingButton loading={processing} onClick={checkout} className="w-full" size="lg">Pay to Manager and Checkout</LoadingButton>
        </div>
      )}
    </div>
  );
}


