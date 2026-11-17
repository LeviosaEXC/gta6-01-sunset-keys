// Mission data: 6 chained missions with Mara Voss and Dante Reyes —
// titles, givers, briefings, targets, rewards and the story beats.
import { MISSION_COUNT, PIER_POS, FERRIS_POS, LIGHTHOUSE_POS, SAFEHOUSE_POS, TOWER_POS } from './config.js';

export const MISSIONS = [
  {
    id: 0, title: 'MISSION 1 — FIRST DELIVERY', giver: 'Mara Voss',
    briefing: 'Mara needs a package at the pier. Drive there — no cops, no questions.',
    stages: [
      { text: 'Drive to the pier beacon.', target: { x: PIER_POS.x, z: PIER_POS.z - 30 }, radius: 10, inCar: true },
      { text: 'Deliver the package to the pier contact.', target: { x: PIER_POS.x, z: PIER_POS.z - 6 }, radius: 6, inCar: false },
    ],
    cash: 250, rep: 15,
  },
  {
    id: 1, title: 'MISSION 2 — TAXI DEBT', giver: 'Dante Reyes',
    briefing: 'Dante owes the harbor crew. Pick him up downtown and get him to the tower — fast.',
    stages: [
      { text: 'Pick up Dante downtown.', target: { x: 60, z: 30 }, radius: 8, inCar: false },
      { text: 'Drive Dante to Sunset Tower.', target: { x: TOWER_POS.x + 40, z: TOWER_POS.z }, radius: 10, inCar: true },
    ],
    cash: 300, rep: 15,
  },
  {
    id: 2, title: 'MISSION 3 — HARBOR RUN', giver: 'Mara Voss',
    briefing: 'The run went loud. Lose the heat, then reach the safehouse in Old Town.',
    stages: [
      { text: 'Escape the police — lose wanted level 2.', target: null, radius: 0, inCar: true, wanted: 2 },
      { text: 'Reach the safehouse.', target: { x: SAFEHOUSE_POS.x, z: SAFEHOUSE_POS.z }, radius: 10, inCar: false },
    ],
    cash: 350, rep: 20,
  },
  {
    id: 3, title: 'MISSION 4 — GANG TURF', giver: 'Dante Reyes',
    briefing: 'The East Keys gang jumped Dante\'s cousin. On foot. Settle it.',
    stages: [
      { text: 'Defeat the gang members in East Keys (0/3).', target: { x: 210, z: 60 }, radius: 30, inCar: false, kills: 3 },
      { text: 'Meet Dante at the corner.', target: { x: 180, z: 90 }, radius: 8, inCar: false },
    ],
    cash: 400, rep: 20,
  },
  {
    id: 4, title: 'MISSION 5 — FERRIS PICKUP', giver: 'Mara Voss',
    briefing: 'Night pickup at the ferris wheel. The bird is up — stay moving.',
    stages: [
      { text: 'Reach the ferris wheel.', target: { x: FERRIS_POS.x - 20, z: FERRIS_POS.z - 10 }, radius: 10, inCar: true },
      { text: 'Grab the drop and return to the pier road.', target: { x: 120, z: 240 }, radius: 10, inCar: true },
    ],
    cash: 450, rep: 25,
  },
  {
    id: 5, title: 'MISSION 6 — SUNSET GETAWAY', giver: 'Mara Voss',
    briefing: 'Last run. Four stars on your tail — get to the lighthouse and disappear.',
    stages: [
      { text: 'Outrun the chase to the lighthouse.', target: { x: LIGHTHOUSE_POS.x + 30, z: LIGHTHOUSE_POS.z - 20 }, radius: 12, inCar: true, wanted: 4 },
      { text: 'On foot to the lighthouse door.', target: { x: LIGHTHOUSE_POS.x + 6, z: LIGHTHOUSE_POS.z }, radius: 6, inCar: false },
    ],
    cash: 500, rep: 30,
  },
];
export function missionCount() { return MISSION_COUNT; }
export function missionById(id) { return MISSIONS[id]; }
