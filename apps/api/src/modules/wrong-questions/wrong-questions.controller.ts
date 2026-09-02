import { Controller, Get, Post, Put, Req, Body, Query, Param } from "@nestjs/common";
import type { Request } from "express";
import { WrongQuestionsService } from "./wrong-questions.service";
import { CreateWrongQuestionDto } from "./dto/create-wrong-question.dto";
import { UpdateWrongQuestionStatusDto } from "./dto/update-wrong-question-status.dto";

@Controller("wrong-questions")
export class WrongQuestionsController {
	constructor(private readonly wrongQuestionsService: WrongQuestionsService) {}

	@Get()
	getWrongQuestions(@Query("status") status: string | undefined, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.wrongQuestionsService.getWrongQuestions(accessToken ?? "", status);
	}

	@Get("queue")
	getRevisionQueue(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.wrongQuestionsService.getRevisionQueue(accessToken ?? "");
	}

	@Post()
	createWrongQuestion(@Body() payload: CreateWrongQuestionDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.wrongQuestionsService.createWrongQuestion(accessToken ?? "", payload);
	}

	@Put(":id/status")
	updateStatus(
		@Param("id") id: string,
		@Body() payload: UpdateWrongQuestionStatusDto,
		@Req() request: Request,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.wrongQuestionsService.updateStatus(accessToken ?? "", id, payload);
	}
}
