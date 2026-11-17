// World: parked cars to steal, city bounds, and the spawn points the
// missions and the shots build on.
import { CITY_HALF_M } from './config.js';
import { mulberry32, rangeRandom, intRandom } from './rng.js';
import { buildCarMesh, CAR_MODELS } from './carModels.js';
import { clamp } from './utils.js';

export const PARKED_CAR_COUNT = 10;
export const WORLD_BOUND_M = 300;

export function createParkedCars(scene) {
  const rng = mulberry32(20240);
  const cars = [];
  const spots = [
    [1.5, 55, Math.PI], [8, -32, 0], [-8, 120, Math.PI], [68, -120, Math.PI / 2],
    [-52, 180, 0], [120, 60, -Math.PI / 2], [180, 230, -Math.PI / 2], [-120, -60, Math.PI],
    [240, -180, Math.PI / 2], [30, -240, 0],
  ];
  for (let i = 0; i < PARKED_CAR_COUNT; i++) {
    const model = i === 0 ? CAR_MODELS[3] : CAR_MODELS[intRandom(rng, 0, 3)];
    const [x, z, heading] = spots[i];
    const mesh = buildCarMesh(model);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = heading;
    scene.add(mesh);
    cars.push({ id: i, model, x, z, heading, speed: 0, mesh, ai: false, taken: false, driver: null, owner: null, initX: x, initZ: z, initHeading: heading });
  }
  return cars;
}

export function clampToWorld(x, z) {
  return { x: clamp(x, -WORLD_BOUND_M + 5, WORLD_BOUND_M - 5), z: clamp(z, -WORLD_BOUND_M + 5, WORLD_BOUND_M - 5) };
}

export function spawnPoint() { return { x: 0, z: 200 }; }
