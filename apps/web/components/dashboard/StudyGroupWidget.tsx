/** @format */

"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface StudyGroupWidgetProps {
	studyGroup: any | null;
}

export function StudyGroupWidget({ studyGroup }: StudyGroupWidgetProps) {
	const { t } = useTranslation();

	if (!studyGroup) {
		return (
			<Card title={t("dashboard.study_group")} description={t("dashboard.cohort_glance")}>
				<p className='muted'>{t("common.loading")}</p>
			</Card>
		);
	}

	const topMembers = (studyGroup.topMembers ?? []).slice(0, 3);
	const currentRank = studyGroup.currentRank ?? null;

	return (
		<Card title={t("dashboard.study_group")} description={t("dashboard.cohort_glance")}>
			<div className='stack' style={{ gap: "16px" }}>
				{topMembers.length === 0 ? (
					<p className='muted'>{t("leaderboard.no_data")}</p>
				) : (
					<div className='stack' style={{ gap: "12px" }}>
						{topMembers.map((member: any, index: number) => (
							<div
								key={member.id}
								className='row'
								style={{ justifyContent: "space-between", gap: "12px" }}>
								<div>
									<strong>
										{index + 1}. {member.displayName}
									</strong>
									<div className='muted'>{t("members.score")} {member.value}</div>
								</div>
								<Link
									href={`/profile/${member.id}`}
									className='button button--ghost'
									style={{ whiteSpace: "nowrap" }}>
									{t("common.view")}
								</Link>
							</div>
						))}
						<div
							className='row'
							style={{ justifyContent: "space-between", alignItems: "center" }}>
							<Link href='/leaderboard' className='button button--secondary'>
								{t("dashboard.view_leaderboard")}
							</Link>
							{currentRank !== null && (
								<div className='muted'>
									Rank: <strong>#{currentRank}</strong>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</Card>
	);
}
