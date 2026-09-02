/** @format */

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	helperText?: string;
}

export function Input({ label, helperText, style, ...props }: InputProps) {
	return (
		<label className='field' style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
			<span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#18181b" }}>{label}</span>
			<input
				className='input'
				style={{
					height: "42px",
					padding: "0 12px",
					fontSize: "0.88rem",
					background: "#ffffff",
					color: "#18181b",
					border: "1px solid rgba(0,0,0,0.12)",
					borderRadius: "8px",
					boxSizing: "border-box",
					...style,
				}}
				{...props}
			/>
			{helperText ? <span className='muted' style={{ fontSize: "0.75rem", color: "#71717a" }}>{helperText}</span> : null}
		</label>
	);
}
