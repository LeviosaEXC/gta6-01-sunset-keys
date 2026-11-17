// Minimap: a round 2D canvas — roads, beach, player arrow, police dots,
// traffic specks and the pulsing mission beacon.
import { CITY_HALF_M, MINIMAP_SIZE_PX, ROAD_SPACING_M, GRID_COUNT } from './config.js';
import { distance2D } from './utils.js';

export const MINIMAP_ZOOM = 1;

export function createMinimap() {
  const canvas = document.getElementById('minimap');
  const g = canvas.getContext('2d');
  return { canvas, g };
}

export function drawMinimap(ctx) {
  const { g } = ctx.minimap;
  const S = MINIMAP_SIZE_PX;
  const scale = (S / (CITY_HALF_M * 2)) * MINIMAP_ZOOM;
  const toMap = (x, z) => [(x + CITY_HALF_M) * scale, (z + CITY_HALF_M) * scale];
  g.clearRect(0, 0, S, S);
  g.fillStyle = '#20242e';
  g.fillRect(0, 0, S, S);
  g.fillStyle = '#c9a86a';
  g.fillRect(0, S * 0.92, S, S * 0.08);
  g.strokeStyle = '#5a5f6e';
  g.lineWidth = 4;
  for (let i = 0; i <= GRID_COUNT; i++) {
    const p = i * ROAD_SPACING_M * scale;
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, S); g.stroke();
    g.beginPath(); g.moveTo(0, p); g.lineTo(S, p); g.stroke();
  }
  const stage = ctx.missions ? currentStageTarget(ctx) : null;
  if (stage) {
    const [bx, by] = toMap(stage.x, stage.z);
    const pulse = 5 + Math.sin(ctx.time * 4) * 2;
    g.fillStyle = '#ffc21c';
    g.beginPath(); g.arc(bx, by, pulse, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 1.5;
    g.beginPath(); g.arc(bx, by, pulse + 3, 0, Math.PI * 2); g.stroke();
  }
  for (const car of ctx.traffic.list) {
    if (car.taken) continue;
    const [cx, cy] = toMap(car.x, car.z);
    g.fillStyle = '#9aa0ae';
    g.fillRect(cx - 1.5, cy - 1.5, 3, 3);
  }
  for (const c of ctx.police.cruisers) {
    if (!c.active) continue;
    const [cx, cy] = toMap(c.x, c.z);
    g.fillStyle = '#ff3b30';
    g.beginPath(); g.arc(cx, cy, 3.5, 0, Math.PI * 2); g.fill();
  }
  const px = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.x : ctx.player.x;
  const pz = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.z : ctx.player.z;
  const heading = ctx.state.inCar && ctx.playerCar ? ctx.playerCar.heading : ctx.player.heading;
  const [mx, my] = toMap(px, pz);
  g.save();
  g.translate(mx, my);
  g.rotate(Math.atan2(Math.sin(heading), -Math.cos(heading)) + Math.PI);
  g.fillStyle = '#ffffff';
  g.strokeStyle = '#14101f';
  g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 6); g.lineTo(-5, 6); g.closePath(); g.fill(); g.stroke();
  g.restore();
  g.strokeStyle = 'rgba(255,196,107,0.9)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(S / 2, S / 2, S / 2 - 1, 0, Math.PI * 2); g.stroke();
}

function currentStageTarget(ctx) {
  const s = ctx.state;
  if (!ctx.missionData) return null;
  const mission = ctx.missionData[s.missionIndex];
  if (!mission) return null;
  const stage = mission.stages[s.missionStage];
  return stage ? stage.target : null;
}
