// Player on foot: walk, run, jump, a red-shirted character with a cap
// who reads at a glance — scaled up for the cover shot.
import { PLAYER_WALK_SPEED_MPS, PLAYER_RUN_SPEED_MPS } from './config.js';
import { clamp, angleLerp } from './utils.js';
import { collidesWithBuildings } from './buildings.js';

export const PLAYER_JUMP_SPEED_MPS = 7;
export const PLAYER_SCALE_COVER = 1.35;
const THREE = window.THREE;

export function createPlayer(scene) {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.36), new THREE.MeshLambertMaterial({ color: 0xd81f2a }));
  torso.position.y = 1.08;
  torso.castShadow = true;
  g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), new THREE.MeshLambertMaterial({ color: 0xe8b98a }));
  head.position.y = 1.68;
  g.add(head);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12), new THREE.MeshLambertMaterial({ color: 0xffc21c }));
  cap.position.y = 1.88;
  g.add(cap);
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.3), new THREE.MeshLambertMaterial({ color: 0xffc21c }));
  brim.position.set(0, 1.84, -0.28);
  g.add(brim);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.32), new THREE.MeshLambertMaterial({ color: 0x2a3a5a }));
  legs.position.y = 0.38;
  g.add(legs);
  const armMat = new THREE.MeshLambertMaterial({ color: 0xd81f2a });
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat);
    arm.position.set(s * 0.42, 1.05, 0);
    g.add(arm);
  }
  scene.add(g);
  return { x: 0, z: 200, heading: 0, vy: 0, grounded: true, mesh: g, visible: true, walkPhase: 0, scale: 1 };
}

export function updatePlayer(ctx, dt) {
  const p = ctx.player;
  const input = ctx.input;
  if (ctx.state.inCar) {
    p.mesh.visible = false;
    return;
  }
  p.mesh.visible = p.visible !== false;
  const move = input.moveVector();
  const running = input.down('ShiftLeft') || input.down('ShiftRight');
  const speed = running ? PLAYER_RUN_SPEED_MPS : PLAYER_WALK_SPEED_MPS;
  const camYaw = ctx.cameraRig.yaw;
  if (move.active) {
    const worldX = move.x * Math.cos(camYaw) - move.z * Math.sin(camYaw);
    const worldZ = move.x * Math.sin(camYaw) + move.z * Math.cos(camYaw);
    const nx = p.x + worldX * speed * dt;
    const nz = p.z + worldZ * speed * dt;
    if (!collidesWithBuildings(ctx.city.buildings, nx, nz, 0.7)) { p.x = nx; p.z = nz; }
    p.heading = angleLerp(p.heading, Math.atan2(worldX, worldZ), dt * 10);
    p.walkPhase += dt * speed * 1.6;
  }
  if (input.wasPressed('Space') && p.grounded) { p.vy = PLAYER_JUMP_SPEED_MPS; p.grounded = false; }
  if (!p.grounded) {
    p.vy -= 22 * dt;
    const y = p.mesh.position.y + p.vy * dt;
    if (y <= 0) { p.mesh.position.y = 0; p.vy = 0; p.grounded = true; }
    else p.mesh.position.y = y;
  }
  p.x = clamp(p.x, -295, 295);
  p.z = clamp(p.z, -295, 295);
  p.mesh.position.x = p.x;
  p.mesh.position.z = p.z;
  p.mesh.rotation.y = p.heading;
  p.mesh.scale.setScalar(p.scale || 1);
  p.mesh.rotation.z = move.active ? Math.sin(p.walkPhase) * 0.05 : 0;
}
