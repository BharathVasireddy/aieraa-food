import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function GET(request: NextRequest, context: unknown) {
  try {
    const { params } = context as { params: { orderNumber: string } };
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', { status: 401 });

    const order = await prisma.order.findFirst({
      where: { userId: session.user.id, orderNumber: params.orderNumber },
      include: {
        items: {
          include: {
            menuItem: { select: { id: true, name: true, image: true } },
            variant: { select: { id: true, name: true, price: true } },
          },
        },
        university: { select: { id: true, name: true } },
      },
    });

    if (!order) return apiError('Order not found', { status: 404 });
    return apiSuccess({ order });
  } catch (e) {
    return apiError('Failed to fetch order', { status: 500 });
  }
}


