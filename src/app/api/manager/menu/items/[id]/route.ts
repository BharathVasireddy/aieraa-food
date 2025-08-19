import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: unknown
) {
  try {
    const { params } = context as { params: { id: string } };
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { isAvailable, name, description, category, image } = body;

    // Get menu item and check access
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
      data: {
        ...(isAvailable !== undefined && { isAvailable }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(image !== undefined && { image })
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
    const { params } = context as { params: { id: string } };
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get menu item and check access
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
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
      where: { id: params.id }
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