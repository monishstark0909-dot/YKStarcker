import { IsString, IsOptional, IsInt, Min, IsIn, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class MockSubjectResultDto {
	@IsString()
	subjectId!: string;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	correct!: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	wrong!: number;

	@Type(() => Number)
	@IsInt()
	@Min(0)
	blank!: number;
}

export class CreateMockExamDto {
	@IsIn(["tyt", "ayt", "ydt"])
	examType!: "tyt" | "ayt" | "ydt";

	@IsString()
	name!: string;

	@IsString()
	takenAt!: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => MockSubjectResultDto)
	results!: MockSubjectResultDto[];
}
