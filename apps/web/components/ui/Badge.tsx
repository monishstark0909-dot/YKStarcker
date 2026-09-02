/** @format */

import type { PropsWithChildren } from "react";

type BadgeTone = "default" | "brand" | "success" | "warning" | "danger";

interface BadgeProps {
	tone?: BadgeTone;
	className?: string;
}

const toneClassName: Record<BadgeTone, string> = {
	default: "badge",
	brand: "badge badge--brand",
	success: "badge badge--success",
	warning: "badge badge--warning",
	danger: "badge badge--danger",
};

export function Badge({
	tone = "default",
	className = "",
	children,
}: PropsWithChildren<BadgeProps>) {
	return (
		<span className={`${toneClassName[tone]} ${className}`.trim()}>
			{children}
		</span>
	);
}
