// Palm trees lining the beach road and the avenues: 63 trunks with
// crossed frond planes, swaying gently in the sea breeze.
import { PALM_COUNT, CITY_HALF_M, BEACH_Z_M } from './config.js';
import { mulberry32, rangeRandom } from './rng.js';

export const PALM_TRUNK_HEIGHT_M = 7;
const THREE = window.THREE;

export function createPalms(scene) {
  const rng = mulberry32(777);
  const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, PALM_TRUNK_HEIGHT_M, 6);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8a6a4a });
  const frondGeo = new THREE.PlaneGeometry(5.5, 2.2);
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x3f8f4f, side: THREE.DoubleSide });
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, PALM_COUNT);
  const fronds = new THREE.InstancedMesh(frondGeo, frondMat, PALM_COUNT * 4);
  const dummy = new THREE.Object3D();
  const spots = [];
  for (let i = 0; i < PALM_COUNT; i++) {
    let x, z;
    if (i < 30) { x = -CITY_HALF_M + 20 + i * 20 + rangeRandom(rng, -4, 4); z = BEACH_Z_M - 12 + rangeRandom(rng, -3, 3); }
    else { x = -CITY_HALF_M + rangeRandom(rng, 0, CITY_HALF_M * 2); z = -CITY_HALF_M + Math.floor(rng() * 10) * 60 + 8; }
    const lean = rangeRandom(rng, -0.08, 0.08);
    dummy.position.set(x, PALM_TRUNK_HEIGHT_M / 2, z);
    dummy.rotation.set(0, 0, lean);
    dummy.updateMatrix();
    trunks.setMatrixAt(i, dummy.matrix);
    for (let f = 0; f < 4; f++) {
      dummy.position.set(x, PALM_TRUNK_HEIGHT_M + 0.4, z);
      dummy.rotation.set(0.5, (f * Math.PI) / 2 + rangeRandom(rng, -0.2, 0.2), 0);
      dummy.updateMatrix();
      fronds.setMatrixAt(i * 4 + f, dummy.matrix);
    }
    spots.push({ x, z });
  }
  trunks.instanceMatrix.needsUpdate = true;
  fronds.instanceMatrix.needsUpdate = true;
  scene.add(trunks);
  scene.add(fronds);
  return { trunks, fronds, spots };
}
