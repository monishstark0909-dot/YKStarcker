import { Optional, Injectable, UnauthorizedException, NotFoundException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { CreateWrongQuestionDto } from "./dto/create-wrong-question.dto";
import { UpdateWrongQuestionStatusDto } from "./dto/update-wrong-question-status.dto";

@Injectable()
export class WrongQuestionsService {
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

	async getWrongQuestions(accessToken: string, status?: string) {
		const { user } = await this.getCurrentUser(accessToken);
		return this.database.wrongQuestion.findMany({
			where: {
				userId: user.id,
				...(status ? { status: status as any } : {}),
			},
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

	async getRevisionQueue(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const now = new Date();
		return this.database.wrongQuestion.findMany({
			where: {
				userId: user.id,
				status: "pending",
				OR: [
					{ reviewDate: null },
					{ reviewDate: { lte: now } },
				],
			},
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});
	}

	async createWrongQuestion(accessToken: string, payload: CreateWrongQuestionDto) {
		const { user } = await this.getCurrentUser(accessToken);
		
		// If no reviewDate is provided, default to 2 days from now for spacing repetition
		const reviewDate = payload.reviewDate 
			? new Date(payload.reviewDate) 
			: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

		return this.database.wrongQuestion.create({
			data: {
				userId: user.id,
				subjectId: payload.subjectId ?? null,
				topicId: payload.topicId ?? null,
				subtopicId: payload.subtopicId ?? null,
				reason: payload.reason,
				difficulty: payload.difficulty ?? null,
				imageUrl: payload.imageUrl ?? null,
				reviewDate,
				status: "pending",
			},
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
		});
	}

	async updateStatus(accessToken: string, id: string, payload: UpdateWrongQuestionStatusDto) {
		const { user } = await this.getCurrentUser(accessToken);

		const question = await this.database.wrongQuestion.findUnique({
			where: { id },
		});

		if (!question) {
			throw new NotFoundException("Wrong question not found.");
		}

		if (question.userId !== user.id) {
			throw new UnauthorizedException("You do not own this wrong question.");
		}

		// When a question is reviewed, update its reviewDate to 7 days in future if status is still pending,
		// or set it accordingly based on space repetition logic
		let nextReviewDate = question.reviewDate;
		if (payload.status === "reviewed") {
			nextReviewDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		}

		return this.database.wrongQuestion.update({
			where: { id },
			data: {
				status: payload.status as any,
				reviewDate: nextReviewDate,
			},
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
		});
	}
}
