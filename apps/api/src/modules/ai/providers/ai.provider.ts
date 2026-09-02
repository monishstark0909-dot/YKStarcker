/** @format */

/**
 * AI Provider abstraction – allows swapping AI providers without changing service logic.
 */

export interface AIMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

export interface AIRequestContext {
	requestId?: string;
	operation?: "recommendation" | "weekly_summary" | "chat";
}

export interface AIResponse {
	content: string;
	model: string;
	usage?: {
		inputTokens: number;
		outputTokens: number;
		totalTokens?: number;
	};
}

export interface AIProvider {
	generateCompletion(
		messages: AIMessage[],
		context?: AIRequestContext,
	): Promise<AIResponse>;
	healthCheck(): Promise<boolean>;
}
