/** @format */

import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ConfirmPasswordResetDto } from "./dto/confirm-password-reset.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";

const accessCookieName = "yks_access_token";
const refreshCookieName = "yks_refresh_token";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(
		@Body() credentials: LoginDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const result = await this.authService.login(credentials, request);
		this.setAuthCookies(
			response,
			result.tokens.accessToken,
			result.tokens.refreshToken,
			result.tokens.refreshExpiresInSeconds,
		);
		return { user: result.user, profile: result.profile };
	}

	@Post("register")
	async register(
		@Body() payload: RegisterDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const result = await this.authService.register(payload, request);
		this.setAuthCookies(
			response,
			result.tokens.accessToken,
			result.tokens.refreshToken,
			result.tokens.refreshExpiresInSeconds,
		);
		return { user: result.user, profile: result.profile };
	}

	@Post("refresh")
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const refreshToken = this.readCookie(request, refreshCookieName);
		if (!refreshToken) {
			throw new UnauthorizedException("Refresh token cookie not found.");
		}

		const result = await this.authService.refresh(refreshToken, request);
		this.setAuthCookies(
			response,
			result.tokens.accessToken,
			result.tokens.refreshToken,
			result.tokens.refreshExpiresInSeconds,
		);
		return { user: result.user, profile: result.profile };
	}

	@Post("logout")
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		const accessToken = this.readCookie(request, accessCookieName);
		if (accessToken) {
			try {
				await this.authService.logout(accessToken);
			} catch (error) {
				if (!(error instanceof UnauthorizedException)) {
					throw error;
				}
			}
		}

		this.clearAuthCookies(response);
		return { success: true };
	}

	@Post("password-reset/request")
	async requestPasswordReset(
		@Body() payload: RequestPasswordResetDto,
		@Req() request: Request,
	) {
		return this.authService.requestPasswordReset(payload, request);
	}

	@Post("password-reset/confirm")
	async confirmPasswordReset(@Body() payload: ConfirmPasswordResetDto) {
		return this.authService.confirmPasswordReset(payload);
	}

	@Get("me")
	async me(@Req() request: Request) {
		const accessToken = this.readCookie(request, accessCookieName);
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}

		const result = await this.authService.me(accessToken);
		return { user: result.user, profile: result.profile };
	}

	private setAuthCookies(
		response: Response,
		accessToken: string,
		refreshToken: string,
		refreshExpiresInSeconds: number,
	) {
		const isProduction = process.env.NODE_ENV === "production";
		response.cookie(accessCookieName, accessToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: isProduction,
			path: "/",
			maxAge: 15 * 60 * 1000,
		});
		response.cookie(refreshCookieName, refreshToken, {
			httpOnly: true,
			sameSite: "lax",
			secure: isProduction,
			path: "/",
			maxAge: refreshExpiresInSeconds * 1000,
		});
	}

	private clearAuthCookies(response: Response) {
		response.clearCookie(accessCookieName, { path: "/" });
		response.clearCookie(refreshCookieName, { path: "/" });
	}

	private readCookie(request: Request, cookieName: string) {
		return request.cookies?.[cookieName] as string | undefined;
	}
}
