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
      include: {
        university: {
          select: {
            id: true,
            name: true,
            isActive: true,
          }
        }
      }
    });

    const universityIds = managerUniversities.map(um => um.universityId);

    if (universityIds.length === 0) {
      return NextResponse.json({
        pendingApprovals: 0,
        menuItems: 0,
        activeStudents: 0,
        todaysOrders: 0,
        universities: []
      });
    }

    // Get stats for assigned universities
    const [
      pendingStudents,
      menuItems,
      activeStudents,
      todaysOrders
    ] = await Promise.all([
      // Pending student approvals
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'PENDING',
          universityId: { in: universityIds }
        }
      }),
      
      // Total menu items across assigned universities
      prisma.menuItem.count({
        where: {
          menu: {
            universityId: { in: universityIds }
          }
        }
      }),
      
      // Active students in assigned universities
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'APPROVED',
          universityId: { in: universityIds }
        }
      }),
      
      // Today's orders
      prisma.order.count({
        where: {
          universityId: { in: universityIds },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    return NextResponse.json({
      pendingApprovals: pendingStudents,
      menuItems,
      activeStudents,
      todaysOrders,
      universities: managerUniversities.map(um => um.university)
    });

  } catch (error) {
    console.error('Manager dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}