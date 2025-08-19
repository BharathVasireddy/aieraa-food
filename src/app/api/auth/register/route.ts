import { NextRequest } from 'next/server';

import { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid request', { status: 400, details: parsed.error.flatten().fieldErrors });
    }
    const { name, email, phone, university, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError('User with this email already exists', { status: 409 });
    }

    // Verify university exists
    const universityExists = await prisma.university.findUnique({
      where: { id: university },
    });

    if (!universityExists) {
      return apiError('Invalid university selected', { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
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

    return apiSuccess(
      { user: userWithoutPassword },
      { status: 201, message: 'Registration successful' }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return apiError('Internal server error', { status: 500 });
  }
}
