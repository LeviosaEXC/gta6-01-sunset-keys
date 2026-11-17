// Music: a light synthwave loop — bass pulse and a minor-key arpeggio —
// scheduled ahead on the audio engine, starting on the first input.
export const MUSIC_TEMPO_BPM = 96;

const BASS = [55, 55, 65.41, 49];
const ARP = [220, 261.63, 329.63, 392, 329.63, 261.63];

export function createAudioMusic(engine) {
  const music = {
    timer: null, step: 0, on: false,
    start() {
      if (this.on || !engine.ctx) return;
      this.on = true;
      const beat = 60 / MUSIC_TEMPO_BPM / 2;
      this.timer = setInterval(() => {
        if (!engine.ctx) return;
        const bass = BASS[this.step % 4];
        engine.tone(bass, beat * 1.8, 'triangle', 0.10);
        if (this.step % 2 === 0) engine.tone(ARP[this.step % 6] * 2, beat * 0.9, 'sine', 0.045);
        this.step += 1;
      }, beat * 1000);
    },
    stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } this.on = false; },
  };
  return music;
}
