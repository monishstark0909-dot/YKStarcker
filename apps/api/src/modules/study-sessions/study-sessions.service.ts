import { Optional, Injectable, UnauthorizedException, NotFoundException, BadRequestException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { CreateStudySessionDto } from "./dto/create-study-session.dto";
import { StartStudySessionDto } from "./dto/start-study-session.dto";
import { StopStudySessionDto } from "./dto/stop-study-session.dto";

@Injectable()
export class StudySessionsService {
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

	async getSessions(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		return this.database.studySession.findMany({
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

	async startSession(accessToken: string, payload: StartStudySessionDto) {
		const { user } = await this.getCurrentUser(accessToken);

		// Check if there is already an active session running
		const activeSession = await this.database.studySession.findFirst({
			where: {
				userId: user.id,
				endedAt: null,
			},
		});

		if (activeSession) {
			throw new BadRequestException("You already have an active study session running.");
		}

		return this.database.studySession.create({
			data: {
				userId: user.id,
				subjectId: payload.subjectId ?? null,
				topicId: payload.topicId ?? null,
				subtopicId: payload.subtopicId ?? null,
				durationMinutes: 0,
				startedAt: new Date(),
				endedAt: null,
			},
		});
	}

	async stopSession(accessToken: string, sessionId: string, payload: StopStudySessionDto) {
		const { user } = await this.getCurrentUser(accessToken);

		const session = await this.database.studySession.findUnique({
			where: { id: sessionId },
		});

		if (!session) {
			throw new NotFoundException("Study session not found.");
		}

		if (session.userId !== user.id) {
			throw new UnauthorizedException("You do not own this study session.");
		}

		if (session.endedAt) {
			throw new BadRequestException("This study session has already been stopped.");
		}

		const startedAt = session.startedAt ? new Date(session.startedAt) : new Date();
		const endedAt = new Date();
		const durationMs = endedAt.getTime() - startedAt.getTime();
		const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

		return this.database.studySession.update({
			where: { id: sessionId },
			data: {
				durationMinutes,
				endedAt,
				notes: payload.notes ?? session.notes,
			},
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
		});
	}

	async createManualSession(accessToken: string, payload: CreateStudySessionDto) {
		const { user } = await this.getCurrentUser(accessToken);
		const startedAt = payload.startedAt ? new Date(payload.startedAt) : new Date();
		const endedAt = new Date(startedAt.getTime() + payload.durationMinutes * 60000);

		return this.database.studySession.create({
			data: {
				userId: user.id,
				subjectId: payload.subjectId ?? null,
				topicId: payload.topicId ?? null,
				subtopicId: payload.subtopicId ?? null,
				durationMinutes: payload.durationMinutes,
				startedAt,
				endedAt,
				notes: payload.notes ?? null,
			},
			include: {
				subject: true,
				topic: true,
				subtopic: true,
			},
		});
	}

	async getProgress(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);

		// Get all study sessions for this user
		const sessions = await this.database.studySession.findMany({
			where: { userId: user.id },
			select: {
				subjectId: true,
				topicId: true,
				subtopicId: true,
				durationMinutes: true,
			},
		});

		// Get all question logs for this user
		const questionLogs = await this.database.questionLog.findMany({
			where: { userId: user.id },
			select: {
				subjectId: true,
				topicId: true,
				subtopicId: true,
				questionsSolved: true,
				correct: true,
				wrong: true,
			},
		});

		// Maps to accumulate metrics
		const durationMap = new Map<string, number>(); // key: subject/topic/subtopic ID -> minutes
		const questionCountMap = new Map<string, { solved: number; correct: number; wrong: number }>();
		const studiedSubtopics = new Set<string>(); // subtopics with study sessions or questions logged

		// Process study sessions
		for (const session of sessions) {
			if (session.durationMinutes > 0) {
				if (session.subjectId) {
					durationMap.set(session.subjectId, (durationMap.get(session.subjectId) ?? 0) + session.durationMinutes);
				}
				if (session.topicId) {
					durationMap.set(session.topicId, (durationMap.get(session.topicId) ?? 0) + session.durationMinutes);
				}
				if (session.subtopicId) {
					durationMap.set(session.subtopicId, (durationMap.get(session.subtopicId) ?? 0) + session.durationMinutes);
					studiedSubtopics.add(session.subtopicId);
				}
			}
		}

		// Process question logs
		for (const log of questionLogs) {
			const keys = [log.subjectId, log.topicId, log.subtopicId].filter(Boolean) as string[];
			for (const key of keys) {
				const existing = questionCountMap.get(key) ?? { solved: 0, correct: 0, wrong: 0 };
				questionCountMap.set(key, {
					solved: existing.solved + log.questionsSolved,
					correct: existing.correct + log.correct,
					wrong: existing.wrong + log.wrong,
				});
			}
			if (log.subtopicId) {
				studiedSubtopics.add(log.subtopicId);
			}
		}

		// Fetch UserSubtopicProgress records
		const userProgress = await this.database.userSubtopicProgress.findMany({
			where: { userId: user.id },
		});
		const progressMap = new Map<string, typeof userProgress[0]>();
		for (const p of userProgress) {
			progressMap.set(p.subtopicId, p);
		}

		// Get all syllabus curriculum subjects, topics, and subtopics to map progress dynamically
		const subjects = await this.database.subject.findMany({
			include: {
				topics: {
					include: {
						subtopics: true,
					},
				},
			},
		});

		const progressHierarchy = subjects.map((subject) => {
			let totalSubtopicsInSubject = 0;
			let studiedSubtopicsInSubject = 0;
			let subjectQuestionsSolved = 0;
			let subjectCorrect = 0;

			const topicsProgress = subject.topics.map((topic) => {
				const totalSubtopicsInTopic = topic.subtopics.length;
				let studiedSubtopicsInTopic = 0;
				let topicQuestionsSolved = 0;
				let topicCorrect = 0;

				const subtopicsProgress = topic.subtopics.map((subtopic) => {
					const subtopicQuestions = questionCountMap.get(subtopic.id) ?? { solved: 0, correct: 0, wrong: 0 };
					topicQuestionsSolved += subtopicQuestions.solved;
					topicCorrect += subtopicQuestions.correct;

					const p = progressMap.get(subtopic.id);
					const subtopicStatus = p?.status ?? "not_started";
					const isCompleted = subtopicStatus === "completed";
					if (isCompleted) {
						studiedSubtopicsInTopic++;
					}

					return {
						id: subtopic.id,
						slug: subtopic.slug,
						name: subtopic.name,
						sortOrder: subtopic.sortOrder,
						importance: subtopic.importance,
						estimatedQuestionWeight: subtopic.estimatedQuestionWeight ? Number(subtopic.estimatedQuestionWeight) : null,
						timeSpentMinutes: durationMap.get(subtopic.id) ?? 0,
						questionsSolved: subtopicQuestions.solved,
						accuracyRate: subtopicQuestions.solved > 0 ? Math.round((subtopicQuestions.correct / subtopicQuestions.solved) * 100) : 0,
						status: isCompleted ? "completed" : "not-started",
						confidence: p?.confidence ?? null,
						notes: p?.notes ?? null,
						isBookmarked: p?.isBookmarked ?? false,
						flaggedRevision: p?.flaggedRevision ?? false,
						difficulty: p?.difficulty ?? null,
					};
				});

				totalSubtopicsInSubject += totalSubtopicsInTopic;
				studiedSubtopicsInSubject += studiedSubtopicsInTopic;
				subjectQuestionsSolved += topicQuestionsSolved;
				subjectCorrect += topicCorrect;

				return {
					id: topic.id,
					slug: topic.slug,
					name: topic.name,
					sortOrder: topic.sortOrder,
					estimatedHours: topic.estimatedHours,
					timeSpentMinutes: durationMap.get(topic.id) ?? 0,
					questionsSolved: topicQuestionsSolved,
					accuracyRate: topicQuestionsSolved > 0 ? Math.round((topicCorrect / topicQuestionsSolved) * 100) : 0,
					completionPercentage: totalSubtopicsInTopic > 0 ? Math.round((studiedSubtopicsInTopic / totalSubtopicsInTopic) * 100) : 0,
					subtopics: subtopicsProgress,
				};
			});

			return {
				id: subject.id,
				examType: subject.examType,
				code: subject.code,
				slug: subject.slug,
				name: subject.name,
				sortOrder: subject.sortOrder,
				color: subject.color,
				icon: subject.icon,
				timeSpentMinutes: durationMap.get(subject.id) ?? 0,
				questionsSolved: subjectQuestionsSolved,
				accuracyRate: subjectQuestionsSolved > 0 ? Math.round((subjectCorrect / subjectQuestionsSolved) * 100) : 0,
				completionPercentage: totalSubtopicsInSubject > 0 ? Math.round((studiedSubtopicsInSubject / totalSubtopicsInSubject) * 100) : 0,
				topics: topicsProgress,
			};
		});

		return progressHierarchy;
	}
}
