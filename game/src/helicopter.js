// Police helicopter: a white Keys PD bird that joins at wanted 4+, with
// a sweeping searchlight. It never hovers over the ferris wheel.
import { FERRIS_POS } from './config.js';
import { distance2D } from './utils.js';

export const HELI_MIN_WANTED = 4;
export const HELI_ALTITUDE_M = 55;
const THREE = window.THREE;

export function createHelicopter(scene) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 7.5), new THREE.MeshLambertMaterial({ color: 0xf2f2f2 }));
  body.castShadow = true;
  g.add(body);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 2.2), new THREE.MeshLambertMaterial({ color: 0x1a2436 }));
  glass.position.set(0, 0.3, -2.6);
  g.add(glass);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 5.5), new THREE.MeshLambertMaterial({ color: 0xf2f2f2 }));
  tail.position.set(0, 0.4, 6);
  g.add(tail);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.24, 0.5, 7.5), new THREE.MeshLambertMaterial({ color: 0x1a2a4a }));
  stripe.position.y = -0.4;
  g.add(stripe);
  const rotor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 1.1), new THREE.MeshLambertMaterial({ color: 0x222226, transparent: true, opacity: 0.75 }));
  rotor.position.y = 1.35;
  g.add(rotor);
  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.8), new THREE.MeshLambertMaterial({ color: 0x222226 }));
  tailRotor.position.set(0.6, 0.6, 8.2);
  g.add(tailRotor);
  const skidMat = new THREE.MeshLambertMaterial({ color: 0x333338 });
  for (const s of [-1, 1]) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 6.4), skidMat);
    skid.position.set(s * 1.2, -1.15, 0);
    g.add(skid);
  }
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(10, 55, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff6c0, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
  );
  beam.position.y = -27.5;
  g.add(beam);
  const spot = new THREE.Mesh(new THREE.CircleGeometry(6.5, 20), new THREE.MeshBasicMaterial({ color: 0xfff6c0, transparent: true, opacity: 0.22 }));
  spot.rotation.x = -Math.PI / 2;
  spot.position.y = -54.5;
  g.add(spot);
  g.visible = false;
  scene.add(g);
  return { mesh: g, rotor, beam, spot, x: 0, z: 0, heading: 0, active: false };
}

export function updateHelicopter(heli, dt, time, ctx) {
  const wanted = ctx.state.wanted;
  heli.active = wanted >= HELI_MIN_WANTED;
  heli.mesh.visible = heli.active || ctx.shotMode;
  if (!heli.active && !ctx.shotMode) return;
  const px = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.x : ctx.player.x;
  const pz = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.z : ctx.player.z;
  const tx = px + 26;
  let tz = pz - 18;
  if (distance2D(tx, tz, FERRIS_POS.x, FERRIS_POS.z) < 60) tz = FERRIS_POS.z - 70;
  heli.x += (tx - heli.x) * Math.min(1, dt * 0.5);
  heli.z += (tz - heli.z) * Math.min(1, dt * 0.5);
  heli.mesh.position.set(heli.x, HELI_ALTITUDE_M + Math.sin(time * 0.8) * 2, heli.z);
  heli.mesh.rotation.y = Math.atan2(px - heli.x, pz - heli.z);
  heli.rotor.rotation.y = time * 22;
  heli.beam.rotation.y = time * 0.6;
}
