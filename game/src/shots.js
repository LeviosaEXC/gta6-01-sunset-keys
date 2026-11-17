// Shot staging: deterministic scene presets for the four screenshots.
// Characters stand on sidewalks and open ground — never on or behind a
// staged car. The helicopter stays clear of the ferris wheel.
import { FERRIS_POS, LIGHTHOUSE_POS, PIER_POS, TOWER_POS } from './config.js';
import { MISSION_BEACON_HEIGHT_M } from './missions.js';
import { PLAYER_SCALE_COVER } from './player.js';
import { placeCruiserForShot } from './policeCars.js';
import { distance2D } from './utils.js';

export const SHOT_COVER_CAMERA_DISTANCE_M = 34;
export const SHOT_NAMES = ['cover', 'onfoot', 'mission', 'night'];

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}

export function applyShot(ctx, name) {
  const s = ctx.state;
  ctx.shotMode = name;
  s.phase = 'playing';
  ctx.ui.hideAll();
  ctx.hud.show();
  ctx.audioEngine.ensure();
  for (const c of ctx.police.cruisers) c.mesh.visible = false;
  for (const cop of ctx.footCops.list) cop.mesh.visible = false;
  ctx.heli.mesh.visible = false;
  if (name === 'cover') return applyCover(ctx);
  if (name === 'onfoot') return applyOnfoot(ctx);
  if (name === 'mission') return applyMission(ctx);
  if (name === 'night') return applyNight(ctx);
  return null;
}

function stagePlayerCar(ctx, modelKey, x, z, heading) {
  const car = ctx.cars.find((c) => c.model.key === modelKey && !c.taken);
  if (!car) return null;
  car.x = x; car.z = z; car.heading = heading; car.speed = 0;
  car.mesh.position.set(x, 0, z);
  car.mesh.rotation.y = heading;
  return car;
}

function applyCover(ctx) {
  const s = ctx.state;
  s.cash = 400; s.rep = 15; s.wanted = 2; s.health = 100; s.ammo = 24;
  s.missionIndex = 0; s.missionStage = 0;
  ctx.daynight.hour = 17.7;
  const car = stagePlayerCar(ctx, 'sport', 1.5, 55, Math.PI);
  ctx.player.x = -1.4; ctx.player.z = 55; ctx.player.heading = Math.PI * 0.5; ctx.player.scale = PLAYER_SCALE_COVER;
  ctx.player.mesh.position.set(ctx.player.x, 0, ctx.player.z);
  const camPos = { x: 2.5, y: 2.6, z: 44 };
  const look = { x: 0, y: 1.6, z: 55 };
  const len = Math.hypot(look.x - camPos.x, look.z - camPos.z);
  const dx = (look.x - camPos.x) / len;
  const dz = (look.z - camPos.z) / len;
  const px = dz * 3;
  const pz = -dx * 3;
  const ax = camPos.x + dx * SHOT_COVER_CAMERA_DISTANCE_M + px;
  const az = camPos.z + dz * SHOT_COVER_CAMERA_DISTANCE_M + pz;
  placeCruiserForShot(ctx.police, 0, ax, az, Math.PI);
  placeCruiserForShot(ctx.police, 1, ax + dx * 10, az + dz * 10, Math.PI);
  ctx.shotCamera = { pos: camPos, look, fov: 60 };
  ctx.freezeObjective = true;
  ctx.hud.setObjective('MISSION 1 — FIRST DELIVERY', 'Drive to the pier beacon.', 60);
  ctx.missions.beacon.visible = true;
  ctx.missions.beacon.position.set(0, 30, 115);
  ctx.missions.marker.visible = true;
  ctx.missions.marker.position.set(0, MISSION_BEACON_HEIGHT_M, 115);
  ctx.missions.ring.visible = true;
  ctx.missions.ring.position.set(0, 0.3, 115);
  placeTrafficAhead(ctx, 30, 60, 2, Math.PI / 2);
  return ctx.shotCamera;
}

function applyOnfoot(ctx) {
  const s = ctx.state;
  s.cash = 650; s.rep = 35; s.wanted = 3; s.health = 82; s.ammo = 18;
  s.missionIndex = 3; s.missionStage = 0;
  ctx.daynight.hour = 18.2;
  ctx.player.x = 52; ctx.player.z = 52; ctx.player.heading = -0.6; ctx.player.scale = 1;
  ctx.player.mesh.position.set(52, 0, 52);
  placeCruiserForShot(ctx.police, 0, 60, 78, 0);
  placeCruiserForShot(ctx.police, 1, 78, 60, -Math.PI / 2);
  for (let i = 0; i < 3; i++) {
    const g = ctx.combat.spawnEnemy(40 + i * 4, 60 + (i % 2) * 6);
    g.mesh.position.set(40 + i * 4, 0, 60 + (i % 2) * 6);
  }
  ctx.missions.gangSpawned = true;
  ctx.shotCamera = { pos: { x: 38, y: 4.2, z: 38 }, look: { x: 52, y: 1.5, z: 54 }, fov: 60 };
  ctx.freezeObjective = true;
  ctx.hud.setObjective('MISSION 4 — GANG TURF', 'Defeat the gang members in East Keys (0/3).', 24);
  ctx.missions.beacon.visible = true;
  ctx.missions.beacon.position.set(44, 30, 62);
  ctx.missions.marker.visible = true;
  ctx.missions.marker.position.set(44, MISSION_BEACON_HEIGHT_M, 62);
  ctx.missions.ring.visible = true;
  ctx.missions.ring.position.set(44, 0.3, 62);
  return ctx.shotCamera;
}

function applyMission(ctx) {
  const s = ctx.state;
  s.cash = 900; s.rep = 50; s.wanted = 1; s.health = 100; s.ammo = 24;
  s.missionIndex = 2; s.missionStage = 0;
  ctx.daynight.hour = 18.9;
  const car = stagePlayerCar(ctx, 'sport', 0, -60, 0);
  if (car) {
    car.taken = true; car.driver = 'player';
    s.inCar = true; s.carId = car.id;
    car.speed = 13;
    ctx.playerCar = car;
  }
  ctx.shotCamera = null;
  ctx.shotFollowCar = true;
  ctx.freezeObjective = true;
  ctx.hud.setObjective('MISSION 3 — HARBOR RUN', 'Escape the police — lose wanted level 2.', 45);
  ctx.missions.beacon.visible = true;
  ctx.missions.beacon.position.set(0, 30, 40);
  ctx.missions.marker.visible = true;
  ctx.missions.marker.position.set(0, MISSION_BEACON_HEIGHT_M, 40);
  ctx.missions.ring.visible = true;
  ctx.missions.ring.position.set(0, 0.3, 40);
  placeTrafficAhead(ctx, 0, -30, 3);
  return { pos: { x: 0, y: 5, z: -72 }, look: { x: 0, y: 1.5, z: -40 }, fov: 62 };
}

function applyNight(ctx) {
  const s = ctx.state;
  s.cash = 1250; s.rep = 75; s.wanted = 4; s.health = 100; s.ammo = 24;
  s.missionIndex = 4; s.missionStage = 0;
  ctx.daynight.hour = 21.5;
  const car = stagePlayerCar(ctx, 'sport', 235, 235, -Math.PI / 2);
  if (car) { car.taken = true; car.driver = 'player'; s.inCar = true; s.carId = car.id; car.speed = 9; ctx.playerCar = car; }
  ctx.shotCamera = { pos: { x: 190, y: 7, z: 170 }, look: { x: 228, y: 16, z: 262 }, fov: 58 };
  ctx.shotFollowCar = false;
  placeCruiserForShot(ctx.police, 0, 200, 240, Math.PI / 2);
  placeCruiserForShot(ctx.police, 1, 240, 225, Math.PI);
  ctx.heli.x = 190; ctx.heli.z = 240;
  ctx.heli.mesh.visible = true;
  ctx.heli.mesh.position.set(190, 38, 240);
  ctx.freezeObjective = true;
  ctx.hud.setObjective('MISSION 5 — FERRIS PICKUP', 'Reach the ferris wheel.', 32);
  ctx.missions.beacon.visible = true;
  ctx.missions.beacon.position.set(FERRIS_POS.x - 20, 30, FERRIS_POS.z - 10);
  ctx.missions.marker.visible = true;
  ctx.missions.marker.position.set(FERRIS_POS.x - 20, MISSION_BEACON_HEIGHT_M, FERRIS_POS.z - 10);
  ctx.missions.ring.visible = true;
  ctx.missions.ring.position.set(FERRIS_POS.x - 20, 0.3, FERRIS_POS.z - 10);
  return ctx.shotCamera;
}

function placeTrafficAhead(ctx, roadX, zStart, count, heading) {
  let placed = 0;
  for (const car of ctx.traffic.list) {
    if (placed >= count) break;
    if (car.taken) continue;
    car.x = roadX + (placed % 2 === 0 ? 2.6 : -2.6);
    car.z = zStart + placed * 22;
    car.heading = heading === undefined ? 0 : heading;
    car.vertical = Math.abs(Math.sin(car.heading)) < 0.5;
    car.speed = 8;
    car.mesh.position.set(car.x, 0, car.z);
    car.mesh.rotation.y = car.heading;
    placed++;
  }
}

export function updateShotScene(ctx, dt, time) {
  if (!ctx.shotMode) return;
  if (ctx.shotMode === 'mission' && ctx.playerCar) {
    const car = ctx.playerCar;
    car.speed = 13;
    car.x += Math.sin(car.heading) * car.speed * dt;
    car.z += Math.cos(car.heading) * car.speed * dt;
    car.mesh.position.set(car.x, 0, car.z);
    ctx.shotCamera = {
      pos: { x: car.x - Math.sin(car.heading) * 11, y: 4.6, z: car.z - Math.cos(car.heading) * 11 },
      look: { x: car.x + Math.sin(car.heading) * 22, y: 1.6, z: car.z + Math.cos(car.heading) * 22 },
      fov: 62,
    };
    if (car.z > 120) { car.z = -140; car.x = 0; }
  }
  if (ctx.shotMode === 'night' && ctx.playerCar) {
    const car = ctx.playerCar;
    car.speed = 9;
    car.x += Math.sin(car.heading) * car.speed * dt;
    car.z += Math.cos(car.heading) * car.speed * dt;
    if (car.x < 120) { car.x = 240; car.z = 230; }
    car.mesh.position.set(car.x, 0, car.z);
  }
  for (const c of ctx.police.cruisers) {
    if (!c.active) continue;
    if (c.mesh.userData.lightRed) c.mesh.userData.lightRed.material.color.setHex(0xff2a1e);
    if (c.mesh.userData.lightBlue) c.mesh.userData.lightBlue.material.color.setHex(0x1e6bff);
    if (c.glow) {
      const blink = Math.sin(time * 9 + c.sirenPhase) > 0;
      c.glow.material.color.setHex(blink ? 0xff3344 : 0x3355ff);
      c.glow.material.opacity = 0.42;
      c.glow.scale.set(3.4, 1.9, 1);
    }
  }
  if (ctx.shotMode === 'night' && ctx.heli.mesh.visible) {
    ctx.heli.rotor.rotation.y = time * 22;
    ctx.heli.mesh.position.y = 38 + Math.sin(time * 0.8) * 2;
  }
}
