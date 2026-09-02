/** @format */

"use client";

import React from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";

export function LanguageToggle() {
	const { language, setLanguage } = useTranslation();

	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				background: "rgba(255, 255, 255, 0.08)",
				border: "1px solid var(--border)",
				padding: "4px",
				borderRadius: "999px",
				backdropFilter: "blur(8px)",
			}}>
			<button
				onClick={() => setLanguage("en")}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					padding: "4px 10px",
					borderRadius: "999px",
					border: "none",
					background: language === "en" ? "var(--brand)" : "transparent",
					color: language === "en" ? "#ffffff" : "var(--text-secondary)",
					fontWeight: language === "en" ? 700 : 500,
					fontSize: "0.78rem",
					cursor: "pointer",
					transition: "all 0.2s ease",
				}}>
				<span>🇬🇧</span>
				<span>EN</span>
			</button>

			<button
				onClick={() => setLanguage("tr")}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					padding: "4px 10px",
					borderRadius: "999px",
					border: "none",
					background: language === "tr" ? "var(--brand)" : "transparent",
					color: language === "tr" ? "#ffffff" : "var(--text-secondary)",
					fontWeight: language === "tr" ? 700 : 500,
					fontSize: "0.78rem",
					cursor: "pointer",
					transition: "all 0.2s ease",
				}}>
				<span>🇹🇷</span>
				<span>TR</span>
			</button>
		</div>
	);
}
