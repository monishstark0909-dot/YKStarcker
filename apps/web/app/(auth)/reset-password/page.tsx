/** @format */

import { Card } from "@/components/ui/Card";
import { PasswordResetRequestForm } from "@/components/auth/PasswordResetRequestForm";

export default function ResetPasswordPage() {
	return (
		<Card
			title='Reset password'
			description='Request a secure password reset link for your account.'>
			<PasswordResetRequestForm />
		</Card>
	);
}
