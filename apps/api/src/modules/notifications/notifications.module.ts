/** @format */

import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NotificationsScheduler } from "./notifications.scheduler";

@Module({
	imports: [AuthModule],
	controllers: [NotificationsController],
	providers: [NotificationsService, NotificationsScheduler],
	exports: [NotificationsService],
})
export class NotificationsModule {}
