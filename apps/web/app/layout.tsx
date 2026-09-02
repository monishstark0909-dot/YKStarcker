/** @format */

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-body",
});

const displayFont = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-display",
});

export const metadata: Metadata = {
	title: "YKS Study Tracker",
	description: "Premium SaaS study tracker for YKS preparation.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={`${bodyFont.variable} ${displayFont.variable}`}>
				<I18nProvider>{children}</I18nProvider>
			</body>
		</html>
	);
}
