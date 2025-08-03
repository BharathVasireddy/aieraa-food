import { NextRequest, NextResponse } from 'next/server';

import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { loginRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = loginRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900'
          }
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        university: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is approved (for students)
    if (user.status === UserStatus.PENDING) {
      return NextResponse.json(
        {
          error: 'Your account is pending approval from your university manager',
          status: 'pending_approval',
        },
        { status: 403 }
      );
    }

    if (user.status === UserStatus.REJECTED) {
      return NextResponse.json(
        {
          error: 'Your account has been rejected. Please contact your university manager',
          status: 'rejected',
        },
        { status: 403 }
      );
    }

    // Return user data for NextAuth session (exclude password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'Login successful',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
