// Combat: fists up close, a pistol with limited ammo, and hostile gang
// members who aim, shoot back and drop when their health runs out.
import { distance2D } from './utils.js';

export const PISTOL_AMMO_START = 24;
export const PISTOL_DAMAGE = 34;
export const PUNCH_DAMAGE = 20;
export const ENEMY_HEALTH = 100;
const THREE = window.THREE;

export function createCombat(scene) {
  return { scene, enemies: [], shots: [], punchCooldown: 0, shootCooldown: 0 };
}

export function spawnEnemy(ctx, x, z) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.85, 0.34), new THREE.MeshLambertMaterial({ color: 0x8a1a1a }));
  body.position.y = 1.05;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshLambertMaterial({ color: 0xc98a5a }));
  head.position.y = 1.62;
  g.add(head);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.7, 0.3), new THREE.MeshLambertMaterial({ color: 0x1a1a22 }));
  legs.position.y = 0.35;
  g.add(legs);
  g.position.set(x, 0, z);
  ctx.scene.add(g);
  const enemy = { x, z, heading: 0, health: ENEMY_HEALTH, mesh: g, dead: false, shootTimer: 2 + Math.random() * 2 };
  ctx.combat.enemies.push(enemy);
  return enemy;
}

export function punch(ctx) {
  const c = ctx.combat;
  if (c.punchCooldown > 0 || ctx.state.inCar) return;
  c.punchCooldown = 0.45;
  ctx.audio.punch();
  for (const e of c.enemies) {
    if (e.dead) continue;
    if (distance2D(e.x, e.z, ctx.player.x, ctx.player.z) < 2.4) damageEnemy(ctx, e, PUNCH_DAMAGE);
  }
}

export function shoot(ctx) {
  const c = ctx.combat;
  const s = ctx.state;
  if (c.shootCooldown > 0 || s.ammo <= 0 || s.inCar) return;
  c.shootCooldown = 0.28;
  s.ammo -= 1;
  ctx.audio.gunshot();
  ctx.particles.muzzle(ctx.player.x, ctx.player.z, ctx.player.heading);
  const dirX = Math.sin(ctx.player.heading);
  const dirZ = Math.cos(ctx.player.heading);
  let best = null;
  let bestD = 60;
  for (const e of c.enemies) {
    if (e.dead) continue;
    const dx = e.x - ctx.player.x;
    const dz = e.z - ctx.player.z;
    const along = dx * dirX + dz * dirZ;
    const side = Math.abs(dx * dirZ - dz * dirX);
    if (along > 0 && along < bestD && side < 1.6) { best = e; bestD = along; }
  }
  if (best) {
    damageEnemy(ctx, best, PISTOL_DAMAGE);
    ctx.particles.blood(best.x, best.z);
  }
  ctx.wanted.raise(1, 'Shots fired in public');
}

export function damageEnemy(ctx, enemy, dmg) {
  enemy.health -= dmg;
  if (enemy.health <= 0 && !enemy.dead) {
    enemy.dead = true;
    enemy.mesh.visible = false;
    ctx.state.kills += 1;
    ctx.state.cash += 25;
    ctx.hud.pushMessage('Gang member down. +$25.');
    ctx.audio.enemyDown();
  }
}

export function updateCombat(ctx, dt) {
  const c = ctx.combat;
  c.punchCooldown = Math.max(0, c.punchCooldown - dt);
  c.shootCooldown = Math.max(0, c.shootCooldown - dt);
  for (const e of c.enemies) {
    if (e.dead) continue;
    const d = distance2D(e.x, e.z, ctx.player.x, ctx.player.z);
    if (d < 40) {
      e.heading = Math.atan2(ctx.player.x - e.x, ctx.player.z - e.z);
      if (d > 6) {
        e.x += Math.sin(e.heading) * 3.4 * dt;
        e.z += Math.cos(e.heading) * 3.4 * dt;
      }
      e.shootTimer -= dt;
      if (e.shootTimer <= 0 && d < 26) {
        e.shootTimer = 2.2;
        ctx.health.damagePlayer(9);
        ctx.audio.enemyShot();
      }
      e.mesh.position.set(e.x, 0, e.z);
      e.mesh.rotation.y = e.heading;
    }
  }
}
