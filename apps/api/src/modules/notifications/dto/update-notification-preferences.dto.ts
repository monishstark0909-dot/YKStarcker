/** @format */

import { IsBoolean, IsOptional, IsString, Matches } from "class-validator";

export class UpdateNotificationPreferencesDto {
	@IsOptional()
	@IsBoolean()
	dailyReminders?: boolean;

	@IsOptional()
	@IsBoolean()
	revisionReminders?: boolean;

	@IsOptional()
	@IsBoolean()
	plannerReminders?: boolean;

	@IsOptional()
	@IsBoolean()
	mockReminders?: boolean;

	@IsOptional()
	@IsBoolean()
	weeklySummary?: boolean;

	@IsOptional()
	@IsBoolean()
	streakReminders?: boolean;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
	dailyReminderTime?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
	revisionReminderTime?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
	plannerReminderTime?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
	mockReminderTime?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
	weeklySummaryTime?: string;

	@IsOptional()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
	streakReminderTime?: string;
}
