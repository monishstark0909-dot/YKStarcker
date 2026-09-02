/** @format */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPaths = [
	"/dashboard",
	"/subjects",
	"/study-sessions",
	"/questions",
	"/wrong-questions",
	"/mock-exams",
	"/planner",
	"/pomodoro",
	"/friends",
	"/analytics",
	"/settings",
	"/onboarding",
];

export function middleware(request: NextRequest) {
	const isProtected = protectedPaths.some((path) =>
		request.nextUrl.pathname.startsWith(path),
	);

	if (!isProtected) {
		return NextResponse.next();
	}

	const hasAuthCookie = Boolean(request.cookies.get("yks_access_token"));
	if (hasAuthCookie) {
		return NextResponse.next();
	}

	const loginUrl = new URL("/login", request.url);
	loginUrl.searchParams.set("next", request.nextUrl.pathname);
	return NextResponse.redirect(loginUrl);
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/subjects/:path*",
		"/study-sessions/:path*",
		"/questions/:path*",
		"/wrong-questions/:path*",
		"/mock-exams/:path*",
		"/planner/:path*",
		"/pomodoro/:path*",
		"/friends/:path*",
		"/analytics/:path*",
		"/settings/:path*",
		"/onboarding/:path*",
	],
};
