import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import Link from 'next/link';

// Server component
export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
        <p className="text-gray-600">{session.user.university}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/menu" className="rounded-xl border p-6 font-medium">Browse Menu</Link>
        <Link href="/cart" className="rounded-xl border p-6 font-medium">Cart & Checkout</Link>
        <Link href="/orders" className="rounded-xl border p-6 font-medium">My Orders</Link>
        <Link href="/profile" className="rounded-xl border p-6 font-medium">Profile</Link>
      </div>
    </div>
  );
}