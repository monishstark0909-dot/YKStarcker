/** @format */

export const AI_PROVIDER_TOKEN = "AIProvider";
export const AI_CACHE_PROVIDER = "AI_CACHE_PROVIDER";
export const AI_RATE_LIMITER = "AI_RATE_LIMITER";

export const DEFAULT_OPENROUTER_MODEL =
	"nvidia/nemotron-3-ultra-550b-a55b:free";
export const DEFAULT_OPENROUTER_TIMEOUT_MS = 20_000;
export const DEFAULT_OPENROUTER_MAX_RETRIES = 2;
export const DEFAULT_OPENROUTER_BACKOFF_MS = 500;
export const DEFAULT_OPENROUTER_CIRCUIT_FAILURE_THRESHOLD = 3;
export const DEFAULT_OPENROUTER_CIRCUIT_COOLDOWN_MS = 60_000;

export const DEFAULT_AI_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
export const DEFAULT_AI_WEEKLY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const DEFAULT_AI_RATE_LIMIT = 5;
export const DEFAULT_AI_RATE_WINDOW_MS = 60_000; // 1 minute
