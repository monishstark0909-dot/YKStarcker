/** @format */

import { Optional, Injectable, UnauthorizedException  } from "@nestjs/common";
import {
	PrismaClient,
	Profile,
	NotificationPreference,
	NotificationType,
	User,
} from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto";

const DEFAULT_NOTIFICATION_PREFERENCES = {
	dailyReminders: true,
	revisionReminders: true,
	plannerReminders: true,
	mockReminders: true,
	weeklySummary: true,
	streakReminders: true,
	dailyReminderTime: "20:00",
	revisionReminderTime: "08:00",
	plannerReminderTime: "08:30",
	mockReminderTime: "09:00",
	weeklySummaryTime: "18:00",
	streakReminderTime: "12:00",
};

@Injectable()
export class NotificationsService {
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

	private async getUserId(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		return user.id;
	}

	async getNotifications(accessToken: string) {
		const userId = await this.getUserId(accessToken);
		return this.database.notification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	}

	async markAsRead(accessToken: string, id: string) {
		const userId = await this.getUserId(accessToken);
		return this.database.notification.updateMany({
			where: { id, userId },
			data: { isRead: true },
		});
	}

	async markAllAsRead(accessToken: string) {
		const userId = await this.getUserId(accessToken);
		return this.database.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true },
		});
	}

	async deleteNotification(accessToken: string, id: string) {
		const userId = await this.getUserId(accessToken);
		await this.database.notification.deleteMany({
			where: { id, userId },
		});
		return { success: true };
	}

	async getPreferences(accessToken: string) {
		const userId = await this.getUserId(accessToken);
		return this.getOrCreatePreferences(userId);
	}

	async updatePreferences(
		accessToken: string,
		payload: UpdateNotificationPreferencesDto,
	) {
		const userId = await this.getUserId(accessToken);
		return this.database.notificationPreference.upsert({
			where: { userId },
			create: { userId, ...DEFAULT_NOTIFICATION_PREFERENCES, ...payload },
			update: { ...payload },
		});
	}

	async createNotification(
		userId: string,
		payload: {
			type: NotificationType;
			title: string;
			description?: string | null;
			icon?: string | null;
		},
	) {
		return this.database.notification.create({
			data: {
				userId,
				type: payload.type,
				title: payload.title,
				description: payload.description ?? null,
				icon: payload.icon ?? null,
			},
		});
	}

	async getOrCreatePreferences(userId: string) {
		const existing = await this.database.notificationPreference.findUnique({
			where: { userId },
		});

		if (existing) {
			return existing;
		}

		return this.database.notificationPreference.create({
			data: { userId, ...DEFAULT_NOTIFICATION_PREFERENCES },
		});
	}

	async findUsersWithNotificationPreferences(): Promise<
		Array<
			User & {
				profile: Profile | null;
				notificationPreference: NotificationPreference | null;
			}
		>
	> {
		return this.database.user.findMany({
			include: {
				profile: true,
				notificationPreference: true,
			},
		});
	}

	async getActiveNotificationsForUser(userId: string) {
		return this.database.notification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
	}

	async getUnreadCount(userId: string) {
		return this.database.notification.count({
			where: { userId, isRead: false },
		});
	}
}
