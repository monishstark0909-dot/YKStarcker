import { TooManyRequestsException } from "./exceptions/too-many-requests.exception";
/** @format */

import {
	Controller,
	Get,
	Post,
	Delete,
	Body,
	Req,
	BadRequestException,
	InternalServerErrorException,
	
	Logger,
} from "@nestjs/common";
import type { Request } from "express";
import { AIService } from "./ai.service";
import { AuthService } from "../auth/auth.service";

@Controller("ai")
export class AIController {
	private readonly logger = new Logger(AIController.name);

	constructor(
		private readonly aiService: AIService,
		private readonly authService: AuthService,
	) {}

	private getAccessToken(request: Request): string {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		if (!accessToken) {
			throw new BadRequestException("Access token not found in cookies");
		}
		return accessToken;
	}

	private async getUserId(accessToken: string): Promise<string> {
		const { user } = await this.authService.me(accessToken);
		return user.id;
	}

	@Get("recommendations")
	async getRecommendations(@Req() request: Request) {
		try {
			const accessToken = this.getAccessToken(request);
			const result = await this.aiService.getRecommendations(accessToken);

			// Return cache status and recommendations
			return {
				...result,
				timestamp: new Date().toISOString(),
			};
		} catch (error: any) {
			this.logger.error("Recommendations error:", error);

			if (error.status === 429) {
				throw error; // Re-throw rate limit errors
			}

			if (error.message?.includes("API error")) {
				throw new InternalServerErrorException(
					"Could not reach AI Coach. Please try again later.",
				);
			}

			throw error;
		}
	}

	@Get("weekly-summary")
	async getWeeklySummary(@Req() request: Request) {
		try {
			const accessToken = this.getAccessToken(request);
			const result = await this.aiService.getWeeklySummary(accessToken);

			return {
				...result,
				timestamp: new Date().toISOString(),
			};
		} catch (error: any) {
			this.logger.error("Weekly summary error:", error);

			if (error.status === 429) {
				throw error;
			}

			if (error.message?.includes("API error")) {
				throw new InternalServerErrorException(
					"Could not generate weekly summary. Please try again later.",
				);
			}

			throw error;
		}
	}

	@Post("chat")
	async chat(@Req() request: Request, @Body() body: { message: string }) {
		try {
			if (!body.message || body.message.trim().length === 0) {
				throw new BadRequestException("Message is required");
			}

			if (body.message.length > 1000) {
				throw new BadRequestException(
					"Message too long (max 1000 characters)",
				);
			}

			const accessToken = this.getAccessToken(request);
			return this.aiService.chat(accessToken, body.message);
		} catch (error: any) {
			this.logger.error("Chat error:", error);

			if (error.status === 429) {
				throw error;
			}

			if (error.message?.includes("API error")) {
				throw new InternalServerErrorException(
					"AI Chat error. Please try again.",
				);
			}

			throw error;
		}
	}

	@Delete("cache")
	async clearCache(@Req() request: Request) {
		try {
			const accessToken = this.getAccessToken(request);
			await this.aiService.clearCache(accessToken);

			return {
				message: "Cache cleared. New recommendations will be generated.",
				timestamp: new Date().toISOString(),
			};
		} catch (error: any) {
			this.logger.error("Cache clear error:", error);
			throw error;
		}
	}

	@Get("health")
	async healthCheck() {
		try {
			const isHealthy = await this.aiService.healthCheck();
			return {
				healthy: isHealthy,
				message: isHealthy
					? "AI provider is ready"
					: "AI provider is not available",
				timestamp: new Date().toISOString(),
			};
		} catch (error: any) {
			this.logger.warn("Health check failed:", error.message);
			return {
				healthy: false,
				message: "AI provider check failed",
				timestamp: new Date().toISOString(),
			};
		}
	}
}
