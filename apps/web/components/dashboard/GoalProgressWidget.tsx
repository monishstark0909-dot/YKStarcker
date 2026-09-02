/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface GoalProgressWidgetProps {
	goals: any | null;
}

type Period = "daily" | "weekly" | "monthly";

interface GoalRow {
	key: string;
	label: string;
	icon: string;
	current: number;
	target: number;
	unit: string;
	pct: number;
}

export function GoalProgressWidget({ goals }: GoalProgressWidgetProps) {
	const { t, formatPercent } = useTranslation();
	const [period, setPeriod] = useState<Period>("daily");

	const PERIOD_LABELS: Record<Period, string> = {
		daily: t("dashboard.daily"),
		weekly: t("dashboard.weekly"),
		monthly: t("dashboard.monthly"),
	};

	function buildRows(pData: any): GoalRow[] {
		if (!pData) return [];
		return [
			{
				key: "studyTime",
				label: t("dashboard.study_duration"),
				icon: "⏱️",
				current: pData.studyTime?.current ?? 0,
				target: pData.studyTime?.target ?? 0,
				unit: t("common.mins"),
				pct: pData.studyTime?.completionPercentage ?? 0,
			},
			{
				key: "questions",
				label: t("dashboard.questions_solved"),
				icon: "📝",
				current: pData.questions?.current ?? 0,
				target: pData.questions?.target ?? 0,
				unit: t("common.qs"),
				pct: pData.questions?.completionPercentage ?? 0,
			},
			{
				key: "revision",
				label: t("dashboard.revisions_count"),
				icon: "🔁",
				current: pData.revision?.current ?? 0,
				target: pData.revision?.target ?? 0,
				unit: t("common.qs"),
				pct: pData.revision?.completionPercentage ?? 0,
			},
			{
				key: "mock",
				label: t("dashboard.mock_exams_count"),
				icon: "📋",
				current: pData.mock?.current ?? 0,
				target: pData.mock?.target ?? 0,
				unit: "",
				pct: pData.mock?.completionPercentage ?? 0,
			},
		];
	}

	if (!goals) {
		return (
			<Card title={t("dashboard.goal_progress")}>
				<p className="muted">{t("common.loading")}</p>
			</Card>
		);
	}

	const rows = buildRows(goals[period]);
	const streak: number = goals.streak ?? 0;

	return (
		<Card title={t("dashboard.goal_progress")} description={t("dashboard.goal_progress_sub")}>
			<div className="stack" style={{ gap: "16px" }}>
				{/* Period switcher */}
				<div className="row" style={{ gap: "6px" }}>
					{(["daily", "weekly", "monthly"] as Period[]).map((p) => (
						<button
							key={p}
							onClick={() => setPeriod(p)}
							className={`button ${period === p ? "button--primary" : "button--secondary"}`}
							style={{ fontSize: "0.8rem", padding: "4px 12px" }}
						>
							{PERIOD_LABELS[p]}
						</button>
					))}
					<div style={{ marginLeft: "auto" }}>
						<Badge tone={streak >= 3 ? "success" : "default"}>
							{streak >= 3 ? "🔥" : "⚡"} {t("dashboard.streak_days", { count: streak })}
						</Badge>
					</div>
				</div>

				{/* Goal rows */}
				<div className="stack" style={{ gap: "14px" }}>
					{rows.map((row) => (
						<div key={row.key} className="stack" style={{ gap: "6px" }}>
							<div
								className="row"
								style={{ justifyContent: "space-between", alignItems: "center" }}
							>
								<div className="row" style={{ gap: "8px", alignItems: "center" }}>
									<span style={{ fontSize: "1rem" }}>{row.icon}</span>
									<span style={{ fontSize: "0.9rem" }}>{row.label}</span>
								</div>
								<div className="row" style={{ gap: "6px", alignItems: "center" }}>
									<span className="muted" style={{ fontSize: "0.8rem" }}>
										{row.current} / {row.target} {row.unit}
									</span>
									<Badge tone={row.pct >= 100 ? "success" : row.pct >= 50 ? "warning" : "default"}>
										{formatPercent(row.pct)}
									</Badge>
								</div>
							</div>
							<div
								style={{
									height: "8px",
									borderRadius: "4px",
									background: "rgba(255,255,255,0.05)",
									overflow: "hidden",
								}}
							>
								<div
									style={{
										height: "100%",
										width: `${Math.min(100, row.pct)}%`,
										borderRadius: "4px",
										background:
											row.pct >= 100
												? "#22c55e"
												: row.pct >= 50
												? "#f59e0b"
												: "#6366f1",
										transition: "width 0.6s ease",
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}
