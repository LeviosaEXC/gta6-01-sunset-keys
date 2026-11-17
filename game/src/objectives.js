// Objectives: the current objective plus a short history log the HUD
// and the mission engine share.
export const OBJECTIVE_TEXT_MAX = 90;

export function createObjectives() {
  return {
    current: { title: 'MISSION 1 — FIRST DELIVERY', text: 'Drive to the pier beacon.', distanceM: 60 },
    history: [],
    set(title, text, distanceM) {
      this.current = { title, text: text.slice(0, OBJECTIVE_TEXT_MAX), distanceM: distanceM || 0 };
      this.history.push({ title, text, at: Date.now() });
      if (this.history.length > 12) this.history.shift();
    },
    clear() { this.history = []; },
  };
}
