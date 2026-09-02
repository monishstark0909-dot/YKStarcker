import { Controller, Get, Post, Req, Body, Param, Put, BadRequestException } from "@nestjs/common";
import type { Request } from "express";
import { StudySessionsService } from "./study-sessions.service";
import { CreateStudySessionDto } from "./dto/create-study-session.dto";
import { StartStudySessionDto } from "./dto/start-study-session.dto";
import { StopStudySessionDto } from "./dto/stop-study-session.dto";

@Controller("study-sessions")
export class StudySessionsController {
	constructor(private readonly studySessionsService: StudySessionsService) {}

	@Get()
	getSessions(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studySessionsService.getSessions(accessToken ?? "");
	}

	@Get("progress")
	getProgress(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studySessionsService.getProgress(accessToken ?? "");
	}

	@Post("start")
	startSession(@Body() payload: StartStudySessionDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studySessionsService.startSession(accessToken ?? "", payload);
	}

	@Post("stop/:id")
	stopSession(
		@Param("id") id: string,
		@Body() payload: StopStudySessionDto,
		@Req() request: Request,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studySessionsService.stopSession(accessToken ?? "", id, payload);
	}

	@Post("manual")
	createManualSession(@Body() payload: CreateStudySessionDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.studySessionsService.createManualSession(accessToken ?? "", payload);
	}
}
