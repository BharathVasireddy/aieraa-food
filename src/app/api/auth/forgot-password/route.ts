import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { prisma } from '@/lib/prisma';
import { forgotPasswordRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = forgotPasswordRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600'
          }
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success for security (don't reveal if email exists)
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      }, { status: 200 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    // Note: You'll need to add these fields to your User model in schema.prisma
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // These fields need to be added to the User model
          // resetToken,
          // resetTokenExpiry,
        },
      });
    } catch (updateError) {
      console.error('Error storing reset token:', updateError);
      // For now, just log the error since the fields don't exist yet
    }

    // TODO: Send email with reset link
    // For now, we'll just log it for development
    console.log(`Password reset requested for ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link would be: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

    // TODO: Implement email sending
    // Example using a service like SendGrid, Resend, or Nodemailer:
    // await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}