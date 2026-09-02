/** @format */

import type { OnboardingPayload, OnboardingState } from "@yks/shared";
import { getApiBaseUrl } from "./api-config";

export interface OnboardingFormState {
	examType: "tyt" | "ayt" | "both" | "ydt";
	studyTrack: string;
	targetUniversity: string;
	targetDepartment: string;
	targetRanking: string;
	dailyStudyGoalMinutes: string;
	dailyQuestionGoal: string;
	preferredStudyTime: string;
	timezone: string;
	locale: string;
}

async function requestJson<TResponse>(
	path: string,
	method: "GET" | "PUT",
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
		throw new Error(`Request failed with status ${response.status}`);
	}

	return response.json() as Promise<TResponse>;
}

export async function getOnboarding() {
	return requestJson<OnboardingState>("/api/onboarding", "GET");
}

export async function saveOnboarding(payload: OnboardingPayload) {
	return requestJson<{ profile: NonNullable<OnboardingState["profile"]> }>(
		"/api/onboarding",
		"PUT",
		payload,
	);
}

export async function getProfile() {
	const state = await getOnboarding();
	return state.profile;
}

export async function updateOnboardingProfile(payload: OnboardingPayload) {
	return saveOnboarding(payload);
}
