/** @format */

import { Card } from "./Card";
import { Badge } from "./Badge";

interface StatCardProps {
	label: string;
	value: string;
	delta?: string;
	tone?: "positive" | "neutral" | "warning";
}

export function StatCard({
	label,
	value,
	delta,
	tone = "neutral",
}: StatCardProps) {
	const badgeTone =
		tone === "positive"
			? "success"
			: tone === "warning"
				? "warning"
				: "default";

	return (
		<Card className='metric-card'>
			<div className='stack' style={{ gap: "10px" }}>
				<span className='muted'>{label}</span>
				<strong style={{ fontSize: "1.85rem", letterSpacing: "-0.04em" }}>
					{value}
				</strong>
				{delta ? <Badge tone={badgeTone}>{delta}</Badge> : null}
			</div>
		</Card>
	);
}
