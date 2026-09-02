/** @format */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { CurriculumModule } from "./modules/curriculum/curriculum.module";
import { StudySessionsModule } from "./modules/study-sessions/study-sessions.module";
import { QuestionLogsModule } from "./modules/question-logs/question-logs.module";
import { WrongQuestionsModule } from "./modules/wrong-questions/wrong-questions.module";
import { PlannerModule } from "./modules/planner/planner.module";
import { GoalsModule } from "./modules/goals/goals.module";
import { MockExamsModule } from "./modules/mock-exams/mock-exams.module";
import { AnalyticsFoundationModule } from "./modules/analytics-foundation/analytics-foundation.module";
import { StudyGroupModule } from "./modules/study-group/study-group.module";
import { SpotifyModule } from "./modules/spotify/spotify.module";
import { AIModule } from "./modules/ai/ai.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		HealthModule,
		AuthModule,
		UsersModule,
		OnboardingModule,
		CurriculumModule,
		StudySessionsModule,
		QuestionLogsModule,
		WrongQuestionsModule,
		PlannerModule,
		GoalsModule,
		MockExamsModule,
		AnalyticsFoundationModule,
		StudyGroupModule,
		SpotifyModule,
		AIModule,
		NotificationsModule,
	],
})
export class AppModule {}
