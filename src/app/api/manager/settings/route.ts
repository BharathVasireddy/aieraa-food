import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

const settingsSchema = z.object({
	orderCutoffTime: z.string().regex(/^\d{2}:\d{2}$/),
	maxAdvanceDays: z.number().int().min(1).max(14),
	timezone: z.string().min(1),
});

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.user.role !== 'MANAGER') return apiError('Unauthorized', { status: 403 });

		const manager = await prisma.user.findUnique({ where: { id: session.user.id }, select: { universityId: true } });
		if (!manager?.universityId) return apiError('No university', { status: 400 });
		const university = await prisma.university.findUnique({ where: { id: manager.universityId } });
		if (!university) return apiError('University not found', { status: 404 });
		return apiSuccess({ settings: { orderCutoffTime: university.orderCutoffTime, maxAdvanceDays: university.maxAdvanceDays, timezone: university.timezone } });
	} catch (e) {
		return apiError('Failed to load settings', { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || session.user.role !== 'MANAGER') return apiError('Unauthorized', { status: 403 });

		const manager = await prisma.user.findUnique({ where: { id: session.user.id }, select: { universityId: true } });
		if (!manager?.universityId) return apiError('No university', { status: 400 });

		const body = await request.json();
		const parsed = settingsSchema.safeParse(body);
		if (!parsed.success) return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });
		const { orderCutoffTime, maxAdvanceDays, timezone } = parsed.data;

		const updated = await prisma.university.update({
			where: { id: manager.universityId },
			data: { orderCutoffTime, maxAdvanceDays, timezone },
			select: { orderCutoffTime: true, maxAdvanceDays: true, timezone: true },
		});
		return apiSuccess({ settings: updated });
	} catch (e) {
		return apiError('Failed to update settings', { status: 500 });
	}
}


