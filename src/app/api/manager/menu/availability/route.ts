import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { toUtcDateOnly } from '@/lib/time';

const updateSchema = z.object({
	menuItemId: z.string().min(1),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	isAvailable: z.boolean(),
});

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.user.role !== 'MANAGER') return apiError('Unauthorized', { status: 403 });
		const { searchParams } = new URL(request.url);
		const date = searchParams.get('date');
		if (!date) return apiError('Missing date', { status: 400 });
		const dateUtc = toUtcDateOnly(`${date}T00:00:00Z`);

		const managerUnis = await prisma.universityManager.findMany({ where: { managerId: session.user.id }, select: { universityId: true } });
		const universityIds = managerUnis.map((m) => m.universityId);
		if (universityIds.length === 0) return apiSuccess({ items: [] });

		const items = await prisma.menuItem.findMany({
			where: { menu: { universityId: { in: universityIds } } },
			select: { id: true, name: true, category: true, menuId: true },
		});
		const availability = await prisma.menuItemAvailability.findMany({
			where: { date: dateUtc, menuItemId: { in: items.map((i) => i.id) } },
			select: { menuItemId: true, isAvailable: true },
		});
		const availMap = new Map(availability.map((a) => [a.menuItemId, a.isAvailable]));
		return apiSuccess({
			items: items.map((i) => ({ ...i, isAvailable: availMap.get(i.id) ?? false })),
		});
	} catch (e) {
		return apiError('Failed to fetch availability', { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.user.role !== 'MANAGER') return apiError('Unauthorized', { status: 403 });
		const body = await request.json();
		const parsed = updateSchema.safeParse(body);
		if (!parsed.success) return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });
		const { menuItemId, date, isAvailable } = parsed.data;
		const dateUtc = toUtcDateOnly(`${date}T00:00:00Z`);

		// ensure manager controls the item
		const item = await prisma.menuItem.findUnique({
			where: { id: menuItemId },
			include: { menu: true },
		});
		if (!item) return apiError('Item not found', { status: 404 });
		const hasAccess = await prisma.universityManager.findFirst({ where: { managerId: session.user.id, universityId: item.menu.universityId } });
		if (!hasAccess) return apiError('No access to this item', { status: 403 });

		const upserted = await prisma.menuItemAvailability.upsert({
			where: { menuItemId_date: { menuItemId, date: dateUtc } },
			create: { menuItemId, date: dateUtc, isAvailable },
			update: { isAvailable },
		});
		return apiSuccess({ availability: upserted });
	} catch (e) {
		return apiError('Failed to update availability', { status: 500 });
	}
}


