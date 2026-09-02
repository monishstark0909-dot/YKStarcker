/** @format */

"use client";

import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { useTranslation } from "@/lib/i18n/i18n-context";

export default function RegisterPage() {
	const { t } = useTranslation();

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div className='stack' style={{ gap: "6px", textAlign: "center", alignItems: "center" }}>
				<h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
					{t("auth.create_account_title")}
				</h1>
				<p className='muted' style={{ fontSize: "0.88rem", margin: 0, color: "#a1a1aa" }}>
					{t("auth.create_account_subtitle")}
				</p>
			</div>

			<AuthForm mode='register' />

			<div style={{ textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", fontSize: "0.85rem", color: "#a1a1aa" }}>
				<span>{t("auth.already_have_account")} </span>
				<Link href='/login' style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
					{t("auth.login_button")}
				</Link>
			</div>
		</div>
	);
}
