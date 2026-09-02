/** @format */

/**
 * Prompt builder – structures analytics data into a clean payload for the LLM.
 * Never sends raw database objects.
 */

export interface StudentProfile {
	examType: string;
	targetUniversity?: string | null;
	targetDepartment?: string | null;
	targetRanking?: number | null;
	displayName: string;
}

export interface StudyMetrics {
	todayMinutes: number;
	weeklyMinutes: number;
	monthlyMinutes: number;
	currentStreak: number;
	longestStreak: number;
	totalSessionsRecorded: number;
}

export interface SubjectMetrics {
	name: string;
	accuracy: number;
	completionPercentage: number;
	timeSpentMinutes: number;
	questionsSolved: number;
}

export interface QuestionMetrics {
	accuracy: number;
	totalSolved: number;
	totalCorrect: number;
	totalWrong: number;
	pendingReviewCount: number;
}

export interface MockExamMetrics {
	totalAttempts: number;
	latestTYT?: { net: number; accuracy: number; date: string };
	latestAYT?: { net: number; accuracy: number; date: string };
	averageAccuracy: number;
	trendDirection: "improving" | "stable" | "declining";
}

export interface PlannerMetrics {
	todayTasksTotal: number;
	todayTasksCompleted: number;
	overdueTasksCount: number;
	upcomingTasksCount: number;
}

export interface AnalyticsPayload {
	student: StudentProfile;
	study: StudyMetrics;
	subjects: {
		strong: SubjectMetrics[];
		weak: SubjectMetrics[];
		all: SubjectMetrics[];
	};
	questions: QuestionMetrics;
	mockExams: MockExamMetrics;
	planner: PlannerMetrics;
	goals: {
		dailyStudyTarget: number;
		dailyQuestionTarget: number;
		dailyRevisionTarget: number;
	};
	timestamp: string;
}

export function buildAnalyticsPayload(
	student: StudentProfile,
	study: StudyMetrics,
	subjects: SubjectMetrics[],
	questions: QuestionMetrics,
	mockExams: MockExamMetrics,
	planner: PlannerMetrics,
	goals: any,
): AnalyticsPayload {
	const sortedByAccuracy = [...subjects].sort(
		(a, b) => b.accuracy - a.accuracy,
	);
	const strong = sortedByAccuracy.slice(0, 3);
	const weak = [...sortedByAccuracy].reverse().slice(0, 3);

	return {
		student,
		study,
		subjects: { strong, weak, all: subjects },
		questions,
		mockExams,
		planner,
		goals: {
			dailyStudyTarget: goals?.daily?.studyTime?.target ?? 120,
			dailyQuestionTarget: goals?.daily?.questions?.target ?? 100,
			dailyRevisionTarget: goals?.daily?.revision?.target ?? 10,
		},
		timestamp: new Date().toISOString(),
	};
}

export function buildSystemPrompt(): string {
	return `You are an experienced YKS (Turkish University Entrance Exam) study mentor with deep knowledge of exam preparation strategies.

Your role is to provide personalized study recommendations based on the student's data.

CRITICAL: Always respond with valid JSON only. No markdown, no extra text. Just pure JSON.

GUIDELINES:

1. Always base recommendations on the provided analytics data. Never hallucinate statistics or progress.

2. Prioritize weak subjects without discouraging the student. Be constructive and encouraging.

3. Recommend specific, actionable next steps the student can take today or this week.

4. Explain the reasoning behind your recommendations with reference to their actual performance data.

5. Do NOT solve exam questions or provide exam answers. Your role is study strategy only.

6. Do NOT generate fake progress or unrealistic predictions. Be honest about gaps and opportunities.

7. Encourage consistency and streaks. Celebrate existing progress.

8. If a student lacks sufficient data, clearly say so and ask them to log more sessions or take mock exams.

9. Keep recommendations concise and actionable.

10. Return ONLY valid JSON, no markdown formatting, no code blocks.

Remember: You are helping a student prepare for YKS. Your goal is to optimize their study time and boost confidence through data-driven insights.`;
}

export function buildRecommendationPrompt(payload: AnalyticsPayload): string {
	return `Based on this student's data, provide personalized study recommendations for the next 7 days.

STUDENT DATA:
${JSON.stringify(payload, null, 2)}

Return a JSON object with this exact structure (no markdown, no extra text, pure JSON only):
{
  "summary": "Brief 1-sentence summary of their current status",
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3",
    "Actionable recommendation 4"
  ],
  "prioritySubjects": [
    "Name of weak subject 1",
    "Name of weak subject 2"
  ],
  "revisionReminder": "Specific reminder about wrong questions to review",
  "motivation": "Personalized motivational message based on their data",
  "nextAction": "The single most impactful thing they should do today"
}

Be specific and reference their actual data. If data is missing, provide general but actionable advice.`;
}

export function buildWeeklySummaryPrompt(payload: AnalyticsPayload): string {
	return `Summarize this student's week and provide constructive feedback.

STUDENT DATA:
${JSON.stringify(payload, null, 2)}

Return a JSON object with this exact structure (no markdown, no extra text, pure JSON only):
{
  "summary": "Brief 1-2 sentence summary of this week's progress",
  "weeklyStats": {
    "studyHours": number,
    "questionsAnswered": number,
    "accuracy": number,
    "sessionsCompleted": number
  },
  "strengths": [
    "What they did well this week 1",
    "What they did well this week 2"
  ],
  "improvements": [
    "Area to improve 1",
    "Area to improve 2"
  ],
  "nextWeekFocus": "The primary focus for next week (1-2 sentences)"
}

Be honest about both wins and areas for growth. Reference specific numbers from their data.`;
}

export function buildWeakSubjectAnalysisPrompt(
	payload: AnalyticsPayload,
	subjectName: string,
): string {
	const weakSubject = payload.subjects.weak.find((s) => s.name === subjectName);

	return `The student is struggling with ${subjectName}. Provide a focused improvement plan.

STUDENT DATA:
${JSON.stringify(payload, null, 2)}

WEAK SUBJECT: ${subjectName}
${weakSubject ? `- Accuracy: ${weakSubject.accuracy}%\n- Time spent: ${weakSubject.timeSpentMinutes} minutes\n- Questions solved: ${weakSubject.questionsSolved}` : ""}

Provide:

1. **Root Cause Analysis**: Why might they be struggling with this subject? (Based on their data)

2. **Specific Study Plan**: 
   - How many hours per week for this subject?
   - Which topics within ${subjectName} are most important for YKS?

3. **Practice Strategy**: 
   - How many practice questions recommended?
   - What accuracy target should they aim for?

4. **Review Schedule**: How often should they review wrong questions in this subject?

5. **Timeline**: How long until they can realistically improve from ${weakSubject?.accuracy ?? "unknown"}% to a target accuracy?

6. **Motivation**: Why focusing on this subject matters for their overall YKS goal

Be specific and actionable.`;
}
