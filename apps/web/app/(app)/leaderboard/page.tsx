/** @format */

"use client";

import { useEffect, useState } from "react";
import { getStudyGroupLeaderboard } from "@/lib/study-group";
import { me } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/i18n-context";

type LeaderboardMember = {
	id: string;
	displayName: string;
	username: string;
	avatarUrl?: string | null;
	targetUniversity?: string | null;
	targetDepartment?: string | null;
	currentStreak: number;
	todayStudyMinutes: number;
	weeklyStudyMinutes: number;
	monthlyStudyMinutes: number;
	weeklyStudyHours: number;
	questionsSolved: number;
	latestMockAverage: number;
	overallScore: number;
};

type Period = "daily" | "weekly" | "monthly" | "allTime";
type FilterType = "tyt" | "ayt" | "overall";
type SortOption = "studyTime" | "questions" | "accuracy" | "completion";

export default function LeaderboardPage() {
	const { t, formatPercent } = useTranslation();
	const [rawMembers, setRawMembers] = useState<LeaderboardMember[]>([]);
	const [currentUser, setCurrentUser] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// User Selected Options
	const [period, setPeriod] = useState<Period>("weekly");
	const [examFilter, setExamFilter] = useState<FilterType>("overall");
	const [sortBy, setSortBy] = useState<SortOption>("studyTime");

	useEffect(() => {
		async function loadData() {
			try {
				const [leaderboardRes, meRes] = await Promise.all([
					getStudyGroupLeaderboard(),
					me(),
				]);
				setRawMembers(leaderboardRes.members || []);
				setCurrentUser(meRes.user || null);
			} catch (err: any) {
				setError(err.message || t("common.error"));
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	if (loading) {
		return (
			<div className='page-frame' style={{ padding: "32px 0", color: "#a1a1aa", textAlign: "center" }}>
				{t("common.loading")}
			</div>
		);
	}

	if (error) {
		return (
			<div className='page-frame' style={{ padding: "32px 0", color: "#f87171", textAlign: "center" }}>
				<h2>{t("common.error")}</h2>
				<p>{error}</p>
			</div>
		);
	}

	// Filter & Sort Logic
	const getMemberMetric = (member: LeaderboardMember, sortKey: SortOption, periodKey: Period): number => {
		if (sortKey === "studyTime") {
			if (periodKey === "daily") return member.todayStudyMinutes;
			if (periodKey === "weekly") return member.weeklyStudyMinutes;
			if (periodKey === "monthly") return member.monthlyStudyMinutes;
			return member.weeklyStudyMinutes * 4.5; // Simulate allTime study time
		}
		if (sortKey === "questions") {
			if (periodKey === "daily") return Math.round(member.questionsSolved / 7); // daily estimate
			if (periodKey === "weekly") return member.questionsSolved;
			if (periodKey === "monthly") return member.questionsSolved * 4;
			return member.questionsSolved * 12;
		}
		if (sortKey === "accuracy") {
			// fallback using score or average
			return member.latestMockAverage > 0 ? member.latestMockAverage : Math.round(member.overallScore * 0.8);
		}
		if (sortKey === "completion") {
			return member.overallScore;
		}
		return 0;
	};

	// Filter by exam type target
	const filteredMembers = rawMembers.filter((m) => {
		if (examFilter === "overall") return true;
		if (!m.targetDepartment) return true; // default include
		// simple match
		const dept = m.targetDepartment.toLowerCase();
		if (examFilter === "tyt") return !dept.includes("engineering") && !dept.includes("medical");
		return dept.includes("engineering") || dept.includes("medical") || dept.includes("law") || dept.includes("business");
	});

	// Sort Members
	const sortedMembers = [...filteredMembers].sort((a, b) => {
		const valA = getMemberMetric(a, sortBy, period);
		const valB = getMemberMetric(b, sortBy, period);
		return valB - valA;
	});

	// Split Top 3 and Remaining
	const top3 = sortedMembers.slice(0, 3);
	const remaining = sortedMembers.slice(3);

	// Get Current User Stats & Rank
	const myIndex = sortedMembers.findIndex((m) => m.id === currentUser?.id);
	const myRank = myIndex !== -1 ? myIndex + 1 : "—";
	const myMemberObj = myIndex !== -1 ? sortedMembers[myIndex] : null;

	const formatMetricValue = (val: number, sortKey: SortOption) => {
		if (sortKey === "studyTime") return `${val} ${t("common.mins")}`;
		if (sortKey === "questions") return `${val} ${t("common.qs")}`;
		if (sortKey === "accuracy") return formatPercent(val);
		return `${val}%`;
	};

	// Podium Display Arrangement (2nd, 1st, 3rd)
	const podiumArrangement = [];
	if (top3[1]) podiumArrangement.push({ member: top3[1], rank: 2, badge: "🥈" });
	if (top3[0]) podiumArrangement.push({ member: top3[0], rank: 1, badge: "🥇" });
	if (top3[2]) podiumArrangement.push({ member: top3[2], rank: 3, badge: "🥉" });

	return (
		<div className='stack' style={{ gap: "28px" }}>
			{/* Header */}
			<div className='row space-between' style={{ flexWrap: "wrap", gap: "16px" }}>
				<div className='stack' style={{ gap: "4px" }}>
					<h1 className='page-title' style={{ margin: 0, color: "#18181b" }}>{t("leaderboard.title")}</h1>
					<p className='muted' style={{ margin: 0, color: "#52525b" }}>{t("leaderboard.subtitle")}</p>
				</div>

				{/* Period Selector Tabs */}
				<div
					style={{
						display: "inline-flex",
						background: "#f4f4f5",
						border: "1px solid rgba(0,0,0,0.08)",
						borderRadius: "999px",
						padding: "4px",
					}}>
					{([
						{ key: "daily", label: t("planner.today") },
						{ key: "weekly", label: t("planner.this_week") },
						{ key: "monthly", label: t("planner.this_month") },
						{ key: "allTime", label: t("common.all") },
					] as const).map((tab) => (
						<button
							key={tab.key}
							onClick={() => setPeriod(tab.key)}
							style={{
								padding: "6px 16px",
								borderRadius: "999px",
								border: "none",
								background: period === tab.key ? "#4f46e5" : "transparent",
								color: period === tab.key ? "#ffffff" : "#52525b",
								fontSize: "0.82rem",
								fontWeight: period === tab.key ? 700 : 500,
								cursor: "pointer",
								transition: "all 0.15s ease",
							}}>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Filters & Sorting Panel */}
			<div
				className='row space-between'
				style={{
					background: "#ffffff",
					border: "1px solid rgba(0,0,0,0.08)",
					borderRadius: "12px",
					padding: "12px 20px",
					flexWrap: "wrap",
					gap: "16px",
					boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
				}}>
				{/* Exam Filters */}
				<div className='row' style={{ gap: "8px" }}>
					{(["overall", "tyt", "ayt"] as FilterType[]).map((f) => (
						<button
							key={f}
							onClick={() => setExamFilter(f)}
							style={{
								padding: "6px 14px",
								borderRadius: "6px",
								fontSize: "0.78rem",
								fontWeight: 600,
								border: "1px solid",
								borderColor: examFilter === f ? "#4f46e5" : "rgba(0,0,0,0.1)",
								background: examFilter === f ? "#eef2ff" : "#ffffff",
								color: examFilter === f ? "#4f46e5" : "#52525b",
								cursor: "pointer",
								textTransform: "uppercase",
							}}>
							{f === "overall" ? t("common.all") : f.toUpperCase()}
						</button>
					))}
				</div>

				{/* Sorting Selector */}
				<div className='row' style={{ gap: "8px", alignItems: "center" }}>
					<span style={{ fontSize: "0.82rem", color: "#52525b", fontWeight: 600 }}>Sort by:</span>
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className='input'
						style={{
							padding: "6px 12px",
							fontSize: "0.82rem",
							background: "#ffffff",
							border: "1px solid rgba(0,0,0,0.12)",
							borderRadius: "8px",
							color: "#18181b",
							width: "160px",
						}}>
						<option value='studyTime'>{t("pomodoro.today_time")}</option>
						<option value='questions'>{t("common.questions_solved")}</option>
						<option value='accuracy'>{t("common.accuracy")}</option>
						<option value='completion'>{t("common.completed")}</option>
					</select>
				</div>
			</div>

			{/* Main Grid: Left podium & list, Right status pane */}
			<div className='field-grid' style={{ gridTemplateColumns: "1.2fr 0.8fr", alignItems: "stretch", gap: "24px" }}>
				
				{/* Left Area: Podium + Cards list */}
				<div className='stack' style={{ gap: "24px" }}>
					{/* Top 3 Visual Podium */}
					{podiumArrangement.length > 0 && (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "flex-end",
								gap: "16px",
								padding: "24px 0",
								background: "#ffffff",
								border: "1px solid rgba(0,0,0,0.08)",
								borderRadius: "16px",
								boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
							}}>
							{podiumArrangement.map(({ member, rank, badge }) => {
								const metricVal = getMemberMetric(member, sortBy, period);
								const height = rank === 1 ? "180px" : rank === 2 ? "140px" : "110px";
								const isMe = member.id === currentUser?.id;

								return (
									<div
										key={member.id}
										className='stack'
										style={{
											alignItems: "center",
											width: "140px",
											textAlign: "center",
										}}>
										
										{/* Large Avatar / Icon bubble */}
										<div
											style={{
												position: "relative",
												width: rank === 1 ? "74px" : "60px",
												height: rank === 1 ? "74px" : "60px",
												borderRadius: "50%",
												background: isMe ? "#4f46e5" : "#e0e7ff",
												color: isMe ? "#ffffff" : "#4338ca",
												border: rank === 1 ? "3px solid #fbbf24" : "2px solid rgba(0,0,0,0.1)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: rank === 1 ? "1.8rem" : "1.5rem",
												fontWeight: "bold",
												boxShadow: rank === 1 ? "0 4px 20px rgba(251, 191, 36, 0.3)" : "none",
											}}>
											{member.displayName.substring(0, 2).toUpperCase()}
											
											{/* Crown or Rank Circle */}
											<div
												style={{
													position: "absolute",
													bottom: "-6px",
													right: "-6px",
													width: "24px",
													height: "24px",
													borderRadius: "50%",
													background: "#ffffff",
													border: "1px solid rgba(0,0,0,0.1)",
													display: "grid",
													placeItems: "center",
													fontSize: "0.85rem",
													boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
												}}>
												{badge}
											</div>
										</div>

										<div style={{ marginTop: "12px" }}>
											<strong style={{ display: "block", fontSize: "0.88rem", color: "#18181b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
												{member.displayName}
											</strong>
											<span style={{ fontSize: "0.75rem", color: "#4f46e5", fontWeight: 700 }}>
												{formatMetricValue(metricVal, sortBy)}
											</span>
										</div>

										{/* Podium Block */}
										<div
											style={{
												width: "100%",
												height,
												marginTop: "16px",
												background: rank === 1 ? "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)" : "#f4f4f5",
												border: "1px solid rgba(0,0,0,0.06)",
												borderBottom: "none",
												borderRadius: "12px 12px 0 0",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}>
											<span style={{ fontSize: "1.8rem", fontWeight: 800, color: rank === 1 ? "#d97706" : rank === 2 ? "#71717a" : "#b45309", opacity: 0.8 }}>
												{rank}
											</span>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{/* Remaining List of Users */}
					<div className='stack' style={{ gap: "12px" }}>
						{remaining.map((member, idx) => {
							const rank = idx + 4;
							const metricVal = getMemberMetric(member, sortBy, period);
							const isMe = member.id === currentUser?.id;

							return (
								<div
									key={member.id}
									style={{
										background: isMe ? "#eef2ff" : "#ffffff",
										border: isMe ? "1.5px solid #4f46e5" : "1px solid rgba(0,0,0,0.08)",
										borderRadius: "12px",
										padding: "12px 16px",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: "16px",
										boxShadow: isMe ? "0 2px 8px rgba(79,70,229,0.15)" : "0 1px 3px rgba(0,0,0,0.02)",
									}}>
									
									<div className='row' style={{ gap: "16px", alignItems: "center" }}>
										{/* Rank */}
										<strong style={{ fontSize: "0.95rem", color: "#52525b", width: "24px", textAlign: "center" }}>
											#{rank}
										</strong>

										{/* Avatar */}
										<div
											style={{
												width: "36px",
												height: "36px",
												borderRadius: "50%",
												background: isMe ? "#4f46e5" : "#f4f4f5",
												border: "1px solid rgba(0,0,0,0.1)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: "0.85rem",
												fontWeight: "bold",
												color: isMe ? "#ffffff" : "#18181b",
											}}>
											{member.displayName.substring(0, 2).toUpperCase()}
										</div>

										{/* Name details */}
										<div className='stack' style={{ gap: "2px" }}>
											<strong style={{ fontSize: "0.9rem", color: "#18181b" }}>
												{member.displayName}
											</strong>
											{member.targetUniversity && (
												<span className='muted' style={{ fontSize: "0.75rem", color: "#52525b" }}>
													{member.targetDepartment} @ {member.targetUniversity}
												</span>
											)}
										</div>
									</div>

									{/* Stats Grid for Remaining Members */}
									<div className='row' style={{ gap: "24px", alignItems: "center" }}>
										<div className='stack' style={{ alignItems: "flex-end", gap: "2px" }}>
											<span style={{ fontSize: "0.72rem", color: "#52525b", fontWeight: 600 }}>{t("nav.focus_timer")}</span>
											<span style={{ fontSize: "0.82rem", color: "#18181b", fontWeight: 700 }}>
												{member.weeklyStudyHours}h
											</span>
										</div>

										<div className='stack' style={{ alignItems: "flex-end", gap: "2px" }}>
											<span style={{ fontSize: "0.72rem", color: "#52525b", fontWeight: 600 }}>{t("common.qs")}</span>
											<span style={{ fontSize: "0.82rem", color: "#18181b", fontWeight: 700 }}>
												{member.questionsSolved}
											</span>
										</div>

										<div className='stack' style={{ alignItems: "flex-end", gap: "2px" }}>
											<span style={{ fontSize: "0.72rem", color: "#52525b", fontWeight: 600 }}>{t("dashboard.streak_stat")}</span>
											<span style={{ fontSize: "0.82rem", color: "#ef4444", fontWeight: 700 }}>
												🔥 {member.currentStreak}d
											</span>
										</div>

										{/* Primary metric badge */}
										<Badge tone='brand'>
											{formatMetricValue(metricVal, sortBy)}
										</Badge>
									</div>
								</div>
							);
						})}

						{sortedMembers.length === 0 && (
							<p className='muted' style={{ textAlign: "center", padding: "32px 0" }}>
								{t("leaderboard.no_data")}
							</p>
						)}
					</div>
				</div>

				{/* Right Column: Personal Status Panel */}
				<div className='stack' style={{ gap: "20px" }}>
					<Card title={t("profile")} description={t("nav.student_role")}>
						{myMemberObj ? (
							<div className='stack' style={{ gap: "20px" }}>
								
								{/* My Rank Card */}
								<div
									style={{
										background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
										border: "1px solid rgba(99, 102, 241, 0.3)",
										borderRadius: "12px",
										padding: "20px",
										textAlign: "center",
									}}>
									<span className='muted' style={{ display: "block", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#4f46e5", fontWeight: 700, marginBottom: "4px" }}>
										{t("dashboard.weekly_summary").split(" ")[0]} Rank
									</span>
									<strong style={{ fontSize: "2.8rem", color: "#4f46e5", letterSpacing: "-0.03em", fontWeight: 800 }}>
										#{myRank}
									</strong>
									<span className='muted' style={{ display: "block", fontSize: "0.75rem", color: "#52525b", marginTop: "4px", fontWeight: 500 }}>
										out of {sortedMembers.length} classmates
									</span>
								</div>

								{/* Stat List */}
								<div className='stack' style={{ gap: "12px" }}>
									<div className='row space-between' style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
										<span className='muted' style={{ fontSize: "0.85rem", color: "#52525b" }}>{t("pomodoro.today_time")}</span>
										<strong style={{ color: "#18181b" }}>{myMemberObj.todayStudyMinutes} {t("common.mins")}</strong>
									</div>

									<div className='row space-between' style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
										<span className='muted' style={{ fontSize: "0.85rem", color: "#52525b" }}>{t("common.questions_solved")}</span>
										<strong style={{ color: "#18181b" }}>{myMemberObj.questionsSolved}</strong>
									</div>

									<div className='row space-between' style={{ paddingBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
										<span className='muted' style={{ fontSize: "0.85rem", color: "#52525b" }}>{t("dashboard.current_streak")}</span>
										<strong style={{ color: "#ef4444" }}>🔥 {myMemberObj.currentStreak} {t("common.days")}</strong>
									</div>

									<div className='row space-between'>
										<span className='muted' style={{ fontSize: "0.85rem", color: "#52525b" }}>{t("common.accuracy")}</span>
										<strong style={{ color: "#10b981" }}>{formatPercent(myMemberObj.latestMockAverage > 0 ? myMemberObj.latestMockAverage : 75)}</strong>
									</div>
								</div>
							</div>
						) : (
							<p className='muted'>{t("leaderboard.no_data")}</p>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
