/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface StudyStreakWidgetProps {
	goals: any | null;
}

export function StudyStreakWidget({ goals }: StudyStreakWidgetProps) {
	const { t } = useTranslation();

	if (!goals) {
		return (
			<Card title={t("dashboard.study_streak")} description={t("dashboard.consistency_matters")}>
				<p className='muted'>{t("common.loading")}</p>
			</Card>
		);
	}

	const currentStreak = goals.currentStreak ?? 0;
	const longestStreak = goals.longestStreak ?? 0;

	return (
		<Card title={t("dashboard.study_streak")} description={t("dashboard.consistency_matters")}>
			<div className='stack' style={{ gap: "20px" }}>
				{/* Current Streak */}
				<div
					className='row'
					style={{
						alignItems: "center",
						gap: "16px",
						padding: "16px",
						borderRadius: "12px",
						background:
							"linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.08) 100%)",
						border: "1px solid rgba(99,102,241,0.2)",
					}}>
					<div
						style={{
							fontSize: "3rem",
							lineHeight: 1,
							textAlign: "center",
							minWidth: "80px",
						}}>
						🔥
					</div>
					<div className='stack' style={{ gap: "4px", flex: 1 }}>
						<span className='muted' style={{ fontSize: "0.8rem" }}>
							{t("dashboard.current_streak")}
						</span>
						<strong style={{ fontSize: "1.8rem" }}>{currentStreak} {t("common.days")}</strong>
						<span
							style={{
								fontSize: "0.8rem",
								color: "#6366f1",
								fontWeight: 500,
							}}>
							{t("dashboard.building_momentum")}
						</span>
					</div>
				</div>

				{/* Personal Record */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr",
						gap: "12px",
						padding: "12px",
						borderRadius: "8px",
						background: "rgba(255,255,255,0.02)",
						border: "1px solid rgba(255,255,255,0.05)",
					}}>
					<div
						className='row'
						style={{
							justifyContent: "space-between",
							alignItems: "center",
							gap: "12px",
						}}>
						<span className='muted'>{t("dashboard.personal_record")}</span>
						<strong style={{ fontSize: "1.3rem" }}>{longestStreak} {t("common.days")}</strong>
					</div>
				</div>

				{/* Motivational message */}
				<div
					style={{
						padding: "12px",
						borderRadius: "8px",
						background: "rgba(99,102,241,0.05)",
						border: "1px solid rgba(99,102,241,0.15)",
						fontSize: "0.8rem",
						textAlign: "center",
						color: "#a1a1aa",
					}}>
					{t("dashboard.build_streak_cta")}
				</div>
			</div>
		</Card>
	);
}
