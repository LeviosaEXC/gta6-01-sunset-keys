// Street lamps: 120 instanced poles with warm bulbs that switch on at
// dusk and pool light on the avenues.
import { STREET_LAMP_COUNT, CITY_HALF_M, ROAD_SPACING_M, GRID_COUNT } from './config.js';

export const LAMP_POLE_HEIGHT_M = 6;
const THREE = window.THREE;

export function createLamps(scene) {
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, LAMP_POLE_HEIGHT_M, 6);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x2e2a33 });
  const bulbGeo = new THREE.SphereGeometry(0.45, 8, 6);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffc46b });
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, STREET_LAMP_COUNT);
  const bulbs = new THREE.InstancedMesh(bulbGeo, bulbMat, STREET_LAMP_COUNT);
  const dummy = new THREE.Object3D();
  const spots = [];
  let i = 0;
  for (let gx = 0; gx <= GRID_COUNT && i < STREET_LAMP_COUNT; gx++) {
    for (let gz = 0; gz <= GRID_COUNT && i < STREET_LAMP_COUNT; gz++) {
      if ((gx + gz) % 2 === 1) continue;
      const x = -CITY_HALF_M + gx * ROAD_SPACING_M + 7;
      const z = -CITY_HALF_M + gz * ROAD_SPACING_M + 7;
      if (z > 250) continue;
      dummy.position.set(x, LAMP_POLE_HEIGHT_M / 2, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      poles.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, LAMP_POLE_HEIGHT_M + 0.2, z);
      dummy.updateMatrix();
      bulbs.setMatrixAt(i, dummy.matrix);
      spots.push({ x, z });
      i++;
    }
  }
  while (i < STREET_LAMP_COUNT) {
    const x = -CITY_HALF_M + (i % 20) * 30;
    const z = 240;
    dummy.position.set(x, LAMP_POLE_HEIGHT_M / 2, z); dummy.updateMatrix();
    poles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, LAMP_POLE_HEIGHT_M + 0.2, z); dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
    spots.push({ x, z });
    i++;
  }
  poles.instanceMatrix.needsUpdate = true;
  bulbs.instanceMatrix.needsUpdate = true;
  scene.add(poles);
  scene.add(bulbs);
  return { poles, bulbs, spots, bulbMat };
}

export function updateLamps(lamps, nightness) {
  lamps.bulbMat.color.setHex(nightness > 0.4 ? 0xffc46b : 0x8a7a5a);
  lamps.bulbs.material.transparent = true;
  lamps.bulbs.material.opacity = 0.35 + nightness * 0.65;
}
