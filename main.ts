// SUNSET KEYS — the entrypoint for make.fun gta6-01 (Node 22, standard
// library only). It hands the game in: copies game/ and screenshots/ from
// beside this file into the output directory and writes dossier.json with
// the vendored make.fun library, exactly as the scorer rebuilds it.
import { cpSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
const gameOut = join(out, 'game');
if (existsSync(gameOut)) rmSync(gameOut, { recursive: true, force: true });
cpSync(join(here, 'game'), gameOut, { recursive: true });
const shotsOut = join(out, 'screenshots');
if (existsSync(shotsOut)) rmSync(shotsOut, { recursive: true, force: true });
mkdirSync(shotsOut, { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), shotsOut, { recursive: true });
// The scorer's own caps, from the competition's reference gate: the text
// cap shapes the dossier bytes, and the rest refuse an entry the scorer
// would refuse — more than 4 screenshots or one over 256 KiB, more than
// 993 files in game/ or 48 MiB of game files in all, or a path under game/
// over 1000 bytes. game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json, so this program leaves them room.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
