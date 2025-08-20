'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';

export default function ManagerSettingsPage() {
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [orderCutoffTime, setOrderCutoffTime] = useState('20:00');
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/manager/settings');
        if (res.ok) {
          const { data } = await res.json();
          setTimezone(data.settings.timezone);
          setOrderCutoffTime(data.settings.orderCutoffTime);
          setMaxAdvanceDays(data.settings.maxAdvanceDays);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/manager/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone, orderCutoffTime, maxAdvanceDays })
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid gap-4">
          <Card className="p-4 grid gap-3">
            <div>
              <label className="text-sm text-gray-700">Timezone</label>
              <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="IANA timezone" />
              <div className="text-xs text-gray-500 mt-1">Default: Asia/Ho_Chi_Minh</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Order Cutoff Time</label>
              <Input type="time" value={orderCutoffTime} onChange={(e) => setOrderCutoffTime(e.target.value)} />
              <div className="text-xs text-gray-500 mt-1">Orders for a date close at this time on the previous day</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Max Advance Days</label>
              <Input type="number" min={1} max={14} value={maxAdvanceDays} onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value || '1', 10))} />
              <div className="text-xs text-gray-500 mt-1">Students can schedule up to this many days ahead</div>
            </div>
            <div className="pt-2">
              <LoadingButton loading={saving} onClick={save}>Save Settings</LoadingButton>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


