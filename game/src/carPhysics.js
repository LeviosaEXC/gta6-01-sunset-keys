// Arcade car physics: acceleration, braking, steering that tightens with
// speed, handbrake slides and simple box collision with buildings.
import { CAR_TOP_SPEED_KMH } from './config.js';
import { clamp, angleLerp } from './utils.js';
import { collidesWithBuildings } from './buildings.js';

export const CAR_ACCEL_MPS2 = 14;
export const CAR_BRAKE_MPS2 = 26;
export const CAR_STEER_RAD = 0.55;

export function createCarState(model, x, z, heading) {
  return { model, x, z, heading, speed: 0, mesh: null, id: -1, ai: false, stuck: 0 };
}

export function updateCarPhysics(car, input, dt, buildings) {
  const top = (car.model.topSpeed || CAR_TOP_SPEED_KMH) / 3.6;
  if (input.forward) car.speed += CAR_ACCEL_MPS2 * dt;
  if (input.back) car.speed -= CAR_BRAKE_MPS2 * dt;
  if (!input.forward && !input.back) car.speed -= Math.sign(car.speed) * 6 * dt;
  if (input.handbrake) car.speed -= Math.sign(car.speed) * 18 * dt;
  car.speed = clamp(car.speed, -top * 0.35, top);
  if (Math.abs(car.speed) < 0.05 && !input.forward && !input.back) car.speed = 0;
  const steerAmount = input.steer * CAR_STEER_RAD * clamp(Math.abs(car.speed) / 8, 0, 1);
  car.heading += steerAmount * Math.sign(car.speed) * dt * 2.2;
  const nx = car.x + Math.sin(car.heading) * car.speed * dt;
  const nz = car.z + Math.cos(car.heading) * car.speed * dt;
  if (buildings && collidesWithBuildings(buildings, nx, nz, 1.6)) {
    car.speed *= -0.25;
  } else {
    car.x = nx; car.z = nz;
  }
  car.x = clamp(car.x, -295, 295);
  car.z = clamp(car.z, -295, 295);
  return car;
}

export function syncCarMesh(car) {
  if (!car.mesh) return;
  car.mesh.position.set(car.x, 0, car.z);
  car.mesh.rotation.y = car.heading;
}

export function carSpeedKmh(car) { return Math.abs(car.speed) * 3.6; }
