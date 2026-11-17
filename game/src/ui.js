// Screens: start, pause, busted and wasted overlays, with their buttons
// wired to the game context.
export const UI_SCREEN_COUNT = 4;

export function createUi(ctx) {
  const $ = (id) => document.getElementById(id);
  const ui = {
    startScreen: $('start-screen'),
    pauseScreen: $('pause-screen'),
    bustedScreen: $('busted-screen'),
    wastedScreen: $('wasted-screen'),
    hideAll() {
      for (const el of [this.startScreen, this.pauseScreen, this.bustedScreen, this.wastedScreen]) el.classList.add('hidden');
    },
    showStart(hasSave) {
      this.hideAll();
      this.startScreen.classList.remove('hidden');
      $('btn-continue').style.display = hasSave ? '' : 'none';
      ctx.hud.hide();
    },
    showPause() {
      this.hideAll();
      this.pauseScreen.classList.remove('hidden');
    },
    showBusted() {
      this.hideAll();
      this.bustedScreen.classList.remove('hidden');
      ctx.hud.hide();
    },
    showWasted() {
      this.hideAll();
      this.wastedScreen.classList.remove('hidden');
      ctx.hud.hide();
    },
    resume() {
      this.hideAll();
      ctx.state.phase = 'playing';
      ctx.hud.show();
    },
    wire() {
      $('btn-new-game').addEventListener('click', () => ctx.startNewGame());
      $('btn-continue').addEventListener('click', () => ctx.startContinue());
      $('btn-resume').addEventListener('click', () => this.resume());
      $('btn-restart').addEventListener('click', () => ctx.startNewGame());
      $('btn-busted-ok').addEventListener('click', () => ctx.respawnAtSafehouse());
      $('btn-wasted-ok').addEventListener('click', () => ctx.respawnAtSafehouse());
      $('volume-slider').addEventListener('input', (e) => {
        ctx.state.volume = e.target.value / 100;
        $('volume-num').textContent = e.target.value;
        ctx.audioEngine.setVolume(ctx.state.volume);
      });
    },
  };
  return ui;
}
