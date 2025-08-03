import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { StudentMenuClient } from './student-menu-client';

// Server component
export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  return <StudentMenuClient userName={session.user.name} universityName={session.user.university || 'University'} />;
}