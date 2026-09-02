/** @format */

import type { PropsWithChildren } from "react";
import { AuthShell } from "@/components/layout/AuthShell";

export default function AuthLayout({ children }: PropsWithChildren) {
	return <AuthShell>{children}</AuthShell>;
}
