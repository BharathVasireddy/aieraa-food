import { NextResponse } from 'next/server';

export interface ApiSuccess<T> {
	success: true;
	data: T;
	message?: string;
}

export interface ApiErrorShape {
	success: false;
	error: string;
	status?: string;
	details?: unknown;
}

export function apiSuccess<T>(data: T, init?: ResponseInit & { message?: string }) {
	const body: ApiSuccess<T> = { success: true, data, message: init?.message };
	return NextResponse.json(body, init);
}

export function apiError(error: string, init?: ResponseInit & { status?: number; details?: unknown }) {
	const body: ApiErrorShape = { success: false, error, details: init?.details };
	return NextResponse.json(body, { status: init?.status ?? 400, headers: init?.headers });
}


