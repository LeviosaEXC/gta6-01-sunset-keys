// Save: progress persists in localStorage — cash, reputation, mission,
// health, ammo, position and time of day — and loads on Continue.
import { SAVE_KEY } from './config.js';

export const SAVE_SLOT_COUNT = 1;

export function createSave(ctx) {
  return {
    saveGame() {
      try {
        const s = ctx.state;
        const data = {
          cash: s.cash, rep: s.rep, health: s.health, armor: s.armor, ammo: s.ammo,
          missionIndex: s.missionIndex, missionStage: s.missionStage, missionDone: s.missionDone,
          hour: s.hour, day: s.day, x: ctx.player.x, z: ctx.player.z, kills: s.kills, carsStolen: s.carsStolen,
          savedAt: Date.now(),
        };
        window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        return true;
      } catch (e) { return false; }
    },
    loadGame() {
      try {
        const raw = window.localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) { return null; }
    },
    hasSave() {
      try { return !!window.localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    },
    applySave(data) {
      if (!data) return false;
      const s = ctx.state;
      s.cash = data.cash; s.rep = data.rep; s.health = data.health; s.armor = data.armor; s.ammo = data.ammo;
      s.missionIndex = data.missionIndex; s.missionStage = data.missionStage; s.missionDone = data.missionDone;
      s.hour = data.hour; s.day = data.day; s.kills = data.kills || 0; s.carsStolen = data.carsStolen || 0;
      ctx.player.x = data.x; ctx.player.z = data.z;
      ctx.daynight.hour = data.hour;
      return true;
    },
    clearSave() {
      try { window.localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    },
  };
}
