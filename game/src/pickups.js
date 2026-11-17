// Pickups: 8 health packs and 12 hidden cash stashes scattered through
// the city, with a soft glow so the player can spot them.
import { HEALTH_PACK_COUNT, HIDDEN_CASH_COUNT } from './config.js';
import { mulberry32, rangeRandom } from './rng.js';
import { distance2D } from './utils.js';

export const HEALTH_PACK_VALUE = 40;
export const HIDDEN_CASH_VALUE = 100;
const THREE = window.THREE;

export function createPickups(scene) {
  const rng = mulberry32(31337);
  const items = [];
  const boxGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xf2f2f2, emissive: 0x37d67a, emissiveIntensity: 0.5 });
  const goldMat = new THREE.MeshLambertMaterial({ color: 0xffc21c, emissive: 0xff9a3c, emissiveIntensity: 0.6 });
  for (let i = 0; i < HEALTH_PACK_COUNT; i++) {
    const mesh = new THREE.Mesh(boxGeo, whiteMat);
    const x = rangeRandom(rng, -260, 260);
    const z = rangeRandom(rng, -260, 220);
    mesh.position.set(x, 0.8, z);
    scene.add(mesh);
    items.push({ kind: 'health', x, z, mesh, taken: false });
  }
  for (let i = 0; i < HIDDEN_CASH_COUNT; i++) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), goldMat);
    const x = rangeRandom(rng, -260, 260);
    const z = rangeRandom(rng, -260, 220);
    mesh.position.set(x, 0.6, z);
    scene.add(mesh);
    items.push({ kind: 'cash', x, z, mesh, taken: false });
  }
  return { items };
}

export function updatePickups(ctx, dt, time) {
  for (const item of ctx.pickups.items) {
    if (item.taken) continue;
    item.mesh.rotation.y = time * 1.5;
    item.mesh.position.y = 0.7 + Math.sin(time * 2 + item.x) * 0.12;
    const px = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.x : ctx.player.x;
    const pz = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.z : ctx.player.z;
    if (distance2D(item.x, item.z, px, pz) < 2.2) {
      item.taken = true;
      item.mesh.visible = false;
      if (item.kind === 'health') {
        ctx.health.heal(HEALTH_PACK_VALUE);
        ctx.hud.pushMessage('Health pack +40.');
      } else {
        ctx.state.cash += HIDDEN_CASH_VALUE;
        ctx.hud.pushMessage('Hidden cash +$100.');
      }
      ctx.audio.pickup();
    }
  }
}
