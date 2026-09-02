/** @format */

import { Optional, Injectable, UnauthorizedException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { SaveOnboardingDto } from "./dto/save-onboarding.dto";

@Injectable()
export class OnboardingService {
	constructor(
		private readonly authService: AuthService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}

	async getOnboarding(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const profile = await this.database.profile.findUnique({
			where: { userId: user.id },
		});

		return {
			completed: Boolean(profile),
			profile,
		};
	}

	async saveOnboarding(accessToken: string, payload: SaveOnboardingDto) {
		const { user } = await this.getCurrentUser(accessToken);
		const timezone = payload.timezone?.trim() || "Europe/Istanbul";
		const locale = payload.locale?.trim() || "tr-TR";

		const profile = await this.database.profile.upsert({
			where: { userId: user.id },
			update: {
				examType: payload.examType,
				studyTrack: payload.studyTrack.trim(),
				targetUniversity: payload.targetUniversity ?? null,
				targetDepartment: payload.targetDepartment ?? null,
				targetRanking: payload.targetRanking ?? null,
				dailyStudyGoalMinutes: payload.dailyStudyGoalMinutes,
				dailyQuestionGoal: payload.dailyQuestionGoal,
				preferredStudyTime: payload.preferredStudyTime ?? null,
				timezone,
				locale,
			},
			create: {
				userId: user.id,
				examType: payload.examType,
				studyTrack: payload.studyTrack.trim(),
				targetUniversity: payload.targetUniversity ?? null,
				targetDepartment: payload.targetDepartment ?? null,
				targetRanking: payload.targetRanking ?? null,
				dailyStudyGoalMinutes: payload.dailyStudyGoalMinutes,
				dailyQuestionGoal: payload.dailyQuestionGoal,
				preferredStudyTime: payload.preferredStudyTime ?? null,
				timezone,
				locale,
			},
		});

		return { profile };
	}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}

		return this.authService.me(accessToken);
	}
}
