/** @format */

"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface CircularTimerProps {
	mode: "focus" | "short_break" | "long_break";
	timeLeft: number; // in seconds
	totalDuration: number; // in seconds
	isRunning: boolean;
}

export function CircularTimer({
	mode,
	timeLeft,
	totalDuration,
	isRunning,
}: CircularTimerProps) {
	const { t } = useTranslation();
	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;
	const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
		seconds,
	).padStart(2, "0")}`;

	const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
	const strokeDasharray = 879.64; // 2 * PI * 140
	const strokeDashoffset = strokeDasharray - (strokeDasharray * progress) / 100;

	const getModeColor = () => {
		switch (mode) {
			case "focus":
				return { stroke: "#4f46e5", bg: "rgba(99, 102, 241, 0.12)", label: t("pomodoro.focus_session") };
			case "short_break":
				return { stroke: "#10b981", bg: "rgba(16, 185, 129, 0.12)", label: t("pomodoro.short_break") };
			case "long_break":
				return { stroke: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", label: t("pomodoro.long_break") };
		}
	};

	const theme = getModeColor();

	return (
		<div
			style={{
				position: "relative",
				width: "min(340px, 85vw)",
				height: "min(340px, 85vw)",
				margin: "0 auto",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<svg
				width='100%'
				height='100%'
				viewBox='0 0 320 320'
				style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
				{/* Background track */}
				<circle
					cx='160'
					cy='160'
					r='140'
					fill='none'
					stroke='rgba(0, 0, 0, 0.06)'
					strokeWidth='16'
				/>

				{/* Progress Arc */}
				<circle
					cx='160'
					cy='160'
					r='140'
					fill='none'
					stroke={theme.stroke}
					strokeWidth='16'
					strokeLinecap='round'
					strokeDasharray={strokeDasharray}
					strokeDashoffset={strokeDashoffset}
					style={{
						transition: "stroke-dashoffset 0.8s linear, stroke 0.3s ease",
						filter: isRunning ? `drop-shadow(0 0 12px ${theme.stroke})` : "none",
					}}
				/>
			</svg>

			{/* Center Text Container */}
			<div
				style={{
					position: "absolute",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: "10px",
				}}>
				{/* Mode Badge */}
				<span
					style={{
						padding: "6px 16px",
						borderRadius: "999px",
						fontSize: "0.82rem",
						fontWeight: 700,
						background: theme.bg,
						color: theme.stroke,
						textTransform: "uppercase",
						letterSpacing: "0.05em",
						transition: "all 0.3s ease",
					}}>
					{theme.label}
				</span>

				{/* Digit Countdown */}
				<div
					style={{
						fontSize: "3.75rem",
						fontWeight: 800,
						letterSpacing: "-0.03em",
						fontVariantNumeric: "tabular-nums",
						lineHeight: 1,
						color: "#18181b",
					}}>
					{formattedTime}
				</div>

				{/* Running Status */}
				<span
					style={{
						fontSize: "0.85rem",
						color: "#52525b",
						display: "flex",
						alignItems: "center",
						gap: "6px",
						fontWeight: 600,
					}}>
					<span
						style={{
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							background: isRunning ? theme.stroke : "#a1a1aa",
							boxShadow: isRunning ? `0 0 8px ${theme.stroke}` : "none",
						}}
					/>
					{isRunning
						? t("pomodoro.running")
						: timeLeft < totalDuration
						? t("pomodoro.paused")
						: t("pomodoro.ready")}
				</span>
			</div>
		</div>
	);
}
