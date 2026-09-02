/** @format */

export type ExamType = "tyt" | "ayt" | "ydt";
export type ProgressStatus =
	| "not-started"
	| "in-progress"
	| "needs-review"
	| "completed";

export interface StudySubject {
	id: string;
	examType: ExamType;
	name: string;
}

export interface StudySessionSummary {
	subject: string;
	topic: string;
	durationMinutes: number;
	notes?: string;
}
