/** @format */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { primaryNavigation } from "@/lib/navigation";
import { me } from "@/lib/auth";
import { getAnalyticsFoundation } from "@/lib/study";
import { DynamicIslandPlayer } from "@/components/spotify/DynamicIslandPlayer";

export function AppShell({ children }: PropsWithChildren) {
	const { t, formatDate } = useTranslation();
	const pathname = usePathname();
	const [isReady, setIsReady] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [user, setUser] = useState<any>(null);
	const [streak, setStreak] = useState<number>(1);

	useEffect(() => {
		let isMounted = true;

		Promise.all([
			me(),
			getAnalyticsFoundation().catch(() => null),
		])
			.then(([result, analyticsData]) => {
				if (!isMounted) return;
				setUser(result.user);
				if (analyticsData?.study?.currentStreak !== undefined) {
					setStreak(analyticsData.study.currentStreak);
				}

				if (!result.profile && pathname !== "/onboarding") {
					window.location.replace("/onboarding");
					return;
				}

				if (result.profile && pathname === "/onboarding") {
					window.location.replace("/dashboard");
					return;
				}

				setIsReady(true);
			})
			.catch(() => {
				window.location.replace("/login");
			});

		return () => {
			isMounted = false;
		};
	}, [pathname]);

	if (!isReady) {
		return (
			<div
				className='page-frame'
				style={{ padding: "32px 0", color: "#a1a1aa", textAlign: "center" }}>
				{t("common.loading")}
			</div>
		);
	}

	const getNavLabelKey = (label: string): string => {
		switch (label) {
			case "Dashboard":
				return "nav.dashboard";
			case "Subjects":
				return "nav.subjects";
			case "Focus Timer":
			case "Pomodoro":
				return "nav.focus_timer";
			case "Planner":
				return "nav.planner";
			case "Goals":
				return "nav.goals";
			case "Mock Exams":
				return "nav.mock_exams";
			case "Analytics":
				return "nav.analytics";
			case "Leaderboard":
				return "nav.leaderboard";
			case "Members":
			case "Study Group":
				return "nav.members";
			case "Settings":
				return "nav.settings";
			case "Spotify":
				return "nav.spotify";
			case "Friends":
				return "nav.friends";
			default:
				return label;
		}
	};

	const getIconSvg = (label: string) => {
		switch (label) {
			case "Dashboard":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
						<polyline points='9 22 9 12 15 12 15 22' />
					</svg>
				);
			case "Subjects":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z' />
						<path d='M6 6h10M6 10h10' />
					</svg>
				);
			case "Mock Exams":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
						<polyline points='14 2 14 8 20 8' />
						<line x1='16' y1='13' x2='8' y2='13' />
						<line x1='16' y1='17' x2='8' y2='17' />
					</svg>
				);
			case "Planner":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<rect width='18' height='18' x='3' y='4' rx='2' ry='2' />
						<line x1='16' y1='2' x2='16' y2='6' />
						<line x1='8' y1='2' x2='8' y2='6' />
						<line x1='3' y1='10' x2='21' y2='10' />
					</svg>
				);
			case "Focus Timer":
			case "Pomodoro":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<circle cx='12' cy='12' r='10' />
						<path d='M12 2v4M12 18v4' />
					</svg>
				);
			case "Leaderboard":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
						<path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
						<path d='M4 22h16' />
						<path d='M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34' />
						<path d='M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z' />
					</svg>
				);
			case "Analytics":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<line x1='18' y1='20' x2='18' y2='10' />
						<line x1='12' y1='20' x2='12' y2='4' />
						<line x1='6' y1='20' x2='6' y2='14' />
					</svg>
				);
			case "Spotify":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='#1DB954'>
						<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.225.37-.704.49-1.074.264-2.943-1.798-6.649-2.203-11.014-1.206-.418.096-.838-.17-.934-.588-.096-.418.17-.838.588-.934 4.778-1.09 8.868-.624 12.169 1.39.37.226.49.704.265 1.074zm1.467-3.264c-.283.46-.889.605-1.349.322-3.368-2.07-8.503-2.67-12.488-1.46-.514.156-1.053-.134-1.209-.648-.156-.514.134-1.053.648-1.209 4.557-1.383 10.221-.715 14.076 1.646.46.283.605.889.322 1.349zm.137-3.39c-4.04-2.399-10.702-2.62-14.567-1.448-.623.189-1.278-.17-1.467-.792-.189-.623.17-1.278.792-1.467 4.444-1.349 11.802-1.085 16.452 1.677.561.333.748 1.057.415 1.618-.333.561-1.057.748-1.618.415z'/>
					</svg>
				);
			case "Settings":
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<circle cx='12' cy='12' r='3' />
						<path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
					</svg>
				);
			default:
				return (
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
						<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
						<polyline points='14 2 14 8 20 8' />
					</svg>
				);
		}
	};

	const getCurrentPageName = () => {
		const matched = primaryNavigation.find((item) => item.href === pathname);
		return matched ? t(getNavLabelKey(matched.label)) : "Home";
	};

	return (
		<div
			className='app-shell'
			style={{
				gridTemplateColumns: collapsed
					? "78px minmax(0, 1fr)"
					: "260px minmax(0, 1fr)",
				transition: "grid-template-columns 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
			}}>
			<aside
				className='sidebar'
				aria-hidden={false}
				style={{
					background: "#09090b",
					borderRight: "1px solid rgba(255, 255, 255, 0.08)",
					padding: "20px 14px",
					height: "calc(100vh - 56px)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}>
				<div className='stack' style={{ gap: "20px" }}>
					<div className='row' style={{ alignItems: "center", gap: 10, paddingLeft: 4 }}>
						<div className='brand-mark' aria-hidden='true' style={{ width: "32px", height: "32px" }} />
						{!collapsed && (
							<strong style={{ display: "block", fontSize: "0.95rem", letterSpacing: "-0.01em", color: "#fff" }}>
								YKS Tracker
							</strong>
						)}
					</div>

					<nav className='sidebar-nav' aria-label='Primary' style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						{primaryNavigation.map((item) => {
							const isActive = pathname === item.href;
							const localizedLabel = t(getNavLabelKey(item.label));
							return (
								<Link
									key={item.href}
									href={item.href}
									title={localizedLabel}
									className={`sidebar-link ${isActive ? "sidebar-link--active" : ""}`}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "10px",
										padding: "8px 10px",
										borderRadius: "6px",
										color: isActive ? "#ffffff" : "#a1a1aa",
										background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
										transition: "all 0.15s ease",
										fontSize: "0.85rem",
										fontWeight: isActive ? 500 : 400,
									}}
									aria-current={isActive ? "page" : undefined}>
									<span className='nav-icon' aria-hidden='true' style={{ display: "flex", alignItems: "center", justifyContent: "center", color: isActive ? "#818cf8" : "inherit" }}>
										{getIconSvg(item.label)}
									</span>
									{!collapsed && (
										<span className='sidebar-link__title' style={{ whiteSpace: "nowrap" }}>
											{localizedLabel}
										</span>
									)}
								</Link>
							);
						})}
					</nav>
				</div>

				<div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
					<div className='row' style={{ gap: 10, alignItems: "center", flexWrap: "nowrap", justifyContent: collapsed ? "center" : "space-between" }}>
						<div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
							<div className='avatar' aria-hidden='true' style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 600 }}>
								{user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "YS"}
							</div>
							{!collapsed && (
								<div style={{ minWidth: 0 }}>
									<strong style={{ display: "block", fontSize: "0.8rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{user?.displayName || "Student"}
									</strong>
									<span className='muted' style={{ fontSize: "0.75rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{t("nav.student_role")}
									</span>
								</div>
							)}
						</div>
						<button
							className='button button--ghost'
							aria-label='Collapse sidebar'
							onClick={() => setCollapsed(!collapsed)}
							style={{
								marginLeft: collapsed ? 0 : "auto",
								padding: "4px 8px",
								fontSize: "0.8rem",
								color: "#71717a",
								border: "1px solid rgba(255,255,255,0.06)",
								background: "rgba(255,255,255,0.02)",
								borderRadius: "4px",
								cursor: "pointer",
							}}>
							{collapsed ? "»" : "«"}
						</button>
					</div>
				</div>
			</aside>

			<main className='main-stage' style={{ padding: "0 0 28px 0" }}>
				<header
					className='topbar'
					style={{
						background: "#18181b",
						border: "1px solid rgba(255, 255, 255, 0.08)",
						borderRadius: "12px",
						padding: "12px 20px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: "16px",
					}}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
						<span style={{ color: "#71717a" }}>{t("nav.workspace")}</span>
						<span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
						<span style={{ color: "#e4e4e7", fontWeight: 500 }}>
							{getCurrentPageName()}
						</span>
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
						{/* Streak Fire Badge */}
						<div
							title={t("dashboard.streak_days", { count: String(streak) })}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "4px 12px",
								borderRadius: "999px",
								background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)",
								border: "1px solid rgba(245, 158, 11, 0.3)",
								color: "#f59e0b",
								fontSize: "0.82rem",
								fontWeight: 700,
								boxShadow: "0 2px 8px rgba(245, 158, 11, 0.15)",
							}}>
							<span style={{ fontSize: "0.95rem" }}>🔥</span>
							<span>{streak} {t("dashboard.streak_days", { count: String(streak) }).includes("streak") ? "d streak" : "gün"}</span>
						</div>

						<LanguageToggle />
						<span style={{ fontSize: "0.8rem", color: "#a1a1aa", fontWeight: 500 }}>
							{formatDate(new Date())}
						</span>
					</div>
				</header>
				{children}
			</main>

			{/* Global Dynamic Island Spotify Player */}
			<DynamicIslandPlayer />
		</div>
	);
}
