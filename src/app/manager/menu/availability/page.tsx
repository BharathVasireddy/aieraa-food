'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ManagerAvailabilityPage() {
  interface ItemRow { id: string; name: string; category?: string; isAvailable: boolean }
  const [date, setDate] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(today.getUTCDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    async function load() {
      if (!date) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/manager/menu/availability?date=${date}`);
        if (res.ok) {
          const { data } = await res.json();
          setItems(data.items || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date]);

  const toggle = async (menuItemId: string, newValue: boolean) => {
    setSaving(true);
    try {
      await fetch('/api/manager/menu/availability', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuItemId, date, isAvailable: newValue }) });
      setItems((prev) => prev.map((it) => it.id === menuItemId ? { ...it, isAvailable: newValue } : it));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Availability</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <Card className="p-4">
          <div className="grid gap-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{it.name}</div>
                  {it.category && <div className="text-xs text-gray-600 truncate">{it.category}</div>}
                </div>
                <div>
                  <Button variant={it.isAvailable ? 'default' : 'outline'} onClick={() => toggle(it.id, !it.isAvailable)} disabled={saving}>
                    {it.isAvailable ? 'Available' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


