/** @format */

"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export default function HomePage() {
	const { t } = useTranslation();

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100%",
				background: "radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(9, 9, 11, 0.98) 75%)",
				color: "#ffffff",
				display: "flex",
				flexDirection: "column",
				fontFamily: "var(--font-body), sans-serif",
				overflowX: "hidden",
			}}>
			{/* Floating Top Navigation Header */}
			<header
				style={{
					position: "sticky",
					top: 0,
					zIndex: 50,
					backdropFilter: "blur(12px)",
					background: "rgba(9, 9, 11, 0.8)",
					borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
					padding: "16px 32px",
				}}>
				<div
					style={{
						maxWidth: "1280px",
						margin: "0 auto",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}>
					<Link href='/' style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
						<div
							style={{
								width: "34px",
								height: "34px",
								borderRadius: "10px",
								background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
							}}>
							<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#ffffff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
								<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z' />
								<path d='M6 6h10M6 10h10' />
							</svg>
						</div>
						<strong style={{ fontSize: "1.15rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
							YKS Tracker
						</strong>
					</Link>

					<div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
						<LanguageToggle />
						<Link
							href='/login'
							style={{
								color: "#a1a1aa",
								textDecoration: "none",
								fontSize: "0.9rem",
								fontWeight: 500,
								transition: "color 0.15s ease",
							}}>
							{t("landing.sign_in")}
						</Link>
						<Link
							href='/register'
							style={{
								padding: "8px 18px",
								borderRadius: "999px",
								background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
								color: "#ffffff",
								textDecoration: "none",
								fontSize: "0.88rem",
								fontWeight: 600,
								boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
								transition: "all 0.15s ease",
							}}>
							{t("landing.get_started")}
						</Link>
					</div>
				</div>
			</header>

			{/* Main Split-Screen Hero Section */}
			<main
				className='marketing-main'
				style={{
					flex: 1,
					maxWidth: "1280px",
					width: "100%",
					margin: "0 auto",
					padding: "60px 32px",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
					gap: "48px",
					alignItems: "center",
				}}>
				{/* Left Side Hero Copy */}
				<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							padding: "6px 14px",
							borderRadius: "999px",
							background: "rgba(99, 102, 241, 0.1)",
							border: "1px solid rgba(99, 102, 241, 0.25)",
							color: "#818cf8",
							fontSize: "0.8rem",
							fontWeight: 600,
							width: "fit-content",
						}}>
						<span style={{ fontSize: "0.75rem" }}>✨</span>
						<span>{t("landing.badge")}</span>
					</div>

					<h1
						style={{
							fontSize: "clamp(2.4rem, 4vw, 3.4rem)",
							fontWeight: 800,
							lineHeight: 1.1,
							letterSpacing: "-0.03em",
							background: "linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							margin: 0,
						}}>
						{t("landing.headline")}
					</h1>

					<p
						style={{
							fontSize: "1.1rem",
							lineHeight: 1.6,
							color: "#a1a1aa",
							margin: 0,
							maxWidth: "52ch",
						}}>
						{t("landing.subtitle")}
					</p>

					{/* Action Buttons */}
					<div style={{ display: "flex", gap: "14px", flexWrap: "wrap", paddingTop: "8px" }}>
						<Link
							href='/register'
							style={{
								padding: "14px 28px",
								borderRadius: "12px",
								background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
								color: "#ffffff",
								textDecoration: "none",
								fontSize: "1rem",
								fontWeight: 600,
								boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
								transition: "transform 0.15s ease",
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
							}}>
							<span>{t("landing.get_started")}</span>
							<span>→</span>
						</Link>

						<Link
							href='/login'
							style={{
								padding: "14px 28px",
								borderRadius: "12px",
								background: "rgba(255, 255, 255, 0.04)",
								border: "1px solid rgba(255, 255, 255, 0.1)",
								color: "#ffffff",
								textDecoration: "none",
								fontSize: "1rem",
								fontWeight: 600,
								transition: "background 0.15s ease",
							}}>
							{t("landing.sign_in")}
						</Link>
					</div>

					{/* Small Feature Check List */}
					<div className='marketing-feature-grid'
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
							gap: "12px 16px",
							paddingTop: "16px",
							borderTop: "1px solid rgba(255, 255, 255, 0.08)",
						}}>
						{[
							t("landing.feat_syllabus"),
							t("landing.feat_analytics"),
							t("landing.feat_revision"),
							t("landing.feat_mocks"),
						].map((feat) => (
							<div key={feat} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#d4d4d8" }}>
								<span style={{ color: "#34d399", fontWeight: 700 }}>✓</span>
								<span>{feat}</span>
							</div>
						))}
					</div>
				</div>

				{/* Right Side Application Preview Frame */}
				<div style={{ display: "flex", justifyContent: "center" }}>
					<div
						style={{
							width: "100%",
							maxWidth: "580px",
							borderRadius: "16px",
							background: "#09090b",
							border: "1px solid rgba(255, 255, 255, 0.12)",
							boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.12)",
							overflow: "hidden",
						}}>
						{/* Browser Window Header */}
						<div
							style={{
								background: "#18181b",
								borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
								padding: "10px 16px",
								display: "flex",
								alignItems: "center",
								gap: "12px",
							}}>
							<div style={{ display: "flex", gap: "6px" }}>
								<div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
								<div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
								<div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
							</div>

							<div
								style={{
									flex: 1,
									background: "rgba(0, 0, 0, 0.3)",
									borderRadius: "6px",
									padding: "4px 12px",
									fontSize: "0.75rem",
									color: "#71717a",
									textAlign: "center",
									fontFamily: "monospace",
								}}>
								app.ykstracker.com/dashboard
							</div>

							<div
								style={{
									fontSize: "0.7rem",
									color: "#34d399",
									fontWeight: 600,
									display: "flex",
									alignItems: "center",
									gap: "4px",
								}}>
								<span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
								<span>{t("landing.live_demo")}</span>
							</div>
						</div>

						{/* Mock App UI Body */}
						<div style={{ padding: "16px", display: "flex", gap: "14px", height: "380px" }}>
							{/* Mini Sidebar */}
							<div
								style={{
									width: "120px",
									background: "#121215",
									borderRadius: "10px",
									padding: "10px 8px",
									display: "flex",
									flexDirection: "column",
									gap: "6px",
									border: "1px solid rgba(255, 255, 255, 0.04)",
								}}>
								<div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", paddingLeft: "4px" }}>
									<div style={{ width: 16, height: 16, borderRadius: 4, background: "#6366f1" }} />
									<span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>YKS OS</span>
								</div>

								{[
									{ label: t("nav.dashboard"), active: true },
									{ label: t("nav.subjects"), active: false },
									{ label: t("nav.focus_timer"), active: false },
									{ label: t("nav.mock_exams"), active: false },
									{ label: t("nav.planner"), active: false },
								].map((item) => (
									<div
										key={item.label}
										style={{
											padding: "5px 8px",
											borderRadius: "6px",
											fontSize: "0.68rem",
											color: item.active ? "#fff" : "#71717a",
											background: item.active ? "rgba(99, 102, 241, 0.2)" : "transparent",
											fontWeight: item.active ? 600 : 400,
										}}>
										{item.label}
									</div>
								))}
							</div>

							{/* Mini Main Stage */}
							<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
								{/* Mini Welcome Card */}
								<div
									style={{
										background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)",
										border: "1px solid rgba(99, 102, 241, 0.2)",
										borderRadius: "10px",
										padding: "12px",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}>
									<div>
										<span style={{ fontSize: "0.65rem", color: "#818cf8", fontWeight: 600, textTransform: "uppercase" }}>
											YKS 2027
										</span>
										<strong style={{ display: "block", fontSize: "0.95rem", color: "#fff" }}>
											Welcome back, Ada!
										</strong>
									</div>
									<div
										style={{
											padding: "4px 10px",
											borderRadius: "6px",
											background: "#6366f1",
											color: "#fff",
											fontSize: "0.7rem",
											fontWeight: 600,
										}}>
										{t("subjects.start_timer")}
									</div>
								</div>

								{/* Mini Stats Grid */}
								<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
									{[
										{ label: t("dashboard.study_time"), val: "3h 45m", color: "#818cf8" },
										{ label: t("dashboard.questions"), val: "160 Qs", color: "#c084fc" },
										{ label: t("dashboard.streak_stat"), val: "12 Days 🔥", color: "#ef4444" },
									].map((st) => (
										<div
											key={st.label}
											style={{
												background: "#121215",
												border: "1px solid rgba(255, 255, 255, 0.05)",
												borderRadius: "8px",
												padding: "8px",
											}}>
											<span style={{ display: "block", fontSize: "0.6rem", color: "#71717a", fontWeight: 600 }}>
												{st.label}
											</span>
											<strong style={{ fontSize: "0.85rem", color: st.color }}>
												{st.val}
											</strong>
										</div>
									))}
								</div>

								{/* Mini SVG Curve Chart */}
								<div
									style={{
										flex: 1,
										background: "#121215",
										border: "1px solid rgba(255, 255, 255, 0.05)",
										borderRadius: "10px",
										padding: "10px",
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
									}}>
									<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#a1a1aa" }}>
										<span>{t("dashboard.weekly_summary")}</span>
										<span style={{ color: "#34d399", fontWeight: 600 }}>+24%</span>
									</div>

									{/* Smooth SVG Area Curve */}
									<svg width='100%' height='70' viewBox='0 0 300 70' fill='none' style={{ marginTop: "4px" }}>
										<defs>
											<linearGradient id='miniGrad' x1='0' y1='0' x2='0' y2='1'>
												<stop offset='0%' stopColor='#6366f1' stopOpacity={0.4} />
												<stop offset='100%' stopColor='#6366f1' stopOpacity={0} />
											</linearGradient>
										</defs>
										<path
											d='M0 50 Q 50 10, 100 40 T 200 20 T 300 10 L 300 70 L 0 70 Z'
											fill='url(#miniGrad)'
										/>
										<path
											d='M0 50 Q 50 10, 100 40 T 200 20 T 300 10'
											stroke='#6366f1'
											strokeWidth='2.5'
											fill='none'
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
