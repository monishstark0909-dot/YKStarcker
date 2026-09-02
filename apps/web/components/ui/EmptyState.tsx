/** @format */

import type { PropsWithChildren } from "react";

interface EmptyStateProps {
	title?: string;
	description?: string;
	action?: { label: string; href?: string; onClick?: () => void };
}

export function EmptyState({
	title,
	description,
	action,
}: PropsWithChildren<EmptyStateProps>) {
	return (
		<div
			style={{ padding: 28, display: "grid", gap: 12, justifyItems: "center" }}>
			<div
				style={{
					width: 84,
					height: 84,
					borderRadius: 18,
					background: "linear-gradient(135deg,#e6eefc,#f0f7ff)",
					display: "grid",
					placeItems: "center",
				}}>
				<svg
					width='36'
					height='36'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
					aria-hidden>
					<path
						d='M12 2v7'
						stroke='#0f6bff'
						strokeWidth='1.5'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M5 11a7 7 0 0114 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6z'
						stroke='#0f6bff'
						strokeWidth='1.2'
						strokeLinecap='round'
						strokeLinejoin='round'
						fill='rgba(15,107,255,0.04)'
					/>
				</svg>
			</div>
			<div style={{ textAlign: "center", maxWidth: 420 }}>
				<strong style={{ display: "block", marginBottom: 6 }}>
					{title ?? "No data yet"}
				</strong>
				{description ? (
					<p className='muted' style={{ margin: 0 }}>
						{description}
					</p>
				) : null}
			</div>
			{action ? (
				action.href ? (
					<a href={action.href} className='button button--primary'>
						{action.label}
					</a>
				) : (
					<button onClick={action.onClick} className='button button--primary'>
						{action.label}
					</button>
				)
			) : null}
		</div>
	);
}
