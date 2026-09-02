/** @format */

"use client";

import Link from "next/link";
import { useState } from "react";
import { confirmPasswordReset } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface PasswordResetConfirmFormProps {
	token: string;
}

export function PasswordResetConfirmForm({
	token,
}: PasswordResetConfirmFormProps) {
	const [isPending, setIsPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsPending(true);
		setErrorMessage(null);
		setSuccessMessage(null);

		const formData = new FormData(event.currentTarget);
		const password = String(formData.get("password") ?? "").trim();
		const passwordConfirmation = String(
			formData.get("passwordConfirmation") ?? "",
		).trim();

		if (!token) {
			setErrorMessage("A reset token is required.");
			setIsPending(false);
			return;
		}

		if (!password || !passwordConfirmation) {
			setErrorMessage("Both password fields are required.");
			setIsPending(false);
			return;
		}

		if (password !== passwordConfirmation) {
			setErrorMessage("Passwords do not match.");
			setIsPending(false);
			return;
		}

		try {
			await confirmPasswordReset({ token, password });
			setSuccessMessage("Your password has been updated.");
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Reset confirmation failed.",
			);
		} finally {
			setIsPending(false);
		}
	}

	if (!token) {
		return (
			<div className='stack'>
				<p className='auth-error' role='alert'>
					The reset link is missing a token.
				</p>
				<Link href='/reset-password'>Request a new reset link</Link>
			</div>
		);
	}

	if (successMessage) {
		return (
			<div className='screen-panel'>
				<strong>{successMessage}</strong>
				<p className='muted'>
					The session was revoked, so sign in again with your new password.
				</p>
				<Link href='/login'>Back to sign in</Link>
			</div>
		);
	}

	return (
		<form className='form' onSubmit={handleSubmit}>
			<Input
				label='New password'
				name='password'
				type='password'
				placeholder='Create a new password'
				autoComplete='new-password'
				required
			/>
			<Input
				label='Confirm password'
				name='passwordConfirmation'
				type='password'
				placeholder='Repeat the new password'
				autoComplete='new-password'
				required
			/>

			{errorMessage ? (
				<p className='auth-error' role='alert'>
					{errorMessage}
				</p>
			) : null}

			<div className='hero-actions'>
				<Button type='submit' disabled={isPending}>
					{isPending ? "Updating..." : "Update password"}
				</Button>
				<Link href='/login'>
					<Button variant='secondary' type='button'>
						Back to sign in
					</Button>
				</Link>
			</div>
		</form>
	);
}
