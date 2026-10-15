import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLeague, renderXp } from '../src/commands/stats.js';
import { leagueZones, userIdFromJwt, practicedToday } from '../src/api.js';
import { visibleLength } from '../src/ui.js';

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

test('league zones match what the Duolingo web app shows for Obsidian', () => {
  const lb = fixture('league.json');
  // The web UI says "Top 8 advance" and draws the demotion line above rank 9.
  assert.deepEqual(leagueZones(lb.active, 8), { promoted: 8, demoteFrom: 9 });
});

test('bronze never demotes and diamond never promotes', () => {
  const active = { contest: { ruleset: { cohort_size: 30, num_promoted: [10], num_demoted: [5] } } };
  assert.equal(leagueZones(active, 0).demoteFrom, Infinity);
  assert.equal(leagueZones(active, 9).promoted, 0);
});

test('league render marks you and tells you how far from safety you are', () => {
  const out = strip(renderLeague(fixture('league.json'), 1).text);
  assert.match(out, /Obsidian League/);
  assert.match(out, /promotion zone/);
  assert.match(out, /demotion zone/);
  assert.match(out, /Me Myself.*◀ you/);
  // Rank 11 with 87 XP, the last safe spot (rank 8) has 89, so 3 XP gets you out.
  assert.match(out, /Rank 11\. DEMOTION ZONE\. You need 3 XP/);
});

test('xp render sorts nothing away and flags freezes', () => {
  const { summaries } = fixture('xp_summaries.json');
  const out = strip(renderXp(summaries.sort((a, b) => a.date - b.date), 10));
  assert.match(out, /XP, last 14 days/);
  assert.match(out, /🧊 freeze/);
  assert.match(out, /421 XP total/);
  assert.match(out, /active 12\/14 days/);
});

test('reads the user id out of a JWT', () => {
  const payload = Buffer.from(JSON.stringify({ sub: 42, iat: 0 })).toString('base64url');
  assert.equal(userIdFromJwt(`x.${payload}.y`), 42);
  assert.throws(() => userIdFromJwt('nope'), /JWT/);
});

test('practicedToday prefers lastExtendedDate, falls back to the goal flag', () => {
  const user = (d) => ({ streakData: { currentStreak: { endDate: '2026-10-15', lastExtendedDate: d } } });
  assert.equal(practicedToday(user('2026-10-15'), '2026-10-15'), true);
  assert.equal(practicedToday(user('2026-10-14'), '2026-10-15'), false);
  assert.equal(practicedToday({ xpGoalMetToday: true }, '2026-10-15'), true);
});

test('emoji count as two columns', () => {
  assert.equal(visibleLength('🔥'), 2);
  assert.equal(visibleLength('\x1b[31mhi\x1b[0m'), 2);
});
