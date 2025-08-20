import { NextRequest } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body as { token?: string; password?: string };
    if (!token || !password || password.length < 8) return apiError('Invalid request', { status: 400 });

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });
    if (!user) return apiError('Invalid or expired token', { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetTokenHash: null, resetTokenExpiresAt: null },
    });

    return apiSuccess({ ok: true }, { status: 200, message: 'Password updated' });
  } catch (e) {
    return apiError('Failed to reset password', { status: 500 });
  }
}


