import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { ManagerSidebar } from '@/components/navigation/manager-sidebar';
import { ReportsClient } from './reports-client';

import { authOptions } from '@/lib/auth';

export default async function ReportsPage() {
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">Generate and download detailed reports for your university.</p>
          </div>

          <ReportsClient />
        </main>
      </div>
    </div>
  );
}