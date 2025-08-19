import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/slug-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
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

    // Await params for Next.js 15
    const { identifier } = await params;

    // Try to find by ID first, then by generated slug from name
    let menuItem = null;

    // First try to find by ID (direct match)
    if (identifier.match(/^[a-zA-Z0-9]+$/)) {
      menuItem = await prisma.menuItem.findFirst({
        where: {
          id: identifier,
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
    }

    // If not found by ID, try to find by matching the slug against generated slugs from names
    if (!menuItem) {
      const allItems = await prisma.menuItem.findMany({
        where: {
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

      // Find item where generated slug matches the identifier
      menuItem = allItems.find(item => generateSlug(item.name) === identifier);
    }

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ menuItem });

  } catch (error) {
    console.error('Menu item fetch by identifier error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, foodType, image, isAvailable } = body;

    // Await params for Next.js 15
    const { identifier } = await params;

    // Find menu item by identifier (ID or slug)
    let menuItem = null;

    // First try to find by ID
    if (identifier.match(/^[a-zA-Z0-9]+$/)) {
      menuItem = await prisma.menuItem.findFirst({
        where: {
          id: identifier,
        },
        include: {
          menu: {
            include: { university: true }
          }
        }
      });
    }

    // If not found by ID, try to find by generated slug
    if (!menuItem) {
      const allItems = await prisma.menuItem.findMany({
        include: {
          menu: {
            include: { university: true }
          }
        }
      });

      menuItem = allItems.find(item => generateSlug(item.name) === identifier);
    }

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