/** @format */

import { officialSyllabus } from "./curriculum";

export type CurriculumValidationReport = {
	subjectCount: number;
	topicCount: number;
	subtopicCount: number;
	issues: string[];
};

function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

export function buildCurriculumValidationReport(
	syllabus = officialSyllabus,
): CurriculumValidationReport {
	const issues: string[] = [];
	const subjectSlugs = new Set<string>();
	const topicSlugs = new Set<string>();
	const subtopicSlugs = new Set<string>();
	let topicCount = 0;
	let subtopicCount = 0;

	for (const subject of syllabus) {
		if (!subject.name?.trim()) {
			issues.push("A subject is missing a name.");
		}
		if (!subject.slug?.trim()) {
			issues.push(`Subject ${subject.name ?? "<unknown>"} is missing a slug.`);
		}
		if (!subject.topics?.length) {
			issues.push(
				`Subject ${subject.name ?? "<unknown>"} does not contain any topics.`,
			);
		}
		if (subjectSlugs.has(subject.slug)) {
			issues.push(`Duplicate subject slug: ${subject.slug}`);
		}
		subjectSlugs.add(subject.slug);

		if (!["tyt", "ayt", "ydt"].includes(subject.examType)) {
			issues.push(
				`Invalid exam type for subject ${subject.name}: ${subject.examType}`,
			);
		}

		for (const topic of subject.topics) {
			topicCount += 1;
			if (!topic.name?.trim()) {
				issues.push(`Topic in subject ${subject.name} is missing a name.`);
			}
			if (!topic.slug?.trim()) {
				issues.push(`Topic ${topic.name ?? "<unknown>"} is missing a slug.`);
			}
			if (!topic.subtopics?.length) {
				issues.push(
					`Topic ${topic.name ?? "<unknown>"} does not contain any subtopics.`,
				);
			}
			if (topicSlugs.has(topic.slug)) {
				issues.push(`Duplicate topic slug: ${topic.slug}`);
			}
			topicSlugs.add(topic.slug);

			const topicSlugHint = slugify(topic.name);
			if (topic.slug && topicSlugHint && topic.slug !== slugify(topic.slug)) {
				issues.push(
					`Topic slug ${topic.slug} does not follow a normalized form for ${topic.name}.`,
				);
			}

			for (const subtopic of topic.subtopics) {
				subtopicCount += 1;
				if (!subtopic.name?.trim()) {
					issues.push(`Subtopic in topic ${topic.name} is missing a name.`);
				}
				if (!subtopic.slug?.trim()) {
					issues.push(
						`Subtopic ${subtopic.name ?? "<unknown>"} is missing a slug.`,
					);
				}
				if (subtopicSlugs.has(subtopic.slug)) {
					issues.push(`Duplicate subtopic slug: ${subtopic.slug}`);
				}
				subtopicSlugs.add(subtopic.slug);
			}
		}
	}

	return {
		subjectCount: syllabus.length,
		topicCount,
		subtopicCount,
		issues,
	};
}

export function validateCurriculum(
	syllabus = officialSyllabus,
): CurriculumValidationReport {
	const report = buildCurriculumValidationReport(syllabus);
	if (report.issues.length > 0) {
		throw new Error(
			`Curriculum validation failed:\n- ${report.issues.join("\n- ")}`,
		);
	}
	return report;
}
