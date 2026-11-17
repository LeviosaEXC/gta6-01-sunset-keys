// Police cruisers: white-and-black interceptors with a BIG bright light
// bar and a tight, dimmed halo glow that stays glued to its own cruiser —
// never a pink roof, never bleeding onto the next car.
import { POLICE_CRUISER_COUNT } from './config.js';
import { buildCarMesh, CAR_MODELS } from './carModels.js';
import { syncCarMesh } from './carPhysics.js';
import { distance2D, angleLerp, clamp } from './utils.js';

export const POLICE_CHASE_SPEED_MPS = 16;
const THREE = window.THREE;

export function createPoliceCars(scene) {
  const model = { key: 'cruiser', name: 'CRUISER', color: 0xf0f0f0, length: 4.5, width: 1.95, topSpeed: 150 };
  const cruisers = [];
  for (let i = 0; i < POLICE_CRUISER_COUNT; i++) {
    const mesh = buildCarMesh(model, { police: true });
    mesh.scale.setScalar(1.0);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.3, 4.52), new THREE.MeshLambertMaterial({ color: 0x14141a }));
    stripe.position.y = 0.62;
    mesh.add(stripe);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.97, 0.5, 1.1), new THREE.MeshLambertMaterial({ color: 0x14141a }));
    door.position.set(0, 0.62, 0.1);
    mesh.add(door);
    const x = -240 + i * 60;
    const z = -240 + (i % 3) * 120;
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    cruisers.push({ id: 200 + i, model, x, z, heading: 0, speed: 0, mesh, active: false, sirenPhase: i * 0.5, glow: mesh.userData.glow });
  }
  return { cruisers };
}

export function updatePoliceCars(police, dt, time, ctx) {
  const wanted = ctx.state.wanted;
  const need = wanted === 0 ? 0 : wanted === 1 ? 1 : wanted === 2 ? 2 : wanted === 3 ? 3 : 4;
  let activeCount = 0;
  for (const c of police.cruisers) {
    const shouldBeActive = activeCount < need;
    if (shouldBeActive) activeCount++;
    c.active = shouldBeActive;
    c.mesh.visible = shouldBeActive || ctx.shotMode;
    if (!c.active) { c.speed = 0; continue; }
    const target = ctx.playerCar || { x: ctx.player.x, z: ctx.player.z };
    const d = distance2D(c.x, c.z, target.x, target.z);
    const desired = Math.atan2(target.x - c.x, target.z - c.z);
    c.heading = angleLerp(c.heading, desired, dt * 1.4);
    const chase = d > 12 ? POLICE_CHASE_SPEED_MPS : POLICE_CHASE_SPEED_MPS * 0.55;
    c.speed += clamp(chase - c.speed, -10 * dt, 8 * dt);
    c.x += Math.sin(c.heading) * c.speed * dt;
    c.z += Math.cos(c.heading) * c.speed * dt;
    syncCarMesh(c);
    const blink = Math.sin(time * 9 + c.sirenPhase) > 0;
    if (c.mesh.userData.lightRed) c.mesh.userData.lightRed.material.color.setHex(blink ? 0xff2a1e : 0x5a0f0a);
    if (c.mesh.userData.lightBlue) c.mesh.userData.lightBlue.material.color.setHex(blink ? 0x123a6b : 0x1e6bff);
    if (c.glow) {
      c.glow.material.color.setHex(blink ? 0xff3344 : 0x3355ff);
      c.glow.material.opacity = 0.30;
      c.glow.scale.set(3.0, 1.7, 1);
    }
  }
}

export function placeCruiserForShot(police, index, x, z, heading) {
  const c = police.cruisers[index];
  if (!c) return null;
  c.active = true;
  c.x = x; c.z = z; c.heading = heading; c.speed = 0;
  c.mesh.visible = true;
  syncCarMesh(c);
  return c;
}
