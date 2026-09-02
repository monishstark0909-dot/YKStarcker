/** @format */

"use client";

import { useEffect, useState } from "react";
import { resolveFullSongMetadata, parseSpotifyEmbedUrl } from "@/lib/spotify-client";

export interface StudyPlaylist {
	id: string;
	title: string;
	artist: string;
	spotifyUri: string;
	embedUrl: string;
	coverUrl: string;
}

export const PRESET_STUDY_PLAYLISTS: StudyPlaylist[] = [];

const STORAGE_KEY_PLAYLIST = "yks_user_spotify_active_playlist_v7";
const STORAGE_KEY_CUSTOM_LIST = "yks_user_spotify_playlists_v7";
const STORAGE_KEY_IS_PLAYING = "yks_user_spotify_is_playing_v7";

export function DynamicIslandPlayer() {
	const [userPlaylists, setUserPlaylists] = useState<StudyPlaylist[]>([]);
	const [activePlaylist, setActivePlaylist] = useState<StudyPlaylist | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [customUrlInput, setCustomUrlInput] = useState("");
	const [loadingMetadata, setLoadingMetadata] = useState(false);
	const [customUrlError, setCustomUrlError] = useState<string | null>(null);

	useEffect(() => {
		try {
			const savedList = localStorage.getItem(STORAGE_KEY_CUSTOM_LIST);
			let playlists: StudyPlaylist[] = [];
			if (savedList) {
				playlists = JSON.parse(savedList);
				setUserPlaylists(playlists);
			}

			const savedId = localStorage.getItem(STORAGE_KEY_PLAYLIST);
			if (savedId && playlists.length > 0) {
				const found = playlists.find((p) => p.id === savedId);
				if (found) setActivePlaylist(found);
				else setActivePlaylist(playlists[0]);
			} else if (playlists.length > 0) {
				setActivePlaylist(playlists[0]);
			}

			const savedPlaying = localStorage.getItem(STORAGE_KEY_IS_PLAYING);
			if (savedPlaying === "true") setIsPlaying(true);
		} catch {}
	}, []);

	const handleSelectPlaylist = (playlist: StudyPlaylist) => {
		setActivePlaylist(playlist);
		setIsPlaying(true);
		try {
			localStorage.setItem(STORAGE_KEY_PLAYLIST, playlist.id);
			localStorage.setItem(STORAGE_KEY_IS_PLAYING, "true");
		} catch {}
	};

	const handleAddCustomPlaylist = async (e: React.FormEvent) => {
		e.preventDefault();
		setCustomUrlError(null);
		setLoadingMetadata(true);

		const resolved = await resolveFullSongMetadata(customUrlInput);
		setLoadingMetadata(false);

		if (!resolved) {
			setCustomUrlError("Please enter a valid Spotify playlist, album, or track URL.");
			return;
		}

		const newPlaylist: StudyPlaylist = {
			id: `user-playlist-${Date.now()}`,
			title: resolved.title,
			artist: "Your Spotify Music",
			spotifyUri: customUrlInput.trim(),
			embedUrl: resolved.embedUrl,
			coverUrl: resolved.coverUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop&q=80",
		};

		const updated = [newPlaylist, ...userPlaylists.filter((p) => p.id !== newPlaylist.id)];
		setUserPlaylists(updated);
		setActivePlaylist(newPlaylist);
		setIsPlaying(true);
		setCustomUrlInput("");

		try {
			localStorage.setItem(STORAGE_KEY_CUSTOM_LIST, JSON.stringify(updated));
			localStorage.setItem(STORAGE_KEY_PLAYLIST, newPlaylist.id);
			localStorage.setItem(STORAGE_KEY_IS_PLAYING, "true");
		} catch {}
	};

	const togglePlay = () => {
		const nextState = !isPlaying;
		setIsPlaying(nextState);
		try {
			localStorage.setItem(STORAGE_KEY_IS_PLAYING, String(nextState));
		} catch {}
	};

	const isVisible = isHovered || isExpanded;

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				position: "fixed",
				bottom: "20px",
				left: "50%",
				transform: "translateX(-50%)",
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				pointerEvents: "auto",
			}}>
			
			{/* Expanded Popup Player (Stays permanently mounted in DOM to prevent hover out audio stop) */}
			<div
				className='spotify-player-panel'
				style={{
					display: isVisible ? "block" : "none",
					width: "385px",
					marginBottom: "12px",
					background: "rgba(18, 18, 22, 0.96)",
					backdropFilter: "blur(24px)",
					WebkitBackdropFilter: "blur(24px)",
					border: "1px solid rgba(255, 255, 255, 0.14)",
					borderRadius: "22px",
					padding: "16px",
					boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(29, 185, 84, 0.2)",
					animation: "popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
					color: "#ffffff",
				}}>
				
				{/* Header */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<svg width='18' height='18' viewBox='0 0 24 24' fill='#1DB954'>
							<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.225.37-.704.49-1.074.264-2.943-1.798-6.649-2.203-11.014-1.206-.418.096-.838-.17-.934-.588-.096-.418.17-.838.588-.934 4.778-1.09 8.868-.624 12.169 1.39.37.226.49.704.265 1.074zm1.467-3.264c-.283.46-.889.605-1.349.322-3.368-2.07-8.503-2.67-12.488-1.46-.514.156-1.053-.134-1.209-.648-.156-.514.134-1.053.648-1.209 4.557-1.383 10.221-.715 14.076 1.646.46.283.605.889.322 1.349zm.137-3.39c-4.04-2.399-10.702-2.62-14.567-1.448-.623.189-1.278-.17-1.467-.792-.189-.623.17-1.278.792-1.467 4.444-1.349 11.802-1.085 16.452 1.677.561.333.748 1.057.415 1.618-.333.561-1.057.748-1.618.415z'/>
						</svg>
						<span style={{ fontSize: "0.86rem", fontWeight: 700, letterSpacing: "-0.01em" }}>Spotify Music Player</span>
					</div>
					<button
						onClick={() => setIsExpanded(false)}
						style={{
							background: "rgba(255,255,255,0.08)",
							border: "none",
							borderRadius: "50%",
							width: "24px",
							height: "24px",
							color: "#a1a1aa",
							cursor: "pointer",
							fontSize: "0.8rem",
							display: "grid",
							placeItems: "center",
						}}>
						✕
					</button>
				</div>

				{/* Add Spotify Playlist Input Form */}
				<form onSubmit={handleAddCustomPlaylist} style={{ marginBottom: "12px", display: "flex", gap: "6px" }}>
					<input
						type='text'
						placeholder='Paste Spotify playlist or track link…'
						value={customUrlInput}
						onChange={(e) => setCustomUrlInput(e.target.value)}
						style={{
							flex: 1,
							padding: "7px 10px",
							borderRadius: "8px",
							background: "rgba(255,255,255,0.05)",
							border: "1px solid rgba(255,255,255,0.12)",
							color: "#ffffff",
							fontSize: "0.78rem",
							outline: "none",
						}}
					/>
					<button
						type='submit'
						disabled={loadingMetadata}
						style={{
							padding: "6px 12px",
							borderRadius: "8px",
							background: "#1DB954",
							color: "#000",
							border: "none",
							fontSize: "0.78rem",
							fontWeight: 700,
							cursor: "pointer",
							whiteSpace: "nowrap",
						}}>
						{loadingMetadata ? "Loading…" : "+ Add Link"}
					</button>
				</form>
				{customUrlError && (
					<p style={{ color: "#ef4444", fontSize: "0.72rem", marginTop: "-6px", marginBottom: "8px" }}>
						{customUrlError}
					</p>
				)}

				{/* User Playlists Selector Dropdown */}
				{userPlaylists.length > 0 ? (
					<div style={{ marginBottom: "12px" }}>
						<select
							value={activePlaylist?.id || ""}
							onChange={(e) => {
								const selected = userPlaylists.find((p) => p.id === e.target.value);
								if (selected) handleSelectPlaylist(selected);
							}}
							style={{
								width: "100%",
								padding: "8px 12px",
								borderRadius: "10px",
								background: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.12)",
								color: "#ffffff",
								fontSize: "0.82rem",
								fontWeight: 600,
								outline: "none",
								cursor: "pointer",
							}}>
							{userPlaylists.map((p) => (
								<option key={p.id} value={p.id} style={{ background: "#18181b", color: "#fff" }}>
									🎧 {p.title}
								</option>
							))}
						</select>
					</div>
				) : null}

				{/* Player Container: Renders Official Spotify Web Player for User's Active Playlist */}
				{activePlaylist ? (
					<div style={{ borderRadius: "14px", overflow: "hidden", height: "152px", background: "#000" }}>
						<iframe
							key={activePlaylist.id}
							src={activePlaylist.embedUrl}
							width='100%'
							height='152'
							frameBorder='0'
							allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
							loading='lazy'
							style={{ borderRadius: "14px" }}
						/>
					</div>
				) : (
					<div
						style={{
							padding: "24px",
							borderRadius: "14px",
							background: "rgba(255,255,255,0.03)",
							border: "1px dashed rgba(255,255,255,0.15)",
							textAlign: "center",
						}}>
						<span style={{ fontSize: "1.5rem", display: "block", marginBottom: "6px" }}>🎵</span>
						<strong style={{ fontSize: "0.88rem", display: "block", color: "#fff" }}>No Spotify Playlist Added Yet</strong>
						<p style={{ fontSize: "0.76rem", color: "#a1a1aa", marginTop: "4px", margin: 0 }}>
							Paste a Spotify playlist or track URL above to play your music!
						</p>
					</div>
				)}

				{/* Footer Controls & Direct Spotify App Launcher */}
				{activePlaylist && (
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
						<a
							href={activePlaylist.spotifyUri}
							target='_blank'
							rel='noreferrer'
							style={{
								fontSize: "0.8rem",
								color: "#1DB954",
								fontWeight: 700,
								textDecoration: "none",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								padding: "6px 14px",
								borderRadius: "20px",
								background: "rgba(29, 185, 84, 0.12)",
								border: "1px solid rgba(29, 185, 84, 0.3)",
							}}>
							<span>▶ Open Playlist in Spotify ↗</span>
						</a>

						<span style={{ fontSize: "0.74rem", color: "#1DB954", fontWeight: 600 }}>
							● Active Spotify Songs
						</span>
					</div>
				)}
			</div>

			{/* Compact Dynamic Island Bar (Always Visible at Bottom Center) */}
			<div
				onClick={() => setIsExpanded(!isExpanded)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					height: "44px",
					padding: "0 18px 0 14px",
					borderRadius: "999px",
					background: isHovered
						? "rgba(24, 24, 28, 0.95)"
						: "rgba(15, 15, 18, 0.88)",
					backdropFilter: "blur(18px)",
					WebkitBackdropFilter: "blur(18px)",
					border: isPlaying
						? "1px solid rgba(29, 185, 84, 0.5)"
						: "1px solid rgba(255, 255, 255, 0.12)",
					boxShadow: isPlaying
						? "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 15px rgba(29, 185, 84, 0.3)"
						: "0 8px 24px rgba(0, 0, 0, 0.3)",
					cursor: "pointer",
					transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
				}}>
				
				{/* Spotify Icon */}
				<div
					style={{
						position: "relative",
						width: "28px",
						height: "28px",
						borderRadius: "50%",
						background: "#1DB954",
						display: "grid",
						placeItems: "center",
						flexShrink: 0,
					}}>
					<svg width='16' height='16' viewBox='0 0 24 24' fill='#000000'>
						<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.225.37-.704.49-1.074.264-2.943-1.798-6.649-2.203-11.014-1.206-.418.096-.838-.17-.934-.588-.096-.418.17-.838.588-.934 4.778-1.09 8.868-.624 12.169 1.39.37.226.49.704.265 1.074zm1.467-3.264c-.283.46-.889.605-1.349.322-3.368-2.07-8.503-2.67-12.488-1.46-.514.156-1.053-.134-1.209-.648-.156-.514.134-1.053.648-1.209 4.557-1.383 10.221-.715 14.076 1.646.46.283.605.889.322 1.349zm.137-3.39c-4.04-2.399-10.702-2.62-14.567-1.448-.623.189-1.278-.17-1.467-.792-.189-.623.17-1.278.792-1.467 4.444-1.349 11.802-1.085 16.452 1.677.561.333.748 1.057.415 1.618-.333.561-1.057.748-1.618.415z'/>
					</svg>
				</div>

				{/* Title & Artist info */}
				<div style={{ display: "flex", flexDirection: "column", gap: "1px", maxWidth: "160px" }}>
					<span
						style={{
							fontSize: "0.78rem",
							fontWeight: 700,
							color: "#ffffff",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}>
						{activePlaylist ? activePlaylist.title : "No Playlist Added"}
					</span>
					<span
						style={{
							fontSize: "0.68rem",
							color: "#a1a1aa",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}>
						{activePlaylist ? activePlaylist.artist : "Paste Spotify URL"}
					</span>
				</div>

				{/* Animated Equalizer Waveform Bars when playing */}
				<div style={{ display: "flex", alignItems: "center", gap: "2px", height: "14px", padding: "0 4px" }}>
					{[0.6, 1.0, 0.4, 0.8, 0.5].map((scale, i) => (
						<div
							key={i}
							style={{
								width: "2.5px",
								height: isPlaying ? "100%" : "4px",
								background: isPlaying ? "#1DB954" : "#52525b",
								borderRadius: "2px",
								transformOrigin: "bottom",
								animation: isPlaying ? `equalizerWave 0.8s ease-in-out infinite alternate ${i * 0.15}s` : "none",
							}}
						/>
					))}
				</div>

				{/* Quick Play/Pause Action */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						togglePlay();
					}}
					style={{
						background: isPlaying ? "#1DB954" : "rgba(255,255,255,0.12)",
						border: "none",
						borderRadius: "50%",
						width: "26px",
						height: "26px",
						display: "grid",
						placeItems: "center",
						color: isPlaying ? "#000000" : "#ffffff",
						fontSize: "0.72rem",
						cursor: "pointer",
						marginLeft: "4px",
					}}>
					{isPlaying ? "❚❚" : "▶"}
				</button>
			</div>

			<style>{`
				@keyframes equalizerWave {
					0% { transform: scaleY(0.3); }
					100% { transform: scaleY(1); }
				}
				@keyframes popIn {
					from { opacity: 0; transform: translateY(10px) scale(0.96); }
					to { opacity: 1; transform: translateY(0) scale(1); }
				}
			`}</style>
		</div>
	);
}
