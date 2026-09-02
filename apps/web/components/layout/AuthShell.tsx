/** @format */

"use client";

import type { PropsWithChildren } from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export function AuthShell({ children }: PropsWithChildren) {
	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				padding: "24px 16px",
				position: "relative",
				background: "radial-gradient(circle at 50% 15%, rgba(99, 102, 241, 0.12) 0%, rgba(9, 9, 11, 0.98) 70%)",
			}}>
			{/* Top Navbar Header */}
			<header
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					padding: "20px 28px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					maxWidth: "1200px",
					margin: "0 auto",
				}}>
				<Link href='/' style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
					<div
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "8px",
							background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 0 16px rgba(99, 102, 241, 0.4)",
						}}>
						<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#ffffff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
							<path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z' />
							<path d='M6 6h10M6 10h10' />
						</svg>
					</div>
					<strong style={{ fontSize: "1.05rem", color: "#ffffff", letterSpacing: "-0.01em" }}>
						YKS Tracker
					</strong>
				</Link>

				<LanguageToggle />
			</header>

			{/* Centered Auth Box */}
			<div
				style={{
					width: "100%",
					maxWidth: "420px",
					borderRadius: "20px",
					background: "#121215",
					border: "1px solid rgba(255, 255, 255, 0.08)",
					padding: "36px 32px",
					boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 32px rgba(99, 102, 241, 0.08)",
					display: "flex",
					flexDirection: "column",
					gap: "24px",
					backdropFilter: "blur(12px)",
				}}>
				{children}
			</div>
		</div>
	);
}
