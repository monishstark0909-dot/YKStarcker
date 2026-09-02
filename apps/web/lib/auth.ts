/** @format */

import type {
	AuthCredentials,
	PasswordResetConfirmPayload,
	PasswordResetConfirmResult,
	PasswordResetRequestPayload,
	PasswordResetRequestResult,
	OnboardingProfile,
	UserProfile,
} from "@yks/shared";
import { getApiBaseUrl } from "./api-config";

export interface AuthResponse {
	user: UserProfile;
	profile: OnboardingProfile | null;
}

async function postJson<TResponse>(
	path: string,
	body: unknown,
): Promise<TResponse> {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		credentials: "include",
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errText = await response.text().catch(() => "Unknown error");
		let errMessage = `Request failed with status ${response.status}`;
		try {
			const parsed = JSON.parse(errText);
			if (parsed?.message) {
				errMessage = typeof parsed.message === "string" ? parsed.message : parsed.message.join(", ");
			}
		} catch {}
		throw new Error(errMessage);
	}

	return response.json() as Promise<TResponse>;
}

export async function login(credentials: AuthCredentials) {
	return postJson<AuthResponse>("/api/auth/login", credentials);
}

export async function register(payload: {
	displayName: string;
	username: string;
	email: string;
	password: string;
}) {
	return postJson<AuthResponse>("/api/auth/register", payload);
}

export async function me() {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}/api/auth/me`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Not authenticated");
	}

	return response.json() as Promise<AuthResponse>;
}

export async function logout() {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}/api/auth/logout`, {
		method: "POST",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Logout failed");
	}
}

export async function requestPasswordReset(
	payload: PasswordResetRequestPayload,
) {
	return postJson<PasswordResetRequestResult>(
		"/api/auth/password-reset/request",
		payload,
	);
}

export async function confirmPasswordReset(
	payload: PasswordResetConfirmPayload,
) {
	return postJson<PasswordResetConfirmResult>(
		"/api/auth/password-reset/confirm",
		payload,
	);
}

export async function updateUserProfile(payload: {
	displayName?: string;
	email?: string;
	dailyStudyGoalMinutes?: number;
	dailyQuestionGoal?: number;
	targetUniversity?: string;
	targetDepartment?: string;
	studyTrack?: string;
}) {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}/api/users/profile`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error("Failed to update user profile");
	}

	return response.json() as Promise<AuthResponse>;
}
