// Buildings: 86 low-poly towers with procedural facades — canvas textures
// with warm lit windows that glow at dusk. Heights vary by district.
import { BUILDING_COUNT, CITY_HALF_M, BLOCK_SIZE_M, GRID_COUNT, BEACH_Z_M } from './config.js';
import { mulberry32, rangeRandom, intRandom } from './rng.js';
import { clamp } from './utils.js';

export const BUILDING_FACADE_VARIANTS = 4;
const THREE = window.THREE;

function facadeTexture(base, lit, rng) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 256);
  g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = 0; y < 256; y += 16) g.fillRect(0, y, 128, 2);
  for (let y = 12; y < 248; y += 24) {
    for (let x = 10; x < 118; x += 22) {
      const on = rng() < 0.62;
      g.fillStyle = on ? lit : 'rgba(20,24,44,0.85)';
      g.fillRect(x, y, 14, 16);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBuildings(scene) {
  const rng = mulberry32(20261117);
  const bases = ['#b98a6e', '#8a7fa8', '#7a8a9e', '#c2a06b'];
  const lit = ['#ffc46b', '#ffb35c', '#ffd98a', '#ff9a5c'];
  const materials = bases.map((b, i) => {
    const tex = facadeTexture(b, lit[i], mulberry32(1000 + i));
    return new THREE.MeshLambertMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.35 });
  });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x3a3348 });
  const group = new THREE.Group();
  const list = [];
  const special = new Set(['5,5', '2,8', '8,8', '0,0', '9,9', '4,9', '5,9', '6,9', '0,9', '9,0']);
  for (let bx = 0; bx < GRID_COUNT; bx++) {
    for (let bz = 0; bz < GRID_COUNT; bz++) {
      if (special.has(bx + ',' + bz)) continue;
      const cx = -CITY_HALF_M + bx * BLOCK_SIZE_M + BLOCK_SIZE_M / 2;
      const cz = -CITY_HALF_M + bz * BLOCK_SIZE_M + BLOCK_SIZE_M / 2;
      const downtown = Math.hypot(bx - 4.5, bz - 4.5) < 3;
      const count = downtown ? 2 : 1;
      for (let n = 0; n < count; n++) {
        const w = rangeRandom(rng, 16, 26);
        const d = rangeRandom(rng, 16, 26);
        const h = downtown ? rangeRandom(rng, 34, 68) : rangeRandom(rng, 12, 30);
        const ox = n === 0 ? -8 : 10;
        const oz = n === 0 ? -6 : 8;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials[intRandom(rng, 0, 3)]);
        mesh.position.set(cx + ox, h / 2, cz + oz);
        mesh.castShadow = true;
        group.add(mesh);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 1.5, d * 0.7), roofMat);
        roof.position.set(cx + ox, h + 0.75, cz + oz);
        group.add(roof);
        list.push({ x: cx + ox, z: cz + oz, w, d, h });
      }
    }
  }
  while (list.length > BUILDING_COUNT) { const b = list.pop(); group.remove(group.children[group.children.length - 1]); group.remove(group.children[group.children.length - 1]); }
  while (list.length < BUILDING_COUNT) {
    const b = list[list.length - 1];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 14), materials[0]);
    mesh.position.set(b.x + 22, 8, b.z - 18);
    group.add(mesh);
    list.push({ x: b.x + 22, z: b.z - 18, w: 14, d: 14, h: 16 });
  }
  scene.add(group);
  return { group, list, materials };
}

export function updateBuildingGlow(buildings, nightness) {
  for (const m of buildings.materials) m.emissiveIntensity = 0.25 + nightness * 0.75;
}

export function collidesWithBuildings(buildings, x, z, radius) {
  for (const b of buildings.list) {
    if (Math.abs(x - b.x) < b.w / 2 + radius && Math.abs(z - b.z) < b.d / 2 + radius) return true;
  }
  return false;
}
export function buildingCount(buildings) { return buildings.list.length; }
