// Wanted system: stars 1–5, heat that rises with crimes, decay when hidden
// from every cruiser, and the bust when the law finally corners the player.
import { WANTED_MAX } from './config.js';
import { distance2D } from './utils.js';

export const WANTED_DECAY_SECONDS = 20;
export const WANTED_HIDE_RADIUS_M = 120;

export function createWanted(ctx) {
  return {
    raise(n, reason) {
      const s = ctx.state;
      s.wanted = Math.min(WANTED_MAX, s.wanted + n);
      s.wantedHeat = 100;
      s.hiddenTimer = 0;
      if (reason) ctx.hud.pushMessage(reason + ' — wanted level ' + s.wanted + '.');
      ctx.audio.siren();
    },
    lower(n) {
      ctx.state.wanted = Math.max(0, ctx.state.wanted - n);
    },
    busted() {
      const s = ctx.state;
      s.cash = Math.max(0, s.cash - 100);
      s.wanted = 0;
      s.wantedHeat = 0;
      s.phase = 'busted';
      ctx.audio.busted();
      ctx.ui.showBusted();
    },
    update(dt) {
      const s = ctx.state;
      if (s.wanted === 0 || s.phase !== 'playing') return;
      let seen = false;
      const px = s.inCar && ctx.playerCar ? ctx.playerCar.x : ctx.player.x;
      const pz = s.inCar && ctx.playerCar ? ctx.playerCar.z : ctx.player.z;
      for (const c of ctx.police.cruisers) {
        if (c.active && distance2D(c.x, c.z, px, pz) < WANTED_HIDE_RADIUS_M) { seen = true; break; }
      }
      if (seen) {
        s.hiddenTimer = 0;
        s.wantedHeat = Math.min(100, s.wantedHeat + dt * 4);
      } else {
        s.hiddenTimer += dt;
        if (s.hiddenTimer > WANTED_DECAY_SECONDS) {
          s.hiddenTimer = 0;
          s.wanted -= 1;
          ctx.hud.pushMessage(s.wanted > 0 ? 'You lost a star. Lay low.' : 'You lost the cops. Wanted level clear.');
        }
      }
    },
  };
}
