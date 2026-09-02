/** @format */

import { Optional, Injectable, OnModuleInit, UnauthorizedException, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class CurriculumService implements OnModuleInit {
	constructor(
		private readonly authService: AuthService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}
	
	// In-memory cache for the entire curriculum hierarchy
	private cachedHierarchy: any[] = [];
	private subjectsMap = new Map<string, any>();
	private topicsMap = new Map<string, any>();
	private subtopicsMap = new Map<string, any>();
	private entitiesBySlug = new Map<string, { type: "subject" | "topic" | "subtopic"; data: any }>();

	async onModuleInit() {
		await this.loadCache();
	}

	/**
	 * Loads (or reloads) the curriculum hierarchy cache from the database.
	 */
	async loadCache(): Promise<void> {
		const subjects = await this.database.subject.findMany({
			include: {
				topics: {
					include: {
						subtopics: true,
					},
					orderBy: {
						sortOrder: "asc",
					},
				},
			},
			orderBy: {
				sortOrder: "asc",
			},
		});

		// Reset internal maps
		this.subjectsMap.clear();
		this.topicsMap.clear();
		this.subtopicsMap.clear();
		this.entitiesBySlug.clear();

		const hierarchy: any[] = [];

		for (const subject of subjects) {
			const formattedSubject = {
				id: subject.id,
				examType: subject.examType,
				code: subject.code,
				slug: subject.slug,
				name: subject.name,
				sortOrder: subject.sortOrder,
				color: subject.color,
				icon: subject.icon,
				curriculumVersionId: subject.curriculumVersionId,
				topics: [] as any[],
			};

			this.subjectsMap.set(subject.id, formattedSubject);
			this.entitiesBySlug.set(subject.slug, { type: "subject", data: formattedSubject });

			for (const topic of subject.topics) {
				const formattedTopic = {
					id: topic.id,
					subjectId: topic.subjectId,
					slug: topic.slug,
					name: topic.name,
					sortOrder: topic.sortOrder,
					estimatedHours: topic.estimatedHours,
					curriculumVersionId: topic.curriculumVersionId,
					subtopics: [] as any[],
				};

				this.topicsMap.set(topic.id, formattedTopic);
				this.entitiesBySlug.set(topic.slug, { type: "topic", data: formattedTopic });
				formattedSubject.topics.push(formattedTopic);

				for (const subtopic of topic.subtopics) {
					const formattedSubtopic = {
						id: subtopic.id,
						topicId: subtopic.topicId,
						slug: subtopic.slug,
						name: subtopic.name,
						status: subtopic.status,
						sortOrder: subtopic.sortOrder,
						importance: subtopic.importance,
						estimatedQuestionWeight: subtopic.estimatedQuestionWeight
							? Number(subtopic.estimatedQuestionWeight)
							: null,
						curriculumVersionId: subtopic.curriculumVersionId,
					};

					this.subtopicsMap.set(subtopic.id, formattedSubtopic);
					this.entitiesBySlug.set(subtopic.slug, { type: "subtopic", data: formattedSubtopic });
					formattedTopic.subtopics.push(formattedSubtopic);
				}
			}

			hierarchy.push(formattedSubject);
		}

		this.cachedHierarchy = hierarchy;
	}

	/**
	 * Returns the complete nested tree of subjects, topics, and subtopics.
	 */
	getHierarchy() {
		return this.cachedHierarchy;
	}

	/**
	 * Returns list of all subjects (sorted).
	 */
	getSubjects() {
		return this.cachedHierarchy.map(({ topics, ...subject }) => subject);
	}

	/**
	 * Returns list of all topics under the subject (sorted).
	 */
	getTopics(subjectSlug: string) {
		const subjectEntity = this.entitiesBySlug.get(subjectSlug);
		if (!subjectEntity || subjectEntity.type !== "subject") {
			return [];
		}
		return subjectEntity.data.topics.map(({ subtopics, ...topic }: any) => topic);
	}

	/**
	 * Returns list of all subtopics under the topic (sorted).
	 */
	getSubtopics(topicSlug: string) {
		const topicEntity = this.entitiesBySlug.get(topicSlug);
		if (!topicEntity || topicEntity.type !== "topic") {
			return [];
		}
		return topicEntity.data.subtopics;
	}

	/**
	 * Search any entity (Subject, Topic, or Subtopic) by its slug.
	 */
	findBySlug(slug: string) {
		const entity = this.entitiesBySlug.get(slug);
		return entity ? entity : null;
	}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	async updateProgress(accessToken: string, subtopicId: string, payload: any) {
		const { user } = await this.getCurrentUser(accessToken);

		const subtopicExists = await this.database.subtopic.findUnique({
			where: { id: subtopicId },
		});

		if (!subtopicExists) {
			throw new NotFoundException(`Subtopic with ID "${subtopicId}" not found.`);
		}

		let mappedStatus: any = undefined;
		if (payload.status) {
			const clean = String(payload.status).replace(/-/g, "_");
			if (["not_started", "in_progress", "needs_review", "completed"].includes(clean)) {
				mappedStatus = clean;
			}
		}

		let mappedDifficulty: any = undefined;
		if (payload.difficulty) {
			const cleanDiff = String(payload.difficulty).toLowerCase();
			if (["easy", "medium", "hard"].includes(cleanDiff)) {
				mappedDifficulty = cleanDiff;
			}
		}

		try {
			const existing = await this.database.userSubtopicProgress.findFirst({
				where: {
					userId: user.id,
					subtopicId,
				},
			});

			if (existing) {
				return await this.database.userSubtopicProgress.update({
					where: { id: existing.id },
					data: {
						...(mappedStatus && { status: mappedStatus }),
						...(payload.confidence !== undefined && { confidence: payload.confidence }),
						...(payload.notes !== undefined && { notes: payload.notes }),
						...(payload.isBookmarked !== undefined && { isBookmarked: payload.isBookmarked }),
						...(payload.flaggedRevision !== undefined && { flaggedRevision: payload.flaggedRevision }),
						...(mappedDifficulty && { difficulty: mappedDifficulty }),
					},
				});
			} else {
				return await this.database.userSubtopicProgress.create({
					data: {
						userId: user.id,
						subtopicId,
						status: mappedStatus ?? "not_started",
						confidence: payload.confidence ?? null,
						notes: payload.notes ?? null,
						isBookmarked: payload.isBookmarked ?? false,
						flaggedRevision: payload.flaggedRevision ?? false,
						difficulty: mappedDifficulty ?? null,
					},
				});
			}
		} catch (err: any) {
			console.error("Subtopic progress save failed:", err);
			throw new BadRequestException(`Could not save subtopic progress: ${err.message || err}`);
		}
	}
}
