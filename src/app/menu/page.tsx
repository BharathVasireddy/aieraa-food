import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { MenuClient } from './menu-client';

export default async function MenuPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'STUDENT') redirect('/login');
  return <MenuClient userName={session.user.name} universityName={session.user.university || 'University'} />;
}


