/** @format */

import { Optional,
	Injectable,
	NotFoundException,
	UnauthorizedException,
 } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";

type StudyGroupMemberOverview = {
	id: string;
	displayName: string;
	username: string;
	avatarUrl?: string | null;
	targetUniversity?: string | null;
	targetDepartment?: string | null;
	currentStreak: number;
	todayStudyMinutes: number;
	weeklyStudyMinutes: number;
	monthlyStudyMinutes: number;
	weeklyStudyHours: number;
	questionsSolved: number;
	latestMockAverage: number;
	overallScore: number;
};

type StudyGroupMemberProfile = StudyGroupMemberOverview & {
	subjectProgress: Array<{
		subjectId: string;
		name: string;
		timeSpentMinutes: number;
		questionsSolved: number;
		accuracyRate: number;
		completionPercentage: number;
	}>;
	mockHistory: Array<{
		id: string;
		name: string;
		examType: string;
		takenAt: string;
		overallNet: number;
		overallCorrect: number;
		overallWrong: number;
	}>;
	recentStudySessions: Array<{
		id: string;
		subjectName?: string | null;
		topicName?: string | null;
		subtopicName?: string | null;
		durationMinutes: number;
		notes?: string | null;
		startedAt?: string | null;
	}>;
};

type StudyGroupLeaderboardEntry = {
	id: string;
	displayName: string;
	avatarUrl?: string | null;
	value: number;
};

type StudyGroupLeaderboard = {
	members: StudyGroupMemberOverview[];
	topMembers: StudyGroupMemberOverview[];
	rankings: {
		dailyStudyTime: StudyGroupLeaderboardEntry[];
		weeklyStudyTime: StudyGroupLeaderboardEntry[];
		monthlyStudyTime: StudyGroupLeaderboardEntry[];
		questionsSolved: StudyGroupLeaderboardEntry[];
		currentStreak: StudyGroupLeaderboardEntry[];
		mockAverage: StudyGroupLeaderboardEntry[];
		overallScore: StudyGroupLeaderboardEntry[];
	};
};

@Injectable()
export class StudyGroupService {
	@Optional() private readonly database: PrismaClient = prisma;

	constructor(private readonly authService: AuthService) {}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	private toDayString(date: Date) {
		return date.toISOString().split("T")[0];
	}

	private getStartOfToday() {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		return start;
	}

	private getEndOfToday() {
		const end = new Date();
		end.setHours(23, 59, 59, 999);
		return end;
	}

	private getStartOfWeek() {
		const start = new Date();
		const day = start.getDay();
		const diff = start.getDate() - day + (day === 0 ? -6 : 1);
		start.setDate(diff);
		start.setHours(0, 0, 0, 0);
		return start;
	}

	private getStartOfMonth() {
		const start = new Date();
		start.setDate(1);
		start.setHours(0, 0, 0, 0);
		return start;
	}

	private calculateStreak(createdAtDates: Set<string>) {
		const today = new Date();
		let current = new Date(today);

		if (!createdAtDates.has(this.toDayString(current))) {
			current.setDate(current.getDate() - 1);
		}

		let streak = 0;
		while (createdAtDates.has(this.toDayString(current))) {
			streak += 1;
			current.setDate(current.getDate() - 1);
		}

		return streak;
	}

	private calculateScore(member: StudyGroupMemberOverview) {
		const weeklyHoursScore = Math.min(member.weeklyStudyHours / 20, 1);
		const streakScore = Math.min(member.currentStreak / 30, 1);
		const mockScore = Math.min(member.latestMockAverage / 70, 1);
		const questionsScore = Math.min(member.questionsSolved / 200, 1);

		return Math.round(
			weeklyHoursScore * 35 +
				streakScore * 30 +
				mockScore * 20 +
				questionsScore * 15,
		);
	}

	private buildMemberOverview(
		user: {
			id: string;
			displayName: string;
			username: string;
			avatarUrl?: string | null;
			profile?: {
				targetUniversity?: string | null;
				targetDepartment?: string | null;
			} | null;
		},
		sessions: Array<{
			userId: string;
			durationMinutes: number;
			createdAt: Date;
		}>,
		logs: Array<{
			userId: string;
			questionsSolved: number;
			createdAt: Date;
		}>,
		mocks: Array<{
			userId: string;
			overallNet: any;
			takenAt: Date;
		}>,
	) {
		const today = this.getStartOfToday();
		const endOfToday = this.getEndOfToday();
		const weekStart = this.getStartOfWeek();
		const monthStart = this.getStartOfMonth();

		const userSessions = sessions.filter(
			(session) => session.userId === user.id,
		);
		const userLogs = logs.filter((log) => log.userId === user.id);
		const userMocks = mocks
			.filter((mock) => mock.userId === user.id)
			.sort((a, b) => b.takenAt.getTime() - a.takenAt.getTime());

		const todayStudyMinutes = userSessions.reduce((sum, session) => {
			const createdAt = new Date(session.createdAt);
			if (createdAt >= today && createdAt <= endOfToday) {
				return sum + session.durationMinutes;
			}
			return sum;
		}, 0);

		const weeklyStudyMinutes = userSessions.reduce((sum, session) => {
			const createdAt = new Date(session.createdAt);
			if (createdAt >= weekStart) {
				return sum + session.durationMinutes;
			}
			return sum;
		}, 0);

		const monthlyStudyMinutes = userSessions.reduce((sum, session) => {
			const createdAt = new Date(session.createdAt);
			if (createdAt >= monthStart) {
				return sum + session.durationMinutes;
			}
			return sum;
		}, 0);

		const questionsSolved = userLogs.reduce(
			(sum, log) => sum + log.questionsSolved,
			0,
		);

		const activeDates = new Set<string>();
		for (const session of userSessions) {
			if (session.durationMinutes > 0) {
				activeDates.add(this.toDayString(new Date(session.createdAt)));
			}
		}
		for (const log of userLogs) {
			if (log.questionsSolved > 0) {
				activeDates.add(this.toDayString(new Date(log.createdAt)));
			}
		}

		const currentStreak = this.calculateStreak(activeDates);

		const latestMock = userMocks[0];
		const latestMockAverage = latestMock ? Number(latestMock.overallNet) : 0;

		const overview: StudyGroupMemberOverview = {
			id: user.id,
			displayName: user.displayName,
			username: user.username,
			avatarUrl: user.avatarUrl,
			targetUniversity: user.profile?.targetUniversity ?? null,
			targetDepartment: user.profile?.targetDepartment ?? null,
			currentStreak,
			todayStudyMinutes,
			weeklyStudyMinutes,
			monthlyStudyMinutes,
			weeklyStudyHours: Number((weeklyStudyMinutes / 60).toFixed(1)),
			questionsSolved,
			latestMockAverage,
			overallScore: 0,
		};

		overview.overallScore = this.calculateScore(overview);
		return overview;
	}

	private buildRankingEntry(
		member: StudyGroupMemberOverview,
		value: number,
	): StudyGroupLeaderboardEntry {
		return {
			id: member.id,
			displayName: member.displayName,
			avatarUrl: member.avatarUrl,
			value,
		};
	}

	async getMembers(accessToken: string) {
		await this.getCurrentUser(accessToken);

		const users = await this.database.user.findMany({
			include: { profile: true },
			orderBy: { displayName: "asc" },
		});

		const userIds = users.map((user) => user.id);

		const [sessions, logs, mocks] = await Promise.all([
			this.database.studySession.findMany({
				where: { userId: { in: userIds } },
				select: { userId: true, durationMinutes: true, createdAt: true },
			}),
			this.database.questionLog.findMany({
				where: { userId: { in: userIds } },
				select: { userId: true, questionsSolved: true, createdAt: true },
			}),
			this.database.mockExam.findMany({
				where: { userId: { in: userIds } },
				select: { userId: true, overallNet: true, takenAt: true },
			}),
		]);

		return users.map((user) =>
			this.buildMemberOverview(user, sessions, logs, mocks),
		);
	}

	async getMember(accessToken: string, memberId: string) {
		await this.getCurrentUser(accessToken);

		const user = await this.database.user.findUnique({
			where: { id: memberId },
			include: { profile: true },
		});

		if (!user) {
			throw new NotFoundException("Member not found.");
		}

		const [sessions, logs, mocks, recentStudySessions] = await Promise.all([
			this.database.studySession.findMany({
				where: { userId: user.id },
				include: { subject: true, topic: true, subtopic: true },
			}),
			this.database.questionLog.findMany({
				where: { userId: user.id },
				include: { subject: true },
			}),
			this.database.mockExam.findMany({
				where: { userId: user.id },
				orderBy: { takenAt: "desc" },
			}),
			this.database.studySession.findMany({
				where: { userId: user.id },
				include: { subject: true, topic: true, subtopic: true },
				orderBy: { createdAt: "desc" },
				take: 5,
			}),
		]);

		const overview = this.buildMemberOverview(user, sessions, logs, mocks);

		const subjectMap = new Map<
			string,
			{
				name: string;
				timeSpentMinutes: number;
				questionsSolved: number;
				correct: number;
			}
		>();

		for (const session of sessions) {
			if (!session.subject) continue;
			const subjectId = session.subject.id;
			const existing = subjectMap.get(subjectId) ?? {
				name: session.subject.name,
				timeSpentMinutes: 0,
				questionsSolved: 0,
				correct: 0,
			};
			existing.timeSpentMinutes += session.durationMinutes;
			subjectMap.set(subjectId, existing);
		}

		for (const log of logs) {
			if (!log.subject) continue;
			const subjectId = log.subject.id;
			const existing = subjectMap.get(subjectId) ?? {
				name: log.subject.name,
				timeSpentMinutes: 0,
				questionsSolved: 0,
				correct: 0,
			};
			existing.questionsSolved += log.questionsSolved;
			existing.correct += log.correct;
			subjectMap.set(subjectId, existing);
		}

		const subjectProgress = Array.from(subjectMap.entries())
			.map(([subjectId, value]) => ({
				subjectId,
				name: value.name,
				timeSpentMinutes: value.timeSpentMinutes,
				questionsSolved: value.questionsSolved,
				accuracyRate:
					value.questionsSolved > 0
						? Math.round((value.correct / value.questionsSolved) * 100)
						: 0,
				completionPercentage:
					value.questionsSolved > 0 || value.timeSpentMinutes > 0 ? 100 : 0,
			}))
			.sort((a, b) => b.timeSpentMinutes - a.timeSpentMinutes);

		const profile: StudyGroupMemberProfile = {
			...overview,
			subjectProgress,
			mockHistory: mocks.slice(0, 5).map((mock) => ({
				id: mock.id,
				name: mock.name,
				examType: mock.examType,
				takenAt: mock.takenAt.toISOString(),
				overallNet: Number(mock.overallNet),
				overallCorrect: mock.overallCorrect,
				overallWrong: mock.overallWrong,
			})),
			recentStudySessions: recentStudySessions.map((session) => ({
				id: session.id,
				subjectName: session.subject?.name ?? null,
				topicName: session.topic?.name ?? null,
				subtopicName: session.subtopic?.name ?? null,
				durationMinutes: session.durationMinutes,
				notes: session.notes,
				startedAt: session.startedAt?.toISOString() ?? null,
			})),
		};

		return profile;
	}

	async getLeaderboard(accessToken: string) {
		await this.getCurrentUser(accessToken);
		const members = await this.getMembers(accessToken);

		const sortDescending = (
			items: StudyGroupMemberOverview[],
			selector: (member: StudyGroupMemberOverview) => number,
		) =>
			items
				.map((member) => ({ member, value: selector(member) }))
				.sort((a, b) => b.value - a.value)
				.map(({ member, value }) => this.buildRankingEntry(member, value));

		const ranked = {
			dailyStudyTime: sortDescending(
				members,
				(member) => member.todayStudyMinutes,
			),
			weeklyStudyTime: sortDescending(
				members,
				(member) => member.weeklyStudyHours,
			),
			monthlyStudyTime: sortDescending(
				members,
				(member) => member.monthlyStudyMinutes,
			),
			questionsSolved: sortDescending(
				members,
				(member) => member.questionsSolved,
			),
			currentStreak: sortDescending(members, (member) => member.currentStreak),
			mockAverage: sortDescending(
				members,
				(member) => member.latestMockAverage,
			),
			overallScore: sortDescending(members, (member) => member.overallScore),
		};

		return {
			members,
			topMembers: ranked.overallScore.slice(0, 3).map((entry) => {
				const member = members.find((item) => item.id === entry.id);
				return (
					member ?? {
						id: entry.id,
						displayName: entry.displayName,
						username: "",
						avatarUrl: entry.avatarUrl,
						targetUniversity: null,
						targetDepartment: null,
						currentStreak: 0,
						todayStudyMinutes: 0,
						weeklyStudyMinutes: 0,
						monthlyStudyMinutes: 0,
						weeklyStudyHours: 0,
						questionsSolved: 0,
						latestMockAverage: 0,
						overallScore: 0,
					}
				);
			}),
			rankings: ranked,
		};
	}
}
