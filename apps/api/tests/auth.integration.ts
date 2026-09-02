/** @format */

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import EmbeddedPostgres from "embedded-postgres";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { AuthController } from "../src/modules/auth/auth.controller";
import { AuthService } from "../src/modules/auth/auth.service";
import { ConfirmPasswordResetDto } from "../src/modules/auth/dto/confirm-password-reset.dto";
import { LoginDto } from "../src/modules/auth/dto/login.dto";
import { RegisterDto } from "../src/modules/auth/dto/register.dto";
import { RequestPasswordResetDto } from "../src/modules/auth/dto/request-password-reset.dto";
import { OnboardingController } from "../src/modules/onboarding/onboarding.controller";
import { OnboardingService } from "../src/modules/onboarding/onboarding.service";
import { SaveOnboardingDto } from "../src/modules/onboarding/dto/save-onboarding.dto";
import { demoStudentSeed } from "../../../packages/database/prisma/seed-data";

const accessCookieName = "yks_access_token";
const refreshCookieName = "yks_refresh_token";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const schemaPath = path.resolve(
	__dirname,
	"..",
	"..",
	"..",
	"packages",
	"database",
	"prisma",
	"schema.prisma",
);
const seedPath = path.resolve(
	__dirname,
	"..",
	"..",
	"..",
	"packages",
	"database",
	"prisma",
	"seed.ts",
);

async function getFreePort() {
	return await new Promise<number>((resolve, reject) => {
		const server = net.createServer();

		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			if (address && typeof address === "object") {
				const port = address.port;
				server.close(() => resolve(port));
				return;
			}

			server.close(() => reject(new Error("Unable to allocate a test port.")));
		});
	});
}

async function runCommand(
	command: string,
	args: string[],
	environment: NodeJS.ProcessEnv,
) {
	const quotedArgs = args.map((argument) =>
		argument.includes(" ") ? `"${argument.replaceAll("\"", "\\\"")}"` : argument,
	);

	execSync([command, ...quotedArgs].join(" "), {
		stdio: "inherit",
		env: environment,
		shell: true,
	});
}

async function stopEmbeddedPostgres(
	cluster: EmbeddedPostgres,
	databaseDir: string,
) {
	try {
		await Promise.race([
			cluster.stop(),
			new Promise((_, reject) => {
				setTimeout(
					() => reject(new Error("Embedded Postgres shutdown timed out.")),
					10000,
				);
			}),
		]);
	} catch {
		const escapedDatabaseDir = databaseDir.replaceAll("'", "''");
		const cleanupCommand = [
			"powershell",
			"-NoProfile",
			"-Command",
			`Get-CimInstance Win32_Process -Filter "Name='postgres.exe'" | Where-Object { $_.CommandLine -like '*${escapedDatabaseDir}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`,
		].join(" ");

		execSync(cleanupCommand, { stdio: "ignore", shell: true });
	}
}

function createRequest(
	overrides: Partial<Request> & {
		cookies?: Record<string, string>;
		headers?: Record<string, string | string[] | undefined>;
	} = {},
) {
	return {
		cookies: {},
		headers: {},
		ip: "127.0.0.1",
		...overrides,
	} as Request;
}

function createResponse() {
	const cookies = new Map<
		string,
		{ value: string; options: Record<string, unknown> }
	>();
	const clearedCookies = new Set<string>();
	const response = {
		cookie(name: string, value: string, options: Record<string, unknown>) {
			cookies.set(name, { value, options });
			return response;
		},
		clearCookie(name: string) {
			clearedCookies.add(name);
			cookies.delete(name);
			return response;
		},
	} as unknown as Response;

	return { response, cookies, clearedCookies };
}

async function main() {
	const port = await getFreePort();
	const databaseDir = path.join(
		os.tmpdir(),
		`yks-auth-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	const databaseUrl = `postgresql://postgres:password@127.0.0.1:${port}/postgres?schema=public`;
	const environment = {
		...process.env,
		DATABASE_URL: databaseUrl,
		JWT_ACCESS_SECRET: "test-access-secret",
		JWT_REFRESH_SECRET: "test-refresh-secret",
		NODE_ENV: "test",
	};

	const cluster = new EmbeddedPostgres({
		databaseDir,
		port,
		user: "postgres",
		password: "password",
		persistent: false,
		onLog: () => undefined,
		onError: () => undefined,
	});

	await cluster.initialise();
	await cluster.start();

	const prisma = new PrismaClient({
		datasources: { db: { url: databaseUrl } },
	});
	const authService = new AuthService(prisma);
	const authController = new AuthController(authService);
	const onboardingService = new OnboardingService(authService, prisma);
	const onboardingController = new OnboardingController(onboardingService);

	try {
		await runCommand(
			npxCommand,
			["prisma", "migrate", "deploy", "--schema", schemaPath],
			environment,
		);
		await runCommand(npxCommand, ["tsx", seedPath], environment);

		const invalidLogin = plainToInstance(LoginDto, {
			email: "invalid-email",
			password: "short",
			rememberMe: "true",
		});
		assert.ok(validateSync(invalidLogin).length > 0);

		const validLogin = plainToInstance(LoginDto, {
			email: "auth@example.com",
			password: "SecurePass123!",
			rememberMe: "true",
		});
		assert.equal(validateSync(validLogin).length, 0);
		assert.equal(validLogin.rememberMe, true);

		const invalidRegister = plainToInstance(RegisterDto, {
			email: "invalid-email",
			password: "short",
			displayName: "A",
			username: "bad name",
		});
		assert.ok(validateSync(invalidRegister).length > 0);

		const invalidPasswordResetRequest = plainToInstance(
			RequestPasswordResetDto,
			{
				email: "invalid-email",
			},
		);
		assert.ok(validateSync(invalidPasswordResetRequest).length > 0);

		const invalidPasswordResetConfirm = plainToInstance(
			ConfirmPasswordResetDto,
			{
				token: "",
				password: "short",
			},
		);
		assert.ok(validateSync(invalidPasswordResetConfirm).length > 0);

		const subjectCount = await prisma.subject.count();
		const userCount = await prisma.user.count();
		assert.ok(subjectCount >= 16, "official syllabus was not seeded");
		assert.ok(userCount >= 1, "demo user was not seeded");
		const seededDemoUser = await prisma.user.findUnique({
			where: { email: demoStudentSeed.email },
			include: { profile: true },
		});
		assert.ok(seededDemoUser, "demo student seed is missing");
		assert.equal(
			seededDemoUser?.profile?.examType,
			demoStudentSeed.profile.examType,
		);

		const registerBody = {
			email: `auth-${Date.now()}@example.com`,
			password: "SecurePass123!",
			displayName: "Auth Flow User",
			username: `authuser${Date.now()}`,
		};

		const registerRequest = createRequest({
			headers: { "user-agent": "auth-integration-test" },
		});
		const registerResponse = createResponse();
		const registerResult = await authController.register(
			registerBody,
			registerRequest,
			registerResponse.response,
		);

		assert.equal(registerResult.user.email, registerBody.email);
		assert.equal(registerResult.user.username, registerBody.username);
		assert.ok(registerResponse.cookies.get(accessCookieName));
		assert.ok(registerResponse.cookies.get(refreshCookieName));
		assert.equal(
			registerResponse.cookies.get(refreshCookieName)?.options.maxAge,
			7 * 24 * 60 * 60 * 1000,
		);

		const initialAccessToken = registerResponse.cookies.get(accessCookieName)?.value;
		const initialRefreshToken = registerResponse.cookies.get(refreshCookieName)?.value;
		assert.ok(initialAccessToken);
		assert.ok(initialRefreshToken);

		const onboardingStateBefore = await onboardingController.getOnboarding(
			createRequest({ cookies: { [accessCookieName]: initialAccessToken } }),
		);
		assert.equal(onboardingStateBefore.completed, false);
		assert.equal(onboardingStateBefore.profile, null);

		const invalidOnboarding = plainToInstance(SaveOnboardingDto, {
			examType: "invalid",
			studyTrack: "",
			dailyStudyGoalMinutes: 0,
			dailyQuestionGoal: 0,
		});
		assert.ok(validateSync(invalidOnboarding).length > 0);

		const onboardingSaveResult = await onboardingController.saveOnboarding(
			{
				examType: "ayt",
				studyTrack: "sayisal",
				targetUniversity: "Bogazici University",
				targetDepartment: "Computer Engineering",
				targetRanking: 1200,
				dailyStudyGoalMinutes: 180,
				dailyQuestionGoal: 160,
				timezone: "Europe/Istanbul",
				locale: "tr-TR",
			},
			createRequest({ cookies: { [accessCookieName]: initialAccessToken } }),
		);
		assert.equal(onboardingSaveResult.profile.examType, "ayt");
		assert.equal(onboardingSaveResult.profile.studyTrack, "sayisal");

		const onboardingStateAfter = await onboardingController.getOnboarding(
			createRequest({ cookies: { [accessCookieName]: initialAccessToken } }),
		);
		assert.equal(onboardingStateAfter.completed, true);
		assert.equal(onboardingStateAfter.profile?.targetUniversity, "Bogazici University");

		const meResult = await authController.me(
			createRequest({ cookies: { [accessCookieName]: initialAccessToken } }),
		);
		assert.equal(meResult.user.email, registerBody.email);

		const refreshResponse = createResponse();
		const refreshResult = await authController.refresh(
			createRequest({
				cookies: { [refreshCookieName]: initialRefreshToken },
				headers: { "user-agent": "auth-refresh-test" },
			}),
			refreshResponse.response,
		);

		const rotatedAccessToken = refreshResponse.cookies.get(accessCookieName);
		const rotatedRefreshToken = refreshResponse.cookies.get(refreshCookieName);
		assert.ok(rotatedAccessToken);
		assert.ok(rotatedRefreshToken);
		assert.notEqual(rotatedRefreshToken?.value, initialRefreshToken);
		assert.equal(refreshResult.user.email, registerBody.email);

		const activeSessions = await prisma.authSession.findMany({
			where: { userId: registerResult.user.id },
			orderBy: { updatedAt: "desc" },
		});
		assert.equal(activeSessions.length, 1);
		assert.equal(
			activeSessions[0].refreshTokenHash,
			createHash("sha256").update(rotatedRefreshToken.value).digest("hex"),
		);
		assert.notEqual(
			activeSessions[0].refreshTokenHash,
			createHash("sha256").update(initialRefreshToken).digest("hex"),
		);

		await assert.rejects(
			() =>
				authController.refresh(
					createRequest({
						cookies: { [refreshCookieName]: initialRefreshToken },
					}),
					createResponse().response,
				),
			/Refresh token is invalid|Session is no longer active/,
		);

		const logoutResponse = createResponse();
		const currentAccessToken = rotatedAccessToken?.value ?? initialAccessToken;
		const logoutResult = await authController.logout(
			createRequest({ cookies: { [accessCookieName]: currentAccessToken ?? "" } }),
			logoutResponse.response,
		);
		assert.equal(logoutResult.success, true);
		assert.ok(logoutResponse.clearedCookies.has(accessCookieName));
		assert.ok(logoutResponse.clearedCookies.has(refreshCookieName));

		await assert.rejects(
			() =>
				authController.me(
					createRequest({ cookies: { [accessCookieName]: currentAccessToken ?? "" } }),
				),
			/Session is no longer active|Token is invalid|Session has expired/,
		);

		const reloginResponse = createResponse();
		const reloginResult = await authController.login(
			{
				email: registerBody.email,
				password: registerBody.password,
				rememberMe: true,
			},
			createRequest({ headers: { "user-agent": "auth-login-test" } }),
			reloginResponse.response,
		);

		assert.equal(reloginResult.user.email, registerBody.email);
		assert.ok(reloginResponse.cookies.get(accessCookieName));
		assert.ok(reloginResponse.cookies.get(refreshCookieName));
		assert.equal(
			reloginResponse.cookies.get(refreshCookieName)?.options.maxAge,
			30 * 24 * 60 * 60 * 1000,
		);

		const passwordResetRequestResponse = await authController.requestPasswordReset(
			{
				email: registerBody.email,
			},
			createRequest({ headers: { origin: "http://localhost:3000" } }),
		);
		assert.equal(passwordResetRequestResponse.success, true);
		const previewLink = passwordResetRequestResponse.previewLink;
		assert.ok(previewLink);

		const passwordResetToken = new URL(previewLink).searchParams.get("token");
		assert.ok(passwordResetToken, "reset token was not included in the preview link");
		const resetToken = passwordResetToken as string;

		const resetTokenRecord = await prisma.passwordResetToken.findFirst({
			where: {
				userId: registerResult.user.id,
				purpose: "password_reset",
				usedAt: null,
			},
		});
		assert.ok(resetTokenRecord, "password reset token was not created");

		const passwordResetResult = await authController.confirmPasswordReset({
			token: resetToken,
			password: "NewSecurePass123!",
		});
		assert.equal(passwordResetResult.success, true);

		const revokedSessions = await prisma.authSession.findMany({
			where: {
				userId: registerResult.user.id,
				status: "revoked",
			},
		});
		assert.ok(revokedSessions.length >= 1);

		await assert.rejects(
			() =>
				authController.me(
					createRequest({ cookies: { [accessCookieName]: currentAccessToken ?? "" } }),
				),
			/Session is no longer active|Token is invalid|Session has expired/,
		);

		await assert.rejects(
			() =>
				authController.login(
					{
						email: registerBody.email,
						password: registerBody.password,
					},
					createRequest({ headers: { "user-agent": "auth-old-password-test" } }),
					createResponse().response,
				),
			/Invalid email or password/,
		);

		const newPasswordLoginResponse = createResponse();
		const newPasswordLoginResult = await authController.login(
			{
				email: registerBody.email,
				password: "NewSecurePass123!",
			},
			createRequest({ headers: { "user-agent": "auth-new-password-test" } }),
			newPasswordLoginResponse.response,
		);
		assert.equal(newPasswordLoginResult.user.email, registerBody.email);
		assert.ok(newPasswordLoginResponse.cookies.get(accessCookieName));
	} finally {
		await prisma.$disconnect();
		await stopEmbeddedPostgres(cluster, databaseDir);
		await fs.rm(databaseDir, { recursive: true, force: true });
	}
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
