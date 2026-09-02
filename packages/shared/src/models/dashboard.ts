/** @format */

export interface DashboardMetric {
	label: string;
	value: string;
	delta?: string;
	tone?: "positive" | "neutral" | "warning";
}

export interface WeeklyActivityPoint {
	day: string;
	minutes: number;
}
