/** @format */

import type { OnboardingProfile } from "./onboarding";

export type AuthProvider = "email" | "google" | "apple";

export interface SessionTokens {
	accessToken: string;
	refreshToken: string;
	expiresInSeconds: number;
}

export interface AuthCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface PasswordResetRequestPayload {
	email: string;
}

export interface PasswordResetRequestResult {
	success: true;
	previewLink: string | null;
}

export interface PasswordResetConfirmPayload {
	token: string;
	password: string;
}

export interface PasswordResetConfirmResult {
	success: true;
}
