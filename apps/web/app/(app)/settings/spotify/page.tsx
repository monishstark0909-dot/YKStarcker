/** @format */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parseSpotifyEmbedUrl, resolveFullSongMetadata } from "@/lib/spotify-client";
import type { StudyPlaylist } from "@/components/spotify/DynamicIslandPlayer";

export default function SpotifySettingsPage() {
	const [customUrl, setCustomUrl] = useState("");
	const [userPlaylists, setUserPlaylists] = useState<StudyPlaylist[]>(() => {
		if (typeof window === "undefined") return [];
		try {
			const saved = localStorage.getItem("yks_user_spotify_playlists_v7");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [loading, setLoading] = useState(false);
	const [statusMsg, setStatusMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleAddCustom = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatusMsg(null);
		setErrorMsg(null);
		setLoading(true);

		const resolved = await resolveFullSongMetadata(customUrl);
		setLoading(false);

		if (!resolved) {
			setErrorMsg("Invalid Spotify link. Please paste a valid Spotify playlist, track, or album URL.");
			return;
		}

		const newPlaylist: StudyPlaylist = {
			id: `user-playlist-${Date.now()}`,
			title: resolved.title,
			artist: "Your Spotify Music",
			spotifyUri: customUrl.trim(),
			embedUrl: resolved.embedUrl,
			coverUrl: resolved.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80",
		};

		const updated = [newPlaylist, ...userPlaylists.filter((p) => p.id !== newPlaylist.id)];
		setUserPlaylists(updated);
		setCustomUrl("");
		setStatusMsg(`Successfully added "${resolved.title}" to your Spotify Player!`);

		try {
			localStorage.setItem("yks_user_spotify_playlists_v7", JSON.stringify(updated));
			localStorage.setItem("yks_user_spotify_active_playlist_v7", newPlaylist.id);
			localStorage.setItem("yks_user_spotify_is_playing_v7", "true");
		} catch {}
	};

	const handleRemovePlaylist = (id: string) => {
		const updated = userPlaylists.filter((p) => p.id !== id);
		setUserPlaylists(updated);
		try {
			localStorage.setItem("yks_user_spotify_playlists_v7", JSON.stringify(updated));
			if (updated.length > 0) {
				localStorage.setItem("yks_user_spotify_active_playlist_v7", updated[0].id);
			}
		} catch {}
	};

	return (
		<div className='stack' style={{ gap: "24px" }}>
			<div
				className='row'
				style={{ justifyContent: "space-between", alignItems: "center" }}>
				<div>
					<h1 className='page-title'>Spotify Music Player</h1>
					<p className='card-copy'>
						Add your Spotify playlists and tracks to stream your personal music across all pages.
					</p>
				</div>
				<Link href='/settings' className='button button--secondary'>
					Back to Settings
				</Link>
			</div>

			{statusMsg && (
				<div
					style={{
						padding: "12px 16px",
						borderRadius: "10px",
						background: "rgba(29, 185, 84, 0.12)",
						border: "1px solid rgba(29, 185, 84, 0.3)",
						color: "#1DB954",
						fontSize: "0.88rem",
						fontWeight: 600,
					}}>
					{statusMsg}
				</div>
			)}

			{/* Add Spotify URL Card */}
			<Card
				title='Add Spotify Playlist or Track'
				description='Paste any Spotify link (playlist, album, or track) to add it to your in-app player.'>
				<form onSubmit={handleAddCustom} className='stack' style={{ gap: "16px" }}>
					<Input
						label='Spotify Link or URI'
						value={customUrl}
						onChange={(e) => setCustomUrl(e.target.value)}
						placeholder='e.g. https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6'
						helperText='Copy link from Spotify app or web player and paste it here.'
					/>
					{errorMsg && <p style={{ color: "#ef4444", fontSize: "0.82rem", margin: 0 }}>{errorMsg}</p>}
					<div className='row'>
						<Button type='submit' disabled={loading} style={{ background: "#1DB954", color: "#000", fontWeight: 700 }}>
							{loading ? "Adding Song…" : "🎵 Add Playlist to Player"}
						</Button>
					</div>
				</form>
			</Card>

			{/* Your Added Spotify Playlists */}
			<Card
				title='Your Spotify Playlists & Songs'
				description='Your saved Spotify music library.'>
				{userPlaylists.length === 0 ? (
					<div style={{ padding: "32px", textAlign: "center" }}>
						<span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>🎧</span>
						<strong style={{ fontSize: "1rem", color: "#fff", display: "block" }}>No Playlists Added Yet</strong>
						<p className='muted' style={{ fontSize: "0.85rem", marginTop: "4px" }}>
							Paste a Spotify playlist or track URL above to add your favorite music!
						</p>
					</div>
				) : (
					<div className='field-grid' style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
						{userPlaylists.map((playlist) => (
							<div
								key={playlist.id}
								className='card card--clickable'
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "8px",
									padding: "16px",
									background: "rgba(29, 185, 84, 0.06)",
									border: "1px solid rgba(29, 185, 84, 0.25)",
									borderRadius: "12px",
								}}>
								<div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
									<div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0 }}>
										<div
											style={{
												width: "48px",
												height: "48px",
												borderRadius: "8px",
												background: "#1DB954",
												flexShrink: 0,
												overflow: "hidden",
											}}>
											<img
												src={playlist.coverUrl}
												alt={playlist.title}
												style={{ width: "100%", height: "100%", objectFit: "cover" }}
											/>
										</div>
										<div style={{ minWidth: 0 }}>
											<strong style={{ display: "block", fontSize: "0.9rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
												{playlist.title}
											</strong>
											<span className='muted' style={{ fontSize: "0.78rem" }}>
												{playlist.artist}
											</span>
										</div>
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleRemovePlaylist(playlist.id);
										}}
										style={{
											background: "none",
											border: "none",
											color: "#ef4444",
											cursor: "pointer",
											fontSize: "0.8rem",
											fontWeight: 600,
										}}>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>
		</div>
	);
}
