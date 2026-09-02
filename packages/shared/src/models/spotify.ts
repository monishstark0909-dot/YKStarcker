/** @format */

export interface SpotifyConnectionStatus {
	connected: boolean;
	spotifyUserId?: string;
	displayName?: string;
	expiresAt?: string;
}

export interface SpotifyPlaylist {
	id: string;
	title: string;
	description: string;
	totalTracks: number;
	externalUrl: string;
}
