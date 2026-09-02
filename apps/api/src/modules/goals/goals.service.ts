import { Optional, Injectable, UnauthorizedException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class GoalsService {
	constructor(
		private readonly authService: AuthService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	async getGoalsProgress(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const profile = await this.database.profile.findUnique({
			where: { userId: user.id },
		});

		const dailyStudyTarget = profile?.dailyStudyGoalMinutes ?? 120;
		const dailyQuestionTarget = profile?.dailyQuestionGoal ?? 100;

		// Date intervals
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const endOfToday = new Date();
		endOfToday.setHours(23, 59, 59, 999);

		const startOfWeek = new Date();
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
		startOfWeek.setDate(diff);
		startOfWeek.setHours(0, 0, 0, 0);

		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		// Queries
		const [
			todaySessions,
			weekSessions,
			monthSessions,
			todayLogs,
			weekLogs,
			monthLogs,
			todayReviewed,
			weekReviewed,
			monthReviewed,
			todayMocks,
			weekMocks,
			monthMocks,
		] = await Promise.all([
			// Sessions
			this.database.studySession.findMany({
				where: { userId: user.id, createdAt: { gte: startOfToday, lte: endOfToday } },
			}),
			this.database.studySession.findMany({
				where: { userId: user.id, createdAt: { gte: startOfWeek } },
			}),
			this.database.studySession.findMany({
				where: { userId: user.id, createdAt: { gte: startOfMonth } },
			}),
			// Question logs
			this.database.questionLog.findMany({
				where: { userId: user.id, createdAt: { gte: startOfToday, lte: endOfToday } },
			}),
			this.database.questionLog.findMany({
				where: { userId: user.id, createdAt: { gte: startOfWeek } },
			}),
			this.database.questionLog.findMany({
				where: { userId: user.id, createdAt: { gte: startOfMonth } },
			}),
			// Wrong question reviewed
			this.database.wrongQuestion.findMany({
				where: { userId: user.id, updatedAt: { gte: startOfToday, lte: endOfToday }, status: { in: ["reviewed", "mastered"] } },
			}),
			this.database.wrongQuestion.findMany({
				where: { userId: user.id, updatedAt: { gte: startOfWeek }, status: { in: ["reviewed", "mastered"] } },
			}),
			this.database.wrongQuestion.findMany({
				where: { userId: user.id, updatedAt: { gte: startOfMonth }, status: { in: ["reviewed", "mastered"] } },
			}),
			// Mock exams
			this.database.mockExam.findMany({
				where: { userId: user.id, takenAt: { gte: startOfToday, lte: endOfToday } },
			}),
			this.database.mockExam.findMany({
				where: { userId: user.id, takenAt: { gte: startOfWeek } },
			}),
			this.database.mockExam.findMany({
				where: { userId: user.id, takenAt: { gte: startOfMonth } },
			}),
		]);

		// Sum totals
		const todayStudyCurrent = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
		const weekStudyCurrent = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
		const monthStudyCurrent = monthSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

		const todayQuestionCurrent = todayLogs.reduce((sum, l) => sum + l.questionsSolved, 0);
		const weekQuestionCurrent = weekLogs.reduce((sum, l) => sum + l.questionsSolved, 0);
		const monthQuestionCurrent = monthLogs.reduce((sum, l) => sum + l.questionsSolved, 0);

		const todayRevisionCurrent = todayReviewed.length;
		const weekRevisionCurrent = weekReviewed.length;
		const monthRevisionCurrent = monthReviewed.length;

		const todayMockCurrent = todayMocks.length;
		const weekMockCurrent = weekMocks.length;
		const monthMockCurrent = monthMocks.length;

		// Calculate streaks based on daily activity (study time > 0 or questions > 0)
		const allSessionsAndLogs = await Promise.all([
			this.database.studySession.findMany({
				where: { userId: user.id },
				select: { createdAt: true, durationMinutes: true },
			}),
			this.database.questionLog.findMany({
				where: { userId: user.id },
				select: { createdAt: true, questionsSolved: true },
			}),
		]);

		const activeDates = new Set<string>();
		for (const s of allSessionsAndLogs[0]) {
			if (s.durationMinutes > 0) {
				activeDates.add(s.createdAt.toISOString().split("T")[0]);
			}
		}
		for (const l of allSessionsAndLogs[1]) {
			if (l.questionsSolved > 0) {
				activeDates.add(l.createdAt.toISOString().split("T")[0]);
			}
		}

		let studyStreak = 0;
		const dateCheck = new Date();
		// If no activity today, check starting from yesterday to count active streak
		const todayStr = dateCheck.toISOString().split("T")[0];
		if (!activeDates.has(todayStr)) {
			dateCheck.setDate(dateCheck.getDate() - 1);
		}

		while (true) {
			const dateStr = dateCheck.toISOString().split("T")[0];
			if (activeDates.has(dateStr)) {
				studyStreak++;
				dateCheck.setDate(dateCheck.getDate() - 1);
			} else {
				break;
			}
		}

		return {
			daily: {
				studyTime: {
					target: dailyStudyTarget,
					current: todayStudyCurrent,
					completionPercentage: dailyStudyTarget > 0 ? Math.min(100, Math.round((todayStudyCurrent / dailyStudyTarget) * 100)) : 0,
					unit: "minutes",
				},
				questions: {
					target: dailyQuestionTarget,
					current: todayQuestionCurrent,
					completionPercentage: dailyQuestionTarget > 0 ? Math.min(100, Math.round((todayQuestionCurrent / dailyQuestionTarget) * 100)) : 0,
					unit: "questions",
				},
				revision: {
					target: 5, // default daily wrong questions revision target
					current: todayRevisionCurrent,
					completionPercentage: Math.min(100, Math.round((todayRevisionCurrent / 5) * 100)),
					unit: "questions",
				},
				mock: {
					target: 0,
					current: todayMockCurrent,
					completionPercentage: todayMockCurrent > 0 ? 100 : 0,
					unit: "exams",
				},
			},
			weekly: {
				studyTime: {
					target: dailyStudyTarget * 7,
					current: weekStudyCurrent,
					completionPercentage: dailyStudyTarget > 0 ? Math.min(100, Math.round((weekStudyCurrent / (dailyStudyTarget * 7)) * 100)) : 0,
					unit: "minutes",
				},
				questions: {
					target: dailyQuestionTarget * 7,
					current: weekQuestionCurrent,
					completionPercentage: dailyQuestionTarget > 0 ? Math.min(100, Math.round((weekQuestionCurrent / (dailyQuestionTarget * 7)) * 100)) : 0,
					unit: "questions",
				},
				revision: {
					target: 25,
					current: weekRevisionCurrent,
					completionPercentage: Math.min(100, Math.round((weekRevisionCurrent / 25) * 100)),
					unit: "questions",
				},
				mock: {
					target: 1, // 1 mock exam per week
					current: weekMockCurrent,
					completionPercentage: Math.min(100, Math.round((weekMockCurrent / 1) * 100)),
					unit: "exams",
				},
			},
			monthly: {
				studyTime: {
					target: dailyStudyTarget * 30,
					current: monthStudyCurrent,
					completionPercentage: dailyStudyTarget > 0 ? Math.min(100, Math.round((monthStudyCurrent / (dailyStudyTarget * 30)) * 100)) : 0,
					unit: "minutes",
				},
				questions: {
					target: dailyQuestionTarget * 30,
					current: monthQuestionCurrent,
					completionPercentage: dailyQuestionTarget > 0 ? Math.min(100, Math.round((monthQuestionCurrent / (dailyQuestionTarget * 30)) * 100)) : 0,
					unit: "questions",
				},
				revision: {
					target: 100,
					current: monthRevisionCurrent,
					completionPercentage: Math.min(100, Math.round((monthRevisionCurrent / 100) * 100)),
					unit: "questions",
				},
				mock: {
					target: 4,
					current: monthMockCurrent,
					completionPercentage: Math.min(100, Math.round((monthMockCurrent / 4) * 100)),
					unit: "exams",
				},
			},
			streak: studyStreak,
		};
	}
}
