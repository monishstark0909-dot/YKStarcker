/** @format */

"use client";

import { useLocale } from "./LocaleProvider";

export function LanguageToggle() {
	const { locale, setLocale, strings } = useLocale();

	return (
		<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
			<span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
				{strings.controls.localeToggleLabel}
			</span>
			<button
				type='button'
				aria-pressed={locale === "en"}
				onClick={() => setLocale("en")}
				style={{
					border:
						locale === "en"
							? "1px solid #6366f1"
							: "1px solid rgba(148, 163, 184, 0.3)",
					background:
						locale === "en" ? "rgba(99, 102, 241, 0.08)" : "transparent",
					color: locale === "en" ? "#eef2ff" : "#cbd5e1",
					borderRadius: "999px",
					padding: "6px 10px",
					cursor: "pointer",
				}}>
				EN
			</button>
			<button
				type='button'
				aria-pressed={locale === "tr"}
				onClick={() => setLocale("tr")}
				style={{
					border:
						locale === "tr"
							? "1px solid #6366f1"
							: "1px solid rgba(148, 163, 184, 0.3)",
					background:
						locale === "tr" ? "rgba(99, 102, 241, 0.08)" : "transparent",
					color: locale === "tr" ? "#eef2ff" : "#cbd5e1",
					borderRadius: "999px",
					padding: "6px 10px",
					cursor: "pointer",
				}}>
				TR
			</button>
		</div>
	);
}
