/** @format */

import { Transform, Type } from "class-transformer";
import {
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Min,
	MinLength,
} from "class-validator";

const examTypes = ["tyt", "ayt", "ydt"] as const;

export class SaveOnboardingDto {
	@IsIn(examTypes)
	examType!: (typeof examTypes)[number];

	@IsString()
	@MinLength(2)
	studyTrack!: string;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" && value.trim().length > 0
			? value.trim()
			: null,
	)
	@IsString()
	targetUniversity?: string | null;

	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" && value.trim().length > 0
			? value.trim()
			: null,
	)
	@IsString()
	targetDepartment?: string | null;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	targetRanking?: number | null;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	dailyStudyGoalMinutes!: number;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	dailyQuestionGoal!: number;

	@IsOptional()
	@IsString()
	preferredStudyTime?: string | null;

	@IsOptional()
	@IsString()
	timezone?: string;

	@IsOptional()
	@IsString()
	locale?: string;
}
