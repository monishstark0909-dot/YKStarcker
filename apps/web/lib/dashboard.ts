/** @format */

"use client";

import { getApiBaseUrl } from "./api-config";

/**
 * Dashboard data fetcher – single place to parallel-fetch all
 * data that powers dashboard widgets.
 * Re-uses the existing study-lib helpers to avoid duplicated fetch logic.
 */

async function getJson<T>(path: string): Promise<T> {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}${path}`, {
		credentials: "include",
		cache: "no-store",
	});
	if (!res.ok) {
		throw new Error(`GET ${path} failed (${res.status})`);
	}
	return res.json() as Promise<T>;
}

export interface DashboardPayload {
	goals: any;
	mockStats: any;
	todayTasks: { studyTasks: any[]; revisionTasks: any[] };
	revisionQueue: any[];
	sessions: any[];
	progress: any[];
	analytics: any;
	studyGroup: any | null;
}

/** Parallel-fetch every widget's data in one round-trip. */
export async function fetchDashboardData(): Promise<DashboardPayload> {
	const [
		goals,
		mockStats,
		todayTasks,
		revisionQueue,
		sessions,
		progress,
		analytics,
		studyGroup,
	] = await Promise.allSettled([
		getJson<any>("/api/goals"),
		getJson<any>("/api/mock-exams/stats"),
		getJson<any>("/api/planner/today"),
		getJson<any>("/api/wrong-questions/queue"),
		getJson<any>("/api/study-sessions"),
		getJson<any>("/api/study-sessions/progress"),
		getJson<any>("/api/analytics/foundation"),
		getJson<any>("/api/study-group/leaderboard"),
	]);

	return {
		goals: goals.status === "fulfilled" ? goals.value : null,
		mockStats: mockStats.status === "fulfilled" ? mockStats.value : null,
		todayTasks:
			todayTasks.status === "fulfilled"
				? todayTasks.value
				: { studyTasks: [], revisionTasks: [] },
		revisionQueue:
			revisionQueue.status === "fulfilled" ? revisionQueue.value : [],
		sessions: sessions.status === "fulfilled" ? sessions.value : [],
		progress: progress.status === "fulfilled" ? progress.value : [],
		analytics: analytics.status === "fulfilled" ? analytics.value : null,
		studyGroup: studyGroup.status === "fulfilled" ? studyGroup.value : null,
	};
}
