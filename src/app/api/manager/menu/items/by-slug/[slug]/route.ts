import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: unknown
) {
  try {
    const { params } = context as { params: { slug: string } };
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

    // Find menu item by slug within manager's universities
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        slug: params.slug,
        menu: {
          universityId: { in: universityIds }
        }
      },
      include: {
        variants: {
          orderBy: { isDefault: 'desc' }
        },
        menu: {
          include: {
            university: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ menuItem });

  } catch (error) {
    console.error('Menu item fetch by slug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: unknown
) {
  try {
    const { params } = context as { params: { slug: string } };
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, foodType, image, isAvailable } = body;

    // Find menu item by slug and check access
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        slug: params.slug,
      },
      include: {
        menu: {
          include: { university: true }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId: menuItem.menu.universityId
      }
    });

    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this menu item' }, { status: 403 });
    }

    // Update menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id: menuItem.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(foodType !== undefined && { foodType }),
        ...(image !== undefined && { image }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json({ menuItem: updatedItem });

  } catch (error) {
    console.error('Menu item update error:', error);
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: unknown
) {
  try {
    const { params } = context as { params: { slug: string } };
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find menu item by slug and check access
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        slug: params.slug,
      },
      include: {
        menu: {
          include: { university: true }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId: menuItem.menu.universityId
      }
    });

    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this menu item' }, { status: 403 });
    }

    // Delete menu item (variants will be cascade deleted)
    await prisma.menuItem.delete({
      where: { id: menuItem.id }
    });

    return NextResponse.json({ message: 'Menu item deleted successfully' });

  } catch (error) {
    console.error('Menu item deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}