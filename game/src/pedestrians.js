// Pedestrians: 40 walkers on the sidewalks, wandering, dodging cars and
// fleeing when a gunshot or a stolen car scares them.
import { PEDESTRIAN_COUNT, CITY_HALF_M, ROAD_SPACING_M } from './config.js';
import { mulberry32, rangeRandom, intRandom } from './rng.js';
import { distance2D, angleLerp } from './utils.js';

export const PEDESTRIAN_WALK_SPEED_MPS = 1.4;
const THREE = window.THREE;
const SHIRTS = [0xd84a4a, 0x4a7ad8, 0x4ad87a, 0xd8c44a, 0x9a4ad8, 0xe8e8e8, 0x2a2a2a];
const SKINS = [0xe8b98a, 0xc98a5a, 0x8a5a3a, 0xf0c8a0];

export function createPedestrians(scene) {
  const rng = mulberry32(999);
  const list = [];
  for (let i = 0; i < PEDESTRIAN_COUNT; i++) {
    const g = new THREE.Group();
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.32), new THREE.MeshLambertMaterial({ color: SHIRTS[intRandom(rng, 0, SHIRTS.length - 1)] }));
    shirt.position.y = 1.05;
    g.add(shirt);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshLambertMaterial({ color: SKINS[intRandom(rng, 0, SKINS.length - 1)] }));
    head.position.y = 1.62;
    g.add(head);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.7, 0.28), new THREE.MeshLambertMaterial({ color: 0x2a2a33 }));
    legs.position.y = 0.35;
    g.add(legs);
    const onRoad = rng() < 0.5;
    const road = -CITY_HALF_M + intRandom(rng, 0, 10) * ROAD_SPACING_M;
    const x = onRoad ? road + 8 : rangeRandom(rng, -280, 280);
    const z = onRoad ? rangeRandom(rng, -280, 280) : road + 8;
    g.position.set(x, 0, z);
    scene.add(g);
    list.push({ x, z, heading: rangeRandom(rng, 0, Math.PI * 2), speed: rangeRandom(rng, 0.9, 1.8), mesh: g, fleeing: false, fleeTimer: 0, walkPhase: rng() * 6 });
  }
  return { list };
}

export function updatePedestrians(peds, dt, ctx) {
  for (const p of peds.list) {
    if (p.fleeing) {
      p.fleeTimer -= dt;
      if (p.fleeTimer <= 0) p.fleeing = false;
    }
    const speed = p.fleeing ? PEDESTRIAN_WALK_SPEED_MPS * 3.2 : p.speed;
    p.x += Math.sin(p.heading) * speed * dt;
    p.z += Math.cos(p.heading) * speed * dt;
    if (Math.random() < dt * 0.12) p.heading += (Math.random() - 0.5) * 1.6;
    if (p.x > 292 || p.x < -292) p.heading = Math.PI - p.heading;
    if (p.z > 292 || p.z < -292) p.heading = -p.heading;
    p.walkPhase += dt * speed * 4;
    p.mesh.position.set(p.x, Math.abs(Math.sin(p.walkPhase)) * 0.05, p.z);
    p.mesh.rotation.y = p.heading;
  }
}

export function scarePedestrians(peds, x, z, radius) {
  for (const p of peds.list) {
    if (distance2D(p.x, p.z, x, z) < radius) {
      p.fleeing = true;
      p.fleeTimer = 5;
      p.heading = Math.atan2(p.x - x, p.z - z);
    }
  }
}
