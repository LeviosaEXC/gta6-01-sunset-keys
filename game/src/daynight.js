// Day/night cycle: the clock advances from the 17:00 sunset, the sun
// drops, lamps and windows light up, and rain starts after dark.
import { DAY_START_HOUR } from './config.js';
import { clamp } from './utils.js';
import { updateSky } from './sky.js';
import { updateBuildingGlow } from './buildings.js';
import { updateLamps } from './lamps.js';

export const GAME_HOUR_SECONDS = 120;
export const RAIN_START_HOUR = 21;

export function createDayNight() {
  return { hour: DAY_START_HOUR, nightness: 0, rain: false };
}

export function updateDayNight(ctx, dt) {
  const dn = ctx.daynight;
  dn.hour += (dt / GAME_HOUR_SECONDS);
  if (dn.hour >= 24) { dn.hour -= 24; ctx.state.day += 1; }
  ctx.state.hour = dn.hour;
  const skyInfo = updateSky(ctx.sky, dn.hour, ctx.scene);
  dn.nightness = skyInfo.nightness;
  updateBuildingGlow(ctx.city.buildings, dn.nightness);
  updateLamps(ctx.city.lamps, dn.nightness);
  const sunLight = ctx.city.sun;
  sunLight.intensity = 1.35 * (1 - dn.nightness * 0.75);
  sunLight.color.setHex(dn.nightness > 0.5 ? 0x8fa8ff : 0xffb36b);
  ctx.city.hemi.intensity = 1.0 - dn.nightness * 0.45;
  dn.rain = dn.hour >= RAIN_START_HOUR || dn.hour < 5;
  ctx.particles.rain = dn.rain;
  return dn;
}

export function hourLabel(hour) {
  if (hour >= 17 && hour < 19) return 'Sunset';
  if (hour >= 19 || hour < 6) return 'Night';
  if (hour < 11) return 'Morning';
  return 'Afternoon';
}
