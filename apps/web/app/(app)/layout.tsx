/** @format */

import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AppGuard } from "@/components/auth/AppGuard";
import { LocaleProvider } from "@/components/layout/LocaleProvider";

export default function AppLayout({ children }: PropsWithChildren) {
	return (
		<AppGuard>
			<LocaleProvider>
				<AppShell>{children}</AppShell>
			</LocaleProvider>
		</AppGuard>
	);
}
