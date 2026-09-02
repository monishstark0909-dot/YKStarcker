import { IsOptional, IsString } from "class-validator";

export class StopStudySessionDto {
	@IsOptional()
	@IsString()
	notes?: string;
}
