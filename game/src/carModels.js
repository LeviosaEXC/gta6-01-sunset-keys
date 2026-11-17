// Four procedural car models — sedan, taxi, pickup, sport — built from
// boxes with distinct paint, plates and glass so each reads at a glance.
import { CAR_MODEL_COUNT } from './config.js';

export const CAR_MODELS = [
  { key: 'sedan', name: 'SEDAN', color: 0x3a6fd8, length: 4.4, width: 1.9, topSpeed: 120 },
  { key: 'taxi', name: 'TAXI', color: 0xffc21c, length: 4.4, width: 1.9, topSpeed: 118 },
  { key: 'pickup', name: 'PICKUP', color: 0x4a7a3a, length: 5.0, width: 2.0, topSpeed: 112 },
  { key: 'sport', name: 'SPORT', color: 0xd81f2a, length: 4.2, width: 1.95, topSpeed: 148 },
];
const THREE = window.THREE;

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
let glowTexture = null;
export function getGlowTexture() { if (!glowTexture) glowTexture = makeGlowTexture(); return glowTexture; }

export function buildCarMesh(model, opts = {}) {
  const group = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color: model.color });
  const glass = new THREE.MeshLambertMaterial({ color: 0x1a2436 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x14141a });
  const body = new THREE.Mesh(new THREE.BoxGeometry(model.width, 0.75, model.length), paint);
  body.position.y = 0.62;
  body.castShadow = true;
  group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(model.width * 0.82, 0.62, model.length * 0.5), glass);
  cabin.position.set(0, 1.28, model.key === 'pickup' ? -0.7 : -0.2);
  cabin.castShadow = true;
  group.add(cabin);
  if (model.key === 'pickup') {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(model.width * 0.86, 0.5, model.length * 0.42), dark);
    bed.position.set(0, 1.1, 1.1);
    group.add(bed);
  }
  if (model.key === 'taxi') {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.4), new THREE.MeshBasicMaterial({ color: 0xffe9a8 }));
    sign.position.set(0, 1.72, -0.2);
    group.add(sign);
  }
  for (const [wx, wz] of [[-0.85, 1.45], [0.85, 1.45], [-0.85, -1.45], [0.85, -1.45]]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 10), dark);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx * (model.width / 1.9), 0.36, wz * (model.length / 4.4));
    group.add(wheel);
  }
  const head = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });
  for (const s of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.1), head);
    lamp.position.set(s * 0.65, 0.62, -model.length / 2 - 0.02);
    group.add(lamp);
  }
  if (opts.police) {
    const barBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 0.62), dark);
    barBase.position.set(0, 1.74, -0.2);
    group.add(barBase);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.34, 0.58), new THREE.MeshBasicMaterial({ color: 0xff2a1e }));
    red.position.set(-0.36, 1.86, -0.2);
    group.add(red);
    const blue = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.34, 0.58), new THREE.MeshBasicMaterial({ color: 0x1e6bff }));
    blue.position.set(0.36, 1.86, -0.2);
    group.add(blue);
    group.userData.lightRed = red;
    group.userData.lightBlue = blue;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: getGlowTexture(), color: 0xff5566, transparent: true, opacity: 0.4, depthWrite: false }));
    glow.scale.set(3.6, 2.0, 1);
    glow.position.set(0, 2.1, -0.2);
    group.add(glow);
    group.userData.glow = glow;
  }
  group.userData.model = model;
  return group;
}
export function modelCount() { return CAR_MODEL_COUNT; }
