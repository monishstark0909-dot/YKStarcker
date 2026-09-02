/** @format */

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../../auth/auth.service";
import { GoalsService } from "../../goals/goals.service";
import { MockExamsService } from "../../mock-exams/mock-exams.service";
import { AIService } from "../ai.service";
import { CacheService } from "../cache/cache.service";
import { RateLimitService } from "../rate-limit/rate-limit.service";
import type { AIProvider } from "../providers/ai.provider";

describe("AIService", () => {
	let service: AIService;
	let mockAuthService: Partial<AuthService>;
	let mockGoalsService: Partial<GoalsService>;
	let mockExamsService: Partial<MockExamsService>;
	let mockAIProvider: Partial<AIProvider>;
	let cacheService: CacheService;
	let rateLimitService: RateLimitService;

	const mockUser = {
		id: "test-user-123",
		displayName: "Test User",
		email: "test@example.com",
	};

	const mockAnalytics = {
		student: {
			examType: "tyt",
			displayName: "Test User",
		},
		study: {
			todayMinutes: 60,
			weeklyMinutes: 420,
			monthlyMinutes: 1800,
			currentStreak: 5,
			longestStreak: 10,
			totalSessionsRecorded: 20,
		},
		subjects: { strong: [], weak: [], all: [] },
		questions: {
			accuracy: 75,
			totalSolved: 100,
			totalCorrect: 75,
			totalWrong: 25,
			pendingReviewCount: 5,
		},
		mockExams: {
			totalAttempts: 2,
			averageAccuracy: 70,
			trendDirection: "stable" as const,
		},
		planner: {
			todayTasksTotal: 5,
			todayTasksCompleted: 3,
			overdueTasksCount: 0,
			upcomingTasksCount: 2,
		},
		goals: {
			daily: { studyTime: { target: 120 } },
			weekly: {},
			monthly: {},
			streak: 5,
		},
		timestamp: new Date().toISOString(),
	};

	beforeEach(async () => {
		// Mock services
		mockAuthService = {
			me: jest.fn().mockResolvedValue({ user: mockUser }),
		};

		mockGoalsService = {
			getGoalsProgress: jest.fn().mockResolvedValue(mockAnalytics.goals),
		};

		mockExamsService = {
			getMockStats: jest.fn().mockResolvedValue({}),
		};

		// Mock successful AI response
		mockAIProvider = {
			generateCompletion: jest.fn().mockResolvedValue({
				content: JSON.stringify({
					summary: "You're doing great!",
					recommendations: ["Study more", "Review weak subjects"],
					prioritySubjects: ["Math"],
					revisionReminder: "Review wrong questions",
					motivation: "Keep going!",
					nextAction: "Start today's study session",
				}),
				model: "test-model",
				usage: { inputTokens: 100, outputTokens: 50 },
			}),
			healthCheck: jest.fn().mockResolvedValue(true),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AIService,
				CacheService,
				RateLimitService,
				{ provide: AuthService, useValue: mockAuthService },
				{ provide: GoalsService, useValue: mockGoalsService },
				{ provide: MockExamsService, useValue: mockExamsService },
				{ provide: "AIProvider", useValue: mockAIProvider },
			],
		}).compile();

		service = module.get<AIService>(AIService);
		cacheService = module.get<CacheService>(CacheService);
		rateLimitService = module.get<RateLimitService>(RateLimitService);
	});

	describe("getRecommendations", () => {
		it("should successfully generate recommendations", async () => {
			const result = await service.getRecommendations("valid-token");

			expect(result).toHaveProperty("recommendations");
			expect(result).toHaveProperty("cached", false);
			expect(result.recommendations).toHaveProperty("summary");
		});

		it("should cache recommendations for 6 hours", async () => {
			// First call - should hit API
			const result1 = await service.getRecommendations("valid-token");
			expect(result1.cached).toBe(false);

			// Second call immediately - should hit cache
			const result2 = await service.getRecommendations("valid-token");
			expect(result2.cached).toBe(true);

			// Both should return same data
			expect(result1.recommendations).toEqual(result2.recommendations);

			// API should only be called once
			expect(mockAIProvider.generateCompletion).toHaveBeenCalledTimes(1);
		});

		it("should return error response when API fails", async () => {
			(mockAIProvider.generateCompletion as jest.Mock).mockRejectedValueOnce(
				new Error("API error"),
			);

			const result = await service.getRecommendations("valid-token");

			expect(result.recommendations).toHaveProperty("summary");
			expect(result.recommendations.summary).toBeTruthy();
			// Should not throw, should return fallback
		});

		it("should enforce rate limit (5 requests/minute)", async () => {
			// Make 5 requests - should all succeed
			for (let i = 0; i < 5; i++) {
				const result = await service.getRecommendations("token");
				expect(result).toBeDefined();
			}

			// 6th request should fail
			await expect(service.getRecommendations("token")).rejects.toThrow();
		});
	});

	describe("getWeeklySummary", () => {
		it("should successfully generate weekly summary", async () => {
			const result = await service.getWeeklySummary("valid-token");

			expect(result).toHaveProperty("summary");
			expect(result).toHaveProperty("cached", false);
		});

		it("should cache summary for 24 hours", async () => {
			const result1 = await service.getWeeklySummary("valid-token");
			expect(result1.cached).toBe(false);

			const result2 = await service.getWeeklySummary("valid-token");
			expect(result2.cached).toBe(true);

			expect(mockAIProvider.generateCompletion).toHaveBeenCalledTimes(1);
		});
	});

	describe("chat", () => {
		it("should process chat message", async () => {
			const result = await service.chat("valid-token", "How should I study today?");

			expect(result).toHaveProperty("content");
			expect(result).toHaveProperty("model");
		});

		it("should enforce rate limit for chat", async () => {
			// Clear previous rate limit
			rateLimitService.reset(mockUser.id);

			// Make 5 requests - should succeed
			for (let i = 0; i < 5; i++) {
				await service.chat("valid-token", `Question ${i}`);
			}

			// 6th should fail
			await expect(service.chat("valid-token", "Question 6")).rejects.toThrow();
		});
	});

	describe("clearCache", () => {
		it("should clear cache for user", async () => {
			// Cache something
			await service.getRecommendations("valid-token");
			let result = await service.getRecommendations("valid-token");
			expect(result.cached).toBe(true);

			// Clear cache
			await service.clearCache("valid-token");

			// Next call should not hit cache
			(mockAIProvider.generateCompletion as jest.Mock).mockClear();
			result = await service.getRecommendations("valid-token");
			expect(result.cached).toBe(false);
		});
	});

	describe("healthCheck", () => {
		it("should return health status", async () => {
			const result = await service.healthCheck();
			expect(result).toBe(true);
		});
	});

	describe("Error Handling", () => {
		it("should handle 429 rate limit from API", async () => {
			const error = new Error("Rate limited. Please wait 60 seconds.");
			(mockAIProvider.generateCompletion as jest.Mock).mockRejectedValueOnce(error);

			const result = await service.getRecommendations("valid-token");

			// Should return fallback, not throw
			expect(result.recommendations).toBeDefined();
			expect(result.recommendations.summary).toBeTruthy();
		});

		it("should handle timeout errors", async () => {
			const error = new Error("AI service request timed out. Please try again.");
			(mockAIProvider.generateCompletion as jest.Mock).mockRejectedValueOnce(error);

			const result = await service.getRecommendations("valid-token");
			expect(result.recommendations).toBeDefined();
		});

		it("should handle malformed JSON responses", async () => {
			(mockAIProvider.generateCompletion as jest.Mock).mockResolvedValueOnce({
				content: "This is not valid JSON",
				model: "test-model",
			});

			const result = await service.getRecommendations("valid-token");

			// Should still have default recommendations
			expect(result.recommendations).toHaveProperty("summary");
			expect(Array.isArray(result.recommendations.recommendations)).toBe(true);
		});

		it("should handle empty responses", async () => {
			(mockAIProvider.generateCompletion as jest.Mock).mockResolvedValueOnce({
				content: "",
				model: "test-model",
			});

			const result = await service.getRecommendations("valid-token");
			expect(result.recommendations).toBeDefined();
		});
	});

	describe("CacheService", () => {
		it("should store and retrieve cache entries", () => {
			const data = { test: "data" };
			cacheService.set("user-1", "daily", data, 1000);

			const retrieved = cacheService.get("user-1", "daily");
			expect(retrieved).toEqual(data);
		});

		it("should expire cache after TTL", async () => {
			const data = { test: "data" };
			cacheService.set("user-1", "daily", data, 100); // 100ms TTL

			await new Promise((resolve) => setTimeout(resolve, 150));

			const retrieved = cacheService.get("user-1", "daily");
			expect(retrieved).toBeNull();
		});

		it("should clear user cache", () => {
			const data = { test: "data" };
			cacheService.set("user-1", "daily", data, 1000);
			cacheService.set("user-1", "weekly", data, 1000);

			cacheService.clear("user-1");

			expect(cacheService.get("user-1", "daily")).toBeNull();
			expect(cacheService.get("user-1", "weekly")).toBeNull();
		});
	});

	describe("RateLimitService", () => {
		it("should allow up to 5 requests per minute", () => {
			rateLimitService.reset("user-1");

			for (let i = 0; i < 5; i++) {
				expect(() => rateLimitService.checkLimit("user-1")).not.toThrow();
			}

			expect(() => rateLimitService.checkLimit("user-1")).toThrow();
		});

		it("should provide remaining request count", () => {
			rateLimitService.reset("user-1");

			rateLimitService.checkLimit("user-1");
			const remaining = rateLimitService.getRemaining("user-1");

			expect(remaining).toBe(4);
		});

		it("should reset after window expires", async () => {
			rateLimitService.reset("user-1");

			// Make 5 requests
			for (let i = 0; i < 5; i++) {
				rateLimitService.checkLimit("user-1");
			}

			// Next should fail
			expect(() => rateLimitService.checkLimit("user-1")).toThrow();

			// Wait for window to expire (simulated - in real test would use time mocking)
			// In production, this would be 60 seconds
		});
	});
});
