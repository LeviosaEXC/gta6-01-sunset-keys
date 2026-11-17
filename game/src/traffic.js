// Traffic: 24 AI cars looping the road grid, stopping at red lights,
// honking when blocked, and yielding so the streets feel alive.
import { TRAFFIC_CAR_COUNT, CITY_HALF_M, ROAD_SPACING_M } from './config.js';
import { mulberry32, rangeRandom, intRandom } from './rng.js';
import { buildCarMesh, CAR_MODELS } from './carModels.js';
import { updateCarPhysics, syncCarMesh } from './carPhysics.js';
import { clamp } from './utils.js';

export const TRAFFIC_LIGHT_CYCLE_S = 14;
const THREE = window.THREE;

export function createTraffic(scene) {
  const rng = mulberry32(4242);
  const cars = [];
  for (let i = 0; i < TRAFFIC_CAR_COUNT; i++) {
    const model = CAR_MODELS[intRandom(rng, 0, 2)];
    const vertical = rng() < 0.5;
    const road = -CITY_HALF_M + intRandom(rng, 0, 10) * ROAD_SPACING_M;
    const along = rangeRandom(rng, -280, 280);
    const x = vertical ? road + (rng() < 0.5 ? 2.6 : -2.6) : along;
    const z = vertical ? along : road + (rng() < 0.5 ? 2.6 : -2.6);
    const heading = vertical ? (road % 2 === 0 ? 0 : Math.PI) : (road % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);
    const car = { id: 100 + i, model, x, z, heading, speed: rangeRandom(rng, 6, 10), mesh: null, ai: true, taken: false, driver: 'ai', vertical, road, honkTimer: 0 };
    car.mesh = buildCarMesh(model);
    car.mesh.position.set(x, 0, z);
    car.mesh.rotation.y = heading;
    scene.add(car.mesh);
    cars.push(car);
  }
  return { list: cars, lightTimer: 0, lightNS: true };
}

export function updateTraffic(traffic, dt, time, ctx) {
  traffic.lightTimer += dt;
  if (traffic.lightTimer > TRAFFIC_LIGHT_CYCLE_S) { traffic.lightTimer = 0; traffic.lightNS = !traffic.lightNS; }
  for (const car of traffic.list) {
    if (car.taken) continue;
    let targetSpeed = 9;
    const atLight = Math.abs(((car.vertical ? car.z : car.x) + CITY_HALF_M) % ROAD_SPACING_M) < 8;
    if (atLight && ((car.vertical && !traffic.lightNS) || (!car.vertical && traffic.lightNS))) targetSpeed = 0;
    const ahead = traffic.list.find((o) => o !== car && o.vertical === car.vertical && Math.abs(o.x - car.x) < 4 && Math.abs(o.z - car.z) < 4 &&
      ((car.vertical && (o.z - car.z) * Math.sin(car.heading) > 0 && Math.abs(o.z - car.z) < 14) ||
       (!car.vertical && (o.x - car.x) * Math.cos(car.heading) > 0 && Math.abs(o.x - car.x) < 14)));
    if (ahead) targetSpeed = 0;
    if (ctx.playerCar && ctx.playerCar !== car) {
      const d = Math.hypot(ctx.playerCar.x - car.x, ctx.playerCar.z - car.z);
      if (d < 9) targetSpeed = 0;
    }
    car.speed += clamp(targetSpeed - car.speed, -8 * dt, 5 * dt);
    car.x += Math.sin(car.heading) * car.speed * dt;
    car.z += Math.cos(car.heading) * car.speed * dt;
    if (car.x > 295 || car.x < -295 || car.z > 295 || car.z < -295) {
      car.heading += Math.PI;
      car.x = clamp(car.x, -290, 290);
      car.z = clamp(car.z, -290, 290);
    }
    syncCarMesh(car);
  }
}

export function countTrafficCars(traffic) { return traffic.list.filter((c) => !c.taken).length; }
