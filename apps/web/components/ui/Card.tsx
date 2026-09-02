/** @format */

import type { PropsWithChildren } from "react";

interface CardProps {
	title?: string;
	description?: string;
	className?: string;
}

export function Card({
	title,
	description,
	className = "",
	children,
}: PropsWithChildren<CardProps>) {
	return (
		<section className={`card ${className}`.trim()}>
			{(title || description) && (
				<div className='stack' style={{ marginBottom: "14px" }}>
					{title ? <h3 className='section-title'>{title}</h3> : null}
					{description ? <p className='card-copy'>{description}</p> : null}
				</div>
			)}
			{children}
		</section>
	);
}
