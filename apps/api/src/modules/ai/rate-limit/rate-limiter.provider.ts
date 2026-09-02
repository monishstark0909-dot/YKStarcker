/** @format */

export interface RateLimitInfo {
	remaining: number;
	resetTime: Date | null;
}

export interface RateLimiter {
	checkLimit(userId: string): void;
	getRemaining(userId: string): number;
	getResetTime(userId: string): Date | null;
	reset(userId: string): void;
	resetAll(): void;
	getStats(): { trackedUsers: number; maxRequests: number; windowMs: number };
}
