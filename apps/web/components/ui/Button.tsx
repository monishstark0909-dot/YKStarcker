/** @format */

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const variantClassName: Record<ButtonVariant, string> = {
	primary: "button button--primary",
	secondary: "button button--secondary",
	ghost: "button button--ghost",
};

const sizeClassName: Record<ButtonSize, string> = {
	sm: "button--sm",
	md: "button--md",
	lg: "button--lg",
};

export function Button({
	variant = "primary",
	size = "md",
	children,
	className = "",
	...props
}: PropsWithChildren<ButtonProps>) {
	return (
		<button
			className={`${variantClassName[variant]} ${sizeClassName[size]} ${className}`.trim()}
			{...props}>
			{children}
		</button>
	);
}
