import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { AdminSidebar } from '@/components/navigation/admin-sidebar';
import { authOptions } from '@/lib/auth';

import UniversitiesClient from './universities-client';

interface University {
  id: string;
  code: string | null;
  name: string;
  location: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    students: number;
    managers: number;
    menus: number;
    orders: number;
  };
}

export default async function UniversitiesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminSidebar userName={session.user.name} />

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Mobile header space */}
        <div className="lg:hidden h-16"></div>

        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          <UniversitiesClient />
        </main>
      </div>
    </div>
  );
}