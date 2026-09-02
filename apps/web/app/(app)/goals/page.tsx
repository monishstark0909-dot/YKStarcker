/** @format */

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { getGoals } from "@/lib/study";

type GoalMetric = {
	target: number;
	current: number;
	completionPercentage: number;
	unit: string;
};

type GoalPeriod = {
	studyTime: GoalMetric;
	questions: GoalMetric;
	revision: GoalMetric;
	mock: GoalMetric;
};

type GoalsProgress = {
	daily: GoalPeriod;
	weekly: GoalPeriod;
	monthly: GoalPeriod;
	streak: number;
};

export default function GoalsPage() {
	const { t, formatPercent } = useTranslation();
	const [goalsData, setGoalsData] = useState<GoalsProgress | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Selected view period: "daily" | "weekly" | "monthly"
	const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

	useEffect(() => {
		let isMounted = true;
		async function fetchGoals() {
			try {
				const data = await getGoals();
				if (!isMounted) return;
				setGoalsData(data);
			} catch (err: any) {
				if (isMounted) setError(err.message || t("common.error"));
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		fetchGoals();

		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<div className='page-frame' style={{ padding: "32px 0" }}>
				{t("common.loading")}
			</div>
		);
	}

	if (!goalsData) {
		return (
			<div className='page-frame' style={{ padding: "32px 0" }}>
				{t("empty.no_data")}
			</div>
		);
	}

	const currentPeriodGoals = goalsData[period];

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div className='row' style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
				<div className='stack' style={{ gap: "4px" }}>
					<span className='badge badge--brand' style={{ width: "fit-content" }}>{t("goals.title")}</span>
					<h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>{t("goals.title")}</h1>
				</div>

				<div className='row' style={{ gap: "8px" }}>
					<button
						className={`button ${period === "daily" ? "button--primary" : "button--secondary"}`}
						onClick={() => setPeriod("daily")}>
						{t("dashboard.daily")}
					</button>
					<button
						className={`button ${period === "weekly" ? "button--primary" : "button--secondary"}`}
						onClick={() => setPeriod("weekly")}>
						{t("dashboard.weekly")}
					</button>
					<button
						className={`button ${period === "monthly" ? "button--primary" : "button--secondary"}`}
						onClick={() => setPeriod("monthly")}>
						{t("dashboard.monthly")}
					</button>
				</div>
			</div>

			{error ? (
				<p className='auth-error' role='alert' style={{ margin: 0 }}>
					{error}
				</p>
			) : null}

			{/* Streak Board */}
			<div className='metrics-grid' style={{ gridTemplateColumns: "1fr" }}>
				<div className='card' style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)" }}>
					<div className='row' style={{ justifyContent: "space-between", alignItems: "center" }}>
						<div className='stack' style={{ gap: "6px" }}>
							<span className='muted' style={{ textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em" }}>{t("goals.streak_tracker")}</span>
							<strong style={{ fontSize: "2.2rem", letterSpacing: "-0.04em", color: "var(--brand)" }}>
								🔥 {goalsData.streak} {t("common.days")}
							</strong>
						</div>
						{goalsData.streak >= 3 ? (
							<span style={{ fontSize: "1.1rem" }}>
								<Badge tone='success'>ON FIRE!</Badge>
							</span>
						) : (
							<span style={{ fontSize: "1.1rem" }}>
								<Badge tone='default'>STREAKING</Badge>
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Goal Progress Grid */}
			<div className='metrics-grid' style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
				{/* Study Time Goal Card */}
				<Card title={t("dashboard.study_duration")} description=''>
					<div className='stack' style={{ gap: "20px" }}>
						<div className='row' style={{ justifyContent: "space-between", alignItems: "baseline" }}>
							<span style={{ fontSize: "2rem", fontWeight: "bold" }}>
								{currentPeriodGoals.studyTime.current}{" "}
								<span style={{ fontSize: "1rem", color: "#a1a1aa", fontWeight: "normal" }}>
									/ {currentPeriodGoals.studyTime.target} {t("common.mins")}
								</span>
							</span>
							<Badge tone={currentPeriodGoals.studyTime.completionPercentage >= 100 ? "success" : "default"}>
								{formatPercent(currentPeriodGoals.studyTime.completionPercentage)}
							</Badge>
						</div>
						<ProgressBar value={currentPeriodGoals.studyTime.completionPercentage} />
					</div>
				</Card>

				{/* Questions Solved Goal Card */}
				<Card title={t("dashboard.questions_solved")} description=''>
					<div className='stack' style={{ gap: "20px" }}>
						<div className='row' style={{ justifyContent: "space-between", alignItems: "baseline" }}>
							<span style={{ fontSize: "2rem", fontWeight: "bold" }}>
								{currentPeriodGoals.questions.current}{" "}
								<span style={{ fontSize: "1rem", color: "#a1a1aa", fontWeight: "normal" }}>
									/ {currentPeriodGoals.questions.target} {t("common.qs")}
								</span>
							</span>
							<Badge tone={currentPeriodGoals.questions.completionPercentage >= 100 ? "success" : "default"}>
								{formatPercent(currentPeriodGoals.questions.completionPercentage)}
							</Badge>
						</div>
						<ProgressBar value={currentPeriodGoals.questions.completionPercentage} />
					</div>
				</Card>

				{/* Revisions Goal Card */}
				<Card title={t("dashboard.revisions_count")} description=''>
					<div className='stack' style={{ gap: "20px" }}>
						<div className='row' style={{ justifyContent: "space-between", alignItems: "baseline" }}>
							<span style={{ fontSize: "2rem", fontWeight: "bold" }}>
								{currentPeriodGoals.revision.current}{" "}
								<span style={{ fontSize: "1rem", color: "#a1a1aa", fontWeight: "normal" }}>
									/ {currentPeriodGoals.revision.target} {t("common.qs")}
								</span>
							</span>
							<Badge tone={currentPeriodGoals.revision.completionPercentage >= 100 ? "success" : "default"}>
								{formatPercent(currentPeriodGoals.revision.completionPercentage)}
							</Badge>
						</div>
						<ProgressBar value={currentPeriodGoals.revision.completionPercentage} />
					</div>
				</Card>

				{/* Mock Exam Goal Card */}
				<Card title={t("dashboard.mock_exams_count")} description=''>
					<div className='stack' style={{ gap: "20px" }}>
						<div className='row' style={{ justifyContent: "space-between", alignItems: "baseline" }}>
							<span style={{ fontSize: "2rem", fontWeight: "bold" }}>
								{currentPeriodGoals.mock.current}{" "}
								<span style={{ fontSize: "1rem", color: "#a1a1aa", fontWeight: "normal" }}>
									/ {currentPeriodGoals.mock.target}
								</span>
							</span>
							<Badge tone={currentPeriodGoals.mock.completionPercentage >= 100 ? "success" : "default"}>
								{formatPercent(currentPeriodGoals.mock.completionPercentage)}
							</Badge>
						</div>
						<ProgressBar value={currentPeriodGoals.mock.completionPercentage} />
					</div>
				</Card>
			</div>
		</div>
	);
}
