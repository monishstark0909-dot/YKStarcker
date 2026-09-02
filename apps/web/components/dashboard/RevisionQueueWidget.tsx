/** @format */

"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface RevisionQueueWidgetProps {
	queue: any[];
}

export function RevisionQueueWidget({ queue }: RevisionQueueWidgetProps) {
	const dueToday = queue.filter((q) => {
		if (!q.reviewDate) return true;
		return new Date(q.reviewDate) <= new Date();
	});

	const pending = queue.filter((q) => {
		if (!q.reviewDate) return false;
		return new Date(q.reviewDate) > new Date();
	});

	return (
		<Card
			title="Revision Queue"
			description={`${dueToday.length} due now · ${pending.length} upcoming`}
		>
			<div className="stack" style={{ gap: "16px" }}>
				{queue.length === 0 ? (
					<p className="muted" style={{ textAlign: "center", padding: "16px 0" }}>
						🎉 No pending revisions! Keep up the great work.
					</p>
				) : (
					<>
						{/* Due now */}
						{dueToday.length > 0 && (
							<div className="stack" style={{ gap: "8px" }}>
								<span
									style={{
										fontSize: "0.75rem",
										fontWeight: 600,
										color: "#ef4444",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
									}}
								>
									Due Now ({dueToday.length})
								</span>
								{dueToday.slice(0, 5).map((q: any) => (
									<div
										key={q.id}
										className="row"
										style={{
											padding: "10px 12px",
											borderRadius: "8px",
											background: "rgba(239,68,68,0.05)",
											border: "1px solid rgba(239,68,68,0.15)",
											justifyContent: "space-between",
											gap: "8px",
											flexWrap: "wrap",
										}}
									>
										<div className="stack" style={{ gap: "2px" }}>
											<span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
												{q.subject?.name ?? "General"}{q.topic ? ` › ${q.topic.name}` : ""}
											</span>
											<span
												className="muted"
												style={{ fontSize: "0.75rem", maxWidth: "240px" }}
											>
												{q.reason?.slice(0, 60)}
												{(q.reason?.length ?? 0) > 60 ? "…" : ""}
											</span>
										</div>
										<Badge tone="danger">Due</Badge>
									</div>
								))}
								{dueToday.length > 5 && (
									<p className="muted" style={{ fontSize: "0.8rem" }}>
										+{dueToday.length - 5} more due…
									</p>
								)}
							</div>
						)}

						{/* Upcoming */}
						{pending.length > 0 && (
							<div className="stack" style={{ gap: "8px" }}>
								<span
									style={{
										fontSize: "0.75rem",
										fontWeight: 600,
										color: "#a1a1aa",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
									}}
								>
									Upcoming ({pending.length})
								</span>
								{pending.slice(0, 3).map((q: any) => (
									<div
										key={q.id}
										className="row"
										style={{
											padding: "10px 12px",
											borderRadius: "8px",
											background: "rgba(255,255,255,0.02)",
											border: "1px solid rgba(255,255,255,0.05)",
											justifyContent: "space-between",
											gap: "8px",
											flexWrap: "wrap",
										}}
									>
										<div className="stack" style={{ gap: "2px" }}>
											<span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
												{q.subject?.name ?? "General"}{q.topic ? ` › ${q.topic.name}` : ""}
											</span>
											<span className="muted" style={{ fontSize: "0.75rem" }}>
												{q.reviewDate
													? `Due ${new Date(q.reviewDate).toLocaleDateString()}`
													: "Unscheduled"}
											</span>
										</div>
										<Badge tone="default">Soon</Badge>
									</div>
								))}
							</div>
						)}

						{/* CTA */}
						<a
							href="/wrong-questions"
							className="button button--primary"
							style={{ textDecoration: "none", textAlign: "center" }}
						>
							📝 Open Review Queue ({queue.length})
						</a>
					</>
				)}
			</div>
		</Card>
	);
}
