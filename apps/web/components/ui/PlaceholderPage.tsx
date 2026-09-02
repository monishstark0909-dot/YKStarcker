/** @format */

"use client";

import { Badge } from "./Badge";
import { Card } from "./Card";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface PlaceholderPageProps {
	badge: string;
	title: string;
	description: string;
	highlights?: string[];
}

export function PlaceholderPage({
	badge,
	title,
	description,
	highlights = [],
}: PlaceholderPageProps) {
	const { t } = useTranslation();

	return (
		<div className='stack' style={{ gap: "24px" }}>
			{/* Top Header Card */}
			<div
				style={{
					background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)",
					border: "1px solid rgba(99, 102, 241, 0.15)",
					borderRadius: "16px",
					padding: "32px",
					display: "flex",
					flexDirection: "column",
					gap: "16px",
					position: "relative",
					overflow: "hidden",
				}}>
				<div style={{ zIndex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
					<Badge tone='brand'>{badge}</Badge>
					<h1 className='page-title' style={{ margin: 0, fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>
						{title}
					</h1>
					<p className='screen-copy' style={{ maxWidth: "60ch", margin: 0, color: "#a1a1aa", fontSize: "0.95rem", lineHeight: 1.6 }}>
						{description}
					</p>
				</div>

				{/* Subtle background glow */}
				<div
					style={{
						position: "absolute",
						top: "-50px",
						right: "-50px",
						width: "200px",
						height: "200px",
						borderRadius: "50%",
						background: "rgba(99, 102, 241, 0.15)",
						filter: "blur(40px)",
						pointerEvents: "none",
					}}
				/>
			</div>

			{/* Highlights Features Grid */}
			{highlights.length > 0 && (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
					{highlights.map((highlight) => (
						<Card
							key={highlight}
							title={highlight}
							description={t("dashboard.building_momentum")}>
							<div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
								<span
									style={{
										width: "6px",
										height: "6px",
										borderRadius: "50%",
										background: "var(--brand)",
										boxShadow: "0 0 8px var(--brand)",
									}}
								/>
								<span style={{ fontSize: "0.8rem", color: "#71717a", fontWeight: 500 }}>
									{t("common.in_progress")}
								</span>
							</div>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
