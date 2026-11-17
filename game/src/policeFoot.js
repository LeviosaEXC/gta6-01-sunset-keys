// Foot cops: officers on foot who close in and make the bust when the
// player is cornered and slow.
import { FOOT_COP_COUNT } from './config.js';
import { distance2D, angleLerp } from './utils.js';

export const FOOT_COP_SPEED_MPS = 5.2;
export const BUST_RADIUS_M = 2.2;
const THREE = window.THREE;

export function createFootCops(scene) {
  const list = [];
  for (let i = 0; i < FOOT_COP_COUNT; i++) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.34), new THREE.MeshLambertMaterial({ color: 0x1a2a4a }));
    body.position.y = 1.05;
    g.add(body);
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.36), new THREE.MeshLambertMaterial({ color: 0x0a0a0a }));
    vest.position.y = 1.15;
    g.add(vest);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshLambertMaterial({ color: 0xe8b98a }));
    head.position.y = 1.62;
    g.add(head);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 10), new THREE.MeshLambertMaterial({ color: 0x0a1a3a }));
    cap.position.y = 1.8;
    g.add(cap);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.7, 0.3), new THREE.MeshLambertMaterial({ color: 0x14141e }));
    legs.position.y = 0.35;
    g.add(legs);
    g.position.set(-200 + i * 40, 0, -200);
    g.visible = false;
    scene.add(g);
    list.push({ x: -200 + i * 40, z: -200, heading: 0, mesh: g, active: false, bustTimer: 0 });
  }
  return { list };
}

export function updateFootCops(cops, dt, ctx) {
  const wanted = ctx.state.wanted;
  const need = wanted >= 3 ? 2 : wanted === 2 ? 1 : 0;
  let activeCount = 0;
  for (const cop of cops.list) {
    cop.active = activeCount < need;
    if (cop.active) activeCount++;
    cop.mesh.visible = cop.active || ctx.shotMode;
    if (!cop.active || ctx.state.inCar) { cop.bustTimer = 0; continue; }
    const d = distance2D(cop.x, cop.z, ctx.player.x, ctx.player.z);
    cop.heading = angleLerp(cop.heading, Math.atan2(ctx.player.x - cop.x, ctx.player.z - cop.z), dt * 2);
    const speed = d > 3 ? FOOT_COP_SPEED_MPS : 1.2;
    cop.x += Math.sin(cop.heading) * speed * dt;
    cop.z += Math.cos(cop.heading) * speed * dt;
    cop.mesh.position.set(cop.x, 0, cop.z);
    cop.mesh.rotation.y = cop.heading;
    if (d < BUST_RADIUS_M) {
      cop.bustTimer += dt;
      if (cop.bustTimer > 3) ctx.wanted.busted();
    } else {
      cop.bustTimer = 0;
    }
  }
}
