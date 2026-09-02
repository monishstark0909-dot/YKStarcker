/** @format */

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { me } from "@/lib/auth";

export function AppGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		let isMounted = true;
		me()
			.then((response) => {
				if (!isMounted) {
					return;
				}

				const hasProfile = Boolean(response.profile);
				const isOnboardingPage = pathname === "/onboarding";

				if (!hasProfile && !isOnboardingPage) {
					router.replace("/onboarding");
				} else {
					setIsReady(true);
				}
			})
			.catch(() => {
				if (isMounted) {
					router.replace("/login");
				}
			});

		return () => {
			isMounted = false;
		};
	}, [router, pathname]);

	if (!isReady) {
		return (
			<div
				style={{
					display: "grid",
					placeItems: "center",
					minHeight: "100vh",
					background: "var(--bg-app, #09090b)",
					color: "var(--fg-default, #fafafa)",
					fontFamily: "var(--font-sans, sans-serif)",
				}}>
				<div className='stack' style={{ alignItems: "center", gap: "16px" }}>
					<strong style={{ fontSize: "1.2rem" }}>Verifying session...</strong>
					<span className='muted'>Securing workspace and syncing profile</span>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
