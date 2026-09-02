/** @format */

import { Optional,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
 } from "@nestjs/common";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";

interface SpotifyTokenResponse {
	accessToken: string;
	refreshToken: string;
	expiresInSeconds: number;
}

interface SpotifyProfile {
	id: string;
	display_name: string | null;
}

interface SpotifyPlaylistItem {
	id: string;
	name: string;
	description: string | null;
	tracks: {
		total: number;
	};
	external_urls: {
		spotify: string;
	};
}

@Injectable()
export class SpotifyService {
	@Optional() private readonly database: PrismaClient = prisma;

	constructor(private readonly authService: AuthService) {}

	async connect(request: Request, response: Response) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}

		const origin = this.getWebOrigin(request);
		const clientId = process.env.SPOTIFY_CLIENT_ID;
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

		if (!clientId || !clientSecret) {
			// Redirect back to Spotify settings with user-friendly notice instead of crashing with 500 error
			const redirectUrl = new URL(`${origin}/settings/spotify`);
			redirectUrl.searchParams.set("spotify", "unconfigured");
			return response.redirect(redirectUrl.toString());
		}

		const state = randomBytes(16).toString("hex");
		const { redirectUri } = this.getSpotifyConfig();
		const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
		authorizeUrl.searchParams.set("client_id", clientId);
		authorizeUrl.searchParams.set("response_type", "code");
		authorizeUrl.searchParams.set("redirect_uri", redirectUri);
		authorizeUrl.searchParams.set(
			"scope",
			[
				"user-read-private",
				"playlist-read-private",
				"playlist-read-collaborative",
			].join(" "),
		);
		authorizeUrl.searchParams.set("state", state);
		authorizeUrl.searchParams.set("show_dialog", "true");

		response.cookie("spotify_oauth_state", state, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 5 * 60 * 1000,
		});

		return response.redirect(authorizeUrl.toString());
	}

	async handleCallback(
		request: Request,
		response: Response,
		code: string,
		state: string,
	) {
		const savedState = request.cookies?.spotify_oauth_state as
			| string
			| undefined;
		const origin = this.getWebOrigin(request);
		const redirectUrl = new URL(origin);
		redirectUrl.pathname = "/settings/spotify";

		if (!savedState || state !== savedState) {
			redirectUrl.searchParams.set("spotify", "error");
			return response.redirect(redirectUrl.toString());
		}

		if (!code) {
			redirectUrl.searchParams.set("spotify", "error");
			return response.redirect(redirectUrl.toString());
		}

		try {
			const accessToken = request.cookies?.yks_access_token as
				| string
				| undefined;
			if (!accessToken) {
				throw new UnauthorizedException("Access token cookie not found.");
			}

			const currentUser = await this.authService.me(accessToken);
			const tokenResponse = await this.exchangeAuthorizationCode(code);
			const spotifyProfile = await this.fetchSpotifyProfile(
				tokenResponse.accessToken,
			);

			await this.database.spotifyConnection.upsert({
				where: { userId: currentUser.user.id },
				create: {
					userId: currentUser.user.id,
					spotifyUserId: spotifyProfile.id,
					accessToken: tokenResponse.accessToken,
					refreshToken: tokenResponse.refreshToken,
					expiresAt: new Date(
						Date.now() + tokenResponse.expiresInSeconds * 1000,
					),
				},
				update: {
					spotifyUserId: spotifyProfile.id,
					accessToken: tokenResponse.accessToken,
					refreshToken: tokenResponse.refreshToken,
					expiresAt: new Date(
						Date.now() + tokenResponse.expiresInSeconds * 1000,
					),
				},
			});

			redirectUrl.searchParams.set("spotify", "connected");
			return response.redirect(redirectUrl.toString());
		} catch (error) {
			redirectUrl.searchParams.set("spotify", "error");
			return response.redirect(redirectUrl.toString());
		} finally {
			response.clearCookie("spotify_oauth_state", { path: "/" });
		}
	}

	async getStatus(accessToken: string) {
		const currentUser = await this.getCurrentUser(accessToken);

		const isConfigured = Boolean(
			process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
		);

		const connection = await this.getSpotifyConnectionForUser(
			currentUser.user.id,
			true,
		);
		if (!connection) {
			return { connected: false, configured: isConfigured };
		}

		try {
			const profile = await this.fetchSpotifyProfile(connection.accessToken);
			return {
				connected: true,
				configured: true,
				spotifyUserId: connection.spotifyUserId,
				displayName: profile.display_name ?? undefined,
				expiresAt: connection.expiresAt.toISOString(),
			};
		} catch {
			return { connected: false, configured: isConfigured };
		}
	}

	async getPlaylists(accessToken: string) {
		const currentUser = await this.getCurrentUser(accessToken);
		const connection = await this.getSpotifyConnectionForUser(
			currentUser.user.id,
			true,
		);
		if (!connection) {
			return { playlists: [] };
		}

		try {
			const response = await fetch(
				"https://api.spotify.com/v1/me/playlists?limit=20",
				{
					headers: {
						Authorization: `Bearer ${connection.accessToken}`,
					},
				},
			);

			if (!response.ok) {
				return { playlists: [] };
			}

			const data = (await response.json()) as {
				items: SpotifyPlaylistItem[];
			};

			const playlistCandidates = data.items ?? [];
			return {
				playlists: playlistCandidates.map((playlist) => ({
					id: playlist.id,
					title: playlist.name,
					description: playlist.description ?? "",
					totalTracks: playlist.tracks?.total ?? 0,
					externalUrl: playlist.external_urls?.spotify ?? `https://open.spotify.com/playlist/${playlist.id}`,
				})),
			};
		} catch {
			return { playlists: [] };
		}
	}

	async disconnect(accessToken: string) {
		const currentUser = await this.getCurrentUser(accessToken);
		await this.database.spotifyConnection.deleteMany({
			where: { userId: currentUser.user.id },
		});
		return { success: true };
	}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	private getSpotifyConfig() {
		const clientId = process.env.SPOTIFY_CLIENT_ID || "demo_spotify_client_id";
		const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "demo_spotify_client_secret";
		const redirectUri =
			process.env.SPOTIFY_REDIRECT_URI ??
			"http://localhost:4000/api/spotify/callback";
		return { clientId, clientSecret, redirectUri };
	}

	private async getSpotifyConnectionForUser(
		userId: string,
		refreshIfExpired: boolean,
	) {
		const connection = await this.database.spotifyConnection.findUnique({
			where: { userId },
		});
		if (!connection) {
			return null;
		}

		if (connection.expiresAt.getTime() > Date.now()) {
			return connection;
		}

		if (!refreshIfExpired) {
			return null;
		}

		try {
			return await this.refreshSpotifyConnection(connection);
		} catch {
			return null;
		}
	}

	private async refreshSpotifyConnection(connection: {
		id: string;
		refreshToken: string;
	}) {
		const { clientId, clientSecret } = this.getSpotifyConfig();
		const body = new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: connection.refreshToken,
		});

		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${clientId}:${clientSecret}`,
				).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body.toString(),
		});

		if (!response.ok) {
			throw new InternalServerErrorException(
				"Unable to refresh Spotify connection.",
			);
		}

		const data = (await response.json()) as {
			access_token: string;
			refresh_token?: string;
			expires_in: number;
		};

		if (!data.access_token) {
			throw new InternalServerErrorException(
				"Spotify refresh response is invalid.",
			);
		}

		return this.database.spotifyConnection.update({
			where: { id: connection.id },
			data: {
				accessToken: data.access_token,
				refreshToken: data.refresh_token ?? connection.refreshToken,
				expiresAt: new Date(Date.now() + data.expires_in * 1000),
			},
		});
	}

	private async exchangeAuthorizationCode(code: string) {
		const { clientId, clientSecret, redirectUri } = this.getSpotifyConfig();
		const body = new URLSearchParams({
			grant_type: "authorization_code",
			code,
			redirect_uri: redirectUri,
		});

		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${clientId}:${clientSecret}`,
				).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body.toString(),
		});

		if (!response.ok) {
			throw new InternalServerErrorException(
				"Spotify authorization exchange failed.",
			);
		}

		const data = (await response.json()) as {
			access_token?: string;
			refresh_token?: string;
			expires_in?: number;
		};

		if (!data.access_token || !data.refresh_token || !data.expires_in) {
			throw new InternalServerErrorException(
				"Spotify authorization response is missing data.",
			);
		}

		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresInSeconds: data.expires_in,
		};
	}

	private async fetchSpotifyProfile(accessToken: string) {
		const response = await fetch("https://api.spotify.com/v1/me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new InternalServerErrorException(
				"Unable to fetch Spotify profile.",
			);
		}

		return response.json() as Promise<SpotifyProfile>;
	}

	private getWebOrigin(request: Request) {
		return process.env.WEB_ORIGIN ?? `http://localhost:3000`;
	}
}
