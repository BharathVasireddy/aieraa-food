import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { ManagerSidebar } from '@/components/navigation/manager-sidebar';
import { NewMenuItemClient } from './new-menu-item-client';

import { authOptions } from '@/lib/auth';

export default async function NewMenuItemPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MANAGER') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <ManagerSidebar
        userName={session.user.name}
        universityName={session.user.university || 'University'}
      />

      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Mobile header space */}
        <div className="lg:hidden h-16"></div>

        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          <NewMenuItemClient />
        </main>
      </div>
    </div>
  );
}