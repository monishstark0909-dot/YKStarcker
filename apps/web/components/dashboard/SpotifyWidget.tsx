/** @format */

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
	getSpotifyStatus,
	disconnectSpotify,
	spotifyConnectUrl,
} from "@/lib/spotify";
import type { SpotifyConnectionStatus } from "@yks/shared";

export function SpotifyWidget() {
	const [status, setStatus] = useState<SpotifyConnectionStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadStatus() {
			setLoading(true);
			try {
				const statusResponse = await getSpotifyStatus();
				if (!isMounted) return;
				setStatus(statusResponse);
				setError(null);
			} catch (err: any) {
				if (!isMounted) return;
				setStatus({ connected: false });
				setError(null);
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadStatus();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<Card title='Spotify' description='Focus music and study-ready playlists.'>
			<div className='stack' style={{ gap: "16px" }}>
				{loading ? (
					<p className='muted'>Checking Spotify connection…</p>
				) : status?.connected ? (
					<>
						<p>
							<strong>Connected as</strong>{" "}
							{status.displayName ?? "Spotify user"}
						</p>
						<p className='muted'>
							Connection expires at {status.expiresAt ?? "unknown"}
						</p>
						<div className='row' style={{ gap: "12px" }}>
							<a className='button button--secondary' href='/settings/spotify'>
								Manage
							</a>
							<button
								className='button button--ghost'
								onClick={async () => {
									setLoading(true);
									try {
										await disconnectSpotify();
										setStatus({ connected: false });
									} catch (error) {
										setError("Could not disconnect Spotify.");
									}
									setLoading(false);
								}}>
								Disconnect
							</button>
						</div>
					</>
				) : (
					<>
						<p className='muted'>Spotify is not connected yet.</p>
						<a href={spotifyConnectUrl} className='button button--primary'>
							Connect Spotify
						</a>
					</>
				)}
				{error ? <p className='muted'>{error}</p> : null}
			</div>
		</Card>
	);
}
