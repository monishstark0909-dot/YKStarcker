import { Controller, Get, Post, Req, Body } from "@nestjs/common";
import type { Request } from "express";
import { MockExamsService } from "./mock-exams.service";
import { CreateMockExamDto } from "./dto/create-mock-exam.dto";

@Controller("mock-exams")
export class MockExamsController {
	constructor(private readonly mockExamsService: MockExamsService) {}

	@Get()
	getMockExams(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.mockExamsService.getMockExams(accessToken ?? "");
	}

	@Post()
	createMockExam(@Body() payload: CreateMockExamDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.mockExamsService.createMockExam(accessToken ?? "", payload);
	}

	@Get("stats")
	getMockStats(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.mockExamsService.getMockStats(accessToken ?? "");
	}
}
