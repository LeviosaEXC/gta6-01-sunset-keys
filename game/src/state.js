// The single mutable game state every system reads and writes.
export function createGameState() {
  return {
    phase: 'menu', // menu | playing | paused | busted | wasted
    cash: 150,
    rep: 0,
    health: 100,
    armor: 0,
    ammo: 24,
    wanted: 0,
    wantedHeat: 0,
    hiddenTimer: 0,
    missionIndex: 0,
    missionStage: 0,
    missionDone: [false, false, false, false, false, false],
    hour: 17,
    day: 1,
    inCar: false,
    carId: null,
    speedKmh: 0,
    bustedTimer: 0,
    playSeconds: 0,
    kills: 0,
    carsStolen: 0,
    muted: false,
    volume: 0.6,
    objective: { title: 'MISSION 1 — FIRST DELIVERY', text: 'Drive to the pier beacon.', distanceM: 60 },
    messages: [],
    flags: { metMara: false, metDante: false, chopShop: false },
  };
}
export function resetRunState(state) {
  const fresh = createGameState();
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
}
