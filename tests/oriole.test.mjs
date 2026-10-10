import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const load = async name => JSON.parse(await readFile(new URL(name, root), 'utf8'));
const results = await load('src/data/oriole-results.json');

test('published trials preserve the measured outcomes and paired setup', () => {
  assert.equal(results.seed, 43);
  assert.equal(results.timeBudgetSeconds, 300);
  assert.equal(results.effort, 'medium');
  assert.equal(results.models.length, 4);
  assert.deepEqual(results.models.map(model => [model.id, model.deepestDepth, model.score]), [
    ['gpt-6-luna', 2, 67], ['gpt-6-sol', 2, 79], ['gpt-6.1-sol', 7, 607], ['gpt-6-astra', 6, 438],
  ]);
  assert.ok(results.models.every(model => model.alive && model.stopReason === 'time_limit'));
});

test('every public replay contains the complete ordered key trace and matching final stats', async () => {
  for (const model of results.models) {
    const replay = await load(`public/static/oriole/${model.id}.json`);
    assert.equal(replay.frames.length, model.keys + 1);
    const first = replay.frames[0];
    const last = replay.frames.at(-1);
    assert.equal(createHash('sha256').update(first.screen).digest('hex'), results.initialScreenSha256);
    assert.deepEqual(first, model.firstFrame);
    assert.deepEqual(last, model.finalFrame);
    assert.equal(last.score, model.score);
    assert.equal(last.hp, model.hp);
    assert.equal(last.turn, model.turn);
    replay.frames.forEach((frame, index) => {
      assert.equal(frame.key, index);
      if (index > 0) assert.ok(frame.seconds >= replay.frames[index - 1].seconds);
    });
    model.milestones.forEach(event => assert.equal(replay.frames[event.key].depth, event.depth));
  }
});

test('chart milestones are monotonic and public data has no local paths or auth payloads', async () => {
  for (const model of results.models) {
    assert.equal(model.progress.at(-1).depth, model.deepestDepth);
    model.progress.forEach((point, index) => {
      if (index > 0) assert.ok(point.depth >= model.progress[index - 1].depth);
    });
    const replay = await readFile(new URL(`public/static/oriole/${model.id}.json`, root), 'utf8');
    assert.doesNotMatch(replay, /\/home\/|\/Users\/|access_token|refresh_token|OPENAI_API_KEY|codex-events/);
  }
  assert.deepEqual(await load('public/static/oriole/results.json'), results);
});
