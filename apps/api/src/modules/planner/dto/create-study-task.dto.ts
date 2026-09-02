import { IsString, IsOptional, IsInt, Min, IsIn } from "class-validator";
import { Type } from "class-transformer";

export class CreateStudyTaskDto {
	@IsString()
	title!: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	subjectId?: string;

	@IsOptional()
	@IsString()
	topicId?: string;

	@IsOptional()
	@IsString()
	subtopicId?: string;

	@IsString()
	date!: string; // ISO Date string

	@IsOptional()
	@IsString()
	startTime?: string;

	@IsOptional()
	@IsString()
	endTime?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	estimatedDuration?: number;

	@IsOptional()
	@IsIn(["low", "medium", "high"])
	priority?: string;

	@IsOptional()
	@IsString()
	recurrence?: string;

	@IsOptional()
	@IsString()
	notes?: string;
}
