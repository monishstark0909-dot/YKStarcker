/** @format */

import type { DashboardMetric, WeeklyActivityPoint } from "@yks/shared";

export const dashboardMetrics: DashboardMetric[] = [
	{
		label: "Current streak",
		value: "18 days",
		delta: "+3 this week",
		tone: "positive",
	},
	{
		label: "Hours today",
		value: "2h 20m",
		delta: "65% of goal",
		tone: "neutral",
	},
	{
		label: "Questions today",
		value: "146",
		delta: "+24 from yesterday",
		tone: "positive",
	},
	{
		label: "Syllabus complete",
		value: "42%",
		delta: "+5% this month",
		tone: "positive",
	},
];

export const weeklyActivity: WeeklyActivityPoint[] = [
	{ day: "Mon", minutes: 120 },
	{ day: "Tue", minutes: 95 },
	{ day: "Wed", minutes: 150 },
	{ day: "Thu", minutes: 180 },
	{ day: "Fri", minutes: 130 },
	{ day: "Sat", minutes: 210 },
	{ day: "Sun", minutes: 165 },
];

export const focusTopics = [
	"AYT Mathematics - Functions",
	"TYT Turkish - Paragraf",
	"Physics - Motion and Force",
	"Biology - Cell Structure",
];
