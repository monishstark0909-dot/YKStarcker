/** @format */

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/i18n-context";
import {
	getCurriculumHierarchy,
	getTodayTasks,
	getWeekTasks,
	getMonthTasks,
	createStudyTask,
	createRevisionTask,
	updateStudyTask,
	updateRevisionTask,
	deleteStudyTask,
	deleteRevisionTask,
	getWrongQuestions,
} from "@/lib/study";

type CurriculumSubject = {
	id: string;
	name: string;
	slug: string;
	examType: string;
	topics: {
		id: string;
		name: string;
		slug: string;
		subtopics: {
			id: string;
			name: string;
			slug: string;
		}[];
	}[];
};

type TaskItem = {
	id: string;
	title: string;
	description: string | null;
	subjectId: string | null;
	topicId: string | null;
	subtopicId: string | null;
	wrongQuestionId?: string | null;
	date: string;
	startTime: string | null;
	endTime: string | null;
	estimatedDuration: number | null;
	priority: string;
	status: "planned" | "completed" | "skipped";
	recurrence: string;
	notes: string | null;
	subject: { name: string; slug: string; examType: string } | null;
	topic: { name: string } | null;
	subtopic: { name: string } | null;
	taskType: "study" | "revision";
};

export default function PlannerPage() {
	const { t, formatDate } = useTranslation();
	const [hierarchy, setHierarchy] = useState<CurriculumSubject[]>([]);
	const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);
	const [studyTasks, setStudyTasks] = useState<TaskItem[]>([]);
	const [revisionTasks, setRevisionTasks] = useState<TaskItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// View filters: "today" | "week" | "month"
	const [viewFilter, setViewFilter] = useState<"today" | "week" | "month">("today");

	// Task Creation states
	const [taskType, setTaskType] = useState<"study" | "revision">("study");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [estimatedDuration, setEstimatedDuration] = useState("");
	const [priority, setPriority] = useState("medium");
	const [recurrence, setRecurrence] = useState("none");
	const [selectedSubjectId, setSelectedSubjectId] = useState("");
	const [selectedTopicId, setSelectedTopicId] = useState("");
	const [selectedSubtopicId, setSelectedSubtopicId] = useState("");
	const [wrongQuestionId, setWrongQuestionId] = useState("");
	const [notes, setNotes] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let isMounted = true;

		async function loadHierarchyAndMocks() {
			try {
				const [currHierarchy, wrongQList] = await Promise.all([
					getCurriculumHierarchy(),
					getWrongQuestions("pending"),
				]);
				if (!isMounted) return;
				setHierarchy(currHierarchy);
				setWrongQuestions(wrongQList);
			} catch (err: any) {
				if (isMounted) setError(err.message || t("common.error"));
			}
		}

		loadHierarchyAndMocks();

		return () => {
			isMounted = false;
		};
	}, []);

	// Subject localization helper
	const localizeSubject = (name: string, slug: string) => {
		const key = `mock_exams.${slug.replace(/-/g, "_")}`;
		const val = t(key);
		return val !== key ? val : name;
	};

	const fetchTasksForCurrentFilter = async () => {
		try {
			let res: { studyTasks: any[]; revisionTasks: any[] };
			if (viewFilter === "today") {
				res = await getTodayTasks();
			} else if (viewFilter === "week") {
				res = await getWeekTasks();
			} else {
				res = await getMonthTasks();
			}

			const formattedStudy = res.studyTasks.map((tItem) => ({ ...tItem, taskType: "study" as const }));
			const formattedRevision = res.revisionTasks.map((tItem) => ({ ...tItem, taskType: "revision" as const }));

			setStudyTasks(formattedStudy);
			setRevisionTasks(formattedRevision);
		} catch (err: any) {
			setError(err.message || t("common.error"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setLoading(true);
		fetchTasksForCurrentFilter();
	}, [viewFilter]);

	const selectedSubject = hierarchy.find((s) => s.id === selectedSubjectId);
	const selectedTopic = selectedSubject?.topics.find((topicItem) => topicItem.id === selectedTopicId);

	const handleSubjectChange = (id: string) => {
		setSelectedSubjectId(id);
		setSelectedTopicId("");
		setSelectedSubtopicId("");
	};

	const handleTopicChange = (id: string) => {
		setSelectedTopicId(id);
		setSelectedSubtopicId("");
	};

	const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!title.trim() || !date) {
			setError(t("auth.required_field"));
			return;
		}

		setError(null);
		setSubmitting(true);

		try {
			const basePayload = {
				title: title.trim(),
				description: description.trim() || undefined,
				subjectId: selectedSubjectId || undefined,
				topicId: selectedTopicId || undefined,
				subtopicId: selectedSubtopicId || undefined,
				date: new Date(date).toISOString(),
				startTime: startTime || undefined,
				endTime: endTime || undefined,
				estimatedDuration: estimatedDuration ? Number(estimatedDuration) : undefined,
				priority,
				recurrence,
				notes: notes.trim() || undefined,
			};

			if (taskType === "study") {
				await createStudyTask(basePayload);
			} else {
				await createRevisionTask({
					...basePayload,
					wrongQuestionId: wrongQuestionId || undefined,
				});
			}

			// Reset Form
			setTitle("");
			setDescription("");
			setDate("");
			setStartTime("");
			setEndTime("");
			setEstimatedDuration("");
			setNotes("");
			setSelectedSubjectId("");
			setSelectedTopicId("");
			setSelectedSubtopicId("");
			setWrongQuestionId("");

			// Reload tasks
			fetchTasksForCurrentFilter();
		} catch (err: any) {
			setError(err.message || t("common.error"));
		} finally {
			setSubmitting(false);
		}
	};

	const handleUpdateStatus = async (item: TaskItem, newStatus: "planned" | "completed" | "skipped") => {
		setError(null);
		try {
			if (item.taskType === "study") {
				await updateStudyTask(item.id, { status: newStatus });
			} else {
				await updateRevisionTask(item.id, { status: newStatus });
			}
			fetchTasksForCurrentFilter();
		} catch (err: any) {
			setError(err.message || t("common.error"));
		}
	};

	const handleDeleteTask = async (item: TaskItem) => {
		setError(null);
		try {
			if (item.taskType === "study") {
				await deleteStudyTask(item.id);
			} else {
				await deleteRevisionTask(item.id);
			}
			fetchTasksForCurrentFilter();
		} catch (err: any) {
			setError(err.message || t("common.error"));
		}
	};

	// Merge and sort tasks by date/time
	const allTasks = [...studyTasks, ...revisionTasks].sort((a, b) => {
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		if (dateA !== dateB) return dateA - dateB;

		const timeA = a.startTime ? a.startTime : "00:00";
		const timeB = b.startTime ? b.startTime : "00:00";
		return timeA.localeCompare(timeB);
	});

	if (loading && allTasks.length === 0) {
		return (
			<div className='page-frame' style={{ padding: "32px 0" }}>
				{t("common.loading")}
			</div>
		);
	}

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div className='row' style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div className='stack' style={{ gap: "4px" }}>
					<span className='badge badge--brand' style={{ width: "fit-content" }}>{t("planner.badge")}</span>
					<h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("planner.title")}</h1>
				</div>

				<div className='row' style={{ gap: "8px" }}>
					<Button variant={viewFilter === "today" ? "primary" : "secondary"} onClick={() => setViewFilter("today")}>
						{t("planner.today")}
					</Button>
					<Button variant={viewFilter === "week" ? "primary" : "secondary"} onClick={() => setViewFilter("week")}>
						{t("planner.this_week")}
					</Button>
					<Button variant={viewFilter === "month" ? "primary" : "secondary"} onClick={() => setViewFilter("month")}>
						{t("planner.this_month")}
					</Button>
				</div>
			</div>

			{error ? (
				<p className='auth-error' role='alert' style={{ margin: 0 }}>
					{error}
				</p>
			) : null}

			<div className='field-grid' style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
				{/* Left Column: Tasks List */}
				<Card title={t("planner.schedule_title")} description={`${t("planner.planned_for_today")}`}>
					{allTasks.length === 0 ? (
						<p className='muted' style={{ textAlign: "center", padding: "32px 0" }}>
							📅 {t("planner.no_tasks_organized")}
						</p>
					) : (
						<div className='stack' style={{ gap: "16px" }}>
							{allTasks.map((task) => (
								<div
									key={task.id}
									style={{
										padding: "16px",
										borderRadius: "8px",
										border: "1px solid var(--border)",
										background: "rgba(255,255,255,0.01)",
									}}
									className='stack'>
									<div className='row' style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
										<div className='stack' style={{ gap: "4px" }}>
											<div className='row' style={{ gap: "8px", alignItems: "center" }}>
												<strong style={{ fontSize: "1.05rem" }}>{task.title}</strong>
												<Badge tone={task.taskType === "study" ? "brand" : "warning"}>
													{task.taskType === "study" ? t("planner.study_task_btn") : t("planner.revision_task_btn")}
												</Badge>
												<Badge tone={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"}>
													{t(`common.${task.priority}`)}
												</Badge>
											</div>

											{task.subject && (
												<div className='row' style={{ gap: "6px", flexWrap: "wrap", fontSize: "0.8rem" }}>
													<span className='muted'>{localizeSubject(task.subject.name, task.subject.slug)}</span>
													{task.topic && <span className='muted'>› {task.topic.name}</span>}
													{task.subtopic && <span className='muted'>› {task.subtopic.name}</span>}
												</div>
											)}

											{task.description && <p className='muted' style={{ margin: "6px 0 0 0", fontSize: "0.9rem" }}>{task.description}</p>}
											{task.notes && <p className='muted' style={{ margin: "2px 0 0 0", fontSize: "0.8rem", fontStyle: "italic" }}>{t("planner.notes")}: {task.notes}</p>}
										</div>

										<div className='stack' style={{ alignItems: "flex-end", gap: "4px" }}>
											<strong style={{ color: "var(--brand)", fontSize: "0.9rem" }}>
												{formatDate(task.date)}
												{task.startTime && ` @ ${new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`}
											</strong>
											{task.estimatedDuration && <span className='muted' style={{ fontSize: "0.75rem" }}>{t("planner.est_duration")}: {task.estimatedDuration} {t("common.mins")}</span>}
											<div style={{ marginTop: "4px" }}>
												<Badge tone={task.status === "completed" ? "success" : task.status === "skipped" ? "danger" : "default"}>
													{task.status.toUpperCase()}
												</Badge>
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className='row' style={{ gap: "8px", justifyContent: "flex-end", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
										{task.status !== "completed" && (
											<Button onClick={() => handleUpdateStatus(task, "completed")} style={{ fontSize: "0.8rem", padding: "4px 8px", background: "#22c55e", color: "#fff" }}>
												✓ {t("common.completed")}
											</Button>
										)}
										{task.status !== "skipped" && (
											<Button onClick={() => handleUpdateStatus(task, "skipped")} variant='secondary' style={{ fontSize: "0.8rem", padding: "4px 8px", color: "#ef4444" }}>
												✗ {t("common.skip")}
											</Button>
										)}
										{task.status !== "planned" && (
											<Button onClick={() => handleUpdateStatus(task, "planned")} variant='secondary' style={{ fontSize: "0.8rem", padding: "4px 8px" }}>
												{t("common.in_progress")}
											</Button>
										)}
										<Button onClick={() => handleDeleteTask(task)} variant='secondary' style={{ fontSize: "0.8rem", padding: "4px 8px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
											{t("common.delete")}
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</Card>

				{/* Right Column: Create Task Form */}
				<Card title={t("planner.form_title")} description={t("planner.form_sub")}>
					<form className='form' onSubmit={handleCreateTask}>
						<div className='row' style={{ gap: "8px", marginBottom: "12px" }}>
							<Button
								type='button'
								variant={taskType === "study" ? "primary" : "secondary"}
								onClick={() => setTaskType("study")}
								style={{ flex: 1, justifyContent: "center" }}>
								{t("planner.study_task_btn")}
							</Button>
							<Button
								type='button'
								variant={taskType === "revision" ? "primary" : "secondary"}
								onClick={() => setTaskType("revision")}
								style={{ flex: 1, justifyContent: "center" }}>
								{t("planner.revision_task_btn")}
							</Button>
						</div>

						<Input
							label={t("planner.task_title")}
							name='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t("planner.task_title_placeholder")}
							required
						/>

						<label className='field'>
							<span>{t("planner.description")}</span>
							<textarea
								className='input'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t("planner.desc_placeholder")}
								rows={2}
							/>
						</label>

						<div className='field-grid'>
							<Input
								label={t("planner.date")}
								name='date'
								type='date'
								value={date}
								onChange={(e) => setDate(e.target.value)}
								required
							/>

							<Input
								label={t("planner.est_duration")}
								name='estimatedDuration'
								type='number'
								min='1'
								value={estimatedDuration}
								onChange={(e) => setEstimatedDuration(e.target.value)}
								placeholder='60'
							/>
						</div>

						<div className='field-grid'>
							<Input
								label={t("planner.start_time")}
								name='startTime'
								type='time'
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
							/>

							<Input
								label={t("planner.end_time")}
								name='endTime'
								type='time'
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
							/>
						</div>

						<div className='field-grid'>
							<label className='field'>
								<span>{t("planner.priority")}</span>
								<select className='input' value={priority} onChange={(e) => setPriority(e.target.value)}>
									<option value='low'>{t("common.low")}</option>
									<option value='medium'>{t("common.medium")}</option>
									<option value='high'>{t("common.high")}</option>
								</select>
							</label>

							<label className='field'>
								<span>{t("planner.recurrence")}</span>
								<select className='input' value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
									<option value='none'>{t("planner.none")}</option>
									<option value='daily'>{t("dashboard.daily")}</option>
									<option value='weekly'>{t("dashboard.weekly")}</option>
									<option value='monthly'>{t("dashboard.monthly")}</option>
								</select>
							</label>
						</div>

						<label className='field'>
							<span>{t("planner.subject_opt")}</span>
							<select
								className='input'
								value={selectedSubjectId}
								onChange={(e) => handleSubjectChange(e.target.value)}>
								<option value=''>{t("planner.select_subject")}</option>
								{hierarchy.map((sub) => (
									<option key={sub.id} value={sub.id}>
										{localizeSubject(sub.name, sub.slug)} ({sub.examType.toUpperCase()})
									</option>
								))}
							</select>
						</label>

						<label className='field'>
							<span>{t("planner.topic_opt")}</span>
							<select
								className='input'
								value={selectedTopicId}
								onChange={(e) => handleTopicChange(e.target.value)}
								disabled={!selectedSubjectId}>
								<option value=''>{t("planner.select_topic")}</option>
								{selectedSubject?.topics.map((topicItem) => (
									<option key={topicItem.id} value={topicItem.id}>
										{topicItem.name}
									</option>
								))}
							</select>
						</label>

						<label className='field'>
							<span>{t("planner.subtopic_opt")}</span>
							<select
								className='input'
								value={selectedSubtopicId}
								onChange={(e) => setSelectedSubtopicId(e.target.value)}
								disabled={!selectedTopicId}>
								<option value=''>{t("planner.select_subtopic")}</option>
								{selectedTopic?.subtopics.map((st) => (
									<option key={st.id} value={st.id}>
										{st.name}
									</option>
								))}
							</select>
						</label>

						{taskType === "revision" && (
							<label className='field'>
								<span>Wrong Question to Revise (optional)</span>
								<select
									className='input'
									value={wrongQuestionId}
									onChange={(e) => setWrongQuestionId(e.target.value)}>
									<option value=''>-- Select Question --</option>
									{wrongQuestions.map((q) => (
										<option key={q.id} value={q.id}>
											{localizeSubject(q.subject?.name || "General", q.subject?.slug || "general")} : {q.reason.slice(0, 40)}...
										</option>
									))}
								</select>
							</label>
						)}

						<label className='field'>
							<span>{t("planner.notes")}</span>
							<textarea
								className='input'
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder={t("planner.notes_placeholder")}
								rows={2}
							/>
						</label>

						<Button type='submit' disabled={submitting} style={{ justifyContent: "center" }}>
							{submitting ? t("common.saving") : t("planner.schedule_button")}
						</Button>
					</form>
				</Card>
			</div>
		</div>
	);
}
