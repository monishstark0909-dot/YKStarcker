import { tytSubjects } from "./tyt";
import { aytSubjects } from "./ayt";
import { ydtSubjects } from "./ydt";

export type SeedSubtopic = {
	name: string;
	slug: string;
	sortOrder: number;
	importance?: string;
	estimatedQuestionWeight?: number;
};

export type SeedTopic = {
	name: string;
	slug: string;
	sortOrder: number;
	estimatedHours?: number;
	subtopics: SeedSubtopic[];
};

export type SeedSubject = {
	examType: "tyt" | "ayt" | "ydt";
	code: string;
	name: string;
	slug: string;
	color?: string;
	icon?: string;
	sortOrder: number;
	topics: SeedTopic[];
};

export const officialSyllabus: SeedSubject[] = [
	...tytSubjects.map((s) => ({ ...s, examType: "tyt" as const })),
	...aytSubjects.map((s) => ({ ...s, examType: "ayt" as const })),
	...ydtSubjects.map((s) => ({ ...s, examType: "ydt" as const })),
];
