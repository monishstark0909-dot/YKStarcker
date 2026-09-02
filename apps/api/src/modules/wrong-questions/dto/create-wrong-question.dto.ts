import { IsOptional, IsString, IsIn } from "class-validator";

const difficultyLevels = ["easy", "medium", "hard"] as const;

export class CreateWrongQuestionDto {
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
	reason!: string;

	@IsOptional()
	@IsIn(difficultyLevels)
	difficulty?: (typeof difficultyLevels)[number];

	@IsOptional()
	@IsString()
	imageUrl?: string;

	@IsOptional()
	@IsString()
	reviewDate?: string;
}
