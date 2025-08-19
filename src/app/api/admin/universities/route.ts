import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get all universities
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' },
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

    return NextResponse.json({ universities });
  } catch (error) {
    console.error('Get universities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new university
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, location, description } = body;

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

    // Check for existing university with same name or code
    const existing = await prisma.university.findFirst({
      where: {
        OR: [
          { name: name.trim() },
          ...(code ? [{ code: code.toUpperCase() }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.name === name.trim()) {
        return NextResponse.json({ error: 'University with this name already exists' }, { status: 409 });
      }
      if (existing.code === code?.toUpperCase()) {
        return NextResponse.json({ error: 'University with this code already exists' }, { status: 409 });
      }
    }

    const university = await prisma.university.create({
      data: {
        code: code ? code.toUpperCase() : null,
        name: name.trim(),
        location: location?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ 
      message: 'University created successfully',
      university 
    }, { status: 201 });

  } catch (error) {
    console.error('Create university error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}