// Preload with `node --import ./test/mock-fetch.js bin/owl.js ...` to run the CLI against
// recorded (anonymized) responses instead of Duolingo. Used for tests and screenshots.
import { readFileSync } from 'node:fs';

const routes = [
  [/leaderboards\/.+\/users\/\d+/, 'league.json'],
  [/\/users\/\d+\/xp_summaries/, 'xp_summaries.json'],
  [/\/users\/\d+\/subscriptions/, 'subscriptions.json'],
  [/\/users\/\d+\?fields=/, 'me.json'],
];

globalThis.fetch = async (url, init = {}) => {
  const auth = init.headers?.Authorization;
  if (!auth?.startsWith('Bearer ')) return new Response('{}', { status: 401 });
  const hit = routes.find(([re]) => re.test(String(url)));
  if (!hit) return new Response('not mocked', { status: 404 });
  return new Response(readFileSync(new URL(`./fixtures/${hit[1]}`, import.meta.url)), { status: 200 });
};
