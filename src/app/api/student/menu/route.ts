import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { toUtcDateOnly } from '@/lib/time';

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });
		const { searchParams } = new URL(request.url);
		const date = searchParams.get('date');
		if (!date) return apiError('Missing date', { status: 400 });
		const dateUtc = toUtcDateOnly(`${date}T00:00:00Z`);

		// Get university
		const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { universityId: true } });
		if (!user?.universityId) return apiError('No university assigned', { status: 400 });

		// Items for this university
		const items = await prisma.menuItem.findMany({
			where: { menu: { universityId: user.universityId } },
			select: {
				id: true,
				name: true,
				description: true,
				image: true,
				category: true,
				foodType: true,
				variants: { select: { id: true, name: true, price: true, isDefault: true } },
			},
			orderBy: { createdAt: 'desc' },
		});

		// Availability records
		const availability = await prisma.menuItemAvailability.findMany({
			where: { date: dateUtc, menuItemId: { in: items.map((i) => i.id) } },
			select: { menuItemId: true, isAvailable: true },
		});
		const availMap = new Map(availability.map((a) => [a.menuItemId, a.isAvailable]));

		return apiSuccess({
			items: items.filter((i) => availMap.get(i.id)),
		});
	} catch (e) {
		return apiError('Failed to fetch menu', { status: 500 });
	}
}


