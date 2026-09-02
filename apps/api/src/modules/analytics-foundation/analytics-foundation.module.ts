import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GoalsModule } from "../goals/goals.module";
import { MockExamsModule } from "../mock-exams/mock-exams.module";
import { AnalyticsFoundationController } from "./analytics-foundation.controller";
import { AnalyticsFoundationService } from "./analytics-foundation.service";

@Module({
	imports: [AuthModule, GoalsModule, MockExamsModule],
	controllers: [AnalyticsFoundationController],
	providers: [AnalyticsFoundationService],
	exports: [AnalyticsFoundationService],
})
export class AnalyticsFoundationModule {}
