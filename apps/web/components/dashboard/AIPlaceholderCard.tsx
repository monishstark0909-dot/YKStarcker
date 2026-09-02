/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/i18n-context";
import {
	fetchAIRecommendations,
	type AIRecommendationsResponse,
} from "@/lib/ai";

export function AIPlaceholderCard() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<AIRecommendationsResponse | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadRecommendations() {
			try {
				const result = await fetchAIRecommendations();
				if (isMounted) {
					setData(result);
				}
			} catch (err: any) {
				if (isMounted) {
					console.error("AI recommendations error:", err);
					setError(err.message || t("common.error"));
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadRecommendations();

		return () => {
			isMounted = false;
		};
	}, []);

	if (error) {
		return (
			<Card
				title={`🤖 ${t("dashboard.ai_coach")}`}
				description={t("dashboard.prioritized_suggestion")}>
				<div
					className='stack'
					style={{
						gap: "12px",
						padding: "16px",
						borderRadius: "8px",
						background: "rgba(239, 68, 68, 0.05)",
						border: "1px solid rgba(239, 68, 68, 0.15)",
						alignItems: "center",
						textAlign: "center",
					}}>
					<span style={{ fontSize: "1.5rem" }}>⚠️</span>
					<span className='muted' style={{ fontSize: "0.85rem" }}>
						{error}
					</span>
					<button
						className='button button--secondary'
						style={{ fontSize: "0.75rem" }}
						onClick={() => window.location.reload()}>
						{t("common.retry")}
					</button>
				</div>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card
				title={`🤖 ${t("dashboard.ai_coach")}`}
				description={t("common.loading")}>
				<div
					className='stack'
					style={{
						gap: "12px",
						padding: "24px",
						alignItems: "center",
						textAlign: "center",
					}}>
					<div
						style={{
							width: 32,
							height: 32,
							border: "2px solid rgba(99,102,241,0.2)",
							borderTopColor: "#6366f1",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
						}}
					/>
					<span className='muted' style={{ fontSize: "0.85rem" }}>
						{t("common.loading")}
					</span>
					<style>{`
						@keyframes spin {
							to { transform: rotate(360deg); }
						}
					`}</style>
				</div>
			</Card>
		);
	}

	const recommendationsArray = Array.isArray(data?.recommendations)
		? data.recommendations
		: typeof data?.recommendations === "string"
			? [data.recommendations]
			: [];

	const primary =
		recommendationsArray[0] ?? t("dashboard.ai_default_suggestion");

	return (
		<Card title={`🤖 ${t("dashboard.ai_coach")}`} description={t("dashboard.prioritized_suggestion")}>
			<div className='stack' style={{ gap: "12px" }}>
				<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: 12,
							background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
							display: "grid",
							placeItems: "center",
							color: "white",
							fontSize: 26,
						}}>
						🤖
					</div>
					<div style={{ minWidth: 0 }}>
						<strong style={{ display: "block" }}>{primary}</strong>
					</div>
				</div>

				<a
					href='/pomodoro'
					className='button button--primary'
					style={{ width: "100%", justifyContent: "center" }}>
					{t("dashboard.apply_suggestion")}
				</a>
			</div>
		</Card>
	);
}
