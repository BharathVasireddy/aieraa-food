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
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    let data: Array<Record<string, string | number>> = [];
    let filename = '';
    let headers: string[] = [];

    switch (reportType) {
      case 'orders':
        const orders = await prisma.order.findMany({
          where: {
            universityId: { in: universityIds },
            createdAt: { gte: start, lte: end }
          },
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            },
            university: {
              select: { name: true }
            },
            items: {
              include: {
                menuItem: { select: { name: true } },
                variant: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        headers = ['Order Number', 'Customer Name', 'Customer Email', 'Customer Phone', 'Items', 'Total Amount', 'Status', 'University', 'Order Date'];
        data = orders.map(order => ({
          'Order Number': order.orderNumber,
          'Customer Name': order.user.name,
          'Customer Email': order.user.email,
          'Customer Phone': order.user.phone || 'N/A',
          'Items': order.items.map(item => `${item.quantity}x ${item.menuItem.name} (${item.variant.name})`).join('; '),
          'Total Amount': `$${order.totalAmount.toFixed(2)}`,
          'Status': order.status,
          'University': order.university.name,
          'Order Date': order.createdAt.toISOString().split('T')[0]
        }));
        filename = 'orders-report';
        break;

      case 'students':
        const students = await prisma.user.findMany({
          where: {
            role: 'STUDENT',
            universityId: { in: universityIds },
            createdAt: { gte: start, lte: end }
          },
          include: {
            university: {
              select: { name: true, code: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        headers = ['Name', 'Email', 'Phone', 'Status', 'Registration Date', 'University'];
        data = students.map(student => ({
          'Name': student.name,
          'Email': student.email,
          'Phone': student.phone || 'N/A',
          'Status': student.status,
          'Registration Date': student.createdAt.toISOString().split('T')[0],
          'University': `${student.university?.name} ${student.university?.code ? `(${student.university.code})` : ''}`
        }));
        filename = 'students-report';
        break;

      case 'revenue':
        const revenueOrders = await prisma.order.findMany({
          where: {
            universityId: { in: universityIds },
            createdAt: { gte: start, lte: end },
            status: { in: ['APPROVED', 'PREPARING', 'READY_TO_COLLECT', 'DELIVERED'] }
          },
          select: {
            totalAmount: true,
            createdAt: true
          }
        });

        // Group by date
        const revenueByDate = new Map();
        revenueOrders.forEach(order => {
          const date = order.createdAt.toISOString().split('T')[0];
          if (!revenueByDate.has(date)) {
            revenueByDate.set(date, { count: 0, revenue: 0 });
          }
          const stats = revenueByDate.get(date);
          stats.count += 1;
          stats.revenue += order.totalAmount;
        });

        headers = ['Date', 'Orders Count', 'Total Revenue', 'Average Order Value'];
        data = Array.from(revenueByDate.entries()).map(([date, stats]) => ({
          'Date': date,
          'Orders Count': stats.count,
          'Total Revenue': `$${stats.revenue.toFixed(2)}`,
          'Average Order Value': `$${(stats.revenue / stats.count).toFixed(2)}`
        }));
        filename = 'revenue-report';
        break;

      case 'menu-performance':
        const menuPerformance = await prisma.orderItem.groupBy({
          by: ['menuItemId'],
          where: {
            order: {
              universityId: { in: universityIds },
              createdAt: { gte: start, lte: end }
            }
          },
          _sum: {
            quantity: true,
            price: true
          },
          _count: {
            menuItemId: true
          }
        });

        const menuItemsData = await Promise.all(
          menuPerformance.map(async (item, index) => {
            const menuItem = await prisma.menuItem.findUnique({
              where: { id: item.menuItemId },
              select: { name: true, category: true }
            });
            
            return {
              'Item Name': menuItem?.name || 'Unknown Item',
              'Category': menuItem?.category || 'Uncategorized',
              'Total Orders': item._sum.quantity || 0,
              'Revenue': `$${(item._sum.price || 0).toFixed(2)}`,
              'Popularity Rank': index + 1
            };
          })
        );

        headers = ['Item Name', 'Category', 'Total Orders', 'Revenue', 'Popularity Rank'];
        data = menuItemsData.sort((a, b) => b['Total Orders'] - a['Total Orders']);
        filename = 'menu-performance-report';
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Generate CSV content
    if (format === 'csv') {
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape CSV values that contain commas or quotes
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}-${startDate}-to-${endDate}.csv"`
        }
      });
    }

    // For other formats, return JSON with data (would need additional libraries for Excel/PDF)
    return NextResponse.json({
      data,
      headers,
      message: 'Only CSV format is currently supported'
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}