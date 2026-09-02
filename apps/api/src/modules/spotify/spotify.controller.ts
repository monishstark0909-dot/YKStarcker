/** @format */

import { Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { SpotifyService } from "./spotify.service";

@Controller("spotify")
export class SpotifyController {
	constructor(private readonly spotifyService: SpotifyService) {}

	@Get("connect")
	async connect(@Req() request: Request, @Res() response: Response) {
		return this.spotifyService.connect(request, response);
	}

	@Get("callback")
	async callback(
		@Req() request: Request,
		@Res() response: Response,
		@Query("code") code: string,
		@Query("state") state: string,
	) {
		return this.spotifyService.handleCallback(request, response, code, state);
	}

	@Get("status")
	getStatus(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.spotifyService.getStatus(accessToken ?? "");
	}

	@Get("playlists")
	getPlaylists(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.spotifyService.getPlaylists(accessToken ?? "");
	}

	@Post("disconnect")
	disconnect(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.spotifyService.disconnect(accessToken ?? "");
	}
}
