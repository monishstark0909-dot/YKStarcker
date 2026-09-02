import { IsOptional, IsString } from "class-validator";

export class StartStudySessionDto {
	@IsOptional()
	@IsString()
	subjectId?: string;

	@IsOptional()
	@IsString()
	topicId?: string;

	@IsOptional()
	@IsString()
	subtopicId?: string;
}
