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
    const status = searchParams.get('status') || 'PENDING';

    // Get manager's assigned universities
    const managerUniversities = await prisma.universityManager.findMany({
      where: { managerId: session.user.id },
      select: { universityId: true }
    });

    const universityIds = managerUniversities.map(um => um.universityId);

    if (universityIds.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // Get students from assigned universities
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: status as unknown as import('@prisma/client').UserStatus,
        universityId: { in: universityIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        university: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ students });

  } catch (error) {
    console.error('Manager students fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, action, reason } = body;

    if (!studentId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject', 'suspend', 'reactivate'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { university: true }
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if manager has access to this student's university
    const hasAccess = await prisma.universityManager.findFirst({
      where: {
        managerId: session.user.id,
        universityId: student.universityId!
      }
    });

    if (!hasAccess) {
      return NextResponse.json({ error: 'No access to this student' }, { status: 403 });
    }

    // Update student status
    let newStatus: import('@prisma/client').UserStatus;
    switch (action) {
      case 'approve':
        newStatus = 'APPROVED';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        break;
      case 'suspend':
        newStatus = 'SUSPENDED';
        break;
      case 'reactivate':
        newStatus = 'APPROVED';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    await prisma.user.update({
      where: { id: studentId },
      data: { status: newStatus }
    });

    const actionMessages = {
      approve: 'approved',
      reject: 'rejected',
      suspend: 'suspended',
      reactivate: 'reactivated'
    };

    return NextResponse.json({
      message: `Student ${actionMessages[action as keyof typeof actionMessages]} successfully`,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        status: newStatus,
        university: student.university?.name
      }
    });

  } catch (error) {
    console.error('Manager student action error:', error);
    return NextResponse.json(
      { error: 'Failed to update student status' },
      { status: 500 }
    );
  }
}