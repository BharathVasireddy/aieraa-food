import { NextRequest } from 'next/server';

// Simple in-memory rate limiting (use Redis in production)
const attempts = new Map<string, { count: number; lastAttempt: number }>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after max attempts
}

export function rateLimit(config: RateLimitConfig) {
  return function checkRateLimit(req: NextRequest): { success: boolean; error?: string; retryAfter?: number } {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const key = `${ip}:${req.nextUrl.pathname}`;
    const record = attempts.get(key);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupOldEntries(config.windowMs);
    }

    if (!record) {
      // First attempt
      attempts.set(key, { count: 1, lastAttempt: now });
      return { success: true };
    }

    const timeSinceLastAttempt = now - record.lastAttempt;

    // If enough time has passed, reset the counter
    if (timeSinceLastAttempt > config.windowMs) {
      attempts.set(key, { count: 1, lastAttempt: now });
      return { success: true };
    }

    // If within window, increment counter
    record.count++;
    record.lastAttempt = now;

    // Check if exceeded max attempts
    if (record.count > config.maxAttempts) {
      const retryAfter = Math.ceil(config.blockDurationMs / 1000); // Convert to seconds
      return { 
        success: false, 
        error: `Too many attempts. Please try again in ${retryAfter} seconds.`,
        retryAfter 
      };
    }

    return { success: true };
  };
}

function cleanupOldEntries(windowMs: number) {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    if (now - record.lastAttempt > windowMs) {
      attempts.delete(key);
    }
  }
}

// Predefined rate limits for different endpoints
export const loginRateLimit = rateLimit({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
});

export const forgotPasswordRateLimit = rateLimit({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
});

export const registerRateLimit = rateLimit({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
});