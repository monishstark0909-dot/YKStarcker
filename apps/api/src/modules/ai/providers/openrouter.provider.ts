/** @format */

import { Injectable, Logger } from "@nestjs/common";
import type { AIMessage, AIResponse, AIProvider } from "./ai.provider";

@Injectable()
export class OpenRouterProvider implements AIProvider {
	private readonly logger = new Logger(OpenRouterProvider.name);
	private readonly apiKey = process.env.OPENROUTER_API_KEY;
	private readonly model =
		process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
	private readonly baseUrl = "https://openrouter.ai/api/v1";

	async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
		if (!this.apiKey) {
			this.logger.error("OPENROUTER_API_KEY is not set");
			throw new Error("OpenRouter API key missing. Please set OPENROUTER_API_KEY in .env");
		}

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30_000);

			this.logger.log(`Sending request to OpenRouter using model: ${this.model}`);

			const response = await fetch(`${this.baseUrl}/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.apiKey}`,
					"HTTP-Referer": "https://yks-study-tracker.example.com",
					"X-Title": "YKS Study Tracker",
				},
				body: JSON.stringify({
					model: this.model,
					messages,
					temperature: 0.7,
					max_tokens: 1500,
				}),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMsg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
				this.logger.error(`OpenRouter API error: ${response.status}`, errorData);
				throw new Error(`OpenRouter error (${response.status}): ${errorMsg}`);
			}

			const data = await response.json();

			if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
				this.logger.error("Invalid response structure from OpenRouter", data);
				throw new Error("Invalid response format received from OpenRouter API.");
			}

			const content = data.choices[0]?.message?.content;
			if (!content || typeof content !== "string" || content.trim().length === 0) {
				this.logger.error("Empty content in OpenRouter response", data.choices[0]);
				throw new Error("Received empty completion text from OpenRouter API.");
			}

			return {
				content: content.trim(),
				model: this.model,
				usage: {
					inputTokens: data.usage?.prompt_tokens || 0,
					outputTokens: data.usage?.completion_tokens || 0,
				},
			};
		} catch (error: any) {
			const message = error.message || "Unknown error during OpenRouter completion";
			this.logger.error("OpenRouter request failed:", message);
			throw error;
		}
	}

	async healthCheck(): Promise<boolean> {
		if (!this.apiKey) return false;
		try {
			const response = await fetch(`${this.baseUrl}/models`, {
				headers: { Authorization: `Bearer ${this.apiKey}` },
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}
