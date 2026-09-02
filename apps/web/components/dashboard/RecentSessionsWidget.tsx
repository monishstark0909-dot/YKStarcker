/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface RecentSessionsWidgetProps {
	sessions: any[];
}

export function RecentSessionsWidget({ sessions }: RecentSessionsWidgetProps) {
	const { t, formatDate } = useTranslation();
	const recent = [...sessions]
		.sort((a, b) => new Date(b.createdAt ?? b.startTime).getTime() - new Date(a.createdAt ?? a.startTime).getTime())
		.slice(0, 5);

	return (
		<Card title={t("dashboard.recent_sessions")} description={t("dashboard.latest_sessions")}>
			<div className="stack" style={{ gap: "10px" }}>
				{recent.length === 0 ? (
					<p className="muted" style={{ textAlign: "center", padding: "16px 0" }}>
						📚 {t("dashboard.no_sessions_yet")}{" "}
						<a href="/pomodoro" style={{ color: "var(--brand)" }}>{t("dashboard.start_studying")}!</a>
					</p>
				) : (
					<>
						{recent.map((s: any) => (
							<div
								key={s.id}
								className="row"
								style={{
									padding: "10px 12px",
									borderRadius: "8px",
									background: "rgba(255,255,255,0.02)",
									border: "1px solid rgba(255,255,255,0.05)",
									justifyContent: "space-between",
									gap: "10px",
									flexWrap: "wrap",
								}}
							>
								<div className="stack" style={{ gap: "2px" }}>
									<div className="row" style={{ gap: "6px", alignItems: "center" }}>
										<strong style={{ fontSize: "0.9rem" }}>
											{s.subject?.name ?? "General Study"}
										</strong>
										{s.topic && (
											<span className="muted" style={{ fontSize: "0.75rem" }}>
												› {s.topic.name}
											</span>
										)}
									</div>
									<span className="muted" style={{ fontSize: "0.75rem" }}>
										{formatDate(s.createdAt ?? s.startTime, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
									</span>
								</div>
								<div className="stack" style={{ alignItems: "flex-end", gap: "2px" }}>
									<strong style={{ color: "var(--brand)" }}>
										{s.durationMinutes ?? 0}m
									</strong>
									<Badge tone={s.status === "active" ? "warning" : "default"}>
										{s.status === "active" ? "LIVE" : s.entryType === "manual" ? "Manual" : "Timer"}
									</Badge>
								</div>
							</div>
						))}
						<a
							href="/pomodoro"
							className="button button--secondary"
							style={{ textDecoration: "none", textAlign: "center", fontSize: "0.85rem" }}
						>
							📚 {t("nav.focus_timer")}
						</a>
					</>
				)}
			</div>
		</Card>
	);
}
