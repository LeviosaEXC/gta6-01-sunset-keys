// Audio engine: one WebAudio context, a master gain, and tiny helpers so
// every sound in the game is synthesized — no audio files at all.
export const AUDIO_MASTER_GAIN = 0.5;

export function createAudioEngine() {
  const engine = {
    ctx: null, master: null, engineOsc: null, engineGain: null, musicTimer: null,
    ensure() {
      if (this.ctx) return true;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = AUDIO_MASTER_GAIN;
        this.master.connect(this.ctx.destination);
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 55;
        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0;
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.master);
        this.engineOsc.start();
        return true;
      } catch (e) { return false; }
    },
    setVolume(v) { if (this.master) this.master.gain.value = v; },
    setMuted(m) { if (this.master) this.master.gain.value = m ? 0 : AUDIO_MASTER_GAIN; },
    tone(freq, dur, type, vol, slideTo) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
      g.gain.setValueAtTime(vol || 0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.05);
    },
    noise(dur, vol, filterFreq) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const len = Math.floor(this.ctx.sampleRate * dur);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = filterFreq || 1200;
      const g = this.ctx.createGain();
      g.gain.value = vol || 0.3;
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t);
    },
    engine(speedKmh, inCar) {
      if (!this.ctx || !this.engineOsc) return;
      const target = inCar ? 0.05 + Math.min(0.16, speedKmh / 900) : 0;
      this.engineGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
      this.engineOsc.frequency.setTargetAtTime(50 + speedKmh * 1.1, this.ctx.currentTime, 0.1);
    },
  };
  return engine;
}
