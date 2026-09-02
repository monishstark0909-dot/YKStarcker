/** @format */

import { Injectable, Logger } from "@nestjs/common";
import { CacheProvider, CacheType, CacheStats } from "./cache.provider";

interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

@Injectable()
export class CacheService implements CacheProvider {
	private readonly logger = new Logger(CacheService.name);
	private readonly store = new Map<string, CacheEntry<any>>();

	private generateKey(userId: string, type: CacheType): string {
		return `ai:${type}:${userId}`;
	}

	get<T>(userId: string, type: CacheType): T | null {
		const key = this.generateKey(userId, type);
		const entry = this.store.get(key);

		if (!entry) {
			this.logger.debug(`Cache miss: ${key}`);
			return null;
		}

		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			this.logger.debug(`Cache expired: ${key}`);
			return null;
		}

		this.logger.debug(`Cache hit: ${key}`);
		return entry.value as T;
	}

	set<T>(userId: string, type: CacheType, value: T, ttlMs: number): void {
		const key = this.generateKey(userId, type);
		this.store.set(key, {
			value,
			expiresAt: Date.now() + ttlMs,
		});
		this.logger.debug(`Cache set: ${key} expires in ${ttlMs}ms`);
	}

	clear(userId: string): void {
		const dailyKey = this.generateKey(userId, "daily");
		const weeklyKey = this.generateKey(userId, "weekly");
		this.store.delete(dailyKey);
		this.store.delete(weeklyKey);
		this.logger.debug(`Cache cleared for user: ${userId}`);
	}

	clearAll(): void {
		this.store.clear();
		this.logger.debug("Cache cleared for all users");
	}

	getStats(): CacheStats {
		let expiredEntries = 0;
		for (const entry of this.store.values()) {
			if (Date.now() > entry.expiresAt) expiredEntries++;
		}
		return {
			totalEntries: this.store.size,
			expiredEntries,
		};
	}
}
