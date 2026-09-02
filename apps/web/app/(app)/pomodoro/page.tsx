/** @format */

"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { CircularTimer } from "@/components/focus/CircularTimer";
import { SettingsDrawer, type FocusSettings } from "@/components/focus/SettingsDrawer";
import { ambientEngine } from "@/lib/ambient-sound";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
	getCurriculumHierarchy,
	getStudySessions,
	getAnalyticsFoundation,
	createManualStudySession,
	createQuestionLog,
	updateSubtopicProgress,
} from "@/lib/study";

interface SubjectItem {
	id: string;
	name: string;
	code: string;
	topics?: TopicItem[];
}

interface TopicItem {
	id: string;
	name: string;
	subtopics?: SubtopicItem[];
}

interface SubtopicItem {
	id: string;
	name: string;
}

type TimerMode = "focus" | "short_break" | "long_break";

export default function PomodoroPage() {
	const { t } = useTranslation();
	const searchParams = useSearchParams();

	// Curriculum Data & Selections
	const [subjects, setSubjects] = useState<SubjectItem[]>([]);
	const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
	const [selectedTopicId, setSelectedTopicId] = useState<string>("");
	const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>("");
	const [questionsSolved, setQuestionsSolved] = useState<number>(0);

	// Timer Preset Modes (focusMinutes / breakMinutes)
	const [focusMinutes, setFocusMinutes] = useState<number>(25);
	const [breakMinutes, setBreakMinutes] = useState<number>(5);
	const [activePreset, setActivePreset] = useState<"25/5" | "50/10" | "90/20" | "custom">("25/5");

	// Timer Execution State
	const [mode, setMode] = useState<TimerMode>("focus");
	const [totalDuration, setTotalDuration] = useState<number>(25 * 60);
	const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Settings Drawer State
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
	const [settings, setSettings] = useState<FocusSettings>({
		autoStartBreaks: true,
		autoStartNextSession: false,
		notificationSound: true,
		volume: 0.8,
		ambientSound: "none",
		ambientVolume: 0.5,
	});

	// Metrics & History
	const [analytics, setAnalytics] = useState<any | null>(null);
	const [recentSessions, setRecentSessions] = useState<any[]>([]);
	const [completedPomodorosCount, setCompletedPomodorosCount] = useState<number>(0);
	const [longestSessionMinutes, setLongestSessionMinutes] = useState<number>(0);
	const [savingSession, setSavingSession] = useState<boolean>(false);

	// Initial Load: Fetch Curriculum and Analytics
	useEffect(() => {
		let isMounted = true;

		async function initData() {
			try {
				const [hierarchy, analyticsData, sessionsData] = await Promise.all([
					getCurriculumHierarchy(),
					getAnalyticsFoundation().catch(() => null),
					getStudySessions().catch(() => []),
				]);

				if (!isMounted) return;

				setSubjects(hierarchy || []);
				if (analyticsData) setAnalytics(analyticsData);
				if (Array.isArray(sessionsData)) {
					setRecentSessions(sessionsData);
					calculateSessionStats(sessionsData);
				}

				// Check URL Search Params for Pre-selection from Subjects module
				const paramSubId = searchParams.get("subjectId");
				const paramTopId = searchParams.get("topicId");
				const paramSubtopId = searchParams.get("subtopicId");

				if (paramSubId && hierarchy) {
					setSelectedSubjectId(paramSubId);
					const sub = hierarchy.find((s: SubjectItem) => s.id === paramSubId);
					if (sub && paramTopId && sub.topics) {
						setSelectedTopicId(paramTopId);
						const top = sub.topics.find((t: TopicItem) => t.id === paramTopId);
						if (top && paramSubtopId && top.subtopics) {
							setSelectedSubtopicId(paramSubtopId);
						}
					}
				} else if (hierarchy && hierarchy.length > 0) {
					setSelectedSubjectId(hierarchy[0].id);
				}
			} catch (err) {
				console.error("Failed to load Focus Center data:", err);
			}
		}

		initData();

		return () => {
			isMounted = false;
		};
	}, [searchParams]);

	// Calculate session stats from history
	const calculateSessionStats = (sessions: any[]) => {
		const todayStr = new Date().toISOString().split("T")[0];
		let pCount = 0;
		let maxDuration = 0;

		for (const s of sessions) {
			const sDate = s.createdAt ? new Date(s.createdAt).toISOString().split("T")[0] : "";
			if (sDate === todayStr) {
				pCount += 1;
			}
			if (s.durationMinutes > maxDuration) {
				maxDuration = s.durationMinutes;
			}
		}

		setCompletedPomodorosCount(pCount);
		setLongestSessionMinutes(maxDuration);
	};

	// Cascade Topic selection when Subject changes
	const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
	const availableTopics = currentSubject?.topics || [];
	const currentTopic = availableTopics.find((t) => t.id === selectedTopicId);
	const availableSubtopics = currentTopic?.subtopics || [];

	const handleSubjectChange = (subId: string) => {
		setSelectedSubjectId(subId);
		const sub = subjects.find((s) => s.id === subId);
		const firstTopic = sub?.topics?.[0];
		setSelectedTopicId(firstTopic?.id || "");
		setSelectedSubtopicId(firstTopic?.subtopics?.[0]?.id || "");
	};

	const handleTopicChange = (topId: string) => {
		setSelectedTopicId(topId);
		const top = availableTopics.find((t) => t.id === topId);
		setSelectedSubtopicId(top?.subtopics?.[0]?.id || "");
	};

	// Ambient Audio Management
	useEffect(() => {
		if (settings.ambientSound !== "none" && isRunning) {
			ambientEngine.play(settings.ambientSound, settings.ambientVolume);
		} else {
			ambientEngine.stop();
		}
		return () => {
			ambientEngine.stop();
		};
	}, [settings.ambientSound, settings.ambientVolume, isRunning]);

	// Update Preset & Durations
	const applyPreset = (preset: "25/5" | "50/10" | "90/20" | "custom", fMin?: number, bMin?: number) => {
		setIsRunning(false);
		setActivePreset(preset);

		let f = 25;
		let b = 5;
		if (preset === "25/5") {
			f = 25;
			b = 5;
		} else if (preset === "50/10") {
			f = 50;
			b = 10;
		} else if (preset === "90/20") {
			f = 90;
			b = 20;
		} else if (preset === "custom") {
			f = fMin ?? focusMinutes;
			b = bMin ?? breakMinutes;
		}

		setFocusMinutes(f);
		setBreakMinutes(b);

		const sec = (mode === "focus" ? f : b) * 60;
		setTotalDuration(sec);
		setTimeLeft(sec);
	};

	// Automatic Session Save Logic when Focus Timer Finishes
	const handleTimerCompletion = useCallback(async () => {
		if (mode === "focus") {
			setSavingSession(true);
			try {
				if (settings.notificationSound) {
					ambientEngine.playChime(settings.volume);
				}

				const durationMins = focusMinutes;
				await createManualStudySession({
					subjectId: selectedSubjectId || undefined,
					topicId: selectedTopicId || undefined,
					subtopicId: selectedSubtopicId || undefined,
					durationMinutes: durationMins,
					notes: `Completed Pomodoro focus session (${activePreset})`,
				});

				if (questionsSolved > 0) {
					await createQuestionLog({
						subjectId: selectedSubjectId || undefined,
						topicId: selectedTopicId || undefined,
						subtopicId: selectedSubtopicId || undefined,
						questionsSolved,
						correct: questionsSolved,
						wrong: 0,
					}).catch(() => null);
				}

				if (selectedSubtopicId) {
					await updateSubtopicProgress(selectedSubtopicId, {
						status: "in_progress",
					}).catch(() => null);
				}

				const [updatedAnalytics, updatedSessions] = await Promise.all([
					getAnalyticsFoundation().catch(() => null),
					getStudySessions().catch(() => []),
				]);
				if (updatedAnalytics) setAnalytics(updatedAnalytics);
				if (Array.isArray(updatedSessions)) {
					setRecentSessions(updatedSessions);
					calculateSessionStats(updatedSessions);
				}

				setMode("short_break");
				const breakSec = breakMinutes * 60;
				setTotalDuration(breakSec);
				setTimeLeft(breakSec);

				if (settings.autoStartBreaks) {
					setIsRunning(true);
				} else {
					setIsRunning(false);
				}
			} catch (err) {
				console.error("Failed to auto-save study session:", err);
				setIsRunning(false);
			} finally {
				setSavingSession(false);
			}
		} else {
			if (settings.notificationSound) {
				ambientEngine.playChime(settings.volume);
			}
			setMode("focus");
			const focusSec = focusMinutes * 60;
			setTotalDuration(focusSec);
			setTimeLeft(focusSec);

			if (settings.autoStartNextSession) {
				setIsRunning(true);
			} else {
				setIsRunning(false);
			}
		}
	}, [
		mode,
		focusMinutes,
		breakMinutes,
		selectedSubjectId,
		selectedTopicId,
		selectedSubtopicId,
		questionsSolved,
		activePreset,
		settings,
	]);

	// Timer Interval Loop
	useEffect(() => {
		if (isRunning) {
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						if (timerRef.current) clearInterval(timerRef.current);
						handleTimerCompletion();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			if (timerRef.current) clearInterval(timerRef.current);
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [isRunning, handleTimerCompletion]);

	// Controls
	const toggleStartPause = () => {
		setIsRunning(!isRunning);
	};

	const resetTimer = () => {
		setIsRunning(false);
		const sec = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
		setTimeLeft(sec);
	};

	const skipBreak = () => {
		setIsRunning(false);
		setMode("focus");
		const focusSec = focusMinutes * 60;
		setTotalDuration(focusSec);
		setTimeLeft(focusSec);
	};

	// Metric helper getters
	const todayMinutes = analytics?.study?.todayMinutes ?? 0;
	const todayHoursFormatted =
		todayMinutes >= 60
			? `${(todayMinutes / 60).toFixed(1)} h`
			: `${todayMinutes} m`;

	const weeklyMinutes = analytics?.study?.weeklyMinutes ?? 0;
	const weeklyHoursFormatted =
		weeklyMinutes >= 60
			? `${(weeklyMinutes / 60).toFixed(1)} h`
			: `${weeklyMinutes} m`;

	const currentStreak = analytics?.study?.currentStreak ?? 0;

	return (
		<div className='stack' style={{ gap: "28px", paddingBottom: "40px" }}>
			{/* Page Header */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<div>
					<h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#18181b", margin: 0 }}>
						{t("pomodoro.title")}
					</h1>
					<p style={{ fontSize: "0.9rem", color: "#52525b", marginTop: "4px", margin: 0 }}>
						{t("pomodoro.subtitle")}
					</p>
				</div>
				<Button
					variant='secondary'
					onClick={() => setIsSettingsOpen(true)}
					style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span>⚙️</span>
					<span>{t("pomodoro.settings")}</span>
				</Button>
			</div>

			{/* Main Grid: Left Side (Timer) & Right Side (Focus Metrics) */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 380px",
					gap: "24px",
					alignItems: "start",
				}}>
				{/* LEFT SIDE: Circular Timer, Preset Selectors & Subject Picker */}
				<Card title={t("pomodoro.title")} description={t("pomodoro.subtitle")}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "28px",
							padding: "16px 0",
						}}>
						{/* Mode Presets */}
						<div
							style={{
								display: "flex",
								gap: "8px",
								background: "#f4f4f5",
								padding: "6px",
								borderRadius: "10px",
								width: "100%",
								justifyContent: "center",
								flexWrap: "wrap",
							}}>
							{(["25/5", "50/10", "90/20", "custom"] as const).map((preset) => {
								const active = activePreset === preset;
								return (
									<button
										key={preset}
										onClick={() => applyPreset(preset)}
										style={{
											padding: "8px 20px",
											borderRadius: "8px",
											border: "none",
											background: active ? "#ffffff" : "transparent",
											color: active ? "#4f46e5" : "#52525b",
											fontWeight: active ? 700 : 500,
											fontSize: "0.88rem",
											cursor: "pointer",
											boxShadow: active ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
											transition: "all 0.15s ease",
										}}>
										{preset === "custom" ? t("pomodoro.custom") : preset}
									</button>
								);
							})}
						</div>

						{/* Custom Minutes Input if Custom Preset Active */}
						{activePreset === "custom" && (
							<div
								style={{
									display: "flex",
									gap: "20px",
									alignItems: "center",
									justifyContent: "center",
									width: "100%",
									background: "#f8f9fa",
									padding: "14px",
									borderRadius: "10px",
									border: "1px solid rgba(0,0,0,0.06)",
								}}>
								<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#18181b" }}>
									{t("pomodoro.focus_mins")}:
									<input
										type='number'
										min='1'
										max='180'
										value={focusMinutes}
										onChange={(e) => {
											const val = Math.max(1, parseInt(e.target.value) || 1);
											applyPreset("custom", val, breakMinutes);
										}}
										style={{
											width: "70px",
											marginLeft: "8px",
											padding: "6px 10px",
											borderRadius: "6px",
											border: "1px solid rgba(0,0,0,0.12)",
											background: "#ffffff",
											color: "#18181b",
										}}
									/>
								</label>
								<label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#18181b" }}>
									{t("pomodoro.break_mins")}:
									<input
										type='number'
										min='1'
										max='60'
										value={breakMinutes}
										onChange={(e) => {
											const val = Math.max(1, parseInt(e.target.value) || 1);
											applyPreset("custom", focusMinutes, val);
										}}
										style={{
											width: "70px",
											marginLeft: "8px",
											padding: "6px 10px",
											borderRadius: "6px",
											border: "1px solid rgba(0,0,0,0.12)",
											background: "#ffffff",
											color: "#18181b",
										}}
									/>
								</label>
							</div>
						)}

						{/* Large Circular Timer */}
						<CircularTimer
							mode={mode}
							timeLeft={timeLeft}
							totalDuration={totalDuration}
							isRunning={isRunning}
						/>

						{/* Timer Control Buttons */}
						<div
							style={{
								display: "flex",
								gap: "12px",
								width: "100%",
								justifyContent: "center",
								flexWrap: "wrap",
							}}>
							<Button
								onClick={toggleStartPause}
								disabled={savingSession}
								style={{
									minWidth: "140px",
									padding: "12px 28px",
									fontSize: "0.95rem",
									justifyContent: "center",
								}}>
								{isRunning
									? t("pomodoro.pause")
									: timeLeft < totalDuration
									? t("pomodoro.resume")
									: t("pomodoro.start")}
							</Button>

							<Button
								variant='secondary'
								onClick={resetTimer}
								disabled={savingSession}
								style={{ padding: "12px 24px" }}>
								{t("pomodoro.reset")}
							</Button>

							{mode !== "focus" && (
								<Button
									variant='secondary'
									onClick={skipBreak}
									style={{ padding: "12px 24px" }}>
									{t("pomodoro.skip_break")}
								</Button>
							)}
						</div>

						{/* Current Session Target Selection */}
						<div
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								gap: "16px",
								borderTop: "1px solid rgba(0,0,0,0.08)",
								paddingTop: "24px",
							}}>
							<h3
								style={{
									fontSize: "0.95rem",
									fontWeight: 700,
									margin: 0,
									color: "#18181b",
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}>
								<span>📚</span> {t("pomodoro.target_title")}
							</h3>

							<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
								<div>
									<label
										style={{
											fontSize: "0.8rem",
											color: "#52525b",
											fontWeight: 600,
											display: "block",
											marginBottom: "4px",
										}}>
										{t("pomodoro.subject")}
									</label>
									<select
										value={selectedSubjectId}
										onChange={(e) => handleSubjectChange(e.target.value)}
										style={{
											width: "100%",
											padding: "10px 14px",
											borderRadius: "8px",
											border: "1px solid rgba(0,0,0,0.12)",
											background: "#ffffff",
											color: "#18181b",
											fontSize: "0.88rem",
										}}>
										{subjects.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name} ({s.code.toUpperCase()})
											</option>
										))}
									</select>
								</div>

								<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
									<div>
										<label
											style={{
												fontSize: "0.8rem",
												color: "#52525b",
												fontWeight: 600,
												display: "block",
												marginBottom: "4px",
											}}>
											{t("pomodoro.topic")}
										</label>
										<select
											value={selectedTopicId}
											onChange={(e) => handleTopicChange(e.target.value)}
											disabled={availableTopics.length === 0}
											style={{
												width: "100%",
												padding: "10px 14px",
												borderRadius: "8px",
												border: "1px solid rgba(0,0,0,0.12)",
												background: "#ffffff",
												color: "#18181b",
												fontSize: "0.88rem",
											}}>
											{availableTopics.map((tItem) => (
												<option key={tItem.id} value={tItem.id}>
													{tItem.name}
												</option>
											))}
										</select>
									</div>

									<div>
										<label
											style={{
												fontSize: "0.8rem",
												color: "#52525b",
												fontWeight: 600,
												display: "block",
												marginBottom: "4px",
											}}>
											{t("pomodoro.subtopic")}
										</label>
										<select
											value={selectedSubtopicId}
											onChange={(e) => setSelectedSubtopicId(e.target.value)}
											disabled={availableSubtopics.length === 0}
											style={{
												width: "100%",
												padding: "10px 14px",
												borderRadius: "8px",
												border: "1px solid rgba(0,0,0,0.12)",
												background: "#ffffff",
												color: "#18181b",
												fontSize: "0.88rem",
											}}>
											{availableSubtopics.map((st) => (
												<option key={st.id} value={st.id}>
													{st.name}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Questions Solved Logger & Goal Info */}
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										background: "#f8f9fa",
										border: "1px solid rgba(0,0,0,0.06)",
										padding: "12px 16px",
										borderRadius: "8px",
										marginTop: "4px",
									}}>
									<div>
										<strong style={{ fontSize: "0.85rem", display: "block", color: "#18181b" }}>
											{t("pomodoro.estimated_goal")}
										</strong>
										<span style={{ fontSize: "0.78rem", color: "#52525b" }}>
											{focusMinutes} min session
										</span>
									</div>

									<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
										<label style={{ fontSize: "0.8rem", color: "#52525b", fontWeight: 600 }}>
											{t("pomodoro.questions_input")}:
										</label>
										<input
											type='number'
											min='0'
											value={questionsSolved}
											onChange={(e) =>
												setQuestionsSolved(Math.max(0, parseInt(e.target.value) || 0))
											}
											style={{
												width: "65px",
												padding: "6px 8px",
												borderRadius: "6px",
												border: "1px solid rgba(0,0,0,0.12)",
												background: "#ffffff",
												color: "#18181b",
												textAlign: "center",
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* RIGHT SIDE: Today's Focus Metrics Cards */}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<Card title={t("pomodoro.focus_summary")} description=''>
						<div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
							<StatCard
								label={t("pomodoro.today_time")}
								value={todayHoursFormatted}
							/>

							<StatCard
								label={t("pomodoro.completed_pomodoros")}
								value={String(completedPomodorosCount)}
							/>

							<StatCard
								label={t("pomodoro.longest_session")}
								value={`${longestSessionMinutes} min`}
							/>

							<StatCard
								label={t("pomodoro.streak")}
								value={`${currentStreak} days 🔥`}
							/>

							<StatCard
								label={t("pomodoro.weekly_focus")}
								value={weeklyHoursFormatted}
							/>
						</div>
					</Card>
				</div>
			</div>

			{/* Settings Drawer */}
			<SettingsDrawer
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				settings={settings}
				onUpdateSettings={(newSettings) =>
					setSettings((prev) => ({ ...prev, ...newSettings }))
				}
			/>
		</div>
	);
}
