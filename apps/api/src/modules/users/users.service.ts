/** @format */

import { Optional, Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";

export interface UpdateProfileDto {
	displayName?: string;
	email?: string;
	dailyStudyGoalMinutes?: number;
	dailyQuestionGoal?: number;
	targetUniversity?: string;
	targetDepartment?: string;
	studyTrack?: string;
}

@Injectable()
export class UsersService {
	@Optional() private readonly database: PrismaClient = prisma;

	constructor(private readonly authService: AuthService) {}

	async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}

		const result = await this.authService.me(accessToken);
		return result;
	}

	async updateProfile(accessToken: string, payload: UpdateProfileDto) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}

		const { user } = await this.authService.me(accessToken);

		// Update User fields if provided
		if (payload.displayName || payload.email) {
			const dataToUpdate: any = {};
			if (payload.displayName) dataToUpdate.displayName = payload.displayName.trim();
			if (payload.email) dataToUpdate.email = payload.email.trim();

			await this.database.user.update({
				where: { id: user.id },
				data: dataToUpdate,
			});
		}

		// Update or Create Profile fields
		const existingProfile = await this.database.profile.findUnique({
			where: { userId: user.id },
		});

		const profileData: any = {
			dailyStudyGoalMinutes: payload.dailyStudyGoalMinutes ?? 120,
			dailyQuestionGoal: payload.dailyQuestionGoal ?? 100,
		};

		if (payload.targetUniversity !== undefined) profileData.targetUniversity = payload.targetUniversity;
		if (payload.targetDepartment !== undefined) profileData.targetDepartment = payload.targetDepartment;
		if (payload.studyTrack !== undefined) profileData.studyTrack = payload.studyTrack;

		if (existingProfile) {
			await this.database.profile.update({
				where: { userId: user.id },
				data: profileData,
			});
		} else {
			await this.database.profile.create({
				data: {
					userId: user.id,
					examType: "both",
					studyTrack: payload.studyTrack || "Sayısal",
					...profileData,
				},
			});
		}

		return this.getCurrentUser(accessToken);
	}
}
