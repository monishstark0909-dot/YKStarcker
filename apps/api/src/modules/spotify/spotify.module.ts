/** @format */

import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SpotifyController } from "./spotify.controller";
import { SpotifyService } from "./spotify.service";

@Module({
	imports: [AuthModule],
	controllers: [SpotifyController],
	providers: [SpotifyService],
})
export class SpotifyModule {}
