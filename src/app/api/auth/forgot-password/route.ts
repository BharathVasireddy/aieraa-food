import { NextRequest } from 'next/server';
import crypto from 'crypto';

import { prisma } from '@/lib/prisma';
import { forgotPasswordRateLimit } from '@/lib/rate-limit';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await forgotPasswordRateLimit(request);
    if (!rateLimitResult.success) {
      return apiError(rateLimitResult.error || 'Too many attempts', { 
        status: 429,
        headers: { 'Retry-After': rateLimitResult.retryAfter?.toString() || '3600' }
      });
    }

    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return apiError('Email is required', { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success for security (don't reveal if email exists)
    // This prevents email enumeration attacks
    if (!user) {
      return apiSuccess({ message: 'If an account with that email exists, we have sent a password reset link.' }, { status: 200 });
    }

    // Generate reset token and store hash
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token hash in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    // TODO: Send email with reset link
    // For now, we'll just log it for development
    console.log(`Password reset requested for ${email}`);
    console.log(`Reset token: ${resetToken}`);
    console.log(`Reset link would be: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

    // TODO: Implement email sending
    // Example using a service like SendGrid, Resend, or Nodemailer:
    // await sendPasswordResetEmail(user.email, resetToken);

    return apiSuccess({ message: 'If an account with that email exists, we have sent a password reset link.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return apiError('Internal server error', { status: 500 });
  }
}