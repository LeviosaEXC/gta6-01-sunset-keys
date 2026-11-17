// SUNSET KEYS — boot and game loop. Wires every system, runs the frame,
// stages screenshots, and exposes the debug hook the maker playtests with.
import { createGameState, resetRunState } from './state.js';
import { createCity } from './city.js';
import { createSky } from './sky.js';
import { createPlayer, updatePlayer } from './player.js';
import { createParkedCars, spawnPoint } from './world.js';
import { createTraffic, updateTraffic } from './traffic.js';
import { createPedestrians, updatePedestrians, scarePedestrians } from './pedestrians.js';
import { createPoliceCars, updatePoliceCars } from './policeCars.js';
import { createFootCops, updateFootCops } from './policeFoot.js';
import { createHelicopter, updateHelicopter } from './helicopter.js';
import { createWanted } from './wanted.js';
import { createMissions, updateMissions, startMission, currentMission, completeMission } from './missions.js';
import { MISSIONS } from './missionData.js';
import { createCombat, updateCombat, punch, shoot, spawnEnemy } from './combat.js';
import { createHealth } from './health.js';
import { createPickups, updatePickups } from './pickups.js';
import { createParticles, updateParticles, dust, exhaust, sparks, muzzle, blood } from './particles.js';
import { createDayNight, updateDayNight } from './daynight.js';
import { createAudioEngine } from './audioEngine.js';
import { createAudioSfx } from './audioSfx.js';
import { createAudioMusic } from './audioMusic.js';
import { createInput } from './input.js';
import { createCamera, updateCamera } from './camera.js';
import { createHud, HUD_REFRESH_MS } from './hud.js';
import { createMinimap, drawMinimap } from './minimap.js';
import { createObjectives } from './objectives.js';
import { createSave } from './save.js';
import { createUi } from './ui.js';
import { createEffects } from './effects.js';
import { shotFromUrl, applyShot, updateShotScene } from './shots.js';
import { updateCarPhysics, syncCarMesh, carSpeedKmh } from './carPhysics.js';
import { nearestStealableCar, stealCar, exitCar } from './carSteal.js';
import { SAFEHOUSE_POS } from './config.js';
import { clamp } from './utils.js';

export const GAME_TITLE = 'SUNSET KEYS';
const THREE = window.THREE;

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 2000);

const state = createGameState();
const city = createCity(scene);
const sky = createSky(scene);
const player = createPlayer(scene);
const parkedCars = createParkedCars(scene);
const traffic = createTraffic(scene);
const pedestrians = createPedestrians(scene);
const police = createPoliceCars(scene);
const footCops = createFootCops(scene);
const heli = createHelicopter(scene);
const missions = createMissions(scene);
const combat = createCombat(scene);
const pickups = createPickups(scene);
const particles = createParticles(scene);
const daynight = createDayNight();
const audioEngine = createAudioEngine();
const audio = createAudioSfx(audioEngine);
const music = createAudioMusic(audioEngine);
const input = createInput();
input.attach();
const cameraRig = createCamera();
const hud = createHud();
const minimap = createMinimap();
const objectives = createObjectives();
const effects = createEffects();

const ctx = {
  scene, camera, cameraRig, renderer, state, city, sky, player,
  cars: parkedCars, traffic, pedestrians, police, footCops, heli,
  missions, missionData: MISSIONS, combat, pickups, particles, daynight,
  audioEngine, audio, music, input, hud, minimap, objectives, effects,
  time: 0, playerCar: null, shotMode: null, shotCamera: null, shotFollowCar: false,
  freezeObjective: false, save: null, ui: null, wanted: null, health: null,
};
ctx.save = createSave(ctx);
ctx.ui = createUi(ctx);
ctx.wanted = createWanted(ctx);
ctx.health = createHealth(ctx);
ctx.combat.spawnEnemy = (x, z) => spawnEnemy(ctx, x, z);
particles.muzzle = (x, z, h) => muzzle(particles, x, z, h);
particles.blood = (x, z) => blood(particles, x, z);
particles.dust = (x, z) => dust(particles, x, z);
particles.exhaust = (x, z, h) => exhaust(particles, x, z, h);
particles.sparks = (x, z) => sparks(particles, x, z);
const origSetObjective = hud.setObjective.bind(hud);
hud.setObjective = (t, x, d) => { objectives.set(t, x, d); origSetObjective(t, x, d); };

ctx.startNewGame = () => {
  resetRunState(state);
  for (const car of parkedCars) {
    car.taken = false; car.driver = null;
    car.x = car.initX !== undefined ? car.initX : car.x;
    car.z = car.initZ !== undefined ? car.initZ : car.z;
    car.heading = car.initHeading !== undefined ? car.initHeading : car.heading;
    car.speed = 0;
    syncCarMesh(car);
  }
  for (const car of traffic.list) { car.taken = false; }
  const sp = spawnPoint();
  player.x = sp.x; player.z = sp.z; player.heading = 0; player.scale = 1;
  player.mesh.position.set(sp.x, 0, sp.z);
  state.phase = 'playing';
  ctx.ui.hideAll();
  hud.show();
  hud.setObjective('MISSION 1 — FIRST DELIVERY', 'Drive to the pier beacon.', 60);
  audioEngine.ensure();
  music.start();
  startMission(ctx, 0);
  hud.pushMessage('Welcome to Sunset Keys. Mara Voss is waiting.');
};

ctx.startContinue = () => {
  const data = ctx.save.loadGame();
  if (data) ctx.save.applySave(data);
  state.phase = 'playing';
  ctx.ui.hideAll();
  hud.show();
  audioEngine.ensure();
  music.start();
  const m = currentMission(state);
  if (m) hud.setObjective(m.title, m.stages[state.missionStage].text, 0);
  hud.pushMessage('Welcome back to Sunset Keys.');
};

ctx.respawnAtSafehouse = () => {
  state.health = 100;
  state.armor = 0;
  state.wanted = 0;
  state.inCar = false;
  state.carId = null;
  ctx.playerCar = null;
  player.x = SAFEHOUSE_POS.x;
  player.z = SAFEHOUSE_POS.z;
  player.heading = 0;
  player.mesh.position.set(player.x, 0, player.z);
  state.phase = 'playing';
  ctx.ui.hideAll();
  hud.show();
  hud.pushMessage('You wake up at the safehouse. The city is still yours to take.');
};

ctx.ui.wire();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('keydown', () => { audioEngine.ensure(); }, { once: true });
window.addEventListener('mousedown', () => { audioEngine.ensure(); music.start(); }, { once: true });

const shotName = shotFromUrl();
let shotTimer = 0;
if (shotName) {
  applyShot(ctx, shotName);
  hud.pushMessage('Staged screenshot: ' + shotName + '.');
}

let last = performance.now();
let lastHudUpdate = 0;
let menuOrbit = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = clamp((now - last) / 1000, 0.001, 0.05);
  last = now;
  ctx.time += dt;
  const phase = state.phase;

  if (phase === 'menu') {
    menuOrbit += dt * 0.05;
    camera.position.set(Math.sin(menuOrbit) * 220, 90, Math.cos(menuOrbit) * 220);
    camera.lookAt(0, 10, 0);
    updateDayNight(ctx, dt);
    updateTraffic(traffic, dt, ctx.time, ctx);
    updatePedestrians(pedestrians, dt, ctx);
  } else if (phase === 'playing') {
    state.playSeconds += dt;
    ctx.playerCar = state.inCar ? (ctx.cars.concat(traffic.list).find((c) => c.id === state.carId) || null) : null;
    if (!ctx.shotMode) {
      if (input.wasPressed('KeyE')) {
        if (state.inCar) exitCar(ctx);
        else {
          const car = nearestStealableCar(ctx.cars.concat(traffic.list), player.x, player.z);
          if (car) stealCar(ctx, car);
          else hud.pushMessage('No car close enough. Walk to a parked car and press E.');
        }
      }
      if (input.wasPressed('KeyF')) punch(ctx);
      if (input.mouseClicked) shoot(ctx);
      if (input.wasPressed('KeyC')) cameraRig.hood = !cameraRig.hood;
      if (input.wasPressed('KeyM')) {
        state.muted = !state.muted;
        audioEngine.setMuted(state.muted);
        hud.pushMessage(state.muted ? 'Sound muted.' : 'Sound on.');
      }
      if (input.wasPressed('KeyP')) {
        state.phase = 'paused';
        ctx.ui.showPause();
        ctx.save.saveGame();
      }
    }
    if (state.inCar && ctx.playerCar) {
      if (ctx.shotMode !== 'mission' && ctx.shotMode !== 'night') {
        updateCarPhysics(ctx.playerCar, input.driveInput(), dt, city.buildings);
        syncCarMesh(ctx.playerCar);
      }
      state.speedKmh = carSpeedKmh(ctx.playerCar);
      if (Math.abs(ctx.playerCar.speed) > 4 && !ctx.shotMode) {
        particles.dust(ctx.playerCar.x, ctx.playerCar.z);
        if (Math.random() < dt * 6) particles.exhaust(ctx.playerCar.x, ctx.playerCar.z, ctx.playerCar.heading);
      }
    } else {
      updatePlayer(ctx, dt);
    }
    if (ctx.shotMode) updateShotScene(ctx, dt, ctx.time);
    else {
      updateTraffic(traffic, dt, ctx.time, ctx);
      updatePedestrians(pedestrians, dt, ctx);
      updatePoliceCars(police, dt, ctx.time, ctx);
      updateFootCops(footCops, dt, ctx);
      updateHelicopter(heli, dt, ctx.time, ctx);
      updateMissions(ctx, dt);
      ctx.wanted.update(dt);
    }
    updateCombat(ctx, dt);
    updatePickups(ctx, dt, ctx.time);
    if (!ctx.shotMode) ctx.health.update(dt);
    updateDayNight(ctx, dt);
    updateParticles(particles, dt);
    effects.update(dt, cameraRig);
    updateCamera(ctx, dt);
    if (ctx.time - lastHudUpdate >= HUD_REFRESH_MS / 1000) {
      lastHudUpdate = ctx.time;
      hud.update(state, ctx);
      drawMinimap(ctx);
    }
    audioEngine.engine(state.inCar ? state.speedKmh : 0, state.inCar);
    if (ctx.shotMode) {
      shotTimer += dt;
      if (shotTimer > 2.2 && !window.__shotReady) window.__shotReady = true;
    }
  } else if (phase === 'paused') {
    if (input.wasPressed('KeyP')) ctx.ui.resume();
  }
  renderer.render(scene, camera);
  input.endFrame();
}

window.__game = {
  state, ctx, player,
  test: {
    teleport(x, z) { player.x = x; player.z = z; player.mesh.position.set(x, 0, z); return { x: player.x, z: player.z }; },
    setWanted(n) { state.wanted = n; return state.wanted; },
    startMission(i) { startMission(ctx, i); return state.missionIndex; },
    completeMission() { completeMission(ctx); return state.cash; },
    getState() {
      const px = state.inCar && ctx.playerCar ? ctx.playerCar.x : player.x;
      const pz = state.inCar && ctx.playerCar ? ctx.playerCar.z : player.z;
      return {
        phase: state.phase, cash: state.cash, rep: state.rep, health: state.health,
        wanted: state.wanted, mission: state.missionIndex, stage: state.missionStage,
        inCar: state.inCar, speedKmh: Math.round(state.speedKmh || 0),
        x: Math.round(px), z: Math.round(pz),
        hour: Number(state.hour.toFixed(2)),
        traffic: traffic.list.filter((c) => !c.taken).length,
        peds: pedestrians.list.length,
        police: police.cruisers.filter((c) => c.active).length,
      };
    },
  },
};
window.__shotReady = false;

if (!shotName) ctx.ui.showStart(ctx.save.hasSave());
requestAnimationFrame(frame);
