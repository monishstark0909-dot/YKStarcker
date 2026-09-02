/** @format */

// Public fallback client ID for personal Spotify login
export const DEFAULT_PUBLIC_SPOTIFY_CLIENT_ID = "619ee66498ec4d8f99bfecf4d5ae2517";

const STORAGE_TOKEN_KEY = "yks_personal_spotify_access_token";
const STORAGE_VERIFIER_KEY = "yks_spotify_pkce_verifier";
const STORAGE_CLIENT_ID_KEY = "yks_personal_spotify_client_id";
const STORAGE_USER_PROFILE_KEY = "yks_personal_spotify_user_profile";

export interface PersonalSpotifyUser {
	id: string;
	displayName: string;
	email?: string;
	avatarUrl?: string;
}

export interface PersonalSpotifyPlaylist {
	id: string;
	title: string;
	description: string;
	totalTracks: number;
	externalUrl: string;
	embedUrl: string;
	coverUrl?: string;
}

export function getStoredSpotifyToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function setStoredSpotifyToken(token: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_TOKEN_KEY, token);
}

export function clearStoredSpotifyToken() {
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_TOKEN_KEY);
	localStorage.removeItem(STORAGE_USER_PROFILE_KEY);
}

export function getCustomClientId(): string {
	if (typeof window === "undefined") return DEFAULT_PUBLIC_SPOTIFY_CLIENT_ID;
	return localStorage.getItem(STORAGE_CLIENT_ID_KEY) || DEFAULT_PUBLIC_SPOTIFY_CLIENT_ID;
}

export function setCustomClientId(clientId: string) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_CLIENT_ID_KEY, clientId.trim());
}

// Generate random string for PKCE code verifier
function generateRandomString(length: number): string {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// Generate SHA-256 base64url challenge
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
	const data = new TextEncoder().encode(codeVerifier);
	const digest = await window.crypto.subtle.digest("SHA-256", data);
	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function getRedirectUri(): string {
	if (typeof window === "undefined") return "http://127.0.0.1:3000/settings/spotify";
	const origin = window.location.origin.replace("localhost", "127.0.0.1");
	return `${origin}/settings/spotify`;
}

/**
 * Initiates PKCE Spotify Authorization Flow (response_type=code)
 * Required by Spotify API guidelines.
 */
export async function initiatePersonalSpotifyLogin(customId?: string) {
	const clientId = customId || getCustomClientId();
	const redirectUri = getRedirectUri();
	const verifier = generateRandomString(64);
	localStorage.setItem(STORAGE_VERIFIER_KEY, verifier);

	const challenge = await generateCodeChallenge(verifier);
	const scopes = [
		"user-read-private",
		"user-read-email",
		"playlist-read-private",
		"playlist-read-collaborative",
		"user-top-read",
		"user-library-read",
	].join(" ");

	const authUrl = new URL("https://accounts.spotify.com/authorize");
	authUrl.searchParams.set("client_id", clientId);
	authUrl.searchParams.set("response_type", "code");
	authUrl.searchParams.set("redirect_uri", redirectUri);
	authUrl.searchParams.set("scope", scopes);
	authUrl.searchParams.set("code_challenge_method", "S256");
	authUrl.searchParams.set("code_challenge", challenge);
	authUrl.searchParams.set("show_dialog", "true");

	window.location.href = authUrl.toString();
}

/**
 * Parses authorization `code` from URL search query (?code=...) and exchanges it for access_token
 */
export async function handleSpotifyCallbackCode(): Promise<string | null> {
	if (typeof window === "undefined") return null;

	const searchParams = new URLSearchParams(window.location.search);
	const code = searchParams.get("code");
	const verifier = localStorage.getItem(STORAGE_VERIFIER_KEY);

	if (!code) return null;

	const clientId = getCustomClientId();
	const redirectUri = getRedirectUri();

	try {
		const body = new URLSearchParams({
			client_id: clientId,
			grant_type: "authorization_code",
			code,
			redirect_uri: redirectUri,
			code_verifier: verifier || "",
		});

		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: body.toString(),
		});

		// Clean URL query parameters
		window.history.replaceState(null, "", window.location.pathname);

		if (!response.ok) return null;

		const data = await response.json();
		if (data.access_token) {
			setStoredSpotifyToken(data.access_token);
			localStorage.removeItem(STORAGE_VERIFIER_KEY);
			return data.access_token;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Fetch current user profile from Spotify Web API
 */
export async function fetchPersonalSpotifyProfile(token?: string): Promise<PersonalSpotifyUser | null> {
	const authToken = token || getStoredSpotifyToken();
	if (!authToken) return null;

	try {
		const res = await fetch("https://api.spotify.com/v1/me", {
			headers: { Authorization: `Bearer ${authToken}` },
		});
		if (!res.ok) {
			if (res.status === 401) clearStoredSpotifyToken();
			return null;
		}
		const data = await res.json();
		const user: PersonalSpotifyUser = {
			id: data.id,
			displayName: data.display_name || data.id,
			email: data.email,
			avatarUrl: data.images?.[0]?.url,
		};
		localStorage.setItem(STORAGE_USER_PROFILE_KEY, JSON.stringify(user));
		return user;
	} catch {
		return null;
	}
}

export function parseSpotifyEmbedUrl(urlOrUri: string): { embedUrl: string; id: string } | null {
	try {
		let clean = urlOrUri.trim();
		if (!clean) return null;

		if (clean.startsWith("spotify:")) {
			const parts = clean.split(":");
			const type = parts[1];
			const id = parts[2];
			if (id) {
				return {
					id,
					embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
				};
			}
		}

		const parsed = new URL(clean);
		const pathParts = parsed.pathname.split("/").filter(Boolean);
		if (pathParts.length >= 2) {
			const type = pathParts[0];
			const id = pathParts[1];
			return {
				id,
				embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
			};
		}
	} catch {}
	return null;
}

/**
 * Resolve full song title and metadata from Spotify URL using Spotify's public OEmbed API
 */
export async function resolveFullSongMetadata(url: string): Promise<{ title: string; coverUrl?: string; embedUrl: string } | null> {
	try {
		const cleanUrl = url.trim();
		const parsed = parseSpotifyEmbedUrl(cleanUrl);
		if (!parsed) return null;

		const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
		let title = `Spotify Track (${parsed.id.substring(0, 6)}...)`;
		let coverUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80";

		if (oembedRes.ok) {
			const data = await oembedRes.json();
			if (data.title) title = data.title;
			if (data.thumbnail_url) coverUrl = data.thumbnail_url;
		}

		return {
			title,
			coverUrl,
			embedUrl: parsed.embedUrl,
		};
	} catch {
		const parsed = parseSpotifyEmbedUrl(url);
		if (!parsed) return null;
		return {
			title: "Custom Spotify Track",
			coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80",
			embedUrl: parsed.embedUrl,
		};
	}
}
