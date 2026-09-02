import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { AnalyticsFoundationService } from "./analytics-foundation.service";

@Controller("analytics")
export class AnalyticsFoundationController {
	constructor(private readonly analyticsFoundationService: AnalyticsFoundationService) {}

	@Get("foundation")
	getAnalyticsFoundation(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.analyticsFoundationService.getAnalyticsFoundation(accessToken ?? "");
	}
}
