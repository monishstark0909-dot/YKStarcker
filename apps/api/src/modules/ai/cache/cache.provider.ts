/** @format */

export type CacheType = "daily" | "weekly";

export interface CacheStats {
	totalEntries: number;
	expiredEntries: number;
}

export interface CacheProvider {
	get<T>(userId: string, type: CacheType): T | null;
	set<T>(userId: string, type: CacheType, value: T, ttlMs: number): void;
	clear(userId: string): void;
	clearAll(): void;
	getStats(): CacheStats;
}
