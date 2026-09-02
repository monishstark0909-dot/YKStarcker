/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface TodayProgressWidgetProps {
	goals: any | null;
	todayTasks: { studyTasks: any[]; revisionTasks: any[] } | null;
}

function formatMins(mins: number): string {
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	if (h === 0) return `${m}m`;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
}

export function TodayProgressWidget({
	goals,
	todayTasks,
}: TodayProgressWidgetProps) {
	const { t, formatPercent } = useTranslation();

	if (!goals) {
		return (
			<Card title={t("dashboard.todays_progress")} description={t("common.loading")}>
				<p className="muted">{t("common.loading")}</p>
			</Card>
		);
	}

	const daily = goals.daily;
	const totalTasks =
		(todayTasks?.studyTasks.length ?? 0) +
		(todayTasks?.revisionTasks.length ?? 0);
	const doneTasks = [
		...(todayTasks?.studyTasks ?? []),
		...(todayTasks?.revisionTasks ?? []),
	].filter((task: any) => task.status === "completed").length;
	const plannerPct =
		totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

	const metrics = [
		{
			label: t("dashboard.study_time"),
			current: formatMins(daily.studyTime.current),
			target: formatMins(daily.studyTime.target),
			pct: daily.studyTime.completionPercentage,
			icon: (
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5">
					<circle cx="12" cy="12" r="10"/>
					<polyline points="12 6 12 12 16 14"/>
				</svg>
			),
		},
		{
			label: t("dashboard.questions"),
			current: String(daily.questions.current),
			target: String(daily.questions.target),
			pct: daily.questions.completionPercentage,
			icon: (
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5">
					<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
				</svg>
			),
		},
		{
			label: t("dashboard.revisions"),
			current: String(daily.revision.current),
			target: String(daily.revision.target),
			pct: daily.revision.completionPercentage,
			icon: (
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
					<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
				</svg>
			),
		},
		{
			label: t("dashboard.tasks_done"),
			current: String(doneTasks),
			target: String(totalTasks),
			pct: plannerPct,
			icon: (
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
					<polyline points="20 6 9 17 4 12"/>
				</svg>
			),
		},
	];

	const overallPct = Math.round(
		(daily.studyTime.completionPercentage +
			daily.questions.completionPercentage +
			daily.revision.completionPercentage +
			plannerPct) / 4,
	);

	return (
		<Card title={t("dashboard.todays_progress")} description={t("dashboard.todays_progress_sub")}>
			<div className="stack" style={{ gap: "20px" }}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
					{metrics.map((metric) => (
						<div
							key={metric.label}
							style={{
								background: "rgba(255, 255, 255, 0.02)",
								border: "1px solid rgba(255, 255, 255, 0.05)",
								borderRadius: "10px",
								padding: "10px 12px",
								display: "flex",
								flexDirection: "column",
								gap: "8px"
							}}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								}}>
								<span
									style={{
										fontSize: "0.68rem",
										textTransform: "uppercase",
										letterSpacing: "0.05em",
										color: "#a1a1aa",
										fontWeight: 600
									}}>
									{metric.label}
								</span>
								<span style={{ display: "flex", alignItems: "center" }}>{metric.icon}</span>
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
								<strong
									style={{
										fontSize: "1.25rem",
										fontWeight: "700",
										color: "#ffffff",
										letterSpacing: "-0.02em"
									}}>
									{metric.current}
								</strong>
								<span style={{ fontSize: "0.72rem", color: "#71717a" }}>
									{t("dashboard.of")} {metric.target}
								</span>
							</div>

							<div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "auto" }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										fontSize: "0.72rem",
										color: "#a1a1aa"
									}}>
									<span>{t("dashboard.progress")}</span>
									<span
										style={{
											fontWeight: "600",
											color: metric.pct >= 100 ? "#34d399" : "#ffffff"
										}}>
										{formatPercent(metric.pct)}
									</span>
								</div>
								<ProgressBar value={metric.pct} />
							</div>
						</div>
					))}
				</div>

				<div className="stack" style={{ gap: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
					<div
						style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
						<span style={{ color: "#a1a1aa" }}>{t("dashboard.overall_completion")}</span>
						<strong style={{ color: "#ffffff", fontWeight: "700" }}>{formatPercent(overallPct)}</strong>
					</div>
					<ProgressBar value={overallPct} />
				</div>
			</div>
		</Card>
	);
}
