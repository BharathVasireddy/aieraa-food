import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { ManagerSidebar } from '@/components/navigation/manager-sidebar';
import { EditMenuItemClient } from './edit-menu-item-client';

import { authOptions } from '@/lib/auth';

interface EditMenuItemPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditMenuItemPage({ params }: EditMenuItemPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'MANAGER') {
    redirect('/login');
  }

  // Await the params in Next.js 15
  const { slug } = await params;

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
          <EditMenuItemClient slug={slug} />
        </main>
      </div>
    </div>
  );
}