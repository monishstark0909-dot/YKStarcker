/** @format */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { login, register } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n/i18n-context";

type AuthMode = "login" | "register";

interface AuthFormProps {
	mode: AuthMode;
}

function calculatePasswordStrength(password: string): { score: number; labelKey: string; color: string } {
	if (!password) return { score: 0, labelKey: "strength_weak", color: "#52525b" };
	let score = 0;
	if (password.length >= 6) score += 1;
	if (password.length >= 10) score += 1;
	if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;

	if (score <= 1) return { score: 25, labelKey: "strength_weak", color: "#ef4444" };
	if (score === 2) return { score: 50, labelKey: "strength_fair", color: "#f59e0b" };
	if (score === 3) return { score: 75, labelKey: "strength_good", color: "#3b82f6" };
	return { score: 100, labelKey: "strength_strong", color: "#22c55e" };
}

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();
	const { t } = useTranslation();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);

	const strength = calculatePasswordStrength(password);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorMessage(null);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		const pwd = password.trim();
		const displayName = String(formData.get("displayName") ?? "").trim();
		const username = String(formData.get("username") ?? "").trim();
		const rememberMe = formData.get("rememberMe") === "on";

		if (!email || !pwd) {
			setErrorMessage(t("auth.required_field"));
			return;
		}

		if (pwd.length < 6) {
			setErrorMessage(t("auth.password_short"));
			return;
		}

		if (mode === "register") {
			if (!displayName || !username) {
				setErrorMessage(t("auth.required_field"));
				return;
			}
			if (pwd !== confirmPassword.trim()) {
				setErrorMessage(t("auth.password_mismatch"));
				return;
			}
			if (!agreeTerms) {
				setErrorMessage(t("auth.terms_required"));
				return;
			}
		}

		setIsPending(true);

		try {
			const response =
				mode === "login"
					? await login({ email, password: pwd, rememberMe })
					: await register({ displayName, username, email, password: pwd });

			if (!response.user) {
				throw new Error(t("common.error"));
			}
			router.replace(response.profile ? "/dashboard" : "/onboarding");
			router.refresh();
		} catch (error: any) {
			setErrorMessage(error instanceof Error ? error.message : t("common.error"));
			setIsPending(false);
		}
	}

	return (
		<div className='stack' style={{ gap: "20px" }}>
			<form className='form' onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				{mode === "register" && (
					<>
						<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
							<label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e4e4e7" }}>
								{t("auth.full_name")}
							</label>
							<input
								name='displayName'
								placeholder={t("auth.full_name_placeholder")}
								autoComplete='name'
								required
								className='input'
								style={{ padding: "10px 12px", fontSize: "0.88rem" }}
							/>
						</div>

						<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
							<label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e4e4e7" }}>
								{t("auth.username")}
							</label>
							<input
								name='username'
								placeholder={t("auth.username_placeholder")}
								autoComplete='username'
								required
								className='input'
								style={{ padding: "10px 12px", fontSize: "0.88rem" }}
							/>
						</div>
					</>
				)}

				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e4e4e7" }}>
						{t("auth.email")}
					</label>
					<input
						name='email'
						type='email'
						placeholder={t("auth.email_placeholder")}
						autoComplete='email'
						required
						className='input'
						style={{ padding: "10px 12px", fontSize: "0.88rem" }}
					/>
				</div>

				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e4e4e7" }}>
						{t("auth.password")}
					</label>
					<div style={{ position: "relative" }}>
						<input
							name='password'
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder='••••••••'
							autoComplete={mode === "login" ? "current-password" : "new-password"}
							required
							className='input'
							style={{ padding: "10px 40px 10px 12px", fontSize: "0.88rem", width: "100%" }}
						/>
						<button
							type='button'
							onClick={() => setShowPassword(!showPassword)}
							style={{
								position: "absolute",
								right: "10px",
								top: "50%",
								transform: "translateY(-50%)",
								background: "transparent",
								border: "none",
								color: "#a1a1aa",
								cursor: "pointer",
								fontSize: "0.8rem",
							}}>
							{showPassword ? "🙈" : "👁️"}
						</button>
					</div>

					{/* Password Strength Indicator for Register */}
					{mode === "register" && password.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
								<span style={{ color: "#a1a1aa" }}>Password Strength:</span>
								<span style={{ color: strength.color, fontWeight: 600 }}>{t(`auth.${strength.labelKey}`)}</span>
							</div>
							<div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
								<div
									style={{
										height: "100%",
										width: `${strength.score}%`,
										background: strength.color,
										transition: "all 0.3s ease",
									}}
								/>
							</div>
						</div>
					)}
				</div>

				{mode === "register" && (
					<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
						<label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e4e4e7" }}>
							{t("auth.confirm_password")}
						</label>
						<div style={{ position: "relative" }}>
							<input
								name='confirmPassword'
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder='••••••••'
								autoComplete='new-password'
								required
								className='input'
								style={{ padding: "10px 40px 10px 12px", fontSize: "0.88rem", width: "100%" }}
							/>
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								style={{
									position: "absolute",
									right: "10px",
									top: "50%",
									transform: "translateY(-50%)",
									background: "transparent",
									border: "none",
									color: "#a1a1aa",
									cursor: "pointer",
									fontSize: "0.8rem",
								}}>
								{showConfirmPassword ? "🙈" : "👁️"}
							</button>
						</div>
					</div>
				)}

				{mode === "login" ? (
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
						<label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a1a1aa", cursor: "pointer" }}>
							<input type='checkbox' name='rememberMe' style={{ accentColor: "var(--brand)" }} />
							<span>{t("auth.remember_me")}</span>
						</label>
						<a href='/reset-password' style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 500 }}>
							{t("auth.forgot_password")}
						</a>
					</div>
				) : (
					<label style={{ display: "flex", alignItems: "center", gap: "10px", color: "#a1a1aa", fontSize: "0.78rem", cursor: "pointer" }}>
						<input
							type='checkbox'
							checked={agreeTerms}
							onChange={(e) => setAgreeTerms(e.target.checked)}
							style={{ accentColor: "var(--brand)", width: "16px", height: "16px" }}
						/>
						<span>{t("auth.agree_terms")}</span>
					</label>
				)}

				{errorMessage && (
					<div
						style={{
							padding: "10px 12px",
							borderRadius: "8px",
							background: "rgba(239, 68, 68, 0.08)",
							border: "1px solid rgba(239, 68, 68, 0.2)",
							color: "#ef4444",
							fontSize: "0.82rem",
						}}>
						⚠️ {errorMessage}
					</div>
				)}

				<button
					type='submit'
					disabled={isPending}
					style={{
						marginTop: "6px",
						padding: "12px",
						borderRadius: "10px",
						border: "none",
						background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
						color: "#ffffff",
						fontWeight: 600,
						fontSize: "0.92rem",
						cursor: isPending ? "not-allowed" : "pointer",
						boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
						transition: "all 0.15s ease",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: "8px",
					}}>
					{isPending ? (
						<>
							<div
								style={{
									width: 16,
									height: 16,
									border: "2px solid rgba(255,255,255,0.3)",
									borderTopColor: "#fff",
									borderRadius: "50%",
									animation: "spin 0.8s linear infinite",
								}}
							/>
							<span>{t("common.loading")}</span>
						</>
					) : mode === "login" ? (
						t("auth.login_button")
					) : (
						t("auth.register_button")
					)}
				</button>
			</form>

			{/* Divider */}
			<div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" }}>
				<div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
				<span style={{ fontSize: "0.75rem", color: "#71717a", fontWeight: 600 }}>{t("auth.or_divider")}</span>
				<div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
			</div>

			{/* Social Logins */}
			<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
				<button
					type='button'
					disabled
					style={{
						padding: "10px",
						borderRadius: "10px",
						border: "1px solid rgba(255,255,255,0.08)",
						background: "rgba(255,255,255,0.02)",
						color: "#a1a1aa",
						fontSize: "0.85rem",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "10px",
						cursor: "not-allowed",
						opacity: 0.7,
					}}>
					<svg width='18' height='18' viewBox='0 0 24 24'>
						<path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
						<path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
						<path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z' />
						<path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z' />
					</svg>
					<span>{t("auth.google_login")}</span>
					<span style={{ fontSize: "0.68rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", marginLeft: "auto" }}>
						{t("auth.coming_soon")}
					</span>
				</button>

				<button
					type='button'
					disabled
					style={{
						padding: "10px",
						borderRadius: "10px",
						border: "1px solid rgba(255,255,255,0.08)",
						background: "rgba(255,255,255,0.02)",
						color: "#a1a1aa",
						fontSize: "0.85rem",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "10px",
						cursor: "not-allowed",
						opacity: 0.7,
					}}>
					<svg width='18' height='18' viewBox='0 0 24 24' fill='#ffffff'>
						<path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.34c.67-.82 1.13-1.96.99-3.1-.97.04-2.17.65-2.85 1.45-.6.69-1.13 1.83-.98 2.95 1.09.08 2.22-.53 2.84-1.3' />
					</svg>
					<span>{t("auth.apple_login")}</span>
					<span style={{ fontSize: "0.68rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", marginLeft: "auto" }}>
						{t("auth.coming_soon")}
					</span>
				</button>
			</div>

			<style>{`
				@keyframes spin {
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
}
