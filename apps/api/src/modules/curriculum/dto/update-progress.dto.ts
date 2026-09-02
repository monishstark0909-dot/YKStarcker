/** @format */

import { IsOptional, IsEnum, IsInt, Min, Max, IsString, IsBoolean } from "class-validator";
import { ProgressStatus, DifficultyLevel } from "@prisma/client";

export class UpdateProgressDto {
	@IsOptional()
	@IsEnum(ProgressStatus)
	status?: ProgressStatus;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(5)
	confidence?: number;

	@IsOptional()
	@IsString()
	notes?: string;

	@IsOptional()
	@IsBoolean()
	isBookmarked?: boolean;

	@IsOptional()
	@IsBoolean()
	flaggedRevision?: boolean;

	@IsOptional()
	@IsEnum(DifficultyLevel)
	difficulty?: DifficultyLevel;
}
