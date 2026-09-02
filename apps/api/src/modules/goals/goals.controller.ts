import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { GoalsService } from "./goals.service";

@Controller("goals")
export class GoalsController {
	constructor(private readonly goalsService: GoalsService) {}

	@Get()
	getGoalsProgress(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.goalsService.getGoalsProgress(accessToken ?? "");
	}
}
