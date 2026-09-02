/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/i18n-context";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

interface WeeklySummaryWidgetProps {
	sessions: any[];
	goals: any | null;
}

function getLast7DayLabels(lang: string): string[] {
	const days: string[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		days.push(d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { weekday: "short" }));
	}
	return days;
}

function buildWeeklyChartData(sessions: any[], lang: string) {
	const dayLabels = getLast7DayLabels(lang);
	const map = new Map<string, number>();

	for (const s of sessions) {
		const date = new Date(s.createdAt ?? s.startTime ?? s.date);
		const label = date.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { weekday: "short" });
		map.set(label, (map.get(label) ?? 0) + (s.durationMinutes ?? 0));
	}

	return dayLabels.map((label) => ({
		day: label,
		minutes: map.get(label) ?? 0,
	}));
}

export function WeeklySummaryWidget({
	sessions,
	goals,
}: WeeklySummaryWidgetProps) {
	const { t, language, formatPercent } = useTranslation();
	const chartData = buildWeeklyChartData(sessions, language);
	const weekly = goals?.weekly;

	const totalMinutes = chartData.reduce((sum, d) => sum + d.minutes, 0);
	const totalHours = (totalMinutes / 60).toFixed(1);
	const streak = goals?.streak ?? 0;

	const weekSessions = sessions.filter((s) => {
		const d = new Date(s.createdAt ?? s.startTime ?? s.date);
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return d >= weekAgo;
	});

	const weekQuestions = weekly?.questions?.current ?? 0;
	const weekAccuracy = (() => {
		const totalQ = sessions.reduce(
			(sum, s) => sum + (s.questionsSolved ?? 0),
			0,
		);
		const totalC = sessions.reduce((sum, s) => sum + (s.correct ?? 0), 0);
		return totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
	})();

	return (
		<Card
			title={t("dashboard.weekly_summary")}
			description={t("dashboard.weekly_summary_sub")}>
			<div className='stack' style={{ gap: "20px" }}>
				{/* KPI row */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
						gap: "14px",
					}}>
					{[
						{ label: t("dashboard.hours"), value: totalHours, icon: "⏱️" },
						{ label: t("dashboard.questions_solved_stat"), value: weekQuestions, icon: "📝" },
						{ label: t("dashboard.accuracy_stat"), value: formatPercent(weekAccuracy), icon: "🎯" },
						{ label: t("dashboard.sessions_stat"), value: weekSessions.length, icon: "📚" },
						{
							label: t("dashboard.streak_stat"),
							value: `${streak}d`,
							icon: streak >= 3 ? "🔥" : "⚡",
						},
					].map((kpi) => (
						<div key={kpi.label} className='kpi-tile'>
							<div className='kpi-icon' aria-hidden>
								{kpi.icon}
							</div>
							<strong
								style={{
									fontSize: "1.3rem",
									letterSpacing: "-0.03em",
									color: "var(--text-primary)",
									fontVariantNumeric: "tabular-nums",
								}}>
								{kpi.value}
							</strong>
							<span className='muted' style={{ fontSize: "0.78rem" }}>
								{kpi.label}
							</span>
						</div>
					))}
				</div>

				{/* Study time area chart */}
				<div>
					<p
						className='muted'
						style={{ fontSize: "0.8rem", marginBottom: "8px" }}>
						{t("dashboard.daily_study_mins")}
					</p>

					{totalMinutes === 0 ? (
						<div style={{ padding: 12 }}>
							<div style={{ minHeight: 140 }}>
								<div style={{ padding: 12 }}>
									<div className='muted'>{t("dashboard.no_weekly_activity")}</div>
								</div>
							</div>
						</div>
					) : (
						<ResponsiveContainer width='100%' height={140}>
							<AreaChart
								data={chartData}
								margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<defs>
									<linearGradient id='colorMinutes' x1='0' y1='0' x2='0' y2='1'>
										<stop offset='5%' stopColor='#6366f1' stopOpacity={0.3} />
										<stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey='day'
									tick={{ fill: "#71717a", fontSize: 11 }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fill: "#71717a", fontSize: 11 }}
									axisLine={false}
									tickLine={false}
								/>
								<CartesianGrid
									vertical={false}
									stroke='rgba(255,255,255,0.03)'
								/>
								<Tooltip
									contentStyle={{
										background: "#0b1220",
										border: "1px solid rgba(255, 255, 255, 0.06)",
										borderRadius: "8px",
										color: "#fff",
									}}
									formatter={(v: any) => [`${v}m`, t("dashboard.study_duration")]}
								/>
								<Area
									type='monotone'
									dataKey='minutes'
									stroke='#6366f1'
									strokeWidth={2}
									fillOpacity={1}
									fill='url(#colorMinutes)'
								/>
							</AreaChart>
						</ResponsiveContainer>
					)}
				</div>
			</div>
		</Card>
	);
}
