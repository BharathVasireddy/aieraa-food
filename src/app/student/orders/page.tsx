'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';

export default function StudentOrdersPage() {
  interface OrderListItem { id: string; orderNumber: string; status: string; totalAmount: number; scheduledForDate: string }
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/student/orders');
        if (res.ok) {
          const { data }: { data: { orders: OrderListItem[] } } = await res.json();
          setOrders((data.orders || []).map((o) => ({ ...o, scheduledForDate: o.scheduledForDate?.slice(0,10) })));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No orders yet.</div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/student/orders/${o.orderNumber}`}>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">#{o.orderNumber}</div>
                    <div className="text-sm text-gray-600">For {o.scheduledForDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{o.totalAmount.toFixed(0)}</div>
                    <div className="text-xs text-gray-600">{o.status}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


