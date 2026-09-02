/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	Radar,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

interface SubjectPerformanceWidgetProps {
	progress: any[];
}

export function SubjectPerformanceWidget({
	progress,
}: SubjectPerformanceWidgetProps) {
	if (!progress || progress.length === 0) {
		return (
			<Card
				title='Subject Performance'
				description='Your accuracy and completion by subject.'>
				<p className='muted' style={{ textAlign: "center", padding: "24px 0" }}>
					📚 No study sessions recorded yet. Start studying to see subject
					performance!
				</p>
			</Card>
		);
	}

	// Sort by accuracy desc → strongest, asc → weakest
	const sorted = [...progress].sort(
		(a, b) => (b.accuracyRate ?? 0) - (a.accuracyRate ?? 0),
	);
	const strongest = sorted.slice(0, 3);
	const weakest = [...sorted].reverse().slice(0, 3);

	// Radar chart data
	const radarData = progress.map((s) => ({
		subject: s.name?.length > 10 ? `${s.name.slice(0, 10)}…` : s.name,
		accuracy: s.accuracyRate ?? 0,
		completion: s.completionPercentage ?? 0,
	}));

	return (
		<Card
			title='Subject Performance'
			description='Accuracy and completion rates across all subjects.'>
			<div className='stack' style={{ gap: "20px" }}>
				{/* Radar chart */}
				{radarData.length > 0 && (
					<div>
						<p
							className='muted'
							style={{ fontSize: "0.8rem", marginBottom: "8px" }}>
							Accuracy vs Completion (radar)
						</p>
						<ResponsiveContainer width='100%' height={200}>
							<RadarChart data={radarData}>
								<PolarGrid stroke='rgba(255,255,255,0.08)' />
								<PolarAngleAxis
									dataKey='subject'
									tick={{ fill: "#a1a1aa", fontSize: 11 }}
								/>
								<Radar
									name='Accuracy'
									dataKey='accuracy'
									stroke='#6366f1'
									fill='#6366f1'
									fillOpacity={0.25}
								/>
								<Radar
									name='Completion'
									dataKey='completion'
									stroke='#22c55e'
									fill='#22c55e'
									fillOpacity={0.15}
								/>
								<Tooltip
									contentStyle={{
										background: "#18181b",
										border: "1px solid #27272a",
										borderRadius: "8px",
										color: "#fff",
									}}
									formatter={(v: any) => `${v}%`}
								/>
							</RadarChart>
						</ResponsiveContainer>
					</div>
				)}

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "16px",
					}}>
					{/* Strongest subjects */}
					<div className='stack' style={{ gap: "10px" }}>
						<span
							style={{
								fontSize: "0.8rem",
								fontWeight: 600,
								color: "#22c55e",
								textTransform: "uppercase",
								letterSpacing: "0.05em",
							}}>
							💪 Strongest
						</span>
						{strongest.map((sub) => (
							<div
								key={sub.id}
								className='stack'
								style={{
									gap: "4px",
									padding: "8px 10px",
									borderRadius: "6px",
									background: "rgba(34,197,94,0.05)",
									border: "1px solid rgba(34,197,94,0.15)",
								}}>
								<div
									className='row'
									style={{ justifyContent: "space-between" }}>
									<span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
										{sub.name}
									</span>
									<Badge tone='success'>{sub.accuracyRate ?? 0}%</Badge>
								</div>
								<ProgressBar value={sub.completionPercentage ?? 0} />
								<span className='muted' style={{ fontSize: "0.7rem" }}>
									{Math.round(((sub.timeSpentMinutes ?? 0) / 60) * 10) / 10}h
									spent · {sub.questionsSolved ?? 0} Qs
								</span>
							</div>
						))}
					</div>

					{/* Weakest subjects */}
					<div className='stack' style={{ gap: "10px" }}>
						<span
							style={{
								fontSize: "0.8rem",
								fontWeight: 600,
								color: "#ef4444",
								textTransform: "uppercase",
								letterSpacing: "0.05em",
							}}>
							⚠️ Needs Work
						</span>
						{weakest.map((sub) => (
							<div
								key={sub.id}
								className='stack'
								style={{
									gap: "4px",
									padding: "8px 10px",
									borderRadius: "6px",
									background: "rgba(239,68,68,0.05)",
									border: "1px solid rgba(239,68,68,0.15)",
								}}>
								<div
									className='row'
									style={{ justifyContent: "space-between" }}>
									<span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
										{sub.name}
									</span>
									<Badge tone='danger'>{sub.accuracyRate ?? 0}%</Badge>
								</div>
								<ProgressBar value={sub.completionPercentage ?? 0} />
								<span className='muted' style={{ fontSize: "0.7rem" }}>
									{Math.round(((sub.timeSpentMinutes ?? 0) / 60) * 10) / 10}h
									spent · {sub.questionsSolved ?? 0} Qs
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</Card>
	);
}
