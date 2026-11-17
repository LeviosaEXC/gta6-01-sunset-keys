// Stealing cars: approach a parked or AI car, press E, the door swings
// open and the owner runs off — witnessed theft raises the wanted level.
import { distance2D } from './utils.js';

export const STEAL_RADIUS_M = 3.5;
export const STEAL_WITNESS_RADIUS_M = 40;

export function nearestStealableCar(cars, px, pz) {
  let best = null;
  let bestD = STEAL_RADIUS_M;
  for (const car of cars) {
    if (car.taken) continue;
    const d = distance2D(px, pz, car.x, car.z);
    if (d < bestD) { bestD = d; best = car; }
  }
  return best;
}

export function stealCar(ctx, car) {
  const { state, player } = ctx;
  car.taken = true;
  car.driver = 'player';
  state.inCar = true;
  state.carId = car.id;
  state.carsStolen += 1;
  player.visible = false;
  if (car.owner) {
    car.owner.fleeing = true;
    car.owner.fleeTimer = 6;
  }
  const witnessed = ctx.police && ctx.police.cruisers.some((c) => distance2D(c.x, c.z, car.x, car.z) < STEAL_WITNESS_RADIUS_M);
  if (witnessed) {
    ctx.wanted.raise(1, 'Car theft witnessed by police');
  } else if (ctx.pedestrians && ctx.pedestrians.list.some((p) => distance2D(p.x, p.z, car.x, car.z) < 25)) {
    ctx.wanted.raise(1, 'Someone saw you steal that car');
  }
  ctx.hud.pushMessage('You stole the ' + car.model.name + '.');
  ctx.audio.horn();
  return car;
}

export function exitCar(ctx) {
  const { state, player } = ctx;
  const car = ctx.cars.concat(ctx.traffic.list).find((c) => c.id === state.carId);
  if (!car) return;
  state.inCar = false;
  state.carId = null;
  player.visible = true;
  player.x = car.x + Math.sin(car.heading + Math.PI / 2) * 2.4;
  player.z = car.z + Math.cos(car.heading + Math.PI / 2) * 2.4;
  player.heading = car.heading;
  ctx.hud.pushMessage('You left the ' + car.model.name + '.');
}
