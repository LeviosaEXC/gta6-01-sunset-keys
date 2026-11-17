// Landmarks: Sunset Tower downtown, the Keys Lighthouse on the pier, and
// the ferris wheel on the beach — the three silhouettes every shot leans on.
import { LANDMARK_COUNT, TOWER_POS, LIGHTHOUSE_POS, FERRIS_POS } from './config.js';

export const FERRIS_WHEEL_RADIUS_M = 22;
const THREE = window.THREE;

export function createLandmarks(scene) {
  const group = new THREE.Group();
  const towerMat = new THREE.MeshLambertMaterial({ color: 0x6b4a7a, emissive: 0x2a1a3a, emissiveIntensity: 0.4 });
  const tower = new THREE.Mesh(new THREE.BoxGeometry(26, 96, 26), towerMat);
  tower.position.set(TOWER_POS.x, 48, TOWER_POS.z);
  tower.castShadow = true;
  group.add(tower);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(30, 4, 30), new THREE.MeshLambertMaterial({ color: 0xffc46b, emissive: 0xff9a3c, emissiveIntensity: 0.9 }));
  crown.position.set(TOWER_POS.x, 98, TOWER_POS.z);
  group.add(crown);
  const lightMat = new THREE.MeshLambertMaterial({ color: 0xf5ead0, emissive: 0xfff2c0, emissiveIntensity: 0.5 });
  const lightBase = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 26, 10), lightMat);
  lightBase.position.set(LIGHTHOUSE_POS.x, 13, LIGHTHOUSE_POS.z);
  group.add(lightBase);
  const lightTop = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 5, 10), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
  lightTop.position.set(LIGHTHOUSE_POS.x, 28, LIGHTHOUSE_POS.z);
  group.add(lightTop);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 7, 60, 10, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false }),
  );
  beam.rotation.z = Math.PI / 2;
  beam.position.set(LIGHTHOUSE_POS.x + 30, 28, LIGHTHOUSE_POS.z);
  group.add(beam);
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(FERRIS_POS.x, FERRIS_WHEEL_RADIUS_M + 4, FERRIS_POS.z);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(FERRIS_WHEEL_RADIUS_M, 0.9, 8, 40), new THREE.MeshLambertMaterial({ color: 0xff5a8a, emissive: 0x881133, emissiveIntensity: 0.5 }));
  wheelGroup.add(rim);
  for (let i = 0; i < 8; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.7, FERRIS_WHEEL_RADIUS_M * 2, 0.7), new THREE.MeshLambertMaterial({ color: 0xd8d2e8 }));
    spoke.rotation.z = (i * Math.PI) / 8;
    wheelGroup.add(spoke);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3, 16), new THREE.MeshLambertMaterial({ color: 0x9a9aa2, metalness: 0.6, roughness: 0.4 }));
  hub.rotation.x = Math.PI / 2;
  wheelGroup.add(hub);
  const gondolaMat = new THREE.MeshLambertMaterial({ color: 0xffc46b, emissive: 0xff9a3c, emissiveIntensity: 0.7 });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const g = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 2.4), gondolaMat);
    g.position.set(Math.cos(a) * FERRIS_WHEEL_RADIUS_M, Math.sin(a) * FERRIS_WHEEL_RADIUS_M, 0);
    wheelGroup.add(g);
  }
  const legMat = new THREE.MeshLambertMaterial({ color: 0x5a5468 });
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(1.4, FERRIS_WHEEL_RADIUS_M + 4, 1.4), legMat);
    leg.position.set(s * 9, -(FERRIS_WHEEL_RADIUS_M + 4) / 2, 0);
    leg.rotation.z = -s * 0.35;
    wheelGroup.add(leg);
  }
  group.add(wheelGroup);
  scene.add(group);
  return { group, tower, wheel: wheelGroup, beam, count: LANDMARK_COUNT };
}

export function updateLandmarks(landmarks, dt, time) {
  landmarks.wheel.rotation.z += dt * 0.05;
  landmarks.beam.rotation.y = time * 0.4;
}
