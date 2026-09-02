/** @format */

import { Controller, Get, Param, Req } from "@nestjs/common";
import type { Request } from "express";
import { StudyGroupService } from "./study-group.service";

@Controller("study-group")
export class StudyGroupController {
	constructor(private readonly studyGroupService: StudyGroupService) {}

	@Get("members")
	getMembers(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studyGroupService.getMembers(accessToken ?? "");
	}

	@Get("members/:id")
	getMember(@Param("id") id: string, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studyGroupService.getMember(accessToken ?? "", id);
	}

	@Get("leaderboard")
	getLeaderboard(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studyGroupService.getLeaderboard(accessToken ?? "");
	}
}
