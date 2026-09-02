import { Controller, Get, Post, Req, Body } from "@nestjs/common";
import type { Request } from "express";
import { QuestionLogsService } from "./question-logs.service";
import { CreateQuestionLogDto } from "./dto/create-question-log.dto";

@Controller("question-logs")
export class QuestionLogsController {
	constructor(private readonly questionLogsService: QuestionLogsService) {}

	@Get()
	getQuestionLogs(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.questionLogsService.getQuestionLogs(accessToken ?? "");
	}

	@Post()
	createQuestionLog(@Body() payload: CreateQuestionLogDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.questionLogsService.createQuestionLog(accessToken ?? "", payload);
	}
}
