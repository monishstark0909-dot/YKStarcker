/** @format */

"use client";

import { getApiBaseUrl } from "./api-config";

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

async function postJson<T>(path: string, body: any): Promise<T> {
	const baseUrl = getApiBaseUrl();
	const res = await fetch(`${baseUrl}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		throw new Error(`POST ${path} failed (${res.status})`);
	}
	return res.json() as Promise<T>;
}

export interface AIRecommendationsResponse {
	recommendations: string;
	analytics: any;
	model: string;
}

export interface AIWeeklySummaryResponse {
	summary: string;
	model: string;
}

export interface AIChatResponse {
	content: string;
	model: string;
	usage?: {
		inputTokens: number;
		outputTokens: number;
	};
}

export async function fetchAIRecommendations(): Promise<AIRecommendationsResponse> {
	return getJson<AIRecommendationsResponse>("/api/ai/recommendations");
}

export async function fetchAIWeeklySummary(): Promise<AIWeeklySummaryResponse> {
	return getJson<AIWeeklySummaryResponse>("/api/ai/weekly-summary");
}

export async function sendAIChat(message: string): Promise<AIChatResponse> {
	return postJson<AIChatResponse>("/api/ai/chat", { message });
}

export async function fetchAIHealth() {
	return getJson<{ healthy: boolean; message: string }>("/api/ai/health");
}
