/** @format */

import { getApiBaseUrl } from "./api-config";

async function requestJson<TResponse>(
	path: string,
	method: "GET" | "POST" | "PUT" | "DELETE",
	body?: unknown,
): Promise<TResponse> {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}${path}`, {
		method,
		headers: body ? { "Content-Type": "application/json" } : undefined,
		credentials: "include",
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		const errText = await response.text().catch(() => "Unknown error");
		let errMessage = `Request failed with status ${response.status}`;
		try {
			const parsed = JSON.parse(errText);
			if (parsed.message) {
				errMessage = typeof parsed.message === "string" ? parsed.message : parsed.message.join(", ");
			}
		} catch {}
		throw new Error(errMessage);
	}

	return response.json() as Promise<TResponse>;
}

// Curriculum
export async function getCurriculumHierarchy() {
	return requestJson<any[]>("/api/curriculum/hierarchy", "GET");
}

// Study Sessions
export async function getStudySessions() {
	return requestJson<any[]>("/api/study-sessions", "GET");
}

export async function getProgress() {
	return requestJson<any[]>("/api/study-sessions/progress", "GET");
}

export async function startStudySession(payload: { subjectId?: string; topicId?: string; subtopicId?: string }) {
	return requestJson<any>("/api/study-sessions/start", "POST", payload);
}

export async function stopStudySession(id: string, payload: { notes?: string }) {
	return requestJson<any>(`/api/study-sessions/stop/${id}`, "POST", payload);
}

export async function createManualStudySession(payload: {
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	durationMinutes: number;
	notes?: string;
	startedAt?: string;
}) {
	return requestJson<any>("/api/study-sessions/manual", "POST", payload);
}

// Question Logs
export async function getQuestionLogs() {
	return requestJson<any[]>("/api/question-logs", "GET");
}

export async function createQuestionLog(payload: {
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	questionsSolved: number;
	correct: number;
	wrong: number;
	difficulty?: string;
	notes?: string;
}) {
	return requestJson<any>("/api/question-logs", "POST", payload);
}

// Wrong Questions
export async function getWrongQuestions(status?: string) {
	const path = status ? `/api/wrong-questions?status=${status}` : "/api/wrong-questions";
	return requestJson<any[]>(path, "GET");
}

export async function getRevisionQueue() {
	return requestJson<any[]>("/api/wrong-questions/queue", "GET");
}

export async function createWrongQuestion(payload: {
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	reason: string;
	difficulty?: string;
	imageUrl?: string;
	reviewDate?: string;
}) {
	return requestJson<any>("/api/wrong-questions", "POST", payload);
}

export async function updateWrongQuestionStatus(id: string, status: "pending" | "reviewed" | "mastered") {
	return requestJson<any>(`/api/wrong-questions/${id}/status`, "PUT", { status });
}

// Planner
export async function getPlanner() {
	return requestJson<{ studyTasks: any[]; revisionTasks: any[] }>("/api/planner", "GET");
}

export async function getTodayTasks() {
	return requestJson<{ studyTasks: any[]; revisionTasks: any[] }>("/api/planner/today", "GET");
}

export async function getWeekTasks() {
	return requestJson<{ studyTasks: any[]; revisionTasks: any[] }>("/api/planner/week", "GET");
}

export async function getMonthTasks() {
	return requestJson<{ studyTasks: any[]; revisionTasks: any[] }>("/api/planner/month", "GET");
}

export async function createStudyTask(payload: {
	title: string;
	description?: string;
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	date: string;
	startTime?: string;
	endTime?: string;
	estimatedDuration?: number;
	priority?: string;
	recurrence?: string;
	notes?: string;
}) {
	return requestJson<any>("/api/planner/study-task", "POST", payload);
}

export async function updateStudyTask(id: string, payload: {
	title?: string;
	description?: string;
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	date?: string;
	startTime?: string;
	endTime?: string;
	estimatedDuration?: number;
	priority?: string;
	status?: string;
	recurrence?: string;
	notes?: string;
}) {
	return requestJson<any>(`/api/planner/study-task/${id}`, "PUT", payload);
}

export async function deleteStudyTask(id: string) {
	return requestJson<any>(`/api/planner/study-task/${id}`, "DELETE");
}

export async function createRevisionTask(payload: {
	title: string;
	description?: string;
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	wrongQuestionId?: string;
	date: string;
	startTime?: string;
	endTime?: string;
	estimatedDuration?: number;
	priority?: string;
	recurrence?: string;
	notes?: string;
}) {
	return requestJson<any>("/api/planner/revision-task", "POST", payload);
}

export async function updateRevisionTask(id: string, payload: {
	title?: string;
	description?: string;
	subjectId?: string;
	topicId?: string;
	subtopicId?: string;
	wrongQuestionId?: string;
	date?: string;
	startTime?: string;
	endTime?: string;
	estimatedDuration?: number;
	priority?: string;
	status?: string;
	recurrence?: string;
	notes?: string;
}) {
	return requestJson<any>(`/api/planner/revision-task/${id}`, "PUT", payload);
}

export async function deleteRevisionTask(id: string) {
	return requestJson<any>(`/api/planner/revision-task/${id}`, "DELETE");
}

// Goals
export async function getGoals() {
	return requestJson<any>("/api/goals", "GET");
}

// Mock Exams
export async function getMockExams() {
	return requestJson<any[]>("/api/mock-exams", "GET");
}

export async function createMockExam(payload: {
	examType: "tyt" | "ayt" | "ydt";
	name: string;
	takenAt: string;
	results: {
		subjectId: string;
		correct: number;
		wrong: number;
		blank: number;
	}[];
}) {
	return requestJson<any>("/api/mock-exams", "POST", payload);
}

export async function getMockStats() {
	return requestJson<any>("/api/mock-exams/stats", "GET");
}

// Analytics Foundation
export async function getAnalyticsFoundation() {
	return requestJson<any>("/api/analytics/foundation", "GET");
}

export async function updateSubtopicProgress(id: string, payload: {
	status?: "not_started" | "in_progress" | "needs_review" | "completed";
	confidence?: number;
	notes?: string;
	isBookmarked?: boolean;
	flaggedRevision?: boolean;
	difficulty?: string;
}) {
	return requestJson<any>(`/api/curriculum/subtopics/${id}/progress`, "POST", payload);
}
