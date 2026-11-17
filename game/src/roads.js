// Road grid: asphalt strips on a 60 m grid, sidewalks, crosswalks, lane
// dashes and the sand beach at the south edge with a water plane beyond.
import { CITY_SIZE_M, CITY_HALF_M, ROAD_WIDTH_M, ROAD_SPACING_M, GRID_COUNT, BEACH_Z_M } from './config.js';

export const ROAD_SEGMENT_COUNT = 22;
const THREE = window.THREE;

function roadMaterial() { return new THREE.MeshLambertMaterial({ color: 0x4a4a56 }); }
function sidewalkMaterial() { return new THREE.MeshLambertMaterial({ color: 0x8d8578 }); }
function sandMaterial() { return new THREE.MeshLambertMaterial({ color: 0xe8c98f }); }
function waterMaterial() { return new THREE.MeshLambertMaterial({ color: 0x2a6f8f, transparent: true, opacity: 0.9 }); }
function dashMaterial() { return new THREE.MeshBasicMaterial({ color: 0xf5d76e }); }

export function createGround(scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(CITY_SIZE_M, CITY_SIZE_M),
    new THREE.MeshLambertMaterial({ color: 0x5d6b52 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const beach = new THREE.Mesh(new THREE.PlaneGeometry(CITY_SIZE_M, CITY_SIZE_M - BEACH_Z_M + 48), sandMaterial());
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, 0.05, BEACH_Z_M + (CITY_SIZE_M - BEACH_Z_M) / 2 - 24);
  beach.receiveShadow = true;
  scene.add(beach);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(CITY_SIZE_M + 400, 260), waterMaterial());
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.02, CITY_HALF_M + 130);
  scene.add(water);
  return { ground, beach, water };
}

export function createRoads(scene) {
  const roads = new THREE.Group();
  const mat = roadMaterial();
  const walk = sidewalkMaterial();
  const dash = dashMaterial();
  for (let i = 0; i <= GRID_COUNT; i++) {
    const p = -CITY_HALF_M + i * ROAD_SPACING_M;
    const v = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH_M, CITY_SIZE_M), mat);
    v.rotation.x = -Math.PI / 2; v.position.set(p, 0.1, 0); v.receiveShadow = true;
    roads.add(v);
    const h = new THREE.Mesh(new THREE.PlaneGeometry(CITY_SIZE_M, ROAD_WIDTH_M), mat);
    h.rotation.x = -Math.PI / 2; h.position.set(0, 0.1, p); h.receiveShadow = true;
    roads.add(h);
    const vw = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH_M + 8, CITY_SIZE_M), walk);
    vw.rotation.x = -Math.PI / 2; vw.position.set(p, 0.06, 0);
    roads.add(vw);
    const hw = new THREE.Mesh(new THREE.PlaneGeometry(CITY_SIZE_M, ROAD_WIDTH_M + 8), walk);
    hw.rotation.x = -Math.PI / 2; hw.position.set(0, 0.06, p);
    roads.add(hw);
  }
  for (let i = 0; i <= GRID_COUNT; i++) {
    const p = -CITY_HALF_M + i * ROAD_SPACING_M;
    for (let k = -4; k <= 4; k++) {
      const z = k * ROAD_SPACING_M;
      const d1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 5), dash);
      d1.rotation.x = -Math.PI / 2; d1.position.set(p, 0.15, z + 15);
      roads.add(d1);
      const d2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.2), dash);
      d2.rotation.x = -Math.PI / 2; d2.position.set(z + 15, 0.15, p);
      roads.add(d2);
    }
  }
  scene.add(roads);
  return roads;
}

export function nearestRoadCoord(v) {
  return Math.round((v + CITY_HALF_M) / ROAD_SPACING_M) * ROAD_SPACING_M - CITY_HALF_M;
}
export function isOnRoad(x, z) {
  const rx = Math.abs(((x + CITY_HALF_M) % ROAD_SPACING_M + ROAD_SPACING_M) % ROAD_SPACING_M);
  const rz = Math.abs(((z + CITY_HALF_M) % ROAD_SPACING_M + ROAD_SPACING_M) % ROAD_SPACING_M);
  const d = (a) => Math.min(a, ROAD_SPACING_M - a);
  return d(rx) <= ROAD_WIDTH_M / 2 + 1 || d(rz) <= ROAD_WIDTH_M / 2 + 1;
}
