import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: unknown
) {
  try {
    const { params } = context as { params: { orderNumber: string } };
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get manager's assigned universities
    const managerUniversities = await prisma.universityManager.findMany({
      where: { managerId: session.user.id },
      select: { universityId: true }
    });

    const universityIds = managerUniversities.map(um => um.universityId);

    if (universityIds.length === 0) {
      return NextResponse.json({ error: 'No universities assigned' }, { status: 403 });
    }

    // Find order by order number within manager's universities
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: params.orderNumber,
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
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Order fetch by number error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: unknown
) {
  try {
    const { params } = context as { params: { orderNumber: string } };
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'APPROVED', 'PREPARING', 'READY_TO_COLLECT', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Find order by order number and check access
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: params.orderNumber,
      },
      include: { university: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if manager has access to this order's university
    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId: order.universityId
      }
    });

    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this order' }, { status: 403 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
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

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        user: updatedOrder.user,
        university: updatedOrder.university
      }
    });

  } catch (error) {
    console.error('Order update by number error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}