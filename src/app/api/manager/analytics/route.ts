import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = parseInt(searchParams.get('timeframe') || '30');

    // Get manager's assigned universities
    const managerUniversities = await prisma.universityManager.findMany({
      where: { managerId: session.user.id },
      select: { universityId: true }
    });

    const universityIds = managerUniversities.map(um => um.universityId);

    if (universityIds.length === 0) {
      return NextResponse.json({
        overview: {
          totalRevenue: 0,
          totalOrders: 0,
          totalStudents: 0,
          averageOrderValue: 0,
          revenueGrowth: 0,
          ordersGrowth: 0,
          studentsGrowth: 0
        },
        ordersByStatus: {
          pending: 0,
          approved: 0,
          preparing: 0,
          ready: 0,
          delivered: 0,
          cancelled: 0
        },
        popularItems: [],
        dailyStats: [],
        monthlyStats: []
      });
    }

    const currentDate = new Date();
    const startDate = new Date(currentDate.getTime() - timeframe * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - timeframe * 24 * 60 * 60 * 1000);

    // Current period data
    const [
      currentOrders,
      previousOrders,
      totalStudents,
      previousStudents,
      ordersByStatus,
      popularItemsData,
      dailyStatsData
    ] = await Promise.all([
      // Current period orders
      prisma.order.findMany({
        where: {
          universityId: { in: universityIds },
          createdAt: { gte: startDate }
        },
        select: {
          totalAmount: true,
          createdAt: true,
          status: true
        }
      }),
      
      // Previous period orders for comparison
      prisma.order.findMany({
        where: {
          universityId: { in: universityIds },
          createdAt: { gte: previousStartDate, lt: startDate }
        },
        select: {
          totalAmount: true
        }
      }),
      
      // Current active students
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'APPROVED',
          universityId: { in: universityIds },
          createdAt: { gte: startDate }
        }
      }),
      
      // Previous period students
      prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'APPROVED',
          universityId: { in: universityIds },
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: {
          universityId: { in: universityIds },
          createdAt: { gte: startDate }
        },
        _count: {
          status: true
        }
      }),
      
      // Popular items
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: {
            universityId: { in: universityIds },
            createdAt: { gte: startDate }
          }
        },
        _sum: {
          quantity: true,
          price: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      }),
      
      // Daily stats for the last 30 days
      prisma.order.findMany({
        where: {
          universityId: { in: universityIds },
          createdAt: { gte: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000) }
        },
        select: {
          totalAmount: true,
          createdAt: true
        }
      })
    ]);

    // Calculate overview metrics
    const currentRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const currentOrdersCount = currentOrders.length;
    const previousOrdersCount = previousOrders.length;

    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const ordersGrowth = previousOrdersCount > 0 ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100 : 0;
    const studentsGrowth = previousStudents > 0 ? ((totalStudents - previousStudents) / previousStudents) * 100 : 0;

    // Format orders by status
    const statusCounts = {
      pending: 0,
      approved: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0
    };

    ordersByStatus.forEach(item => {
      const raw = item.status as import('@prisma/client').OrderStatus;
      if (raw === 'READY_TO_COLLECT') {
        statusCounts.ready = item._count.status;
        return;
      }
      const key = raw.toLowerCase() as keyof typeof statusCounts;
      if (key in statusCounts) {
        statusCounts[key] = item._count.status;
      }
    });

    // Get popular items details
    const popularItems = await Promise.all(
      popularItemsData.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: {
            name: true,
            category: true
          }
        });
        
        return {
          id: item.menuItemId,
          name: menuItem?.name || 'Unknown Item',
          category: menuItem?.category || 'Uncategorized',
          totalOrders: item._sum.quantity || 0,
          totalRevenue: item._sum.price || 0
        };
      })
    );

    // Generate daily stats
    const dailyStats = [];
    const dailyStatsMap = new Map();
    
    // Group orders by day
    dailyStatsData.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, { orders: 0, revenue: 0 });
      }
      const stats = dailyStatsMap.get(dateKey);
      stats.orders += 1;
      stats.revenue += order.totalAmount;
    });

    // Convert to array and fill missing days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const stats = dailyStatsMap.get(dateKey) || { orders: 0, revenue: 0 };
      
      dailyStats.push({
        date: dateKey,
        orders: stats.orders,
        revenue: stats.revenue
      });
    }

    // Generate monthly stats (last 12 months)
    const monthlyStats = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthOrders = await prisma.order.findMany({
        where: {
          universityId: { in: universityIds },
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        },
        select: {
          totalAmount: true
        }
      });

      const monthStudents = await prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'APPROVED',
          universityId: { in: universityIds },
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      });

      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        students: monthStudents
      });
    }

    return NextResponse.json({
      overview: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrdersCount,
        totalStudents,
        averageOrderValue: currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0,
        revenueGrowth,
        ordersGrowth,
        studentsGrowth
      },
      ordersByStatus: statusCounts,
      popularItems,
      dailyStats,
      monthlyStats
    });

  } catch (error) {
    console.error('Manager analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}