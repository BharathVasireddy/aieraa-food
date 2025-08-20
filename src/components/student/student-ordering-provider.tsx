'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

type SortOption = 'relevance' | 'price_low' | 'price_high';

interface UniversitySettings {
	timezone: string;
	orderCutoffTime: string; // HH:mm
	maxAdvanceDays: number;
}

interface StudentOrderingContextValue {
	selectedDate: string; // yyyy-MM-dd (UTC date key)
	setSelectedDate: (dateKey: string) => void;
	vegOnly: boolean;
	setVegOnly: (v: boolean) => void;
	sort: SortOption;
	setSort: (s: SortOption) => void;
	settings: UniversitySettings;
	countdownLabel: string; // time left to order for tomorrow
}

const DEFAULT_SETTINGS: UniversitySettings = {
	timezone: 'Asia/Ho_Chi_Minh',
	orderCutoffTime: '20:00',
	maxAdvanceDays: 7,
};

const StudentOrderingContext = createContext<StudentOrderingContextValue | undefined>(undefined);

export function StudentOrderingProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<UniversitySettings>(DEFAULT_SETTINGS);
	const [vegOnly, setVegOnly] = useState<boolean>(false);
	const [sort, setSort] = useState<SortOption>('relevance');
	const [selectedDate, setSelectedDate] = useState<string>(() => {
		const now = DateTime.utc();
		return now.toFormat('yyyy-LL-dd');
	});
	const [countdownLabel, setCountdownLabel] = useState<string>('');

	useEffect(() => {
		let ignore = false;
		(async () => {
			try {
				const res = await fetch('/api/student/settings');
				if (!res.ok) return;
				const { data } = await res.json();
				if (!ignore && data?.settings) {
					setSettings({
						timezone: data.settings.timezone || DEFAULT_SETTINGS.timezone,
						orderCutoffTime: data.settings.orderCutoffTime || DEFAULT_SETTINGS.orderCutoffTime,
						maxAdvanceDays: data.settings.maxAdvanceDays ?? DEFAULT_SETTINGS.maxAdvanceDays,
					});
				}
			} catch {}
		})();
		return () => {
			ignore = true;
		};
	}, []);

	const updateCountdown = useCallback(() => {
		// Countdown for ordering "tomorrow" by today's cutoff in university timezone
		const zone = settings.timezone || DEFAULT_SETTINGS.timezone;
		const now = DateTime.now().setZone(zone);
		const [hh, mm] = (settings.orderCutoffTime || '20:00').split(':').map((v) => parseInt(v, 10));
		const cutoffToday = now.startOf('day').set({ hour: hh, minute: mm, second: 0, millisecond: 0 });
		const diff = cutoffToday.diff(now, ['hours', 'minutes', 'seconds']).toObject();
		if (now > cutoffToday) {
			setCountdownLabel('Cutoff passed for tomorrow');
			return;
		}
		const h = Math.max(0, Math.floor(diff.hours || 0));
		const m = Math.max(0, Math.floor(diff.minutes || 0));
		const s = Math.max(0, Math.floor(diff.seconds || 0));
		setCountdownLabel(`Order for Tomorrow closes in ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
	}, [settings]);

	useEffect(() => {
		updateCountdown();
		const id = setInterval(updateCountdown, 1000);
		return () => clearInterval(id);
	}, [updateCountdown]);

	const value = useMemo<StudentOrderingContextValue>(() => ({
		selectedDate,
		setSelectedDate,
		vegOnly,
		setVegOnly,
		sort,
		setSort,
		settings,
		countdownLabel,
	}), [selectedDate, vegOnly, sort, settings, countdownLabel]);

	return <StudentOrderingContext.Provider value={value}>{children}</StudentOrderingContext.Provider>;
}

export function useStudentOrdering() {
	const ctx = useContext(StudentOrderingContext);
	if (!ctx) throw new Error('useStudentOrdering must be used within StudentOrderingProvider');
	return ctx;
}


