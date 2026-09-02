/** @format */

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { officialSyllabus } from "./curriculum";
import { demoStudentSeed, demoActivitySeed } from "../seed-data";
import { validateCurriculum } from "./validation";

export function uuidV5(
	name: string,
	namespaceUuid: string = "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
): string {
	const hex = namespaceUuid.replace(/-/g, "");
	const namespaceBytes = Buffer.from(hex, "hex");
	const nameBytes = Buffer.from(name, "utf8");
	const cleanBuffer = Buffer.concat([namespaceBytes, nameBytes]);

	const hash = createHash("sha1").update(cleanBuffer).digest();

	// Set version to 5 (0101)
	hash[6] = (hash[6] & 0x0f) | 0x50;
	// Set variant to RFC 4122 (10xx)
	hash[8] = (hash[8] & 0x3f) | 0x80;

	const hashHex = hash.toString("hex");
	return [
		hashHex.slice(0, 8),
		hashHex.slice(8, 12),
		hashHex.slice(12, 16),
		hashHex.slice(16, 20),
		hashHex.slice(20, 32),
	].join("-");
}

type SubjectLookup = Map<
	string,
	{
		id: string;
		topics: Map<
			string,
			{
				id: string;
				subtopics: Map<string, string>;
			}
		>;
	}
>;

export async function runSeeder(prisma: PrismaClient): Promise<SubjectLookup> {
	console.log("🔍 Validating curriculum integrity...");
	const report = validateCurriculum(officialSyllabus);
	console.log(
		`\x1b[32m✅ Validation Passed: Checked ${report.subjectCount} subjects, ${report.topicCount} topics, and ${report.subtopicCount} subtopics.\x1b[0m`,
	);
	console.log(
		`📚 Curriculum summary: ${report.subjectCount} subjects, ${report.topicCount} topics, ${report.subtopicCount} subtopics.`,
	);

	const versionId = uuidV5("curriculum-version:2027");
	const version = await prisma.curriculumVersion.upsert({
		where: { year: 2027 },
		update: {
			isCurrent: true,
		},
		create: {
			id: versionId,
			year: 2027,
			isCurrent: true,
		},
	});

	const lookup: SubjectLookup = new Map();

	for (const subjectSeed of officialSyllabus) {
		const subjectId = uuidV5(`subject:${subjectSeed.slug}`);
		const subject = await prisma.subject.upsert({
			where: { id: subjectId },
			update: {
				examType: subjectSeed.examType,
				code: subjectSeed.code,
				slug: subjectSeed.slug,
				name: subjectSeed.name,
				sortOrder: subjectSeed.sortOrder,
				color: subjectSeed.color ?? null,
				icon: subjectSeed.icon ?? null,
				curriculumVersionId: version.id,
			},
			create: {
				id: subjectId,
				examType: subjectSeed.examType,
				code: subjectSeed.code,
				slug: subjectSeed.slug,
				name: subjectSeed.name,
				sortOrder: subjectSeed.sortOrder,
				color: subjectSeed.color ?? null,
				icon: subjectSeed.icon ?? null,
				curriculumVersionId: version.id,
			},
		});

		const topicLookup = new Map<
			string,
			{ id: string; subtopics: Map<string, string> }
		>();

		for (const topicSeed of subjectSeed.topics) {
			const topicId = uuidV5(`topic:${topicSeed.slug}`);
			const topic = await prisma.topic.upsert({
				where: { id: topicId },
				update: {
					name: topicSeed.name,
					slug: topicSeed.slug,
					sortOrder: topicSeed.sortOrder,
					estimatedHours: topicSeed.estimatedHours ?? null,
					subjectId: subject.id,
					curriculumVersionId: version.id,
				},
				create: {
					id: topicId,
					name: topicSeed.name,
					slug: topicSeed.slug,
					sortOrder: topicSeed.sortOrder,
					estimatedHours: topicSeed.estimatedHours ?? null,
					subjectId: subject.id,
					curriculumVersionId: version.id,
				},
			});

			const subtopicLookup = new Map<string, string>();

			for (const subtopicSeed of topicSeed.subtopics) {
				const subtopicId = uuidV5(`subtopic:${subtopicSeed.slug}`);
				const subtopic = await prisma.subtopic.upsert({
					where: { id: subtopicId },
					update: {
						name: subtopicSeed.name,
						slug: subtopicSeed.slug,
						sortOrder: subtopicSeed.sortOrder,
						importance: subtopicSeed.importance ?? null,
						estimatedQuestionWeight: subtopicSeed.estimatedQuestionWeight
							? new Prisma.Decimal(subtopicSeed.estimatedQuestionWeight)
							: null,
						topicId: topic.id,
						curriculumVersionId: version.id,
					},
					create: {
						id: subtopicId,
						name: subtopicSeed.name,
						slug: subtopicSeed.slug,
						sortOrder: subtopicSeed.sortOrder,
						importance: subtopicSeed.importance ?? null,
						estimatedQuestionWeight: subtopicSeed.estimatedQuestionWeight
							? new Prisma.Decimal(subtopicSeed.estimatedQuestionWeight)
							: null,
						topicId: topic.id,
						curriculumVersionId: version.id,
					},
				});

				subtopicLookup.set(subtopicSeed.name, subtopic.id);
			}

			topicLookup.set(topicSeed.name, {
				id: topic.id,
				subtopics: subtopicLookup,
			});
		}

		lookup.set(subjectSeed.code, {
			id: subject.id,
			topics: topicLookup,
		});
	}

	return lookup;
}

export async function seedDemoUser(
	prisma: PrismaClient,
	subjectLookup: SubjectLookup,
) {
	const passwordHash = await bcrypt.hash(demoStudentSeed.password, 12);

	const user = await prisma.user.upsert({
		where: { email: demoStudentSeed.email },
		update: {
			displayName: demoStudentSeed.displayName,
			username: demoStudentSeed.username,
			passwordHash,
			avatarUrl: null,
			role: "student",
		},
		create: {
			email: demoStudentSeed.email,
			username: demoStudentSeed.username,
			displayName: demoStudentSeed.displayName,
			passwordHash,
			role: "student",
		},
	});

	await prisma.profile.upsert({
		where: { userId: user.id },
		update: {
			examType: demoStudentSeed.profile.examType,
			studyTrack: demoStudentSeed.profile.studyTrack,
			targetUniversity: demoStudentSeed.profile.targetUniversity,
			targetDepartment: demoStudentSeed.profile.targetDepartment,
			targetRanking: demoStudentSeed.profile.targetRanking,
			dailyStudyGoalMinutes: demoStudentSeed.profile.dailyStudyGoalMinutes,
			dailyQuestionGoal: demoStudentSeed.profile.dailyQuestionGoal,
			preferredStudyTime: demoStudentSeed.profile.preferredStudyTime,
			timezone: demoStudentSeed.profile.timezone,
			locale: demoStudentSeed.profile.locale,
		},
		create: {
			userId: user.id,
			examType: demoStudentSeed.profile.examType,
			studyTrack: demoStudentSeed.profile.studyTrack,
			targetUniversity: demoStudentSeed.profile.targetUniversity,
			targetDepartment: demoStudentSeed.profile.targetDepartment,
			targetRanking: demoStudentSeed.profile.targetRanking,
			dailyStudyGoalMinutes: demoStudentSeed.profile.dailyStudyGoalMinutes,
			dailyQuestionGoal: demoStudentSeed.profile.dailyQuestionGoal,
			preferredStudyTime: demoStudentSeed.profile.preferredStudyTime,
			timezone: demoStudentSeed.profile.timezone,
			locale: demoStudentSeed.profile.locale,
		},
	});

	await prisma.studySession.deleteMany({ where: { userId: user.id } });
	await prisma.questionLog.deleteMany({ where: { userId: user.id } });
	await prisma.wrongQuestion.deleteMany({ where: { userId: user.id } });
	await prisma.mockExam.deleteMany({ where: { userId: user.id } });
	await prisma.plannerItem.deleteMany({ where: { userId: user.id } });
	await prisma.aiInsight.deleteMany({ where: { userId: user.id } });

	const mathSubject = subjectLookup.get(
		demoActivitySeed.studySession.subjectCode,
	);
	const mathTopic = mathSubject?.topics.get(
		demoActivitySeed.studySession.topicName,
	);
	const mathSubtopicId =
		mathTopic?.subtopics.get(demoActivitySeed.studySession.subtopicName) ??
		null;

	await prisma.studySession.create({
		data: {
			userId: user.id,
			subjectId: mathSubject?.id,
			topicId: mathTopic?.id,
			subtopicId: mathSubtopicId,
			durationMinutes: demoActivitySeed.studySession.durationMinutes,
			notes: demoActivitySeed.studySession.notes,
			startedAt: new Date("2026-07-27T05:00:00.000Z"),
			endedAt: new Date("2026-07-27T06:30:00.000Z"),
		},
	});

	const questionSubject = subjectLookup.get(
		demoActivitySeed.questionLog.subjectCode,
	);
	const questionTopic = questionSubject?.topics.get(
		demoActivitySeed.questionLog.topicName,
	);
	const questionSubtopicId =
		questionTopic?.subtopics.get(demoActivitySeed.questionLog.subtopicName) ??
		null;

	await prisma.questionLog.create({
		data: {
			userId: user.id,
			subjectId: questionSubject?.id,
			topicId: questionTopic?.id,
			subtopicId: questionSubtopicId,
			questionsSolved: demoActivitySeed.questionLog.questionsSolved,
			correct: demoActivitySeed.questionLog.correct,
			wrong: demoActivitySeed.questionLog.wrong,
			difficulty: demoActivitySeed.questionLog.difficulty,
			notes: demoActivitySeed.questionLog.notes,
		},
	});

	const wrongSubject = subjectLookup.get(
		demoActivitySeed.wrongQuestion.subjectCode,
	);
	const wrongTopic = wrongSubject?.topics.get(
		demoActivitySeed.wrongQuestion.topicName,
	);
	const wrongSubtopicId =
		wrongTopic?.subtopics.get(demoActivitySeed.wrongQuestion.subtopicName) ??
		null;

	await prisma.wrongQuestion.create({
		data: {
			userId: user.id,
			subjectId: wrongSubject?.id,
			topicId: wrongTopic?.id,
			subtopicId: wrongSubtopicId,
			reason: demoActivitySeed.wrongQuestion.reason,
			difficulty: demoActivitySeed.wrongQuestion.difficulty,
			reviewDate: new Date(demoActivitySeed.wrongQuestion.reviewDate),
			status: demoActivitySeed.wrongQuestion.status,
		},
	});

	const mockExam = await prisma.mockExam.create({
		data: {
			userId: user.id,
			examType: demoActivitySeed.mockExam.examType,
			name: demoActivitySeed.mockExam.name,
			takenAt: new Date(demoActivitySeed.mockExam.takenAt),
			overallCorrect: demoActivitySeed.mockExam.overallCorrect,
			overallWrong: demoActivitySeed.mockExam.overallWrong,
			overallBlank: demoActivitySeed.mockExam.overallBlank,
			overallNet: new Prisma.Decimal(
				String(
					demoActivitySeed.mockExam.results.reduce(
						(sum, result) => sum + Number(result.net),
						0,
					),
				),
			),
		},
	});

	for (const resultSeed of demoActivitySeed.mockExam.results) {
		const subject = subjectLookup.get(resultSeed.subjectCode);
		if (!subject) {
			continue;
		}

		await prisma.mockExamSubjectResult.create({
			data: {
				mockExamId: mockExam.id,
				subjectId: subject.id,
				correct: resultSeed.correct,
				wrong: resultSeed.wrong,
				blank: resultSeed.blank,
				net: new Prisma.Decimal(resultSeed.net),
			},
		});
	}

	await prisma.plannerItem.create({
		data: {
			userId: user.id,
			title: demoActivitySeed.plannerItem.title,
			description: demoActivitySeed.plannerItem.description,
			type: demoActivitySeed.plannerItem.type,
			status: demoActivitySeed.plannerItem.status,
			scheduledFor: new Date(demoActivitySeed.plannerItem.scheduledFor),
		},
	});

	await prisma.aiInsight.create({
		data: {
			userId: user.id,
			type: demoActivitySeed.aiInsight.type,
			title: demoActivitySeed.aiInsight.title,
			content: demoActivitySeed.aiInsight.content,
			generatedAt: new Date(demoActivitySeed.aiInsight.generatedAt),
		},
	});
}
