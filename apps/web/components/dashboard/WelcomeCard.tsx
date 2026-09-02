/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface WelcomeCardProps {
	user: {
		displayName?: string;
		username?: string;
	} | null;
	profile: {
		targetUniversity?: string | null;
		targetDepartment?: string | null;
		targetRanking?: number | null;
		yksExamDate?: string | null;
	} | null;
}

function getDaysUntil(dateStr: string | null | undefined): number | null {
	if (!dateStr) return null;
	const target = new Date(dateStr);
	const now = new Date();
	const diff = Math.ceil(
		(target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);
	return diff > 0 ? diff : 0;
}

export function WelcomeCard({ user, profile }: WelcomeCardProps) {
	const { t, formatDate } = useTranslation();
	const daysLeft = getDaysUntil(profile?.yksExamDate);
	const today = formatDate(new Date(), {
		weekday: "long",
		month: "long",
		day: "numeric",
	});

	return (
		<Card className='hero-panel'>
			<div className='stack' style={{ gap: "24px" }}>
				<div
					className='row space-between'
					style={{ flexWrap: "wrap", gap: "20px" }}>
					<div className='stack' style={{ gap: "8px", minWidth: 0 }}>
						<span className='eyebrow'>{today}</span>
						<h1
							className='page-title'
							style={{ margin: 0, color: "var(--text-primary)" }}>
							{user?.displayName
								? `Welcome back, ${user.displayName.split(" ")[0]}!`
								: "Welcome back!"}
						</h1>
						<p
							className='body-copy'
							style={{ margin: 0, color: "var(--text-secondary)" }}>
							{(profile?.targetUniversity || profile?.targetDepartment) && (
								<>
									Targeting <strong>{profile.targetDepartment ?? "—"}</strong>
									{profile.targetUniversity
										? ` at ${profile.targetUniversity}`
										: ""}
								</>
							)}
							{daysLeft !== null && (
								<span
									style={{
										color:
											daysLeft <= 30
												? "#ef4444"
												: daysLeft <= 90
													? "#f59e0b"
													: "#6366f1",
										fontWeight: 600,
										marginLeft: "8px",
									}}>
									{daysLeft} {t("common.days")} remaining
								</span>
							)}
						</p>
					</div>

					<div className='row hero-actions'>
						<a href='/pomodoro' className='button button--primary'>
							{t("subjects.start_timer")}
						</a>
						<a href='/planner' className='button button--secondary'>
							{t("nav.planner")}
						</a>
						<a href='/subjects' className='button button--secondary'>
							{t("nav.subjects")}
						</a>
					</div>
				</div>
			</div>
		</Card>
	);
}
