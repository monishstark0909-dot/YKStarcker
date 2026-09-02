/** @format */

"use client";

import { useEffect, useState } from "react";
import { fetchDashboardData, type DashboardPayload } from "@/lib/dashboard";
import { me, type AuthResponse } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { WelcomeCard } from "./WelcomeCard";
import { TodayProgressWidget } from "./TodayProgressWidget";
import { WeeklySummaryWidget } from "./WeeklySummaryWidgetClean";
import { GoalProgressWidget } from "./GoalProgressWidget";
import { PlannerPreviewWidget } from "./PlannerPreviewWidget";
import { RecentSessionsWidget } from "./RecentSessionsWidget";
import { AIPlaceholderCard } from "./AIPlaceholderCard";
import { StudyStreakWidget } from "./StudyStreakWidget";
import { StudyGroupWidget } from "./StudyGroupWidget";

export function DashboardOverview() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [auth, setAuth] = useState<AuthResponse | null>(null);
	const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadDashboard() {
			try {
				const [authRes, dataRes] = await Promise.all([
					me(),
					fetchDashboardData(),
				]);
				if (!isMounted) return;
				setAuth(authRes);
				setDashboardData(dataRes);
			} catch (err: any) {
				if (isMounted) {
					console.error("Dashboard error:", err);
					setError(err.message || t("common.error"));
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadDashboard();

		return () => {
			isMounted = false;
		};
	}, []);

	if (loading) {
		return (
			<div
				className='stack'
				style={{
					gap: "24px",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
				}}>
				<div
					style={{
						width: 40,
						height: 40,
						border: "3px solid rgba(255,255,255,0.05)",
						borderTopColor: "var(--brand, #3b82f6)",
						borderRadius: "50%",
						animation: "spin 1s linear infinite",
					}}
				/>
				<span className='muted'>{t("common.loading")}</span>
				<style>{`
					@keyframes spin {
						to { transform: rotate(360deg); }
					}
				`}</style>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className='stack'
				style={{
					gap: "16px",
					padding: "32px",
					borderRadius: "12px",
					background: "rgba(239, 68, 68, 0.05)",
					border: "1px solid rgba(239, 68, 68, 0.15)",
					alignItems: "center",
					textAlign: "center",
				}}>
				<span style={{ fontSize: "2rem" }}>⚠️</span>
				<strong style={{ fontSize: "1.1rem" }}>{t("common.error")}</strong>
				<p className='muted' style={{ margin: 0, maxWidth: "50ch" }}>
					{error}
				</p>
				<button
					className='button button--secondary'
					onClick={() => {
						setLoading(true);
						setError(null);
						window.location.reload();
					}}>
					{t("common.retry")}
				</button>
			</div>
		);
	}

	return (
		<div className='stack' style={{ gap: "28px" }}>
			<section className='dashboard-hero'>
				<WelcomeCard
					user={auth?.user ?? null}
					profile={auth?.profile ?? null}
				/>
				<TodayProgressWidget
					goals={dashboardData?.goals}
					todayTasks={dashboardData?.todayTasks ?? null}
				/>
			</section>

			<section className='dashboard-grid'>
				<div className='stack' style={{ gap: "24px" }}>
					<WeeklySummaryWidget
						sessions={dashboardData?.sessions ?? []}
						goals={dashboardData?.goals}
					/>
					<PlannerPreviewWidget
						todayTasks={dashboardData?.todayTasks ?? null}
					/>
					<RecentSessionsWidget sessions={dashboardData?.sessions ?? []} />
				</div>

				<div className='stack' style={{ gap: "24px" }}>
					<GoalProgressWidget goals={dashboardData?.goals} />
					<AIPlaceholderCard />
					<StudyGroupWidget studyGroup={dashboardData?.studyGroup ?? null} />
					<StudyStreakWidget goals={dashboardData?.goals} />
				</div>
			</section>
		</div>
	);
}
