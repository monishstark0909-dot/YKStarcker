/** @format */

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LOCALE_STORAGE_KEY = "yks_locale";
const DEFAULT_LOCALE = "en" as const;
const LOCALES = ["en", "tr"] as const;

export type LocaleCode = (typeof LOCALES)[number];

interface LocaleStrings {
	navigation: Record<string, string>;
	localeNames: Record<LocaleCode, string>;
	controls: {
		collapseSidebar: string;
		loadingWorkspace: string;
		localeToggleLabel: string;
	};
}

interface LocaleContextValue {
	locale: LocaleCode;
	setLocale: (locale: LocaleCode) => void;
	strings: LocaleStrings;
}

const translations: Record<LocaleCode, LocaleStrings> = {
	en: {
		navigation: {
			Dashboard: "Dashboard",
			Subjects: "Subjects",
			"Mock Exams": "Mock Exams",
			Planner: "Planner",
			Pomodoro: "Pomodoro",
			Friends: "Friends",
			"Study Group": "Study Group",
			Leaderboard: "Leaderboard",
			Analytics: "Analytics",
			Settings: "Settings",
		},
		localeNames: {
			en: "English",
			tr: "Türkçe",
		},
		controls: {
			collapseSidebar: "Collapse sidebar",
			loadingWorkspace: "Loading workspace...",
			localeToggleLabel: "Switch language",
		},
	},
	tr: {
		navigation: {
			Dashboard: "Pano",
			Subjects: "Konular",
			"Mock Exams": "Denemeler",
			Planner: "Planlayıcı",
			Pomodoro: "Pomodoro",
			Friends: "Arkadaşlar",
			"Study Group": "Çalışma Grubu",
			Leaderboard: "Liderlik Tablosu",
			Analytics: "Analitik",
			Settings: "Ayarlar",
		},
		localeNames: {
			en: "English",
			tr: "Türkçe",
		},
		controls: {
			collapseSidebar: "Kenar çubuğunu daralt",
			loadingWorkspace: "Çalışma alanı yükleniyor...",
			localeToggleLabel: "Dili değiştir",
		},
	},
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

	useEffect(() => {
		const savedLocale = localStorage.getItem(
			LOCALE_STORAGE_KEY,
		) as LocaleCode | null;
		if (savedLocale && LOCALES.includes(savedLocale)) {
			setLocaleState(savedLocale);
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
		document.documentElement.lang = locale;
	}, [locale]);

	const setLocale = (value: LocaleCode) => {
		if (LOCALES.includes(value)) {
			setLocaleState(value);
		}
	};

	const value = useMemo(
		() => ({ locale, setLocale, strings: translations[locale] }),
		[locale],
	);

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	);
}

export function useLocale() {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error("useLocale must be used within a LocaleProvider");
	}
	return context;
}
