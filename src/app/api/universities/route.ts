import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    return apiSuccess(universities);
  } catch (error) {
    console.error('Failed to fetch universities:', error);
    return apiError('Failed to fetch universities', { status: 500 });
  }
}
