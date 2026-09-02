import { TooManyRequestsException } from "../exceptions/too-many-requests.exception";
/** @format */

import { Injectable, Logger } from "@nestjs/common";
import { RateLimiter } from "./rate-limiter.provider";
import { AI_RATE_LIMIT, AI_RATE_WINDOW_MS } from "../ai.config";

interface RateLimitEntry {
	requestCount: number;
	windowStart: number;
}

@Injectable()
export class RateLimitService implements RateLimiter {
	private readonly logger = new Logger(RateLimitService.name);
	private readonly store = new Map<string, RateLimitEntry>();
	private readonly maxRequests = AI_RATE_LIMIT;
	private readonly windowMs = AI_RATE_WINDOW_MS;

	checkLimit(userId: string): void {
		const now = Date.now();
		const entry = this.store.get(userId);

		if (!entry || now > entry.windowStart + this.windowMs) {
			this.store.set(userId, {
				requestCount: 1,
				windowStart: now,
			});
			return;
		}

		entry.requestCount++;

		if (entry.requestCount > this.maxRequests) {
			const nextReset = new Date(entry.windowStart + this.windowMs);
			this.logger.warn(
				`Rate limit exceeded for user ${userId}. Reset at ${nextReset.toISOString()}`,
			);
			throw new TooManyRequestsException(
				`Too many AI requests. Maximum ${this.maxRequests} requests per ${Math.round(
					this.windowMs / 1000,
				)} seconds. Please try again after ${Math.ceil(
					(entry.windowStart + this.windowMs - now) / 1000,
				)} seconds.`,
			);
		}
	}

	getRemaining(userId: string): number {
		const now = Date.now();
		const entry = this.store.get(userId);

		if (!entry || now > entry.windowStart + this.windowMs) {
			return this.maxRequests;
		}

		return Math.max(0, this.maxRequests - entry.requestCount);
	}

	getResetTime(userId: string): Date | null {
		const entry = this.store.get(userId);
		if (!entry) {
			return null;
		}
		return new Date(entry.windowStart + this.windowMs);
	}

	reset(userId: string): void {
		this.store.delete(userId);
	}

	resetAll(): void {
		this.store.clear();
	}

	getStats() {
		return {
			trackedUsers: this.store.size,
			maxRequests: this.maxRequests,
			windowMs: this.windowMs,
		};
	}
}
