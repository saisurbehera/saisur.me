import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error('Usage: node scripts/export-oriole.mjs /path/to/oriole');
const report = JSON.parse(await readFile(path.join(sourceRoot, 'data/trials/comparison-2026-10-10.json'), 'utf8'));
const destination = path.join(websiteRoot, 'public/static/oriole');
await mkdir(destination, { recursive: true });
const labels = { 'gpt-6-luna': 'GPT-6 Luna', 'gpt-6-sol': 'GPT-6 Sol', 'gpt-6.1-sol': 'GPT-6.1 Sol', 'gpt-6-astra': 'GPT-6 Astra' };
const colors = { 'gpt-6-luna': '#8be9fd', 'gpt-6-sol': '#ffb86c', 'gpt-6.1-sol': '#f1fa8c', 'gpt-6-astra': '#50fa7b' };
const models = [];
for (const result of report.results) {
  const id = result.model_requested;
  if (!labels[id]) throw new Error(`Unexpected model: ${id}`);
  const rows = (await readFile(path.join(sourceRoot, result.run_directory, 'episode.jsonl'), 'utf8'))
    .trim().split('\n').map(line => JSON.parse(line));
  const seconds = row => Math.max(0, Math.round((Date.parse(row.recorded_at) - Date.parse(result.started_at)) / 100) / 10);
  const frames = rows.map(row => ({
    key: row.steps, seconds: seconds(row), screen: row.screen,
    action: row.event === 'reset' ? 'start' : row.key,
    depth: row.stats.depth, turn: row.stats.turn, hp: row.stats.hp,
    maxHp: row.stats.max_hp, score: row.stats.score, characterLevel: row.stats.level,
    stage: row.stage, cursor: row.cursor,
  }));
  if (frames.length !== result.actions + 1) throw new Error(`Incomplete trace: ${id}`);
  let deepest = 0;
  const progress = [];
  for (const frame of frames) {
    if (frame.depth > deepest) {
      deepest = frame.depth;
      progress.push({ seconds: frame.seconds, depth: deepest });
    }
  }
  const last = frames.at(-1);
  progress.push({ seconds: last.seconds, depth: deepest });
  const milestones = result.milestones.map(event => ({
    name: event.milestone, key: event.keys, turn: event.turn,
    depth: event.depth, seconds: seconds(event),
  }));
  const model = {
    id, label: labels[id], color: colors[id], deepestDepth: result.deepest_depth,
    score: result.highest_score, turn: result.final_stats.turn, keys: result.actions,
    hp: result.final_stats.hp, maxHp: result.final_stats.max_hp,
    characterLevel: result.final_stats.level, uniquePositions: result.unique_positions,
    searchKeys: result.search_keys, elapsedSeconds: result.elapsed_seconds,
    stopReason: result.stop_reason, alive: !result.done, progress, milestones,
    firstFrame: frames[0], finalFrame: last,
  };
  models.push(model);
  await writeFile(path.join(destination, `${id}.json`), JSON.stringify({ model: id, frames }));
}
const published = {
  date: '2026-10-10', seed: report.seed, timeBudgetSeconds: report.time_budget_seconds,
  keyBudget: report.max_keys, effort: report.reasoning_effort, character: report.character,
  concurrentGames: report.concurrent_jobs, identicalInitialScreens: report.identical_initial_screens,
  initialScreenSha256: report.results[0].initial_screen_sha256,
  harnessVersion: report.harness_version, models,
};
await mkdir(path.join(websiteRoot, 'src/data'), { recursive: true });
await writeFile(path.join(websiteRoot, 'src/data/oriole-results.json'), JSON.stringify(published, null, 2) + '\n');
await writeFile(path.join(destination, 'results.json'), JSON.stringify(published, null, 2) + '\n');
console.log(`Exported ${models.length} models and ${models.reduce((sum, model) => sum + model.keys + 1, 0)} recorded frames.`);
