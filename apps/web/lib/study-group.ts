/** @format */

import { getApiBaseUrl } from "./api-config";

async function requestJson<TResponse>(path: string): Promise<TResponse> {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}${path}`, {
		credentials: "include",
		cache: "no-store",
	});

	if (!response.ok) {
		const errText = await response.text().catch(() => "Unknown error");
		let errMessage = `Request failed with status ${response.status}`;
		try {
			const parsed = JSON.parse(errText);
			if (parsed?.message) {
				errMessage =
					typeof parsed.message === "string"
						? parsed.message
						: parsed.message.join(", ");
			}
		} catch {}
		throw new Error(errMessage);
	}

	return response.json() as Promise<TResponse>;
}

export async function getStudyGroupMembers() {
	return requestJson<any[]>("/api/study-group/members");
}

export async function getStudyGroupMember(id: string) {
	return requestJson<any>(`/api/study-group/members/${id}`);
}

export async function getStudyGroupLeaderboard() {
	return requestJson<any>("/api/study-group/leaderboard");
}
