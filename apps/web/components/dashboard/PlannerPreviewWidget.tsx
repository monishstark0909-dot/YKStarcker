/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface PlannerPreviewWidgetProps {
	todayTasks: { studyTasks: any[]; revisionTasks: any[] } | null;
}

export function PlannerPreviewWidget({ todayTasks }: PlannerPreviewWidgetProps) {
	const { t } = useTranslation();
	const all = [
		...(todayTasks?.studyTasks ?? []).map((t: any) => ({ ...t, _kind: "study" })),
		...(todayTasks?.revisionTasks ?? []).map((t: any) => ({ ...t, _kind: "revision" })),
	];

	const overdue = all.filter(
		(t) => t.status !== "completed" && t.status !== "skipped" && new Date(t.date) < new Date(new Date().toDateString()),
	);
	const todayPlanned = all.filter(
		(t) => t.status === "planned",
	);
	const todayDone = all.filter((t) => t.status === "completed");

	return (
		<Card title={t("dashboard.planner_preview")} description={t("dashboard.tasks_today", { count: all.length })}>
			<div className="stack" style={{ gap: "14px" }}>
				{all.length === 0 ? (
					<p className="muted" style={{ textAlign: "center", padding: "16px 0" }}>
						📅 {t("dashboard.no_tasks_today")}{" "}
						<a href="/planner" style={{ color: "var(--brand)" }}>{t("dashboard.schedule_one")}</a>
					</p>
				) : (
					<>
						{/* Overdue */}
						{overdue.length > 0 && (
							<div className="stack" style={{ gap: "6px" }}>
								<span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em" }}>
									Overdue ({overdue.length})
								</span>
								{overdue.slice(0, 3).map((tItem: any) => (
									<div key={tItem.id} className="row" style={{ padding: "8px 10px", borderRadius: "6px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", justifyContent: "space-between", gap: "8px" }}>
										<span style={{ fontSize: "0.85rem" }}>{tItem.title}</span>
										<Badge tone="danger">Overdue</Badge>
									</div>
								))}
							</div>
						)}

						{/* Upcoming today */}
						{todayPlanned.length > 0 && (
							<div className="stack" style={{ gap: "6px" }}>
								<span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
									Planned ({todayPlanned.length})
								</span>
								{todayPlanned.slice(0, 4).map((tItem: any) => (
									<div key={tItem.id} className="row" style={{ padding: "8px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
										<div className="row" style={{ gap: "6px", alignItems: "center" }}>
											<span style={{ fontSize: "0.85rem" }}>{tItem.title}</span>
											<Badge tone={tItem._kind === "study" ? "brand" : "warning"}>{tItem._kind}</Badge>
										</div>
										{tItem.startTime && (
											<span className="muted" style={{ fontSize: "0.75rem" }}>
												{new Date(tItem.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
											</span>
										)}
									</div>
								))}
							</div>
						)}

						{/* Done */}
						{todayDone.length > 0 && (
							<div className="stack" style={{ gap: "6px" }}>
								<span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
									Completed ({todayDone.length})
								</span>
								{todayDone.slice(0, 3).map((tItem: any) => (
									<div key={tItem.id} className="row" style={{ padding: "8px 10px", borderRadius: "6px", background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)", justifyContent: "space-between", gap: "8px", opacity: 0.7 }}>
										<span style={{ fontSize: "0.85rem", textDecoration: "line-through" }}>{tItem.title}</span>
										<Badge tone="success">✓</Badge>
									</div>
								))}
							</div>
						)}

						<a href="/planner" className="button button--secondary" style={{ textDecoration: "none", textAlign: "center", fontSize: "0.85rem" }}>
							📅 {t("nav.planner")}
						</a>
					</>
				)}
			</div>
		</Card>
	);
}
