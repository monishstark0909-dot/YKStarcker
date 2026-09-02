/** @format */

import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { StudyGroupController } from "./study-group.controller";
import { StudyGroupService } from "./study-group.service";

@Module({
	imports: [AuthModule],
	controllers: [StudyGroupController],
	providers: [StudyGroupService],
})
export class StudyGroupModule {}
