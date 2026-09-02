/** @format */

import { Module } from "@nestjs/common";
import { AIService } from "./ai.service";
import { AIController } from "./ai.controller";
import { OpenRouterProvider } from "./providers/openrouter.provider";
import { MemoryCacheProvider } from "./cache/memory-cache.provider";
import { MemoryRateLimiter } from "./rate-limit/memory-rate-limiter.provider";
import { AuthModule } from "../auth/auth.module";
import { GoalsModule } from "../goals/goals.module";
import { MockExamsModule } from "../mock-exams/mock-exams.module";
import {
	AI_PROVIDER_TOKEN,
	AI_CACHE_PROVIDER,
	AI_RATE_LIMITER,
} from "./ai.constants";

@Module({
	imports: [AuthModule, GoalsModule, MockExamsModule],
	providers: [
		OpenRouterProvider,
		{
			provide: AI_PROVIDER_TOKEN,
			useClass: OpenRouterProvider,
		},
		{
			provide: AI_CACHE_PROVIDER,
			useClass: MemoryCacheProvider,
		},
		{
			provide: AI_RATE_LIMITER,
			useClass: MemoryRateLimiter,
		},
		AIService,
	],
	controllers: [AIController],
	exports: [AIService],
})
export class AIModule {}
