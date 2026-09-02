/** @format */

import type { SpotifyConnectionStatus, SpotifyPlaylist } from "@yks/shared";
import { getApiBaseUrl } from "./api-config";

async function requestJson<TResponse>(path: string, method = "GET") {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}${path}`, {
		method,
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error(`Spotify API request failed (${response.status})`);
	}

	return response.json() as Promise<TResponse>;
}

export async function getSpotifyStatus() {
	return requestJson<SpotifyConnectionStatus>("/api/spotify/status");
}

export async function getSpotifyPlaylists() {
	return requestJson<{ playlists: SpotifyPlaylist[] }>(
		"/api/spotify/playlists",
	);
}

export async function disconnectSpotify() {
	return requestJson<{ success: true }>("/api/spotify/disconnect", "POST");
}

export function getSpotifyConnectUrl() {
	const baseUrl = getApiBaseUrl();
	return `${baseUrl}/api/spotify/connect`;
}

export const spotifyConnectUrl = `/api/spotify/connect`;
