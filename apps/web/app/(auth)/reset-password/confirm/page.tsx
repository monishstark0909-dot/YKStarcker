/** @format */

import { Card } from "@/components/ui/Card";
import { PasswordResetConfirmForm } from "@/components/auth/PasswordResetConfirmForm";

interface ResetPasswordConfirmPageProps {
	searchParams?: Promise<{
		token?: string | string[];
	}>;
}

export default async function ResetPasswordConfirmPage({
	searchParams,
}: ResetPasswordConfirmPageProps) {
	const resolvedSearchParams = await searchParams;
	const token = Array.isArray(resolvedSearchParams?.token)
		? resolvedSearchParams?.token[0]
		: resolvedSearchParams?.token;

	return (
		<Card
			title='Set a new password'
			description='Use the reset token from your email or the local preview link to finish the recovery flow.'>
			<PasswordResetConfirmForm token={token ?? ""} />
		</Card>
	);
}
