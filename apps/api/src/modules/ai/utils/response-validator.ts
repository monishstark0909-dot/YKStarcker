/** @format */

import { Logger } from "@nestjs/common";

export interface AIRecommendationResponse {
	summary: string;
	recommendations: string[];
	prioritySubjects: string[];
	revisionReminder: string;
	motivation: string;
	nextAction: string;
}

export interface AISummaryResponse {
	summary: string;
	weeklyStats: Record<string, any>;
	strengths: string[];
	improvements: string[];
	nextWeekFocus: string;
}

const logger = new Logger("AIResponseValidator");

/**
 * Safe default recommendations when AI fails.
 */
export const DEFAULT_RECOMMENDATIONS: AIRecommendationResponse = {
	summary: "Keep studying consistently!",
	recommendations: [
		"Review your weak subjects today",
		"Solve at least 50 practice questions",
		"Spend time on revision queue",
		"Maintain your study streak",
	],
	prioritySubjects: [],
	revisionReminder: "Don't skip wrong question reviews",
	motivation: "Every question you solve brings you closer to success. Stay committed!",
	nextAction: "Check your planner for today's tasks",
};

export const DEFAULT_SUMMARY: AISummaryResponse = {
	summary: "You're making steady progress on your YKS journey!",
	weeklyStats: {},
	strengths: ["Consistent study effort"],
	improvements: ["Review more weak subjects"],
	nextWeekFocus: "Consolidate weak areas",
};

/**
 * Parse AI JSON response with fallback to defaults.
 */
export function parseRecommendationResponse(rawContent: string): AIRecommendationResponse {
	try {
		// Extract JSON from response (might have markdown wrapping or extra text)
		const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			logger.warn("No JSON found in AI response. Using defaults.");
			return DEFAULT_RECOMMENDATIONS;
		}

		const parsed = JSON.parse(jsonMatch[0]);

		// Validate required fields
		if (typeof parsed.summary !== "string") {
			logger.warn("Missing or invalid 'summary' field");
			parsed.summary = DEFAULT_RECOMMENDATIONS.summary;
		}

		if (!Array.isArray(parsed.recommendations)) {
			logger.warn("Missing or invalid 'recommendations' field");
			parsed.recommendations = DEFAULT_RECOMMENDATIONS.recommendations;
		}

		// Ensure arrays have content
		parsed.recommendations = parsed.recommendations.filter((r: any) => typeof r === "string").slice(0, 10);
		parsed.prioritySubjects = (parsed.prioritySubjects || []).filter((s: any) => typeof s === "string").slice(0, 5);

		if (typeof parsed.revisionReminder !== "string") {
			parsed.revisionReminder = DEFAULT_RECOMMENDATIONS.revisionReminder;
		}

		if (typeof parsed.motivation !== "string") {
			parsed.motivation = DEFAULT_RECOMMENDATIONS.motivation;
		}

		if (typeof parsed.nextAction !== "string") {
			parsed.nextAction = DEFAULT_RECOMMENDATIONS.nextAction;
		}

		return parsed as AIRecommendationResponse;
	} catch (error: any) {
		logger.error("Failed to parse AI recommendation response:", error.message);
		return DEFAULT_RECOMMENDATIONS;
	}
}

/**
 * Parse AI summary response with fallback to defaults.
 */
export function parseSummaryResponse(rawContent: string): AISummaryResponse {
	try {
		const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			logger.warn("No JSON found in AI summary response. Using defaults.");
			return DEFAULT_SUMMARY;
		}

		const parsed = JSON.parse(jsonMatch[0]);

		if (typeof parsed.summary !== "string") {
			parsed.summary = DEFAULT_SUMMARY.summary;
		}

		if (!Array.isArray(parsed.strengths)) {
			parsed.strengths = [];
		}

		if (!Array.isArray(parsed.improvements)) {
			parsed.improvements = [];
		}

		if (typeof parsed.nextWeekFocus !== "string") {
			parsed.nextWeekFocus = DEFAULT_SUMMARY.nextWeekFocus;
		}

		return parsed as AISummaryResponse;
	} catch (error: any) {
		logger.error("Failed to parse AI summary response:", error.message);
		return DEFAULT_SUMMARY;
	}
}

/**
 * Build safe error response.
 */
export function buildErrorResponse(error: Error | string): AIRecommendationResponse {
	const errorMessage = typeof error === "string" ? error : error.message;

	logger.error("Building error response:", errorMessage);

	return {
		summary: "I'm having trouble generating insights right now.",
		recommendations: [
			"Continue your study session - consistency matters most",
			"Review your weak subjects from yesterday",
			"Solve some practice questions to stay on track",
		],
		prioritySubjects: [],
		revisionReminder: "Keep reviewing wrong questions - that's where real learning happens",
		motivation: "Even when I can't generate insights, your effort is what counts. Keep going!",
		nextAction: "Check your planner for today's study goals",
	};
}
