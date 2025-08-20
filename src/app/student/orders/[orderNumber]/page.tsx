'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudentOrderDetailPage(props: unknown) {
  const { params } = props as { params: { orderNumber: string } };
  interface OrderItemRow { id: string; quantity: number; variant: { name: string; price: number }; menuItem: { name: string } }
  interface OrderDetail { id: string; orderNumber: string; status: string; totalAmount: number; scheduledForDate: string; items: OrderItemRow[] }
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/orders/${params.orderNumber}`);
        if (res.ok) {
          const { data }: { data: { order: OrderDetail } } = await res.json();
          setOrder(data.order);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.orderNumber]);

  return (
    <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Order #{params.orderNumber}</h1>
        <Link href="/student/orders"><Button variant="outline" size="sm">Back</Button></Link>
      </div>
      {loading || !order ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Scheduled for</div>
                <div className="font-medium">{order.scheduledForDate?.slice(0,10)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-medium">{order.status}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="grid gap-3">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{it.menuItem.name}</div>
                    <div className="text-sm text-gray-600 truncate">{it.variant.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">x{it.quantity}</div>
                    <div className="font-medium">₹{(it.quantity * it.variant.price).toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between"><span>Subtotal</span><span>₹{order.items.reduce((s, it) => s + it.quantity * it.variant.price, 0).toFixed(0)}</span></div>
            <div className="flex items-center justify-between"><span>Total</span><span className="font-semibold">₹{order.totalAmount.toFixed(0)}</span></div>
          </Card>
        </div>
      )}
    </div>
  );
}


