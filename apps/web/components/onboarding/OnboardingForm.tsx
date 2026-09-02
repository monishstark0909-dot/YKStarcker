/** @format */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getProfile, updateOnboardingProfile } from "@/lib/onboarding";
import { useTranslation } from "@/lib/i18n/i18n-context";
import type { OnboardingFormState } from "@/lib/onboarding";

export function OnboardingForm() {
	const { t } = useTranslation();
	const router = useRouter();

	const examTypeOptions = [
		{ value: "tyt", label: "TYT" },
		{ value: "ayt", label: "AYT" },
		{ value: "both", label: "TYT + AYT" },
		{ value: "ydt", label: "YDT" },
	];

	const studyTrackOptions = [
		{ value: "sayisal", label: "Sayısal" },
		{ value: "esit_agirlik", label: "Eşit Ağırlık" },
		{ value: "sozel", label: "Sözel" },
		{ value: "dil", label: "Dil" },
	];

	const preferredStudyTimeOptions = [
		{ value: "morning", label: t("onboarding.study_time_morning") },
		{ value: "afternoon", label: t("onboarding.study_time_afternoon") },
		{ value: "evening", label: t("onboarding.study_time_evening") },
		{ value: "night", label: t("onboarding.study_time_night") },
	];

	const stepTitles = [
		t("onboarding.step1_title"),
		t("onboarding.step2_title"),
		t("onboarding.step3_title"),
		t("onboarding.step4_title"),
	];

	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(true);

	const [formState, setFormState] = useState<OnboardingFormState>({
		examType: "both",
		studyTrack: "sayisal",
		targetUniversity: "",
		targetDepartment: "",
		targetRanking: "",
		dailyStudyGoalMinutes: "180",
		dailyQuestionGoal: "120",
		preferredStudyTime: "evening",
		timezone: "Europe/Istanbul",
		locale: "tr",
	});

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		getProfile()
			.then((existingProfile) => {
				if (!isMounted) return;
				if (existingProfile) {
					setFormState({
						examType: existingProfile.examType ?? "both",
						studyTrack: existingProfile.studyTrack ?? "sayisal",
						targetUniversity: existingProfile.targetUniversity ?? "",
						targetDepartment: existingProfile.targetDepartment ?? "",
						targetRanking: existingProfile.targetRanking
							? String(existingProfile.targetRanking)
							: "",
						dailyStudyGoalMinutes: existingProfile.dailyStudyGoalMinutes
							? String(existingProfile.dailyStudyGoalMinutes)
							: "180",
						dailyQuestionGoal: existingProfile.dailyQuestionGoal
							? String(existingProfile.dailyQuestionGoal)
							: "120",
						preferredStudyTime: existingProfile.preferredStudyTime ?? "evening",
						timezone: existingProfile.timezone ?? "Europe/Istanbul",
						locale: existingProfile.locale ?? "tr",
					});
				}
			})
			.catch(() => {})
			.finally(() => {
				if (isMounted) setLoading(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	function updateField<K extends keyof OnboardingFormState>(
		field: K,
		value: OnboardingFormState[K],
	) {
		setFormState((prev) => ({ ...prev, [field]: value }));
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (step < 4) {
			setStep((prev) => prev + 1);
			return;
		}

		setSaving(true);
		setError(null);

		try {
			await updateOnboardingProfile({
				examType: formState.examType === "both" ? "ayt" : formState.examType,
				studyTrack: formState.studyTrack || "sayisal",
				targetUniversity: formState.targetUniversity || "",
				targetDepartment: formState.targetDepartment || "",
				targetRanking: formState.targetRanking
					? Number(formState.targetRanking)
					: 1000,
				dailyStudyGoalMinutes: formState.dailyStudyGoalMinutes
					? Number(formState.dailyStudyGoalMinutes)
					: 180,
				dailyQuestionGoal: formState.dailyQuestionGoal
					? Number(formState.dailyQuestionGoal)
					: 120,
				preferredStudyTime: formState.preferredStudyTime || "evening",
				timezone: formState.timezone || "Europe/Istanbul",
				locale: formState.locale || "tr",
			});
			router.replace("/dashboard");
		} catch (err: any) {
			setError(err.message || "Failed to save onboarding configuration.");
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<Card title={t("onboarding.loading_title")} description={t("onboarding.loading_subtitle")}>
				<div style={{ padding: "32px 0", textAlign: "center", color: "#71717a" }}>
					{t("common.loading")}
				</div>
			</Card>
		);
	}

	return (
		<div style={{ maxWidth: "640px", margin: "0 auto", padding: "16px 0" }} className='stack'>
			<div className='stack' style={{ gap: "8px", marginBottom: "16px" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<span style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#52525b", fontWeight: 700 }}>
						{t("onboarding.step_indicator", { step: String(step), title: stepTitles[step - 1] })}
					</span>
					<span style={{ fontSize: "0.78rem", color: "#52525b", fontWeight: 600 }}>
						{Math.round((step / 4) * 100)}% Complete
					</span>
				</div>
				<div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.06)", borderRadius: "2px", overflow: "hidden" }}>
					<div style={{ width: `${(step / 4) * 100}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", transition: "width 0.3s ease" }} />
				</div>
			</div>

			<Card
				title={stepTitles[step - 1]}
				description={
					step === 1 ? t("onboarding.step1_desc")
					: step === 2 ? t("onboarding.step2_desc")
					: step === 3 ? t("onboarding.step3_desc")
					: t("onboarding.step4_desc")
				}>
				<form className='form' onSubmit={handleSubmit} style={{ gap: "20px" }}>
					{/* STEP 1: Academic Profile */}
					{step === 1 && (
						<div className='responsive-form-grid' style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
							<label className='field' style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
								<span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#18181b" }}>{t("onboarding.exam_type")}</span>
								<select
									className='input'
									style={{ height: "42px", padding: "0 12px", background: "#ffffff", color: "#18181b", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", boxSizing: "border-box" }}
									value={formState.examType}
									onChange={(event) =>
										updateField("examType", event.target.value as OnboardingFormState["examType"])
									}>
									{examTypeOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</label>

							<label className='field' style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
								<span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#18181b" }}>{t("onboarding.study_track")}</span>
								<select
									className='input'
									style={{ height: "42px", padding: "0 12px", background: "#ffffff", color: "#18181b", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", boxSizing: "border-box" }}
									value={formState.studyTrack}
									onChange={(event) =>
										updateField("studyTrack", event.target.value)
									}>
									{studyTrackOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<span className='muted' style={{ fontSize: "0.75rem", color: "#71717a" }}>
									{t("onboarding.study_track_desc")}
								</span>
							</label>
						</div>
					)}

					{/* STEP 2: Goal Selection */}
					{step === 2 && (
						<div className='stack' style={{ gap: "20px" }}>
							<div className='responsive-form-grid' style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
								<Input
									label={t("onboarding.target_uni")}
									name='targetUniversity'
									value={formState.targetUniversity}
									onChange={(event) => updateField("targetUniversity", event.target.value)}
									placeholder='Bosphorus University'
									helperText={t("onboarding.target_uni_desc")}
								/>
								<Input
									label={t("onboarding.target_dept")}
									name='targetDepartment'
									value={formState.targetDepartment}
									onChange={(event) => updateField("targetDepartment", event.target.value)}
									placeholder='Computer Engineering'
								/>
							</div>
							<div className='responsive-form-grid' style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
								<Input
									label={t("onboarding.target_rank")}
									name='targetRanking'
									type='number'
									min='1'
									value={formState.targetRanking}
									onChange={(event) => updateField("targetRanking", event.target.value)}
									placeholder='1200'
									helperText={t("onboarding.target_rank_desc")}
								/>
							</div>
						</div>
					)}

					{/* STEP 3: Daily Targets */}
					{step === 3 && (
						<div className='stack' style={{ gap: "20px" }}>
							<div className='responsive-form-grid' style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
								<Input
									label={t("onboarding.daily_study_goal")}
									name='dailyStudyGoalMinutes'
									type='number'
									min='1'
									value={formState.dailyStudyGoalMinutes}
									onChange={(event) =>
										updateField("dailyStudyGoalMinutes", event.target.value)
									}
									placeholder='180'
								/>
								<Input
									label={t("onboarding.daily_q_goal")}
									name='dailyQuestionGoal'
									type='number'
									min='1'
									value={formState.dailyQuestionGoal}
									onChange={(event) =>
										updateField("dailyQuestionGoal", event.target.value)
									}
									placeholder='160'
								/>
							</div>
							<div className='responsive-form-grid' style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
								<label className='field' style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
									<span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#18181b" }}>{t("onboarding.pref_study_time")}</span>
									<select
										className='input'
										style={{ height: "42px", padding: "0 12px", background: "#ffffff", color: "#18181b", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "8px", boxSizing: "border-box" }}
										value={formState.preferredStudyTime}
										onChange={(event) =>
											updateField("preferredStudyTime", event.target.value)
										}>
										{preferredStudyTimeOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</label>
							</div>
						</div>
					)}

					{/* STEP 4: Review & Finalize */}
					{step === 4 && (
						<div className='stack' style={{ gap: "20px" }}>
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
								<Input
									label={t("onboarding.timezone")}
									name='timezone'
									value={formState.timezone}
									onChange={(event) => updateField("timezone", event.target.value)}
									placeholder='Europe/Istanbul'
								/>
								<Input
									label={t("onboarding.locale")}
									name='locale'
									value={formState.locale}
									onChange={(event) => updateField("locale", event.target.value)}
									placeholder='tr'
								/>
							</div>
							<div
								style={{
									padding: "14px 16px",
									borderRadius: "10px",
									background: "#f8f9fa",
									border: "1px solid rgba(0,0,0,0.06)",
									fontSize: "0.88rem",
									color: "#18181b",
									lineHeight: 1.5,
								}}>
								<strong style={{ display: "block", marginBottom: "4px", color: "#4f46e5" }}>Summary:</strong>
								<div>• Exam: <strong>{formState.examType.toUpperCase()}</strong> ({formState.studyTrack})</div>
								<div>• Goal: <strong>{formState.targetUniversity || "Not set"}</strong> ({formState.targetDepartment || "Not set"})</div>
								<div>• Daily Target: <strong>{formState.dailyStudyGoalMinutes} mins</strong> / <strong>{formState.dailyQuestionGoal} Qs</strong></div>
							</div>
						</div>
					)}

					{error ? <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div> : null}

					<div style={{ display: "flex", justifyContent: "between", alignItems: "center", paddingTop: "12px", marginTop: "8px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
						<div>
							{step > 1 && (
								<Button
									type='button'
									variant='secondary'
									onClick={() => setStep((prev) => prev - 1)}>
									{t("onboarding.back")}
								</Button>
							)}
						</div>
						<div style={{ display: "flex", gap: "8px" }}>
							<Button type='submit' disabled={saving}>
								{saving ? t("common.saving")
								: step === 4 ? t("onboarding.finalize")
								: t("onboarding.next")}
							</Button>

							<Button
								type='button'
								variant='secondary'
								onClick={() => router.replace("/dashboard")}>
								{t("onboarding.skip")}
							</Button>
						</div>
					</div>
				</form>
			</Card>
		</div>
	);
}
