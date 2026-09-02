/** @format */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import {
	Optional,
	ConflictException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import type { OnboardingProfile } from "@yks/shared";
import { LoginDto } from "./dto/login.dto";
import { ConfirmPasswordResetDto } from "./dto/confirm-password-reset.dto";
import { RegisterDto } from "./dto/register.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";

const accessTokenSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";
const refreshTokenSecret =
	process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";
const accessTokenExpiresInSeconds = 15 * 60;
const refreshTokenExpiresInSeconds = 30 * 24 * 60 * 60;
const passwordResetTokenExpiresInSeconds = 60 * 60;
const cookieBaseOptions = {
	httpOnly: true,
	sameSite: "lax" as const,
	secure: process.env.NODE_ENV === "production",
	path: "/",
};

export interface AuthResult {
	user: {
		id: string;
		email: string;
		displayName: string;
		username: string;
		avatarUrl: string | null;
	};
	profile: OnboardingProfile | null;
	tokens: {
		accessToken: string;
		refreshToken: string;
		expiresInSeconds: number;
		refreshExpiresInSeconds: number;
	};
}

interface TokenPayload {
	sub: string;
	sid: string;
	type: "access" | "refresh";
	ver?: number;
}

export interface PasswordResetRequestResult {
	success: true;
	previewLink: string | null;
}

export interface PasswordResetConfirmResult {
	success: true;
}

@Injectable()
export class AuthService {
	constructor(@Optional() private readonly database: PrismaClient = prisma) {}

	async register(payload: RegisterDto, request: Request): Promise<AuthResult> {
		const existingUser = await this.database.user.findFirst({
			where: {
				OR: [{ email: payload.email }, { username: payload.username }],
			},
		});

		if (existingUser) {
			throw new ConflictException(
				"A user with that email or username already exists.",
			);
		}

		const passwordHash = await bcrypt.hash(payload.password, 12);
		const user = await this.database.user.create({
			data: {
				email: payload.email,
				username: payload.username,
				displayName: payload.displayName,
				passwordHash,
			},
		});

		return this.createSessionAndResponse(user.id, request, false);
	}

	async login(payload: LoginDto, request: Request): Promise<AuthResult> {
		const user = await this.database.user.findUnique({
			where: { email: payload.email },
		});

		if (!user || !user.passwordHash) {
			throw new UnauthorizedException("Invalid email or password.");
		}

		const passwordMatches = await bcrypt.compare(
			payload.password,
			user.passwordHash,
		);
		if (!passwordMatches) {
			throw new UnauthorizedException("Invalid email or password.");
		}

		return this.createSessionAndResponse(
			user.id,
			request,
			Boolean(payload.rememberMe),
		);
	}

	async requestPasswordReset(
		payload: RequestPasswordResetDto,
		request: Request,
	): Promise<PasswordResetRequestResult> {
		const email = this.normalizeEmail(payload.email);
		const user = await this.database.user.findFirst({
			where: { email: { equals: email, mode: "insensitive" } },
		});

		if (!user || !user.passwordHash) {
			return { success: true, previewLink: null };
		}

		const resetToken = this.generatePasswordResetToken();
		const tokenHash = this.hashToken(resetToken);
		const expiresAt = new Date(
			Date.now() + passwordResetTokenExpiresInSeconds * 1000,
		);

		await this.database.$transaction([
			this.database.passwordResetToken.deleteMany({
				where: { userId: user.id, purpose: "password_reset" },
			}),
			this.database.passwordResetToken.create({
				data: {
					userId: user.id,
					tokenHash,
					purpose: "password_reset",
					expiresAt,
				},
			}),
		]);

		return {
			success: true,
			previewLink:
				process.env.NODE_ENV === "production"
					? null
					: this.buildPasswordResetLink(resetToken, request),
		};
	}

	async confirmPasswordReset(
		payload: ConfirmPasswordResetDto,
	): Promise<PasswordResetConfirmResult> {
		const tokenHash = this.hashToken(payload.token);
		const resetToken = await this.database.passwordResetToken.findFirst({
			where: {
				tokenHash,
				purpose: "password_reset",
				usedAt: null,
			},
		});

		if (!resetToken || resetToken.expiresAt.getTime() <= Date.now()) {
			throw new UnauthorizedException("Reset token is invalid.");
		}

		const passwordHash = await bcrypt.hash(payload.password, 12);
		const now = new Date();

		await this.database.$transaction([
			this.database.user.update({
				where: { id: resetToken.userId },
				data: { passwordHash },
			}),
			this.database.passwordResetToken.update({
				where: { id: resetToken.id },
				data: { usedAt: now },
			}),
			this.database.authSession.updateMany({
				where: { userId: resetToken.userId, status: "active" },
				data: { status: "revoked", revokedAt: now },
			}),
		]);

		return { success: true };
	}

	async refresh(refreshToken: string, request: Request): Promise<AuthResult> {
		const payload = this.verifyToken(
			refreshToken,
			refreshTokenSecret,
			"refresh",
		);
		const session = await this.database.authSession.findUnique({
			where: { id: payload.sid },
		});

		if (!session || session.status !== "active") {
			throw new UnauthorizedException("Session is no longer active.");
		}

		if (this.hashRefreshToken(refreshToken) !== session.refreshTokenHash) {
			throw new UnauthorizedException("Refresh token is invalid.");
		}

		if ((payload.ver ?? -1) !== session.refreshTokenVersion) {
			throw new UnauthorizedException("Refresh token is invalid.");
		}

		if (session.expiresAt.getTime() <= Date.now()) {
			await this.database.authSession.update({
				where: { id: session.id },
				data: { status: "expired", revokedAt: new Date() },
			});
			throw new UnauthorizedException("Session has expired.");
		}

		const user = await this.database.user.findUnique({
			where: { id: session.userId },
			include: { profile: true },
		});

		if (!user) {
			throw new UnauthorizedException("User not found.");
		}

		return this.rotateSession(user.id, session.id, request, session.rememberMe);
	}

	async me(accessToken: string) {
		const { user } = await this.getUserFromActiveAccessToken(accessToken);
		return this.toAuthResult(user, null);
	}

	async logout(accessToken: string) {
		await this.revokeSessionFromToken(accessToken);
	}

	async clearExpiredSessions() {
		await this.database.authSession.updateMany({
			where: { status: "active", expiresAt: { lt: new Date() } },
			data: { status: "expired", revokedAt: new Date() },
		});
	}

	buildCookieOptions(maxAgeMs: number) {
		return {
			...cookieBaseOptions,
			maxAge: maxAgeMs,
		};
	}

	async createAuthCookies(
		userId: string,
		request: Request,
		rememberMe: boolean,
	) {
		const sessionExpiresInSeconds = rememberMe
			? refreshTokenExpiresInSeconds
			: 7 * 24 * 60 * 60;
		const sessionExpiresAt = new Date(
			Date.now() + sessionExpiresInSeconds * 1000,
		);
		const session = await this.database.authSession.create({
			data: {
				userId,
				refreshTokenHash: "pending",
				userAgent: request.headers["user-agent"] ?? null,
				ipAddress: this.getIpAddress(request),
				rememberMe,
				refreshTokenVersion: 0,
				expiresAt: sessionExpiresAt,
			},
		});

		const tokens = this.issueTokens(
			userId,
			session.id,
			sessionExpiresInSeconds,
			session.refreshTokenVersion,
		);
		const refreshTokenHash = this.hashRefreshToken(tokens.refreshToken);

		await this.database.authSession.update({
			where: { id: session.id },
			data: {
				refreshTokenHash,
				rememberMe,
				lastUsedAt: new Date(),
			},
		});

		return { session, tokens };
	}

	async revokeSessionFromToken(accessToken: string) {
		const { session } = await this.getUserFromActiveAccessToken(accessToken);
		await this.database.authSession.updateMany({
			where: { id: session.id, userId: session.userId, status: "active" },
			data: { status: "revoked", revokedAt: new Date() },
		});
	}

	private async createSessionAndResponse(
		userId: string,
		request: Request,
		rememberMe: boolean,
	): Promise<AuthResult> {
		const { tokens } = await this.createAuthCookies(
			userId,
			request,
			rememberMe,
		);
		const user = await this.database.user.findUnique({
			where: { id: userId },
			include: { profile: true },
		});

		if (!user) {
			throw new UnauthorizedException("User not found.");
		}

		return this.toAuthResult(user, tokens);
	}

	private async rotateSession(
		userId: string,
		sessionId: string,
		request: Request,
		rememberMe: boolean,
	): Promise<AuthResult> {
		const session = await this.database.authSession.findUnique({
			where: { id: sessionId },
		});
		if (!session) {
			throw new UnauthorizedException("Session not found.");
		}

		const sessionExpiresInSeconds = rememberMe
			? refreshTokenExpiresInSeconds
			: 7 * 24 * 60 * 60;
		const nextRefreshTokenVersion = session.refreshTokenVersion + 1;
		const nextTokens = this.issueTokens(
			userId,
			sessionId,
			sessionExpiresInSeconds,
			nextRefreshTokenVersion,
		);
		const refreshTokenHash = this.hashRefreshToken(nextTokens.refreshToken);

		await this.database.authSession.update({
			where: { id: sessionId },
			data: {
				refreshTokenHash,
				expiresAt: new Date(Date.now() + sessionExpiresInSeconds * 1000),
				userAgent: request.headers["user-agent"] ?? null,
				ipAddress: this.getIpAddress(request),
				refreshTokenVersion: nextRefreshTokenVersion,
				lastUsedAt: new Date(),
			},
		});

		const user = await this.database.user.findUnique({
			where: { id: userId },
			include: { profile: true },
		});

		if (!user) {
			throw new UnauthorizedException("User not found.");
		}

		return this.toAuthResult(user, nextTokens);
	}

	private issueTokens(
		userId: string,
		sessionId: string,
		refreshExpiresInSeconds: number,
		refreshTokenVersion: number,
	) {
		const accessPayload: TokenPayload = {
			sub: userId,
			sid: sessionId,
			type: "access",
		};
		const refreshPayload: TokenPayload = {
			sub: userId,
			sid: sessionId,
			type: "refresh",
			ver: refreshTokenVersion,
		};

		return {
			accessToken: jwt.sign(accessPayload, accessTokenSecret, {
				expiresIn: accessTokenExpiresInSeconds,
			}),
			refreshToken: jwt.sign(refreshPayload, refreshTokenSecret, {
				expiresIn: refreshExpiresInSeconds,
			}),
			expiresInSeconds: accessTokenExpiresInSeconds,
			refreshExpiresInSeconds,
		};
	}

	private hashRefreshToken(refreshToken: string) {
		return createHash("sha256").update(refreshToken).digest("hex");
	}

	private hashToken(token: string) {
		return createHash("sha256").update(token).digest("hex");
	}

	private generatePasswordResetToken() {
		return randomBytes(32).toString("hex");
	}

	private normalizeEmail(email: string) {
		return email.trim().toLowerCase();
	}

	private buildPasswordResetLink(token: string, request: Request) {
		const origin = this.getWebOrigin(request);
		const resetUrl = new URL("/reset-password/confirm", origin);
		resetUrl.searchParams.set("token", token);
		return resetUrl.toString();
	}

	private verifyToken(
		token: string,
		secret: string,
		expectedType: TokenPayload["type"],
	) {
		try {
			const decoded = jwt.verify(token, secret) as TokenPayload;

			if (!decoded || decoded.type !== expectedType) {
				throw new UnauthorizedException("Token is invalid.");
			}

			return decoded;
		} catch (error) {
			throw new UnauthorizedException("Token is invalid.");
		}
	}

	private async getUserFromActiveAccessToken(accessToken: string) {
		const payload = this.verifyToken(accessToken, accessTokenSecret, "access");
		const session = await this.database.authSession.findUnique({
			where: { id: payload.sid },
		});

		if (!session || session.userId !== payload.sub) {
			throw new UnauthorizedException("Session not found.");
		}

		if (session.status !== "active") {
			throw new UnauthorizedException("Session is no longer active.");
		}

		if (session.expiresAt.getTime() <= Date.now()) {
			await this.database.authSession.update({
				where: { id: session.id },
				data: { status: "expired", revokedAt: new Date() },
			});
			throw new UnauthorizedException("Session has expired.");
		}

		const user = await this.database.user.findUnique({
			where: { id: payload.sub },
			include: { profile: true },
		});

		if (!user) {
			throw new UnauthorizedException("User not found.");
		}

		return { session, user };
	}

	private toAuthResult(
		user: {
			id: string;
			email: string;
			displayName: string;
			username: string;
			avatarUrl: string | null;
			profile: OnboardingProfile | null;
		},
		tokens: AuthResult["tokens"] | null,
	): AuthResult {
		const safeTokens = tokens ?? {
			accessToken: "",
			refreshToken: "",
			expiresInSeconds: accessTokenExpiresInSeconds,
			refreshExpiresInSeconds: refreshTokenExpiresInSeconds,
		};

		return {
			user: {
				id: user.id,
				email: user.email,
				displayName: user.displayName,
				username: user.username,
				avatarUrl: user.avatarUrl,
			},
			profile: user.profile,
			tokens: safeTokens,
		};
	}

	private getIpAddress(request: Request) {
		const forwardedFor = request.headers["x-forwarded-for"];
		if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
			return forwardedFor.split(",")[0].trim();
		}

		return request.ip ?? null;
	}

	private getWebOrigin(request: Request) {
		const requestOrigin = request.headers.origin;
		if (typeof requestOrigin === "string" && requestOrigin.length > 0) {
			return requestOrigin.replace(/\/$/, "");
		}

		return process.env.WEB_ORIGIN ?? "http://localhost:3000";
	}
}
