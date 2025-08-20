import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'STUDENT') redirect('/login');
  return (
    <div className="container mx-auto px-4 py-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-600">Name</div>
        <div className="font-medium">{session.user.name}</div>
      </div>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-600">Email</div>
        <div className="font-medium">{session.user.email}</div>
      </div>
      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-600">University</div>
        <div className="font-medium">{session.user.university}</div>
      </div>
    </div>
  );
}


