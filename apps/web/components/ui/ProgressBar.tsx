/** @format */

interface ProgressBarProps {
	value: number;
	label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
	return (
		<div className='stack' style={{ gap: "8px" }}>
			{label ? (
				<div className='row' style={{ justifyContent: "space-between" }}>
					<strong>{label}</strong>
					<span className='muted'>{value}%</span>
				</div>
			) : null}
			<div className='progress' aria-hidden='true'>
				<div
					className='progress__value'
					style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
				/>
			</div>
		</div>
	);
}
