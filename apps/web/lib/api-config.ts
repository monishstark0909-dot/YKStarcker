/** @format */

export function getApiBaseUrl(): string {
	if (process.env.NEXT_PUBLIC_API_URL) {
		return process.env.NEXT_PUBLIC_API_URL;
	}
	if (typeof window !== "undefined") {
		// In the browser, return empty string for relative paths (/api/...)
		// This enables Next.js rewrite proxies to work on ngrok, custom domains, and local IPs
		return "";
	}
	// On server-side execution (SSR/RSC), connect directly to backend
	return "http://localhost:4000";
}
