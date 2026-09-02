import type { ExamType } from "./study";

export interface OnboardingProfile {
	id: string;
	examType: ExamType;
	studyTrack: string;
	targetUniversity: string | null;
	targetDepartment: string | null;
	targetRanking: number | null;
	dailyStudyGoalMinutes: number;
	dailyQuestionGoal: number;
	preferredStudyTime: string | null;
	timezone: string;
	locale: string;
}

export interface OnboardingState {
	completed: boolean;
	profile: OnboardingProfile | null;
}

export interface OnboardingPayload {
	examType: ExamType;
	studyTrack: string;
	targetUniversity?: string | null;
	targetDepartment?: string | null;
	targetRanking?: number | null;
	dailyStudyGoalMinutes: number;
	dailyQuestionGoal: number;
	preferredStudyTime?: string | null;
	timezone?: string;
	locale?: string;
}
