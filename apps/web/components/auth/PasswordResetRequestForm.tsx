/** @format */

"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function PasswordResetRequestForm() {
	const [isPending, setIsPending] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [previewLink, setPreviewLink] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsPending(true);
		setErrorMessage(null);
		setSuccessMessage(null);
		setPreviewLink(null);

		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();

		if (!email) {
			setErrorMessage("Email address is required.");
			setIsPending(false);
			return;
		}

		try {
			const result = await requestPasswordReset({ email });
			setSuccessMessage(
				"If an account exists, a reset link has been prepared.",
			);
			setPreviewLink(result.previewLink);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Reset request failed.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<form className='form' onSubmit={handleSubmit}>
			<Input
				label='Email address'
				name='email'
				type='email'
				placeholder='student@example.com'
				autoComplete='email'
				required
			/>

			{errorMessage ? (
				<p className='auth-error' role='alert'>
					{errorMessage}
				</p>
			) : null}

			{successMessage ? (
				<div className='screen-panel'>
					<strong>{successMessage}</strong>
					<p className='muted'>
						Check your inbox for the recovery link. In development, a local
						preview link may also be shown below.
					</p>
				</div>
			) : null}

			{previewLink ? (
				<div className='screen-panel'>
					<strong>Local preview link</strong>
					<p className='muted'>
						Use this link to continue the reset flow in this workspace.
					</p>
					<a href={previewLink}>{previewLink}</a>
				</div>
			) : null}

			<div className='hero-actions'>
				<Button type='submit' disabled={isPending}>
					{isPending ? "Sending..." : "Send reset link"}
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
