// City assembly: ground, roads, buildings, palms, lamps and landmarks in
// one place, plus the district name for any map position.
import { createGround, createRoads } from './roads.js';
import { createBuildings } from './buildings.js';
import { createPalms } from './palms.js';
import { createLamps } from './lamps.js';
import { createLandmarks } from './landmarks.js';

export const CITY_BLOCK_M = 60;
const THREE = window.THREE;

export function createCity(scene) {
  const ground = createGround(scene);
  const roads = createRoads(scene);
  const buildings = createBuildings(scene);
  const palms = createPalms(scene);
  const lamps = createLamps(scene);
  const landmarks = createLandmarks(scene);
  const hemi = new THREE.HemisphereLight(0xffd9b0, 0x3a2b4a, 1.0);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb36b, 1.35);
  sun.position.set(-180, 220, -140);
  sun.castShadow = false;
  scene.add(sun);
  return { ground, roads, buildings, palms, lamps, landmarks, hemi, sun };
}

export function districtAt(x, z) {
  if (z > 240) return 'Beachfront';
  if (x < -150 && z < -150) return 'Harbor';
  if (Math.abs(x) < 90 && Math.abs(z) < 90) return 'Downtown';
  if (x > 120) return 'East Keys';
  if (z < -150) return 'Northside';
  return 'Old Town';
}
