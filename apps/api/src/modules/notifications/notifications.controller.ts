/** @format */

import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Req,
} from "@nestjs/common";
import type { Request } from "express";
import { NotificationsService } from "./notifications.service";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto";

@Controller("notifications")
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	getNotifications(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.notificationsService.getNotifications(accessToken ?? "");
	}

	@Patch(":id/read")
	markAsRead(@Req() request: Request, @Param("id") id: string) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.notificationsService.markAsRead(accessToken ?? "", id);
	}

	@Patch("/read-all")
	markAllAsRead(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.notificationsService.markAllAsRead(accessToken ?? "");
	}

	@Delete(":id")
	deleteNotification(@Req() request: Request, @Param("id") id: string) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.notificationsService.deleteNotification(accessToken ?? "", id);
	}

	@Get("preferences")
	getPreferences(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.notificationsService.getPreferences(accessToken ?? "");
	}

	@Patch("preferences")
	updatePreferences(
		@Req() request: Request,
		@Body() payload: UpdateNotificationPreferencesDto,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.notificationsService.updatePreferences(
			accessToken ?? "",
			payload,
		);
	}
}
