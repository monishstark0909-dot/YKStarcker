/** @format */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import enLocale from "@/locales/en.json";
import trLocale from "@/locales/tr.json";

export type Language = "en" | "tr";

const locales: Record<Language, any> = {
	en: enLocale,
	tr: trLocale,
};

interface I18nContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (path: string, params?: Record<string, string | number>) => string;
	formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
	formatNumber: (num: number) => string;
	formatPercent: (num: number) => string;
}

const I18nContext = createContext<I18nContextType>({
	language: "en",
	setLanguage: () => {},
	t: (path) => path,
	formatDate: (d) => String(d),
	formatNumber: (n) => String(n),
	formatPercent: (n) => `${n}%`,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [language, setLanguageState] = useState<Language>("en");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("yks_lang") as Language | null;
			if (saved === "en" || saved === "tr") {
				setLanguageState(saved);
			} else {
				const browserLang = navigator.language.toLowerCase();
				if (browserLang.startsWith("tr")) {
					setLanguageState("tr");
				}
			}
		}
	}, []);

	const setLanguage = (lang: Language) => {
		setLanguageState(lang);
		if (typeof window !== "undefined") {
			localStorage.setItem("yks_lang", lang);
			document.cookie = `yks_lang=${lang}; path=/; max-age=31536000`;
		}
	};

	const t = (path: string, params?: Record<string, string | number>): string => {
		const keys = path.split(".");
		let current: any = locales[language] || locales.en;

		for (const key of keys) {
			if (current && typeof current === "object" && key in current) {
				current = current[key];
			} else {
				// Fallback to English dictionary if key missing in target language
				let fallbackObj: any = locales.en;
				for (const fallbackKey of keys) {
					if (fallbackObj && typeof fallbackObj === "object" && fallbackKey in fallbackObj) {
						fallbackObj = fallbackObj[fallbackKey];
					} else {
						return path;
					}
				}
				current = fallbackObj;
				break;
			}
		}

		if (typeof current !== "string") {
			return path;
		}

		let result = current;
		if (params) {
			for (const [paramKey, paramVal] of Object.entries(params)) {
				result = result.replace(new RegExp(`{${paramKey}}`, "g"), String(paramVal));
			}
		}

		return result;
	};

	const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
		try {
			const d = new Date(date);
			const defaultOpts: Intl.DateTimeFormatOptions = options || {
				day: "numeric",
				month: "long",
				year: "numeric",
			};
			return new Intl.DateTimeFormat(language === "tr" ? "tr-TR" : "en-US", defaultOpts).format(d);
		} catch {
			return String(date);
		}
	};

	const formatNumber = (num: number): string => {
		try {
			return new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US").format(num);
		} catch {
			return String(num);
		}
	};

	const formatPercent = (num: number): string => {
		try {
			const formatted = new Intl.NumberFormat(language === "tr" ? "tr-TR" : "en-US").format(num);
			return language === "tr" ? `%${formatted}` : `${formatted}%`;
		} catch {
			return `${num}%`;
		}
	};

	return (
		<I18nContext.Provider
			value={{
				language,
				setLanguage,
				t,
				formatDate,
				formatNumber,
				formatPercent,
			}}>
			{children}
		</I18nContext.Provider>
	);
}

export function useTranslation() {
	return useContext(I18nContext);
}
export function useLanguage() {
	return useContext(I18nContext);
}
