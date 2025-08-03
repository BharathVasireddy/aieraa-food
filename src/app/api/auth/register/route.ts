import { NextRequest, NextResponse } from 'next/server';

import { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, university, password } = body;

    // Validate required fields
    if (!name || !email || !university || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Verify university exists
    const universityExists = await prisma.university.findUnique({
      where: { id: university },
    });

    if (!universityExists) {
      return NextResponse.json({ error: 'Invalid university selected' }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: UserRole.STUDENT,
        status: UserStatus.PENDING, // Students need approval
        universityId: university,
      },
      include: {
        university: {
          select: {
            name: true,
          },
        },
      },
    });

    // Return success response (don't include password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
