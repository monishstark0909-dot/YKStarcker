/** @format */

"use client";

import React from "react";
import type { SoundType } from "@/lib/ambient-sound";
import { useTranslation } from "@/lib/i18n/i18n-context";

export interface FocusSettings {
	autoStartBreaks: boolean;
	autoStartNextSession: boolean;
	notificationSound: boolean;
	volume: number;
	ambientSound: SoundType;
	ambientVolume: number;
}

interface SettingsDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	settings: FocusSettings;
	onUpdateSettings: (newSettings: Partial<FocusSettings>) => void;
}

export function SettingsDrawer({
	isOpen,
	onClose,
	settings,
	onUpdateSettings,
}: SettingsDrawerProps) {
	const { t } = useTranslation();

	if (!isOpen) return null;

	const ambientOptions: { type: SoundType; label: string; icon: string }[] = [
		{ type: "none", label: t("pomodoro.sound_off"), icon: "🔇" },
		{ type: "rain", label: t("pomodoro.sound_rain"), icon: "🌧️" },
		{ type: "ocean", label: t("pomodoro.sound_ocean"), icon: "🌊" },
		{ type: "forest", label: t("pomodoro.sound_forest"), icon: "🌲" },
		{ type: "cafe", label: t("pomodoro.sound_cafe"), icon: "☕" },
		{ type: "white_noise", label: t("pomodoro.sound_white_noise"), icon: "📻" },
	];

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 9999,
				display: "flex",
				justifyContent: "flex-end",
				background: "rgba(15, 23, 42, 0.4)",
				backdropFilter: "blur(6px)",
				animation: "fadeIn 0.2s ease-out",
			}}>
			<div
				onClick={onClose}
				style={{ position: "absolute", inset: 0, cursor: "pointer" }}
			/>

			<div
				style={{
					position: "relative",
					zIndex: 10000,
					width: "min(440px, 92vw)",
					height: "100%",
					background: "#ffffff",
					boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
					borderLeft: "1px solid rgba(0,0,0,0.08)",
					display: "flex",
					flexDirection: "column",
					padding: "28px 24px",
					overflowY: "auto",
					gap: "28px",
				}}>
				{/* Drawer Header */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						borderBottom: "1px solid rgba(0,0,0,0.08)",
						paddingBottom: "16px",
					}}>
					<div>
						<h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#18181b" }}>
							{t("pomodoro.settings")}
						</h2>
						<p
							style={{
								fontSize: "0.85rem",
								color: "#52525b",
								margin: "4px 0 0 0",
							}}>
							{t("pomodoro.subtitle")}
						</p>
					</div>
					<button
						onClick={onClose}
						style={{
							background: "transparent",
							border: "none",
							padding: "8px 12px",
							borderRadius: "50%",
							fontSize: "1.2rem",
							cursor: "pointer",
							color: "#71717a",
						}}>
						✕
					</button>
				</div>

				{/* Timer Automation */}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<h3
						style={{
							fontSize: "0.85rem",
							fontWeight: 700,
							color: "#4f46e5",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							margin: 0,
						}}>
						{t("pomodoro.timer_automation")}
					</h3>

					<label
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							cursor: "pointer",
							background: "#f8f9fa",
							padding: "14px 16px",
							borderRadius: "10px",
							border: "1px solid rgba(0,0,0,0.06)",
						}}>
						<div>
							<strong style={{ display: "block", fontSize: "0.92rem", color: "#18181b" }}>
								{t("pomodoro.auto_start_breaks")}
							</strong>
							<span
								style={{
									fontSize: "0.78rem",
									color: "#52525b",
								}}>
								{t("pomodoro.auto_start_breaks_desc")}
							</span>
						</div>
						<input
							type='checkbox'
							checked={settings.autoStartBreaks}
							onChange={(e) =>
								onUpdateSettings({ autoStartBreaks: e.target.checked })
							}
							style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }}
						/>
					</label>

					<label
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							cursor: "pointer",
							background: "#f8f9fa",
							padding: "14px 16px",
							borderRadius: "10px",
							border: "1px solid rgba(0,0,0,0.06)",
						}}>
						<div>
							<strong style={{ display: "block", fontSize: "0.92rem", color: "#18181b" }}>
								{t("pomodoro.auto_start_next")}
							</strong>
							<span
								style={{
									fontSize: "0.78rem",
									color: "#52525b",
								}}>
								{t("pomodoro.auto_start_next_desc")}
							</span>
						</div>
						<input
							type='checkbox'
							checked={settings.autoStartNextSession}
							onChange={(e) =>
								onUpdateSettings({ autoStartNextSession: e.target.checked })
							}
							style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }}
						/>
					</label>
				</div>

				{/* Sound Alerts */}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<h3
						style={{
							fontSize: "0.85rem",
							fontWeight: 700,
							color: "#4f46e5",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							margin: 0,
						}}>
						{t("pomodoro.sound_alerts")}
					</h3>

					<label
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							cursor: "pointer",
							background: "#f8f9fa",
							padding: "14px 16px",
							borderRadius: "10px",
							border: "1px solid rgba(0,0,0,0.06)",
						}}>
						<div>
							<strong style={{ display: "block", fontSize: "0.92rem", color: "#18181b" }}>
								{t("pomodoro.ring_chime")}
							</strong>
							<span
								style={{
									fontSize: "0.78rem",
									color: "#52525b",
								}}>
								{t("pomodoro.ring_chime_desc")}
							</span>
						</div>
						<input
							type='checkbox'
							checked={settings.notificationSound}
							onChange={(e) =>
								onUpdateSettings({ notificationSound: e.target.checked })
							}
							style={{ width: "18px", height: "18px", accentColor: "#4f46e5" }}
						/>
					</label>

					{settings.notificationSound && (
						<div
							style={{
								background: "#f8f9fa",
								padding: "14px 16px",
								borderRadius: "10px",
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								border: "1px solid rgba(0,0,0,0.06)",
							}}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: "0.85rem",
									color: "#18181b",
								}}>
								<span style={{ fontWeight: 600 }}>{t("pomodoro.alert_volume")}</span>
								<strong>{Math.round(settings.volume * 100)}%</strong>
							</div>
							<input
								type='range'
								min='0'
								max='1'
								step='0.05'
								value={settings.volume}
								onChange={(e) =>
									onUpdateSettings({ volume: parseFloat(e.target.value) })
								}
								style={{ accentColor: "#4f46e5", cursor: "pointer" }}
							/>
						</div>
					)}
				</div>

				{/* Background Sounds */}
				<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<h3
						style={{
							fontSize: "0.85rem",
							fontWeight: 700,
							color: "#4f46e5",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							margin: 0,
						}}>
						{t("pomodoro.ambient_sounds")}
					</h3>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: "10px",
						}}>
						{ambientOptions.map((opt) => {
							const active = settings.ambientSound === opt.type;
							return (
								<button
									key={opt.type}
									onClick={() =>
										onUpdateSettings({ ambientSound: opt.type })
									}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "10px",
										padding: "12px",
										borderRadius: "8px",
										border: active
											? "2px solid #4f46e5"
											: "1px solid rgba(0,0,0,0.08)",
										background: active
											? "#eef2ff"
											: "#f8f9fa",
										color: active ? "#4f46e5" : "#18181b",
										fontWeight: active ? 700 : 500,
										cursor: "pointer",
										transition: "all 0.15s ease",
									}}>
									<span style={{ fontSize: "1.2rem" }}>{opt.icon}</span>
									<span style={{ fontSize: "0.85rem" }}>{opt.label}</span>
								</button>
							);
						})}
					</div>

					{settings.ambientSound !== "none" && (
						<div
							style={{
								background: "#f8f9fa",
								padding: "14px 16px",
								borderRadius: "10px",
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								marginTop: "4px",
								border: "1px solid rgba(0,0,0,0.06)",
							}}>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: "0.85rem",
									color: "#18181b",
								}}>
								<span style={{ fontWeight: 600 }}>{t("pomodoro.ambient_volume")}</span>
								<strong>{Math.round(settings.ambientVolume * 100)}%</strong>
							</div>
							<input
								type='range'
								min='0'
								max='1'
								step='0.05'
								value={settings.ambientVolume}
								onChange={(e) =>
									onUpdateSettings({
										ambientVolume: parseFloat(e.target.value),
									})
								}
								style={{ accentColor: "#4f46e5", cursor: "pointer" }}
							/>
						</div>
					)}
				</div>

				<div style={{ marginTop: "auto", paddingTop: "16px" }}>
					<button
						className='button button--primary'
						onClick={onClose}
						style={{ width: "100%", justifyContent: "center" }}>
						{t("pomodoro.done")}
					</button>
				</div>
			</div>
		</div>
	);
}
