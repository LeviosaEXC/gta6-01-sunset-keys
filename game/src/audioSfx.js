// Sound effects: sirens, horns, gunshots, punches, pickups, busted and
// wasted stings — all synthesized through the audio engine.
export const SIREN_BASE_HZ = 700;

export function createAudioSfx(engine) {
  let sirenTimer = null;
  return {
    siren() {
      if (!engine.ctx) return;
      if (sirenTimer) return;
      let high = true;
      sirenTimer = setInterval(() => {
        if (!engine.ctx) { clearInterval(sirenTimer); sirenTimer = null; return; }
        engine.tone(high ? 950 : 700, 0.42, 'sine', 0.05);
        high = !high;
      }, 430);
      setTimeout(() => { clearInterval(sirenTimer); sirenTimer = null; }, 6000);
    },
    horn() { engine.tone(340, 0.35, 'square', 0.12, 320); engine.tone(420, 0.35, 'square', 0.08, 400); },
    gunshot() { engine.noise(0.16, 0.5, 900); engine.tone(160, 0.1, 'square', 0.2, 60); },
    enemyShot() { engine.noise(0.14, 0.25, 700); },
    punch() { engine.noise(0.09, 0.3, 500); },
    enemyDown() { engine.tone(220, 0.3, 'sawtooth', 0.15, 70); },
    pickup() { engine.tone(660, 0.12, 'sine', 0.18); setTimeout(() => engine.tone(990, 0.18, 'sine', 0.18), 90); },
    missionStart() { engine.tone(523, 0.15, 'triangle', 0.2); setTimeout(() => engine.tone(659, 0.2, 'triangle', 0.2), 140); },
    stageClear() { engine.tone(784, 0.15, 'triangle', 0.2); },
    missionComplete() {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => engine.tone(f, 0.25, 'triangle', 0.22), i * 130));
    },
    busted() { engine.tone(330, 0.5, 'sawtooth', 0.2, 110); engine.tone(220, 0.7, 'sawtooth', 0.18, 80); },
    wasted() { engine.tone(220, 0.6, 'sawtooth', 0.22, 55); setTimeout(() => engine.tone(165, 0.9, 'sawtooth', 0.2, 40), 300); },
    click() { engine.tone(800, 0.05, 'square', 0.08); },
  };
}
