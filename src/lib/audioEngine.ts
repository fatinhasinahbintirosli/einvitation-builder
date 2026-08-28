'use client';

// Sound Synthesis Engine for 50 Curated Melodies (Zero External Dependencies)
class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private timerId: any = null;
  private htmlAudio: HTMLAudioElement | null = null;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a single synthesized note with custom instrument timbre
  private playNote(
    freq: number,
    timeOffset: number,
    duration: number,
    type: OscillatorType = 'sine',
    filterFreq: number = 2000,
    gainLevel: number = 0.2
  ) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime + timeOffset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      console.warn('Synth error:', e);
    }
  }

  // Melodic Loops for Each Category
  private startMelodyLoop(trackId: string) {
    this.stopSynth();

    const playCycle = () => {
      if (!this.isPlaying || !this.ctx) return;

      const num = parseInt(trackId.replace('m', ''), 10) || 1;

      // 1. Romantic & Wedding (Piano / Strings Harmony)
      if (num >= 1 && num <= 8) {
        const chords = [
          [261.63, 329.63, 392.00, 523.25], // C Major
          [220.00, 261.63, 329.63, 440.00], // A Minor
          [174.61, 220.00, 261.63, 349.23], // F Major
          [196.00, 246.94, 293.66, 392.00]  // G Major
        ];
        chords.forEach((chord, cIdx) => {
          chord.forEach((note, nIdx) => {
            this.playNote(note, cIdx * 1.6 + nIdx * 0.35, 1.8, 'triangle', 1800, 0.15);
            this.playNote(note * 2, cIdx * 1.6 + nIdx * 0.35 + 0.1, 1.2, 'sine', 2400, 0.08);
          });
        });
      }
      // 2. Traditional & Heritage (Gamelan Bells & Oriental Sape)
      else if (num >= 9 && num <= 16) {
        const gamelanScale = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const pattern = [0, 2, 4, 3, 1, 4, 2, 5, 3, 6];
        pattern.forEach((p, idx) => {
          const freq = gamelanScale[p % gamelanScale.length];
          this.playNote(freq, idx * 0.55, 1.4, 'sine', 3500, 0.22);
          this.playNote(freq * 1.5, idx * 0.55 + 0.02, 0.8, 'triangle', 4000, 0.1);
        });
      }
      // 3. Acoustic & Chill (Fingerstyle Guitar Arpeggios)
      else if (num >= 17 && num <= 24) {
        const arpeggio = [196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 293.66, 246.94];
        arpeggio.forEach((note, idx) => {
          this.playNote(note, idx * 0.38, 0.9, 'triangle', 2200, 0.18);
          this.playNote(note * 0.5, idx * 0.38, 1.2, 'sine', 1200, 0.12);
        });
      }
      // 4. Spiritual & Ambient (Peaceful Ney & Meditation Pads)
      else if (num >= 25 && num <= 32) {
        const peacefulNotes = [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00];
        peacefulNotes.forEach((note, idx) => {
          this.playNote(note, idx * 1.1, 2.5, 'sine', 1400, 0.2);
          this.playNote(note * 0.5, idx * 1.1, 3.0, 'triangle', 800, 0.12);
        });
      }
      // 5. Celebration & Joy (Music Box & Celesta Chimes)
      else if (num >= 33 && num <= 41) {
        const musicBoxScale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
        const tune = [0, 2, 4, 7, 4, 2, 0, 4, 7, 9, 7, 4];
        tune.forEach((t, idx) => {
          const freq = musicBoxScale[t % musicBoxScale.length];
          this.playNote(freq, idx * 0.42, 1.2, 'sine', 5000, 0.25);
        });
      }
      // 6. Majestic Orchestra (Royal Fanfare & Strings Pad)
      else {
        const royalHarmony = [
          [130.81, 196.00, 261.63, 329.63, 392.00],
          [146.83, 220.00, 293.66, 369.99, 440.00],
          [164.81, 246.94, 329.63, 392.00, 493.88],
          [130.81, 196.00, 261.63, 392.00, 523.25]
        ];
        royalHarmony.forEach((chord, cIdx) => {
          chord.forEach((note) => {
            this.playNote(note, cIdx * 1.8, 2.2, 'sawtooth', 1100, 0.08);
            this.playNote(note * 2, cIdx * 1.8 + 0.1, 1.8, 'triangle', 1800, 0.06);
          });
        });
      }

      // Schedule next continuous loop cycle
      this.timerId = setTimeout(playCycle, 6200);
    };

    playCycle();
  }

  private stopSynth() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public play(trackUrlOrId: string) {
    this.stop();
    this.initContext();

    if (!trackUrlOrId) return;

    // Check if it is a custom MP3 URL or Uploaded Base64 File
    if (trackUrlOrId.startsWith('http') || trackUrlOrId.startsWith('data:audio')) {
      try {
        if (!this.htmlAudio) {
          this.htmlAudio = new Audio();
          this.htmlAudio.loop = true;
        }
        this.htmlAudio.src = trackUrlOrId;
        this.htmlAudio.load();
        this.htmlAudio.play().then(() => {
          this.isPlaying = true;
          this.currentTrackId = trackUrlOrId;
        }).catch((err) => {
          console.warn('HTML Audio fallback to synth:', err);
          this.isPlaying = true;
          this.currentTrackId = trackUrlOrId;
          this.startMelodyLoop('m1');
        });
      } catch (err) {
        console.warn('Audio play error:', err);
      }
      return;
    }

    // Otherwise, play from the built-in 50-track Web Audio Synthesizer
    const cleanId = trackUrlOrId.replace('preset:', '');
    this.isPlaying = true;
    this.currentTrackId = trackUrlOrId;
    this.startMelodyLoop(cleanId);
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    this.stopSynth();
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }
  }

  public getPlayingState(): { isPlaying: boolean; trackId: string | null } {
    return {
      isPlaying: this.isPlaying,
      trackId: this.currentTrackId,
    };
  }
}

export const globalAudio = new AudioService();