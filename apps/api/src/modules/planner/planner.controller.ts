import { Controller, Get, Post, Put, Delete, Req, Body, Param } from "@nestjs/common";
import type { Request } from "express";
import { PlannerService } from "./planner.service";
import { CreateStudyTaskDto } from "./dto/create-study-task.dto";
import { UpdateStudyTaskDto } from "./dto/update-study-task.dto";
import { CreateRevisionTaskDto } from "./dto/create-revision-task.dto";
import { UpdateRevisionTaskDto } from "./dto/update-revision-task.dto";

@Controller("planner")
export class PlannerController {
	constructor(private readonly plannerService: PlannerService) {}

	@Get()
	getPlanner(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.getPlanner(accessToken ?? "");
	}

	@Get("today")
	getTodayTasks(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.getTodayTasks(accessToken ?? "");
	}

	@Get("week")
	getWeekTasks(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.getWeekTasks(accessToken ?? "");
	}

	@Get("month")
	getMonthTasks(@Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.getMonthTasks(accessToken ?? "");
	}

	// Study Tasks
	@Post("study-task")
	createStudyTask(@Body() payload: CreateStudyTaskDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.createStudyTask(accessToken ?? "", payload);
	}

	@Put("study-task/:id")
	updateStudyTask(
		@Param("id") id: string,
		@Body() payload: UpdateStudyTaskDto,
		@Req() request: Request,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.updateStudyTask(accessToken ?? "", id, payload);
	}

	@Delete("study-task/:id")
	deleteStudyTask(@Param("id") id: string, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.deleteStudyTask(accessToken ?? "", id);
	}

	// Revision Tasks
	@Post("revision-task")
	createRevisionTask(@Body() payload: CreateRevisionTaskDto, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.createRevisionTask(accessToken ?? "", payload);
	}

	@Put("revision-task/:id")
	updateRevisionTask(
		@Param("id") id: string,
		@Body() payload: UpdateRevisionTaskDto,
		@Req() request: Request,
	) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.updateRevisionTask(accessToken ?? "", id, payload);
	}

	@Delete("revision-task/:id")
	deleteRevisionTask(@Param("id") id: string, @Req() request: Request) {
		const accessToken = request.cookies?.yks_access_token as string | undefined;
		return this.plannerService.deleteRevisionTask(accessToken ?? "", id);
	}
}
