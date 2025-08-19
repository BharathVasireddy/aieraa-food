import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, password, universityId } = body;

    // Validate required fields
    if (!name || !email || !password || !universityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    // Verify university exists and is active
    const university = await prisma.university.findUnique({
      where: { id: universityId, isActive: true },
    });

    if (!university) {
      return NextResponse.json({ error: 'Invalid or inactive university' }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create manager user
    const manager = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: 'MANAGER',
        status: 'APPROVED', // Managers are automatically approved
        universityId: null, // Managers are not students, they manage universities
      },
    });

    // Create university manager relationship
    await prisma.universityManager.create({
      data: {
        universityId,
        managerId: manager.id,
      },
    });

    return NextResponse.json({
      message: `Manager ${name} created successfully and assigned to ${university.name}`,
      manager: {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        university: university.name,
      },
    });

  } catch (error) {
    console.error('Manager creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create manager' },
      { status: 500 }
    );
  }
}