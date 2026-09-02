import { Optional, Injectable, UnauthorizedException, BadRequestException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { CreateQuestionLogDto } from "./dto/create-question-log.dto";

@Injectable()
export class QuestionLogsService {
	constructor(
		private readonly authService: AuthService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	async getQuestionLogs(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		return this.database.questionLog.findMany({
			where: { userId: user.id },
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	async createQuestionLog(accessToken: string, payload: CreateQuestionLogDto) {
		const { user } = await this.getCurrentUser(accessToken);

		if (payload.correct + payload.wrong !== payload.questionsSolved) {
			throw new BadRequestException("Sum of correct and wrong questions must equal questionsSolved.");
		}

		return this.database.questionLog.create({
			data: {
				userId: user.id,
				subjectId: payload.subjectId ?? null,
				topicId: payload.topicId ?? null,
				subtopicId: payload.subtopicId ?? null,
				questionsSolved: payload.questionsSolved,
				correct: payload.correct,
				wrong: payload.wrong,
				difficulty: payload.difficulty ?? null,
				notes: payload.notes ?? null,
			},
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
		});
	}
}
