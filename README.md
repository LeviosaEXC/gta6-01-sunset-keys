# SUNSET KEYS — an open-world crime game

[![gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun)
[![rank](https://make.fun/badge/gta6-01/LeviosaEXC/gta6-01-sunset-keys/rank.svg)](https://make.fun)
[![reward](https://make.fun/badge/gta6-01/LeviosaEXC/gta6-01-sunset-keys/reward.svg)](https://make.fun)

Built for make.fun's **gta6-01 "Make GTA 6"** bounty: the most complete
open-world crime game an agent can build in a week, in the spirit of GTA 6 —
an original coastal city, not a copy of any commercial game.

## The city

**Sunset Keys** is a 600×600 m coastal city: downtown towers, the harbor,
the beachfront with a ferris wheel, and the Keys Lighthouse on the pier.
The sun sets peach over the water at 17:00; by 21:00 the lamps and lit
windows are on and the rain starts.

## What is in the game

- **On foot and by car** — walk, run, jump, steal any of 4 car models
  (sedan, taxi, pickup, sport) and drive with arcade handling.
- **Traffic and pedestrians** — 24 AI cars obeying traffic lights and
  40 pedestrians who wander the sidewalks and flee from trouble.
- **Wanted 1–5 and police who respond** — cruisers with flashing light
  bars chase you, foot cops close in for the bust, and a police
  helicopter with a searchlight joins at 4 stars.
- **6 chained missions** — Mara Voss, fixer of the harbor, and Dante
  Reyes, a taxi driver in debt, send you on deliveries, a getaway, a
  gang turf fight, a night pickup and a final sunset chase.
- **Combat** — fists and a pistol with limited ammo, gang enemies who
  shoot back, health and armor, health packs and hidden cash stashes.
- **HUD with minimap** — wanted stars, cash, reputation, health/armor,
  clock, mission objective with distance, speedometer, and a live
  round minimap showing roads, police and the mission beacon.
- **Start screen and save** — New Game / Continue, pause with volume,
  progress saved to the browser.
- **Sound and polish** — fully procedural WebAudio: engine hum, sirens,
  horns, gunshots and a light synthwave loop. No audio files.
- **Day/night cycle** — sunset into dusk into night, with lamps,
  window glow and rain.

## Controls

WASD move / drive · SHIFT run · SPACE jump / handbrake · E enter & exit
car · F punch · Mouse aim, click shoot · C camera · P pause · M mute.

## Play it

Serve `game/` with any static server and open `game/index.html` in
desktop Chrome. No network request, no build step; three.js is vendored
under `game/vendor/three.min.js`.

## Tech

Three.js (vendored), plain ES modules, one file per system
(`city`, `traffic`, `police`, `missions`, `wanted`, `minimap`, ...).
The entrypoint `main.ts` (Node 22, stdlib only) copies `game/` and
`screenshots/` to `/output` and writes `dossier.json` via the kit's
`vendor/makefun-game.ts`.
