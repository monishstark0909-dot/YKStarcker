/** @format */

import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import type { Request } from "express";
import { UsersService, type UpdateProfileDto } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get("me")
	getCurrentUser(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.usersService.getCurrentUser(accessToken ?? "");
	}

	@Put("profile")
	updateProfile(
		@Req() request: Request,
		@Body() payload: UpdateProfileDto,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.usersService.updateProfile(accessToken ?? "", payload);
	}
}
