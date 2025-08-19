import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Update university
export async function PUT(request: NextRequest, context: unknown) {
  try {
    const { params } = context as { params: { id: string } };
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, location, description, isActive } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'University name is required' }, { status: 400 });
    }

    // Validate code format if provided
    if (code && !/^[A-Z0-9]{2,10}$/.test(code)) {
      return NextResponse.json({ 
        error: 'University code must be 2-10 characters, uppercase letters and numbers only' 
      }, { status: 400 });
    }

    // Check if university exists
    const existingUniversity = await prisma.university.findUnique({
      where: { id: params.id },
    });

    if (!existingUniversity) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    // Check for conflicts with other universities
    const conflicts = await prisma.university.findFirst({
      where: {
        id: { not: params.id },
        OR: [
          { name: name.trim() },
          ...(code ? [{ code: code.toUpperCase() }] : []),
        ],
      },
    });

    if (conflicts) {
      if (conflicts.name === name.trim()) {
        return NextResponse.json({ error: 'Another university with this name already exists' }, { status: 409 });
      }
      if (conflicts.code === code?.toUpperCase()) {
        return NextResponse.json({ error: 'Another university with this code already exists' }, { status: 409 });
      }
    }

    const university = await prisma.university.update({
      where: { id: params.id },
      data: {
        code: code ? code.toUpperCase() : null,
        name: name.trim(),
        location: location?.trim() || null,
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : existingUniversity.isActive,
      },
    });

    return NextResponse.json({ 
      message: 'University updated successfully',
      university 
    });

  } catch (error) {
    console.error('Update university error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete university
export async function DELETE(request: NextRequest, context: unknown) {
  try {
    const { params } = context as { params: { id: string } };
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            students: true,
            managers: true,
            menus: true,
            orders: true,
          },
        },
      },
    });

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    // Check if university has associated data
    const { _count } = university;
    if (_count.students > 0 || _count.managers > 0 || _count.menus > 0 || _count.orders > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete university with associated students, managers, menus, or orders. Deactivate it instead.',
        details: {
          students: _count.students,
          managers: _count.managers,
          menus: _count.menus,
          orders: _count.orders,
        }
      }, { status: 400 });
    }

    await prisma.university.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      message: 'University deleted successfully' 
    });

  } catch (error) {
    console.error('Delete university error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}