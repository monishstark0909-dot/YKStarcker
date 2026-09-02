/** @format */
import { z } from "zod";

export const RecommendationResponseSchema = z.object({
	summary: z.string(),
	recommendations: z.array(z.string()).min(1),
	prioritySubjects: z.array(z.string()).optional().default([]),
	revisionReminder: z.string().optional().default(""),
	motivation: z.string().optional().default(""),
	nextAction: z.string().optional().default(""),
});

export const WeeklySummaryResponseSchema = z.object({
	summary: z.string(),
	weeklyStats: z.record(z.string(), z.any()).optional().default({}),
	strengths: z.array(z.string()).optional().default([]),
	improvements: z.array(z.string()).optional().default([]),
	nextWeekFocus: z.string().optional().default(""),
});

export const ChatResponseSchema = z.object({
	content: z.string(),
	model: z.string(),
	usage: z
		.object({
			inputTokens: z.number().nonnegative(),
			outputTokens: z.number().nonnegative(),
			totalTokens: z.number().nonnegative().optional(),
		})
		.optional(),
});

export type RecommendationResponse = z.infer<
	typeof RecommendationResponseSchema
>;
export type WeeklySummaryResponse = z.infer<typeof WeeklySummaryResponseSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
