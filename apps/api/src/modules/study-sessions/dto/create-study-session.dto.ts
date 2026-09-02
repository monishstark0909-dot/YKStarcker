import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateStudySessionDto {
	@IsOptional()
	@IsString()
	subjectId?: string;

	@IsOptional()
	@IsString()
	topicId?: string;

	@IsOptional()
	@IsString()
	subtopicId?: string;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	durationMinutes!: number;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsOptional()
	@IsString()
	startedAt?: string;
}
