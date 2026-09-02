/** @format */

export function isRetryableStatus(status: number): boolean {
	return status === 429 || status === 503;
}

export function isNetworkError(error: unknown): boolean {
	if (!error || typeof error !== "object") {
		return false;
	}

	const knownNetworkMessages = [
		"Failed to fetch",
		"networkerror",
		"fetch failed",
		"request to",
		"ECONNRESET",
		"EAI_AGAIN",
		"ENOTFOUND",
	];

	const message = (error as { message?: string }).message?.toLowerCase() || "";
	return knownNetworkMessages.some((marker) => message.includes(marker));
}
