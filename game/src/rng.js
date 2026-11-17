// Deterministic seeded random: the city layout is identical every load,
// so screenshots and playtests stage on the same streets.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function makeCityRng() { return mulberry32(20261117); }
export function rangeRandom(rng, min, max) { return min + rng() * (max - min); }
export function intRandom(rng, min, max) { return Math.floor(rangeRandom(rng, min, max + 1)); }
