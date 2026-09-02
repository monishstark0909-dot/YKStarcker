/** @format */

import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import type { Request } from "express";
import { OnboardingService } from "./onboarding.service";
import { SaveOnboardingDto } from "./dto/save-onboarding.dto";

@Controller("onboarding")
export class OnboardingController {
	constructor(private readonly onboardingService: OnboardingService) {}

	@Get()
	getOnboarding(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.onboardingService.getOnboarding(accessToken ?? "");
	}

	@Put()
	saveOnboarding(
		@Body() payload: SaveOnboardingDto,
		@Req() request: Request,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.onboardingService.saveOnboarding(accessToken ?? "", payload);
	}
}
