import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min, IsIn } from "class-validator";

const difficultyLevels = ["easy", "medium", "hard"] as const;

export class CreateQuestionLogDto {
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
	questionsSolved!: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	correct!: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	wrong!: number;

	@IsOptional()
	@IsIn(difficultyLevels)
	difficulty?: (typeof difficultyLevels)[number];

	@IsOptional()
	@IsString()
	notes?: string;
}
