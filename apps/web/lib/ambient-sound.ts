/** @format */

type SoundType = "none" | "rain" | "cafe" | "forest" | "white_noise" | "ocean";

class AmbientSoundEngine {
	private ctx: AudioContext | null = null;
	private currentSound: SoundType = "none";
	private masterGain: GainNode | null = null;
	private sourceNodes: AudioNode[] = [];
	private isPlaying: boolean = false;
	private volume: number = 0.5;

	private initContext() {
		if (!this.ctx && typeof window !== "undefined") {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (AudioCtx) {
				this.ctx = new AudioCtx();
			}
		}
		if (this.ctx && this.ctx.state === "suspended") {
			this.ctx.resume();
		}
	}

	public setVolume(vol: number) {
		this.volume = Math.max(0, Math.min(1, vol));
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
		}
	}

	public stop() {
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
		}
		setTimeout(() => {
			this.sourceNodes.forEach((node) => {
				try {
					if ("stop" in node && typeof (node as any).stop === "function") {
						(node as any).stop();
					}
					node.disconnect();
				} catch {}
			});
			this.sourceNodes = [];
			this.isPlaying = false;
			this.currentSound = "none";
		}, 100);
	}

	public play(type: SoundType, volume: number = 0.5) {
		this.initContext();
		if (!this.ctx) return;

		this.stop();
		if (type === "none") return;

		this.currentSound = type;
		this.volume = volume;

		this.masterGain = this.ctx.createGain();
		this.masterGain.gain.value = this.volume;
		this.masterGain.connect(this.ctx.destination);

		switch (type) {
			case "rain":
				this.createRainSound();
				break;
			case "ocean":
				this.createOceanSound();
				break;
			case "white_noise":
				this.createWhiteNoiseSound();
				break;
			case "forest":
				this.createForestSound();
				break;
			case "cafe":
				this.createCafeSound();
				break;
		}

		this.isPlaying = true;
	}

	private createWhiteBuffer(): AudioBuffer | null {
		if (!this.ctx) return null;
		const bufferSize = 2 * this.ctx.sampleRate;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const output = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			output[i] = Math.random() * 2 - 1;
		}
		return buffer;
	}

	private createRainSound() {
		if (!this.ctx || !this.masterGain) return;
		const buffer = this.createWhiteBuffer();
		if (!buffer) return;

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;

		// Lowpass filter for soft rain rumble
		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 1000;

		const filter2 = this.ctx.createBiquadFilter();
		filter2.type = "highpass";
		filter2.frequency.value = 400;

		noise.connect(filter);
		filter.connect(filter2);
		filter2.connect(this.masterGain);

		noise.start();
		this.sourceNodes.push(noise, filter, filter2);
	}

	private createOceanSound() {
		if (!this.ctx || !this.masterGain) return;
		const buffer = this.createWhiteBuffer();
		if (!buffer) return;

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;

		// Filter with LFO modulation for wave swelling
		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 350;

		const lfo = this.ctx.createOscillator();
		lfo.type = "sine";
		lfo.frequency.value = 0.12; // Wave cycle ~8 seconds

		const lfoGain = this.ctx.createGain();
		lfoGain.gain.value = 300;

		lfo.connect(lfoGain);
		lfoGain.connect(filter.frequency);

		noise.connect(filter);
		filter.connect(this.masterGain);

		lfo.start();
		noise.start();
		this.sourceNodes.push(noise, filter, lfo, lfoGain);
	}

	private createWhiteNoiseSound() {
		if (!this.ctx || !this.masterGain) return;
		const buffer = this.createWhiteBuffer();
		if (!buffer) return;

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;

		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 3000;

		noise.connect(filter);
		filter.connect(this.masterGain);

		noise.start();
		this.sourceNodes.push(noise, filter);
	}

	private createForestSound() {
		if (!this.ctx || !this.masterGain) return;
		const buffer = this.createWhiteBuffer();
		if (!buffer) return;

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;

		// Bandpass wind whistle
		const windFilter = this.ctx.createBiquadFilter();
		windFilter.type = "bandpass";
		windFilter.frequency.value = 500;
		windFilter.Q.value = 3.0;

		const lfo = this.ctx.createOscillator();
		lfo.frequency.value = 0.2;
		const lfoGain = this.ctx.createGain();
		lfoGain.gain.value = 250;

		lfo.connect(lfoGain);
		lfoGain.connect(windFilter.frequency);

		noise.connect(windFilter);
		windFilter.connect(this.masterGain);

		lfo.start();
		noise.start();
		this.sourceNodes.push(noise, windFilter, lfo, lfoGain);
	}

	private createCafeSound() {
		if (!this.ctx || !this.masterGain) return;
		const buffer = this.createWhiteBuffer();
		if (!buffer) return;

		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;

		const bandpass = this.ctx.createBiquadFilter();
		bandpass.type = "bandpass";
		bandpass.frequency.value = 800;
		bandpass.Q.value = 1.5;

		const lowpass = this.ctx.createBiquadFilter();
		lowpass.type = "lowpass";
		lowpass.frequency.value = 1200;

		noise.connect(bandpass);
		bandpass.connect(lowpass);
		lowpass.connect(this.masterGain);

		noise.start();
		this.sourceNodes.push(noise, bandpass, lowpass);
	}

	public playChime(volume: number = 0.8) {
		this.initContext();
		if (!this.ctx) return;

		try {
			const now = this.ctx.currentTime;
			const gain = this.ctx.createGain();
			gain.gain.setValueAtTime(volume, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
			gain.connect(this.ctx.destination);

			// Pleasant 2-note completion chord (E5 -> B5)
			const osc1 = this.ctx.createOscillator();
			osc1.type = "sine";
			osc1.frequency.setValueAtTime(659.25, now); // E5

			const osc2 = this.ctx.createOscillator();
			osc2.type = "sine";
			osc2.frequency.setValueAtTime(987.77, now + 0.15); // B5

			osc1.connect(gain);
			osc2.connect(gain);

			osc1.start(now);
			osc1.stop(now + 1.2);

			osc2.start(now + 0.15);
			osc2.stop(now + 1.8);
		} catch {}
	}
}

export const ambientEngine = new AmbientSoundEngine();
export type { SoundType };
