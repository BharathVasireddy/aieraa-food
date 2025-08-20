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
      {/* Banners */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-pink-500 text-white p-6">
        <div className="text-sm opacity-90">Foodie Weekend</div>
        <div className="text-2xl font-bold">Flat ₹150 OFF on delights!</div>
        <Link href="/menu" className="inline-block mt-4 bg-white text-gray-900 rounded-full px-4 py-2 text-sm font-semibold">Order Now</Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 text-center text-xs">
        <Link href="/menu" className="rounded-xl border p-3">Food</Link>
        <Link href="/orders" className="rounded-xl border p-3">Reorder</Link>
        <Link href="/orders" className="rounded-xl border p-3">Bolt</Link>
        <Link href="/profile" className="rounded-xl border p-3">Card</Link>
      </div>

      {/* Curated sections */}
      <div className="space-y-4">
        <Section title="Popular near you">
          <CardGrid />
        </Section>
        <Section title="Best for snacks">
          <CardGrid />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function CardGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-3 text-sm">
          <div className="h-24 bg-gray-100 rounded-lg mb-2" />
          <div className="font-medium">Sample Item</div>
          <div className="text-xs text-gray-600">₹99 • 15-20 mins</div>
        </div>
      ))}
    </div>
  );
}