import { Optional, Injectable, UnauthorizedException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { GoalsService } from "../goals/goals.service";
import { MockExamsService } from "../mock-exams/mock-exams.service";

@Injectable()
export class AnalyticsFoundationService {
	constructor(
		private readonly authService: AuthService,
		private readonly goalsService: GoalsService,
		private readonly mockExamsService: MockExamsService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	async getAnalyticsFoundation(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);

		const [
			sessions,
			logs,
			pendingQueueCount,
			goals,
			mocks,
		] = await Promise.all([
			// Sessions
			this.database.studySession.findMany({
				where: { userId: user.id },
				select: { durationMinutes: true },
			}),
			// Logs
			this.database.questionLog.findMany({
				where: { userId: user.id },
				select: { questionsSolved: true, correct: true },
			}),
			// Revision queue count
			this.database.wrongQuestion.count({
				where: {
					userId: user.id,
					status: "pending",
					OR: [
						{ reviewDate: null },
						{ reviewDate: { lte: new Date() } },
					],
				},
			}),
			// Goals
			this.goalsService.getGoalsProgress(accessToken),
			// Mock stats
			this.mockExamsService.getMockStats(accessToken),
		]);

		const totalStudyMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
		const totalQuestionsSolved = logs.reduce((sum, l) => sum + l.questionsSolved, 0);
		const totalCorrect = logs.reduce((sum, l) => sum + l.correct, 0);
		const averageAccuracy = totalQuestionsSolved > 0 
			? Math.round((totalCorrect / totalQuestionsSolved) * 100) 
			: 0;

		return {
			studyTime: {
				totalMinutes: totalStudyMinutes,
				formattedHours: (totalStudyMinutes / 60).toFixed(1),
			},
			questions: {
				totalSolved: totalQuestionsSolved,
				averageAccuracy,
			},
			revision: {
				pendingQueueCount,
			},
			goals,
			mocks,
		};
	}
}
