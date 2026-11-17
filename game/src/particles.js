// Particles: dust kicked up by tires, exhaust puffs, crash sparks, muzzle
// flashes and light rain at night — one pooled Points system.
import { clamp } from './utils.js';

export const PARTICLE_MAX = 400;
const THREE = window.THREE;

export function createParticles(scene) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_MAX * 3);
  const colors = new Float32Array(PARTICLE_MAX * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  const pool = [];
  for (let i = 0; i < PARTICLE_MAX; i++) pool.push({ life: 0, x: 0, y: -10, z: 0, vx: 0, vy: 0, vz: 0, r: 1, g: 1, b: 1 });
  return { points, pool, cursor: 0, geo, rain: false };
}

function spawn(p, x, y, z, vx, vy, vz, life, r, g, b) {
  const pt = p.pool[p.cursor];
  p.cursor = (p.cursor + 1) % PARTICLE_MAX;
  pt.x = x; pt.y = y; pt.z = z; pt.vx = vx; pt.vy = vy; pt.vz = vz;
  pt.life = life; pt.r = r; pt.g = g; pt.b = b;
}

export function updateParticles(p, dt) {
  const pos = p.geo.attributes.position.array;
  const col = p.geo.attributes.color.array;
  for (let i = 0; i < PARTICLE_MAX; i++) {
    const pt = p.pool[i];
    if (pt.life > 0) {
      pt.life -= dt;
      pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.z += pt.vz * dt;
      pt.vy -= 2 * dt;
    } else {
      pt.y = -10;
    }
    pos[i * 3] = pt.x; pos[i * 3 + 1] = pt.y; pos[i * 3 + 2] = pt.z;
    const a = clamp(pt.life, 0, 1);
    col[i * 3] = pt.r * a; col[i * 3 + 1] = pt.g * a; col[i * 3 + 2] = pt.b * a;
  }
  p.geo.attributes.position.needsUpdate = true;
  p.geo.attributes.color.needsUpdate = true;
}

export function dust(p, x, z) { spawn(p, x, 0.3, z, (Math.random() - 0.5) * 2, 0.8, (Math.random() - 0.5) * 2, 0.7, 0.8, 0.75, 0.6); }
export function exhaust(p, x, z, heading) { spawn(p, x - Math.sin(heading) * 2, 0.5, z - Math.cos(heading) * 2, 0, 0.6, 0, 0.5, 0.5, 0.5, 0.55); }
export function sparks(p, x, z) { for (let i = 0; i < 8; i++) spawn(p, x, 0.8, z, (Math.random() - 0.5) * 8, Math.random() * 5, (Math.random() - 0.5) * 8, 0.5, 1, 0.8, 0.3); }
export function muzzle(p, x, z, heading) { spawn(p, x + Math.sin(heading) * 1.2, 1.3, z + Math.cos(heading) * 1.2, 0, 0, 0, 0.12, 1, 0.9, 0.4); }
export function blood(p, x, z) { for (let i = 0; i < 6; i++) spawn(p, x, 1.1, z, (Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3, 0.5, 0.7, 0.1, 0.1); }
