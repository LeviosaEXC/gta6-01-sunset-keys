// Health and armor: damage, regen out of combat, health packs, and the
// wasted screen when the player goes down.
import { PLAYER_HEALTH_MAX } from './config.js';

export const HEALTH_REGEN_PER_SECOND = 3;
export const ARMOR_ABSORB = 0.6;

export function createHealth(ctx) {
  return {
    damagePlayer(amount) {
      const s = ctx.state;
      if (s.phase !== 'playing') return;
      let rest = amount;
      if (s.armor > 0) {
        const absorbed = Math.min(s.armor, rest * ARMOR_ABSORB);
        s.armor -= absorbed;
        rest -= absorbed;
      }
      s.health -= rest;
      ctx.effects.shake(6);
      if (s.health <= 0) {
        s.health = 0;
        s.phase = 'wasted';
        ctx.audio.wasted();
        ctx.ui.showWasted();
      }
    },
    heal(amount) {
      const s = ctx.state;
      s.health = Math.min(PLAYER_HEALTH_MAX, s.health + amount);
    },
    update(dt) {
      const s = ctx.state;
      if (s.phase === 'playing' && s.health > 0 && s.health < PLAYER_HEALTH_MAX) {
        s.health = Math.min(PLAYER_HEALTH_MAX, s.health + HEALTH_REGEN_PER_SECOND * dt);
      }
    },
  };
}
