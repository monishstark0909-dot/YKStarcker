/** @format */

import { Optional, Injectable, Logger  } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import {
	PrismaClient,
	Prisma,
	StudySession,
	QuestionLog,
	NotificationType,
} from "@prisma/client";
import { prisma } from "@yks/database";
import { NotificationsService } from "./notifications.service";

@Injectable()
export class NotificationsScheduler {
	private readonly logger = new Logger(NotificationsScheduler.name);

	constructor(
		private readonly notificationsService: NotificationsService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}

	@Cron(CronExpression.EVERY_MINUTE)
	async runScheduledNotifications() {
		try {
			const users =
				await this.notificationsService.findUsersWithNotificationPreferences();
			const now = new Date();

			for (const user of users) {
				if (!user.profile) {
					continue;
				}

				const preferences =
					user.notificationPreference ??
					(await this.notificationsService.getOrCreatePreferences(user.id));
				const userTime = this.getLocalTime(user.profile.timezone, now);
				const userDate = this.getLocalDateString(user.profile.timezone, now);

				const progress = await this.calculateDailyProgress(user.id, userDate);
				await this.processDailyGoalNotifications(
					user,
					preferences,
					userTime,
					progress,
					userDate,
				);
				await this.processPlannerReminders(
					user,
					preferences,
					userTime,
					userDate,
				);
				await this.processRevisionReminders(
					user,
					preferences,
					userTime,
					userDate,
				);
				await this.processMockReminders(user, preferences, userTime, userDate);
				await this.processStreakWarnings(
					user,
					preferences,
					userTime,
					userDate,
					progress,
				);
				await this.processWeeklySummary(
					user,
					preferences,
					userTime,
					userDate,
					progress,
				);
			}
		} catch (error) {
			this.logger.error("Scheduled notification job failed", error as Error);
		}
	}

	private parseTime(value?: string) {
		if (!value) {
			return null;
		}

		const [hour, minute] = value.split(":").map(Number);
		if (Number.isInteger(hour) && Number.isInteger(minute)) {
			return { hour, minute };
		}
		return null;
	}

	private getLocalTime(timeZone: string, date: Date) {
		const formatted = new Intl.DateTimeFormat("en-CA", {
			timeZone,
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}).format(date);
		const [hour, minute] = formatted.split(":").map(Number);
		return { hour, minute };
	}

	private getLocalDateString(timeZone: string, date: Date) {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(date);
	}

	private async calculateDailyProgress(userId: string, dateString: string) {
		const start = new Date(`${dateString}T00:00:00.000Z`);
		const end = new Date(`${dateString}T23:59:59.999Z`);

		const [sessions, logs] = await Promise.all([
			this.database.studySession.findMany({
				where: { userId, createdAt: { gte: start, lte: end } },
			}),
			this.database.questionLog.findMany({
				where: { userId, createdAt: { gte: start, lte: end } },
			}),
		]);

		return {
			studyMinutes: sessions.reduce(
				(sum, record) => sum + record.durationMinutes,
				0,
			),
			questionCount: logs.reduce(
				(sum, record) => sum + record.questionsSolved,
				0,
			),
		};
	}

	private async processDailyGoalNotifications(
		user: {
			id: string;
			profile: {
				dailyStudyGoalMinutes: number;
				dailyQuestionGoal: number;
				timezone: string;
			} | null;
		},
		preferences: any,
		userTime: { hour: number; minute: number },
		progress: { studyMinutes: number; questionCount: number },
		userDate: string,
	) {
		if (!preferences.dailyReminders || !user.profile) {
			return;
		}

		const hasCompletedToday =
			progress.studyMinutes >= (user.profile?.dailyStudyGoalMinutes ?? 0) ||
			progress.questionCount >= (user.profile?.dailyQuestionGoal ?? 0);
		const isTimeForReminder = this.matchesTime(
			userTime,
			this.parseTime(preferences.dailyReminderTime),
		);
		const isTimeForMissed = userTime.hour === 23 && userTime.minute === 0;

		if (hasCompletedToday) {
			await this.createUniqueDailyNotification(
				user.id,
				NotificationType.daily_goal_completed,
				user.profile.timezone,
				userDate,
				async () => {
					return this.notificationsService.createNotification(user.id, {
						type: NotificationType.daily_goal_completed,
						title: "Daily study goal achieved",
						description: `Great job! You've reached today's target with ${progress.studyMinutes} study minutes and ${progress.questionCount} questions.`,
						icon: "🎯",
					});
				},
			);
		}

		if (isTimeForReminder && !hasCompletedToday) {
			await this.createUniqueDailyNotification(
				user.id,
				NotificationType.daily_goal_missed,
				user.profile.timezone,
				userDate,
				async () => {
					return this.notificationsService.createNotification(user.id, {
						type: NotificationType.daily_goal_missed,
						title: "Daily study goal reminder",
						description: `You still have ${Math.max((user.profile?.dailyStudyGoalMinutes ?? 0) - progress.studyMinutes, 0)} minutes or ${Math.max((user.profile?.dailyQuestionGoal ?? 0) - progress.questionCount, 0)} questions left for today.`,
						icon: "⏰",
					});
				},
			);
		}

		if (!hasCompletedToday && isTimeForMissed) {
			await this.createUniqueDailyNotification(
				user.id,
				NotificationType.daily_goal_missed,
				user.profile.timezone,
				userDate,
				async () => {
					return this.notificationsService.createNotification(user.id, {
						type: NotificationType.daily_goal_missed,
						title: "Missed daily study goal",
						description:
							"You didn't reach today's study target. Review your plan and try again tomorrow.",
						icon: "⚠️",
					});
				},
			);
		}
	}

	private async processPlannerReminders(
		user: { id: string; profile: { timezone: string } | null },
		preferences: any,
		userTime: { hour: number; minute: number },
		userDate: string,
	) {
		if (!preferences.plannerReminders || !user.profile) {
			return;
		}

		if (
			!this.matchesTime(
				userTime,
				this.parseTime(preferences.plannerReminderTime),
			)
		) {
			return;
		}

		const dueTasks = await this.database.studyTask.findMany({
			where: {
				userId: user.id,
				date: { lte: new Date(`${userDate}T23:59:59.999Z`) },
				status: { not: "completed" },
			},
		});

		if (dueTasks.length === 0) {
			return;
		}

		const title =
			dueTasks.length === 1 ? "Planner task overdue" : "Planner tasks overdue";
		const description = `You have ${dueTasks.length} planner ${dueTasks.length === 1 ? "task" : "tasks"} due today or earlier.`;

		await this.createUniqueDailyNotification(
			user.id,
			NotificationType.planner_overdue,
			user.profile.timezone,
			userDate,
			async () => {
				return this.notificationsService.createNotification(user.id, {
					type: NotificationType.planner_overdue,
					title,
					description,
					icon: "📌",
				});
			},
		);
	}

	private async processRevisionReminders(
		user: { id: string; profile: { timezone: string } | null },
		preferences: any,
		userTime: { hour: number; minute: number },
		userDate: string,
	) {
		if (!preferences.revisionReminders || !user.profile) {
			return;
		}

		if (
			!this.matchesTime(
				userTime,
				this.parseTime(preferences.revisionReminderTime),
			)
		) {
			return;
		}

		const dueRevisions = await this.database.revisionTask.findMany({
			where: {
				userId: user.id,
				date: { lte: new Date(`${userDate}T23:59:59.999Z`) },
				status: { not: "completed" },
			},
		});

		if (dueRevisions.length === 0) {
			return;
		}

		await this.createUniqueDailyNotification(
			user.id,
			NotificationType.revision_due,
			user.profile.timezone,
			userDate,
			async () => {
				return this.notificationsService.createNotification(user.id, {
					type: NotificationType.revision_due,
					title: "Revision due soon",
					description: `You have ${dueRevisions.length} revision ${dueRevisions.length === 1 ? "task" : "tasks"} due today.`,
					icon: "🧠",
				});
			},
		);
	}

	private async processMockReminders(
		user: { id: string; profile: { timezone: string } | null },
		preferences: any,
		userTime: { hour: number; minute: number },
		userDate: string,
	) {
		if (!preferences.mockReminders || !user.profile) {
			return;
		}

		if (
			!this.matchesTime(userTime, this.parseTime(preferences.mockReminderTime))
		) {
			return;
		}

		const windowEnd = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
		const upcomingMocks = await this.database.mockExam.findMany({
			where: {
				userId: user.id,
				takenAt: { gte: new Date(), lte: windowEnd },
			},
		});

		if (upcomingMocks.length === 0) {
			return;
		}

		await this.createUniqueDailyNotification(
			user.id,
			NotificationType.mock_scheduled,
			user.profile.timezone,
			userDate,
			async () => {
				return this.notificationsService.createNotification(user.id, {
					type: NotificationType.mock_scheduled,
					title: "Mock exam scheduled",
					description: `You have ${upcomingMocks.length} mock exam${upcomingMocks.length === 1 ? "" : "s"} coming up soon.`,
					icon: "📝",
				});
			},
		);
	}

	private async processStreakWarnings(
		user: { id: string; profile: { timezone: string } | null },
		preferences: any,
		userTime: { hour: number; minute: number },
		userDate: string,
		progress: { studyMinutes: number; questionCount: number },
	) {
		if (!preferences.streakReminders || !user.profile) {
			return;
		}

		if (
			!this.matchesTime(
				userTime,
				this.parseTime(preferences.streakReminderTime),
			)
		) {
			return;
		}

		const streak = await this.calculateStudyStreak(
			user.id,
			user.profile.timezone,
			userDate,
		);
		if (streak === 0) {
			return;
		}

		if (progress.studyMinutes === 0 && progress.questionCount === 0) {
			await this.createUniqueDailyNotification(
				user.id,
				NotificationType.streak_warning,
				user.profile.timezone,
				userDate,
				async () => {
					return this.notificationsService.createNotification(user.id, {
						type: NotificationType.streak_warning,
						title: "Study streak at risk",
						description: `You haven't logged any study activity yet today. Keep your ${streak}-day streak alive.`,
						icon: "🔥",
					});
				},
			);
		}
	}

	private async processWeeklySummary(
		user: { id: string; profile: { timezone: string } | null },
		preferences: any,
		userTime: { hour: number; minute: number },
		userDate: string,
		progress: { studyMinutes: number; questionCount: number },
	) {
		if (!preferences.weeklySummary || !user.profile) {
			return;
		}

		const localDate = new Date(
			this.getLocalDateString(user.profile.timezone, new Date()).replace(
				/-/g,
				"/",
			),
		);
		const dayOfWeek = new Intl.DateTimeFormat("en-US", {
			timeZone: user.profile.timezone,
			weekday: "long",
		}).format(localDate);

		if (dayOfWeek !== "Monday") {
			return;
		}

		if (
			!this.matchesTime(userTime, this.parseTime(preferences.weeklySummaryTime))
		) {
			return;
		}

		await this.createUniqueDailyNotification(
			user.id,
			NotificationType.weekly_report,
			user.profile.timezone,
			userDate,
			async () => {
				return this.notificationsService.createNotification(user.id, {
					type: NotificationType.weekly_report,
					title: "Weekly progress summary ready",
					description: `Your weekly progress report is available. Today's totals: ${progress.studyMinutes} minutes and ${progress.questionCount} questions.`,
					icon: "📊",
				});
			},
		);
	}

	private async calculateStudyStreak(
		userId: string,
		timeZone: string,
		userDate: string,
	) {
		const sessions = await this.database.studySession.findMany({
			where: { userId },
			select: { createdAt: true, durationMinutes: true },
		});

		const logs = await this.database.questionLog.findMany({
			where: { userId },
			select: { createdAt: true, questionsSolved: true },
		});

		const activeDates = new Set<string>();
		for (const entry of [...sessions, ...logs] as Array<
			StudySession | QuestionLog
		>) {
			if (
				(entry as StudySession).durationMinutes !== undefined
					? (entry as StudySession).durationMinutes > 0
					: (entry as QuestionLog).questionsSolved > 0
			) {
				activeDates.add(this.getLocalDateString(timeZone, entry.createdAt));
			}
		}

		let streak = 0;
		let cursor = new Date(userDate.replace(/-/g, "/"));
		while (true) {
			const dateKey = this.getLocalDateString(timeZone, cursor);
			if (activeDates.has(dateKey)) {
				streak += 1;
				cursor.setDate(cursor.getDate() - 1);
			} else {
				break;
			}
		}

		return streak;
	}

	private matchesTime(
		current: { hour: number; minute: number },
		target: { hour: number; minute: number } | null,
	) {
		if (!target) {
			return false;
		}
		return current.hour === target.hour && current.minute === target.minute;
	}

	private async createUniqueDailyNotification(
		userId: string,
		type: NotificationType,
		timeZone: string,
		localDate: string,
		create: () => Promise<any>,
	) {
		const existing = await this.database.notification.findMany({
			where: {
				userId,
				type,
				createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
			},
		});

		const alreadyCreatedToday = existing.some((notification) => {
			return (
				this.getLocalDateString(timeZone, notification.createdAt) === localDate
			);
		});

		if (alreadyCreatedToday) {
			return;
		}

		await create();
	}
}
