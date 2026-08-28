'use client';

// Sound Synthesis Engine with Instant Hard-Stop & Master Gain Control
class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private timerId: any = null;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private listeners: Set<(state: { isPlaying: boolean; trackId: string | null }) => void> = new Set();

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    }
  }

  public subscribe(listener: (state: { isPlaying: boolean; trackId: string | null }) => void) {
    this.listeners.add(listener);
    listener({ isPlaying: this.isPlaying, trackId: this.currentTrackId });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = { isPlaying: this.isPlaying, trackId: this.currentTrackId };
    this.listeners.forEach((fn) => fn(state));
  }

  // Play a single note safely routed through master gain
  private playNote(
    freq: number,
    timeOffset: number,
    duration: number,
    type: OscillatorType = 'sine',
    filterFreq: number = 2000,
    gainLevel: number = 0.2
  ) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    try {
      const now = this.ctx.currentTime + timeOffset;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);

      this.activeOscillators.push(osc);

      osc.onended = () => {
        const idx = this.activeOscillators.indexOf(osc);
        if (idx > -1) {
          this.activeOscillators.splice(idx, 1);
        }
        try {
          osc.disconnect();
          filter.disconnect();
          noteGain.disconnect();
        } catch (_) {}
      };
    } catch (e) {
      console.warn('Synth error:', e);
    }
  }

  // Melodic Loops for Each Category
  private startMelodyLoop(trackId: string) {
    this.stopActiveSynthNodes();

    const playCycle = () => {
      if (!this.isPlaying || !this.ctx) return;

      const num = parseInt(trackId.replace('m', ''), 10) || 1;

      // 1. Romantic & Wedding
      if (num >= 1 && num <= 8) {
        const chords = [
          [261.63, 329.63, 392.00, 523.25],
          [220.00, 261.63, 329.63, 440.00],
          [174.61, 220.00, 261.63, 349.23],
          [196.00, 246.94, 293.66, 392.00]
        ];
        chords.forEach((chord, cIdx) => {
          chord.forEach((note, nIdx) => {
            this.playNote(note, cIdx * 1.5 + nIdx * 0.32, 1.6, 'triangle', 1800, 0.15);
            this.playNote(note * 2, cIdx * 1.5 + nIdx * 0.32 + 0.08, 1.0, 'sine', 2400, 0.08);
          });
        });
      }
      // 2. Traditional & Heritage (Gamelan Bells & Sape)
      else if (num >= 9 && num <= 16) {
        const gamelanScale = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const pattern = [0, 2, 4, 3, 1, 4, 2, 5, 3, 6];
        pattern.forEach((p, idx) => {
          const freq = gamelanScale[p % gamelanScale.length];
          this.playNote(freq, idx * 0.52, 1.3, 'sine', 3500, 0.2);
          this.playNote(freq * 1.5, idx * 0.52 + 0.02, 0.7, 'triangle', 4000, 0.08);
        });
      }
      // 3. Acoustic & Chill
      else if (num >= 17 && num <= 24) {
        const arpeggio = [196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 293.66, 246.94];
        arpeggio.forEach((note, idx) => {
          this.playNote(note, idx * 0.36, 0.8, 'triangle', 2200, 0.16);
          this.playNote(note * 0.5, idx * 0.36, 1.1, 'sine', 1200, 0.1);
        });
      }
      // 4. Spiritual & Ambient
      else if (num >= 25 && num <= 32) {
        const peacefulNotes = [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00];
        peacefulNotes.forEach((note, idx) => {
          this.playNote(note, idx * 1.0, 2.2, 'sine', 1400, 0.18);
          this.playNote(note * 0.5, idx * 1.0, 2.8, 'triangle', 800, 0.1);
        });
      }
      // 5. Celebration & Joy (Music Box)
      else if (num >= 33 && num <= 41) {
        const musicBoxScale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
        const tune = [0, 2, 4, 7, 4, 2, 0, 4, 7, 9, 7, 4];
        tune.forEach((t, idx) => {
          const freq = musicBoxScale[t % musicBoxScale.length];
          this.playNote(freq, idx * 0.4, 1.1, 'sine', 4800, 0.22);
        });
      }
      // 6. Majestic Orchestra
      else {
        const royalHarmony = [
          [130.81, 196.00, 261.63, 329.63, 392.00],
          [146.83, 220.00, 293.66, 369.99, 440.00],
          [164.81, 246.94, 329.63, 392.00, 493.88],
          [130.81, 196.00, 261.63, 392.00, 523.25]
        ];
        royalHarmony.forEach((chord, cIdx) => {
          chord.forEach((note) => {
            this.playNote(note, cIdx * 1.7, 2.0, 'sawtooth', 1100, 0.07);
            this.playNote(note * 2, cIdx * 1.7 + 0.08, 1.6, 'triangle', 1800, 0.05);
          });
        });
      }

      if (this.isPlaying) {
        this.timerId = setTimeout(playCycle, 5800);
      }
    };

    playCycle();
  }

  // Hard mute & immediate cancellation of all scheduled notes
  private stopActiveSynthNodes() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (_) {}
    }

    while (this.activeOscillators.length > 0) {
      const osc = this.activeOscillators.pop();
      if (osc) {
        try {
          osc.stop(0);
          osc.disconnect();
        } catch (_) {}
      }
    }
  }

  public play(trackUrlOrId: string) {
    this.stop();
    if (!trackUrlOrId) return;

    this.isPlaying = true;
    this.currentTrackId = trackUrlOrId;
    this.initContext();
    this.notify();

    // Check if custom uploaded MP3 / direct URL
    if (trackUrlOrId.startsWith('http') || trackUrlOrId.startsWith('data:audio')) {
      try {
        if (!this.htmlAudio) {
          this.htmlAudio = new Audio();
          this.htmlAudio.loop = true;
        }
        this.htmlAudio.pause();
        this.htmlAudio.src = trackUrlOrId;
        this.htmlAudio.currentTime = 0;
        this.htmlAudio.load();
        this.htmlAudio.play().catch((err) => {
          console.warn('HTML Audio fallback to synth:', err);
          if (this.isPlaying) {
            this.startMelodyLoop('m1');
          }
        });
      } catch (err) {
        console.warn('Audio play error:', err);
      }
      return;
    }

    const cleanId = trackUrlOrId.replace('preset:', '');
    this.startMelodyLoop(cleanId);
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    this.stopActiveSynthNodes();

    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause();
        this.htmlAudio.currentTime = 0;
      } catch (_) {}
    }
    this.notify();
  }

  public getPlayingState(): { isPlaying: boolean; trackId: string | null } {
    return {
      isPlaying: this.isPlaying,
      trackId: this.currentTrackId,
    };
  }
}

export const globalAudio = new AudioService();