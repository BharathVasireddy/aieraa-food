import { DateTime } from 'luxon';
import { addDays, isAfter, startOfDay, format } from 'date-fns';

export interface UniversityTimeConfig {
	timezone: string; // e.g., 'Asia/Ho_Chi_Minh'
	orderCutoffTime: string; // 'HH:mm'
	maxAdvanceDays: number;
}

export function toUtcDateOnly(dateLike: string | Date): Date {
	const dt = typeof dateLike === 'string' ? DateTime.fromISO(dateLike, { zone: 'utc' }) : DateTime.fromJSDate(dateLike).toUTC();
	return dt.startOf('day').toJSDate();
}

export function isWithinAdvanceWindow(targetDateUtc: Date, cfg: UniversityTimeConfig, now: Date = new Date()): boolean {
	const todayLocal = new Date(now.toLocaleString('en-US', { timeZone: cfg.timezone }));
	const lastAllowedLocal = addDays(startOfDay(todayLocal), cfg.maxAdvanceDays);
	const targetLocal = new Date(targetDateUtc.toLocaleString('en-US', { timeZone: cfg.timezone }));
	return !isAfter(targetLocal, lastAllowedLocal);
}

export function isPastCutoffForDate(targetDateUtc: Date, cfg: UniversityTimeConfig, now: Date = new Date()): boolean {
	// Cutoff applies at cutoff time on (targetDate - 1 day) in local tz
	const targetLocal = DateTime.fromJSDate(targetDateUtc, { zone: 'utc' }).setZone(cfg.timezone);
	const [hh, mm] = cfg.orderCutoffTime.split(':').map((s) => parseInt(s, 10));
	const cutoffLocal = targetLocal.startOf('day').minus({ days: 1 }).set({ hour: hh, minute: mm, second: 0, millisecond: 0 });
	const nowUtc = DateTime.fromJSDate(now).toUTC();
	return nowUtc > cutoffLocal.toUTC();
}

export function formatDateKeyUTC(dateUtc: Date): string {
	return format(dateUtc, 'yyyy-MM-dd');
}


