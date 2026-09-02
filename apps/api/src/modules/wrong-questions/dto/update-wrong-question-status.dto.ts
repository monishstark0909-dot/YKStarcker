import { IsIn } from "class-validator";

const statuses = ["pending", "reviewed", "mastered"] as const;

export class UpdateWrongQuestionStatusDto {
	@IsIn(statuses)
	status!: (typeof statuses)[number];
}
