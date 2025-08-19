import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { updateOrderStatusSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return apiError('Unauthorized', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    // Get manager's assigned universities
    const managerUniversities = await prisma.universityManager.findMany({
      where: { managerId: session.user.id },
      select: { universityId: true }
    });

    const universityIds = managerUniversities.map(um => um.universityId);

    if (universityIds.length === 0) {
      return apiSuccess({ orders: [] });
    }

    // Get orders from assigned universities
    const orders = await prisma.order.findMany({
      where: {
        status: status as unknown as import('@prisma/client').OrderStatus,
        universityId: { in: universityIds }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        university: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return apiSuccess({ orders });

  } catch (error) {
    console.error('Manager orders fetch error:', error);
    return apiError('Failed to fetch orders', { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return apiError('Unauthorized', { status: 403 });
    }

    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });
    }
    const { orderId, status } = parsed.data;

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { university: true }
    });

    if (!order) {
      return apiError('Order not found', { status: 404 });
    }

    // Check if manager has access to this order's university
    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId: order.universityId
      }
    });

    if (!hasAccess) {
      return apiError('No access to this order', { status: 403 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        university: {
          select: {
            name: true
          }
        }
      }
    });

    return apiSuccess({
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        user: updatedOrder.user,
        university: updatedOrder.university
      }
    }, { message: 'Order status updated successfully' });

  } catch (error) {
    console.error('Manager order update error:', error);
    return apiError('Failed to update order status', { status: 500 });
  }
}