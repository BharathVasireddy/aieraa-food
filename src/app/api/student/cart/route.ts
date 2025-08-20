import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { cartAddSchema, cartUpdateSchema } from '@/lib/validation';
import { toUtcDateOnly } from '@/lib/time';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });

		const items = await prisma.cartItem.findMany({
			where: { userId: session.user.id },
			include: {
				menuItem: true,
				variant: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return apiSuccess({ items });
	} catch (e) {
		return apiError('Failed to fetch cart', { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });

		const body = await request.json();
		const parsed = cartAddSchema.safeParse(body);
		if (!parsed.success) return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });

		const { menuItemId, variantId, quantity, scheduledForDate } = parsed.data;
		const scheduledDateUtc = toUtcDateOnly(`${scheduledForDate}T00:00:00Z`);

		// Ensure variant belongs to item
		const variant = await prisma.menuItemVariant.findFirst({ where: { id: variantId, menuItemId } });
		if (!variant) return apiError('Invalid variant', { status: 400 });

		// Upsert by unique composite key (userId, menuItemId, variantId, scheduledForDate)
		const item = await prisma.cartItem.upsert({
			where: {
				userId_menuItemId_variantId_scheduledForDate: {
					userId: session.user.id,
					menuItemId,
					variantId,
					scheduledForDate: scheduledDateUtc,
				},
			},
			create: {
				userId: session.user.id,
				menuItemId,
				variantId,
				quantity,
				scheduledForDate: scheduledDateUtc,
			},
			update: { quantity: { increment: quantity } },
			include: { menuItem: true, variant: true },
		});
		return apiSuccess({ item });
	} catch (e) {
		return apiError('Failed to add to cart', { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });

		const body = await request.json();
		const parsed = cartUpdateSchema.safeParse(body);
		if (!parsed.success) return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });

		const { menuItemId, variantId, quantity, scheduledForDate } = parsed.data;
		const scheduledDateUtc = toUtcDateOnly(`${scheduledForDate}T00:00:00Z`);

		if (quantity === 0) {
			await prisma.cartItem.delete({
				where: {
					userId_menuItemId_variantId_scheduledForDate: {
						userId: session.user.id,
						menuItemId,
						variantId,
						scheduledForDate: scheduledDateUtc,
					},
				},
			});
			return apiSuccess({ deleted: true });
		}

		const item = await prisma.cartItem.update({
			where: {
				userId_menuItemId_variantId_scheduledForDate: {
					userId: session.user.id,
					menuItemId,
					variantId,
					scheduledForDate: scheduledDateUtc,
				},
			},
			data: { quantity },
			include: { menuItem: true, variant: true },
		});
		return apiSuccess({ item });
	} catch (e) {
		return apiError('Failed to update cart', { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });
		const { searchParams } = new URL(request.url);
		const menuItemId = searchParams.get('menuItemId');
		const variantId = searchParams.get('variantId');
		const scheduledForDate = searchParams.get('scheduledForDate');
		if (!menuItemId || !variantId || !scheduledForDate) return apiError('Missing parameters', { status: 400 });
		const scheduledDateUtc = toUtcDateOnly(`${scheduledForDate}T00:00:00Z`);

		await prisma.cartItem.delete({
			where: {
				userId_menuItemId_variantId_scheduledForDate: {
					userId: session.user.id,
					menuItemId,
					variantId,
					scheduledForDate: scheduledDateUtc,
				},
			},
		});
		return apiSuccess({ deleted: true });
	} catch (e) {
		return apiError('Failed to remove item', { status: 500 });
	}
}


