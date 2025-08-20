import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });

		const orders = await prisma.order.findMany({
			where: { userId: session.user.id },
			include: {
				items: {
					include: {
						menuItem: { select: { id: true, name: true, image: true } },
						variant: { select: { id: true, name: true, price: true } },
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return apiSuccess({ orders });
	} catch (e) {
		return apiError('Failed to fetch orders', { status: 500 });
	}
}


