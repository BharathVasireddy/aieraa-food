'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';

function ResetPasswordClient() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!token) { setError('Invalid link'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      if (res.ok) {
        router.push('/login');
      } else {
        const body = await res.json();
        setError(body.error || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-2">Reset password</h1>
        <p className="text-sm text-gray-600 mb-4">Enter a new password for your account.</p>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <div className="grid gap-3">
          <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <LoadingButton loading={loading} onClick={submit} className="w-full">Set new password</LoadingButton>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10 max-w-md text-gray-500">Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}


