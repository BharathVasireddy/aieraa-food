import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash-backed rate limiter when env is configured, otherwise fallback to in-memory
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
	? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
	: null;

const upstashLimiters = new Map<string, Ratelimit>();

// Simple in-memory rate limiting fallback (single process only)
const attempts = new Map<string, { count: number; lastAttempt: number }>();

interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number; // Time window in milliseconds
	blockDurationMs: number; // How long to block after max attempts
}

export function rateLimit(config: RateLimitConfig) {
	return async function checkRateLimit(req: NextRequest): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
		const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
		const routeKey = req.nextUrl.pathname;
		const key = `${ip}:${routeKey}`;

		if (redis) {
			let limiter = upstashLimiters.get(routeKey);
			if (!limiter) {
				limiter = new Ratelimit({
					redis,
					limiter: Ratelimit.slidingWindow(config.maxAttempts, `${config.windowMs} ms`),
				});
				upstashLimiters.set(routeKey, limiter);
			}
			const result = await limiter.limit(key);
			if (!result.success) {
				const retryAfter = result.reset ? Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)) : Math.ceil(config.blockDurationMs / 1000);
				return { success: false, error: `Too many attempts. Please try again in ${retryAfter} seconds.`, retryAfter };
			}
			return { success: true };
		}

		// Fallback in-memory
		const now = Date.now();
		const record = attempts.get(key);
		if (!record) {
			attempts.set(key, { count: 1, lastAttempt: now });
			return { success: true };
		}
		const timeSinceLastAttempt = now - record.lastAttempt;
		if (timeSinceLastAttempt > config.windowMs) {
			attempts.set(key, { count: 1, lastAttempt: now });
			return { success: true };
		}
		record.count++;
		record.lastAttempt = now;
		if (record.count > config.maxAttempts) {
			const retryAfter = Math.ceil(config.blockDurationMs / 1000);
			return { success: false, error: `Too many attempts. Please try again in ${retryAfter} seconds.`, retryAfter };
		}
		return { success: true };
	};
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