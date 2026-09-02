/** @format */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStudyGroupMember } from "@/lib/study-group";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

export default function ProfilePage() {
	const params = useParams();
	const memberId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
	const [member, setMember] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!memberId) return;
		getStudyGroupMember(memberId)
			.then(setMember)
			.catch((err) => setError(err.message || "Failed to load member."))
			.finally(() => setLoading(false));
	}, [memberId]);

	if (loading) {
		return <Card title='Member profile'>Loading profile…</Card>;
	}

	if (error) {
		return <Card title='Member profile'>{error}</Card>;
	}

	if (!member) {
		return <Card title='Member profile'>Member not found.</Card>;
	}

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div
				className='row'
				style={{ justifyContent: "space-between", alignItems: "center" }}>
				<div>
					<h1 className='page-title'>{member.displayName}</h1>
					<p className='muted'>
						{member.targetDepartment ?? "No target department"}
					</p>
				</div>
			</div>

			<div className='grid grid--2' style={{ gap: "24px" }}>
				<Card title='Study summary'>
					<div className='grid grid--3' style={{ gap: "12px" }}>
						<StatCard label='Streak' value={`${member.currentStreak} days`} />
						<StatCard
							label='Weekly study'
							value={`${member.weeklyStudyHours} hrs`}
						/>
						<StatCard
							label='Questions solved'
							value={`${member.questionsSolved}`}
						/>
					</div>
				</Card>

				<Card title='Latest mock exams'>
					{member.mockHistory.length === 0 ? (
						<p className='muted'>No mock exams recorded.</p>
					) : (
						<div className='list'>
							{member.mockHistory.map((mock: any) => (
								<div key={mock.id} className='list-item'>
									<div>
										<strong>{mock.name}</strong>
										<p className='muted'>
											{mock.examType.toUpperCase()} •{" "}
											{new Date(mock.takenAt).toLocaleDateString()}
										</p>
									</div>
									<div>{mock.overallNet}</div>
								</div>
							))}
						</div>
					)}
				</Card>
			</div>

			<Card title='Subject progress'>
				{member.subjectProgress.length === 0 ? (
					<p className='muted'>No subject progress available.</p>
				) : (
					<div className='responsive-grid'>
						{member.subjectProgress.map((subject: any) => (
							<div key={subject.subjectId} className='card card--secondary'>
								<strong>{subject.name}</strong>
								<div
									className='row'
									style={{ justifyContent: "space-between" }}>
									<span>{subject.timeSpentMinutes} min</span>
									<span>{subject.accuracyRate}%</span>
								</div>
								<p className='muted'>
									{subject.questionsSolved} questions solved
								</p>
							</div>
						))}
					</div>
				)}
			</Card>

			<Card title='Recent study sessions'>
				{member.recentStudySessions.length === 0 ? (
					<p className='muted'>No sessions recorded yet.</p>
				) : (
					<div className='list'>
						{member.recentStudySessions.map((session: any) => (
							<div key={session.id} className='list-item'>
								<div>
									<strong>{session.subjectName ?? "Study session"}</strong>
									<p className='muted'>
										{session.topicName ?? session.subtopicName ?? "No topic"}
									</p>
								</div>
								<span>{session.durationMinutes} min</span>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
}
