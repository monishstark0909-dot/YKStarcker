/** @format */

import { Controller, Get, Post, Param, Req, Body, NotFoundException, UnauthorizedException, BadRequestException, HttpException } from "@nestjs/common";
import type { Request } from "express";
import { CurriculumService } from "./curriculum.service";
import { UpdateProgressDto } from "./dto/update-progress.dto";

@Controller("curriculum")
export class CurriculumController {
	constructor(private readonly curriculumService: CurriculumService) {}

	@Get("hierarchy")
	getHierarchy() {
		return this.curriculumService.getHierarchy();
	}

	@Get("subjects")
	getSubjects() {
		return this.curriculumService.getSubjects();
	}

	@Get("topics/:subjectSlug")
	getTopics(@Param("subjectSlug") subjectSlug: string) {
		const topics = this.curriculumService.getTopics(subjectSlug);
		if (!topics || topics.length === 0) {
			throw new NotFoundException(`Subject with slug "${subjectSlug}" not found or has no topics.`);
		}
		return topics;
	}

	@Get("subtopics/:topicSlug")
	getSubtopics(@Param("topicSlug") topicSlug: string) {
		const subtopics = this.curriculumService.getSubtopics(topicSlug);
		if (!subtopics || subtopics.length === 0) {
			throw new NotFoundException(`Topic with slug "${topicSlug}" not found or has no subtopics.`);
		}
		return subtopics;
	}

	@Get("find/:slug")
	findEntity(@Param("slug") slug: string) {
		const entity = this.curriculumService.findBySlug(slug);
		if (!entity) {
			throw new NotFoundException(`Curriculum entity with slug "${slug}" not found.`);
		}
		return entity;
	}

	@Post("subtopics/:id/progress")
	async updateProgress(
		@Param("id") subtopicId: string,
		@Body() payload: UpdateProgressDto,
		@Req() request: Request,
	) {
		try {
			const accessToken = request.cookies?.yks_access_token as string | undefined;
			if (!accessToken) {
				throw new UnauthorizedException("Session token missing.");
			}
			return await this.curriculumService.updateProgress(accessToken, subtopicId, payload);
		} catch (error: any) {
			if (error instanceof HttpException) {
				throw error;
			}
			console.error("Error updating subtopic progress:", error);
			throw new BadRequestException(error.message || "Failed to update subtopic progress.");
		}
	}
}
