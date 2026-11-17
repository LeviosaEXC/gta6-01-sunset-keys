// Mission engine: waypoint beacons, stage progression, rewards, and the
// light pillar that marks the target from anywhere in the city.
import { MISSIONS } from './missionData.js';
import { distance2D } from './utils.js';

export const MISSION_BEACON_HEIGHT_M = 12;
const THREE = window.THREE;

export function createMissions(scene) {
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffc21c, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 60, 12, 1, true), beaconMat);
  beacon.position.y = 30;
  beacon.visible = false;
  scene.add(beacon);
  const marker = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffc21c }));
  marker.rotation.x = Math.PI;
  marker.position.y = 10;
  marker.visible = false;
  scene.add(marker);
  const ring = new THREE.Mesh(new THREE.RingGeometry(6, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffc21c, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.3;
  ring.visible = false;
  scene.add(ring);
  return { beacon, marker, ring, gangSpawned: false, gang: [] };
}

export function currentMission(state) { return MISSIONS[state.missionIndex]; }
export function currentStage(state) {
  const m = currentMission(state);
  return m ? m.stages[state.missionStage] : null;
}

export function startMission(ctx, index) {
  const s = ctx.state;
  s.missionIndex = index;
  s.missionStage = 0;
  const m = MISSIONS[index];
  ctx.hud.pushMessage(m.giver + ': ' + m.briefing);
  ctx.hud.setObjective(m.title, m.stages[0].text, stageDistance(ctx));
  ctx.audio.missionStart();
  if (m.stages[0].wanted) ctx.wanted.raise(m.stages[0].wanted, 'The heat is on');
  if (index === 3) spawnGang(ctx);
}

export function stageDistance(ctx) {
  const stage = currentStage(ctx.state);
  if (!stage || !stage.target) return 0;
  const p = ctx.state.inCar && ctx.playerCar ? ctx.playerCar : ctx.player;
  return Math.round(distance2D(p.x, p.z, stage.target.x, stage.target.z));
}

export function spawnGang(ctx) {
  const m = ctx.missions;
  if (m.gangSpawned) return;
  m.gangSpawned = true;
  for (let i = 0; i < 3; i++) {
    const g = ctx.combat.spawnEnemy(210 + i * 8, 60 + (i % 2) * 10);
    m.gang.push(g);
  }
  ctx.hud.pushMessage('Three gang members block the street.');
}

export function updateMissions(ctx, dt) {
  const s = ctx.state;
  if (s.phase !== 'playing') return;
  const m = currentMission(s);
  if (!m) return;
  const stage = currentStage(s);
  const px = s.inCar && ctx.playerCar ? ctx.playerCar.x : ctx.player.x;
  const pz = s.inCar && ctx.playerCar ? ctx.playerCar.z : ctx.player.z;
  if (stage && stage.target) {
    ctx.missions.beacon.visible = true;
    ctx.missions.marker.visible = true;
    ctx.missions.ring.visible = true;
    ctx.missions.beacon.position.set(stage.target.x, 30, stage.target.z);
    ctx.missions.marker.position.set(stage.target.x, MISSION_BEACON_HEIGHT_M + Math.sin(ctx.time * 3) * 0.8, stage.target.z);
    ctx.missions.ring.position.set(stage.target.x, 0.3, stage.target.z);
  } else {
    ctx.missions.beacon.visible = false;
    ctx.missions.marker.visible = false;
    ctx.missions.ring.visible = false;
  }
  if (!stage) return;
  let done = false;
  if (stage.kills) {
    const dead = ctx.missions.gang.filter((g) => g.dead).length;
    ctx.hud.setObjective(m.title, 'Defeat the gang members in East Keys (' + dead + '/3).', stageDistance(ctx));
    done = dead >= stage.kills;
  } else if (stage.wanted && stage.target === null) {
    done = s.wanted === 0;
    ctx.hud.setObjective(m.title, stage.text + ' Wanted: ' + s.wanted + ' stars.', 0);
  } else if (stage.target) {
    const d = distance2D(px, pz, stage.target.x, stage.target.z);
    ctx.hud.setObjective(m.title, stage.text, Math.round(d));
    done = d < stage.radius;
  }
  if (done) advanceStage(ctx);
}

export function advanceStage(ctx) {
  const s = ctx.state;
  const m = currentMission(s);
  s.missionStage += 1;
  ctx.audio.stageClear();
  if (s.missionStage >= m.stages.length) {
    completeMission(ctx);
  } else {
    const stage = m.stages[s.missionStage];
    ctx.hud.pushMessage('Stage clear — ' + stage.text);
    if (stage.wanted) ctx.wanted.raise(stage.wanted, 'The heat is on');
    if (s.missionIndex === 3 && s.missionStage === 1) ctx.missions.gang = [];
  }
}

export function completeMission(ctx) {
  const s = ctx.state;
  const m = currentMission(s);
  s.cash += m.cash;
  s.rep += m.rep;
  s.missionDone[m.id] = true;
  ctx.hud.showBanner(m.title + ' COMPLETE — +$' + m.cash + ' · +' + m.rep + ' REP');
  ctx.hud.pushMessage('Mission complete! +$' + m.cash + ' from ' + m.giver + '.');
  ctx.audio.missionComplete();
  ctx.save.saveGame();
  if (s.missionIndex + 1 < MISSIONS.length) {
    startMission(ctx, s.missionIndex + 1);
  } else {
    ctx.hud.pushMessage('All 6 missions complete. Sunset Keys is yours, boss.');
    ctx.hud.setObjective('SUNSET KEYS — FREE ROAM', 'All missions done. Explore, steal, survive.', 0);
  }
}
