import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { checkoutSchema } from '@/lib/validation';
import { isPastCutoffForDate, isWithinAdvanceWindow, toUtcDateOnly } from '@/lib/time';
import { sendNewOrderEmail } from '@/lib/email';

function generateOrderNumber(): string {
	const now = new Date();
	return `ORD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return apiError('Unauthorized', { status: 401 });

		const body = await request.json();
		const parsed = checkoutSchema.safeParse(body);
		if (!parsed.success) return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });

		const scheduledDateUtc = toUtcDateOnly(`${parsed.data.scheduledForDate}T00:00:00Z`);

		// University config
		const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { universityId: true } });
		if (!user?.universityId) return apiError('No university assigned', { status: 400 });
		const university = await prisma.university.findUnique({ where: { id: user.universityId } });
		if (!university) return apiError('University not found', { status: 400 });

		const cfg = { timezone: university.timezone, orderCutoffTime: university.orderCutoffTime, maxAdvanceDays: university.maxAdvanceDays };
		if (!isWithinAdvanceWindow(scheduledDateUtc, cfg)) return apiError('Selected date is beyond allowed window', { status: 400 });
		if (isPastCutoffForDate(scheduledDateUtc, cfg)) return apiError('Cutoff time has passed for the selected date', { status: 400 });

		// Load cart items for that date
		const cartItems = await prisma.cartItem.findMany({
			where: { userId: session.user.id, scheduledForDate: scheduledDateUtc },
			include: { variant: true, menuItem: true },
		});
		if (cartItems.length === 0) return apiError('Cart is empty', { status: 400 });

		// Availability check: only items with explicit availability true are allowed
		const availability = await prisma.menuItemAvailability.findMany({
			where: { date: scheduledDateUtc, menuItemId: { in: cartItems.map((ci) => ci.menuItemId) } },
			select: { menuItemId: true, isAvailable: true },
		});
		const availMap = new Map(availability.map((a) => [a.menuItemId, a.isAvailable]));
		for (const ci of cartItems) {
			if (!availMap.get(ci.menuItemId)) {
				return apiError('Some items are not available for the selected date', { status: 400 });
			}
		}

		// Compute total
		const total = cartItems.reduce((sum, ci) => sum + ci.quantity * ci.variant.price, 0);

		// Create order and order items atomically
		const orderNumber = generateOrderNumber();
		const order = await prisma.$transaction(async (tx) => {
			const created = await tx.order.create({
				data: {
					orderNumber,
					totalAmount: total,
					status: 'PENDING',
					userId: session.user.id,
					universityId: user.universityId!,
					scheduledForDate: scheduledDateUtc,
					items: {
						create: cartItems.map((ci) => ({
							quantity: ci.quantity,
							price: ci.variant.price,
							menuItemId: ci.menuItemId,
							variantId: ci.variantId,
						})),
					},
				},
				include: {
					items: {
						include: {
							variant: true,
							menuItem: true,
						},
					},
				},
			});

			// Clear cart for this date
			await tx.cartItem.deleteMany({ where: { userId: session.user.id, scheduledForDate: scheduledDateUtc } });
			return created;
		});

    try {
      const managers = await prisma.universityManager.findMany({
        where: { universityId: user.universityId },
        select: { manager: { select: { email: true, name: true } } }
      });
      const managerEmails = managers.map(m => m.manager.email).filter(Boolean) as string[];
      if (managerEmails.length > 0) {
        await sendNewOrderEmail(managerEmails, {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          scheduledForDate: checkoutSchema.parse(body).scheduledForDate,
          universityName: university.name,
          studentName: session.user.name,
          items: order.items.map(it => ({ quantity: it.quantity, name: it.menuItem.name, variant: it.variant.name, price: it.variant.price }))
        });
      }
    } catch (mailError) {
      console.error('Failed to send manager order notification:', mailError);
    }

		return apiSuccess({ order }, { status: 201, message: 'Order placed' });
	} catch (e) {
		return apiError('Checkout failed', { status: 500 });
	}
}


