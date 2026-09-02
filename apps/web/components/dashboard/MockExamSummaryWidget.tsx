/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	CartesianGrid,
} from "recharts";

interface MockExamSummaryWidgetProps {
	mockStats: any | null;
}

export function MockExamSummaryWidget({
	mockStats,
}: MockExamSummaryWidgetProps) {
	if (!mockStats) {
		return (
			<Card title='Mock Exam Summary'>
				<p className='muted'>Loading mock exam statistics...</p>
			</Card>
		);
	}

	const history = mockStats.history ?? [];

	// Find latest for each type
	const latestTyt = [...history]
		.reverse()
		.find((m: any) => m.examType === "tyt");
	const latestAyt = [...history]
		.reverse()
		.find((m: any) => m.examType === "ayt");
	const latestYdt = [...history]
		.reverse()
		.find((m: any) => m.examType === "ydt");

	const chartData = history.map((m: any) => ({
		name: m.name.length > 10 ? `${m.name.slice(0, 10)}…` : m.name,
		net: m.overallNet,
		type: m.examType.toUpperCase(),
	}));

	return (
		<Card
			title='Mock Exam Summary'
			description='Latest results and performance trends.'>
			<div className='stack' style={{ gap: "20px" }}>
				{/* Latest Scores Grid */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
						gap: "12px",
					}}>
					{[
						{
							label: "Latest TYT",
							mock: latestTyt,
							avg: mockStats.tytAverageNet,
						},
						{
							label: "Latest AYT",
							mock: latestAyt,
							avg: mockStats.aytAverageNet,
						},
						{ label: "Latest YDT", mock: latestYdt, avg: null },
					].map((item) => (
						<div
							key={item.label}
							className='stack'
							style={{
								gap: "6px",
								padding: "12px",
								borderRadius: "8px",
								background: "rgba(255,255,255,0.02)",
								border: "1px solid rgba(255,255,255,0.05)",
							}}>
							<span className='muted' style={{ fontSize: "0.75rem" }}>
								{item.label}
							</span>
							<strong
								style={{
									fontSize: "1.3rem",
									color: "var(--color-primary-brand, #3b82f6)",
								}}>
								{item.mock ? `${Number(item.mock.overallNet).toFixed(2)}` : "—"}
							</strong>
							{item.mock && (
								<span
									className='muted'
									style={{
										fontSize: "0.7rem",
										textOverflow: "ellipsis",
										overflow: "hidden",
										whiteSpace: "nowrap",
									}}>
									{item.mock.name}
								</span>
							)}
							{item.avg !== null && (
								<span className='muted' style={{ fontSize: "0.7rem" }}>
									Avg: <strong>{item.avg}</strong>
								</span>
							)}
						</div>
					))}
				</div>

				{/* Accuracy and General Stats */}
				<div
					className='row'
					style={{
						justifyContent: "space-between",
						fontSize: "0.85rem",
						borderTop: "1px solid rgba(255,255,255,0.05)",
						paddingTop: "12px",
					}}>
					<span className='muted'>Overall Accuracy Rate</span>
					<strong>{mockStats.averageAccuracy}%</strong>
				</div>

				{/* Recharts Line Chart */}
				{history.length > 0 ? (
					<div>
						<p
							className='muted'
							style={{ fontSize: "0.8rem", marginBottom: "8px" }}>
							Mock Net Score Trend
						</p>
						<ResponsiveContainer width='100%' height={150}>
							<LineChart
								data={chartData}
								margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
								<CartesianGrid
									strokeDasharray='3 3'
									stroke='rgba(255,255,255,0.05)'
								/>
								<XAxis
									dataKey='name'
									tick={{ fill: "#a1a1aa", fontSize: 11 }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis
									tick={{ fill: "#a1a1aa", fontSize: 11 }}
									axisLine={false}
									tickLine={false}
								/>
								<Tooltip
									contentStyle={{
										background: "#18181b",
										border: "1px solid #27272a",
										borderRadius: "8px",
										color: "#fff",
									}}
									formatter={(v: any, name: any, props: any) => [
										`${v} net (${props.payload.type})`,
										"Score",
									]}
								/>
								<Line
									type='monotone'
									dataKey='net'
									stroke='#3b82f6'
									strokeWidth={2}
									activeDot={{ r: 6 }}
									dot={{ r: 3 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				) : (
					<p
						className='muted'
						style={{
							textAlign: "center",
							fontSize: "0.8rem",
							padding: "16px 0",
						}}>
						No mock exam trend data available.
					</p>
				)}

				<a
					href='/mock-exams'
					className='button button--secondary'
					style={{
						textDecoration: "none",
						textAlign: "center",
						fontSize: "0.85rem",
					}}>
					📋 Go to Mock Exams
				</a>
			</div>
		</Card>
	);
}
