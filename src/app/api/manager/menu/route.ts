import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
      return NextResponse.json({ menus: [] });
    }

    // Get menus for assigned universities
    const menus = await prisma.menu.findMany({
      where: {
        universityId: { in: universityIds }
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        items: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            category: true,
            foodType: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true,
            variants: {
              orderBy: { isDefault: 'desc' },
              select: {
                id: true,
                name: true,
                price: true,
                isDefault: true
              }
            }
          }
        },
        university: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ menus });

  } catch (error) {
    console.error('Manager menu fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, universityId } = body;

    if (!name || !universityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if manager has access to this university
    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId
      }
    });

    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this university' }, { status: 403 });
    }

    // Create menu
    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        universityId
      },
      include: {
        items: {
          include: {
            variants: true
          }
        },
        university: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ menu });

  } catch (error) {
    console.error('Manager menu creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}