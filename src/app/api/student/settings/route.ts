import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });

		const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { universityId: true } });
		if (!user?.universityId) return apiError('No university assigned', { status: 400 });
		const university = await prisma.university.findUnique({ where: { id: user.universityId }, select: { timezone: true, orderCutoffTime: true, maxAdvanceDays: true, name: true } });
		if (!university) return apiError('University not found', { status: 404 });
		return apiSuccess({ settings: university });
	} catch (e) {
		return apiError('Failed to load settings', { status: 500 });
	}
}


