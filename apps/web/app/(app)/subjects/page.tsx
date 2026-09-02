/** @format */

"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/i18n-context";
import {
	getCurriculumHierarchy,
	getProgress,
	startStudySession,
	stopStudySession,
	createManualStudySession,
	createQuestionLog,
	createWrongQuestion,
	updateSubtopicProgress,
} from "@/lib/study";

type SubtopicProgress = {
	id: string;
	slug: string;
	name: string;
	sortOrder: number;
	importance: string | null;
	estimatedQuestionWeight: number | null;
	timeSpentMinutes: number;
	questionsSolved: number;
	accuracyRate: number;
	status: "completed" | "not-started";
	confidence: number | null;
	notes: string | null;
	isBookmarked: boolean;
	flaggedRevision: boolean;
	difficulty: "easy" | "medium" | "hard" | null;
};

type TopicProgress = {
	id: string;
	slug: string;
	name: string;
	sortOrder: number;
	estimatedHours: number | null;
	timeSpentMinutes: number;
	questionsSolved: number;
	accuracyRate: number;
	completionPercentage: number;
	subtopics: SubtopicProgress[];
};

type SubjectProgress = {
	id: string;
	examType: string;
	code: string;
	slug: string;
	name: string;
	sortOrder: number;
	color: string | null;
	icon: string | null;
	timeSpentMinutes: number;
	questionsSolved: number;
	accuracyRate: number;
	completionPercentage: number;
	topics: TopicProgress[];
};

type CurriculumSubtopic = {
	id: string;
	topicId: string;
	slug: string;
	name: string;
	sortOrder: number;
	importance: string | null;
	estimatedQuestionWeight: number | null;
	status?: string | null;
};

type CurriculumTopic = {
	id: string;
	subjectId: string;
	slug: string;
	name: string;
	sortOrder: number;
	estimatedHours: number | null;
	subtopics: CurriculumSubtopic[];
};

type CurriculumSubject = {
	id: string;
	examType: string;
	code: string;
	slug: string;
	name: string;
	sortOrder: number;
	color: string | null;
	icon: string | null;
	topics: CurriculumTopic[];
};

export default function SubjectsPage() {
	const { t, formatPercent } = useTranslation();
	const [progressData, setProgressData] = useState<SubjectProgress[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Core workspace navigation states
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
	const [selectedSubtopic, setSelectedSubtopic] = useState<{
		subtopic: SubtopicProgress;
		topicId: string;
		subjectId: string;
	} | null>(null);

	// Collapsible state trackers for Topic Explorer (center pane)
	const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
	const [searchQuery, setSearchQuery] = useState("");

	// Study timer state
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Inputs for workspace
	const [manualMins, setManualMins] = useState("");
	const [sessionNotes, setSessionNotes] = useState("");
	const [correctCount, setCorrectCount] = useState("");
	const [wrongCount, setWrongCount] = useState("");
	const [questionsNotes, setQuestionsNotes] = useState("");
	const [questionsDifficulty, setQuestionsDifficulty] = useState<"easy" | "medium" | "hard">("medium");

	const [wrongReason, setWrongReason] = useState("");
	const [wrongDifficulty, setWrongDifficulty] = useState<"easy" | "medium" | "hard">("medium");
	const [wrongReviewDays, setWrongReviewDays] = useState("1");

	const [personalNotes, setPersonalNotes] = useState("");
	const [confidence, setConfidence] = useState(3);
	const [isSubtopicCompleted, setIsSubtopicCompleted] = useState(false);

	const [savingState, setSavingState] = useState<string | null>(null);

	async function loadProgress(initial: boolean = false) {
		try {
			const progress = await getProgress();
			setProgressData(progress);

			if (initial && progress.length > 0) {
				setSelectedSubjectId(progress[0].id);
			}
		} catch (err: any) {
			const progressMessage = err.message || "Failed to load subjects progress.";
			try {
				const hierarchy = await getCurriculumHierarchy();

				const converted: SubjectProgress[] = hierarchy.map((subj: CurriculumSubject) => ({
					...subj,
					timeSpentMinutes: 0,
					questionsSolved: 0,
					accuracyRate: 0,
					completionPercentage: 0,
					topics: subj.topics.map((top: CurriculumTopic) => ({
						...top,
						timeSpentMinutes: 0,
						questionsSolved: 0,
						accuracyRate: 0,
						completionPercentage: 0,
						subtopics: top.subtopics.map((subtop: CurriculumSubtopic) => ({
							...subtop,
							timeSpentMinutes: 0,
							questionsSolved: 0,
							accuracyRate: 0,
							status: "not-started",
							confidence: null,
							notes: null,
							isBookmarked: false,
							flaggedRevision: false,
							difficulty: null,
						})),
					})),
				}));

				setProgressData(converted);

				if (initial && converted.length > 0) {
					setSelectedSubjectId(converted[0].id);
				}

				if (!initial && selectedSubtopic) {
					const activeSubId = selectedSubtopic.subtopic.id;
					let found = false;
					for (const subj of converted) {
						for (const top of subj.topics) {
							const match = top.subtopics.find((s: any) => s.id === activeSubId);
							if (match) {
								setSelectedSubtopic({
									subtopic: match,
									topicId: top.id,
									subjectId: subj.id,
								});
								found = true;
								break;
							}
						}
						if (found) break;
					}
					if (!found) {
						setSelectedSubtopic(null);
					}
				}
			} catch (hierarchyErr: any) {
				setError(hierarchyErr.message || progressMessage);
			}
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadProgress(true);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	useEffect(() => {
		if (isTimerRunning) {
			timerRef.current = setInterval(() => {
				setElapsedSeconds((prev) => prev + 1);
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		}
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [isTimerRunning]);

	useEffect(() => {
		if (selectedSubtopic) {
			const sub = selectedSubtopic.subtopic;
			setPersonalNotes(sub.notes ?? "");
			setConfidence(sub.confidence ?? 3);
			setIsSubtopicCompleted(sub.status === "completed");
			setCorrectCount("");
			setWrongCount("");
			setManualMins("");
			setWrongReason("");
			setSessionNotes("");
			setQuestionsNotes("");
		}
	}, [selectedSubtopic]);

	const selectedSubject = progressData.find((s) => s.id === selectedSubjectId);

	async function handleStartTimer() {
		if (!selectedSubtopic) return;
		try {
			const session = await startStudySession({
				subjectId: selectedSubtopic.subjectId,
				topicId: selectedSubtopic.topicId,
				subtopicId: selectedSubtopic.subtopic.id,
			});
			setActiveSessionId(session.id);
			setElapsedSeconds(0);
			setIsTimerRunning(true);
		} catch (err: any) {
			alert(err.message || "Could not start timer session.");
		}
	}

	async function handleStopTimer() {
		if (!activeSessionId) return;
		try {
			setIsTimerRunning(false);
			await stopStudySession(activeSessionId, {
				notes: sessionNotes || "Timer session",
			});
			setActiveSessionId(null);
			setElapsedSeconds(0);
			setSessionNotes("");
			await loadProgress();
		} catch (err: any) {
			alert(err.message || "Could not stop timer session.");
		}
	}

	async function handleAddManualSession() {
		if (!selectedSubtopic || !manualMins) return;
		setSavingState("manual");
		try {
			await createManualStudySession({
				subjectId: selectedSubtopic.subjectId,
				topicId: selectedSubtopic.topicId,
				subtopicId: selectedSubtopic.subtopic.id,
				durationMinutes: Number(manualMins),
				notes: sessionNotes || "Manual session logs",
			});
			setManualMins("");
			setSessionNotes("");
			await loadProgress();
		} catch (err: any) {
			alert(err.message);
		} finally {
			setSavingState(null);
		}
	}

	async function handleLogQuestions() {
		if (!selectedSubtopic || (!correctCount && !wrongCount)) return;
		setSavingState("questions");
		const correct = Number(correctCount || 0);
		const wrong = Number(wrongCount || 0);
		try {
			await createQuestionLog({
				subjectId: selectedSubtopic.subjectId,
				topicId: selectedSubtopic.topicId,
				subtopicId: selectedSubtopic.subtopic.id,
				questionsSolved: correct + wrong,
				correct,
				wrong,
				difficulty: questionsDifficulty,
				notes: questionsNotes || undefined,
			});
			setCorrectCount("");
			setWrongCount("");
			setQuestionsNotes("");
			await loadProgress();
		} catch (err: any) {
			alert(err.message);
		} finally {
			setSavingState(null);
		}
	}

	async function handleLogWrongQuestion() {
		if (!selectedSubtopic || !wrongReason) return;
		setSavingState("wrong");
		try {
			const reviewDaysNum = Number(wrongReviewDays || 1);
			const reviewDate = new Date();
			reviewDate.setDate(reviewDate.getDate() + reviewDaysNum);

			await createWrongQuestion({
				subjectId: selectedSubtopic.subjectId,
				topicId: selectedSubtopic.topicId,
				subtopicId: selectedSubtopic.subtopic.id,
				reason: wrongReason,
				difficulty: wrongDifficulty,
				reviewDate: reviewDate.toISOString(),
			});
			setWrongReason("");
			await loadProgress();
		} catch (err: any) {
			alert(err.message);
		} finally {
			setSavingState(null);
		}
	}

	async function handleSaveSubtopicProgress() {
		if (!selectedSubtopic) return;
		setSavingState("progress");
		try {
			await updateSubtopicProgress(selectedSubtopic.subtopic.id, {
				status: isSubtopicCompleted ? "completed" : "in_progress",
				confidence,
				notes: personalNotes || undefined,
			});
			await loadProgress();
		} catch (err: any) {
			alert(err.message || "Failed to update subtopic progress");
		} finally {
			setSavingState(null);
		}
	}

	const formatTimer = (totalSeconds: number) => {
		const hrs = Math.floor(totalSeconds / 3600);
		const mins = Math.floor((totalSeconds % 3600) / 60);
		const secs = totalSeconds % 60;
		return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	if (loading) {
		return (
			<div className='page-frame' style={{ padding: "32px 0", color: "#71717a", textAlign: "center" }}>
				{t("common.loading")}
			</div>
		);
	}

	if (error) {
		return (
			<div className='page-frame' style={{ padding: "32px 0", color: "#ef4444", textAlign: "center" }}>
				<h2 style={{ marginBottom: "12px" }}>{t("common.error")}</h2>
				<p>{error}</p>
			</div>
		);
	}

	const filteredSubjects = progressData.filter((s: SubjectProgress) =>
		s.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className='stack' style={{ gap: "24px", minHeight: "calc(100vh - 120px)" }}>
			<div style={{ display: "grid", gridTemplateColumns: "280px 1fr 340px", gap: "20px", alignItems: "stretch" }}>
				
				{/* COLUMN 1: Subject List Explorer */}
				<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					<Card title={t("subjects.title")} description={t("subjects.subtitle")}>
						<div className='stack' style={{ gap: "12px", marginTop: "4px" }}>
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t("subjects.search_placeholder")}
								className='input'
								style={{ padding: "8px 12px", fontSize: "0.85rem", background: "#ffffff", color: "#18181b", border: "1px solid rgba(0,0,0,0.12)" }}
							/>
							<div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "60vh", overflowY: "auto" }}>
								{filteredSubjects.map((subject) => {
									const isActive = subject.id === selectedSubjectId;
									return (
										<div
											key={subject.id}
											onClick={() => {
												setSelectedSubjectId(subject.id);
												setSelectedSubtopic(null);
											}}
											style={{
												padding: "12px 14px",
												borderRadius: "10px",
												background: isActive ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "rgba(0, 0, 0, 0.02)",
												border: isActive ? "1px solid #4f46e5" : "1px solid rgba(0, 0, 0, 0.06)",
												boxShadow: isActive ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none",
												cursor: "pointer",
												transition: "all 0.15s ease",
												display: "flex",
												flexDirection: "column",
												gap: "6px",
											}}>
											<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
												<span style={{ fontSize: "0.9rem", fontWeight: 700, color: isActive ? "#ffffff" : "#18181b" }}>
													{subject.name}
												</span>
												<Badge tone={isActive ? "brand" : "default"}>{subject.examType.toUpperCase()}</Badge>
											</div>
											<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: isActive ? "rgba(255,255,255,0.85)" : "#52525b" }}>
												<span>{subject.questionsSolved} {t("common.qs")} {t("subjects.solved").toLowerCase()}</span>
												<span style={{ fontWeight: 600 }}>{formatPercent(subject.completionPercentage)}</span>
											</div>
											<ProgressBar value={subject.completionPercentage} />
										</div>
									);
								})}
							</div>
						</div>
					</Card>
				</div>

				{/* COLUMN 2: Topic Explorer Syllabus Tree */}
				<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					{selectedSubject ? (
						<Card title={selectedSubject.name} description={t("subjects.topics_modules_to_study", { count: selectedSubject.topics.length })}>
							<div className='stack' style={{ gap: "14px", maxHeight: "75vh", overflowY: "auto", paddingRight: "4px" }}>
								{selectedSubject.topics.map((topic) => {
									const isExpanded = !!expandedTopics[topic.id];
									return (
										<div
											key={topic.id}
											style={{
												border: "1px solid rgba(0, 0, 0, 0.08)",
												borderRadius: "10px",
												overflow: "hidden",
												background: "#f8f9fa",
												boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
											}}>
											{/* Topic Header */}
											<div
												onClick={() => setExpandedTopics((prev) => ({ ...prev, [topic.id]: !prev[topic.id] }))}
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													padding: "14px 16px",
													background: "#ffffff",
													borderBottom: isExpanded ? "1px solid rgba(0, 0, 0, 0.06)" : "none",
													cursor: "pointer",
													userSelect: "none",
												}}>
												<div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
													<span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#18181b" }}>
														{topic.name}
													</span>
													<div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "#52525b" }}>
														<span>{t("subjects.solved")}: <strong style={{ color: "#18181b" }}>{topic.questionsSolved} {t("common.qs")}</strong></span>
														<span>{t("common.accuracy")}: <strong style={{ color: "#18181b" }}>{formatPercent(topic.accuracyRate)}</strong></span>
													</div>
												</div>
												<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
													<span style={{ fontSize: "0.8rem", color: "#18181b", fontWeight: 700 }}>{formatPercent(topic.completionPercentage)}</span>
													<div style={{ width: "80px" }}>
														<ProgressBar value={topic.completionPercentage} />
													</div>
													<span style={{ fontSize: "0.75rem", color: "#52525b", fontWeight: 700 }}>{isExpanded ? "▲" : "▼"}</span>
												</div>
											</div>

											{/* Expanded Subtopics List */}
											{isExpanded && (
												<div style={{ padding: "10px 12px", background: "#f1f3f5", display: "flex", flexDirection: "column", gap: "6px" }}>
													{topic.subtopics.map((subtopic) => {
														const isSubSelected = selectedSubtopic?.subtopic.id === subtopic.id;
														const isCompleted = subtopic.status === "completed";
														return (
															<div
																key={subtopic.id}
																onClick={() => setSelectedSubtopic({ subtopic, topicId: topic.id, subjectId: selectedSubject.id })}
																style={{
																	display: "flex",
																	justifyContent: "space-between",
																	alignItems: "center",
																	padding: "10px 14px",
																	borderRadius: "8px",
																	background: isSubSelected ? "#eef2ff" : "#ffffff",
																	border: isSubSelected ? "1.5px solid #4f46e5" : "1px solid rgba(0, 0, 0, 0.06)",
																	boxShadow: isSubSelected ? "0 2px 8px rgba(79, 70, 229, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)",
																	cursor: "pointer",
																	transition: "all 0.15s ease",
																}}>
																<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
																	<div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1.5px solid", borderColor: isCompleted ? "#10b981" : "#a1a1aa", background: isCompleted ? "#10b981" : "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
																		{isCompleted && (
																			<svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='#ffffff' strokeWidth='3.5'>
																				<polyline points='20 6 9 17 4 12' />
																			</svg>
																		)}
																	</div>
																	<span style={{ fontSize: "0.88rem", fontWeight: isSubSelected ? 700 : 600, color: isSubSelected ? "#4f46e5" : "#18181b" }}>
																		{subtopic.name}
																	</span>
																</div>
																<div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.78rem", color: "#52525b" }}>
																	<span style={{ fontWeight: 600 }}>{subtopic.timeSpentMinutes} {t("common.mins")}</span>
																	{subtopic.questionsSolved > 0 && (
																		<span style={{ color: "#3f3f46", fontWeight: 500 }}>
																			{subtopic.questionsSolved} {t("common.qs")} ({formatPercent(subtopic.accuracyRate)})
																		</span>
																	)}
																</div>
															</div>
														);
													})}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</Card>
					) : (
						<Card title={t("common.search")} description=''>
							<p className='muted' style={{ textAlign: "center", padding: "32px 0" }}>
								{t("empty.no_data")}
							</p>
						</Card>
					)}
				</div>

				{/* COLUMN 3: Right Side Subtopic Workspace */}
				<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
					{selectedSubtopic ? (
						<Card title={selectedSubtopic.subtopic.name} description={t("subjects.select_subtopic_prompt")}>
							<div className='stack' style={{ gap: "16px", maxHeight: "78vh", overflowY: "auto", paddingRight: "4px" }}>
								
								{/* Study Actions Card (Timer) */}
								<div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
									<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
										<span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#52525b", fontWeight: 700 }}>
											{t("pomodoro.title")}
										</span>
										{isTimerRunning && <Badge tone='brand'>Active</Badge>}
									</div>

									{isTimerRunning ? (
										<div className='stack' style={{ gap: "10px" }}>
											<div style={{ fontSize: "2rem", fontWeight: "800", color: "#4f46e5", textAlign: "center", fontFamily: "monospace" }}>
												{formatTimer(elapsedSeconds)}
											</div>
											<input
												value={sessionNotes}
												onChange={(e) => setSessionNotes(e.target.value)}
												placeholder={t("planner.notes_placeholder")}
												className='input'
												style={{ padding: "8px 10px", fontSize: "0.82rem", background: "#f8f9fa", color: "#18181b", border: "1px solid rgba(0,0,0,0.1)" }}
											/>
											<Button onClick={handleStopTimer} style={{ width: "100%" }}>
												{t("common.save")}
											</Button>
										</div>
									) : (
										<div className='stack' style={{ gap: "10px" }}>
											<Button onClick={handleStartTimer} style={{ width: "100%", justifyContent: "center" }}>
												{t("subjects.start_timer")}
											</Button>

											{/* Manual Log option */}
											<div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
												<input
													type='number'
													value={manualMins}
													onChange={(e) => setManualMins(e.target.value)}
													placeholder={t("pomodoro.focus_mins")}
													className='input'
													style={{ padding: "7px 10px", fontSize: "0.82rem", background: "#f8f9fa", color: "#18181b", border: "1px solid rgba(0,0,0,0.1)" }}
												/>
												<Button
													onClick={handleAddManualSession}
													disabled={savingState === "manual" || !manualMins}
													style={{ padding: "8px 14px", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
													{savingState === "manual" ? "..." : t("subjects.log_manual")}
												</Button>
											</div>
										</div>
									)}
								</div>

								{/* Log Questions solved */}
								<div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }} className='stack'>
									<span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#52525b", fontWeight: 700, marginBottom: "4px" }}>
										{t("subjects.log_questions")}
									</span>
									<div style={{ display: "flex", gap: "8px" }}>
										<input
											type='number'
											value={correctCount}
											onChange={(e) => setCorrectCount(e.target.value)}
											placeholder={t("mock_exams.correct")}
											className='input'
											style={{ padding: "8px 10px", fontSize: "0.82rem", background: "#f8f9fa", color: "#18181b", border: "1px solid rgba(0,0,0,0.1)" }}
										/>
										<input
											type='number'
											value={wrongCount}
											onChange={(e) => setWrongCount(e.target.value)}
											placeholder={t("mock_exams.wrong")}
											className='input'
											style={{ padding: "8px 10px", fontSize: "0.82rem", background: "#f8f9fa", color: "#18181b", border: "1px solid rgba(0,0,0,0.1)" }}
										/>
									</div>
									<input
										value={questionsNotes}
										onChange={(e) => setQuestionsNotes(e.target.value)}
										placeholder={t("planner.notes_placeholder")}
										className='input'
										style={{ padding: "8px 10px", fontSize: "0.82rem", background: "#f8f9fa", color: "#18181b", border: "1px solid rgba(0,0,0,0.1)", marginTop: "4px" }}
									/>
									<Button
										onClick={handleLogQuestions}
										disabled={savingState === "questions" || (!correctCount && !wrongCount)}
										style={{ width: "100%", marginTop: "8px", justifyContent: "center" }}>
										{savingState === "questions" ? t("common.saving") : t("subjects.log_questions")}
									</Button>
								</div>

								{/* Log Wrong Questions */}
								{Number(wrongCount) > 0 && (
									<div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px" }} className='stack'>
										<span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#dc2626", fontWeight: 700, marginBottom: "4px" }}>
											{t("subjects.log_wrong")}
										</span>
										<input
											value={wrongReason}
											onChange={(e) => setWrongReason(e.target.value)}
											placeholder={t("subjects.log_wrong")}
											className='input'
											style={{ padding: "8px 10px", fontSize: "0.82rem", background: "#ffffff", color: "#18181b", border: "1px solid #fca5a5" }}
										/>
										<Button
											variant='secondary'
											onClick={handleLogWrongQuestion}
											disabled={savingState === "wrong" || !wrongReason}
											style={{ width: "100%", marginTop: "6px", justifyContent: "center" }}>
											{savingState === "wrong" ? "..." : t("subjects.log_wrong")}
										</Button>
									</div>
								)}

								{/* Subtopic Workspace Options (Confidence, Notes, Checkbox) */}
								<div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px", padding: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }} className='stack'>
									<span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#52525b", fontWeight: 700 }}>
										{t("subjects.confidence")}
									</span>

									<div className='stack' style={{ gap: "4px", marginTop: "6px" }}>
										<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
											<span style={{ color: "#52525b", fontWeight: 500 }}>{t("subjects.confidence")}:</span>
											<span style={{ color: "#18181b", fontWeight: 700 }}>{confidence} / 5</span>
										</div>
										<input
											type='range'
											min='1'
											max='5'
											value={confidence}
											onChange={(e) => setConfidence(Number(e.target.value))}
											style={{ width: "100%", cursor: "pointer", accentColor: "#4f46e5" }}
										/>
									</div>

									<div className='stack' style={{ gap: "4px", marginTop: "6px" }}>
										<label style={{ fontSize: "0.8rem", color: "#52525b", fontWeight: 600 }}>{t("subjects.notes")}:</label>
										<textarea
											value={personalNotes}
											onChange={(e) => setPersonalNotes(e.target.value)}
											placeholder={t("planner.desc_placeholder")}
											style={{ width: "100%", minHeight: "80px", background: "#f8f9fa", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "6px", padding: "8px 10px", color: "#18181b", fontSize: "0.82rem", resize: "vertical" }}
										/>
									</div>

									<div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
										<input
											type='checkbox'
											id='subtopic-complete-chk'
											checked={isSubtopicCompleted}
											onChange={(e) => setIsSubtopicCompleted(e.target.checked)}
											style={{ cursor: "pointer", accentColor: "#10b981", width: "18px", height: "18px" }}
										/>
										<label htmlFor='subtopic-complete-chk' style={{ fontSize: "0.85rem", color: "#18181b", fontWeight: 600, cursor: "pointer", userSelect: "none" }}>
											{t("subjects.mark_completed")}
										</label>
									</div>

									<Button
										onClick={handleSaveSubtopicProgress}
										disabled={savingState === "progress"}
										style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}>
										{savingState === "progress" ? t("common.saving") : t("common.save")}
									</Button>
								</div>
							</div>
						</Card>
					) : (
						<Card title={t("subjects.workspace_title")} description={t("subjects.select_subtopic_prompt")}>
							<p className='muted' style={{ textAlign: "center", padding: "32px 0" }}>
								{t("subjects.no_subtopic_loaded")}
							</p>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
