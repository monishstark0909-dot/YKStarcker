/** @format */

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { getCurriculumHierarchy, getMockExams, createMockExam, getMockStats } from "@/lib/study";

type CurriculumSubject = {
	id: string;
	name: string;
	slug: string;
	examType: "tyt" | "ayt" | "ydt";
};

type MockSubjectResult = {
	id: string;
	subjectId: string;
	correct: number;
	wrong: number;
	blank: number;
	net: number;
	subject: { name: string; slug: string };
};

type MockExam = {
	id: string;
	examType: "tyt" | "ayt" | "ydt";
	name: string;
	takenAt: string;
	overallCorrect: number;
	overallWrong: number;
	overallBlank: number;
	overallNet: number;
	results: MockSubjectResult[];
};

type MockStats = {
	tytAverageNet: number;
	aytAverageNet: number;
	averageAccuracy: number;
	subjectRankings: { subjectId: string; name: string; slug: string; averageNet: number }[];
	history: { id: string; name: string; examType: string; takenAt: string; overallNet: number }[];
};

export default function MockExamsPage() {
	const { t, formatDate, formatPercent } = useTranslation();
	const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
	const [exams, setExams] = useState<MockExam[]>([]);
	const [stats, setStats] = useState<MockStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Log Form States
	const [examType, setExamType] = useState<"tyt" | "ayt" | "ydt">("tyt");
	const [name, setName] = useState("");
	const [takenAt, setTakenAt] = useState("");
	const [subjectInputs, setSubjectInputs] = useState<Record<string, { correct: string; wrong: string; blank: string }>>({});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		let isMounted = true;
		async function loadInitialData() {
			try {
				const [hierarchy, mockList, mockStats] = await Promise.all([
					getCurriculumHierarchy(),
					getMockExams(),
					getMockStats(),
				]);

				if (!isMounted) return;

				// Map out flat list of subjects
				const flatSubjects = hierarchy.map((s) => ({
					id: s.id,
					name: s.name,
					slug: s.slug,
					examType: s.examType as "tyt" | "ayt" | "ydt",
				}));

				setSubjects(flatSubjects);
				setExams(mockList);
				setStats(mockStats);
			} catch (err: any) {
				if (isMounted) setError(err.message || t("common.error"));
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadInitialData();

		return () => {
			isMounted = false;
		};
	}, []);

	// Localize subject name helper
	const localizeSubject = (name: string, slug: string) => {
		const key = `mock_exams.${slug.replace(/-/g, "_")}`;
		const val = t(key);
		return val !== key ? val : name;
	};

	// Filter subjects to show in the form based on selected exam type
	const filteredSubjects = subjects.filter((sub) => sub.examType === examType);

	const handleSubjectResultChange = (subjectId: string, field: "correct" | "wrong" | "blank", val: string) => {
		setSubjectInputs((prev) => ({
			...prev,
			[subjectId]: {
				...(prev[subjectId] ?? { correct: "", wrong: "", blank: "" }),
				[field]: val,
			},
		}));
	};

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name.trim() || !takenAt) {
			setError(t("auth.required_field"));
			return;
		}

		// Verify that all subjects have inputs
		const resultsPayload: { subjectId: string; correct: number; wrong: number; blank: number }[] = [];
		for (const sub of filteredSubjects) {
			const inputs = subjectInputs[sub.id] ?? { correct: "0", wrong: "0", blank: "0" };
			const correct = Number(inputs.correct || "0");
			const wrong = Number(inputs.wrong || "0");
			const blank = Number(inputs.blank || "0");

			resultsPayload.push({
				subjectId: sub.id,
				correct,
				wrong,
				blank,
			});
		}

		setError(null);
		setSubmitting(true);

		try {
			await createMockExam({
				examType,
				name: name.trim(),
				takenAt: new Date(takenAt).toISOString(),
				results: resultsPayload,
			});

			// Reset Form
			setName("");
			setTakenAt("");
			setSubjectInputs({});

			// Refresh Data
			const [mockList, mockStats] = await Promise.all([getMockExams(), getMockStats()]);
			setExams(mockList);
			setStats(mockStats);
		} catch (err: any) {
			setError(err.message || t("common.error"));
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className='page-frame' style={{ padding: "32px 0" }}>
				{t("common.loading")}
			</div>
		);
	}

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div className='row' style={{ justifyContent: "space-between", alignItems: "center" }}>
				<div className='stack' style={{ gap: "4px" }}>
					<span className='badge badge--brand' style={{ width: "fit-content" }}>{t("mock_exams.badge")}</span>
					<h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("mock_exams.title")}</h1>
				</div>
			</div>

			{error ? (
				<p className='auth-error' role='alert' style={{ margin: 0 }}>
					{error}
				</p>
			) : null}

			{/* Stats Cards */}
			{stats && (
				<div className='metrics-grid' style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
					<StatCard label={t("mock_exams.tyt_avg_net")} value={`${stats.tytAverageNet} Net`} tone='positive' />
					<StatCard label={t("mock_exams.ayt_avg_net")} value={`${stats.aytAverageNet} Net`} tone='positive' />
					<StatCard label={t("mock_exams.overall_accuracy")} value={formatPercent(stats.averageAccuracy)} />
					<StatCard label={t("mock_exams.total_exams")} value={String(exams.length)} />
				</div>
			)}

			<div className='field-grid' style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
				{/* Left Column: Stats & Log History */}
				<div className='stack' style={{ gap: "20px" }}>
					{/* Rankings Card */}
					{stats && stats.subjectRankings.length > 0 && (
						<Card title={t("common.accuracy")} description=''>
							<div className='stack' style={{ gap: "10px" }}>
								{stats.subjectRankings.map((rank, index) => (
									<div
										key={rank.subjectId}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "10px",
											borderBottom: "1px solid var(--border)",
										}}>
										<div className='row' style={{ gap: "12px", alignItems: "center" }}>
											<strong style={{ color: "#a1a1aa" }}>#{index + 1}</strong>
											<span>{localizeSubject(rank.name, rank.slug)}</span>
										</div>
										<strong style={{ color: "var(--brand)" }}>
											{rank.averageNet} Net
										</strong>
									</div>
								))}
							</div>
						</Card>
					)}

					{/* Exam History */}
					<Card title={t("mock_exams.history_title")} description={t("mock_exams.history_sub")}>
						{exams.length === 0 ? (
							<p className='muted'>{t("mock_exams.no_mocks")}</p>
						) : (
							<div className='stack' style={{ gap: "16px" }}>
								{exams.map((exam) => (
									<div
										key={exam.id}
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
													<strong style={{ fontSize: "1.1rem" }}>{exam.name}</strong>
													<Badge tone='brand'>{exam.examType.toUpperCase()}</Badge>
												</div>
												<span className='muted' style={{ fontSize: "0.8rem" }}>
													{formatDate(exam.takenAt)}
												</span>
											</div>

											<div className='stack' style={{ alignItems: "flex-end", gap: "2px" }}>
												<strong style={{ fontSize: "1.2rem", color: "#22c55e" }}>
													{exam.overallNet} Net
												</strong>
												<span className='muted' style={{ fontSize: "0.75rem" }}>
													{exam.overallCorrect}{t("mock_exams.correct").charAt(0)} / {exam.overallWrong}{t("mock_exams.wrong").charAt(0)} / {exam.overallBlank}{t("mock_exams.blank").charAt(0)}
												</span>
											</div>
										</div>

										{/* Subject nets list */}
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
												gap: "10px",
												marginTop: "12px",
												background: "rgba(0,0,0,0.15)",
												padding: "10px",
												borderRadius: "6px",
											}}>
											{exam.results.map((res) => (
												<div key={res.id} className='stack' style={{ gap: "2px" }}>
													<span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
														{localizeSubject(res.subject.name, res.subject.slug)}
													</span>
													<span style={{ fontSize: "0.75rem" }} className='muted'>
														Net: <strong style={{ color: "var(--brand)" }}>{res.net}</strong>
													</span>
													<span style={{ fontSize: "0.75rem" }} className='muted'>
														({res.correct} / {res.wrong})
													</span>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</Card>
				</div>

				{/* Right Column: Log Form */}
				<Card title={t("mock_exams.form_title")} description={t("mock_exams.form_sub")}>
					<form className='form' onSubmit={handleFormSubmit}>
						<label className='field'>
							<span>{t("mock_exams.exam_type")}</span>
							<select
								className='input'
								value={examType}
								onChange={(e) => setExamType(e.target.value as any)}>
								<option value='tyt'>TYT</option>
								<option value='ayt'>AYT</option>
								<option value='ydt'>YDT</option>
							</select>
						</label>

						<Input
							label={t("mock_exams.exam_name")}
							name='name'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='e.g., 3D TYT Deneme-1'
							required
						/>

						<Input
							label={t("mock_exams.date_taken")}
							name='takenAt'
							type='date'
							value={takenAt}
							onChange={(e) => setTakenAt(e.target.value)}
							required
						/>

						<div style={{ marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
							<strong style={{ fontSize: "1rem", display: "block", marginBottom: "12px" }}>{t("mock_exams.subject_scores")}</strong>

							{filteredSubjects.length === 0 ? (
								<p className='muted' style={{ fontSize: "0.85rem" }}>
									{t("empty.no_data")}
								</p>
							) : (
								<div className='stack' style={{ gap: "16px" }}>
									{filteredSubjects.map((sub) => {
										const inputs = subjectInputs[sub.id] ?? { correct: "", wrong: "", blank: "" };
										return (
											<div
												key={sub.id}
												style={{
													padding: "10px",
													borderRadius: "6px",
													border: "1px solid rgba(255, 255, 255, 0.03)",
													background: "rgba(255, 255, 255, 0.01)",
												}}
												className='stack'>
												<span style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "8px", display: "block" }}>
													{localizeSubject(sub.name, sub.slug)}
												</span>

												<div className='field-grid' style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
													<Input
														label={t("mock_exams.correct")}
														name={`correct-${sub.id}`}
														type='number'
														min='0'
														value={inputs.correct}
														onChange={(e) => handleSubjectResultChange(sub.id, "correct", e.target.value)}
														placeholder='0'
													/>
													<Input
														label={t("mock_exams.wrong")}
														name={`wrong-${sub.id}`}
														type='number'
														min='0'
														value={inputs.wrong}
														onChange={(e) => handleSubjectResultChange(sub.id, "wrong", e.target.value)}
														placeholder='0'
													/>
													<Input
														label={t("mock_exams.blank")}
														name={`blank-${sub.id}`}
														type='number'
														min='0'
														value={inputs.blank}
														onChange={(e) => handleSubjectResultChange(sub.id, "blank", e.target.value)}
														placeholder='0'
													/>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>

						<Button type='submit' disabled={submitting || filteredSubjects.length === 0} style={{ marginTop: "16px", justifyContent: "center" }}>
							{submitting ? t("common.saving") : t("mock_exams.log_exam_button")}
						</Button>
					</form>
				</Card>
			</div>
		</div>
	);
}
