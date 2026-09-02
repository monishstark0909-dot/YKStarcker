/** @format */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { me, updateUserProfile, type AuthResponse } from "@/lib/auth";
import { getOnboarding } from "@/lib/onboarding";
import { useTranslation } from "@/lib/i18n/i18n-context";

type ThemeMode = "light" | "dark" | "system";
type LanguageMode = "en" | "tr";

interface SettingsState {
	fullName: string;
	email: string;
	studyGoal: string;
	dailyGoal: number;
	focusDuration: number;
	breakDuration: number;
	theme: ThemeMode;
	compactMode: boolean;
	soundEffects: boolean;
	reminders: boolean;
	weeklyDigest: boolean;
	language: LanguageMode;
	autoBackup: boolean;
	analytics: boolean;
}

const STORAGE_KEY = "zialn-settings-v1";

function SettingRow({
	label,
	description,
	children,
}: {
	label: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className='list-item'
			style={{ alignItems: "flex-start", flexDirection: "column" }}>
			<div className='stack' style={{ gap: "4px" }}>
				<span style={{ fontWeight: 700 }}>{label}</span>
				<span className='card-copy'>{description}</span>
			</div>
			{children}
		</div>
	);
}

export default function SettingsPage() {
	const { t, language: activeLang, setLanguage } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [statusMessage, setStatusMessage] = useState(
		"Loaded from your active profile",
	);

	const [settings, setSettings] = useState<SettingsState>({
		fullName: "",
		email: "",
		studyGoal: "",
		dailyGoal: 100,
		focusDuration: 45,
		breakDuration: 10,
		theme: "dark",
		compactMode: false,
		soundEffects: true,
		reminders: true,
		weeklyDigest: true,
		language: activeLang,
		autoBackup: true,
		analytics: true,
	});

	useEffect(() => {
		let isMounted = true;

		async function loadUserSettings() {
			try {
				const [authData, onboardingData] = await Promise.all([
					me().catch(() => null),
					getOnboarding().catch(() => null),
				]);

				if (!isMounted) return;

				const user = authData?.user;
				const profile = onboardingData?.profile;

				// Try loading local storage overrides for client UI preferences
				let localPrefs: Partial<SettingsState> = {};
				try {
					const saved = window.localStorage.getItem(STORAGE_KEY);
					if (saved) localPrefs = JSON.parse(saved);
				} catch {}

				setSettings({
					fullName: user?.displayName || "",
					email: user?.email || "",
					studyGoal: profile?.targetUniversity
						? `${profile.targetUniversity} - ${profile.targetDepartment || ""}`
						: profile?.studyTrack || "Stay consistent with YKS study goals",
					dailyGoal: profile?.dailyQuestionGoal ?? 100,
					focusDuration: profile?.dailyStudyGoalMinutes ?? 45,
					breakDuration: 10,
					theme: (localPrefs.theme as ThemeMode) || "dark",
					compactMode: localPrefs.compactMode ?? false,
					soundEffects: localPrefs.soundEffects ?? true,
					reminders: localPrefs.reminders ?? true,
					weeklyDigest: localPrefs.weeklyDigest ?? true,
					language: activeLang,
					autoBackup: localPrefs.autoBackup ?? true,
					analytics: localPrefs.analytics ?? true,
				});
			} catch (err) {
				console.error("Settings load error:", err);
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadUserSettings();

		return () => {
			isMounted = false;
		};
	}, []);

	const updateSetting = <K extends keyof SettingsState>(
		key: K,
		value: SettingsState[K],
	) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
		if (key === "language") {
			setLanguage(value as LanguageMode);
		}
	};

	const handleSaveProfile = async () => {
		setSaving(true);
		setStatusMessage("Saving changes to server...");

		try {
			// Save client preferences to local storage
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

			// Save profile changes to backend database
			await updateUserProfile({
				displayName: settings.fullName,
				email: settings.email,
				dailyStudyGoalMinutes: settings.focusDuration,
				dailyQuestionGoal: settings.dailyGoal,
				targetUniversity: settings.studyGoal,
			});

			setStatusMessage("Profile updated successfully in database!");
		} catch (err: any) {
			setStatusMessage(err.message || "Failed to update profile");
		} finally {
			setSaving(false);
			setTimeout(() => {
				setStatusMessage("Changes saved to your account.");
			}, 2500);
		}
	};

	const handleExport = () => {
		const blob = new Blob(
			[
				JSON.stringify(
					{ exportedAt: new Date().toISOString(), settings },
					null,
					2,
				),
			],
			{
				type: "application/json",
			},
		);
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "yks-study-settings.json";
		link.click();
		window.URL.revokeObjectURL(url);
		setStatusMessage("Preferences exported");
	};

	if (loading) {
		return (
			<div
				className='page-frame'
				style={{ padding: "40px 0", color: "#71717a", textAlign: "center" }}>
				{t("common.loading")}
			</div>
		);
	}

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div
				className='card'
				style={{
					display: "flex",
					justifyContent: "space-between",
					gap: "16px",
					alignItems: "center",
					flexWrap: "wrap",
				}}>
				<div className='stack' style={{ gap: "8px" }}>
					<span className='badge badge--brand'>{t("nav.settings")}</span>
					<h1 className='page-title'>Account Personalization & Preferences</h1>
					<p className='card-copy'>
						Manage your real account details, daily goals, study preferences, and app themes.
					</p>
				</div>
				<div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
					<span className='badge badge--success'>{statusMessage}</span>
					<Button onClick={handleSaveProfile} disabled={saving}>
						{saving ? "Saving..." : "Save Settings"}
					</Button>
				</div>
			</div>

			<div className='field-grid'>
				<Card
					title='Profile'
					description='Your account details synced directly with the database.'>
					<div className='form'>
						<Input
							label='Full name'
							value={settings.fullName}
							onChange={(event) =>
								updateSetting("fullName", event.target.value)
							}
						/>
						<Input
							label='Email'
							type='email'
							value={settings.email}
							onChange={(event) => updateSetting("email", event.target.value)}
						/>
						<Input
							label='Target University & Goal'
							value={settings.studyGoal}
							onChange={(event) =>
								updateSetting("studyGoal", event.target.value)
							}
						/>
					</div>
				</Card>

				<Card
					title='Study preferences'
					description='Tune your daily target limits and focus session durations.'>
					<div className='form'>
						<div className='field-grid'>
							<Input
								label='Daily Question Goal'
								type='number'
								min='10'
								value={settings.dailyGoal}
								onChange={(event) =>
									updateSetting("dailyGoal", Number(event.target.value))
								}
							/>
							<Input
								label='Focus length (min)'
								type='number'
								min='15'
								step='5'
								value={settings.focusDuration}
								onChange={(event) =>
									updateSetting("focusDuration", Number(event.target.value))
								}
							/>
						</div>
						<Input
							label='Break length (min)'
							type='number'
							min='5'
							step='5'
							value={settings.breakDuration}
							onChange={(event) =>
								updateSetting("breakDuration", Number(event.target.value))
							}
						/>
					</div>
				</Card>
			</div>

			<div className='field-grid'>
				<Card
					title='Appearance'
					description='Match the workspace to your preferred theme and visual layout.'>
					<div className='stack'>
						<label className='field'>
							<span>Theme</span>
							<select
								className='select'
								value={settings.theme}
								onChange={(event) =>
									updateSetting("theme", event.target.value as ThemeMode)
								}>
								<option value='light'>Light</option>
								<option value='dark'>Dark</option>
								<option value='system'>System</option>
							</select>
						</label>
						<SettingRow
							label='Compact cards'
							description='Reduce padding for a denser dashboard view.'>
							<input
								type='checkbox'
								checked={settings.compactMode}
								onChange={(event) =>
									updateSetting("compactMode", event.target.checked)
								}
								style={{
									accentColor: "var(--brand)",
									width: "18px",
									height: "18px",
								}}
							/>
						</SettingRow>
						<SettingRow
							label='Sound effects'
							description='Play subtle cues during focus transitions.'>
							<input
								type='checkbox'
								checked={settings.soundEffects}
								onChange={(event) =>
									updateSetting("soundEffects", event.target.checked)
								}
								style={{
									accentColor: "var(--brand)",
									width: "18px",
									height: "18px",
								}}
							/>
						</SettingRow>
					</div>
				</Card>

				<Card
					title='Notifications'
					description='Control when the app nudges you back into your study rhythm.'>
					<div className='stack'>
						<SettingRow
							label='Study reminders'
							description='Get gentle reminders before your next planned session.'>
							<input
								type='checkbox'
								checked={settings.reminders}
								onChange={(event) =>
									updateSetting("reminders", event.target.checked)
								}
								style={{
									accentColor: "var(--brand)",
									width: "18px",
									height: "18px",
								}}
							/>
						</SettingRow>
						<SettingRow
							label='Weekly digest'
							description='Receive a recap of completed sessions and streaks.'>
							<input
								type='checkbox'
								checked={settings.weeklyDigest}
								onChange={(event) =>
									updateSetting("weeklyDigest", event.target.checked)
								}
								style={{
									accentColor: "var(--brand)",
									width: "18px",
									height: "18px",
								}}
							/>
						</SettingRow>
					</div>
				</Card>
			</div>

			<div className='field-grid'>
				<Card
					title='Language & data'
					description='Choose your preferred language and keep your settings portable.'>
					<div className='stack'>
						<label className='field'>
							<span>Language</span>
							<select
								className='select'
								value={settings.language}
								onChange={(event) =>
									updateSetting("language", event.target.value as LanguageMode)
								}>
								<option value='en'>English</option>
								<option value='tr'>Türkçe</option>
							</select>
						</label>
						<SettingRow
							label='Auto backup'
							description='Sync your preference changes to this device automatically.'>
							<input
								type='checkbox'
								checked={settings.autoBackup}
								onChange={(event) =>
									updateSetting("autoBackup", event.target.checked)
								}
								style={{
									accentColor: "var(--brand)",
									width: "18px",
									height: "18px",
								}}
							/>
						</SettingRow>
					</div>
				</Card>

				<Card
					title='Integrations & support'
					description='Connect music, import preferences, and manage your app experience.'>
					<div className='stack' style={{ gap: "12px" }}>
						<div
							className='list-item'
							style={{ flexDirection: "column", alignItems: "flex-start" }}>
							<span style={{ fontWeight: 700 }}>Spotify</span>
							<p className='card-copy'>
								Pair your focus playlists and let the app adapt to your mood.
							</p>
							<Link
								href='/settings/spotify'
								className='button button--secondary'>
								Open Spotify integration
							</Link>
						</div>
						<div className='row'>
							<Button variant='secondary' onClick={handleExport}>
								Export preferences
							</Button>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
