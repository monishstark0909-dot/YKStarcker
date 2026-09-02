/** @format */

import { Optional,
	Injectable,
	UnauthorizedException,
	Logger,
	Inject,
 } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { GoalsService } from "../goals/goals.service";
import { MockExamsService } from "../mock-exams/mock-exams.service";
import type {
	AIProvider,
	AIMessage,
	AIResponse,
} from "./providers/ai.provider";
import {
	buildAnalyticsPayload,
	buildSystemPrompt,
	buildRecommendationPrompt,
	buildWeeklySummaryPrompt,
	buildWeakSubjectAnalysisPrompt,
	type AnalyticsPayload,
} from "./builders/prompt.builder";
import type { CacheProvider } from "./cache/cache.provider";
import type { RateLimiter } from "./rate-limit/rate-limiter.provider";
import {
	AI_PROVIDER_TOKEN,
	AI_CACHE_PROVIDER,
	AI_RATE_LIMITER,
} from "./ai.constants";
import {
	parseRecommendationResponse,
	parseSummaryResponse,
	buildErrorResponse,
	type AIRecommendationResponse,
	type AISummaryResponse,
} from "./utils/response-validator";

@Injectable()
export class AIService {
	private readonly logger = new Logger(AIService.name);
	@Optional() private readonly database: PrismaClient = prisma;

	constructor(
		private readonly authService: AuthService,
		private readonly goalsService: GoalsService,
		private readonly mockExamsService: MockExamsService,
		@Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: AIProvider,
		@Inject(AI_CACHE_PROVIDER) private readonly cacheService: CacheProvider,
		@Inject(AI_RATE_LIMITER) private readonly rateLimitService: RateLimiter,
	) {}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token not provided");
		}
		return this.authService.me(accessToken);
	}

	private async collectAnalytics(
		accessToken: string,
	): Promise<AnalyticsPayload> {
		const { user } = await this.getCurrentUser(accessToken);

		// Fetch user profile
		const profile = await this.database.profile.findUnique({
			where: { userId: user.id },
		});

		// Fetch study metrics
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

		const [
			todaySessions,
			weekSessions,
			monthSessions,
			allSessions,
			questionLogs,
			wrongQuestions,
			goals,
			mockStats,
		] = await Promise.all([
			this.database.studySession.findMany({
				where: {
					userId: user.id,
					createdAt: { gte: startOfToday, lte: endOfToday },
				},
			}),
			this.database.studySession.findMany({
				where: { userId: user.id, createdAt: { gte: startOfWeek } },
			}),
			this.database.studySession.findMany({
				where: { userId: user.id, createdAt: { gte: startOfMonth } },
			}),
			this.database.studySession.findMany({
				where: { userId: user.id },
			}),
			this.database.questionLog.findMany({
				where: { userId: user.id },
			}),
			this.database.wrongQuestion.findMany({
				where: { userId: user.id, status: "pending" },
			}),
			this.goalsService.getGoalsProgress(accessToken),
			this.mockExamsService.getMockStats(accessToken),
		]);

		// Calculate study metrics
		const todayMinutes = todaySessions.reduce(
			(sum, s) => sum + s.durationMinutes,
			0,
		);
		const weeklyMinutes = weekSessions.reduce(
			(sum, s) => sum + s.durationMinutes,
			0,
		);
		const monthlyMinutes = monthSessions.reduce(
			(sum, s) => sum + s.durationMinutes,
			0,
		);

		// Calculate subject performance
		const subjectMap = new Map<string, any>();
		for (const session of allSessions) {
			if (!session.subjectId) continue;
			if (!subjectMap.has(session.subjectId)) {
				const subject = await this.database.subject.findUnique({
					where: { id: session.subjectId },
				});
				subjectMap.set(session.subjectId, {
					id: session.subjectId,
					name: subject?.name ?? "Unknown",
					timeSpentMinutes: 0,
					questionsSolved: 0,
					correct: 0,
					accuracy: 0,
					completionPercentage: 0,
				});
			}
			const entry = subjectMap.get(session.subjectId);
			entry.timeSpentMinutes += session.durationMinutes;
		}

		// Add question log data to subjects
		for (const log of questionLogs) {
			if (!log.subjectId) continue;
			if (!subjectMap.has(log.subjectId)) {
				const subject = await this.database.subject.findUnique({
					where: { id: log.subjectId },
				});
				subjectMap.set(log.subjectId, {
					id: log.subjectId,
					name: subject?.name ?? "Unknown",
					timeSpentMinutes: 0,
					questionsSolved: 0,
					correct: 0,
					accuracy: 0,
					completionPercentage: 0,
				});
			}
			const entry = subjectMap.get(log.subjectId);
			entry.questionsSolved += log.questionsSolved;
			entry.correct += log.correct;
		}

		// Calculate accuracies
		const subjects = Array.from(subjectMap.values()).map((s) => ({
			...s,
			accuracy:
				s.questionsSolved > 0
					? Math.round((s.correct / s.questionsSolved) * 100)
					: 0,
			completionPercentage: 0, // Would need curriculum data to calculate
		}));

		// Question metrics
		const totalSolved = questionLogs.reduce(
			(sum, l) => sum + l.questionsSolved,
			0,
		);
		const totalCorrect = questionLogs.reduce((sum, l) => sum + l.correct, 0);
		const totalWrong = questionLogs.reduce((sum, l) => sum + l.wrong, 0);
		const accuracy =
			totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

		// Mock exams
		const mockExams = await this.database.mockExam.findMany({
			where: { userId: user.id },
			orderBy: { takenAt: "desc" },
		});
		const latestTYT = mockExams.find((m) => m.examType === "tyt");
		const latestAYT = mockExams.find((m) => m.examType === "ayt");

		// Planner
		const todayTasks = await Promise.all([
			this.database.studyTask.findMany({
				where: {
					userId: user.id,
					date: { gte: startOfToday, lte: endOfToday },
				},
			}),
			this.database.revisionTask.findMany({
				where: {
					userId: user.id,
					date: { gte: startOfToday, lte: endOfToday },
				},
			}),
		]);
		const todayTasksTotal = todayTasks[0].length + todayTasks[1].length;
		const todayCompleted = [
			...todayTasks[0].filter((t) => t.status === "completed"),
			...todayTasks[1].filter((t) => t.status === "completed"),
		].length;
		const overdueCount = [
			...(await this.database.studyTask.findMany({
				where: {
					userId: user.id,
					date: { lt: startOfToday },
					status: { not: "completed" },
				},
			})),
			...(await this.database.revisionTask.findMany({
				where: {
					userId: user.id,
					date: { lt: startOfToday },
					status: { not: "completed" },
				},
			})),
		].length;

		return buildAnalyticsPayload(
			{
				examType: profile?.examType ?? "tyt",
				targetUniversity: profile?.targetUniversity,
				targetDepartment: profile?.targetDepartment,
				targetRanking: profile?.targetRanking,
				displayName: user.displayName,
			},
			{
				todayMinutes,
				weeklyMinutes,
				monthlyMinutes,
				currentStreak: goals?.streak ?? 0,
				longestStreak: 0, // Not tracked yet; using mock value
				totalSessionsRecorded: allSessions.length,
			},
			subjects,
			{
				accuracy,
				totalSolved,
				totalCorrect,
				totalWrong,
				pendingReviewCount: wrongQuestions.length,
			},
			{
				totalAttempts: mockExams.length,
				latestTYT: latestTYT
					? {
							net: Number(latestTYT.overallNet),
							accuracy: Math.round(
								(latestTYT.overallCorrect /
									(latestTYT.overallCorrect + latestTYT.overallWrong)) *
									100,
							),
							date: latestTYT.takenAt.toISOString(),
						}
					: undefined,
				latestAYT: latestAYT
					? {
							net: Number(latestAYT.overallNet),
							accuracy: Math.round(
								(latestAYT.overallCorrect /
									(latestAYT.overallCorrect + latestAYT.overallWrong)) *
									100,
							),
							date: latestAYT.takenAt.toISOString(),
						}
					: undefined,
				averageAccuracy: mockStats?.averageAccuracy ?? 0,
				trendDirection: "stable" as const,
			},
			{
				todayTasksTotal,
				todayTasksCompleted: todayCompleted,
				overdueTasksCount: overdueCount,
				upcomingTasksCount: 0,
			},
			goals,
		);
	}

	async getRecommendations(accessToken: string): Promise<{
		recommendations: AIRecommendationResponse;
		cached: boolean;
		model?: string;
	}> {
		try {
			const { user } = await this.getCurrentUser(accessToken);

			// Check cache first (6 hour TTL)
			const cached = this.cacheService.get<AIRecommendationResponse>(
				user.id,
				"daily",
			);
			if (cached) {
				this.logger.debug(`Cache hit for daily recommendations: ${user.id}`);
				return {
					recommendations: cached,
					cached: true,
				};
			}

			// Check rate limit
			this.rateLimitService.checkLimit(user.id);

			// Collect analytics
			const analytics = await this.collectAnalytics(accessToken);

			// Call AI provider
			const messages: AIMessage[] = [
				{
					role: "system",
					content: buildSystemPrompt(),
				},
				{
					role: "user",
					content: buildRecommendationPrompt(analytics),
				},
			];

			const response = await this.aiProvider.generateCompletion(messages);

			// Parse and validate response
			const recommendations = parseRecommendationResponse(response.content);

			// Cache for 6 hours
			this.cacheService.set(
				user.id,
				"daily",
				recommendations,
				6 * 60 * 60 * 1000,
			);

			return {
				recommendations,
				cached: false,
				model: response.model,
			};
		} catch (error: any) {
			this.logger.error("Failed to generate recommendations:", error.message);

			// Return safe fallback instead of throwing
			return {
				recommendations: buildErrorResponse(error),
				cached: false,
			};
		}
	}

	async getWeeklySummary(accessToken: string): Promise<{
		summary: AISummaryResponse;
		cached: boolean;
		model?: string;
	}> {
		try {
			const { user } = await this.getCurrentUser(accessToken);

			// Check cache first (24 hour TTL)
			const cached = this.cacheService.get<AISummaryResponse>(
				user.id,
				"weekly",
			);
			if (cached) {
				this.logger.debug(`Cache hit for weekly summary: ${user.id}`);
				return {
					summary: cached,
					cached: true,
				};
			}

			// Check rate limit
			this.rateLimitService.checkLimit(user.id);

			// Collect analytics
			const analytics = await this.collectAnalytics(accessToken);

			// Call AI provider
			const messages: AIMessage[] = [
				{
					role: "system",
					content: buildSystemPrompt(),
				},
				{
					role: "user",
					content: buildWeeklySummaryPrompt(analytics),
				},
			];

			const response = await this.aiProvider.generateCompletion(messages);

			// Parse and validate response
			const summary = parseSummaryResponse(response.content);

			// Cache for 24 hours
			this.cacheService.set(user.id, "weekly", summary, 24 * 60 * 60 * 1000);

			return {
				summary,
				cached: false,
				model: response.model,
			};
		} catch (error: any) {
			this.logger.error("Failed to generate weekly summary:", error.message);

			// Return safe fallback
			return {
				summary: {
					summary:
						"Could not generate this week's summary. Keep up your consistent study effort!",
					weeklyStats: {},
					strengths: ["Your commitment to studying"],
					improvements: ["Review weak subjects more"],
					nextWeekFocus: "Continue building consistency",
				},
				cached: false,
			};
		}
	}

	async chat(accessToken: string, userMessage: string): Promise<AIResponse> {
		const { user } = await this.getCurrentUser(accessToken);

		// Check rate limit
		this.rateLimitService.checkLimit(user.id);

		const analytics = await this.collectAnalytics(accessToken);

		const name = analytics.student?.displayName || (user.email ? user.email.split("@")[0] : "Student");
		const streak = analytics.study?.currentStreak || 0;
		const acc = analytics.questions?.accuracy || 0;
		const totalSolved = analytics.questions?.totalSolved || 0;
		const totalCorrect = analytics.questions?.totalCorrect || 0;
		const totalWrong = analytics.questions?.totalWrong || 0;
		const todayMins = analytics.study?.todayMinutes || 0;
		const pendingRevisions = analytics.questions?.pendingReviewCount || 0;
		const weakSubjs = analytics.subjects?.weak?.map((s: any) => s.name).join(", ") || "None";
		const strongSubjs = analytics.subjects?.strong?.map((s: any) => s.name).join(", ") || "None";
		const targetDept = analytics.student?.targetDepartment || "Computer Science / Engineering";
		const targetUniv = analytics.student?.targetUniversity || "Top Turkish University (Boğaziçi, ODTÜ, İTÜ)";
		const targetRank = analytics.student?.targetRanking || 3000;

		const systemPrompt = `You are an expert, encouraging, highly intelligent YKS (Turkish University Entrance Exam) Study Mentor and Coach named "YKS AI Coach".

STUDENT CONTEXT & LIVE ANALYTICS:
- Student Name: ${name}
- Target Exam: YKS (TYT/AYT/YDT)
- Target Department: ${targetDept}
- Target University: ${targetUniv}
- Target Ranking: Top ${targetRank}
- Study Streak: ${streak} days
- Today's Study Time: ${todayMins} minutes
- Total Questions Solved: ${totalSolved} (${totalCorrect} correct, ${totalWrong} wrong)
- Overall Question Accuracy: ${acc}%
- Pending Revision Items: ${pendingRevisions}
- Weak Subjects: ${weakSubjs}
- Strong Subjects: ${strongSubjs}

GUIDELINES:
1. Respond directly and naturally to the user's specific question using organic, intelligent AI reasoning.
2. Use the student's live analytics whenever relevant to give personal, precise advice.
3. Be concise, actionable, structured, and warm. Use markdown formatting (bullet points, bold text) for clarity.
4. Provide real YKS exam insights (TYT/AYT score dynamics, net benchmarks, ranking expectations) when asked about universities, rankings, or study speed.
5. NEVER output robotic repetitive fallback text. Generate an original, thoughtful AI answer every time!`;

		const messages: AIMessage[] = [
			{
				role: "system",
				content: systemPrompt,
			},
			{
				role: "user",
				content: userMessage,
			},
		];

		try {
			return await this.aiProvider.generateCompletion(messages);
		} catch (error: any) {
			this.logger.error(`OpenRouter provider error: ${error.message}`);
			throw new Error(`OpenRouter Error: ${error.message}`);
		}
	}

	/**
	 * Clear cache to force regeneration of recommendations.
	 * Useful when user explicitly requests a refresh.
	 */
	async clearCache(accessToken: string): Promise<void> {
		const { user } = await this.getCurrentUser(accessToken);
		this.cacheService.clear(user.id);
		this.logger.debug(`Cache cleared for user: ${user.id}`);
	}

	async healthCheck(): Promise<boolean> {
		return this.aiProvider.healthCheck();
	}

	/**
	 * Get rate limit info for user (for debugging/UI).
	 */
	getRateLimitInfo(userId: string) {
		return {
			remaining: this.rateLimitService.getRemaining(userId),
			resetTime: this.rateLimitService.getResetTime(userId),
		};
	}
}
