# Codex in the dungeon

Route: `/musings/codex-in-the-dungeon`, linked from `/musings`.

This article explains Oriole's local Codex/NetHack experiment and publishes the
four paired-seed trials recorded on 2026-10-10. It includes a step chart, measured
results, and action-by-action dungeon replays. The earlier ten-minute Luna run
is described separately because it used different instructions and its reasoning
effort was not recorded. This is a fixed experiment, not a model leaderboard.

## Recorded data

`src/data/oriole-results.json` contains the comparison, milestones, chart points,
and initial/final snapshots. Full traces are lazy-loaded per model from
`public/static/oriole/gpt-*.json`: 1,423 frames from actual episode logs, one initial
frame plus one per key. `results.json` is the downloadable summary.

The browser does not invoke Codex, run NetHack, call inference APIs, or access
subscription credentials. Playback starts paused and advances one key per 150 ms
only after pressing Play. Labels retain the recorded wall-clock timing. Stats
use structured game observations; original terminal text is preserved unchanged.

The export whitelists game observations and results. It omits machine paths,
account information, prompts, and Codex session events. Source measurements come
from Oriole's `data/trials/comparison-2026-10-10.json`; replay frames come from its
matching `.local/trials/*/episode.jsonl` files. Regenerate with:

```sh
node scripts/export-oriole.mjs /path/to/oriole
```

Update dates, article claims, snapshots, and regression fixtures together when
changing the experiment. Do not combine the initial Luna run with the paired
comparison. This export does not publish the Oriole source repository.

## Design and verification

The page follows the existing Musings format: blue background, monospace text,
a left-aligned 672px column, compact uppercase headings, and matching 24px/48px
page padding. CSS is scoped to `oriole-*`
in `public/static/oriole/page.css`. Existing homepage, Cities, and Kestrel work
was preserved; no dependencies were added. `social.svg` and `social.png` provide
a 1200×630 share image with a genuine final screen. The canonical URL follows
the site's existing www.saisur.me convention.

```sh
node --test tests/oriole.test.mjs
npm run build
```

Data checks cover identical starts, recorded outcomes, complete ordered traces,
matching final stats, floor-jump indices, and absence of local paths/auth payloads.
Production builds used an isolated source copy so the site's existing server
and `.next` output were not disturbed.

Browser QA covers model selection/lazy loading, floor jumps, keyboard range
input, play/pause, Musings navigation, and the article without JavaScript.
Desktop/mobile screenshots were inspected; page overflow was checked at 320,
390, 768, and 1440 pixels. Replay and table have their own horizontal scroll
areas. Final snapshots are visible before the complete replay loads.

Publish the article by pushing the scoped website commit to `origin/main`; the
site deployment serves `/musings/codex-in-the-dungeon`.
